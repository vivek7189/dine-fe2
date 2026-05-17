'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingBag, FaUtensils, FaTruck, FaStore, FaTimes } from 'react-icons/fa';

const orderTypeConfig = {
  'dine-in': { icon: FaUtensils, label: 'Dine-in', color: '#3b82f6', bg: '#eff6ff' },
  'takeaway': { icon: FaShoppingBag, label: 'Takeaway', color: '#f59e0b', bg: '#fffbeb' },
  'delivery': { icon: FaTruck, label: 'Delivery', color: '#22c55e', bg: '#f0fdf4' },
  'online': { icon: FaStore, label: 'Online', color: '#8b5cf6', bg: '#f5f3ff' },
};

function ToastItem({ notification, onDismiss, index }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const config = orderTypeConfig[notification.orderType] || orderTypeConfig['online'];
  const Icon = config.icon;

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleClick = () => {
    router.push('/orders');
    onDismiss(notification.id);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(() => onDismiss(notification.id), 250);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: '8px',
        cursor: 'pointer',
        width: '320px',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${config.color}30`,
        borderLeft: `4px solid ${config.color}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: config.bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={16} color={config.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>
            New {config.label} Order #{notification.dailyOrderId || '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {notification.customerName && `${notification.customerName} • `}
            {notification.itemsCount > 0 ? `${notification.itemsCount} items` : 'View details'}
            {notification.tableNumber && ` • Table ${notification.tableNumber}`}
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: '4px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}

export default function OrderNotificationToast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 10001,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            notification={toast}
            onDismiss={onDismiss}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
