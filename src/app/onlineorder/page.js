'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
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

// ============================================
// CUSTOMER SESSION MANAGEMENT
// This is SEPARATE from restaurant owner/staff auth
// Customers can ONLY access onlineorder page, NOT dashboard
// ============================================
const CUSTOMER_SESSION_KEY = 'dine_customer_session'; // Different from main app auth
const SESSION_EXPIRY_DAYS = 7; // Session valid for 7 days

const getCustomerSession = (restaurantId) => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionData = localStorage.getItem(`${CUSTOMER_SESSION_KEY}_${restaurantId}`);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);

    // Check if session is expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(`${CUSTOMER_SESSION_KEY}_${restaurantId}`);
      return null;
    }

    // Verify session is for the correct restaurant (security check)
    if (session.restaurantId !== restaurantId) {
      return null;
    }

    return session;
  } catch (error) {
    console.warn('Error reading customer session:', error);
    return null;
  }
};

const saveCustomerSession = (restaurantId, sessionData) => {
  if (typeof window === 'undefined') return;
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    const session = {
      ...sessionData,
      restaurantId, // Store restaurant ID for security validation
      expiresAt: expiresAt.toISOString(),
      sessionType: 'customer', // Mark as customer session (NOT owner/staff)
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(`${CUSTOMER_SESSION_KEY}_${restaurantId}`, JSON.stringify(session));
  } catch (error) {
    console.warn('Error saving customer session:', error);
  }
};

