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
  const [sidebarOffset, setSidebarOffset] = useState('0px');
  const pathname = usePathname();

  // Clear loading when route finishes navigating
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Track sidebar width for overlay positioning
  useEffect(() => {
    const updateOffset = () => {
      const isMobile = window.innerWidth < 768;
      const isDash = pathname === '/dashboard' || pathname === '/dashboard/bar';
      if (isMobile || isDash) {
        setSidebarOffset('0px');
      } else {
        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        setSidebarOffset(collapsed ? '70px' : '240px');
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    window.addEventListener('sidebarToggle', updateOffset);
    return () => {
      window.removeEventListener('resize', updateOffset);
      window.removeEventListener('sidebarToggle', updateOffset);
    };
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
      {/* Loading Overlay - only covers main content area, never the sidebar */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: loadingType === 'full' ? '0px' : sidebarOffset,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          zIndex: loadingType === 'full' ? 9999 : 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          transition: 'left 0.3s ease',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#6b7280',
            margin: 0
          }}>
            {loadingMessage}
          </p>
        </div>
      )}
    </LoadingContext.Provider>
  );
};
