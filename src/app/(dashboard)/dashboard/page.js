'use client';

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Pusher from 'pusher-js';
import Onboarding from '../../../components/Onboarding';
import EmptyMenuPrompt from '../../../components/EmptyMenuPrompt';
import MenuItemCard from '../../../components/MenuItemCard';
import CategoryButton from '../../../components/CategoryButton';
import OrderSummary from '../../../components/OrderSummary';
import DashboardTablesPanel from '../../../components/DashboardTablesPanel';
import Notification from '../../../components/Notification';
import QRCodeModal from '../../../components/QRCodeModal';
import BulkMenuUpload from '../../../components/BulkMenuUpload';
import ItemCustomizationModal from '../../../components/ItemCustomizationModal';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaPlus, 
  FaMinus, 
  FaCreditCard, 
  FaMoneyBillWave,
  FaPrint,
  FaSave,
  FaUtensils,
  FaCoffee,
  FaHamburger,
  FaHeart,
  FaFire,
  FaExpand,
  FaCompress,
  FaExpandArrowsAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaSignOutAlt,
  FaChair,
  FaEdit,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaCog,
  FaBars,
  FaTable,
  FaCloudUploadAlt,
  FaMicrophone,
  FaMicrophoneSlash,
  FaStop,
  FaBed,
  FaThList,
  FaTools,
  FaCalendarAlt
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { performLogout } from '../../../lib/logout';
import { t } from '../../../lib/i18n';
import { useLoading } from '../../../contexts/LoadingContext';
import IntelligentChatbot from '../../../components/IntelligentChatbot';
import RAGInitializer from '../../../components/RAGInitializer';
import { getCachedDashboardData, setCachedDashboardData } from '../../../utils/dashboardCache';
import { useSyncEngine } from '../../../hooks/useSyncEngine';
import { setCachedData, getCachedData } from '../../../lib/offlineDb';
import { canPerform } from '../../../lib/permissions';

function RestaurantPOSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoading } = useLoading();

  // Offline sync engine
  const { pendingCount, isOnline, isSyncing, lastSyncEvent, networkTransition, clearTransition, manualSync, queueOfflineOrder, generateIdempotencyKey, offlineEnabled } = useSyncEngine(apiClient);

  // Permission gating
  const dashUserData = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const canCompleteBill = canPerform(dashUserData, dashUserData.pageAccess, 'orders', 'completeBill');
  const dashCanDeleteTable = canPerform(dashUserData, dashUserData.pageAccess, 'tables', 'delete');

  // Core state
  const [selectedCategory, setSelectedCategory] = useState('all-items');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('orders'); // 'orders' | 'tables'
  const [returnToView, setReturnToView] = useState(null); // Track where to return after order action (null | 'tables' | 'orderhistory')
  const [orderLoadingPartial, setOrderLoadingPartial] = useState(false); // Partial loading for order details (no full page reload)
  const [tablesData, setTablesData] = useState({ floors: [], tables: [] });
  const [recentlyUpdatedTableId, setRecentlyUpdatedTableId] = useState(null);
  const [tablesRefreshing, setTablesRefreshing] = useState(false);
  
  // Ref to track if initial data has been loaded (prevents duplicate calls)
  const initialDataLoadedRef = useRef(false);
  
  // Customization modal state
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [shortCodeSearch, setShortCodeSearch] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [manualTableNumber, setManualTableNumber] = useState('');
  const [manualRoomNumber, setManualRoomNumber] = useState('');
  const [locationType, setLocationType] = useState('table'); // 'table' or 'room'
  const [inRoomDiningEnabled, setInRoomDiningEnabled] = useState(false);

  // Scheduled/future order state
  const [isScheduledOrder, setIsScheduledOrder] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Multi-tier pricing state
  const [multiPricingEnabled, setMultiPricingEnabled] = useState(false);
  const [pricingRules, setPricingRules] = useState([]);
  const [pricingRulesLoading, setPricingRulesLoading] = useState(false);
  const [activePricingRuleId, setActivePricingRuleId] = useState(null);
  const [autoSelectedRule, setAutoSelectedRule] = useState(false);

  // Channel name constants for pricing rule identification
  const DINEIN_NAMES = ['dine-in', 'dine in', 'dinein'];
  const TAKEAWAY_NAMES = ['takeaway', 'take away', 'take-away'];
  const DELIVERY_NAMES = ['delivery'];
  const CHANNEL_NAMES = [...DINEIN_NAMES, ...TAKEAWAY_NAMES, ...DELIVERY_NAMES];
  const isZoneRule = (rule) => !CHANNEL_NAMES.includes((rule?.name || '').toLowerCase().trim());
  const findDineInRule = (rules) => (rules || []).find(r => r.isActive && DINEIN_NAMES.includes((r.name || '').toLowerCase().trim()));

  // API state
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false); // Demo preview mode
  const [restaurantChangeLoading, setRestaurantChangeLoading] = useState(false); // Loading state for restaurant changes
  const [backgroundLoading, setBackgroundLoading] = useState(false); // Background data refresh indicator
  const [processing, setProcessing] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  
  // Register enforcement state
  const [registerOpen, setRegisterOpen] = useState(null); // null=loading, true/false

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // { orderId: 'ORD-123', show: true }
  const [notification, setNotification] = useState(null); // For top-right corner notifications
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerData, setCustomerData] = useState(null); // From customer lookup hook in OrderSummary
  const [orderLookup, setOrderLookup] = useState(''); // For table number or order ID lookup
  const [currentOrder, setCurrentOrder] = useState(null); // Current order being viewed/updated
  const [orderSearchLoading, setOrderSearchLoading] = useState(false); // Loading state for order search
  const [taxSettings, setTaxSettings] = useState(null); // Tax settings for the restaurant

  // Saved Orders Queue State
  const [savedOrders, setSavedOrders] = useState([]); // List of saved orders for quick access
  const [loadingSavedOrders, setLoadingSavedOrders] = useState(false);
  const [loadingSavedOrderId, setLoadingSavedOrderId] = useState(null); // Currently loading order ID
  const [activeSavedOrderId, setActiveSavedOrderId] = useState(null); // Currently loaded saved order
  const [savingOrder, setSavingOrder] = useState(false); // Separate loading state for save order button
  const [deletingSavedOrderId, setDeletingSavedOrderId] = useState(null); // Currently deleting order ID
  const [printSettings, setPrintSettings] = useState(null); // Print settings for the restaurant
  const [upiSettings, setUpiSettings] = useState({}); // UPI payment settings from customer app settings
  const [whatsappConnected, setWhatsappConnected] = useState(false); // WhatsApp Business connection status
  const [isLoadingOrder, setIsLoadingOrder] = useState(false); // Flag to prevent localStorage override during order loading
  const [showResetConfirm, setShowResetConfirm] = useState(false); // Reset tables confirmation modal
  const [resetLoading, setResetLoading] = useState(false); // Loading state during table reset
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Category sidebar width constant (compact, part of menu section)
  const categorySidebarWidth = 150;

  // POS settings from restaurant config (dashboard customization)
  const posSettings = useMemo(() => selectedRestaurant?.posSettings || {}, [selectedRestaurant]);

  // Track which restaurant's default order type we've applied
  const appliedDefaultOrderTypeRef = useRef(null);
  useEffect(() => {
    if (selectedRestaurant?.id && selectedRestaurant.id !== appliedDefaultOrderTypeRef.current) {
      const ps = selectedRestaurant?.posSettings;
      if (ps?.defaultOrderType) {
        // Validate the default order type is still enabled
        const types = Array.isArray(ps.orderTypes)
          ? ps.orderTypes
          : [{ id: 'dine-in', enabled: true }, { id: 'takeaway', enabled: true }, { id: 'delivery', enabled: true }];
        const enabledIds = types.filter(t => t.enabled).map(t => t.id);
        if (enabledIds.includes(ps.defaultOrderType)) {
          setOrderType(ps.defaultOrderType);
        } else if (enabledIds.length > 0) {
          setOrderType(enabledIds[0]);
        }
      }
      if (ps?.defaultPaymentMethod) {
        setPaymentMethod(ps.defaultPaymentMethod);
      }
      appliedDefaultOrderTypeRef.current = selectedRestaurant.id;
    }
  }, [selectedRestaurant]);

  // Register enforcement — check if register is open when setting enabled
  useEffect(() => {
    if (posSettings.requireRegisterOpen && selectedRestaurant?.id) {
      apiClient.getCurrentRegister(selectedRestaurant.id)
        .then(res => {
          const isOpen = !!res.register;
          setRegisterOpen(isOpen);
          localStorage.setItem('registerOpen', String(isOpen));
        })
        .catch(() => setRegisterOpen(false));
    } else {
      setRegisterOpen(true); // Not enforced = always "open"
    }
  }, [selectedRestaurant?.id, posSettings.requireRegisterOpen]);

  // Listen for register open/close from other tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'registerOpen') {
        setRegisterOpen(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Card design toggle state - Initialize from localStorage based on user ID
  const [useModernCards, setUseModernCards] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData)?.id : 'guest';
        const saved = localStorage.getItem(`viewSettings_${userId}`);
        if (saved) {
          const settings = JSON.parse(saved);
          return settings.useModernCards !== undefined ? settings.useModernCards : true;
        }
      } catch (e) {
        console.error('Error loading useModernCards from localStorage:', e);
      }
    }
    return true;
  });
  const [categoryViewMode, setCategoryViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData)?.id : 'guest';
        const saved = localStorage.getItem(`viewSettings_${userId}`);
        if (saved) {
          const settings = JSON.parse(saved);
          return settings.categoryViewMode || 'sidebar';
        }
      } catch (e) {
        console.error('Error loading categoryViewMode from localStorage:', e);
      }
    }
    return 'sidebar';
  }); // 'sidebar' or 'chips'
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Voice Assistant State
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState(''); // Display transcript (includes interim)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [audioLevels, setAudioLevels] = useState([]); // For audio visualizer
  const [recognitionInstance, setRecognitionInstance] = useState(null); // Store recognition instance
  const finalTranscriptRef = useRef(''); // Accumulate all final transcripts
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Smart Voice State
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [processedVoiceItems, setProcessedVoiceItems] = useState([]); // Items already added
  const [voiceCompiledText, setVoiceCompiledText] = useState(''); // Compiled recognized items text
  const [voiceItemsAdded, setVoiceItemsAdded] = useState(0); // Count of items added in this session
  const lastChunkRef = useRef(''); // Track last processed chunk to avoid duplicates
  const voiceProcessingRef = useRef(false); // Prevent overlapping API calls

  // Fullscreen mode states
  const [isNavigationHidden, setIsNavigationHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Floating Command Bar ref
  const commandBarInputRef = useRef(null);

  // Save view settings to localStorage when they change (tied to user ID)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData)?.id : 'guest';
        const settings = {
          useModernCards,
          categoryViewMode
        };
        localStorage.setItem(`viewSettings_${userId}`, JSON.stringify(settings));
      } catch (e) {
        console.error('Error saving view settings to localStorage:', e);
      }
    }
  }, [useModernCards, categoryViewMode]);

  // Keyboard shortcut for voice ordering (F2 or Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 or Ctrl+Space to toggle voice
      if (e.key === 'F2' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault();
        if (isListeningVoice) {
          stopVoiceListening(false);
        } else {
          startVoiceListening();
        }
      }
      // Escape to stop voice
      if (e.key === 'Escape' && isListeningVoice) {
        e.preventDefault();
        stopVoiceListening(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListeningVoice]);

  // Prefetch tables/floors once restaurant is known
  const prefetchTables = useCallback(async (rid) => {
    if (!rid) return;
    try {
      setTablesRefreshing(true);
      // Only fetch floors - tables are nested inside floors
      const floorsRes = await apiClient.getFloors(rid).catch(() => ({ floors: [] }));
      const floorsData = floorsRes?.floors || floorsRes || [];
      setTablesData({
        floors: floorsData,
        tables: [] // Tables are already nested in floors, no need for separate API call
      });
    } finally {
      setTablesRefreshing(false);
    }
  }, []);
  const [fullscreenStep, setFullscreenStep] = useState(0); // 0: normal, 1: nav hidden, 2: fullscreen
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [user, setUser] = useState(null);
  
  // QR Code modal state
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Authentication guard - simplified with URL token support
  useEffect(() => {
    const checkAuth = () => {
      // Check if we have a token in URL (subdomain redirect case)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenInUrl = urlParams.get('token');
      const userInUrl = urlParams.get('user');
      
      if (tokenInUrl) {
        // SECURITY: Commented out to prevent exposing sensitive token data in console logs
        // console.log('🔄 Token found in URL, processing...');
        
        // Store token and user data immediately
        localStorage.setItem('authToken', tokenInUrl);
        if (userInUrl) {
          try {
            const userData = JSON.parse(decodeURIComponent(userInUrl));
            localStorage.setItem('user', JSON.stringify(userData));
            // SECURITY: Commented out to prevent exposing sensitive data
            // console.log('✅ Token and user data stored from URL');
          } catch (error) {
            console.error('Failed to parse user data from URL:', error);
          }
        }
        
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('user');
        window.history.replaceState({}, document.title, url.toString());
        
        console.log('✅ User authenticated with URL data');
      } else {
        // Normal authentication check
      if (!apiClient.isAuthenticated()) {
        console.log('🚫 User not authenticated, redirecting to login');
        router.replace('/login');
        return;
      }
      
      const user = apiClient.getUser();
      if (!user) {
        console.log('🚫 No user data found, redirecting to login');
        router.replace('/login');
        return;
      }
      
      console.log('✅ User authenticated:', user.role);
      }
    };

    checkAuth();
  }, [router]);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    // Clear all localStorage data
    apiClient.clearToken();
    
    // Perform logout with redirect to main domain
    performLogout();
  };

  // QR Code handler
  const handleShowQRCode = () => {
    setShowQRCodeModal(true);
  };

  // Handle menu items added via bulk upload
  const handleMenuItemsAdded = async () => {
    console.log('🔄 Menu items added via upload, reloading menu data...');
    if (selectedRestaurant?.id) {
      await loadMenu(selectedRestaurant.id);
    }
  };

  // Close logout dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogoutDropdown && !event.target.closest('[data-logout-dropdown]')) {
        setShowLogoutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogoutDropdown]);

  // Language change listener
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render when language changes
      setUser(prevUser => ({ ...prevUser }));
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Generate dynamic categories based on actual menu items
  const getDynamicCategories = () => {
    if (!menuItems || menuItems.length === 0) {
      return [
        { id: 'all-items', name: t('dashboard.allItems'), emoji: '🍽️', count: 0 },
        { id: 'favorites', name: t('dashboard.favorites'), emoji: '❤️', count: 0 }
      ];
    }
    
    // Get unique categories from menu items
    const categoryMap = new Map();
    categoryMap.set('all-items', { id: 'all-items', name: t('dashboard.allItems'), emoji: '🍽️', count: menuItems.length });
    
    // Count favorites
    const favoritesCount = menuItems.filter(item => item.isFavorite === true).length;
    categoryMap.set('favorites', { id: 'favorites', name: t('dashboard.favorites'), emoji: '❤️', count: favoritesCount });
    
    menuItems.forEach(item => {
      if (item.category) {
        const categoryId = item.category.toLowerCase();
        if (categoryMap.has(categoryId)) {
          categoryMap.get(categoryId).count++;
        } else {
          // Create dynamic category with appropriate emoji
          const emoji = getCategoryEmoji(item.category);
          categoryMap.set(categoryId, {
            id: categoryId,
            name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            emoji: emoji,
            count: 1
          });
        }
      }
    });
    
    // Return favorites first, then all-items, then other categories
    const categories = Array.from(categoryMap.values());
    const favorites = categories.find(c => c.id === 'favorites');
    const allItems = categories.find(c => c.id === 'all-items');
    const otherCategories = categories.filter(c => c.id !== 'favorites' && c.id !== 'all-items');
    
    return favorites && favorites.count > 0 
      ? [favorites, allItems, ...otherCategories]
      : [allItems, ...otherCategories];
  };
  
  // Get appropriate emoji for category
  const getCategoryEmoji = (category) => {
    const categoryLower = category.toLowerCase();
    const emojiMap = {
      'appetizer': '🥗', 'appetizers': '🥗', 'starter': '🥗', 'starters': '🥗',
      'main': '🍛', 'main-course': '🍛', 'mains': '🍛', 'entree': '🍛', 'entrees': '🍛',
      'rice': '🍚', 'biryani': '🍚', 'biryanis': '🍚', 'fried-rice': '🍚',
      'dal': '🍲', 'curry': '🍲', 'curries': '🍲', 'gravy': '🍲',
      'bread': '🍞', 'breads': '🍞', 'naan': '🍞', 'roti': '🍞', 'chapati': '🍞',
      'beverage': '🥤', 'beverages': '🥤', 'drinks': '🥤', 'juice': '🧃', 'tea': '☕', 'coffee': '☕',
      'dessert': '🍰', 'desserts': '🍰', 'sweet': '🧁', 'sweets': '🧁', 'ice-cream': '🍨',
      'snack': '🍿', 'snacks': '🍿', 'chaat': '🍿',
      'pizza': '🍕', 'pizzas': '🍕',
      'burger': '🍔', 'burgers': '🍔',
      'sandwich': '🥪', 'sandwiches': '🥪',
      'salad': '🥙', 'salads': '🥙',
      'soup': '🍜', 'soups': '🍜',
      'pasta': '🍝', 'pastas': '🍝',
      'chinese': '🥢', 'asian': '🥢',
      'tandoor': '🔥', 'grilled': '🔥', 'bbq': '🔥'
    };
    
    return emojiMap[categoryLower] || '🍽️';
  };
  
  const categories = getDynamicCategories();

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cleanup audio visualizer on unmount
  useEffect(() => {
    return () => {
      stopAudioVisualizer();
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [recognitionInstance]);

  // Authentication check and onboarding detection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check if user needs onboarding
    const userData = localStorage.getItem('user');
    const onboardingSkipped = localStorage.getItem('onboarding_skipped');
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    
    if (userData && !onboardingSkipped && !hasCompletedOnboarding) {
      const user = JSON.parse(userData);
      // Show onboarding for owners who haven't set up a restaurant
      if (user.role === 'owner' || !user.role) {
        setIsFirstTimeUser(true);
        //setShowOnboarding(true);
      }
    }
  }, [router]);

  // Load cart from localStorage
  useEffect(() => {
    if (isLoadingOrder) {
      console.log('🔄 Skipping localStorage cart load - order loading in progress');
      return;
    }
    
    const savedCart = localStorage.getItem('dine_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🔄 Loading cart from localStorage:', parsedCart);
        console.log('🔄 localStorage cart length:', parsedCart?.length);
        if (parsedCart?.length > 0) {
          console.log('🔄 localStorage cart items:', parsedCart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })));
        }
        setCart(parsedCart);
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    } else {
      console.log('🔄 No cart found in localStorage');
    }
  }, [isLoadingOrder]);

  // Save cart to localStorage
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', cart);
    console.log('💾 Cart length being saved:', cart?.length);
    if (cart?.length > 0) {
      console.log('💾 Cart items being saved:', cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })));
    }
    localStorage.setItem('dine_cart', JSON.stringify(cart));
  }, [cart]);

  // Load tax settings for the restaurant
  const loadTaxSettings = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    
    try {
      console.log('🏛️ Loading tax settings for restaurant:', restaurantId);
      const taxSettingsResponse = await apiClient.getTaxSettings(restaurantId);
      console.log('🏛️ Tax settings response:', taxSettingsResponse);

      if (taxSettingsResponse.success) {
        setTaxSettings(taxSettingsResponse.taxSettings);
        // Cache in IndexedDB for offline use
        setCachedData(`tax_${restaurantId}`, taxSettingsResponse.taxSettings).catch(() => {});
        console.log('🏛️ Tax settings loaded and cached:', taxSettingsResponse.taxSettings);
      } else {
        console.log('🏛️ No tax settings found for restaurant');
        setTaxSettings(null);
      }
    } catch (error) {
      console.error('🏛️ Error loading tax settings:', error);
      // Try IndexedDB fallback
      const cachedTax = await getCachedData(`tax_${restaurantId}`).catch(() => null);
      if (cachedTax) {
        setTaxSettings(cachedTax);
        console.log('🏛️ Loaded tax settings from offline cache');
      } else {
        setTaxSettings(null);
      }
    }
  }, []);

  // Load tax settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadTaxSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id, loadTaxSettings]);

  // Load UPI settings from customer app settings
  useEffect(() => {
    if (!selectedRestaurant?.id) return;
    const loadUpiSettings = async () => {
      try {
        const csRes = await apiClient.getCustomerAppSettings(selectedRestaurant.id);
        if (csRes?.paymentSettings) setUpiSettings(csRes.paymentSettings);
        else setUpiSettings({});
      } catch (e) {
        console.log('Customer app settings fetch error:', e);
        setUpiSettings({});
      }
    };
    loadUpiSettings();
  }, [selectedRestaurant?.id]);

  // Load WhatsApp connection status
  useEffect(() => {
    if (!selectedRestaurant?.id) return;
    const loadWaSettings = async () => {
      try {
        const waRes = await apiClient.getWhatsAppSettings(selectedRestaurant.id);
        setWhatsappConnected(waRes?.connected || false);
      } catch (e) {
        setWhatsappConnected(false);
      }
    };
    loadWaSettings();
  }, [selectedRestaurant?.id]);

  // Load print settings for the restaurant
  const loadPrintSettings = useCallback(async (restaurantId) => {
    if (!restaurantId) return;

    try {
      console.log('🖨️ Loading print settings for restaurant:', restaurantId);
      const printSettingsResponse = await apiClient.getPrintSettings(restaurantId);
      console.log('🖨️ Print settings response:', printSettingsResponse);

      if (printSettingsResponse.success) {
        setPrintSettings(printSettingsResponse.printSettings);
        console.log('🖨️ Print settings loaded:', printSettingsResponse.printSettings);
      } else {
        console.log('🖨️ No print settings found, using defaults');
        setPrintSettings(null);
      }
    } catch (error) {
      console.error('🖨️ Error loading print settings:', error);
      setPrintSettings(null);
    }
  }, []);

  // Load print settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadPrintSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id, loadPrintSettings]);

  const loadInitialData = useCallback(async (skipRestaurantLoad = false, useCache = true) => {
    try {
      // Only show full loading on first load or when not using cache
      if (!useCache) {
      setLoading(true);
      }
      setError('');
      
      // Get user data to determine restaurant context
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      console.log('👤 Current user:', user?.name, user?.role, 'Restaurant ID:', user?.restaurantId);
      
      // Load restaurants only if not already loaded and not skipping
      let restaurantsResponse = null;
      if (!skipRestaurantLoad && restaurants.length === 0) {
        console.log('🏢 Loading restaurants...');
        try {
          restaurantsResponse = await apiClient.getRestaurants();
          console.log('🏢 Restaurants loaded:', restaurantsResponse.restaurants?.length || 0, 'restaurants');
          setRestaurants(restaurantsResponse.restaurants || []);
        } catch (restErr) {
          // Offline fallback: use cached restaurant from localStorage
          console.warn('🔌 Restaurants API failed, using cached data:', restErr.message);
          const savedRestaurant = localStorage.getItem('selectedRestaurant');
          if (savedRestaurant) {
            const parsed = JSON.parse(savedRestaurant);
            restaurantsResponse = { restaurants: [parsed] };
            setRestaurants([parsed]);
          } else {
            throw restErr; // No cached data — can't recover
          }
        }
      } else if (skipRestaurantLoad) {
        console.log('⏭️ Skipping restaurant load (already loaded or skip flag set)');
        restaurantsResponse = { restaurants: restaurants };
      } else {
        console.log('✅ Using existing restaurants data');
        restaurantsResponse = { restaurants: restaurants };
      }
      
      let restaurant = null;
      
      // For staff members (not owners), use their assigned restaurant
      if (user?.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(user.role)) {
        // First try to use restaurant data from login response
        if (user.restaurant) {
          restaurant = user.restaurant;
        } else {
          // Fallback to finding restaurant in the list
        restaurant = restaurantsResponse.restaurants.find(r => r.id === user.restaurantId);
        }
        console.log('👨‍💼 Dashboard: Using staff assigned restaurant:', restaurant?.id);
      }
      // For owners or customers, use selected restaurant from localStorage or defaultRestaurantId from API
      else if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
        const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
        const defaultId = restaurantsResponse.defaultRestaurantId;
        console.log('🔍 Dashboard: Resolving restaurant — localStorage:', savedRestaurantId, 'BE default:', defaultId);
        restaurant = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) ||
                    (defaultId ? restaurantsResponse.restaurants.find(r => r.id === defaultId) : null) ||
                    restaurantsResponse.restaurants[0];
        console.log('✅ Dashboard: Resolved to:', restaurant.id, restaurant.name);

        // Always sync localStorage with the resolved restaurant
        localStorage.setItem('selectedRestaurantId', restaurant.id);
        localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
      }
      
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        console.log('🏠 Loading data for restaurant:', restaurant.name, restaurant.id);
        
        // STALE-WHILE-REVALIDATE PATTERN
        // Step 1: Load cached data immediately if available
        if (useCache) {
          const cachedData = getCachedDashboardData(restaurant.id);
          if (cachedData) {
            console.log('⚡ Loading cached data instantly...');
            // Restore cached state immediately
            if (cachedData.menuItems) setMenuItems(cachedData.menuItems);
            if (cachedData.floors) setFloors(cachedData.floors);
            if (cachedData.tablesData) setTablesData(cachedData.tablesData);
            // Hide loading immediately to show cached data
            setLoading(false);

            // Load pricing rules immediately (don't wait for background refresh)
            setPricingRulesLoading(true);
            apiClient.getPricingSettings(restaurant.id).then(pricingResponse => {
              const mp = pricingResponse?.settings?.multiPricing;
              if (mp?.enabled) {
                setMultiPricingEnabled(true);
                setPricingRules((mp.rules || []).filter(r => r.isActive));
              } else {
                setMultiPricingEnabled(false);
                setPricingRules([]);
                setActivePricingRuleId(null);
              }
            }).catch(() => {}).finally(() => setPricingRulesLoading(false));

            // Show background loading indicator
            setBackgroundLoading(true);
            // Dispatch event for navigation to show loading
            window.dispatchEvent(new CustomEvent('dashboardBackgroundLoading', { detail: { loading: true } }));
          }
        }
        
        // Step 2: Fetch fresh data in background
        const fetchFreshData = async () => {
          try {
            console.log('🔄 Fetching fresh data in background...');
            
            // Fetch fresh data
            const [menuResponse, floorsResponse] = await Promise.all([
              apiClient.getMenu(restaurant.id).catch(() => ({ menuItems: [] })),
              apiClient.getFloors(restaurant.id).catch(() => ({ floors: [] }))
            ]);
            
            const freshMenuItems = menuResponse.menuItems || [];
            const freshFloors = floorsResponse.floors || floorsResponse || [];
            
            // Update state with fresh data (or load defaults if empty)
            if (freshMenuItems.length === 0) {
              const businessType = restaurant?.businessType || 'restaurant';
              const { getDefaultMenu } = await import('../../../lib/defaultMenus');
              setMenuItems(getDefaultMenu(businessType));
              setIsDemoMode(true);
            } else {
              setMenuItems(freshMenuItems);
              setIsDemoMode(false);
            }
            setFloors(freshFloors);

            // Reuse already-fetched floors for tables (avoid duplicate getFloors call)
            setTablesData({
              floors: freshFloors,
              tables: [] // Tables are nested in floors
            });

            // Cache the fresh data with tablesData structure
            const dataToCache = {
              menuItems: freshMenuItems,
              floors: freshFloors,
              tablesData: { floors: freshFloors, tables: [] }
            };
            setCachedDashboardData(restaurant.id, dataToCache);
            // Also persist to IndexedDB for deeper offline support
            setCachedData(`dashboard_${restaurant.id}`, dataToCache).catch(() => {});

            // Load multi-pricing rules
            try {
              const pricingResponse = await apiClient.getPricingSettings(restaurant.id);
              const mp = pricingResponse?.settings?.multiPricing;
              if (mp?.enabled) {
                setMultiPricingEnabled(true);
                setPricingRules((mp.rules || []).filter(r => r.isActive));
              } else {
                setMultiPricingEnabled(false);
                setPricingRules([]);
                setActivePricingRuleId(null);
              }
            } catch { /* ignore — backward compatible */ }

            console.log('✅ Fresh data loaded and cached');
          } catch (error) {
            console.error('Error fetching fresh data:', error);
            // Don't show error to user if we have cached data
          } finally {
            setBackgroundLoading(false);
            // Dispatch event to hide loading indicator
            window.dispatchEvent(new CustomEvent('dashboardBackgroundLoading', { detail: { loading: false } }));
          }
        };
        
        // If we have cached data, fetch in background; otherwise fetch normally
        if (useCache && getCachedDashboardData(restaurant.id)) {
          // Fetch fresh data in background without blocking
          fetchFreshData();
        } else {
          // No localStorage cache — try API, fallback to IndexedDB if offline
          let menuResponse, floorsResponse;
          try {
            [menuResponse, floorsResponse] = await Promise.all([
              apiClient.getMenu(restaurant.id),
              apiClient.getFloors(restaurant.id)
            ]);
          } catch (fetchErr) {
            console.warn('API fetch failed, trying IndexedDB cache:', fetchErr.message);
            const idbCached = await getCachedData(`dashboard_${restaurant.id}`).catch(() => null);
            if (idbCached) {
              menuResponse = { menuItems: idbCached.menuItems || [] };
              floorsResponse = { floors: idbCached.floors || [] };
              console.log('📦 Loaded data from IndexedDB offline cache');
            } else {
              menuResponse = { menuItems: [] };
              floorsResponse = { floors: [] };
            }
          }
          
          const fetchedMenuItems = menuResponse.menuItems || [];
          const fetchedFloors = floorsResponse.floors || floorsResponse || [];
          
          // Update state (or load defaults if empty)
          if (fetchedMenuItems.length === 0) {
            const businessType = restaurant?.businessType || 'restaurant';
            const { getDefaultMenu } = await import('../../../lib/defaultMenus');
            setMenuItems(getDefaultMenu(businessType));
            setIsDemoMode(true);
          } else {
            setMenuItems(fetchedMenuItems);
            setIsDemoMode(false);
          }
          setFloors(fetchedFloors);
          // Reuse already-fetched floors for tables (avoid duplicate getFloors call)
          setTablesData({
            floors: fetchedFloors,
            tables: [] // Tables are nested in floors
          });

          const dataToCache = {
            menuItems: fetchedMenuItems,
            floors: fetchedFloors,
            tablesData: { floors: fetchedFloors, tables: [] }
          };
          setCachedDashboardData(restaurant.id, dataToCache);
          // Also persist to IndexedDB for deeper offline support
          setCachedData(`dashboard_${restaurant.id}`, dataToCache).catch(() => {});

          // Load multi-pricing rules immediately (non-cached path)
          try {
            const pricingResponse = await apiClient.getPricingSettings(restaurant.id);
            const mp = pricingResponse?.settings?.multiPricing;
            if (mp?.enabled) {
              setMultiPricingEnabled(true);
              setPricingRules((mp.rules || []).filter(r => r.isActive));
            } else {
              setMultiPricingEnabled(false);
              setPricingRules([]);
              setActivePricingRuleId(null);
            }
          } catch { /* ignore */ }

        console.log('✅ Restaurant data loaded successfully');
        }
      } else {
        // No restaurant found — show empty state (don't auto-create to avoid duplicates)
        console.log('📋 No restaurant found for user — showing empty state');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
        setError('Network connection failed. Please check your internet connection and try again.');
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setError('Your session has expired. Please log in again.');
      } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        setError('You do not have permission to access this restaurant data.');
      } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        setError('Restaurant data not found. Please contact support.');
      } else {
        setError(`Failed to load restaurant data: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [restaurants]);

  // Load initial data - only once on mount or when navigating to dashboard
  useEffect(() => {
    // Prevent duplicate calls
    if (initialDataLoadedRef.current) {
      console.log('⏭️ Initial data already loaded, skipping...');
      return;
    }
    
    console.log('🚀 Loading initial data (first time)');
    initialDataLoadedRef.current = true;
    loadInitialData(false, true); // Use cache for instant load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Listen for restaurant changes from navigation
  useEffect(() => {
    const handleRestaurantChange = async (event) => {
      console.log('🏪 Dashboard page: Restaurant changed, reloading data', event.detail);
      setRestaurantChangeLoading(true); // Show loading overlay
      try {
        // Skip restaurant load since we already have the list, just reload menu/floors
        await loadInitialData(true); // Pass skipRestaurantLoad flag
      } catch (error) {
        console.error('Error reloading data after restaurant change:', error);
      } finally {
        setRestaurantChangeLoading(false); // Hide loading overlay
      }
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, [loadInitialData, restaurants]);
 
  // REMOVED - createSampleRestaurant function no longer needed
  
  // Handle onboarding completion
  const handleOnboardingComplete = async (restaurant) => {
    setShowOnboarding(false);
    setIsFirstTimeUser(false);
    localStorage.setItem('onboarding_completed', 'true');
    
    // Update restaurant list and selected restaurant
    setSelectedRestaurant(restaurant);
    setRestaurants(prev => [...prev, restaurant]);
    
    // Load menu and floors/tables for the new restaurant
    await Promise.all([
      loadMenu(restaurant.id),
      loadFloors(restaurant.id)
    ]);
  };
  
  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setIsFirstTimeUser(false);
    localStorage.setItem('onboarding_skipped', 'true');
    
    // Continue with loading initial data
    loadInitialData();
  };

  const loadMenu = async (restaurantId) => {
    try {
      const response = await apiClient.getMenu(restaurantId);
      const realItems = response.menuItems || [];

      if (realItems.length === 0) {
        console.log('📋 No menu items found, loading default menu for business type');
        const businessType = selectedRestaurant?.businessType || 'restaurant';
        const { getDefaultMenu } = await import('../../../lib/defaultMenus');
        const defaultItems = getDefaultMenu(businessType);
        setMenuItems(defaultItems);
        setIsDemoMode(true);
        // Notify layout to show the global yellow sample menu banner
        window.dispatchEvent(new CustomEvent('demoModeActivated'));
      } else {
        console.log('📋 Loaded menu items:', realItems.length);
        setMenuItems(realItems);
        if (isDemoMode) {
          sessionStorage.removeItem('dineopen_demo_menu');
          setIsDemoMode(false);
        }
        // If backend says this is a seeded demo menu, notify layout to show banner
        if (response.hasDefaultMenu) {
          window.dispatchEvent(new CustomEvent('demoModeActivated'));
        }
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuItems([]);
    }
  };

  // Handle demo preview from EmptyMenuPrompt
  const handlePreviewDemo = (demoMenuItems, demoCategories) => {
    console.log('🎯 Loading demo preview:', demoMenuItems?.length, 'items');
    setMenuItems(demoMenuItems || []);
    setIsDemoMode(true);
  };

  // Exit demo mode — reload real menu from server
  const handleExitDemo = async () => {
    sessionStorage.removeItem('dineopen_demo_menu');
    setIsDemoMode(false);
    if (selectedRestaurant) {
      await loadMenu(selectedRestaurant.id);
    } else {
      setMenuItems([]);
    }
  };

  // Note: Default menu loading is handled directly in loadInitialData and loadMenu
  // to avoid race conditions and flickering

  // Redirect bar-type restaurants to /dashboard/bar
  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.businessType === 'bar') {
      router.replace('/dashboard/bar');
    }
  }, [selectedRestaurant, router]);

  // Load restaurant feature flags
  useEffect(() => {
    if (selectedRestaurant) {
      const features = selectedRestaurant.features;
      
      // Handle both array and object formats, and missing/null cases
      let inRoomDiningEnabled = false;
      
      try {
        if (features) {
          if (Array.isArray(features)) {
            // If features is an array, check the first element
            // Handles: features: [] or features: [{inRoomDiningEnabled: true/false}]
            if (features.length > 0) {
              const firstFeature = features[0];
              inRoomDiningEnabled = firstFeature?.inRoomDiningEnabled === true;
            }
            // Empty array [] defaults to false
          } else if (typeof features === 'object' && features !== null) {
            // If features is an object, check directly
            // Handles: features: {} or features: {inRoomDiningEnabled: true/false}
            inRoomDiningEnabled = features.inRoomDiningEnabled === true;
          }
        }
        // Missing/null/undefined features defaults to false
      } catch (error) {
        console.error('Error reading features flag:', error);
        // On any error, default to false (safe fallback)
        inRoomDiningEnabled = false;
      }
      
      setInRoomDiningEnabled(inRoomDiningEnabled);
    } else {
      // Reset to false if no restaurant selected
      setInRoomDiningEnabled(false);
    }
  }, [selectedRestaurant]);

  const loadFloors = async (restaurantId) => {
    try {
      console.log('🏢 Loading floors and tables for restaurant:', restaurantId);
      
      // Check cache first
      const cacheKey = `floors_${restaurantId}`;
      const cachedFloors = localStorage.getItem(cacheKey);
      
      if (cachedFloors) {
        const floorsData = JSON.parse(cachedFloors);
        const cacheAge = Date.now() - floorsData.timestamp;
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          console.log('🏢 Using cached floors data');
          setFloors(floorsData.floors);
          // Extract all tables from floors for validation
          const allTables = floorsData.floors.flatMap(floor => floor.tables);
          setTables(allTables);
          return floorsData.floors;
        }
      }
      
      // Fetch fresh data from floors API
      const response = await apiClient.getFloors(restaurantId);
      const floorsData = response.floors || [];
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify({
        floors: floorsData,
        timestamp: Date.now()
      }));
      
      console.log('🏢 Loaded floors:', floorsData.length);
      console.log('🪑 Total tables across all floors:', floorsData.reduce((sum, floor) => sum + floor.tables.length, 0));
      console.log('🏢 Floors cached in localStorage with key:', cacheKey);
      
      setFloors(floorsData);
      // Extract all tables from floors for validation
      const allTables = floorsData.flatMap(floor => floor.tables);
      setTables(allTables);
      return floorsData;
      
    } catch (error) {
      console.error('Error loading floors:', error);
      // Return empty array on error, don't set error state
      return [];
    }
  };

  const validateTableNumber = async (tableNumber) => {
    if (!tableNumber || !tableNumber.trim()) {
      return { valid: true, table: null }; // Optional table number
    }

    const tableNum = tableNumber.trim().toLowerCase();
    console.log('🔍 Validating table number:', tableNum);

    // Check in current tables state first (check both name and number fields)
    let foundTable = tables.find(table => {
      const tableName = table.name && table.name.toString().toLowerCase();
      const tableNumber = table.number && table.number.toString().toLowerCase();
      return tableName === tableNum || tableNumber === tableNum;
    });

    if (foundTable) {
      console.log('✅ Table found in cache:', foundTable);
      console.log('📝 Table details - ID:', foundTable.id, 'Name:', foundTable.name, 'Status:', foundTable.status);
      return { valid: true, table: foundTable };
    }

    // If not found in cache, refresh from API
    console.log('🔄 Table not in cache, refreshing from API...');
    const freshFloors = await loadFloors(selectedRestaurant?.id);
    const freshTables = freshFloors.flatMap(floor => floor.tables);
    
    foundTable = freshTables.find(table => {
      const tableName = table.name && table.name.toString().toLowerCase();
      const tableNumber = table.number && table.number.toString().toLowerCase();
      return tableName === tableNum || tableNumber === tableNum;
    });

    if (foundTable) {
      console.log('✅ Table found after refresh:', foundTable);
      return { valid: true, table: foundTable };
    }

    console.log('❌ Table not found:', tableNum);
    return { 
      valid: false, 
      table: null, 
      error: `Table number "${tableNumber}" not found. Please check the table number and try again.` 
    };
  };

  const updateTableStatus = async (tableId, status, orderId = null) => {
    try {
      console.log(`🪑 Updating table ${tableId} status to ${status} with orderId: ${orderId}`);
      const result = await apiClient.updateTableStatus(tableId, status, orderId, selectedRestaurant?.id);
      console.log('✅ Table status update successful:', result);
      
      // Update local tables state
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId 
            ? { ...table, status, currentOrderId: orderId }
            : table
        )
      );
      
      // Update floors cache
      if (selectedRestaurant?.id) {
        const cacheKey = `floors_${selectedRestaurant.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const cache = JSON.parse(cachedData);
          // Update table in floors structure
          cache.floors = cache.floors.map(floor => ({
            ...floor,
            tables: floor.tables.map(table => 
              table.id === tableId 
                ? { ...table, status, currentOrderId: orderId }
                : table
            )
          }));
          localStorage.setItem(cacheKey, JSON.stringify(cache));
          console.log(`🏢 Updated table ${tableId} status in floors cache`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error updating table status:', error);
      console.error('Table ID:', tableId, 'Status:', status, 'Order ID:', orderId);
    }
  };

  // Handle table parameters from URL (e.g. coming from /tables page)
  useEffect(() => {
    // Support both param formats: tables page (tableId/tableNo/floorId/floorName) and direct (table/floor/capacity)
    const tableParam = searchParams.get('table') || searchParams.get('tableNo');
    const floorParam = searchParams.get('floor') || searchParams.get('floorName');
    const capacityParam = searchParams.get('capacity');
    const tableIdParam = searchParams.get('tableId');

    if (tableParam) {
      setSelectedTable({
        id: tableIdParam || null,
        name: tableParam,
        floor: floorParam || null,
        capacity: capacityParam
      });
      setTableNumber(tableParam); // Auto-fill the table number input field
      setOrderType('dine-in'); // Force dine-in when table is selected

      // Clean table params from URL to prevent stale data on subsequent actions
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('tableId');
        url.searchParams.delete('tableNo');
        url.searchParams.delete('table');
        url.searchParams.delete('floorId');
        url.searchParams.delete('floorName');
        url.searchParams.delete('floor');
        url.searchParams.delete('capacity');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams]);

  // Auto-select pricing rule when table changes
  useEffect(() => {
    if (!multiPricingEnabled || pricingRules.length === 0) return;
    if (selectedTable?.floor) {
      const floorName = selectedTable.floor;
      const matchedRule = pricingRules.find(rule =>
        (rule.tableMappings || []).some(m =>
          floorName.toLowerCase().trim() === m.toLowerCase().trim()
        )
      );
      if (matchedRule) {
        setActivePricingRuleId(matchedRule.id);
        setAutoSelectedRule(true);
      } else {
        setAutoSelectedRule(false);
      }
    } else {
      setAutoSelectedRule(false);
    }
  }, [selectedTable, multiPricingEnabled, pricingRules]);

  // Auto-select pricing rule when order type changes (takeaway/delivery → match rule by name)
  useEffect(() => {
    if (!multiPricingEnabled || pricingRules.length === 0) return;
    if (orderType === 'takeaway') {
      const takeawayRule = pricingRules.find(r =>
        ['takeaway', 'take away', 'take-away'].includes((r.name || '').toLowerCase().trim())
      );
      if (takeawayRule) {
        setActivePricingRuleId(takeawayRule.id);
        setAutoSelectedRule(true);
      } else {
        // No takeaway rule defined — use base price
        setActivePricingRuleId(null);
        setAutoSelectedRule(false);
      }
    } else if (orderType === 'delivery') {
      const deliveryRule = pricingRules.find(r =>
        (r.name || '').toLowerCase().trim() === 'delivery'
      );
      if (deliveryRule) {
        setActivePricingRuleId(deliveryRule.id);
        setAutoSelectedRule(true);
      } else {
        setActivePricingRuleId(null);
        setAutoSelectedRule(false);
      }
    } else if (orderType === 'dine-in') {
      // Auto-select first area rule when switching to dine-in (if no table mapping)
      if (!selectedTable?.floor) {
        setAutoSelectedRule(false);
        const skipNames = ['dine-in', 'dinein', 'dine in', 'takeaway', 'take away', 'delivery'];
        const areaRules = pricingRules.filter(r =>
          !skipNames.includes((r.name || '').toLowerCase().trim())
        );
        if (areaRules.length > 0) {
          setActivePricingRuleId(areaRules[0].id);
        } else {
          setActivePricingRuleId(null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType, multiPricingEnabled, pricingRules]);

  // Handle view parameter from URL (for view state persistence)
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'tables' || viewParam === 'orders') {
      setViewMode(viewParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle logo click to switch from tables to orders view
  useEffect(() => {
    const handleLogoClick = () => {
      // Switch to orders view and update URL (remove view param)
      setViewMode('orders');
      setOrderSuccess(null);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('orderId');
        url.searchParams.delete('mode');
        url.searchParams.delete('from');
        window.history.pushState({ view: 'orders' }, '', url.toString());
      }
    };

    window.addEventListener('logoClickSwitchToOrders', handleLogoClick);
    return () => window.removeEventListener('logoClickSwitchToOrders', handleLogoClick);
  }, []);

  // Handle browser back/forward button for view switching
  useEffect(() => {
    const handlePopState = (event) => {
      // Check URL for view parameter
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam === 'tables') {
        setViewMode('tables');
      } else {
        setViewMode('orders');
      }
      // Clear any stale messages on navigation
      setOrderSuccess(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle orderId parameter from URL (for edit mode from Order History or Tables)
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const mode = searchParams.get('mode');
    const fromParam = searchParams.get('from'); // 'tables' | 'orderhistory' | null

    if (orderId && selectedRestaurant?.id) {
      console.log('🔄 Dashboard: Order ID from URL:', orderId, 'Mode:', mode, 'From:', fromParam);

      // IMPORTANT: Clear any stale billing/KOT summary when entering edit mode
      // This prevents showing "Billing Complete" from previous actions
      if (mode === 'edit') {
        setOrderSuccess(null);
      }

      // Track where user came from for return navigation
      // Respect the 'from' parameter even in edit mode
      if (fromParam === 'tables') {
        // User came from tables view - should return to tables after action
        setReturnToView('tables');
      } else if (fromParam === 'orderhistory') {
        // User came from order history - stay on orders view after action
        setReturnToView(null);
      } else {
        setReturnToView(null);
      }

      // Switch to orders view (menu view) when loading an order
      setViewMode('orders');

      // Show partial loading state instead of full page reload
      setOrderLoadingPartial(true);

      // Set the order lookup value in search box
      setOrderLookup(orderId);

      // Add a small delay to ensure the search box is updated, then trigger search directly
      setTimeout(async () => {
        console.log('🔄 Auto-triggering order lookup for:', orderId);
        await triggerOrderLookup(orderId);
        setOrderLoadingPartial(false);
      }, 300); // Reduced delay for faster UX
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedRestaurant?.id]);

  const filteredItemsBase = (menuItems || []).filter(item => {
    // Hide out-of-stock items if setting enabled
    if (posSettings.hideOutOfStock) {
      const stockManaged = item.isStockManaged && typeof item.stockQuantity === 'number';
      const outOfStock = item.isAvailable === false || (stockManaged && item.stockQuantity === 0);
      if (outOfStock) return false;
    }
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    // When searching, always search all items regardless of category
    if (searchTerm.trim()) return matchesSearch;
    const matchesCategory = selectedCategory === 'all-items'
      ? true
      : selectedCategory === 'favorites'
      ? item.isFavorite === true
      : item.category?.toLowerCase() === selectedCategory;
    return matchesCategory;
  });

  // Multi-tier pricing: resolve display price for an item
  const getItemDisplayPrice = useCallback((item) => {
    if (!multiPricingEnabled || !activePricingRuleId) return item.price;
    // Priority 1: Per-item override for this exact rule
    if (item.pricingRules && typeof item.pricingRules[activePricingRuleId] === 'number') {
      return item.pricingRules[activePricingRuleId];
    }
    // Priority 2: Zone rules inherit from Dine-In per-item price
    const rule = pricingRules.find(r => r.id === activePricingRuleId);
    if (rule && isZoneRule(rule)) {
      const diRule = findDineInRule(pricingRules);
      if (diRule && item.pricingRules && typeof item.pricingRules[diRule.id] === 'number') {
        return item.pricingRules[diRule.id];
      }
    }
    // Priority 3: Rule default markup
    if (rule?.defaultMarkupType === 'percentage' && rule.defaultMarkupValue) {
      return Math.round(item.price * (1 + rule.defaultMarkupValue / 100) * 100) / 100;
    }
    if (rule?.defaultMarkupType === 'flat' && rule.defaultMarkupValue) {
      return Math.round((item.price + rule.defaultMarkupValue) * 100) / 100;
    }
    return item.price;
  }, [multiPricingEnabled, activePricingRuleId, pricingRules, findDineInRule, isZoneRule]);

  // Re-price cart items when pricing rule changes
  useEffect(() => {
    if (!multiPricingEnabled || cart.length === 0) return;
    setCart(prevCart => prevCart.map(item => {
      // Find the original menu item to get pricingRules overrides
      const menuItem = menuItems.find(m => m.id === item.id || m._id === item._id);
      // Resolve true base price: prefer stored basePrice, then _originalPrice, then menu item's price, then cart price
      const basePrice = item.basePrice ?? item._originalPrice ?? menuItem?.price ?? item.price;
      let newPrice = basePrice;
      if (activePricingRuleId) {
        // Priority 1: Check per-item override from menu item's pricingRules (handle both number and string)
        const perItemPrice = menuItem?.pricingRules?.[activePricingRuleId]
          ?? item?.pricingRules?.[activePricingRuleId];
        const parsed = perItemPrice != null ? Number(perItemPrice) : NaN;
        if (!isNaN(parsed) && parsed >= 0) {
          newPrice = parsed;
        } else {
          const rule = pricingRules.find(r => r.id === activePricingRuleId);
          // Priority 2: Zone rules inherit from Dine-In per-item price
          if (rule && isZoneRule(rule)) {
            const diRule = findDineInRule(pricingRules);
            if (diRule) {
              const diPrice = menuItem?.pricingRules?.[diRule.id] ?? item?.pricingRules?.[diRule.id];
              const diParsed = diPrice != null ? Number(diPrice) : NaN;
              if (!isNaN(diParsed) && diParsed >= 0) {
                newPrice = diParsed;
              }
            }
          }
          // Priority 3: Apply default markup from rule
          if (newPrice === basePrice) {
            if (rule?.defaultMarkupType === 'percentage' && rule.defaultMarkupValue) {
              newPrice = Math.round(basePrice * (1 + rule.defaultMarkupValue / 100) * 100) / 100;
            } else if (rule?.defaultMarkupType === 'flat' && rule.defaultMarkupValue) {
              newPrice = Math.round((basePrice + rule.defaultMarkupValue) * 100) / 100;
            }
          }
        }
      }
      return {
        ...item,
        price: newPrice,
        basePrice: basePrice,
        appliedPricingRuleId: activePricingRuleId || null,
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePricingRuleId, multiPricingEnabled, menuItems]);

  // Apply display prices to filtered items for rendering
  const filteredItems = multiPricingEnabled && activePricingRuleId
    ? filteredItemsBase.map(item => {
        const displayPrice = getItemDisplayPrice(item);
        return displayPrice !== item.price ? { ...item, price: displayPrice, _originalPrice: item.price } : item;
      })
    : filteredItemsBase;

  const addToCart = (itemRaw) => {
    // Block out-of-stock items
    if (itemRaw?.isAvailable === false) {
      setNotification({ type: 'error', title: t('dashboard.outOfStock'), message: `"${itemRaw.name}" is currently out of stock`, show: true });
      return;
    }
    // Check stock limit if stock managed
    if (itemRaw?.isStockManaged && typeof itemRaw?.stockQuantity === 'number') {
      const currentInCart = getItemQuantityInCart(itemRaw.id);
      if (currentInCart >= itemRaw.stockQuantity) {
        setNotification({ type: 'error', title: t('dashboard.stockLimit'), message: `Only ${itemRaw.stockQuantity} "${itemRaw.name}" in stock`, show: true });
        return;
      }
    }

    // When billing/KOT success screen is showing and user adds a new item,
    // treat it as starting a fresh order — clear everything first
    if (orderSuccess?.show) {
      setOrderSuccess(null);
      setCart([]);
      setCurrentOrder(null);
      setActiveSavedOrderId(null);
      setCustomerName('');
      setCustomerMobile('');
      setCustomerData(null);
      setTableNumber('');
      setManualTableNumber('');
      setManualRoomNumber('');
      setOrderLookup('');
      setReturnToView(null);
      localStorage.removeItem('dine_cart');
      if (selectedTable && selectedTable.id) {
        apiClient.updateTableStatus(selectedTable.id, 'available', null, selectedRestaurant?.id);
        setSelectedTable(null);
      }
    }

    // Multi-tier pricing: always preserve the true base price and set rule-adjusted price
    let item = itemRaw;
    if (multiPricingEnabled && activePricingRuleId && !itemRaw?.selectedVariant) {
      const adjustedPrice = getItemDisplayPrice(itemRaw);
      // Use _originalPrice (set by filteredItems mapping) or existing basePrice as the true base
      const trueBasePrice = itemRaw._originalPrice ?? itemRaw.basePrice ?? itemRaw.price;
      item = { ...itemRaw, price: adjustedPrice, basePrice: trueBasePrice, appliedPricingRuleId: activePricingRuleId };
    }

    setCart(prevCart => {
      // Build a signature for matching same-config items
      const variantKey = item?.selectedVariant?.name || null;
      const toppingsIds = Array.isArray(item?.selectedCustomizations)
        ? [...item.selectedCustomizations].map(c => c.id || c.name).sort().join('|')
        : null;

      // Try to find an existing cart line with same menu item and same configuration
      const existingIndex = prevCart.findIndex(ci => {
        const ciVariant = ci?.selectedVariant?.name || null;
        const ciToppings = Array.isArray(ci?.selectedCustomizations)
          ? [...ci.selectedCustomizations].map(c => c.id || c.name).sort().join('|')
          : null;
        return ci.id === item.id && ciVariant === variantKey && ciToppings === toppingsIds;
      });

      if (existingIndex !== -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 0) + (item.quantity || 1)
        };
        return updated;
      }

      // Ensure a stable cartId for customized lines
      const withId = item.cartId
        ? item
        : {
            ...item,
            cartId: item.selectedVariant || item.selectedCustomizations
              ? `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
              : undefined
          };

      return [{ ...withId, quantity: withId.quantity || 1 }, ...prevCart];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      return prevCart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: Math.max(0, cartItem.quantity - 1) }
          : cartItem
      ).filter(cartItem => cartItem.quantity > 0);
    });
  };

  const handleToggleFavorite = async (item) => {
    if (!selectedRestaurant?.id) {
      return;
    }

    try {
      const isCurrentlyFavorite = item.isFavorite === true;
      
      if (isCurrentlyFavorite) {
        await apiClient.unmarkMenuItemAsFavorite(selectedRestaurant.id, item.id);
      } else {
        await apiClient.markMenuItemAsFavorite(selectedRestaurant.id, item.id);
      }

      // Update the menu item in state
      setMenuItems(prevItems => prevItems.map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, isFavorite: !isCurrentlyFavorite }
          : menuItem
      ));

      // Reload menu to sync with backend
      await loadMenu(selectedRestaurant.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handler to open customization modal
  const handleItemCustomization = (item) => {
    setSelectedItemForCustomization(item);
    setCustomizationModalOpen(true);
  };

  // Handler to close customization modal
  const handleCloseCustomizationModal = () => {
    setCustomizationModalOpen(false);
    setSelectedItemForCustomization(null);
  };

  // Handle short code search
  const handleShortCodeSearch = (e) => {
    if (e.key === 'Enter' && shortCodeSearch.trim()) {
      const searchValue = shortCodeSearch.trim().toUpperCase();
      const foundItem = (menuItems || []).find(item => 
        item.shortCode?.toUpperCase() === searchValue
      );
      
      if (foundItem) {
        addToCart(foundItem);
        setShortCodeSearch('');
      } else {
        // Show error notification if short code not found
        setNotification({
          type: 'error',
          title: t('dashboard.shortCodeNotFound'),
          message: `No item found with short code "${searchValue}"`,
          show: true
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    }
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    setCart(prevCart => {
      return prevCart.map(cartItem =>
        (cartItem.cartId ? cartItem.cartId === itemId : cartItem.id === itemId)
          ? { ...cartItem, quantity: Math.max(1, newQuantity) }
          : cartItem
      ).filter(cartItem => cartItem.quantity > 0);
    });
  };

  const getTotalAmount = () => {
    const total = cart.reduce((sum, item) => {
      let base;
      if (item?.selectedVariant?.price != null) {
        base = item.selectedVariant.price;
      } else if (multiPricingEnabled && activePricingRuleId) {
        // Check per-item pricing override
        const perItemPrice = item?.pricingRules?.[activePricingRuleId];
        const parsed = perItemPrice != null ? Number(perItemPrice) : NaN;
        if (!isNaN(parsed) && parsed >= 0) {
          base = parsed;
        } else {
          // No per-item price for this rule — use original base price
          base = typeof item?.basePrice === 'number' ? item.basePrice
            : typeof item?.price === 'number' ? item.price : 0;
        }
      } else {
        base = typeof item?.price === 'number' ? item.price : 0;
      }
      const extras = Array.isArray(item?.selectedCustomizations)
        ? item.selectedCustomizations.reduce((s, c) => s + (c?.price || 0), 0)
        : (typeof item?.customizationPrice === 'number' ? item.customizationPrice : 0);
      const unit = (base || 0) + (extras || 0);
      const itemTotal = unit * (item.quantity || 1);
      return sum + itemTotal;
    }, 0);
    console.log(`💰 Cart total: ${total}`);
    return total;
  };

  const handleQuickSearch = (e) => {
    if (e.key === 'Enter' && quickSearch.trim()) {
      const searchValue = quickSearch.trim().toLowerCase();
      const foundItem = (menuItems || []).find(item => 
        item.shortCode?.toLowerCase() === searchValue || 
        item.name.toLowerCase().includes(searchValue)
      );
      
      if (foundItem) {
        addToCart(foundItem);
        setQuickSearch('');
      }
    }
  };

  // Background refresh when switching to tables
  useEffect(() => {
    if (viewMode === 'tables' && selectedRestaurant?.id) {
      prefetchTables(selectedRestaurant.id);
    }
  }, [viewMode, selectedRestaurant?.id, prefetchTables]);

  // Stable ref for prefetchTables so Pusher doesn't re-subscribe on every render
  const prefetchTablesRef = useRef(prefetchTables);
  useEffect(() => { prefetchTablesRef.current = prefetchTables; }, [prefetchTables]);

  // Pusher subscription for real-time table status updates
  useEffect(() => {
    if (!selectedRestaurant?.id) return;

    const restaurantId = selectedRestaurant.id;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    });

    // Subscribe to restaurant-specific channel
    const channelName = `restaurant-${restaurantId}`;
    const channel = pusher.subscribe(channelName);

    console.log(`📡 Dashboard: Subscribed to Pusher channel '${channelName}' for table updates`);

    // Debounce rapid Pusher events — separate timers for table vs order events
    let tableDebounce = null;
    let orderDebounce = null;

    // Table events: refresh quickly (1s debounce) — these directly affect table view
    const debouncedTableRefresh = () => {
      if (tableDebounce) clearTimeout(tableDebounce);
      tableDebounce = setTimeout(() => prefetchTablesRef.current(restaurantId), 1000);
    };

    // Order events: refresh less aggressively (3s debounce) — only matters for table
    // status badges. Skip entirely if user is actively in billing flow (cart has items).
    const debouncedOrderRefresh = () => {
      if (orderDebounce) clearTimeout(orderDebounce);
      orderDebounce = setTimeout(() => {
        prefetchTablesRef.current(restaurantId);
      }, 3000);
    };

    // Bind events with appropriate refresh strategy
    channel.bind('order-created', (data) => {
      console.log(`📡 Dashboard: Received 'order-created' event:`, data);
      debouncedOrderRefresh();
    });
    channel.bind('order-updated', (data) => {
      console.log(`📡 Dashboard: Received 'order-updated' event:`, data);
      debouncedOrderRefresh();
    });
    channel.bind('order-status-updated', (data) => {
      console.log(`📡 Dashboard: Received 'order-status-updated' event:`, data);
      debouncedOrderRefresh();
    });
    channel.bind('order-completed', (data) => {
      console.log(`📡 Dashboard: Received 'order-completed' event:`, data);
      // Completed orders release tables — refresh quickly
      debouncedTableRefresh();
    });
    channel.bind('order-deleted', (data) => {
      console.log(`📡 Dashboard: Received 'order-deleted' event:`, data);
      debouncedTableRefresh();
    });
    channel.bind('table-status-updated', (data) => {
      console.log(`📡 Dashboard: Received 'table-status-updated' event:`, data);
      debouncedTableRefresh();
    });
    channel.bind('order-voided', (data) => {
      console.log(`📡 Dashboard: Received 'order-voided' event:`, data);
      debouncedOrderRefresh();
      // Show notification only for owner/admin
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'owner' || user.role === 'admin') {
          setNotification({
            type: 'error',
            title: `Order #${data.dailyOrderId || data.orderNumber || '?'} Voided`,
            message: `Cancelled by ${data.cancelledBy || 'Staff'}${data.reason ? ` — ${data.reason}` : ''}. Amount: ${data.totalAmount || 0}`,
            show: true
          });
        }
      } catch (e) { /* ignore parse errors */ }
    });

    // Cleanup on unmount
    return () => {
      if (tableDebounce) clearTimeout(tableDebounce);
      if (orderDebounce) clearTimeout(orderDebounce);
      console.log(`📡 Dashboard: Unsubscribing from channel '${channelName}'`);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [selectedRestaurant?.id]); // Only re-subscribe when restaurant changes

  // Reset UI state for fresh order
  const handleFreshOrder = () => {
    setCart([]);
    setTableNumber('');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerData(null);
    setOrderLookup('');
    setCurrentOrder(null);
    setSelectedTable(null);
    setManualTableNumber('');
    setError('');
    setNotification(null);
    setOrderSuccess(null);
    setOrderComplete(false);
    setPlacingOrder(false);
    setActiveSavedOrderId(null); // Clear active saved order
    if (typeof window !== 'undefined') router.replace('/dashboard');
    // Show success notification
    setNotification({
      type: 'success',
      title: t('dashboard.freshOrderStarted'),
      message: t('dashboard.readyForNewOrder'),
      show: true
    });
  };

  // Direct order lookup function (for auto-trigger from URL)
  const triggerOrderLookup = useCallback(async (orderId) => {
    if (!orderId || !selectedRestaurant?.id) return;
    
      try {
        setOrderSearchLoading(true);
      setIsLoadingOrder(true); // Set flag to prevent localStorage override
        setError(''); // Clear any existing errors
        
      console.log('🔍 Auto-triggered order lookup - Restaurant ID:', selectedRestaurant?.id);
      console.log('🔍 Auto-triggered order lookup - Search value:', orderId);
        
        const response = await apiClient.getOrders(selectedRestaurant.id, {
        search: orderId
        });

      console.log('🔍 Auto-triggered order lookup response:', response);

        if (response.orders && response.orders.length > 0) {
          const order = response.orders[0]; // Get the first matching order
        const mode = searchParams.get('mode');
        
          setCurrentOrder(order);
        
        // Clear any existing cart from localStorage to avoid conflicts
        localStorage.removeItem('dine_cart');
        console.log('🧹 Cleared localStorage cart before loading order');
          
          // Load the order items into cart for editing
        const orderItems = Array.isArray(order.items) ? order.items.map(item => {
          console.log('🔍 Order item data:', item);
          console.log('🔍 Available fields:', Object.keys(item));
          
          // Try multiple possible name fields
          let name = 'Unknown Item';
          if (item.name) {
            name = item.name;
          } else if (item.menuItem?.name) {
            name = item.menuItem.name;
          } else if (item.itemName) {
            name = item.itemName;
          } else if (item.productName) {
            name = item.productName;
          }
          
          // Try multiple possible price fields
          let price = 0;
          if (item.price && !isNaN(parseFloat(item.price))) {
            price = parseFloat(item.price);
          } else if (item.total && !isNaN(parseFloat(item.total))) {
            price = parseFloat(item.total);
          } else if (item.unitPrice && !isNaN(parseFloat(item.unitPrice))) {
            price = parseFloat(item.unitPrice);
          } else if (item.itemPrice && !isNaN(parseFloat(item.itemPrice))) {
            price = parseFloat(item.itemPrice);
          } else if (item.menuItem?.price && !isNaN(parseFloat(item.menuItem.price))) {
            price = parseFloat(item.menuItem.price);
          }
          
          // If price is still 0 or NaN, try to calculate from total/quantity
          if (!price || isNaN(price) || price <= 0) {
            const total = parseFloat(item.total) || parseFloat(item.itemTotal) || parseFloat(item.subtotal) || 0;
            const qty = parseInt(item.quantity) || 1;
            if (total > 0 && qty > 0) {
              price = total / qty;
            }
          }
          
          // Final fallback - if still no price, set to 0 but log warning
          if (!price || isNaN(price) || price <= 0) {
            console.warn(`⚠️ Could not determine price for item:`, item);
            price = 0;
          }
          
          // Try multiple possible ID fields
          let id = item.menuItemId || item.id || item.menuItem?.id || item.itemId;
          
          console.log(`🔍 Parsed - Name: ${name}, Price: ${price}, ID: ${id}, Quantity: ${item.quantity}`);
          
          // Look up category from menu items if not in order data
          const matchedMenu = menuItems.find(m => m.id === id);
          return {
            id: id,
            name: name,
            price: price || 0,
            quantity: parseInt(item.quantity) || 1,
            category: item.category || item.menuItem?.category || matchedMenu?.category || '',
            taxGroupId: item.taxGroupId || matchedMenu?.taxGroupId || null,
            // Store original data for reference
            originalData: item
          };
        }) : [];
        
        // If we have unknown items, try to fetch menu items and match them BEFORE setting cart
        const hasUnknownItems = orderItems.some(item => item.name === 'Unknown Item');
        if (hasUnknownItems && selectedRestaurant?.id) {
          console.log('🔍 Found unknown items, fetching menu items to match...');
          try {
            const menuResponse = await apiClient.getMenuItems(selectedRestaurant.id);
            if (menuResponse.success && menuResponse.items) {
              const updatedItems = orderItems.map(cartItem => {
                if (cartItem.name === 'Unknown Item') {
                  // Try to match by ID first
                  let menuItem = menuResponse.items.find(menuItem => 
                    menuItem.id === cartItem.id || 
                    menuItem.id === cartItem.originalData?.menuItemId ||
                    menuItem.id === cartItem.originalData?.id
                  );
                  
                  // If no match by ID, try to match by name (fuzzy matching)
                  if (!menuItem) {
                    const originalName = cartItem.originalData?.name || 
                                       cartItem.originalData?.menuItem?.name ||
                                       cartItem.originalData?.itemName ||
                                       cartItem.originalData?.productName;
                    
                    if (originalName) {
                      menuItem = menuResponse.items.find(menuItem => 
                        menuItem.name.toLowerCase().includes(originalName.toLowerCase()) ||
                        originalName.toLowerCase().includes(menuItem.name.toLowerCase())
                      );
                    }
                  }
                  
                  if (menuItem) {
                    console.log(`🔍 Found menu item match: ${menuItem.name} - ${menuItem.price}`);
                    return {
                      ...cartItem,
                      id: menuItem.id,
                      name: menuItem.name,
                      price: parseFloat(menuItem.price) || cartItem.price,
                      category: menuItem.category || cartItem.category
                    };
                  }
                }
                return cartItem;
              });
              
              console.log('🔍 Setting cart with matched items:', updatedItems);
              setCart(updatedItems);
              console.log('🔍 Cart state immediately after setCart:', updatedItems);
              
              // Add a small delay to ensure cart state is updated
              setTimeout(() => {
                console.log('✅ Cart state should be updated with matched items');
              }, 200);
            } else {
              console.log('🔍 No menu items found, setting cart with original items');
          setCart(orderItems);
              setTimeout(() => {
                console.log('✅ Cart state updated with original items');
              }, 200);
            }
          } catch (error) {
            console.error('🔍 Error fetching menu items for matching:', error);
            console.log('🔍 Setting cart with original items due to error');
            setCart(orderItems);
            setTimeout(() => {
              console.log('✅ Cart state updated with original items (error case)');
            }, 200);
          }
        } else {
          console.log('🔍 No unknown items, setting cart directly');
          setCart(orderItems);
          setTimeout(() => {
            console.log('✅ Cart state updated directly');
          }, 200);
        }
        
          // Set table/room number and location type based on order data
          if (order.roomNumber) {
            // Order has room number - set location type to room
            setLocationType('room');
            setManualRoomNumber(order.roomNumber || '');
            setTableNumber('');
          } else if (order.tableNumber) {
            // Order has table number - set location type to table
            setLocationType('table');
            setTableNumber(order.tableNumber || '');
            setManualRoomNumber('');
          } else {
            // No table or room - default to table
            setLocationType('table');
            setTableNumber('');
            setManualRoomNumber('');
          }
          
          setOrderType(order.orderType || 'dine-in');
          setPaymentMethod(order.paymentMethod || 'cash');
          
          // Set customer info if available
          if (order.customerInfo) {
            setCustomerName(String(order.customerInfo.name || ''));
            setCustomerMobile(String(order.customerInfo.phone || ''));
          }
          
        // Show appropriate notification based on mode
        if (mode === 'view') {
          setNotification({
            type: 'info',
            title: t('dashboard.orderLoadedViewingEmoji'),
            message: `${t('dashboard.orderLoadedViewMode')}`,
            show: true
          });
        } else if (mode === 'edit') {
          // Check if order is completed
          if (order.status === 'completed') {
            setNotification({
              type: 'success',
              title: t('dashboard.newOrderCreatedEmoji'),
              message: t('dashboard.newOrderFromCompletedMsg', { id: orderId }),
              show: true
            });
            // Clear current order for new order creation
            setCurrentOrder(null);
          } else {
            setNotification({
              type: 'success',
              title: t('dashboard.orderReadyEditingEmoji'),
              message: t('dashboard.orderLoadedReady'),
              show: true
            });
          }
        } else if (mode === 'duplicate') {
          setNotification({
            type: 'success',
            title: t('dashboard.newOrderCreatedEmoji'),
            message: t('dashboard.newOrderFromCompletedMsg', { id: orderId }),
            show: true
          });
          // Clear current order for new order creation
          setCurrentOrder(null);
        } else {
          setNotification({
            type: 'success',
            title: t('dashboard.orderFoundEmoji'),
            message: t('dashboard.orderLoadedReady'),
            show: true
          });
        }
          
        // Keep the search value in the input box
        // setOrderLookup(''); // Removed this line
          
        } else {
          setNotification({
          type: 'error',
            title: t('dashboard.orderNotFound'),
          message: `No order found with ID "${orderId}"`,
            show: true
          });
        // Keep the search value in the input box
        // setOrderLookup(''); // Removed this line
        }
      } catch (error) {
      console.error('Auto-triggered order lookup error:', error);
        setNotification({
          type: 'error',
        title: t('dashboard.errorLoadingOrder'),
        message: error.message || 'Failed to load order',
          show: true
        });
      // Keep the search value in the input box
      // setOrderLookup(''); // Removed this line
      } finally {
        setOrderSearchLoading(false);
      setIsLoadingOrder(false); // Clear flag to allow localStorage loading
      }
  }, [selectedRestaurant?.id, searchParams, menuItems]);

  // Audio Visualizer Function
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      // Start visualization
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Create 12 bars from frequency data
        const barCount = 12;
        const levels = [];
        const step = Math.floor(dataArray.length / barCount);
        
        for (let i = 0; i < barCount; i++) {
          const index = i * step;
          const value = dataArray[index] || 0;
          // Normalize to 0-100
          levels.push(Math.min(100, (value / 255) * 100));
        }
        
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      updateVisualizer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    setAudioLevels([]);
  };

  // Smart Voice Processing - sends to API with cart context
  const processSmartVoice = async (transcript) => {
    if (!selectedRestaurant?.id || !transcript || voiceProcessingRef.current) return;

    // Skip if same as last processed
    if (transcript === lastChunkRef.current) return;
    lastChunkRef.current = transcript;
    voiceProcessingRef.current = true;

    try {
      const response = await apiClient.smartVoiceProcess({
        transcript,
        restaurantId: selectedRestaurant.id,
        existingCart: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        processedItemIds: processedVoiceItems.map(i => i.id),
        isStreaming: true
      });

      // Update compiled text
      if (response.compiledText) {
        setVoiceCompiledText(response.compiledText);
      }

      // Process items
      if (response.items?.length > 0) {
        let addedCount = 0;
        for (const item of response.items) {
          if (item.action === 'add') {
            const existingItem = cart.find(c => c.id === item.id);
            if (existingItem) {
              updateCartItemQuantity(item.id, existingItem.quantity + (item.quantity || 1));
            } else {
              addToCart({ ...item, quantity: item.quantity || 1 });
            }
            setProcessedVoiceItems(prev => [...prev, item]);
            addedCount++;
          } else if (item.action === 'remove') {
            removeFromCart(item.id);
          } else if (item.action === 'update' && item.quantity) {
            updateCartItemQuantity(item.id, item.quantity);
          }
        }
        setVoiceItemsAdded(prev => prev + addedCount);
      }

      // Auto-stop if AI detected completion intent
      if (response.shouldStop) {
        console.log('🛑 Auto-stopping: AI detected completion intent');
        setTimeout(() => stopVoiceListening(true), 500);
      }

    } catch (error) {
      console.error('Smart voice processing error:', error);
    } finally {
      voiceProcessingRef.current = false;
    }
  };

  // Voice Assistant Functions
  const startVoiceListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t('dashboard.speechNotSupported'));
      return;
    }

    // Initialize session
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setVoiceSessionId(sessionId);
    setProcessedVoiceItems([]);
    setVoiceCompiledText('');
    setVoiceItemsAdded(0);
    lastChunkRef.current = '';
    voiceProcessingRef.current = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Hindi for better Indian accent recognition

    recognition.onstart = () => {
      setIsListeningVoice(true);
      setVoiceTranscript('');
      finalTranscriptRef.current = '';
    };

    recognition.onresult = async (event) => {
      let interimTranscript = '';
      let newFinalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (newFinalTranscript) {
        finalTranscriptRef.current += newFinalTranscript;
        // Process with smart API
        processSmartVoice(finalTranscriptRef.current.trim());
      }

      const displayText = finalTranscriptRef.current + (interimTranscript ? interimTranscript : '');
      setVoiceTranscript(displayText.trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        stopVoiceListening(false);
      }
    };

    recognition.onend = () => {
      if (isListeningVoice) {
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition restart failed');
        }
      }
    };

    setRecognitionInstance(recognition);
    recognition.start();
  };

  const stopVoiceListening = async (isAutoStop = false) => {
    setIsListeningVoice(false);
    stopAudioVisualizer();

    if (recognitionInstance) {
      recognitionInstance.stop();
      setRecognitionInstance(null);
    }

    // Show final notification
    const totalItems = voiceItemsAdded;
    if (totalItems > 0) {
      setNotification({
        type: 'success',
        title: isAutoStop ? 'Order Recorded' : 'Voice Order Complete',
        message: `${totalItems} item${totalItems > 1 ? 's' : ''} added to cart`,
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
    } else if (!isAutoStop && finalTranscriptRef.current.trim()) {
      setNotification({
        type: 'warning',
        title: t('dashboard.noItemsFound'),
        message: t('dashboard.couldNotMatchItems'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
    }

    // Cleanup
    setVoiceTranscript('');
    finalTranscriptRef.current = '';
    setVoiceSessionId(null);
    setProcessedVoiceItems([]);
    setVoiceCompiledText('');
    setVoiceItemsAdded(0);
    lastChunkRef.current = '';
    voiceProcessingRef.current = false;
  };

  // Keyboard shortcut for command bar (Cmd/Ctrl + K)
  useEffect(() => {
    if (posSettings.hideSearchBar) return;
    const handleCommandBarShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandBarInputRef.current) {
          commandBarInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleCommandBarShortcut);
    return () => window.removeEventListener('keydown', handleCommandBarShortcut);
  }, [posSettings.hideSearchBar]);

  const processVoiceCommand = async (transcript) => {
    try {
      setIsProcessingVoice(true);
      console.log('🚀 Processing voice command:', transcript);
      
      if (!selectedRestaurant?.id) {
        setNotification({
          type: 'error',
          title: t('dashboard.noRestaurantSelected'),
          message: t('dashboard.selectRestaurantFirst'),
          show: true
        });
        setTimeout(() => setNotification(null), 3000);
        setIsProcessingVoice(false);
        return;
      }
      
      // Call the backend API
      const response = await apiClient.processVoiceOrder(transcript, selectedRestaurant.id);
      console.log('✅ Voice API response:', response);
      
      if (response.items && response.items.length > 0) {
        // Add items to cart
        response.items.forEach(item => {
          const existingItem = cart.find(cartItem => cartItem.id === item.id);
          
          if (existingItem) {
            updateCartItemQuantity(existingItem.id, existingItem.quantity + item.quantity);
          } else {
            addToCart({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1
            });
          }
        });
        
        // Show success notification
        setNotification({
          type: 'success',
          title: t('dashboard.voiceOrderSuccessEmoji'),
          message: t('dashboard.voiceOrderSuccessMsg', { count: response.items.length, items: response.items.map(i => `${i.quantity}x ${i.name}`).join(', ') }),
          show: true
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({
          type: 'warning',
          title: t('dashboard.noItemsFound'),
          message: t('dashboard.couldNotMatchItemsFrom', { transcript }),
          show: true
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      setNotification({
        type: 'error',
        title: t('dashboard.voiceOrderFailedEmoji'),
        message: error.message || t('dashboard.voiceOrderFailedMsg'),
        show: true
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleOrderLookup = async (e) => {
    if (e.key === 'Enter' && orderLookup.trim()) {
      // Clear edit-mode URL params when manually searching for a different order
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('orderId') || url.searchParams.has('mode')) {
          url.searchParams.delete('orderId');
          url.searchParams.delete('mode');
          url.searchParams.delete('from');
          window.history.replaceState({}, '', url.toString());
        }
      }
      await triggerOrderLookup(orderLookup.trim());
    }
  };

  const processOrder = async (taxData = {}) => {
    if (cart.length === 0 || !selectedRestaurant?.id) return;

    // Extract tax information and special instructions from taxData passed by OrderSummary
    const { taxBreakdown = [], totalTax = 0, finalAmount = null, subtotal = null, specialInstructions = null, offerIds = [], manualDiscount = 0, offerDiscount: offerDiscountAmt = 0, selectedOfferName: offerName = '', totalDiscountAmount: discountTotal = 0,
      redeemLoyaltyPoints = 0, loyaltyDiscount: loyaltyDiscAmt = 0,
      serviceChargeRate = null, serviceChargeAmount: scAmount = null, tipAmount: tipAmt = null, tipPercentage: tipPct = null,
      cashReceived = null, changeReturned = null, splitPayments: splitPay = null, roundOffAmount: roundOff = null,
      partialPayAmount: partialPay = null, compItems: compData = null, voidItems: voidData = null, managerPin: mgrPin = null,
      deliveryInfo: deliveryInfoData = null,
      walletRedeemAmount: walletRedeem = null, walletCustomerId: walletCustId = null,
    } = taxData;

    // Check if order is completed and disable action
    if (currentOrder && currentOrder.status === 'completed') {
      setNotification({
        type: 'error',
        title: t('dashboard.orderCompletedEmoji'),
        message: t('dashboard.orderCompleteNoticeMsg'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Block billing if register enforcement is on and register not open
    if (posSettings.requireRegisterOpen && !registerOpen) {
      setNotification({
        type: 'error',
        title: '💰 Register Not Open',
        message: 'Please open the cash register before billing. Go to Register page.',
        show: true
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    try {
      setProcessing(true);
      setError('');

      // Get current user/staff info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if table number changed in edit mode
      // Determine if this is a room order
      const isRoomOrder = inRoomDiningEnabled && locationType === 'room' ? true : (selectedTable?.isRoom === true);
      const roomNumber = isRoomOrder 
        ? (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (selectedTable?.name || tableNumber))
        : null;
      const tableToUse = !isRoomOrder ? (tableNumber || selectedTable?.number || selectedTable?.name) : null;
      let tableChanged = false;
      
      if (currentOrder && !isRoomOrder && tableToUse && tableToUse !== currentOrder.tableNumber) {
        tableChanged = true;
        console.log('⚠️ Table number changed from', currentOrder.tableNumber, 'to', tableToUse);
        
        // Show warning but continue with order completion
        setNotification({
          type: 'warning',
          title: t('dashboard.tableChangedEmoji'),
          message: t('dashboard.tableChangedCompleteMsg', { from: currentOrder.tableNumber || 'N/A', to: tableToUse }),
          show: true
        });
      }

      // Check if we're updating an existing order or creating a new one
      if (currentOrder) {
        console.log('🔄 Updating existing order:', currentOrder.id);
        
        // Update existing order with completed status
        const updateData = {
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            notes: item.notes || '',
            name: item.name,
            price: item.price,
            category: item.category || '',
            taxGroupId: item.taxGroupId || null,
          })),
          tableNumber: !isRoomOrder ? (tableToUse || currentOrder.tableNumber) : null,
          roomNumber: isRoomOrder ? (roomNumber || currentOrder.roomNumber) : null, // NEW: Include room number
          orderType,
          paymentMethod,
          status: 'completed', // Mark as completed
          paymentStatus: partialPay ? 'partial' : 'paid', // Mark payment status
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Tax information from OrderSummary
          totalAmount: subtotal || getTotalAmount(),
          taxBreakdown: taxBreakdown,
          taxAmount: totalTax,
          finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
          // Special instructions for kitchen
          specialInstructions: specialInstructions || null,
          // Delivery info
          deliveryInfo: deliveryInfoData || null,
          // Billing feature fields
          serviceChargeRate: serviceChargeRate || null,
          serviceChargeAmount: scAmount || null,
          tipAmount: tipAmt || null,
          tipPercentage: tipPct || null,
          cashReceived: cashReceived || null,
          changeReturned: changeReturned || null,
          splitPayments: splitPay || null,
          roundOffAmount: roundOff || null,
          partialPayAmount: partialPay || null,
          paidAmount: partialPay ? Math.round(Number(partialPay) * 100) / 100 : null,
          outstandingAmount: partialPay ? Math.round(((finalAmount || (subtotal || getTotalAmount()) + totalTax) - Number(partialPay)) * 100) / 100 : null,
          compItems: compData || null,
          voidItems: voidData || null,
          // Discount/offer fields
          offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
          manualDiscount: manualDiscount || 0,
          discountAmount: offerDiscountAmt || 0,
          offerDiscount: offerDiscountAmt || 0,
          totalDiscountAmount: discountTotal || 0,
          selectedOfferName: offerName || null,
          // Loyalty fields
          redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
          loyaltyDiscount: loyaltyDiscAmt || 0,
          walletRedeemAmount: walletRedeem || null,
          lastUpdatedBy: {
            name: currentUser.name || 'Staff',
            id: currentUser.id,
            role: currentUser.role || 'waiter'
          },
          customerInfo: {
            name: customerName || currentOrder.customerInfo?.name || 'Walk-in Customer',
            phone: customerMobile || currentOrder.customerInfo?.phone || null,
            tableNumber: !isRoomOrder ? (tableToUse || currentOrder.tableNumber || null) : null,
            roomNumber: isRoomOrder ? (roomNumber || currentOrder.roomNumber || null) : null
          },
          customerId: customerData?.id || null
        };

        // If split payment, override payment method
        if (splitPay && splitPay.length > 1) {
          updateData.paymentMethod = 'split';
        }

        console.log('🔄 Update data for existing order:', updateData);

        // OFFLINE PATH: Queue update + payment for later sync
        // Check both isOnline state AND navigator.onLine for reliability (WebKit can be slow to fire offline events)
        if (!isOnline || !navigator.onLine) {
          if (!offlineEnabled) {
            setNotification({ type: 'error', title: t('dashboard.noInternet'), message: t('dashboard.offlineMsg'), show: true });
            setTimeout(() => setNotification(null), 4000);
            setBillingLoading(false);
            return;
          }
          try {
            const paymentData = {
              orderId: currentOrder.id,
              paymentMethod: paymentMethod,
              amount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
              userId: currentUser.id,
              restaurantId: selectedRestaurant.id,
              paymentStatus: partialPay ? 'partial' : 'completed'
            };
            await queueOfflineOrder({
              ...updateData,
              restaurantId: selectedRestaurant.id,
              _offlineAction: 'complete_billing_existing',
              _existingOrderId: currentOrder.id,
              _paymentData: paymentData,
              idempotencyKey: generateIdempotencyKey(),
            });
            setNotification({ type: 'success', title: t('dashboard.billingSavedOffline'), message: t('dashboard.billingSavedOfflineMsg'), show: true });
            setTimeout(() => setNotification(null), 4000);
            // Show bill summary same as online path
            setOrderSuccess({
              orderId: currentOrder.id,
              dailyOrderId: currentOrder.dailyOrderId,
              show: true,
              message: t('dashboard.billingCompleteEmoji')
            });
            setCurrentOrder(null);
            setActiveSavedOrderId(null);
            handleOrderActionComplete({ keepOrderSuccess: true, hasTable: !!(tableToUse || currentOrder.tableNumber) });
          } catch (offErr) {
            setNotification({ type: 'error', title: t('dashboard.saveFailed'), message: t('dashboard.couldNotSaveBillingLocally'), show: true });
            setTimeout(() => setNotification(null), 4000);
          }
          setProcessing(false);
          return;
        }

        const response = await apiClient.updateOrder(currentOrder.id, updateData);
        
        if (response.data) {
          // Process payment for the updated order
          console.log('💳 Processing payment for updated order:', currentOrder.id);
          await apiClient.verifyPayment({
            orderId: currentOrder.id,
            paymentMethod: paymentMethod,
            amount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay ? 'partial' : 'completed'
          });

          // Redeem wallet balance if used
          if (walletRedeem && walletRedeem > 0 && walletCustId) {
            try {
              await apiClient.redeemCustomerWallet(walletCustId, {
                amount: walletRedeem,
                orderId: currentOrder.id,
                notes: `Redeemed during billing for order #${currentOrder.dailyOrderId || currentOrder.id.slice(-6)}`
              });
              console.log('💰 Wallet redeemed:', walletRedeem);
            } catch (walletErr) {
              console.error('Wallet redemption failed (non-blocking):', walletErr);
            }
          }

          // Show notification for order completion
          setNotification({
            type: 'success',
            title: t('dashboard.orderCompletedPaymentEmoji'),
            message: t('dashboard.orderCompletedPaymentMsg', { id: currentOrder.dailyOrderId || currentOrder.id.slice(-6) }),
            show: true
          });

          const completedOrderId = currentOrder.id;

          setOrderSuccess({
            orderId: completedOrderId,
            dailyOrderId: currentOrder.dailyOrderId,
            show: true,
            message: t('dashboard.billingCompleteEmoji')
          });
          setCurrentOrder(null);
          setActiveSavedOrderId(null);
          fetchSavedOrders(); // Refresh saved orders list after billing a saved order
          // Handle return navigation after billing complete
          handleOrderActionComplete({
            keepOrderSuccess: true,
            hasTable: !!(tableToUse || currentOrder.tableNumber)
          });

          // Return orderId so OrderSummary can generate the invoice
          return { orderId: completedOrderId };
        }
      } else {
        console.log('🆕 Creating new order for direct billing');
        
        // Determine if this is a room order
        const isRoomOrder = inRoomDiningEnabled && locationType === 'room' ? true : (selectedTable?.isRoom === true);
        const roomNumber = isRoomOrder 
          ? (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (selectedTable?.name || tableToUse))
          : null;
        const finalTableNumber = !isRoomOrder ? tableToUse : null;

        // Create new order for direct billing
      const orderData = {
        restaurantId: selectedRestaurant.id,
          tableNumber: finalTableNumber || null,
          roomNumber: roomNumber || null, // NEW: Include room number for hotel orders
        orderType,
        paymentMethod,
          status: 'completed', // Set status to completed since payment is processed immediately
        staffInfo: {
            userId: currentUser?.id || null,
          name: currentUser?.name || 'Staff',
            loginId: currentUser?.loginId || currentUser?.phone || currentUser?.id || null,
            phone: currentUser?.phone || null,
          role: currentUser?.role || 'waiter'
        },
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          notes: item.notes || '',
          name: item.name,
          // Pass configuration so backend can price and persist for KOT
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
          basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price,
          category: item.category || '',
          taxGroupId: item.taxGroupId || null,
        })),
        customerInfo: {
            name: customerName || 'Walk-in Customer',
            phone: customerMobile || null,
            tableNumber: finalTableNumber || null,
            roomNumber: roomNumber || null // NEW: Include room number in customer info
        },
        customerId: customerData?.id || null,
        // Tax information from OrderSummary
        totalAmount: subtotal || getTotalAmount(),
        taxBreakdown: taxBreakdown,
        taxAmount: totalTax,
        finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
        // Discount fields
        offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
        manualDiscount: manualDiscount || 0,
        discountAmount: offerDiscountAmt || 0,
        offerDiscount: offerDiscountAmt || 0,
        totalDiscountAmount: discountTotal || 0,
        selectedOfferName: offerName || null,
        // Loyalty fields
        redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
        loyaltyDiscount: loyaltyDiscAmt || 0,
        walletRedeemAmount: walletRedeem || null,
        customerPhone: customerMobile || null,
        // Special instructions for kitchen
        specialInstructions: specialInstructions || null,
        notes: isRoomOrder ? `Room order for Room ${roomNumber}` : '',
        // Delivery info
        deliveryInfo: deliveryInfoData || null,
        // Multi-tier pricing rule
        pricingRuleId: activePricingRuleId || null,
        // Billing feature fields
        serviceChargeRate: serviceChargeRate || null,
        serviceChargeAmount: scAmount || null,
        tipAmount: tipAmt || null,
        tipPercentage: tipPct || null,
        cashReceived: cashReceived || null,
        changeReturned: changeReturned || null,
        splitPayments: splitPay || null,
        roundOffAmount: roundOff || null,
        partialPayAmount: partialPay || null,
        paidAmount: partialPay ? Math.round(Number(partialPay) * 100) / 100 : null,
        outstandingAmount: partialPay ? Math.round(((finalAmount || (subtotal || getTotalAmount()) + totalTax) - Number(partialPay)) * 100) / 100 : null,
        ...(isScheduledOrder && scheduledDate && scheduledTime ? {
          isScheduled: true,
          scheduledFor: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
        } : {}),
      };

        // If split payment, override payment method
        if (splitPay && splitPay.length > 1) {
          orderData.paymentMethod = 'split';
        }

        console.log('🛒 Creating order with data:', orderData);

        // OFFLINE PATH: Queue order + payment for later sync
        if (!isOnline || !navigator.onLine) {
          if (!offlineEnabled) {
            setNotification({ type: 'error', title: t('dashboard.noInternet'), message: t('dashboard.offlineMsg'), show: true });
            setTimeout(() => setNotification(null), 4000);
            setBillingLoading(false);
            return;
          }
          try {
            const paymentAmount = finalAmount || (subtotal || getTotalAmount()) + totalTax;
            const paymentData = {
              paymentMethod: paymentMethod,
              amount: paymentAmount,
              userId: currentUser.id,
              restaurantId: selectedRestaurant.id,
              paymentStatus: partialPay ? 'partial' : 'completed'
            };
            const offlineIdempotencyKey = generateIdempotencyKey();
            await queueOfflineOrder({
              ...orderData,
              _offlineAction: 'complete_billing_new',
              _paymentData: paymentData,
              idempotencyKey: offlineIdempotencyKey,
            });
            setNotification({ type: 'success', title: t('dashboard.billingSavedOffline'), message: t('dashboard.orderSavedLocallySync'), show: true });
            setTimeout(() => setNotification(null), 4000);
            // Show bill summary same as online path
            setOrderSuccess({
              orderId: offlineIdempotencyKey,
              dailyOrderId: null,
              show: true,
              message: t('dashboard.billingCompleteEmoji')
            });
            handleOrderActionComplete({ keepOrderSuccess: true, hasTable: !!(tableToUse || selectedTable?.number) });
          } catch (offErr) {
            setNotification({ type: 'error', title: t('dashboard.saveFailed'), message: t('dashboard.couldNotSaveBillingLocally'), show: true });
            setTimeout(() => setNotification(null), 4000);
          }
          setProcessing(false);
          return;
        }

      const orderResponse = await apiClient.createOrder(orderData);
      const orderId = orderResponse.order.id;
        console.log('✅ Order created successfully:', orderId);
        console.log('✅ Order response:', orderResponse);

      // NOTE: Backend automatically links room orders to hotel check-ins
      // No need to manually link here to avoid duplicates
      if (isRoomOrder && roomNumber) {
        console.log('🏨 Room order created for room:', roomNumber, '- Backend will handle check-in linking');
      }

      // Update table status if table is selected
      if (selectedTable && selectedTable.id) {
        await apiClient.updateTableStatus(selectedTable.id, 'occupied', orderId, selectedRestaurant?.id);
      }

      // Process payment based on method (use finalAmount which includes tax)
        const paymentAmount = finalAmount || (subtotal || getTotalAmount()) + totalTax;
        console.log('💳 Processing payment for order:', orderId, 'Method:', paymentMethod, 'Amount:', paymentAmount);
      if (paymentMethod === 'cash') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'cash',
            amount: paymentAmount,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay ? 'partial' : 'completed'
          });
          console.log('✅ Cash payment verified:', paymentResult);
      } else if (paymentMethod === 'upi') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'upi',
            amount: paymentAmount,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay ? 'partial' : 'completed'
          });
          console.log('✅ UPI payment verified:', paymentResult);
      } else if (paymentMethod === 'card') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'card',
            amount: paymentAmount,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay ? 'partial' : 'completed'
          });
          console.log('✅ Card payment verified:', paymentResult);
        }

        // Redeem wallet balance if used
        if (walletRedeem && walletRedeem > 0 && walletCustId) {
          try {
            await apiClient.redeemCustomerWallet(walletCustId, {
              amount: walletRedeem,
              orderId: orderId,
              notes: `Redeemed during billing for order #${orderResponse.order?.dailyOrderId || orderId.slice(-6)}`
            });
            console.log('💰 Wallet redeemed:', walletRedeem);
          } catch (walletErr) {
            console.error('Wallet redemption failed (non-blocking):', walletErr);
          }
        }

        // Note: Table status management is now handled by backend
        console.log(`🪑 Table ${tableNumber || 'N/A'} - status managed by backend`);

      // Show notification for billing completion
        console.log('🎉 Order processing completed successfully:', orderId);
      setNotification({
        type: 'success',
        title: t('dashboard.billingCompleteEmoji'),
        message: t('dashboard.orderCompletedPaymentMsg', { id: orderResponse.order?.dailyOrderId || orderId.slice(-6) }),
        show: true
      });

      // Show inline success/invoice
      const successData = {
        orderId,
        dailyOrderId: orderResponse.order?.dailyOrderId,
        show: true,
        message: t('dashboard.billingCompleteEmoji')
      };
      console.log('Setting order success:', successData);
      setOrderSuccess(successData);

      // Handle return navigation after billing complete
      // Uses returnToView to go back to tables if user came from there
      const hadTable = !!(tableToUse || selectedTable?.number);
      handleOrderActionComplete({
        keepOrderSuccess: true,
        hasTable: hadTable
      });

        // Return order ID for invoice generation
        return { orderId };
      }

      // Background refresh tables view data if order tied to a table
      if (tableToUse) {
        prefetchTables(selectedRestaurant.id);
      }

    } catch (error) {
      console.error('Order processing error:', error);

      // If this is a network error (offline), try to queue the billing offline
      const isNetworkError = !navigator.onLine || error.message?.includes('Load failed') || error.message?.includes('Failed to fetch') || error.message?.includes('Network');
      if (isNetworkError && offlineEnabled) {
        try {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const billingData = {
            items: cart.map(item => ({
              menuItemId: item.id, quantity: item.quantity, notes: item.notes || '',
              name: item.name, price: item.price, category: item.category || '',
              taxGroupId: item.taxGroupId || null,
            })),
            restaurantId: selectedRestaurant.id,
            orderType, paymentMethod, status: 'completed',
            paymentStatus: 'paid',
            totalAmount: taxData.subtotal || getTotalAmount(),
            taxBreakdown: taxData.taxBreakdown || [],
            taxAmount: taxData.totalTax || 0,
            finalAmount: taxData.finalAmount || (taxData.subtotal || getTotalAmount()) + (taxData.totalTax || 0),
            customerInfo: {
              name: customerName || 'Walk-in Customer',
              phone: customerMobile || null,
            },
          };
          const paymentData = {
            paymentMethod: paymentMethod,
            amount: billingData.finalAmount,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: 'completed',
          };
          if (currentOrder) {
            billingData._offlineAction = 'complete_billing_existing';
            billingData._existingOrderId = currentOrder.id;
          } else {
            billingData._offlineAction = 'complete_billing_new';
          }
          billingData._paymentData = paymentData;
          billingData.idempotencyKey = generateIdempotencyKey();
          await queueOfflineOrder(billingData);
          setNotification({ type: 'success', title: t('dashboard.billingSavedOffline'), message: t('dashboard.networkErrorBillingSaved'), show: true });
          setTimeout(() => setNotification(null), 4000);
          setOrderSuccess({
            orderId: currentOrder?.id || billingData.idempotencyKey,
            dailyOrderId: currentOrder?.dailyOrderId || null,
            show: true,
            message: t('dashboard.billingCompleteEmoji')
          });
          if (currentOrder) {
            setCurrentOrder(null);
            setActiveSavedOrderId(null);
          }
          handleOrderActionComplete({ keepOrderSuccess: true, hasTable: !!(tableNumber || selectedTable?.number) });
          return null;
        } catch (offlineErr) {
          console.error('Failed to queue billing offline:', offlineErr);
        }
      }

      // Extract error message from the API response
      let errorMessage = 'Failed to process order. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }

      // Show notification instead of full-page error
      setNotification({
        type: 'error',
        title: t('dashboard.billingFailed'),
        message: errorMessage,
        show: true
      });

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Fetch saved orders (saved status) for quick access chips
  // Fetch parked carts from saved_carts collection (not orders)
  const fetchSavedOrders = useCallback(async () => {
    if (!selectedRestaurant?.id) return;

    try {
      setLoadingSavedOrders(true);
      const response = await apiClient.getSavedCarts(selectedRestaurant.id, 'parked');
      console.log('📋 Fetched saved carts:', response);
      if (response.carts && Array.isArray(response.carts)) {
        setSavedOrders(response.carts.slice(0, 10));
      } else {
        setSavedOrders([]);
      }
    } catch (error) {
      console.error('Error fetching saved carts:', error);
      setSavedOrders([]);
    } finally {
      setLoadingSavedOrders(false);
    }
  }, [selectedRestaurant?.id]);

  // Fetch templates (reusable saved carts)
  const [templates, setTemplates] = useState([]);
  const fetchTemplates = useCallback(async () => {
    if (!selectedRestaurant?.id) return;
    try {
      const response = await apiClient.getSavedCarts(selectedRestaurant.id, 'template');
      if (response.carts && Array.isArray(response.carts)) {
        setTemplates(response.carts);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [selectedRestaurant?.id]);

  // Fetch saved carts and templates when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      fetchSavedOrders();
      fetchTemplates();
    }
  }, [selectedRestaurant?.id, fetchSavedOrders, fetchTemplates]);

  // Load a saved order into the cart and form fields
  const loadSavedOrder = (orderId) => {
    if (!orderId) return;

    try {
      setLoadingSavedOrderId(orderId);
      setIsLoadingOrder(true);

      // Find cart from savedOrders (parked carts) or templates
      const savedCart = savedOrders.find(o => o.id === orderId) || templates.find(o => o.id === orderId);

      if (!savedCart) {
        throw new Error('Saved cart not found');
      }

      const isTemplate = savedCart.type === 'template';

      // Clear current cart first
      setCart([]);

      // Map saved cart items to cart items
      const cartItems = savedCart.items?.map(item => {
        const itemId = item.menuItemId || item.id;
        const matchedMenu = menuItems.find(m => m.id === itemId);
        return {
          id: itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image || null,
          shortCode: item.shortCode || '',
          notes: item.notes || '',
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: item.selectedCustomizations || [],
          basePrice: item.basePrice || item.price,
          category: item.category || matchedMenu?.category || '',
          taxGroupId: item.taxGroupId || matchedMenu?.taxGroupId || null,
        };
      }) || [];

      setCart(cartItems);

      // Fill customer info (not for templates — templates are reusable)
      if (!isTemplate) {
        if (savedCart.tableNumber) {
          setTableNumber(savedCart.tableNumber);
          setManualTableNumber(savedCart.tableNumber);
          setLocationType('table');
        } else {
          setTableNumber('');
          setManualTableNumber('');
        }
        setCustomerName(savedCart.customerInfo?.name || '');
        setCustomerMobile(savedCart.customerInfo?.phone || '');
      }
      if (savedCart.orderType) {
        setOrderType(savedCart.orderType);
      }
      if (savedCart.paymentMethod) {
        setPaymentMethod(savedCart.paymentMethod);
      }

      // Do NOT set currentOrder — this is not a real order yet, just a cart
      // Track the saved cart ID so we can delete it after placement (parked only)
      setCurrentOrder(null);
      setActiveSavedOrderId(isTemplate ? null : orderId);

      setNotification({
        type: 'success',
        title: isTemplate ? 'Template Loaded!' : 'Cart Loaded! 📋',
        message: `"${savedCart.name}" loaded into cart`,
        show: true
      });
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error('Error loading saved order:', error);
      setNotification({
        type: 'error',
        title: t('dashboard.loadFailed'),
        message: error.message || 'Failed to load order',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoadingSavedOrderId(null);
      setIsLoadingOrder(false);
    }
  };

  // Delete a saved cart (parked or template)
  const deleteSavedOrder = async (cartId) => {
    if (!cartId) return;

    try {
      setDeletingSavedOrderId(cartId);

      await apiClient.deleteSavedCart(cartId);

      // Remove from local state (check both parked and templates)
      setSavedOrders(prev => prev.filter(o => o.id !== cartId));
      setTemplates(prev => prev.filter(o => o.id !== cartId));

      // Clear active cart if it was the deleted one
      if (activeSavedOrderId === cartId) {
        setActiveSavedOrderId(null);
        setCurrentOrder(null);
        setCart([]);
        setTableNumber('');
        setManualTableNumber('');
        setManualRoomNumber('');
        setCustomerName('');
        setCustomerMobile('');
      }

      setNotification({
        type: 'success',
        title: t('dashboard.deleted'),
        message: t('dashboard.savedCartRemoved'),
        show: true
      });
      setTimeout(() => setNotification(null), 2000);

    } catch (error) {
      console.error('Error deleting saved cart:', error);
      setNotification({
        type: 'error',
        title: t('dashboard.deleteFailed'),
        message: error.message || 'Failed to delete cart',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setDeletingSavedOrderId(null);
    }
  };

  // Save cart to saved_carts collection (no order created, no side effects)
  const saveOrder = async (taxData = {}) => {
    if (cart.length === 0) {
      setNotification({
        type: 'error',
        title: t('dashboard.emptyCartNotice'),
        message: t('dashboard.addItemsBeforeSaving'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!selectedRestaurant?.id) {
      setNotification({
        type: 'error',
        title: t('dashboard.noRestaurant'),
        message: t('dashboard.setupRestaurantFirst'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const { specialInstructions = null } = taxData;

    try {
      setSavingOrder(true);
      setError(null);

      const isRoomOrder = inRoomDiningEnabled && locationType === 'room' ? true : (selectedTable?.isRoom === true);
      const roomNumber = isRoomOrder
        ? (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (selectedTable?.name || tableNumber))
        : null;
      const finalTableNumber = !isRoomOrder ? (tableNumber || selectedTable?.number) : null;

      const tableName = finalTableNumber || roomNumber || '';
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const autoName = tableName ? `T${tableName} - ${timeStr}` : `Cart - ${timeStr}`;

      const cartData = {
        restaurantId: selectedRestaurant.id,
        name: autoName,
        type: 'parked',
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          notes: item.notes || '',
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
          basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price,
          category: item.category || '',
          taxGroupId: item.taxGroupId || null,
        })),
        customerInfo: {
          name: customerName || null,
          phone: customerMobile || null,
        },
        customerId: customerData?.id || null,
        orderType,
        tableNumber: finalTableNumber || null,
        paymentMethod,
        notes: specialInstructions || (isRoomOrder ? `Room order for Room ${roomNumber}` : '')
      };

      // OFFLINE PATH: Queue to IndexedDB
      if (!isOnline || !navigator.onLine) {
        if (!offlineEnabled) {
          setNotification({ type: 'error', title: t('dashboard.noInternet'), message: t('dashboard.offlineMsg'), show: true });
          setTimeout(() => setNotification(null), 4000);
          return;
        }
        try {
          await queueOfflineOrder({
            ...cartData,
            _offlineAction: 'create_saved_cart',
            idempotencyKey: generateIdempotencyKey(),
          });
          setNotification({ type: 'success', title: t('dashboard.orderSavedOffline'), message: `"${autoName}" saved locally. Will sync when online.`, show: true });
          setTimeout(() => setNotification(null), 4000);
          setCart([]);
          setTableNumber('');
          setManualTableNumber('');
          setManualRoomNumber('');
          setCustomerName('');
          setCustomerMobile('');
          setCurrentOrder(null);
          setActiveSavedOrderId(null);
          localStorage.removeItem('dine_cart');
        } catch (offErr) {
          setNotification({ type: 'error', title: t('dashboard.saveFailed'), message: t('dashboard.couldNotSaveBillingLocally'), show: true });
          setTimeout(() => setNotification(null), 4000);
        }
        setSavingOrder(false);
        return;
      }

      // ONLINE PATH
      const response = await apiClient.createSavedCart(cartData);
      console.log('📋 Save cart response:', response);

      if (response.cart) {
        setNotification({
          type: 'success',
          title: t('dashboard.orderSaved'),
          message: `"${response.cart.name}" saved successfully`,
          show: true
        });
        setTimeout(() => setNotification(null), 3000);

        setCart([]);
        setTableNumber('');
        setManualTableNumber('');
        setManualRoomNumber('');
        setCustomerName('');
        setCustomerMobile('');
        setCurrentOrder(null);
        setActiveSavedOrderId(null);
        localStorage.removeItem('dine_cart');

        fetchSavedOrders();
      }
    } catch (error) {
      console.error('Save cart error:', error);
      // Fallback: try to queue offline if API failed
      if (!offlineEnabled) {
        setNotification({ type: 'error', title: t('dashboard.saveFailedPlain'), message: error.message || t('dashboard.saveFailedConnectionMsg'), show: true });
        setTimeout(() => setNotification(null), 4000);
        return;
      }
      try {
        await queueOfflineOrder({
          ...cartData,
          _offlineAction: 'create_saved_cart',
          idempotencyKey: generateIdempotencyKey(),
        });
        setNotification({ type: 'success', title: t('dashboard.orderSavedOffline'), message: t('dashboard.connectionIssueSavedLocally'), show: true });
        setCart([]);
        setTableNumber('');
        setManualTableNumber('');
        setManualRoomNumber('');
        setCustomerName('');
        setCustomerMobile('');
        setCurrentOrder(null);
        setActiveSavedOrderId(null);
        localStorage.removeItem('dine_cart');
      } catch (qErr) {
        setNotification({
          type: 'error',
          title: t('dashboard.saveFailedEmoji'),
          message: error.message || t('dashboard.saveFailedRetryMsg'),
          show: true
        });
      }
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSavingOrder(false);
    }
  };

  // Save current cart as a reusable template
  const saveAsTemplate = async (templateName) => {
    if (cart.length === 0 || !selectedRestaurant?.id) return;

    try {
      const cartData = {
        restaurantId: selectedRestaurant.id,
        name: templateName || `Template - ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        type: 'template',
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          notes: item.notes || '',
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
          basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price
        })),
        orderType: orderType || 'dine-in',
      };

      const response = await apiClient.createSavedCart(cartData);
      if (response.cart) {
        setNotification({
          type: 'success',
          title: t('dashboard.templateSaved'),
          message: `"${response.cart.name}" saved as template`,
          show: true
        });
        setTimeout(() => setNotification(null), 3000);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Save template error:', error);
      setNotification({
        type: 'error',
        title: t('dashboard.templateSaveFailed'),
        message: error.message || 'Failed to save template.',
        show: true
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const updateOrderWithoutKOT = async (taxData = {}) => {
    if (!currentOrder || cart.length === 0) {
      setNotification({ type: 'error', title: t('dashboard.emptyCartNotice'), message: t('dashboard.addItemsBeforePlacing'), show: true });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!selectedRestaurant?.id) {
      setNotification({ type: 'error', title: t('dashboard.noRestaurant'), message: t('dashboard.setupRestaurantFirst'), show: true });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setPlacingOrder(true);
    try {
      const { taxBreakdown = [], totalTax = 0, finalAmount, subtotal, specialInstructions, deliveryInfo: deliveryInfoData, walletRedeemAmount: walletRedeem } = taxData;
      const tableToUse = tableNumber || selectedTable?.number || currentOrder.tableNumber;

      const updateData = {
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          notes: item.notes || '',
          category: item.category || '',
          categoryId: item.categoryId || null,
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: item.selectedCustomizations || null,
        })),
        tableNumber: tableToUse || currentOrder.tableNumber,
        orderType,
        paymentMethod,
        totalAmount: subtotal || getTotalAmount(),
        taxBreakdown: taxBreakdown,
        taxAmount: totalTax,
        finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
        specialInstructions: specialInstructions || null,
        deliveryInfo: deliveryInfoData || null,
        walletRedeemAmount: walletRedeem || null,
        skipKOT: true,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: { name: 'Staff Member', id: 'staff-001' }
      };

      const response = await apiClient.updateOrder(currentOrder.id, updateData);

      if (response.data) {
        setNotification({
          type: 'success',
          title: '✅ Order Updated',
          message: `Order #${currentOrder.dailyOrderId || currentOrder.id.slice(-6)} updated without KOT`,
          show: true
        });

        setCurrentOrder(null);
        setActiveSavedOrderId(null);
        fetchSavedOrders();
        handleOrderActionComplete({
          keepOrderSuccess: false,
          hasTable: !!(tableNumber || selectedTable?.number)
        });
      }
    } catch (error) {
      console.error('Update order without KOT error:', error);
      setNotification({ type: 'error', title: 'Update Failed', message: error.message || 'Failed to update order', show: true });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setPlacingOrder(false);
    }
  };

  const placeOrder = async (taxData = {}) => {
    if (cart.length === 0) {
      setNotification({
        type: 'error',
        title: t('dashboard.emptyCartNotice'),
        message: t('dashboard.addItemsBeforePlacing'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if restaurant is selected
    if (!selectedRestaurant?.id) {
      setNotification({
        type: 'error',
        title: t('dashboard.noRestaurant'),
        message: t('dashboard.setupRestaurantFirst'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if order is completed and disable action
    if (currentOrder && currentOrder.status === 'completed') {
      setNotification({
        type: 'error',
        title: t('dashboard.orderCompletedEmoji'),
        message: t('dashboard.orderCompleteNoticeMsg'),
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Extract tax information and special instructions from taxData passed by OrderSummary
    const { taxBreakdown = [], totalTax = 0, finalAmount = null, subtotal = null, specialInstructions = null, offerIds = [], manualDiscount = 0, offerDiscount: offerDiscountAmt = 0, selectedOfferName: offerName = '', totalDiscountAmount: discountTotal = 0,
      redeemLoyaltyPoints = 0, loyaltyDiscount: loyaltyDiscAmt = 0,
      serviceChargeRate = null, serviceChargeAmount: scAmount = null, tipAmount: tipAmt = null, tipPercentage: tipPct = null,
      cashReceived = null, changeReturned = null, splitPayments: splitPay = null, roundOffAmount: roundOff = null,
      partialPayAmount: partialPay = null, compItems: compData = null, voidItems: voidData = null, managerPin: mgrPin = null,
      deliveryInfo: deliveryInfoData = null,
      walletRedeemAmount: walletRedeem = null, walletCustomerId: walletCustId = null,
    } = taxData;

    try {
      setPlacingOrder(true);
      setError(null);

      // Check if table number changed in edit mode
      const tableToUse = tableNumber || selectedTable?.number;
      let tableChanged = false;
      
      if (currentOrder && tableToUse && tableToUse !== currentOrder.tableNumber) {
        tableChanged = true;
        console.log('⚠️ Table number changed from', currentOrder.tableNumber, 'to', tableToUse);
        
        // Show warning but continue with order placement
        setNotification({
          type: 'warning',
          title: t('dashboard.tableChangedEmoji'),
          message: t('dashboard.tableChangedPlaceMsg', { from: currentOrder.tableNumber || 'N/A', to: tableToUse }),
          show: true
        });
      }

      // Check if we're updating an existing order or creating a new one
      if (currentOrder) {
        // Update existing order
        const updateData = {
          items: cart.map(item => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            notes: item.notes || '',
            category: item.category || '',
            categoryId: item.categoryId || null,
            selectedVariant: item.selectedVariant || null,
            selectedCustomizations: item.selectedCustomizations || null,
          })),
          tableNumber: tableToUse || currentOrder.tableNumber,
          orderType,
          paymentMethod,
          // Tax information from OrderSummary
          totalAmount: subtotal || getTotalAmount(),
          taxBreakdown: taxBreakdown,
          taxAmount: totalTax,
          finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
          // Special instructions for kitchen
          specialInstructions: specialInstructions || null,
          // Delivery info
          deliveryInfo: deliveryInfoData || null,
          walletRedeemAmount: walletRedeem || null,
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: {
            name: 'Staff Member',
            id: 'staff-001'
          }
        };

        const response = await apiClient.updateOrder(currentOrder.id, updateData);

        if (response.data) {
          // Compute new/changed items for incremental KOT display
          const existingItemIds = new Set((currentOrder.items || []).map(i => i.menuItemId));
          const newItems = cart.filter(item => !existingItemIds.has(item.id));
          const updatedItems = cart.filter(item => {
            const existing = (currentOrder.items || []).find(i => i.menuItemId === item.id);
            return existing && existing.quantity !== item.quantity;
          });
          const incrementalItems = [...newItems, ...updatedItems];

          // If the order was in 'saved' status, update it to 'confirmed' to send to KOT
          // This happens when user loads a saved order and clicks "Update Order"
          if (currentOrder.status === 'saved') {
            console.log('📋 Saved order being placed - updating status to confirmed');
            await apiClient.updateOrderStatus(currentOrder.id, 'confirmed', selectedRestaurant?.id);
          }

          // Show notification for order update
          setNotification({
            type: 'success',
            title: t('dashboard.orderUpdatedEmoji'),
            message: t('dashboard.orderUpdatedKitchenMsg', { id: currentOrder.dailyOrderId || currentOrder.id.slice(-6) }),
            show: true
          });

          const tableToUseForKot = tableToUse || currentOrder.tableNumber;
          const roomForKot = inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (currentOrder.roomNumber || null);
          setOrderSuccess({
            orderId: currentOrder.id,
            dailyOrderId: currentOrder.dailyOrderId,
            show: true,
            message: incrementalItems.length > 0
              ? `KOT Update: ${incrementalItems.length} new/changed item(s)`
              : t('dashboard.orderUpdatedShort'),
            kotData: {
              orderId: currentOrder.id,
              dailyOrderId: currentOrder.dailyOrderId,
              items: (incrementalItems.length > 0 ? incrementalItems : cart).map(item => ({
                name: item.name, quantity: item.quantity || 1, notes: item.notes || '',
                isNew: newItems.includes(item),
                isUpdated: updatedItems.includes(item),
              })),
              isIncremental: incrementalItems.length > 0,
              tableNumber: roomForKot ? null : tableToUseForKot,
              roomNumber: roomForKot || null,
              customerName: customerName || null,
              orderType,
              restaurantName: selectedRestaurant?.name || 'Restaurant',
              specialInstructions: specialInstructions || null
            }
          });
          // Handle navigation after order update
          setCurrentOrder(null);
          setActiveSavedOrderId(null); // Clear active saved order since it was placed
          fetchSavedOrders(); // Refresh saved orders list
          handleOrderActionComplete({
            keepOrderSuccess: true,
            hasTable: !!(tableNumber || selectedTable?.number)
          });
        }
      } else {
        // Create new order
        // Determine if this is a room order
        const isRoomOrder = inRoomDiningEnabled && locationType === 'room' ? true : (selectedTable?.isRoom === true);
        const roomNumber = isRoomOrder
          ? (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (selectedTable?.name || tableNumber))
          : null;
        const finalTableNumber = !isRoomOrder ? (tableNumber || selectedTable?.number) : null;

        // Generate idempotency key for deduplication (critical for offline sync)
        const idempotencyKey = typeof generateIdempotencyKey === 'function' ? generateIdempotencyKey() : crypto.randomUUID();

        const orderData = {
          restaurantId: selectedRestaurant?.id,
          idempotencyKey,
          tableNumber: finalTableNumber || null,
          roomNumber: roomNumber || null,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            notes: item.notes || '',
            selectedVariant: item.selectedVariant || null,
            selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
            basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price
          })),
          customerInfo: {
            name: customerName || null,
            phone: customerMobile || null,
            tableNumber: finalTableNumber || null,
            roomNumber: roomNumber || null
          },
          customerId: customerData?.id || null,
          orderType,
          paymentMethod,
          staffInfo: (() => {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            return {
              userId: u.id || null,
              name: u.name || 'Staff',
              loginId: u.loginId || u.phone || u.id || null,
              phone: u.phone || null,
              role: u.role || 'waiter'
            };
          })(),
          // Tax information from OrderSummary
          totalAmount: subtotal || getTotalAmount(),
          taxBreakdown: taxBreakdown,
          taxAmount: totalTax,
          finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
          // Discount fields
          offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
          manualDiscount: manualDiscount || 0,
          redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
          walletRedeemAmount: walletRedeem || null,
          customerPhone: customerMobile || null,
          // Special instructions for kitchen
          specialInstructions: specialInstructions || null,
          notes: isRoomOrder ? `Room order for Room ${roomNumber}` : '',
          // Delivery info
          deliveryInfo: deliveryInfoData || null,
          status: 'confirmed', // Place order to kitchen
          // Multi-tier pricing rule
          pricingRuleId: activePricingRuleId || null,
          // Billing feature fields
          serviceChargeRate: serviceChargeRate || null,
          serviceChargeAmount: scAmount || null,
          tipAmount: tipAmt || null,
          tipPercentage: tipPct || null,
          cashReceived: cashReceived || null,
          changeReturned: changeReturned || null,
          splitPayments: splitPay || null,
          roundOffAmount: roundOff || null,
          partialPayAmount: partialPay || null,
          paidAmount: partialPay ? Math.round(Number(partialPay) * 100) / 100 : null,
          outstandingAmount: partialPay ? Math.round(((finalAmount || (subtotal || getTotalAmount()) + totalTax) - Number(partialPay)) * 100) / 100 : null,
          compItems: compData || null,
          voidItems: voidData || null,
          ...(isScheduledOrder && scheduledDate && scheduledTime ? {
            isScheduled: true,
            scheduledFor: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
          } : {}),
        };

        // If split payment, override payment method
        if (splitPay && splitPay.length > 1) {
          orderData.paymentMethod = 'split';
        }

        console.log('Creating order with data:', orderData);

        // OFFLINE PATH: If offline, queue immediately to IndexedDB
        if (!isOnline || !navigator.onLine) {
          if (!offlineEnabled) {
            setNotification({ type: 'error', title: t('dashboard.noInternet'), message: t('dashboard.offlineMsg'), show: true });
            setTimeout(() => setNotification(null), 4000);
            setPlacingOrder(false);
            return;
          }
          try {
            const cartKotItemsOffline = cart.map(item => ({ name: item.name, quantity: item.quantity || 1, notes: item.notes || '' }));
            await queueOfflineOrder(orderData);
            setNotification({
              type: 'success',
              title: t('dashboard.orderSavedOffline'),
              message: t('dashboard.orderSavedLocallyAutoSync'),
              show: true
            });
            // Show KOT summary same as online path
            setOrderSuccess({
              orderId: orderData.idempotencyKey || 'offline',
              dailyOrderId: null,
              show: true,
              message: t('dashboard.orderPlacedToKitchen'),
              kotData: {
                orderId: orderData.idempotencyKey || 'offline',
                dailyOrderId: null,
                items: cartKotItemsOffline,
                tableNumber: roomNumber ? null : (finalTableNumber || null),
                roomNumber: roomNumber || null,
                customerName: customerName || null,
                orderType,
                restaurantName: selectedRestaurant?.name || 'Restaurant',
                specialInstructions: specialInstructions || null
              }
            });
            setActiveSavedOrderId(null);
            handleOrderActionComplete({
              keepOrderSuccess: true,
              hasTable: !!(tableNumber || selectedTable?.number)
            });
            setTimeout(() => setNotification(null), 4000);
          } catch (offlineErr) {
            console.error('Failed to save offline order:', offlineErr);
            setNotification({
              type: 'error',
              title: t('dashboard.saveFailed'),
              message: t('dashboard.couldNotSaveOrderLocally'),
              show: true
            });
          }
          setPlacingOrder(false);
          return;
        }

        // ONLINE PATH: Optimistic UI - show success immediately, fire API in background
        const cartBackup = [...cart];
        const cartKotItems = cart.map(item => ({ name: item.name, quantity: item.quantity || 1, notes: item.notes || '' }));
        const savedTableNumber = roomNumber ? null : (finalTableNumber || null);
        const savedRoomNumber = roomNumber || null;
        const savedCustomerName = customerName || null;
        const savedRestaurantName = selectedRestaurant?.name || 'Restaurant';
        const savedSpecialInstructions = specialInstructions || null;
        const savedActiveSavedOrderId = activeSavedOrderId;

        // Show KOT summary immediately with processing indicator
        setOrderSuccess({
          orderId: null,
          dailyOrderId: null,
          show: true,
          processing: true,
          message: t('dashboard.orderPlacedToKitchen'),
          kotData: {
            orderId: null,
            dailyOrderId: null,
            items: cartKotItems,
            tableNumber: savedTableNumber,
            roomNumber: savedRoomNumber,
            customerName: savedCustomerName,
            orderType,
            restaurantName: savedRestaurantName,
            specialInstructions: savedSpecialInstructions
          }
        });

        // Clear cart and reset immediately for fast next-order flow
        setActiveSavedOrderId(null);
        handleOrderActionComplete({
          keepOrderSuccess: true,
          hasTable: !!(tableNumber || selectedTable?.number)
        });

        // Fire API call — don't block the UI
        try {
          const response = await apiClient.createOrder(orderData);
          console.log('Create order response:', response);

          if (response.order) {
            console.log(`✅ Order created with status=confirmed. Table ${tableNumber || 'N/A'} managed by backend.`);

            // Background refresh tables
            if (tableNumber || selectedTable?.number) {
              prefetchTables(selectedRestaurant?.id);
            }

            // Update notification with real order ID
            setNotification({
              type: 'success',
              title: t('dashboard.orderSentToChefEmoji'),
              message: t('dashboard.orderSentToChefSuccessMsg', { id: response.order.dailyOrderId || response.order.id.slice(-6) }),
              show: true
            });

            // Update KOT summary with real IDs and remove processing state
            setOrderSuccess({
              orderId: response.order.id,
              dailyOrderId: response.order.dailyOrderId,
              show: true,
              processing: false,
              message: t('dashboard.orderPlacedToKitchen'),
              kotData: {
                orderId: response.order.id,
                dailyOrderId: response.order.dailyOrderId,
                items: cartKotItems,
                tableNumber: savedTableNumber,
                roomNumber: savedRoomNumber,
                customerName: savedCustomerName,
                orderType,
                restaurantName: savedRestaurantName,
                specialInstructions: savedSpecialInstructions
              }
            });

            // Delete the parked cart if this order was loaded from one
            if (savedActiveSavedOrderId) {
              apiClient.deleteSavedCart(savedActiveSavedOrderId).catch(err => {
                console.error('Error deleting placed saved cart (non-blocking):', err);
              });
            }

            fetchSavedOrders();

            // Redeem wallet balance if used
            if (walletRedeem && walletRedeem > 0 && walletCustId) {
              try {
                await apiClient.redeemCustomerWallet(walletCustId, {
                  amount: walletRedeem,
                  orderId: response.order.id,
                  notes: `Redeemed during billing for order #${response.order.dailyOrderId || response.order.id.slice(-6)}`
                });
                console.log('💰 Wallet redeemed:', walletRedeem);
              } catch (walletErr) {
                console.error('Wallet redemption failed (non-blocking):', walletErr);
              }
            }

            setTimeout(() => setNotification(null), 4000);
          }
        } catch (apiError) {
          console.error('Order API call failed, queuing for offline sync:', apiError);

          // Queue for offline sync instead of failing
          try {
            if (typeof queueOfflineOrder === 'function' && offlineEnabled) {
              await queueOfflineOrder(orderData);
              // Update summary to show queued instead of processing
              setOrderSuccess(prev => prev ? { ...prev, processing: false, queued: true } : prev);
              setNotification({
                type: 'warning',
                title: t('dashboard.orderQueued'),
                message: t('dashboard.orderQueuedSyncMsg'),
                show: true
              });
            } else {
              // Fallback: restore cart for manual retry
              setOrderSuccess(null);
              setCart(cartBackup);
              localStorage.setItem('dine_cart', JSON.stringify(cartBackup));
              setNotification({
                type: 'error',
                title: t('dashboard.orderFailed'),
                message: apiError.message || t('dashboard.orderFailedRestored'),
                show: true
              });
            }
          } catch (queueError) {
            console.error('Failed to queue order:', queueError);
            setOrderSuccess(null);
            setCart(cartBackup);
            localStorage.setItem('dine_cart', JSON.stringify(cartBackup));
            setNotification({
              type: 'error',
              title: t('dashboard.orderFailed'),
              message: t('dashboard.orderFailedRestored'),
              show: true
            });
          }
          setTimeout(() => setNotification(null), 6000);
        }
      }
    } catch (error) {
      console.error('Place order error:', error);
      
      // Extract error message from the API response
      let errorMessage = 'Failed to place order. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Show notification instead of full-page error
      setNotification({
        type: 'error',
        title: t('dashboard.orderFailed'),
        message: errorMessage,
        show: true
      });
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setPlacingOrder(false);
    }
  };

  const placeOrderAndPrint = async (taxData = {}) => {
    // Set flag so OrderSummary auto-prints KOT after success
    window.__autoPrintKOT = true;
    await placeOrder(taxData);
  };

  const completeBillingAndPrint = async () => {
    // processOrder handles billing, then we trigger manual print
    // The actual print trigger will be handled after processOrder succeeds
    // by passing a flag through to OrderSummary
  };

  const clearCart = (opts = {}) => {
    const { keepOrderSuccess = false, preserveUrl = false } = opts;
    setCart([]);
    setTableNumber('');
    setCurrentOrder(null);
    setActiveSavedOrderId(null);
    setCustomerName('');
    setCustomerMobile('');
    setCustomerData(null);
    setManualTableNumber('');
    setManualRoomNumber('');
    setIsScheduledOrder(false);
    setScheduledDate('');
    setScheduledTime('');
    setOrderLookup('');
    localStorage.removeItem('dine_cart');
    if (!keepOrderSuccess) {
      setOrderSuccess(null);
      // Only redirect if not preserving URL (avoids losing view state)
      if (!preserveUrl && typeof window !== 'undefined') router.replace('/dashboard');
    }
    if (selectedTable && selectedTable.id) {
      // Release table
      apiClient.updateTableStatus(selectedTable.id, 'available', null, selectedRestaurant?.id);
      setSelectedTable(null);
    }
    // Reset return tracking
    setReturnToView(null);
  };

  // Helper function to switch view and optionally update URL
  const switchView = (newView, updateUrl = true) => {
    setViewMode(newView);
    // Clear any stale billing/KOT summary when switching views
    // This prevents showing old "Billing Complete" messages
    setOrderSuccess(null);

    // When switching to tables view, clear cart and edit state
    // so the user starts fresh when taking a new order from a table
    if (newView === 'tables') {
      setCart([]);
      setCurrentOrder(null);
      setActiveSavedOrderId(null);
      setTableNumber('');
      setCustomerName('');
      setCustomerMobile('');
      setCustomerData(null);
      setManualTableNumber('');
      setManualRoomNumber('');
      setOrderLookup('');
      setReturnToView(null);
      localStorage.removeItem('dine_cart');
      if (selectedTable && selectedTable.id) {
        apiClient.updateTableStatus(selectedTable.id, 'available', null, selectedRestaurant?.id);
        setSelectedTable(null);
      }
    }

    if (updateUrl && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      // For orders view (default), remove the view param for cleaner URLs
      // For tables view, set the view param
      if (newView === 'orders') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', newView);
      }
      // Remove order-related params when just toggling view
      url.searchParams.delete('orderId');
      url.searchParams.delete('mode');
      url.searchParams.delete('from');
      // Use pushState instead of replaceState to allow browser back button
      window.history.pushState({ view: newView }, '', url.toString());
    }
  };

  // Helper function to handle return navigation after order action
  const handleOrderActionComplete = (opts = {}) => {
    const { keepOrderSuccess = true, hasTable = false } = opts;

    // Determine where to return
    // Only switch to tables if explicitly set as returnToView
    // When returnToView is null (edit mode), stay on orders view
    if (returnToView === 'tables') {
      // User explicitly came from tables view - return to tables
      // Highlight the table that just had an order action
      if (selectedTable?.id) {
        setRecentlyUpdatedTableId(selectedTable.id);
      }
      switchView('tables', true);
      prefetchTables(selectedRestaurant?.id);
      clearCart({ keepOrderSuccess, preserveUrl: true });
    } else {
      // User came from order history, edit mode, or no specific source - stay on orders view
      clearCart({ keepOrderSuccess, preserveUrl: true });
      // Clean up URL params - remove view param and any stale table params for clean URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('orderId');
        url.searchParams.delete('mode');
        url.searchParams.delete('from');
        url.searchParams.delete('view');
        // Also clean table-related params in case they weren't removed earlier
        url.searchParams.delete('tableId');
        url.searchParams.delete('tableNo');
        url.searchParams.delete('table');
        url.searchParams.delete('floorId');
        url.searchParams.delete('floorName');
        url.searchParams.delete('floor');
        url.searchParams.delete('capacity');
        window.history.replaceState({}, '', url.toString());
      }
    }
    // Reset return tracking
    setReturnToView(null);
  };

  const navigateToPage = (page) => {
    router.push(page);
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleManualTableSelection = () => {
    if (manualTableNumber.trim()) {
      setSelectedTable({
        name: manualTableNumber.trim(),
        floor: 'Manual Entry',
        capacity: 'N/A'
      });
      setManualTableNumber('');
      setShowTableSelector(false);
    }
  };

  const handleManualRoomSelection = () => {
    if (manualRoomNumber.trim()) {
      setSelectedTable({
        name: manualRoomNumber.trim(),
        floor: 'Room',
        capacity: 'N/A',
        isRoom: true
      });
      setManualRoomNumber('');
      setShowTableSelector(false);
    }
  };

  const clearSelectedTable = () => {
    setSelectedTable(null);
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Fullscreen mode toggle function
  const toggleFullscreen = useCallback(() => {
    if (fullscreenStep === 0) {
      // Step 1: Hide navigation
      setIsNavigationHidden(true);
      setFullscreenStep(1);
      // Dispatch event to layout
      window.dispatchEvent(new CustomEvent('navigationToggle', { 
        detail: { hidden: true } 
      }));
    } else if (fullscreenStep === 1) {
      // Step 2: Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setFullscreenStep(2);
    } else if (fullscreenStep === 2) {
      // Step 3: Exit fullscreen and show navigation
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
      setIsNavigationHidden(false);
      setFullscreenStep(0);
      // Dispatch event to layout
      window.dispatchEvent(new CustomEvent('navigationToggle', { 
        detail: { hidden: false } 
      }));
    }
  }, [fullscreenStep]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      if (!isCurrentlyFullscreen && isFullscreen) {
        // User exited fullscreen manually, go back to normal state
        setIsFullscreen(false);
        setIsNavigationHidden(false);
        setFullscreenStep(0);
        // Dispatch event to layout
        window.dispatchEvent(new CustomEvent('navigationToggle', { 
          detail: { hidden: false } 
        }));
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Sync event notifications — only show final result (no "syncing..." intermediate)
  useEffect(() => {
    if (!lastSyncEvent) return;
    if (lastSyncEvent.type === 'sync_complete') {
      if (lastSyncEvent.syncedCount > 0) {
        setNotification({
          type: 'success',
          title: t('dashboard.ordersSynced'),
          message: `${lastSyncEvent.syncedCount} offline order${lastSyncEvent.syncedCount > 1 ? 's' : ''} synced successfully.${lastSyncEvent.failedCount > 0 ? ` ${lastSyncEvent.failedCount} failed.` : ''}`,
          show: true
        });
        setTimeout(() => setNotification(null), 5000);
      } else if (lastSyncEvent.failedCount > 0) {
        setNotification({
          type: 'error',
          title: t('dashboard.syncFailed'),
          message: `${lastSyncEvent.failedCount} order${lastSyncEvent.failedCount > 1 ? 's' : ''} failed to sync.`,
          show: true
        });
        setTimeout(() => setNotification(null), 6000);
      }
    } else if (lastSyncEvent.type === 'failed') {
      setNotification({
        type: 'error',
        title: t('dashboard.syncFailed'),
        message: t('dashboard.syncFailedRetries'),
        show: true
      });
      setTimeout(() => setNotification(null), 6000);
    }
  }, [lastSyncEvent]);

  // Network transition notifications — only show offline (online is indicated by green dot + sync result)
  useEffect(() => {
    if (!networkTransition) return;
    if (networkTransition === 'went_offline') {
      setNotification({
        type: 'error',
        title: t('dashboard.youreOffline'),
        message: t('dashboard.offlineNoticeMsg'),
        show: true
      });
      setTimeout(() => setNotification(null), 4000);
    }
    // No "Back Online" notification — the green dot returning + "Orders Synced" notification is enough
    clearTransition();
  }, [networkTransition, clearTransition]);

  // Show onboarding if needed — redirect to dedicated onboarding page
  if (showOnboarding) {
    if (typeof window !== 'undefined') {
      router.replace('/onboarding');
    }
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '16px' }}>Redirecting to setup...</p>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 'calc(100vh - 80px)' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <FaSpinner style={{ 
              fontSize: '48px', 
              color: '#ef4444', 
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <p style={{ fontSize: '18px', color: '#6b7280' }}>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, rgb(255 246 241) 0%, rgb(254 245 242) 50%, rgb(255 244 243) 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0
        }} />
        
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px', 
          padding: '40px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            animation: 'bounce 2s infinite'
          }}>
            <FaUtensils size={40} style={{ color: '#ef4444' }} />
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t('dashboard.somethingWentWrong')}
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#374151', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {error}
          </p>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            We&apos;re having trouble loading your restaurant data. Please try refreshing the page or contact support if the issue persists.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                setError('');
                loadInitialData();
              }}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
              }}
            >
              {t('dashboard.tryAgain')}
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch (e) {
                  console.warn('Clear storage failed:', e);
                }
                router.push('/login');
              }}
              style={{
                padding: '16px 32px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '2px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              {t('dashboard.backToLogin')}
            </button>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>
    );
  }

  // No restaurant selected — redirect to onboarding
  if (!selectedRestaurant && !showOnboarding) {
    if (typeof window !== 'undefined') {
      router.replace('/onboarding');
    }
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '16px' }}>Redirecting to setup...</p>
      </div>
    );
  }

  // Removed full screen success - using inline success instead

  return (
    <div
      className={`page-transition dashboard-full-height ${isLoading ? 'loading' : ''}`}
      style={{
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Restaurant Change Loading Overlay */}
      {restaurantChangeLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <FaSpinner style={{ 
              fontSize: '32px', 
              color: '#ef4444', 
              animation: 'spin 1s linear infinite',
              marginBottom: '12px'
            }} />
            <p style={{ fontSize: '16px', color: '#374151', fontWeight: '600', margin: 0 }}>
              {t('dashboard.switchingRestaurant')}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {t('dashboard.loadingMenuAndData')}
            </p>
          </div>
        </div>
      )}

      {/* Network Status Indicator — minimal dot with pulse wave + sync animation */}
      <style>{`
        @keyframes livePulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes livePulseRing2 {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes syncSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes offlinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        onClick={pendingCount > 0 && isOnline ? manualSync : undefined}
        style={{
          position: 'fixed',
          top: '12px',
          right: '14px',
          zIndex: 1001,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: pendingCount > 0 && isOnline ? 'pointer' : 'default',
        }}
        title={isSyncing ? 'Syncing orders...' : pendingCount > 0 ? `${pendingCount} pending orders. Click to sync.` : isOnline ? 'Connected' : 'Offline — orders will save locally'}
      >
        {/* SYNCING STATE: spinning ring around dot */}
        {isSyncing && (
          <>
            <div style={{
              position: 'absolute',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#3b82f6',
              borderRightColor: '#3b82f6',
              animation: 'syncSpin 0.8s linear infinite',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
              position: 'relative',
              zIndex: 1,
            }} />
          </>
        )}
        {/* ONLINE STATE: green dot with pulse waves */}
        {!isSyncing && isOnline && pendingCount === 0 && (
          <>
            <div style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              animation: 'livePulseRing 2.5s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              animation: 'livePulseRing2 2.5s ease-out infinite 0.5s',
            }} />
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              boxShadow: '0 0 6px rgba(22,163,106,0.5)',
              position: 'relative',
              zIndex: 1,
            }} />
          </>
        )}
        {/* ONLINE WITH PENDING: amber dot (waiting to sync) */}
        {!isSyncing && isOnline && pendingCount > 0 && (
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            boxShadow: '0 0 8px rgba(245,158,11,0.5)',
            position: 'relative',
            zIndex: 1,
          }} />
        )}
        {/* OFFLINE STATE: red pulsing dot */}
        {!isSyncing && !isOnline && (
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            animation: 'offlinePulse 2s ease-in-out infinite',
            position: 'relative',
            zIndex: 1,
          }} />
        )}
        {/* Pending count badge */}
        {pendingCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-6px',
            backgroundColor: isSyncing ? '#3b82f6' : '#f59e0b',
            color: '#fff',
            borderRadius: '10px',
            padding: '0px 4px',
            fontSize: '8px',
            fontWeight: '700',
            zIndex: 2,
            minWidth: '12px',
            textAlign: 'center',
            lineHeight: '14px',
          }}>
            {pendingCount}
          </span>
        )}
      </div>

      {/* Floating Command Bar - Search & Voice */}
      {!isMobile && viewMode === 'orders' && !posSettings.hideSearchBar && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isListeningVoice ? '540px' : '480px',
            zIndex: 1000,
            transition: 'width 0.3s ease'
          }}
        >
          {/* Compiled Text - Shows recognized items when listening */}
          {isListeningVoice && voiceCompiledText && (
            <div style={{
              marginBottom: '8px',
              padding: '10px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
              `}</style>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginBottom: '4px' }}>
                Recognized Items:
              </div>
              <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                {voiceCompiledText}
              </div>
            </div>
          )}

          {/* Main Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '50px',
            boxShadow: isListeningVoice
              ? '0 8px 32px rgba(239, 68, 68, 0.2), 0 0 0 2px #ef4444'
              : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            transition: 'box-shadow 0.3s ease'
          }}>
            {/* Icon - Changes based on mode */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: isListeningVoice
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
              animation: isListeningVoice ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }}>
              {isListeningVoice ? (
                <FaMicrophone size={15} color="white" />
              ) : (
                <FaSearch size={15} color="white" />
              )}
            </div>

            {/* Input / Transcript */}
            {isListeningVoice ? (
              <div style={{
                flex: 1,
                fontSize: '15px',
                fontWeight: '500',
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {voiceTranscript || (
                  <span style={{ color: '#9ca3af' }}>{t('dashboard.listeningSpeak')}</span>
                )}
              </div>
            ) : (
              <input
                ref={commandBarInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchTerm('');
                    commandBarInputRef.current?.blur();
                  }
                }}
                placeholder={t('dashboard.searchMenuItems')}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#1f2937',
                  padding: 0,
                  width: '100%',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              />
            )}

            {/* Items Counter - When listening */}
            {isListeningVoice && voiceItemsAdded > 0 && (
              <div style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                flexShrink: 0
              }}>
                +{voiceItemsAdded} {t('dashboard.added')}
              </div>
            )}

            {/* Keyboard Shortcut Hint - Search mode only */}
            {!isListeningVoice && !searchTerm && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#9ca3af',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '10px' }}>⌘</span> K
              </div>
            )}

            {/* Clear Button - Search mode only */}
            {!isListeningVoice && searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <FaTimes size={10} color="#6b7280" />
              </button>
            )}

            {/* Divider */}
            <div style={{
              width: '1px',
              height: '28px',
              backgroundColor: '#e5e7eb',
              flexShrink: 0
            }} />

            {/* Voice/Stop Button */}
            <button
              onClick={() => isListeningVoice ? stopVoiceListening(false) : startVoiceListening()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: isListeningVoice
                  ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isListeningVoice
                  ? '0 4px 12px rgba(31, 41, 55, 0.3)'
                  : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={isListeningVoice ? t('dashboard.stopEsc') : t('dashboard.voiceOrderF2')}
            >
              {isListeningVoice ? (
                <FaStop size={16} color="white" />
              ) : (
                <FaMicrophone size={18} color="white" />
              )}
            </button>
          </div>

          {/* Hint text when listening */}
          {isListeningVoice && (
            <div style={{
              marginTop: '8px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#6b7280'
            }}>
              Say items like &quot;2 paneer tikka, 1 dosa&quot; • Say &quot;that&apos;s all&quot; to finish
            </div>
          )}
        </div>
      )}

      {/* Header */}
      
      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Restaurant Name */}
          <div style={{
            flex: 1,
            minWidth: 0
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedRestaurant?.name || t('dashboard.myRestaurant')}
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '2px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {filteredItems.length} {t('dashboard.items')} • {selectedCategory === 'all-items' ? t('dashboard.allCategories') : categories.find(c => c.id === selectedCategory)?.name}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {/* Categories Button */}
          <button
            onClick={() => setShowMobileSidebar(true)}
            style={{
                padding: '10px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
                borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
                gap: '6px',
              fontWeight: '600',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                minWidth: '80px',
                justifyContent: 'center'
              }}
            >
              <FaBars size={14} />
              {t('dashboard.menu')}
          </button>
          
          {/* Cart Button */}
          <button
            onClick={() => setShowMobileCart(true)}
            style={{
                padding: '10px',
              backgroundColor: cart.length > 0 ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
                borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
                gap: '6px',
              fontWeight: '600',
                fontSize: '12px',
              position: 'relative',
                boxShadow: cart.length > 0 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(107, 114, 128, 0.3)',
                minWidth: '80px',
                justifyContent: 'center'
            }}
          >
              <FaShoppingCart size={14} />
              {t('dashboard.cart')}
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                  fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? '100%' : '100%',
        minHeight: 0, // Important for flex children to shrink properly
        position: 'relative' // Required for absolute-positioned top header bar
      }}>
        {/* Top Header Bar - All-in-one header with Logo + Controls + Navigation */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            gap: '12px'
          }}>
            {/* Hamburger Menu Button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openNavSidebar'));
              }}
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <FaBars size={14} color="#374151" />
            </button>

            {/* Logo - Links to dashboard */}
            <Link href="/dashboard" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
                }}>
                  <FaUtensils color="white" size={14} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>DineOpen</span>
              </div>
            </Link>

            {/* Search Box */}
            <div style={{
              width: '280px',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <FaSearch style={{ marginLeft: '12px', color: '#9ca3af', flexShrink: 0 }} size={14} />
                <input
                  type="text"
                  placeholder={t('dashboard.searchMenuShort')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    height: '100%',
                    paddingLeft: '10px',
                    paddingRight: searchTerm ? '4px' : '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: '500',
                    outline: 'none',
                    color: '#374151'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginRight: '6px'
                    }}
                  >
                    <FaTimes size={9} color="#6b7280" />
                  </button>
                )}
              </div>
            </div>

            {/* NEW ORDER Button */}
            <button
              onClick={() => {
                handleFreshOrder();
                if (viewMode === 'tables') {
                  switchView('orders');
                }
              }}
              style={{
                height: '36px',
                padding: '0 14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)'
              }}
            >
              <FaPlus size={10} />
              {t('dashboard.newOrder')}
            </button>

            {/* Order ID Input */}
            <input
              type="text"
              placeholder={t('dashboard.orderId')}
              value={orderLookup}
              onChange={(e) => setOrderLookup(e.target.value)}
              onKeyPress={handleOrderLookup}
              className="header-order-id-input"
              style={{
                width: '100px',
                height: '36px',
                padding: '0 12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'rgb(254, 243, 199)',
                fontSize: '12px',
                fontWeight: '500',
                outline: 'none',
                textAlign: 'center',
                color: '#4b5563',
                flexShrink: 0
              }}
            />

            {/* SHORT CODE Input */}
            <input
              type="text"
              placeholder={t('dashboard.shortCode')}
              value={shortCodeSearch}
              onChange={(e) => setShortCodeSearch(e.target.value)}
              onKeyPress={handleShortCodeSearch}
              className="header-short-code-input"
              style={{
                width: '110px',
                height: '36px',
                padding: '0 12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'rgb(209, 250, 229)',
                fontSize: '12px',
                fontWeight: '500',
                outline: 'none',
                textAlign: 'center',
                color: '#4b5563',
                textTransform: 'uppercase',
                flexShrink: 0
              }}
            />
            <style>{`
              .header-order-id-input::placeholder { color: #92400e; font-weight: 600; }
              .header-short-code-input::placeholder { color: #065f46; font-weight: 600; }
            `}</style>

            {/* Voice Button */}
            <button
              onClick={() => isListeningVoice ? stopVoiceListening(false) : startVoiceListening()}
              disabled={isProcessingVoice}
              title={t('dashboard.voiceAssistant')}
              style={{
                width: '36px',
                height: '36px',
                background: isListeningVoice
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : isProcessingVoice
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isProcessingVoice ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isProcessingVoice ? (
                <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : isListeningVoice ? (
                <FaMicrophoneSlash size={14} />
              ) : (
                <FaMicrophone size={14} />
              )}
            </button>

            {/* TABLES Button */}
            <button
              onClick={() => setViewMode(viewMode === 'orders' ? 'tables' : 'orders')}
              style={{
                height: '36px',
                padding: '0 14px',
                background: viewMode === 'tables' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
                color: viewMode === 'tables' ? 'white' : '#ef4444',
                border: viewMode === 'tables' ? 'none' : '2px solid #ef4444',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaChair size={12} />
              {viewMode === 'orders' ? t('dashboard.tables') : t('dashboard.orders')}
            </button>

            {/* Reset Tables (only in tables view, owner/admin only) */}
            {viewMode === 'tables' && ['owner', 'admin'].includes(JSON.parse(localStorage.getItem('user') || '{}').role) && (
              <button
                onClick={() => {
                  const allTables = tablesData.tables?.length > 0 ? tablesData.tables : tablesData.floors?.flatMap(f => f.tables || []) || [];
                  const occupiedCount = allTables.filter(t => t.status === 'occupied').length;
                  if (occupiedCount === 0) {
                    setNotification({ type: 'info', title: t('dashboard.noTablesToReset'), message: t('dashboard.allTablesAvailable'), show: true });
                    setTimeout(() => setNotification(null), 3000);
                    return;
                  }
                  setShowResetConfirm(true);
                }}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1.5px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaTools size={10} />
                {t('dashboard.reset')}
              </button>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right Section - Navigation Icons (Bigger, Right Aligned) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Order History */}
              <Link href="/orderhistory" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaClipboardList size={22} color="#f59e0b" />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>{t('dashboard.orders')}</span>
                </div>
              </Link>

              {/* Tables */}
              <Link href="/tables" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaChair size={22} color="#3b82f6" />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>{t('dashboard.tables')}</span>
                </div>
              </Link>

              {/* Menu */}
              <Link href="/menu" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaUtensils size={22} color="#10b981" />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>{t('dashboard.menu')}</span>
                </div>
              </Link>

              {/* KOT */}
              <Link href="/kot" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaFire size={22} color="#f97316" />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>{t('dashboard.kitchen')}</span>
                </div>
              </Link>

              {/* Customers */}
              <Link href="/customers" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaUsers size={22} color="#3b82f6" />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>{t('dashboard.customers')}</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Category Sidebar - Part of Menu Section */}
        {!isMobile && viewMode === 'orders' && categoryViewMode === 'sidebar' && (
          <div style={{
            width: '130px',
            height: '100%',
            paddingTop: '66px', // Header (56px) + gap (10px)
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {/* Categories List - Modern Tab Style */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0 8px 8px',
              minHeight: 0
            }} className="hide-scrollbar">
              {categories.map((category, index) => {
                const categoryItems = category.id === 'all-items'
                  ? (menuItems || [])
                  : category.id === 'favorites'
                  ? (menuItems || []).filter(item => item.isFavorite === true)
                  : (menuItems || []).filter(item => item.category?.toLowerCase() === category.id);
                const isSelected = selectedCategory === category.id;

                return (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(isSelected && category.id !== 'all-items' ? 'all-items' : category.id)}
                    style={{
                      padding: '10px 12px',
                      marginBottom: '2px',
                      backgroundColor: isSelected ? 'white' : 'transparent',
                      borderRadius: isSelected ? '10px 0 0 10px' : '10px 0 0 10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      borderLeft: isSelected ? '3px solid #ef4444' : '3px solid transparent',
                      boxShadow: isSelected ? '2px 0 8px rgba(0,0,0,0.04)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)';
                        e.currentTarget.style.borderLeftColor = '#fca5a5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? '#1f2937' : '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s ease'
                    }}>
                      {category.name}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Menu Items */}
        <div style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          minHeight: 0, // Important for flex children to shrink
          paddingBottom: isMobile ? '90px' : '0', // Add bottom padding for mobile command bar
          paddingTop: !isMobile ? '66px' : '0', // Header (56px) + gap (10px)
          // Expand to full width when in tables view
          width: viewMode === 'tables' ? '100%' : undefined
        }}>
          {/* Register Not Open Banner */}
          {posSettings.requireRegisterOpen && registerOpen === false && (
            <div style={{
              padding: '10px 16px', margin: '8px 12px 0', borderRadius: '10px',
              background: '#fef3c7', border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '16px' }}>&#9888;</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '13px', color: '#92400e' }}>Register Not Open</strong>
                <p style={{ fontSize: '12px', color: '#92400e', margin: '2px 0 0' }}>Open the cash register before billing</p>
              </div>
              <Link href="/register" style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                fontWeight: 600, background: '#f59e0b', color: 'white', textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}>Open Register</Link>
            </div>
          )}

          {/* Horizontal Category Chips - Desktop Only when chips mode */}
          {!isMobile && viewMode === 'orders' && categoryViewMode === 'chips' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              paddingRight: '460px',
              backgroundColor: 'white',
              borderBottom: '1px solid #f1f5f9'
            }}>
              {/* Category Chips */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                {categories.map((category) => {
                  const categoryItems = category.id === 'all-items'
                    ? (menuItems || [])
                    : category.id === 'favorites'
                    ? (menuItems || []).filter(item => item.isFavorite === true)
                    : (menuItems || []).filter(item => item.category?.toLowerCase() === category.id);
                  const isSelected = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(isSelected ? 'all-items' : category.id)}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: isSelected ? '#ef4444' : 'white',
                        color: isSelected ? 'white' : '#4b5563',
                        border: isSelected ? 'none' : '1px solid #e5e7eb',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(239, 68, 68, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* Menu content — default menu auto-loads when real menu is empty */}
          {(menuItems || []).length > 0 || loading ? (
          <>
            {/* Demo Mode — no separate banner here, layout handles the global yellow banner */}

            {/* Compact Header - Mobile Only (Desktop uses top header bar) */}
          <div style={{
            padding: '8px',
            backgroundColor: 'white',
            borderBottom: '1px solid #f1f5f9',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: isMobile ? 'block' : 'none', // Hide on desktop
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Responsive Layout */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center', 
              justifyContent: 'space-between', 
              gap: isMobile ? '8px' : '10px',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              {/* First Row on Mobile - Search & Voice */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                flex: isMobile ? '0 0 auto' : '1',
              justifyContent: 'flex-end',
                width: isMobile ? '100%' : 'auto'
              }}>
                {/* Main Menu Search - Mobile Optimized */}
                {viewMode === 'orders' && (
                <div style={{ position: 'relative', flex: isMobile ? '1' : '0 0 250px', maxWidth: isMobile ? 'none' : '250px' }}>
                  <style>{`
.dashboard-search-input::placeholder { font-size: 14px; color: #6b7280; font-weight: 500; }
.dashboard-order-id-input::placeholder,
.dashboard-short-code-input::placeholder { font-size: 12px; color: #6b7280; font-weight: 600; }
`}</style>
                  <FaSearch style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6b7280' 
                  }} size={isMobile ? 14 : 12} />
                <input
                  className="dashboard-search-input"
                  type="text"
                    placeholder={isMobile ? t('dashboard.searchPlaceholder') : t('dashboard.searchMenu')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                      height: isMobile ? '38px' : '36px',
                      paddingLeft: isMobile ? '38px' : '36px',
                    paddingRight: searchTerm ? '36px' : '12px',
                      border: 'none',
                      borderBottom: '2px solid #e5e7eb',
                      borderRadius: '0px',
                      backgroundColor: '#f8fafc',
                      fontSize: isMobile ? '15px' : '14px',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    color: '#374151'
                  }}
                  onFocus={(e) => {
                      e.target.style.borderBottomColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f8fafc';
                  }}
                  onBlur={(e) => {
                      e.target.style.borderBottomColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTimes size={9} color="#6b7280" />
                  </button>
                )}
            </div>
                )}
            
                {/* Voice Listening Widget - Mobile Optimized */}
                {false && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: isMobile ? '6px' : '8px',
                  backgroundColor: isListeningVoice ? 'rgba(239, 68, 68, 0.1)' : isProcessingVoice ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  borderRadius: '20px',
                  minWidth: isListeningVoice || isProcessingVoice ? (isMobile ? '130px' : '200px') : (isMobile ? '42px' : '60px'),
                  transition: 'all 0.3s ease',
                  animation: isListeningVoice ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  flexShrink: 0
                }}>
                  {isProcessingVoice ? (
                    <>
                      <FaMicrophone size={isMobile ? 12 : 14} color="#3b82f6" style={{ animation: 'pulse 1s ease-in-out infinite' }} />
                      <span style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        fontWeight: '600', 
                        color: '#3b82f6' 
                      }}>
                        {t('dashboard.processing')}
                      </span>
                    </>
                  ) : isListeningVoice ? (
                    <>
                      <FaMicrophoneSlash 
                        size={isMobile ? 12 : 16} 
                        color="#ef4444" 
                        style={{ animation: 'pulse 1s ease-in-out infinite' }}
                      />
                      <span style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        fontWeight: '600', 
                        color: '#ef4444' 
                      }}>
                        {isMobile ? t('dashboard.listeningShort') : t('dashboard.listening')}
                      </span>
                      <button
                        onClick={() => stopVoiceListening(false)}
                        style={{
                          marginLeft: isMobile ? '4px' : '8px',
                          padding: isMobile ? '3px 6px' : '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: isMobile ? '9px' : '10px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {t('dashboard.stop')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startVoiceListening}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: isMobile ? '28px' : '32px',
                        height: isMobile ? '28px' : '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      title={t('dashboard.startVoiceOrder')}
                    >
                      <FaMicrophone size={isMobile ? 12 : 14} />
                    </button>
                  )}
                </div>
                )}
              </div>
            
              {/* Right Side Controls - Mobile Optimized */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: isMobile ? '6px' : '10px',
                flexWrap: 'nowrap',
                justifyContent: isMobile ? 'space-between' : 'space-between', // Changed to space-between
                width: '100%'
              }}>
                {/* Order ID Search - Mobile Optimized */}
                {viewMode === 'orders' && (
                <div style={{ position: 'relative', flex: isMobile ? '1' : '0 0 110px', minWidth: isMobile ? '0' : '110px' }}>
                  <input
                    className="dashboard-order-id-input"
                    type="text"
                    placeholder={isMobile ? t('dashboard.orderId') : t('dashboard.orderId')}
                    value={orderLookup}
                    onChange={(e) => setOrderLookup(e.target.value)}
                    onKeyPress={handleOrderLookup}
                    style={{
                      width: '100%',
                      height: '36px',
                      paddingLeft: isMobile ? '8px' : '8px',
                      paddingRight: isMobile ? '8px' : '8px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      fontSize: isMobile ? '13px' : '12px',
                      fontWeight: '600',
                      outline: 'none',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      color: '#374151'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#fef3c7';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#fef3c7';
                    }}
                  />
                </div>
                )}

                {/* Short Code Search - Mobile Optimized */}
                {viewMode === 'orders' && (
                <div style={{ position: 'relative', flex: isMobile ? '1' : '0 0 105px', minWidth: isMobile ? '0' : '105px' }}>
                  <input
                    className="dashboard-short-code-input"
                    type="text"
                    placeholder={isMobile ? t('dashboard.shortCode') : t('dashboard.shortCode')}
                    value={shortCodeSearch}
                    onChange={(e) => setShortCodeSearch(e.target.value)}
                    onKeyPress={handleShortCodeSearch}
                    style={{
                      width: '100%',
                      height: '36px',
                      paddingLeft: isMobile ? '8px' : '8px',
                      paddingRight: isMobile ? '8px' : '8px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#d1fae5',
                      fontSize: isMobile ? '13px' : '12px',
                      fontWeight: '600',
                      outline: 'none',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0px'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#d1fae5';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#d1fae5';
                    }}
                  />
                </div>
                )}

                {/* Fresh Order Button - Mobile Optimized */}
                <button
                  onClick={handleFreshOrder}
                  style={{
                    height: '36px',
                    paddingLeft: isMobile ? '12px' : '16px',
                    paddingRight: isMobile ? '12px' : '16px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    flex: isMobile ? '1.2' : '0 0 auto',
                    alignSelf: 'flex-start',
                    gap: '6px'
                  }}
                >
                  <FaPlus size={isMobile ? 10 : 12} />
                  {t('dashboard.newOrder')}
                </button>

                {/* Right Side Group: Voice + Tables Button - Fixed Position */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '10px',
                  flexShrink: 0,
                  marginLeft: 'auto' // Push to the right, stay fixed
                }}>
                  {/* Simple Voice Button */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                      onClick={() => isListeningVoice ? stopVoiceListening(false) : startVoiceListening()}
                      title={isListeningVoice ? t('dashboard.stopVoiceOrder') : isProcessingVoice ? t('dashboard.processing') : t('dashboard.startVoiceOrder')}
                      disabled={isProcessingVoice}
                    style={{
                        background: isListeningVoice 
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : isProcessingVoice
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: isMobile ? '28px' : '32px',
                      height: isMobile ? '28px' : '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        cursor: isProcessingVoice ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                        boxShadow: isListeningVoice 
                          ? '0 2px 8px rgba(239, 68, 68, 0.3)'
                          : isProcessingVoice
                          ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                          : '0 2px 8px rgba(16, 185, 129, 0.3)',
                        flexShrink: 0,
                        opacity: isProcessingVoice ? 0.7 : 1
                    }}
                  >
                      {isProcessingVoice ? (
                        <FaSpinner size={isMobile ? 12 : 14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : isListeningVoice ? (
                        <FaMicrophoneSlash size={isMobile ? 12 : 14} />
                      ) : (
                    <FaMicrophone size={isMobile ? 12 : 14} />
                      )}
                  </button>
                    {/* Processing indicator tooltip */}
                    {isProcessingVoice && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        padding: '4px 8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        {t('dashboard.processing')}
                      </div>
                    )}
                  </div>

                  {/* Tables Toggle Button - Fixed width and position */}
                  <button
                    onClick={() => switchView(viewMode === 'orders' ? 'tables' : 'orders')}
                    style={{
                      height: '36px',
                      width: isMobile ? '96px' : '112px', // Fixed width instead of minWidth
                      paddingLeft: isMobile ? '12px' : '18px',
                      paddingRight: isMobile ? '12px' : '18px',
                      background: 'transparent',
                      color: '#ef4444',
                      border: '1.5px solid #ef4444',
                      borderRadius: '8px',
                      fontSize: isMobile ? '10px' : '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0, // Prevent shrinking
                      whiteSpace: 'nowrap' // Prevent text wrapping
                    }}
                    title={viewMode === 'orders' ? t('dashboard.switchToTables') : t('dashboard.backToOrders')}
                  >
                    <span style={{ 
                      display: 'inline-block',
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      {viewMode === 'orders' ? t('dashboard.tables') : t('dashboard.orders')}
                    </span>
                    {tablesRefreshing && (
                      <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
                        <svg width="14" height="14" viewBox="0 0 50 50">
                          <circle cx="25" cy="25" r="20" stroke="#ef4444" strokeWidth="6" fill="none" opacity="0.2" />
                          <path d="M25 5 a20 20 0 0 1 0 40 a20 20 0 0 1 0-40" stroke="#ef4444" strokeWidth="6" fill="none">
                            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
                          </path>
                        </svg>
                      </div>
                    )}
                </button>
                </div>

                {/* Compact Toggle - Only show on desktop */}
                {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '500' }}>
                    {useModernCards ? 'M' : 'C'}
                  </span>
                <button
                    onClick={() => setUseModernCards(!useModernCards)}
                  style={{
                      width: '20px',
                      height: '12px',
                      borderRadius: '6px',
                    border: 'none',
                      backgroundColor: useModernCards ? '#ef4444' : '#d1d5db',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                      justifyContent: useModernCards ? 'flex-end' : 'flex-start',
                      padding: '1px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease'
                    }} />
                </button>
              </div>
                )}
                    </div>
            </div>

            {/* Category Chips - Below Search (Mobile Only - Desktop uses left sidebar) */}
            {viewMode === 'orders' && isMobile && (
              <div
                className="hide-scrollbar"
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}>
                {categories.map((category, index) => {
                  const isSelected = selectedCategory === category.id;
                  const categoryItems = category.id === 'all-items'
                    ? (menuItems || [])
                    : category.id === 'favorites'
                    ? (menuItems || []).filter(item => item.isFavorite === true)
                    : (menuItems || []).filter(item => item.category?.toLowerCase() === category.id);

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(isSelected && category.id !== 'all-items' ? 'all-items' : category.id);
                        if (isMobile) setShowMobileSidebar(false);
                      }}
                      style={{
                        padding: isMobile ? '6px 12px' : '6px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '2px solid #ef4444' : '1.5px solid #e5e7eb',
                        backgroundColor: isSelected
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : '#ffffff',
                        background: isSelected
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : '#ffffff',
                        color: isSelected ? 'white' : '#374151',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: isSelected ? '700' : '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '4px' : '6px',
                        boxShadow: isSelected
                          ? '0 3px 10px rgba(239, 68, 68, 0.35)'
                          : '0 1px 3px rgba(0, 0, 0, 0.08)',
                        letterSpacing: '-0.01em',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.transform = 'scale(1.03)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.12)';
                        } else {
                          e.currentTarget.style.transform = 'scale(1.08)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.45)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
                        } else {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 3px 10px rgba(239, 68, 68, 0.35)';
                        }
                      }}
                    >
                      {/* Shimmer effect for selected */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          animation: 'shimmer 2s infinite'
                        }} />
                      )}
                      <span style={{
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {category.name}
                      </span>
                      {categoryItems.length > 0 && (
                        <span style={{
                          fontSize: '10px',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                          color: isSelected ? 'white' : '#6b7280',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          minWidth: '18px',
                          textAlign: 'center',
                          position: 'relative',
                          zIndex: 1,
                          border: isSelected ? '1px solid rgba(255,255,255,0.2)' : 'none'
                        }}>
                          {categoryItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>


          <div style={{
            flex: 1,
            padding: isMobile ? '16px' : '16px 20px',
            paddingRight: !isMobile && viewMode === 'orders' ? '460px' : '20px',
            overflowY: 'auto',
            minHeight: 0, // Important for flex scroll
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            margin: '0 auto',
            position: 'relative'
          }} className="hide-scrollbar">
            {/* Partial loading overlay when loading order from tables view */}
            {orderLoadingPartial && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                borderRadius: '12px'
              }}>
                <FaSpinner className="animate-spin text-orange-500" style={{ fontSize: '32px' }} />
                <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>{t('dashboard.loadingOrderDetails')}</p>
              </div>
            )}
            {/* Multi-Tier Pricing Rule Selector — moved to OrderSummary header */}

            {viewMode === 'orders' ? (
            <div>
              {/* Group items by category when showing all items */}
              {selectedCategory === 'all-items' ? (
                // Get unique categories from filtered items and render grouped
                (() => {
                  const categoryGroups = {};
                  filteredItems.forEach(item => {
                    const cat = item.category || 'Other';
                    if (!categoryGroups[cat]) {
                      categoryGroups[cat] = [];
                    }
                    categoryGroups[cat].push(item);
                  });

                  return Object.entries(categoryGroups).map(([categoryName, items], index) => (
                    <div key={categoryName} style={{ marginBottom: '24px' }}>
                      {/* Category Header with View Toggles on first category */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        paddingRight: !isMobile ? '0' : '0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1f2937',
                            textTransform: 'capitalize'
                          }}>
                            {categoryName}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            backgroundColor: '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {items.length}
                          </span>
                        </div>

                        {/* View Toggles - Only show on first category row */}
                        {index === 0 && !isMobile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Category View Toggle */}
                            <div
                              onClick={() => setCategoryViewMode(categoryViewMode === 'sidebar' ? 'chips' : 'sidebar')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: categoryViewMode === 'chips' ? '#fef2f2' : '#f9fafb',
                                border: categoryViewMode === 'chips' ? '1px solid #fecaca' : '1px solid #e5e7eb'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = categoryViewMode === 'chips' ? '#fecaca' : '#e5e7eb';
                              }}
                            >
                              <FaThList size={11} color={categoryViewMode === 'chips' ? '#ef4444' : '#6b7280'} />
                              <span style={{ fontSize: '11px', fontWeight: '600', color: categoryViewMode === 'chips' ? '#ef4444' : '#4b5563' }}>
                                {categoryViewMode === 'sidebar' ? t('dashboard.topBar') : t('dashboard.sidebar')}
                              </span>
                              <div style={{
                                width: '26px',
                                height: '14px',
                                borderRadius: '7px',
                                backgroundColor: categoryViewMode === 'chips' ? '#ef4444' : '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: categoryViewMode === 'chips' ? 'flex-end' : 'flex-start',
                                padding: '2px',
                                transition: 'all 0.2s ease'
                              }}>
                                <div style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }} />
                              </div>
                            </div>

                            {/* Modern Cards Toggle */}
                            <div
                              onClick={() => setUseModernCards(!useModernCards)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: useModernCards ? '#fef2f2' : '#f9fafb',
                                border: useModernCards ? '1px solid #fecaca' : '1px solid #e5e7eb'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = useModernCards ? '#fecaca' : '#e5e7eb';
                              }}
                            >
                              <FaExpand size={11} color={useModernCards ? '#ef4444' : '#6b7280'} />
                              <span style={{ fontSize: '11px', fontWeight: '600', color: useModernCards ? '#ef4444' : '#4b5563' }}>{t('dashboard.modern')}</span>
                              <div style={{
                                width: '26px',
                                height: '14px',
                                borderRadius: '7px',
                                backgroundColor: useModernCards ? '#ef4444' : '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: useModernCards ? 'flex-end' : 'flex-start',
                                padding: '2px',
                                transition: 'all 0.2s ease'
                              }}>
                                <div style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }} />
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                      {/* Category Items Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: useModernCards
                          ? (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))')
                          : (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))'),
                        gap: useModernCards
                          ? (isMobile ? '14px' : '20px')
                          : (isMobile ? '12px' : '18px'),
                        justifyContent: 'start'
                      }}>
                        {items.map((item) => {
                          const quantityInCart = getItemQuantityInCart(item.id);
                          return (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              quantityInCart={quantityInCart}
                              onAddToCart={addToCart}
                              onToggleFavorite={handleToggleFavorite}
                              onRemoveFromCart={removeFromCart}
                              onItemClick={handleItemCustomization}
                              isMobile={isMobile}
                              useModernDesign={useModernCards}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                // Single category selected - show header with toggles + flat grid
                <div>
                  {/* Category Header with View Toggles */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#1f2937',
                        textTransform: 'capitalize'
                      }}>
                        {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {filteredItems.length}
                      </span>
                    </div>

                    {/* View Toggles */}
                    {!isMobile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Category View Toggle */}
                        <div
                          onClick={() => setCategoryViewMode(categoryViewMode === 'sidebar' ? 'chips' : 'sidebar')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            backgroundColor: categoryViewMode === 'chips' ? '#fef2f2' : '#f9fafb',
                            border: categoryViewMode === 'chips' ? '1px solid #fecaca' : '1px solid #e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = categoryViewMode === 'chips' ? '#fecaca' : '#e5e7eb';
                          }}
                        >
                          <FaThList size={11} color={categoryViewMode === 'chips' ? '#ef4444' : '#6b7280'} />
                          <span style={{ fontSize: '11px', fontWeight: '600', color: categoryViewMode === 'chips' ? '#ef4444' : '#4b5563' }}>
                            {categoryViewMode === 'sidebar' ? t('dashboard.topBar') : t('dashboard.sidebar')}
                          </span>
                          <div style={{
                            width: '26px',
                            height: '14px',
                            borderRadius: '7px',
                            backgroundColor: categoryViewMode === 'chips' ? '#ef4444' : '#d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: categoryViewMode === 'chips' ? 'flex-end' : 'flex-start',
                            padding: '2px',
                            transition: 'all 0.2s ease'
                          }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }} />
                          </div>
                        </div>

                        {/* Modern Cards Toggle */}
                        <div
                          onClick={() => setUseModernCards(!useModernCards)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            backgroundColor: useModernCards ? '#fef2f2' : '#f9fafb',
                            border: useModernCards ? '1px solid #fecaca' : '1px solid #e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = useModernCards ? '#fecaca' : '#e5e7eb';
                          }}
                        >
                          <FaExpand size={11} color={useModernCards ? '#ef4444' : '#6b7280'} />
                          <span style={{ fontSize: '11px', fontWeight: '600', color: useModernCards ? '#ef4444' : '#4b5563' }}>{t('dashboard.modern')}</span>
                          <div style={{
                            width: '26px',
                            height: '14px',
                            borderRadius: '7px',
                            backgroundColor: useModernCards ? '#ef4444' : '#d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: useModernCards ? 'flex-end' : 'flex-start',
                            padding: '2px',
                            transition: 'all 0.2s ease'
                          }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }} />
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Items Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: useModernCards
                      ? (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))')
                      : (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))'),
                    gap: useModernCards
                      ? (isMobile ? '14px' : '20px')
                      : (isMobile ? '12px' : '18px'),
                    justifyContent: 'start'
                  }}>
                    {filteredItems.map((item) => {
                      const quantityInCart = getItemQuantityInCart(item.id);

                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantityInCart={quantityInCart}
                        onAddToCart={addToCart}
                        onToggleFavorite={handleToggleFavorite}
                        onRemoveFromCart={removeFromCart}
                        onItemClick={handleItemCustomization}
                        isMobile={isMobile}
                        useModernDesign={useModernCards}
                      />
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
            ) : (
              <DashboardTablesPanel
                floors={tablesData.floors}
                tables={tablesData.tables}
                isRefreshing={tablesRefreshing}
                selectedRestaurant={selectedRestaurant}
                recentlyUpdatedTableId={recentlyUpdatedTableId}
                onClearRecentlyUpdated={() => setRecentlyUpdatedTableId(null)}
                cart={cart}
                setCart={setCart}
                orderType={orderType}
                setOrderType={setOrderType}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onClearCart={clearCart}
                onProcessOrder={processOrder}
                onSaveOrder={saveOrder}
                onPlaceOrder={placeOrder}
                onRemoveFromCart={removeFromCart}
                onAddToCart={addToCart}
                onUpdateCartItemQuantity={updateCartItemQuantity}
                onTableNumberChange={setTableNumber}
                onCustomerNameChange={setCustomerName}
                onCustomerMobileChange={setCustomerMobile}
                inRoomDiningEnabled={inRoomDiningEnabled}
                locationType={locationType}
                setLocationType={setLocationType}
                manualRoomNumber={manualRoomNumber}
                setManualRoomNumber={setManualRoomNumber}
                processing={processing}
                placingOrder={placingOrder}
                orderSuccess={orderSuccess}
                setOrderSuccess={setOrderSuccess}
                error={error}
                getTotalAmount={getTotalAmount}
                tableNumber={tableNumber}
                selectedTable={selectedTable}
                customerName={customerName}
                customerMobile={customerMobile}
                orderLookup={orderLookup}
                setOrderLookup={setOrderLookup}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
                onShowQRCode={handleShowQRCode}
                restaurantName={selectedRestaurant?.name}
                taxSettings={taxSettings}
                menuItems={menuItems}
                printSettings={printSettings}
                upiSettings={upiSettings}
                whatsappConnected={whatsappConnected}
                billingSettings={selectedRestaurant?.billingSettings || {}}
                multiPricingEnabled={multiPricingEnabled}
                pricingRules={pricingRules}
                activePricingRuleId={activePricingRuleId}
                setActivePricingRuleId={setActivePricingRuleId}
                countryCode={selectedRestaurant?.countryCode || 'IN'}
                businessType={selectedRestaurant?.businessType || 'restaurant'}
                canDeleteTable={false}
                onDeleteTable={async (tableId) => {
                  try {
                    await apiClient.deleteTable(tableId, selectedRestaurant?.id);
                    // Remove from local state
                    setTablesData(prev => ({
                      ...prev,
                      floors: prev.floors.map(f => ({ ...f, tables: (f.tables || []).filter(t => t.id !== tableId) })),
                    }));
                  } catch (err) {
                    alert(`Failed to delete table: ${err.message}`);
                  }
                }}
                onRefreshTables={() => {
                  // Refresh tables in background after billing completion
                  if (selectedRestaurant?.id) {
                    prefetchTables(selectedRestaurant.id);
                  }
                }}
                onTakeOrder={(tbl, tableInfo) => {
                  // Clear previous order data when taking order from a new table
                  setCart([]);
                  setCurrentOrder(null);
                  setOrderLookup('');
                  setCustomerName('');
                  setCustomerMobile('');
                  setOrderType('dine-in');
                  setPaymentMethod('cash');
                  setOrderSuccess(null);
                  setError('');
                  setTableNumber(tbl);
                  // Set selectedTable with floor info for multi-tier pricing auto-selection
                  if (tableInfo?.floor) {
                    setSelectedTable({
                      id: tableInfo.id || null,
                      name: tbl,
                      floor: tableInfo.floor,
                      capacity: tableInfo.capacity || null
                    });
                  }
                  // Track that user came from tables view
                  setReturnToView('tables');
                  // Update URL with from=tables for back navigation (use pushState for back button support)
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('view');
                    url.searchParams.delete('orderId');
                    url.searchParams.delete('mode');
                    url.searchParams.set('from', 'tables');
                    window.history.pushState({ view: 'orders', from: 'tables' }, '', url.toString());
                  }
                  setViewMode('orders');
                }}
                onSliderClose={() => {
                  // This will be called from DashboardTablesPanel to close the slider
                  // The slider state is managed internally, but we can trigger a re-render
                  // by clearing the cart which will cause the slider to update
                }}
                onViewOrder={async (orderId, table) => {
                  // Track that user came from tables view
                  setReturnToView('tables');
                  // Show partial loading state instead of full page reload
                  setOrderLoadingPartial(true);
                  // Update URL with from=tables for back navigation (use pushState for back button support)
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('view');
                    url.searchParams.delete('mode'); // Clear edit mode if lingering
                    url.searchParams.set('from', 'tables');
                    if (orderId) {
                      url.searchParams.set('orderId', orderId);
                    }
                    window.history.pushState({ view: 'orders', from: 'tables' }, '', url.toString());
                  }
                  // Switch to orders view
                  setViewMode('orders');

                  // Load the order
                  if (orderId) {
                    await triggerOrderLookup(orderId);

                    // Set the table number if available
                    if (table && (table.name || table.number)) {
                      setTableNumber(table.name || table.number);
                    }

                    // Show notification
                    setNotification({
                      type: 'info',
                      title: t('dashboard.orderLoaded'),
                      message: `Order loaded for ${table?.name || table?.number || 'table'}. You can view, update, or complete it.`,
                      show: true
                    });
                  }
                  setOrderLoadingPartial(false);
                }}
              />
            )}
          </div>
          </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('dashboard.loadingMenu')}</p>
            </div>
          )}
        </div>


        {/* Order Summary - Desktop Sidebar / Mobile Bottom Sheet */}
        {(menuItems || []).length > 0 && (
          <>
            {/* Desktop Order Summary */}
            {!isMobile && (
              <>
                {viewMode === 'orders' ? (
          <div style={{
            position: 'fixed',
            right: 0,
            top: '56px', // Below the header
            width: '450px',
            height: 'calc(100vh - 56px)', // Full height minus header
            display: 'flex',
            flexDirection: 'column',
            zIndex: 90,
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e5e7eb'
          }}>
          {console.log('🖥️ Dashboard: Rendering OrderSummary with cart:', cart)}
          <OrderSummary
            cart={cart}
            setCart={setCart}
            orderType={orderType}
            setOrderType={setOrderType}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onClearCart={clearCart}
            onProcessOrder={processOrder}
            onSaveOrder={saveOrder}
            onPlaceOrder={placeOrder}
            onUpdateWithoutKOT={updateOrderWithoutKOT}
            onPlaceOrderAndPrint={placeOrderAndPrint}
            onRemoveFromCart={removeFromCart}
            onAddToCart={addToCart}
            onUpdateCartItemQuantity={updateCartItemQuantity}
            onTableNumberChange={setTableNumber}
            onCustomerNameChange={setCustomerName}
            onCustomerMobileChange={setCustomerMobile}
            inRoomDiningEnabled={inRoomDiningEnabled}
            locationType={locationType}
            setLocationType={setLocationType}
            manualRoomNumber={manualRoomNumber}
            setManualRoomNumber={setManualRoomNumber}
            processing={processing}
            placingOrder={placingOrder}
            savingOrder={savingOrder}
            orderSuccess={orderSuccess}
            setOrderSuccess={setOrderSuccess}
            error={error}
            getTotalAmount={getTotalAmount}
            tableNumber={tableNumber}
            selectedTable={selectedTable}
            customerName={customerName}
            customerMobile={customerMobile}
            orderLookup={orderLookup}
            setOrderLookup={setOrderLookup}
            currentOrder={currentOrder}
            setCurrentOrder={setCurrentOrder}
            onShowQRCode={handleShowQRCode}
            restaurantId={selectedRestaurant?.id}
            restaurantName={selectedRestaurant?.name}
            taxSettings={taxSettings}
            printSettings={printSettings}
            menuItems={menuItems}
            onStartVoiceOrder={startVoiceListening}
            savedOrders={savedOrders}
            activeSavedOrderId={activeSavedOrderId}
            loadingSavedOrderId={loadingSavedOrderId}
            deletingSavedOrderId={deletingSavedOrderId}
            onLoadSavedOrder={loadSavedOrder}
            onDeleteSavedOrder={deleteSavedOrder}
            templates={templates}
            onSaveAsTemplate={saveAsTemplate}
            posSettings={posSettings}
            businessType={selectedRestaurant?.businessType || 'restaurant'}
            userRole={JSON.parse(localStorage.getItem('user') || '{}').role || 'waiter'}
            countryCode={selectedRestaurant?.currencySettings?.countryCode || 'IN'}
            onCustomerDataChange={setCustomerData}
            billingSettings={selectedRestaurant?.billingSettings || {}}
            multiPricingEnabled={multiPricingEnabled}
            pricingRules={pricingRules}
            pricingRulesLoading={pricingRulesLoading}
            activePricingRuleId={activePricingRuleId}
            setActivePricingRuleId={setActivePricingRuleId}
            autoSelectedRule={autoSelectedRule}
            setAutoSelectedRule={setAutoSelectedRule}
            upiSettings={upiSettings}
            whatsappConnected={whatsappConnected}
            isScheduledOrder={isScheduledOrder}
            setIsScheduledOrder={setIsScheduledOrder}
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            scheduledTime={scheduledTime}
            setScheduledTime={setScheduledTime}
          />
        </div>
                ) : (
                  // No spacer needed - tables view should expand to full width
                  null
                )}
              </>
            )}

            {/* Hide sidebar hamburger when mobile cart is open */}
            {isMobile && showMobileCart && (
              <style>{`#sidebar-hamburger { display: none !important; }`}</style>
            )}

            {/* Mobile Order Summary - Full Screen */}
            {isMobile && showMobileCart && viewMode === 'orders' && (
                  <OrderSummary
                    cart={cart}
                setCart={setCart}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onClearCart={clearCart}
                    onProcessOrder={processOrder}
                    onSaveOrder={saveOrder}
                    onPlaceOrder={placeOrder}
                    onUpdateWithoutKOT={updateOrderWithoutKOT}
                    onPlaceOrderAndPrint={placeOrderAndPrint}
                    onRemoveFromCart={removeFromCart}
                    onAddToCart={addToCart}
                    onToggleFavorite={handleToggleFavorite}
                onUpdateCartItemQuantity={updateCartItemQuantity}
                    onTableNumberChange={setTableNumber}
                    onCustomerNameChange={setCustomerName}
                    onCustomerMobileChange={setCustomerMobile}
                    inRoomDiningEnabled={inRoomDiningEnabled}
                    locationType={locationType}
                    setLocationType={setLocationType}
                    manualRoomNumber={manualRoomNumber}
                    setManualRoomNumber={setManualRoomNumber}
                    processing={processing}
                    placingOrder={placingOrder}
                    savingOrder={savingOrder}
                    orderSuccess={orderSuccess}
                    setOrderSuccess={setOrderSuccess}
                    error={error}
                    getTotalAmount={getTotalAmount}
                    tableNumber={tableNumber}
                    selectedTable={selectedTable}
                    customerName={customerName}
                    customerMobile={customerMobile}
                    orderLookup={orderLookup}
                    setOrderLookup={setOrderLookup}
                    currentOrder={currentOrder}
                    setCurrentOrder={setCurrentOrder}
                    onShowQRCode={handleShowQRCode}
                    restaurantId={selectedRestaurant?.id}
                    restaurantName={selectedRestaurant?.name}
                    taxSettings={taxSettings}
                    printSettings={printSettings}
                    menuItems={menuItems}
                    onClose={() => setShowMobileCart(false)}
                    onStartVoiceOrder={startVoiceListening}
                    savedOrders={savedOrders}
                    activeSavedOrderId={activeSavedOrderId}
                    loadingSavedOrderId={loadingSavedOrderId}
                    deletingSavedOrderId={deletingSavedOrderId}
                    onLoadSavedOrder={loadSavedOrder}
                    onDeleteSavedOrder={deleteSavedOrder}
                    posSettings={posSettings}
                    businessType={selectedRestaurant?.businessType || 'restaurant'}
                    userRole={JSON.parse(localStorage.getItem('user') || '{}').role || 'waiter'}
                    countryCode={selectedRestaurant?.currencySettings?.countryCode || 'IN'}
                    onCustomerDataChange={setCustomerData}
                    billingSettings={selectedRestaurant?.billingSettings || {}}
                    multiPricingEnabled={multiPricingEnabled}
                    pricingRules={pricingRules}
                    pricingRulesLoading={pricingRulesLoading}
                    activePricingRuleId={activePricingRuleId}
                    setActivePricingRuleId={setActivePricingRuleId}
                    autoSelectedRule={autoSelectedRule}
                    setAutoSelectedRule={setAutoSelectedRule}
                    upiSettings={upiSettings}
                    whatsappConnected={whatsappConnected}
                    isScheduledOrder={isScheduledOrder}
                    setIsScheduledOrder={setIsScheduledOrder}
                    scheduledDate={scheduledDate}
                    setScheduledDate={setScheduledDate}
                    scheduledTime={scheduledTime}
                    setScheduledTime={setScheduledTime}
                  />
            )}
          </>
        )}
      </div>

      {/* Mobile Category Sidebar */}
      {isMobile && showMobileSidebar && viewMode === 'orders' && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998
            }}
            onClick={() => setShowMobileSidebar(false)}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '280px',
            backgroundColor: 'white',
            zIndex: 999,
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
            transform: showMobileSidebar ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mobile Sidebar Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Menu Categories
              </h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <FaTimes size={18} color="#6b7280" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div style={{ 
              flex: 1, 
              padding: '16px', 
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} className="hide-scrollbar">
              {categories.map((category) => {
                const categoryItems = category.id === 'all-items' 
                  ? (menuItems || [])
                  : (menuItems || []).filter(item => item.category?.toLowerCase() === category.id);
                const isSelected = selectedCategory === category.id;
                
                return (
                  <div key={category.id} onClick={() => {
                    setSelectedCategory(isSelected && category.id !== 'all-items' ? 'all-items' : category.id);
                    setShowMobileSidebar(false);
                  }}>
                    <CategoryButton
                      category={category}
                      isSelected={isSelected}
                    onClick={() => {
                      setSelectedCategory(isSelected && category.id !== 'all-items' ? 'all-items' : category.id);
                      setShowMobileSidebar(false);
                    }}
                      itemCount={categoryItems.length}
                    />
                    </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Cart Modal */}
      {isMobile && showMobileCart && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998
            }}
            onClick={() => setShowMobileCart(false)}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: 'white',
            zIndex: 999,
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
            transform: showMobileCart ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mobile Cart Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Your Order ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </h2>
              <button
                onClick={() => setShowMobileCart(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <FaTimes size={18} color="#6b7280" />
              </button>
            </div>

            {/* Mobile Cart Content */}
            <div style={{ 
              flex: 1, 
              padding: '16px', 
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} className="hide-scrollbar">
              {cart.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#6b7280'
                }}>
                  <FaShoppingCart size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
                  <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{t('dashboard.noItems')}</p>
                  <p style={{ fontSize: '14px' }}>{t('dashboard.addItemsFirst')}</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: '#fef7f0',
                    borderRadius: '16px',
                    marginBottom: '12px',
                    border: '1px solid #fed7aa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                          Rs.{item.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <button
                          onClick={() => updateCartQuantity(index, Math.max(0, item.quantity - 1))}
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px 0 0 8px',
                            cursor: 'pointer'
                          }}
                        >
                          <FaMinus size={12} />
                        </button>
                        <span style={{
                          width: '40px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          borderLeft: '1px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '14px'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '0 8px 8px 0',
                            cursor: 'pointer'
                          }}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>
                        Rs.{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '20px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #1f2937, #111827)', 
                  color: 'white', 
                  padding: '16px', 
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{t('common.total')}</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Rs.{getTotalAmount()}</span>
                  </div>
                </div>

                {canCompleteBill && (
                <button
                  onClick={() => {
                    setShowMobileCart(false);
                    processOrder();
                  }}
                  disabled={processing || savingOrder || placingOrder}
                  style={{
                    width: '100%',
                    background: (processing || savingOrder || placingOrder)
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    border: 'none',
                    cursor: (processing || savingOrder || placingOrder) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {processing ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={16} />
                      {t('dashboard.orderProcessing')}
                    </>
                  ) : (
                    <>
                      <FaCheckCircle size={16} />
                      {t('dashboard.completeBilling')} • Rs.{getTotalAmount()}
                    </>
                  )}
                </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Table Selector Modal */}
      {showTableSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {inRoomDiningEnabled ? t('dashboard.selectLocation') : t('dashboard.tableNumber')}
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                {inRoomDiningEnabled ? t('dashboard.enterTableOrRoom') : t('dashboard.enterTableNumber')}
              </p>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Location Type Selector (Table or Room) - Only show if in-room dining is enabled */}
              {inRoomDiningEnabled && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    {t('dashboard.locationType')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType('table');
                        setManualRoomNumber('');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '2px solid',
                        backgroundColor: locationType === 'table' ? '#e53e3e' : 'white',
                        color: locationType === 'table' ? 'white' : '#374151',
                        borderColor: locationType === 'table' ? '#e53e3e' : '#e5e7eb',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaTable size={14} />
                      {t('dashboard.table')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType('room');
                        setManualTableNumber('');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '2px solid',
                        backgroundColor: locationType === 'room' ? '#e53e3e' : 'white',
                        color: locationType === 'room' ? 'white' : '#374151',
                        borderColor: locationType === 'room' ? '#e53e3e' : '#e5e7eb',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaBed size={14} />
                      {t('dashboard.room')}
                    </button>
                  </div>
                </div>
              )}

              {/* Table Number Input */}
              {(!inRoomDiningEnabled || locationType === 'table') && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    {t('dashboard.tableNumber')}
                  </label>
                  <input
                    type="text"
                    value={manualTableNumber}
                    onChange={(e) => setManualTableNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualTableSelection()}
                    placeholder={t('dashboard.tablePlaceholder')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </div>
              )}

              {/* Room Number Input */}
              {inRoomDiningEnabled && locationType === 'room' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    {t('dashboard.roomNumber')}
                  </label>
                  <input
                    type="text"
                    value={manualRoomNumber}
                    onChange={(e) => setManualRoomNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualRoomSelection()}
                    placeholder={t('dashboard.roomPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </div>
              )}

              {!inRoomDiningEnabled && (
                <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaChair size={16} color="#0284c7" />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0284c7' }}>
                      {t('dashboard.needManageTables')}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#075985', margin: 0, lineHeight: '1.4' }}>
                    {t('dashboard.visitTableManagement')}
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ padding: '24px', backgroundColor: '#f9fafb', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowTableSelector(false);
                  setLocationType('table');
                  setManualTableNumber('');
                  setManualRoomNumber('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={inRoomDiningEnabled && locationType === 'room' ? handleManualRoomSelection : handleManualTableSelection}
                disabled={inRoomDiningEnabled && locationType === 'room' 
                  ? !manualRoomNumber.trim() 
                  : !manualTableNumber.trim()}
                style={{
                  flex: 1,
                  backgroundColor: (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber.trim() : manualTableNumber.trim()) 
                    ? '#e53e3e' : '#d1d5db',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber.trim() : manualTableNumber.trim()) 
                    ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {inRoomDiningEnabled && locationType === 'room' ? (
                  <>
                    <FaBed size={14} />
                    {t('dashboard.selectRoom')}
                  </>
                ) : (
                  <>
                    <FaTable size={14} />
                    {t('dashboard.tableNumber')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Tables Confirmation Modal */}
      {showResetConfirm && (() => {
        const allTables = tablesData.tables?.length > 0 ? tablesData.tables : tablesData.floors?.flatMap(f => f.tables || []) || [];
        const occupiedCount = allTables.filter(t => t.status === 'occupied').length;
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
          }} onClick={() => !resetLoading && setShowResetConfirm(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <FaTools size={24} color="#ef4444" />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  {t('dashboard.resetAllTables')}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  This will mark <strong style={{ color: '#ef4444' }}>{occupiedCount} occupied table{occupiedCount !== 1 ? 's' : ''}</strong> as available. Any active orders on these tables will be unlinked.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetLoading}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                    background: 'white', color: '#374151', fontSize: '14px', fontWeight: '600',
                    cursor: resetLoading ? 'not-allowed' : 'pointer', opacity: resetLoading ? 0.5 : 1
                  }}
                >
                  {t('dashboard.cancel')}
                </button>
                <button
                  onClick={async () => {
                    setResetLoading(true);
                    try {
                      await apiClient.resetAllTables(selectedRestaurant.id);
                      setTablesData(prev => ({
                        ...prev,
                        floors: prev.floors.map(floor => ({
                          ...floor,
                          tables: floor.tables?.map(t =>
                            t.status === 'occupied' ? { ...t, status: 'available', currentOrderId: null } : t
                          ),
                        })),
                        tables: prev.tables?.map(t =>
                          t.status === 'occupied' ? { ...t, status: 'available', currentOrderId: null } : t
                        ) || [],
                      }));
                      setShowResetConfirm(false);
                      setNotification({
                        type: 'success', title: t('dashboard.tablesReset'),
                        message: `${occupiedCount} table${occupiedCount !== 1 ? 's' : ''} reset to available.`,
                        show: true
                      });
                      setTimeout(() => setNotification(null), 4000);
                    } catch (err) {
                      setNotification({
                        type: 'error', title: t('dashboard.resetFailed'),
                        message: err.message || 'Failed to reset tables. Please try again.',
                        show: true
                      });
                      setTimeout(() => setNotification(null), 4000);
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                  disabled={resetLoading}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                    background: resetLoading ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', fontSize: '14px', fontWeight: '600',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
                  }}
                >
                  {resetLoading ? (
                    <>
                      <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      {t('dashboard.resetting')}
                    </>
                  ) : (
                    t('dashboard.resetAll')
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Notification Component */}
      <Notification
        show={notification?.show || false}
        type={notification?.type || 'success'}
        title={notification?.title}
        message={notification?.message}
        onClose={() => setNotification(null)}
        duration={5000}
      />
      
      {/* Fullscreen Mode Button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '48px',
          height: '48px',
          backgroundColor: fullscreenStep === 0 ? '#ef4444' : fullscreenStep === 1 ? '#f97316' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          opacity: 0.9
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.9';
          e.target.style.transform = 'scale(1)';
        }}
        title={
          fullscreenStep === 0 ? t('dashboard.hideNavigation') :
          fullscreenStep === 1 ? t('dashboard.enterFullscreen') :
          t('dashboard.exitFullscreen')
        }
      >
        {fullscreenStep === 0 ? <FaExpand size={18} /> :
         fullscreenStep === 1 ? <FaExpandArrowsAlt size={18} /> :
         <FaCompress size={18} />}
      </button>

      {/* Logout Dropdown - Only visible when navigation is hidden */}
      {isNavigationHidden && user && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }} data-logout-dropdown>
          <button
            onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
              {user.name || t('dashboard.user')}
            </span>
            <FaChevronDown size={10} color="#6b7280" />
          </button>

          {/* Dropdown Menu */}
          {showLogoutDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              minWidth: '200px',
              zIndex: 1002
            }}>
              {/* User Info */}
              <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                      {user.name || t('dashboard.user')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {user.role || t('dashboard.staff')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div style={{ padding: '8px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: '#dc2626',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                    e.currentTarget.style.color = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <FaSignOutAlt size={10} />
                  {t('dashboard.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        restaurantId={selectedRestaurant?.id}
        restaurantName={selectedRestaurant?.name}
        restaurant={selectedRestaurant}
      />

      {/* Bulk Upload Modal */}
      <BulkMenuUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        restaurantId={selectedRestaurant?.id}
        onMenuItemsAdded={handleMenuItemsAdded}
        currentMenuItems={menuItems}
      />

      {/* Item Customization Modal */}
      <ItemCustomizationModal
        isOpen={customizationModalOpen}
        item={selectedItemForCustomization}
        onClose={handleCloseCustomizationModal}
        onAddToCart={addToCart}
      />

      {/* RAG Initializer */}
      {selectedRestaurant?.id && (
        <RAGInitializer 
          restaurantId={selectedRestaurant.id}
          onInitialized={() => {
            console.log('RAG knowledge initialized successfully');
          }}
        />
      )}

      {/* Intelligent Chatbot */}
      {selectedRestaurant?.id && user && (
        <IntelligentChatbot
          restaurantId={selectedRestaurant.id}
          userId={user.id || user.userId || user.uid || null}
          onAddToCart={addToCart}
          onPlaceOrder={placeOrder}
          onClearCart={clearCart}
          onSearchOrder={async (orderId) => {
            if (orderId && selectedRestaurant?.id) {
              // Clear edit-mode URL params when searching via chatbot
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('orderId');
                url.searchParams.delete('mode');
                url.searchParams.delete('from');
                window.history.replaceState({}, '', url.toString());
              }
              setOrderLookup(orderId.toString());
              await triggerOrderLookup(orderId.toString());
            }
          }}
          onSearchMenu={(searchTerm) => {
            setSearchTerm(searchTerm);
          }}
          cart={cart}
          menuItems={menuItems}
        />
      )}

      {/* Mobile Bottom Cart Button - When Search Bar is Hidden */}
      {isMobile && viewMode === 'orders' && !showMobileCart && posSettings.hideSearchBar && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 900
        }}>
          <button
            onClick={() => setShowMobileCart(true)}
            style={{
              width: '100%',
              padding: cart.length > 0 ? '14px 20px' : '12px 20px',
              backgroundColor: cart.length > 0 ? '#10b981' : '#f3f4f6',
              color: cart.length > 0 ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: cart.length > 0
                ? '0 8px 32px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <FaShoppingCart size={16} />
            {cart.length > 0 ? (
              <>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} {t('dashboard.items')}</span>
                <span style={{ margin: '0 4px', opacity: 0.5 }}>|</span>
                <span>Rs.{getTotalAmount()}</span>
              </>
            ) : (
              <span>{t('dashboard.emptyCart')}</span>
            )}
          </button>
        </div>
      )}

      {/* Mobile Command Bar - Bottom Fixed */}
      {isMobile && viewMode === 'orders' && !showMobileCart && !posSettings.hideSearchBar && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 900
        }}>
          {/* Compiled Text - Mobile */}
          {isListeningVoice && voiceCompiledText && (
            <div style={{
              marginBottom: '8px',
              padding: '8px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ fontSize: '10px', color: '#059669', fontWeight: '600', marginBottom: '2px' }}>
                {t('dashboard.recognized')}
              </div>
              <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>
                {voiceCompiledText}
              </div>
            </div>
          )}

          {/* Mobile Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '50px',
            boxShadow: isListeningVoice
              ? '0 8px 32px rgba(239, 68, 68, 0.2), 0 0 0 2px #ef4444'
              : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Icon */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
            }}>
              {isListeningVoice ? (
                <FaMicrophone size={13} color="white" />
              ) : (
                <FaSearch size={13} color="white" />
              )}
            </div>

            {/* Input / Transcript */}
            {isListeningVoice ? (
              <div style={{
                flex: 1,
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {voiceTranscript || <span style={{ color: '#9ca3af' }}>{t('dashboard.listening')}</span>}
              </div>
            ) : (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('dashboard.searchMenu')}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  padding: 0,
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              />
            )}

            {/* Items Counter - Mobile */}
            {isListeningVoice && voiceItemsAdded > 0 && (
              <div style={{
                padding: '4px 10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                +{voiceItemsAdded}
              </div>
            )}

            {/* Clear - Search only */}
            {!isListeningVoice && searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <FaTimes size={8} color="#6b7280" />
              </button>
            )}

            {/* Divider */}
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

            {/* Voice/Stop Button */}
            <button
              onClick={() => isListeningVoice ? stopVoiceListening(false) : startVoiceListening()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isListeningVoice
                  ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isListeningVoice ? (
                <FaStop size={13} color="white" />
              ) : (
                <FaMicrophone size={15} color="white" />
              )}
            </button>

            {/* Cart Button - Only when not listening */}
            {!isListeningVoice && (
              <button
                onClick={() => setShowMobileCart(true)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: cart.length > 0
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : '#f3f4f6',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  position: 'relative',
                  boxShadow: cart.length > 0 ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none'
                }}
              >
                <FaShoppingCart size={15} color={cart.length > 0 ? 'white' : '#6b7280'} />
                {cart.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '700'
                  }}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fef7f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #fed7aa',
          borderTop: '4px solid #f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', margin: 0 }}>{t('common.loading')}</p>
      </div>
    </div>
  );
}

export default function RestaurantPOS() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RestaurantPOSContent />
    </Suspense>
  );
}


