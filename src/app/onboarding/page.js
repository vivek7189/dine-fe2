'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUtensils, FaCoffee, FaBeer, FaBreadSlice, FaIceCream, FaHamburger, FaHotel, FaFire, FaArrowRight, FaArrowLeft, FaCheck, FaWhatsapp, FaChair, FaBoxes, FaUsers, FaCalendarAlt, FaQrcode, FaFileInvoice, FaCashRegister, FaClipboardList, FaRocket, FaUpload, FaGift, FaPercent, FaCrown, FaSearch, FaChevronDown, FaTimes, FaDownload, FaLink, FaMagic } from 'react-icons/fa';
import QRCode from 'qrcode';
import apiClient from '../../lib/api';
import { getDefaultMenu } from '../../lib/defaultMenus';
import ChatbotInterface from '../../components/ChatbotInterface';
import { getCurrencyByCountryCode } from '../../lib/currencyData';
import { detectAndSetCountry, formatPriceWithCurrency } from '../../lib/detectCountry';

// ─── Countries ───────────────────────────────────────────────
const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

// ─── Business Types ────────────────────────────────────────────
const BUSINESS_TYPES = [
  { id: 'restaurant', label: 'Restaurant', icon: FaUtensils, color: '#ef4444', bg: '#fef2f2', desc: 'Full-service dine-in', emoji: '🍽️' },
  { id: 'cafe', label: 'Cafe', icon: FaCoffee, color: '#f59e0b', bg: '#fffbeb', desc: 'Coffee & light bites', emoji: '☕' },
  { id: 'bar', label: 'Bar / Pub', icon: FaBeer, color: '#0ea5e9', bg: '#f0f9ff', desc: 'Drinks & nightlife', emoji: '🍺' },
  { id: 'bakery', label: 'Bakery', icon: FaBreadSlice, color: '#ec4899', bg: '#fdf2f8', desc: 'Breads & pastries', emoji: '🧁' },
  { id: 'cloud_kitchen', label: 'Cloud Kitchen', icon: FaFire, color: '#f97316', bg: '#fff7ed', desc: 'Delivery only', emoji: '🔥' },
  { id: 'qsr', label: 'QSR / Fast Food', icon: FaHamburger, color: '#10b981', bg: '#ecfdf5', desc: 'Quick service', emoji: '🍔' },
  { id: 'ice_cream', label: 'Ice Cream', icon: FaIceCream, color: '#06b6d4', bg: '#ecfeff', desc: 'Parlour & desserts', emoji: '🍦' },
  { id: 'hotel', label: 'Hotel', icon: FaHotel, color: '#3b82f6', bg: '#eff6ff', desc: 'Rooms & dining', emoji: '🏨' },
];

// Dynamic name placeholders per business type
const NAME_PLACEHOLDERS = {
  restaurant: 'e.g., The Spice House',
  cafe: 'e.g., Brew & Bean Cafe',
  bar: 'e.g., The Tipsy Bull',
  bakery: 'e.g., Sweet Crust Bakery',
  cloud_kitchen: 'e.g., Flavor Box Kitchen',
  qsr: 'e.g., QuickBite Express',
  ice_cream: 'e.g., Frosty Scoops',
  hotel: 'e.g., Grand Palace Hotel',
};

// Dynamic label for the name field
const NAME_LABELS = {
  restaurant: 'Restaurant Name',
  cafe: 'Cafe Name',
  bar: 'Bar Name',
  bakery: 'Bakery Name',
  cloud_kitchen: 'Kitchen Name',
  qsr: 'Restaurant Name',
  ice_cream: 'Parlour Name',
  hotel: 'Hotel Name',
};

// ─── Feature Map ───────────────────────────────────────────────
const FEATURES = [
  { id: 'pos', label: 'Billing & POS', icon: FaCashRegister, desc: 'Take orders & print bills instantly', color: '#ef4444' },
  { id: 'tables', label: 'Table Management', icon: FaChair, desc: 'Visual floor plan & reservations', color: '#3b82f6' },
  { id: 'kot', label: 'Kitchen Display (KOT)', icon: FaFire, desc: 'Auto-send orders to kitchen', color: '#f97316' },
  { id: 'menu', label: 'QR Menu & Ordering', icon: FaQrcode, desc: 'Customers scan & order from phone', color: '#8b5cf6' },
  { id: 'inventory', label: 'Inventory & Recipes', icon: FaBoxes, desc: 'Track stock, recipes & costs', color: '#059669' },
  { id: 'orders', label: 'Online Ordering', icon: FaClipboardList, desc: 'Your own ordering website', color: '#f59e0b' },
  { id: 'shifts', label: 'Staff & Shifts', icon: FaCalendarAlt, desc: 'Schedule & manage team roles', color: '#0ea5e9' },
  { id: 'customers', label: 'Customer Loyalty', icon: FaUsers, desc: 'Rewards, points & WhatsApp CRM', color: '#ec4899' },
  { id: 'hotel', label: 'Hotel / Room Service', icon: FaHotel, desc: 'Room management & service', color: '#6366f1' },
  { id: 'invoice', label: 'Invoice & Expenses', icon: FaFileInvoice, desc: 'Professional GST invoices', color: '#0d9488' },
];

// Smart defaults per business type
const FEATURE_DEFAULTS = {
  restaurant: ['pos', 'tables', 'kot', 'inventory', 'menu', 'customers'],
  cafe: ['pos', 'menu', 'customers'],
  bar: ['pos', 'tables', 'inventory'],
  bakery: ['pos', 'inventory', 'customers'],
  cloud_kitchen: ['pos', 'kot', 'orders'],
  qsr: ['pos', 'kot', 'orders', 'menu'],
  ice_cream: ['pos', 'menu', 'customers'],
  hotel: ['pos', 'hotel', 'invoice', 'tables'],
};

