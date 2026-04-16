'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '../lib/api';
import CommonHeader from '../components/CommonHeader';
import Footer from '../components/Footer';
import {
  FaUtensils, FaChartBar, FaTable, FaMobile, FaCloud, FaClock, FaUsers, FaCheckCircle,
  FaArrowRight, FaBars, FaTimes, FaPlay, FaShieldAlt, FaHeadset, FaRocket, FaChevronDown,
  FaRobot, FaStore, FaBoxes, FaWarehouse, FaBuilding, FaWhatsapp, FaQrcode, FaReceipt,
  FaMicrophone, FaStar, FaCamera, FaMagic, FaBolt, FaFilePdf, FaImage, FaSpinner, FaPaperPlane,
  FaBook, FaShoppingCart, FaClipboardList, FaFileInvoice, FaCog
} from 'react-icons/fa';

export default function LandingPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  
  // Animation States
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [chatStep, setChatStep] = useState(0);
  const [rotatingTextIndex, setRotatingTextIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in');

  const rotatingWords = ['Restaurants', 'Cafes', 'Bars', 'Cloud Kitchens', 'Food Trucks', 'Bakeries'];

  // Demo Form State dd
  const [demoContactType, setDemoContactType] = useState('phone');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoRestaurantName, setDemoRestaurantName] = useState('');
  const [demoComment, setDemoComment] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cycle Process Steps
  useEffect(() => {
    const interval = setInterval(() => setActiveProcessStep(p => (p + 1) % 3), 4000); 
    return () => clearInterval(interval);
  }, []);

  // Rotating Text Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setRotatingTextIndex((prev) => (prev + 1) % rotatingWords.length);
        setFadeState('fade-in');
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  // AI Chat Animation
  useEffect(() => {
    let mounted = true;
    const runChatSequence = async () => {
      while (mounted) {
        setChatStep(0); await new Promise(r => setTimeout(r, 1000));
        if(!mounted) break; setChatStep(1); await new Promise(r => setTimeout(r, 2000));
        if(!mounted) break; setChatStep(2); await new Promise(r => setTimeout(r, 2500));
        if(!mounted) break; setChatStep(3); await new Promise(r => setTimeout(r, 5000));
      }
    };
    runChatSequence();
    return () => { mounted = false; };
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
    if (demoContactType === 'phone' && !demoPhone.trim()) return setDemoError('Phone number is required');
    if (demoContactType === 'email' && !demoEmail.trim()) return setDemoError('Email is required');
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
      setTimeout(() => { 
        setShowDemoModal(false); 
        setDemoSuccess(false); 
        setDemoRestaurantName('');
        setDemoPhone(''); 
        setDemoEmail(''); 
        setDemoComment(''); 
      }, 2000);
    } catch (error) { setDemoError(error.message || 'Failed to submit demo request.'); } 
    finally { setDemoSubmitting(false); }
  };

  const currencySymbols = { USD: '$', GBP: '£', INR: '₹' };
  const currencyNames = { USD: 'USD', GBP: 'GBP', INR: 'INR' };

  const priceTable = {
    INR: {
      symbol: '₹',
      starter:  { monthly: 400,  annual: 333,  regular: 999 },
      growth:   { monthly: 899,  annual: 749,  regular: 1999 },
      pro:      { monthly: 1799, annual: 1499, regular: 3999 },
    },
    USD: {
      symbol: '$',
      starter:  { monthly: 10, annual: 8,  regular: 29 },
      growth:   { monthly: 22, annual: 18, regular: 59 },
      pro:      { monthly: 45, annual: 37, regular: 119 },
    },
    GBP: {
      symbol: '£',
      starter:  { monthly: 8,  annual: 7,  regular: 24 },
      growth:   { monthly: 18, annual: 15, regular: 49 },
      pro:      { monthly: 36, annual: 30, regular: 99 },
    },
  };
  const fmt = (n) => priceTable[currency].symbol + n.toLocaleString('en-IN');
  const plans = [
    {
      name: "Starter",
      type: "starter",
      price: fmt(priceTable[currency].starter[billingCycle]),
      regularPrice: fmt(priceTable[currency].starter.regular),
      discount: Math.round((1 - priceTable[currency].starter[billingCycle] / priceTable[currency].starter.regular) * 100),
      period: 'per month',
      subPrice: 'For single-outlet restaurants',
      features: ["Complete Cloud POS", "QR Digital Menu & Ordering", "KOT Printing", "Unlimited Tables & Staff", "Basic Inventory & Reports", "1 Outlet"],
      button: "Get Started",
      popular: false
    },
    {
      name: "Growth",
      type: "growth",
      price: fmt(priceTable[currency].growth[billingCycle]),
      regularPrice: fmt(priceTable[currency].growth.regular),
      discount: Math.round((1 - priceTable[currency].growth[billingCycle] / priceTable[currency].growth.regular) * 100),
      period: 'per month',
      subPrice: 'For growing restaurants',
      features: ["Everything in Starter", "AI Voice Ordering 🎤", "AI Menu Generator & Insights", "Captain App + Kitchen Display", "Advanced Inventory & Recipes", "Customer Loyalty & WhatsApp", "Up to 2 Outlets"],
      button: "Get Started",
      popular: true
    },
    {
      name: "Pro",
      type: "pro",
      price: fmt(priceTable[currency].pro[billingCycle]),
      regularPrice: fmt(priceTable[currency].pro.regular),
      discount: Math.round((1 - priceTable[currency].pro[billingCycle] / priceTable[currency].pro.regular) * 100),
      period: 'per month',
      subPrice: 'For restaurant chains',
      features: ["Everything in Growth", "Chain Dashboard & HQ View", "Cross-Outlet Analytics", "Centralized Menu Management", "Priority 24/7 Support", "Up to 5 Outlets"],
      button: "Get Started",
      popular: false
    }
  ];

  const processSteps = [
    { icon: <FaCamera size={24} /> },
    { icon: <FaMagic size={24} /> },
    { icon: <FaQrcode size={24} /> }
  ];

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
              <Link 
                href="/restaurants" 
                style={{ 
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
                Restaurants
              </Link>
              
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
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

      {/* 1. HERO SECTION - Enhanced with Modern Animations */}
      <section className="hero-gradient" style={{
        paddingTop: isMobile ? '40px' : '60px',
        paddingBottom: isMobile ? '60px' : '120px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float-y 8s ease-in-out infinite',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float-x 6s ease-in-out infinite',
          pointerEvents: 'none'
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            color: '#111827',
            borderRadius: '30px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '32px',
            border: '1px solid #ddd6fe',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
            animation: 'scale-in 0.5s ease-out'
          }}>
            <FaRocket style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} /> The Global Restaurant Operating System
          </div>
          
          <h1 style={{
            fontSize: isMobile ? '36px' : '68px',
            fontWeight: '900',
            lineHeight: '1.1',
            color: '#111827',
            marginBottom: '24px',
            letterSpacing: '-2px',
            animation: 'fade-in-up 0.6s ease-out 0.1s backwards',
            minHeight: isMobile ? '140px' : '180px'
          }}>
            Next-Gen AI Platform built for modern {' '}
            <span
              className={fadeState}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}
            >
              {rotatingWords[rotatingTextIndex]}
            </span>
            
          </h1>

          <div style={{
            maxWidth: '900px',
            margin: '0 auto 48px',
            animation: 'fade-in-up 0.6s ease-out 0.3s backwards'
          }}>
            <p style={{
              fontSize: isMobile ? '18px' : '22px',
              color: '#4b5563',
              lineHeight: '1.7',
              marginBottom: '32px',
              fontWeight: '400'
            }}>
             The all-in-one operating system for modern restaurants.<br/>
             <span style={{ fontWeight: '600', color: '#111827' }}>POS • Orders • Inventory • Analytics • Growth</span>
            </p>

            {/* Feature Highlights Grid - 6 Core Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Feature 1: Cloud POS */}
              <Link href="/products/pos" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)',
                border: '2px solid #fecdd3',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#fecdd3';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  <FaReceipt size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Lightning-Fast POS
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Bill in 3 seconds flat
                  </div>
                </div>
              </div>
              </Link>

              {/* Feature 2: Waiter & Captain App */}
              <Link href="/products/orders" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.15)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#bbf7d0';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <FaMobile size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Waiter & Captain App
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Tableside ordering made easy
                  </div>
                </div>
              </div>
              </Link>

              {/* Feature 3: Table Reservations */}
              <Link href="/products/table-management" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '2px solid #bfdbfe',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#bfdbfe';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  <FaTable size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Table Reservations
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Online booking 24/7
                  </div>
                </div>
              </div>
              </Link>

              {/* Feature 4: Inventory Management */}
              <Link href="/products/inventory" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                border: '2px solid #fde047',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(234, 179, 8, 0.15)';
                e.currentTarget.style.borderColor = '#eab308';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#fde047';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)'
                }}>
                  <FaBoxes size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Smart Inventory
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Auto low-stock alerts
                  </div>
                </div>
              </div>
              </Link>

              {/* Feature 5: AI Analytics */}
              <Link href="/products/ai" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '2px solid #ddd6fe',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#ddd6fe';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                  <FaChartBar size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    AI Analytics
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Insights at a glance
                  </div>
                </div>
              </div>
              </Link>

              {/* Feature 6: Loyalty & Rewards */}
              <Link href="/products/loyalty" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
                border: '2px solid #f5d0fe',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(217, 70, 239, 0.15)';
                e.currentTarget.style.borderColor = '#d946ef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#f5d0fe';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(217, 70, 239, 0.3)'
                }}>
                  <FaStar size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Loyalty & Rewards
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Keep customers coming back
                  </div>
                </div>
              </div>
              </Link>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexDirection: isMobile ? 'column' : 'row',
            marginBottom: isMobile ? '32px' : '48px',
            alignItems: 'center',
            animation: 'fade-in-up 0.6s ease-out 0.4s backwards'
          }}>
            <button
              onClick={handleLogin}
              style={{
                padding: isMobile ? '16px 40px' : '20px 56px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px) scale(1.02)'; e.target.style.boxShadow = '0 20px 40px -10px rgba(239, 68, 68, 0.6)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 10px 25px -5px rgba(239, 68, 68, 0.4)'; }}
            >
              <FaRocket size={16} /> Start Free Trial
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              style={{
                padding: isMobile ? '16px 40px' : '20px 56px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                borderRadius: '16px',
                background: 'white',
                color: '#111827',
                border: '2px solid #e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; e.target.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#111827'; e.target.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
            >
              <FaPlay size={14} /> Demo Connect
            </button>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS - 3 STEP SECTION */}
      <section style={{ padding: isMobile ? '60px 20px' : '100px 20px', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background pattern */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 50%, rgba(239,68,68,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16,185,129,0.03) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '60px' }}>
            <div style={{
              fontSize: '13px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase',
              letterSpacing: '1.5px', marginBottom: '16px', display: 'inline-block',
              padding: '6px 16px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              borderRadius: '20px', border: '1px solid #a7f3d0'
            }}>
              ⚡ ZERO WAIT TIME
            </div>
            <h2 style={{
              fontSize: isMobile ? '32px' : '52px', fontWeight: '900', color: '#111827',
              marginBottom: '16px', lineHeight: '1.15', letterSpacing: '-1px'
            }}>
              Start Selling in{' '}
              <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                5 Minutes
              </span>
            </h2>
            <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              No hardware. No training. No waiting. Just login, share your menu, and your POS is live.
            </p>
          </div>

          {/* 3 Steps */}
          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: isMobile ? '24px' : '40px', position: 'relative'
          }}>
            {/* Connecting line (desktop only) */}
            {!isMobile && (
              <div style={{
                position: 'absolute', top: '60px', left: '20%', right: '20%', height: '3px',
                background: 'linear-gradient(90deg, #fecaca, #ef4444, #fecaca)', borderRadius: '2px', zIndex: 0
              }} />
            )}

            {/* Step 1 */}
            <div style={{
              textAlign: 'center', position: 'relative', zIndex: 1,
              padding: isMobile ? '28px 20px' : '36px 28px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
              borderRadius: '20px', border: '1px solid #fee2e2',
              boxShadow: '0 4px 20px rgba(239,68,68,0.06)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
                fontSize: '28px', color: '#fff'
              }}>
                <FaRocket />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Step 1</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>Sign Up Free</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                Create your account in 30 seconds. No credit card, no contracts, no paperwork.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              textAlign: 'center', position: 'relative', zIndex: 1,
              padding: isMobile ? '28px 20px' : '36px 28px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              borderRadius: '20px', border: '1px solid #bbf7d0',
              boxShadow: '0 4px 20px rgba(16,185,129,0.06)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                fontSize: '28px', color: '#fff'
              }}>
                <FaQrcode />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Step 2</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>Share Your Menu</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                Upload a photo or PDF of your menu. Our AI converts it into a digital menu with QR code instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              textAlign: 'center', position: 'relative', zIndex: 1,
              padding: isMobile ? '28px 20px' : '36px 28px',
              background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
              borderRadius: '20px', border: '1px solid #bfdbfe',
              boxShadow: '0 4px 20px rgba(59,130,246,0.06)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                fontSize: '28px', color: '#fff'
              }}>
                <FaStore />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Step 3</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>You{"'"}re Live!</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                Start billing, take orders, manage tables. Your full POS is ready — no hardware needed.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', marginTop: isMobile ? '36px' : '48px' }}>
            <button onClick={handleLogin} style={{
              padding: '16px 40px', fontSize: '17px', fontWeight: '700', color: '#fff',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none', borderRadius: '14px', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
              transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '10px'
            }}>
              <FaRocket size={16} /> Start Selling Now — It{"'"}s Free
            </button>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '12px' }}>
              No credit card required • Setup in under 5 minutes • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* 2. AI AUTOMATION SECTION */}
      <section style={{ padding: isMobile ? '80px 20px' : '120px 20px', backgroundColor: '#f9fafb', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decoration */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#dc2626',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            display: 'inline-block',
            padding: '6px 16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderRadius: '20px',
            border: '1px solid #fecaca'
          }}>
            🤖 SMART AI ASSISTANT
          </div>
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: '900',
            color: '#111827',
            marginBottom: '24px',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            Your AI Assistant <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Never Sleeps</span>
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: '#6b7280',
            maxWidth: '750px',
            margin: '0 auto 60px',
            lineHeight: '1.7'
          }}>
            Our AI Agent works around the clock—taking phone calls, answering customer questions, processing orders via WhatsApp, and intelligently upselling. It never takes breaks, never calls in sick, and scales instantly during rush hours. <strong>Included in all plans.</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            {/* AI Visual - Chat Interface */}
            <div style={{ background: 'white', borderRadius: '32px', boxShadow: '0 20px 50px -10px rgba(239, 68, 68, 0.12)', padding: '24px', border: '1px solid #f3f4f6' }}>
              <div style={{ background: '#f9fafb', borderRadius: '24px', padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaRobot color="white" size={20}/></div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>AI Assistant</div>
                    <div style={{ fontSize: '12px', color: '#10b981' }}>● Active 24/7</div>
                  </div>
                </div>
                
                {/* Chat Bubbles */}
                <div className="chat-bubble" style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  Welcome! What would you like to order today?
                </div>
                
                {chatStep >= 1 && (
                  <div className="chat-bubble" style={{ alignSelf: 'flex-end', background: '#111827', color: 'white', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: '14px' }}>
                    Show me your best dishes
                  </div>
                )}

                {chatStep === 2 && (
                  <div className="chat-bubble" style={{ alignSelf: 'flex-start', background: 'white', padding: '12px', borderRadius: '16px', width: '60px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', animation: 'typing 1s infinite' }}></div>
                    <div style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', animation: 'typing 1s infinite 0.2s' }}></div>
                    <div style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', animation: 'typing 1s infinite 0.4s' }}></div>
                  </div>
                )}

                {chatStep >= 3 && (
                  <div className="chat-bubble" style={{ alignSelf: 'flex-start', width: '100%' }}>
                    <div style={{ background: 'white', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '8px' }}>
                      Here&apos;s our <strong>Chef&apos;s Special</strong> - Grilled Salmon! 🔥 Our most popular dish!
                    </div>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '24px' }}>🍽️</div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>Grilled Salmon</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{currency === 'INR' ? '₹850' : currency === 'GBP' ? '£18' : '$22'} • ⭐ 4.9 Rating</div>
                      </div>
                      <button style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>Add</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', textAlign: 'left' }}>
              {[
                 { title: "AI Voice Agent", desc: "Takes orders via phone calls automatically.", icon: <FaMicrophone/> },
                { title: "Stock Verification", desc: "Checks availability before confirming.", icon: <FaBoxes/> },
                { title: "Smart Upselling", desc: "Recommends add-ons automatically.", icon: <FaChartBar/> },
                { title: "Direct to Kitchen", desc: "KOT sent instantly.", icon: <FaReceipt/> }
              ].map((f, i) => (
                <div key={i} className="feature-card" style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #f3f4f6', transition: 'all 0.3s' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', color: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FREE QR MENU SECTION - Redesigned */}
      <section style={{ padding: isMobile ? '80px 20px' : '120px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '800',
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '16px',
              display: 'inline-block',
              padding: '6px 16px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '20px',
              border: '1px solid #bbf7d0'
            }}>
              ✨ ALWAYS FREE
            </div>
            <h2 style={{
              fontSize: isMobile ? '36px' : '56px',
              fontWeight: '900',
              color: '#111827',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '-1px'
            }}>
              Turn Your Menu Into a <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Smart QR Code</span>
            </h2>
            <p style={{ fontSize: isMobile ? '18px' : '22px', color: '#6b7280', maxWidth: '750px', margin: '0 auto', lineHeight: '1.7' }}>
              Upload your menu PDF or photo. Get a beautiful digital menu with QR code in under 3 minutes. Customers order directly without any app. <strong>Print the QR, stick it on tables. Done.</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '32px' }}>

            {/* Card 1: Instant Menu Creation */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '32px',
              padding: isMobile ? '32px' : '48px',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid #10b981',
              boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: '800',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <FaBolt /> INSTANT SETUP
                </div>
                <h3 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '900', color: '#065f46', marginBottom: '16px', lineHeight: '1.2' }}>
                  From PDF to Live Menu in 3 Minutes
                </h3>
                <p style={{ fontSize: '16px', color: '#047857', marginBottom: '32px', lineHeight: '1.6' }}>
                  Upload any menu format - PDF, image, or even a photo from your phone. Our AI converts it into a gorgeous digital menu instantly. Add photos, prices, descriptions later.
                </p>

                {/* Process Flow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { icon: '📤', title: 'Upload Menu', desc: 'PDF, JPG, or photo' },
                    { icon: '🤖', title: 'AI Converts', desc: 'Automatic item detection' },
                    { icon: '✅', title: 'Get QR Code', desc: 'Ready to print & use' }
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'white',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ fontSize: '28px' }}>{item.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '2px' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</div>
                  </div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}>
                        {i + 1}
                  </div>
                </div>
                  ))}
              </div>
                </div>
              </div>

            {/* Card 2: QR Menu & AI Voice Agent */}
            <div className="feature-card" style={{
              background: 'white',
              borderRadius: '32px',
              padding: isMobile ? '32px' : '48px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  color: '#dc2626',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: '800',
                  marginBottom: '24px'
                }}>
                  <FaQrcode /> FREE QR MENU
                </div>
                <h3 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '900', color: '#111827', marginBottom: '16px', lineHeight: '1.2' }}>
                  QR Menu + AI Voice Agent
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
                  Customers scan QR code to view menu. <strong>AI voice agent</strong> takes phone orders, manages table bookings, and sends orders directly to your kitchen. Works 24/7 automatically.
                </p>
            </div>

              {/* Visual Flow */}
              <div style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '16px' : '0', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'white',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <FaQrcode size={28} color="#ef4444" />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>Scan QR</div>
                  </div>
                  {!isMobile && <FaArrowRight size={20} color="#d1d5db" />}
                  {isMobile && <div style={{ fontSize: '20px', color: '#d1d5db' }}>↓</div>}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'white',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <FaMobile size={28} color="#ef4444" />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>View Menu</div>
                  </div>
                  {!isMobile && <FaArrowRight size={20} color="#d1d5db" />}
                  {isMobile && <div style={{ fontSize: '20px', color: '#d1d5db' }}>↓</div>}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}>
                      <FaMicrophone size={28} color="white" />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>AI Agent</div>
                  </div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#6b7280',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  🤖 AI voice agent takes orders & manages bookings automatically
                </div>
              </div>
              </div>
              
                    </div>
                  </div>
      </section>

      {/* 4. COMPREHENSIVE FEATURES SECTION */}
      <section style={{ padding: isMobile ? '80px 20px' : '120px 20px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
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
              ⚡ ALL-IN-ONE PLATFORM
              </div>
            <h2 style={{
              fontSize: isMobile ? '36px' : '56px',
              fontWeight: '900',
              color: '#111827',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '-1px'
            }}>
              Everything You Need to <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Run Your Restaurant</span>
            </h2>
            <p style={{ fontSize: isMobile ? '18px' : '22px', color: '#6b7280', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>
              Complete restaurant management system with POS billing, inventory tracking, table management, and real-time analytics.
            </p>
            </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '24px' : '32px', marginBottom: isMobile ? '32px' : '48px' }}>
            {/* Feature 1: POS Billing */}
            <div className="feature-card" style={{
              background: 'white',
              padding: isMobile ? '24px' : '40px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <FaReceipt size={28} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                Cloud POS System
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Fast & accurate billing software with tax compliance. Accept all payment methods—cash, cards, digital wallets. Works globally.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ Tax Compliant • ✓ All Payments • ✓ Any Device
              </div>
            </div>

            {/* Feature 2: Inventory Management */}
            <div className="feature-card" style={{
              background: 'white',
              padding: isMobile ? '24px' : '40px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <FaWarehouse size={28} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                Inventory Management
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Track stock levels, get low-stock alerts, manage ingredients & suppliers. Auto-deduct items on orders.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ Real-time Tracking • ✓ Low Stock Alerts • ✓ Auto Deduction
              </div>
            </div>

            {/* Feature 3: Table Management */}
            <div className="feature-card" style={{
              background: 'white',
              padding: isMobile ? '24px' : '40px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <FaTable size={28} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                Table Management
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Manage unlimited tables, merge bills, split payments. Track occupied & free tables in real-time.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ Unlimited Tables • ✓ Bill Splitting • ✓ Real-time Status
              </div>
            </div>

            {/* Feature 4: KOT System */}
            <div className="feature-card" style={{
              background: 'white',
              padding: isMobile ? '24px' : '40px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <FaUtensils size={28} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                KOT System
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Kitchen Order Tickets sent instantly to kitchen. Track order status from preparation to serving.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ Instant KOT • ✓ Order Tracking • ✓ Kitchen Display
              </div>
            </div>

            {/* Feature 5: Analytics & Reports */}
            <div className="feature-card" style={{
              background: 'white',
              padding: isMobile ? '24px' : '40px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <FaChartBar size={28} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                Analytics & Reports
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Detailed sales reports, revenue analytics, top-selling items. Export reports as PDF or Excel.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ Sales Analytics • ✓ Revenue Reports • ✓ PDF Export
              </div>
            </div>

            {/* Feature 6: CRM & Loyalty */}
            <div className="feature-card" style={{
              background: 'white',
              padding: isMobile ? '24px' : '40px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <FaUsers size={28} color="#ec4899" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                CRM & Loyalty
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Build customer database, track order history, send offers. Reward loyal customers automatically.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ Customer Database • ✓ Order History • ✓ Loyalty Rewards
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY RESTAURANTS WORLDWIDE - SOCIAL PROOF */}
      <section style={{ padding: isMobile ? '60px 20px' : '100px 20px', backgroundColor: '#f9fafb', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '56px' }}>
            <div style={{
              fontSize: '13px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase',
              letterSpacing: '1.5px', marginBottom: '16px', display: 'inline-block',
              padding: '6px 16px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              borderRadius: '20px', border: '1px solid #fecaca'
            }}>
              🌍 TRUSTED WORLDWIDE
            </div>
            <h2 style={{
              fontSize: isMobile ? '32px' : '52px', fontWeight: '900', color: '#111827',
              marginBottom: '16px', lineHeight: '1.15', letterSpacing: '-1px'
            }}>
              Powering Restaurants Across{' '}
              <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                The Globe
              </span>
            </h2>
            <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#6b7280', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
              From street-side cafes in Mumbai to fine dining in London — restaurant owners trust DineOpen to run their business.
            </p>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '16px' : '24px', marginBottom: isMobile ? '40px' : '56px'
          }}>
            {[
              { number: '1,000+', label: 'Restaurants', icon: '🍽️' },
              { number: '20+', label: 'Countries', icon: '🌍' },
              { number: '50K+', label: 'Orders Daily', icon: '📦' },
              { number: '4.8/5', label: 'Rating', icon: '⭐' }
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: isMobile ? '20px 12px' : '28px 20px',
                background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '900', color: '#111827', lineHeight: '1' }}>{stat.number}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Client Badges - Country-wise */}
          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '20px' : '28px', marginBottom: isMobile ? '40px' : '56px'
          }}>
            {/* India */}
            <div style={{
              padding: '28px', background: '#fff', borderRadius: '20px', border: '1px solid #f3f4f6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>🇮🇳</span>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>India</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>40+ cities</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'].map(city => (
                  <span key={city} style={{
                    fontSize: '12px', fontWeight: '600', color: '#ef4444', padding: '4px 10px',
                    background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca'
                  }}>{city}</span>
                ))}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['GST Compliant', 'UPI Payments', 'Zomato & Swiggy'].map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px', fontWeight: '700', color: '#10b981', padding: '3px 8px',
                    background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0'
                  }}>✓ {tag}</span>
                ))}
              </div>
            </div>

            {/* UK & Europe */}
            <div style={{
              padding: '28px', background: '#fff', borderRadius: '20px', border: '1px solid #f3f4f6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>🇬🇧</span>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>United Kingdom</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>London & across UK</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Leeds'].map(city => (
                  <span key={city} style={{
                    fontSize: '12px', fontWeight: '600', color: '#3b82f6', padding: '4px 10px',
                    background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe'
                  }}>{city}</span>
                ))}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['VAT Compliant', 'Card Payments', 'GBP Pricing'].map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px', fontWeight: '700', color: '#10b981', padding: '3px 8px',
                    background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0'
                  }}>✓ {tag}</span>
                ))}
              </div>
            </div>

            {/* USA & Global */}
            <div style={{
              padding: '28px', background: '#fff', borderRadius: '20px', border: '1px solid #f3f4f6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>🇺🇸</span>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>USA & Global</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>UAE, Singapore, Canada & more</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['New York', 'Dubai', 'Singapore', 'Toronto', 'Sydney', 'California'].map(city => (
                  <span key={city} style={{
                    fontSize: '12px', fontWeight: '600', color: '#8b5cf6', padding: '4px 10px',
                    background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe'
                  }}>{city}</span>
                ))}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Multi-Currency', 'Tax Compliant', 'Global Support'].map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px', fontWeight: '700', color: '#10b981', padding: '3px 8px',
                    background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0'
                  }}>✓ {tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '12px' : '20px',
            padding: isMobile ? '24px 16px' : '32px 40px',
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            borderRadius: '20px', border: '1px solid #374151'
          }}>
            {[
              { icon: '🔒', label: 'PCI DSS Compliant', sub: 'Secure Payments' },
              { icon: '☁️', label: '99.9% Uptime', sub: 'Cloud Hosted' },
              { icon: '🛡️', label: 'Data Encrypted', sub: 'SSL Protected' },
              { icon: '📱', label: 'Works Everywhere', sub: 'Any Device' },
              { icon: '💸', label: 'Zero Transaction Fee', sub: 'No Hidden Costs' },
              { icon: '🔄', label: 'No Lock-in Contract', sub: 'Cancel Anytime' }
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: isMobile ? '10px 14px' : '12px 20px',
                background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ fontSize: '22px' }}>{badge.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{badge.label}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{badge.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIVE RESTAURANT DASHBOARD SECTION */}
      <section style={{ padding: isMobile ? '80px 20px' : '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
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
            📊 REAL-TIME ANALYTICS
          </div>
          <h2 style={{
            fontSize: isMobile ? '32px' : '52px',
            fontWeight: '900',
            marginBottom: '20px',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            Live <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Restaurant Dashboard</span>
          </h2>
          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.7'
          }}>
            Monitor your entire restaurant from one powerful dashboard. Track tables, orders, inventory, and sales in real-time.
          </p>

          {/* Dashboard Visual */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.2)',
            border: '1px solid #e5e7eb',
            background: '#f8fafc'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: isMobile ? '300px' : '600px'
            }}>
              <Image
                src="https://storage.googleapis.com/demoimage-7189/menu-items/LUETVd1eMwu4Bm7PvP9K/item_1760637762769_df90sl6pe/1760767605179-0-Screenshot%202025-10-18%20at%2011.36.31%C3%A2%C2%80%C2%AFAM.png"
                alt="DineOpen Restaurant Dashboard - Real-time POS System Interface"
                fill
                sizes="(max-width: 768px) 100vw, 1100px"
                style={{ objectFit: 'cover', objectPosition: 'top' }}
                priority
              />
            </div>
                    </div>

          {/* Feature Pills */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '12px' : '16px',
            marginTop: '40px',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: '📊', text: 'Live Analytics' },
              { icon: '🍽️', text: 'Table Management' },
              { icon: '📦', text: 'Inventory Tracking' },
              { icon: '💰', text: 'Revenue Reports' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: isMobile ? '10px 16px' : '12px 24px',
                background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                borderRadius: '30px',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '700',
                color: '#374151',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{item.icon}</span> {item.text}
                  </div>
                ))}
          </div>
        </div>
      </section>

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
            {['USD', 'GBP', 'INR'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currency === curr ? 'white' : 'transparent',
                  color: currency === curr ? '#111827' : '#6b7280',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: currency === curr ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {currencySymbols[curr]} {curr}
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
                { key: 'annual', label: 'Annual', badge: 'Save 17%' }
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
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
                <p style={{ fontSize: '12px', color: plan.popular ? '#6ee7b7' : '#16a34a', fontWeight: '600', marginBottom: '4px' }}>Lock this price forever. Pay once, keep your account active until you start. No recurring billing.</p>
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

      {/* AEO SECTIONS - Added at the end of page */}
      
      {/* What is DineOpen Section - AEO Optimized */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
            What is DineOpen?
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              <strong>DineOpen is an AI-powered restaurant management platform</strong> that uses autonomous AI agents to run your restaurant operations 24/7. It combines an intelligent AI voice assistant, cloud-based POS system, digital menu management, inventory tracking, and real-time analytics in one unified platform.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              The AI Agent acts as your digital employee—it takes phone orders using natural voice conversation, processes WhatsApp and web orders, manages table reservations, answers customer questions, and intelligently upsells based on menu knowledge. The system works globally, requires no hardware installation, and runs on any device with internet access.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              DineOpen is designed for restaurants, cafes, cloud kitchens, bakeries, and food service businesses of all sizes worldwide. Pricing starts at $10/month (or equivalent in local currency), making advanced AI restaurant technology accessible to businesses of any size.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Section - AEO Optimized Q&A Format */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '32px' : '48px', textAlign: 'center' }}>
            How Does DineOpen Work?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '24px' : '32px' }}>
            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What is the AI Agent in DineOpen?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                The AI Agent is an autonomous digital assistant that handles customer interactions 24/7. It answers phone calls in natural conversation, takes orders via voice, processes WhatsApp messages, manages reservations, answers menu questions, and intelligently upsells—all without human intervention.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                How does AI voice ordering work?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                When customers call your restaurant, the AI Agent answers immediately and engages in natural conversation. It understands order requests, asks clarifying questions, suggests add-ons, confirms the order, and sends it directly to your kitchen. Handles multiple languages seamlessly.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What is the cloud POS system?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                DineOpen&apos;s cloud POS runs entirely in your web browser—no software installation or special hardware required. Process orders, generate bills, accept all payment methods (cash, cards, digital wallets), manage tables, and sync across all devices instantly. Access from anywhere.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                How do QR code digital menus work?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Upload your menu and DineOpen generates a shareable QR code. Customers scan with their phone—no app needed—browse the interactive menu, customize orders, and submit directly to your kitchen. Update prices or items anytime; changes reflect instantly across all locations.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Does DineOpen support international tax compliance?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen supports configurable tax settings for global compliance. Set up VAT, GST, sales tax, or any local tax structure. The system automatically calculates taxes, generates compliant invoices, and maintains records for reporting in any jurisdiction.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What analytics and insights does DineOpen provide?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Real-time dashboard shows live orders, revenue, popular items, peak hours, and performance metrics. AI-powered insights identify trends, predict demand, and suggest optimizations. Export detailed reports (PDF/Excel) for sales, inventory, and profitability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why DineOpen Section */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '24px' : '32px', textAlign: 'center' }}>
            Why Choose DineOpen Over Traditional POS Systems?
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              <strong>DineOpen is the only restaurant platform with a built-in autonomous AI Agent.</strong> Unlike traditional POS systems like Toast, Square, or Lightspeed that simply process transactions, DineOpen&apos;s AI actively works for you—taking orders, managing reservations, and engaging customers 24/7.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              Traditional restaurant software requires expensive hardware, lengthy installations, and ongoing IT support. DineOpen is 100% cloud-based—start using it in minutes on any device you already own. No terminals to buy, no software to install, no technical expertise required.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              Most POS providers charge hefty setup fees plus monthly subscriptions that increase as you grow. DineOpen offers transparent pricing starting at $10/month with no hidden fees, no long-term contracts, and no per-transaction charges. The AI Agent is included free in all plans.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              Whether you run a single cafe or a multi-location restaurant group, DineOpen scales with you. The same platform that handles a 10-table bistro can manage a chain with hundreds of locations—all from one unified dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section - International */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '32px' : '48px', textAlign: 'center' }}>
            Who Uses DineOpen?
          </h2>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              What types of restaurants use DineOpen?
            </h3>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '12px' }}>
              DineOpen serves restaurants, cafes, coffee shops, fast-casual chains, fine dining establishments, cloud kitchens, ghost kitchens, food trucks, bakeries, bars, and any food service business worldwide that wants AI-powered automation.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              From single-location independent restaurants to multi-unit franchises, DineOpen scales to fit your needs. The AI Agent particularly benefits high-volume operations that struggle with phone orders during peak hours, and businesses that want to provide 24/7 ordering without staffing costs.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Is DineOpen suitable for small businesses?
            </h3>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '12px' }}>
              DineOpen is designed to make enterprise-grade AI technology accessible to businesses of all sizes. Pricing starts at just $10/month—making advanced AI ordering, inventory management, and analytics affordable for even the smallest cafes.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '12px' }}>
              Small restaurants benefit most from DineOpen&apos;s AI Agent—it&apos;s like hiring a staff member that works 24/7 without salary, benefits, or breaks. The system requires no technical expertise, no hardware investment, and no long-term commitments.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              Get started in minutes on any device you already own. If your phone or tablet has internet access, you can run your entire restaurant operation with DineOpen.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section - AEO Optimized */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '32px' : '48px', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px' }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What is DineOpen?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                DineOpen is an AI-powered restaurant management platform with an autonomous AI Agent that handles customer orders via voice calls, WhatsApp, and web. It includes cloud POS, digital QR menus, inventory management, and real-time analytics. Pricing starts at $10/month globally.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                How does the AI Agent work?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                The AI Agent is an autonomous digital employee that operates 24/7. It answers phone calls in natural conversation, takes orders, manages reservations, answers customer questions, and intelligently suggests add-ons. Orders are sent directly to your kitchen system without human intervention.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Do I need special hardware?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                No. DineOpen is 100% cloud-based and runs in any web browser. Use any device you already have—computer, tablet, smartphone, or iPad. No terminals to purchase, no software to install. Start using it immediately after signup.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What countries does DineOpen support?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                DineOpen works globally. The platform supports multiple currencies (USD, GBP, EUR, INR, and more), configurable tax settings for any jurisdiction, and multiple languages. Whether you&apos;re in the US, UK, Europe, Asia, or anywhere else—DineOpen works for you.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                How much does DineOpen cost?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Plans start at $10/month (Starter) or $30/month (Professional). No setup fees, no long-term contracts, no hidden charges. The AI Agent is included free in all plans. Enterprise pricing is available for multi-location businesses with custom requirements.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Can I try DineOpen for free?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes! Start a free trial with full access to all features including the AI Agent. No credit card required. See how DineOpen transforms your restaurant operations before committing to any plan.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Is my data secure?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                DineOpen uses enterprise-grade security with encrypted data transmission, secure cloud storage, automatic backups, and compliance with international data protection standards. Your restaurant data is protected 24/7 with industry-leading security practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <Footer />

      {/* Demo Modal */}
      {showDemoModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '520px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => {
                setShowDemoModal(false);
                setDemoRestaurantName('');
                setDemoPhone('');
                setDemoEmail('');
                setDemoComment('');
                setDemoError('');
                setDemoSuccess(false);
              }} 
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              <FaTimes />
            </button>
            
            {demoSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <FaCheckCircle size={40} color="white" />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#111827' }}>Demo Request Submitted!</h3>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>We&apos;ll contact you shortly to schedule your demo.</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <FaPlay size={28} color="#ef4444" />
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>Request a Free Demo</h3>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>See how DineOpen can transform your restaurant</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                      Contact Method <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <button
                        onClick={() => { setDemoContactType('phone'); setDemoEmail(''); }}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `2px solid ${demoContactType === 'phone' ? '#ef4444' : '#e5e7eb'}`,
                          background: demoContactType === 'phone' ? '#fef2f2' : 'white',
                          color: demoContactType === 'phone' ? '#ef4444' : '#6b7280',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        📞 Phone
                      </button>
                      <button
                        onClick={() => { setDemoContactType('email'); setDemoPhone(''); }}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `2px solid ${demoContactType === 'email' ? '#ef4444' : '#e5e7eb'}`,
                          background: demoContactType === 'email' ? '#fef2f2' : 'white',
                          color: demoContactType === 'email' ? '#ef4444' : '#6b7280',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        ✉️ Email
                      </button>
                    </div>
                  </div>

                  {demoContactType === 'phone' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Phone Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        value={demoPhone} 
                        onChange={(e) => setDemoPhone(e.target.value)} 
                        style={{ 
                          width: '100%',
                          padding: '14px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid #e5e7eb',
                          fontSize: '15px',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="email" 
                        placeholder="your@email.com" 
                        value={demoEmail} 
                        onChange={(e) => setDemoEmail(e.target.value)} 
                        style={{ 
                          width: '100%',
                          padding: '14px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid #e5e7eb',
                          fontSize: '15px',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Additional Details (Optional)
                    </label>
                    <textarea 
                      placeholder="Tell us about your restaurant, number of tables, current system, etc." 
                      value={demoComment} 
                      onChange={(e) => setDemoComment(e.target.value)} 
                      rows={4}
                      style={{ 
                        width: '100%',
                        padding: '14px 16px', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Restaurant Name (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter your restaurant name" 
                      value={demoRestaurantName} 
                      onChange={(e) => setDemoRestaurantName(e.target.value)} 
                      style={{ 
                        width: '100%',
                        padding: '14px 16px', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        fontSize: '15px',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                  </div>

                  {demoError && (
                    <div style={{ 
                      padding: '12px 16px', 
                      background: '#fef2f2', 
                      border: '1px solid #fecaca', 
                      borderRadius: '10px', 
                      color: '#dc2626', 
                      fontSize: '14px' 
                    }}>
                      {demoError}
                    </div>
                  )}

                  <button 
                    onClick={handleSubmitDemoRequest}
                    disabled={demoSubmitting}
                    style={{ 
                      width: '100%',
                      padding: '16px', 
                      borderRadius: '12px', 
                      background: demoSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '16px',
                      border: 'none', 
                      cursor: demoSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => { if (!demoSubmitting) e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)'; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                  >
                    {demoSubmitting ? (
                      <>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> Request Demo
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/917042330092?text=Hi%2C%20I%27m%20interested%20in%20DineOpen%20POS!"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          position: 'fixed',
          bottom: '28px',
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