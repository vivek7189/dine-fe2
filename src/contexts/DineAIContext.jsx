'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import apiClient from '../lib/api';

const DineAIContext = createContext();

// Default values for SSR/build time when provider isn't mounted
const defaultContext = {
  isOpen: false,
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  sessionId: null,
  sessionConfig: null,
  messages: [],
  transcript: '',
  interimTranscript: '',
  settings: { responseMode: 'voice', voiceMode: 'push-to-talk', voice: 'alloy', enabled: true },
  usage: null,
  error: null,
  setIsListening: () => {},
  setIsSpeaking: () => {},
  setTranscript: () => {},
  setInterimTranscript: () => {},
  setMessages: () => {},
  setError: () => {},
  open: () => {},
  close: () => {},
  toggle: () => {},
  startSession: async () => ({ success: false }),
  endSession: async () => {},
  sendMessage: async () => ({ success: false }),
  clearMessages: () => {},
  updateSettings: async () => {},
  getCapabilities: async () => null,
  getSuggestions: async () => [],
  getUsage: async () => null,
  getContext: () => ({ userId: null, restaurantId: null, userRole: 'employee', userName: 'User' })
};

export const useDineAI = () => {
  const context = useContext(DineAIContext);
  // Return default context during SSR/build - provider will be available at runtime
  if (!context) {
    return defaultContext;
  }
  return context;
};

export const DineAIProvider = ({ children }) => {
  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [sessionConfig, setSessionConfig] = useState(null);

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    responseMode: 'voice', // 'voice', 'text', or 'both'
    voiceMode: 'push-to-talk', // 'push-to-talk' or 'realtime' (realtime requires special OpenAI access)
    voice: 'alloy',
    enabled: true
  });

  // Usage state
  const [usage, setUsage] = useState(null);

  // Error state
  const [error, setError] = useState(null);

  // Refs
  const audioContextRef = useRef(null);
  const wsRef = useRef(null);

  // Get user and restaurant from localStorage
  const getContext = useCallback(() => {
    let userId = null;
    let restaurantId = null;
    let userRole = 'employee';
    let userName = 'User';

    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || user.userId || user.uid;
        userName = user.name || user.displayName || 'User';
        userRole = user.role || 'employee';
      }

      restaurantId = localStorage.getItem('selectedRestaurantId');
    } catch (e) {
      console.error('Error getting context:', e);
    }

    return { userId, restaurantId, userRole, userName };
  }, []);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const { restaurantId } = getContext();
      if (!restaurantId) return;

      try {
        const response = await apiClient.get(`/api/dineai/settings/${restaurantId}`);
        if (response.success) {
          setSettings(prev => ({
            ...prev,
            ...response.settings
          }));
        }
      } catch (error) {
        console.error('Error loading DineAI settings:', error);
      }
    };

    loadSettings();
  }, [getContext]);

  // Start a new session
  const startSession = useCallback(async (options = {}) => {
    const { restaurantId, userId } = getContext();

    if (!restaurantId || !userId) {
      setError('Please select a restaurant first');
      return { success: false };
    }

    setError(null);
    setIsProcessing(true);

    try {
      const response = await apiClient.post('/api/dineai/session/start', {
        restaurantId,
        sessionType: options.sessionType || 'voice',
        responseMode: options.responseMode || settings.responseMode,
        voice: options.voice || settings.voice
      });

      if (response.success) {
        setSessionId(response.sessionId);
        setSessionConfig(response.config);
        setUsage({
          remaining: response.limits?.remaining,
          total: response.limits?.total
        });

        console.log('DineAI session started:', response.sessionId);
        return { success: true, sessionId: response.sessionId };
      } else {
        setError(response.error || 'Failed to start session');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error starting DineAI session:', error);
      setError(error.message || 'Failed to start session');
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  }, [getContext, settings]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    const { restaurantId } = getContext();

    try {
      await apiClient.post('/api/dineai/session/end', {
        restaurantId,
        sessionId
      });

      console.log('DineAI session ended:', sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setSessionId(null);
      setSessionConfig(null);
      setMessages([]);
      setTranscript('');
      setInterimTranscript('');
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [sessionId, getContext]);

  // Send a text message
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const { restaurantId } = getContext();

    if (!restaurantId) {
      setError('Please select a restaurant first');
      return { success: false };
    }

    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/dineai/query', {
        restaurantId,
        sessionId,
        query: text
      });

      if (response.success) {
        // Update session ID if new
        if (response.sessionId && !sessionId) {
          setSessionId(response.sessionId);
        }

        // Add assistant message
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          functionCalled: response.functionCalled,
          functionResult: response.functionResult,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update usage if provided
        if (response.usage) {
          setUsage(prev => ({
            ...prev,
            remaining: response.usage.remaining
          }));
        }

        return { success: true, response: response.response };
      } else {
        setError(response.error || 'Failed to process message');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, getContext]);

  // Open DineAI modal
  const open = useCallback(() => {
    if (!settings.enabled) {
      setError('DineAI is disabled for this restaurant');
      return;
    }
    setIsOpen(true);
    setError(null);
  }, [settings.enabled]);

  // Close DineAI modal
  const close = useCallback(() => {
    setIsOpen(false);
    if (isListening) {
      setIsListening(false);
    }
  }, [isListening]);

  // Toggle modal
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    const { restaurantId } = getContext();

    if (!restaurantId) return;

    try {
      const response = await apiClient.put(`/api/dineai/settings/${restaurantId}`, newSettings);

      if (response.success) {
        setSettings(prev => ({
          ...prev,
          ...newSettings
        }));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }, [getContext]);

  // Get capabilities
  const getCapabilities = useCallback(async () => {
    const { restaurantId } = getContext();

    if (!restaurantId) return null;

    try {
      const response = await apiClient.get(`/api/dineai/capabilities?restaurantId=${restaurantId}`);
      return response.success ? response : null;
    } catch (error) {
      console.error('Error getting capabilities:', error);
      return null;
    }
  }, [getContext]);

  // Get suggestions
  const getSuggestions = useCallback(async () => {
    const { restaurantId } = getContext();

    if (!restaurantId) return [];

    try {
      const response = await apiClient.get(`/api/dineai/suggestions/${restaurantId}`);
      return response.success ? response.suggestions : [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, [getContext]);

  // Get usage stats
  const getUsage = useCallback(async () => {
    const { restaurantId } = getContext();

    if (!restaurantId) return null;

    try {
      const response = await apiClient.get(`/api/dineai/usage/${restaurantId}`);
      if (response.success) {
        setUsage(response.usage);
        return response.usage;
      }
      return null;
    } catch (error) {
      console.error('Error getting usage:', error);
      return null;
    }
  }, [getContext]);

  const value = {
    // State
    isOpen,
    isListening,
    isProcessing,
    isSpeaking,
    sessionId,
    sessionConfig,
    messages,
    transcript,
    interimTranscript,
    settings,
    usage,
    error,

    // Setters
    setIsListening,
    setIsSpeaking,
    setTranscript,
    setInterimTranscript,
    setMessages,
    setError,

    // Actions
    open,
    close,
    toggle,
    startSession,
    endSession,
    sendMessage,
    clearMessages,
    updateSettings,
    getCapabilities,
    getSuggestions,
    getUsage,
    getContext
  };

  return (
    <DineAIContext.Provider value={value}>
      {children}
    </DineAIContext.Provider>
  );
};

export default DineAIContext;
