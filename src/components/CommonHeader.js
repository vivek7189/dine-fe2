'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaChevronDown, FaRobot, FaStore, FaBoxes, FaWarehouse, FaBuilding,
  FaUtensils, FaCoffee, FaCloudMeatball, FaBeer, FaBirthdayCake, FaTruck, FaHotel,
  FaQrcode, FaFileInvoice, FaClipboardList, FaChair, FaGift,
  FaBars, FaTimes
} from 'react-icons/fa';

export default function CommonHeader() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showSolutionsDropdown, setShowSolutionsDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const productItems = [
    { name: 'AI Agent for Restaurant', href: '/products/ai-agent', icon: FaRobot },
    { name: 'Restaurant Management', href: '/products/restaurant-management', icon: FaStore },
    { name: 'POS Software', href: '/products/pos-software', icon: FaUtensils },
    { name: 'Supply Management', href: '/products/supply-management', icon: FaWarehouse },
    { name: 'Hotel Management', href: '/products/hotel-management', icon: FaBuilding },
    { name: 'Billing Software', href: '/products/billing-software', icon: FaFileInvoice },
  ];

  const solutionItems = [
    { name: 'For Restaurants', href: '/for/restaurants', icon: FaUtensils },
    { name: 'For Cafes', href: '/for/cafes', icon: FaCoffee },
    { name: 'For Cloud Kitchens', href: '/for/cloud-kitchens', icon: FaCloudMeatball },
    { name: 'For Bars & Pubs', href: '/for/bars-pubs', icon: FaBeer },
    { name: 'For Bakeries', href: '/for/bakeries', icon: FaBirthdayCake },
    { name: 'For Food Trucks', href: '/for/food-trucks', icon: FaTruck },
    { name: 'For Hotels', href: '/for/hotels', icon: FaHotel },
  ];

  const toolItems = [
    { name: 'QR Menu Generator', href: '/tools/qr-menu-generator', icon: FaQrcode },
    { name: 'Invoice Generator', href: '/tools/restaurant-invoice-generator', icon: FaFileInvoice },
    { name: 'KOT System', href: '/tools/kot-system', icon: FaClipboardList },
    { name: 'Table Management', href: '/tools/table-management', icon: FaChair },
    { name: 'Loyalty Program', href: '/tools/loyalty-program', icon: FaGift },
  ];

  const DropdownMenu = ({ items, show, onMouseEnter, onMouseLeave }) => (
    show && (
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
          onMouseEnter={onMouseEnter}
        />
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            padding: '12px 0',
            minWidth: '260px',
            zIndex: 100,
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
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
              <item.icon size={18} color="#ef4444" />
              <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.name}</span>
            </Link>
          ))}
        </div>
      </>
    )
  );

  const NavDropdown = ({ label, items, show, setShow }) => (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
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
        {label}
        <FaChevronDown size={12} style={{
          transform: show ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }} />
      </a>
      <DropdownMenu
        items={items}
        show={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
    </div>
  );

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
        {/* Logo */}
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

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1, justifyContent: 'center', maxWidth: '800px' }}>
            <NavDropdown
              label="Products"
              items={productItems}
              show={showProductsDropdown}
              setShow={setShowProductsDropdown}
            />

            <NavDropdown
              label="Solutions"
              items={solutionItems}
              show={showSolutionsDropdown}
              setShow={setShowSolutionsDropdown}
            />

            <NavDropdown
              label="Tools"
              items={toolItems}
              show={showToolsDropdown}
              setShow={setShowToolsDropdown}
            />

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
              href="/blog"
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
              Blog
            </Link>
          </div>
        )}

        {/* Desktop Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isMobile ? (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                style={{
                  padding: '10px 20px',
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
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'; }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && showMobileMenu && (
        <div style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}>
          {/* Products Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '12px' }}>
              Products
            </h3>
            {productItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  color: '#374151',
                  textDecoration: 'none',
                  borderBottom: index < productItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <item.icon size={18} color="#ef4444" />
                <span style={{ fontWeight: '500', fontSize: '15px' }}>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Solutions Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '12px' }}>
              Solutions
            </h3>
            {solutionItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  color: '#374151',
                  textDecoration: 'none',
                  borderBottom: index < solutionItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <item.icon size={18} color="#ef4444" />
                <span style={{ fontWeight: '500', fontSize: '15px' }}>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Tools Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '12px' }}>
              Tools
            </h3>
            {toolItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  color: '#374151',
                  textDecoration: 'none',
                  borderBottom: index < toolItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <item.icon size={18} color="#ef4444" />
                <span style={{ fontWeight: '500', fontSize: '15px' }}>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Other Links */}
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/restaurants"
              onClick={() => setShowMobileMenu(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
                borderBottom: '1px solid #f3f4f6'
              }}
            >
              Restaurants
            </Link>
            <Link
              href="/blog"
              onClick={() => setShowMobileMenu(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Blog
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => { setShowMobileMenu(false); handleLogin(); }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#374151'
              }}
            >
              Login
            </button>
            <button
              onClick={() => { setShowMobileMenu(false); handleLogin(); }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