const clearCustomerSession = (restaurantId) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${CUSTOMER_SESSION_KEY}_${restaurantId}`);
  } catch (error) {
    console.warn('Error clearing customer session:', error);
  }
};

// ============================================
// DATA CACHING FOR FASTER PAGE LOADS
// Cache menu, offers, settings in localStorage
// Show cached data immediately, fetch fresh in background
// ============================================
const CACHE_KEY_PREFIX = 'dine_cache';
const CACHE_EXPIRY_MINUTES = 30; // Cache expires after 30 minutes

const getCachedData = (restaurantId, dataType) => {
  if (typeof window === 'undefined') return null;
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}_${restaurantId}_${dataType}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_MINUTES * 60 * 1000;

    // Return cached data even if expired (will be refreshed in background)
    // But mark it as stale if expired
    const isStale = (now - timestamp) > expiryTime;
    return { data, isStale };
  } catch (error) {
    console.warn('Error reading cache:', error);
    return null;
  }
};

const setCachedData = (restaurantId, dataType, data) => {
  if (typeof window === 'undefined') return;
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}_${restaurantId}_${dataType}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error saving cache:', error);
  }
};

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

const OnlineOrderContent = ({ restaurantIdProp = null }) => {
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
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [hasAutoApplied, setHasAutoApplied] = useState(false); // Track if auto-apply has been done
  const [customerData, setCustomerData] = useState(null);
  const [customerAppSettings, setCustomerAppSettings] = useState(null);
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(0);
  const [customerVerified, setCustomerVerified] = useState(false);
  const [loyaltyHistory, setLoyaltyHistory] = useState(null);
  const [orderHistory, setOrderHistory] = useState(null);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // UI State for post-OTP experience
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'checkout', 'profile', 'history'
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // New: separate login popup
  const [sessionRestored, setSessionRestored] = useState(false); // Track if we've checked session

  const restaurantId = restaurantIdProp || searchParams.get('restaurant') || 'default';
  const seatNumber = searchParams.get('seat') || '';

  useEffect(() => {
    setCustomerInfo(prev => ({
      ...prev,
      seatNumber
    }));
  }, [seatNumber]);

  // ============================================
  // RESTORE SESSION ON PAGE LOAD
  // ============================================
  useEffect(() => {
    if (!restaurantId || restaurantId === 'default' || sessionRestored) return;

    const restoreSession = async () => {
      const session = getCustomerSession(restaurantId);

      if (session && session.phone && session.firebaseUid) {
        console.log('Restoring customer session for:', session.phone);

        // Restore state from session
        setCustomerInfo(prev => ({
          ...prev,
          phone: session.phone,
          name: session.name || prev.name
        }));
        setFirebaseUid(session.firebaseUid);
        setCustomerVerified(true);

        // Restore customer data if available
        if (session.customerData) {
          setCustomerData(session.customerData);
        }

        // Fetch fresh customer data from server
        try {
          const response = await apiClient.lookupCustomerByPhone(restaurantId, session.phone);
          if (response?.customer) {
            setCustomerData(response.customer);

            // Fetch loyalty history if customer found
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

            // Update session with fresh customer data
            saveCustomerSession(restaurantId, {
              ...session,
              customerData: response.customer
            });
          }
        } catch (error) {
          console.warn('Failed to refresh customer data:', error);
        }
      }

      setSessionRestored(true);
    };

    restoreSession();
  }, [restaurantId, sessionRestored]);

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

  // Helper to filter valid offers
  const filterValidOffers = (offersData) => {
    if (!offersData?.offers) return [];
    const now = new Date();
    return offersData.offers.filter(offer => {
      if (!offer.isActive) return false;
      if (offer.validUntil) {
        const expiryDate = new Date(offer.validUntil);
        expiryDate.setHours(23, 59, 59, 999);
        if (expiryDate < now) return false;
      }
      if (offer.validFrom) {
        const startDate = new Date(offer.validFrom);
        startDate.setHours(0, 0, 0, 0);
        if (startDate > now) return false;
      }
      if (offer.usageLimit && offer.usageCount >= offer.usageLimit) return false;
      return true;
    });
  };

  // Load restaurant data with caching for faster loads
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // STEP 1: Show cached data immediately (instant UI)
        const cachedMenu = getCachedData(restaurantId, 'menu');
        const cachedOffers = getCachedData(restaurantId, 'offers');
        const cachedSettings = getCachedData(restaurantId, 'settings');

        let hasCachedMenu = false;
        if (cachedMenu?.data) {
          setRestaurant(cachedMenu.data.restaurant);
          setMenu(cachedMenu.data.menu);
          const uniqueCategories = [...new Set(cachedMenu.data.menu.map(item => item.category).filter(Boolean))];
          setCategories(['all', ...uniqueCategories]);
          hasCachedMenu = true;
          // End loading immediately if we have cached menu
          setLoading(false);
        }
        if (cachedOffers?.data) {
          setOffers(filterValidOffers({ offers: cachedOffers.data }));
        }
        if (cachedSettings?.data) {
          setCustomerAppSettings(cachedSettings.data);
        }

        // STEP 2: Fetch fresh menu data (required)
        const response = await apiClient.getPublicMenu(restaurantId);

        if (response.success && response.restaurant && response.menu) {
          setRestaurant(response.restaurant);
          setMenu(response.menu);
          const uniqueCategories = [...new Set(response.menu.map(item => item.category).filter(Boolean))];
          setCategories(['all', ...uniqueCategories]);

          // Cache the fresh menu data
          setCachedData(restaurantId, 'menu', {
            restaurant: response.restaurant,
            menu: response.menu
          });

          // End loading after menu is loaded (don't wait for offers)
          setLoading(false);

          // STEP 3: Fetch offers and settings in background (non-blocking)
          Promise.all([
            apiClient.getActiveOffers(restaurantId),
            apiClient.getPublicCustomerAppSettings(restaurantId)
          ]).then(([offersResponse, settingsResponse]) => {
            if (offersResponse?.offers) {
              const validOffers = filterValidOffers(offersResponse);
              setOffers(validOffers);
              // Cache offers
              setCachedData(restaurantId, 'offers', validOffers);
            }
            if (settingsResponse?.settings) {
              setCustomerAppSettings(settingsResponse.settings);
              // Cache settings
              setCachedData(restaurantId, 'settings', settingsResponse.settings);
            }
          }).catch(extrasError => {
            console.warn('Failed to load offers/settings:', extrasError);
          });

        } else {
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Only show error if we don't have cached data
        const cachedMenu = getCachedData(restaurantId, 'menu');
        if (!cachedMenu?.data) {
          if (apiError.status === 404 || apiError.message?.includes('not found')) {
            setError(`Restaurant not found. Please check the QR code or contact the restaurant.`);
          } else {
            setError(`Failed to load restaurant data: ${apiError.message || 'Unknown error'}`);
          }
        }
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  // Compute applicable offers - filter out first-order-only offers for returning customers
  const applicableOffers = offers.filter(offer => {
    // If offer is first-order-only and customer is NOT a first-time customer, hide it
    if (offer.isFirstOrderOnly && customerData && customerData.isFirstOrder === false) {
      return false;
    }
    return true;
  });

  // Auto-apply best offer(s) ONLY ONCE on initial load when cart has items
  // After auto-apply, user has full control to select/deselect offers
  useEffect(() => {
    // Clear selections when cart is empty
    if (cart.length === 0) {
      setSelectedOffers(prev => prev.length > 0 ? [] : prev); // Only update if not already empty
      setHasAutoApplied(false); // Reset so auto-apply works again when cart has items
      return;
    }

    // Skip if auto-apply is disabled or already done
    if (!customerAppSettings?.offerSettings?.autoApplyBestOffer) return;
    if (hasAutoApplied) return; // Don't override user's manual selection
    if (!applicableOffers.length) return;

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const allowMultiple = customerAppSettings?.offerSettings?.allowMultipleOffers ?? false;
    const maxOffers = customerAppSettings?.offerSettings?.maxOffersAllowed ?? 1;

    // Calculate discount for each applicable offer and sort by best discount
    const offersWithDiscount = applicableOffers
      .filter(offer => subtotal >= (offer.minOrderValue || 0))
      .map(offer => {
        let discount = 0;
        if (offer.discountType === 'percentage') {
          discount = (subtotal * offer.discountValue) / 100;
          if (offer.maxDiscount && discount > offer.maxDiscount) {
            discount = offer.maxDiscount;
          }
        } else {
          discount = offer.discountValue;
        }
        discount = Math.min(discount, subtotal);
        return { ...offer, calculatedDiscount: discount };
      })
      .sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    // Select best offer(s) based on settings
    const offersToSelect = allowMultiple
      ? offersWithDiscount.slice(0, maxOffers)
      : offersWithDiscount.slice(0, 1);

    if (offersToSelect.length > 0) {
      setSelectedOffers(offersToSelect);
      setHasAutoApplied(true); // Mark as done so user can now modify freely
    }
  }, [cart, applicableOffers, hasAutoApplied, customerAppSettings?.offerSettings?.autoApplyBestOffer, customerAppSettings?.offerSettings?.allowMultipleOffers, customerAppSettings?.offerSettings?.maxOffersAllowed]);

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

  // Calculate offer discount (supports multiple offers)
  const getOfferDiscount = () => {
    if (!selectedOffers || selectedOffers.length === 0) return 0;
    const subtotal = getCartSubtotal();
    let totalDiscount = 0;

    for (const offer of selectedOffers) {
      if (subtotal < (offer.minOrderValue || 0)) continue;
      if (offer.isFirstOrderOnly && customerData && !customerData.isFirstOrder) continue;

      let discount = 0;
      if (offer.discountType === 'percentage') {
        discount = (subtotal * offer.discountValue) / 100;
        if (offer.maxDiscount && discount > offer.maxDiscount) {
          discount = offer.maxDiscount;
        }
      } else {
        discount = offer.discountValue;
      }
      totalDiscount += discount;
    }

    return Math.min(totalDiscount, subtotal);
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
    const loyaltySettings = customerAppSettings.loyaltySettings;

    // Check if user is redeeming points
    if (redeemLoyaltyPoints > 0) {
      // If earnPointsOnRedemption is false (default), no points earned when redeeming
      if (!loyaltySettings.earnPointsOnRedemption) {
        return 0;
      }

      const earnPerAmount = loyaltySettings.earnPerAmount || 100;
      const pointsEarned = loyaltySettings.pointsEarned || 4;

      // If earnOnFullAmount is true, calculate on full amount before redemption
      if (loyaltySettings.earnOnFullAmount) {
        const subtotal = getCartSubtotal();
        const offerDiscount = getOfferDiscount();
        const amountBeforeRedemption = subtotal - offerDiscount;
        return Math.floor(amountBeforeRedemption / earnPerAmount) * pointsEarned;
      } else {
        // Default: Earn on remaining amount only (after redemption discount)
        return Math.floor(getFinalTotal() / earnPerAmount) * pointsEarned;
      }
    }

    // No redemption - calculate normally
    // Support new format (earnPerAmount/pointsEarned) and legacy format (pointsPerRupee)
    if (loyaltySettings.earnPerAmount && loyaltySettings.pointsEarned) {
      const earnPerAmount = loyaltySettings.earnPerAmount || 100;
      const pointsEarned = loyaltySettings.pointsEarned || 4;
      return Math.floor(getFinalTotal() / earnPerAmount) * pointsEarned;
    } else {
      const pointsPerRupee = loyaltySettings.pointsPerRupee || 1;
      return Math.floor(getFinalTotal() * pointsPerRupee);
    }
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

      let uid = null;

      if (verificationId === 'demo-verification-id') {
        if (otp === '123456') {
          uid = 'demo-firebase-uid';
        } else {
          setError('Invalid OTP. Use 123456 for demo.');
          return;
        }
      } else {
        const result = await verificationId.confirm(otp);
        uid = result.user.uid;
      }

      // Lookup customer and get data
      const customer = await lookupCustomer();
      setFirebaseUid(uid);

      // ============================================
      // SAVE SESSION TO LOCALSTORAGE
      // This allows session to persist on refresh
      // ============================================
      saveCustomerSession(restaurantId, {
        phone: customerInfo.phone.trim(),
        name: customerInfo.name || customer?.name || '',
        firebaseUid: uid,
        customerData: customer,
        customerId: customer?.id || null
      });

      setOtpSent(false);
      setShowOtpModal(false);
      setShowLoginPopup(false); // Close login popup
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
        offerIds: selectedOffers.map(o => o.id),
        redeemLoyaltyPoints: actualRedeemPoints,
        orderSource: 'online_order'
      };

      const response = await apiClient.placePublicOrder(restaurantId, orderData);

      let successMsg = 'Order placed successfully!';
      if (response.order?.loyaltyPointsEarned > 0) {
        successMsg += ` You earned ${response.order.loyaltyPointsEarned} loyalty points!`;
      }

      setSuccess(successMsg);
      setCart([]);
      setSelectedOffers([]);
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
    // Clear session from localStorage
    clearCustomerSession(restaurantId);

    // Clear all customer state
    setCustomerVerified(false);
    setCustomerData(null);
    setFirebaseUid(null);
    setLoyaltyHistory(null);
    setCurrentView('menu');
    setRedeemLoyaltyPoints(0);
    setCustomerInfo(prev => ({ ...prev, phone: '', name: '' }));
  };

  // ============================================
  // HANDLE CART CLICK
  // If not logged in, show login popup instead of cart
  // ============================================
  const handleCartClick = () => {
    if (!customerVerified) {
      // User not logged in - show login popup
      setShowLoginPopup(true);
    } else {
      // User is logged in - show cart
      setShowCart(true);
    }
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

  // Load order history for the History tab (used inside CheckoutView). No cache: always fetches latest.
  const loadOrderHistory = useCallback(async () => {
    if (!customerData?.id) return;
    setOrderHistoryLoading(true);
    try {
      const response = await apiClient.getCustomerOrderHistory(customerData.id);
      if (response) setOrderHistory(response);
    } catch (err) {
      console.warn('Failed to load order history:', err);
    } finally {
      setOrderHistoryLoading(false);
    }
  }, [customerData?.id]);

  // Load loyalty/points history for the History tab. No cache: always fetches latest when opening History.
  const loadLoyaltyHistory = useCallback(async () => {
    if (!customerData?.id) return;
    try {
      const historyResponse = await apiClient.getCustomerLoyaltyHistory(customerData.id);
      if (historyResponse) setLoyaltyHistory(historyResponse);
    } catch (err) {
      console.warn('Failed to load loyalty history:', err);
    }
  }, [customerData?.id]);

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
        offers={applicableOffers}
        selectedOffers={selectedOffers}
        setSelectedOffers={setSelectedOffers}
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
        orderHistory={orderHistory}
        orderHistoryLoading={orderHistoryLoading}
        loadOrderHistory={loadOrderHistory}
        loadLoyaltyHistory={loadLoyaltyHistory}
        expandedOrderId={expandedOrderId}
        setExpandedOrderId={setExpandedOrderId}
      />
    );
  }

  // Menu view (default)
  // Get branding colors for use outside IIFE
  const offerGradientStart = customerAppSettings?.branding?.offerGradientStart || '#fef3c7';
  const offerGradientEnd = customerAppSettings?.branding?.offerGradientEnd || '#fde68a';
  const pageBackgroundColor = customerAppSettings?.branding?.pageBackgroundColor || '#f8fafc';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: pageBackgroundColor,
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

      {/* Header - Branded */}
      {(() => {
        // Get branding colors
        const brandColor = customerAppSettings?.branding?.primaryColor || '#ef4444';
        const textColor = customerAppSettings?.branding?.textColor || '#ffffff';
        const pageBackgroundColor = customerAppSettings?.branding?.pageBackgroundColor || '#f8fafc';
        const offerGradientStart = customerAppSettings?.branding?.offerGradientStart || '#fef3c7';
        const offerGradientEnd = customerAppSettings?.branding?.offerGradientEnd || '#fde68a';
        const brandColorLight = brandColor + '22';
        const brandColorShadow = brandColor + '44';
        const logoUrl = customerAppSettings?.branding?.logoUrl || restaurant?.logo;
        const tagline = customerAppSettings?.branding?.tagline || 'Online Ordering';
        const headerStyle = customerAppSettings?.branding?.headerStyle || 'modern';

        // Helper to darken color for gradient
        const getDarkerShade = (hex) => {
          const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30);
          const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30);
          const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        const brandColorDark = getDarkerShade(brandColor);

        return (
          <div style={{
            position: 'sticky',
            top: 0,
            background: headerStyle === 'gradient'
              ? `linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%)`
              : headerStyle === 'solid'
              ? brandColor
              : 'white',
            zIndex: 100,
            padding: isScrolled ? '8px 12px' : '12px 16px',
            boxShadow: isScrolled ? '0 2px 12px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
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
                {/* Restaurant Logo */}
                <div style={{
                  width: isScrolled ? '36px' : '48px',
                  height: isScrolled ? '36px' : '48px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: logoUrl
                    ? 'white'
                    : `linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: headerStyle === 'modern'
                    ? `0 4px 12px ${brandColorShadow}`
                    : '0 2px 8px rgba(0,0,0,0.15)',
                  border: logoUrl ? '2px solid #f3f4f6' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={restaurant?.name || 'Restaurant'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span style="font-size: 24px;">🍽️</span>';
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: isScrolled ? '18px' : '24px',
                      filter: headerStyle !== 'modern' ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                    }}>🍽️</span>
                  )}
                </div>

                {/* Restaurant Name & Tagline */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{
                    fontSize: isScrolled ? '15px' : '20px',
                    fontWeight: '700',
                    color: ['gradient', 'solid'].includes(headerStyle) ? textColor : '#1f2937',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textShadow: ['gradient', 'solid'].includes(headerStyle) ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    letterSpacing: '-0.3px'
                  }}>
                    {restaurant?.name || 'Restaurant'}
                  </h1>
                  {!isScrolled && tagline && (
                    <p style={{
                      fontSize: '12px',
                      color: ['gradient', 'solid'].includes(headerStyle) ? textColor : '#6b7280',
                      margin: '3px 0 0',
                      fontWeight: '500',
                      letterSpacing: '0.2px',
                      opacity: ['gradient', 'solid'].includes(headerStyle) ? 0.85 : 1
                    }}>
                      {tagline}
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
                      background: ['gradient', 'solid'].includes(headerStyle) ? `${textColor}33` : '#f3f4f6',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: ['gradient', 'solid'].includes(headerStyle) ? 'blur(10px)' : 'none'
                    }}
                  >
                    <FaUser size={16} color={['gradient', 'solid'].includes(headerStyle) ? textColor : '#6b7280'} />
                  </button>
                )}
                <button
                  onClick={handleCartClick}
                  style={{
                    position: 'relative',
                    background: customerVerified
                      ? ['gradient', 'solid'].includes(headerStyle)
                        ? `${textColor}20`
                        : `linear-gradient(135deg, ${brandColor}, ${brandColorDark})`
                      : ['gradient', 'solid'].includes(headerStyle)
                        ? `${textColor}15`
                        : 'linear-gradient(135deg, #6b7280, #4b5563)',
                    color: ['gradient', 'solid'].includes(headerStyle) ? textColor : 'white',
                    border: ['gradient', 'solid'].includes(headerStyle) ? `1px solid ${textColor}30` : 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: customerVerified
                      ? ['gradient', 'solid'].includes(headerStyle)
                        ? '0 2px 8px rgba(0,0,0,0.15)'
                        : `0 2px 8px ${brandColorShadow}`
                      : '0 2px 8px rgba(107, 114, 128, 0.3)',
                    backdropFilter: ['gradient', 'solid'].includes(headerStyle) ? 'blur(10px)' : 'none'
                  }}
                >
                  {!customerVerified && <FaLock size={12} />}
                  <FaShoppingCart size={16} />
                  {getCartItemCount() > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: brandColor,
                      color: textColor,
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${brandColor}`
                    }}>
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {/* Search */}
            <div style={{
              position: 'relative',
              marginBottom: isScrolled ? '8px' : '12px',
              padding: ['gradient', 'solid'].includes(headerStyle) ? '0 4px' : 0
            }}>
              <FaSearch size={14} color="#9ca3af" style={{
                position: 'absolute',
                left: ['gradient', 'solid'].includes(headerStyle) ? '18px' : '14px',
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
                  border: ['gradient', 'solid'].includes(headerStyle) ? 'none' : '2px solid #f3f4f6',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: ['gradient', 'solid'].includes(headerStyle) ? 'rgba(255,255,255,0.95)' : '#f9fafb',
                  boxSizing: 'border-box',
                  boxShadow: ['gradient', 'solid'].includes(headerStyle) ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = brandColor;
                  e.target.style.boxShadow = `0 0 0 3px ${brandColor}22`;
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = ['gradient', 'solid'].includes(headerStyle) ? 'rgba(255,255,255,0.95)' : '#f9fafb';
                  e.target.style.borderColor = '#f3f4f6';
                  e.target.style.boxShadow = ['gradient', 'solid'].includes(headerStyle) ? '0 2px 8px rgba(0,0,0,0.1)' : 'none';
                }}
              />
            </div>

            {/* Categories */}
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              padding: ['gradient', 'solid'].includes(headerStyle) ? '0 4px 8px' : '0 0 8px'
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
                      ? ['gradient', 'solid'].includes(headerStyle)
                        ? `${textColor}20`
                        : `linear-gradient(135deg, ${brandColor}, ${brandColorDark})`
                      : ['gradient', 'solid'].includes(headerStyle)
                        ? `${textColor}15`
                        : '#ffffff',
                    color: selectedCategory === category
                      ? ['gradient', 'solid'].includes(headerStyle) ? textColor : 'white'
                      : ['gradient', 'solid'].includes(headerStyle) ? textColor : '#64748b',
                    border: selectedCategory === category
                      ? ['gradient', 'solid'].includes(headerStyle) ? `1px solid ${textColor}40` : 'none'
                      : ['gradient', 'solid'].includes(headerStyle) ? `1px solid ${textColor}30` : '1px solid #e5e7eb',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: selectedCategory === category
                      ? ['gradient', 'solid'].includes(headerStyle) ? '0 2px 8px rgba(0,0,0,0.15)' : `0 2px 8px ${brandColorShadow}`
                      : 'none',
                    backdropFilter: ['gradient', 'solid'].includes(headerStyle) ? 'blur(10px)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Offers Banner - Carousel for multiple offers - Right after header */}
      {applicableOffers.length > 0 && (
        <div style={{ marginTop: '0', marginBottom: '0' }}>
          <OffersBanner
            offers={applicableOffers}
            gradientStart={offerGradientStart}
            gradientEnd={offerGradientEnd}
          />
        </div>
      )}

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

      {/* Cart Modal - Only shown to logged-in users */}
      {showCart && customerVerified && (
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
          onCheckout={() => {
            setShowCart(false);
            setCurrentView('checkout');
          }}
          sendingOtp={sendingOtp}
          setCart={setCart}
          customerVerified={customerVerified}
        />
      )}

      {/* Login Popup - Shows when user clicks cart without being logged in */}
      {showLoginPopup && !customerVerified && (
        <LoginPopup
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          sendingOtp={sendingOtp}
          error={error}
          setError={setError}
          onClose={() => setShowLoginPopup(false)}
          onSendOtp={async () => {
            if (!customerInfo.phone.trim()) {
              setError('Please enter your phone number');
              return;
            }
            setError('');
            await sendOtp();
          }}
          cartItemCount={getCartItemCount()}
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
            setShowLoginPopup(false);
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

// Offers Banner Component - Shows carousel of active offers
const OffersBanner = ({ offers, gradientStart, gradientEnd }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && offers.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }
    if (isRightSwipe && offers.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offers.length, isPaused]);

  if (offers.length === 0) return null;

  const getOfferGradient = () => {
    if (gradientStart && gradientEnd) {
      return `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;
    }
    return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: '0',
        zIndex: 99,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .offer-card { animation: slideIn 0.5s ease-out; }
        .offer-badge { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Main carousel container with nav buttons outside */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Left Navigation Button */}
        {offers.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.98)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              minWidth: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <FaChevronRight style={{ transform: 'rotate(180deg)' }} size={10} color="#374151" />
          </button>
        )}

        {/* Carousel Container */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            flex: 1,
            minWidth: 0
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Offer Cards Container */}
          <div style={{
            display: 'flex',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  minWidth: '100%',
                  background: getOfferGradient(),
                  padding: '14px 16px',
                  boxSizing: 'border-box',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-30%',
                  right: '-15%',
                  width: '150%',
                  height: '150%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }} />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Offer Icon - smaller on mobile */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {offer.discountType === 'percentage' ? '🏷️' : '💰'}
                    </span>
                  </div>

                  {/* Offer Details - better text handling */}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2'
                    }}>
                      {offer.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#374151',
                      fontWeight: '600',
                      lineHeight: '1.3'
                    }}>
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue} OFF`}
                      {offer.minOrderValue > 0 && (
                        <span style={{ fontWeight: '500', color: '#4b5563' }}>
                          {' '}on ₹{offer.minOrderValue}+
                        </span>
                      )}
                    </div>
                    {offer.validUntil && (
                      <div style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        marginTop: '3px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}>
                        ⏰ Till {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>

                  {/* Discount Badge - compact */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    minWidth: '54px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: '#1f2937',
                      lineHeight: 1
                    }}>
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                    </div>
                    <div style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      marginTop: '1px'
                    }}>
                      OFF
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {offers.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '5px',
              zIndex: 10
            }}>
              {offers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: currentIndex === index ? '16px' : '5px',
                    height: '5px',
                    borderRadius: '3px',
                    backgroundColor: currentIndex === index ? '#374151' : 'rgba(0,0,0,0.25)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Navigation Button */}
        {offers.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % offers.length)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.98)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              minWidth: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <FaChevronRight size={10} color="#374151" />
          </button>
        )}
      </div>

      {/* Offer Count Indicator */}
      {offers.length > 1 && (
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          <span style={{
            backgroundColor: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            {currentIndex + 1}/{offers.length} offers
          </span>
        </div>
      )}
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard = ({ item, onAddToCart, onRemoveFromCart, cartQuantity, getCategoryColor }) => {
  const isVeg = item.isVeg !== false;

  // Use getDisplayImage to get proper image URL (user uploaded or placeholder)
  const imageUrl = getDisplayImage(item);
  const hasUserImages = item.images && item.images.length > 0;

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
        {hasUserImages ? (
          <ImageCarousel
            images={item.images}
            itemName={item.name}
            maxHeight="100px"
            showControls={false}
            showDots={false}
            autoPlay={true}
            autoPlayInterval={4000}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
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
          {/* Logged in user info */}
          {customerVerified && customerInfo.phone && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <FaCheck size={12} color="#22c55e" />
              <span style={{ fontSize: '13px', color: '#166534' }}>
                Logged in as <strong>{customerInfo.phone}</strong>
              </span>
            </div>
          )}
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

        {/* Checkout Section - Simplified for logged-in users */}
        {cart.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
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

            {/* Checkout Button - Direct checkout for logged-in users */}
            <button
              onClick={onCheckout}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FaChevronRight size={16} />
              Proceed to Checkout - ₹{getCartTotal().toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Login Popup Component - Shows when user clicks cart without being logged in
const LoginPopup = ({ customerInfo, setCustomerInfo, sendingOtp, error, setError, onClose, onSendOtp, cartItemCount }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '28px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
          }}>
            <FaUser size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px' }}>
            Login to Continue
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {cartItemCount > 0
              ? `You have ${cartItemCount} item${cartItemCount > 1 ? 's' : ''} in cart. Login to checkout!`
              : 'Login to view your cart and place orders'}
          </p>
        </div>

        {/* Benefits */}
        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
            Benefits of logging in:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Earn loyalty points on every order', 'Redeem points for discounts', 'Access exclusive offers', 'Track your order history'].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#15803d' }}>
                <FaCheck size={10} color="#22c55e" /> {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
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

        {/* Phone Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            <FaPhone size={12} style={{ marginRight: '6px' }} />
            Phone Number
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              +91
            </span>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => {
                setError('');
                setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10)});
              }}
              placeholder="Enter 10-digit number"
              style={{
                width: '100%',
                padding: '14px 14px 14px 52px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSendOtp}
            disabled={sendingOtp || customerInfo.phone.length !== 10}
            style={{
              flex: 1.5,
              background: sendingOtp || customerInfo.phone.length !== 10
                ? '#d1d5db'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: sendingOtp || customerInfo.phone.length !== 10 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: sendingOtp || customerInfo.phone.length !== 10
                ? 'none'
                : '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            {sendingOtp ? (
              <>
                <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Sending OTP...
              </>
            ) : (
              <>
                <FaLock size={14} />
                Get OTP
              </>
            )}
          </button>
        </div>

        {/* Privacy Note */}
        <p style={{
          fontSize: '11px',
          color: '#9ca3af',
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: 0
        }}>
          We&apos;ll send a verification code to your phone
        </p>
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
  selectedOffers,
  setSelectedOffers,
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
  setCart,
  orderHistory,
  orderHistoryLoading,
  loadOrderHistory,
  loadLoyaltyHistory,
  expandedOrderId,
  setExpandedOrderId
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
              onClick={() => {
                setCurrentView('history');
                // Always fetch latest order & loyalty history when opening History tab (no cache)
                if (customerData?.id) {
                  loadOrderHistory();
                  loadLoyaltyHistory?.();
                }
              }}
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
          <div>
            {/* Order History Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaShoppingCart size={16} /> Order History
              </h3>

              {orderHistoryLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                  <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                  <p>Loading orders...</p>
                </div>
              ) : orderHistory?.orders && orderHistory.orders.length > 0 ? (
                <>
                  {/* Summary */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400e' }}>{orderHistory.summary?.pendingOrders || 0}</div>
                      <div style={{ fontSize: '11px', color: '#a16207' }}>Pending</div>
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#166534' }}>{orderHistory.summary?.completedOrders || 0}</div>
                      <div style={{ fontSize: '11px', color: '#15803d' }}>Completed</div>
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>{orderHistory.summary?.totalOrders || 0}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Total</div>
                    </div>
                  </div>

                  {/* Order List */}
                  {orderHistory.orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const statusColors = {
                      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
                      preparing: { bg: '#dbeafe', text: '#1e40af', label: 'Preparing' },
                      ready: { bg: '#d1fae5', text: '#065f46', label: 'Ready' },
                      completed: { bg: '#f0fdf4', text: '#166534', label: 'Completed' },
                      cancelled: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' }
                    };
                    const statusStyle = statusColors[order.status] || statusColors.pending;

                    return (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          marginBottom: '10px',
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {/* Order Header - Always visible */}
                        <div
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          style={{
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                                Order Number
                              </span>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                #{order.dailyOrderId ?? order.orderNumber ?? (order.id && order.id.slice(-6)) ?? '—'}
                              </span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text
                              }}>
                                {statusStyle.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              }) : 'N/A'}
                              {order.orderTypeLabel && ` • ${order.orderTypeLabel}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>₹{order.totalAmount}</div>
                              {order.loyaltyPointsEarned > 0 && (
                                <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: '600' }}>
                                  +{order.loyaltyPointsEarned} pts
                                </div>
                              )}
                            </div>
                            <FaChevronRight
                              size={12}
                              color="#9ca3af"
                              style={{
                                transition: 'transform 0.2s',
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                              }}
                            />
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div style={{
                            padding: '0 14px 14px',
                            borderTop: '1px solid #e2e8f0'
                          }}>
                            {/* Order Items */}
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                                Items ({order.items?.length || 0})
                              </div>
                              {order.items?.map((item, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  padding: '6px 0',
                                  borderBottom: idx < order.items.length - 1 ? '1px dashed #e2e8f0' : 'none'
                                }}>
                                  <div style={{ fontSize: '13px', color: '#374151' }}>
                                    {item.name} <span style={{ color: '#9ca3af' }}>x{item.quantity}</span>
                                  </div>
                                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                                    ₹{item.total || (item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order Summary */}
                            <div style={{
                              marginTop: '12px',
                              paddingTop: '10px',
                              borderTop: '1px solid #e2e8f0'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                              </div>
                              {order.discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#22c55e', marginBottom: '4px' }}>
                                  <span>Offer Discount {order.appliedOffer?.name && `(${order.appliedOffer.name})`}</span>
                                  <span>-₹{order.discountAmount}</span>
                                </div>
                              )}
                              {order.loyaltyDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7c3aed', marginBottom: '4px' }}>
                                  <span>Points Redeemed</span>
                                  <span>-₹{order.loyaltyDiscount}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#1f2937', marginTop: '6px' }}>
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                              </div>
                            </div>

                            {/* Order Number & Order ID (same as orderhistory) */}
                            <div style={{
                              marginTop: '12px',
                              paddingTop: '10px',
                              borderTop: '1px solid #e2e8f0',
                              fontSize: '12px',
                              color: '#374151'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600', color: '#6b7280' }}>Order Number</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>#{order.dailyOrderId ?? order.orderNumber ?? (order.id && order.id.slice(-6)) ?? '—'}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', wordBreak: 'break-all' }}>
                                <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0, marginRight: '8px' }}>Order ID</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '11px', textAlign: 'right' }} title={order.id}>{order.id}</span>
                              </div>
                            </div>

                            {/* Points Info */}
                            {(order.loyaltyPointsEarned > 0 || order.loyaltyPointsRedeemed > 0) && (
                              <div style={{
                                marginTop: '10px',
                                padding: '8px 10px',
                                backgroundColor: '#f5f3ff',
                                borderRadius: '8px',
                                display: 'flex',
                                gap: '12px'
                              }}>
                                {order.loyaltyPointsEarned > 0 && (
                                  <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>
                                    <FaCoins size={10} style={{ marginRight: '4px' }} />
                                    +{order.loyaltyPointsEarned} earned
                                  </div>
                                )}
                                {order.loyaltyPointsRedeemed > 0 && (
                                  <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>
                                    <FaCoins size={10} style={{ marginRight: '4px' }} />
                                    -{order.loyaltyPointsRedeemed} redeemed
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                  <FaShoppingCart size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>No orders yet</p>
                  <p style={{ fontSize: '12px', margin: '6px 0 0' }}>Your order history will appear here</p>
                </div>
              )}
            </div>

            {/* Points History Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCoins size={16} color="#7c3aed" /> Points History
              </h3>
              {loyaltyHistory?.history && loyaltyHistory.history.length > 0 ? (
                loyaltyHistory.history.slice(0, 5).map((item, index) => (
                  <div key={item.id || index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: item.type === 'earned' ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '8px',
                    marginBottom: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: item.type === 'earned' ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.type === 'earned' ? <FaPlus size={10} color="white" /> : <FaMinus size={10} color="white" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
                          {item.description || (item.type === 'earned' ? 'Points Earned' : 'Points Redeemed')}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: item.type === 'earned' ? '#166534' : '#dc2626'
                    }}>
                      {item.type === 'earned' ? '+' : '-'}{item.points}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  <FaCoins size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No points history yet</p>
                </div>
              )}
            </div>
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
                  {customerAppSettings?.offerSettings?.allowMultipleOffers && (
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>
                      (Select up to {customerAppSettings?.offerSettings?.maxOffersAllowed || 1})
                    </span>
                  )}
                </h3>
                {offers.map(offer => {
                  const isSelected = selectedOffers.some(o => o.id === offer.id);
                  const meetsMinOrder = getCartSubtotal() >= (offer.minOrderValue || 0);
                  const allowMultiple = customerAppSettings?.offerSettings?.allowMultipleOffers ?? false;
                  const maxOffers = customerAppSettings?.offerSettings?.maxOffersAllowed ?? 1;
                  const canSelectMore = selectedOffers.length < maxOffers || isSelected;
                  const isApplicable = meetsMinOrder && (allowMultiple ? canSelectMore : true);

                  const handleOfferClick = () => {
                    if (!isApplicable) return;
                    if (isSelected) {
                      // Remove from selection
                      setSelectedOffers(prev => prev.filter(o => o.id !== offer.id));
                    } else {
                      if (allowMultiple) {
                        // Add to selection (if under limit)
                        if (selectedOffers.length < maxOffers) {
                          setSelectedOffers(prev => [...prev, offer]);
                        }
                      } else {
                        // Single selection mode - replace
                        setSelectedOffers([offer]);
                      }
                    }
                  };

                  return (
                    <button
                      key={offer.id}
                      onClick={handleOfferClick}
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
                        {meetsMinOrder && !canSelectMore && !isSelected && (
                          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                            Max {maxOffers} offer{maxOffers > 1 ? 's' : ''} allowed
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
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#7c3aed' }}>{(customerData?.loyaltyPoints || 0) - redeemLoyaltyPoints}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    <span>Points to Redeem</span>
                    <span style={{ fontWeight: '600', color: '#5b21b6' }}>{redeemLoyaltyPoints} pts = ₹{getLoyaltyDiscount().toFixed(2)} off</span>
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

const OnlineOrderPage = ({ restaurantId = null }) => {
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
      <OnlineOrderContent restaurantIdProp={restaurantId} />
    </Suspense>
  );
};

export default OnlineOrderPage;
