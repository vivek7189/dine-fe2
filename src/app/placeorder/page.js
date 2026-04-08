'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaPhone, FaChair, FaUtensils, FaLeaf, FaDrumstickBite, FaSpinner, FaLock, FaTimes, FaHotel } from 'react-icons/fa';
import ImageCarousel from '../../components/ImageCarousel';
import UpiPaymentModal from '../../components/UpiPaymentModal';
import apiClient from '../../lib/api.js';
import { getDisplayImage } from '../../utils/placeholderImages';
import { calculateDiscountForOffer, calculateOfferResult, matchesAudience } from '../../hooks/useOfferEngine';

// Try to import Firebase modules with error handling
let firebaseAuth = null;
let firebaseConfig = null;

try {
  firebaseAuth = require('firebase/auth');
  firebaseConfig = require('../../../firebase');
  console.log('✅ Firebase modules loaded successfully');
} catch (error) {
  console.warn('⚠️ Firebase modules not available:', error.message);
}

// Helper function to get category-specific colors
const getCategoryColor = (category, opacity = 1) => {
  const colors = {
    'Pizza': `rgba(239, 68, 68, ${opacity})`,      // Red
    'Burgers': `rgba(249, 115, 22, ${opacity})`,   // Orange
    'Salads': `rgba(34, 197, 94, ${opacity})`,     // Green
    'Pasta': `rgba(168, 85, 247, ${opacity})`,     // Purple
    'Desserts': `rgba(236, 72, 153, ${opacity})`,  // Pink
    'appetizer': `rgba(59, 130, 246, ${opacity})`, // Blue
    'Tea': `rgba(245, 158, 11, ${opacity})`,       // Yellow
    'Samosa': `rgba(16, 185, 129, ${opacity})`,    // Teal
    'Main Course': `rgba(107, 114, 128, ${opacity})`, // Gray
    'default': `rgba(99, 102, 241, ${opacity})`    // Indigo
  };
  return colors[category] || colors['default'];
};

const PlaceOrderContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for theme parameter and redirect to themed pages if needed
  useEffect(() => {
    const theme = searchParams.get('theme');
    const restaurant = searchParams.get('restaurant');
    const seat = searchParams.get('seat');

    let cancelled = false;

    const finish = () => {
      if (!cancelled) setCheckingTheme(false);
    };
    
    // If theme is explicitly set in URL, use it
    if (theme === 'cube') {
      const params = new URLSearchParams();
      if (restaurant) params.set('restaurant', restaurant);
      if (seat) params.set('seat', seat);
      router.replace(`/placeorder/cube?${params.toString()}`);
      return;
    }

    if (theme === 'book') {
      const params = new URLSearchParams();
      if (restaurant) params.set('restaurant', restaurant);
      if (seat) params.set('seat', seat);
      router.replace(`/placeorder/book?${params.toString()}`);
      return;
    }

    if (theme === 'bistro') {
      const params = new URLSearchParams();
      if (restaurant) params.set('restaurant', restaurant);
      if (seat) params.set('seat', seat);
      router.replace(`/placeorder/bistro?${params.toString()}`);
      return;
    }

    if (theme === 'carousel') {
      const params = new URLSearchParams();
      if (restaurant) params.set('restaurant', restaurant);
      if (seat) params.set('seat', seat);
      router.replace(`/placeorder/carousel?${params.toString()}`);
      return;
    }

    if (theme === 'classic') {
      const params = new URLSearchParams();
      if (restaurant) params.set('restaurant', restaurant);
      if (seat) params.set('seat', seat);
      router.replace(`/placeorder/classic?${params.toString()}`);
      return;
    }

    const checkAndRedirect = async () => {
      try {
        // If theme explicitly provided in URL, redirect immediately
        if (theme === 'cube' || theme === 'book' || theme === 'bistro' || theme === 'carousel' || theme === 'classic') {
          const params = new URLSearchParams();
          if (restaurant) params.set('restaurant', restaurant);
          if (seat) params.set('seat', seat);

          const routes = {
            cube: '/placeorder/cube',
            book: '/placeorder/book',
            bistro: '/placeorder/bistro',
            carousel: '/placeorder/carousel',
            classic: '/placeorder/classic'
          };

          const dest = routes[theme];
          if (dest) {
            router.replace(`${dest}?${params.toString()}`);
            return;
          }
        }

        // If no theme in URL, check localStorage cache first, then backend
        if (restaurant && !theme) {
          const themeRoutes = {
            'bistro': '/placeorder/bistro',
            'cube': '/placeorder/cube',
            'book': '/placeorder/book',
            'carousel': '/placeorder/carousel',
            'classic': '/placeorder/classic',
          };

          // Check localStorage cache first for instant redirect
          const cacheKey = `dineopen_theme_${restaurant}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const { themeId, ts } = JSON.parse(cached);
              // Cache valid for 24 hours
              if (Date.now() - ts < 24 * 60 * 60 * 1000 && themeId && themeRoutes[themeId]) {
                const params = new URLSearchParams();
                params.set('restaurant', restaurant);
                if (seat) params.set('seat', seat);
                router.replace(`${themeRoutes[themeId]}?${params.toString()}`);
                return;
              }
            } catch (e) {
              localStorage.removeItem(cacheKey);
            }
          }

          const themeResponse = await apiClient.getPublicMenuTheme(restaurant);

          if (themeResponse?.success && themeResponse.themeId && themeResponse.themeId !== 'default') {
            // Cache the theme for next visit
            localStorage.setItem(cacheKey, JSON.stringify({ themeId: themeResponse.themeId, ts: Date.now() }));

            const params = new URLSearchParams();
            params.set('restaurant', restaurant);
            if (seat) params.set('seat', seat);

            const route = themeRoutes[themeResponse.themeId];
            if (route) {
              router.replace(`${route}?${params.toString()}`);
              return;
            }
          } else {
            // Cache "default" to avoid re-fetching
            localStorage.setItem(cacheKey, JSON.stringify({ themeId: 'default', ts: Date.now() }));
          }
        }
      } catch (error) {
        console.error('Error checking menu theme:', error);
        // Continue with default if theme check fails
      } finally {
        finish();
      }
    };

    checkAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    seatNumber: '',
    roomNumber: '', // NEW: Hotel room number
    name: ''
  });
  const [orderType, setOrderType] = useState('table'); // NEW: 'table' or 'room'
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
  const [checkingTheme, setCheckingTheme] = useState(true);

  // Loyalty & Offers state
  const [offers, setOffers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [hasAutoApplied, setHasAutoApplied] = useState(false); // Track if auto-apply has been done
  const [customerData, setCustomerData] = useState(null);
  const [customerAppSettings, setCustomerAppSettings] = useState(null);
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(0);
  const [customerVerified, setCustomerVerified] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiOrderAmount, setUpiOrderAmount] = useState(0);

  // Phase 4: phone-login gate + audience context for targeted offers
  const [customerPhoneForOffers, setCustomerPhoneForOffers] = useState('');
  const [customerGroupIds, setCustomerGroupIds] = useState([]);
  const [showPhoneGate, setShowPhoneGate] = useState(false);
  const [phoneGateInput, setPhoneGateInput] = useState('');
  const [phoneGateLoading, setPhoneGateLoading] = useState(false);
  const [unlockToast, setUnlockToast] = useState('');
  const [prevUnlockedIds, setPrevUnlockedIds] = useState([]);

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

  // Handle scroll for compact header with throttling to prevent flickering
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
        
        // Load from API
        try {
          console.log('🔍 Fetching public menu for restaurant:', restaurantId);
          const response = await apiClient.getPublicMenu(restaurantId);
          console.log('✅ API response:', response);
          
          if (response.success && response.restaurant && response.menu) {
            setRestaurant(response.restaurant);
            setMenu(response.menu);
            
            // Extract categories from real menu data
            const uniqueCategories = [...new Set(response.menu.map(item => item.category).filter(Boolean))];
            setCategories(['all', ...uniqueCategories]);
            
            console.log('✅ Loaded restaurant:', response.restaurant.name);
            console.log('✅ Loaded menu items:', response.menu.length);
            console.log('✅ Categories:', uniqueCategories);

            // Load offers and customer app settings
            try {
              const [offersResponse, settingsResponse] = await Promise.all([
                apiClient.getActiveOffers(restaurantId),
                apiClient.getPublicCustomerAppSettings(restaurantId)
              ]);

              if (offersResponse?.offers) {
                setOffers(offersResponse.offers);
                console.log('✅ Loaded offers:', offersResponse.offers.length);
              }

              if (settingsResponse?.settings) {
                setCustomerAppSettings(settingsResponse.settings);
                console.log('✅ Loaded customer app settings');
              }
            } catch (extrasError) {
              console.warn('⚠️ Failed to load offers/settings:', extrasError);
              // Continue without offers/settings - not critical
            }
          } else {
            throw new Error('Invalid API response format');
          }
        } catch (apiError) {
          console.error('❌ API error:', apiError);
          
          // Check if it's a 404 error (restaurant not found)
          if (apiError.status === 404 || apiError.message?.includes('Restaurant not found') || apiError.message?.includes('not found')) {
            setError(`Restaurant not found. The restaurant ID "${restaurantId}" does not exist in our database. Please check the QR code or contact the restaurant.`);
            setLoading(false);
            return;
          }
          
          // Check if it's a 500 error (server error)
          if (apiError.status === 500 || apiError.message?.includes('Internal Server Error')) {
            setError(`Server error occurred while loading restaurant data. Please try again later or contact support.`);
            setLoading(false);
            return;
          }
          
          // For other errors, show generic error message
          setError(`Failed to load restaurant data: ${apiError.message || 'Unknown error'}. Please check your internet connection and try again.`);
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

  // Phase 4: phone-login gate helpers
  const normalizePhoneForOffers = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  };

  // Load cached phone on mount
  useEffect(() => {
    if (!restaurantId || restaurantId === 'default') return;
    try {
      const cached = localStorage.getItem(`dineopen_placeorder_phone_${restaurantId}`);
      if (cached) {
        setCustomerPhoneForOffers(cached);
      }
    } catch (_) {}
  }, [restaurantId]);

  // Fetch customer groups whenever phone is known
  useEffect(() => {
    if (!restaurantId || restaurantId === 'default') return;
    const phone = normalizePhoneForOffers(customerPhoneForOffers);
    if (!phone) {
      setCustomerGroupIds([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.lookupPublicCustomerGroups(restaurantId, phone);
        if (cancelled) return;
        const ids = (res?.groups || []).map(g => g.id).filter(Boolean);
        setCustomerGroupIds(ids);
      } catch (_) {
        if (!cancelled) setCustomerGroupIds([]);
      }
      // Also lookup customer record (for isFirstOrder) — non-blocking
      try {
        const lookup = await apiClient.lookupCustomerByPhone(restaurantId, phone);
        if (!cancelled && lookup?.customer) {
          setCustomerData(lookup.customer);
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [restaurantId, customerPhoneForOffers]);

  // Schedule validation helpers
  const isScheduleValid = (offer) => {
    if (!offer.schedule || offer.schedule.type !== 'recurring') return true;
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const scheduleDays = offer.schedule.days || [];
    const startTime = offer.schedule.startTime || '00:00';
    const endTime = offer.schedule.endTime || '23:59';
    return scheduleDays.includes(currentDay) && currentTime >= startTime && currentTime <= endTime;
  };

  const [scheduleCheckKey, setScheduleCheckKey] = useState(0);

  // Smart schedule timer — precise timeout for next schedule transition
  useEffect(() => {
    if (offers.length === 0) return;
    const hasScheduled = offers.some(o => o.schedule?.type === 'recurring');
    if (!hasScheduled) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let minMs = null;

    for (const offer of offers) {
      if (offer.schedule?.type === 'recurring') {
        const days = offer.schedule.days || [];
        const [startH, startM] = (offer.schedule.startTime || '00:00').split(':').map(Number);
        const [endH, endM] = (offer.schedule.endTime || '23:59').split(':').map(Number);
        const startMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;

        if (days.includes(currentDay)) {
          if (currentMinutes < startMin) {
            const ms = (startMin - currentMinutes) * 60000 - (now.getSeconds() * 1000);
            if (minMs === null || ms < minMs) minMs = ms;
          } else if (currentMinutes < endMin) {
            const ms = (endMin - currentMinutes) * 60000 - (now.getSeconds() * 1000);
            if (minMs === null || ms < minMs) minMs = ms;
          }
        }
        if (!days.includes(currentDay) || currentMinutes >= endMin) {
          for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            if (days.includes(nextDay)) {
              const msToMidnight = ((24 * 60) - currentMinutes) * 60000 - (now.getSeconds() * 1000);
              const msFromMidnight = (i - 1) * 24 * 60 * 60000 + startMin * 60000;
              const ms = msToMidnight + msFromMidnight;
              if (minMs === null || ms < minMs) minMs = ms;
              break;
            }
          }
        }
      }
    }

    if (!minMs || minMs <= 0) return;
    const timeout = Math.min(minMs + 1000, 3600000);
    const timer = setTimeout(() => setScheduleCheckKey(prev => prev + 1), timeout);
    return () => clearTimeout(timer);
  }, [offers, scheduleCheckKey]);

  // Build customer context for offer engine (phone, id, groups, isFirstOrder)
  const customerContext = (() => {
    const phone = normalizePhoneForOffers(customerPhoneForOffers || customerInfo.phone);
    const ctx = {
      customerPhone: phone || undefined,
      customerId: customerData?.id,
      customerGroupIds,
      isFirstOrder: customerData?.isFirstOrder,
    };
    return (phone || customerData?.id) ? ctx : null;
  })();
  const hasAudienceContext = !!customerContext;

  // Compute applicable offers - filter by schedule, first-order, audience
  const applicableOffers = offers.reduce((acc, offer) => {
    if (!isScheduleValid(offer)) return acc;
    if (offer.isFirstOrderOnly && customerData && customerData.isFirstOrder === false) return acc;

    const audienceType = offer.audience?.type || (offer.isFirstOrderOnly ? 'first_order' : 'all');
    const isPublicAudience = audienceType === 'all' || audienceType === 'first_order';

    if (hasAudienceContext) {
      if (!matchesAudience(offer, customerContext)) return acc;
      acc.push(offer);
    } else if (isPublicAudience) {
      acc.push(offer);
    } else {
      // Targeted offer, no phone context — expose as locked
      acc.push({ ...offer, _requiresLogin: true });
    }
    return acc;
  }, []);

  // Toast when new offers get unlocked after phone-gate login
  const unlockedCount = applicableOffers.filter(o => !o._requiresLogin).length;
  useEffect(() => {
    setPrevUnlockedIds(prev => {
      if (prev.length && unlockedCount > prev.length) {
        const diff = unlockedCount - prev.length;
        setUnlockToast(`🎉 ${diff} new offer${diff > 1 ? 's' : ''} unlocked!`);
        setTimeout(() => setUnlockToast(''), 4000);
      }
      return new Array(unlockedCount);
    });
  }, [unlockedCount]);

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
      .filter(offer => !offer._requiresLogin && subtotal >= (offer.minOrderValue || 0))
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

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Legacy function name for compatibility
  const getCartTotal = () => getCartSubtotal();

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate offer discount via shared engine (audience/tiers/cross-item BOGO aware)
  const getOfferDiscount = () => {
    if (!selectedOffers || selectedOffers.length === 0) return 0;
    const subtotal = getCartSubtotal();
    let totalDiscount = 0;
    for (const offer of selectedOffers) {
      if (offer._requiresLogin) continue;
      if (subtotal < (offer.minOrderValue || 0)) continue;
      if (offer.isFirstOrderOnly && customerData && !customerData.isFirstOrder) continue;
      // cart needs menuItemId for engine; use id fallback
      const engineCart = cart.map(it => ({ ...it, menuItemId: it.menuItemId || it.id, total: it.price * it.quantity }));
      totalDiscount += calculateDiscountForOffer(offer, subtotal, engineCart, customerContext || {});
    }
    return Math.round(Math.min(totalDiscount, subtotal) * 100) / 100;
  };

  // Free items aggregated across selected offers (from cross-item BOGO)
  const getFreeItems = () => {
    if (!selectedOffers || selectedOffers.length === 0) return [];
    const subtotal = getCartSubtotal();
    const engineCart = cart.map(it => ({ ...it, menuItemId: it.menuItemId || it.id, total: it.price * it.quantity }));
    const all = [];
    for (const offer of selectedOffers) {
      if (offer._requiresLogin) continue;
      const res = calculateOfferResult(offer, subtotal, engineCart, customerContext || {});
      if (res.freeItems && res.freeItems.length) {
        // decorate with name from menu
        for (const fi of res.freeItems) {
          const menuItem = menu.find(m => m.id === fi.itemId);
          all.push({ ...fi, name: menuItem?.name || 'Free item' });
        }
      }
    }
    return all;
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

    // Calculate max loyalty discount
    const maxFromPercent = (afterOffer * maxRedemptionPercent) / 100;
    const maxFromPoints = redeemLoyaltyPoints / redemptionRate;

    return Math.min(maxFromPercent, maxFromPoints, afterOffer);
  };

  // Get final total after all discounts
  const getFinalTotal = () => {
    const subtotal = getCartSubtotal();
    const offerDiscount = getOfferDiscount();
    const loyaltyDiscount = getLoyaltyDiscount();
    return Math.max(0, subtotal - offerDiscount - loyaltyDiscount);
  };

  // Calculate loyalty points that will be earned
  const getLoyaltyPointsToEarn = () => {
    if (!customerAppSettings?.loyaltySettings?.enabled) return 0;
    const loyaltySettings = customerAppSettings.loyaltySettings;
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

  // Filter menu - only by search term, not by category (we'll scroll instead)
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
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

      // Check if Firebase is available
      try {
        // Check if Firebase modules are available
        if (!firebaseAuth || !firebaseConfig) {
          throw new Error('Firebase modules not available');
        }

        const { signInWithPhoneNumber, RecaptchaVerifier } = firebaseAuth;
        const { auth, isFirebaseConfigured } = firebaseConfig;

        // Check if Firebase is properly configured
        if (!isFirebaseConfigured || !isFirebaseConfigured()) {
          throw new Error('Firebase not configured - using demo mode');
        }

        // Format phone number
        let phoneNumber = customerInfo.phone.trim();
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+91' + phoneNumber;
        }

        // Clear any existing reCAPTCHA
        if (window.recaptchaVerifier) {
          try {
          window.recaptchaVerifier.clear();
          } catch (clearError) {
            console.warn('Error clearing reCAPTCHA:', clearError);
          }
        }

        // Setup reCAPTCHA with proper configuration
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

        // Render reCAPTCHA
        await window.recaptchaVerifier.render();

        // Send OTP
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
        
        // Provide specific error messages based on Firebase error codes
        if (firebaseError.code === 'auth/argument-error') {
          console.log('Firebase argument error - likely reCAPTCHA or config issue');
        } else if (firebaseError.code === 'auth/invalid-phone-number') {
          console.log('Invalid phone number format');
        } else if (firebaseError.code === 'auth/too-many-requests') {
          console.log('Too many OTP requests');
        }
        
        // Re-throw the Firebase error
        throw firebaseError;
      }
      
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(`Failed to send OTP: ${err.message}`);
      setSendingOtp(false);
      
      // Clear reCAPTCHA on error
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

  // Lookup customer to get loyalty points
  const lookupCustomer = async () => {
    if (!customerInfo.phone.trim()) return;

    try {
      const response = await apiClient.lookupCustomerByPhone(restaurantId, customerInfo.phone.trim());
      if (response) {
        setCustomerData(response.customer);
        setCustomerVerified(true);
        console.log('✅ Customer lookup:', response.found ? 'Found existing customer' : 'New customer');
      }
    } catch (error) {
      console.warn('Customer lookup failed:', error);
      // Not critical - continue without customer data
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

      // Check if it's a demo verification
      if (verificationId === 'demo-verification-id') {
        if (otp === '123456') {
          // Demo OTP verification successful
          await lookupCustomer(); // Lookup customer for loyalty points
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

      // Real Firebase OTP verification
      try {
      const result = await verificationId.confirm(otp);
      const user = result.user;

      // Lookup customer for loyalty points before placing order
      await lookupCustomer();

      // Get Firebase UID and proceed to place order
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

    // Validate room number if order type is room
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
      
      // Use real Firebase OTP
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

      // Calculate actual points to redeem (capped at available)
      const actualRedeemPoints = customerData?.loyaltyPoints
        ? Math.min(redeemLoyaltyPoints, customerData.loyaltyPoints)
        : 0;

      const orderData = {
        customerPhone: customerInfo.phone.trim(),
        customerName: customerInfo.name.trim() || 'Customer',
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
          ? `Customer self-order for Room ${customerInfo.roomNumber || 'N/A'}`
          : `Customer self-order from seat ${customerInfo.seatNumber || 'Walk-in'}`,
        otp: 'verified',
        verificationId: firebaseUid,
        // Include offers if selected
        offerIds: selectedOffers.map(o => o.id),
        // Include loyalty points to redeem
        redeemLoyaltyPoints: actualRedeemPoints
      };

      const response = await apiClient.placePublicOrder(restaurantId, orderData);

      // Build success message with loyalty info
      let successMsg = 'Order placed successfully! Your order will be prepared shortly.';
      if (response.order?.loyaltyPointsEarned > 0) {
        successMsg += ` You earned ${response.order.loyaltyPointsEarned} loyalty points!`;
      }

      // Check if UPI payment is enabled
      const upiEnabled = customerAppSettings?.paymentSettings?.upiEnabled;
      const orderTotal = getCartSubtotal();

      setCart([]);
      setCustomerInfo({ phone: '', seatNumber: customerInfo.seatNumber, roomNumber: '', name: '' });
      setSelectedOffers([]);
      setRedeemLoyaltyPoints(0);
      setCustomerData(null);
      setCustomerVerified(false);

      // Close all modals and stay on the same page
      setShowOtpModal(false);
      setShowCart(false);
      setOtpSent(false);
      setOtp('');

      if (upiEnabled && customerAppSettings?.paymentSettings?.upiId) {
        setUpiOrderAmount(orderTotal);
        setShowUpiModal(true);
      } else {
        setSuccess(successMsg);
      }

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (checkingTheme || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef7f0',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <FaSpinner size={40} color="#e53e3e" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading menu...</p>
        
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
        backgroundColor: '#fef7f0',
        padding: '20px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Restaurant Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            We couldn&apos;t find the restaurant menu. Please check the QR code or contact the restaurant.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'linear-gradient(135deg, #e53e3e, #dc2626)',
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingBottom: showCart ? '20px' : '100px'
    }}>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        /* Prevent flickering and improve performance */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Hardware acceleration for smooth animations */
        .header-container {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Optimize transitions */
        .transition-optimized {
          will-change: transform, opacity;
          transform: translateZ(0);
        }
        
        /* Pulse animation for cart badge */
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        /* Smooth scrollbar styling */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      {/* Mobile-Optimized Header with Restaurant Branding */}
      {(() => {
        // Get branding settings
        const brandColor = customerAppSettings?.branding?.primaryColor || '#ef4444';
        const textColor = customerAppSettings?.branding?.textColor || '#ffffff';
        const pageBackgroundColor = customerAppSettings?.branding?.pageBackgroundColor || '#f8fafc';
        const offerGradientStart = customerAppSettings?.branding?.offerGradientStart || '#fef3c7';
        const offerGradientEnd = customerAppSettings?.branding?.offerGradientEnd || '#fde68a';
        const logoUrl = customerAppSettings?.branding?.logoUrl || restaurant?.logo;
        const tagline = customerAppSettings?.branding?.tagline || restaurant?.description;
        const headerStyle = customerAppSettings?.branding?.headerStyle || 'modern';

        // Helper to darken color for gradient
        const getDarkerShade = (hex) => {
          if (!hex || hex.length < 7) return '#dc2626';
          const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30);
          const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30);
          const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        const brandColorDark = getDarkerShade(brandColor);
        const brandColorShadow = brandColor + '44';

        return (
          <div className="header-container" style={{
            position: 'sticky',
            top: 0,
            background: headerStyle === 'gradient'
              ? `linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%)`
              : headerStyle === 'solid'
              ? brandColor
              : 'white',
            zIndex: 100,
            padding: isScrolled ? '6px 12px' : '12px 16px',
            boxShadow: isScrolled ? '0 2px 12px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease-out',
            willChange: 'transform, box-shadow, padding',
            backdropFilter: 'blur(10px)',
            borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: isScrolled ? '8px' : '12px'
            }}>
              {/* Restaurant Logo & Info */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  transition: 'all 0.2s ease-out'
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
                    lineHeight: '1.2',
                    transition: 'font-size 0.2s ease-out',
                    willChange: 'font-size',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textShadow: ['gradient', 'solid'].includes(headerStyle) ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    letterSpacing: '-0.3px'
                  }}>
                    {restaurant?.name || 'My Restaurant'}
                  </h1>
                  {!isScrolled && tagline && (
                    <p style={{
                      fontSize: '12px',
                      color: ['gradient', 'solid'].includes(headerStyle) ? textColor : '#6b7280',
                      margin: '3px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: '500',
                      letterSpacing: '0.2px',
                      opacity: ['gradient', 'solid'].includes(headerStyle) ? 0.85 : 1
                    }}>
                      {tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                style={{
                  position: 'relative',
                  background: ['gradient', 'solid'].includes(headerStyle)
                    ? 'rgba(255,255,255,0.95)'
                    : `linear-gradient(135deg, ${brandColor}, ${brandColorDark})`,
                  color: ['gradient', 'solid'].includes(headerStyle) ? brandColor : 'white',
                  border: 'none',
                  padding: isScrolled ? '8px' : '10px',
                  borderRadius: isScrolled ? '8px' : '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: ['gradient', 'solid'].includes(headerStyle)
                    ? '0 2px 8px rgba(0,0,0,0.15)'
                    : `0 2px 8px ${brandColorShadow}`,
                  transition: 'all 0.2s ease-out',
                  willChange: 'transform, box-shadow',
                  minWidth: isScrolled ? '36px' : '44px',
                  height: isScrolled ? '36px' : '44px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <FaShoppingCart size={isScrolled ? 14 : 16} />
                {getCartItemCount() > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: ['gradient', 'solid'].includes(headerStyle) ? '#f59e0b' : brandColor,
                    color: 'white',
                    borderRadius: '50%',
                    width: isScrolled ? '16px' : '20px',
                    height: isScrolled ? '16px' : '20px',
                    fontSize: isScrolled ? '9px' : '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    border: '2px solid white',
                    animation: 'pulse 2s infinite'
                  }}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile-Optimized Search */}
            <div style={{
              position: 'relative',
              marginBottom: isScrolled ? '6px' : '12px',
              maxWidth: '100%',
              padding: ['gradient', 'solid'].includes(headerStyle) ? '0 4px' : '0 4px'
            }}>
              <FaSearch size={isScrolled ? 12 : 14} color="#9ca3af" style={{
                position: 'absolute',
                left: isScrolled ? '12px' : '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                transition: 'all 0.2s ease-out'
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food items..."
                style={{
                  width: '100%',
                  padding: isScrolled ? '10px 10px 10px 36px' : '12px 12px 12px 40px',
                  border: ['gradient', 'solid'].includes(headerStyle) ? 'none' : '2px solid #f3f4f6',
                  borderRadius: isScrolled ? '10px' : '12px',
                  fontSize: isScrolled ? '13px' : '14px',
                  outline: 'none',
                  backgroundColor: ['gradient', 'solid'].includes(headerStyle) ? 'rgba(255,255,255,0.95)' : '#f9fafb',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease-out',
                  lineHeight: '1.4',
                  height: isScrolled ? '36px' : '44px',
                  display: 'flex',
                  alignItems: 'center',
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

            {/* Mobile-Optimized Category Filter */}
            <div style={{
              display: 'flex',
              gap: isScrolled ? '3px' : '6px',
              overflowX: 'auto',
              padding: `0 4px ${isScrolled ? '4px' : '8px'} 4px`,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              alignItems: 'center',
              transition: 'all 0.2s ease-out',
              WebkitOverflowScrolling: 'touch'
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
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    background: selectedCategory === category
                      ? ['gradient', 'solid'].includes(headerStyle)
                        ? 'rgba(255,255,255,0.95)'
                        : `linear-gradient(135deg, ${brandColor}, ${brandColorDark})`
                      : ['gradient', 'solid'].includes(headerStyle)
                        ? 'rgba(255,255,255,0.2)'
                        : '#ffffff',
                    color: selectedCategory === category
                      ? ['gradient', 'solid'].includes(headerStyle) ? brandColor : 'white'
                      : ['gradient', 'solid'].includes(headerStyle) ? 'rgba(255,255,255,0.9)' : '#64748b',
                    border: selectedCategory === category
                      ? 'none'
                      : ['gradient', 'solid'].includes(headerStyle) ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb',
                    padding: isScrolled ? '6px 10px' : '8px 14px',
                    borderRadius: isScrolled ? '16px' : '20px',
                    fontSize: isScrolled ? '11px' : '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease-out',
                    boxShadow: selectedCategory === category
                      ? ['gradient', 'solid'].includes(headerStyle) ? '0 2px 8px rgba(0,0,0,0.15)' : `0 2px 8px ${brandColorShadow}`
                      : '0 1px 3px rgba(0,0,0,0.1)',
                    minWidth: 'auto',
                    width: 'auto',
                    textAlign: 'center',
                    flexShrink: 0,
                    transform: selectedCategory === category ? 'scale(1.05)' : 'scale(1)',
                    backdropFilter: ['gradient', 'solid'].includes(headerStyle) ? 'blur(10px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Firebase Status Notice */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: firebaseAuth && firebaseConfig ? '#dcfce7' : '#fef2f2',
        color: firebaseAuth && firebaseConfig ? '#166534' : '#dc2626',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 50,
        border: firebaseAuth && firebaseConfig ? '1px solid #22c55e' : '1px solid #fecaca'
      }}>
        {firebaseAuth && firebaseConfig ? '🔥 Firebase Ready' : '⚠️ Firebase Not Available'}
      </div>
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
          padding: '20px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          textAlign: 'center',
          zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          maxWidth: '90%',
          width: '400px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            ✅ {success}
          </div>
          <button
            onClick={() => setSuccess('')}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Phone-Login Gate Modal (unlock targeted offers) */}
      {showPhoneGate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }} onClick={() => setShowPhoneGate(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
              🔓 Unlock your offers
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6b7280' }}>
              Enter your phone number to see personalized offers from this restaurant.
            </p>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Phone number"
              value={phoneGateInput}
              onChange={(e) => setPhoneGateInput(e.target.value)}
              style={{
                width: '100%', padding: '12px', fontSize: '14px',
                border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowPhoneGate(false)}
                style={{
                  flex: 1, padding: '12px', border: '1px solid #d1d5db',
                  background: '#fff', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, color: '#374151'
                }}
              >Cancel</button>
              <button
                disabled={phoneGateLoading}
                onClick={async () => {
                  const normalized = normalizePhoneForOffers(phoneGateInput);
                  if (!normalized || normalized.length < 7) return;
                  setPhoneGateLoading(true);
                  try {
                    localStorage.setItem(`dineopen_placeorder_phone_${restaurantId}`, normalized);
                  } catch (_) {}
                  setCustomerPhoneForOffers(normalized);
                  // Also prefill customer info phone if empty
                  setCustomerInfo(prev => prev.phone ? prev : { ...prev, phone: normalized });
                  setPhoneGateLoading(false);
                  setShowPhoneGate(false);
                }}
                style={{
                  flex: 1, padding: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#fff'
                }}
              >{phoneGateLoading ? 'Loading…' : 'Continue'}</button>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
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

      {/* Menu - Always show all categories, scroll to selected */}
      <div style={{ 
        padding: '0 16px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filteredMenu.length > 0 ? (
          <div>
            {Object.keys(groupedMenu).length > 0 ? (
              Object.entries(groupedMenu).map(([category, items]) => (
                <div key={category} id={`category-${category}`} style={{ marginTop: '20px', scrollMarginTop: '120px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 20px 0',
                    padding: '16px 20px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb'
                  }}>
                    {category}
                  </h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px', 
                    marginBottom: '32px' 
                  }}>
                    {items.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={addToCart}
                        onRemoveFromCart={removeFromCart}
                        cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
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
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                marginTop: '20px'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  🍽️
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 8px 0'
                }}>
                  {searchTerm ? 'No items found' : 'No menu items available'}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0 0 16px 0'
                }}>
                  {searchTerm 
                    ? `No items match "${searchTerm}". Try a different search term.`
                    : 'This restaurant has not added any menu items yet.'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginTop: '20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🍽️
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              {searchTerm ? 'No items found' : 'No menu items available'}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 16px 0'
            }}>
              {searchTerm 
                ? `No items match "${searchTerm}". Try a different search term.`
                : 'This restaurant has not added any menu items yet.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile-Optimized Cart Modal */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
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
            backgroundColor: 'white',
            width: '100%',
            maxHeight: '85vh',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Cart Header */}
            <div style={{ 
              padding: '16px 20px 12px 20px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#fafbfc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
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
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
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
                    color: '#dc2626',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                  }}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>

              {/* Cart Summary */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Total: ₹{getCartTotal().toFixed(2)}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {getCartItemCount()} items
                </span>
              </div>
            </div>

            {/* Scrollable Cart Items */}
            <div style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '0 20px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}>
            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <FaShoppingCart size={24} color="#9ca3af" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 4px 0' }}>
                    Your cart is empty
                  </h3>
                  <p style={{ fontSize: '13px', margin: 0, opacity: 0.7 }}>
                    Add some delicious items to get started
                  </p>
              </div>
            ) : (
                <div style={{ padding: '16px 0' }}>
                  {getFreeItems().map((fi, idx) => (
                    <div key={`free-${fi.itemId}-${idx}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', backgroundColor: '#ecfdf5', borderRadius: '12px',
                      border: '1px dashed #10b981', marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#065f46', margin: '0 0 2px 0' }}>
                          {fi.name} × {fi.qty}
                        </h4>
                        <p style={{ fontSize: '11px', color: '#047857', margin: 0 }}>
                          Complimentary from offer
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, color: '#065f46',
                        background: '#d1fae5', padding: '4px 8px', borderRadius: '999px'
                      }}>FREE</span>
                    </div>
                  ))}
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '8px',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#1f2937', 
                          margin: '0 0 2px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                          ₹{item.price} each
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            minWidth: '28px',
                            height: '28px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e2e8f0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                          }}
                        >
                          <FaMinus size={10} color="#64748b" />
                        </button>
                        
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '700', 
                          color: '#1f2937', 
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.2s ease',
                            minWidth: '28px',
                            height: '28px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <FaPlus size={10} color="white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </div>

            {/* Customer Info & Checkout Section */}
            {cart.length > 0 && (
                <div style={{
                padding: '20px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#fafbfc',
                flexShrink: 0,
                maxHeight: '50vh',
                overflowY: 'auto',
              }}>
                {/* Customer Info */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0' }}>
                    Contact Information
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: '#374151', 
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
                          border: '2px solid #f3f4f6',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#f9fafb',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#f3f4f6';
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                      />
                    </div>

                    {/* Order Type Toggle */}
                    <div>
                      <label style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Order Type
                      </label>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        padding: '4px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px'
                      }}>
                        <button
                          type="button"
                          onClick={() => setOrderType('table')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: orderType === 'table' ? '#ef4444' : 'transparent',
                            color: orderType === 'table' ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaChair size={10} />
                          Table
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType('room')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: orderType === 'room' ? '#667eea' : 'transparent',
                            color: orderType === 'room' ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaHotel size={10} />
                          Room
                        </button>
                      </div>
                    </div>

                    {/* Table Number or Room Number based on selection */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        {orderType === 'table' ? (
                          <>
                            <FaChair size={10} style={{ marginRight: '4px' }} />
                            Table Number
                          </>
                        ) : (
                          <>
                            <FaHotel size={10} style={{ marginRight: '4px' }} />
                            Room Number {orderType === 'room' && <span style={{ color: '#ef4444' }}>*</span>}
                          </>
                        )}
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
                          padding: '10px 12px',
                          border: '2px solid #f3f4f6',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#f9fafb',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = orderType === 'room' ? '#667eea' : '#ef4444';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#f3f4f6';
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                      />
                      {orderType === 'room' && (
                        <p style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          margin: '4px 0 0 0',
                          fontStyle: 'italic'
                        }}>
                          Order will be added to your room bill
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Offers Section */}
                {applicableOffers.length > 0 && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>🎁</span>
                      Available Offers
                      {customerAppSettings?.offerSettings?.allowMultipleOffers && (
                        <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'normal', marginLeft: '4px' }}>
                          (Select up to {customerAppSettings?.offerSettings?.maxOffersAllowed || 1})
                        </span>
                      )}
                    </h4>
                    {/* Phone-login gate banner */}
                    {applicableOffers.some(o => o._requiresLogin) && !hasAudienceContext && (
                      <button
                        onClick={() => { setPhoneGateInput(customerInfo.phone || ''); setShowPhoneGate(true); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '10px 12px', marginBottom: '8px',
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          border: '1px dashed #f59e0b', borderRadius: '8px',
                          cursor: 'pointer', textAlign: 'left', width: '100%'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>🔓</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400e' }}>
                          Login with phone to unlock personal offers
                        </span>
                      </button>
                    )}
                    {unlockToast && (
                      <div style={{
                        padding: '8px 12px', marginBottom: '8px',
                        background: '#ecfdf5', border: '1px solid #10b981',
                        borderRadius: '8px', color: '#065f46', fontSize: '12px', fontWeight: 600
                      }}>
                        {unlockToast}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {applicableOffers.map(offer => {
                        const isLocked = !!offer._requiresLogin;
                        const isSelected = !isLocked && selectedOffers.some(o => o.id === offer.id);
                        const meetsMinOrder = getCartSubtotal() >= (offer.minOrderValue || 0);
                        const isFirstOrderValid = !offer.isFirstOrderOnly || (customerData?.isFirstOrder ?? true);
                        const allowMultiple = customerAppSettings?.offerSettings?.allowMultipleOffers ?? false;
                        const maxOffers = customerAppSettings?.offerSettings?.maxOffersAllowed ?? 1;
                        const canSelectMore = selectedOffers.length < maxOffers || isSelected;
                        const isApplicable = !isLocked && meetsMinOrder && isFirstOrderValid && (allowMultiple ? canSelectMore : true);

                        const handleOfferClick = () => {
                          if (isLocked) { setPhoneGateInput(customerInfo.phone || ''); setShowPhoneGate(true); return; }
                          if (!isApplicable) return;
                          if (isSelected) {
                            setSelectedOffers(prev => prev.filter(o => o.id !== offer.id));
                          } else {
                            if (allowMultiple) {
                              if (selectedOffers.length < maxOffers) {
                                setSelectedOffers(prev => [...prev, offer]);
                              }
                            } else {
                              setSelectedOffers([offer]);
                            }
                          }
                        };

                        return (
                          <button
                            key={offer.id}
                            onClick={handleOfferClick}
                            disabled={!isApplicable && !isLocked}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              backgroundColor: isLocked ? '#fffbeb' : isSelected ? '#fef2f2' : isApplicable ? '#f9fafb' : '#f3f4f6',
                              border: isLocked ? '1px dashed #f59e0b' : isSelected ? '2px solid #ef4444' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              cursor: isLocked || isApplicable ? 'pointer' : 'not-allowed',
                              opacity: isLocked ? 0.9 : isApplicable ? 1 : 0.6,
                              transition: 'all 0.2s ease',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: '0 0 2px 0' }}>
                                {offer.name}
                              </p>
                              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                                {offer.discountType === 'percentage'
                                  ? `${offer.discountValue}% off${offer.maxDiscount ? ` (max ₹${offer.maxDiscount})` : ''}`
                                  : `₹${offer.discountValue} off`}
                                {offer.minOrderValue > 0 && ` on orders above ₹${offer.minOrderValue}`}
                              </p>
                              {!meetsMinOrder && (
                                <p style={{ fontSize: '10px', color: '#ef4444', margin: '4px 0 0 0' }}>
                                  Add ₹{(offer.minOrderValue - getCartSubtotal()).toFixed(0)} more to unlock
                                </p>
                              )}
                              {meetsMinOrder && isFirstOrderValid && !canSelectMore && !isSelected && (
                                <p style={{ fontSize: '10px', color: '#f59e0b', margin: '4px 0 0 0' }}>
                                  Max {maxOffers} offer{maxOffers > 1 ? 's' : ''} allowed
                                </p>
                              )}
                            </div>
                            {isLocked && (
                              <span style={{ color: '#92400e', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaLock size={10} /> Login
                              </span>
                            )}
                            {isSelected && (
                              <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '12px' }}>Applied</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Loyalty Points Section */}
                {customerAppSettings?.loyaltySettings?.enabled && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>💎</span>
                      Loyalty Points
                    </h4>

                    {customerData?.loyaltyPoints > 0 ? (
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '13px', color: '#166534' }}>Available Points</span>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#166534' }}>
                            {customerData.loyaltyPoints}
                          </span>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                            Points to Redeem (max {Math.min(customerData.loyaltyPoints, Math.floor((getCartSubtotal() - getOfferDiscount()) * customerAppSettings.loyaltySettings.maxRedemptionPercent / 100 * customerAppSettings.loyaltySettings.redemptionRate))})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max={Math.min(customerData.loyaltyPoints, Math.floor((getCartSubtotal() - getOfferDiscount()) * customerAppSettings.loyaltySettings.maxRedemptionPercent / 100 * customerAppSettings.loyaltySettings.redemptionRate))}
                            value={redeemLoyaltyPoints}
                            onChange={(e) => setRedeemLoyaltyPoints(parseInt(e.target.value) || 0)}
                            style={{ width: '100%', accentColor: '#7c3aed' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                            <span>Redeem: {redeemLoyaltyPoints} pts</span>
                            <span>Discount: ₹{getLoyaltyDiscount().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#fefce8',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '12px', color: '#854d0e', margin: '0 0 4px 0' }}>
                          {customerVerified ? 'No points yet - earn on this order!' : 'Verify phone to check your points'}
                        </p>
                        <p style={{ fontSize: '11px', color: '#a16207', margin: 0 }}>
                          Earn {customerAppSettings.loyaltySettings.pointsEarned || 4} points per ₹{customerAppSettings.loyaltySettings.earnPerAmount || 100} spent
                        </p>
                      </div>
                    )}

                    {/* Points to earn */}
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#f5f3ff',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '11px', color: '#5b21b6' }}>Points you&apos;ll earn</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#7c3aed' }}>+{getLoyaltyPointsToEarn()}</span>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0' }}>
                    Order Summary
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#6b7280' }}>Subtotal</span>
                      <span style={{ color: '#374151' }}>₹{getCartSubtotal().toFixed(2)}</span>
                    </div>
                    {getOfferDiscount() > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#059669' }}>Offer Discount</span>
                        <span style={{ color: '#059669' }}>-₹{getOfferDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    {getLoyaltyDiscount() > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#7c3aed' }}>Loyalty Discount</span>
                        <span style={{ color: '#7c3aed' }}>-₹{getLoyaltyDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700' }}>
                      <span style={{ color: '#1f2937' }}>Total</span>
                      <span style={{ color: '#ef4444' }}>₹{getFinalTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                  <button
                    onClick={placeOrder}
                  disabled={placingOrder || !customerInfo.phone.trim() || sendingOtp}
                    style={{
                      width: '100%',
                    background: placingOrder || !customerInfo.phone.trim() || sendingOtp
                      ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' 
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
                      gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: placingOrder || !customerInfo.phone.trim() 
                        ? 'none'
                      : '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                    if (!placingOrder && customerInfo.phone.trim()) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                    if (!placingOrder && customerInfo.phone.trim()) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }
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
                      Place Order - ₹{getFinalTotal().toFixed(2)}
                      </>
                    )}
                  </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '350px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <FaLock size={32} color="#e53e3e" style={{ marginBottom: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 6px 0' }}>
                Verify Your Phone
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
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
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box',
                  letterSpacing: '2px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.backgroundColor = '#ffffff';
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
                  color: '#6b7280',
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
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #e53e3e, #dc2626)',
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

      {/* Hidden reCAPTCHA container for Firebase OTP */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>

      {/* Floating Menu Button - Bottom Right */}
      {!showMenuDrawer && (
        <button
          onClick={() => setShowMenuDrawer(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
            transition: 'all 0.3s ease',
            animation: 'float 3s ease-in-out infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
          }}
        >
          <FaUtensils size={24} />
        </button>
      )}

      {/* Menu Drawer - Category List */}
      {showMenuDrawer && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setShowMenuDrawer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 95,
              animation: 'fadeIn 0.2s ease'
            }}
          />
          
          {/* Drawer */}
          <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            maxWidth: '80vw',
            backgroundColor: 'white',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #f3f4f6',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  Menu Categories
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  opacity: 0.9
                }}>
                  {menu.length} items available
                </p>
              </div>
              <button
                onClick={() => setShowMenuDrawer(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'rotate(0deg)';
                }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Category List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px'
            }}>
              {categories.filter(cat => cat !== 'all').map((category, index) => {
                const categoryItems = menu.filter(item => item.category === category);
                const itemCount = categoryItems.length;
                
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowMenuDrawer(false);
                      // Scroll to category section
                      setTimeout(() => {
                        const categoryElement = document.getElementById(`category-${category}`);
                        if (categoryElement) {
                          categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 300);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      background: selectedCategory === category 
                        ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' 
                        : 'white',
                      border: selectedCategory === category 
                        ? '2px solid #ef4444' 
                        : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedCategory === category 
                        ? '0 4px 12px rgba(239, 68, 68, 0.15)' 
                        : '0 2px 4px rgba(0,0,0,0.05)',
                      animation: `fadeInUp 0.3s ease ${index * 0.05}s both`
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category) {
                        e.target.style.borderColor = '#ef4444';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        e.target.style.transform = 'translateX(-4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category) {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                        e.target.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: selectedCategory === category ? '#ef4444' : '#1f2937',
                        marginBottom: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {category}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: selectedCategory === category 
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                        : '#f3f4f6',
                      color: selectedCategory === category ? 'white' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      {itemCount}
                    </div>
                  </button>
                );
              })}

              {/* All Items Option */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowMenuDrawer(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  marginTop: '12px',
                  background: selectedCategory === 'all' 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : '#f9fafb',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: selectedCategory === 'all' ? 'white' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === 'all' 
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== 'all') {
                    e.target.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== 'all') {
                    e.target.style.background = '#f9fafb';
                  }
                }}
              >
                View All Items ({menu.length})
              </button>
            </div>
          </div>
        </>
      )}

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
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
const MenuItemCard = ({ item, onAddToCart, onRemoveFromCart, cartQuantity }) => {
  const isVeg = item.isVeg !== false;
  
  // Use simple colored placeholders instead of external images
  const getImageStyle = (category) => {
    const colors = {
      'Pizza': '#ff6b6b',
      'Burgers': '#4ecdc4', 
      'Salads': '#45b7d1',
      'Pasta': '#96ceb4',
      'Desserts': '#feca57',
      'appetizer': '#ff9ff3',
      'Tea': '#8b4513',
      'Samosa': '#ffa500',
      'default': '#ddd6fe'
    };
    return {
      backgroundColor: colors[category] || colors.default,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    };
  };
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'relative',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      {/* Food Image */}
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '12px',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}>
        {(() => {
          // Priority 1: User uploaded images
          if (item.images && item.images.length > 0) {
            return (
          <ImageCarousel
            images={item.images}
            itemName={item.name}
            maxHeight="100px"
            showControls={false}
            showDots={false}
            autoPlay={true}
            autoPlayInterval={4000}
            className="w-full h-full"
          />
            );
          }
          
          // Priority 2: Smart placeholder images
          const placeholderUrl = getDisplayImage(item);
          if (placeholderUrl) {
            return (
              <img
                src={placeholderUrl}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: linear-gradient(135deg, ${getCategoryColor(item.category)} 0%, ${getCategoryColor(item.category, 0.7)} 100%);
                      font-size: 36px;
                    ">
                      🍽️
                    </div>
                  `;
                }}
              />
            );
          }
          
          // Priority 3: Fallback to gradient with emoji
          return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${getCategoryColor(item.category)} 0%, ${getCategoryColor(item.category, 0.7)} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Beautiful Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(255,255,255,0.05) 0%, transparent 50%)
              `,
              animation: 'float 6s ease-in-out infinite'
            }} />
            
            {/* Main Icon */}
            <div style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 2,
              position: 'relative'
            }}>
              {item.category === 'Pizza' && '🍕'}
              {item.category === 'Burgers' && '🍔'}
              {item.category === 'Salads' && '🥗'}
              {item.category === 'Pasta' && '🍝'}
              {item.category === 'Desserts' && '🍰'}
              {item.category === 'appetizer' && '🥟'}
              {item.category === 'Tea' && '☕'}
              {item.category === 'Samosa' && '🥟'}
              {!['Pizza', 'Burgers', 'Salads', 'Pasta', 'Desserts', 'appetizer', 'Tea', 'Samosa'].includes(item.category) && '🍽️'}
            </div>
            
            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }} />
          </div>
          );
        })()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header with Veg/Non-Veg Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            lineHeight: '1.3',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {item.name}
          </h3>
          
          {/* Veg/Non-Veg Indicator */}
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
        
        {/* Description */}
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

        {/* Price and Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              ₹{item.price}
            </span>
            {item.category && (
              <span style={{
                fontSize: '10px',
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: '500'
              }}>
                {item.category}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartQuantity > 0 && (
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
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                }}
              >
                <FaMinus size={10} color="#64748b" />
              </button>
            )}
            
            {cartQuantity > 0 && (
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {cartQuantity}
              </span>
            )}
            
            <button
              onClick={() => onAddToCart(item)}
              style={{
                background: 'linear-gradient(135deg, #e53e3e, #dc2626)',
                border: 'none',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(229, 62, 62, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(229, 62, 62, 0.3)';
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

const PlaceOrderPage = () => {
  const loadingFallback = (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fef7f0',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <FaSpinner size={40} color="#e53e3e" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
    </div>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <PlaceOrderContent />
    </Suspense>
  );
};

export default PlaceOrderPage;

