'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CommonHeader from './CommonHeader';
import Footer from './Footer';
import {
  FaCheckCircle, FaArrowRight, FaPlay, FaChevronDown, FaChevronUp,
  FaUtensils, FaQrcode, FaUsers, FaBoxes, FaChartBar, FaWhatsapp, FaFileInvoice,
  FaClock, FaRupeeSign, FaMobile, FaCreditCard
} from 'react-icons/fa';

export default function IndustryPageTemplate({
  industry,
  heroTitle,
  heroHighlight,
  heroDescription,
  painPoints,
  benefits,
  features,
  testimonial,
  faqs,
  ctaTitle,
  ctaDescription,
  relatedIndustries
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGetStarted = () => router.push('/login');
  const handleDemo = () => router.push('/login?demo=true');

  const defaultFeatures = [
    { icon: FaUtensils, title: 'Smart POS System', description: 'Intuitive billing with order management, table tracking, and real-time updates.' },
    { icon: FaQrcode, title: 'QR Menu & Ordering', description: 'Let customers scan, browse, and order from their phones. Zero contact, zero errors.' },
    { icon: FaUsers, title: 'Customer Loyalty', description: 'Build repeat customers with points, rewards, and personalized offers.' },
    { icon: FaBoxes, title: 'Inventory Control', description: 'Track stock levels, get alerts, and reduce wastage automatically.' },
    { icon: FaChartBar, title: 'Analytics Dashboard', description: 'See your sales, popular items, peak hours, and customer trends.' },
    { icon: FaWhatsapp, title: 'WhatsApp Integration', description: 'Send order updates, bills, and promotions directly via WhatsApp.' },
    { icon: FaFileInvoice, title: 'GST Billing', description: 'Generate compliant invoices with automatic GST calculation.' },
    { icon: FaCreditCard, title: 'All Payment Modes', description: 'Accept UPI, cards, wallets, and cash - all in one system.' },
  ];

  const displayFeatures = features || defaultFeatures;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
        padding: isMobile ? '60px 20px' : '80px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '48px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#fef2f2',
                borderRadius: '20px',
                marginBottom: '24px',
                border: '1px solid #fecaca'
              }}>
                <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                  For {industry}
                </span>
              </div>

              <h1 style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: '800',
                color: '#111827',
                lineHeight: '1.2',
                marginBottom: '24px',
                letterSpacing: '-1px'
              }}>
                {heroTitle}<br />
                <span style={{ color: '#ef4444' }}>{heroHighlight}</span>
              </h1>

              <p style={{
                fontSize: isMobile ? '16px' : '18px',
                color: '#6b7280',
                lineHeight: '1.7',
                marginBottom: '32px'
              }}>
                {heroDescription}
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleGetStarted}
                  style={{
                    padding: '16px 32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Start Free Trial <FaArrowRight size={16} />
                </button>
                <button
                  onClick={handleDemo}
                  style={{
                    padding: '16px 32px',
                    borderRadius: '10px',
                    background: 'white',
                    color: '#374151',
                    fontWeight: '700',
                    border: '2px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaPlay size={14} /> See Demo
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '20px'
              }}>
                Why {industry} Choose DineOpen
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {benefits.map((benefit, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FaCheckCircle size={20} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '15px', color: '#374151' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Common Challenges for {industry}
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              We understand the unique challenges you face every day
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {painPoints.map((point, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '28px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <point.icon size={24} color="#ef4444" />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {point.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Everything Your {industry.slice(0, -1)} Needs
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Powerful features designed specifically for your business
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  <feature.icon size={24} color="white" />
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      {testimonial && (
        <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              color: 'white',
              lineHeight: '1.7',
              marginBottom: '24px',
              fontStyle: 'italic'
            }}>
              &ldquo;{testimonial.quote}&rdquo;
            </div>
            <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '16px' }}>
              {testimonial.author}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              {testimonial.business}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Questions from {industry}
            </h2>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '32px',
            border: '1px solid #e5e7eb'
          }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  borderBottom: index < faqs.length - 1 ? '1px solid #e5e7eb' : 'none',
                  padding: '20px 0'
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <FaChevronUp size={16} color="#6b7280" />
                  ) : (
                    <FaChevronDown size={16} color="#6b7280" />
                  )}
                </button>
                {expandedFaq === index && (
                  <p style={{
                    marginTop: '12px',
                    fontSize: '15px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Industries */}
      {relatedIndustries && relatedIndustries.length > 0 && (
        <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Also Built For
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {relatedIndustries.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#374151',
                    textDecoration: 'none',
                    border: '1px solid #e5e7eb',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 32px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '20px'
          }}>
            {ctaTitle}
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '32px',
            lineHeight: '1.7'
          }}>
            {ctaDescription}
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '18px 40px',
                borderRadius: '10px',
                background: 'white',
                color: '#ef4444',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}
            >
              Start Free Trial
            </button>
            <button
              onClick={handleDemo}
              style={{
                padding: '18px 40px',
                borderRadius: '10px',
                background: 'transparent',
                color: 'white',
                fontWeight: '700',
                border: '2px solid white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
