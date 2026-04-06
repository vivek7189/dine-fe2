'use client';

import { useState } from 'react';
import { FaTimes, FaCheckCircle, FaQrcode, FaMobileAlt, FaCopy, FaCheck } from 'react-icons/fa';

const UpiPaymentModal = ({
  isOpen,
  onClose,
  amount,
  restaurantName,
  upiId,
  upiQrCodeUrl,
  upiDisplayName,
  formatCurrency,
  orderId,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const displayName = upiDisplayName || restaurantName || 'Restaurant';
  const formattedAmount = formatCurrency ? formatCurrency(amount) : `₹${amount}`;

  // Build UPI deep link
  const upiDeepLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(displayName)}&am=${amount}&cu=INR${orderId ? `&tn=Order%20${orderId}` : ''}`
    : null;

  const handleCopyUpi = () => {
    if (upiId) {
      navigator.clipboard.writeText(upiId).catch(() => {});
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FaCheckCircle style={{ color: '#16a34a', fontSize: '20px' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                Order Placed!
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Complete payment below
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Amount */}
        <div style={{
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Amount to Pay</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#111827' }}>
            {formattedAmount}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            to {displayName}
          </p>
        </div>

        {/* QR Code */}
        {upiQrCodeUrl && (
          <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FaQrcode style={{ color: '#6366f1' }} />
              Scan QR Code to Pay
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
            }}>
              <img
                src={upiQrCodeUrl}
                alt="UPI QR Code"
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              Open any UPI app and scan this code
            </p>
          </div>
        )}

        {/* UPI ID Copy */}
        {upiId && (
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>Or pay to UPI ID:</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            }}>
              <span style={{
                flex: 1,
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                fontFamily: 'monospace',
              }}>
                {upiId}
              </span>
              <button
                onClick={handleCopyUpi}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: copiedUpi ? '#16a34a' : '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {copiedUpi ? <><FaCheck size={12} /> Copied</> : <><FaCopy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* Pay via UPI App Button */}
        {upiDeepLink && (
          <div style={{ padding: '16px 20px' }}>
            <a
              href={upiDeepLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <FaMobileAlt size={18} />
              Pay {formattedAmount} via UPI App
            </a>
          </div>
        )}

        {/* Dismiss */}
        <div style={{
          padding: '0 20px 20px',
          display: 'flex',
          gap: '10px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Pay Later
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Already Paid
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UpiPaymentModal;
