'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaPhone, FaChair, FaUtensils, FaLeaf, FaDrumstickBite, FaSpinner, FaLock, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ImageCarousel from '../../../components/ImageCarousel';
import apiClient from '../../../lib/api.js';
import UpiPaymentModal from '../../../components/UpiPaymentModal';
import { getDisplayImage } from '../../../utils/placeholderImages';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components to avoid SSR issues
const BookMenu = dynamic(() => import('./BookMenu'), { ssr: false });

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

const PlaceOrderBookContent = () => {
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
    name: ''
  });
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
  const [currentPage, setCurrentPage] = useState(0);
  
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

  // Page navigation (sheets: 2 categories per sheet)
  const totalSheets = Math.max(1, Math.ceil(categories.length / 2));
  const nextPage = () => {
    if (currentPage < totalSheets - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // OTP functions (same as cube page)
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
        seatNumber: customerInfo.seatNumber.trim() || 'Walk-in',
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          shortCode: item.shortCode
        })),
        totalAmount: getCartTotal(),
        notes: `Customer self-order from seat ${customerInfo.seatNumber || 'Walk-in'}`,
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
        backgroundColor: '#1a1a1a',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#ffffff', fontSize: '16px' }}>Loading menu...</p>
        
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
        backgroundColor: '#1a1a1a',
        padding: '20px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '40px',
          borderRadius: '16px',
          maxWidth: '500px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Error</h2>
          <p style={{ color: '#ffffff', marginBottom: '24px' }}>{error}</p>
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
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
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
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
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
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                <FaChevronLeft size={12} />
                Back to Menu
              </button>
            )}
            <div>
              <h1 style={{ 
                fontSize: isScrolled ? '16px' : '20px', 
                fontWeight: '700', 
                margin: 0,
                color: '#2c1810',
                fontWeight: '800'
              }}>
                {restaurant?.name || 'My Restaurant'}
              </h1>
            </div>
          </div>
          
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
              transition: 'all 0.2s'
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
            {getCartItemCount() > 0 && (
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: selectedCategory ? '20px' : '0',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {!selectedCategory ? (
          /* 3D Book Menu */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 80px)',
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Suspense fallback={
              <div style={{ textAlign: 'center', color: '#ffffff' }}>
                <FaSpinner size={40} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px' }}>Loading Book Menu...</p>
              </div>
            }>
              <BookMenu
                categories={categories}
                menu={menu}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onCategorySelect={setSelectedCategory}
              />
            </Suspense>
            
            {/* Page Navigation Controls */}
            {categories.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                zIndex: 10
              }}>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  style={{
                    background: currentPage === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.8)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: currentPage === 0 ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <FaChevronLeft size={14} />
                  Previous
                </button>
                
                <div style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                  Page {currentPage + 1} of {Math.max(1, Math.ceil(categories.length / 2))}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === Math.max(1, Math.ceil(categories.length / 2)) - 1}
                  style={{
                    background: currentPage === Math.max(1, Math.ceil(categories.length / 2)) - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.8)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    cursor: currentPage === Math.max(1, Math.ceil(categories.length / 2)) - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: currentPage === Math.max(1, Math.ceil(categories.length / 2)) - 1 ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  Next
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
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
              background: 'linear-gradient(135deg, #ffffff, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'capitalize'
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
                color: '#ffffff'
              }}>
                <p style={{ fontSize: '18px', opacity: 0.7 }}>No items in this category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Modal - Same as cube page */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
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
            backgroundColor: '#1a1a1a',
            width: '100%',
            maxHeight: '85vh',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Cart Header */}
            <div style={{ 
              padding: '16px 20px 12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: '#0f0f0f'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                  Your Order ({getCartItemCount()} items)
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowCart(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FaTimes size={14} />
                  </button>
                  <button
                    onClick={() => setCart([])}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
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
                padding: '8px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                  Total: ₹{getCartTotal().toFixed(2)}
                </span>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>
                  {getCartItemCount()} items
                </span>
              </div>
            </div>

            {/* Scrollable Cart Items */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '0 20px'
            }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ffffff' }}>
                  <FaShoppingCart size={48} color="#ef4444" style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    Your cart is empty
                  </h3>
                  <p style={{ fontSize: '13px', margin: 0, opacity: 0.7 }}>
                    Add some delicious items to get started
                  </p>
                </div>
              ) : (
                <div style={{ padding: '16px 0' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#ffffff', 
                          margin: '0 0 2px 0'
                        }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>
                          ₹{item.price} each
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#ffffff'
                          }}
                        >
                          <FaMinus size={10} />
                        </button>
                        
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '700', 
                          color: '#ffffff', 
                          minWidth: '20px', 
                          textAlign: 'center' 
                        }}>
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => addToCart(item)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'white'
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
                padding: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#0f0f0f'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: '0 0 12px 0' }}>
                    Contact Information
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: '#ef4444', 
                        marginBottom: '6px' 
                      }}>
                        <FaPhone size={10} style={{ marginRight: '4px' }} />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="Enter phone number"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: '#ef4444', 
                        marginBottom: '6px' 
                      }}>
                        <FaChair size={10} style={{ marginRight: '4px' }} />
                        Table Number
                      </label>
                      <input
                        type="text"
                        value={customerInfo.seatNumber}
                        onChange={(e) => setCustomerInfo({...customerInfo, seatNumber: e.target.value})}
                        placeholder="Table/Seat number"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          boxSizing: 'border-box'
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
                    background: placingOrder || !customerInfo.phone.trim() || sendingOtp
                      ? 'rgba(255,255,255,0.2)' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: placingOrder || !customerInfo.phone.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {placingOrder ? (
                    <>
                      <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Processing Order...
                    </>
                  ) : sendingOtp ? (
                    <>
                      <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
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

      {/* OTP Modal - Same as cube page */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '350px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <FaLock size={32} color="#ef4444" style={{ marginBottom: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                Verify Your Phone
              </h2>
              <p style={{ fontSize: '13px', color: '#ffffff', margin: 0, opacity: 0.7 }}>
                We&apos;ve sent a 6-digit code to {customerInfo.phone}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength="6"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  letterSpacing: '2px'
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
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
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
                    ? 'rgba(255,255,255,0.2)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: (sendingOtp || otp.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {sendingOtp ? (
                  <>
                    <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
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

// Menu Item Card Component (same as cube page)
const MenuItemCard = ({ item, onAddToCart, onRemoveFromCart, cartQuantity, index }) => {
  const isVeg = item.isVeg !== false;
  
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      animation: `fadeInUp 0.5s ease ${index * 0.05}s both`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      {/* Image */}
      <div style={{
        width: '100%',
        height: '180px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))'
      }}>
        {(() => {
          if (item.images && item.images.length > 0) {
            return (
              <ImageCarousel
                images={item.images}
                itemName={item.name}
                maxHeight="180px"
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
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isVeg ? '#22c55e' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {isVeg ? <FaLeaf size={12} color="white" /> : <FaDrumstickBite size={12} color="white" />}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 6px 0',
          lineHeight: '1.3'
        }}>
          {item.name}
        </h3>
        
        {item.description && (
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 12px 0',
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
          marginTop: '12px'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#ef4444'
          }}>
            ₹{item.price}
          </span>
          
          {cartQuantity > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.5)'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCart(item.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaMinus size={12} />
              </button>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#ffffff',
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
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaPlus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FaPlus size={12} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PlaceOrderBookPage = () => {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      }}>
        <FaSpinner size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <PlaceOrderBookContent />
    </Suspense>
  );
};

export default PlaceOrderBookPage;

