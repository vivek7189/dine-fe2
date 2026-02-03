'use client';

import { useEffect, useRef } from 'react';
import { FaUser, FaRobot, FaCog, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * DineAI Transcript Display
 * Shows live transcript and conversation history
 */
const DineAITranscript = ({
  messages = [],
  currentTranscript = '',
  interimTranscript = '',
  isListening = false,
  isSpeaking = false,
  maxHeight = 300
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript, interimTranscript]);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: '10px',
          marginBottom: '12px'
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isUser
              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isUser ? (
            <FaUser size={14} color="white" />
          ) : (
            <FaRobot size={14} color="white" />
          )}
        </div>

        {/* Message content */}
        <div
          style={{
            maxWidth: '75%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start'
          }}
        >
          <div
            style={{
              background: isUser ? '#f3f4f6' : 'white',
              border: isUser ? 'none' : '1px solid #e5e7eb',
              borderRadius: '12px',
              borderTopRightRadius: isUser ? '4px' : '12px',
              borderTopLeftRadius: isUser ? '12px' : '4px',
              padding: '10px 14px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#374151',
                whiteSpace: 'pre-wrap'
              }}
            >
              {message.content}
            </p>

            {/* Function call indicator */}
            {message.functionCalled && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  padding: '6px 10px',
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#166534'
                }}
              >
                <FaCog size={10} />
                <span>{message.functionCalled.replace(/_/g, ' ')}</span>
                {message.functionResult?.success ? (
                  <FaCheck size={10} color="#16a34a" />
                ) : (
                  <FaTimes size={10} color="#dc2626" />
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
              paddingLeft: isUser ? 0 : '4px',
              paddingRight: isUser ? '4px' : 0
            }}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={scrollRef}
      style={{
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
        padding: '16px',
        background: '#fafafa',
        borderRadius: '12px',
        scrollBehavior: 'smooth'
      }}
    >
      {/* Empty state */}
      {messages.length === 0 && !currentTranscript && !interimTranscript && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center'
          }}
        >
          <FaRobot size={32} color="#9ca3af" />
          <p
            style={{
              margin: '12px 0 0 0',
              fontSize: '14px',
              color: '#6b7280'
            }}
          >
            Start speaking or type a message
          </p>
        </div>
      )}

      {/* Message history */}
      {messages.map((message, index) => (
        <MessageBubble key={message.id || index} message={message} />
      ))}

      {/* Current transcript (user speaking) */}
      {(currentTranscript || interimTranscript) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '12px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isListening
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FaUser size={14} color="white" />
          </div>

          <div
            style={{
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}
          >
            <div
              style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                borderTopRightRadius: '4px',
                padding: '10px 14px'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#374151'
                }}
              >
                {currentTranscript}
                {interimTranscript && (
                  <span style={{ color: '#9ca3af' }}>
                    {currentTranscript ? ' ' : ''}{interimTranscript}
                  </span>
                )}
              </p>
            </div>

            {isListening && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#ef4444',
                  marginTop: '4px',
                  paddingRight: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    animation: 'pulse 1s infinite'
                  }}
                />
                Listening...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            width: 'fit-content'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaRobot size={10} color="white" />
          </div>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            DineAI is speaking...
          </span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: `bounce 0.6s ${i * 0.15}s infinite`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default DineAITranscript;
