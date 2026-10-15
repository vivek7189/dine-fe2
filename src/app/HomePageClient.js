'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../lib/api';
import CommonHeader from '../components/CommonHeader';
import Footer from '../components/Footer';
import FeatureTour from '../components/home/FeatureTour';
import HomeHero from '../components/home/HomeHero';
import HomeFaq from '../components/home/HomeFaq';
import {
  FaUtensils, FaChartBar, FaTable, FaMobile, FaUsers, FaCheckCircle, FaTimes, FaPlay, FaRocket,
  FaChevronDown, FaRobot, FaBoxes, FaBuilding, FaWhatsapp, FaReceipt, FaStar, FaSpinner,
  FaPaperPlane, FaBook, FaShoppingCart, FaClipboardList, FaFileInvoice, FaCog, FaPhone, FaEnvelope,
  FaApple, FaWindows, FaAndroid, FaDownload, FaGooglePlay
} from 'react-icons/fa';

// --- Geo helpers: map the visitor's country (from the middleware `geo_country`
// cookie) to a homepage currency + which region badge-card leads. Unknown geo
// keeps the existing India-first order so nothing changes for uncovered visitors.
const EUR_COUNTRIES = new Set(['DE','FR','ES','IT','NL','IE','PT','BE','AT','FI','GR','LU','SK','SI','EE','LV','LT','CY','MT']);
function currencyForCountry(cc) {
  if (!cc) return null;
  const map = { US: 'USD', GB: 'GBP', IN: 'INR', CA: 'CAD', AU: 'AUD', NZ: 'AUD', AE: 'AED', SG: 'SGD' };
  if (map[cc]) return map[cc];
  if (EUR_COUNTRIES.has(cc)) return 'EUR';
  return 'USD'; // sensible default for any other country
}

