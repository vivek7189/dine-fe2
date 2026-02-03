'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../lib/api';
import {
  FaTimes,
  FaMicrophone,
  FaMicrophoneSlash,
  FaKeyboard,
  FaVolumeUp,
  FaCog,
  FaRobot,
  FaWifi,
  FaPlug
} from 'react-icons/fa';
import { useDineAI } from '../../contexts/DineAIContext';
import { useDineAIVoice } from '../../hooks/useDineAIVoice';
import { useDineAIWebRTC } from '../../hooks/useDineAIWebRTC';
import DineAIWaveform from './DineAIWaveform';
import DineAITranscript from './DineAITranscript';
import DineAITextFallback from './DineAITextFallback';

/**
 * DineAI Voice Modal
 * Main voice conversation interface - supports both Push-to-Talk and Realtime modes
 */
const DineAIVoiceModal = () => {
  const {
    isOpen,
    close,
    messages,
    transcript,
    interimTranscript,
    settings,
    usage,
    error,
    getContext,
    sendMessage,
    setError,
    updateSettings
  } = useDineAI();

  // Push-to-talk hook
  const pttHook = useDineAIVoice();

  // WebRTC hook (direct WebRTC, backend proxies SDP - more reliable)
  const realtimeHook = useDineAIWebRTC();

  // Determine which mode to use based on settings
  const isRealtimeMode = settings?.voiceMode === 'realtime';

  // Use the appropriate hook's values
  const {
    isListening,
    isSpeaking,
    audioLevel,
    voiceSupported
  } = isRealtimeMode ? {
    isListening: realtimeHook.isListening,
    isSpeaking: realtimeHook.isSpeaking,
    audioLevel: realtimeHook.audioLevel,
    voiceSupported: typeof window !== 'undefined' && typeof RTCPeerConnection !== 'undefined'
  } : pttHook;

  const isConnected = isRealtimeMode ? realtimeHook.isConnected : true;
  const isConnecting = isRealtimeMode ? realtimeHook.isConnecting : false;

  const [mode, setMode] = useState('voice'); // 'voice' or 'text'
  const [showSettings, setShowSettings] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const greetingPlayedRef = useRef(false);
  const realtimeConnectedRef = useRef(false);

  const { userName, userRole, restaurantId } = getContext();

  // Auto-switch to text mode if voice not supported
  useEffect(() => {
    if (!voiceSupported && mode === 'voice') {
      setMode('text');
    }
  }, [voiceSupported, mode]);

  // Connect to realtime API when modal opens in realtime mode
  useEffect(() => {
    let cancelled = false;
    let timeoutId = null;

    const connectRealtime = async () => {
      if (cancelled) return;
      if (!isOpen || !isRealtimeMode || realtimeConnectedRef.current) return;
      if (realtimeHook.isConnected || realtimeHook.isConnecting) return;

      console.log('🎙️ Connecting to Realtime API...');
      realtimeConnectedRef.current = true;

      const result = await realtimeHook.connect();

      if (cancelled) return;

      if (!result?.success) {
        console.error('Failed to connect to realtime:', result?.error);
        realtimeConnectedRef.current = false;
      }
    };

    if (isOpen && isRealtimeMode && mode === 'voice') {
      // Small delay to handle React Strict Mode double-mount
      timeoutId = setTimeout(connectRealtime, 100);
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, isRealtimeMode, mode]); // Removed realtimeHook from deps to prevent re-runs

  // Fetch and play greeting when modal opens (PTT mode only)
  useEffect(() => {
    const fetchGreeting = async () => {
      // Skip for realtime mode - greeting comes from OpenAI
      if (isRealtimeMode) return;
      if (!isOpen || !restaurantId || greetingPlayedRef.current) return;

      try {
        const response = await apiClient.get(
          `/api/dineai/greeting/${restaurantId}?voice=${mode === 'voice'}`
        );

        if (response.success) {
          setGreeting(response.greeting);
          setSuggestions(response.suggestions || []);

          // Speak the greeting in voice mode (PTT only)
          if (mode === 'voice' && response.voiceGreeting && pttHook.speak) {
            greetingPlayedRef.current = true;
            setTimeout(() => {
              pttHook.speak(response.voiceGreeting || response.greeting);
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error fetching greeting:', error);
      }
    };

    fetchGreeting();
  }, [isOpen, restaurantId, mode, isRealtimeMode, pttHook]);

  // Track if modal was previously open
  const wasOpenRef = useRef(false);

  // Reset state and disconnect when modal closes
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      // Modal just closed - cleanup
      greetingPlayedRef.current = false;
      realtimeConnectedRef.current = false;
      setGreeting(null);
      setSuggestions([]);

      // Disconnect if we were in realtime mode
      if (realtimeHook.isConnected) {
        realtimeHook.disconnect();
      }
      wasOpenRef.current = false;
    }
  }, [isOpen]); // realtimeHook.isConnected and disconnect accessed via ref pattern

  const handleMicClick = useCallback(() => {
    if (isRealtimeMode) {
      // Realtime mode: connect/disconnect
      if (realtimeHook.isConnected) {
        // In realtime mode, clicking mic doesn't stop - it's always listening
        // Could add a "mute" feature here if needed
        console.log('Realtime mode - always listening when connected');
      } else {
        realtimeHook.connect();
      }
    } else {
      // PTT mode: start/stop listening
      if (isListening) {
        pttHook.stopListening();
      } else {
        pttHook.startListening();
      }
    }
  }, [isRealtimeMode, isListening, realtimeHook, pttHook]);

  const handleClose = useCallback(() => {
    if (isRealtimeMode) {
      realtimeHook.disconnect();
    } else if (isListening) {
      pttHook.stopListening();
    }
    close();
  }, [isRealtimeMode, isListening, pttHook, realtimeHook, close]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          margin: '16px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaRobot size={20} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'white' }}>
                  DineAI
                </h2>
                {isRealtimeMode && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isConnected ? 'rgba(34, 197, 94, 0.3)' : isConnecting ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                      fontSize: '10px',
                      color: 'white'
                    }}
                  >
                    {isConnecting ? <FaWifi size={10} /> : isConnected ? <FaWifi size={10} /> : <FaPlug size={10} />}
                    {isConnecting ? 'Connecting...' : isConnected ? 'Live' : 'Offline'}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isRealtimeMode
                  ? (isConnected ? 'Realtime voice active' : isConnecting ? 'Setting up voice...' : `Hi ${userName || 'there'}!`)
                  : (greeting ? greeting.split('.')[0] : `Hi ${userName || 'there'}! How can I help?`)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mode toggle */}
            <button
              onClick={() => setMode(mode === 'voice' ? 'text' : 'voice')}
              disabled={!voiceSupported}
              title={mode === 'voice' ? 'Switch to text' : 'Switch to voice'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: voiceSupported ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: voiceSupported ? 1 : 0.5
              }}
            >
              {mode === 'voice' ? <FaKeyboard size={16} /> : <FaVolumeUp size={16} />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaCog size={16} />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              title="Close"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            style={{
              padding: '16px 20px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Voice Settings
            </h3>

            {/* Voice Mode Toggle */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                Voice Mode
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    if (isRealtimeMode) {
                      // Switch to PTT
                      realtimeHook.disconnect();
                      await updateSettings({ voiceMode: 'push-to-talk' });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: !isRealtimeMode ? '2px solid #6366f1' : '1px solid #d1d5db',
                    background: !isRealtimeMode ? '#eef2ff' : 'white',
                    color: !isRealtimeMode ? '#4f46e5' : '#6b7280',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Push-to-Talk
                </button>
                <button
                  onClick={async () => {
                    if (!isRealtimeMode) {
                      // Switch to Realtime
                      await updateSettings({ voiceMode: 'realtime' });
                      // Will auto-connect on next modal open
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isRealtimeMode ? '2px solid #6366f1' : '1px solid #d1d5db',
                    background: isRealtimeMode ? '#eef2ff' : 'white',
                    color: isRealtimeMode ? '#4f46e5' : '#6b7280',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Realtime (Beta)
                </button>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                {isRealtimeMode
                  ? 'Realtime: Natural conversation via WebRTC. Just speak naturally!'
                  : 'Push-to-Talk: Tap mic, speak, release. Good for noisy environments.'}
              </p>
            </div>

            {/* Close settings */}
            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: '#e5e7eb',
                color: '#374151',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Close Settings
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {mode === 'voice' ? (
            <>
              {/* Voice waveform */}
              <div
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isListening ? '#fef2f2' : isSpeaking ? '#f0fdf4' : '#fafafa'
                }}
              >
                <DineAIWaveform
                  isActive={isListening || isSpeaking}
                  mode={isListening ? 'listening' : 'speaking'}
                  audioLevel={audioLevel}
                  height={80}
                  barCount={7}
                />

                <p
                  style={{
                    margin: '16px 0 0 0',
                    fontSize: '14px',
                    color: isListening ? '#dc2626' : isSpeaking ? '#16a34a' : isConnecting ? '#f59e0b' : '#6b7280',
                    fontWeight: '500'
                  }}
                >
                  {isRealtimeMode
                    ? (isConnecting
                        ? 'Connecting to voice...'
                        : isConnected
                          ? (isListening
                              ? 'Listening...'
                              : isSpeaking
                                ? 'Speaking...'
                                : 'Just start speaking!')
                          : 'Tap to connect')
                    : (isListening
                        ? 'Listening...'
                        : isSpeaking
                          ? 'Speaking...'
                          : 'Tap the microphone to speak')}
                </p>
              </div>

              {/* Transcript */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <DineAITranscript
                  messages={messages}
                  currentTranscript={transcript}
                  interimTranscript={interimTranscript}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  maxHeight={250}
                />
              </div>

              {/* Quick suggestions */}
              {suggestions.length > 0 && messages.length === 0 && (
                <div
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderTop: '1px solid #f3f4f6'
                  }}
                >
                  {suggestions.slice(0, 3).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={async () => {
                        const result = await sendMessage(suggestion);
                        // Speak the response (PTT mode only - realtime handles its own audio)
                        if (result?.success && result?.response && !isRealtimeMode && pttHook.speak) {
                          pttHook.speak(result.response);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        fontSize: '12px',
                        color: '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Voice controls */}
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  borderTop: '1px solid #f3f4f6'
                }}
              >
                {/* Microphone button */}
                <button
                  onClick={handleMicClick}
                  disabled={isSpeaking || isConnecting}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isConnecting
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : (isRealtimeMode && isConnected)
                        ? (isListening
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)')
                        : isListening
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    cursor: (isSpeaking || isConnecting) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isConnecting
                      ? '0 0 0 8px rgba(245, 158, 11, 0.2)'
                      : (isRealtimeMode && isConnected)
                        ? '0 0 0 8px rgba(34, 197, 94, 0.2)'
                        : isListening
                          ? '0 0 0 8px rgba(239, 68, 68, 0.2)'
                          : '0 4px 20px rgba(79, 70, 229, 0.3)',
                    transition: 'all 0.3s ease',
                    opacity: (isSpeaking || isConnecting) ? 0.7 : 1,
                    animation: isConnecting ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {isConnecting ? (
                    <FaWifi size={28} color="white" />
                  ) : (isRealtimeMode && isConnected) ? (
                    <FaMicrophone size={28} color="white" />
                  ) : isListening ? (
                    <FaMicrophoneSlash size={28} color="white" />
                  ) : (
                    <FaMicrophone size={28} color="white" />
                  )}
                </button>

                {/* Status text */}
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                  {isRealtimeMode
                    ? (isConnecting
                        ? 'Setting up connection...'
                        : isConnected
                          ? (isListening
                              ? 'Listening to you...'
                              : isSpeaking
                                ? 'AI is responding...'
                                : 'Voice is ready - just speak')
                          : 'Tap to start voice')
                    : (isListening
                        ? 'Tap to stop'
                        : isSpeaking
                          ? 'Wait for response...'
                          : 'Tap to speak')}
                </p>
              </div>
            </>
          ) : (
            /* Text mode */
            <DineAITextFallback
              onSwitchToVoice={voiceSupported ? () => setMode('voice') : null}
            />
          )}
        </div>

        {/* Usage indicator */}
        {usage && (
          <div
            style={{
              padding: '8px 16px',
              background: '#f9fafb',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#6b7280'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Role: {userRole}</span>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                background: isRealtimeMode ? '#dbeafe' : '#f3e8ff',
                color: isRealtimeMode ? '#1d4ed8' : '#7c3aed',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                {isRealtimeMode ? 'Realtime' : 'Push-to-Talk'}
              </span>
            </div>
            <span>
              {usage.remaining !== undefined
                ? `${usage.remaining} / ${usage.total} remaining today`
                : ''}
            </span>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              borderTop: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ flex: 1 }}>{error}</span>
            {isRealtimeMode && error?.includes('Push-to-Talk') && (
              <button
                onClick={async () => {
                  await updateSettings({ voiceMode: 'push-to-talk' });
                  setError(null);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Switch Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DineAIVoiceModal;
