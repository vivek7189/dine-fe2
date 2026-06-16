'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUtensils, FaCoffee, FaBeer, FaBreadSlice, FaIceCream, FaHamburger, FaHotel, FaFire, FaArrowRight, FaArrowLeft, FaCheck, FaWhatsapp, FaChair, FaBoxes, FaUsers, FaCalendarAlt, FaQrcode, FaFileInvoice, FaCashRegister, FaClipboardList, FaRocket, FaUpload, FaGift, FaPercent, FaCrown, FaSearch, FaChevronDown, FaTimes, FaDownload, FaLink, FaMagic, FaGlobe, FaMobileAlt, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronRight, FaWifi, FaPrint, FaChartLine, FaBolt, FaStar, FaRobot, FaGoogle } from 'react-icons/fa';
import QRCode from 'qrcode';
import apiClient from '../../lib/api';
import { getDefaultMenu, getDefaultCategories } from '../../lib/defaultMenus';
import ChatbotInterface from '../../components/ChatbotInterface';
import { getCurrencyByCountryCode } from '../../lib/currencyData';
import { detectAndSetCountry, formatPriceWithCurrency } from '../../lib/detectCountry';
import { t, getCurrentLanguage, setLanguage, getAvailableLanguages } from '../../lib/i18n';

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
  { id: 'other', label: 'Other', icon: FaUtensils, color: '#6b7280', bg: '#f3f4f6', desc: 'Something else', emoji: '🏪' },
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
  other: 'e.g., My Business Name',
};

// ─── Cuisine Options ──────────────────────────────────────────
const CUISINE_OPTIONS = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Korean',
  'American', 'Mediterranean', 'French', 'Vietnamese', 'Middle Eastern',
  'Continental', 'South Indian', 'North Indian', 'Mughlai', 'Bengali',
  'Punjabi', 'Gujarati', 'Street Food', 'Fast Food', 'Seafood',
  'Bakery & Desserts', 'Biryani', 'Pizza', 'Burger', 'Sushi',
  'BBQ & Grill', 'Healthy & Salads', 'Vegan', 'Multi-Cuisine',
];

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
  other: 'Business Name',
};

// ─── Feature Map ───────────────────────────────────────────────
const FEATURES = [
  { id: 'pos', label: 'Billing & POS', icon: FaCashRegister, desc: 'Take orders & print bills instantly', color: '#ef4444' },
  { id: 'tables', label: 'Table Management', icon: FaChair, desc: 'Visual floor plan & reservations', color: '#3b82f6' },
  { id: 'kot', label: 'Kitchen Display (KOT)', icon: FaFire, desc: 'Auto-send orders to kitchen', color: '#f97316' },
  { id: 'menu', label: 'QR Menu & Ordering', icon: FaQrcode, desc: 'Customers scan & order from phone', color: '#0ea5e9' },
  { id: 'inventory', label: 'Inventory & Recipes', icon: FaBoxes, desc: 'Track stock, recipes & costs', color: '#059669' },
  { id: 'shifts', label: 'Staff & Shifts', icon: FaCalendarAlt, desc: 'Schedule & manage team roles', color: '#0ea5e9' },
  { id: 'customers', label: 'Customer Loyalty', icon: FaUsers, desc: 'Rewards, points & WhatsApp CRM', color: '#ec4899' },
  { id: 'hotel', label: 'Hotel / Room Service', icon: FaHotel, desc: 'Room management & service', color: '#3b82f6' },
  { id: 'invoice', label: 'Invoice & Expenses', icon: FaFileInvoice, desc: 'Professional GST invoices', color: '#0d9488' },
  { id: 'dineai', label: 'DineAI Studio', icon: FaRobot, desc: 'AI voice ordering & insights', color: '#6366f1' },
  { id: 'google-reviews', label: 'Google Reviews', icon: FaGoogle, desc: 'Monitor & respond to reviews', color: '#ea4335' },
];

// Smart defaults per business type
const FEATURE_DEFAULTS = {
  restaurant: ['pos', 'tables', 'kot', 'menu'],
  cafe: ['pos', 'tables', 'kot', 'menu'],
  bar: ['pos', 'tables', 'kot', 'menu'],
  bakery: ['pos', 'tables', 'kot', 'menu'],
  cloud_kitchen: ['pos', 'tables', 'kot', 'menu'],
  qsr: ['pos', 'tables', 'kot', 'menu'],
  ice_cream: ['pos', 'tables', 'kot', 'menu'],
  hotel: ['pos', 'tables', 'kot', 'menu'],
  other: ['pos', 'tables', 'kot', 'menu'],
};

