import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMicrophone, FaStop } from 'react-icons/fa';
import apiClient from '../lib/api';

// ─── Lightweight Markdown Renderer ──────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={key++} style={{ margin: '8px 0', paddingLeft: '20px', listStyleType: 'decimal' }}>
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key++} style={{ margin: '8px 0', paddingLeft: '20px', listStyleType: 'disc' }}>
            {listItems}
          </ul>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <div key={key++} style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '12px 0 6px 0' }}>
          {formatInline(line.slice(4))}
        </div>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <div key={key++} style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '12px 0 6px 0' }}>
          {formatInline(line.slice(3))}
        </div>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <div key={key++} style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '12px 0 6px 0' }}>
          {formatInline(line.slice(2))}
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      flushList();
      elements.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />);
      continue;
    }

    // Image: ![alt](src)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      flushList();
      elements.push(
        <img key={key++} src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: '100%', borderRadius: '8px', margin: '8px 0', border: '1px solid #e5e7eb' }} />
      );
      continue;
    }

    // Unordered list items (- or * or •)
    const ulMatch = line.match(/^\s*[-*•]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(
        <li key={key++} style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '2px', color: '#374151' }}>
          {formatInline(ulMatch[1])}
        </li>
      );
      continue;
    }

    // Ordered list items (1. 2. etc)
    const olMatch = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(
        <li key={key++} style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '2px', color: '#374151' }}>
          {formatInline(olMatch[1])}
        </li>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={key++} style={{ height: '6px' }} />);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <div key={key++} style={{ fontSize: '13px', lineHeight: '1.5', color: '#374151', marginBottom: '2px' }}>
        {formatInline(line)}
      </div>
    );
  }

  flushList();
  return elements;
}

// Format inline markdown: **bold**, *italic*, `code`, ~~strike~~
function formatInline(text) {
  if (!text) return text;

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Code: `text`
    let match = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{formatBoldItalic(match[1])}</span>);
      parts.push(
        <code key={key++} style={{
          backgroundColor: '#f3f4f6', padding: '1px 5px', borderRadius: '4px',
          fontSize: '12px', fontFamily: 'monospace', color: '#dc2626',
        }}>
          {match[2]}
        </code>
      );
      remaining = match[3];
      continue;
    }

    // No more inline matches
    parts.push(<span key={key++}>{formatBoldItalic(remaining)}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : parts;
}

function formatBoldItalic(text) {
  if (!text) return text;

  // Bold+Italic: ***text*** or ___text___
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '⟨bi⟩$1⟨/bi⟩');
  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '⟨b⟩$1⟨/b⟩');
  text = text.replace(/__(.+?)__/g, '⟨b⟩$1⟨/b⟩');
  // Italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '⟨i⟩$1⟨/i⟩');
  text = text.replace(/_(.+?)_/g, '⟨i⟩$1⟨/i⟩');

  // Split by our markers and rebuild
  const parts = text.split(/(⟨\/?(?:b|i|bi)⟩)/);
  const result = [];
  let bold = false, italic = false, boldItalic = false;
  let key = 0;

  for (const part of parts) {
    if (part === '⟨b⟩') { bold = true; continue; }
    if (part === '⟨/b⟩') { bold = false; continue; }
    if (part === '⟨i⟩') { italic = true; continue; }
    if (part === '⟨/i⟩') { italic = false; continue; }
    if (part === '⟨bi⟩') { boldItalic = true; continue; }
    if (part === '⟨/bi⟩') { boldItalic = false; continue; }
    if (!part) continue;

    if (boldItalic) {
      result.push(<strong key={key++}><em>{part}</em></strong>);
    } else if (bold) {
      result.push(<strong key={key++} style={{ fontWeight: '600', color: '#111827' }}>{part}</strong>);
    } else if (italic) {
      result.push(<em key={key++}>{part}</em>);
    } else {
      result.push(part);
    }
  }

  return result.length === 1 ? result[0] : result;
}

// ─── Message Bubble ─────────────────────────────────────────────────
function MessageBubble({ message }) {
  if (message.sender === 'user') {
    return (
      <div style={{
        padding: '10px 14px',
        borderRadius: '16px 16px 4px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: '13px',
        lineHeight: '1.5',
        wordWrap: 'break-word',
      }}>
        {message.text}
      </div>
    );
  }

  // Bot message
  const bgColor = message.isError ? '#fef2f2'
    : message.isWelcome ? '#f0fdf4'
    : '#ffffff';
  const borderColor = message.isError ? '#fecaca'
    : message.isWelcome ? '#bbf7d0'
    : '#e5e7eb';

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '4px 16px 16px 16px',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      wordWrap: 'break-word',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {message.isError ? (
        <div style={{ fontSize: '13px', color: '#dc2626', lineHeight: '1.5' }}>{message.text}</div>
      ) : message.isWelcome ? (
        <div style={{ fontSize: '13px', color: '#15803d', lineHeight: '1.5' }}>{message.text}</div>
      ) : (
        <div>{renderMarkdown(message.text)}</div>
      )}
    </div>
  );
}

