'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRedo, FaTimes } from 'react-icons/fa';
import { ECR_STATUS } from '../services/ecr/ecrConstants';

const STATUS_CONFIG = {
  [ECR_STATUS.CONNECTING]: {
    icon: FaSpinner,
    iconColor: '#6366f1',
    spin: true,
    title: 'Connecting to Terminal',
    subtitle: 'Establishing connection...',
    bgGradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
  },
  [ECR_STATUS.WAITING_FOR_CARD]: {
    icon: FaCreditCard,
    iconColor: '#3b82f6',
    pulse: true,
    title: 'Present Card on Terminal',
    subtitle: 'Tap, insert, or swipe card on the payment terminal',
    bgGradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
  },
  [ECR_STATUS.PROCESSING]: {
    icon: FaSpinner,
    iconColor: '#f59e0b',
    spin: true,
    title: 'Processing Payment',
    subtitle: 'Please wait while the transaction is being processed...',
    bgGradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  },
  [ECR_STATUS.POLLING]: {
    icon: FaSpinner,
    iconColor: '#8b5cf6',
    spin: true,
    title: 'Waiting for Terminal',
    subtitle: 'Payment sent to terminal. Waiting for confirmation...',
    bgGradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
  },
  [ECR_STATUS.APPROVED]: {
    icon: FaCheckCircle,
    iconColor: '#10b981',
    title: 'Payment Approved',
    subtitle: 'Transaction completed successfully',
    bgGradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
  },
  [ECR_STATUS.DECLINED]: {
    icon: FaTimesCircle,
    iconColor: '#ef4444',
    title: 'Payment Declined',
    bgGradient: 'linear-gradient(135deg, #fef2f2, #fecaca)',
  },
  [ECR_STATUS.ERROR]: {
    icon: FaExclamationTriangle,
    iconColor: '#ef4444',
    title: 'Terminal Error',
    bgGradient: 'linear-gradient(135deg, #fef2f2, #fecaca)',
  },
  [ECR_STATUS.TIMEOUT]: {
    icon: FaExclamationTriangle,
    iconColor: '#f59e0b',
    title: 'Terminal Timeout',
    subtitle: 'The terminal did not respond. Check if it is powered on and connected.',
    bgGradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  },
};

/**
 * Full-screen modal overlay shown during ECR payment terminal transactions.
 * Displays current status with animations and response details.
 *
 * @param {{ status: string, error?: string, lastResponse?: object, onCancel: () => void, onRetry?: () => void, onDismiss?: () => void }} props
 */
export default function EcrStatusModal({ status, error, lastResponse, onCancel, onRetry, onDismiss }) {
  const autoDismissRef = useRef(null);

  // Auto-dismiss on APPROVED after 3 seconds
  useEffect(() => {
    if (status === ECR_STATUS.APPROVED && onDismiss) {
      autoDismissRef.current = setTimeout(onDismiss, 3000);
      return () => clearTimeout(autoDismissRef.current);
    }
  }, [status, onDismiss]);

  if (status === ECR_STATUS.IDLE) return null;

  const config = STATUS_CONFIG[status] || STATUS_CONFIG[ECR_STATUS.ERROR];
  const Icon = config.icon;

  const isTerminal = status === ECR_STATUS.APPROVED || status === ECR_STATUS.DECLINED || status === ECR_STATUS.ERROR || status === ECR_STATUS.TIMEOUT;
  const showCancel = status === ECR_STATUS.WAITING_FOR_CARD || status === ECR_STATUS.CONNECTING || status === ECR_STATUS.PROCESSING || status === ECR_STATUS.POLLING;
  const showRetry = (status === ECR_STATUS.DECLINED || status === ECR_STATUS.ERROR || status === ECR_STATUS.TIMEOUT) && onRetry;

  const modal = (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 36px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: config.bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Icon
            size={36}
            color={config.iconColor}
            style={{
              ...(config.spin ? { animation: 'spin 1s linear infinite' } : {}),
              ...(config.pulse ? { animation: 'ecrPulse 1.5s ease-in-out infinite' } : {}),
            }}
          />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 8px',
        }}>
          {config.title}
        </h3>

        {/* Subtitle / Error */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 20px',
          lineHeight: '1.5',
        }}>
          {error || config.subtitle || ''}
        </p>

        {/* Card details on APPROVED */}
        {status === ECR_STATUS.APPROVED && lastResponse && (
          <div style={{
            background: '#f0fdf4',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px',
            textAlign: 'left',
            fontSize: '13px',
            color: '#374151',
          }}>
            {lastResponse.CardType && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>Card</span>
                <span style={{ fontWeight: 600 }}>{lastResponse.CardType} {lastResponse.CardNumber || ''}</span>
              </div>
            )}
            {lastResponse.ApprovalCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>Approval Code</span>
                <span style={{ fontWeight: 600 }}>{lastResponse.ApprovalCode}</span>
              </div>
            )}
            {lastResponse.RRN && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>RRN</span>
                <span style={{ fontWeight: 600 }}>{lastResponse.RRN}</span>
              </div>
            )}
            {lastResponse.Amount && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Amount</span>
                <span style={{ fontWeight: 600 }}>{lastResponse.Amount}</span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {showCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '10px 24px',
                background: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FaTimes size={12} /> Cancel
            </button>
          )}

          {showRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FaRedo size={12} /> Retry
            </button>
          )}

          {isTerminal && (
            <button
              onClick={onDismiss || onCancel}
              style={{
                padding: '10px 24px',
                background: status === ECR_STATUS.APPROVED
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {status === ECR_STATUS.APPROVED ? 'Done' : 'Close'}
            </button>
          )}
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes ecrPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
