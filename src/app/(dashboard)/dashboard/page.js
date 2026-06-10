'use client';

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// import Pusher from 'pusher-js'; // COMMENTED OUT — replaced by Firebase RTDB
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../../../firebase';
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
  FaTh,
  FaThLarge,
  FaTools,
  FaCalendarAlt,
  FaBell,
  FaRobot
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { performLogout } from '../../../lib/logout';
import { t } from '../../../lib/i18n';
import { useLoading } from '../../../contexts/LoadingContext';
import IntelligentChatbot from '../../../components/IntelligentChatbot';
import RAGInitializer from '../../../components/RAGInitializer';
import { getCachedDashboardData, setCachedDashboardData, getCachedTablesData, setCachedTablesData } from '../../../utils/dashboardCache';
import { getOrderItemKey } from '../../../utils/orderItemKey';
import { useSyncEngine } from '../../../hooks/useSyncEngine';
import { setCachedData, getCachedData, saveEssentialData, getEssentialData } from '../../../lib/offlineDb';
import { canPerform } from '../../../lib/permissions';
import { useHubEvents } from '../../../hooks/useHubEvents';
import { useDineBot } from '../../../components/DineBotProvider';

// Safe wrappers for contexts that may not be available in mobile embed mode
function useSafeLoading() {
  try { return useLoading(); } catch { return { isLoading: false, startLoading: () => {}, stopLoading: () => {} }; }
}
function useSafeDineBot() {
  try { return useDineBot(); } catch { return { openDineBot: () => {} }; }
}

/**
 * Filter out items excluded from KOT printing by category or item ID.
 * Returns items unchanged when the feature is disabled.
 */
function filterKotExcludedItems(items, printSettings) {
  if (!printSettings?.kotExclusionEnabled) return items;
  const excludedCats = new Set(printSettings.kotExcludedCategories || []);
  const excludedIds = new Set(printSettings.kotExcludedItemIds || []);
  if (excludedCats.size === 0 && excludedIds.size === 0) return items;
  return items.filter(item => {
    if (excludedIds.has(item.id || item.menuItemId)) return false;
    if (excludedCats.has(item.categoryId)) return false;
    return true;
  });
}

function RestaurantPOSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoading } = useSafeLoading();
  const { openDineBot } = useSafeDineBot();

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
  const [orderUnreadCount, setOrderUnreadCount] = useState(0);

  // Ref to track if initial data has been loaded (prevents duplicate calls)
  const initialDataLoadedRef = useRef(false);
  
  // Customization modal state
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState(null);
  const [customizationInitial, setCustomizationInitial] = useState({ variant: null, customizations: null, quantity: null });
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
  const [subRestaurants, setSubRestaurants] = useState([]);
  const [selectedSubRestaurant, setSelectedSubRestaurant] = useState(null);
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
  const [assignedStaff, setAssignedStaff] = useState(null); // { name, id } for staff assignment
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
  const isMobileEmbed = isMobile && typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileEmbedSearch, setShowMobileEmbedSearch] = useState(false);

  // Category sidebar width constant (compact, part of menu section)
  const categorySidebarWidth = 150;

  // POS settings from restaurant config (dashboard customization)
  const posSettings = useMemo(() => selectedRestaurant?.posSettings || {}, [selectedRestaurant]);

  // Listen for order notification unread count from layout
  useEffect(() => {
    const handler = (e) => setOrderUnreadCount(e.detail?.count || 0);
    window.addEventListener('orderUnreadCountChanged', handler);
    return () => window.removeEventListener('orderUnreadCountChanged', handler);
  }, []);

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

  // Weighing scale: connect + subscribe to weight events (Electron only)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.scale) return;
    let unsubWeight;
    window.electronAPI.scale.getStatus().then(status => {
      setScaleStatus(status);
    }).catch(() => {});
    unsubWeight = window.electronAPI.onScaleWeight((data) => {
      if (data.error) {
        setScaleStatus(prev => ({ ...prev, connected: false, error: data.error }));
      } else {
        setScaleWeight(data);
        setScaleStatus(prev => ({ ...prev, connected: true, error: null }));
      }
    });
    return () => { if (unsubWeight) unsubWeight(); };
  }, []);

  // Card design toggle state - Initialize from localStorage based on user ID
  // Card size: 'compact' | 'standard' | 'large' — replaces old boolean useModernCards
  const [cardSize, setCardSize] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        // First check posSettings on restaurant (DB-persisted)
        const restData = localStorage.getItem('selectedRestaurant');
        if (restData) {
          const rest = JSON.parse(restData);
          if (rest?.posSettings?.cardSize) return rest.posSettings.cardSize;
        }
        // Fallback to user-level localStorage
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData)?.id : 'guest';
        const saved = localStorage.getItem(`viewSettings_${userId}`);
        if (saved) {
          const settings = JSON.parse(saved);
          if (settings.cardSize) return settings.cardSize;
          // Migrate old boolean: useModernCards=true → 'standard', false → 'compact'
          if (settings.useModernCards !== undefined) return settings.useModernCards ? 'standard' : 'compact';
        }
      } catch (e) {
        console.error('Error loading cardSize from localStorage:', e);
      }
    }
    return 'standard';
  });
  const [cardSizeDropdownOpen, setCardSizeDropdownOpen] = useState(false);
  // Derived: backward compat for MenuItemCard (modern = standard or large)
  const useModernCards = cardSize !== 'compact';
  const [categoryViewMode, setCategoryViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        // First check posSettings on restaurant (DB-persisted)
        const restData = localStorage.getItem('selectedRestaurant');
        if (restData) {
          const rest = JSON.parse(restData);
          if (rest?.posSettings?.categoryViewMode) return rest.posSettings.categoryViewMode;
        }
        // Fallback to user-level localStorage
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

  // Weighing scale state (Electron only)
  const [scaleStatus, setScaleStatus] = useState({ connected: false });
  const [scaleWeight, setScaleWeight] = useState(null); // { weight, unit, stable }
  const [showWeightPopup, setShowWeightPopup] = useState(null); // item being weighed

  // Floating Command Bar ref
  const commandBarInputRef = useRef(null);

  // Save view settings to localStorage + DB when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData)?.id : 'guest';
        const settings = {
          useModernCards: cardSize !== 'compact',
          cardSize,
          categoryViewMode
        };
        localStorage.setItem(`viewSettings_${userId}`, JSON.stringify(settings));

        // Also persist cardSize + categoryViewMode to DB via posSettings
        const restData = localStorage.getItem('selectedRestaurant');
        if (restData) {
          const rest = JSON.parse(restData);
          if (rest?.id) {
            const newPosSettings = { ...(rest.posSettings || {}), cardSize, categoryViewMode };
            // Update localStorage immediately for instant reload
            const updated = { ...rest, posSettings: newPosSettings };
            localStorage.setItem('selectedRestaurant', JSON.stringify(updated));
            // Save to DB (fire-and-forget)
            apiClient.updateRestaurant(rest.id, { posSettings: newPosSettings }).catch(() => {});
          }
        }
      } catch (e) {
        console.error('Error saving view settings:', e);
      }
    }
  }, [cardSize, categoryViewMode]);

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

  // Optimistic table overrides — survives prefetchTables overwrites for 10 seconds
  const optimisticTableOverridesRef = useRef({});

  // Apply optimistic overrides on top of any floors data
  const applyTableOverrides = useCallback((floorsData) => {
    if (!floorsData) return floorsData;
    const overrides = optimisticTableOverridesRef.current;
    const now = Date.now();
    for (const key of Object.keys(overrides)) {
      if (overrides[key].expiresAt < now) delete overrides[key];
    }
    if (Object.keys(overrides).length === 0) return floorsData;
    return floorsData.map(floor => ({
      ...floor,
      tables: (floor.tables || []).map(t => {
        // Check composite key (floorId_tableId) first for precise match, then fall back to name
        const compositeKey = `${floor.id || ''}_${t.id}`;
        const override = overrides[compositeKey] || overrides[String(t.name)] || overrides[String(t.number)];
        if (override) {
          const { expiresAt, ...overrideData } = override;
          return { ...t, ...overrideData };
        }
        return t;
      })
    }));
  }, []);

  // Prefetch tables/floors once restaurant is known
  const prefetchTables = useCallback(async (rid) => {
    if (!rid) return;
    try {
      setTablesRefreshing(true);

      const applyOverrides = applyTableOverrides;

      // Offline: load from cache immediately (web only — Electron always queries SQLite)
      const _isElectronPrefetch = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
      if (!navigator.onLine && !_isElectronPrefetch) {
        const cached = getCachedTablesData(rid);
        if (cached?.floors) {
          setTablesData({ floors: applyOverrides(cached.floors), tables: [] });
          return;
        }
      }

      const floorsRes = await apiClient.getFloors(rid).catch(() => null);

      if (floorsRes) {
        const floorsData = floorsRes?.floors || floorsRes || [];
        setTablesData({ floors: applyOverrides(floorsData), tables: [] });
        // Cache for offline use
        setCachedTablesData(rid, { floors: floorsData });
      } else {
        // API failed — try cache fallback
        const cached = getCachedTablesData(rid);
        if (cached?.floors) {
          setTablesData({ floors: applyOverrides(cached.floors), tables: [] });
        } else {
          setTablesData({ floors: [], tables: [] });
        }
      }
    } finally {
      setTablesRefreshing(false);
    }
  }, []);

  // Optimistic table status update — instantly change UI, revert on error
  const optimisticTableStatus = useCallback((tableIdentifier, status, orderId = null, orderTotal = null) => {
    if (!tableIdentifier) return;
    const isObj = typeof tableIdentifier === 'object' && tableIdentifier?.id;
    const tableName = isObj ? tableIdentifier.name : tableIdentifier;
    const overrideKey = isObj ? `${tableIdentifier.floorId || ''}_${tableIdentifier.id}` : String(tableName);
    // Store override so prefetchTables won't overwrite it
    optimisticTableOverridesRef.current[overrideKey] = {
      status, currentOrderId: orderId, currentOrderTotal: orderTotal,
      lastOrderTime: new Date().toISOString(),
      expiresAt: Date.now() + 10000, // 10 second TTL
    };
    setTablesData(prev => ({
      ...prev,
      floors: (prev.floors || []).map(floor => ({
        ...floor,
        tables: (floor.tables || []).map(t => {
          const match = isObj
            ? (t.id === tableIdentifier.id && (!tableIdentifier.floorId || floor.id === tableIdentifier.floorId))
            : (String(t.name) === String(tableName) || String(t.number) === String(tableName));
          return match
            ? { ...t, status, currentOrderId: orderId, currentOrderTotal: orderTotal, lastOrderTime: new Date().toISOString() }
            : t;
        })
      }))
    }));
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
        if (window.__DINEOPEN_MOBILE_EMBED__) return; // skip redirect in mobile embed
        console.log('🚫 User not authenticated, redirecting to login');
        router.replace('/login');
        return;
      }

      const user = apiClient.getUser();
      if (!user) {
        if (window.__DINEOPEN_MOBILE_EMBED__) return; // skip redirect in mobile embed
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

  // Sub-restaurant menu filtering: use own menu when menuMode='own'
  // Shallow-copy items to prevent downstream mutations (e.g. pricing rule
  // adjustments) from corrupting the original menu data source.
  const effectiveMenuItems = useMemo(() => {
    if (selectedSubRestaurant?.menuMode === 'own' && selectedSubRestaurant.menu?.items?.length > 0) {
      return selectedSubRestaurant.menu.items.map(item => ({ ...item }));
    }
    return (menuItems || []).map(item => ({ ...item }));
  }, [selectedSubRestaurant, menuItems]);

  // Generate dynamic categories based on actual menu items
  const getDynamicCategories = () => {
    if (!effectiveMenuItems || effectiveMenuItems.length === 0) {
      return [
        { id: 'all-items', name: t('dashboard.allItems'), emoji: '🍽️', count: 0 },
        { id: 'favorites', name: t('dashboard.favorites'), emoji: '❤️', count: 0 }
      ];
    }

    // Get unique categories from menu items
    const categoryMap = new Map();
    categoryMap.set('all-items', { id: 'all-items', name: t('dashboard.allItems'), emoji: '🍽️', count: effectiveMenuItems.length });

    // Count favorites
    const favoritesCount = effectiveMenuItems.filter(item => item.isFavorite === true).length;
    categoryMap.set('favorites', { id: 'favorites', name: t('dashboard.favorites'), emoji: '❤️', count: favoritesCount });

    effectiveMenuItems.forEach(item => {
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

  // Mobile detection hook — Electron uses higher breakpoint so sidebar is hidden by default
  useEffect(() => {
    const isElectron = !!(window.electronAPI);
    const breakpoint = isElectron ? 1200 : 768;
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
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
      if (window.__DINEOPEN_MOBILE_EMBED__) return; // skip redirect in mobile embed
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

    // Skip loading stale cart when URL has an orderId — triggerOrderLookup
    // will set the cart after fetching the order.  Without this guard the
    // 300 ms setTimeout in the URL-handler effect lets the stale localStorage
    // cart flash on screen before the order loads.
    try {
      const urlOrderId = new URLSearchParams(window.location.search).get('orderId');
      if (urlOrderId) {
        console.log('🔄 Skipping localStorage cart load - orderId in URL, will load from order');
        return;
      }
    } catch (_) { /* ignore */ }

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

  // Load tax settings for the restaurant (cache-first with 5-min staleness)
  const loadTaxSettings = useCallback(async (restaurantId) => {
    if (!restaurantId) return;

    // 1. Load from localStorage cache INSTANTLY (synchronous)
    const cacheKey = `dine_tax_${restaurantId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (data) {
          setTaxSettings(data);
          // If cache is fresh (< 5 min), skip API call
          if (Date.now() - timestamp < 5 * 60 * 1000) return;
        }
      }
    } catch (_) {}

    // 2. Revalidate from API in background
    try {
      const taxSettingsResponse = await apiClient.getTaxSettings(restaurantId);

      if (taxSettingsResponse.success && taxSettingsResponse.taxSettings) {
        setTaxSettings(taxSettingsResponse.taxSettings);
        // Cache in localStorage for instant load next time
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: taxSettingsResponse.taxSettings,
            timestamp: Date.now(),
          }));
        } catch (_) {}
        // Also keep IndexedDB for offline
        setCachedData(`tax_${restaurantId}`, taxSettingsResponse.taxSettings).catch(() => {});
        saveEssentialData(`tax_${restaurantId}`, taxSettingsResponse.taxSettings);
      } else if (!localStorage.getItem(cacheKey)) {
        // Only set null if we have no cache at all
        setTaxSettings(null);
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
      // Try IndexedDB fallback if no localStorage cache was found
      try {
        const cachedTax = await getCachedData(`tax_${restaurantId}`).catch(() => null)
          || await getEssentialData(`tax_${restaurantId}`);
        if (cachedTax) {
          setTaxSettings(cachedTax);
          // Promote to localStorage for next instant load
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ data: cachedTax, timestamp: Date.now() }));
          } catch (_) {}
        }
      } catch (_) {}
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
        saveEssentialData(`printSettings_${restaurantId}`, printSettingsResponse.printSettings);
        console.log('🖨️ Print settings loaded:', printSettingsResponse.printSettings);
      } else {
        console.log('🖨️ No print settings found, using defaults');
        setPrintSettings(null);
      }
    } catch (error) {
      console.error('🖨️ Error loading print settings:', error);
      const cachedPrint = await getEssentialData(`printSettings_${restaurantId}`);
      if (cachedPrint) {
        setPrintSettings(cachedPrint);
        console.log('🖨️ Loaded print settings from offline cache');
      } else {
        setPrintSettings(null);
      }
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
        // Prefer API response (has full data including billingSettings), fallback to login response
        const apiRestaurant = restaurantsResponse.restaurants.find(r => r.id === user.restaurantId);
        if (apiRestaurant) {
          restaurant = apiRestaurant;
        } else if (user.restaurant) {
          restaurant = user.restaurant;
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
            if (cachedData.tablesData) setTablesData({ ...cachedData.tablesData, floors: applyTableOverrides(cachedData.tablesData.floors) });
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
              floors: applyTableOverrides(freshFloors),
              tables: []
            });

            // Cache the fresh data with tablesData structure (cache raw, not overridden)
            const dataToCache = {
              menuItems: freshMenuItems,
              floors: freshFloors,
              tablesData: { floors: freshFloors, tables: [] }
            };
            setCachedDashboardData(restaurant.id, dataToCache);
            // Also persist to IndexedDB for deeper offline support
            setCachedData(`dashboard_${restaurant.id}`, dataToCache).catch(() => {});
            // Save to essential_data (survives restart)
            saveEssentialData(`menu_${restaurant.id}`, freshMenuItems);
            saveEssentialData(`floors_${restaurant.id}`, freshFloors);

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
              saveEssentialData(`pricingRules_${restaurant.id}`, { enabled: mp?.enabled, rules: mp?.rules || [] });
            } catch { /* ignore — backward compatible */ }

            // Load sub-restaurants
            try {
              const subRes = await apiClient.getSubRestaurants(restaurant.id);
              const activeSubs = (subRes.subRestaurants || []).filter(s => s.status === 'active');
              setSubRestaurants(activeSubs);
              // Restore previously selected sub-restaurant
              const savedSubId = localStorage.getItem('selectedSubRestaurantId');
              if (savedSubId) {
                const savedSub = activeSubs.find(s => s.id === savedSubId);
                if (savedSub) setSelectedSubRestaurant(savedSub);
              }
            } catch { setSubRestaurants([]); }

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
              // Try essential_data (survives restart even when cached_api is cleared)
              const essMenu = await getEssentialData(`menu_${restaurant.id}`);
              const essFloors = await getEssentialData(`floors_${restaurant.id}`);
              menuResponse = { menuItems: essMenu || [] };
              floorsResponse = { floors: essFloors || [] };
              if (essMenu || essFloors) console.log('📦 Loaded data from essential_data offline cache');
            }
            // Also try pricing rules from essential_data
            const essPricing = await getEssentialData(`pricingRules_${restaurant.id}`);
            if (essPricing?.enabled) {
              setMultiPricingEnabled(true);
              setPricingRules((essPricing.rules || []).filter(r => r.isActive));
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
            floors: applyTableOverrides(fetchedFloors),
            tables: []
          });

          const dataToCache = {
            menuItems: fetchedMenuItems,
            floors: fetchedFloors,
            tablesData: { floors: fetchedFloors, tables: [] }
          };
          setCachedDashboardData(restaurant.id, dataToCache);
          // Also persist to IndexedDB for deeper offline support
          setCachedData(`dashboard_${restaurant.id}`, dataToCache).catch(() => {});
          // Save to essential_data (survives restart)
          saveEssentialData(`menu_${restaurant.id}`, fetchedMenuItems);
          saveEssentialData(`floors_${restaurant.id}`, fetchedFloors);

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
            saveEssentialData(`pricingRules_${restaurant.id}`, { enabled: mp?.enabled, rules: mp?.rules || [] });
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

  // Refresh menu when inventory/stock changes on other pages
  // Inventory mutations dispatch 'inventoryChanged' event + invalidate menu cache
  useEffect(() => {
    const handleInventoryChanged = () => {
      if (selectedRestaurant?.id) {
        loadMenu(selectedRestaurant.id);
      }
    };
    window.addEventListener('inventoryChanged', handleInventoryChanged);
    return () => window.removeEventListener('inventoryChanged', handleInventoryChanged);
  }, [selectedRestaurant?.id]);

  // Listen for restaurant changes from navigation
  useEffect(() => {
    const handleRestaurantChange = async (event) => {
      console.log('🏪 Dashboard page: Restaurant changed, reloading data', event.detail);
      setSelectedSubRestaurant(null);
      localStorage.removeItem('selectedSubRestaurantId');
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
      router.replace(window.__DINEOPEN_MOBILE_EMBED__ ? '/mobile/dashboard/bar' : '/dashboard/bar');
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
    console.log(`🪑 Updating table ${tableId} status to ${status} with orderId: ${orderId}`);

    // 1. Optimistic: update local state immediately (before API call)
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? { ...table, status, currentOrderId: orderId }
          : table
      )
    );

    // 2. Update tablesData (floors with nested tables) for DashboardTablesPanel
    setTablesData(prev => ({
      ...prev,
      floors: (prev.floors || []).map(floor => ({
        ...floor,
        tables: (floor.tables || []).map(t =>
          t.id === tableId ? { ...t, status, currentOrderId: orderId } : t
        )
      }))
    }));

    // 3. Update localStorage caches
    if (selectedRestaurant?.id) {
      try {
        const cacheKey = `floors_${selectedRestaurant.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const cache = JSON.parse(cachedData);
          cache.floors = (cache.floors || []).map(floor => ({
            ...floor,
            tables: (floor.tables || []).map(t =>
              t.id === tableId ? { ...t, status, currentOrderId: orderId } : t
            )
          }));
          localStorage.setItem(cacheKey, JSON.stringify(cache));
        }
      } catch (e) {}
      // Also update dashboardCache tables cache
      try {
        const tablesCache = getCachedTablesData(selectedRestaurant.id);
        if (tablesCache?.floors) {
          const updatedFloors = tablesCache.floors.map(floor => ({
            ...floor,
            tables: (floor.tables || []).map(t =>
              t.id === tableId ? { ...t, status, currentOrderId: orderId } : t
            )
          }));
          setCachedTablesData(selectedRestaurant.id, { floors: updatedFloors });
        }
      } catch (e) {}
    }

    // 4. Try API call (non-blocking — local state already updated)
    try {
      await apiClient.updateTableStatus(tableId, status, orderId, selectedRestaurant?.id);
    } catch (error) {
      console.warn('Table status API failed (local state updated):', error.message);
      // If online but API failed (server error), refetch to get correct state
      if (navigator.onLine && selectedRestaurant?.id) {
        prefetchTables(selectedRestaurant.id);
      }
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
      // When starting a NEW order from tables page (no orderId = not editing existing order),
      // clear the cart so stale items from previous sessions don't carry over
      const orderId = searchParams.get('orderId');
      if (!orderId) {
        setCart([]);
        setCurrentOrder(null);
        setActiveSavedOrderId(null);
        setCustomerName(''); setAssignedStaff(null);
        setCustomerMobile('');
        setCustomerData(null);
        setOrderSuccess(null);
        setOrderComplete(false);
        localStorage.removeItem('dine_cart');
      }

      setSelectedTable({
        id: tableIdParam || null,
        name: tableParam,
        floor: floorParam || null,
        floorId: searchParams.get('floorId') || null,
        capacity: capacityParam
      });
      setTableNumber(tableParam); // Auto-fill the table number input field
      setOrderType('dine-in'); // Force dine-in when table is selected

      // Track return navigation (from=tables means return to tables after order)
      const fromParam = searchParams.get('from');
      if (fromParam === 'tables') {
        setReturnToView('tables');
      }

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
        url.searchParams.delete('from');
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

  // Sub-restaurant table/floor filtering: filter by assigned floors/sections when tableMode='shared'
  const effectiveTablesData = useMemo(() => {
    if (!selectedSubRestaurant || selectedSubRestaurant.tableMode !== 'shared') {
      return tablesData;
    }
    const assignedFloorIds = selectedSubRestaurant.assignedFloorIds || [];
    const assignedSections = (selectedSubRestaurant.assignedSections || []).map(s => s.toLowerCase().trim());
    let filteredFloors = tablesData.floors || [];
    if (assignedFloorIds.length > 0) {
      filteredFloors = filteredFloors.filter(f => assignedFloorIds.includes(f.id));
    }
    if (assignedSections.length > 0 && assignedFloorIds.length === 0) {
      filteredFloors = filteredFloors.filter(f => {
        const floorSection = (f.section || f.name || '').toLowerCase().trim();
        return assignedSections.includes(floorSection);
      });
    }
    return { ...tablesData, floors: filteredFloors };
  }, [selectedSubRestaurant, tablesData]);

  const filteredItemsBase = (effectiveMenuItems).filter(item => {
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
      // Resolve true base price: the authoritative source is the menu item's
      // original price. Cart-stored basePrice can become stale or corrupted
      // (e.g. set to a pricing-rule price instead of the original), so we
      // prefer the current menu item's price when available.
      const basePrice = menuItem?.price ?? item._originalPrice ?? item.basePrice ?? item.price;
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
  // IMPORTANT: Always spread-copy each item to avoid shared object references.
  // Without copying, the re-pricing useEffect can mutate the original menu item
  // objects, causing all cart items referencing the same object to share one price.
  const filteredItems = multiPricingEnabled && activePricingRuleId
    ? filteredItemsBase.map(item => {
        const displayPrice = getItemDisplayPrice(item);
        return { ...item, price: displayPrice, _originalPrice: item.price };
      })
    : filteredItemsBase;

  const addToCart = (itemRaw) => {
    // Weight-based items: open weight popup instead of adding directly
    if (itemRaw?.soldByWeight && !itemRaw._weightConfirmed) {
      setShowWeightPopup(itemRaw);
      return;
    }

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
      setCustomerName(''); setAssignedStaff(null);
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
      // Treat empty arrays the same as undefined/null so that items loaded
      // from an order (selectedCustomizations: []) match menu-grid items
      // (selectedCustomizations: undefined) correctly.
      const variantKey = item?.selectedVariant?.name || null;
      const toppingsRaw = Array.isArray(item?.selectedCustomizations) && item.selectedCustomizations.length > 0
        ? [...item.selectedCustomizations].map(c => c.id || c.name).sort().join('|')
        : null;

      // Weight-based items never merge — each weighing is a separate line
      if (item.soldByWeight && item._weightConfirmed) {
        const cartId = `${item.id}-wt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        return [{ ...item, cartId, quantity: 1, _weightConfirmed: undefined }, ...prevCart];
      }

      // Try to find an existing cart line with same menu item and same configuration
      const existingIndex = prevCart.findIndex(ci => {
        const ciVariant = ci?.selectedVariant?.name || null;
        const ciToppings = Array.isArray(ci?.selectedCustomizations) && ci.selectedCustomizations.length > 0
          ? [...ci.selectedCustomizations].map(c => c.id || c.name).sort().join('|')
          : null;
        return ci.id === item.id && ciVariant === variantKey && ciToppings === toppingsRaw;
      });

      if (existingIndex !== -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 0) + (item.quantity || 1),
          // Update price/basePrice to latest values so that pricing rule
          // changes between repeated adds of the same item are reflected.
          price: item.price,
          basePrice: item.basePrice ?? updated[existingIndex].basePrice,
          appliedPricingRuleId: item.appliedPricingRuleId ?? updated[existingIndex].appliedPricingRuleId,
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
    // Check if this item is already in the cart with a variant/customization
    // If so, pre-select those values in the modal
    const existingCartItem = cart.find(ci => ci.id === item.id && ci.selectedVariant);
    if (existingCartItem) {
      setCustomizationInitial({
        variant: existingCartItem.selectedVariant || null,
        customizations: existingCartItem.selectedCustomizations || null,
        quantity: existingCartItem.quantity || null,
      });
    } else {
      setCustomizationInitial({ variant: null, customizations: null, quantity: null });
    }
    setSelectedItemForCustomization(item);
    setCustomizationModalOpen(true);
  };

  // Handler to close customization modal
  const handleCloseCustomizationModal = () => {
    setCustomizationModalOpen(false);
    setSelectedItemForCustomization(null);
    setCustomizationInitial({ variant: null, customizations: null, quantity: null });
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

  // Returns the effective per-unit price for a cart item (variant + customizations included)
  const getEffectiveItemPrice = (item) => {
    let base;
    if (item?.selectedVariant?.price != null) {
      base = item.selectedVariant.price;
    } else if (multiPricingEnabled && activePricingRuleId) {
      const perItemPrice = item?.pricingRules?.[activePricingRuleId];
      const parsed = perItemPrice != null ? Number(perItemPrice) : NaN;
      if (!isNaN(parsed) && parsed >= 0) {
        base = parsed;
      } else {
        base = typeof item?.basePrice === 'number' ? item.basePrice
          : typeof item?.price === 'number' ? item.price : 0;
      }
    } else {
      base = typeof item?.price === 'number' ? item.price : 0;
    }
    // Last resort: if base is still 0 and this isn't intentionally free,
    // try looking up the current menu price to avoid billing ₹0 by mistake.
    if (base === 0 && item?.id) {
      const menuItem = (menuItems || []).find(m => m.id === item.id);
      if (menuItem && typeof menuItem.price === 'number' && menuItem.price > 0) {
        base = menuItem.price;
        console.warn(`⚠️ getEffectiveItemPrice: resolved ₹0 price for "${item.name}" to menu price ₹${menuItem.price}`);
      }
    }
    const extras = Array.isArray(item?.selectedCustomizations)
      ? item.selectedCustomizations.reduce((s, c) => s + (c?.price || 0), 0)
      : (typeof item?.customizationPrice === 'number' ? item.customizationPrice : 0);
    return (base || 0) + (extras || 0);
  };

  // Builds a standardized item payload for all API calls (POST/PATCH)
  const buildItemPayload = (item) => {
    const effectivePrice = getEffectiveItemPrice(item);
    // Weight-based total: price × weight (adjusted for unit)
    let total;
    if (item.soldByWeight && item.itemWeight) {
      const weightMultiplier = item.priceUnit === 'per_100g' ? item.itemWeight / 100 : 1;
      total = effectivePrice * item.itemWeight * (item.priceUnit === 'per_100g' ? 0.01 : 1);
      // Simpler: for per_kg and per_lb, total = price * weight
      // for per_100g, price is per 100g, so total = price * (weight_in_grams / 100)
      total = item.priceUnit === 'per_100g'
        ? effectivePrice * (item.itemWeight / 100)
        : effectivePrice * item.itemWeight;
    } else {
      total = effectivePrice * (item.quantity || 1);
    }
    return {
      menuItemId: item.id,
      name: item.name,
      nameAr: item.nameAr || null,
      price: effectivePrice,
      quantity: item.quantity,
      total,
      notes: item.notes || '',
      category: item.category || '',
      categoryId: item.categoryId || null,
      taxGroupId: item.taxGroupId || null,
      selectedVariant: item.selectedVariant || null,
      selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
      basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price,
      menuPrice: typeof item.menuPrice === 'number' ? item.menuPrice : null,
      priceEdited: item.priceEdited === true,
      ...(item.appliedPricingRuleId ? { appliedPricingRuleId: item.appliedPricingRuleId } : {}),
      ...(item.isCustomItem ? { isCustomItem: true } : {}),
      // Weight-based item fields
      ...(item.soldByWeight ? {
        soldByWeight: true,
        itemWeight: item.itemWeight || 0,
        priceUnit: item.priceUnit || 'per_kg',
        weightUnit: item.weightUnit || 'kg',
      } : {}),
    };
  };

  const getTotalAmount = () => {
    const total = cart.reduce((sum, item) => {
      const price = getEffectiveItemPrice(item);
      if (item.soldByWeight && item.itemWeight) {
        const wt = item.priceUnit === 'per_100g' ? item.itemWeight / 100 : item.itemWeight;
        return sum + price * wt;
      }
      return sum + price * (item.quantity || 1);
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

  // Stable ref for menu refresh on real-time events
  const refreshMenuRef = useRef(null);
  refreshMenuRef.current = async (restaurantId) => {
    try {
      apiClient.invalidateCache(`/api/menus/${restaurantId}`);
      const menuResponse = await apiClient.getMenu(restaurantId);
      const freshMenuItems = menuResponse.menuItems || [];
      if (freshMenuItems.length > 0) {
        setMenuItems(freshMenuItems);
        setIsDemoMode(false);
        // Update caches
        const cachedData = getCachedDashboardData(restaurantId);
        if (cachedData) {
          setCachedDashboardData(restaurantId, { ...cachedData, menuItems: freshMenuItems });
        }
        saveEssentialData(`menu_${restaurantId}`, freshMenuItems);
      }
    } catch (e) {
      console.error('[Dashboard] Menu refresh failed:', e.message);
    }
  };

  // LAN Hub events for menu changes (Electron only)
  useHubEvents({
    'menu-updated': () => {
      if (selectedRestaurant?.id) refreshMenuRef.current?.(selectedRestaurant.id);
    },
    'menu-item-created': () => {
      if (selectedRestaurant?.id) refreshMenuRef.current?.(selectedRestaurant.id);
    },
    'menu-item-deleted': () => {
      if (selectedRestaurant?.id) refreshMenuRef.current?.(selectedRestaurant.id);
    },
  });

  // RTDB events path has public read access — no Firebase Auth needed
  const firebaseAuthReady = true;

  // Firebase RTDB subscription for real-time updates (replaces Pusher)
  useEffect(() => {
    if (!selectedRestaurant?.id || !database || !firebaseAuthReady) return;

    const restaurantId = selectedRestaurant.id;
    const now = Date.now();

    console.log(`📡 Dashboard: Subscribing to Firebase RTDB for restaurant '${restaurantId}'`);

    // Debounce rapid events — separate timers for table vs order events
    let tableDebounce = null;
    let orderDebounce = null;
    let menuDebounce = null;

    const debouncedTableRefresh = () => {
      if (tableDebounce) clearTimeout(tableDebounce);
      tableDebounce = setTimeout(() => prefetchTablesRef.current(restaurantId), 1000);
    };

    const debouncedOrderRefresh = () => {
      if (orderDebounce) clearTimeout(orderDebounce);
      orderDebounce = setTimeout(() => {
        prefetchTablesRef.current(restaurantId);
      }, 3000);
    };

    const debouncedMenuRefresh = () => {
      if (menuDebounce) clearTimeout(menuDebounce);
      menuDebounce = setTimeout(() => refreshMenuRef.current?.(restaurantId), 1500);
    };

    // Subscribe to orders/ path
    const ordersRef = query(ref(database, `events/${restaurantId}/orders`), orderByChild('ts'), startAt(now));
    const handleOrderEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Flood guard: after a Firebase reconnect, old events may fire in bulk.
      // Skip notifications for events older than 2 minutes to avoid flooding
      // the UI, but still trigger a debounced data refresh for staleness.
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      const isStale = eventAge > 2 * 60 * 1000;
      if (isStale) {
        console.log(`📡 Dashboard: Skipping stale event '${data.type}' (${Math.round(eventAge / 1000)}s old)`);
        debouncedOrderRefresh();
        return;
      }

      console.log(`📡 Dashboard: Received '${data.type}' event:`, data);

      if (data.type === 'order-completed' || data.type === 'order-deleted') {
        debouncedTableRefresh();
      } else if (data.type === 'order-voided') {
        debouncedOrderRefresh();
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
      } else {
        debouncedOrderRefresh();
      }
    };
    const handleRtdbError = (error) => {
      console.error(`📡 Dashboard RTDB: Subscription error for restaurant '${restaurantId}':`, error.message);
    };
    onChildAdded(ordersRef, handleOrderEvent, handleRtdbError);

    // Subscribe to tables/ path
    const tablesRef = query(ref(database, `events/${restaurantId}/tables`), orderByChild('ts'), startAt(now));
    const handleTableEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      console.log(`📡 Dashboard: Received '${data.type}' event:`, data);
      debouncedTableRefresh();
    };
    onChildAdded(tablesRef, handleTableEvent, handleRtdbError);

    // Subscribe to menu/ path
    const menuRef = query(ref(database, `events/${restaurantId}/menu`), orderByChild('ts'), startAt(now));
    const handleMenuEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      console.log(`📡 Dashboard: Received '${data.type}' event:`, data);
      debouncedMenuRefresh();
    };
    onChildAdded(menuRef, handleMenuEvent, handleRtdbError);

    // Periodic fallback: refresh menu and tables every 10 minutes.
    // Firebase RTDB events are the primary mechanism, but if the connection
    // drops silently (common in long-running Electron POS sessions), this
    // ensures menu prices and table states don't become stale.
    const periodicRefreshInterval = setInterval(() => {
      console.log(`🔄 Dashboard: Periodic background refresh (menu + tables)`);
      refreshMenuRef.current?.(restaurantId);
      prefetchTablesRef.current?.(restaurantId);
    }, 10 * 60 * 1000); // every 10 minutes

    // Cleanup on unmount
    return () => {
      if (tableDebounce) clearTimeout(tableDebounce);
      if (orderDebounce) clearTimeout(orderDebounce);
      if (menuDebounce) clearTimeout(menuDebounce);
      clearInterval(periodicRefreshInterval);
      console.log(`📡 Dashboard: Unsubscribing from Firebase RTDB`);
      off(ordersRef, 'child_added', handleOrderEvent);
      off(tablesRef, 'child_added', handleTableEvent);
      off(menuRef, 'child_added', handleMenuEvent);
    };
  }, [selectedRestaurant?.id]); // Re-subscribe when restaurant changes

  // Reset UI state for fresh order — must mirror the orderSuccess reset path
  // to prevent stale state leaking between orders in long-running sessions.
  const handleFreshOrder = () => {
    setCart([]);
    setTableNumber('');
    setCustomerName(''); setAssignedStaff(null);
    setCustomerMobile('');
    setCustomerData(null);
    setOrderLookup('');
    setCurrentOrder(null);
    setSelectedTable(null);
    setManualTableNumber('');
    setManualRoomNumber('');
    setReturnToView(null);
    setError('');
    setNotification(null);
    setOrderSuccess(null);
    setOrderComplete(false);
    setPlacingOrder(false);
    setActiveSavedOrderId(null);
    localStorage.removeItem('dine_cart');
    if (typeof window !== 'undefined') router.replace(window.__DINEOPEN_MOBILE_EMBED__ ? '/mobile/dashboard' : '/dashboard');
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
          // Refresh price from current menu for pending/active orders
          // Use variant price if variant selected, otherwise use menu price
          const menuBasePrice = matchedMenu?.price ?? price ?? 0;
          const refreshedPrice = item.selectedVariant?.price != null
            ? item.selectedVariant.price
            : menuBasePrice;
          // basePrice should reflect the variant price when variant is selected,
          // not the base menu price — this ensures correct price edit detection
          const variantPrice = item.selectedVariant?.price;
          const effectiveBasePrice = variantPrice != null
            ? variantPrice
            : (matchedMenu?.price ?? (typeof item.basePrice === 'number' ? item.basePrice : (price || 0)));

          // Build the cart item first with base menu price
          // If price was edited, preserve the edited price instead of refreshing from menu
          const cartItem = {
            id: id,
            name: matchedMenu?.name || name,
            price: item.priceEdited === true ? price : refreshedPrice,
            quantity: parseInt(item.quantity) || 1,
            category: item.category || item.menuItem?.category || matchedMenu?.category || '',
            taxGroupId: matchedMenu?.taxGroupId || item.taxGroupId || null,
            selectedVariant: item.selectedVariant || null,
            selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
            basePrice: effectiveBasePrice,
            isCustomItem: item.isCustomItem || false,
            pricingRules: matchedMenu?.pricingRules || item.pricingRules || {},
            priceEdited: item.priceEdited === true,
            menuPrice: typeof item.menuPrice === 'number' ? item.menuPrice : null,
            // Store original data for reference
            originalData: item
          };

          // Apply active pricing rule to loaded items (non-variant only)
          // so that saved orders reflect the current pricing context
          if (multiPricingEnabled && activePricingRuleId && !item.selectedVariant && !item.priceEdited) {
            const rulePrice = getItemDisplayPrice(cartItem);
            cartItem.price = rulePrice;
            cartItem.basePrice = effectiveBasePrice;
            cartItem.appliedPricingRuleId = activePricingRuleId;
          }

          return cartItem;
        }) : [];

        // If we have unknown items, try to fetch menu items and match them BEFORE setting cart
        const hasUnknownItems = orderItems.some(item => item.name === 'Unknown Item');
        if (hasUnknownItems && selectedRestaurant?.id) {
          console.log('🔍 Found unknown items, fetching menu items to match...');
          try {
            const menuResponse = await apiClient.getMenuItems(selectedRestaurant.id);
            if (menuResponse.success && menuResponse.items) {
              const updatedItems = orderItems.map(cartItem => {
                if (cartItem.name === 'Unknown Item' && !cartItem.isCustomItem) {
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
            // Restore floor/table IDs from order so updates go to the correct table
            const cd = order.customerDisplay || {};
            if (cd.tableId || order.tableId) {
              setSelectedTable({
                id: cd.tableId || order.tableId || null,
                name: order.tableNumber,
                floor: cd.floorName || order.floorName || null,
                floorId: cd.floorId || order.floorId || null,
              });
            }
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
          // Set assigned staff if available
          if (order.assignedStaff) setAssignedStaff(order.assignedStaff);
          
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
            // Use addToCart which has proper variant+customization-aware merging
            addToCart({ ...item, quantity: item.quantity || 1 });
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
        // Add items to cart — use addToCart which has proper variant+customization-aware merging
        response.items.forEach(item => {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            selectedVariant: item.selectedVariant || null,
            selectedCustomizations: item.selectedCustomizations || [],
          });
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
      couponDiscount: couponDiscAmt = null, couponCode = null, couponId = null,
      serviceChargeRate = null, serviceChargeAmount: scAmount = null, tipAmount: tipAmt = null, tipPercentage: tipPct = null,
      cashReceived = null, changeReturned = null, splitPayments: splitPay = null, splitBill: splitBillData = null, roundOffAmount: roundOff = null,
      partialPayAmount: partialPay = null, compItems: compData = null, voidItems: voidData = null, managerPin: mgrPin = null,
      deliveryInfo: deliveryInfoData = null, deliveryAddress: deliveryAddr1 = null,
      walletRedeemAmount: walletRedeem = null, walletCustomerId: walletCustId = null,
      serviceChargeEnabled: scEnabled = null, manualDiscountType: mdType = null,
      manualDiscountValue: mdValue = null, taxInclusiveMode: taxInclMode = null,
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
          items: cart.map(buildItemPayload),
          tableNumber: !isRoomOrder ? (tableToUse || currentOrder.tableNumber) : null,
          roomNumber: isRoomOrder ? (roomNumber || currentOrder.roomNumber) : null, // NEW: Include room number
          floorId: selectedTable?.floorId || null,
          floorName: selectedTable?.floor || null,
          tableId: selectedTable?.id || null,
          orderType,
          paymentMethod,
          status: 'completed', // Mark as completed
          paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : (partialPay < (finalAmount || (subtotal || getTotalAmount()) + totalTax) ? 'partial' : 'paid')) : 'paid', // Mark payment status
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
          deliveryAddress: deliveryAddr1 || null,
          // Billing feature fields
          serviceChargeRate: serviceChargeRate || null,
          serviceChargeAmount: scAmount || null,
          tipAmount: tipAmt || null,
          tipPercentage: tipPct || null,
          cashReceived: cashReceived || null,
          changeReturned: changeReturned || null,
          splitPayments: splitPay || null,
          splitBill: splitBillData || null,
          roundOffAmount: roundOff || null,
          partialPayAmount: partialPay != null ? partialPay : null,
          paidAmount: partialPay != null ? Math.round(Number(partialPay) * 100) / 100 : null,
          outstandingAmount: partialPay != null ? Math.round(((finalAmount || (subtotal || getTotalAmount()) + totalTax) - Number(partialPay)) * 100) / 100 : null,
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
          walletCustomerId: walletCustId || null,
          // Coupon fields
          couponDiscount: couponDiscAmt || null,
          couponCode: couponCode || null,
          couponId: couponId || null,
          // Extra billing fields
          manualDiscountType: mdType || null,
          manualDiscountValue: mdValue != null ? mdValue : null,
          serviceChargeEnabled: scEnabled,
          managerPin: mgrPin || null,
          taxInclusiveMode: taxInclMode || null,
          // ECR card terminal response (NAPS Qatar)
          ecrResponse: taxData.ecrResponse || null,
          lastUpdatedBy: {
            name: currentUser.name || 'Staff',
            id: currentUser.id,
            role: currentUser.role || 'waiter'
          },
          customerInfo: {
            name: customerName || currentOrder.customerInfo?.name || 'Walk-in Customer',
            phone: customerMobile || currentOrder.customerInfo?.phone || null,
            tableNumber: !isRoomOrder ? (tableToUse || currentOrder.tableNumber || null) : null,
            roomNumber: isRoomOrder ? (roomNumber || currentOrder.roomNumber || null) : null,
            floorName: selectedTable?.floor || null
          },
          customerId: customerData?.id || null,
          assignedStaff: assignedStaff || null
        };

        // If split payment, override payment method
        if (splitPay && splitPay.length > 1) {
          updateData.paymentMethod = 'split';
        }

        console.log('🔄 Update data for existing order:', updateData);

        // Optimistic: mark table as available immediately (billing completes the order)
        const billingTableName = tableToUse || currentOrder.tableNumber;
        if (billingTableName) {
          optimisticTableStatus(
            selectedTable?.id
              ? { id: selectedTable.id, name: billingTableName, floorId: selectedTable.floorId }
              : billingTableName,
            'available', null, null
          );
        }

        // OFFLINE PATH: Queue update + payment for later sync
        // Check both isOnline state AND navigator.onLine for reliability (WebKit can be slow to fire offline events)
        // Electron: skip — apiClient routes through offline engine / local SQLite
        const _isElectronBilling = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
        if ((!isOnline || !navigator.onLine) && !_isElectronBilling) {
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
              paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : 'partial') : 'completed'
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
            if (returnToView === 'tables') {
              if (selectedRestaurant?.id) prefetchTables(selectedRestaurant.id);
              setTimeout(() => {
                setViewMode('tables');
                setReturnToView(null);
                setSelectedTable(null);
                setCart([]);
                setTableNumber('');
                setCustomerName(''); setAssignedStaff(null);
                setCustomerMobile('');
                setCustomerData(null);
                localStorage.removeItem('dine_cart');
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('view', 'tables');
                  url.searchParams.delete('orderId');
                  url.searchParams.delete('mode');
                  url.searchParams.delete('from');
                  window.history.pushState({ view: 'tables' }, '', url.toString());
                }
                setTimeout(() => setOrderSuccess(null), 200);
              }, 1500);
            } else {
              handleOrderActionComplete({ keepOrderSuccess: true, hasTable: !!(tableToUse || currentOrder.tableNumber) });
            }
          } catch (offErr) {
            setNotification({ type: 'error', title: t('dashboard.saveFailed'), message: t('dashboard.couldNotSaveBillingLocally'), show: true });
            setTimeout(() => setNotification(null), 4000);
          }
          setProcessing(false);
          return;
        }

        const response = await apiClient.updateOrder(currentOrder.id, updateData);

        // Cloud returns { message, data: { orderId } }, Electron local fallback returns { order, success }
        if (response?.data || response?.success) {
          // Process payment for the updated order
          // Backend only accepts 'cash', 'card', 'upi' — normalize split/other methods
          const _billingMethod = splitPay ? (splitPay[0]?.method || 'cash') : paymentMethod;
          const _safeMethod = ['cash', 'card', 'upi'].includes(_billingMethod) ? _billingMethod : 'cash';
          console.log('💳 Processing payment for updated order:', currentOrder.id);
          await apiClient.verifyPayment({
            orderId: currentOrder.id,
            paymentMethod: _safeMethod,
            amount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : 'partial') : 'completed'
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
          // If coming from tables view, delay the switch so auto-print can fire first
          if (returnToView === 'tables') {
            // Refresh tables data
            if (selectedRestaurant?.id) prefetchTables(selectedRestaurant.id);
            setTimeout(() => {
              if (selectedTable?.id) setRecentlyUpdatedTableId(selectedTable.id);
              setViewMode('tables');
              setCart([]);
              setTableNumber('');
              setCustomerName(''); setAssignedStaff(null);
              setCustomerMobile('');
              setCustomerData(null);
              setManualTableNumber('');
              setManualRoomNumber('');
              setOrderLookup('');
              setReturnToView(null);
              setSelectedTable(null);
              localStorage.removeItem('dine_cart');
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('view', 'tables');
                url.searchParams.delete('orderId');
                url.searchParams.delete('mode');
                url.searchParams.delete('from');
                window.history.pushState({ view: 'tables' }, '', url.toString());
              }
              setTimeout(() => setOrderSuccess(null), 200);
            }, 1500);
          } else {
            handleOrderActionComplete({
              keepOrderSuccess: true,
              hasTable: !!(tableToUse || currentOrder.tableNumber)
            });
          }

          // Return orderId so OrderSummary can generate the invoice
          return { orderId: completedOrderId };
        } else {
          console.error('Billing update: unexpected response format', response);
          setNotification({ type: 'error', title: 'Update Failed', message: 'Order update returned an unexpected response. Please try again.', show: true });
          setTimeout(() => setNotification(null), 5000);
          setProcessing(false);
          return;
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
          floorId: selectedTable?.floorId || null,
          floorName: selectedTable?.floor || null,
          tableId: selectedTable?.id || null,
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
        items: cart.map(buildItemPayload),
        customerInfo: {
            name: customerName || 'Walk-in Customer',
            phone: customerMobile || null,
            tableNumber: finalTableNumber || null,
            roomNumber: roomNumber || null,
            floorName: selectedTable?.floor || null
        },
        customerId: customerData?.id || null,
        assignedStaff: assignedStaff || null,
        // Tax information from OrderSummary
        totalAmount: subtotal || getTotalAmount(),
        taxBreakdown: taxBreakdown,
        taxAmount: totalTax,
        finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
        // Discount fields
        offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
        manualDiscount: manualDiscount || 0,
        manualDiscountType: mdType || null,
        manualDiscountValue: mdValue != null ? mdValue : null,
        discountAmount: offerDiscountAmt || 0,
        offerDiscount: offerDiscountAmt || 0,
        totalDiscountAmount: discountTotal || 0,
        selectedOfferName: offerName || null,
        // Loyalty fields
        redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
        loyaltyDiscount: loyaltyDiscAmt || 0,
        walletRedeemAmount: walletRedeem || null,
        walletCustomerId: walletCustId || null,
        // Coupon fields
        couponDiscount: couponDiscAmt || null,
        couponCode: couponCode || null,
        couponId: couponId || null,
        customerPhone: customerMobile || null,
        // Special instructions for kitchen
        specialInstructions: specialInstructions || null,
        notes: isRoomOrder ? `Room order for Room ${roomNumber}` : '',
        // Delivery info
        deliveryInfo: deliveryInfoData || null,
        deliveryAddress: deliveryAddr1 || null,
        // Multi-tier pricing rule
        pricingRuleId: activePricingRuleId || null,
        // Billing feature fields
        serviceChargeRate: serviceChargeRate || null,
        serviceChargeAmount: scAmount || null,
        serviceChargeEnabled: scEnabled,
        tipAmount: tipAmt || null,
        tipPercentage: tipPct || null,
        cashReceived: cashReceived || null,
        changeReturned: changeReturned || null,
        splitPayments: splitPay || null,
        roundOffAmount: roundOff || null,
        partialPayAmount: partialPay != null ? partialPay : null,
        paidAmount: partialPay != null ? Math.round(Number(partialPay) * 100) / 100 : null,
        outstandingAmount: partialPay != null ? Math.round(((finalAmount || (subtotal || getTotalAmount()) + totalTax) - Number(partialPay)) * 100) / 100 : null,
        compItems: compData || null,
        voidItems: voidData || null,
        managerPin: mgrPin || null,
        taxInclusiveMode: taxInclMode || null,
        // ECR card terminal response (NAPS Qatar)
        ecrResponse: taxData.ecrResponse || null,
        ...(isScheduledOrder && scheduledDate && scheduledTime ? {
          isScheduled: true,
          scheduledFor: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
        } : {}),
        // Sub-restaurant
        subRestaurantId: selectedSubRestaurant?.id || null,
        subRestaurantName: selectedSubRestaurant?.name || null,
      };

        // If split payment, override payment method
        if (splitPay && splitPay.length > 1) {
          orderData.paymentMethod = 'split';
        }

        console.log('🛒 Creating order with data:', orderData);

        // Optimistic: mark table as available immediately (direct billing = completed order)
        const newBillingTableName = finalTableNumber || tableToUse;
        if (newBillingTableName) {
          optimisticTableStatus(
            selectedTable?.id
              ? { id: selectedTable.id, name: newBillingTableName, floorId: selectedTable.floorId }
              : newBillingTableName,
            'available', null, null
          );
        }

        // OFFLINE PATH: Queue order + payment for later sync
        // Electron: skip — apiClient routes through offline engine / local SQLite
        const _isElectronNewBilling = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
        if ((!isOnline || !navigator.onLine) && !_isElectronNewBilling) {
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
              paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : 'partial') : 'completed'
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
            if (returnToView === 'tables') {
              if (selectedRestaurant?.id) prefetchTables(selectedRestaurant.id);
              setTimeout(() => {
                setViewMode('tables');
                setReturnToView(null);
                setSelectedTable(null);
                setCart([]);
                setTableNumber('');
                setCustomerName(''); setAssignedStaff(null);
                setCustomerMobile('');
                setCustomerData(null);
                localStorage.removeItem('dine_cart');
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('view', 'tables');
                  url.searchParams.delete('orderId');
                  url.searchParams.delete('mode');
                  url.searchParams.delete('from');
                  window.history.pushState({ view: 'tables' }, '', url.toString());
                }
                setTimeout(() => setOrderSuccess(null), 200);
              }, 1500);
            } else {
              handleOrderActionComplete({ keepOrderSuccess: true, hasTable: !!(tableToUse || selectedTable?.number) });
            }
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
            paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : 'partial') : 'completed'
          });
          console.log('✅ Cash payment verified:', paymentResult);
      } else if (paymentMethod === 'upi') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'upi',
            amount: paymentAmount,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : 'partial') : 'completed'
          });
          console.log('✅ UPI payment verified:', paymentResult);
      } else if (paymentMethod === 'card') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'card',
            amount: paymentAmount,
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: partialPay != null ? (partialPay === 0 ? 'due' : 'partial') : 'completed'
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
      // If coming from tables view, delay the switch so auto-print can fire first
      if (returnToView === 'tables') {
        if (selectedRestaurant?.id) prefetchTables(selectedRestaurant.id);
        setTimeout(() => {
          if (selectedTable?.id) setRecentlyUpdatedTableId(selectedTable.id);
          setViewMode('tables');
          setCart([]);
          setTableNumber('');
          setCustomerName(''); setAssignedStaff(null);
          setCustomerMobile('');
          setCustomerData(null);
          setManualTableNumber('');
          setManualRoomNumber('');
          setOrderLookup('');
          setReturnToView(null);
          setSelectedTable(null);
          localStorage.removeItem('dine_cart');
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('view', 'tables');
            url.searchParams.delete('orderId');
            url.searchParams.delete('mode');
            url.searchParams.delete('from');
            window.history.pushState({ view: 'tables' }, '', url.toString());
          }
          setTimeout(() => setOrderSuccess(null), 200);
        }, 1500);
      } else {
        const hadTable = !!(tableToUse || selectedTable?.number);
        handleOrderActionComplete({
          keepOrderSuccess: true,
          hasTable: hadTable
        });
      }

        // Return order ID for invoice generation
        return { orderId };
      }

      // Background refresh tables view data if order tied to a table
      if (tableToUse) {
        prefetchTables(selectedRestaurant.id);
      }

    } catch (error) {
      console.error('Order processing error:', error);

      // Revert optimistic table status — mark back as occupied since billing failed
      const revertTableName = tableToUse || currentOrder?.tableNumber || selectedTable?.name;
      if (revertTableName) {
        optimisticTableStatus(
          selectedTable?.id
            ? { id: selectedTable.id, name: revertTableName, floorId: selectedTable.floorId }
            : revertTableName,
          'occupied', currentOrder?.id || null, null
        );
      }

      // If this is a network error (offline), try to queue the billing offline
      // Electron: also allow IndexedDB fallback — the local SQLite path may have failed
      const isNetworkError = !navigator.onLine || error.message?.includes('Load failed') || error.message?.includes('Failed to fetch') || error.message?.includes('Network');
      if (isNetworkError && offlineEnabled) {
        try {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const billingData = {
            items: cart.map(buildItemPayload),
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

      setProcessing(false); // Only reset on error so user can retry
      return null;
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
        // Refresh price from current menu to avoid stale pricing
        const refreshedPrice = item.selectedVariant?.price != null
          ? item.selectedVariant.price
          : (matchedMenu?.price ?? item.price);
        // basePrice should reflect variant price when variant is selected
        const savedVariantPrice = item.selectedVariant?.price;
        const savedBasePrice = savedVariantPrice != null
          ? savedVariantPrice
          : (matchedMenu?.price ?? item.basePrice ?? item.price);
        return {
          id: itemId,
          name: matchedMenu?.name || item.name,
          price: refreshedPrice,
          quantity: item.quantity || 1,
          image: item.image || null,
          shortCode: item.shortCode || '',
          notes: item.notes || '',
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: item.selectedCustomizations || [],
          basePrice: savedBasePrice,
          isCustomItem: item.isCustomItem || false,
          category: item.category || matchedMenu?.category || '',
          taxGroupId: matchedMenu?.taxGroupId || item.taxGroupId || null,
          pricingRules: matchedMenu?.pricingRules || item.pricingRules || {},
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
        setCustomerName(''); setAssignedStaff(null);
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
        items: cart.map(buildItemPayload),
        customerInfo: {
          name: customerName || null,
          phone: customerMobile || null,
        },
        customerId: customerData?.id || null,
        assignedStaff: assignedStaff || null,
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
          setCustomerName(''); setAssignedStaff(null);
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
        setCustomerName(''); setAssignedStaff(null);
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
        setCustomerName(''); setAssignedStaff(null);
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
        items: cart.map(buildItemPayload),
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
      const { taxBreakdown = [], totalTax = 0, finalAmount, subtotal, specialInstructions,
        offerIds = [], manualDiscount = 0, offerDiscount: offerDiscountAmt = 0, selectedOfferName: offerName = '', totalDiscountAmount: discountTotal = 0,
        redeemLoyaltyPoints = 0, loyaltyDiscount: loyaltyDiscAmt = 0,
        couponDiscount: couponDiscAmt = null, couponCode = null, couponId = null,
        serviceChargeRate = null, serviceChargeAmount: scAmount = null, tipAmount: tipAmt = null, tipPercentage: tipPct = null,
        cashReceived = null, changeReturned = null, splitPayments: splitPay = null, splitBill: splitBillData = null, roundOffAmount: roundOff = null,
        partialPayAmount: partialPay = null, compItems: compData = null, voidItems: voidData = null, managerPin: mgrPin = null,
        deliveryInfo: deliveryInfoData, deliveryAddress: deliveryAddr, walletRedeemAmount: walletRedeem } = taxData;
      const tableToUse = tableNumber || selectedTable?.number || currentOrder.tableNumber;

      const updateData = {
        items: cart.map(buildItemPayload),
        tableNumber: tableToUse || currentOrder.tableNumber,
        floorId: selectedTable?.floorId || null,
        floorName: selectedTable?.floor || null,
        tableId: selectedTable?.id || null,
        orderType,
        paymentMethod: splitBillData ? 'split-bill' : paymentMethod,
        totalAmount: subtotal || getTotalAmount(),
        taxBreakdown: taxBreakdown,
        taxAmount: totalTax,
        finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
        // Discount & billing fields
        manualDiscount: manualDiscount || 0,
        manualDiscountType: taxData.manualDiscountType || null,
        manualDiscountValue: taxData.manualDiscountValue != null ? taxData.manualDiscountValue : null,
        offerIds: offerIds || [],
        discountAmount: offerDiscountAmt || 0,
        offerDiscount: offerDiscountAmt || 0,
        selectedOfferName: offerName || null,
        totalDiscountAmount: discountTotal || 0,
        redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
        loyaltyDiscount: loyaltyDiscAmt || 0,
        couponDiscount: couponDiscAmt || null,
        couponCode: couponCode || null,
        couponId: couponId || null,
        serviceChargeRate: serviceChargeRate || null,
        serviceChargeAmount: scAmount || null,
        serviceChargeEnabled: taxData.serviceChargeEnabled != null ? taxData.serviceChargeEnabled : null,
        tipAmount: tipAmt || null,
        tipPercentage: tipPct || null,
        cashReceived: cashReceived || null,
        changeReturned: changeReturned || null,
        splitPayments: splitPay || null,
        splitBill: splitBillData || null,
        roundOffAmount: roundOff || null,
        partialPayAmount: partialPay != null ? partialPay : null,
        compItems: compData || null,
        voidItems: voidData || null,
        managerPin: mgrPin || null,
        specialInstructions: specialInstructions || null,
        deliveryInfo: deliveryInfoData || null,
        deliveryAddress: deliveryAddr || null,
        walletRedeemAmount: walletRedeem || null,
        walletCustomerId: taxData.walletCustomerId || null,
        taxInclusiveMode: taxData.taxInclusiveMode || null,
        customerId: customerData?.id || currentOrder.customerId || null,
        customerInfo: {
          name: customerName || currentOrder.customerInfo?.name || 'Walk-in Customer',
          phone: customerMobile || currentOrder.customerInfo?.phone || null,
          tableNumber: tableToUse || currentOrder.tableNumber || null,
        },
        skipKOT: true,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: (() => {
          try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            return { name: u.name || u.username || 'Staff Member', id: u.id || u._id || 'unknown' };
          } catch { return { name: 'Staff Member', id: 'unknown' }; }
        })()
      };

      const response = await apiClient.updateOrder(currentOrder.id, updateData);

      // Cloud returns { message, data: { orderId } }, Electron local fallback returns { order, success }
      if (response?.data || response?.success) {
        setNotification({
          type: 'success',
          title: '✅ Order Updated',
          message: `Order #${currentOrder.dailyOrderId || currentOrder.id.slice(-6)} updated without KOT`,
          show: true
        });

        setCurrentOrder(null);
        setActiveSavedOrderId(null);
        fetchSavedOrders();
        // If came from tables, switch back after a brief delay
        if (returnToView === 'tables') {
          if (selectedRestaurant?.id) prefetchTables(selectedRestaurant.id);
          setTimeout(() => {
            setViewMode('tables');
            setReturnToView(null);
            setSelectedTable(null);
            setCart([]);
            setTableNumber('');
            setCustomerName(''); setAssignedStaff(null);
            setCustomerMobile('');
            setCustomerData(null);
            localStorage.removeItem('dine_cart');
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.set('view', 'tables');
              url.searchParams.delete('orderId');
              url.searchParams.delete('mode');
              url.searchParams.delete('from');
              window.history.pushState({ view: 'tables' }, '', url.toString());
            }
          }, 500);
        } else {
          handleOrderActionComplete({
            keepOrderSuccess: false,
            hasTable: !!(tableNumber || selectedTable?.number),
            keepTable: true,
          });
        }
      } else {
        console.error('Update without KOT: unexpected response format', response);
        setNotification({ type: 'error', title: 'Update Failed', message: 'Order update returned an unexpected response. Please try again.', show: true });
        setTimeout(() => setNotification(null), 5000);
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
      couponDiscount: couponDiscAmt = null, couponCode = null, couponId = null,
      serviceChargeRate = null, serviceChargeAmount: scAmount = null, tipAmount: tipAmt = null, tipPercentage: tipPct = null,
      cashReceived = null, changeReturned = null, splitPayments: splitPay = null, splitBill: splitBillData = null, roundOffAmount: roundOff = null,
      fullDue: isFullDue = false,
      partialPayAmount: partialPay = null, compItems: compData = null, voidItems: voidData = null, managerPin: mgrPin = null,
      deliveryInfo: deliveryInfoData = null, deliveryAddress: deliveryAddr2 = null,
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
          items: cart.map(buildItemPayload),
          tableNumber: tableToUse || currentOrder.tableNumber,
          floorId: selectedTable?.floorId || null,
          floorName: selectedTable?.floor || null,
          tableId: selectedTable?.id || null,
          orderType,
          paymentMethod: splitBillData ? 'split-bill' : paymentMethod,
          // Tax information from OrderSummary
          totalAmount: subtotal || getTotalAmount(),
          taxBreakdown: taxBreakdown,
          taxAmount: totalTax,
          finalAmount: finalAmount || (subtotal || getTotalAmount()) + totalTax,
          // Discount & billing fields
          manualDiscount: manualDiscount || 0,
          manualDiscountType: taxData.manualDiscountType || null,
          manualDiscountValue: taxData.manualDiscountValue != null ? taxData.manualDiscountValue : null,
          offerIds: offerIds || [],
          discountAmount: offerDiscountAmt || 0,
          offerDiscount: offerDiscountAmt || 0,
          selectedOfferName: offerName || null,
          totalDiscountAmount: discountTotal || 0,
          redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
          loyaltyDiscount: loyaltyDiscAmt || 0,
          couponDiscount: couponDiscAmt || null,
          couponCode: couponCode || null,
          couponId: couponId || null,
          // Service charge
          serviceChargeRate: serviceChargeRate || null,
          serviceChargeAmount: scAmount || null,
          serviceChargeEnabled: taxData.serviceChargeEnabled != null ? taxData.serviceChargeEnabled : null,
          // Tip & rounding
          tipAmount: tipAmt || null,
          tipPercentage: tipPct || null,
          cashReceived: cashReceived || null,
          changeReturned: changeReturned || null,
          splitPayments: splitPay || null,
          splitBill: splitBillData || null,
          roundOffAmount: roundOff || null,
          partialPayAmount: partialPay != null ? partialPay : null,
          compItems: compData || null,
          voidItems: voidData || null,
          managerPin: mgrPin || null,
          // Special instructions for kitchen
          specialInstructions: specialInstructions || null,
          // Delivery info
          deliveryInfo: deliveryInfoData || null,
          deliveryAddress: deliveryAddr2 || null,
          walletRedeemAmount: walletRedeem || null,
          walletCustomerId: walletCustId || null,
          taxInclusiveMode: taxData.taxInclusiveMode || null,
          customerId: customerData?.id || currentOrder.customerId || null,
          customerInfo: {
            name: customerName || currentOrder.customerInfo?.name || 'Walk-in Customer',
            phone: customerMobile || currentOrder.customerInfo?.phone || null,
            tableNumber: tableToUse || currentOrder.tableNumber || null,
          },
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: (() => {
            try {
              const u = JSON.parse(localStorage.getItem('user') || '{}');
              return { name: u.name || u.username || 'Staff Member', id: u.id || u._id || 'unknown' };
            } catch { return { name: 'Staff Member', id: 'unknown' }; }
          })(),
          assignedStaff: assignedStaff || null
        };

        const response = await apiClient.updateOrder(currentOrder.id, updateData);

        // Cloud returns { message, data: { orderId } }, Electron local fallback returns { order, success }
        if (response?.data || response?.success) {
          // Compute new/changed items for incremental KOT display
          const existingItemsArr = currentOrder.items || [];
          // Use composite key (menuItemId + variant + customizations) so Half/Full
          // of the same item are tracked as separate line items for KOT
          const existingItemMap = new Map(existingItemsArr.map(i => [getOrderItemKey(i), i]));
          const cartItemKeys = new Set(cart.map(i => getOrderItemKey(i)));

          const newItems = cart.filter(item => !existingItemMap.has(getOrderItemKey(item)));
          const updatedItems = cart.filter(item => {
            const existing = existingItemMap.get(getOrderItemKey(item));
            return existing && existing.quantity !== item.quantity;
          });
          const incrementalItems = [...newItems, ...updatedItems];

          // Detect removed items for KOT
          const removedKotItems = existingItemsArr
            .filter(existing => !cartItemKeys.has(getOrderItemKey(existing)))
            .map(item => ({
              name: item.name, quantity: item.quantity, notes: item.notes || '',
              selectedVariant: item.selectedVariant || null,
              selectedCustomizations: item.selectedCustomizations || [],
              isRemoved: true,
            }));

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
              items: filterKotExcludedItems(incrementalItems.length > 0 ? incrementalItems : cart, printSettings).map(item => {
                const isNew = newItems.includes(item);
                const isUpdated = updatedItems.includes(item);
                const existing = isUpdated ? existingItemMap.get(item.id) : null;
                const quantityDelta = existing ? (item.quantity - existing.quantity) : 0;
                return {
                  name: item.name,
                  quantity: isUpdated && quantityDelta > 0 ? quantityDelta : (item.quantity || 1),
                  notes: item.notes || '',
                  selectedVariant: item.selectedVariant || null,
                  selectedCustomizations: item.selectedCustomizations || [],
                  isNew,
                  isUpdated,
                  quantityDelta: isUpdated ? quantityDelta : 0,
                  previousQuantity: existing ? existing.quantity : 0,
                };
              }),
              removedItems: removedKotItems,
              isIncremental: incrementalItems.length > 0 || removedKotItems.length > 0,
              tableNumber: roomForKot ? null : tableToUseForKot,
              roomNumber: roomForKot || null,
              floorName: selectedTable?.floor || null,
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
          // If came from tables, delay switch so auto-print can fire first
          if (returnToView === 'tables') {
            if (selectedRestaurant?.id) prefetchTables(selectedRestaurant.id);
            setTimeout(() => {
              if (selectedTable?.id) setRecentlyUpdatedTableId(selectedTable.id);
              setViewMode('tables');
              setCart([]);
              setTableNumber('');
              setCustomerName(''); setAssignedStaff(null);
              setCustomerMobile('');
              setCustomerData(null);
              setManualTableNumber('');
              setManualRoomNumber('');
              setOrderLookup('');
              setReturnToView(null);
              setSelectedTable(null);
              localStorage.removeItem('dine_cart');
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('view', 'tables');
                url.searchParams.delete('orderId');
                url.searchParams.delete('mode');
                url.searchParams.delete('from');
                window.history.pushState({ view: 'tables' }, '', url.toString());
              }
              setTimeout(() => setOrderSuccess(null), 200);
            }, 1500);
          } else {
            handleOrderActionComplete({
              keepOrderSuccess: true,
              hasTable: !!(tableNumber || selectedTable?.number),
              keepTable: true,
            });
          }
        } else {
          // Update API returned unexpected response — show error instead of silently doing nothing
          console.error('Update & KOT: unexpected response format', response);
          setNotification({ type: 'error', title: 'Update Failed', message: 'Order update returned an unexpected response. Please try again.', show: true });
          setTimeout(() => setNotification(null), 5000);
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
          floorId: selectedTable?.floorId || null,
          floorName: selectedTable?.floor || null,
          tableId: selectedTable?.id || null,
          items: cart.map(buildItemPayload),
          customerInfo: {
            name: customerName || null,
            phone: customerMobile || null,
            tableNumber: finalTableNumber || null,
            roomNumber: roomNumber || null,
            floorName: selectedTable?.floor || null
          },
          customerId: customerData?.id || null,
          assignedStaff: assignedStaff || null,
          orderType,
          paymentMethod: splitBillData ? 'split-bill' : paymentMethod,
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
          manualDiscountType: taxData.manualDiscountType || null,
          manualDiscountValue: taxData.manualDiscountValue != null ? taxData.manualDiscountValue : null,
          discountAmount: offerDiscountAmt || 0,
          offerDiscount: offerDiscountAmt || 0,
          selectedOfferName: offerName || null,
          totalDiscountAmount: discountTotal || 0,
          redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
          loyaltyDiscount: loyaltyDiscAmt || 0,
          couponDiscount: couponDiscAmt || null,
          couponCode: couponCode || null,
          couponId: couponId || null,
          walletRedeemAmount: walletRedeem || null,
          walletCustomerId: walletCustId || null,
          customerPhone: customerMobile || null,
          // Special instructions for kitchen
          specialInstructions: specialInstructions || null,
          notes: isRoomOrder ? `Room order for Room ${roomNumber}` : '',
          // Delivery info
          deliveryInfo: deliveryInfoData || null,
          deliveryAddress: deliveryAddr2 || null,
          status: 'confirmed', // Place order to kitchen
          // Multi-tier pricing rule
          pricingRuleId: activePricingRuleId || null,
          // Billing feature fields
          serviceChargeRate: serviceChargeRate || null,
          serviceChargeAmount: scAmount || null,
          serviceChargeEnabled: taxData.serviceChargeEnabled != null ? taxData.serviceChargeEnabled : null,
          tipAmount: tipAmt || null,
          tipPercentage: tipPct || null,
          cashReceived: cashReceived || null,
          changeReturned: changeReturned || null,
          splitPayments: splitPay || null,
          splitBill: splitBillData || null,
          roundOffAmount: roundOff || null,
          fullDue: isFullDue || false,
          partialPayAmount: partialPay != null ? partialPay : null,
          paidAmount: partialPay != null ? Math.round(Number(partialPay) * 100) / 100 : null,
          outstandingAmount: partialPay != null ? Math.round(((finalAmount || (subtotal || getTotalAmount()) + totalTax) - Number(partialPay)) * 100) / 100 : null,
          paymentStatus: isFullDue ? 'due' : (partialPay != null && partialPay > 0 && partialPay < (finalAmount || (subtotal || getTotalAmount()) + totalTax) ? 'partial' : null),
          compItems: compData || null,
          voidItems: voidData || null,
          managerPin: mgrPin || null,
          taxInclusiveMode: taxData.taxInclusiveMode || null,
          ...(isScheduledOrder && scheduledDate && scheduledTime ? {
            isScheduled: true,
            scheduledFor: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
          } : {}),
          // Sub-restaurant
          subRestaurantId: selectedSubRestaurant?.id || null,
          subRestaurantName: selectedSubRestaurant?.name || null,
        };

        // If split payment, override payment method
        if (splitPay && splitPay.length > 1) {
          orderData.paymentMethod = 'split';
        }

        console.log('Creating order with data:', orderData);

        // OFFLINE PATH: If offline, queue to IndexedDB (web) or let Electron handle via SQLite
        // Electron: skip this block — apiClient routes through offline engine / local SQLite
        const _isElectronApp = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
        if ((!isOnline || !navigator.onLine) && !_isElectronApp) {
          if (!offlineEnabled) {
            setNotification({ type: 'error', title: t('dashboard.noInternet'), message: t('dashboard.offlineMsg'), show: true });
            setTimeout(() => setNotification(null), 4000);
            setPlacingOrder(false);
            return;
          }
          try {
            const cartKotItemsOffline = filterKotExcludedItems(cart, printSettings).map(item => ({ name: item.name, quantity: item.quantity || 1, notes: item.notes || '', selectedVariant: item.selectedVariant || null, selectedCustomizations: item.selectedCustomizations || [] }));
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
                floorName: selectedTable?.floor || null,
                customerName: customerName || null,
                orderType,
                restaurantName: selectedRestaurant?.name || 'Restaurant',
                specialInstructions: specialInstructions || null
              }
            });
            setActiveSavedOrderId(null);
            handleOrderActionComplete({
              keepOrderSuccess: true,
              hasTable: !!(tableNumber || selectedTable?.number),
              keepTable: true,
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

        // ONLINE PATH: Wait for API, then show success + auto-print, then return to tables
        const cartBackup = [...cart];
        const cartKotItems = filterKotExcludedItems(cart, printSettings).map(item => ({ name: item.name, quantity: item.quantity || 1, notes: item.notes || '', selectedVariant: item.selectedVariant || null, selectedCustomizations: item.selectedCustomizations || [] }));
        const savedTableNumber = roomNumber ? null : (finalTableNumber || null);
        const savedRoomNumber = roomNumber || null;
        const savedCustomerName = customerName || null;
        const savedRestaurantName = selectedRestaurant?.name || 'Restaurant';
        const savedSpecialInstructions = specialInstructions || null;
        const savedActiveSavedOrderId = activeSavedOrderId;
        const savedReturnToView = returnToView; // Capture before clearing
        const savedTableIdentifier = selectedTable?.id
          ? { id: selectedTable.id, name: savedTableNumber, floorId: selectedTable.floorId }
          : null;
        const savedFloorName = selectedTable?.floor || null;

        // Optimistic: mark table as occupied immediately (visual feedback on tables panel)
        if (savedTableNumber) {
          optimisticTableStatus(
            savedTableIdentifier || savedTableNumber,
            'occupied', null, orderData.finalAmount || 0
          );
        }

        // Show processing indicator (KOT summary without orderId — auto-print won't fire yet)
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
            floorName: savedFloorName,
            customerName: savedCustomerName,
            orderType,
            restaurantName: savedRestaurantName,
            specialInstructions: savedSpecialInstructions
          }
        });

        // Clear cart immediately for fast next-order flow, but DON'T switch view yet
        // (OrderSummary must remain mounted for auto-print to work)
        setCart([]);
        setActiveSavedOrderId(null);
        setCurrentOrder(null);
        localStorage.removeItem('dine_cart');

        // Fire API call
        try {
          const response = await apiClient.createOrder(orderData);
          console.log('Create order response:', response);

          const _orderObj = response.order || response;
          const _orderId = _orderObj?.id || _orderObj?.orderId || orderData.idempotencyKey;
          const _dailyOrderId = _orderObj?.dailyOrderId || null;
          if (_orderId || response.success) {
            console.log(`✅ Order created with status=confirmed. Table ${tableNumber || 'N/A'} managed by backend.`);

            // Update optimistic table with real orderId so table card buttons work
            if (savedTableNumber) {
              optimisticTableStatus(savedTableIdentifier || savedTableNumber, 'occupied', _orderId, orderData.finalAmount || 0);
            }

            // Background refresh tables
            if (tableNumber || selectedTable?.number) {
              prefetchTables(selectedRestaurant?.id);
            }

            // Update notification with real order ID
            setNotification({
              type: 'success',
              title: t('dashboard.orderSentToChefEmoji'),
              message: t('dashboard.orderSentToChefSuccessMsg', { id: _dailyOrderId || (_orderId || '').slice?.(-6) || '' }),
              show: true
            });

            // Update KOT summary with real IDs — this triggers auto-print in OrderSummary
            setOrderSuccess({
              orderId: _orderId,
              dailyOrderId: _dailyOrderId,
              show: true,
              processing: false,
              message: t('dashboard.orderPlacedToKitchen'),
              kotData: {
                orderId: _orderId,
                dailyOrderId: _dailyOrderId,
                items: cartKotItems,
                tableNumber: savedTableNumber,
                roomNumber: savedRoomNumber,
                floorName: savedFloorName,
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
                  orderId: _orderId,
                  notes: `Redeemed during billing for order #${_dailyOrderId || (_orderId || '').slice?.(-6) || ''}`
                });
                console.log('💰 Wallet redeemed:', walletRedeem);
              } catch (walletErr) {
                console.error('Wallet redemption failed (non-blocking):', walletErr);
              }
            }

            setTimeout(() => setNotification(null), 4000);

            // Return to tables view AFTER auto-print has had time to fire
            // Auto-print effect in OrderSummary triggers on orderSuccess.kotData change with ~800ms delay
            if (savedReturnToView === 'tables') {
              setTimeout(() => {
                if (selectedTable?.id) {
                  setRecentlyUpdatedTableId(selectedTable.id);
                }
                // Don't use switchView here — it clears orderSuccess which kills auto-print
                setViewMode('tables');
                setTableNumber('');
                setCustomerName(''); setAssignedStaff(null);
                setCustomerMobile('');
                setCustomerData(null);
                setManualTableNumber('');
                setManualRoomNumber('');
                setOrderLookup('');
                setReturnToView(null);
                setSelectedTable(null);
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('view', 'tables');
                  url.searchParams.delete('orderId');
                  url.searchParams.delete('mode');
                  url.searchParams.delete('from');
                  window.history.pushState({ view: 'tables' }, '', url.toString());
                }
                // Clear orderSuccess after switching (auto-print already fired)
                setTimeout(() => setOrderSuccess(null), 200);
              }, 1500);
            } else {
              // Not from tables — just clear state normally
              handleOrderActionComplete({
                keepOrderSuccess: true,
                hasTable: !!(tableNumber || selectedTable?.number),
                keepTable: true,
              });
            }
          } else {
            console.error('Order API returned no order object:', response);
          }
        } catch (apiError) {
          console.error('Order API call failed:', apiError);

          // Electron: the normal API path failed. Use the emergency direct save to SQLite.
          // Also queue to IndexedDB as a safety net — it worked before and ensures
          // the order syncs to cloud even if SQLite save fails.
          const _isElectronCatch = typeof window !== 'undefined' && !!window.electronAPI?.saveOrderDirect;
          if (_isElectronCatch) {
            console.log('[Electron] Normal API path failed, using saveOrderDirect emergency fallback');
            let directSaveOk = false;
            try {
              const directResult = await window.electronAPI.saveOrderDirect(orderData);
              console.log('[Electron] saveOrderDirect result:', directResult);
              directSaveOk = directResult?.success === true;
            } catch (directErr) {
              console.error('[Electron] saveOrderDirect also failed:', directErr);
            }
            // Also queue to IndexedDB as safety net (so order syncs when online even if SQLite failed)
            if (!directSaveOk) {
              try {
                if (typeof queueOfflineOrder === 'function' && offlineEnabled) {
                  await queueOfflineOrder(orderData);
                  console.log('[Electron] Fallback: order queued to IndexedDB');
                }
              } catch (iqErr) {
                console.error('[Electron] IndexedDB fallback also failed:', iqErr);
              }
            }
            // Set a local orderId so KOT auto-print triggers (it skips if orderId is null)
            const localOrderId = orderData.idempotencyKey || 'local';
            setOrderSuccess(prev => prev ? {
              ...prev,
              processing: false,
              orderId: prev.orderId || localOrderId,
              kotData: prev.kotData ? { ...prev.kotData, orderId: prev.kotData.orderId || localOrderId } : prev.kotData
            } : prev);
            setNotification({
              type: 'success',
              title: t('dashboard.orderSentToChefEmoji'),
              message: directSaveOk ? 'Order saved locally. Will sync when online.' : 'Order queued. Will sync when online.',
              show: true
            });
            // Background refresh tables from local DB
            if (tableNumber || selectedTable?.number) {
              prefetchTables(selectedRestaurant?.id);
            }
            setTimeout(() => setNotification(null), 4000);
            // Return to tables if came from there
            if (savedReturnToView === 'tables') {
              setTimeout(() => {
                setViewMode('tables');
                setReturnToView(null);
                setSelectedTable(null);
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('view', 'tables');
                  window.history.pushState({ view: 'tables' }, '', url.toString());
                }
                setTimeout(() => setOrderSuccess(null), 200);
              }, 1500);
            }
          } else {
            // Web: Queue for offline sync via IndexedDB
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
                // Revert optimistic table status
                if (savedTableNumber) optimisticTableStatus(savedTableIdentifier || savedTableNumber, 'available', null, null);
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
              // Revert optimistic table status
              if (savedTableNumber) optimisticTableStatus(savedTableIdentifier || savedTableNumber, 'available', null, null);
              setNotification({
                type: 'error',
                title: t('dashboard.orderFailed'),
                message: t('dashboard.orderFailedRestored'),
                show: true
              });
            }
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
    const { keepOrderSuccess = false, preserveUrl = false, keepTable = false } = opts;
    setCart([]);
    setProcessing(false); // Reset billing processing state
    setPlacingOrder(false); // Reset KOT processing state
    setTableNumber('');
    setCurrentOrder(null);
    setActiveSavedOrderId(null);
    setCustomerName(''); setAssignedStaff(null);
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
      if (!preserveUrl && typeof window !== 'undefined') router.replace(window.__DINEOPEN_MOBILE_EMBED__ ? '/mobile/dashboard' : '/dashboard');
    }
    if (selectedTable && selectedTable.id && !keepTable) {
      // Release table — skip when order was just placed (table stays occupied)
      apiClient.updateTableStatus(selectedTable.id, 'available', null, selectedRestaurant?.id);
      setSelectedTable(null);
    } else if (keepTable) {
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
      setCustomerName(''); setAssignedStaff(null);
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
    const { keepOrderSuccess = true, hasTable = false, keepTable = false } = opts;

    // Determine where to return
    // Only switch to tables if explicitly set as returnToView
    // When returnToView is null (edit mode), stay on orders view
    if (returnToView === 'tables') {
      // In mobile embed mode, navigate back to the tables page within the WebView
      if (isMobileEmbed) {
        clearCart({ keepOrderSuccess: false, preserveUrl: true, keepTable: false });
        setReturnToView(null);
        router.replace('/mobile/tables');
        return;
      }
      // User explicitly came from tables view - return to tables
      // Highlight the table that just had an order action
      if (selectedTable?.id) {
        setRecentlyUpdatedTableId(selectedTable.id);
      }
      switchView('tables', true);
      prefetchTables(selectedRestaurant?.id);
      clearCart({ keepOrderSuccess, preserveUrl: true, keepTable });
    } else {
      // User came from order history, edit mode, or no specific source - stay on orders view
      clearCart({ keepOrderSuccess, preserveUrl: true, keepTable });
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
  // Track last shown failure to avoid repeating the same notification on periodic retries
  const lastSyncFailShownRef = useRef(null);
  useEffect(() => {
    if (!lastSyncEvent) return;
    if (lastSyncEvent.type === 'sync_complete') {
      if (lastSyncEvent.syncedCount > 0) {
        // Something synced — always show success, reset failure tracker
        lastSyncFailShownRef.current = null;
        setNotification({
          type: 'success',
          title: t('dashboard.ordersSynced'),
          message: `${lastSyncEvent.syncedCount} offline order${lastSyncEvent.syncedCount > 1 ? 's' : ''} synced successfully.${lastSyncEvent.failedCount > 0 ? ` ${lastSyncEvent.failedCount} failed.` : ''}`,
          show: true
        });
        setTimeout(() => setNotification(null), 5000);
      } else if (lastSyncEvent.failedCount > 0) {
        // Only failures, no progress — show once per failure count
        if (lastSyncFailShownRef.current === lastSyncEvent.failedCount) return;
        lastSyncFailShownRef.current = lastSyncEvent.failedCount;
        setNotification({
          type: 'error',
          title: t('dashboard.syncFailed'),
          message: `${lastSyncEvent.failedCount} order${lastSyncEvent.failedCount > 1 ? 's' : ''} failed to sync.`,
          show: true
        });
        setTimeout(() => setNotification(null), 6000);
      }
    } else if (lastSyncEvent.type === 'failed') {
      if (lastSyncFailShownRef.current === 'failed') return;
      lastSyncFailShownRef.current = 'failed';
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
  const _isElectronOfflineNotice = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
  useEffect(() => {
    if (!networkTransition) return;
    if (networkTransition === 'went_offline') {
      setNotification({
        type: _isElectronOfflineNotice ? 'info' : 'error',
        title: _isElectronOfflineNotice ? 'Offline Mode Active' : t('dashboard.youreOffline'),
        message: _isElectronOfflineNotice
          ? `Offline mode — orders, billing & KOT saved locally. Auto-sync on reconnect. [${window.electronAPI?.buildVersion || '?'}]`
          : t('dashboard.offlineNoticeMsg'),
        show: true
      });
      setTimeout(() => setNotification(null), 5000);
    }
    if (networkTransition === 'came_online' && _isElectronOfflineNotice) {
      setNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Connection restored. Syncing your offline orders to the cloud...',
        show: true
      });
      setTimeout(() => setNotification(null), 4000);
    }
    clearTransition();
  }, [networkTransition, clearTransition]);

  // Show onboarding if needed — redirect to dedicated onboarding page (skip in mobile embed)
  if (showOnboarding && !window.__DINEOPEN_MOBILE_EMBED__) {
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

  // No restaurant selected — redirect to onboarding (skip in mobile embed)
  if (!selectedRestaurant && !showOnboarding && !window.__DINEOPEN_MOBILE_EMBED__) {
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
      {/* Hide sidebar hamburger + nav sidebar in mobile embed mode */}
      {isMobileEmbed && (
        <style>{`#sidebar-hamburger { display: none !important; } .nav-sidebar, [class*="sidebar-hamburger"] { display: none !important; }`}</style>
      )}
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
          display: isMobileEmbed ? 'none' : 'flex',
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
          padding: isMobileEmbed ? '8px 12px' : '12px 16px',
          display: 'flex',
          alignItems: isMobileEmbed ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobileEmbed ? '8px' : '12px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          flexDirection: isMobileEmbed ? 'column' : 'row',
        }}>
          {isMobileEmbed ? (
            <>
              {/* Embed: Search bar always visible + category/table buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                }}>
                  <FaSearch size={12} color="#9ca3af" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search items..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#1f2937',
                      padding: 0,
                    }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{
                        background: '#e5e7eb', border: 'none', cursor: 'pointer',
                        padding: '4px', display: 'flex', alignItems: 'center',
                        borderRadius: '50%', flexShrink: 0,
                      }}
                    >
                      <FaTimes size={10} color="#374151" />
                    </button>
                  )}
                </div>

                {/* Categories button */}
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    flexShrink: 0,
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                  title="Categories"
                >
                  <FaBars size={12} />
                  Menu
                </button>

                {/* Table view toggle */}
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'navigate', target: 'tables' }));
                    } else {
                      setViewMode('tables');
                    }
                  }}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    flexShrink: 0,
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                  title="Tables"
                >
                  <FaTable size={12} />
                  Tables
                </button>
              </div>

              {/* Category + item count subtitle */}
              <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500', paddingLeft: '2px' }}>
                {filteredItems.length} {t('dashboard.items')} • {selectedCategory === 'all-items' ? t('dashboard.allCategories') : categories.find(c => c.id === selectedCategory)?.name}
              </div>
            </>
          ) : (
            <>
              {/* Regular mobile: restaurant name + Menu/Cart buttons */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {selectedRestaurant?.name || t('dashboard.myRestaurant')}
                </h2>
                <p style={{
                  fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {filteredItems.length} {t('dashboard.items')} • {selectedCategory === 'all-items' ? t('dashboard.allCategories') : categories.find(c => c.id === selectedCategory)?.name}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  style={{
                    padding: '10px', backgroundColor: '#ef4444', color: 'white',
                    border: 'none', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontWeight: '600', fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    minWidth: '80px', justifyContent: 'center'
                  }}
                >
                  <FaBars size={14} />
                  {t('dashboard.menu')}
                </button>

                <button
                  onClick={() => setShowMobileCart(true)}
                  style={{
                    padding: '10px',
                    backgroundColor: cart.length > 0 ? '#10b981' : '#6b7280',
                    color: 'white', border: 'none', borderRadius: '10px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: '6px', fontWeight: '600', fontSize: '12px',
                    position: 'relative',
                    boxShadow: cart.length > 0 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(107, 114, 128, 0.3)',
                    minWidth: '80px', justifyContent: 'center'
                  }}
                >
                  <FaShoppingCart size={14} />
                  {t('dashboard.cart')}
                  {cart.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      backgroundColor: '#ef4444', color: 'white', borderRadius: '50%',
                      width: '18px', height: '18px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 'bold'
                    }}>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
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
                  const allTables = effectiveTablesData.tables?.length > 0 ? effectiveTablesData.tables : effectiveTablesData.floors?.flatMap(f => f.tables || []) || [];
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
              {/* Notification Bell — hidden when showSuccessNotifications is disabled */}
              {printSettings?.showSuccessNotifications !== false && (
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('toggleOrderNotificationBell'));
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaBell size={22} color={orderUnreadCount > 0 ? '#ef4444' : '#9ca3af'} />
                {orderUnreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '2px', right: '6px',
                    background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: '700',
                    borderRadius: '10px', minWidth: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', border: '2px solid white',
                    animation: 'bellPulse 2s infinite',
                  }}>
                    {orderUnreadCount > 99 ? '99+' : orderUnreadCount}
                  </span>
                )}
                <span style={{ fontSize: '10px', fontWeight: '600', color: orderUnreadCount > 0 ? '#ef4444' : '#6b7280', marginTop: '3px' }}>
                  {orderUnreadCount > 0 ? `${orderUnreadCount} New` : 'Alerts'}
                </span>
              </div>
              )}

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

              {/* DineBot AI */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => {
                  const r = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');
                  if (r?.id) openDineBot(r.id);
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaRobot size={22} color="#ef4444" />
                <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>DineBot</span>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Restaurant Selector */}
        {subRestaurants.length > 0 && (
          <div style={{
            position: 'absolute',
            top: isMobile ? '60px' : '66px',
            left: isMobile ? '12px' : '160px',
            right: isMobile ? '12px' : 'auto',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <select
              value={selectedSubRestaurant?.id || ''}
              onChange={(e) => {
                const sub = subRestaurants.find(s => s.id === e.target.value) || null;
                setSelectedSubRestaurant(sub);
                localStorage.setItem('selectedSubRestaurantId', sub?.id || '');
              }}
              style={{
                padding: '6px 28px 6px 10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: selectedSubRestaurant ? '#fef7f0' : '#fff',
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}
            >
              <option value="">All Sections</option>
              {subRestaurants.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
                  ? effectiveMenuItems
                  : category.id === 'favorites'
                  ? effectiveMenuItems.filter(item => item.isFavorite === true)
                  : effectiveMenuItems.filter(item => item.category?.toLowerCase() === category.id);
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
                    ? effectiveMenuItems
                    : category.id === 'favorites'
                    ? effectiveMenuItems.filter(item => item.isFavorite === true)
                    : effectiveMenuItems.filter(item => item.category?.toLowerCase() === category.id);
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
            display: (isMobile && !isMobileEmbed) ? 'block' : 'none', // Hide on desktop and mobile embed (embed has its own search in header)
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

                  {/* Tables Toggle Button - Fixed width and position (hidden in mobile embed — native app has own tables tab) */}
                  {!isMobileEmbed && (
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
                    {/* Refreshing spinner removed — optimistic updates handle instant UI changes */}
                </button>
                  )}
                </div>

                {/* Card Size Toggle - Only show on desktop */}
                {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '500' }}>
                    {cardSize === 'compact' ? 'C' : cardSize === 'large' ? 'L' : 'S'}
                  </span>
                <button
                    onClick={() => setCardSize(cardSize === 'compact' ? 'standard' : cardSize === 'standard' ? 'large' : 'compact')}
                  style={{
                      width: '20px',
                      height: '12px',
                      borderRadius: '6px',
                    border: 'none',
                      backgroundColor: cardSize === 'compact' ? '#d1d5db' : '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                      justifyContent: cardSize === 'large' ? 'flex-end' : cardSize === 'standard' ? 'center' : 'flex-start',
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
                    ? effectiveMenuItems
                    : category.id === 'favorites'
                    ? effectiveMenuItems.filter(item => item.isFavorite === true)
                    : effectiveMenuItems.filter(item => item.category?.toLowerCase() === category.id);

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

                            {/* Card Size Selector */}
                            <div style={{ position: 'relative' }}>
                              <div
                                onClick={() => setCardSizeDropdownOpen(!cardSizeDropdownOpen)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  backgroundColor: '#f9fafb',
                                  border: '1px solid #e5e7eb',
                                  userSelect: 'none'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                              >
                                {cardSize === 'compact' ? <FaThList size={11} color="#6b7280" /> : cardSize === 'large' ? <FaThLarge size={11} color="#ef4444" /> : <FaTh size={11} color="#ef4444" />}
                                <span style={{ fontSize: '11px', fontWeight: '600', color: cardSize === 'compact' ? '#4b5563' : '#ef4444' }}>
                                  {cardSize === 'compact' ? 'Compact' : cardSize === 'large' ? 'Large' : 'Standard'}
                                </span>
                                <FaChevronDown size={8} color="#9ca3af" style={{ transition: 'transform 0.15s', transform: cardSizeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                              </div>
                              {cardSizeDropdownOpen && (
                                <>
                                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setCardSizeDropdownOpen(false)} />
                                  <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '4px', zIndex: 100,
                                    backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '160px', overflow: 'hidden'
                                  }}>
                                    {[
                                      { value: 'compact', label: 'Compact', desc: 'Small, dense cards', icon: FaThList },
                                      { value: 'standard', label: 'Standard', desc: 'Default card size', icon: FaTh },
                                      { value: 'large', label: 'Large', desc: 'Bigger, spacious cards', icon: FaThLarge },
                                    ].map(({ value, label, desc, icon: Icon }) => (
                                      <div
                                        key={value}
                                        onClick={() => { setCardSize(value); setCardSizeDropdownOpen(false); }}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: '10px',
                                          padding: '10px 14px', cursor: 'pointer',
                                          backgroundColor: cardSize === value ? '#fef2f2' : 'transparent',
                                          transition: 'background-color 0.1s'
                                        }}
                                        onMouseEnter={(e) => { if (cardSize !== value) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                                        onMouseLeave={(e) => { if (cardSize !== value) e.currentTarget.style.backgroundColor = 'transparent'; else e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                      >
                                        <Icon size={14} color={cardSize === value ? '#ef4444' : '#9ca3af'} />
                                        <div>
                                          <div style={{ fontSize: '12px', fontWeight: '600', color: cardSize === value ? '#ef4444' : '#374151' }}>{label}</div>
                                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>{desc}</div>
                                        </div>
                                        {cardSize === value && <FaCheckCircle size={12} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                      {/* Category Items Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: cardSize === 'large'
                          ? (isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(200px, 1fr))')
                          : cardSize === 'compact'
                            ? (isMobile ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(150px, 1fr))')
                            : (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))'),
                        gap: cardSize === 'large'
                          ? (isMobile ? '16px' : '22px')
                          : cardSize === 'compact'
                            ? (isMobile ? '10px' : '14px')
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
                              cardSize={cardSize}
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

                        {/* Card Size Cycle Button */}
                        <div
                          onClick={() => {
                            const sizes = ['compact', 'standard', 'large'];
                            const next = sizes[(sizes.indexOf(cardSize) + 1) % sizes.length];
                            setCardSize(next);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            backgroundColor: cardSize !== 'compact' ? '#fef2f2' : '#f9fafb',
                            border: cardSize !== 'compact' ? '1px solid #fecaca' : '1px solid #e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = cardSize !== 'compact' ? '#fecaca' : '#e5e7eb';
                          }}
                        >
                          {cardSize === 'compact' ? <FaThList size={11} color="#6b7280" /> : cardSize === 'large' ? <FaThLarge size={11} color="#ef4444" /> : <FaTh size={11} color="#ef4444" />}
                          <span style={{ fontSize: '11px', fontWeight: '600', color: cardSize !== 'compact' ? '#ef4444' : '#4b5563' }}>
                            {cardSize === 'compact' ? 'Compact' : cardSize === 'large' ? 'Large' : 'Standard'}
                          </span>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Items Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: cardSize === 'large'
                      ? (isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(200px, 1fr))')
                      : cardSize === 'standard'
                        ? (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))')
                        : (isMobile ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(150px, 1fr))'),
                    gap: cardSize === 'large'
                      ? (isMobile ? '16px' : '22px')
                      : cardSize === 'standard'
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
                        cardSize={cardSize}
                      />
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
            ) : (
              <DashboardTablesPanel
                floors={effectiveTablesData.floors}
                tables={effectiveTablesData.tables}
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
                onChangeTable={() => setShowTableSelector(true)}
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
                ecrSettings={selectedRestaurant?.ecrSettings ? { ...selectedRestaurant.ecrSettings, restaurantId: selectedRestaurant.id } : null}
                whatsappConnected={whatsappConnected}
                billingSettings={selectedRestaurant?.billingSettings || {}}
                multiPricingEnabled={multiPricingEnabled}
                pricingRules={pricingRules}
                activePricingRuleId={activePricingRuleId}
                setActivePricingRuleId={setActivePricingRuleId}
                countryCode={selectedRestaurant?.countryCode || 'IN'}
                businessType={selectedRestaurant?.businessType || 'restaurant'}
                posSettings={posSettings}
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
                onOptimisticTableUpdate={(tableId, newStatus) => {
                  setTablesData(prev => ({
                    ...prev,
                    floors: (prev.floors || []).map(floor => ({
                      ...floor,
                      tables: (floor.tables || []).map(t =>
                        t.id === tableId
                          ? { ...t, status: newStatus, currentOrderId: null, currentOrderTotal: null, customerName: null, startTime: null }
                          : t
                      )
                    }))
                  }));
                }}
                onTakeOrder={(tbl, tableInfo) => {
                  // Clear previous order data when taking order from a new table
                  setCart([]);
                  setCurrentOrder(null);
                  setOrderLookup('');
                  setCustomerName(''); setAssignedStaff(null);
                  setCustomerMobile('');
                  setOrderType('dine-in');
                  setPaymentMethod('cash');
                  setOrderSuccess(null);
                  setError('');
                  setTableNumber(tbl);
                  // Set selectedTable with table ID and floor info
                  if (tableInfo) {
                    setSelectedTable({
                      id: tableInfo.id || null,
                      name: tbl,
                      floor: tableInfo.floor || null,
                      floorId: tableInfo.floorId || null,
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
            assignedStaff={assignedStaff}
            onAssignedStaffChange={setAssignedStaff}
            onRemoveFromCart={removeFromCart}
            onAddToCart={addToCart}
            onUpdateCartItemQuantity={updateCartItemQuantity}
            onTableNumberChange={setTableNumber}
            onChangeTable={() => setShowTableSelector(true)}
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
            ecrSettings={selectedRestaurant?.ecrSettings ? { ...selectedRestaurant.ecrSettings, restaurantId: selectedRestaurant.id } : null}
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
            assignedStaff={assignedStaff}
            onAssignedStaffChange={setAssignedStaff}
                    onRemoveFromCart={removeFromCart}
                    onAddToCart={addToCart}
                    onToggleFavorite={handleToggleFavorite}
                onUpdateCartItemQuantity={updateCartItemQuantity}
                    onTableNumberChange={setTableNumber}
                    onChangeTable={() => setShowTableSelector(true)}
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
            height: isMobileEmbed ? 'var(--app-height, 100vh)' : '100vh',
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
                  ? effectiveMenuItems
                  : effectiveMenuItems.filter(item => item.category?.toLowerCase() === category.id);
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

      {/* Mobile Cart Modal — slide-in panel for regular mobile web (not shown in embed, uses full OrderSummary instead) */}
      {isMobile && showMobileCart && !isMobileEmbed && (
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
      {showTableSelector && (() => {
        const allFloorTables = effectiveTablesData.floors?.flatMap(f => (f.tables || []).map(t => ({ ...t, floorName: f.name || f.floorName }))) || [];
        const selectorTables = allFloorTables.length > 0 ? allFloorTables : (effectiveTablesData.tables || []);
        const floorNames = [...new Set(selectorTables.map(t => t.floorName).filter(Boolean))];
        return (
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
            maxWidth: selectorTables.length > 0 ? '600px' : '400px',
            maxHeight: isMobileEmbed ? 'calc(var(--app-height, 80vh) - 16px)' : '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    {inRoomDiningEnabled ? t('dashboard.selectLocation') : 'Select Table'}
                  </h2>
                  {tableNumber && (
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '13px' }}>
                      Currently: <strong>Table {tableNumber}</strong>
                    </p>
                  )}
                </div>
                <button onClick={() => { setShowTableSelector(false); setManualTableNumber(''); setManualRoomNumber(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              {/* Room/Table type selector for in-room dining */}
              {inRoomDiningEnabled && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button type="button" onClick={() => { setLocationType('table'); setManualRoomNumber(''); }}
                    style={{ flex: 1, padding: '8px 14px', borderRadius: '8px', border: '2px solid', backgroundColor: locationType === 'table' ? '#e53e3e' : 'white', color: locationType === 'table' ? 'white' : '#374151', borderColor: locationType === 'table' ? '#e53e3e' : '#e5e7eb', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FaTable size={12} /> {t('dashboard.table')}
                  </button>
                  <button type="button" onClick={() => { setLocationType('room'); setManualTableNumber(''); }}
                    style={{ flex: 1, padding: '8px 14px', borderRadius: '8px', border: '2px solid', backgroundColor: locationType === 'room' ? '#e53e3e' : 'white', color: locationType === 'room' ? 'white' : '#374151', borderColor: locationType === 'room' ? '#e53e3e' : '#e5e7eb', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FaBed size={12} /> {t('dashboard.room')}
                  </button>
                </div>
              )}

              {/* Room number input */}
              {inRoomDiningEnabled && locationType === 'room' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{t('dashboard.roomNumber')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={manualRoomNumber} onChange={(e) => setManualRoomNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualRoomSelection()}
                      placeholder={t('dashboard.roomPlaceholder')}
                      style={{ flex: 1, padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb' }} />
                    <button onClick={handleManualRoomSelection} disabled={!manualRoomNumber.trim()}
                      style={{ padding: '10px 16px', backgroundColor: manualRoomNumber.trim() ? '#e53e3e' : '#d1d5db', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: manualRoomNumber.trim() ? 'pointer' : 'not-allowed' }}>
                      Select
                    </button>
                  </div>
                </div>
              )}

              {/* Visual Table Grid */}
              {(!inRoomDiningEnabled || locationType === 'table') && selectorTables.length > 0 && (
                <div>
                  {/* Manual input row */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input type="text" value={manualTableNumber} onChange={(e) => setManualTableNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualTableSelection()}
                      placeholder="Type table number..."
                      style={{ flex: 1, padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb' }} />
                    <button onClick={handleManualTableSelection} disabled={!manualTableNumber.trim()}
                      style={{ padding: '10px 16px', backgroundColor: manualTableNumber.trim() ? '#e53e3e' : '#d1d5db', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: manualTableNumber.trim() ? 'pointer' : 'not-allowed' }}>
                      Select
                    </button>
                  </div>

                  {/* Table cards by floor */}
                  {(floorNames.length > 0 ? floorNames : [null]).map(floor => {
                    const floorTables = floor ? selectorTables.filter(t => t.floorName === floor) : selectorTables;
                    return (
                      <div key={floor || 'all'} style={{ marginBottom: '16px' }}>
                        {floor && <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{floor}</div>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                          {floorTables.map(tbl => {
                            const tblName = tbl.name || tbl.number || tbl.tableName || '';
                            const tblNumber = tbl.number || tbl.name || tbl.tableName || '';
                            const isOccupied = tbl.status === 'occupied';
                            const isCurrent = tableNumber && (String(tblNumber) === String(tableNumber) || String(tblName) === String(tableNumber));
                            return (
                              <button key={tbl.id || tblName} onClick={() => {
                                if (!isCurrent) {
                                  setTableNumber(String(tblNumber));
                                  setSelectedTable(tbl);
                                  setShowTableSelector(false);
                                  setManualTableNumber('');
                                  // Clear from-tables localStorage to prevent stale state
                                  if (typeof window !== 'undefined') {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('tableId');
                                    url.searchParams.delete('tableNo');
                                    window.history.replaceState({}, '', url.toString());
                                  }
                                }
                              }}
                              style={{
                                padding: '10px 6px',
                                borderRadius: '10px',
                                border: isCurrent ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                backgroundColor: isCurrent ? '#fef2f2' : isOccupied ? '#fff7ed' : '#f0fdf4',
                                cursor: isCurrent ? 'default' : 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s',
                              }}>
                                <FaChair size={14} style={{ color: isCurrent ? '#ef4444' : isOccupied ? '#f97316' : '#16a34a', marginBottom: '4px' }} />
                                <div style={{ fontSize: '13px', fontWeight: '700', color: isCurrent ? '#ef4444' : '#374151' }}>{tblName}</div>
                                <div style={{ fontSize: '9px', color: isCurrent ? '#ef4444' : isOccupied ? '#f97316' : '#16a34a', fontWeight: 500, marginTop: '2px' }}>
                                  {isCurrent ? 'Current' : isOccupied ? 'Occupied' : 'Available'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fallback: manual input only when no tables data */}
              {(!inRoomDiningEnabled || locationType === 'table') && selectorTables.length === 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{t('dashboard.tableNumber')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={manualTableNumber} onChange={(e) => setManualTableNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualTableSelection()}
                      placeholder={t('dashboard.tablePlaceholder')}
                      style={{ flex: 1, padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#f9fafb' }} />
                    <button onClick={handleManualTableSelection} disabled={!manualTableNumber.trim()}
                      style={{ padding: '10px 16px', backgroundColor: manualTableNumber.trim() ? '#e53e3e' : '#d1d5db', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: manualTableNumber.trim() ? 'pointer' : 'not-allowed' }}>
                      Select
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Reset Tables Confirmation Modal */}
      {showResetConfirm && (() => {
        const allTables = effectiveTablesData.tables?.length > 0 ? effectiveTablesData.tables : effectiveTablesData.floors?.flatMap(f => f.tables || []) || [];
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
                      // Offline: queue for later sync
                      if (!isOnline) {
                        if (!offlineEnabled) {
                          setNotification({ type: 'error', title: 'Offline', message: 'You are offline. Go online to reset tables.', show: true });
                          setTimeout(() => setNotification(null), 4000);
                          setResetLoading(false);
                          return;
                        }
                        await queueOfflineOrder({
                          restaurantId: selectedRestaurant.id,
                          _offlineAction: 'reset_all_tables',
                          _restaurantId: selectedRestaurant.id,
                          idempotencyKey: generateIdempotencyKey(),
                        });
                      } else {
                        await apiClient.resetAllTables(selectedRestaurant.id);
                      }
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
                        message: !isOnline
                          ? `${occupiedCount} table${occupiedCount !== 1 ? 's' : ''} reset locally — will sync when online.`
                          : `${occupiedCount} table${occupiedCount !== 1 ? 's' : ''} reset to available.`,
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
        initialVariant={customizationInitial.variant}
        initialCustomizations={customizationInitial.customizations}
        initialQuantity={customizationInitial.quantity}
      />

      {/* Scale Status Badge — floating indicator for Electron scale connection */}
      {typeof window !== 'undefined' && window.electronAPI?.scale && scaleStatus?.enabled && (
        <div
          onClick={async () => {
            if (!scaleStatus.connected && scaleStatus.port) {
              const result = await window.electronAPI.scale.connect(scaleStatus.port, scaleStatus.baudRate || 9600);
              if (result.success) {
                setScaleStatus(prev => ({ ...prev, connected: true, error: null }));
                setNotification({ type: 'success', title: 'Scale Connected', message: `Connected to ${scaleStatus.port}`, show: true });
              } else {
                setNotification({ type: 'error', title: 'Scale Error', message: result.error, show: true });
              }
            }
          }}
          style={{
            position: 'fixed', bottom: '20px', left: '20px', zIndex: 1000,
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: scaleStatus.connected ? 'default' : 'pointer',
            backgroundColor: scaleStatus.connected ? '#f0fdf4' : '#fef2f2',
            color: scaleStatus.connected ? '#166534' : '#991b1b',
            border: `1px solid ${scaleStatus.connected ? '#bbf7d0' : '#fecaca'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          title={scaleStatus.connected ? 'Weighing scale connected' : scaleStatus.error || 'Click to reconnect scale'}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: scaleStatus.connected ? '#22c55e' : '#ef4444' }} />
          ⚖️ {scaleStatus.connected ? 'Scale Connected' : 'Scale Disconnected'}
        </div>
      )}

      {/* Weight Popup — shown when adding a sold-by-weight item */}
      {showWeightPopup && (() => {
        const wpItem = showWeightPopup;
        const wpConnected = scaleStatus?.connected;
        const wpReading = scaleWeight;
        const unitLabel = wpItem.priceUnit === 'per_100g' ? 'g' : wpItem.priceUnit === 'per_lb' ? 'lb' : 'kg';
        return (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Weigh Item</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{wpItem.name}</p>
                </div>
                <button onClick={() => setShowWeightPopup(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>✕</button>
              </div>

              {/* Scale status */}
              <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: wpConnected ? '#f0fdf4' : '#fef2f2',
                color: wpConnected ? '#166534' : '#991b1b',
                border: `1px solid ${wpConnected ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: wpConnected ? '#22c55e' : '#ef4444', display: 'inline-block',
                  animation: wpConnected && wpReading && !wpReading.stable ? 'pulse 1s infinite' : 'none' }} />
                {wpConnected
                  ? (wpReading?.stable ? '⚖️ Scale Connected — Stable' : '⚖️ Scale Connected — Stabilizing...')
                  : '⚖️ Scale Not Connected — Enter weight manually'}
              </div>

              {/* Live weight display */}
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', color: wpConnected && wpReading?.stable ? '#16a34a' : '#0f172a', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  {wpConnected && wpReading ? wpReading.weight.toFixed(3) : '0.000'}
                </div>
                <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>{unitLabel}</div>
              </div>

              {/* Manual weight input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  {wpConnected ? 'Override weight manually:' : 'Enter weight:'}
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    id="weight-manual-input"
                    type="number"
                    step="0.001"
                    min="0"
                    defaultValue={wpConnected && wpReading ? wpReading.weight : ''}
                    placeholder="0.000"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', fontFamily: 'monospace' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{unitLabel}</span>
                </div>
              </div>

              {/* Price calculation */}
              <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#1e40af' }}>
                  <span>Price: {selectedRestaurant?.currencySettings?.symbol || '₹'}{getEffectiveItemPrice(wpItem)}/{unitLabel}</span>
                  <span style={{ fontWeight: '700' }}>
                    Total: {(() => {
                      const w = wpConnected && wpReading ? wpReading.weight : 0;
                      const p = getEffectiveItemPrice(wpItem);
                      const tot = wpItem.priceUnit === 'per_100g' ? p * (w / 100) : p * w;
                      return `${selectedRestaurant?.currencySettings?.symbol || '₹'}${tot.toFixed(2)}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowWeightPopup(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const inputEl = document.getElementById('weight-manual-input');
                    const manualWeight = parseFloat(inputEl?.value);
                    const finalWeight = (!isNaN(manualWeight) && manualWeight > 0)
                      ? manualWeight
                      : (wpConnected && wpReading ? wpReading.weight : 0);
                    if (!finalWeight || finalWeight <= 0) {
                      setNotification({ type: 'error', title: 'No Weight', message: 'Please place the item on the scale or enter weight manually', show: true });
                      return;
                    }
                    // Add to cart with weight data
                    addToCart({
                      ...wpItem,
                      _weightConfirmed: true,
                      itemWeight: finalWeight,
                      weightUnit: unitLabel,
                      quantity: 1,
                    });
                    setShowWeightPopup(null);
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ⚖️ Add to Cart
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* Mobile Bottom Cart Button - When Search Bar is Hidden (hidden on embed — embed has its own checkout button) */}
      {isMobile && !isMobileEmbed && viewMode === 'orders' && !showMobileCart && posSettings.hideSearchBar && (
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

      {/* Mobile Command Bar - Bottom Fixed (hidden on embed — embed has its own search in header + checkout button) */}
      {isMobile && !isMobileEmbed && viewMode === 'orders' && !showMobileCart && !posSettings.hideSearchBar && (
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

      {/* Mobile Embed — Floating Checkout Button (above tab bar) */}
      {isMobileEmbed && viewMode === 'orders' && !showMobileCart && cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          zIndex: 900,
          padding: '8px 12px 16px 12px',
          background: 'linear-gradient(to top, rgba(255,255,255,1) 80%, rgba(255,255,255,0))',
        }}>
          <button
            onClick={() => setShowMobileCart(true)}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <FaShoppingCart size={15} />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'}</span>
            <span style={{ margin: '0 4px', opacity: 0.5 }}>|</span>
            <span>Rs.{getTotalAmount()}</span>
          </button>
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


