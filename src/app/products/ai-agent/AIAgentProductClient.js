'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaRobot,
  FaMicrophone,
  FaComments,
  FaCheckCircle,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaRocket,
  FaClock,
  FaChevronDown,
  FaStore,
  FaBoxes,
  FaWarehouse,
  FaBuilding,
  FaUtensils,
  FaTable
} from 'react-icons/fa';

export default function AIAgentProductClient() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGetStarted = () => {
    router.push('/login');
  };

  // Voice animation SVG - Clean and subtle
  const VoiceAnimationSVG = () => (
    <div style={{
      width: '120px',
      height: '120px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Subtle pulsing background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
        animation: 'pulse 2s ease-in-out infinite'
      }} />
      {/* Microphone icon */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)'
      }}>
        <FaMicrophone size={28} color="white" />
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );

  // Chat animation SVG - Clean and subtle
  const ChatAnimationSVG = () => (
    <div style={{
      width: '120px',
      height: '120px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Chat bubble */}
      <div style={{
        position: 'relative',
        width: '80px',
        height: '60px',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        {/* Typing dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            animation: 'dotBounce 1.4s ease-in-out infinite'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            animation: 'dotBounce 1.4s ease-in-out infinite 0.2s'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            animation: 'dotBounce 1.4s ease-in-out infinite 0.4s'
          }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );

  const capabilities = [
    {
      icon: <FaMicrophone size={32} />,
      title: "Voice Order Taking",
      description: "Speak your orders naturally. The AI understands your voice commands, matches items to your menu, and adds them to the cart automatically.",
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      color: '#8b5cf6'
    },
    {
      icon: <FaComments size={32} />,
      title: "Chat Support",
      description: "Ask questions, get instant answers about menu items, table availability, order status, and restaurant operations through natural conversation.",
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#ef4444'
    },
    {
      icon: <FaTable size={32} />,
      title: "Smart Table Management",
      description: "Check table availability, reserve tables, update table status, and get real-time information about your restaurant floor.",
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#10b981'
    },
    {
      icon: <FaRobot size={32} />,
      title: "Instant Answers",
      description: "Get immediate responses about menu items, prices, ingredients, availability, and any restaurant-related queries.",
      gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)',
      color: '#ef4444'
    }
  ];

  const useCases = [
    {
      title: "Take Orders by Voice",
      description: "Instead of typing, just speak: 'Add 2 pizzas and 1 coke'. The AI understands and adds items instantly.",
      icon: "🎤"
    },
    {
      title: "Answer Customer Questions",
      description: "Customers ask: 'What's in the special thali?' The AI instantly provides detailed information.",
      icon: "💬"
    },
    {
      title: "Manage Tables",
      description: "Ask: 'Show available tables' or 'Reserve table 5 for 2 guests at 7 PM'. The AI handles it all.",
      icon: "🪑"
    },
    {
      title: "Check Order Status",
      description: "Ask: 'What's the status of order #123?' Get real-time updates on kitchen progress and delivery.",
      icon: "📊"
    },
    {
      title: "Menu Information",
      description: "Ask: 'What vegetarian options do you have?' or 'Show me desserts under ₹200'. Instant menu search.",
      icon: "📋"
    },
    {
      title: "Operational Queries",
      description: "Ask: 'What are today's sales?' or 'Which items are out of stock?'. Get business insights instantly.",
      icon: "📈"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
        padding: '12px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}>
                <FaUtensils color="white" size={20} />
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px'
              }}>
                DineOpen
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Products Dropdown */}
                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setShowProductsDropdown(true)}
                  onMouseLeave={() => setShowProductsDropdown(false)}
                >
                  <a 
                    href="#" 
                    style={{
                      color: '#374151',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      padding: '6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }} 
                    onMouseEnter={(e) => {
                      e.target.style.color = '#ef4444';
                      e.target.style.transform = 'translateY(-1px)';
                      setShowProductsDropdown(true);
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateY(0)';
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
                
                <Link href="/#features" style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  padding: '6px 0'
                }} 
                onMouseEnter={(e) => {
                  e.target.style.color = '#ef4444';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  Features
                </Link>
                <Link href="/blog" style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  padding: '6px 0'
                }} 
                onMouseEnter={(e) => {
                  e.target.style.color = '#ef4444';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  Blog
                </Link>
                <Link href="/#pricing" style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  padding: '6px 0'
                }} 
                onMouseEnter={(e) => {
                  e.target.style.color = '#ef4444';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  Pricing
                </Link>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setShowDemoModal(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#ef4444';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Book Demo
                </button>
                <button
                  onClick={handleGetStarted}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  Get Started Free
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
              >
                {showMobileMenu ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        backgroundColor: '#fafafa',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          position: 'relative',
          width: '100%'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '60px' : '80px',
            alignItems: 'center'
          }}>
            {/* Left: Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50px',
                marginBottom: '24px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <FaRobot size={18} color="#ef4444" />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ef4444',
                  letterSpacing: '0.5px'
                }}>
                  AI-Powered Assistant
                </span>
              </div>

              <h1 style={{
                fontSize: isMobile ? '42px' : '64px',
                fontWeight: '900',
                color: '#1f2937',
                marginBottom: '24px',
                lineHeight: '1.1'
              }}>
                AI Agent for
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Your Restaurant
                </span>
              </h1>
              
              <p style={{
                fontSize: isMobile ? '18px' : '22px',
                color: '#6b7280',
                marginBottom: '32px',
                fontWeight: '400',
                lineHeight: '1.6'
              }}>
                Intelligent voice and chat assistant that takes orders, answers questions, 
                manages tables, and handles your restaurant operations through natural conversation.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px',
                marginBottom: '40px'
              }}>
                <button
                  onClick={handleGetStarted}
                  style={{
                    padding: '18px 36px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: isMobile ? '100%' : 'auto',
                    whiteSpace: 'nowrap'
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
                  <FaRocket size={20} />
                  <span>Start 7-Day Free Trial</span>
                </button>
                <button
                  onClick={() => setShowDemoModal(true)}
                  style={{
                    padding: '18px 36px',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: isMobile ? '100%' : 'auto',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#ef4444';
                  }}
                >
                  <FaClock size={16} />
                  <span>Book Demo</span>
                </button>
              </div>

              {/* Key Benefits */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <FaCheckCircle size={16} color="#10b981" />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    Voice Order Taking
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <FaCheckCircle size={16} color="#10b981" />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    Smart Table Management
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <FaCheckCircle size={16} color="#10b981" />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    Instant Answers
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '60px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '40px 0' : '60px 0'
            }}>
              {/* Voice Animation */}
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <VoiceAnimationSVG />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Voice Orders
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Speak naturally, AI understands
                </p>
              </div>

              {/* Chat Animation */}
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <ChatAnimationSVG />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Chat Support
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Instant answers to any question
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '50px' : '80px' }}>
            <h2 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              What You Can Do with
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AI Agent
              </span>
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: '#6b7280',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Transform your restaurant operations with intelligent AI assistance. 
              Here&apos;s what restaurant owners can do with our AI Agent.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '24px' : '32px',
            marginBottom: '60px'
          }}>
            {capabilities.map((capability, index) => (
              <div
                key={index}
                style={{
                  padding: isMobile ? '32px 24px' : '40px 32px',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  textAlign: 'left',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #e5e7eb',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = capability.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: isMobile ? '56px' : '64px',
                  height: isMobile ? '56px' : '64px',
                  background: capability.gradient,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: 'white',
                  boxShadow: `0 8px 24px ${capability.color}40`
                }}>
                  {capability.icon}
                </div>
                <h3 style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {capability.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.7',
                  fontSize: isMobile ? '15px' : '16px',
                  margin: 0
                }}>
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '50px' : '80px' }}>
            <h2 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              Real-World
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Use Cases
              </span>
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: '#6b7280',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              See how restaurant owners use AI Agent to streamline daily operations 
              and improve customer service.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '24px' : '32px'
          }}>
            {useCases.map((useCase, index) => (
              <div
                key={index}
                style={{
                  padding: isMobile ? '32px 24px' : '40px 32px',
                  backgroundColor: '#fafafa',
                  borderRadius: '20px',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  {useCase.icon}
                </div>
                <h3 style={{
                  fontSize: isMobile ? '20px' : '22px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {useCase.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.7',
                  fontSize: isMobile ? '15px' : '16px',
                  margin: 0
                }}>
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        backgroundColor: '#fafafa',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          padding: isMobile ? '40px 20px' : '60px 40px',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Ready to Transform Your Restaurant?
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '20px',
            color: '#6b7280',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Join thousands of restaurants using DineOpen AI Agent to streamline operations, 
            increase efficiency, and boost revenue.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '18px 36px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
              }}
            >
              <FaRocket size={20} />
              <span>Start 7-Day Free Trial</span>
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              style={{
                padding: '18px 36px',
                backgroundColor: 'white',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#8b5cf6';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#8b5cf6';
              }}
            >
              <FaClock size={16} />
              <span>Book Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: isMobile ? '40px 20px' : '60px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUtensils color="white" size={16} />
                </div>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  DineOpen
                </span>
              </div>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                Modern restaurant management platform designed to streamline operations and boost efficiency.
              </p>
            </div>

            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'white'
              }}>
                Product
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/#features" style={{ color: '#9ca3af', textDecoration: 'none' }}>Features</Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/#pricing" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'white'
              }}>
                Support
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDemoModal(true);
                    }}
                    style={{ color: '#9ca3af', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'white'
              }}>
                Legal
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '32px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <p>© 2024 DineOpen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

