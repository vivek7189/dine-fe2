'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaShoppingCart, FaSpinner, FaPlus, FaMinus, FaTrash, FaTimes, FaLock, FaChair, FaHotel } from 'react-icons/fa';
import apiClient from '../../../lib/api';
import UpiPaymentModal from '../../../components/UpiPaymentModal';
import dynamic from 'next/dynamic';

// Dynamically load the Carousel 3D menu
const Carousel3DMenu = dynamic(() => import('./Carousel3DMenu'), { ssr: false });

// Try to import Firebase modules with error handling
let firebaseAuth = null;
let firebaseConfig = null;

try {
  firebaseAuth = require('firebase/auth');
  firebaseConfig = require('../../../../firebase');
} catch (error) {
  console.warn('⚠️ Firebase modules not available:', error.message);
}

const PlaceOrderCarouselContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ phone: '', seatNumber: '', roomNumber: '', name: '' });
  const [orderType, setOrderType] = useState('table'); // 'table' or 'room'
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState('');
  
  // Order & OTP State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [customerAppSettings, setCustomerAppSettings] = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiOrderAmount, setUpiOrderAmount] = useState(0);

  const restaurantId = searchParams.get('restaurant') || 'default';
  const seatNumber = searchParams.get('seat') || '';

  useEffect(() => {
    setCustomerInfo((prev) => ({ ...prev, seatNumber }));
  }, [seatNumber]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPublicMenu(restaurantId);
        if (response.success && response.restaurant && response.menu) {
          setRestaurant(response.restaurant);
          setMenu(response.menu);
          const uniqueCategories = [...new Set(response.menu.map((i) => i.category).filter(Boolean))];
          setCategories(uniqueCategories);

          // Load customer app settings for UPI payment
          try {
            const settingsResponse = await apiClient.getPublicCustomerAppSettings(restaurantId);
            if (settingsResponse?.settings) {
              setCustomerAppSettings(settingsResponse.settings);
            }
          } catch (e) {
            console.warn('Failed to load customer app settings:', e);
          }
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        setError(apiError.message || 'Failed to load restaurant menu.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  // Cart helpers
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const getCartTotal = () => cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const getCartItemCount = () => cart.reduce((t, i) => t + i.quantity, 0);

  // OTP & Order Logic
  const sendOtp = async () => {
    if (!customerInfo.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    try {
      setSendingOtp(true);
      setError('');
      if (!firebaseAuth || !firebaseConfig) throw new Error('Firebase modules not available');
      const { signInWithPhoneNumber, RecaptchaVerifier } = firebaseAuth;
      const { auth, isFirebaseConfigured } = firebaseConfig;
      if (!isFirebaseConfigured || !isFirebaseConfigured()) throw new Error('Firebase not configured - using demo mode');

      let phoneNumber = customerInfo.phone.trim();
      if (!phoneNumber.startsWith('+')) phoneNumber = '+91' + phoneNumber;

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      await window.recaptchaVerifier.render();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setVerificationId(confirmationResult);
      setOtpSent(true);
      setShowOtpModal(true);
    } catch (err) {
      setError(`Failed to send OTP: ${err.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      setSendingOtp(true);
      setError('');
      if (verificationId === 'demo-verification-id') {
        if (otp === '123456') {
          await placeOrderWithVerification('demo-firebase-uid');
          setOtpSent(false);
          setShowOtpModal(false);
          setOtp('');
          setSendingOtp(false);
          return;
        }
        setError('Invalid OTP. Use 123456 for demo.');
        setSendingOtp(false);
        return;
      }
      const result = await verificationId.confirm(otp);
      const user = result.user;
      await placeOrderWithVerification(user.uid);
      setOtpSent(false);
      setShowOtpModal(false);
      setOtp('');
    } catch (err) {
      setError(`Invalid OTP: ${err.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  const placeOrder = async () => {
    if (!customerInfo.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (orderType === 'room' && !customerInfo.roomNumber.trim()) {
      setError('Room number is required for room orders');
      return;
    }
    if (cart.length === 0) {
      setError('Please add items to cart');
      return;
    }
    setError('');
    setSendingOtp(true);
    await sendOtp();
  };

  const placeOrderWithVerification = async (firebaseUid) => {
    try {
      setPlacingOrder(true);
      setError('');
      const orderData = {
        customerPhone: customerInfo.phone.trim(),
        customerName: customerInfo.name.trim() || 'Customer',
        seatNumber: orderType === 'table' ? (customerInfo.seatNumber.trim() || 'Walk-in') : null,
        roomNumber: orderType === 'room' ? (customerInfo.roomNumber.trim() || null) : null,
        items: cart.map((i) => ({
          menuItemId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          shortCode: i.shortCode,
        })),
        totalAmount: getCartTotal(),
        notes: orderType === 'room'
          ? `Customer self-order for Room ${customerInfo.roomNumber || 'N/A'}`
          : `Customer self-order from seat ${customerInfo.seatNumber || 'Walk-in'}`,
        otp: 'verified',
        verificationId: firebaseUid,
      };
      const upiEnabled = customerAppSettings?.paymentSettings?.upiEnabled;
      const orderTotal = getCartTotal();
      await apiClient.placePublicOrder(restaurantId, orderData);
      setCart([]);
      setCustomerInfo({ phone: '', seatNumber: customerInfo.seatNumber, name: '' });
      setShowOtpModal(false);
      setShowCart(false);
      setOtpSent(false);
      setOtp('');

      if (upiEnabled && customerAppSettings?.paymentSettings?.upiId) {
        setUpiOrderAmount(orderTotal);
        setShowUpiModal(true);
      } else {
        setSuccess('Order placed successfully! Your order will be prepared shortly.');
        alert('Order placed successfully! Your order will be prepared shortly.');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Menu</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 relative">
       {/* Cart Icon Button - Top Right - Only show when cart has items */}
       {getCartItemCount() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 100,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.2s ease-out',
            minWidth: '48px',
            height: '48px',
          }}
        >
          <FaShoppingCart size={20} />
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#f59e0b',
              color: 'white',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
            }}
          >
            {getCartItemCount()}
          </span>
        </button>
      )}

      <Carousel3DMenu 
        menu={menu} 
        categories={categories} 
        restaurant={restaurant} 
        addToCart={addToCart}
        cart={cart}
      />

      {/* Cart Modal - Styled for Light Theme */}
      {showCart && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCart(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxHeight: '90vh',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#ffffff',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Your Order ({getCartItemCount()} items)
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCart([])}
                    style={{
                      background: '#fef2f2',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FaTrash size={12} />
                    Clear
                  </button>
                  <button
                    onClick={() => setShowCart(false)}
                    style={{
                      background: '#f3f4f6',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#6b7280',
                    }}
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  borderRadius: '12px',
                  border: '1px solid #fbbf24',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#92400e' }}>
                  Total: ₹{getCartTotal().toFixed(2)}
                </span>
                <span style={{ fontSize: '13px', color: '#b45309', fontWeight: 600 }}>
                  {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', backgroundColor: '#fafafa' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}
                  >
                    <FaShoppingCart size={36} color="#d97706" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#111827' }}>
                    Your cart is empty
                  </h3>
                  <p style={{ fontSize: '14px', margin: 0, color: '#6b7280' }}>
                    Add some delicious items to get started
                  </p>
                </div>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#ef4444', margin: 0, fontWeight: 600 }}>
                          ₹{item.price} each
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: '#f9fafb',
                          padding: '6px 8px',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            height: '32px',
                          }}
                        >
                          <FaMinus size={12} />
                        </button>
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#111827',
                            minWidth: '24px',
                            textAlign: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            height: '32px',
                            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout */}
            {cart.length > 0 && (
              <div
                style={{
                  padding: '20px 24px',
                  borderTop: '1px solid #f3f4f6',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: '#111827' }}>
                    Contact Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '8px',
                        }}
                      >
                        Phone Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="Enter phone number"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                        }}
                      />
                    </div>

                    {/* Order Type Toggle */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '8px',
                        }}
                      >
                        Order Type
                      </label>
                      <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setOrderType('table')}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            backgroundColor: orderType === 'table' ? '#ef4444' : 'transparent',
                            color: orderType === 'table' ? '#ffffff' : '#6b7280',
                            transition: 'all 0.2s',
                          }}
                        >
                          <FaChair size={12} /> Table
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType('room')}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            backgroundColor: orderType === 'room' ? '#ef4444' : 'transparent',
                            color: orderType === 'room' ? '#ffffff' : '#6b7280',
                            transition: 'all 0.2s',
                          }}
                        >
                          <FaHotel size={12} /> Room
                        </button>
                      </div>
                    </div>

                    {/* Conditional Field: Table Number or Room Number */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '8px',
                        }}
                      >
                        {orderType === 'table' ? 'Table / Seat' : 'Room Number'} {orderType === 'room' && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      <input
                        type="text"
                        value={orderType === 'table' ? customerInfo.seatNumber : customerInfo.roomNumber}
                        onChange={(e) => setCustomerInfo({
                          ...customerInfo,
                          [orderType === 'table' ? 'seatNumber' : 'roomNumber']: e.target.value
                        })}
                        placeholder={orderType === 'table' ? 'Table/Seat number (optional)' : 'Enter room number'}
                        required={orderType === 'room'}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder || !customerInfo.phone.trim() || sendingOtp}
                  style={{
                    width: '100%',
                    background:
                      placingOrder || !customerInfo.phone.trim() || sendingOtp
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '14px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: placingOrder || !customerInfo.phone.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '17px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow:
                      placingOrder || !customerInfo.phone.trim() || sendingOtp
                        ? 'none'
                        : '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  {placingOrder ? (
                    <>
                      <FaSpinner size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Processing Order...
                    </>
                  ) : sendingOtp ? (
                    <>
                      <FaSpinner size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <FaLock size={18} />
                      Place Order - ₹{getCartTotal().toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Modal - Styled for Light Theme */}
      {showOtpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 220,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '350px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: 'none',
              color: '#111827',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                 <FaLock size={24} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Verify Your Phone</h2>
              <p style={{ fontSize: '14px', margin: 0, color: '#6b7280' }}>We&apos;ve sent a 6-digit code to <span style={{fontWeight: '600', color: '#111827'}}>{customerInfo.phone}</span></p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '20px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  color: '#111827',
                  boxSizing: 'border-box',
                  letterSpacing: '4px',
                  fontWeight: 'bold',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpSent(false);
                  setOtp('');
                }}
                style={{
                  flex: 1,
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                disabled={sendingOtp || otp.length !== 6}
                style={{
                  flex: 1,
                  background:
                    sendingOtp || otp.length !== 6
                      ? '#d1d5db'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: sendingOtp || otp.length !== 6 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
              >
                {sendingOtp ? (
                  <>
                    <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  'Verify & Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="recaptcha-container" style={{ display: 'none' }}></div>

      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => {
          setShowUpiModal(false);
          setSuccess('Order placed successfully!');
        }}
        amount={upiOrderAmount}
        restaurantName={restaurant?.name}
        upiId={customerAppSettings?.paymentSettings?.upiId}
        upiQrCodeUrl={customerAppSettings?.paymentSettings?.upiQrCodeUrl}
        upiDisplayName={customerAppSettings?.paymentSettings?.upiDisplayName}
      />

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const PlaceOrderCarouselPage = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">Loading...</div>}>
    <PlaceOrderCarouselContent />
  </Suspense>
);

export default PlaceOrderCarouselPage;