'use client';

import { useState, useEffect, useRef } from 'react';
import { useDineAICheapVoice } from '../../hooks/useDineAICheapVoice';

/**
 * DineAI Cheap Voice Modal
 * Cost-effective voice assistant UI
 * Full voice-to-voice experience at 95% lower cost!
 */
const DineAICheapVoiceModal = ({ isOpen, onClose }) => {
  const {
    isActive,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    interimTranscript,
    messages,
    error,
    audioLevel,
    start,
    stop,
    sendTextMessage,
    clearMessages,
    setError
  } = useDineAICheapVoice();

  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start voice when modal opens
  useEffect(() => {
    if (isOpen && !isActive) {
      start();
    }
  }, [isOpen]);

  // Handle close
  const handleClose = () => {
    stop();
    onClose();
  };

  // Handle text input submit
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  // Get status text
  const getStatusText = () => {
    if (isSpeaking) return 'Speaking...';
    if (isProcessing) return 'Thinking...';
    if (isListening) return 'Listening... speak now';
    return 'Starting...';
  };

  // Get status color
  const getStatusColor = () => {
    if (isSpeaking) return 'text-blue-400';
    if (isProcessing) return 'text-yellow-400';
    if (isListening) return 'text-green-400';
    return 'text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
              {isActive && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">DineAI Voice</h2>
              <p className="text-xs text-gray-400">Cost-effective mode</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className="h-80 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-md'
                    : 'bg-gray-700 text-gray-100 rounded-bl-md'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.functionCalled && (
                  <p className="text-xs mt-1 opacity-70">
                    ✓ {message.functionCalled.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Interim transcript (what user is currently saying) */}
          {interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-red-600/50 text-white/70 rounded-br-md">
                <p className="text-sm italic">{interimTranscript}...</p>
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-100 rounded-bl-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-2 bg-red-900/50 border-t border-red-800">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Voice visualization & status */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/50">
          {/* Audio level visualization */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-1 h-12">
              {[...Array(20)].map((_, i) => {
                const barHeight = isListening
                  ? Math.max(0.2, Math.min(1, audioLevel * 2 + Math.random() * 0.3))
                  : 0.2;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isListening ? 'bg-green-500' : isSpeaking ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                    style={{
                      height: `${barHeight * 48}px`,
                      opacity: isActive ? 1 : 0.3
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-4">
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {isListening && (
              <p className="text-xs text-gray-500 mt-1">
                Say "stop" or "close" to end conversation
              </p>
            )}
          </div>

          {/* Text input for hybrid mode */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a message..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>

        {/* Footer with stop button */}
        <div className="px-6 py-3 border-t border-gray-700 bg-gray-900">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DineAICheapVoiceModal;
