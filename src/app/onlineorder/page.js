'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaSearch, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowLeft,
  FaPhone, FaChair, FaUtensils, FaLeaf, FaDrumstickBite, FaSpinner,
  FaLock, FaTimes, FaHotel, FaUser, FaHistory, FaGift, FaStar,
  FaCoins, FaChevronRight, FaCheck, FaPercent, FaCrown, FaSignOutAlt
} from 'react-icons/fa';
import ImageCarousel from '../../components/ImageCarousel';
import apiClient from '../../lib/api.js';
import { getDisplayImage } from '../../utils/placeholderImages';

// Try to import Firebase modules with error handling
let firebaseAuth = null;
let firebaseConfig = null;

try {
  firebaseAuth = require('firebase/auth');
  firebaseConfig = require('../../../firebase');
} catch (error) {
  console.warn('Firebase modules not available:', error.message);
}

// Helper function to get category-specific colors
const getCategoryColor = (category, opacity = 1) => {
  const colors = {
    'Pizza': `rgba(239, 68, 68, ${opacity})`,
    'Burgers': `rgba(249, 115, 22, ${opacity})`,
    'Salads': `rgba(34, 197, 94, ${opacity})`,
    'Pasta': `rgba(168, 85, 247, ${opacity})`,
    'Desserts': `rgba(236, 72, 153, ${opacity})`,
    'appetizer': `rgba(59, 130, 246, ${opacity})`,
    'Tea': `rgba(245, 158, 11, ${opacity})`,
    'Samosa': `rgba(16, 185, 129, ${opacity})`,
    'Main Course': `rgba(107, 114, 128, ${opacity})`,
    'default': `rgba(99, 102, 241, ${opacity})`
  };
  return colors[category] || colors['default'];
};

// Tier colors and info
const tierInfo = {
  bronze: { color: '#CD7F32', bgColor: '#fef3e7', label: 'Bronze', icon: '🥉', multiplier: 1 },
  silver: { color: '#C0C0C0', bgColor: '#f4f4f4', label: 'Silver', icon: '🥈', multiplier: 1.25 },
  gold: { color: '#FFD700', bgColor: '#fff9e6', label: 'Gold', icon: '🥇', multiplier: 1.5 },
  platinum: { color: '#E5E4E2', bgColor: '#f8f8ff', label: 'Platinum', icon: '💎', multiplier: 2 }
};

