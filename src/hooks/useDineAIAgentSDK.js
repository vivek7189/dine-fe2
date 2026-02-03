'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDineAI } from '../contexts/DineAIContext';
import apiClient from '../lib/api';

/**
 * DineAI Voice Hook using OpenAI Agents SDK
 * Official SDK handles WebRTC automatically
 *
 * Flow:
 * 1. Frontend requests ephemeral token from backend
 * 2. Backend creates session with OpenAI, returns ephemeral token
 * 3. Frontend uses SDK to connect with ephemeral token
 * 4. Token expires in 1 minute (secure)
 */
export const useDineAIAgentSDK = () => {
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
  const sessionRef = useRef(null);
  const agentRef = useRef(null);

  /**
   * Connect using OpenAI Agents SDK
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
      console.log('🎙️ Connecting via OpenAI Agents SDK...');

      // 1. Get ephemeral token from backend
      const response = await apiClient.post('/api/dineai/realtime/session', {
        restaurantId,
        voice: 'alloy'
      });

      if (!response.success) {
        const errorMsg = response.error || 'Failed to create session';

        // Check for specific OpenAI access errors
        if (errorMsg.includes('access') || errorMsg.includes('enabled') || errorMsg.includes('403')) {
          throw new Error('OpenAI Realtime API not available. Please use Push-to-Talk mode.');
        }

        throw new Error(errorMsg);
      }

      const { clientSecret, sessionId: sid } = response;
      setSessionId(sid);

      // Get the token value
      const ephemeralKey = clientSecret?.value || clientSecret;

      if (!ephemeralKey) {
        throw new Error('No ephemeral token received');
      }

      console.log('🔑 Got ephemeral token, initializing SDK...', {
        tokenLength: ephemeralKey?.length,
        tokenPreview: ephemeralKey?.substring(0, 20) + '...',
        expiresAt: response.expiresAt,
        model: response.model
      });

      // 2. Dynamically import the SDK (client-side only)
      const { RealtimeAgent, RealtimeSession } = await import('@openai/agents-realtime');

      // 3. Create agent with tools
      const agent = new RealtimeAgent({
        name: 'DineAI',
        instructions: response.instructions || 'You are DineAI, a helpful restaurant assistant.',
        // Tools are configured server-side via the session
      });
      agentRef.current = agent;

      // 4. Create session
      const session = new RealtimeSession(agent, {
        // Model is configured server-side
      });
      sessionRef.current = session;

      // 5. Set up event handlers

      // Agent audio events
      session.on('audio_start', () => {
        console.log('🔊 Agent audio started');
        setLocalIsSpeaking(true);
        setIsSpeaking(true);
      });

      session.on('audio_stopped', () => {
        console.log('🔊 Agent audio stopped');
        setLocalIsSpeaking(false);
        setIsSpeaking(false);
      });

      session.on('audio_interrupted', () => {
        console.log('🔇 Audio interrupted');
        setLocalIsSpeaking(false);
        setIsSpeaking(false);
      });

      // Agent lifecycle events
      session.on('agent_start', () => {
        console.log('🤖 Agent started processing');
      });

      session.on('agent_end', (context, agent, output) => {
        console.log('🤖 Agent finished:', output?.substring(0, 50));
      });

      // History/conversation events
      session.on('history_added', (item) => {
        console.log('💬 History item added:', item.type, item.role);

        if (item.role === 'user') {
          // User message
          const text = item.formatted?.transcript ||
                       item.content?.find(c => c.transcript)?.transcript ||
                       item.content?.find(c => c.text)?.text;
          if (text) {
            setTranscript(text);
            setMessages(prev => [...prev, {
              id: item.id || Date.now(),
              role: 'user',
              content: text,
              timestamp: new Date()
            }]);
          }
        } else if (item.role === 'assistant') {
          // Assistant message
          const text = item.formatted?.transcript ||
                       item.content?.find(c => c.transcript)?.transcript ||
                       item.content?.find(c => c.text)?.text;
          if (text) {
            setMessages(prev => [...prev, {
              id: item.id || Date.now(),
              role: 'assistant',
              content: text,
              timestamp: new Date()
            }]);
          }
        }
      });

      // Tool call events
      session.on('agent_tool_start', (context, agent, tool, details) => {
        console.log('🔧 Tool call started:', tool.name);
      });

      session.on('agent_tool_end', (context, agent, tool, result, details) => {
        console.log('🔧 Tool call ended:', tool.name, result?.substring?.(0, 50));
      });

      // Transport events (for user speech detection)
      session.on('transport_event', (event) => {
        if (event.type === 'input_audio_buffer.speech_started') {
          console.log('🎤 User started speaking');
          setLocalIsListening(true);
          setIsListening(true);
        } else if (event.type === 'input_audio_buffer.speech_stopped') {
          console.log('🎤 User stopped speaking');
          setLocalIsListening(false);
          setIsListening(false);
        }
      });

      // Error handling
      session.on('error', (errorEvent) => {
        console.error('❌ Session error:', errorEvent);
        setError(errorEvent?.error?.message || errorEvent?.message || 'Connection error');
      });

      // 6. Connect with ephemeral token
      try {
        console.log('🔌 Attempting WebRTC connection with SDK...');
        await session.connect({
          apiKey: ephemeralKey
        });
      } catch (connectError) {
        console.error('WebRTC connection error:', {
          message: connectError.message,
          name: connectError.name,
          stack: connectError.stack?.split('\n').slice(0, 3)
        });

        // Parse the error for user-friendly messages
        const errorMessage = connectError.message || '';

        if (errorMessage.includes('SessionDescription') || errorMessage.includes('400')) {
          throw new Error(
            'OpenAI Realtime API access required. Please use Push-to-Talk mode, or contact OpenAI to enable Realtime API for your account.'
          );
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          throw new Error('Authentication failed. Please try again.');
        } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          throw new Error('Network connection failed. Please check your internet connection.');
        }

        throw connectError;
      }

      console.log('✅ Connected via OpenAI Agents SDK');
      setIsConnected(true);
      setIsConnecting(false);

      return { success: true, sessionId: sid };
    } catch (error) {
      console.error('SDK connection error:', error);

      // Provide helpful error messages
      let errorMsg = error.message || 'Failed to connect';

      // Check for common OpenAI API errors
      if (errorMsg.includes('model') || errorMsg.includes('access')) {
        errorMsg = 'Realtime API not available. Please use Push-to-Talk mode.';
      }

      setError(errorMsg);
      setIsConnecting(false);
      return { success: false, error: errorMsg };
    }
  }, [isConnected, isConnecting, getContext, setError, setIsListening, setIsSpeaking, setTranscript, setMessages]);

  /**
   * Disconnect
   */
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting...');

    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (error) {
        console.debug('Session close error:', error.message);
      }
      sessionRef.current = null;
    }

    agentRef.current = null;

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
    setLocalIsListening(false);
    setLocalIsSpeaking(false);
    setIsListening(false);
    setIsSpeaking(false);
  }, [sessionId, setIsListening, setIsSpeaking]);

  /**
   * Send text message
   */
  const sendTextMessage = useCallback(async (text) => {
    if (!sessionRef.current || !isConnected) {
      setError('Not connected');
      return;
    }

    try {
      await sessionRef.current.sendMessage(text);

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'user',
        content: text,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Send message error:', error);
      setError(error.message);
    }
  }, [isConnected, setError, setMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close().catch(() => {});
      }
    };
  }, []);

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

export default useDineAIAgentSDK;
