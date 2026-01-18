'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaRobot, FaStore, FaBoxes, FaWarehouse, FaBuilding } from 'react-icons/fa';

export default function CommonHeader() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  return (
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
            
            <Link 
              href="/hotel" 
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
              Hotel
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
                    {/* Inventory Management - Commented out temporarily */}
                    {/* <Link 
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
                    </Link> */}
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
  );
}

