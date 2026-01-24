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
    { name: 'Restaurant Management', href: '/products/restaurant-management' },
    { name: 'Hotel Management', href: '/products/hotel-management' },
    { name: 'Inventory Management', href: '/products/inventory-management' },
    { name: 'Supply Management', href: '/products/supply-management' },
    { name: 'Billing Software', href: '/products/billing-software' },
  ];

  const useCaseLinks = [
    { name: 'For Restaurants', href: '/for/restaurants' },
    { name: 'For Cafes', href: '/for/cafes' },
    { name: 'For Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'For Bars & Pubs', href: '/for/bars-pubs' },
    { name: 'For Bakeries', href: '/for/bakeries' },
    { name: 'For Food Trucks', href: '/for/food-trucks' },
    { name: 'For Hotels', href: '/for/hotels' },
  ];

  const toolLinks = [
    { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
    { name: 'Restaurant Invoice Generator', href: '/tools/restaurant-invoice-generator' },
    { name: 'KOT System', href: '/tools/kot-system' },
    { name: 'Table Management', href: '/tools/table-management' },
    { name: 'Loyalty Program', href: '/tools/loyalty-program' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Careers', href: '/careers' },
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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr) repeat(4, 1fr)',
          gap: isMobile ? '0' : '40px'
        }}>
          {/* Brand Section */}
          <div style={{
            gridColumn: isMobile ? '1' : '1 / 3',
            marginBottom: isMobile ? '40px' : '0',
            paddingRight: isMobile ? '0' : '40px'
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
              India&apos;s all-in-one restaurant management platform. POS, QR ordering, digital menus,
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
            &copy; {currentYear} DineOpen. All rights reserved. Made with love in India.
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
              Trusted by 500+ restaurants across India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
