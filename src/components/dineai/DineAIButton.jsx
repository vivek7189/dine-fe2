'use client';

import { useState, useEffect } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { useDineAI } from '../../contexts/DineAIContext';
import DineAIVoiceModal from './DineAIVoiceModal';

/**
 * DineAI Floating Button
 * Appears on all dashboard pages for quick voice assistant access
 */
const DineAIButton = () => {
  const {
    isOpen,
    isListening,
    isProcessing,
    toggle,
    settings
  } = useDineAI();

  const [isPulsing, setIsPulsing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [isListening]);

  // Don't render if DineAI is disabled
  if (!settings?.enabled) {
    return null;
  }

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
          onClick={toggle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isProcessing}
          aria-label="Open DineAI Assistant"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'scale(0.9)' : 'scale(1)',
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
        {showTooltip && !isOpen && (
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

      {/* Voice Modal */}
      {isOpen && <DineAIVoiceModal />}

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
