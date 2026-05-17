'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell, FaVolumeUp, FaVolumeMute, FaCheck, FaTrash, FaShoppingBag, FaUtensils, FaTruck, FaStore } from 'react-icons/fa';

const orderTypeConfig = {
  'dine-in': { icon: FaUtensils, label: 'Dine-in', color: '#3b82f6' },
  'takeaway': { icon: FaShoppingBag, label: 'Takeaway', color: '#f59e0b' },
  'delivery': { icon: FaTruck, label: 'Delivery', color: '#22c55e' },
  'online': { icon: FaStore, label: 'Online', color: '#8b5cf6' },
};

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function OrderNotificationBell({
  notifications = [],
  unreadCount = 0,
  soundEnabled = true,
  onMarkAsRead,
  onMarkAllRead,
  onClearAll,
  onToggleSound,
  hideButton = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Allow external toggle via CustomEvent (from page-level bell icons)
  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleNotificationBell', handler);
    return () => window.removeEventListener('toggleNotificationBell', handler);
  }, []);

  // Listen for toggle event from dashboard Alerts bell
  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleOrderNotificationBell', handler);
    return () => window.removeEventListener('toggleOrderNotificationBell', handler);
  }, []);

  const handleNotificationClick = (notification) => {
    onMarkAsRead?.(notification.id);
    setIsOpen(false);
    router.push('/orders');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? '#fef2f2' : 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          width: '40px',
          height: '40px',
          display: hideButton ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          transition: 'all 0.2s',
        }}
      >
        <FaBell size={16} color={unreadCount > 0 ? '#ef4444' : '#6b7280'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: '700',
            borderRadius: '10px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid white',
            animation: 'bellPulse 2s infinite',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: '0',
          width: '360px',
          maxHeight: '480px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
              Notifications {unreadCount > 0 && <span style={{ color: '#ef4444' }}>({unreadCount})</span>}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={onToggleSound}
                title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: soundEnabled ? '#22c55e' : '#9ca3af', padding: '4px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {soundEnabled ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#3b82f6', fontSize: '12px', fontWeight: '600', padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  <FaCheck size={10} style={{ marginRight: '4px' }} />Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  title="Clear all"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: '4px', display: 'flex', alignItems: 'center',
                  }}
                >
                  <FaTrash size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '13px',
              }}>
                <FaBell size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                <div>No notifications yet</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>New orders will appear here</div>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => {
                const config = orderTypeConfig[notif.orderType] || orderTypeConfig['dine-in'];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f9fafb',
                      cursor: 'pointer',
                      background: notif.read ? 'white' : '#fef2f2',
                      transition: 'background 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'white' : '#fef2f2'}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: `${config.color}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={14} color={config.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: notif.read ? '500' : '600', color: '#111' }}>
                        Order #{notif.dailyOrderId || '—'}
                        <span style={{
                          marginLeft: '6px', fontSize: '10px', fontWeight: '500',
                          color: config.color, background: `${config.color}15`,
                          padding: '2px 6px', borderRadius: '4px',
                        }}>
                          {config.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        {notif.customerName && `${notif.customerName} • `}
                        {notif.itemsCount > 0 && `${notif.itemsCount} items`}
                        {notif.tableNumber && ` • Table ${notif.tableNumber}`}
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {timeAgo(notif.timestamp)}
                    </div>
                    {!notif.read && (
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#ef4444', flexShrink: 0,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
