'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import InternalLinks from '../../components/InternalLinks';
import { FaCheck, FaRocket, FaMobile, FaChartBar } from 'react-icons/fa';

export default function FreeBillingClient() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { title: 'Cloud POS', desc: 'Bill from any device — tablet, phone, or laptop. No hardware lock-in.' },
    { title: 'AI Voice Ordering', desc: 'AI agent takes phone orders automatically, 24/7 in multiple languages.' },
    { title: 'GST Billing', desc: 'Auto-calculate CGST, SGST, and IGST. Generate compliant invoices instantly.' },
    { title: 'Kitchen Display (KDS)', desc: 'Orders flow directly to kitchen screens. No paper tickets needed.' },
    { title: 'Inventory Management', desc: 'Track stock in real-time. Get low-stock alerts before you run out.' },
    { title: 'Waiter App', desc: 'Waiters take orders tableside on their phones. Faster service, fewer errors.' },
    { title: 'Analytics Dashboard', desc: 'Real-time sales, item-wise reports, and peak hour insights.' },
    { title: 'Loyalty Program', desc: 'Built-in rewards system to keep customers coming back.' },
  ];

  const steps = [
    { number: '1', title: 'Sign Up in 2 Minutes', desc: 'Enter your restaurant name, phone number, and you are in. No credit card, no paperwork.' },
    { number: '2', title: 'Upload Your Menu', desc: 'Take a photo of your menu — our AI extracts all items, prices, and categories automatically.' },
    { number: '3', title: 'Start Billing Same Day', desc: 'Your POS is ready. Start taking orders, generating bills, and tracking sales immediately.' },
  ];

  const comparisonData = [
    { feature: 'Monthly Cost', dineopen: 'Free for 7 days', square: '2.6% + 10¢ per transaction', zomato: 'Free but commission-locked', spreadsheet: 'Free but manual' },
    { feature: 'Transaction Fees', dineopen: 'None', square: 'Yes, on every sale', zomato: 'Yes, platform commission', spreadsheet: 'None' },
    { feature: 'GST Billing', dineopen: 'Full compliance', square: 'Limited', zomato: 'Basic', spreadsheet: 'Manual calculation' },
    { feature: 'AI Ordering', dineopen: 'Included', square: 'Not available', zomato: 'Not available', spreadsheet: 'Not available' },
    { feature: 'Inventory Tracking', dineopen: 'Real-time alerts', square: 'Basic', zomato: 'Not included', spreadsheet: 'Manual' },
    { feature: 'Kitchen Display', dineopen: 'Included', square: 'Extra cost', zomato: 'Not included', spreadsheet: 'Not available' },
    { feature: 'After Trial Price', dineopen: '₹300/mo or $9.99/mo', square: 'Transaction fees forever', zomato: 'Commission forever', spreadsheet: 'Free but limited' },
  ];

  const audiences = [
    { title: 'New Restaurants', desc: 'Just opening? Start with professional billing from day one without spending on expensive software.' },
    { title: 'Small Cafes', desc: 'Perfect for cafes with 5-50 covers. All features included, no enterprise bloat.' },
    { title: 'Food Trucks', desc: 'Mobile-first billing that works on your phone. Bill customers anywhere with or without internet.' },
    { title: 'Switching from Another POS', desc: 'Migrating from Petpooja, Square, or spreadsheets? Import your menu and start billing in minutes.' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '60px 20px' : '100px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 30%, #ffffff 100%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: '#dcfce7',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#166534',
            marginBottom: '24px',
          }}>
            7-Day Free Trial — No Credit Card Required
          </div>
          <h1 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: '900',
            lineHeight: '1.1',
            color: '#111827',
            marginBottom: '24px',
            letterSpacing: '-2px',
          }}>
            Free Restaurant Billing Software — Start Today
          </h1>
          <p style={{
            fontSize: isMobile ? '18px' : '22px',
            color: '#4b5563',
            lineHeight: '1.7',
            maxWidth: '750px',
            margin: '0 auto 40px',
          }}>
            Get a complete <Link href="/products/billing-software" style={{ color: '#16a34a', textDecoration: 'underline', fontWeight: '600' }}>restaurant billing software</Link> with cloud POS, AI ordering, GST billing, and inventory management — free for 7 days. No credit card. No hidden fees.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://dineopen.com/login" style={{
              padding: '16px 36px',
              fontSize: '17px',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
            }}>
              Start Free Trial
            </a>
            <Link href="/pricing" style={{
              padding: '16px 36px',
              fontSize: '17px',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'white',
              color: '#111827',
              border: '2px solid #e5e7eb',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Answer — AEO Block */}
      <section style={{
        padding: isMobile ? '32px 20px' : '40px 32px',
        backgroundColor: '#f0fdf4',
        borderBottom: '1px solid #bbf7d0'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quick Answer</p>
          <p style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.7', margin: 0 }}>
            <strong>DineOpen offers free restaurant billing software</strong> with a 7-day trial — no credit card required. You get cloud POS, AI voice ordering, GST-compliant billing, kitchen display system, inventory management, and analytics. After the trial, plans start at ₹300/month ($9.99) with zero transaction fees. Works on any phone, tablet, or laptop — no hardware purchase needed. Sign up takes 2 minutes.
          </p>
        </div>
      </section>

      {/* What You Get for Free */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '30px' : '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            What You Get for Free
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px',
          }}>
            Every feature unlocked during your 7-day trial. No restrictions, no paywalls.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '20px',
          }}>
            {features.map((feature, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                borderRadius: '14px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#fafafa',
                transition: 'box-shadow 0.2s',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <FaCheck style={{ color: '#16a34a', fontSize: '18px' }} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6b7280', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#6b7280' }}>
            Explore individual products: <Link href="/products/pos-software" style={{ color: '#16a34a', fontWeight: '600' }}>Cloud POS</Link> | <Link href="/products/ai-agent" style={{ color: '#16a34a', fontWeight: '600' }}>AI Agent</Link> | <Link href="/products/inventory-management" style={{ color: '#16a34a', fontWeight: '600' }}>Inventory Management</Link>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '30px' : '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '48px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            How It Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#6b7280', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '30px' : '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Free vs Paid Restaurant Software
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            Not all &quot;free&quot; software is actually free. Here is how DineOpen compares.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '15px',
              minWidth: '700px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Feature</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '700', color: '#16a34a', borderBottom: '2px solid #16a34a', backgroundColor: '#f0fdf4' }}>DineOpen Free Trial</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}><Link href="/alternatives/square" style={{ color: '#374151', textDecoration: 'none' }}>Square Free</Link></th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Zomato Base</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Spreadsheets</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>{row.feature}</td>
                    <td style={{ padding: '14px 16px', color: '#16a34a', fontWeight: '600', backgroundColor: '#fafff9' }}>{row.dineopen}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{row.square}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{row.zomato}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{row.spreadsheet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#9ca3af' }}>
            See detailed comparisons: <Link href="/alternatives/square" style={{ color: '#16a34a' }}>DineOpen vs Square</Link> | <Link href="/alternatives/petpooja" style={{ color: '#16a34a' }}>DineOpen vs Petpooja</Link>
          </p>
        </div>
      </section>

      {/* Who Is This For */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '30px' : '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '48px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Who Is This For?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px',
          }}>
            {audiences.map((item, i) => {
              const icons = [<FaRocket key="r" />, <FaMobile key="m" />, <FaMobile key="m2" />, <FaChartBar key="c" />];
              return (
                <div key={i} style={{
                  padding: '32px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{
                    fontSize: '24px',
                    color: '#16a34a',
                    marginBottom: '16px',
                  }}>
                    {icons[i]}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#6b7280', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* After the Trial */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '30px' : '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            letterSpacing: '-1px',
          }}>
            After the Trial
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '40px',
            lineHeight: '1.7',
          }}>
            Transparent pricing. No surprises. No per-transaction fees. Cancel anytime.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px',
            marginBottom: '32px',
          }}>
            <div style={{
              padding: '36px 28px',
              borderRadius: '16px',
              border: '2px solid #16a34a',
              backgroundColor: '#f0fdf4',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>India</div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#111827', marginBottom: '4px' }}>
                &#8377;300<span style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>/month</span>
              </div>
              <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>All features included. GST billing built-in.</p>
            </div>
            <div style={{
              padding: '36px 28px',
              borderRadius: '16px',
              border: '2px solid #e5e7eb',
              backgroundColor: '#ffffff',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>International</div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#111827', marginBottom: '4px' }}>
                $9.99<span style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>/month</span>
              </div>
              <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>All features included. Multi-currency support.</p>
            </div>
          </div>
          <p style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>
            Still cheaper than any competitor. <Link href="/pricing" style={{ color: '#16a34a', textDecoration: 'underline' }}>See full pricing details</Link>.
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Use our <Link href="/tools/gst-calculator" style={{ color: '#16a34a' }}>GST Calculator</Link> or <Link href="/tools/restaurant-invoice-generator" style={{ color: '#16a34a' }}>Invoice Generator</Link> free — no signup needed.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '20px',
            lineHeight: '1.2',
            letterSpacing: '-1px',
          }}>
            Stop Paying for Billing Software That Charges You Per Transaction
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            marginBottom: '36px',
            lineHeight: '1.7',
          }}>
            Start your 7-day free trial today. Full access to every feature. No credit card required. Set up in under 5 minutes.
          </p>
          <a href="https://dineopen.com/login" style={{
            padding: '18px 44px',
            fontSize: '18px',
            fontWeight: '700',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            boxShadow: '0 4px 20px rgba(22, 163, 74, 0.4)',
          }}>
            Start Free Trial Now
          </a>
        </div>
      </section>

      <InternalLinks currentPath="/free-restaurant-billing-software" variant="tool" />
      <Footer />
    </div>
  );
}
