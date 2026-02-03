'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDineAI } from '../contexts/DineAIContext';

/**
 * DineAI Voice Hook
 * Handles Web Speech API for speech recognition and audio processing
 */
export const useDineAIVoice = () => {
  const {
    sessionId,
    setIsListening,
    setIsSpeaking,
    setTranscript,
    setInterimTranscript,
    sendMessage,
    startSession,
    setError
  } = useDineAI();

  // State
  const [isListening, setLocalIsListening] = useState(false);
  const [isSpeaking, setLocalIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(true);

  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const speakFnRef = useRef(null);

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceSupported(false);
        console.warn('Speech recognition not supported in this browser');
      }

      // Check speech synthesis support
      if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported in this browser');
      }

      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setLocalIsListening(true);
      setIsListening(true);
      currentTranscriptRef.current = '';
    };

    recognition.onend = async () => {
      console.log('Speech recognition ended');
      setLocalIsListening(false);
      setIsListening(false);

      // Send the final transcript if we have one
      const finalTranscript = currentTranscriptRef.current.trim();
      if (finalTranscript) {
        const result = await sendMessage(finalTranscript);
        setTranscript('');
        setInterimTranscript('');
        currentTranscriptRef.current = '';

        // Speak the response if we got one
        if (result?.success && result?.response && speakFnRef.current) {
          speakFnRef.current(result.response);
        }
      }
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        currentTranscriptRef.current += final;
        setTranscript(currentTranscriptRef.current);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
        setVoiceSupported(false);
      } else if (event.error === 'no-speech') {
        // This is normal, just restart
        console.log('No speech detected');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }

      setLocalIsListening(false);
      setIsListening(false);
    };

    return recognition;
  }, [setIsListening, setTranscript, setInterimTranscript, sendMessage, setError]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!voiceSupported) {
      setError('Voice input is not supported in this browser');
      return;
    }

    // Ensure we have a session
    if (!sessionId) {
      const result = await startSession({ sessionType: 'voice' });
      if (!result.success) {
        return;
      }
    }

    // Stop any ongoing speech synthesis
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    // Initialize recognition if needed
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        startAudioLevelMonitoring();
      } catch (error) {
        if (error.message?.includes('already started')) {
          console.log('Recognition already started');
        } else {
          console.error('Error starting recognition:', error);
          setError('Failed to start voice recognition');
        }
      }
    }
  }, [voiceSupported, sessionId, startSession, initRecognition, setError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    stopAudioLevelMonitoring();
  }, []);

  // Start audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255); // Normalize to 0-1

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  // Stop audio level monitoring
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
  }, []);

  // Speak text using speech synthesis
  const speak = useCallback((text) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to get a good English voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setLocalIsSpeaking(true);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setLocalIsSpeaking(false);
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setLocalIsSpeaking(false);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, [setIsSpeaking]);

  // Store speak function in ref for use in callbacks
  useEffect(() => {
    speakFnRef.current = speak;
  }, [speak]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setLocalIsSpeaking(false);
      setIsSpeaking(false);
    }
  }, [setIsSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopAudioLevelMonitoring();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [stopAudioLevelMonitoring]);

  return {
    isListening,
    isSpeaking,
    isConnected,
    audioLevel,
    voiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};

export default useDineAIVoice;
