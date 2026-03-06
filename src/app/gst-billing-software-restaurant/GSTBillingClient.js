'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import InternalLinks from '../../components/InternalLinks';
import {
  FaCheckCircle, FaArrowRight, FaFileInvoice, FaCalculator, FaReceipt,
  FaChartBar, FaCloudDownloadAlt, FaShieldAlt, FaChevronDown, FaChevronUp,
  FaRupeeSign, FaCogs, FaListAlt, FaFileExcel, FaRegFileAlt, FaPrint
} from 'react-icons/fa';

export default function GSTBillingClient() {
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

  const complianceFeatures = [
    {
      icon: FaCalculator,
      title: 'Auto Tax Calculation',
      description: 'Automatically calculates 5% or 18% GST based on your restaurant type (AC/non-AC). Splits into CGST and SGST on every invoice.'
    },
    {
      icon: FaFileInvoice,
      title: 'GSTIN on Invoices',
      description: 'Your GSTIN is printed on every invoice with proper formatting, sequential invoice numbers, and all fields required by GST law.'
    },
    {
      icon: FaListAlt,
      title: 'HSN Codes',
      description: 'Correct HSN codes (9963 for restaurant services) are automatically added to invoices for full compliance.'
    },
    {
      icon: FaChartBar,
      title: 'GST Return Reports',
      description: 'Generate GSTR-1 and GSTR-3B ready reports with one click. Export to Excel or Tally-compatible format.'
    },
    {
      icon: FaCloudDownloadAlt,
      title: 'E-Invoicing Ready',
      description: 'Supports e-invoicing as mandated by the GST Council. Generate IRN-compatible invoices for businesses above threshold.'
    },
    {
      icon: FaRegFileAlt,
      title: 'Monthly & Quarterly Filing Support',
      description: 'Whether you file GST monthly or quarterly, DineOpen generates reports in the exact format needed for both filing cycles.'
    },
  ];

  const gstRates = [
    { type: 'Non-AC Restaurants', rate: '5%', itc: 'No ITC', note: 'Standard rate for all non-AC dining restaurants' },
    { type: 'AC Restaurants', rate: '5%', itc: 'No ITC', note: 'Same rate applies to air-conditioned restaurants' },
    { type: 'Outdoor Catering (without ITC)', rate: '5%', itc: 'No ITC', note: 'Lower rate option for catering services' },
    { type: 'Outdoor Catering (with ITC)', rate: '18%', itc: 'ITC Available', note: 'Higher rate with input tax credit benefit' },
    { type: 'Food Delivery Apps', rate: '5%', itc: 'No ITC', note: 'GST collected by the delivery platform' },
    { type: 'Takeaway Food', rate: '5%', itc: 'No ITC', note: 'Same rate as dine-in for takeaway orders' },
  ];

  const gstReports = [
    { name: 'GSTR-1 Report', description: 'Outward supply details with invoice-wise breakup, ready for direct upload to the GST portal.' },
    { name: 'GSTR-3B Report', description: 'Summary of outward and inward supplies with tax liability calculation for monthly/quarterly filing.' },
    { name: 'Export to Tally', description: 'One-click export in Tally-compatible XML format. Import directly into Tally ERP for seamless accounting.' },
    { name: 'Export to Excel', description: 'Download detailed GST reports in Excel with all invoice data, tax breakups, and HSN-wise summaries.' },
    { name: 'CA-Ready Formats', description: 'Pre-formatted reports that your chartered accountant can use directly for filing. No manual formatting needed.' },
  ];

  const howItWorks = [
    { step: 1, title: 'Configure Your GSTIN', description: 'Enter your GSTIN, business name, and address. DineOpen validates the format and saves it for all invoices.' },
    { step: 2, title: 'Set Tax Rates Per Item', description: 'Configure GST rates (5% or 18%) per item or category. Set HSN codes once and they apply automatically.' },
    { step: 3, title: 'Auto-Calculate on Every Bill', description: 'Every bill automatically calculates GST, splits into CGST + SGST (or IGST), and prints compliant invoices.' },
    { step: 4, title: 'Generate Reports Monthly', description: 'At month-end, generate GSTR-1 and GSTR-3B reports with one click. Export and share with your CA.' },
  ];

  const faqs = [
    {
      question: 'What GST rate should my restaurant charge?',
      answer: 'Most restaurants in India charge 5% GST without input tax credit (ITC). This applies to both AC and non-AC restaurants. If you do outdoor catering, you can choose between 5% (without ITC) or 18% (with ITC). DineOpen lets you configure the correct rate for your business.'
    },
    {
      question: 'Does DineOpen generate GST-compliant invoices?',
      answer: 'Yes. Every invoice generated by DineOpen includes your GSTIN, HSN code (9963 for restaurant services), proper CGST/SGST split, sequential invoice numbers, and all other fields required by GST law. Invoices are 100% compliant and audit-ready.'
    },
    {
      question: 'Can I export reports for GST filing?',
      answer: 'Yes. DineOpen generates GSTR-1 and GSTR-3B ready reports that can be exported to Excel or Tally format. You can share these directly with your CA or upload them to the GST portal.'
    },
    {
      question: 'Does the software handle both CGST/SGST and IGST?',
      answer: 'Yes. DineOpen automatically applies CGST + SGST for intra-state transactions and IGST for inter-state transactions based on your business location and the customer location.'
    },
    {
      question: 'Is there a free trial for the GST billing software?',
      answer: 'Yes. DineOpen offers a free 30-day trial with all GST features included. No credit card required. Pricing starts at just Rs 300 per month after the trial.'
    },
  ];

  const FAQItem = ({ faq, index }) => (
    <div style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
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
        <p style={{ marginTop: '12px', fontSize: '15px', color: '#6b7280', lineHeight: '1.7' }}>
          {faq.answer}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
        padding: isMobile ? '60px 20px' : '80px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#fef2f2',
            borderRadius: '20px',
            marginBottom: '24px',
            border: '1px solid #fecaca'
          }}>
            <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
              100% GST Compliant | Built for Indian Restaurants
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : '52px',
            fontWeight: '800',
            color: '#111827',
            lineHeight: '1.2',
            marginBottom: '24px',
            letterSpacing: '-1px'
          }}>
            GST Billing Software for<br />
            <span style={{ color: '#ef4444' }}>Restaurants — 100% Compliant</span>
          </h1>

          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: '#6b7280',
            lineHeight: '1.7',
            maxWidth: '720px',
            margin: '0 auto 20px',
          }}>
            Auto GST calculation (5% or 18%), GSTIN on every invoice, HSN codes, GSTR-1 and GSTR-3B
            ready reports, e-invoicing support — everything your restaurant needs for GST compliance.
          </p>

          <p style={{
            fontSize: '16px',
            color: '#ef4444',
            fontWeight: '600',
            marginBottom: '40px'
          }}>
            Starting at just Rs 300/month | Free 30-day trial | No credit card required
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
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              Start Free Trial <FaArrowRight size={16} />
            </button>
            <Link
              href="/tools/gst-calculator"
              style={{
                padding: '16px 32px',
                borderRadius: '10px',
                background: 'white',
                color: '#374151',
                fontWeight: '700',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
            >
              <FaCalculator size={14} /> Try GST Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Answer — AEO Block */}
      <section style={{
        padding: isMobile ? '32px 20px' : '40px 32px',
        backgroundColor: '#fef2f2',
        borderBottom: '1px solid #fecaca'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quick Answer</p>
          <p style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.7', margin: 0 }}>
            <strong>DineOpen is GST billing software built for Indian restaurants.</strong> It auto-calculates 5% GST (non-AC restaurants) or 18% GST (AC restaurants), splits into CGST + SGST on every invoice, adds your GSTIN and HSN code (9963), and generates GSTR-1/GSTR-3B ready reports with one click. Supports e-invoicing. Starts at ₹300/month with a 30-day free trial. Used by 1,000+ restaurants across India.
          </p>
        </div>
      </section>

      {/* GST Compliance Features */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              GST Compliance Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Every feature you need to stay 100% GST compliant without the hassle.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {complianceFeatures.map((feature, index) => (
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
                  <feature.icon size={24} color="#ef4444" />
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

      {/* GST Rate Guide */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              GST Rate Guide for Restaurants
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Know exactly which GST rate applies to your restaurant type.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 2fr',
              backgroundColor: '#111827',
              padding: '16px 24px',
              gap: '16px'
            }}>
              {!isMobile ? (
                <>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Restaurant Type</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>GST Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>ITC</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Notes</span>
                </>
              ) : (
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>GST Rates by Restaurant Type</span>
              )}
            </div>

            {/* Table Rows */}
            {gstRates.map((row, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 2fr',
                  padding: '16px 24px',
                  gap: isMobile ? '8px' : '16px',
                  borderBottom: index < gstRates.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                }}
              >
                <div>
                  {isMobile && <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>TYPE: </span>}
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{row.type}</span>
                </div>
                <div>
                  {isMobile && <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>RATE: </span>}
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#ef4444',
                    backgroundColor: '#fef2f2',
                    padding: '2px 10px',
                    borderRadius: '6px'
                  }}>
                    {row.rate}
                  </span>
                </div>
                <div>
                  {isMobile && <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>ITC: </span>}
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: row.itc === 'ITC Available' ? '#16a34a' : '#6b7280'
                  }}>
                    {row.itc}
                  </span>
                </div>
                <div>
                  {isMobile && <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>NOTE: </span>}
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{row.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auto GST Reports */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Auto GST Reports
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Generate filing-ready GST reports with one click. Export to Tally, Excel, or share with your CA.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {gstReports.map((report, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaFileExcel size={20} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '6px'
                  }}>
                    {report.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                    {report.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How DineOpen Handles GST */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              How DineOpen Handles GST
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              4 simple steps to complete GST compliance
            </p>
          </div>

          <div style={{ position: 'relative' }}>
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
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '20px',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                }}>
                  {step.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#111827' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '16px'
          }}>
            Simple Pricing for GST Billing
          </h2>
          <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '40px' }}>
            All GST features included. No hidden charges. No per-invoice fees.
          </p>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: isMobile ? '32px 20px' : '48px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '56px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
              Rs 300
            </div>
            <div style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '28px' }}>per month</div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '12px',
              textAlign: 'left',
              marginBottom: '32px'
            }}>
              {[
                'Auto GST calculation',
                'GSTIN on every invoice',
                'HSN code support',
                'GSTR-1 & GSTR-3B reports',
                'Export to Tally/Excel',
                'E-invoicing ready',
                'Unlimited invoices',
                '30-day free trial'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCheckCircle size={14} color="#22c55e" />
                  <span style={{ fontSize: '14px', color: '#d1d5db' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleGetStarted}
              style={{
                padding: '16px 40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                marginBottom: '16px'
              }}
            >
              Start Free 30-Day Trial
            </button>

            <div>
              <Link
                href="/tools/gst-calculator"
                style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'underline' }}
              >
                Try our free GST Calculator
              </Link>
            </div>
          </div>

          <Link
            href="/pricing"
            style={{ fontSize: '15px', color: '#9ca3af', textDecoration: 'underline' }}
          >
            View full pricing details
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Common questions about GST billing for restaurants
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '32px',
            border: '1px solid #e5e7eb'
          }}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 32px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '20px'
          }}>
            Start GST-Compliant Billing Today — Free 30-Day Trial
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '32px',
            lineHeight: '1.7'
          }}>
            Join thousands of Indian restaurants using DineOpen for hassle-free GST billing.
            Auto tax calculation, compliant invoices, and filing-ready reports — all included.
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
            <Link
              href="/products/billing-software"
              style={{
                padding: '18px 40px',
                borderRadius: '10px',
                background: 'transparent',
                color: 'white',
                fontWeight: '700',
                border: '2px solid white',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <InternalLinks currentPath="/gst-billing-software-restaurant" variant="industry" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
