'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CommonHeader from './CommonHeader';
import Footer from './Footer';
import {
  FaCheckCircle, FaArrowRight, FaPlay, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

export default function ToolPageTemplate({
  toolName,
  toolIcon: ToolIcon,
  heroTitle,
  heroHighlight,
  heroDescription,
  features,
  howItWorks,
  benefits,
  faqs,
  ctaTitle,
  ctaDescription,
  relatedTools
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#dcfce7',
                borderRadius: '20px',
                marginBottom: '24px',
                border: '1px solid #bbf7d0'
              }}>
                <ToolIcon size={16} color="#16a34a" />
                <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
                  Free Tool
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
                <span style={{ color: '#16a34a' }}>{heroHighlight}</span>
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
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                  }}
                >
                  Try It Free <FaArrowRight size={16} />
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

            {/* Feature Preview Box */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
              }}>
                <ToolIcon size={32} color="white" />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px'
              }}>
                {toolName}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {benefits.slice(0, 5).map((benefit, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheckCircle size={16} color="#16a34a" />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Powerful Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need built into one simple tool
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {features.map((feature, index) => (
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
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <feature.icon size={24} color="#16a34a" />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              How It Works
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Get started in minutes
            </p>
          </div>

          <div>
            {howItWorks.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '24px',
                  marginBottom: index < howItWorks.length - 1 ? '32px' : '0',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '18px',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              Frequently Asked Questions
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

      {/* Related Tools */}
      {relatedTools && relatedTools.length > 0 && (
        <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              More Free Tools
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {relatedTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#374151',
                    textDecoration: 'none',
                    border: '1px solid #e5e7eb',
                    fontWeight: '500'
                  }}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 32px',
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
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
          <button
            onClick={handleGetStarted}
            style={{
              padding: '18px 40px',
              borderRadius: '10px',
              background: 'white',
              color: '#16a34a',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
            }}
          >
            Get Started Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