// Step backgrounds
const STEP_BACKGROUNDS = {
  1: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 50%, #fef3c7 100%)',
  2: 'linear-gradient(180deg, #ffffff 0%, #fefce8 50%, #fef9c3 100%)',
  3: 'linear-gradient(180deg, #ffffff 0%, #eef2ff 50%, #e0e7ff 100%)',
  4: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
  5: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 50%, #ffedd5 100%)',
  6: 'linear-gradient(180deg, #ffffff 0%, #fdf2f8 50%, #fce7f3 100%)',
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === '1';
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [isMobile, setIsMobile] = useState(false);

  // Step 1
  const [businessType, setBusinessType] = useState('');
  const [hoveredType, setHoveredType] = useState('');

  // Step 2
  const [restaurantName, setRestaurantName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const countryDropdownRef = useRef(null);

  // Step 3
  const [selectedFeatures, setSelectedFeatures] = useState(['pos']);

  // Step 4
  const [menuChoice, setMenuChoice] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [menuSeeded, setMenuSeeded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef(null);

  // Step 5
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Step 6
  const [checklistItems, setChecklistItems] = useState([]);

  // Currency auto-detection
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const fmtPrice = (price) => formatPriceWithCurrency(price, currencyInfo);

  useEffect(() => {
    const result = detectAndSetCountry();
    if (result.currency) setCurrencyInfo(result.currency);
    // Auto-select country based on detection
    if (result.countryCode) {
      const match = COUNTRIES.find(c => c.code === result.countryCode);
      if (match) setSelectedCountry(match);
    }
  }, []);

  // Mobile detect
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Check auth (skip in test mode)
  useEffect(() => {
    if (isTestMode) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    }
  }, []);

  // Set smart feature defaults when business type changes
  useEffect(() => {
    if (businessType) {
      setSelectedFeatures(FEATURE_DEFAULTS[businessType] || ['pos']);
    }
  }, [businessType]);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Generate QR code when reaching step 5
  useEffect(() => {
    if (step === 5 && restaurantId) {
      const url = `https://dineopen.com/placeorder/${restaurantId}`;
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      }).then(setQrCodeDataUrl).catch(() => {});
    }
  }, [step, restaurantId]);

  // Filter countries
  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    ),
    [countrySearch]
  );

  // ─── Navigation ──────────────────────────────────────────────
  const goTo = (nextStep, dir = 'forward') => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 300);
  };

  const goNext = () => goTo(step + 1, 'forward');
  const goBack = () => goTo(step - 1, 'back');

  // POS path based on business type
  const posPath = businessType === 'bar' ? '/dashboard/bar' : '/dashboard';

  const businessLabel = BUSINESS_TYPES.find(b => b.id === businessType)?.label || 'Restaurant';

  // ─── Skip Entire Setup ──────────────────────────────────────
  const skipEntireSetup = async () => {
    if (isTestMode) { router.replace('/home'); return; }
    try {
      if (!restaurantId) {
        const randomNames = ['My Restaurant', 'Delicious Bites', 'Flavor Junction', 'Taste Paradise', 'Spice Garden'];
        const name = randomNames[Math.floor(Math.random() * randomNames.length)];
        const response = await apiClient.createRestaurant({
          name, businessType: 'restaurant', address: '', phone: '', email: '',
          cuisine: ['Indian'], description: '', operatingHours: { open: '09:00', close: '22:00' }
        });
        localStorage.setItem('selectedRestaurantId', response.restaurant.id);
        localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));
        try { await apiClient.seedDefaultMenu(response.restaurant.id); } catch {}
        const countryCode = selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN';
        try {
          const currencyData = getCurrencyByCountryCode(countryCode);
          await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
        } catch {}
      }
      router.replace('/home');
    } catch (err) {
      console.error('Skip setup error:', err);
      router.replace('/home');
    }
  };

  // ─── Step 2: Create Restaurant ───────────────────────────────
  const handleCreateRestaurant = async () => {
    if (!restaurantName.trim()) return;
    setCreating(true);

    // Save country code
    if (selectedCountry?.code) {
      localStorage.setItem('selectedCountryCode', selectedCountry.code);
      const cd = getCurrencyByCountryCode(selectedCountry.code);
      if (cd) setCurrencyInfo(cd);
    }

    if (isTestMode) {
      setRestaurantId('test-restaurant-id');
      setTimeout(() => { setCreating(false); goNext(); }, 500);
      return;
    }
    try {
      const response = await apiClient.createRestaurant({
        name: restaurantName.trim(),
        businessType: businessType || 'restaurant',
        address: '', phone: '', email: '',
        cuisine: ['Indian'], description: '',
        operatingHours: { open: '09:00', close: '22:00' }
      });
      const rid = response.restaurant.id;
      setRestaurantId(rid);
      localStorage.setItem('selectedRestaurantId', rid);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));
      const countryCode = selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN';
      try {
        const currencyData = getCurrencyByCountryCode(countryCode);
        await apiClient.updateCurrencySettings(rid, currencyData);
      } catch {}
      goNext();
    } catch (err) {
      alert('Failed to create restaurant: ' + (err.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  // ─── Step 3: Save Features ──────────────────────────────────
  const handleSaveFeatures = async () => {
    const allFeatureIds = FEATURES.map(f => f.id);
    const notAllowed = allFeatureIds.filter(id => !selectedFeatures.includes(id));
    if (!isTestMode) {
      try { await apiClient.updateFeatures(notAllowed); } catch {}
    }
    localStorage.setItem('navNotAllowedPages', JSON.stringify(notAllowed));
    window.dispatchEvent(new CustomEvent('featuresUpdated', { detail: { notAllowedPages: notAllowed } }));
    goNext();
  };

  // ─── Step 4: Menu Actions ──────────────────────────────────
  const handleSeedMenu = async () => {
    setSeeding(true);
    if (isTestMode) {
      setTimeout(() => { setMenuSeeded(true); setSeeding(false); setTimeout(() => goNext(), 800); }, 600);
      return;
    }
    if (!restaurantId) return;
    try {
      await apiClient.seedDefaultMenu(restaurantId);
      setMenuSeeded(true);
      setTimeout(() => goNext(), 800);
    } catch (err) {
      alert('Failed to load menu: ' + (err.message || 'Unknown error'));
    } finally {
      setSeeding(false);
    }
  };

  const handleWhatsAppSetup = () => {
    const name = restaurantName || 'my restaurant';
    const msg = encodeURIComponent(`Hi, I'd like help setting up my menu for ${name}. I just signed up on DineOpen!`);
    window.open(`https://wa.me/917042330092?text=${msg}`, '_blank');
    goNext();
  };

  const handleMenuUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const rid = restaurantId || localStorage.getItem('selectedRestaurantId');
    if (!rid && !isTestMode) {
      alert('Please set up your restaurant first (Step 2).');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading menu images...');

    if (isTestMode) {
      setTimeout(() => { setUploadProgress('AI is analyzing your menu...'); }, 500);
      setTimeout(() => { setUploadProgress('Saving menu items...'); }, 1200);
      setTimeout(() => { setUploadedCount(24); setUploading(false); setUploadProgress(''); setMenuSeeded(true); }, 2000);
      return;
    }

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('menuFiles', file));

      setUploadProgress('AI is analyzing your menu...');
      const response = await apiClient.bulkUploadMenu(rid, formData);

      if (response.success && response.data?.length > 0) {
        const allMenuItems = response.data.flatMap(m => m.menuItems);
        if (allMenuItems.length > 0) {
          setUploadProgress('Saving menu items...');
          const saveResponse = await apiClient.bulkSaveMenuItems(rid, allMenuItems, response.extractedCategories || []);
          setUploadedCount(saveResponse.savedCount || allMenuItems.length);
          setMenuSeeded(true);
        }
      }
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Try again'));
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleManualMenu = () => {
    if (!isTestMode && restaurantId) {
      apiClient.seedDefaultMenu(restaurantId).catch(() => {});
    }
    goNext();
  };

  // ─── Step 2 skip ─────────────────────────────────────────────
  const handleSkipStep2 = async () => {
    if (restaurantId) { goNext(); return; }
    setCreating(true);
    if (isTestMode) {
      setRestaurantId('test-restaurant-id');
      setTimeout(() => { setCreating(false); goNext(); }, 400);
      return;
    }
    try {
      const randomNames = ['My Restaurant', 'Delicious Bites', 'Flavor Junction', 'Taste Paradise'];
      const name = randomNames[Math.floor(Math.random() * randomNames.length)];
      const response = await apiClient.createRestaurant({
        name, businessType: businessType || 'restaurant', address: '', phone: '', email: '',
        cuisine: ['Indian'], description: '', operatingHours: { open: '09:00', close: '22:00' }
      });
      setRestaurantId(response.restaurant.id);
      localStorage.setItem('selectedRestaurantId', response.restaurant.id);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));
      const countryCode = selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN';
      try {
        const currencyData = getCurrencyByCountryCode(countryCode);
        await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
      } catch {}
      goNext();
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  // ─── Step 5: QR helpers ───────────────────────────────────────
  const qrUrl = restaurantId ? `https://dineopen.com/placeorder/${restaurantId}` : '';

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `${restaurantName || 'restaurant'}-qr-menu.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handleCopyLink = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {});
  };

  // ─── Build checklist for Step 6 ─────────────────────────────
  useEffect(() => {
    if (step === 6) {
      const data = {
        businessType,
        restaurantName,
        featuresConfigured: selectedFeatures.length > 1,
        menuSetup: menuSeeded,
        menuItemCount: uploadedCount || (menuSeeded ? 36 : 0),
        completedAt: Date.now(),
      };
      setChecklistItems([
        { label: 'Account created', done: true },
        { label: `${businessLabel} selected`, done: !!businessType },
        { label: 'Restaurant details saved', done: !!restaurantName },
        { label: `Menu loaded${data.menuItemCount ? ` (${data.menuItemCount} items)` : ''}`, done: menuSeeded },
        { label: 'Take your first order', done: false, link: posPath },
        { label: 'Set up printer', done: false, link: '/admin?tab=print' },
        { label: 'Invite staff member', done: false, link: '/admin?tab=staff' },
      ]);
      localStorage.setItem('onboardingChecklist', JSON.stringify(data));
    }
  }, [step, businessType, menuSeeded]);

  // ─── Receipt items based on business type ─────────────────────
  const getReceiptItems = () => {
    const menus = {
      restaurant: [{ name: 'Butter Chicken', qty: 1, price: 350 }, { name: 'Dal Makhani', qty: 1, price: 250 }, { name: 'Butter Naan', qty: 3, price: 120 }, { name: 'Cold Coffee', qty: 2, price: 240 }],
      cafe: [{ name: 'Cappuccino', qty: 2, price: 320 }, { name: 'Club Sandwich', qty: 1, price: 220 }, { name: 'Blueberry Muffin', qty: 2, price: 200 }],
      bar: [{ name: "Jack Daniel's", qty: 2, price: 700 }, { name: 'Kingfisher Beer', qty: 3, price: 540 }, { name: 'Chicken Wings', qty: 1, price: 320 }],
      bakery: [{ name: 'Sourdough Loaf', qty: 1, price: 180 }, { name: 'Chocolate Truffle', qty: 1, price: 450 }, { name: 'Croissant', qty: 4, price: 360 }],
      cloud_kitchen: [{ name: 'Chicken Biryani', qty: 2, price: 500 }, { name: 'Paneer Roll', qty: 1, price: 110 }, { name: 'Coca-Cola', qty: 2, price: 100 }],
      qsr: [{ name: 'Chicken Burger', qty: 2, price: 300 }, { name: 'French Fries', qty: 2, price: 160 }, { name: 'Oreo Shake', qty: 1, price: 150 }],
      ice_cream: [{ name: 'Belgian Chocolate', qty: 2, price: 180 }, { name: 'Hot Fudge Sundae', qty: 1, price: 220 }, { name: 'Mango Smoothie', qty: 1, price: 160 }],
      hotel: [{ name: 'Continental Breakfast', qty: 1, price: 450 }, { name: 'Club Sandwich', qty: 1, price: 320 }, { name: 'Cappuccino', qty: 2, price: 360 }],
    };
    return menus[businessType] || menus.restaurant;
  };

  const receiptItems = getReceiptItems();
  const receiptTotal = receiptItems.reduce((sum, i) => sum + i.price, 0);

  // ─── Styles ─────────────────────────────────────────────────
  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: isMobile ? '20px 16px 40px' : '32px 24px 60px',
    opacity: animating ? 0 : 1,
    transform: animating
      ? (direction === 'forward' ? 'translateX(40px)' : 'translateX(-40px)')
      : 'translateX(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowY: 'auto',
  };

  const btnPrimary = {
    padding: isMobile ? '14px 28px' : '14px 36px', borderRadius: '14px', border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '700',
    fontSize: '16px', cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: '8px', transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
  };

  const btnSecondary = {
    padding: '12px 24px', borderRadius: '12px', border: '1px solid #e5e7eb',
    background: 'white', color: '#374151', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: '8px',
  };

  const skipLink = {
    color: '#9ca3af', fontSize: '13px', cursor: 'pointer',
    border: 'none', background: 'none', textDecoration: 'underline',
    marginTop: '16px',
  };

  const progressPercent = ((step - 1) / 5) * 100;

  const heading = (text) => (
    <h2 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{text}</h2>
  );
  const subheading = (text) => (
    <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#6b7280', marginBottom: isMobile ? '24px' : '36px', lineHeight: 1.5 }}>{text}</p>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: STEP_BACKGROUNDS[step] || STEP_BACKGROUNDS[1],
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background 0.5s ease',
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes checkPop { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes confetti1 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-80px) rotate(360deg) translateX(40px); opacity: 0; } }
        @keyframes confetti2 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-70px) rotate(-270deg) translateX(-30px); opacity: 0; } }
        @keyframes confetti3 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-90px) rotate(180deg) translateX(20px); opacity: 0; } }
        @keyframes successRing { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes successCheck { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
        .ob-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .ob-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
        .ob-card:active { transform: scale(0.98); }
        .ob-fadeIn { animation: fadeInUp 0.5s ease forwards; }
        .ob-fadeIn-d1 { animation: fadeInUp 0.5s ease 0.1s forwards; opacity: 0; }
        .ob-fadeIn-d2 { animation: fadeInUp 0.5s ease 0.2s forwards; opacity: 0; }
        .ob-fadeIn-d3 { animation: fadeInUp 0.5s ease 0.3s forwards; opacity: 0; }
        .ob-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,0.4) !important; }
        .ob-input:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .ob-feature-card { transition: all 0.2s; cursor: pointer; }
        .ob-feature-card:hover { transform: scale(1.02); }
        .ob-float { animation: float 3s ease-in-out infinite; }
        .ob-progress-bar { transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* ─── Top Bar ──────────────────────────────────────── */}
      <div style={{
        padding: isMobile ? '14px 16px' : '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaUtensils size={15} color="white" />
          </div>
          {!isMobile && <span style={{ fontWeight: '800', fontSize: '18px', color: '#111827' }}>DineOpen</span>}
        </div>

        <div style={{ flex: 1, maxWidth: '360px', margin: '0 16px' }}>
          <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div className="ob-progress-bar" style={{
              height: '100%', borderRadius: '3px',
              background: 'linear-gradient(90deg, #ef4444, #f97316)',
              width: `${progressPercent}%`,
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '3px', fontWeight: '600' }}>
            {step} of 6
          </div>
        </div>

        <button onClick={skipEntireSetup} style={{
          color: '#9ca3af', fontSize: '13px', cursor: 'pointer',
          border: 'none', background: 'none', fontWeight: '600',
        }}>
          Skip all
        </button>
      </div>

      {/* ═══════════ STEP 1: Business Type ═══════════════════ */}
      {step === 1 && (
        <div style={contentStyle}>
          <div className="ob-fadeIn" style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
            {heading('Welcome to DineOpen!')}
            {subheading("Let's personalize your experience in 2 minutes.")}

            <p style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '20px' }}>
              What type of business do you run?
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? '10px' : '14px',
              maxWidth: '720px', margin: '0 auto 32px',
            }}>
              {BUSINESS_TYPES.map((bt, idx) => {
                const Icon = bt.icon;
                const selected = businessType === bt.id;
                const hovered = hoveredType === bt.id;
                return (
                  <div
                    key={bt.id}
                    className="ob-card"
                    onClick={() => {
                      setBusinessType(bt.id);
                      setTimeout(() => goNext(), 500);
                    }}
                    onMouseEnter={() => setHoveredType(bt.id)}
                    onMouseLeave={() => setHoveredType('')}
                    style={{
                      padding: isMobile ? '18px 12px' : '24px 16px',
                      borderRadius: '16px',
                      border: selected ? `2.5px solid ${bt.color}` : '2px solid rgba(0,0,0,0.06)',
                      backgroundColor: selected ? bt.bg : (hovered ? '#fafafa' : 'white'),
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      boxShadow: selected ? `0 8px 24px ${bt.color}20` : '0 2px 8px rgba(0,0,0,0.04)',
                      animation: `fadeInUp 0.4s ease ${idx * 0.05}s forwards`,
                      opacity: 0,
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {selected && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: bt.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'checkPop 0.3s ease',
                      }}>
                        <FaCheck size={10} color="white" />
                      </div>
                    )}
                    <div style={{
                      width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px',
                      borderRadius: '14px', background: bt.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.2s',
                      transform: (selected || hovered) ? 'scale(1.1)' : 'scale(1)',
                    }}>
                      <Icon size={isMobile ? 20 : 24} color={bt.color} />
                    </div>
                    <span style={{ fontWeight: '700', color: '#111827', fontSize: isMobile ? '13px' : '15px' }}>{bt.label}</span>
                    {!isMobile && <span style={{ fontSize: '12px', color: '#9ca3af' }}>{bt.desc}</span>}
                  </div>
                );
              })}
            </div>

            <button onClick={skipEntireSetup} style={skipLink}>
              Skip entire setup
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 2: Restaurant Details ═══════════════ */}
      {step === 2 && (
        <div style={contentStyle}>
          <div style={{
            maxWidth: '900px', width: '100%',
            display: isMobile ? 'flex' : 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
            flexDirection: 'column',
            gap: isMobile ? '28px' : '48px', alignItems: 'center',
          }}>
            {/* Left: Form */}
            <div className="ob-fadeIn">
              {heading('Tell us about your place')}
              {subheading('This appears on your bills, QR menu, and reports.')}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  {NAME_LABELS[businessType] || 'Restaurant Name'} *
                </label>
                <input
                  className="ob-input"
                  type="text"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder={NAME_PLACEHOLDERS[businessType] || 'e.g., The Spice House'}
                  autoFocus
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: '2px solid #e5e7eb', fontSize: '16px', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Country dropdown */}
              <div style={{ marginBottom: '28px' }} ref={countryDropdownRef}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Country
                </label>
                <div
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: countryDropdownOpen ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '16px', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', background: 'white',
                    boxShadow: countryDropdownOpen ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{selectedCountry.flag}</span>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{selectedCountry.name}</span>
                  </span>
                  <FaChevronDown size={12} color="#9ca3af" style={{
                    transition: 'transform 0.2s',
                    transform: countryDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }} />
                </div>

                {countryDropdownOpen && (
                  <div style={{
                    position: 'absolute', zIndex: 20, width: isMobile ? 'calc(100% - 32px)' : '380px',
                    marginTop: '4px', background: 'white', borderRadius: '14px',
                    border: '1px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    maxHeight: '280px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: '#f9fafb' }}>
                        <FaSearch size={12} color="#9ca3af" />
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          placeholder="Search countries..."
                          autoFocus
                          style={{
                            border: 'none', outline: 'none', background: 'transparent',
                            fontSize: '14px', width: '100%', color: '#374151',
                          }}
                        />
                        {countrySearch && (
                          <FaTimes size={10} color="#9ca3af" style={{ cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setCountrySearch(''); }}
                          />
                        )}
                      </div>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {filteredCountries.map(c => (
                        <div
                          key={c.code}
                          onClick={() => {
                            setSelectedCountry(c);
                            setCountryDropdownOpen(false);
                            setCountrySearch('');
                            localStorage.setItem('selectedCountryCode', c.code);
                            const cd = getCurrencyByCountryCode(c.code);
                            if (cd) setCurrencyInfo(cd);
                          }}
                          style={{
                            padding: '10px 16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: selectedCountry.code === c.code ? '#fef2f2' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = selectedCountry.code === c.code ? '#fef2f2' : '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = selectedCountry.code === c.code ? '#fef2f2' : 'transparent'}
                        >
                          <span style={{ fontSize: '20px' }}>{c.flag}</span>
                          <span style={{ fontSize: '14px', color: '#374151', fontWeight: selectedCountry.code === c.code ? '700' : '500' }}>{c.name}</span>
                          {selectedCountry.code === c.code && <FaCheck size={12} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                        </div>
                      ))}
                      {filteredCountries.length === 0 && countrySearch.trim() && (
                        <div
                          onClick={() => {
                            const custom = { code: 'OTHER', name: countrySearch.trim(), flag: '🌍' };
                            setSelectedCountry(custom);
                            setCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                          style={{
                            padding: '12px 16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '20px' }}>🌍</span>
                          <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                            Use &quot;{countrySearch.trim()}&quot;
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={goBack} style={btnSecondary}>
                  <FaArrowLeft size={12} /> Back
                </button>
                <button
                  className="ob-btn"
                  onClick={handleCreateRestaurant}
                  disabled={!restaurantName.trim() || creating}
                  style={{ ...btnPrimary, opacity: (!restaurantName.trim() || creating) ? 0.5 : 1 }}
                >
                  {creating ? 'Setting up...' : 'Continue'} <FaArrowRight size={14} />
                </button>
              </div>
              <button onClick={handleSkipStep2} style={skipLink}>Skip this step</button>
            </div>

            {/* Right: Live receipt preview */}
            <div className="ob-fadeIn-d2 ob-float" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: isMobile ? '260px' : '290px', background: 'white', borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: '28px 24px',
                border: '1px solid rgba(0,0,0,0.06)', position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '12px', background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, #f1f5f9 4px, #f1f5f9 8px)', borderRadius: '0 0 4px 4px' }} />

                <div style={{ textAlign: 'center', paddingBottom: '16px', marginBottom: '14px', borderBottom: '1.5px dashed #e5e7eb' }}>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '8px 0 2px', letterSpacing: '-0.01em' }}>
                    {restaurantName || `Your ${businessLabel}`}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{selectedCountry.flag} {selectedCountry.name}</p>
                  <p style={{ fontSize: '11px', color: '#d1d5db', margin: '4px 0 0' }}>
                    {new Date().toLocaleDateString(currencyInfo?.locale || 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Bill #001
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</span>
                </div>

                {receiptItems.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                    borderBottom: i < receiptItems.length - 1 ? '1px dotted #f3f4f6' : 'none',
                  }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{item.name}</span>
                      {item.qty > 1 && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>x{item.qty}</span>}
                    </div>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(item.price)}</span>
                  </div>
                ))}

                <div style={{
                  borderTop: '2px dashed #e5e7eb', marginTop: '12px', paddingTop: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>Total</span>
                  <span style={{ fontWeight: '900', color: '#ef4444', fontSize: '22px' }}>{fmtPrice(receiptTotal)}</span>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e5e7eb', textAlign: 'center' }}>
                  <div style={{
                    width: '56px', height: '56px', margin: '0 auto 6px',
                    background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FaQrcode size={28} color="#d1d5db" />
                  </div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Scan to pay | Powered by DineOpen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 3: Feature Selection ═══════════════ */}
      {step === 3 && (
        <div style={contentStyle}>
          <div style={{ maxWidth: '860px', width: '100%', textAlign: 'center' }}>
            <div className="ob-fadeIn">
              {heading('What would you like to use?')}
              {subheading('Pick the features you need — change anytime from Settings.')}

              {/* All features FREE badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 16px', borderRadius: '20px',
                background: 'linear-gradient(135deg, #fef2f2, #fff7ed)',
                border: '1px solid #fecaca',
                marginBottom: '24px',
              }}>
                <FaCrown size={12} color="#f59e0b" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>All features are FREE</span>
              </div>
            </div>

            <div className="ob-fadeIn-d1" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '12px', textAlign: 'left', marginBottom: '28px',
            }}>
              {FEATURES.map(f => {
                const Icon = f.icon;
                const selected = selectedFeatures.includes(f.id);
                const isLocked = f.id === 'pos';
                return (
                  <div
                    key={f.id}
                    className="ob-feature-card"
                    onClick={() => {
                      if (isLocked) return;
                      setSelectedFeatures(prev =>
                        prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                      );
                    }}
                    style={{
                      padding: '14px 16px', borderRadius: '14px',
                      border: selected ? `2px solid ${f.color}` : '2px solid rgba(0,0,0,0.06)',
                      backgroundColor: selected ? `${f.color}08` : 'white',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      cursor: isLocked ? 'default' : 'pointer',
                      boxShadow: selected ? `0 4px 16px ${f.color}15` : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                      background: selected ? `${f.color}15` : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={19} color={selected ? f.color : '#9ca3af'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>{f.label}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.desc}</p>
                    </div>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
                      border: selected ? `2px solid ${f.color}` : '2px solid #d1d5db',
                      background: selected ? f.color : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {selected && <FaCheck size={10} color="white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected features summary */}
            <div className="ob-fadeIn-d2" style={{
              display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: '28px',
            }}>
              {selectedFeatures.map(fId => {
                const f = FEATURES.find(x => x.id === fId);
                if (!f) return null;
                const Icon = f.icon;
                return (
                  <span key={fId} style={{
                    padding: '5px 12px', borderRadius: '10px',
                    background: `${f.color}10`, border: `1px solid ${f.color}30`,
                    fontSize: '12px', fontWeight: '600', color: f.color,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Icon size={10} /> {f.label}
                  </span>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={goBack} style={btnSecondary}><FaArrowLeft size={12} /> Back</button>
              <button className="ob-btn" onClick={handleSaveFeatures} style={btnPrimary}>
                Continue <FaArrowRight size={14} />
              </button>
            </div>
            <button onClick={() => goNext()} style={skipLink}>Skip — enable everything</button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 4: Menu Setup ═══════════════════════ */}
      {step === 4 && (
        <div style={contentStyle}>
          <div style={{ maxWidth: '820px', width: '100%' }}>
            <div className="ob-fadeIn" style={{ textAlign: 'center' }}>
              {heading("Let's get your menu ready")}
              {subheading("Your menu powers your QR ordering, POS, and online presence.")}
            </div>

            {/* Two-column: Upload vs Ready-made */}
            <div className="ob-fadeIn-d1" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px', marginBottom: '16px',
            }}>
              {/* Upload Menu */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="ob-card"
                style={{
                  padding: '24px', borderRadius: '18px', cursor: 'pointer',
                  border: '2px solid #8b5cf6', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                  textAlign: 'center', position: 'relative',
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple
                  onChange={handleMenuUpload} style={{ display: 'none' }}
                />
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'white', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.15)',
                }}>
                  <FaUpload size={22} color="#8b5cf6" />
                </div>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#5b21b6', margin: '0 0 6px' }}>Upload Your Menu</p>
                <p style={{ fontSize: '13px', color: '#7c3aed', margin: 0, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  <FaMagic size={11} /> AI extracts all items in 60 seconds
                </p>
                {uploading && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: 'white' }}>
                    <p style={{ fontSize: '13px', color: '#7c3aed', fontWeight: '600', margin: 0 }}>{uploadProgress}</p>
                  </div>
                )}
                {uploadedCount > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: '#f0fdf4' }}>
                    <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', margin: 0 }}>
                      {uploadedCount} items extracted!
                    </p>
                  </div>
                )}
              </div>

              {/* Ready-made menu */}
              <div
                onClick={handleSeedMenu}
                className="ob-card"
                style={{
                  padding: '24px', borderRadius: '18px', cursor: 'pointer',
                  border: '2px solid #f59e0b', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  textAlign: 'center', position: 'relative',
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'white', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.15)',
                }}>
                  <FaUtensils size={22} color="#f59e0b" />
                </div>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#92400e', margin: '0 0 6px' }}>
                  Start with Sample Menu
                </p>
                <p style={{ fontSize: '13px', color: '#d97706', margin: '0 0 12px', lineHeight: 1.4 }}>
                  36 popular {businessLabel.toLowerCase()} items. Edit anytime.
                </p>
                {/* Mini preview */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(getDefaultMenu(businessType || 'restaurant') || []).slice(0, 4).map((item, i) => (
                    <span key={i} style={{
                      padding: '3px 8px', borderRadius: '6px', background: 'white',
                      fontSize: '11px', color: '#374151', fontWeight: '500',
                    }}>
                      {item.name} <span style={{ color: '#d97706', fontWeight: '700' }}>{fmtPrice(item.price)}</span>
                    </span>
                  ))}
                  <span style={{ fontSize: '11px', color: '#6b7280', padding: '3px 4px' }}>+32 more</span>
                </div>
                {seeding && <p style={{ marginTop: '10px', color: '#d97706', fontWeight: '700', fontSize: '13px' }}>Loading menu...</p>}
                {menuSeeded && <p style={{ marginTop: '10px', color: '#16a34a', fontWeight: '700', fontSize: '13px' }}>Menu loaded!</p>}
              </div>
            </div>

            {/* WhatsApp option */}
            <div className="ob-fadeIn-d2 ob-card" onClick={handleWhatsAppSetup} style={{
              padding: '18px 24px', borderRadius: '16px', cursor: 'pointer',
              border: '2px solid #25D366', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              display: 'flex', alignItems: 'center', gap: '16px',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaWhatsapp size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '15px', color: '#166534', margin: '0 0 2px' }}>
                  Send menu on WhatsApp — we set it up FREE
                </p>
                <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>
                  Just send a photo of your menu card. We&apos;ll add all items in 5 minutes.
                </p>
              </div>
              <FaArrowRight size={14} color="#25D366" />
            </div>

            {/* QR Feature Highlight */}
            <div className="ob-fadeIn-d3" style={{
              padding: '20px 24px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '1px solid #bfdbfe', marginBottom: '24px',
              display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px', flexShrink: 0,
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}>
                <FaQrcode size={28} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '15px', color: '#1e40af', margin: '0 0 4px' }}>
                  Your customers get a FREE QR menu
                </p>
                <p style={{ fontSize: '13px', color: '#3b82f6', margin: 0, lineHeight: 1.4 }}>
                  Once your menu is ready, customers can scan a QR code at their table to browse your menu, place orders, and even pay — all from their phone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={goBack} style={btnSecondary}><FaArrowLeft size={12} /> Back</button>
              <button onClick={handleManualMenu} style={{ ...skipLink, marginTop: 0, fontSize: '14px' }}>
                I&apos;ll add items later
              </button>
            </div>
            <button onClick={handleManualMenu} style={skipLink}>Skip — use demo menu</button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 5: Your Restaurant is Ready ═══════════ */}
      {step === 5 && (
        <div style={contentStyle}>
          <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            {/* Animated success checkmark */}
            <div className="ob-fadeIn" style={{ marginBottom: '8px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'successRing 0.6s ease forwards',
                boxShadow: '0 8px 30px rgba(239,68,68,0.3)',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    style={{ strokeDasharray: 50, animation: 'successCheck 0.4s ease 0.3s forwards', strokeDashoffset: 50 }}
                  />
                </svg>
              </div>
              {heading(`Your ${businessLabel.toLowerCase()} is ready!`)}
              {subheading('Share your QR menu and take your first order.')}
            </div>

            {/* Two-column: QR code + Quick actions */}
            <div className="ob-fadeIn-d1" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px', marginBottom: '28px', textAlign: 'left',
            }}>
              {/* QR Code card */}
              <div style={{
                background: 'white', borderRadius: '20px', padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center',
              }}>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#111827', margin: '0 0 4px' }}>Your QR Menu</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>Customers scan this to order</p>

                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" style={{
                    width: '180px', height: '180px', margin: '0 auto 16px', display: 'block',
                    borderRadius: '12px', border: '1px solid #f1f5f9',
                  }} />
                ) : (
                  <div style={{
                    width: '180px', height: '180px', margin: '0 auto 16px',
                    background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FaQrcode size={60} color="#d1d5db" />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={handleDownloadQR} style={{
                    padding: '8px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: '600', color: '#374151',
                  }}>
                    <FaDownload size={11} /> Download
                  </button>
                  <button onClick={handleCopyLink} style={{
                    padding: '8px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    background: copySuccess ? '#f0fdf4' : 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: '600', color: copySuccess ? '#16a34a' : '#374151',
                    transition: 'all 0.2s',
                  }}>
                    <FaLink size={11} /> {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Quick actions card */}
              <div style={{
                background: 'white', borderRadius: '20px', padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#111827', margin: '0 0 4px' }}>Quick Actions</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>Get started in 30 seconds</p>

                {[
                  { icon: FaRocket, label: 'Take your first order', desc: 'Open POS dashboard', color: '#ef4444', bg: '#fef2f2', onClick: () => router.push(posPath) },
                  { icon: FaQrcode, label: 'View your QR menu', desc: 'See what customers see', color: '#3b82f6', bg: '#eff6ff', onClick: () => qrUrl && window.open(qrUrl, '_blank') },
                  { icon: FaCashRegister, label: 'Set up printer', desc: 'Print bills & KOT', color: '#f97316', bg: '#fff7ed', onClick: () => router.push('/admin?tab=print') },
                  { icon: FaUsers, label: 'Invite staff', desc: 'Add your team', color: '#8b5cf6', bg: '#f5f3ff', onClick: () => router.push('/admin?tab=staff') },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={i}
                      onClick={action.onClick}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        marginBottom: i < 3 ? '8px' : 0,
                        transition: 'background 0.15s',
                        background: 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = action.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={16} color={action.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>{action.label}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{action.desc}</p>
                      </div>
                      <FaArrowRight size={11} color="#d1d5db" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature badges */}
            <div className="ob-fadeIn-d2" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '10px', marginBottom: '16px',
            }}>
              {[
                { icon: FaQrcode, label: 'QR Menu', desc: 'Ready to use', color: '#3b82f6', bg: '#eff6ff' },
                { icon: FaChair, label: 'Tables', desc: 'Floor plan ready', color: '#8b5cf6', bg: '#f5f3ff' },
                { icon: FaGift, label: 'Loyalty', desc: 'Reward customers', color: '#ec4899', bg: '#fdf2f8' },
                { icon: FaCrown, label: 'AI Voice', desc: 'Voice ordering', color: '#f59e0b', bg: '#fffbeb' },
              ].map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={i} style={{ padding: '14px', borderRadius: '14px', background: tip.bg, textAlign: 'center' }}>
                    <Icon size={18} color={tip.color} style={{ marginBottom: '4px' }} />
                    <p style={{ fontWeight: '700', fontSize: '13px', color: tip.color, margin: 0 }}>{tip.label}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>{tip.desc}</p>
                  </div>
                );
              })}
            </div>

            <button onClick={goNext} style={skipLink}>Skip to setup checklist</button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 6: Checklist ═══════════════════════ */}
      {step === 6 && (
        <div style={contentStyle}>
          <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
            <div className="ob-fadeIn" style={{ position: 'relative' }}>
              {/* Confetti */}
              <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                {['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'].map((color, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: '8px', height: '8px', borderRadius: i % 2 === 0 ? '50%' : '2px',
                    background: color,
                    left: `${(i - 3) * 25}px`, top: 0,
                    animation: `confetti${(i % 3) + 1} 1.2s ease ${i * 0.1}s forwards`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚀</div>
              {heading("You're all set!")}
              {subheading("Here's your progress and what's next.")}
            </div>

            {/* Checklist card */}
            <div className="ob-fadeIn-d1" style={{
              background: 'white', borderRadius: '20px', padding: isMobile ? '20px' : '28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)', textAlign: 'left',
              marginBottom: '24px', border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#111827', margin: 0 }}>Setup Progress</p>
                <span style={{
                  fontSize: '13px', fontWeight: '800', padding: '4px 12px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fef2f2, #fff7ed)', color: '#ef4444',
                }}>
                  {checklistItems.length > 0 ? Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100) : 0}%
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '20px' }}>
                <div className="ob-progress-bar" style={{
                  height: '100%', borderRadius: '3px',
                  background: 'linear-gradient(90deg, #ef4444, #f97316)',
                  width: `${checklistItems.length > 0 ? (checklistItems.filter(i => i.done).length / checklistItems.length) * 100 : 0}%`,
                }} />
              </div>
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.link && !item.done && router.push(item.link)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 10px', borderRadius: '10px',
                    background: item.done ? '#f0fdf4' : (item.link ? '#fafafa' : 'transparent'),
                    marginBottom: '6px',
                    cursor: item.link && !item.done ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: item.done ? '#10b981' : 'rgba(0,0,0,0.04)',
                    border: item.done ? 'none' : '2px solid #d1d5db',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...(item.done ? { animation: 'checkPop 0.3s ease' } : {}),
                  }}>
                    {item.done && <FaCheck size={10} color="white" />}
                  </div>
                  <span style={{
                    fontSize: '14px', color: item.done ? '#6b7280' : '#374151',
                    fontWeight: item.done ? '500' : '600',
                    textDecoration: item.done ? 'line-through' : 'none',
                    flex: 1,
                  }}>
                    {item.label}
                  </span>
                  {item.link && !item.done && <FaArrowRight size={11} color="#9ca3af" />}
                </div>
              ))}
            </div>

            {/* Explore DineOpen */}
            <p className="ob-fadeIn-d2" style={{ fontWeight: '800', fontSize: '16px', color: '#111827', marginBottom: '12px' }}>
              Explore DineOpen
            </p>
            <div className="ob-fadeIn-d2" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '10px', marginBottom: '28px',
            }}>
              {[
                { icon: FaCashRegister, label: 'POS & Billing', desc: 'Take orders fast', color: '#ef4444', bg: 'linear-gradient(135deg, #fef2f2, #fecaca)', link: posPath },
                { icon: FaQrcode, label: 'QR Menu', desc: 'Digital menu', color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff, #bfdbfe)', link: '/menu' },
                { icon: FaCrown, label: 'AI Voice', desc: 'Voice ordering', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fde68a)', link: '/dineai' },
                { icon: FaGift, label: 'Loyalty', desc: 'Customer rewards', color: '#ec4899', bg: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)', link: '/customers' },
              ].map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={i}
                    className="ob-card"
                    onClick={() => router.push(tip.link)}
                    style={{
                      padding: '16px', borderRadius: '14px', background: tip.bg,
                      cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    <Icon size={20} color={tip.color} style={{ marginBottom: '6px' }} />
                    <p style={{ fontWeight: '700', fontSize: '13px', color: tip.color, margin: 0 }}>{tip.label}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>{tip.desc}</p>
                  </div>
                );
              })}
            </div>

            <button
              className="ob-btn"
              onClick={() => router.push('/home')}
              style={{
                ...btnPrimary, fontSize: '18px', padding: '16px 48px',
                margin: '0 auto', borderRadius: '16px',
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                boxShadow: '0 6px 20px rgba(239,68,68,0.3)',
              }}
            >
              Go to Dashboard <FaArrowRight size={16} />
            </button>

            <p style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
              Need help?{' '}
              <a href="https://wa.me/917042330092" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: '700', textDecoration: 'none' }}>
                <FaWhatsapp size={14} style={{ verticalAlign: 'middle' }} /> WhatsApp us
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ─── Smart AI Chat (reuses ChatbotInterface) ─────────── */}
      {step >= 2 && step <= 5 && restaurantId && (
        <ChatbotInterface
          restaurantId={restaurantId}
          userId={null}
        />
      )}
    </div>
  );
}
