'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUtensils, FaCoffee, FaBeer, FaBreadSlice, FaIceCream, FaHamburger, FaHotel, FaFire, FaArrowRight, FaArrowLeft, FaCheck, FaCamera, FaWhatsapp, FaChair, FaBoxes, FaUsers, FaCalendarAlt, FaQrcode, FaFileInvoice, FaCashRegister, FaClipboardList, FaRocket, FaStore, FaUpload, FaGift, FaPercent, FaCrown, FaImage } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { getDefaultMenu } from '../../lib/defaultMenus';
import { getCurrencyByCountryCode } from '../../lib/currencyData';

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

// ─── Feature Map ───────────────────────────────────────────────
const FEATURES = [
  { id: 'pos', label: 'Billing & POS', icon: FaCashRegister, desc: 'Take orders & print bills instantly', color: '#ef4444' },
  { id: 'tables', label: 'Table Management', icon: FaChair, desc: 'Visual floor plan & reservations', color: '#3b82f6' },
  { id: 'kot', label: 'Kitchen Display (KOT)', icon: FaFire, desc: 'Auto-send orders to kitchen', color: '#f97316' },
  { id: 'menu', label: 'QR Menu & Ordering', icon: FaQrcode, desc: 'Customers scan & order from phone', color: '#10b981' },
  { id: 'inventory', label: 'Inventory & Recipes', icon: FaBoxes, desc: 'Track stock, recipes & costs', color: '#059669' },
  { id: 'orders', label: 'Online Ordering', icon: FaClipboardList, desc: 'Your own ordering website', color: '#f59e0b' },
  { id: 'shifts', label: 'Staff & Shifts', icon: FaCalendarAlt, desc: 'Schedule & manage team roles', color: '#0ea5e9' },
  { id: 'customers', label: 'Customer Loyalty', icon: FaUsers, desc: 'Rewards, points & WhatsApp CRM', color: '#ec4899' },
  { id: 'hotel', label: 'Hotel / Room Service', icon: FaHotel, desc: 'Room management & service', color: '#3b82f6' },
  { id: 'invoice', label: 'Invoice & Expenses', icon: FaFileInvoice, desc: 'Professional GST invoices', color: '#0ea5e9' },
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

// Feature highlights shown during onboarding
const FEATURE_HIGHLIGHTS = [
  { icon: FaQrcode, title: 'Free QR Menu', desc: 'Customers scan a QR code, browse your menu on their phone, and place orders directly. Zero paper, zero waiting.', color: '#10b981', bg: '#ecfdf5' },
  { icon: FaChair, title: 'Smart Tables', desc: 'Visual floor plan with live table status. Know which tables are free, occupied, or reserved at a glance.', color: '#3b82f6', bg: '#eff6ff' },
  { icon: FaGift, title: 'Loyalty & Offers', desc: 'Reward repeat customers with points, discounts & birthday offers. Build a loyal customer base automatically.', color: '#ec4899', bg: '#fdf2f8' },
  { icon: FaPercent, title: 'Offers & Discounts', desc: 'Create happy hour deals, combo offers, and seasonal discounts. Attract more customers with smart pricing.', color: '#f97316', bg: '#fff7ed' },
];

export default function OnboardingPage() {
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
  const [city, setCity] = useState('');
  const [creating, setCreating] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);

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

  // Step 6
  const [checklistItems, setChecklistItems] = useState([]);

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
        const countryCode = localStorage.getItem('selectedCountryCode') || 'IN';
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
    if (isTestMode) {
      setRestaurantId('test-restaurant-id');
      setTimeout(() => { setCreating(false); goNext(); }, 500);
      return;
    }
    try {
      const response = await apiClient.createRestaurant({
        name: restaurantName.trim(),
        city: city.trim() || null,
        businessType: businessType || 'restaurant',
        address: '', phone: '', email: '',
        cuisine: ['Indian'], description: '',
        operatingHours: { open: '09:00', close: '22:00' }
      });
      const rid = response.restaurant.id;
      setRestaurantId(rid);
      localStorage.setItem('selectedRestaurantId', rid);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));
      const countryCode = localStorage.getItem('selectedCountryCode') || 'IN';
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
      const countryCode = localStorage.getItem('selectedCountryCode') || 'IN';
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
        { label: `${BUSINESS_TYPES.find(b => b.id === businessType)?.label || 'Restaurant'} selected`, done: !!businessType },
        { label: `Restaurant details saved`, done: !!restaurantName },
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

  // Shared heading style
  const heading = (text) => (
    <h2 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{text}</h2>
  );
  const subheading = (text) => (
    <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#6b7280', marginBottom: isMobile ? '24px' : '36px', lineHeight: 1.5 }}>{text}</p>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes checkPop { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
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
        borderBottom: '1px solid #f1f5f9',
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
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
          <div style={{ height: '5px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
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
                      border: selected ? `2.5px solid ${bt.color}` : '2px solid #e5e7eb',
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

            {/* Feature highlight banner */}
            <div className="ob-fadeIn-d3" style={{
              display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: '24px',
            }}>
              {['Free QR Menu', 'Zero Transaction Fees', 'AI-Powered', 'Works on Any Device'].map((tag) => (
                <span key={tag} style={{
                  padding: '6px 14px', borderRadius: '20px',
                  background: '#fef2f2', color: '#ef4444',
                  fontSize: '12px', fontWeight: '700',
                }}>
                  {tag}
                </span>
              ))}
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
                  Restaurant Name *
                </label>
                <input
                  className="ob-input"
                  type="text"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder="e.g., The Spice House"
                  autoFocus
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: '2px solid #e5e7eb', fontSize: '16px', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  City <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
                </label>
                <input
                  className="ob-input"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g., Delhi"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: '2px solid #e5e7eb', fontSize: '16px', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                />
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
                border: '1px solid #f1f5f9', position: 'relative',
              }}>
                {/* Thermal receipt dots */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '12px', background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, #f1f5f9 4px, #f1f5f9 8px)', borderRadius: '0 0 4px 4px' }} />

                <div style={{ textAlign: 'center', paddingBottom: '16px', marginBottom: '14px', borderBottom: '1.5px dashed #e5e7eb' }}>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '8px 0 2px', letterSpacing: '-0.01em' }}>
                    {restaurantName || 'Your Restaurant'}
                  </p>
                  {city && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{city}</p>}
                  <p style={{ fontSize: '11px', color: '#d1d5db', margin: '4px 0 0' }}>
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Bill #001
                  </p>
                </div>

                {/* Header row */}
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
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>₹{item.price}</span>
                  </div>
                ))}

                <div style={{
                  borderTop: '2px dashed #e5e7eb', marginTop: '12px', paddingTop: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>Total</span>
                  <span style={{ fontWeight: '900', color: '#ef4444', fontSize: '22px' }}>₹{receiptTotal}</span>
                </div>

                {/* QR Code preview */}
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
                      border: selected ? `2px solid ${f.color}` : '2px solid #f1f5f9',
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

            {/* Feature highlights */}
            <div className="ob-fadeIn-d2" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '10px', marginBottom: '28px',
            }}>
              {FEATURE_HIGHLIGHTS.map((fh, i) => {
                const Icon = fh.icon;
                return (
                  <div key={i} style={{
                    padding: '14px', borderRadius: '14px', background: fh.bg,
                    textAlign: 'center',
                  }}>
                    <Icon size={20} color={fh.color} style={{ marginBottom: '6px' }} />
                    <p style={{ fontWeight: '700', fontSize: '12px', color: fh.color, margin: 0 }}>{fh.title}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0', lineHeight: 1.3 }}>{fh.desc.split('.')[0]}.</p>
                  </div>
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
                  border: '2px solid #3b82f6', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
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
                  boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
                }}>
                  <FaUpload size={22} color="#3b82f6" />
                </div>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#1e40af', margin: '0 0 6px' }}>Upload Your Menu</p>
                <p style={{ fontSize: '13px', color: '#3b82f6', margin: 0, lineHeight: 1.4 }}>
                  Photo, PDF, or Excel — our AI extracts all items in 60 seconds
                </p>
                {uploading && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: 'white' }}>
                    <p style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600', margin: 0 }}>{uploadProgress}</p>
                  </div>
                )}
                {uploadedCount > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: '#dcfce7' }}>
                    <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', margin: 0 }}>
                      ✓ {uploadedCount} items extracted!
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
                  border: '2px solid #10b981', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  textAlign: 'center', position: 'relative',
                }}
              >
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: '#10b981', color: 'white', fontSize: '10px',
                  fontWeight: '800', padding: '3px 8px', borderRadius: '6px',
                }}>RECOMMENDED</span>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'white', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.15)',
                }}>
                  <FaUtensils size={22} color="#10b981" />
                </div>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#065f46', margin: '0 0 6px' }}>
                  Use Our {BUSINESS_TYPES.find(b => b.id === businessType)?.label || 'Restaurant'} Menu
                </p>
                <p style={{ fontSize: '13px', color: '#10b981', margin: '0 0 12px', lineHeight: 1.4 }}>
                  Start with 36 popular items. Edit anytime.
                </p>
                {/* Mini preview */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(getDefaultMenu(businessType || 'restaurant') || []).slice(0, 4).map((item, i) => (
                    <span key={i} style={{
                      padding: '3px 8px', borderRadius: '6px', background: 'white',
                      fontSize: '11px', color: '#374151', fontWeight: '500',
                    }}>
                      {item.name} <span style={{ color: '#10b981', fontWeight: '700' }}>₹{item.price}</span>
                    </span>
                  ))}
                  <span style={{ fontSize: '11px', color: '#6b7280', padding: '3px 4px' }}>+32 more</span>
                </div>
                {seeding && <p style={{ marginTop: '10px', color: '#10b981', fontWeight: '700', fontSize: '13px' }}>Loading menu...</p>}
                {menuSeeded && <p style={{ marginTop: '10px', color: '#10b981', fontWeight: '700', fontSize: '13px' }}>✓ Menu loaded!</p>}
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
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              border: '1px solid #d1fae5', marginBottom: '24px',
              display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px', flexShrink: 0,
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}>
                <FaQrcode size={28} color="#10b981" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '15px', color: '#065f46', margin: '0 0 4px' }}>
                  Your customers get a FREE QR menu
                </p>
                <p style={{ fontSize: '13px', color: '#059669', margin: 0, lineHeight: 1.4 }}>
                  Once your menu is ready, customers can scan a QR code at their table to browse your menu, place orders, and even pay — all from their phone. No app download needed.
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

      {/* ═══════════ STEP 5: Take First Order ═══════════════ */}
      {step === 5 && (
        <div style={contentStyle}>
          <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
            <div className="ob-fadeIn" style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px', animation: 'pulse 2s infinite' }}>🎉</div>
              {heading(businessType === 'bar' ? 'Your bar is ready!' : 'Your restaurant is ready!')}
              {subheading('Try taking your first order — it takes just 30 seconds!')}
            </div>

            {/* POS Preview */}
            <div className="ob-fadeIn-d1" style={{
              background: 'white', borderRadius: '20px', padding: isMobile ? '16px' : '24px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)', marginBottom: '28px',
              border: '1px solid #e5e7eb', textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: '800', fontSize: '16px', color: '#111827', margin: 0 }}>
                    {restaurantName || 'Your Restaurant'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    {businessType === 'bar' ? 'Bar POS' : 'POS Dashboard'} — Dine In
                  </p>
                </div>
                <div style={{
                  padding: '5px 12px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  fontSize: '11px', fontWeight: '800', color: '#16a34a',
                  animation: 'pulse 2s infinite',
                }}>
                  LIVE
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: '8px',
              }}>
                {(getDefaultMenu(businessType || 'restaurant') || []).slice(0, 6).map((item, i) => (
                  <div key={i} style={{
                    padding: '12px', borderRadius: '12px',
                    background: i === 0 ? '#fef2f2' : '#f9fafb',
                    border: i === 0 ? '2px solid #ef4444' : '1px solid #f1f5f9',
                    textAlign: 'center', transition: 'all 0.2s',
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#ef4444', margin: '4px 0 0' }}>₹{item.price}</p>
                    {i === 0 && <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700' }}>← Tap to add</span>}
                  </div>
                ))}
              </div>
            </div>

            <button
              className="ob-btn"
              onClick={() => router.push(posPath)}
              style={{
                ...btnPrimary, fontSize: '18px', padding: '16px 40px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                margin: '0 auto', borderRadius: '16px',
                boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
              }}
            >
              <FaRocket size={16} /> Take My First Order
            </button>

            {/* Feature highlights */}
            <div className="ob-fadeIn-d2" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: '10px', marginTop: '28px', marginBottom: '16px',
            }}>
              {[
                { icon: FaQrcode, label: 'QR Menu Ready', desc: 'Customers can scan & order', color: '#10b981', bg: '#ecfdf5' },
                { icon: FaChair, label: 'Tables Ready', desc: 'Visual floor plan included', color: '#3b82f6', bg: '#eff6ff' },
                { icon: FaGift, label: 'Loyalty Ready', desc: 'Reward your customers', color: '#ec4899', bg: '#fdf2f8' },
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
            <div className="ob-fadeIn">
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚀</div>
              {heading("You're all set!")}
              {subheading("Here's your progress and what's next.")}
            </div>

            {/* Checklist card */}
            <div className="ob-fadeIn-d1" style={{
              background: 'white', borderRadius: '20px', padding: isMobile ? '20px' : '28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)', textAlign: 'left',
              marginBottom: '24px', border: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#111827', margin: 0 }}>Setup Progress</p>
                <span style={{
                  fontSize: '13px', fontWeight: '800', padding: '4px 12px', borderRadius: '10px',
                  background: '#fef2f2', color: '#ef4444',
                }}>
                  {checklistItems.length > 0 ? Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100) : 0}%
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden', marginBottom: '20px' }}>
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
                    background: item.done ? '#10b981' : '#f1f5f9',
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

            {/* Feature cards */}
            <div className="ob-fadeIn-d2" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '10px', marginBottom: '28px',
            }}>
              {[
                { icon: FaQrcode, label: 'QR Menu', desc: 'Free for all plans', color: '#10b981', bg: '#ecfdf5', link: '/menu' },
                { icon: FaCrown, label: 'AI Voice', desc: 'Voice ordering', color: '#f59e0b', bg: '#fffbeb', link: '/dineai' },
                { icon: FaGift, label: 'Loyalty', desc: 'Customer rewards', color: '#ec4899', bg: '#fdf2f8', link: '/customers' },
                { icon: FaClipboardList, label: 'Reports', desc: 'Sales analytics', color: '#3b82f6', bg: '#eff6ff', link: '/analytics' },
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
    </div>
  );
}
