'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm DineBot 👋 Ask me anything about DineOpen — features, pricing, or how we can help your restaurant grow.",
};

const SUGGESTIONS = [
  "What is DineOpen?",
  "Show me pricing",
  "Book a free demo",
  "Compare with Toast/Square",
];

export default function WebsiteChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', phone: '', business: '' });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('dinebot-website-chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages?.length > 0) setMessages(parsed.messages);
        if (parsed.messageCount) setMessageCount(parsed.messageCount);
        if (parsed.leadSubmitted) setLeadSubmitted(parsed.leadSubmitted);
      }
    } catch {}
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('dinebot-website-chat', JSON.stringify({
        messages,
        messageCount,
        leadSubmitted,
      }));
    } catch {}
  }, [messages, messageCount, leadSubmitted]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Only show on public marketing pages (homepage, products, pricing, etc.)
  const [shouldShow, setShouldShow] = useState(false);
  useEffect(() => {
    const path = window.location.pathname;
    const isPublicPage = path === '/' || path.startsWith('/products') ||
      path.startsWith('/pricing') || path.startsWith('/for/') ||
      path.startsWith('/vs/') || path.startsWith('/tools/') ||
      path.startsWith('/features') || path.startsWith('/alternatives') ||
      path.startsWith('/resources') || path.startsWith('/blog');
    setShouldShow(isPublicPage);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg = { role: 'user', content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch(`${API_URL}/api/website-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

        // If contact info detected, auto-submit as lead
        if (data.contactDetected && !leadSubmitted) {
          await submitLead({
            phone: data.contactDetected.phone || '',
            email: data.contactDetected.email || '',
            comment: `Website chatbot lead. Conversation excerpt: ${msg}`,
          });
          setLeadSubmitted(true);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || "Sorry, I'm having trouble right now. Please try again.",
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
    }

    // Show lead form after 3 messages if not submitted
    if (messageCount >= 2 && !leadSubmitted && !showLeadForm) {
      setTimeout(() => setShowLeadForm(true), 1500);
    }
  }, [input, isLoading, messages, messageCount, leadSubmitted, showLeadForm]);

  const submitLead = async (data) => {
    try {
      const contactType = data.phone ? 'phone' : 'email';
      const comment = data.business
        ? `Restaurant: ${data.business}\n${data.comment || 'Website chatbot lead'}`
        : (data.comment || 'Website chatbot lead');

      await fetch(`${API_URL}/api/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactType,
          phone: data.phone || '',
          email: data.email || '',
          comment,
        }),
      });
    } catch {}
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadData.phone && !leadData.name) return;

    await submitLead({
      phone: leadData.phone,
      business: leadData.business,
      comment: `Name: ${leadData.name || 'Not provided'}. Website chatbot lead.`,
    });
    setLeadSubmitted(true);
    setShowLeadForm(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "Thanks! Our team will reach out shortly. Is there anything else I can help you with?",
    }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <FaComments size={22} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[10000] w-[380px] max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-32px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FaComments size={14} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">DineBot</p>
                <p className="text-white/70 text-xs">Online • Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-red-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Lead Capture Form */}
            {showLeadForm && !leadSubmitted && (
              <div className="bg-white border border-red-100 rounded-xl p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-2 font-medium">Want our team to reach out? Drop your details:</p>
                <form onSubmit={handleLeadSubmit} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={leadData.name}
                    onChange={e => setLeadData(d => ({ ...d, name: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-300"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={leadData.phone}
                    onChange={e => setLeadData(d => ({ ...d, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-300"
                  />
                  <input
                    type="text"
                    placeholder="Restaurant/Business name"
                    value={leadData.business}
                    onChange={e => setLeadData(d => ({ ...d, business: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-300"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLeadForm(false)}
                      className="px-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only when few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-full border border-gray-200 hover:border-red-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-2 items-end">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 bg-gray-50"
                maxLength={500}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <FaPaperPlane size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-from-bottom-4 {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: slide-in-from-bottom-4 0.3s ease-out; }
      `}</style>
    </>
  );
}
