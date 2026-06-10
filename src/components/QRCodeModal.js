'use client';

import { useState, useEffect, useRef } from 'react';
import { FaQrcode, FaTimes, FaDownload, FaCopy } from 'react-icons/fa';
import QRCode from 'qrcode';

const QRCodeModal = ({ isOpen, onClose, restaurantId, restaurantName, restaurant = null }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && restaurantId) {
      generateQRCode();
    }
  }, [isOpen, restaurantId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Generate the URL for the restaurant
      let baseUrl;
      if (restaurant?.subdomainEnabled && restaurant?.subdomain) {
        // Use subdomain URL if enabled
        if (process.env.NODE_ENV === 'production') {
          baseUrl = `https://${restaurant.subdomain}.dineopen.com`;
        } else {
          baseUrl = `http://${restaurant.subdomain}.localhost:3002`;
        }
        console.log('🔗 Using subdomain URL for QR code:', baseUrl);
      } else {
        // Use default URL
        baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.dineopen.com';
        console.log('🔗 Using default URL for QR code:', baseUrl);
      }
      
      const qrUrl = `${baseUrl}/placeorder?restaurant=${restaurantId}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      
      // Also generate for canvas (for download)
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrUrl, {
          width: 250,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
      }
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${restaurantName || 'restaurant'}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };
//jhbhj
  const copyQRUrl = () => {
    let baseUrl;
    if (restaurant?.subdomainEnabled && restaurant?.subdomain) {
      // Use subdomain URL if enabled
      if (process.env.NODE_ENV === 'production') {
        baseUrl = `https://${restaurant.subdomain}.dineopen.com`;
      } else {
        baseUrl = `http://${restaurant.subdomain}.localhost:3002`;
      }
    } else {
      // Use default URL
      baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.dineopen.com';
    }
    
    const qrUrl = `${baseUrl}/placeorder?restaurant=${restaurantId}`;
    navigator.clipboard.writeText(qrUrl);
    
    // Show notification
    setShowCopyNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowCopyNotification(false);
    }, 3000);
  };

  if (!isOpen) return null;

  // Generate URL for display
  let baseUrl;
  if (restaurant?.subdomainEnabled && restaurant?.subdomain) {
    // Use subdomain URL if enabled
    if (process.env.NODE_ENV === 'production') {
      baseUrl = `https://${restaurant.subdomain}.dineopen.com`;
    } else {
      baseUrl = `http://${restaurant.subdomain}.localhost:3002`;
    }
  } else {
    // Use default URL
    baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.dineopen.com';
  }
  
  const qrUrl = `${baseUrl}/placeorder?restaurant=${restaurantId}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 10002, // Higher than sidebar (10000)
      padding: '16px 16px 48px 16px',
      overflowY: 'auto',
      minHeight: typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? 'var(--app-height, 100vh)' : '100vh',
      minWidth: '100vw'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '16px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? 'calc(var(--app-height, 90vh) - 8px)' : '90vh',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        position: 'relative',
        marginTop: 'auto',
        marginBottom: '32px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaQrcode size={24} color="#e53e3e" />
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Customer QR Code
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Restaurant Info */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          {/* <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {restaurantName || 'Restaurant'}
          </h3> */}
         
          
        </div>

        {/* QR Code */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {loading ? (
            <div style={{
              width: '250px',
              height: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #e53e3e',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  Generating QR Code...
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {qrCodeDataUrl && (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  style={{
                    width: '250px',
                    height: '250px',
                    display: 'block'
                  }}
                />
              )}
              {/* Hidden canvas for download */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#fef7f0',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            How to use:
          </h4>
          <ol style={{
            fontSize: '13px',
            color: '#6b7280',
            margin: 0,
            paddingLeft: '16px'
          }}>
            <li>Print this QR code and place it on tables</li>
            <li>Customers scan the code with their phone</li>
            <li>They can browse menu and place orders directly</li>
            <li>Orders appear in your kitchen system</li>
          </ol>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={downloadQRCode}
            disabled={loading || !qrCodeDataUrl}
            style={{
              flex: 1,
              background: loading || !qrCodeDataUrl ? '#d1d5db' : '#f3f4f6',
              color: loading || !qrCodeDataUrl ? '#9ca3af' : '#374151',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading || !qrCodeDataUrl ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaDownload size={14} />
            Download
          </button>
          <button
            onClick={copyQRUrl}
            style={{
              flex: 1,
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaCopy size={14} />
            Copy URL
          </button>
        </div>

        {/* Copy Notification */}
        {showCopyNotification && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            zIndex: 10003, // Higher than modal overlay
            animation: 'slideDown 0.3s ease-out'
          }}>
            ✅ URL copied! Share with your customers
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideDown {
            from { 
              opacity: 0;
              transform: translateX(-50%) translateY(-20px);
            }
            to { 
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QRCodeModal;

