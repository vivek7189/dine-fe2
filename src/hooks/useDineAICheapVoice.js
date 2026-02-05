'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import apiClient from '../lib/api';

/**
 * DineAI Cheap Voice Hook
 * Cost-effective voice assistant using:
 * - Web Speech API for STT (FREE!)
 * - GPT-4o-mini for responses (very cheap)
 * - OpenAI TTS for speech output (cheap)
 *
 * 95% cheaper than OpenAI Realtime API!
 */
export const useDineAICheapVoice = () => {
  // State
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const isActiveRef = useRef(false);
  const shouldResumeListeningRef = useRef(false);

  /**
   * Get restaurant ID from localStorage
   */
  const getRestaurantId = useCallback(() => {
    try {
      return localStorage.getItem('selectedRestaurantId');
    } catch (e) {
      return null;
    }
  }, []);

  /**
   * Initialize Web Speech API
   */
  const initSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Please use Chrome.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);

      // Auto-restart if session is still active and should resume
      if (isActiveRef.current && shouldResumeListeningRef.current && !isSpeaking) {
        console.log('🎤 Auto-restarting speech recognition...');
        setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Recognition already started or error:', e.message);
            }
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // No speech detected, restart if active
        if (isActiveRef.current && shouldResumeListeningRef.current) {
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }
          }, 100);
        }
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setInterimTranscript(interimText);

      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript);
        setTranscript(finalTranscript);
        handleUserSpeech(finalTranscript.trim());
      }
    };

    return recognition;
  }, [isSpeaking]);

  /**
   * Handle user speech - send to backend
   */
  const handleUserSpeech = useCallback(async (text) => {
    if (!text || isProcessing) return;

    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      setError('No restaurant selected');
      return;
    }

    // Stop listening while processing
    shouldResumeListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Add user message to UI
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🤖 Sending to backend:', text);

      const response = await apiClient.post('/api/dineai/cheap-voice/message', {
        sessionId,
        restaurantId,
        text
      });

      console.log('🤖 Response:', response);

      if (response.success) {
        // Add assistant message
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          functionCalled: response.functionCalled,
          timestamp: new Date()
        }]);

        // Check if should close
        if (response.shouldClose) {
          // Play goodbye audio then stop
          if (response.audio) {
            await playAudio(response.audio, response.audioFormat);
          }
          stop();
          return;
        }

        // Play TTS audio
        if (response.audio) {
          await playAudio(response.audio, response.audioFormat);
        }

        // Resume listening after speaking
        shouldResumeListeningRef.current = true;
        if (isActiveRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Error restarting recognition:', e.message);
          }
        }
      } else {
        setError(response.error || 'Failed to process message');
        // Resume listening even on error
        shouldResumeListeningRef.current = true;
        if (isActiveRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      setError(error.message || 'Failed to process speech');
      // Resume listening on error
      shouldResumeListeningRef.current = true;
      if (isActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, isProcessing, getRestaurantId]);

  /**
   * Play audio from base64
   */
  const playAudio = useCallback((base64Audio, format = 'mp3') => {
    return new Promise((resolve) => {
      setIsSpeaking(true);

      // Stop listening while speaking
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const audio = new Audio(`data:audio/${format};base64,${base64Audio}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        resolve();
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        audioRef.current = null;
        resolve();
      };

      audio.play().catch(e => {
        console.error('Audio play failed:', e);
        setIsSpeaking(false);
        resolve();
      });
    });
  }, []);

  /**
   * Set up audio level monitoring for visualization
   */
  const setupAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current || !isActiveRef.current) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(1, average / 128));

        if (isActiveRef.current) {
          requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  }, []);

  /**
   * Start the voice assistant
   */
  const start = useCallback(async () => {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      setError('Please select a restaurant first');
      return { success: false };
    }

    setError(null);
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');

    try {
      // Start session
      console.log('🎤 Starting cheap voice session...');
      const response = await apiClient.post('/api/dineai/cheap-voice/session/start', {
        restaurantId
      });

      if (!response.success) {
        setError(response.error || 'Failed to start session');
        return { success: false };
      }

      setSessionId(response.sessionId);
      setIsActive(true);
      isActiveRef.current = true;
      shouldResumeListeningRef.current = true;

      // Add greeting message
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: response.greeting,
        timestamp: new Date()
      }]);

      // Initialize speech recognition
      const recognition = initSpeechRecognition();
      if (!recognition) {
        return { success: false };
      }
      recognitionRef.current = recognition;

      // Set up audio monitoring
      await setupAudioMonitoring();

      // Play greeting audio
      if (response.greetingAudio) {
        await playAudio(response.greetingAudio, response.audioFormat);
      }

      // Start listening
      try {
        recognition.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }

      console.log('🎤 Cheap voice session started:', response.sessionId);
      return { success: true, sessionId: response.sessionId };
    } catch (error) {
      console.error('Error starting cheap voice:', error);
      setError(error.message || 'Failed to start voice assistant');
      return { success: false, error: error.message };
    }
  }, [getRestaurantId, initSpeechRecognition, setupAudioMonitoring, playAudio]);

  /**
   * Stop the voice assistant
   */
  const stop = useCallback(async () => {
    console.log('🎤 Stopping cheap voice session...');

    isActiveRef.current = false;
    shouldResumeListeningRef.current = false;

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {}
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Stop audio monitoring
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    // End session on backend
    if (sessionId) {
      try {
        await apiClient.post('/api/dineai/cheap-voice/session/end', { sessionId });
      } catch (e) {
        console.error('Error ending session:', e);
      }
    }

    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setSessionId(null);
    setAudioLevel(0);
  }, [sessionId]);

  /**
   * Toggle voice assistant
   */
  const toggle = useCallback(() => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }, [isActive, start, stop]);

  /**
   * Send text message (for hybrid mode)
   */
  const sendTextMessage = useCallback(async (text) => {
    if (!text.trim() || !sessionId) return;

    await handleUserSpeech(text.trim());
  }, [sessionId, handleUserSpeech]);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      shouldResumeListeningRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    // State
    isActive,
    isListening,
    isProcessing,
    isSpeaking,
    sessionId,
    transcript,
    interimTranscript,
    messages,
    error,
    audioLevel,

    // Actions
    start,
    stop,
    toggle,
    sendTextMessage,
    clearMessages,
    setError
  };
};

export default useDineAICheapVoice;
