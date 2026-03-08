'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';
import { FaQrcode, FaDownload, FaPalette, FaArrowRight, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function QRMenuMakerClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [generated, setGenerated] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGenerate = () => {
    if (menuUrl.trim()) {
      setGenerated(true);
    }
  };

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size + 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const padding = 40;
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      if (restaurantName) {
        ctx.fillStyle = qrColor;
        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(restaurantName, size / 2, size + 40);
      }

      const link = document.createElement('a');
      const fileName = restaurantName
        ? `${restaurantName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-qr-menu.png`
        : 'qr-menu.png';
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [bgColor, qrColor, restaurantName]);

  const presetColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Navy', value: '#1e3a5f' },
    { name: 'Maroon', value: '#7f1d1d' },
    { name: 'Purple', value: '#6b21a8' },
    { name: 'Brown', value: '#78350f' },
  ];

  const faqs = [
    {
      question: 'How do I make a QR code for my restaurant menu?',
      answer: 'Enter your restaurant name, paste your menu URL (website, Google Drive, PDF link, or any URL), choose a color, and click Generate. Download the QR code and print it for your tables.'
    },
    {
      question: 'Is this QR menu maker completely free?',
      answer: 'Yes, 100% free with no watermark, no login, and no limits. Generate as many QR codes as you want. The QR code is created in your browser — your data stays private.'
    },
    {
      question: 'What URL should I use for my restaurant menu?',
      answer: 'You can use any URL: your restaurant website, a Google Docs/Drive link to your menu PDF, a DineOpen digital menu link, or any webpage where your menu is hosted.'
    },
    {
      question: 'Can I change the menu URL later without reprinting QR codes?',
      answer: 'The QR code links directly to the URL you enter. If you want changeable URLs, use DineOpen\'s digital menu system — the QR code stays the same even when you update your menu.'
    },
    {
      question: 'What print size works best for restaurant tables?',
      answer: 'For table tents: 2-3 inches. For wall displays: 6-8 inches. The download is 1024x1024 pixels, which prints clearly at any size up to 12 inches.'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Free Tools', href: '/tools/food-cost-calculator' },
        { label: 'QR Menu Maker' },
      ]} />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)',
        padding: isMobile ? '40px 20px' : '60px 32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#dcfce7',
            borderRadius: '20px',
            marginBottom: '20px',
            border: '1px solid #bbf7d0'
          }}>
            <FaQrcode size={16} color="#16a34a" />
            <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
              Free Tool - No Login Required
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Free QR Menu Maker
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Create a QR code for your restaurant menu in 30 seconds. Customize colors, download high-resolution PNG. No signup, no watermark.
          </p>
        </div>
      </section>

      {/* QR Maker Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '32px'
          }}>
            {/* Input Section */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaQrcode color="#16a34a" /> Your Details
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g., Taj Kitchen"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Shown below the QR code when downloaded
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Menu URL *
                </label>
                <input
                  type="url"
                  value={menuUrl}
                  onChange={(e) => { setMenuUrl(e.target.value); setGenerated(false); }}
                  placeholder="https://your-restaurant-menu-link.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Website, Google Drive link, PDF URL, or any link to your menu
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <FaPalette style={{ marginRight: '6px' }} /> QR Code Color
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => { setQrColor(color.value); setGenerated(false); }}
                      title={color.name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: color.value,
                        border: qrColor === color.value ? '3px solid #16a34a' : '2px solid #e5e7eb',
                        cursor: 'pointer',
                        outline: qrColor === color.value ? '2px solid #bbf7d0' : 'none'
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => { setQrColor(e.target.value); setGenerated(false); }}
                    title="Custom color"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!menuUrl.trim()}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  background: menuUrl.trim()
                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                    : '#d1d5db',
                  color: 'white',
                  fontWeight: '700',
                  border: 'none',
                  cursor: menuUrl.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FaQrcode /> Generate QR Code
              </button>
            </div>

            {/* Preview Section */}
            <div style={{
              backgroundColor: generated ? '#f0fdf4' : '#f9fafb',
              borderRadius: '16px',
              padding: '28px',
              border: `1px solid ${generated ? '#bbf7d0' : '#e5e7eb'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px',
                width: '100%',
                textAlign: 'left'
              }}>
                Preview
              </h2>

              {generated && menuUrl.trim() ? (
                <div style={{ textAlign: 'center' }}>
                  <div
                    ref={qrRef}
                    style={{
                      padding: '24px',
                      backgroundColor: bgColor,
                      borderRadius: '12px',
                      display: 'inline-block',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <QRCode
                      value={menuUrl}
                      size={220}
                      fgColor={qrColor}
                      bgColor={bgColor}
                      level="H"
                    />
                    {restaurantName && (
                      <div style={{
                        marginTop: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: qrColor,
                        textAlign: 'center'
                      }}>
                        {restaurantName}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                    Scan with any phone camera
                  </div>

                  <button
                    onClick={handleDownload}
                    style={{
                      marginTop: '20px',
                      padding: '14px 32px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: 'white',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaDownload /> Download PNG (1024x1024)
                  </button>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center'
                  }}>
                    <FaCheckCircle /> No watermark. Print-ready. 100% free.
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9ca3af'
                }}>
                  <FaQrcode size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '15px' }}>Enter your menu URL and click Generate to see your QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {[
              { step: '1', title: 'Enter Details', desc: 'Type your restaurant name and paste your menu link (website, PDF, or Google Drive).' },
              { step: '2', title: 'Pick Color', desc: 'Choose a QR code color that matches your restaurant brand from presets or custom picker.' },
              { step: '3', title: 'Download & Print', desc: 'Generate and download your print-ready QR code (1024x1024 PNG). Put on tables, walls, or menus.' },
            ].map((item) => (
              <div key={item.step} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#16a34a'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Why Use a QR Menu?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
          }}>
            {[
              'Zero paper menu printing costs',
              'Update menu prices instantly — no reprinting',
              'Customers order faster, tables turn quicker',
              'Hygienic — no shared menus between guests',
              'Track what customers view most',
              'Works on all phones — no app download',
            ].map((benefit, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '10px'
              }}>
                <FaCheckCircle color="#16a34a" size={16} />
                <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>

          {faqs.map((faq, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              marginBottom: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                  {faq.question}
                </span>
                {expandedFaq === i ? <FaChevronUp size={12} color="#9ca3af" /> : <FaChevronDown size={12} color="#9ca3af" />}
              </button>
              {expandedFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: '#f0fdf4',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
            Want QR Ordering + Digital Menu?
          </h3>
          <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '20px' }}>
            DineOpen gives you a beautiful digital menu with QR ordering, table-wise QR codes, real-time menu updates, and built-in POS — all in one app.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '15px'
            }}
          >
            Try DineOpen Free <FaArrowRight size={14} />
          </Link>
        </div>
      </section>

      <InternalLinks currentPath="/tools/qr-menu-maker" variant="tool" />
      <Footer />
    </div>
  );
}