const OnlineOrderContent = () => {
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
  const [orderType, setOrderType] = useState('takeaway');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Customer & Loyalty state
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [customerAppSettings, setCustomerAppSettings] = useState(null);
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(0);
  const [customerVerified, setCustomerVerified] = useState(false);
  const [loyaltyHistory, setLoyaltyHistory] = useState(null);

  // UI State for post-OTP experience
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'checkout', 'profile', 'history'
  const [firebaseUid, setFirebaseUid] = useState(null);

  const restaurantId = searchParams.get('restaurant') || 'default';
  const seatNumber = searchParams.get('seat') || '';

  useEffect(() => {
    setCustomerInfo(prev => ({
      ...prev,
      seatNumber
    }));
  }, [seatNumber]);

  // Handle scroll
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

  // Cleanup reCAPTCHA
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
        const response = await apiClient.getPublicMenu(restaurantId);

        if (response.success && response.restaurant && response.menu) {
          setRestaurant(response.restaurant);
          setMenu(response.menu);
          const uniqueCategories = [...new Set(response.menu.map(item => item.category).filter(Boolean))];
          setCategories(['all', ...uniqueCategories]);

          // Load offers and settings
          try {
            const [offersResponse, settingsResponse] = await Promise.all([
              apiClient.getActiveOffers(restaurantId),
              apiClient.getPublicCustomerAppSettings(restaurantId)
            ]);

            if (offersResponse?.offers) {
              setOffers(offersResponse.offers);
            }
            if (settingsResponse?.settings) {
              setCustomerAppSettings(settingsResponse.settings);
            }
          } catch (extrasError) {
            console.warn('Failed to load offers/settings:', extrasError);
          }
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        if (apiError.status === 404 || apiError.message?.includes('not found')) {
          setError(`Restaurant not found. Please check the QR code or contact the restaurant.`);
        } else {
          setError(`Failed to load restaurant data: ${apiError.message || 'Unknown error'}`);
        }
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
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== itemId);
    });
  };

  const getCartSubtotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getCartTotal = () => getCartSubtotal();
  const getCartItemCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate offer discount
  const getOfferDiscount = () => {
    if (!selectedOffer) return 0;
    const subtotal = getCartSubtotal();
    if (subtotal < (selectedOffer.minOrderValue || 0)) return 0;
    if (selectedOffer.isFirstOrderOnly && customerData && !customerData.isFirstOrder) return 0;

    let discount = 0;
    if (selectedOffer.discountType === 'percentage') {
      discount = (subtotal * selectedOffer.discountValue) / 100;
      if (selectedOffer.maxDiscount && discount > selectedOffer.maxDiscount) {
        discount = selectedOffer.maxDiscount;
      }
    } else {
      discount = selectedOffer.discountValue;
    }
    return Math.min(discount, subtotal);
  };

  // Calculate loyalty discount
  const getLoyaltyDiscount = () => {
    if (!customerAppSettings?.loyaltySettings?.enabled) return 0;
    if (!customerData || !redeemLoyaltyPoints) return 0;

    const subtotal = getCartSubtotal();
    const offerDiscount = getOfferDiscount();
    const afterOffer = subtotal - offerDiscount;

    const redemptionRate = customerAppSettings.loyaltySettings.redemptionRate || 100;
    const maxRedemptionPercent = customerAppSettings.loyaltySettings.maxRedemptionPercent || 20;

    const maxFromPercent = (afterOffer * maxRedemptionPercent) / 100;
    const maxFromPoints = redeemLoyaltyPoints / redemptionRate;

    return Math.min(maxFromPercent, maxFromPoints, afterOffer);
  };

  const getFinalTotal = () => {
    const subtotal = getCartSubtotal();
    const offerDiscount = getOfferDiscount();
    const loyaltyDiscount = getLoyaltyDiscount();
    return Math.max(0, subtotal - offerDiscount - loyaltyDiscount);
  };

  const getLoyaltyPointsToEarn = () => {
    if (!customerAppSettings?.loyaltySettings?.enabled) return 0;
    const pointsPerRupee = customerAppSettings.loyaltySettings.pointsPerRupee || 1;
    return Math.floor(getFinalTotal() * pointsPerRupee);
  };

  // Filter menu
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedMenu = categories.reduce((acc, category) => {
    if (category === 'all') return acc;
    const categoryItems = filteredMenu.filter(item => item.category === category);
    if (categoryItems.length > 0) {
      acc[category] = categoryItems;
    }
    return acc;
  }, {});

  // OTP functions
  const sendOtp = async () => {
    if (!customerInfo.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setSendingOtp(true);
      setError('');

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

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA solved'),
        'expired-callback': () => setError('reCAPTCHA expired. Please try again.')
      });

      await window.recaptchaVerifier.render();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setVerificationId(confirmationResult);
      setOtpSent(true);
      setShowOtpModal(true);

    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(`Failed to send OTP: ${err.message}`);
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (clearError) {
          console.warn('Error clearing reCAPTCHA:', clearError);
        }
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Lookup customer to get loyalty points
  const lookupCustomer = async () => {
    if (!customerInfo.phone.trim()) return null;

    try {
      const response = await apiClient.lookupCustomerByPhone(restaurantId, customerInfo.phone.trim());
      if (response) {
        setCustomerData(response.customer);
        setCustomerVerified(true);

        // Load loyalty history if customer found
        if (response.found && response.customer?.id) {
          try {
            const historyResponse = await apiClient.getCustomerLoyaltyHistory(response.customer.id);
            if (historyResponse) {
              setLoyaltyHistory(historyResponse);
            }
          } catch (historyError) {
            console.warn('Failed to load loyalty history:', historyError);
          }
        }
        return response.customer;
      }
    } catch (error) {
      console.warn('Customer lookup failed:', error);
    }
    return null;
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
          const customer = await lookupCustomer();
          setFirebaseUid('demo-firebase-uid');
          setOtpSent(false);
          setShowOtpModal(false);
          setOtp('');
          // Navigate to checkout view
          setCurrentView('checkout');
          setShowCart(false);
          return;
        }
        setError('Invalid OTP. Use 123456 for demo.');
        return;
      }

      const result = await verificationId.confirm(otp);
      const user = result.user;

      await lookupCustomer();
      setFirebaseUid(user.uid);
      setOtpSent(false);
      setShowOtpModal(false);
      setOtp('');
      // Navigate to checkout view
      setCurrentView('checkout');
      setShowCart(false);

    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(`Invalid OTP: ${err.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  const initiateCheckout = async () => {
    if (!customerInfo.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (cart.length === 0) {
      setError('Please add items to cart');
      return;
    }
    setError('');
    await sendOtp();
  };

  const placeOrderWithVerification = async () => {
    if (!firebaseUid) {
      setError('Please verify your phone first');
      return;
    }

    try {
      setPlacingOrder(true);
      setError('');

      const actualRedeemPoints = customerData?.loyaltyPoints
        ? Math.min(redeemLoyaltyPoints, customerData.loyaltyPoints)
        : 0;

      const orderData = {
        customerPhone: customerInfo.phone.trim(),
        customerName: customerInfo.name.trim() || customerData?.name || 'Customer',
        seatNumber: orderType === 'table' ? (customerInfo.seatNumber.trim() || 'Walk-in') : null,
        roomNumber: orderType === 'room' ? (customerInfo.roomNumber.trim() || null) : null,
        tableNumber: orderType === 'table' ? (customerInfo.seatNumber.trim() || null) : null,
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          shortCode: item.shortCode
        })),
        totalAmount: getCartSubtotal(),
        orderType: orderType === 'table' ? 'dine_in' : 'takeaway',
        notes: orderType === 'room'
          ? `Online order for Room ${customerInfo.roomNumber || 'N/A'}`
          : `Online order - ${orderType === 'table' ? `Table ${customerInfo.seatNumber || 'Walk-in'}` : 'Takeaway'}`,
        otp: 'verified',
        verificationId: firebaseUid,
        offerId: selectedOffer?.id || null,
        redeemLoyaltyPoints: actualRedeemPoints
      };

      const response = await apiClient.placePublicOrder(restaurantId, orderData);

      let successMsg = 'Order placed successfully!';
      if (response.order?.loyaltyPointsEarned > 0) {
        successMsg += ` You earned ${response.order.loyaltyPointsEarned} loyalty points!`;
      }

      setSuccess(successMsg);
      setCart([]);
      setSelectedOffer(null);
      setRedeemLoyaltyPoints(0);

      // Refresh customer data
      await lookupCustomer();

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleLogout = () => {
    setCustomerVerified(false);
    setCustomerData(null);
    setFirebaseUid(null);
    setLoyaltyHistory(null);
    setCurrentView('menu');
    setRedeemLoyaltyPoints(0);
  };

  // Calculate tier progress
  const getTierProgress = () => {
    if (!loyaltyHistory?.summary) return { progress: 0, nextTier: null, pointsNeeded: 0 };
    const { currentTier, lifetimePoints, pointsToNextTier, nextTier } = loyaltyHistory.summary;
    const tierThresholds = { bronze: 0, silver: 500, gold: 2000, platinum: 5000 };
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentTierIndex = tiers.indexOf(currentTier);

    if (!nextTier) return { progress: 100, nextTier: null, pointsNeeded: 0 };

    const currentThreshold = tierThresholds[currentTier];
    const nextThreshold = tierThresholds[nextTier];
    const range = nextThreshold - currentThreshold;
    const progress = ((lifetimePoints - currentThreshold) / range) * 100;

    return { progress: Math.min(progress, 100), nextTier, pointsNeeded: pointsToNextTier };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading menu...</p>
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
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Restaurant Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Render checkout/profile views when customer is verified
  if (customerVerified && currentView !== 'menu') {
    return (
      <CheckoutView
        currentView={currentView}
        setCurrentView={setCurrentView}
        restaurant={restaurant}
        customerData={customerData}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        loyaltyHistory={loyaltyHistory}
        customerAppSettings={customerAppSettings}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        getCartSubtotal={getCartSubtotal}
        getCartItemCount={getCartItemCount}
        getOfferDiscount={getOfferDiscount}
        getLoyaltyDiscount={getLoyaltyDiscount}
        getFinalTotal={getFinalTotal}
        getLoyaltyPointsToEarn={getLoyaltyPointsToEarn}
        offers={offers}
        selectedOffer={selectedOffer}
        setSelectedOffer={setSelectedOffer}
        redeemLoyaltyPoints={redeemLoyaltyPoints}
        setRedeemLoyaltyPoints={setRedeemLoyaltyPoints}
        orderType={orderType}
        setOrderType={setOrderType}
        placingOrder={placingOrder}
        placeOrderWithVerification={placeOrderWithVerification}
        error={error}
        setError={setError}
        success={success}
        setSuccess={setSuccess}
        handleLogout={handleLogout}
        getTierProgress={getTierProgress}
        tierInfo={tierInfo}
        setCart={setCart}
      />
    );
  }

  // Menu view (default)
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingBottom: '100px'
    }}>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 100,
        padding: isScrolled ? '8px 12px' : '12px 16px',
        boxShadow: isScrolled ? '0 2px 12px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isScrolled ? '8px' : '12px'
        }}>
          {/* Logo & Restaurant Info */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: isScrolled ? '32px' : '40px',
              height: isScrolled ? '32px' : '40px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}>
              <span style={{ fontSize: isScrolled ? '16px' : '20px' }}>🍽️</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: isScrolled ? '14px' : '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {restaurant?.name || 'Restaurant'}
              </h1>
              {!isScrolled && (
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                  Online Ordering
                </p>
              )}
            </div>
          </div>

          {/* User/Cart Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {customerVerified && (
              <button
                onClick={() => setCurrentView('profile')}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaUser size={16} color="#6b7280" />
              </button>
            )}
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FaShoppingCart size={16} />
              {getCartItemCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: isScrolled ? '8px' : '12px' }}>
          <FaSearch size={14} color="#9ca3af" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1
          }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food items..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '2px solid #f3f4f6',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#f9fafb',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#ef4444';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#f3f4f6';
            }}
          />
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (category !== 'all') {
                  setTimeout(() => {
                    const element = document.getElementById(`category-${category}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
              style={{
                background: selectedCategory === category
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : '#ffffff',
                color: selectedCategory === category ? 'white' : '#64748b',
                border: selectedCategory === category ? 'none' : '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          margin: '16px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#f0fdf4',
          border: '2px solid #22c55e',
          color: '#166534',
          padding: '24px',
          borderRadius: '16px',
          fontSize: '16px',
          fontWeight: '600',
          textAlign: 'center',
          zIndex: 1000,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          maxWidth: '90%',
          width: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ marginBottom: '16px' }}>{success}</div>
          <button
            onClick={() => setSuccess('')}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Menu */}
      <div style={{ padding: '0 16px', maxWidth: '1200px', margin: '0 auto' }}>
        {Object.keys(groupedMenu).length > 0 ? (
          Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} id={`category-${category}`} style={{ marginTop: '20px', scrollMarginTop: '180px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 16px 0',
                padding: '16px 20px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                {category}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {items.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
              {searchTerm ? 'No items found' : 'No menu items available'}
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  marginTop: '16px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          getCartTotal={getCartTotal}
          getCartItemCount={getCartItemCount}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          orderType={orderType}
          setOrderType={setOrderType}
          onClose={() => setShowCart(false)}
          onCheckout={initiateCheckout}
          sendingOtp={sendingOtp}
          setCart={setCart}
          customerVerified={customerVerified}
        />
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          customerPhone={customerInfo.phone}
          otp={otp}
          setOtp={setOtp}
          sendingOtp={sendingOtp}
          error={error}
          onCancel={() => {
            setShowOtpModal(false);
            setOtpSent(false);
            setOtp('');
          }}
          onVerify={verifyOtp}
        />
      )}

      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard = ({ item, onAddToCart, onRemoveFromCart, cartQuantity, getCategoryColor }) => {
  const isVeg = item.isVeg !== false;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      transition: 'all 0.2s ease'
    }}>
      {/* Image */}
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '12px',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}>
        {item.images && item.images.length > 0 ? (
          <ImageCarousel
            images={item.images}
            itemName={item.name}
            maxHeight="100px"
            showControls={false}
            showDots={false}
            autoPlay={true}
            autoPlayInterval={4000}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${getCategoryColor(item.category)} 0%, ${getCategoryColor(item.category, 0.7)} 100%)`
          }}>
            <span style={{ fontSize: '36px' }}>🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {item.name}
          </h3>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: isVeg ? '#22c55e' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '8px'
          }}>
            {isVeg ? <FaLeaf size={8} color="white" /> : <FaDrumstickBite size={8} color="white" />}
          </div>
        </div>

        {item.description && (
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: '0 0 8px 0',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
            ₹{item.price}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartQuantity > 0 && (
              <>
                <button
                  onClick={() => onRemoveFromCart(item.id)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaMinus size={10} color="#64748b" />
                </button>
                <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                  {cartQuantity}
                </span>
              </>
            )}
            <button
              onClick={() => onAddToCart(item)}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FaPlus size={10} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Modal Component
const CartModal = ({ cart, addToCart, removeFromCart, getCartTotal, getCartItemCount, customerInfo, setCustomerInfo, orderType, setOrderType, onClose, onCheckout, sendingOtp, setCart, customerVerified }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxHeight: '90vh',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#fafbfc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Your Order ({getCartItemCount()} items)
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCart([])} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}>
                <FaTrash size={14} />
              </button>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                <FaTimes size={14} />
              </button>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
              Total: ₹{getCartTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <FaShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Your cart is empty</h3>
              <p style={{ fontSize: '14px' }}>Add some delicious items to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>{item.name}</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>₹{item.price} each</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                    <FaMinus size={10} color="#64748b" />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => addToCart(item)} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                    <FaPlus size={10} color="white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        {cart.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
            {/* Customer Info */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
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
                  padding: '12px',
                  border: '2px solid #f3f4f6',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Order Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                Order Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['takeaway', 'table'].map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: orderType === type ? '#ef4444' : '#f3f4f6',
                      color: orderType === type ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {type === 'takeaway' ? <FaUtensils size={12} /> : <FaChair size={12} />}
                    {type === 'takeaway' ? 'Takeaway' : 'Dine In'}
                  </button>
                ))}
              </div>
            </div>

            {orderType === 'table' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Table Number (Optional)
                </label>
                <input
                  type="text"
                  value={customerInfo.seatNumber}
                  onChange={(e) => setCustomerInfo({...customerInfo, seatNumber: e.target.value})}
                  placeholder="Enter table number"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #f3f4f6',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              disabled={sendingOtp || !customerInfo.phone.trim()}
              style={{
                width: '100%',
                background: sendingOtp || !customerInfo.phone.trim()
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: sendingOtp || !customerInfo.phone.trim() ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: sendingOtp || !customerInfo.phone.trim() ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              {sendingOtp ? (
                <>
                  <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Sending OTP...
                </>
              ) : (
                <>
                  <FaLock size={16} />
                  Verify & Continue - ₹{getCartTotal().toFixed(2)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// OTP Modal Component
const OtpModal = ({ customerPhone, otp, setOtp, sendingOtp, error, onCancel, onVerify }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FaLock size={28} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px' }}>
            Verify Your Phone
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            We sent a 6-digit code to <strong>{customerPhone}</strong>
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

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
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '24px',
              textAlign: 'center',
              outline: 'none',
              letterSpacing: '8px',
              fontWeight: 'bold',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onVerify}
            disabled={sendingOtp || otp.length !== 6}
            style={{
              flex: 1,
              background: sendingOtp || otp.length !== 6
                ? '#d1d5db'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: sendingOtp || otp.length !== 6 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
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
  );
};

// Checkout View Component - Full page experience after OTP verification
const CheckoutView = ({
  currentView,
  setCurrentView,
  restaurant,
  customerData,
  customerInfo,
  setCustomerInfo,
  loyaltyHistory,
  customerAppSettings,
  cart,
  addToCart,
  removeFromCart,
  getCartSubtotal,
  getCartItemCount,
  getOfferDiscount,
  getLoyaltyDiscount,
  getFinalTotal,
  getLoyaltyPointsToEarn,
  offers,
  selectedOffer,
  setSelectedOffer,
  redeemLoyaltyPoints,
  setRedeemLoyaltyPoints,
  orderType,
  setOrderType,
  placingOrder,
  placeOrderWithVerification,
  error,
  setError,
  success,
  setSuccess,
  handleLogout,
  getTierProgress,
  tierInfo,
  setCart
}) => {
  const tier = customerData?.loyaltyTier || loyaltyHistory?.summary?.currentTier || 'bronze';
  const tierData = tierInfo[tier] || tierInfo.bronze;
  const tierProgress = getTierProgress();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 100,
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setCurrentView(currentView === 'checkout' ? 'menu' : 'checkout')}
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#374151',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <FaArrowLeft size={14} />
            {currentView === 'profile' || currentView === 'history' ? 'Back' : 'Menu'}
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            {currentView === 'checkout' ? 'Checkout' : currentView === 'profile' ? 'My Profile' : 'Points History'}
          </h1>
          <button
            onClick={handleLogout}
            style={{
              background: '#fef2f2',
              border: 'none',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#dc2626'
            }}
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#166534', margin: '0 0 12px' }}>Order Placed!</h2>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px' }}>{success}</p>
            <button
              onClick={() => {
                setSuccess('');
                setCurrentView('menu');
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue Ordering
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Customer Profile Card */}
        <div style={{
          background: `linear-gradient(135deg, ${tierData.color}22 0%, ${tierData.color}11 100%)`,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '16px',
          border: `2px solid ${tierData.color}44`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${tierData.color}, ${tierData.color}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: `0 4px 12px ${tierData.color}44`
            }}>
              {tierData.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px' }}>
                {customerData?.name || customerInfo.name || 'Customer'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {customerInfo.phone}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: tierData.color,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                marginTop: '6px'
              }}>
                <FaCrown size={10} /> {tierData.label} Member
              </div>
            </div>
          </div>

          {/* Points Balance */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <div style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
                {customerData?.loyaltyPoints || loyaltyHistory?.summary?.currentBalance || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Available Points</div>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                {loyaltyHistory?.summary?.totalEarned || customerData?.lifetimePoints || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Lifetime Points</div>
            </div>
          </div>

          {/* Tier Progress */}
          {tierProgress.nextTier && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                <span>{tierData.label}</span>
                <span>{tierProgress.pointsNeeded} pts to {tierProgress.nextTier}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${tierProgress.progress}%`,
                  background: `linear-gradient(90deg, ${tierData.color}, ${tierInfo[tierProgress.nextTier]?.color || tierData.color})`,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={() => setCurrentView('profile')}
              style={{
                flex: 1,
                backgroundColor: currentView === 'profile' ? tierData.color : 'white',
                color: currentView === 'profile' ? 'white' : '#374151',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaUser size={12} /> Profile
            </button>
            <button
              onClick={() => setCurrentView('history')}
              style={{
                flex: 1,
                backgroundColor: currentView === 'history' ? tierData.color : 'white',
                color: currentView === 'history' ? 'white' : '#374151',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaHistory size={12} /> History
            </button>
            <button
              onClick={() => setCurrentView('checkout')}
              style={{
                flex: 1,
                backgroundColor: currentView === 'checkout' ? tierData.color : 'white',
                color: currentView === 'checkout' ? 'white' : '#374151',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaShoppingCart size={12} /> Order
            </button>
          </div>
        </div>

        {/* Profile View */}
        {currentView === 'profile' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
                Personal Information
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', display: 'block' }}>Name</label>
                <input
                  type="text"
                  value={customerInfo.name || customerData?.name || ''}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #f3f4f6',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', display: 'block' }}>Phone</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #f3f4f6',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
                Your Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#166534' }}>{customerData?.totalOrders || 0}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Orders</div>
                </div>
                <div style={{ backgroundColor: '#fef3c7', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>₹{customerData?.totalSpent || 0}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Spent</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History View */}
        {currentView === 'history' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
              Points History
            </h3>
            {loyaltyHistory?.history && loyaltyHistory.history.length > 0 ? (
              loyaltyHistory.history.map((item, index) => (
                <div key={item.id || index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: item.type === 'earned' ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '10px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: item.type === 'earned' ? '#22c55e' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.type === 'earned' ? <FaPlus size={14} color="white" /> : <FaMinus size={14} color="white" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                        {item.description || (item.type === 'earned' ? 'Points Earned' : 'Points Redeemed')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: item.type === 'earned' ? '#166534' : '#dc2626'
                  }}>
                    {item.type === 'earned' ? '+' : '-'}{item.points}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <FaHistory size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>No points history yet</p>
              </div>
            )}
          </div>
        )}

        {/* Checkout View */}
        {currentView === 'checkout' && (
          <>
            {/* Cart Items */}
            {cart.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaShoppingCart size={16} /> Your Order ({getCartItemCount()} items)
                </h3>
                {cart.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>₹{item.price} x {item.quantity}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                        <FaMinus size={10} color="#6b7280" />
                      </button>
                      <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => addToCart(item)} style={{ background: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                        <FaPlus size={10} color="white" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setCurrentView('menu')}
                  style={{
                    width: '100%',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  + Add More Items
                </button>
              </div>
            )}

            {/* Offers Section */}
            {offers.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaGift size={16} color="#f59e0b" /> Available Offers
                </h3>
                {offers.map(offer => {
                  const isSelected = selectedOffer?.id === offer.id;
                  const meetsMinOrder = getCartSubtotal() >= (offer.minOrderValue || 0);
                  const isApplicable = meetsMinOrder;

                  return (
                    <button
                      key={offer.id}
                      onClick={() => isApplicable && setSelectedOffer(isSelected ? null : offer)}
                      disabled={!isApplicable}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px',
                        backgroundColor: isSelected ? '#fef2f2' : isApplicable ? '#f9fafb' : '#f3f4f6',
                        border: isSelected ? '2px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: isApplicable ? 'pointer' : 'not-allowed',
                        opacity: isApplicable ? 1 : 0.6,
                        marginBottom: '8px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{offer.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {offer.discountType === 'percentage'
                            ? `${offer.discountValue}% off${offer.maxDiscount ? ` (max ₹${offer.maxDiscount})` : ''}`
                            : `₹${offer.discountValue} off`}
                          {offer.minOrderValue > 0 && ` on ₹${offer.minOrderValue}+`}
                        </div>
                        {!meetsMinOrder && (
                          <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                            Add ₹{(offer.minOrderValue - getCartSubtotal()).toFixed(0)} more
                          </div>
                        )}
                      </div>
                      {isSelected && <FaCheck size={16} color="#ef4444" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loyalty Points Redemption */}
            {customerAppSettings?.loyaltySettings?.enabled && (customerData?.loyaltyPoints || 0) > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCoins size={16} color="#7c3aed" /> Redeem Points
                </h3>
                <div style={{
                  backgroundColor: '#f5f3ff',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#5b21b6' }}>Available Points</span>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#7c3aed' }}>{customerData?.loyaltyPoints}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    <span>Points to Redeem</span>
                    <span>{redeemLoyaltyPoints} pts = ₹{getLoyaltyDiscount().toFixed(2)} off</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(
                      customerData?.loyaltyPoints || 0,
                      Math.floor((getCartSubtotal() - getOfferDiscount()) * (customerAppSettings.loyaltySettings.maxRedemptionPercent || 20) / 100 * (customerAppSettings.loyaltySettings.redemptionRate || 100))
                    )}
                    value={redeemLoyaltyPoints}
                    onChange={(e) => setRedeemLoyaltyPoints(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', accentColor: '#7c3aed' }}
                  />
                </div>
              </div>
            )}

            {/* Order Summary */}
            {cart.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
                  Bill Summary
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ color: '#374151' }}>₹{getCartSubtotal().toFixed(2)}</span>
                </div>
                {getOfferDiscount() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#059669' }}>Offer Discount</span>
                    <span style={{ color: '#059669' }}>-₹{getOfferDiscount().toFixed(2)}</span>
                  </div>
                )}
                {getLoyaltyDiscount() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#7c3aed' }}>Points Discount</span>
                    <span style={{ color: '#7c3aed' }}>-₹{getLoyaltyDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: '700',
                  paddingTop: '12px',
                  borderTop: '2px solid #f3f4f6',
                  marginTop: '8px'
                }}>
                  <span style={{ color: '#1f2937' }}>Total</span>
                  <span style={{ color: '#ef4444' }}>₹{getFinalTotal().toFixed(2)}</span>
                </div>
                {getLoyaltyPointsToEarn() > 0 && (
                  <div style={{
                    backgroundColor: '#f5f3ff',
                    borderRadius: '8px',
                    padding: '10px',
                    marginTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12px', color: '#5b21b6' }}>Points you&apos;ll earn</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed' }}>+{getLoyaltyPointsToEarn()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {/* Place Order Button */}
            {cart.length > 0 && (
              <button
                onClick={placeOrderWithVerification}
                disabled={placingOrder}
                style={{
                  width: '100%',
                  background: placingOrder
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '18px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: placingOrder ? 'not-allowed' : 'pointer',
                  fontSize: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: placingOrder ? 'none' : '0 6px 20px rgba(239, 68, 68, 0.35)'
                }}
              >
                {placingOrder ? (
                  <>
                    <FaSpinner size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <FaUtensils size={18} />
                    Place Order - ₹{getFinalTotal().toFixed(2)}
                  </>
                )}
              </button>
            )}

            {cart.length === 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <FaShoppingCart size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>Your cart is empty</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }}>Add some delicious items to get started</p>
                <button
                  onClick={() => setCurrentView('menu')}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Browse Menu
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const OnlineOrderPage = () => {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <OnlineOrderContent />
    </Suspense>
  );
};

export default OnlineOrderPage;
