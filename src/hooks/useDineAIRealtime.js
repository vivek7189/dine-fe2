'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDineAI } from '../contexts/DineAIContext';
import apiClient from '../lib/api';

/**
 * DineAI Realtime Hook
 * Handles OpenAI Realtime API WebSocket connection for true voice-to-voice streaming
 */
export const useDineAIRealtime = () => {
  const {
    setIsListening,
    setIsSpeaking,
    setTranscript,
    setError,
    setMessages,
    getContext
  } = useDineAI();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Audio state
  const [isListening, setLocalIsListening] = useState(false);
  const [isSpeaking, setLocalIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const playbackContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const playNextChunkRef = useRef(null);
  const stopPlaybackRef = useRef(null);

  /**
   * Connect to OpenAI Realtime API
   */
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    const { restaurantId } = getContext();
    if (!restaurantId) {
      setError('Please select a restaurant first');
      return { success: false };
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 1. Get ephemeral token from backend
      console.log('🎙️ Getting realtime session token...');
      const response = await apiClient.post('/api/dineai/realtime/session', {
        restaurantId,
        voice: 'alloy'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create session');
      }

      const { clientSecret, sessionId: sid } = response;
      setSessionId(sid);

      // Debug: log the token structure
      console.log('🔑 Session response:', {
        hasClientSecret: !!clientSecret,
        clientSecretType: typeof clientSecret,
        clientSecretKeys: clientSecret ? Object.keys(clientSecret) : [],
        hasValue: clientSecret?.value ? 'yes' : 'no',
        tokenPreview: clientSecret?.value?.substring?.(0, 20) || clientSecret?.substring?.(0, 20) || 'none'
      });

      // Get the actual token value - handle both formats
      const tokenValue = clientSecret?.value || clientSecret;

      if (!tokenValue) {
        throw new Error('No client secret token received');
      }

      // 2. Connect to OpenAI Realtime API
      // Use model from backend response, fallback to preview model
      const model = response.model || 'gpt-4o-realtime-preview';
      console.log('🔌 Connecting to OpenAI Realtime API with model:', model);

      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=${model}`,
        [
          'realtime',
          `openai-insecure-api-key.${tokenValue}`
        ]
      );

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);

        // Send session update to configure
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            },
            input_audio_transcription: {
              model: 'whisper-1'
            }
          }
        }));

        // Start audio capture
        startAudioCapture(ws);
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        await handleRealtimeEvent(data, ws);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        stopAudioCapture();
      };

      wsRef.current = ws;

      return { success: true, sessionId: sid };
    } catch (error) {
      console.error('Error connecting:', error);
      setError(error.message || 'Failed to connect');
      setIsConnecting(false);
      return { success: false, error: error.message };
    }
  }, [isConnected, isConnecting, getContext, setError]);

  /**
   * Handle events from OpenAI Realtime API
   */
  const handleRealtimeEvent = useCallback(async (data, ws) => {
    // console.log('📨 Realtime event:', data.type);

    switch (data.type) {
      case 'session.created':
        console.log('✅ Session created');
        // Send initial greeting trigger
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['text', 'audio'],
            instructions: 'Greet the user briefly and ask how you can help. Keep it under 10 words.'
          }
        }));
        break;

      case 'session.updated':
        console.log('✅ Session updated');
        break;

      case 'input_audio_buffer.speech_started':
        console.log('🎤 Speech started');
        setLocalIsListening(true);
        setIsListening(true);
        // Stop any playback when user starts speaking
        if (stopPlaybackRef.current) {
          stopPlaybackRef.current();
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 Speech stopped');
        setLocalIsListening(false);
        setIsListening(false);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        console.log('📝 Transcription:', data.transcript);
        setTranscript(data.transcript || '');
        // Add user message to UI
        if (data.transcript) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'user',
            content: data.transcript,
            timestamp: new Date()
          }]);
        }
        break;

      case 'response.audio.delta':
        // Queue audio chunk for playback
        if (data.delta) {
          queueAudioChunk(data.delta);
        }
        break;

      case 'response.audio_transcript.delta':
        // Real-time transcript of AI response
        // Could show this as the AI is speaking
        break;

      case 'response.audio_transcript.done':
        console.log('🤖 AI said:', data.transcript);
        if (data.transcript) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: data.transcript,
            timestamp: new Date()
          }]);
        }
        break;

      case 'response.output_item.added':
        if (data.item?.type === 'function_call') {
          console.log('🔧 Function call:', data.item.name);
        }
        break;

      case 'response.function_call_arguments.done':
        console.log('🔧 Executing function:', data.name);
        await executeFunctionCall(data.name, data.arguments, data.call_id, ws);
        break;

      case 'response.done':
        console.log('✅ Response complete');
        setLocalIsSpeaking(false);
        setIsSpeaking(false);
        break;

      case 'error':
        console.error('❌ Realtime error:', data.error);
        setError(data.error?.message || 'An error occurred');
        break;
    }
  }, [setIsListening, setIsSpeaking, setTranscript, setMessages, setError]);

  /**
   * Execute a function call and send result back
   */
  const executeFunctionCall = useCallback(async (name, args, callId, ws) => {
    try {
      const { restaurantId } = getContext();

      // Call backend to execute the function
      const result = await apiClient.post('/api/dineai/realtime/function', {
        sessionId,
        functionName: name,
        arguments: typeof args === 'string' ? JSON.parse(args) : args
      });

      // Send result back to OpenAI
      ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify(result)
        }
      }));

      // Trigger response with function result
      ws.send(JSON.stringify({
        type: 'response.create'
      }));

    } catch (error) {
      console.error('Function execution error:', error);

      // Send error back to OpenAI
      ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ success: false, error: error.message })
        }
      }));

      ws.send(JSON.stringify({
        type: 'response.create'
      }));
    }
  }, [sessionId, getContext]);

  /**
   * Start capturing audio from microphone
   */
  const startAudioCapture = useCallback(async (ws) => {
    try {
      console.log('🎤 Starting audio capture...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      mediaStreamRef.current = stream;

      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create script processor for audio data
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate audio level for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setAudioLevel(Math.min(1, rms * 10));

        // Convert to PCM16
        const pcm16 = floatTo16BitPCM(inputData);

        // Convert to base64
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

        // Send to OpenAI
        ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64
        }));
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      console.log('✅ Audio capture started');
    } catch (error) {
      console.error('Error starting audio capture:', error);
      setError('Failed to access microphone');
    }
  }, [setError]);

  /**
   * Stop audio capture
   */
  const stopAudioCapture = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    console.log('🎤 Audio capture stopped');
  }, []);

  /**
   * Queue audio chunk for playback
   */
  const queueAudioChunk = useCallback((base64Audio) => {
    audioQueueRef.current.push(base64Audio);

    if (!isPlayingRef.current && playNextChunkRef.current) {
      playNextChunkRef.current();
    }
  }, []);

  /**
   * Play next audio chunk from queue
   */
  const playNextChunk = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setLocalIsSpeaking(false);
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setLocalIsSpeaking(true);
    setIsSpeaking(true);

    const base64Audio = audioQueueRef.current.shift();

    try {
      // Decode base64 to PCM16
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM16 to Float32
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768;
      }

      // Create audio context if needed
      if (!playbackContextRef.current) {
        playbackContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 24000
        });
      }

      const audioBuffer = playbackContextRef.current.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = playbackContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(playbackContextRef.current.destination);

      source.onended = () => {
        // Use ref to avoid stale closure
        if (playNextChunkRef.current) {
          playNextChunkRef.current();
        }
      };

      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      // Use ref to avoid stale closure
      if (playNextChunkRef.current) {
        playNextChunkRef.current();
      }
    }
  }, [setIsSpeaking]);

  // Keep ref updated
  useEffect(() => {
    playNextChunkRef.current = playNextChunk;
  }, [playNextChunk]);

  /**
   * Stop audio playback
   */
  const stopPlayback = useCallback(() => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setLocalIsSpeaking(false);
    setIsSpeaking(false);
  }, [setIsSpeaking]);

  // Keep ref updated
  useEffect(() => {
    stopPlaybackRef.current = stopPlayback;
  }, [stopPlayback]);

  /**
   * Disconnect from realtime API
   */
  const disconnect = useCallback(async () => {
    // Stop audio first
    stopAudioCapture();
    stopPlayback();

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // End session on backend (silently - don't block on errors)
    const currentSessionId = sessionId;
    if (currentSessionId) {
      // Fire and forget - don't await
      const { restaurantId } = getContext();
      if (restaurantId) {
        apiClient.post('/api/dineai/realtime/end', {
          sessionId: currentSessionId,
          restaurantId
        }).catch(err => {
          // Silently ignore - session cleanup is best effort
          console.debug('Session end cleanup:', err.message);
        });
      }
    }

    setIsConnected(false);
    setSessionId(null);
  }, [sessionId, stopAudioCapture, stopPlayback, getContext]);

  /**
   * Send a text message (for hybrid mode)
   */
  const sendTextMessage = useCallback((text) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected');
      return;
    }

    // Create conversation item with text
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    // Trigger response
    wsRef.current.send(JSON.stringify({
      type: 'response.create'
    }));

    // Add to UI
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);
  }, [setError, setMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    audioLevel,
    sessionId,

    // Actions
    connect,
    disconnect,
    sendTextMessage,
    stopPlayback
  };
};

/**
 * Convert Float32 audio to PCM16
 */
function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Int16Array(buffer);
}

export default useDineAIRealtime;
