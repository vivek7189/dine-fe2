'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingType, setLoadingType] = useState('content'); // 'full' or 'content'
  const pathname = usePathname();

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true);
      setLoadingMessage('Loading...');
      
      // Simulate loading time for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // 300ms for smooth transition

      return () => clearTimeout(timer);
    };

    // Set loading to false when pathname changes (page loaded)
    setIsLoading(false);
  }, [pathname]);

  const startLoading = (message = 'Loading...', type = 'content') => {
    setLoadingMessage(message);
    setLoadingType(type);
    setIsLoading(true);

    // Safety timeout: auto-clear loading after 5 seconds to prevent stuck states
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const value = {
    isLoading,
    loadingMessage,
    loadingType,
    startLoading,
    stopLoading,
    setLoadingMessage
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {/* Loading Overlay - Content only by default, full page when specified */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: loadingType === 'full' ? 0 : '64px', // Start below navigation for content loading
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: loadingType === 'full' ? 9999 : 9998, // Higher z-index for full page
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            {loadingMessage}
          </p>
        </div>
      )}
    </LoadingContext.Provider>
  );
};
