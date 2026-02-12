'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaWhatsapp
} from 'react-icons/fa';

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentYear = new Date().getFullYear();

  const productLinks = [
    { name: 'Restaurant POS Software', href: '/restaurant-pos-software-india' },
    { name: 'AI Agent for Restaurant', href: '/products/ai-agent' },
    { name: 'Waiter & Captain App', href: '/products/waiter-app' },
    { name: 'Multi-Restaurant Management', href: '/products/multi-restaurant' },
    { name: 'Loyalty & Rewards', href: '/loyalty' },
    { name: 'Inventory Management', href: '/products/inventory-management' },
    { name: 'All Features', href: '/features' },
  ];

  const useCaseLinks = [
    { name: 'For Restaurants', href: '/for/restaurants' },
    { name: 'For Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'For Cafes', href: '/for/cafes' },
    { name: 'For QSR & Fast Food', href: '/for/qsr' },
    { name: 'For Sweet Shops', href: '/for/sweet-shops' },
    { name: 'For Food Courts', href: '/for/food-courts' },
    { name: 'For Dhabas', href: '/for/dhabas' },
    { name: 'For Canteens', href: '/for/canteens' },
    { name: 'For Catering', href: '/for/catering' },
    { name: 'All Solutions', href: '/solutions' },
  ];

  const toolLinks = [
    { name: 'Opening Checklist', href: '/tools/opening-checklist' },
    { name: 'Restaurant Name AI', href: '/tools/restaurant-name-generator' },
    { name: 'Swiggy/Zomato Calculator', href: '/tools/swiggy-zomato-calculator' },
    { name: 'Menu Engineering', href: '/tools/menu-engineering' },
    { name: 'Recipe Cost Calculator', href: '/tools/recipe-cost-calculator' },
    { name: 'Table Turnover Calculator', href: '/tools/table-turnover-calculator' },
    { name: 'FSSAI Fee Calculator', href: '/tools/fssai-fee-calculator' },
    { name: 'EMI Calculator', href: '/tools/emi-calculator' },
    { name: 'More Free Tools...', href: '/glossary' },
  ];

  const resourceLinks = [
    { name: 'Startup Guide', href: '/resources/startup-guide' },
    { name: 'Business Plan Template', href: '/resources/business-plan' },
    { name: 'FSSAI License Guide', href: '/resources/fssai-guide' },
    { name: 'GST for Restaurants', href: '/resources/gst-restaurants' },
    { name: 'All Licenses Checklist', href: '/resources/restaurant-licenses-india' },
    { name: 'Free Guides & eBooks', href: '/resources/guides' },
    { name: 'Free Templates', href: '/resources/templates' },
    { name: 'All Resources', href: '/resources' },
  ];

  const compareLinks = [
    { name: 'Compare POS Systems', href: '/compare' },
    { name: 'Square Alternative', href: '/alternatives/square' },
    { name: 'Toast Alternative', href: '/alternatives/toast' },
    { name: 'Petpooja Alternative', href: '/alternatives/petpooja' },
    { name: 'POSist Alternative', href: '/alternatives/posist' },
    { name: 'Lightspeed Alternative', href: '/alternatives/lightspeed' },
    { name: 'TouchBistro Alternative', href: '/alternatives/touchbistro' },
  ];

  const companyLinks = [
    { name: 'Pricing', href: '/pricing' },
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Security', href: '/security' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'India', href: '/india' },
    { name: 'POS Locations', href: '/pos' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Refund Policy', href: '/refund' },
  ];

  const socialLinks = [
    // { icon: FaFacebook, href: 'https://facebook.com/dineopen', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com/dineopenoffice', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com/dineopenofficial', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/dineopen', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com/@dineopen', label: 'YouTube' },
  ];

  const LinkSection = ({ title, links }) => (
    <div style={{ marginBottom: isMobile ? '32px' : '0' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {links.map((link, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            <Link
              href={link.href}
              style={{
                fontSize: '14px',
                color: '#6b7280',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => { e.target.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.target.style.color = '#6b7280'; }}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer style={{
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Main Footer Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '48px 20px' : '64px 32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr repeat(6, 1fr)',
          gap: isMobile ? '0' : '24px'
        }}>
          {/* Brand Section */}
          <div style={{
            gridColumn: isMobile ? '1' : '1',
            marginBottom: isMobile ? '40px' : '0',
            paddingRight: isMobile ? '0' : '24px'
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '800',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}>
                DO
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#111827',
                letterSpacing: '-0.5px'
              }}>
                DineOpen
              </span>
            </Link>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '24px',
              maxWidth: '360px'
            }}>
              All-in-one restaurant management platform. POS, QR ordering, digital menus,
              inventory, analytics, WhatsApp automation, and more - everything you need to run
              your restaurant efficiently.
            </p>

            {/* Contact Info */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <FaEnvelope size={14} color="#ef4444" />
                <a href="mailto:info@dineopen.com" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>
                  info@dineopen.com
                </a>
              </div>
             
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <FaMapMarkerAlt size={14} color="#ef4444" style={{ marginTop: '3px' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Planet Earth
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          <LinkSection title="Products" links={productLinks} />
          <LinkSection title="Solutions" links={useCaseLinks} />
          <LinkSection title="Compare" links={compareLinks} />
          <LinkSection title="Resources" links={resourceLinks} />
          <LinkSection title="Tools" links={toolLinks} />

          <div>
            <LinkSection title="Company" links={companyLinks} />
            <div style={{ marginTop: '24px' }}>
              <LinkSection title="Legal" links={legalLinks} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '20px' : '20px 32px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#9ca3af',
            margin: 0,
            textAlign: isMobile ? 'center' : 'left'
          }}>
            &copy; {currentYear} DineOpen. All rights reserved. Made with love on Planet Earth.
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
              Trusted by 500+ restaurants across Planet Earth
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
