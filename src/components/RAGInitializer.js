'use client';

import { useState } from 'react';
import { FaRobot, FaCog, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../lib/api';

const RAGInitializer = ({ restaurantId, onInitialized }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const initializeRAG = async () => {
    if (!restaurantId) {
      setStatus({ type: 'error', message: 'Restaurant ID is required' });
      return;
    }

    setIsInitializing(true);
    setStatus(null);

    try {
      console.log(`🔄 Initializing RAG knowledge for restaurant ${restaurantId}`);
      
      const response = await apiClient.post('/api/chatbot/init-rag', {
        restaurantId
      });

      if (response.success) {
        setStatus({ 
          type: 'success', 
          message: 'RAG knowledge initialized successfully! The chatbot is now ready to help with intelligent responses.' 
        });
        if (onInitialized) {
          onInitialized();
        }
      } else {
        throw new Error(response.error || 'Failed to initialize RAG knowledge');
      }
    } catch (error) {
      console.error('RAG initialization error:', error);
      
      // Handle specific error cases
      let errorMessage = error.message;
      if (errorMessage.includes('Restaurant not found')) {
        errorMessage = 'Restaurant not found. Please create a restaurant first or select a valid restaurant.';
      } else if (errorMessage.includes('do not have access')) {
        errorMessage = 'You do not have access to this restaurant. Please contact the restaurant owner.';
      } else if (errorMessage.includes('Access denied')) {
        errorMessage = 'Access denied. Please ensure you have permission to access this restaurant.';
      }
      
      setStatus({ 
        type: 'error', 
        message: `Failed to initialize RAG knowledge: ${errorMessage}` 
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const updateRAG = async () => {
    if (!restaurantId) {
      setStatus({ type: 'error', message: 'Restaurant ID is required' });
      return;
    }

    setIsInitializing(true);
    setStatus(null);

    try {
      console.log(`🔄 Updating RAG knowledge for restaurant ${restaurantId}`);
      
      const response = await apiClient.post('/api/chatbot/update-rag', {
        restaurantId
      });

      if (response.success) {
        setStatus({ 
          type: 'success', 
          message: 'RAG knowledge updated successfully! The chatbot now has the latest information.' 
        });
        if (onInitialized) {
          onInitialized();
        }
      } else {
        throw new Error(response.error || 'Failed to update RAG knowledge');
      }
    } catch (error) {
      console.error('RAG update error:', error);
      setStatus({ 
        type: 'error', 
        message: `Failed to update RAG knowledge: ${error.message}` 
      });
    } finally {
      setIsInitializing(false);
    }
  };

  if (!isVisible) {
    // RAG Icon Button - Commented out to hide icon
    return null;
    /* return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '90px',
          left: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 999
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }}
        title="Initialize RAG Knowledge"
      >
        <FaCog size={20} />
      </button>
    ); */
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      left: '20px',
      width: '350px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      zIndex: 1000,
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaRobot size={16} color="#3b82f6" />
          <span style={{ fontWeight: '600', color: '#1f2937' }}>RAG Knowledge Setup</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          Initialize the AI chatbot with your restaurant&apos;s knowledge base for intelligent responses.
        </p>

        {/* Status Message */}
        {status && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${status.type === 'success' ? '#22c55e' : '#ef4444'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            {status.type === 'success' ? (
              <FaCheckCircle size={16} color="#22c55e" />
            ) : (
              <FaExclamationTriangle size={16} color="#ef4444" />
            )}
            <span style={{
              fontSize: '13px',
              color: status.type === 'success' ? '#166534' : '#dc2626',
              lineHeight: '1.4'
            }}>
              {status.message}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={initializeRAG}
            disabled={isInitializing}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: isInitializing ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isInitializing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isInitializing ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Initializing...
              </>
            ) : (
              <>
                <FaRobot size={12} />
                Initialize RAG
              </>
            )}
          </button>

          <button
            onClick={updateRAG}
            disabled={isInitializing}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: isInitializing ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isInitializing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isInitializing ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Updating...
              </>
            ) : (
              <>
                <FaCog size={12} />
                Update RAG
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#6b7280',
        lineHeight: '1.4'
      }}>
        <strong>What this does:</strong><br />
        • Analyzes your menu, tables, and restaurant data<br />
        • Creates intelligent knowledge embeddings<br />
        • Enables context-aware chatbot responses<br />
        • Updates automatically when you add new items
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RAGInitializer;