// Step backgrounds
const STEP_BACKGROUNDS = {
  1: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 50%, #fef3c7 100%)',
  2: 'linear-gradient(180deg, #ffffff 0%, #fefce8 50%, #fef9c3 100%)',
  3: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 50%, #dcfce7 100%)',
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
  const initialStep = parseInt(searchParams.get('step')) || 1;
  const [step, setStep] = useState(initialStep);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [isMobile, setIsMobile] = useState(false);

  // Language
  const [currentLang, setCurrentLang] = useState('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (code) => {
    setLanguage(code);
    setCurrentLang(code);
    setLangDropdownOpen(false);
  };

  const ob = (key, params) => t(`onboarding.${key}`, params);

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
  const [selectedFeatures, setSelectedFeatures] = useState(['pos', 'tables', 'kot', 'menu']);

  // Step 4
  const [menuChoice, setMenuChoice] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [menuSeeded, setMenuSeeded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadProgressPct, setUploadProgressPct] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const [previewTheme, setPreviewTheme] = useState('default');
  const [menuPreviewQr, setMenuPreviewQr] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // Step 5
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('');

  // Step 2 — optional expandable fields
  const [showTimings, setShowTimings] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCuisine, setShowCuisine] = useState(false);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantEmail, setRestaurantEmail] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [cuisineDropdownOpen, setCuisineDropdownOpen] = useState(false);

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
    // Set initial step in URL if not present
    if (!window.location.search.includes('step=')) {
      window.history.replaceState({}, '', `/onboarding?step=${initialStep}`);
    }
    return () => window.removeEventListener('resize', check);
  }, []);

  // Check auth + load saved onboarding progress
  useEffect(() => {
    if (isTestMode) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    // If already completed onboarding, redirect to home
    if (localStorage.getItem('onboarding_completed') === 'true') {
      router.replace('/home');
      return;
    }
    // Try to restore onboarding progress from DB
    const savedRid = localStorage.getItem('selectedRestaurantId');
    if (savedRid) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      fetch(`${apiUrl}/api/restaurants/${savedRid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const rest = data.restaurant || data;
          // Redirect if onboarding was already completed
          if (rest.onboardingStep === 'complete') {
            localStorage.setItem('onboarding_completed', 'true');
            router.replace('/home');
            return;
          }
          // Restore state from saved restaurant
          if (rest.businessType) setBusinessType(rest.businessType);
          if (rest.name) setRestaurantName(rest.name);
          setRestaurantId(savedRid);
          // Resume from saved step (URL param takes priority)
          const urlStep = parseInt(new URLSearchParams(window.location.search).get('step'));
          const savedStep = typeof rest.onboardingStep === 'number' ? rest.onboardingStep : null;
          const resumeStep = urlStep || savedStep || 1;
          if (resumeStep > 1) {
            setStep(resumeStep);
            window.history.replaceState({}, '', `/onboarding?step=${resumeStep}`);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Set smart feature defaults when business type changes
  useEffect(() => {
    if (businessType) {
      setSelectedFeatures(FEATURE_DEFAULTS[businessType] || ['pos']);
    }
  }, [businessType]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
      // Close cuisine dropdown if clicking outside
      if (!e.target.closest('[data-cuisine-dropdown]')) {
        setCuisineDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Generate QR code preview for step 4
  useEffect(() => {
    if (step === 4) {
      const url = restaurantSlug
        ? `https://dineopen.com/${restaurantSlug}`
        : restaurantId
          ? `https://dineopen.com/placeorder?restaurant=${restaurantId}`
          : 'https://dineopen.com/placeorder/demo';
      QRCode.toDataURL(url, {
        width: 160,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      }).then(setMenuPreviewQr).catch(() => {});
    }
  }, [step, restaurantId, restaurantSlug]);

  // Generate QR code when reaching step 5
  useEffect(() => {
    if (step === 5 && restaurantId) {
      const url = restaurantSlug
        ? `https://dineopen.com/${restaurantSlug}`
        : `https://dineopen.com/placeorder?restaurant=${restaurantId}`;
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      }).then(setQrCodeDataUrl).catch(() => {});
    }
  }, [step, restaurantId, restaurantSlug]);

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
      // Update URL
      const params = new URLSearchParams(window.location.search);
      params.set('step', nextStep);
      window.history.replaceState({}, '', `/onboarding?${params.toString()}`);
      // Save step to DB (fire-and-forget)
      const rid = restaurantId || localStorage.getItem('selectedRestaurantId');
      if (rid) {
        const token = localStorage.getItem('authToken');
        if (token) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
          fetch(`${apiUrl}/api/restaurants/${rid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ onboardingStep: nextStep }),
          }).catch(() => {});
        }
      }
    }, 300);
  };

  const goNext = () => goTo(step + 1, 'forward');
  const goBack = () => goTo(step - 1, 'back');

  // POS path based on business type
  const posPath = businessType === 'bar' ? '/dashboard/bar' : '/dashboard';

  const businessLabel = businessType === 'other' ? 'Business' : (BUSINESS_TYPES.find(b => b.id === businessType)?.label || 'Restaurant');

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
        const countryCode = selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN';
        try { await apiClient.seedDefaultMenu(response.restaurant.id, countryCode); } catch {}
        try {
          const currencyData = getCurrencyByCountryCode(countryCode);
          await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
        } catch {}
      }
      localStorage.setItem('onboarding_completed', 'true');
      router.replace('/home');
    } catch (err) {
      console.error('Skip setup error:', err);
      localStorage.setItem('onboarding_completed', 'true');
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
      const parsedCuisine = selectedCuisines.length > 0 ? selectedCuisines : (cuisineTypes.trim() ? cuisineTypes.split(',').map(c => c.trim()).filter(Boolean) : ['Indian']);
      const response = await apiClient.createRestaurant({
        name: restaurantName.trim(),
        businessType: businessType || 'restaurant',
        address: restaurantAddress.trim(), phone: restaurantPhone.trim(), email: restaurantEmail.trim(),
        cuisine: parsedCuisine, description: '',
        operatingHours: { open: openTime, close: closeTime }
      });
      const rid = response.restaurant.id;
      setRestaurantId(rid);
      if (response.restaurant.urlSlug) setRestaurantSlug(response.restaurant.urlSlug);
      localStorage.setItem('selectedRestaurantId', rid);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));
      const countryCode = selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN';
      try {
        const currencyData = getCurrencyByCountryCode(countryCode);
        await apiClient.updateCurrencySettings(rid, currencyData);
      } catch {}
      // Auto-seed sample menu in background so the preview works immediately
      apiClient.seedDefaultMenu(rid, selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN').then(() => setMenuSeeded(true)).catch(() => {});
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
      await apiClient.seedDefaultMenu(restaurantId, selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN');
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
    window.open(`https://wa.me/919528632779?text=${msg}`, '_blank');
    goNext();
  };

  const handleMenuUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const rid = restaurantId || localStorage.getItem('selectedRestaurantId');
    if (!rid && !isTestMode) {
      setUploadError('Please set up your restaurant first (Step 2).');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress('Uploading menu images...');
    setUploadProgressPct(10);

    if (isTestMode) {
      setTimeout(() => { setUploadProgress('AI is analyzing your menu...'); setUploadProgressPct(40); }, 500);
      setTimeout(() => { setUploadProgress('Extracting items & prices...'); setUploadProgressPct(70); }, 1200);
      setTimeout(() => { setUploadProgress('Saving to your menu...'); setUploadProgressPct(90); }, 1800);
      setTimeout(() => { setUploadedCount(24); setUploading(false); setUploadProgress(''); setUploadProgressPct(100); setMenuSeeded(true); }, 2400);
      return;
    }

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('menuFiles', file));

      setUploadProgress('AI is reading your menu...');
      setUploadProgressPct(25);

      // Simulate progress while waiting for AI
      const progressTimer = setInterval(() => {
        setUploadProgressPct(prev => Math.min(prev + 3, 75));
      }, 800);

      const response = await apiClient.bulkUploadMenu(rid, formData);
      clearInterval(progressTimer);

      if (response.success && response.data?.length > 0) {
        const allMenuItems = response.data.flatMap(m => m.menuItems);
        if (allMenuItems.length > 0) {
          setUploadProgress(`Found ${allMenuItems.length} items — saving...`);
          setUploadProgressPct(85);
          const saveResponse = await apiClient.bulkSaveMenuItems(rid, allMenuItems, response.extractedCategories || []);
          setUploadedCount(saveResponse.savedCount || allMenuItems.length);
          setUploadProgressPct(100);
          setMenuSeeded(true);
          setIframeKey(k => k + 1); // Force iframe refresh to show uploaded menu
        } else {
          setUploadError('no-items');
        }
      } else {
        setUploadError('no-items');
      }
    } catch (err) {
      console.error('Menu upload error:', err);
      setUploadError('failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleManualMenu = () => {
    if (!isTestMode && restaurantId) {
      apiClient.seedDefaultMenu(restaurantId, selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN').catch(() => {});
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
      if (response.restaurant.urlSlug) setRestaurantSlug(response.restaurant.urlSlug);
      localStorage.setItem('selectedRestaurantId', response.restaurant.id);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));
      const countryCode = selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN';
      try {
        const currencyData = getCurrencyByCountryCode(countryCode);
        await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
      } catch {}
      apiClient.seedDefaultMenu(response.restaurant.id, selectedCountry?.code || localStorage.getItem('selectedCountryCode') || 'IN').then(() => setMenuSeeded(true)).catch(() => {});
      goNext();
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  // ─── Step 5: QR helpers ───────────────────────────────────────
  const qrUrl = restaurantSlug ? `https://dineopen.com/${restaurantSlug}` : (restaurantId ? `https://dineopen.com/placeorder?restaurant=${restaurantId}` : '');

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes checkPop { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes confetti1 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-80px) rotate(360deg) translateX(40px); opacity: 0; } }
        @keyframes confetti2 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-70px) rotate(-270deg) translateX(-30px); opacity: 0; } }
        @keyframes confetti3 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-90px) rotate(180deg) translateX(20px); opacity: 0; } }
        @keyframes successRing { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes successCheck { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
        @keyframes loadingBar { 0% { width: 5%; } 50% { width: 70%; } 80% { width: 85%; } 100% { width: 95%; } }
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
        @keyframes ob-nudge { 0%, 100% { transform: translateX(0); } 15% { transform: translateX(-4px); } 30% { transform: translateX(4px); } 45% { transform: translateX(-2px); } 60% { transform: translateX(2px); } }
        .ob-upload-nudge { animation: ob-nudge 0.5s ease 1.5s 2, float 3s ease-in-out 3s infinite; box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
        .ob-upload-nudge:not(:hover) { box-shadow: 0 4px 15px rgba(239,68,68,0.15); }
        .ob-progress-bar { transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* ─── Top Bar ──────────────────────────────────────── */}
      <div style={{
        padding: isMobile ? '14px 16px' : '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
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
            {step} {ob('of')} 6
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language switcher */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setLangDropdownOpen(!langDropdownOpen); }}
              style={{
                background: langDropdownOpen ? '#f9fafb' : 'white', border: '1.5px solid #e5e7eb', borderRadius: '10px',
                padding: '8px 14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                color: '#374151', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: '16px' }}>{getAvailableLanguages().find(l => l.code === currentLang)?.flag || '🌐'}</span>
              <span>{currentLang.toUpperCase()}</span>
              <FaChevronDown size={9} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {langDropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setLangDropdownOpen(false)} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '6px', zIndex: 1000,
                  background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)', minWidth: '180px', overflow: 'hidden',
                  padding: '4px 0',
                }}>
                  {getAvailableLanguages().map(lang => (
                    <button key={lang.code} onClick={() => handleLangChange(lang.code)} style={{
                      width: '100%', padding: '10px 16px', border: 'none',
                      background: currentLang === lang.code ? '#fef2f2' : 'transparent',
                      color: currentLang === lang.code ? '#ef4444' : '#374151',
                      fontSize: '14px', fontWeight: currentLang === lang.code ? '700' : '500',
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => { if (currentLang !== lang.code) e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { if (currentLang !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: '16px' }}>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      {currentLang === lang.code && <FaCheck size={10} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={skipEntireSetup} style={{
            color: '#9ca3af', fontSize: '13px', cursor: 'pointer',
            border: 'none', background: 'none', fontWeight: '600',
          }}>
            {ob('skipAll')}
          </button>
        </div>
      </div>

      {/* ═══════════ STEP 1: Business Type ═══════════════════ */}
      {step === 1 && (
        <div style={contentStyle}>
          <div className="ob-fadeIn" style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
            {heading(ob('welcome'))}
            {subheading(ob('personalizeIn2Min'))}

            <p style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '20px' }}>
              {ob('whatBusiness')}
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
              {ob('skipEntireSetup')}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 2: Restaurant Details ═══════════════ */}
      {step === 2 && (
        <div style={contentStyle}>
          {/* Full-screen loading overlay when creating */}
          {creating && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              animation: 'fadeInUp 0.3s ease',
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', marginBottom: '20px',
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 1.5s ease infinite',
                boxShadow: '0 8px 30px rgba(239,68,68,0.25)',
              }}>
                <FaUtensils size={28} color="white" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>{ob('settingUpYour', { type: businessLabel.toLowerCase() })}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{ob('creatingMenuQr')}</p>
              <div style={{ marginTop: '24px', width: '200px', height: '4px', borderRadius: '2px', background: '#f3f4f6', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  background: 'linear-gradient(90deg, #ef4444, #f97316)',
                  animation: 'loadingBar 2s ease infinite',
                }} />
              </div>
            </div>
          )}

          {/* Sticky top navigation — Back left, Continue right */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 20, width: '100%', maxWidth: '1000px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', marginBottom: '8px',
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
          }}>
            <button onClick={goBack} style={btnSecondary}><FaArrowLeft size={12} /> {ob('back')}</button>
            <button
              className="ob-btn"
              onClick={handleCreateRestaurant}
              disabled={!restaurantName.trim() || creating}
              style={{ ...btnPrimary, opacity: (!restaurantName.trim() || creating) ? 0.5 : 1, padding: '10px 24px', fontSize: '14px' }}
            >
              {creating ? ob('settingUp') : ob('continue')} <FaArrowRight size={12} />
            </button>
          </div>

          <div style={{
            maxWidth: '1000px', width: '100%',
            display: isMobile ? 'flex' : 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
            flexDirection: 'column',
            gap: isMobile ? '28px' : '48px', alignItems: 'start',
          }}>
            {/* Left: Form */}
            <div className="ob-fadeIn">
              {heading(ob('tellUsAbout'))}
              {subheading(ob('appearsOnBills'))}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  {NAME_LABELS[businessType] || ob('restaurantName')} *
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
              <div style={{ marginBottom: '20px' }} ref={countryDropdownRef}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  {ob('country')}
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

              {/* ── Optional Expandable Sections ── */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  {ob('optionalDetails')}
                </p>

                {/* Timings */}
                <div style={{ marginBottom: '8px', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden', background: 'white' }}>
                  <div
                    onClick={() => setShowTimings(!showTimings)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaClock size={14} color="#f59e0b" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{ob('operatingHours')}</span>
                      {!showTimings && (openTime !== '09:00' || closeTime !== '22:00') && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>{openTime} - {closeTime}</span>
                      )}
                    </div>
                    <FaChevronDown size={10} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: showTimings ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {showTimings && (
                    <div style={{ padding: '0 14px 14px', display: 'flex', gap: '12px', animation: 'fadeInUp 0.2s ease' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>{ob('opensAt')}</label>
                        <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)}
                          className="ob-input"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>{ob('closesAt')}</label>
                        <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
                          className="ob-input"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div style={{ marginBottom: '8px', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden', background: 'white' }}>
                  <div
                    onClick={() => setShowAddress(!showAddress)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaMapMarkerAlt size={14} color="#3b82f6" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{ob('address')}</span>
                      {!showAddress && restaurantAddress && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>{restaurantAddress.slice(0, 30)}{restaurantAddress.length > 30 ? '...' : ''}</span>
                      )}
                    </div>
                    <FaChevronDown size={10} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: showAddress ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {showAddress && (
                    <div style={{ padding: '0 14px 14px', animation: 'fadeInUp 0.2s ease' }}>
                      <input type="text" value={restaurantAddress} onChange={e => setRestaurantAddress(e.target.value)}
                        placeholder="123 Main Street, City"
                        className="ob-input"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div style={{ marginBottom: '8px', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden', background: 'white' }}>
                  <div
                    onClick={() => setShowContact(!showContact)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaPhone size={13} color="#22c55e" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{ob('contactInfo')}</span>
                      {!showContact && (restaurantPhone || restaurantEmail) && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>{restaurantPhone || restaurantEmail}</span>
                      )}
                    </div>
                    <FaChevronDown size={10} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: showContact ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {showContact && (
                    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeInUp 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPhone size={11} color="#9ca3af" />
                        <input type="tel" value={restaurantPhone} onChange={e => setRestaurantPhone(e.target.value)}
                          placeholder="Phone number"
                          className="ob-input"
                          style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaEnvelope size={11} color="#9ca3af" />
                        <input type="email" value={restaurantEmail} onChange={e => setRestaurantEmail(e.target.value)}
                          placeholder="Email address"
                          className="ob-input"
                          style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cuisine */}
                <div style={{ marginBottom: '0', borderRadius: '12px', border: '1px solid #f0f0f0', background: 'white', position: 'relative' }}>
                  <div
                    onClick={() => setShowCuisine(!showCuisine)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaUtensils size={13} color="#ef4444" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{ob('cuisineTypes')}</span>
                      {!showCuisine && selectedCuisines.length > 0 && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>{selectedCuisines.slice(0, 3).join(', ')}{selectedCuisines.length > 3 ? ` +${selectedCuisines.length - 3}` : ''}</span>
                      )}
                    </div>
                    <FaChevronDown size={10} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: showCuisine ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {showCuisine && (
                    <div style={{ padding: '0 14px 14px', animation: 'fadeInUp 0.2s ease' }}>
                      {/* Selected tags */}
                      {selectedCuisines.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                          {selectedCuisines.map(c => (
                            <span key={c} style={{
                              padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600',
                              background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              {c}
                              <FaTimes size={8} style={{ cursor: 'pointer' }} onClick={() => {
                                setSelectedCuisines(prev => prev.filter(x => x !== c));
                                setCuisineTypes(selectedCuisines.filter(x => x !== c).join(', '));
                              }} />
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Search input */}
                      <div style={{ position: 'relative' }} data-cuisine-dropdown="true">
                        <input
                          type="text"
                          value={cuisineSearch}
                          onChange={e => { setCuisineSearch(e.target.value); setCuisineDropdownOpen(true); }}
                          onFocus={() => setCuisineDropdownOpen(true)}
                          placeholder={ob('searchCuisine')}
                          className="ob-input"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {cuisineDropdownOpen && (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                            marginTop: '4px', background: 'white', borderRadius: '10px',
                            border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            maxHeight: '180px', overflowY: 'auto',
                          }}>
                            {CUISINE_OPTIONS
                              .filter(c => !selectedCuisines.includes(c) && c.toLowerCase().includes(cuisineSearch.toLowerCase()))
                              .slice(0, 8)
                              .map(c => (
                                <div key={c} onClick={() => {
                                  const updated = [...selectedCuisines, c];
                                  setSelectedCuisines(updated);
                                  setCuisineTypes(updated.join(', '));
                                  setCuisineSearch('');
                                  setCuisineDropdownOpen(false);
                                }} style={{
                                  padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#374151',
                                  transition: 'background 0.1s',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  {c}
                                </div>
                              ))}
                            {cuisineSearch.trim() && !CUISINE_OPTIONS.find(c => c.toLowerCase() === cuisineSearch.toLowerCase()) && (
                              <div onClick={() => {
                                const updated = [...selectedCuisines, cuisineSearch.trim()];
                                setSelectedCuisines(updated);
                                setCuisineTypes(updated.join(', '));
                                setCuisineSearch('');
                                setCuisineDropdownOpen(false);
                              }} style={{
                                padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#ef4444', fontWeight: '600',
                                borderTop: '1px solid #f1f5f9',
                              }}>
                                + Add &quot;{cuisineSearch.trim()}&quot;
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button onClick={handleSkipStep2} style={skipLink}>{ob('skipThisStep')}</button>
              </div>
            </div>

            {/* Right: Receipt + Feature Highlights */}
            <div className="ob-fadeIn-d2" style={{
              display: 'flex', flexDirection: 'column', gap: '20px',
              position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : '100px', alignSelf: 'start',
            }}>
              {/* Live receipt mini-preview — modern card style */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff, #fafafa)', borderRadius: '20px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.08)', padding: '0',
                border: '1px solid rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
              }}>
                {/* Top gradient header */}
                <div style={{
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  padding: '18px 20px 14px', textAlign: 'center', position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #f97316, #f59e0b)' }} />
                  <p style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: '0 0 2px', letterSpacing: '-0.01em', textTransform: 'capitalize' }}>
                    {restaurantName || `Your ${businessLabel}`}
                  </p>
                  {selectedCuisines.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                      {selectedCuisines.slice(0, 3).map(c => (
                        <span key={c} style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: '600', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px 18px' }}>
                  {/* Info rows — side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaMapMarkerAlt size={9} color="#9ca3af" />
                      <span style={{ fontSize: '10px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {restaurantAddress || `${selectedCountry.flag} ${selectedCountry.name}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaClock size={9} color="#9ca3af" />
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>
                        {openTime} - {closeTime}
                      </span>
                    </div>
                    {restaurantPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaPhone size={8} color="#9ca3af" />
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{restaurantPhone}</span>
                      </div>
                    )}
                    {restaurantEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaEnvelope size={8} color="#9ca3af" />
                        <span style={{ fontSize: '10px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{restaurantEmail}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ height: '1px', background: 'repeating-linear-gradient(90deg, #e5e7eb, #e5e7eb 4px, transparent 4px, transparent 8px)', margin: '0 0 10px' }} />

                  {receiptItems.slice(0, 3).map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0',
                      borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: i % 2 === 0 ? '#22c55e' : '#ef4444' }} />
                        <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(item.price)}</span>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'repeating-linear-gradient(90deg, #e5e7eb, #e5e7eb 4px, transparent 4px, transparent 8px)', margin: '10px 0 8px' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#111827', fontSize: '13px' }}>Total</span>
                    <span style={{ fontWeight: '900', color: '#ef4444', fontSize: '20px', letterSpacing: '-0.02em' }}>{fmtPrice(receiptTotal)}</span>
                  </div>
                </div>

                <div style={{ padding: '8px', background: '#fafafa', textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '9px', color: '#d1d5db', margin: 0 }}>{ob('poweredBy')}</p>
                </div>
              </div>

              {/* What you can also do — features grid */}
              <div className="ob-fadeIn-d3" style={{
                background: 'white', borderRadius: '20px',
                padding: '20px 18px', border: '1px solid #f0f0f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <FaBolt size={13} color="#ef4444" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827', letterSpacing: '-0.01em' }}>{ob('everythingYouCanDo')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { icon: FaCashRegister, label: ob('posBilling'), color: '#ef4444', bg: '#fef2f2' },
                    { icon: FaQrcode, label: ob('qrMenu'), color: '#3b82f6', bg: '#eff6ff' },
                    { icon: FaGlobe, label: ob('website'), color: '#10b981', bg: '#ecfdf5' },
                    { icon: FaChartLine, label: ob('analytics'), color: '#0ea5e9', bg: '#f0f9ff' },
                    { icon: FaPrint, label: ob('kitchenKot'), color: '#f97316', bg: '#fff7ed' },
                    { icon: FaUsers, label: ob('customerCrm'), color: '#ec4899', bg: '#fdf2f8' },
                  ].map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '10px',
                      background: f.bg, transition: 'transform 0.2s',
                    }}>
                      <f.icon size={12} color={f.color} />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: f.color }}>{f.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '12px', padding: '8px 12px', borderRadius: '8px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <FaStar size={10} color="#16a34a" />
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                    {ob('zeroCommissions')}
                  </span>
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
              {heading(ob('whatFeatures'))}
              {subheading(ob('pickFeatures'))}
            </div>

            <div className="ob-fadeIn-d1" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '14px', textAlign: 'left', marginBottom: '32px',
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
                      padding: '18px 18px', borderRadius: '16px',
                      border: selected ? '2px solid #ef4444' : '2px solid #1f2937',
                      backgroundColor: selected ? '#fef2f2' : 'white',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      cursor: isLocked ? 'default' : 'pointer',
                      boxShadow: selected ? '0 4px 12px rgba(239,68,68,0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: `${f.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={20} color={f.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: 0 }}>{f.label}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.desc}</p>
                    </div>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                      border: selected ? 'none' : '2px solid #d1d5db',
                      background: selected ? '#ef4444' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {selected && <FaCheck size={10} color="white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected count */}
            <div className="ob-fadeIn-d2" style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={goBack} style={btnSecondary}><FaArrowLeft size={12} /> {ob('back')}</button>
              <button className="ob-btn" onClick={handleSaveFeatures} style={btnPrimary}>
                {ob('continue')} <FaArrowRight size={14} />
              </button>
            </div>
            <button onClick={() => goNext()} style={skipLink}>Skip — enable everything</button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 4: Menu Setup ═══════════════════════ */}
      {step === 4 && (
        <div style={contentStyle}>
          <div style={{
            maxWidth: '1100px', width: '100%',
            display: isMobile ? 'flex' : 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
            flexDirection: 'column',
            gap: isMobile ? '24px' : '48px', alignItems: 'start',
          }}>
            {/* Left: Upload options + actions */}
            <div>
              <div className="ob-fadeIn">
                {heading(ob('yourMenuLive'))}
                <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
                  {ob('sampleMenuAdded')}
                </p>
              </div>

              {/* Upload options — compact row */}
              <div className="ob-fadeIn-d1" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {/* Upload menu card */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`ob-card${uploadedCount === 0 && !uploading ? ' ob-upload-nudge' : ''}`}
                  style={{
                    padding: '14px 18px', borderRadius: '14px', cursor: uploading ? 'default' : 'pointer',
                    border: uploadedCount > 0 ? '2px solid #16a34a' : uploading ? '2px solid #f59e0b' : '2px solid #ef4444',
                    background: uploadedCount > 0 ? '#f0fdf4' : 'white',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple
                    onChange={handleMenuUpload} style={{ display: 'none' }}
                  />
                  {/* Progress bar overlay */}
                  {uploading && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, height: '3px',
                      background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                      width: `${uploadProgressPct}%`,
                      transition: 'width 0.5s ease',
                      borderRadius: '0 2px 2px 0',
                    }} />
                  )}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: uploadedCount > 0 ? '#dcfce7' : uploading ? '#fef3c7' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {uploadedCount > 0 ? (
                      <FaCheck size={18} color="#16a34a" />
                    ) : uploading ? (
                      <div style={{ width: '20px', height: '20px', border: '2.5px solid #fde68a', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <FaUpload size={18} color="#374151" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: '0 0 2px' }}>
                      {uploadedCount > 0 ? `${uploadedCount} items extracted` : uploading ? 'Analyzing...' : ob('uploadMenu')}
                    </p>
                    <p style={{ fontSize: '12px', color: uploading ? '#d97706' : '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {uploading ? uploadProgress : (uploadedCount > 0 ? 'Upload another to add more' : <>
                        <FaMagic size={10} /> {ob('photoOrPdf')}
                      </>)}
                    </p>
                  </div>
                  {!uploading && <FaChevronRight size={12} color="#9ca3af" />}
                </div>

                {/* Upload error with fallback options */}
                {uploadError && (
                  <div style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    animation: 'fadeInUp 0.3s ease',
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', margin: '0 0 6px' }}>
                      {uploadError === 'no-items' ? 'Could not extract items from this image' : 'Upload failed — please try again'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.4 }}>
                      Don&apos;t worry! You can try again, or let us set it up for you:
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setUploadError(''); fileInputRef.current?.click(); }} style={{
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                        background: 'white', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <FaUpload size={10} /> Try again
                      </button>
                      <button onClick={() => { setUploadError(''); handleWhatsAppSetup(); }} style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none',
                        background: '#25D366', fontSize: '12px', fontWeight: '600', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <FaWhatsapp size={12} /> Send on WhatsApp
                      </button>
                      <a href="mailto:info@dineopen.com?subject=Menu setup help" style={{
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                        background: 'white', fontSize: '12px', fontWeight: '600', color: '#374151',
                        display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none',
                      }}>
                        <FaEnvelope size={10} /> Email us
                      </a>
                    </div>
                  </div>
                )}

                {/* Sample menu status card — only show if user hasn't uploaded their own */}
                {!uploadedCount && (
                  <div
                    style={{
                      padding: '14px 18px', borderRadius: '14px',
                      border: menuSeeded ? '2px solid #16a34a' : '2px solid #e5e7eb',
                      background: menuSeeded ? '#f0fdf4' : 'white',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: menuSeeded ? '#dcfce7' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {menuSeeded ? (
                        <FaCheck size={18} color="#16a34a" />
                      ) : (
                        <div style={{ width: '18px', height: '18px', border: '2.5px solid #d1d5db', borderTopColor: '#6b7280', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: '0 0 2px' }}>
                        {menuSeeded ? ob('sampleMenuReady') : ob('settingUp')}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {menuSeeded ? `36 popular ${businessLabel.toLowerCase()} items — edit anytime from Menu page` : 'Auto-loading sample items for your business type'}
                      </p>
                    </div>
                    {menuSeeded && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Live</span>}
                  </div>
                )}

                {/* WhatsApp option */}
                <div
                  onClick={handleWhatsAppSetup}
                  className="ob-card"
                  style={{
                    padding: '14px 18px', borderRadius: '14px', cursor: 'pointer',
                    border: '2px solid #e5e7eb', background: 'white',
                    display: 'flex', alignItems: 'center', gap: '14px',
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FaWhatsapp size={20} color="#25D366" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: '0 0 2px' }}>
                      {ob('sendOnWhatsApp')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {ob('wellSetItUp')}
                    </p>
                  </div>
                  <FaChevronRight size={12} color="#9ca3af" />
                </div>
              </div>

              {/* QR + URL info */}
              <div className="ob-fadeIn-d2" style={{
                padding: '14px 16px', borderRadius: '14px',
                background: '#f9fafb', border: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px',
              }}>
                {menuPreviewQr ? (
                  <img src={menuPreviewQr} alt="QR" style={{ width: '56px', height: '56px', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaQrcode size={24} color="#9ca3af" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '700', fontSize: '13px', color: '#111827', margin: '0 0 2px' }}>{ob('yourQrCode')}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                    {ob('printOnTables')}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="ob-fadeIn-d3" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={goBack} style={btnSecondary}><FaArrowLeft size={12} /> {ob('back')}</button>
                <button className="ob-btn" onClick={() => goNext()} style={btnPrimary}>
                  {ob('continue')} <FaArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right: Phone Mockup — always visible */}
            <div className="ob-fadeIn-d2" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : '100px',
              width: isMobile ? '100%' : 'auto',
            }}>
              <div style={{
                border: '8px solid #1a1a1a', borderRadius: '44px',
                width: isMobile ? '300px' : '375px', height: isMobile ? '560px' : '750px',
                overflow: 'hidden', background: '#ffffff', flexShrink: 0,
                boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative', margin: '0 auto',
              }}>
                {/* Dynamic Island */}
                <div style={{
                  position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                  width: '90px', height: '24px', background: '#1a1a1a',
                  borderRadius: '20px', zIndex: 10,
                }} />

                {/* Menu content — iframe once menu is seeded, static preview while loading */}
                {(menuSeeded && restaurantId) ? (
                  <iframe
                    key={iframeKey}
                    src={`/placeorder?restaurant=${restaurantId}`}
                    style={{ width: '100%', height: '100%', border: 'none', paddingTop: '36px' }}
                    title="Menu Preview"
                  />
                ) : (
                  <div style={{ height: '100%', overflow: 'auto', paddingTop: '38px' }}>
                    {/* Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #ef4444, #f97316)',
                      padding: '18px 14px 12px', textAlign: 'center',
                    }}>
                      <p style={{ color: 'white', fontWeight: '800', fontSize: '15px', margin: '0 0 2px' }}>
                        {restaurantName || `Your ${businessLabel}`}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', margin: 0 }}>
                        Online Ordering
                      </p>
                    </div>

                    {/* Category pills */}
                    <div style={{ display: 'flex', gap: '5px', padding: '8px 10px', overflowX: 'auto', borderBottom: '1px solid #f3f4f6' }}>
                      {(getDefaultCategories(businessType || 'restaurant') || []).slice(0, 4).map((cat, i) => (
                        <span key={cat} style={{
                          padding: '3px 9px', borderRadius: '16px', fontSize: '9px', fontWeight: '600',
                          whiteSpace: 'nowrap', flexShrink: 0,
                          background: i === 0 ? '#ef4444' : '#f3f4f6',
                          color: i === 0 ? 'white' : '#374151',
                        }}>
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px 10px' }}>
                      {(getDefaultMenu(businessType || 'restaurant') || []).slice(0, 8).map((item, i) => (
                        <div key={item.id || i} style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          padding: '7px 0', borderBottom: i < 7 ? '1px solid #f9fafb' : 'none',
                        }}>
                          <div style={{
                            width: '12px', height: '12px', borderRadius: '2px', flexShrink: 0,
                            border: `1.5px solid ${item.isVeg ? '#16a34a' : '#dc2626'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.isVeg ? '#16a34a' : '#dc2626' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '11px', fontWeight: '600', color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '700', flexShrink: 0, color: '#ef4444' }}>{fmtPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom bar */}
                    <div style={{ position: 'sticky', bottom: 0, padding: '8px 10px', background: 'white', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <div style={{ padding: '7px', borderRadius: '8px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '700' }}>
                        View Full Menu
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Label below phone */}
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px', textAlign: 'center', fontWeight: '500' }}>
                {uploadedCount > 0 ? 'Your uploaded menu — live preview' : restaurantId ? 'Your live menu — upload to customize' : 'Preview of your customer menu'}
              </p>
            </div>
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
              {heading(ob('yourLiveIs', { type: businessLabel.toLowerCase() }))}
              {subheading(ob('menuReadyShare'))}
            </div>

            {/* Live menu URL banner */}
            {qrUrl && (
              <div className="ob-fadeIn-d1" style={{
                margin: '0 auto 24px', padding: '16px 20px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0', maxWidth: '480px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaGlobe size={16} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', margin: '0 0 2px' }}>{ob('yourLiveMenuUrl')}</p>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {qrUrl.replace('https://', '')}
                  </p>
                </div>
                <button onClick={handleCopyLink} style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0',
                  background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  color: copySuccess ? '#16a34a' : '#374151', transition: 'all 0.2s', flexShrink: 0,
                }}>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {/* Start taking orders — hero button */}
            <div className="ob-fadeIn-d1" style={{ marginBottom: '28px' }}>
              <button
                className="ob-btn"
                onClick={() => router.push('/home')}
                style={{
                  padding: '18px 48px', borderRadius: '16px', border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                  fontWeight: '800', fontSize: '18px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  boxShadow: '0 8px 28px rgba(239,68,68,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                <FaRocket size={18} /> {ob('startTakingOrders')}
              </button>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                Open your POS and take your first order now
              </p>
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
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>Customers scan this to order</p>
                {qrUrl && <p style={{ fontSize: '11px', color: '#ef4444', margin: '0 0 16px', fontWeight: '600' }}>{qrUrl.replace('https://', '')}</p>}

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
                  { icon: FaUsers, label: 'Invite staff', desc: 'Add your team', color: '#0ea5e9', bg: '#f0f9ff', onClick: () => router.push('/admin?tab=staff') },
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
                { icon: FaChair, label: 'Tables', desc: 'Floor plan ready', color: '#0ea5e9', bg: '#f0f9ff' },
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
                {['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#0ea5e9'].map((color, i) => (
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
              onClick={() => {
                const token = localStorage.getItem('authToken');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
                const rid = restaurantId || localStorage.getItem('selectedRestaurantId');
                if (rid && token) {
                  fetch(`${apiUrl}/api/restaurants/${rid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ onboardingStep: 'complete' }),
                  }).catch(() => {});
                }
                if (token) {
                  fetch(`${apiUrl}/api/user/preferences`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ setupComplete: true }),
                  }).catch(() => {});
                }
                localStorage.setItem('onboarding_completed', 'true');
                router.push('/home');
              }}
              style={{
                ...btnPrimary, fontSize: '18px', padding: '16px 48px',
                margin: '0 auto', borderRadius: '16px',
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                boxShadow: '0 6px 20px rgba(239,68,68,0.3)',
              }}
            >
              Explore Your Setup <FaArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                const token = localStorage.getItem('authToken');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
                const rid = restaurantId || localStorage.getItem('selectedRestaurantId');
                if (rid && token) {
                  fetch(`${apiUrl}/api/restaurants/${rid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ onboardingStep: 'complete' }),
                  }).catch(() => {});
                }
                if (token) {
                  fetch(`${apiUrl}/api/user/preferences`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ setupComplete: true }),
                  }).catch(() => {});
                }
                localStorage.setItem('onboarding_completed', 'true');
                router.push(posPath);
              }}
              style={{
                ...btnSecondary, fontSize: '14px', padding: '10px 24px',
                margin: '12px auto 0', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <FaCashRegister size={13} /> Start Taking Orders
            </button>

            <p style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
              Need help?{' '}
              <a href="https://wa.me/919528632779" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: '700', textDecoration: 'none' }}>
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