// ─── DineBot Component ──────────────────────────────────────────────
const DineBot = ({ restaurantId, isOpen, onClose, context = {}, suggestions = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm DineBot, your restaurant assistant. Ask me anything about orders, customers, revenue, tables, or how to use any feature — I can guide you step by step!",
      sender: 'bot',
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [botStatus, setBotStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadBotStatus = useCallback(async () => {
    try {
      const response = await apiClient.getDineBotStatus(restaurantId);
      if (response.success) {
        setBotStatus(response);
      }
    } catch (error) {
      console.error('Failed to load bot status:', error);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (isOpen && restaurantId) {
      loadBotStatus();
    }
  }, [isOpen, restaurantId, loadBotStatus]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !restaurantId) return;

    const token = apiClient.getToken();
    if (!token) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "You need to be logged in to use DineBot. Please refresh the page and log in again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiClient.queryDineBot(inputText, restaurantId, context);

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.response,
          sender: 'bot',
          timestamp: new Date(),
          data: response.data,
          functionCalled: response.functionCalled,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error || 'Failed to process query');
      }
    } catch (error) {
      if (error.message?.includes('Session expired') || error.message?.includes('deactivated')) {
        return;
      }
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I couldn't process your request. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Use dynamic suggestions from backend, fall back to defaults
  const activeSuggestions = suggestions.length > 0 ? suggestions : [
    { text: "How many orders today?", icon: "📊" },
    { text: "What's our revenue today?", icon: "💰" },
    { text: "Show me popular items", icon: "🔥" },
    { text: "How do I set up my menu?", icon: "🍽️" },
    { text: "Help me connect a printer", icon: "🖨️" },
    { text: "Table status", icon: "🪑" },
  ];

  const handleQuickQuery = (query) => {
    setInputText(query);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: isMobile ? '0' : '70px',
      right: isMobile ? '0' : '16px',
      bottom: isMobile ? '0' : '16px',
      left: isMobile ? '0' : 'auto',
      width: isMobile ? '100%' : '400px',
      backgroundColor: 'white',
      borderRadius: isMobile ? '0' : '16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: isMobile ? 'none' : '1px solid #e5e7eb',
      overflow: 'hidden',
      animation: 'dinebotSlideIn 0.25s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaRobot size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>DineBot</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>
              {botStatus?.restaurant?.name || 'Restaurant Assistant'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaTimes size={16} />
        </button>
      </div>

      {/* Suggestions — shown on first open AND persistently */}
      {activeSuggestions.length > 0 && messages.length <= 3 && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {messages.length === 1 ? 'Suggestions' : 'Try asking'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {activeSuggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(suggestion.text || suggestion)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {suggestion.icon && <span style={{ fontSize: '12px' }}>{suggestion.icon}</span>}
                {suggestion.text || suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: '#f9fafb'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%'
            }}
          >
            <MessageBubble message={message} />
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '3px',
              textAlign: message.sender === 'user' ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {message.confidence && (
                <span style={{
                  backgroundColor: message.confidence > 0.8 ? '#10b981' : '#f59e0b',
                  color: 'white',
                  padding: '1px 5px',
                  borderRadius: '6px',
                  fontSize: '9px'
                }}>
                  {Math.round(message.confidence * 100)}%
                </span>
              )}
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            maxWidth: '88%',
          }}>
            <div style={{
              padding: '14px 16px',
              borderRadius: '4px 16px 16px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'dinebotPulse 1.4s ease-in-out infinite' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'dinebotPulse 1.4s ease-in-out 0.2s infinite' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'dinebotPulse 1.4s ease-in-out 0.4s infinite' }} />
                </div>
                Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 14px',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '13px',
            outline: 'none',
            backgroundColor: '#f9fafb',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#fca5a5';
            e.target.style.backgroundColor = '#fff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.backgroundColor = '#f9fafb';
          }}
          disabled={isLoading}
        />
        <button
          onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
          disabled={isLoading}
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: isListening ? '#dc2626' : '#f3f4f6',
            color: isListening ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isLoading ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          {isListening ? <FaStop size={13} /> : <FaMicrophone size={13} />}
        </button>
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!inputText.trim() || isLoading) ? 0.4 : 1,
            flexShrink: 0,
          }}
        >
          <FaPaperPlane size={13} />
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes dinebotSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes dinebotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DineBot;
