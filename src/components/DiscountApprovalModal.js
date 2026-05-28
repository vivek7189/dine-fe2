'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/lib/api';

const DiscountApprovalModal = ({ isOpen, onClose, onApproved, restaurantId, discountData }) => {
  const [step, setStep] = useState('loading'); // loading | approved | pin | otp | verifying | error
  const [approvalId, setApprovalId] = useState(null);
  const [method, setMethod] = useState(null);
  const [sentTo, setSentTo] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [pin, setPin] = useState(['', '', '', '']);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const pinRefs = useRef([]);
  const otpRefs = useRef([]);

  // Request approval on open
  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setStep('loading');
    setApprovalId(null);
    setMethod(null);
    setSentTo('');
    setExpiresAt(null);
    setPin(['', '', '', '']);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendCooldown(0);
    setCountdown(0);

    const requestApproval = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await apiClient.request(`/api/discount-approval/${restaurantId}/request`, {
          method: 'POST',
          body: {
            ...discountData,
            requestedByName: user?.name || user?.displayName || 'Staff',
            requestedByRole: user?.role || 'staff',
          },
        });

        if (res.approved) {
          setStep('approved');
          onApproved(res);
          onClose();
          return;
        }

        setApprovalId(res.approvalId);
        setMethod(res.method);
        setSentTo(res.sentTo || '');
        setExpiresAt(res.expiresAt);
        setStep(res.method === 'pin' ? 'pin' : 'otp');

        if (res.method === 'otp') {
          setResendCooldown(30);
        }

        if (res.expiresAt) {
          const remaining = Math.max(0, Math.floor((new Date(res.expiresAt) - Date.now()) / 1000));
          setCountdown(remaining);
        }
      } catch (err) {
        setError(err.message || 'Failed to request approval');
        setStep('error');
      }
    };

    requestApproval();
  }, [isOpen, restaurantId, discountData, onApproved, onClose]);

  // Countdown timer for expiry
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input when step changes
  useEffect(() => {
    if (step === 'pin') {
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    } else if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleDigitChange = useCallback((value, index, digits, setDigits, refs, maxLen) => {
    if (value && !/^\d$/.test(value)) return;

    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);

    // Auto-focus next input
    if (value && index < maxLen - 1) {
      refs.current[index + 1]?.focus();
    }
  }, []);

  const handleDigitKeyDown = useCallback((e, index, digits, setDigits, refs) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const updated = [...digits];
      updated[index - 1] = '';
      setDigits(updated);
    }
  }, []);

  const handleDigitPaste = useCallback((e, setDigits, refs, maxLen) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLen);
    if (!pasted) return;

    const updated = Array(maxLen).fill('');
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setDigits(updated);

    const focusIndex = Math.min(pasted.length, maxLen - 1);
    refs.current[focusIndex]?.focus();
  }, []);

  const handleVerify = async () => {
    const code = method === 'pin' ? pin.join('') : otp.join('');
    const expectedLen = method === 'pin' ? 4 : 6;

    if (code.length !== expectedLen) {
      setError(`Please enter all ${expectedLen} digits`);
      return;
    }

    setStep('verifying');
    setError('');

    try {
      const body = { approvalId };
      if (method === 'pin') {
        body.pin = code;
      } else {
        body.otp = code;
      }

      const res = await apiClient.request(`/api/discount-approval/${restaurantId}/verify`, {
        method: 'POST',
        body,
      });

      onApproved(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      setStep(method === 'pin' ? 'pin' : 'otp');

      // Clear inputs on failure
      if (method === 'pin') {
        setPin(['', '', '', '']);
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
      } else {
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await apiClient.request(`/api/discount-approval/${restaurantId}/request`, {
        method: 'POST',
        body: {
          ...discountData,
          requestedByName: user?.name || user?.displayName || 'Staff',
          requestedByRole: user?.role || 'staff',
        },
      });

      if (!res.approved) {
        setApprovalId(res.approvalId);
        setSentTo(res.sentTo || '');
        setExpiresAt(res.expiresAt);
        setResendCooldown(30);

        if (res.expiresAt) {
          const remaining = Math.max(0, Math.floor((new Date(res.expiresAt) - Date.now()) / 1000));
          setCountdown(remaining);
        }
      }

      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    },
    card: {
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '28px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      lineHeight: 1,
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#f9fafb',
      marginBottom: '4px',
      marginTop: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#9ca3af',
      marginBottom: '24px',
      marginTop: 0,
    },
    digitInput: {
      width: '48px',
      height: '56px',
      textAlign: 'center',
      fontSize: '22px',
      fontWeight: '600',
      color: '#f9fafb',
      backgroundColor: '#111827',
      border: '2px solid #374151',
      borderRadius: '8px',
      outline: 'none',
      caretColor: '#ef4444',
    },
    digitInputFocused: {
      borderColor: '#ef4444',
    },
    submitButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '20px',
    },
    submitButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    errorText: {
      color: '#ef4444',
      fontSize: '13px',
      marginTop: '12px',
      textAlign: 'center',
    },
    resendRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '16px',
      gap: '4px',
    },
    resendButton: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      fontSize: '13px',
      cursor: 'pointer',
      padding: 0,
      textDecoration: 'underline',
    },
    resendButtonDisabled: {
      color: '#6b7280',
      cursor: 'not-allowed',
      textDecoration: 'none',
    },
    timer: {
      fontSize: '13px',
      color: '#9ca3af',
      textAlign: 'center',
      marginTop: '12px',
    },
    loadingSpinner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
      color: '#9ca3af',
      fontSize: '14px',
      gap: '12px',
    },
    spinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #374151',
      borderTopColor: '#ef4444',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    discountInfo: {
      backgroundColor: '#111827',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      fontSize: '13px',
      color: '#d1d5db',
    },
  };

  const renderDigitInputs = (digits, setDigits, refs, maxLen) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleDigitChange(e.target.value, i, digits, setDigits, refs, maxLen)}
          onKeyDown={(e) => handleDigitKeyDown(e, i, digits, setDigits, refs)}
          onPaste={(e) => handleDigitPaste(e, setDigits, refs, maxLen)}
          onFocus={(e) => {
            e.target.style.borderColor = '#ef4444';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#374151';
          }}
          style={styles.digitInput}
          autoComplete="off"
        />
      ))}
    </div>
  );

  const isCodeComplete = method === 'pin'
    ? pin.every((d) => d !== '')
    : otp.every((d) => d !== '');

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose} aria-label="Close">
          &times;
        </button>

        {/* Loading state */}
        {step === 'loading' && (
          <div style={styles.loadingSpinner}>
            <div style={styles.spinner} />
            <span>Requesting approval...</span>
          </div>
        )}

        {/* Error during initial request */}
        {step === 'error' && (
          <div>
            <h3 style={styles.title}>Approval Request Failed</h3>
            <p style={{ ...styles.subtitle, color: '#ef4444' }}>{error}</p>
            <button
              style={styles.submitButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}

        {/* PIN entry */}
        {step === 'pin' && (
          <div>
            <h3 style={styles.title}>Discount Approval</h3>
            <p style={styles.subtitle}>Ask your manager to enter their PIN</p>

            {discountData && (
              <div style={styles.discountInfo}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount</span>
                  <span style={{ color: '#f9fafb', fontWeight: '500' }}>
                    {discountData.discountType === 'percentage'
                      ? `${discountData.discountValue}%`
                      : `${discountData.discountAmount}`}
                  </span>
                </div>
              </div>
            )}

            {renderDigitInputs(pin, setPin, pinRefs, 4)}

            {error && <p style={styles.errorText}>{error}</p>}

            {countdown > 0 && (
              <p style={styles.timer}>Expires in {formatTime(countdown)}</p>
            )}

            <button
              style={{
                ...styles.submitButton,
                ...((!isCodeComplete) ? styles.submitButtonDisabled : {}),
              }}
              onClick={handleVerify}
              disabled={!isCodeComplete}
            >
              Verify PIN
            </button>
          </div>
        )}

        {/* OTP entry */}
        {step === 'otp' && (
          <div>
            <h3 style={styles.title}>Discount Approval</h3>
            <p style={styles.subtitle}>
              OTP sent to {sentTo || 'the approver'}
            </p>

            {discountData && (
              <div style={styles.discountInfo}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount</span>
                  <span style={{ color: '#f9fafb', fontWeight: '500' }}>
                    {discountData.discountType === 'percentage'
                      ? `${discountData.discountValue}%`
                      : `${discountData.discountAmount}`}
                  </span>
                </div>
              </div>
            )}

            {renderDigitInputs(otp, setOtp, otpRefs, 6)}

            {error && <p style={styles.errorText}>{error}</p>}

            {countdown > 0 && (
              <p style={styles.timer}>Expires in {formatTime(countdown)}</p>
            )}

            <button
              style={{
                ...styles.submitButton,
                ...((!isCodeComplete) ? styles.submitButtonDisabled : {}),
              }}
              onClick={handleVerify}
              disabled={!isCodeComplete}
            >
              Verify OTP
            </button>

            <div style={styles.resendRow}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                Didn&apos;t receive it?
              </span>
              <button
                style={{
                  ...styles.resendButton,
                  ...(resendCooldown > 0 ? styles.resendButtonDisabled : {}),
                }}
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
              </button>
            </div>
          </div>
        )}

        {/* Verifying state */}
        {step === 'verifying' && (
          <div style={styles.loadingSpinner}>
            <div style={styles.spinner} />
            <span>Verifying...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountApprovalModal;
