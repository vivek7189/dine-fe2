'use client';

import { useState, useEffect } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { useDineAI } from '../../contexts/DineAIContext';
import DineAIVoiceModal from './DineAIVoiceModal';
import DineAICheapVoiceModal from './DineAICheapVoiceModal';

/**
 * DineAI Floating Button
 * Appears on all dashboard pages for quick voice assistant access
 * Supports multiple voice modes:
 * - push-to-talk: Original push to talk mode
 * - cheap-realtime: Full voice at 95% lower cost (recommended)
 * - realtime: OpenAI Realtime API (expensive)
 */
const DineAIButton = () => {
  const {
    isOpen,
    isListening,
    isProcessing,
    toggle,
    open,
    close,
    settings
  } = useDineAI();

  const [isPulsing, setIsPulsing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [cheapVoiceOpen, setCheapVoiceOpen] = useState(false);

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [isListening]);

  // Handle button click based on voice mode
  const handleClick = () => {
    const voiceMode = settings?.voiceMode || 'push-to-talk';

    if (voiceMode === 'cheap-realtime') {
      // Use cheap realtime modal
      setCheapVoiceOpen(true);
    } else {
      // Use original toggle (push-to-talk or realtime)
      toggle();
    }
  };

  // Handle closing cheap voice modal
  const handleCloseCheapVoice = () => {
    setCheapVoiceOpen(false);
  };

  // Don't render if DineAI is disabled
  if (!settings?.enabled) {
    return null;
  }

  // Check if any modal is open
  const isAnyModalOpen = isOpen || cheapVoiceOpen;

  return (
    <>
      {/* Floating Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000
        }}
      >
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isProcessing}
          aria-label="Open DineAI Assistant"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isListening
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.3s ease',
            transform: isAnyModalOpen ? 'scale(0.9)' : 'scale(1)',
            opacity: isProcessing ? 0.7 : 1,
            position: 'relative',
            overflow: 'visible'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {/* Pulse animation */}
          {isPulsing && (
            <>
              <span
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.4)',
                  animation: 'dineai-pulse 1.5s ease-out infinite'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.3)',
                  animation: 'dineai-pulse 1.5s ease-out infinite 0.3s'
                }}
              />
            </>
          )}

          {/* Microphone Icon */}
          <FaMicrophone
            size={24}
            color="white"
            style={{
              position: 'relative',
              zIndex: 2
            }}
          />

          {/* Processing spinner */}
          {isProcessing && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'white',
                animation: 'dineai-spin 0.8s linear infinite'
              }}
            />
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && !isAnyModalOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '70px',
              right: '0',
              background: '#1f2937',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              animation: 'dineai-fadeIn 0.2s ease'
            }}
          >
            DineAI Voice Assistant
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '24px',
                width: '12px',
                height: '12px',
                background: '#1f2937',
                transform: 'rotate(45deg)'
              }}
            />
          </div>
        )}
      </div>

      {/* Voice Modal - Original (push-to-talk and realtime modes) */}
      {isOpen && <DineAIVoiceModal />}

      {/* Cheap Voice Modal - Cost-effective mode */}
      <DineAICheapVoiceModal
        isOpen={cheapVoiceOpen}
        onClose={handleCloseCheapVoice}
      />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes dineai-pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes dineai-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dineai-fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default DineAIButton;
