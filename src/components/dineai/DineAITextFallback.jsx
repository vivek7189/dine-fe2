'use client';

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner, FaLightbulb } from 'react-icons/fa';
import { useDineAI } from '../../contexts/DineAIContext';
import DineAITranscript from './DineAITranscript';

/**
 * DineAI Text Fallback Interface
 * Text-based chat when voice is unavailable or preferred
 */
const DineAITextFallback = ({ onSwitchToVoice }) => {
  const {
    messages,
    isProcessing,
    sendMessage,
    getSuggestions,
    error
  } = useDineAI();

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef(null);

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      const loadedSuggestions = await getSuggestions();
      setSuggestions(loadedSuggestions);
    };
    loadSuggestions();
  }, [getSuggestions]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!inputValue.trim() || isProcessing) return;

    const message = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);

    await sendMessage(message);
  };

  const handleSuggestionClick = async (suggestion) => {
    setShowSuggestions(false);
    setInputValue('');
    await sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'white'
      }}
    >
      {/* Transcript area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DineAITranscript
          messages={messages}
          maxHeight={350}
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #f3f4f6'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}
          >
            <FaLightbulb size={12} color="#f59e0b" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Try saying:
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isProcessing}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  color: '#374151',
                  transition: 'all 0.2s',
                  opacity: isProcessing ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!isProcessing) {
                    e.target.style.background = '#e5e7eb';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f3f4f6';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '10px 16px',
            background: '#fef2f2',
            borderTop: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px'
          }}
        >
          {error}
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          background: '#fafafa'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isProcessing}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '14px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            outline: 'none',
            background: 'white',
            color: '#1f2937',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#6366f1';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isProcessing}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: 'none',
            background: inputValue.trim() && !isProcessing
              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              : '#e5e7eb',
            cursor: inputValue.trim() && !isProcessing ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          {isProcessing ? (
            <FaSpinner
              size={16}
              color="white"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          ) : (
            <FaPaperPlane
              size={16}
              color={inputValue.trim() ? 'white' : '#9ca3af'}
            />
          )}
        </button>
      </form>

      {/* Switch to voice option */}
      {onSwitchToVoice && (
        <div
          style={{
            padding: '8px 16px 16px',
            textAlign: 'center'
          }}
        >
          <button
            onClick={onSwitchToVoice}
            style={{
              fontSize: '13px',
              color: '#6366f1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Switch to voice mode
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DineAITextFallback;
