'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDineAI } from '../contexts/DineAIContext';
import apiClient from '../lib/api';

/**
 * DineAI WebRTC Hook
 * Uses WebRTC for secure real-time voice - frontend never sees ephemeral token
 * Backend proxies SDP negotiation with OpenAI
 */
export const useDineAIWebRTC = () => {
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
  const pcRef = useRef(null); // RTCPeerConnection
  const dcRef = useRef(null); // RTCDataChannel for events
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioElementRef = useRef(null);
  const sessionIdRef = useRef(null); // Ref to avoid stale closure issues

  /**
   * Connect using WebRTC (SDP proxied through backend)
   */
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return { success: false, error: 'Already connected or connecting' };

    const { restaurantId } = getContext();
    if (!restaurantId) {
      setError('Please select a restaurant first');
      return { success: false };
    }

    // Clean up any existing connection first
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('🎙️ Starting WebRTC connection...');

      // 1. Create fresh RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // 2. Set up audio element for playback
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      // Handle incoming audio track
      pc.ontrack = (event) => {
        console.log('🔊 Received audio track');
        audioEl.srcObject = event.streams[0];
        setLocalIsSpeaking(true);
        setIsSpeaking(true);
      };

      // 3. Get microphone access and add track
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      // Check if PC is still valid (might be closed by React Strict Mode remount)
      if (pc.signalingState === 'closed') {
        console.log('⚠️ PC was closed, aborting connection');
        stream.getTracks().forEach(track => track.stop());
        setIsConnecting(false);
        return { success: false, error: 'Connection was interrupted' };
      }

      // Add audio track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set up audio level monitoring
      setupAudioLevelMonitoring(stream);

      // 4. Create data channel for events (transcripts, etc.)
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        console.log('📡 Data channel open');
      };

      dc.onmessage = (event) => {
        handleDataChannelMessage(event.data);
      };

      // 5. Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering
      await waitForIceGathering(pc);

      console.log('📤 Sending SDP offer to backend...');

      // 6. Send offer to backend, which proxies to OpenAI
      const response = await apiClient.post('/api/dineai/realtime/webrtc/offer', {
        restaurantId,
        sdpOffer: pc.localDescription.sdp,
        voice: 'alloy'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to establish WebRTC connection');
      }

      setSessionId(response.sessionId);
      sessionIdRef.current = response.sessionId; // Set ref immediately

      // 7. Set remote description from OpenAI (via backend)
      const answer = {
        type: 'answer',
        sdp: response.sdpAnswer
      };
      await pc.setRemoteDescription(answer);

      console.log('✅ WebRTC connection established');
      setIsConnected(true);
      setIsConnecting(false);

      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        console.log('🔌 Connection state:', pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          disconnect();
        }
      };

      return { success: true, sessionId: response.sessionId };
    } catch (error) {
      console.error('WebRTC connection error:', error);
      setError(error.message || 'Failed to connect');
      setIsConnecting(false);
      cleanup();
      return { success: false, error: error.message };
    }
  }, [isConnected, isConnecting, getContext, setError, setIsSpeaking]);

  /**
   * Wait for ICE gathering to complete
   */
  const waitForIceGathering = (pc) => {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      pc.addEventListener('icegatheringstatechange', checkState);

      // Timeout after 5 seconds
      setTimeout(() => {
        pc.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 5000);
    });
  };

  /**
   * Set up audio level monitoring for visualization
   */
  const setupAudioLevelMonitoring = useCallback((stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(1, average / 128));

        if (isConnected) {
          requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  }, [isConnected]);

  /**
   * Handle messages from data channel
   */
  const handleDataChannelMessage = useCallback((data) => {
    try {
      const event = JSON.parse(data);
      // console.log('📨 WebRTC event:', event.type);

      switch (event.type) {
        case 'session.created':
          console.log('✅ Session created - using server-configured instructions');
          // Trigger initial greeting using the session's configured instructions
          // Don't override instructions here - they're set on the backend with restaurant context
          if (dcRef.current?.readyState === 'open') {
            dcRef.current.send(JSON.stringify({
              type: 'response.create'
            }));
          }
          break;

        case 'input_audio_buffer.speech_started':
          console.log('🎤 Speech started');
          setLocalIsListening(true);
          setIsListening(true);
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('🎤 Speech stopped');
          setLocalIsListening(false);
          setIsListening(false);
          break;

        case 'conversation.item.input_audio_transcription.completed':
          console.log('📝 Transcription:', event.transcript);
          setTranscript(event.transcript || '');
          if (event.transcript) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              role: 'user',
              content: event.transcript,
              timestamp: new Date()
            }]);
          }
          break;

        case 'response.audio_transcript.done':
          console.log('🤖 AI said:', event.transcript);
          if (event.transcript) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              role: 'assistant',
              content: event.transcript,
              timestamp: new Date()
            }]);
          }
          break;

        case 'response.function_call_arguments.done':
          console.log('🔧 Function call:', event.name);
          executeFunctionCall(event.name, event.arguments, event.call_id);
          break;

        case 'response.done':
          console.log('✅ Response complete');
          setLocalIsSpeaking(false);
          setIsSpeaking(false);
          break;

        case 'error':
          console.error('❌ WebRTC error:', event.error);
          setError(event.error?.message || 'An error occurred');
          break;
      }
    } catch (error) {
      console.error('Error parsing data channel message:', error);
    }
  }, [setIsListening, setIsSpeaking, setTranscript, setMessages, setError]);

  // Keep sessionId ref in sync with state to avoid stale closures
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  /**
   * Execute function call and send result back
   * Uses sessionIdRef to avoid stale closure issues with data channel callbacks
   */
  const executeFunctionCall = useCallback(async (name, args, callId) => {
    try {
      const { restaurantId, userId, userRole } = getContext();
      // Use ref to get current sessionId (avoids stale closure)
      const currentSessionId = sessionIdRef.current;

      // Parse args if string
      let parsedArgs = args;
      if (typeof args === 'string') {
        try {
          parsedArgs = JSON.parse(args);
        } catch (e) {
          console.error('Failed to parse function arguments:', e);
          parsedArgs = {};
        }
      }

      console.log('🔧 ==================== Function Call ====================');
      console.log('🔧 Function:', name);
      console.log('🔧 Session ID (ref):', currentSessionId);
      console.log('🔧 Restaurant ID:', restaurantId);
      console.log('🔧 User ID:', userId);
      console.log('🔧 User Role:', userRole);
      console.log('🔧 Arguments:', JSON.stringify(parsedArgs, null, 2));
      console.log('🔧 Call ID:', callId);

      if (!restaurantId) {
        console.error('❌ No restaurant ID available for function call!');
        throw new Error('Restaurant ID not found. Please refresh the page.');
      }

      if (!currentSessionId) {
        console.error('❌ No session ID available for function call!');
        throw new Error('Session not found. Please reconnect.');
      }

      const result = await apiClient.post('/api/dineai/realtime/function', {
        sessionId: currentSessionId,
        restaurantId,
        functionName: name,
        arguments: parsedArgs
      });

      console.log('🔧 Function Result:', JSON.stringify(result, null, 2).substring(0, 500));
      console.log('🔧 ==================== End Function Call ====================');

      // Send result back via data channel
      if (dcRef.current?.readyState === 'open') {
        dcRef.current.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(result)
          }
        }));

        dcRef.current.send(JSON.stringify({
          type: 'response.create'
        }));
      }
    } catch (error) {
      console.error('❌ Function execution error:', error);
      console.error('❌ Stack:', error.stack);

      if (dcRef.current?.readyState === 'open') {
        dcRef.current.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify({ success: false, error: error.message })
          }
        }));

        dcRef.current.send(JSON.stringify({
          type: 'response.create'
        }));
      }
    }
  }, [getContext]); // Removed sessionId dependency - using ref instead

  /**
   * Cleanup resources
   */
  const cleanup = useCallback(() => {
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  /**
   * Disconnect
   */
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting WebRTC...');

    cleanup();

    // End session on backend
    const currentSessionId = sessionId;
    if (currentSessionId) {
      apiClient.post('/api/dineai/realtime/end', {
        sessionId: currentSessionId
      }).catch(err => {
        console.debug('Session end cleanup:', err.message);
      });
    }

    setIsConnected(false);
    setSessionId(null);
    sessionIdRef.current = null; // Clear ref
    setLocalIsListening(false);
    setLocalIsSpeaking(false);
    setIsListening(false);
    setIsSpeaking(false);
  }, [sessionId, cleanup, setIsListening, setIsSpeaking]);

  /**
   * Send text message (hybrid mode)
   */
  const sendTextMessage = useCallback((text) => {
    if (!dcRef.current || dcRef.current.readyState !== 'open') {
      setError('Not connected');
      return;
    }

    dcRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    dcRef.current.send(JSON.stringify({
      type: 'response.create'
    }));

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);
  }, [setError, setMessages]);

  // Cleanup on unmount only (not on every disconnect change)
  useEffect(() => {
    return () => {
      // Use refs directly to avoid stale closure
      if (dcRef.current) {
        dcRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []); // Empty deps - only run on unmount

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
    sendTextMessage
  };
};

export default useDineAIWebRTC;
