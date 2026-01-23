'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '../lib/api';
import SEOStructuredData from '../components/SEOStructuredData';
import FAQSchema from '../components/FAQSchema';
import CommonHeader from '../components/CommonHeader';
import { 
  FaUtensils, FaChartBar, FaTable, FaMobile, FaCloud, FaClock, FaUsers, FaCheckCircle, 
  FaArrowRight, FaBars, FaTimes, FaPlay, FaShieldAlt, FaHeadset, FaRocket, FaChevronDown, 
  FaRobot, FaStore, FaBoxes, FaWarehouse, FaBuilding, FaWhatsapp, FaQrcode, FaReceipt, 
  FaMicrophone, FaStar, FaCamera, FaMagic, FaBolt, FaFilePdf, FaImage, FaSpinner, FaPaperPlane
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

  // Demo Form State
  const [demoContactType, setDemoContactType] = useState('phone');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoRestaurantName, setDemoRestaurantName] = useState('');
  const [demoComment, setDemoComment] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [currency, setCurrency] = useState('INR');
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
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
      if (apiClient.isAuthenticated()) router.replace(apiClient.getRedirectPath());
    };
    setTimeout(checkAuthInBackground, 500);
  }, [router]);

  const handleLogin = () => {
    if (apiClient.isAuthenticated()) router.replace(apiClient.getRedirectPath());
    else router.push('/login');
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

  const plans = [
    {
      name: "Pay as You Go",
      type: "payg",
      price: currency === 'INR' ? '₹300' : '$5',
      period: 'one-time',
      subPrice: currency === 'INR' ? 'Then ₹150 / 500 orders' : 'Then $3 / 500 orders',
      features: ["Restaurant Billing Software", "AI Agent (Voice/Chat)", "QR Menu", "Unlimited Tables", "KOT & Inventory", "CRM & Loyalty"],
      button: "Get Started Free",
      popular: true
    },
    {
      name: "Monthly Fixed",
      type: "fixed",
      price: currency === 'INR' ? '₹600' : '$15',
      period: 'per month',
      subPrice: 'Unlimited Orders',
      features: ["All Features Included", "Priority Support", "Dedicated Account Manager", "Custom Onboarding", "API Access"],
      button: "Start 1 Month Trial",
      popular: false
    }
  ];

  const processSteps = [
    { icon: <FaCamera size={24} /> },
    { icon: <FaMagic size={24} /> },
    { icon: <FaQrcode size={24} /> }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <SEOStructuredData />
      <FAQSchema />
      
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
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#374151';
                  }}
                >
                  Products
                  <FaChevronDown size={12} />
                </a>
                
                {showProductsDropdown && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        height: '8px',
                        zIndex: 101
                      }}
                      onMouseEnter={() => setShowProductsDropdown(true)}
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '8px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                        padding: '12px 0',
                        minWidth: '280px',
                        zIndex: 100,
                        border: '1px solid rgba(239, 68, 68, 0.1)'
                      }}
                      onMouseEnter={() => setShowProductsDropdown(true)}
                      onMouseLeave={() => setShowProductsDropdown(false)}
                    >
                      <Link 
                        href="/products/ai-agent" 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          color: '#374151',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <FaRobot size={18} color="#ef4444" />
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>AI Agent for Restaurant</span>
                      </Link>
                      <Link 
                        href="/products/restaurant-management" 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          color: '#374151',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <FaStore size={18} color="#ef4444" />
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>Restaurant Management System</span>
                      </Link>
                      <Link 
                        href="/products/inventory-management" 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          color: '#374151',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <FaBoxes size={18} color="#ef4444" />
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>Inventory Management</span>
                      </Link>
                      <Link 
                        href="/products/supply-management" 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          color: '#374151',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <FaWarehouse size={18} color="#ef4444" />
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>Supply Management</span>
                      </Link>
                      <Link 
                        href="/products/hotel-management" 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          color: '#374151',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <FaBuilding size={18} color="#ef4444" />
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>Hotel Management</span>
                      </Link>
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
            background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
            color: '#be123c',
            borderRadius: '30px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '32px',
            border: '1px solid #fecdd3',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
            animation: 'scale-in 0.5s ease-out'
          }}>
            <FaStar style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} /> Top Rated Restaurant Point od Sale (POS) System.
          </div>
          
          <h1 style={{
            fontSize: isMobile ? '38px' : '72px',
            fontWeight: '900',
            lineHeight: '1.1',
            color: '#111827',
            marginBottom: '24px',
            letterSpacing: '-2px',
            animation: 'fade-in-up 0.6s ease-out 0.1s backwards',
            minHeight: isMobile ? '120px' : '160px'
          }}>
            AI Agent for <br/>
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
              The all-in-one restaurant management system that <strong>takes orders for your restaurant, manages bookings, and handles everything automatically.</strong> No hardware required. <strong>Just growth.</strong>
            </p>

            {/* Feature Highlights Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Feature 1: POS System */}
              <div style={{
                background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)',
                border: '2px solid #fecdd3',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
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
                    Complete POS System
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Billing in seconds
                  </div>
                </div>
          </div>

              {/* Feature 2: Free QR Menu */}
            <div style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
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
                  <FaQrcode size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Free QR Code Menu
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Goes live instantly
                  </div>
                </div>
            </div>

              {/* Feature 3: Auto Inventory */}
            <div style={{ 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #fcd34d',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.15)';
                e.currentTarget.style.borderColor = '#f59e0b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#fcd34d';
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <FaBoxes size={22} color="white" />
                      </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Auto Inventory Tracking
                    </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Updates automatically
                      </div>
                    </div>
                  </div>
                </div>

            {/* AI Voice Agent Highlight */}
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '2px solid #e9d5ff',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(139, 92, 246, 0.15)';
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e9d5ff';
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}></div>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
                position: 'relative',
                zIndex: 1
              }}>
                <FaMicrophone size={28} color="white" />
                </div>
              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#7c3aed',
                  marginBottom: '8px'
                }}>
                  <FaBolt size={10} /> AI-POWERED
              </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                  AI Agent for Bakeries
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  Takes phone orders, manages table bookings, and handles customer inquiries <strong>24/7 automatically</strong>. No staff needed.
                </div>
              </div>
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

          {/* Trust Indicators */}
            <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '24px' : '48px',
            flexWrap: 'wrap',
            animation: 'fade-in 0.8s ease-out 0.5s backwards'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '900', color: '#111827' }}>500+</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Restaurants</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '900', color: '#111827' }}>50K+</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Orders/Month</div>
                      </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '900', color: '#111827' }}>4.9★</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Customer Rating</div>
            </div>
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
            🤖 AI AUTOMATION
          </div>
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: '900',
            color: '#111827',
            marginBottom: '24px',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            AI Takes Orders While <span style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>You Focus on Food</span>
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: '#6b7280',
            maxWidth: '750px',
            margin: '0 auto 60px',
            lineHeight: '1.7'
          }}>
            Stop missing orders during peak hours. DineOpen AI chats with customers on WhatsApp, takes their orders, upsells add-ons automatically, and sends everything to your kitchen. No staff needed. <strong>Included free in all plans.</strong>
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
                      Here&apos;s our <strong>Bestseller</strong> - Butter Chicken! 🔥 Customers love it!
                    </div>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '24px' }}>🍗</div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>Butter Chicken</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>₹ 320 • ⭐ 4.8 Rating</div>
                      </div>
                      <button style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>Add</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', textAlign: 'left' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>

            {/* Card 1: Instant Menu Creation */}
            <div className="feature-card" style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '32px',
              padding: '48px',
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
              padding: '48px',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
                  <FaArrowRight size={20} color="#d1d5db" />
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
                  <FaArrowRight size={20} color="#d1d5db" />
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px', marginBottom: '48px' }}>
            {/* Feature 1: POS Billing */}
            <div className="feature-card" style={{
              background: 'white',
              padding: '40px',
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
                POS Billing System
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Fast & accurate billing software with GST support. Accept payments via cash, card, UPI & wallets. Print bills instantly.
              </p>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
                ✓ GST Compliant • ✓ Multi-Payment • ✓ Instant Billing
              </div>
            </div>

            {/* Feature 2: Inventory Management */}
            <div className="feature-card" style={{
              background: 'white',
              padding: '40px',
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
              padding: '40px',
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
              padding: '40px',
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
              padding: '40px',
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
                <FaChartBar size={28} color="#7c3aed" />
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
              padding: '40px',
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

      {/* Pricing Section - Clean Cards */}
      <section id="pricing" style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '60px' }}>Simple Pricing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
            {plans.map((plan, i) => (
              <div key={i} style={{ padding: '40px', borderRadius: '32px', border: plan.popular ? '2px solid #111827' : '1px solid #e5e7eb', background: plan.popular ? '#111827' : 'white', color: plan.popular ? 'white' : '#111827', textAlign: 'left', position: 'relative' }}>
                {plan.popular && <div style={{ position: 'absolute', top: '-12px', right: '40px', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>POPULAR</div>}
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</h3>
                <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{plan.price}</div>
                <p style={{ opacity: 0.7, marginBottom: '32px' }}>{plan.subPrice}</p>
                <button style={{ width: '100%', padding: '16px', borderRadius: '12px', background: plan.popular ? 'white' : '#111827', color: plan.popular ? '#111827' : 'white', border: 'none', fontWeight: '700', marginBottom: '32px', cursor: 'pointer' }}>{plan.button}</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <FaCheckCircle color={plan.popular ? '#ef4444' : '#10b981'} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AEO SECTIONS - Added at the end of page */}
      
      {/* What is DineOpen Section */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
            What is DineOpen?
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              DineOpen is a cloud-based restaurant POS software and billing system designed for small and mid-sized restaurants in India. It combines point-of-sale billing, menu management, inventory tracking, and online order processing in one platform.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              DineOpen is suitable for small restaurants, cafes, cloud kitchens, and food service businesses in India. It does not require hardware installation and works on any device with internet access. The system includes GST-ready billing, automatic tax calculations, and invoice generation compliant with Indian tax regulations.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              Pricing starts at ₹300 one-time payment or ₹600 per month for unlimited orders. DineOpen offers an affordable alternative to Zomato POS and Petpooja, with similar features at lower costs.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '32px' : '48px', textAlign: 'center' }}>
            Core Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '24px' : '32px' }}>
            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What is POS billing in DineOpen?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                POS billing in DineOpen allows restaurants to process orders, generate bills, accept payments, and print receipts. The system supports multiple payment methods including cash, card, UPI, and digital wallets. Bills are automatically saved and can be retrieved for reporting.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                How does menu management work in DineOpen?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Menu management in DineOpen lets restaurants create digital menus, add items with prices and descriptions, organize items by categories, and update availability in real-time. Menus can be shared via QR codes for contactless ordering. Changes to menu items reflect immediately across all devices.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What is inventory management in DineOpen?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Inventory management in DineOpen tracks stock levels, records purchases, monitors ingredient usage, and sends low-stock alerts. The system automatically deducts ingredients when orders are placed and generates purchase order suggestions based on consumption patterns.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                How does online order management work?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Online order management in DineOpen processes orders from QR menus, AI voice agent phone calls, and web platforms. Orders appear in real-time on the POS system, can be accepted or rejected, and are automatically sent to the kitchen via KOT. The system tracks order status from placement to delivery.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Does DineOpen support GST billing?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen includes GST-ready billing software. It automatically calculates GST at applicable rates, generates tax-compliant invoices with HSN codes, maintains tax records, and exports data for GST filing. The system supports all GST slabs and formats invoices according to Indian regulations.
              </p>
            </div>

            <div style={{ background: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                What reports and analytics does DineOpen provide?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                DineOpen provides sales reports, daily and monthly revenue summaries, item-wise sales analysis, inventory reports, customer order history, and profit margin calculations. Reports can be exported as PDF or Excel files and are available in real-time through the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '24px' : '32px', textAlign: 'center' }}>
            How is DineOpen different from Zomato or Petpooja?
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              DineOpen offers similar features to Zomato POS and Petpooja but at lower costs. DineOpen pricing starts at ₹300 one-time or ₹600 per month, while Zomato and Petpooja typically charge higher monthly fees.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              DineOpen is cloud-based and does not require hardware installation, similar to Zomato POS. Both systems offer POS billing, menu management, inventory tracking, and online order processing. DineOpen focuses on simplicity and affordability for small restaurants.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '20px' }}>
              Petpooja requires hardware setup and has higher upfront costs. DineOpen works on any device with internet access, reducing initial investment. Both systems support GST billing and provide restaurant management features.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              DineOpen is designed specifically for small and mid-sized restaurants in India, with simpler interfaces and lower pricing. Zomato POS and Petpooja target larger restaurant chains with more complex requirements and higher costs.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#111827', marginBottom: isMobile ? '32px' : '48px', textAlign: 'center' }}>
            Use Cases
          </h2>
          
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Who should use DineOpen?
            </h3>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '12px' }}>
              DineOpen is suitable for small restaurants, cafes, cloud kitchens, food trucks, bakeries, and any food service business in India that needs affordable POS software and billing system.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              Restaurants with 1-20 tables, cafes serving 50-500 customers daily, and cloud kitchens processing 20-200 orders per day will benefit from DineOpen. The system is designed for businesses that want simple, affordable restaurant management software without complex features or high costs.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Is DineOpen good for small restaurants in India?
            </h3>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '12px' }}>
              Yes, DineOpen is specifically designed for small restaurants in India. It offers affordable pricing starting at ₹300 one-time, making it accessible for small businesses with limited budgets.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151', marginBottom: '12px' }}>
              DineOpen includes all essential features small restaurants need: POS billing, menu management, inventory tracking, GST billing, and online orders. The system is simple to use and does not require technical expertise or hardware installation.
            </p>
            <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: '#374151' }}>
              Small restaurants can start using DineOpen immediately without setup fees or long-term contracts. The cloud-based system works on smartphones, tablets, or computers, eliminating the need for expensive POS hardware.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
                DineOpen is a restaurant POS software and billing system designed for small and mid-sized restaurants in India. It includes menu management, inventory tracking, online order management, and GST-ready billing. DineOpen is a cloud-based alternative to Zomato POS and Petpooja, offering affordable pricing starting at ₹300 one-time or ₹600 per month.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Is DineOpen a POS system?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen is a complete POS system for restaurants. It includes billing software, table management, KOT (Kitchen Order Ticket) generation, inventory management, menu management, and online order processing. It works on any device with internet access and does not require hardware installation.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Is DineOpen suitable for small restaurants?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen is specifically designed for small and mid-sized restaurants in India. It offers affordable pricing starting at ₹300 one-time payment, making it accessible for small cafes, restaurants, and cloud kitchens. The system is simple to use and does not require technical expertise.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Does DineOpen support GST billing in India?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen includes GST-ready billing software. It automatically calculates GST, generates compliant invoices, and maintains records required for tax filing. The system supports all GST rates and formats invoices according to Indian tax regulations.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Can DineOpen replace Zomato POS?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen can replace Zomato POS for restaurants. It offers similar features including POS billing, menu management, inventory tracking, and online orders. DineOpen is more affordable with pricing starting at ₹300 one-time compared to Zomato&apos;s monthly fees, and it does not require hardware installation.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Is DineOpen cloud-based?
              </h3>
              <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.7', color: '#374151' }}>
                Yes, DineOpen is a cloud-based restaurant management software. It runs entirely in a web browser and does not require software installation or hardware setup. You can access DineOpen from any device with internet access, including computers, tablets, and smartphones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: isMobile ? '60px 16px' : '80px 20px', background: '#fafafa', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ width: '32px', height: '32px', background: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>DO</div>
              <span style={{ fontSize: '20px', fontWeight: '700' }}>DineOpen</span>
            </div>
            <p style={{ color: '#6b7280' }}>The operating system for modern restaurants.</p>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '16px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#6b7280' }}>
              <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Features</Link>
              <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Pricing</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '16px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#6b7280' }}>
              <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>About</Link>
              <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '16px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#6b7280' }}>
              <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
              <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</Link>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
}