'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  FaBed
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { performLogout } from '../../../lib/logout';
import { t } from '../../../lib/i18n';
import { useLoading } from '../../../contexts/LoadingContext';
import IntelligentChatbot from '../../../components/IntelligentChatbot';
import RAGInitializer from '../../../components/RAGInitializer';
import { getCachedDashboardData, setCachedDashboardData } from '../../../utils/dashboardCache';

function RestaurantPOSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoading } = useLoading();
  
  // Core state
  const [selectedCategory, setSelectedCategory] = useState('all-items');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('orders'); // 'orders' | 'tables'
  const [tablesData, setTablesData] = useState({ floors: [], tables: [] });
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
  
  // API state
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantChangeLoading, setRestaurantChangeLoading] = useState(false); // Loading state for restaurant changes
  const [backgroundLoading, setBackgroundLoading] = useState(false); // Background data refresh indicator
  const [processing, setProcessing] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  
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
  const [orderLookup, setOrderLookup] = useState(''); // For table number or order ID lookup
  const [currentOrder, setCurrentOrder] = useState(null); // Current order being viewed/updated
  const [orderSearchLoading, setOrderSearchLoading] = useState(false); // Loading state for order search
  const [taxSettings, setTaxSettings] = useState(null); // Tax settings for the restaurant
  const [isLoadingOrder, setIsLoadingOrder] = useState(false); // Flag to prevent localStorage override during order loading
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Category sidebar width constant (compact, part of menu section)
  const categorySidebarWidth = 150;
  
  // Card design toggle state
  const [useModernCards, setUseModernCards] = useState(true);
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
  
  // Fullscreen mode states
  const [isNavigationHidden, setIsNavigationHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        { id: 'all-items', name: 'All Items', emoji: '🍽️', count: 0 },
        { id: 'favorites', name: 'Favorites', emoji: '❤️', count: 0 }
      ];
    }
    
    // Get unique categories from menu items
    const categoryMap = new Map();
    categoryMap.set('all-items', { id: 'all-items', name: 'All Items', emoji: '🍽️', count: menuItems.length });
    
    // Count favorites
    const favoritesCount = menuItems.filter(item => item.isFavorite === true).length;
    categoryMap.set('favorites', { id: 'favorites', name: 'Favorites', emoji: '❤️', count: favoritesCount });
    
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
        console.log('🏛️ Tax settings loaded and cached:', taxSettingsResponse.taxSettings);
      } else {
        console.log('🏛️ No tax settings found for restaurant');
        setTaxSettings(null);
      }
    } catch (error) {
      console.error('🏛️ Error loading tax settings:', error);
      setTaxSettings(null);
    }
  }, []);

  // Load tax settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadTaxSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id, loadTaxSettings]);

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
        restaurantsResponse = await apiClient.getRestaurants();
        console.log('🏢 Restaurants loaded:', restaurantsResponse.restaurants?.length || 0, 'restaurants');
        setRestaurants(restaurantsResponse.restaurants || []);
      } else if (skipRestaurantLoad) {
        console.log('⏭️ Skipping restaurant load (already loaded or skip flag set)');
        restaurantsResponse = { restaurants: restaurants };
      } else {
        console.log('✅ Using existing restaurants data');
        restaurantsResponse = { restaurants: restaurants };
      }
      
      let restaurant = null;
      
      // For staff members, use their assigned restaurant
      if (user?.restaurantId) {
        // First try to use restaurant data from login response
        if (user.restaurant) {
          restaurant = user.restaurant;
        } else {
          // Fallback to finding restaurant in the list
        restaurant = restaurantsResponse.restaurants.find(r => r.id === user.restaurantId);
        }
      }
      // For owners or customers (legacy), use selected restaurant from localStorage or first restaurant
      else if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
        const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
        restaurant = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) || 
                    restaurantsResponse.restaurants[0];
        
        // Save the selected restaurant ID if not already saved
        if (!savedRestaurantId) {
          localStorage.setItem('selectedRestaurantId', restaurant.id);
        }
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
            
            // Update state with fresh data
            setMenuItems(freshMenuItems);
            setFloors(freshFloors);
            
            // Also prefetch tables and get fresh floors data
            const floorsRes = await apiClient.getFloors(restaurant.id).catch(() => ({ floors: [] }));
            const freshFloorsForTables = floorsRes?.floors || floorsRes || [];
            await prefetchTables(restaurant.id);
            
            // Cache the fresh data with tablesData structure
            const freshTablesData = {
              floors: freshFloorsForTables,
              tables: [] // Tables are nested in floors
            };
            
            const dataToCache = {
              menuItems: freshMenuItems,
              floors: freshFloors,
              tablesData: freshTablesData
            };
            setCachedDashboardData(restaurant.id, dataToCache);
            
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
          // No cache, fetch normally
          const [menuResponse, floorsResponse] = await Promise.all([
            apiClient.getMenu(restaurant.id).catch(() => ({ menuItems: [] })),
            apiClient.getFloors(restaurant.id).catch(() => ({ floors: [] }))
          ]);
          
          const fetchedMenuItems = menuResponse.menuItems || [];
          const fetchedFloors = floorsResponse.floors || floorsResponse || [];
          
          // Update state
          setMenuItems(fetchedMenuItems);
          setFloors(fetchedFloors);
          await prefetchTables(restaurant.id);
          
          // Cache the data with proper tablesData structure
          const tablesDataToCache = {
            floors: fetchedFloors,
            tables: [] // Tables are nested in floors
          };
          
          const dataToCache = {
            menuItems: fetchedMenuItems,
            floors: fetchedFloors,
            tablesData: tablesDataToCache
          };
          setCachedDashboardData(restaurant.id, dataToCache);
          
        console.log('✅ Restaurant data loaded successfully');
        }
      } else {
        // No restaurant found - automatically create one with default name
        console.log('📋 No restaurant found for user, creating default restaurant');
        try {
          const defaultRestaurant = {
            name: 'My Restaurant',
            description: '',
            address: 'Add your address here',
            phone: '',
            email: '',
            cuisine: 'Multi-cuisine',
            timings: {
              open: '09:00',
              close: '22:00',
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            settings: {
              currency: 'INR',
              taxRate: 18,
              serviceCharge: 0,
              deliveryFee: 0,
              minOrderAmount: 0
            },
            menu: {
              categories: [],
              items: [],
              lastUpdated: new Date()
            },
            ownerId: user.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const response = await apiClient.createRestaurant(defaultRestaurant);
          const newRestaurant = response.data.restaurant;
          
          // Update local storage
          localStorage.setItem('selectedRestaurant', JSON.stringify(newRestaurant));
          setSelectedRestaurant(newRestaurant);
          
          console.log('✅ Default restaurant created successfully');
        } catch (error) {
          console.error('Error creating default restaurant:', error);
          // Continue with empty state if creation fails
        }
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
  }, [restaurants, prefetchTables]);

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
      const menuItems = response.menuItems || [];
      setMenuItems(menuItems);
      
      if (menuItems.length === 0) {
        console.log('📋 No menu items found for restaurant:', restaurantId);
        // Don't set error, just log - empty menu is valid
      } else {
        console.log('📋 Loaded menu items:', menuItems.length);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuItems([]); // Set empty array instead of leaving undefined
      // Don't set error for menu loading failures - let user continue
    }
  };

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
      const result = await apiClient.updateTableStatus(tableId, status, orderId);
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

  // Handle table parameters from URL
  useEffect(() => {
    const tableParam = searchParams.get('table');
    const floorParam = searchParams.get('floor');
    const capacityParam = searchParams.get('capacity');
    
    if (tableParam) {
      setSelectedTable({
        name: tableParam,
        floor: floorParam,
        capacity: capacityParam
      });
      setOrderType('dine-in'); // Force dine-in when table is selected
    }
  }, [searchParams]);

  // Handle orderId parameter from URL (for edit mode from Order History)
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const mode = searchParams.get('mode');
    
    if (orderId && selectedRestaurant?.id) {
      console.log('🔄 Dashboard: Order ID from URL:', orderId, 'Mode:', mode);
      
      // Switch to orders view (menu view) when loading an order
      setViewMode('orders');
      
      // Set the order lookup value in search box
      setOrderLookup(orderId);
      
      // Add a small delay to ensure the search box is updated, then trigger search directly
      setTimeout(async () => {
        console.log('🔄 Auto-triggering order lookup for:', orderId);
        await triggerOrderLookup(orderId);
      }, 500); // 500ms delay to handle any race conditions
    }
  }, [searchParams, selectedRestaurant?.id]);

  const filteredItems = (menuItems || []).filter(item => {
    const matchesCategory = selectedCategory === 'all-items' 
      ? true
      : selectedCategory === 'favorites'
      ? item.isFavorite === true
      : item.category?.toLowerCase() === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    // Hide success message when adding new items
    if (orderSuccess?.show) {
      setOrderSuccess(null);
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
          title: 'Short Code Not Found',
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
      const base = (item?.selectedVariant?.price)
        ?? (typeof item?.basePrice === 'number' ? item.basePrice : undefined)
        ?? (typeof item?.price === 'number' ? item.price : 0);
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

  // Reset UI state for fresh order
  const handleFreshOrder = () => {
    setCart([]);
    setTableNumber('');
    setCustomerName('');
    setCustomerMobile('');
    setOrderLookup('');
    setCurrentOrder(null);
    setSelectedTable(null);
    setManualTableNumber('');
    setError('');
    setNotification(null);
    setOrderSuccess(null);
    setOrderComplete(false);
    setPlacingOrder(false);
    
    // Show success notification
    setNotification({
      type: 'success',
      title: 'Fresh Order Started',
      message: 'Ready to take a new order!',
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
          // Don't filter by status - let backend handle filtering out completed orders
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
          
          return {
            id: id,
            name: name,
            price: price || 0,
            quantity: parseInt(item.quantity) || 1,
            category: item.category || item.menuItem?.category || 'main',
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
            setCustomerName(order.customerInfo.name || '');
            setCustomerMobile(order.customerInfo.phone || '');
          }
          
        // Show appropriate notification based on mode
        if (mode === 'view') {
          setNotification({
            type: 'info',
            title: 'Order Loaded for Viewing 👁️',
            message: `Order "${orderId}" loaded - View mode`,
            show: true
          });
        } else if (mode === 'edit') {
          // Check if order is completed
          if (order.status === 'completed') {
            setNotification({
              type: 'success',
              title: 'New Order Created 📝',
              message: `New order created based on completed order "${orderId}" - Ready to modify!`,
              show: true
            });
            // Clear current order for new order creation
            setCurrentOrder(null);
          } else {
            setNotification({
              type: 'success',
              title: 'Order Ready for Editing ✏️',
              message: `Order "${orderId}" loaded successfully - Ready to edit!`,
              show: true
            });
          }
        } else if (mode === 'duplicate') {
          setNotification({
            type: 'success',
            title: 'New Order Created 📝',
            message: `New order created based on completed order "${orderId}" - Ready to modify!`,
            show: true
          });
          // Clear current order for new order creation
          setCurrentOrder(null);
        } else {
          setNotification({
            type: 'success',
            title: 'Order Found! 🎉',
            message: `Order "${orderId}" loaded successfully - Ready to edit!`,
            show: true
          });
        }
          
        // Keep the search value in the input box
        // setOrderLookup(''); // Removed this line
          
        } else {
          setNotification({
          type: 'error',
            title: 'Order Not Found',
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
        title: 'Error Loading Order',
        message: error.message || 'Failed to load order',
          show: true
        });
      // Keep the search value in the input box
      // setOrderLookup(''); // Removed this line
      } finally {
        setOrderSearchLoading(false);
      setIsLoadingOrder(false); // Clear flag to allow localStorage loading
      }
  }, [selectedRestaurant?.id, searchParams]);

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

  // Voice Assistant Functions
  const startVoiceListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // Changed to true for manual stop
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListeningVoice(true);
      setVoiceTranscript('');
      finalTranscriptRef.current = ''; // Reset accumulated transcript
      startAudioVisualizer(); // Start audio visualizer
    };
    
    recognition.onresult = async (event) => {
      let interimTranscript = '';
      let newFinalTranscript = '';
      
      // Process all results from the last resultIndex
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Accumulate final transcripts
          newFinalTranscript += transcript + ' ';
        } else {
          // Show interim results for real-time feedback
          interimTranscript += transcript;
        }
      }
      
      // Accumulate final transcripts
      if (newFinalTranscript) {
        finalTranscriptRef.current += newFinalTranscript;
      }
      
      // Display: accumulated final + current interim
      const displayText = finalTranscriptRef.current + (interimTranscript ? interimTranscript : '');
      setVoiceTranscript(displayText.trim());
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
      setIsListeningVoice(false);
        stopAudioVisualizer();
      recognition.stop();
      }
    };
    
    recognition.onend = () => {
      if (isListeningVoice) {
        // Restart if still listening (unless manually stopped)
        recognition.start();
      } else {
        stopAudioVisualizer();
      }
    };
    
    setRecognitionInstance(recognition);
    recognition.start();
  };
  
  const stopVoiceListening = async () => {
    setIsListeningVoice(false);
    stopAudioVisualizer();
    
    if (recognitionInstance) {
      recognitionInstance.stop();
      setRecognitionInstance(null);
    }
    
    // Get the complete accumulated transcript
    const completeTranscript = finalTranscriptRef.current.trim() || voiceTranscript.trim();
    
    // Process the final transcript
    if (completeTranscript) {
      await processVoiceCommand(completeTranscript);
      setVoiceTranscript('');
      finalTranscriptRef.current = '';
    } else {
      // No transcript captured
      setNotification({
        type: 'warning',
        title: 'No Speech Detected',
        message: 'Please speak your order and try again.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };
  
  const processVoiceCommand = async (transcript) => {
    try {
      setIsProcessingVoice(true);
      console.log('🚀 Processing voice command:', transcript);
      
      if (!selectedRestaurant?.id) {
        setNotification({
          type: 'error',
          title: 'No Restaurant Selected',
          message: 'Please select a restaurant first',
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
          title: 'Voice Order Success! ✅',
          message: `Successfully added ${response.items.length} item(s) to cart: ${response.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
          show: true
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({
          type: 'warning',
          title: 'No Items Found',
          message: `Could not match any menu items from: "${transcript}". Please try again with clearer pronunciation.`,
          show: true
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      setNotification({
        type: 'error',
        title: 'Voice Order Failed ❌',
        message: error.message || 'Failed to process voice command. Please try again.',
        show: true
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleOrderLookup = async (e) => {
    if (e.key === 'Enter' && orderLookup.trim()) {
      await triggerOrderLookup(orderLookup.trim());
    }
  };

  const processOrder = async () => {
    if (cart.length === 0 || !selectedRestaurant?.id) return;

    // Check if order is completed and disable action
    if (currentOrder && currentOrder.status === 'completed') {
      setNotification({
        type: 'error',
        title: 'Order Completed! ✅',
        message: 'This order has already been completed and cannot be modified.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
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
          title: 'Table Changed! ⚠️',
          message: `Table changed from "${currentOrder.tableNumber || 'N/A'}" to "${tableToUse}". Order will be completed if table is available.`,
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
            notes: '',
            name: item.name,
            price: item.price
          })),
          tableNumber: !isRoomOrder ? (tableToUse || currentOrder.tableNumber) : null,
          roomNumber: isRoomOrder ? (roomNumber || currentOrder.roomNumber) : null, // NEW: Include room number
          orderType,
          paymentMethod,
          status: 'completed', // Mark as completed
          paymentStatus: 'paid', // Mark payment as completed
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: {
            name: currentUser.name || 'Staff',
            id: currentUser.id,
            role: currentUser.role || 'waiter'
          },
          customerInfo: {
            name: customerName || currentOrder.customerInfo?.name || 'Walk-in Customer',
            phone: customerMobile || currentOrder.customerInfo?.phone || null,
            tableNumber: !isRoomOrder ? (tableToUse || currentOrder.tableNumber || null) : null,
            roomNumber: isRoomOrder ? (roomNumber || currentOrder.roomNumber || null) : null // NEW: Include room number
          }
        };

        console.log('🔄 Update data for existing order:', updateData);
        const response = await apiClient.updateOrder(currentOrder.id, updateData);
        
        if (response.data) {
          // Process payment for the updated order
          console.log('💳 Processing payment for updated order:', currentOrder.id);
          await apiClient.verifyPayment({
            orderId: currentOrder.id,
            paymentMethod: paymentMethod,
            amount: getTotalAmount(),
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: 'completed'
          });

          // Show notification for order completion
          setNotification({
            type: 'success',
            title: 'Order Completed! 💳',
            message: `Order #${currentOrder.id.slice(-8).toUpperCase()} has been completed and payment processed.`,
            show: true
          });

          setOrderSuccess({
            orderId: currentOrder.id,
            show: true,
            message: 'Order Completed! 💳'
          });
          
          // Clear current order and cart
          setCurrentOrder(null);
          clearCart();
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
            userId: currentUser.id,
          name: currentUser.name || 'Staff',
            loginId: currentUser.loginId || currentUser.id,
          role: currentUser.role || 'waiter'
        },
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          notes: '',
          name: item.name,
          // Pass configuration so backend can price and persist for KOT
          selectedVariant: item.selectedVariant || null,
          selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
          basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price
        })),
        customerInfo: {
            name: customerName || 'Walk-in Customer',
            phone: customerMobile || null,
            tableNumber: finalTableNumber || null,
            roomNumber: roomNumber || null // NEW: Include room number in customer info
        },
        notes: isRoomOrder ? `Room order for Room ${roomNumber}` : ''
      };

        console.log('🛒 Creating order with data:', orderData);
        console.log('🛒 Order data status:', orderData.status);
        console.log('🛒 Order data staffInfo:', orderData.staffInfo);
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
        await apiClient.updateTableStatus(selectedTable.id, 'occupied', orderId);
      }

      // Process payment based on method
        console.log('💳 Processing payment for order:', orderId, 'Method:', paymentMethod);
      if (paymentMethod === 'cash') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'cash',
            amount: getTotalAmount(),
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: 'completed' // Mark payment as completed
          });
          console.log('✅ Cash payment verified:', paymentResult);
      } else if (paymentMethod === 'upi') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'upi',
            amount: getTotalAmount(),
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: 'completed' // Mark payment as completed
          });
          console.log('✅ UPI payment verified:', paymentResult);
      } else if (paymentMethod === 'card') {
          const paymentResult = await apiClient.verifyPayment({
          orderId,
            paymentMethod: 'card',
            amount: getTotalAmount(),
            userId: currentUser.id,
            restaurantId: selectedRestaurant.id,
            paymentStatus: 'completed' // Mark payment as completed
          });
          console.log('✅ Card payment verified:', paymentResult);
        }

        // Note: Table status management is now handled by backend
        console.log(`🪑 Table ${tableNumber || 'N/A'} - status managed by backend`);

      // Show notification for billing completion
        console.log('🎉 Order processing completed successfully:', orderId);
      setNotification({
        type: 'success',
        title: 'Billing Complete! 💳',
        message: `Order #${orderId} has been successfully completed and payment processed.`,
        show: true
      });

      // Clear cart and show inline success
      setCart([]);
      localStorage.removeItem('dine_cart');
      const successData = { 
        orderId, 
        show: true, 
        message: 'Billing Complete! 💳' 
      };
      console.log('Setting order success:', successData);
      setOrderSuccess(successData);
      
      // Don't auto-hide - let user manually close invoice or start new order
      // Table will be released when user starts a new order or manually closes

        // Return order ID for invoice generation
        return { orderId };
      }

      // Background refresh tables view data if order tied to a table
      if (tableToUse) {
        prefetchTables(selectedRestaurant.id);
      }

    } catch (error) {
      console.error('Order processing error:', error);
      
      // Extract error message from the API response
      let errorMessage = 'Failed to process order. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Show notification instead of full-page error
      setNotification({
        type: 'error',
        title: 'Billing Failed! ❌',
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

  const saveOrder = async () => {
    if (cart.length === 0) {
      setNotification({
        type: 'error',
        title: 'Empty Cart! 🛒',
        message: 'Please add items to cart before saving.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if restaurant is selected
    if (!selectedRestaurant?.id) {
      setNotification({
        type: 'error',
        title: 'No Restaurant! 🏪',
        message: 'Please set up a restaurant first.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Determine if this is a room order
      const isRoomOrder = inRoomDiningEnabled && locationType === 'room' ? true : (selectedTable?.isRoom === true);
      const roomNumber = isRoomOrder 
        ? (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (selectedTable?.name || tableNumber))
        : null;
      const finalTableNumber = !isRoomOrder ? (tableNumber || selectedTable?.number) : null;

      const orderData = {
        restaurantId: selectedRestaurant?.id,
        tableNumber: finalTableNumber || null,
        roomNumber: roomNumber || null, // NEW: Include room number for hotel orders
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          notes: ''
        })),
        customerInfo: {
          roomNumber: roomNumber || null // NEW: Include room number in customer info
        },
      orderType,
        paymentMethod,
        staffInfo: {
          name: 'Staff Member',
          id: 'staff-001'
        },
        notes: isRoomOrder ? `Room order for Room ${roomNumber}` : '',
        status: 'pending' // Save as draft
      };

      const response = await apiClient.createOrder(orderData);
      
      if (response.data) {
        setOrderSuccess({
          orderId: response.data.order.id,
          show: true,
          message: 'Order Saved Successfully! 💾'
        });
        // Don't clear cart for saved orders
      }
    } catch (error) {
      console.error('Save order error:', error);
      
      // Extract error message from the API response
      let errorMessage = 'Failed to save order. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Show notification instead of full-page error
      setNotification({
        type: 'error',
        title: 'Save Failed! ❌',
        message: errorMessage,
        show: true
      });
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setProcessing(false);
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setNotification({
        type: 'error',
        title: 'Empty Cart! 🛒',
        message: 'Please add items to cart before placing order.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if restaurant is selected
    if (!selectedRestaurant?.id) {
      setNotification({
        type: 'error',
        title: 'No Restaurant! 🏪',
        message: 'Please set up a restaurant first.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if order is completed and disable action
    if (currentOrder && currentOrder.status === 'completed') {
      setNotification({
        type: 'error',
        title: 'Order Completed! ✅',
        message: 'This order has already been completed and cannot be modified.',
        show: true
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

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
          title: 'Table Changed! ⚠️',
          message: `Table changed from "${currentOrder.tableNumber || 'N/A'}" to "${tableToUse}". Order will be placed if table is available.`,
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
            notes: ''
          })),
          tableNumber: tableToUse || currentOrder.tableNumber,
          orderType,
          paymentMethod,
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: {
            name: 'Staff Member',
            id: 'staff-001'
          }
        };

        const response = await apiClient.updateOrder(currentOrder.id, updateData);
        
        if (response.data) {
          // Show notification for order update
          setNotification({
            type: 'success',
            title: 'Order Updated! ✏️👨‍🍳',
            message: `Order #${currentOrder.id} has been updated and sent to kitchen with new items.`,
            show: true
          });

          setOrderSuccess({
            orderId: currentOrder.id,
            show: true,
            message: 'Order Updated! ✏️'
          });
          // Switch to tables view and refresh so status reflects
          if (tableNumber || selectedTable?.number) {
            setViewMode('tables');
            prefetchTables(selectedRestaurant?.id);
          }
          
          // Clear current order and cart
          setCurrentOrder(null);
          clearCart();
        }
      } else {
        // Create new order
        // Determine if this is a room order
        const isRoomOrder = inRoomDiningEnabled && locationType === 'room' ? true : (selectedTable?.isRoom === true);
        const roomNumber = isRoomOrder
          ? (inRoomDiningEnabled && locationType === 'room' ? manualRoomNumber : (selectedTable?.name || tableNumber))
          : null;
        const finalTableNumber = !isRoomOrder ? (tableNumber || selectedTable?.number) : null;

        const orderData = {
          restaurantId: selectedRestaurant?.id,
          tableNumber: finalTableNumber || null,
          roomNumber: roomNumber || null,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            notes: '',
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
          orderType,
          paymentMethod,
          staffInfo: {
            name: 'Staff Member',
            id: 'staff-001'
          },
          notes: isRoomOrder ? `Room order for Room ${roomNumber}` : '',
          status: 'confirmed' // Place order to kitchen
        };

        console.log('Creating order with data:', orderData);
      const response = await apiClient.createOrder(orderData);
      console.log('Create order response:', response);

        // NOTE: Backend automatically links room orders to hotel check-ins
        // No need to manually link here to avoid duplicates
        if (isRoomOrder && roomNumber && response.order) {
          console.log('🏨 KOT room order created for room:', roomNumber, '- Backend will handle check-in linking');
        }

        if (response.order) {
          console.log('Updating order status to confirmed...');
          // Update order status to confirmed (sent to kitchen)
          await apiClient.updateOrderStatus(response.order.id, 'confirmed', selectedRestaurant?.id);

          // Note: Table status management is now handled by backend
          console.log(`🪑 Table ${tableNumber || 'N/A'} - status managed by backend`);

          // Background refresh tables so instant switch shows latest state
          if (tableNumber || selectedTable?.number) {
            prefetchTables(selectedRestaurant?.id);
          }

          // Show notification in top-right corner
          setNotification({
            type: 'success',
            title: 'Order Sent to Chef! 👨‍🍳',
            message: `Order #${response.order.dailyOrderId || response.order.id.slice(-6)} has been placed and sent to the kitchen for preparation.`,
            show: true
          });

          // Show order success in the cart area
          setOrderSuccess({
            orderId: response.order.id,
            dailyOrderId: response.order.dailyOrderId,
            show: true,
            message: 'Order Placed to Kitchen! 👨‍🍳'
          });

          // Switch to tables view instantly and refresh in background
          if (tableNumber || selectedTable?.number) {
            setViewMode('tables');
            prefetchTables(selectedRestaurant?.id);
          }
          
          // Clear cart after showing success
          clearCart();
          
          // Hide notification after 4 seconds
          setTimeout(() => setNotification(null), 4000);
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
        title: 'Order Failed! ❌',
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

  const clearCart = () => {
    setCart([]);
    setTableNumber('');
    setCurrentOrder(null);
    setOrderLookup('');
    localStorage.removeItem('dine_cart');
    
    // Clear order success and release table when starting new order
      setOrderSuccess(null);
    if (selectedTable && selectedTable.id) {
      // Release table
      apiClient.updateTableStatus(selectedTable.id, 'available');
      setSelectedTable(null);
    }
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

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        </div>
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </>
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
            Something Went Wrong! 😔
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
              Try Again
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
              Back to Login
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

  // Show onboarding if no restaurant is selected and user hasn't completed onboarding
  if (!selectedRestaurant && !showOnboarding) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 'calc(100vh - 80px)',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
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
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
            `,
            zIndex: 0
          }} />
          
          {/* Floating Elements */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '50%',
            animation: 'float 10s ease-in-out infinite'
          }} />
          
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '800px',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Hero Icon */}
            <div style={{
              fontSize: '120px',
              marginBottom: '32px',
              animation: 'pulse 2s ease-in-out infinite',
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))'
            }}>
              🍽️
            </div>
            
            {/* Main Heading */}
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '900', 
              color: 'white', 
              marginBottom: '24px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.2'
            }}>
              Restaurant Management
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
                marginTop: '8px'
              }}>
                Revolution 🚀
              </span>
            </h1>
            
            {/* Subtitle */}
            <p style={{ 
              fontSize: '24px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '16px',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              The Future of Dining is Here
            </p>
            
            {/* Description */}
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.8)', 
              marginBottom: '32px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Join thousands of restaurants already using our AI-powered POS system. 
              Transform your business with intelligent order management, real-time analytics, 
              and seamless customer experiences.
            </p>
            
            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginBottom: '40px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                  1000+
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Restaurants
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                  30%
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  More Savings
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                  24/7
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Support
                </div>
              </div>
              
            </div>
            
            {/* CTA Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowOnboarding(true)}
                style={{
                  padding: '20px 40px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(0)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                  e.target.style.background = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                }}
              >
                🚀 Launch Restaurant System
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div style={{
              marginTop: '40px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                fontWeight: '500'
              }}>
                ✨ Bank-Level Security • 🛡️ GDPR Compliant • ⚡ Lightning Fast
              </p>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Removed full screen success - using inline success instead

  return (
    <div
      className={`page-transition ${isLoading ? 'loading' : ''}`}
      style={{
      height: '100%',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      minHeight: '100%'
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
          zIndex: 9999,
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
              Switching restaurant...
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Loading menu and data
            </p>
          </div>
        </div>
      )}

      {/* Voice Listening Panel - Top Header Overlay */}
      {isListeningVoice && (
        <div style={{
          position: 'fixed',
          top: '80px', // Below navigation header
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 9998,
          padding: isMobile ? '16px' : '20px 24px',
          animation: 'slideDown 0.3s ease-out',
          borderBottom: '3px solid #ef4444'
        }}>
          <style>{`
            @keyframes slideDown {
              from {
                transform: translateY(-100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.05); }
            }
            @keyframes barAnimation {
              0%, 100% {
                transform: scaleY(0.3);
              }
              50% {
                transform: scaleY(1);
              }
            }
          `}</style>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '20px',
            width: '100%',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            {/* Left: Microphone Icon & Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              flexShrink: 0
            }}>
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                <FaMicrophone size={isMobile ? 18 : 20} color="white" />
              </div>
              <div>
                <div style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '2px'
                }}>
                  Listening...
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: '#6b7280'
                }}>
                  Speak your order
                </div>
              </div>
            </div>

            {/* Center: Audio Visualizer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: isMobile ? '40px' : '50px',
              flex: 1,
              minWidth: 0,
              padding: isMobile ? '0 8px' : '0 16px'
            }}>
              {audioLevels.length > 0 ? (
                audioLevels.map((level, index) => (
                  <div
                    key={index}
                    style={{
                      width: isMobile ? '4px' : '6px',
                      height: `${Math.max(level * (isMobile ? 0.3 : 0.4), 8)}px`,
                      backgroundColor: `hsl(${220 + (level * 0.5)}, 70%, 60%)`,
                      borderRadius: '3px',
                      transition: 'height 0.1s ease-out',
                      animation: `barAnimation ${0.5 + (index * 0.1)}s ease-in-out infinite`,
                      boxShadow: `0 1px 4px rgba(239, 68, 68, ${0.2 + (level / 100) * 0.3})`
                    }}
                  />
                ))
              ) : (
                Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: isMobile ? '4px' : '6px',
                      height: isMobile ? '20px' : '25px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      animation: `barAnimation ${0.5 + (index * 0.1)}s ease-in-out infinite`
                    }}
                  />
                ))
              )}
            </div>

            {/* Right: Transcript & Stop Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              flexShrink: 0,
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto'
            }}>
              {/* Transcript Display */}
              {voiceTranscript && (
                <div style={{
                  flex: isMobile ? '1' : '0 0 auto',
                  maxWidth: isMobile ? '100%' : '300px',
                  padding: isMobile ? '8px 12px' : '10px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  minHeight: isMobile ? '36px' : '40px',
                  maxHeight: isMobile ? '60px' : '80px',
                  overflowY: 'auto',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <p style={{
                    margin: 0,
                    color: '#374151',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '500',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}>
                    {voiceTranscript}
                  </p>
                </div>
              )}

              {/* Stop Button */}
              <button
                onClick={stopVoiceListening}
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: isMobile ? '12px' : '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                }}
              >
                <FaMicrophoneSlash size={isMobile ? 12 : 14} />
                {isMobile ? 'Stop' : 'Stop & Process'}
              </button>
            </div>
          </div>
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
              {selectedRestaurant?.name || 'My Restaurant'}
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '2px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {filteredItems.length} items • {selectedCategory === 'all-items' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}
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
              Menu
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
              Cart
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
        overflow: 'visible', // Always allow scrolling
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'auto' : '100%', // Use 100% since parent has calc(100vh - 80px)
        minHeight: isMobile ? 'calc(100vh - 80px)' : '100%', // Account for navigation height
        marginTop: isListeningVoice ? (isMobile ? '120px' : '100px') : '0',
        transition: 'margin-top 0.3s ease-out',
        position: 'relative' // Required for absolute-positioned top header bar
      }}>
        {/* Top Header Bar - Logo + Actions (stops before Order Summary) */}
        {!isMobile && viewMode === 'orders' && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: 0,
            right: '450px', // Stop before Order Summary (450px width)
            height: '52px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '12px',
            zIndex: 20
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <FaBars size={14} color="#374151" />
            </button>

            {/* Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '8px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaUtensils color="white" size={13} />
              </div>
              <span style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937'
              }}>DineOpen</span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flex: '1', maxWidth: '280px', display: 'flex', alignItems: 'center', height: '36px', backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
              <FaSearch style={{
                marginLeft: '10px',
                color: '#6b7280',
                flexShrink: 0
              }} size={14} />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  height: '100%',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  outline: 'none',
                  color: '#374151'
                }}
                onFocus={(e) => e.target.parentElement.style.borderBottomColor = '#9ca3af'}
                onBlur={(e) => e.target.parentElement.style.borderBottomColor = '#d1d5db'}
              />
            </div>

            {/* Order ID */}
            <input
              type="text"
              placeholder="Order ID"
              value={orderLookup}
              onChange={(e) => setOrderLookup(e.target.value)}
              onKeyPress={handleOrderLookup}
              className="header-order-id-input"
              style={{
                width: '100px',
                height: '34px',
                padding: '0 8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#fef3c7',
                fontSize: '13px',
                fontWeight: '500',
                outline: 'none',
                textAlign: 'center',
                color: '#b45309'
              }}
            />
            <style>{`
              .header-order-id-input::placeholder { color: #9ca3af; }
              .header-short-code-input::placeholder { color: #9ca3af; }
            `}</style>

            {/* Short Code */}
            <input
              type="text"
              placeholder="SHORT CODE"
              value={shortCodeSearch}
              onChange={(e) => setShortCodeSearch(e.target.value)}
              onKeyPress={handleShortCodeSearch}
              className="header-short-code-input"
              style={{
                width: '110px',
                height: '34px',
                padding: '0 8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#d1fae5',
                fontSize: '12px',
                fontWeight: '500',
                outline: 'none',
                textAlign: 'center',
                color: '#059669',
                textTransform: 'uppercase'
              }}
            />

            {/* New Order Button */}
            <button
              onClick={handleFreshOrder}
              style={{
                height: '34px',
                padding: '0 14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <FaPlus size={10} />
              NEW ORDER
            </button>

            {/* Spacer */}
            <div style={{ flex: '1' }} />

            {/* Voice Button */}
            <button
              onClick={isListeningVoice ? stopVoiceListening : startVoiceListening}
              disabled={isProcessingVoice}
              style={{
                width: '34px',
                height: '34px',
                background: isListeningVoice
                  ? '#ef4444'
                  : isProcessingVoice
                  ? '#3b82f6'
                  : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isProcessingVoice ? 'not-allowed' : 'pointer',
                flexShrink: 0
              }}
            >
              {isProcessingVoice ? (
                <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
              ) : isListeningVoice ? (
                <FaMicrophoneSlash size={12} />
              ) : (
                <FaMicrophone size={12} />
              )}
            </button>

            {/* Tables Button */}
            <button
              onClick={() => setViewMode(viewMode === 'orders' ? 'tables' : 'orders')}
              style={{
                height: '34px',
                padding: '0 16px',
                background: 'transparent',
                color: '#ef4444',
                border: '1.5px solid #ef4444',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              TABLES
            </button>

            {/* Card Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px', color: '#9ca3af' }}>M</span>
              <button
                onClick={() => setUseModernCards(!useModernCards)}
                style={{
                  width: '24px',
                  height: '14px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: useModernCards ? '#ef4444' : '#d1d5db',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: useModernCards ? 'flex-end' : 'flex-start',
                  padding: '2px'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }} />
              </button>
            </div>
          </div>
        )}

        {/* Desktop Category Sidebar - Part of Menu Section */}
        {!isMobile && viewMode === 'orders' && (
          <div style={{
            width: '150px',
            height: '100%',
            paddingTop: '72px', // Space for top header (52px) + top margin (10px) + extra padding (10px)
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            {/* Categories List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 6px'
            }} className="hide-scrollbar">
              {categories.map((category) => {
                const categoryItems = category.id === 'all-items'
                  ? (menuItems || [])
                  : category.id === 'favorites'
                  ? (menuItems || []).filter(item => item.isFavorite === true)
                  : (menuItems || []).filter(item => item.category?.toLowerCase() === category.id);
                const isSelected = selectedCategory === category.id;

                return (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '9px 10px',
                      marginBottom: '2px',
                      backgroundColor: isSelected ? '#ef4444' : 'transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? 'white' : '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {category.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: isSelected ? 'rgba(255,255,255,0.9)' : '#6b7280',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      minWidth: '22px',
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {categoryItems.length}
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
          overflow: 'visible', // Always allow scrolling
          height: isMobile ? 'auto' : '100%',
          minHeight: isMobile ? '400px' : '100%',
          paddingBottom: isMobile ? '80px' : '0', // Add bottom padding for mobile cart button
          paddingTop: !isMobile && viewMode === 'orders' ? '80px' : '0', // Space for top header (52px) + top margin (10px) + align with categories (8px) + extra (10px)
          maxHeight: isMobile ? 'none' : '100%',
          // Expand to full width when in tables view
          width: viewMode === 'tables' ? '100%' : undefined,
          flex: viewMode === 'tables' ? '1 1 100%' : 1
        }}>
          {/* Show empty menu prompt if no menu items */}
          {filteredItems.length === 0 && (menuItems || []).length === 0 && !loading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              width: '100%'
            }}>
              <EmptyMenuPrompt 
                restaurantName={selectedRestaurant?.name} 
                selectedRestaurant={selectedRestaurant}
                onAddMenu={() => router.push('/menu')}
                onMenuItemsAdded={loadInitialData}
              />
            </div>
          ) : (
          <>
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
                    placeholder={isMobile ? "Search..." : "Search menu..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                      height: isMobile ? '38px' : '36px',
                      paddingLeft: isMobile ? '38px' : '36px',
                    paddingRight: '12px',
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
                        {isMobile ? 'Processing...' : 'Processing...'}
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
                        {isMobile ? 'Listening' : 'Listening...'}
                      </span>
                      <button
                        onClick={stopVoiceListening}
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
                        Stop
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
                      title="Start Voice Order"
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
                    placeholder={isMobile ? "Order" : "Order ID"}
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
                    placeholder={isMobile ? "SC" : "SHORT CODE"}
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
                  NEW ORDER
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
                      onClick={isListeningVoice ? stopVoiceListening : startVoiceListening}
                      title={isListeningVoice ? "Stop Voice Order" : isProcessingVoice ? "Processing..." : "Start Voice Order"}
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
                        Processing...
                      </div>
                    )}
                  </div>

                  {/* Tables Toggle Button - Fixed width and position */}
                  <button
                    onClick={() => setViewMode(viewMode === 'orders' ? 'tables' : 'orders')}
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
                    title={viewMode === 'orders' ? 'Switch to Tables' : 'Back to Orders'}
                  >
                    <span style={{ 
                      display: 'inline-block',
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      {viewMode === 'orders' ? 'TABLES' : 'ORDERS'}
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
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '12px',
                width: '100%',
                boxSizing: 'border-box'
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
                        setSelectedCategory(category.id);
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
                        overflow: 'hidden'
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
            overflowY: isMobile ? 'visible' : 'auto',
            height: isMobile ? 'auto' : '100%',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            margin: '0 auto'
          }} className="hide-scrollbar">
            {viewMode === 'orders' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: useModernCards
                ? (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))')
                : (isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))'),
              gap: useModernCards
                ? (isMobile ? '12px' : '16px')
                : (isMobile ? '10px' : '14px'),
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
            ) : (
              <DashboardTablesPanel
                floors={tablesData.floors}
                tables={tablesData.tables}
                isRefreshing={tablesRefreshing}
                selectedRestaurant={selectedRestaurant}
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
                onTakeOrder={(tbl) => {
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
                  setViewMode('orders');
                }}
                onSliderClose={() => {
                  // This will be called from DashboardTablesPanel to close the slider
                  // The slider state is managed internally, but we can trigger a re-render
                  // by clearing the cart which will cause the slider to update
                }}
                onViewOrder={async (orderId, table) => {
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
                      title: 'Order Loaded',
                      message: `Order loaded for ${table?.name || table?.number || 'table'}. You can view, update, or complete it.`,
                      show: true
                    });
                  }
                }}
              />
            )}
          </div>
          </>
          )}
        </div>

       
        {/* Order Summary - Desktop Sidebar / Mobile Bottom Sheet */}
        {!(filteredItems.length === 0 && (menuItems || []).length === 0 && !loading) && (
          <>
            {/* Desktop Order Summary */}
            {!isMobile && (
              <>
                {viewMode === 'orders' ? (
          <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: '450px',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 90
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
            menuItems={menuItems}
          />
        </div>
                ) : (
                  // No spacer needed - tables view should expand to full width
                  null
                )}
              </>
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
                    orderSuccess={orderSuccess}
                    setOrderSuccess={setOrderSuccess}
                    error={error}
                    getTotalAmount={getTotalAmount}
                    tableNumber={tableNumber}
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
                menuItems={menuItems}
                onClose={() => setShowMobileCart(false)}
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
                    setSelectedCategory(category.id);
                    setShowMobileSidebar(false);
                  }}>
                    <CategoryButton
                      category={category}
                      isSelected={isSelected}
                    onClick={() => {
                      setSelectedCategory(category.id);
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

                <button
                  onClick={() => {
                    setShowMobileCart(false);
                    processOrder();
                  }}
                  disabled={processing}
                  style={{
                    width: '100%',
                    background: processing 
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    border: 'none',
                    cursor: processing ? 'not-allowed' : 'pointer',
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
                {inRoomDiningEnabled ? 'Select Location' : t('dashboard.tableNumber')}
              </h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                {inRoomDiningEnabled ? 'Enter table or room number' : t('dashboard.enterTableNumber')}
              </p>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Location Type Selector (Table or Room) - Only show if in-room dining is enabled */}
              {inRoomDiningEnabled && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Location Type
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
                      Table
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
                      Room
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
                    placeholder="e.g., T1, Table 5, VIP1"
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
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={manualRoomNumber}
                    onChange={(e) => setManualRoomNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualRoomSelection()}
                    placeholder="e.g., 101, 205, Suite 301"
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
                      Need to manage tables?
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#075985', margin: 0, lineHeight: '1.4' }}>
                    Visit the Table Management page to set up floor layouts, add tables, and track table status.
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
                    Select Room
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
          fullscreenStep === 0 ? 'Hide Navigation' :
          fullscreenStep === 1 ? 'Enter Fullscreen' :
          'Exit Fullscreen'
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
              {user.name || 'User'}
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
                      {user.name || 'User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {user.role || 'Staff'}
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
                  Logout
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