export default function LandingPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);

  // Tauri desktop app: redirect to /login instead of showing homepage
  useEffect(() => {
    if (typeof window !== 'undefined' && (
      window.__TAURI__ || window.__TAURI_INTERNALS__ ||
      window.location.protocol === 'tauri:' ||
      window.location.hostname === 'tauri.localhost'
    )) {
      router.replace('/login');
    }
  }, [router]);

  // Animation States


  // Demo Form State dd
  const [demoContactType, setDemoContactType] = useState('phone');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoRestaurantName, setDemoRestaurantName] = useState('');
  const [demoComment, setDemoComment] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const demoSubmittingRef = useRef(false); // synchronous guard — state/disabled update async, so a fast double-click can slip through and send two requests (→ two admin emails)
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Detect the visitor's country from the middleware-set `geo_country` cookie and
  // auto-select their local currency (US→USD, UK→GBP, CA→CAD, EU→EUR, …). The
  // manual currency pills below still override this afterwards.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const m = document.cookie.match(/(?:^|;\s*)geo_country=([A-Za-z]{2})/);
    const cc = m ? m[1].toUpperCase() : null;
    if (!cc) return;
    const cur = currencyForCountry(cc);
    if (cur) setCurrency(cur);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkAuthInBackground = async () => {
      if (apiClient.isAuthenticated()) {
        // Use hard redirect to ensure proper page load instead of client-side navigation
        // This prevents the landing page from briefly showing at the dashboard URL
        window.location.href = apiClient.getRedirectPath();
      }
    };
    // Check auth immediately, no delay needed
    checkAuthInBackground();
  }, []);

  const handleLogin = () => {
    if (apiClient.isAuthenticated()) {
      // Use hard redirect to ensure proper page load
      window.location.href = apiClient.getRedirectPath();
    } else {
      router.push('/login');
    }
  };

  const handleSubmitDemoRequest = async () => {
    if (demoSubmittingRef.current) return; // synchronous guard — blocks a same-tick double-click BEFORE the async state/disabled catches up (was sending two requests → two emails)
    if (demoContactType === 'phone' && !demoPhone.trim()) return setDemoError('Phone number is required');
    if (demoContactType === 'email' && !demoEmail.trim()) return setDemoError('Email is required');
    demoSubmittingRef.current = true;
    setDemoSubmitting(true); setDemoError('');
    try {
      // Build comment: include restaurant name only if provided, then additional details
      let comment = '';
      if (demoRestaurantName.trim()) {
        comment = `Restaurant: ${demoRestaurantName.trim()}`;
      }
      if (demoComment.trim()) {
        comment = comment ? `${comment}\n${demoComment.trim()}` : demoComment.trim();
      }
      await apiClient.submitDemoRequest(demoContactType, demoPhone.trim(), demoEmail.trim(), comment);
      setDemoSuccess(true);
    } catch (error) { setDemoError(error.message || 'Failed to submit demo request.'); }
    finally { setDemoSubmitting(false); demoSubmittingRef.current = false; }
  };

  const closeDemoModal = () => {
    setShowDemoModal(false);
    setDemoRestaurantName('');
    setDemoPhone('');
    setDemoEmail('');
    setDemoComment('');
    setDemoError('');
    setDemoSuccess(false);
  };

  const currencySymbols = { USD: '$', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$', SGD: 'S$', AED: 'AED', EUR: '€' };
  const currencyNames = { USD: 'USD', GBP: 'GBP', INR: 'INR', CAD: 'CAD', AUD: 'AUD', SGD: 'SGD', AED: 'AED', EUR: 'EUR' };

  // Same prices as /pricing (src/app/pricing/PricingClient.js). India shows Growth + Pro only
  // (Starter isn't offered publicly in India). Currencies without their own table use USD.
  const priceTable = {
    INR: { symbol: '₹',    growth: { monthly: 899, annual: 749 }, pro: { monthly: 1799, annual: 1499 } },
    USD: { symbol: '$',    starter: { monthly: 20, annual: 18 }, growth: { monthly: 50, annual: 46 }, pro: { monthly: 99, annual: 83 } },
    GBP: { symbol: '£',    starter: { monthly: 16, annual: 14 }, growth: { monthly: 40, annual: 37 }, pro: { monthly: 79, annual: 67 } },
    AED: { symbol: 'AED ', starter: { monthly: 75, annual: 66 }, growth: { monthly: 185, annual: 168 }, pro: { monthly: 365, annual: 306 } },
  };
  const priceCurrency = priceTable[currency] ? currency : 'USD';
  const fmt = (n) => priceTable[priceCurrency].symbol + n.toLocaleString('en-IN');
  // For INR annual: show yearly total directly (₹8,988/year instead of ₹749/month)
  const showYearlyTotal = priceCurrency === 'INR' && billingCycle === 'annual';
  const getPlanPrice = (type) => showYearlyTotal ? priceTable[priceCurrency][type].annual * 12 : priceTable[priceCurrency][type][billingCycle];
  const pricePeriod = showYearlyTotal ? 'per year' : 'per month';
  const allPlans = [
    {
      name: "Starter",
      type: "starter",
      period: pricePeriod,
      subPrice: 'For single-outlet restaurants',
      features: ["Complete Cloud POS", "QR Digital Menu & Ordering", "KOT Printing", "Unlimited Tables & Staff", "Basic Inventory & Reports", "1 Outlet"],
      button: "Get Started",
      popular: false
    },
    {
      name: "Growth",
      type: "growth",
      period: pricePeriod,
      subPrice: 'For growing restaurants',
      features: [priceCurrency === 'INR' ? "Complete Cloud POS, QR Menu & KOT" : "Everything in Starter", "AI Voice Ordering 🎤", "AI Menu Generator & Insights", "Captain App + Kitchen Display", "Advanced Inventory & Recipes", "Customer Loyalty & WhatsApp", "Up to 2 Outlets"],
      button: "Get Started",
      popular: true
    },
    {
      name: "Pro",
      type: "pro",
      period: pricePeriod,
      subPrice: 'For restaurant chains',
      features: ["Everything in Growth", "Chain Dashboard & HQ View", "Cross-Outlet Analytics", "Centralized Menu Management", "Priority 24/7 Support", "Up to 5 Outlets"],
      button: "Get Started",
      popular: false
    }
  ];
  const plans = allPlans
    .filter((plan) => priceTable[priceCurrency][plan.type])
    .map((plan) => ({ ...plan, price: fmt(getPlanPrice(plan.type)) }));

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'var(--font-inter), Inter, sans-serif', overflowX: 'hidden' }}>
      
      <style jsx global>{`
        @keyframes float-y { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float-x { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(10px); } }
        @keyframes typing { 0% { opacity: 0.3; transform: translateY(0px); } 50% { opacity: 1; transform: translateY(-3px); } 100% { opacity: 0.3; transform: translateY(0px); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); } 50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes rotate-fade-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
         @keyframes rotate-fade-out {
           0% { opacity: 1; transform: translateY(0) scale(1); }
           100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
         }
         @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(0,0,0,0.05); }
        .hero-gradient { background: radial-gradient(circle at 50% 0%, rgba(254, 226, 226, 0.4) 0%, rgba(255, 255, 255, 0) 50%); }
        .text-gradient { background: linear-gradient(135deg, #111827 0%, #4b5563 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .red-gradient-text { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .animated-gradient { background: linear-gradient(270deg, #ef4444, #dc2626, #b91c1c); background-size: 600% 600%; animation: gradient-shift 3s ease infinite; }
        .feature-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .feature-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
        .shimmer-effect { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
        .fade-in { animation: rotate-fade-in 0.5s ease-out forwards; }
        .fade-out { animation: rotate-fade-out 0.5s ease-out forwards; }
      `}</style>

      {/* Enhanced Professional Navigation */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: isMobile ? '0 16px' : '0 32px', 
          height: isMobile ? '64px' : '72px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ 
              width: isMobile ? '36px' : '40px', 
              height: isMobile ? '36px' : '40px', 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: '800',
              fontSize: isMobile ? '16px' : '18px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              DO
          </div>
            <span style={{ 
              fontSize: isMobile ? '18px' : '22px', 
              fontWeight: '800', 
              color: '#111827',
              letterSpacing: '-0.5px'
            }}>
              DineOpen
            </span>
          </Link>
          
          {!isMobile && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, justifyContent: 'center', maxWidth: '800px' }}>
              
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowProductsDropdown(true)}
                onMouseLeave={() => setShowProductsDropdown(false)}
              >
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: '#374151',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.target.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.target.style.color = '#374151'; }}
                >
                  Products
                  <FaChevronDown size={12} style={{
                    transform: showProductsDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </a>

                {showProductsDropdown && (
                  <>
                    <div
                      style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: '8px', zIndex: 101 }}
                      onMouseEnter={() => setShowProductsDropdown(true)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                        padding: '24px',
                        width: '640px',
                        zIndex: 100,
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                      }}
                      onMouseEnter={() => setShowProductsDropdown(true)}
                      onMouseLeave={() => setShowProductsDropdown(false)}
                    >
                      {/* Featured Products Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        {[
                          { name: 'DineOpen POS', href: '/products/pos', icon: FaUtensils, desc: 'Lightning-fast cloud POS' },
                          { name: 'DineOpen Menu', href: '/products/menu', icon: FaBook, desc: 'Digital menus & QR codes' },
                          { name: 'DineOpen AI', href: '/products/ai', icon: FaRobot, desc: 'Voice ordering & AI assistant' },
                          { name: 'DineOpen Hotel', href: '/products/hotel', icon: FaBuilding, desc: 'Room & booking management' },
                          { name: 'DineOpen Inventory', href: '/products/inventory', icon: FaBoxes, desc: 'Stock tracking & AI reorder' },
                          { name: 'DineOpen Orders', href: '/products/orders', icon: FaShoppingCart, desc: 'Online & QR ordering' },
                        ].map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              padding: '14px',
                              borderRadius: '12px',
                              color: '#374151',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fecaca';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                          >
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <item.icon size={18} color="#ef4444" />
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '2px' }}>{item.name}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '0 0 12px' }} />

                      {/* More Products Row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {[
                          { name: 'DineOpen Loyalty', href: '/products/loyalty', icon: FaUsers },
                          { name: 'DineOpen Kitchen', href: '/products/kitchen', icon: FaClipboardList },
                          { name: 'DineOpen Tables', href: '/products/tables', icon: FaTable },
                          { name: 'DineOpen Billing', href: '/products/billing', icon: FaFileInvoice },
                          { name: 'DineOpen Admin', href: '/products/admin', icon: FaCog },
                        ].map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: '#6b7280',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#6b7280';
                            }}
                          >
                            <item.icon size={14} />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

            <button
              onClick={() => setShowDemoModal(true)}
              style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#111827', 
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Demo
            </button>

            <Link href="/blog" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Blog
            </Link>

            <Link href="/pricing" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Pricing
            </Link>
            <Link href="/partners" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Partners
            </Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* App download icons */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginRight: '4px' }}>
                <a href="https://apps.apple.com/in/app/dineopen-restaurant-billing/id6761518444" target="_blank" rel="noopener noreferrer" title="Download on App Store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', color: '#6b7280', transition: 'all 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}>
                  <FaApple size={16} />
                </a>
                <a href="https://www.dineopen.com/download/android" target="_blank" rel="noopener noreferrer" title="Download Android APK" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', color: '#6b7280', transition: 'all 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}>
                  <FaGooglePlay size={14} />
                </a>
                <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
              </div>
            )}
            <button
              onClick={handleLogin}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = 'white'; }}
            >
              Login
            </button>
            <button 
              onClick={handleLogin} 
              style={{ 
                padding: isMobile ? '8px 16px' : '10px 20px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', 
                color: 'white', 
                fontWeight: '600', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero: promise + phone signup, demo/WhatsApp for people who want a walkthrough, live demo on the right */}
      <HomeHero onDemo={() => setShowDemoModal(true)} />

      {/* Feature tour: one section per real feature, each with a short looping demo */}
      <FeatureTour />

      {/* Pricing Section - Clean Cards with Currency Selector */}
      <section id="pricing" style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            display: 'inline-block',
            padding: '6px 16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderRadius: '20px',
            border: '1px solid #fecaca'
          }}>
            💰 TRANSPARENT PRICING
          </div>
          <h2 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1px' }}>
            Simple, <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fair Pricing</span>
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Start free, scale as you grow. No hidden fees. Cancel anytime.
          </p>

          {/* Currency Selector */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '48px',
            padding: '4px',
            background: '#f3f4f6',
            borderRadius: '12px'
          }}>
            {['USD', 'GBP', 'AED', 'INR'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: priceCurrency === curr ? 'white' : 'transparent',
                  color: priceCurrency === curr ? '#111827' : '#6b7280',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: priceCurrency === curr ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {currencySymbols[curr] && currencySymbols[curr] !== curr ? `${currencySymbols[curr]} ${curr}` : curr}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px',
              background: '#f3f4f6',
              borderRadius: '12px'
            }}>
              {[
                { key: 'monthly', label: 'Monthly' },
                { key: 'annual', label: 'Annual', badge: 'Save up to 17%' }
              ].map((opt) => {
                const active = billingCycle === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setBillingCycle(opt.key)}
                    style={{
                      position: 'relative',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: active
                        ? 'linear-gradient(135deg, #111827 0%, #374151 100%)'
                        : 'transparent',
                      color: active ? 'white' : '#6b7280',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: active
                        ? '0 6px 18px rgba(17,24,39,0.25), 0 0 0 3px rgba(17,24,39,0.06)'
                        : 'none',
                      transform: active ? 'scale(1.04)' : 'scale(1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {opt.label}
                    {opt.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        background: active
                          ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: 'white',
                        letterSpacing: '0.3px',
                        boxShadow: active ? '0 2px 8px rgba(16,185,129,0.4)' : '0 2px 6px rgba(245,158,11,0.3)'
                      }}>
                        {opt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${plans.length}, 1fr)`, gap: '24px', maxWidth: plans.length < 3 ? '820px' : undefined, margin: '0 auto' }}>
            {plans.map((plan, i) => (
              <div key={i} style={{
                padding: '40px',
                borderRadius: '32px',
                border: plan.popular ? '2px solid #111827' : '1px solid #e5e7eb',
                background: plan.popular ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' : 'white',
                color: plan.popular ? 'white' : '#111827',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = plan.popular ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                {plan.popular && <div style={{ position: 'absolute', top: '-12px', right: '40px', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}>MOST POPULAR</div>}
                {plan.discount && (
                  <div style={{ display: 'inline-block', backgroundColor: plan.popular ? 'rgba(16,185,129,0.2)' : '#dcfce7', color: plan.popular ? '#6ee7b7' : '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
                    SAVE {plan.discount}% — Limited Offer
                  </div>
                )}
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</h3>
                {plan.regularPrice && (
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '600', opacity: 0.5, textDecoration: 'line-through' }}>{plan.regularPrice}</span>
                  </div>
                )}
                <div style={{ fontSize: '48px', fontWeight: '900', marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  {plan.price}
                  <span style={{ fontSize: '16px', fontWeight: '500', opacity: 0.7 }}>/{plan.period.replace('per ', '')}</span>
                </div>
                <p style={{ opacity: 0.7, marginBottom: '8px', fontSize: '15px' }}>{plan.subPrice}</p>
                <p style={{ fontSize: '12px', color: plan.popular ? 'rgba(255,255,255,0.65)' : '#6b7280', fontWeight: '500', marginBottom: '24px' }}>Start without any credit card • Zero transaction fees</p>
                <button
                  onClick={handleLogin}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: plan.popular ? 'white' : 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                    color: plan.popular ? '#111827' : 'white',
                    border: 'none',
                    fontWeight: '700',
                    marginBottom: '32px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                >{plan.button}</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
                      <FaCheckCircle color={plan.popular ? '#ef4444' : '#10b981'} size={16} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div style={{ marginTop: '48px', padding: '32px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Need a custom solution for your enterprise?
            </p>
            <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '16px' }}>
              Multi-location support, custom integrations, dedicated account manager, and SLA guarantees.
            </p>
            <button
              onClick={() => setShowDemoModal(true)}
              style={{
                padding: '12px 32px',
                background: 'white',
                border: '2px solid #111827',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#111827'; e.target.style.color = 'white'; }}
              onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = '#111827'; }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section - AEO Optimized */}
      <HomeFaq />

      {/* Download Apps Section */}
      <section style={{
        padding: isMobile ? '60px 16px' : '80px 32px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '-50%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '16px' }}>
              <FaDownload size={12} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>Available on all platforms</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
              Get DineOpen POS
            </h2>
            <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#94a3b8', margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
              Download the app on your desktop or mobile device and start billing in minutes
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
            {/* iOS App Store */}
            <a
              href="https://apps.apple.com/in/app/dineopen-restaurant-billing/id6761518444"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '28px 20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', transition: 'all 0.25s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #333, #111)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaApple size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download on the</div>
                <div style={{ fontSize: '17px', color: 'white', fontWeight: '700' }}>App Store</div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>iOS 15+</div>
            </a>

            {/* Android — auto-latest APK from GitHub release (same as Admin → App Download) */}
            <a
              href="https://www.dineopen.com/download/android"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '28px 20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', transition: 'all 0.25s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #34a853, #1e8e3e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaAndroid size={26} style={{ color: 'white' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download for</div>
                <div style={{ fontSize: '17px', color: 'white', fontWeight: '700' }}>Android</div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Android 8+</div>
            </a>

            {/* Windows — auto-latest installer via backend resolver (same as Admin → App Download) */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.dineopen.com'}/api/download/desktop?app=online&platform=win`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '28px 20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', transition: 'all 0.25s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0078d4, #005a9e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaWindows size={24} style={{ color: 'white' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download for</div>
                <div style={{ fontSize: '17px', color: 'white', fontWeight: '700' }}>Windows</div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Windows 10+</div>
            </a>

            {/* Mac — auto-latest installer via backend resolver (same as Admin → App Download) */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.dineopen.com'}/api/download/desktop?app=online&platform=mac`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '28px 20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', transition: 'all 0.25s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #555, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaApple size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download for</div>
                <div style={{ fontSize: '17px', color: 'white', fontWeight: '700' }}>macOS</div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>macOS 11+</div>
            </a>
          </div>

          {/* Bottom note */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569', marginTop: '24px' }}>
            All apps connect to the same account. Set up once, use everywhere.
          </p>
        </div>
      </section>

      <Footer />

      {/* Demo Modal */}
      {showDemoModal && (
        <div onClick={closeDemoModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            {/* Top accent bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)' }} />

            {/* Close button */}
            <button
              onClick={closeDemoModal}
              style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'rgba(0,0,0,0.05)', fontSize: '16px', cursor: 'pointer', color: '#9ca3af', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 1, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#374151'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              <FaTimes size={12} />
            </button>

            {demoSuccess ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FaCheckCircle size={32} color="white" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>Request Submitted!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>We&apos;ll contact you shortly to schedule your demo.</p>
                <p style={{ fontSize: '14px', color: '#374151', margin: '20px 0 12px', fontWeight: '600' }}>Meanwhile, you can look around on your own. The trial is free for 7 days.</p>
                <button
                  onClick={() => { closeDemoModal(); router.push('/login'); }}
                  style={{ padding: '12px 22px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}
                >
                  Start my free account
                </button>
              </div>
            ) : (
              <div style={{ padding: '24px 28px 28px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#111827' }}>Get a Free Demo</h3>
                  <p style={{ fontSize: '13px', color: '#9ca3af' }}>See DineOpen in action for your restaurant</p>
                </div>

                {/* Contact info banner */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '10px 16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <a href="mailto:info@dineopen.com" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: '500' }}>
                    <FaEnvelope size={11} color="#ef4444" /> info@dineopen.com
                  </a>
                  <span style={{ color: '#d1d5db', fontSize: '12px' }}>|</span>
                  <a href="tel:+919528632779" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: '500' }}>
                    <FaPhone size={11} color="#ef4444" /> +91 95286 32779
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Contact method toggle + input in one row */}
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <button
                        onClick={() => { setDemoContactType('phone'); setDemoEmail(''); }}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${demoContactType === 'phone' ? '#ef4444' : '#e5e7eb'}`, background: demoContactType === 'phone' ? '#fef2f2' : 'white', color: demoContactType === 'phone' ? '#ef4444' : '#6b7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaPhone size={10} /> Phone</span>
                      </button>
                      <button
                        onClick={() => { setDemoContactType('email'); setDemoPhone(''); }}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${demoContactType === 'email' ? '#ef4444' : '#e5e7eb'}`, background: demoContactType === 'email' ? '#fef2f2' : 'white', color: demoContactType === 'email' ? '#ef4444' : '#6b7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaEnvelope size={10} /> Email</span>
                      </button>
                    </div>
                    {demoContactType === 'phone' ? (
                      <input
                        type="tel"
                        placeholder="+91 95286 32779"
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                    ) : (
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                    )}
                  </div>

                  {/* Restaurant name */}
                  <input
                    type="text"
                    placeholder="Restaurant name (optional)"
                    value={demoRestaurantName}
                    onChange={(e) => setDemoRestaurantName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />

                  {/* Additional details */}
                  <textarea
                    placeholder="Tell us about your restaurant (optional)"
                    value={demoComment}
                    onChange={(e) => setDemoComment(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', resize: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />

                  {demoError && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                      {demoError}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitDemoRequest}
                    disabled={demoSubmitting}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', background: demoSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: '700', fontSize: '15px', border: 'none', cursor: demoSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onMouseEnter={(e) => { if (!demoSubmitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.35)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {demoSubmitting ? (
                      <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                    ) : (
                      <><FaPaperPlane size={13} /> Request Demo</>
                    )}
                  </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '14px', lineHeight: '1.5' }}>
                  No spam, no commitment. We&apos;ll reach out within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919528632779?text=Hi%2C%20I%27m%20interested%20in%20DineOpen%20POS!"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '28px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.4)'; }}
      >
        <FaWhatsapp size={32} color="#fff" />
      </a>
    </main>

  );
}