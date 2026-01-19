'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner, FaTimes, FaLightbulb, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import apiClient from '../lib/api';

const IntelligentChatbot = ({ 
  restaurantId, 
  userId: propUserId,
  // UI Action Callbacks
  onAddToCart,
  onPlaceOrder,
  onClearCart,
  onSearchOrder,
  onSearchMenu,
  cart = [],
  menuItems = []
}) => {
  // Get userId from prop or extract from localStorage/token
  const getUserId = () => {
    if (propUserId) return propUserId;
    
    // Try to get from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.userId || user.uid || null;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    
    return null;
  };
  
  const userId = getUserId();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🤖 IntelligentChatbot mounted:', { restaurantId, userId, hasCallbacks: !!onAddToCart });
  }, [restaurantId, userId]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => sendMessage(transcript), 500);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/chatbot/suggestions/${restaurantId}`);
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadSuggestions();
  }, [restaurantId, loadSuggestions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const executeUIAction = async (intent, parameters) => {
    try {
      switch (intent) {
        case 'add_to_cart':
          if (parameters.items && parameters.items.length > 0) {
            parameters.items.forEach(item => {
              // Find menu item by ID or name
              const menuItem = menuItems.find(mi => 
                mi.id === item.id || 
                mi.name.toLowerCase() === item.name?.toLowerCase()
              );
              
              if (menuItem) {
                for (let i = 0; i < (item.quantity || 1); i++) {
                  onAddToCart(menuItem);
                }
              }
            });
            return { success: true, message: `Added ${parameters.items.length} item(s) to cart` };
          }
          break;

        case 'place_order':
          if (cart.length > 0) {
            // Use existing place order function
            await onPlaceOrder();
            return { success: true, message: 'Order placed successfully!' };
          } else {
            return { success: false, message: 'Cart is empty. Add items first.' };
          }
          break;

        case 'clear_cart':
          onClearCart();
          return { success: true, message: 'Cart cleared' };
          break;

        case 'search_order':
          if (parameters.orderId) {
            await onSearchOrder(parameters.orderId);
            return { success: true, message: `Searching for order ${parameters.orderId}...` };
          }
          break;

        case 'search_menu':
          if (parameters.search) {
            onSearchMenu(parameters.search);
            return { success: true, message: `Searching menu for "${parameters.search}"...` };
          }
          break;

        default:
          return { success: false, message: 'Action not implemented' };
      }
    } catch (error) {
      console.error('UI action error:', error);
      return { success: false, message: error.message || 'Failed to execute action' };
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context - include previous data for follow-up queries
      const context = {
        ...conversationContext,
        cartItemCount: cart.length,
        hasCart: cart.length > 0,
        previousData: conversationContext.previousData || null // Include previous data for follow-ups
      };

      if (!userId) {
        console.error('No user ID available for chatbot');
        throw new Error('User authentication required');
      }
      
      console.log('🤖 IntelligentChatbot: Sending query to intelligent-query endpoint:', message);
      const response = await apiClient.intelligentChatbotQuery(message, restaurantId, userId, context);
      console.log('🤖 IntelligentChatbot: Received response:', response);

      if (response.success) {
        let botResponse = response.response;
        let actionExecuted = false;

        // Handle function call results (from function calling agent)
        if (response.functionCalled) {
          console.log('🔧 Function was called:', response.functionCalled);
          
          // Execute UI actions for specific functions
          if (response.functionCalled === 'add_to_cart' && response.functionResult?.items) {
            const actionResult = await executeUIAction('add_to_cart', { items: response.functionResult.items });
            if (actionResult.success) {
              actionExecuted = true;
            }
          } else if (response.functionCalled === 'place_order' && response.functionResult?.order) {
            const actionResult = await executeUIAction('place_order', { 
              order: response.functionResult.order,
              items: response.functionResult.order.items || []
            });
            if (actionResult.success) {
              actionExecuted = true;
              // Clear cart after successful order
              if (onClearCart) {
                onClearCart();
              }
            }
          }
        }

        // Legacy execution handling (for backward compatibility)
        if (response.execution && response.execution.type === 'ui_action') {
          const actionResult = await executeUIAction(response.intent, response.parameters);
          if (actionResult.success) {
            botResponse = actionResult.message;
            actionExecuted = true;
          } else {
            botResponse = actionResult.message;
          }
        } else if (response.apiConfig && !response.apiConfig.isUIAction) {
          // For API calls, we could execute them here if needed
          // For now, just show the response
        }

        // Handle follow-up questions
        if (response.requiresFollowUp) {
          botResponse = response.response;
          setConversationContext(prev => ({
            ...prev,
            pendingIntent: response.intent,
            pendingParams: response.parameters
          }));
        }
        // Don't clear context here - let the logic below handle it based on hasData

        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: botResponse,
          intent: response.intent,
          execution: response.execution,
          actionExecuted,
          requiresFollowUp: response.requiresFollowUp,
          requiresConfirmation: response.requiresConfirmation,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        // Update conversation context with data for follow-up queries
        // Function calling agent handles context automatically via conversation history
        if (response.hasData && response.data) {
          console.log('💾 Storing data in context for follow-up queries');
          setConversationContext(prev => ({
            ...prev,
            previousData: response.data,
            functionCalled: response.functionCalled,
            lastQuery: message
          }));
        }

        // If requires confirmation, wait for user response
        if (response.requiresConfirmation) {
          setConversationContext(prev => ({
            ...prev,
            pendingIntent: response.intent,
            pendingParams: response.parameters,
            requiresConfirmation: true
          }));
        }
      } else {
        throw new Error(response.error || 'Failed to process message');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.response?.data?.response || error.message || 'Sorry, I encountered an error. Please try again.',
        error: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationContext({});
  };

  return (
    <>
      {/* Chatbot Toggle Button - Commented out to hide icon */}
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#e53e3e',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(229, 62, 62, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.3)';
        }}
      >
        <FaRobot size={24} />
      </button> */}

      {/* Chatbot Interface */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '20px',
          width: '380px',
          maxWidth: 'calc(100vw - 40px)',
          height: '600px',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          border: '1px solid #e5e7eb'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
            borderRadius: '16px 16px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaRobot size={16} color="#e53e3e" />
              <span style={{ fontWeight: '600', color: '#1f2937' }}>AI Assistant</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  background: isListening ? '#ef4444' : 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: isListening ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <FaMicrophoneSlash size={14} /> : <FaMicrophone size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px',
                marginTop: '20px'
              }}>
                <FaRobot size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p>Hi! I&apos;m your AI assistant. I can help you:</p>
                <ul style={{ textAlign: 'left', marginTop: '12px', paddingLeft: '20px' }}>
                  <li>Add items to cart</li>
                  <li>Place orders</li>
                  <li>Search orders</li>
                  <li>Manage tables</li>
                  <li>And much more!</li>
                </ul>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '8px'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: message.type === 'user' ? '#e53e3e' : message.actionExecuted ? '#d1fae5' : '#f3f4f6',
                    color: message.type === 'user' ? 'white' : '#1f2937',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    border: message.actionExecuted ? '1px solid #10b981' : 'none'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {message.content.split('\n').map((line, idx) => {
                      // Simple markdown parsing for bold (**text**)
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <span key={idx}>
                          {parts.map((part, pIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={pIdx} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={pIdx}>{part}</span>;
                          })}
                          {idx < message.content.split('\n').length - 1 && <br />}
                        </span>
                      );
                    })}
                  </div>
                  
                  {message.actionExecuted && (
                    <div style={{
                      fontSize: '11px',
                      marginTop: '6px',
                      opacity: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>✓ Action completed</span>
                    </div>
                  )}

                  {message.intent && (
                    <div style={{
                      fontSize: '10px',
                      opacity: 0.7,
                      marginTop: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {message.intent.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#f3f4f6',
                borderRadius: '16px 16px 16px 4px',
                maxWidth: '120px'
              }}>
                <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 0 && suggestions.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                <FaLightbulb size={12} />
                Quick suggestions:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            borderRadius: '0 0 16px 16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or speak your command..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: 'white',
                  minHeight: '40px',
                  maxHeight: '100px',
                  fontFamily: 'inherit'
                }}
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  padding: '10px',
                  backgroundColor: inputMessage.trim() && !isLoading ? '#e53e3e' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? (
                  <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <FaPaperPlane size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default IntelligentChatbot;

