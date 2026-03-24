'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Notification = ({ message, type = 'info', duration = 5000, onClose, show = true, title }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (show && message) {
      setIsMounted(true);
      // Small delay to trigger CSS transition after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 250);
      return () => clearTimeout(timer);
    }
  }, [show, message]);

  useEffect(() => {
    if (duration > 0 && show && message) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setIsMounted(false);
          onClose?.();
        }, 250);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, show, message]);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
      onClose?.();
    }, 250);
  };

  if (!isMounted) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle size={16} />;
      case 'error':
        return <FaExclamationTriangle size={16} />;
      case 'warning':
        return <FaExclamationTriangle size={16} />;
      default:
        return <FaInfoCircle size={16} />;
    }
  };

  const colorMap = {
    success: { bg: '#0a0a0a', accent: '#22c55e', text: '#fafafa', icon: '#22c55e' },
    error: { bg: '#0a0a0a', accent: '#ef4444', text: '#fafafa', icon: '#ef4444' },
    warning: { bg: '#0a0a0a', accent: '#f59e0b', text: '#fafafa', icon: '#f59e0b' },
    info: { bg: '#0a0a0a', accent: '#3b82f6', text: '#fafafa', icon: '#3b82f6' },
  };

  const colors = colorMap[type] || colorMap.info;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        zIndex: 9999,
        transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, -120%)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
        width: 'max-content',
        maxWidth: 'min(420px, calc(100vw - 32px))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          backgroundColor: colors.bg,
          borderRadius: '8px',
          borderLeft: `3px solid ${colors.accent}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          color: colors.text,
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}
      >
        <div style={{ color: colors.icon, flexShrink: 0, display: 'flex' }}>
          {getIcon()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: message ? '2px' : 0 }}>
              {title}
            </div>
          )}
          {message && (
            <div style={{ opacity: 0.8, fontSize: '12px', fontWeight: 400 }}>
              {message}
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: colors.text,
            opacity: 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
};

// Notification Manager Hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration = 5000) => {
    return addNotification(message, 'success', duration);
  };

  const showError = (message, duration = 7000) => {
    return addNotification(message, 'error', duration);
  };

  const showWarning = (message, duration = 6000) => {
    return addNotification(message, 'warning', duration);
  };

  const showInfo = (message, duration = 5000) => {
    return addNotification(message, 'info', duration);
  };

  const NotificationContainer = () => (
    <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );

  return {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer
  };
};

export default Notification;
