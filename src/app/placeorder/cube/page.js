'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaPhone, FaChair, FaUtensils, FaLeaf, FaDrumstickBite, FaSpinner, FaLock, FaTimes, FaChevronLeft, FaHotel } from 'react-icons/fa';
import ImageCarousel from '../../../components/ImageCarousel';
import apiClient from '../../../lib/api.js';
import UpiPaymentModal from '../../../components/UpiPaymentModal';
import { getDisplayImage } from '../../../utils/placeholderImages';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components to avoid SSR issues
const CubeMenu = dynamic(() => import('./CubeMenu'), { ssr: false });

// Try to import Firebase modules with error handling
let firebaseAuth = null;
let firebaseConfig = null;

try {
  firebaseAuth = require('firebase/auth');
  firebaseConfig = require('../../../../firebase');
  console.log('✅ Firebase modules loaded successfully');
} catch (error) {
  console.warn('⚠️ Firebase modules not available:', error.message);
}

const PlaceOrderCubeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    seatNumber: '',
    roomNumber: '',
    name: ''
  });
  const [orderType, setOrderType] = useState('table'); // 'table' or 'room'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [customerAppSettings, setCustomerAppSettings] = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiOrderAmount, setUpiOrderAmount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Derived values
  const restaurantId = searchParams.get('restaurant') || 'default';
  const seatNumber = searchParams.get('seat') || '';

  // Initialize customer info from URL params
  useEffect(() => {
    setCustomerInfo(prev => ({
      ...prev,
      seatNumber
    }));
  }, [seatNumber]);

  // Handle scroll for compact header
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          setIsScrolled(scrollTop > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      } catch (error) {
        console.warn('Error cleaning up reCAPTCHA:', error);
      }
    };
  }, []);

  // Load restaurant data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        try {
          console.log('🔍 Fetching public menu for restaurant:', restaurantId);
          const response = await apiClient.getPublicMenu(restaurantId);
          console.log('✅ API response:', response);
          
          if (response.success && response.restaurant && response.menu) {
            setRestaurant(response.restaurant);
            setMenu(response.menu);
            
            // Extract categories from real menu data
            const uniqueCategories = [...new Set(response.menu.map(item => item.category).filter(Boolean))];
            setCategories(uniqueCategories);
            
            console.log('✅ Loaded restaurant:', response.restaurant.name);
            console.log('✅ Loaded menu items:', response.menu.length);
            console.log('✅ Categories:', uniqueCategories);

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
          console.error('❌ API error:', apiError);
          
          if (apiError.status === 404 || apiError.message?.includes('Restaurant not found') || apiError.message?.includes('not found')) {
            setError(`Restaurant not found. The restaurant ID "${restaurantId}" does not exist in our database.`);
            setLoading(false);
            return;
          }
          
          if (apiError.status === 500 || apiError.message?.includes('Internal Server Error')) {
            setError(`Server error occurred while loading restaurant data. Please try again later.`);
            setLoading(false);
            return;
          }
          
          setError(`Failed to load restaurant data: ${apiError.message || 'Unknown error'}.`);
          setLoading(false);
          return;
        }
        
      } catch (err) {
        console.error('Error loading restaurant data:', err);
        setError('Failed to load restaurant menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  // Cart functions
  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.id !== itemId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Filter menu by category
  const getCategoryItems = (category) => {
    if (!category) return [];
    return menu.filter(item => item.category === category);
  };

  // OTP functions
  const sendOtp = async () => {
    if (!customerInfo.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setSendingOtp(true);
      setError('');

      try {
        if (!firebaseAuth || !firebaseConfig) {
          throw new Error('Firebase modules not available');
        }

        const { signInWithPhoneNumber, RecaptchaVerifier } = firebaseAuth;
        const { auth, isFirebaseConfigured } = firebaseConfig;

        if (!isFirebaseConfigured || !isFirebaseConfigured()) {
          throw new Error('Firebase not configured - using demo mode');
        }

        let phoneNumber = customerInfo.phone.trim();
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+91' + phoneNumber;
        }

        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (clearError) {
            console.warn('Error clearing reCAPTCHA:', clearError);
          }
        }

        try {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: (response) => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              setError('reCAPTCHA expired. Please try again.');
            },
            'error-callback': (error) => {
              console.log('reCAPTCHA error:', error);
              setError('reCAPTCHA error. Please refresh and try again.');
            }
          });

          await window.recaptchaVerifier.render();

          const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
          setVerificationId(confirmationResult);
          setOtpSent(true);
          setShowOtpModal(true);
          setSendingOtp(false);
          
        } catch (recaptchaError) {
          console.warn('reCAPTCHA setup failed:', recaptchaError);
          throw new Error('reCAPTCHA setup failed');
        }
        
      } catch (firebaseError) {
        console.error('Firebase OTP error:', firebaseError);
        throw firebaseError;
      }
      
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(`Failed to send OTP: ${err.message}`);
      setSendingOtp(false);
      
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      } catch (clearError) {
        console.warn('Error clearing reCAPTCHA on error:', clearError);
      }
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
        } else {
          setError('Invalid OTP. Use 123456 for demo.');
          setSendingOtp(false);
          return;
        }
      }

      try {
        const result = await verificationId.confirm(otp);
        const user = result.user;
        
        await placeOrderWithVerification(user.uid);
        
        setOtpSent(false);
        setShowOtpModal(false);
        setOtp('');
        setSendingOtp(false);
        
      } catch (firebaseError) {
        console.error('Firebase OTP verification error:', firebaseError);
        setError(`Invalid OTP: ${firebaseError.message}`);
        setSendingOtp(false);
      }
      
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(`Invalid OTP: ${err.message}`);
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

    try {
      setError('');
      setSendingOtp(true);

      console.log('🚀 Starting OTP process for phone:', customerInfo.phone);
      await sendOtp();

    } catch (err) {
      console.error('Error in placeOrder:', err);
      setError('Failed to initiate order process');
      setSendingOtp(false);
    }
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
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          shortCode: item.shortCode
        })),
        totalAmount: getCartTotal(),
        notes: orderType === 'room'
          ? `Customer self-order for Room ${customerInfo.roomNumber || 'N/A'}`
          : `Customer self-order from seat ${customerInfo.seatNumber || 'Walk-in'}`,
        otp: 'verified',
        verificationId: firebaseUid
      };

      const upiEnabled = customerAppSettings?.paymentSettings?.upiEnabled;
      const orderTotal = getCartTotal();

      const response = await apiClient.placePublicOrder(restaurantId, orderData);

      if (upiEnabled && customerAppSettings?.paymentSettings?.upiId) {
        setUpiOrderAmount(orderTotal);
        setShowUpiModal(true);
      } else {
        setSuccess('Order placed successfully! Your order will be prepared shortly.');
      }
      setCart([]);
      setCustomerInfo({ phone: '', seatNumber: customerInfo.seatNumber, name: '' });
      
      setShowOtpModal(false);
      setShowCart(false);
      setOtpSent(false);
      setOtp('');

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#1a1a1a', fontSize: '16px' }}>Loading menu...</p>
        
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '20px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '40px',
          borderRadius: '16px',
          maxWidth: '500px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Error</h2>
          <p style={{ color: '#1a1a1a', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const categoryItems = selectedCategory ? getCategoryItems(selectedCategory) : [];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        padding: isScrolled ? '12px 20px' : '16px 20px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
              >
                <FaChevronLeft size={12} />
                Back to Menu
              </button>
            )}
            <div>
              <h1 style={{ 
                fontSize: isScrolled ? '16px' : '20px', 
                fontWeight: '800', 
                margin: 0,
                color: '#1a1a1a',
                letterSpacing: '-0.025em'
              }}>
                {restaurant?.name || 'My Restaurant'}
              </h1>
            </div>
          </div>
          
          {getCartItemCount() > 0 && (
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s',
                animation: 'fadeInUp 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              <FaShoppingCart size={16} />
              Cart
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ffffff',
                color: '#ef4444',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {getCartItemCount()}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: selectedCategory ? '20px' : '0', // No padding for cube view
        minHeight: 'calc(100vh - 80px)'
      }}>
        {!selectedCategory ? (
          /* 3D Cube Menu */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 80px)', // Full height minus header
            width: '100%',
            overflow: 'hidden'
          }}>
            <Suspense fallback={
              <div style={{ textAlign: 'center', color: '#1a1a1a' }}>
                <FaSpinner size={40} style={{ animation: 'spin 1s linear infinite', color: '#ef4444' }} />
                <p style={{ marginTop: '16px' }}>Loading 3D Experience...</p>
              </div>
            }>
              <CubeMenu
                categories={categories}
                menu={menu}
                onCategorySelect={setSelectedCategory}
              />
            </Suspense>
          </div>
        ) : (
          /* Category Items View */
          <div style={{
            animation: 'fadeInUp 0.5s ease'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '32px',
              color: '#1a1a1a',
              textTransform: 'capitalize',
              letterSpacing: '-0.03em'
            }}>
              {selectedCategory}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {categoryItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  cartQuantity={cart.find(c => c.id === item.id)?.quantity || 0}
                  index={index}
                />
              ))}
            </div>
            
            {categoryItems.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#64748b'
              }}>
                <p style={{ fontSize: '18px', fontWeight: '500' }}>No items in this category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 0
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCart(false);
          }
        }}
        >
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxHeight: '85vh',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Cart Header */}
            <div style={{ 
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: 0, letterSpacing: '-0.025em' }}>
                  Your Order ({getCartItemCount()} items)
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowCart(false)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#64748b',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FaTimes size={14} />
                  </button>
                  <button
                    onClick={() => setCart([])}
                    style={{
                      background: '#fef2f2',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                border: '1px solid #fee2e2'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                  Total: ₹{getCartTotal().toFixed(2)}
                </span>
                <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>
                  {getCartItemCount()} items
                </span>
              </div>
            </div>

            {/* Scrollable Cart Items */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '0 24px'
            }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: '#f1f5f9', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 20px' 
                  }}>
                    <FaShoppingCart size={32} color="#94a3b8" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a' }}>
                    Your cart is empty
                  </h3>
                  <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>
                    Add some delicious items to get started
                  </p>
                </div>
              ) : (
                <div style={{ padding: '20px 0' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #f1f5f9',
                      marginBottom: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: '#1a1a1a', 
                          margin: '0 0 4px 0'
                        }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#ef4444', margin: 0, fontWeight: '600' }}>
                          ₹{item.price} each
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaMinus size={10} />
                        </button>
                        
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: '#1a1a1a', 
                          minWidth: '24px', 
                          textAlign: 'center' 
                        }}>
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => addToCart(item)}
                          style={{
                            background: '#fef2f2',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Info & Checkout */}
            {cart.length > 0 && (
              <div style={{
                padding: '24px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#ffffff'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 16px 0' }}>
                    Contact Information
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <FaPhone size={10} style={{ marginRight: '6px' }} />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="Enter phone number"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          color: '#1a1a1a',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>

                    {/* Order Type Toggle */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Order Type
                      </label>
                      <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
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
                            color: orderType === 'table' ? '#ffffff' : '#64748b',
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
                            color: orderType === 'room' ? '#ffffff' : '#64748b',
                            transition: 'all 0.2s',
                          }}
                        >
                          <FaHotel size={12} /> Room
                        </button>
                      </div>
                    </div>

                    {/* Conditional Field: Table Number or Room Number */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {orderType === 'table' ? <FaChair size={10} style={{ marginRight: '6px' }} /> : <FaHotel size={10} style={{ marginRight: '6px' }} />}
                        {orderType === 'table' ? 'Table Number' : 'Room Number'} {orderType === 'room' && <span style={{ color: '#ef4444' }}>*</span>}
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
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          color: '#1a1a1a',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder || !customerInfo.phone.trim() || sendingOtp}
                  style={{
                    width: '100%',
                    background: placingOrder || !customerInfo.phone.trim() || sendingOtp
                      ? '#e2e8f0' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: placingOrder || !customerInfo.phone.trim() || sendingOtp ? '#94a3b8' : 'white',
                    padding: '16px 24px',
                    borderRadius: '14px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: placingOrder || !customerInfo.phone.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: placingOrder || !customerInfo.phone.trim() ? 'none' : '0 10px 20px rgba(239, 68, 68, 0.2)'
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
                      <FaUtensils size={16} />
                      Place Order - ₹{getCartTotal().toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '350px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <FaLock size={24} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                Verify Phone
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Enter the 6-digit code sent to<br/>
                <span style={{ color: '#1a1a1a', fontWeight: '600' }}>{customerInfo.phone}</span>
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  fontSize: '24px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#1a1a1a',
                  boxSizing: 'border-box',
                  letterSpacing: '4px',
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpSent(false);
                  setOtp('');
                }}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                disabled={sendingOtp || otp.length !== 6}
                style={{
                  flex: 1,
                  background: (sendingOtp || otp.length !== 6)
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: (sendingOtp || otp.length !== 6) ? '#94a3b8' : 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (sendingOtp || otp.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: (sendingOtp || otp.length !== 6) ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                {sendingOtp ? (
                  <>
                    <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden reCAPTCHA container */}
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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard = ({ item, onAddToCart, onRemoveFromCart, cartQuantity, index }) => {
  const isVeg = item.isVeg !== false;
  
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      padding: '20px',
      border: '1px solid #f1f5f9',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      animation: `fadeInUp 0.5s ease ${index * 0.05}s both`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)';
      e.currentTarget.style.borderColor = '#e2e8f0';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01)';
      e.currentTarget.style.borderColor = '#f1f5f9';
    }}>
      {/* Image */}
      <div style={{
        width: '100%',
        height: '200px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '16px',
        position: 'relative',
        background: '#f8fafc',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
      }}>
        {(() => {
          if (item.images && item.images.length > 0) {
            return (
              <ImageCarousel
                images={item.images}
                itemName={item.name}
                maxHeight="200px"
                showControls={false}
                showDots={false}
                autoPlay={true}
                autoPlayInterval={4000}
                className="w-full h-full"
              />
            );
          }
          
          const displayImage = getDisplayImage(item);
          if (displayImage) {
            return (
              <img
                src={displayImage}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            );
          }
          
          return (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              {isVeg ? '🥗' : '🍖'}
            </div>
          );
        })()}
        
        {/* Veg/Non-Veg Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 8px',
          borderRadius: '20px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: '700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: isVeg ? '#16a34a' : '#dc2626'
        }}>
          {isVeg ? (
            <>
              <FaLeaf size={10} />
              <span>VEG</span>
            </>
          ) : (
            <>
              <FaDrumstickBite size={10} />
              <span>NON-VEG</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '800',
          color: '#1a1a1a',
          margin: '0 0 6px 0',
          lineHeight: '1.3',
          letterSpacing: '-0.025em'
        }}>
          {item.name}
        </h3>
        
        {item.description && (
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 16px 0',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.description}
          </p>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1a1a1a',
            letterSpacing: '-0.03em'
          }}>
            ₹{item.price}
          </span>
          
          {cartQuantity > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f8fafc',
              padding: '6px 8px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCart(item.id);
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <FaMinus size={10} />
              </button>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1a1a1a',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {cartQuantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <FaPlus size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              style={{
                background: '#1a1a1a',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              Add
              <FaPlus size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PlaceOrderCubePage = () => {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#1a1a1a'
      }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <PlaceOrderCubeContent />
    </Suspense>
  );
};

export default PlaceOrderCubePage;
