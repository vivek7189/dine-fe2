import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMicrophone, FaStop } from 'react-icons/fa';
import apiClient from '../lib/api';

const DineBot = ({ restaurantId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm DineBot, your intelligent restaurant assistant! 🤖 Ask me anything about your restaurant - orders, customers, revenue, tables, or any other data!",
      sender: 'bot',
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [botStatus, setBotStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

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

    // Check if user is authenticated (use apiClient which checks both cookies and localStorage)
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
      const response = await apiClient.queryDineBot(inputText, restaurantId);

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
      // Don't show auth errors — the apiClient handles 401 redirect
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

  const quickQueries = [
    "How many orders today?",
    "What's our revenue today?",
    "Show me popular items",
    "How many customers today?",
    "Table status",
    "Restaurant hours"
  ];

  const handleQuickQuery = (query) => {
    setInputText(query);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '420px',
      height: '650px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      animation: 'dinebotSlideIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaRobot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px' }}>DineBot</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
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

      {/* Quick Queries */}
      {messages.length === 1 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
            Quick Queries:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(query)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '16px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.color = 'white';
                  e.target.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#374151';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#fafafa'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: message.sender === 'user' 
                ? '#ef4444' 
                : message.isError 
                  ? '#fef2f2'
                  : message.isWelcome
                    ? '#ecfdf5'
                    : '#ffffff',
              color: message.sender === 'user' 
                ? 'white' 
                : message.isError
                  ? '#dc2626'
                  : '#374151',
              fontSize: '14px',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              border: message.isError ? '1px solid #fecaca' : 'none',
              boxShadow: message.sender === 'bot' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}>
              {message.text}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
              textAlign: message.sender === 'user' ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {message.confidence && (
                <span style={{
                  backgroundColor: message.confidence > 0.8 ? '#10b981' : '#f59e0b',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px'
                }}>
                  {Math.round(message.confidence * 100)}%
                </span>
              )}
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: '18px',
            backgroundColor: '#ffffff',
            color: '#6b7280',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid #6b7280',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              DineBot is thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about orders, customers, revenue, tables..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'none'
            }}
            disabled={isLoading}
          />
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            Try: &quot;How many orders today?&quot; or &quot;What&apos;s our revenue?&quot;
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            disabled={isLoading}
            style={{
              padding: '12px',
              backgroundColor: isListening ? '#dc2626' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isListening ? <FaStop size={14} /> : <FaMicrophone size={14} />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              padding: '12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (!inputText.trim() || isLoading) ? 0.5 : 1
            }}
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DineBot;







