'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import {
  FaStore, FaCashRegister, FaCreditCard, FaUtensils, FaBoxes, FaChartBar,
  FaRobot, FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp,
  FaCheckCircle, FaArrowRight, FaGlobe, FaShieldAlt, FaHeadset, FaLaptop,
} from 'react-icons/fa';

export default function QatarClient() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: FaCashRegister, title: 'Cloud POS', desc: 'Fast billing, table management, and order tracking — works on any device, even offline.' },
    { icon: FaCreditCard, title: 'Sadad & NAPS Integration', desc: 'Direct payment terminal integration with Sadad (WiseCashier) and NAPS Qatar. Zero transaction fees from DineOpen.' },
    { icon: FaUtensils, title: 'Kitchen Display System', desc: 'Real-time order tickets on kitchen screens. No more paper KOTs — reduce errors and speed up service.' },
    { icon: FaBoxes, title: 'Inventory Management', desc: 'Track stock, get low-stock alerts, manage suppliers, and reduce food waste automatically.' },
    { icon: FaChartBar, title: 'Analytics & Reports', desc: 'Sales reports, peak hour analysis, staff performance, and profit margins — all in real time.' },
    { icon: FaRobot, title: 'AI Voice Ordering', desc: 'AI-powered phone ordering and smart menu recommendations. Let AI handle calls while your staff focuses on guests.' },
    { icon: FaUsers, title: 'Loyalty & CRM', desc: 'Built-in customer loyalty program, visit tracking, and targeted promotions to bring guests back.' },
    { icon: FaLaptop, title: 'Multi-Platform', desc: 'Works on Windows, Mac, tablets, and phones. Desktop app for always-on POS or browser for quick access.' },
  ];

  const whyPartner = [
    { icon: FaGlobe, title: 'Global Technology, Local Support', desc: 'DineOpen powers 1,000+ restaurants in 20+ countries. In Qatar, you get the same world-class platform with local, on-ground support from Booster Trading Services.' },
    { icon: FaShieldAlt, title: 'Qatar Payment Ready', desc: 'Pre-integrated with Sadad/WiseCashier cloud terminals and NAPS Qatar direct terminals. Accept Visa, Mastercard, and local cards seamlessly.' },
    { icon: FaHeadset, title: 'Full Service — Sales to Support', desc: 'Booster Trading Services handles everything — demo, installation, staff training, CCTV setup, hardware, and ongoing technical support in Doha and across Qatar.' },
    { icon: FaStore, title: 'Built for Every Restaurant Type', desc: 'Fine dining, casual restaurants, cafes, cloud kitchens, QSR chains, food courts, catering — DineOpen adapts to your format.' },
  ];

  const stats = [
    { value: '1,000+', label: 'Restaurants Worldwide' },
    { value: '20+', label: 'Countries' },
    { value: 'QAR', label: 'Multi-Currency Support' },
    { value: '$0', label: 'Transaction Fees' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  const services = [
    'Restaurant POS software setup and installation',
    'Sadad / WiseCashier payment terminal integration',
    'NAPS Qatar direct terminal integration',
    'Kitchen display system (KDS) deployment',
    'CCTV installation for restaurants',
    'Staff training and onboarding',
    'Ongoing technical support and maintenance',
    'Hardware procurement and setup',
    'Custom software configuration',
    'Multi-branch and chain management',
  ];

  const faqs = [
    {
      q: 'Is DineOpen available in Qatar?',
      a: 'Yes. DineOpen is available in Qatar through our official partner Booster Trading Services, based in Doha. They provide sales, installation, training, and ongoing support for all DineOpen products.',
    },
    {
      q: 'Does DineOpen support Sadad payment terminals in Qatar?',
      a: 'Yes. DineOpen integrates with Sadad (WiseCashier) cloud payment terminals and NAPS Qatar direct terminals. The cashier selects "Card (Terminal)" on the POS, the amount is pushed to the terminal, the customer taps their card, and the result comes back to the POS automatically. DineOpen charges zero transaction fees.',
    },
    {
      q: 'How much does DineOpen cost in Qatar?',
      a: 'DineOpen starts at $9.99/month with all features included — POS, kitchen display, inventory, analytics, and AI tools. No transaction fees, no hidden charges. Contact our Qatar team for local pricing and special deals.',
    },
    {
      q: 'Can I get a free demo in Qatar?',
      a: 'Yes. Contact Booster Trading Services at +974-7052-9114 or sales@boostertradingservicesqa.com to schedule a free demo at your restaurant in Doha or anywhere in Qatar.',
    },
    {
      q: 'Does DineOpen work offline?',
      a: 'Yes. DineOpen has full offline mode — you can take orders, process bills, and print receipts even without internet. Data syncs automatically when you are back online.',
    },
    {
      q: 'Can DineOpen handle multiple branches in Qatar?',
      a: 'Yes. DineOpen supports multi-branch management with a centralized headquarters dashboard. Manage menus, pricing, inventory, and analytics across all your locations from one place.',
    },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '80px' }}>

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #7c1d3e 0%, #8b1a3a 50%, #6b1530 100%)',
          padding: isMobile ? '60px 20px' : '100px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '40px',
              padding: '8px 20px', marginBottom: '24px',
              fontSize: '14px', fontWeight: '600', color: '#ffffff',
              backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: '20px' }}>&#127478;&#127462;</span> Now in Qatar
            </div>
            <h1 style={{
              fontSize: isMobile ? '36px' : '56px', fontWeight: '800',
              color: '#ffffff', marginBottom: '24px', lineHeight: '1.1',
            }}>
              Restaurant POS & Payment Solutions for Qatar
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '20px', color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 40px',
            }}>
              DineOpen partners with Booster Trading Services to bring world-class restaurant technology to Doha and across Qatar — Cloud POS, Sadad terminal integration, AI voice ordering, and everything your restaurant needs.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/97470529114?text=Hi%2C%20I%27m%20interested%20in%20DineOpen%20POS%20for%20my%20restaurant%20in%20Qatar" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', backgroundColor: '#25d366', color: '#ffffff',
                borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                textDecoration: 'none', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
              }}>
                <FaWhatsapp size={20} /> Contact Qatar Team
              </a>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff',
                borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
              }}>
                Start Free Trial <FaArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{
          backgroundColor: '#111827', padding: isMobile ? '40px 20px' : '48px 20px',
        }}>
          <div style={{
            maxWidth: '1000px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
            gap: '24px', textAlign: 'center',
          }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '800', color: '#ef4444' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Partnership Section */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                Official Partner in Qatar
              </p>
              <h2 style={{ fontSize: isMobile ? '30px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '20px', lineHeight: '1.15' }}>
                DineOpen + Booster Trading Services
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto' }}>
                Booster Trading Services is our official sales and technology partner in Qatar. Based in Doha, they bring deep expertise in restaurant technology, hardware installation, and on-ground support — ensuring your DineOpen setup runs flawlessly from day one.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '40px', alignItems: 'start',
            }}>
              {/* Booster Info */}
              <div style={{
                backgroundColor: '#f9fafb', borderRadius: '16px', padding: '32px',
                border: '1px solid #e5e7eb',
              }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
                  Booster Trading Services
                </h3>
                <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7', marginBottom: '24px' }}>
                  Part of the Booster Group of Companies, Booster Trading Services is a Doha-based technology and services company specializing in software solutions for restaurants, retail stores, salons, and supermarkets — along with CCTV installation, manpower supply, and business logistics across Qatar.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaMapMarkerAlt size={16} color="#ef4444" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>Ain Khaled, Souq Al Nayef, Doha, Qatar</span>
                  </div>
                  <a href="tel:+97470529114" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <FaPhone size={14} color="#ef4444" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>+974 7052 9114 (Hotline)</span>
                  </a>
                  <a href="tel:+97470239555" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <FaPhone size={14} color="#ef4444" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>+974 7023 9555</span>
                  </a>
                  <a href="mailto:sales@boostertradingservicesqa.com" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <FaEnvelope size={14} color="#ef4444" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>sales@boostertradingservicesqa.com</span>
                  </a>
                  <a href="https://www.boostertradingservicesqa.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <FaGlobe size={14} color="#ef4444" />
                    <span style={{ fontSize: '14px', color: '#3b82f6' }}>www.boostertradingservicesqa.com</span>
                  </a>
                </div>
              </div>

              {/* Services in Qatar */}
              <div style={{
                backgroundColor: '#f9fafb', borderRadius: '16px', padding: '32px',
                border: '1px solid #e5e7eb',
              }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
                  What We Offer in Qatar
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {services.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <FaCheckCircle size={14} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why DineOpen in Qatar */}
        <section style={{ backgroundColor: '#f9fafb', padding: isMobile ? '60px 20px' : '100px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                Why DineOpen
              </p>
              <h2 style={{ fontSize: isMobile ? '30px' : '42px', fontWeight: '800', color: '#111827', lineHeight: '1.15' }}>
                Why Qatar Restaurants Choose DineOpen
              </h2>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '24px',
            }}>
              {whyPartner.map((item, i) => (
                <div key={i} style={{
                  backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <item.icon size={22} color="#ef4444" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                Features
              </p>
              <h2 style={{ fontSize: isMobile ? '30px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: '1.15' }}>
                Everything Your Qatar Restaurant Needs
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                One platform, all features, zero transaction fees. Starting at $9.99/month.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '20px',
            }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '16px', padding: '24px',
                  borderRadius: '14px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <f.icon size={20} color="#ef4444" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{f.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Integration Highlight */}
        <section style={{
          background: 'linear-gradient(135deg, #111827, #1f2937)',
          padding: isMobile ? '60px 20px' : '100px 20px',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              Payment Integration
            </p>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#ffffff', marginBottom: '20px', lineHeight: '1.15' }}>
              Sadad & NAPS Terminal Integration
            </h2>
            <p style={{ fontSize: '17px', color: '#9ca3af', lineHeight: '1.7', marginBottom: '40px', maxWidth: '650px', margin: '0 auto 40px' }}>
              DineOpen connects directly with Sadad (WiseCashier) cloud payment terminals and NAPS Qatar terminals. Your cashier selects &quot;Card&quot; on the POS, the amount is sent to the terminal, the customer taps their card, and the result comes back automatically. No manual entry. No errors.
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px', textAlign: 'center',
            }}>
              {[
                { num: '1', title: 'Cashier taps Card', desc: 'On the DineOpen POS screen' },
                { num: '2', title: 'Customer pays', desc: 'Tap/insert card on the Sadad terminal' },
                { num: '3', title: 'Done', desc: 'Result syncs back to POS automatically' },
              ].map((step, i) => (
                <div key={i} style={{
                  backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '14px',
                  padding: '24px', border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: '#ef4444', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '800', margin: '0 auto 12px',
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: '#9ca3af' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                FAQ
              </p>
              <h2 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '800', color: '#111827' }}>
                Frequently Asked Questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{
                  backgroundColor: '#f9fafb', borderRadius: '14px', padding: '24px',
                  border: '1px solid #e5e7eb',
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{faq.q}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          background: 'linear-gradient(135deg, #7c1d3e 0%, #8b1a3a 50%, #6b1530 100%)',
          padding: isMobile ? '60px 20px' : '80px 20px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', lineHeight: '1.15' }}>
              Ready to Get Started in Qatar?
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', marginBottom: '36px', lineHeight: '1.6' }}>
              Get a free demo at your restaurant. Our Qatar team will set up everything — POS, payment terminal, kitchen display — and train your staff.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
              <a href="https://wa.me/97470529114?text=Hi%2C%20I%27m%20interested%20in%20DineOpen%20POS%20for%20my%20restaurant%20in%20Qatar" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', backgroundColor: '#25d366', color: '#ffffff',
                borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                textDecoration: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
              }}>
                <FaWhatsapp size={20} /> WhatsApp Us
              </a>
              <a href="tel:+97470529114" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff',
                borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)',
              }}>
                <FaPhone size={16} /> +974 7052 9114
              </a>
            </div>
            <div style={{
              display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap',
              fontSize: '14px', color: 'rgba(255,255,255,0.7)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaEnvelope size={12} /> sales@boostertradingservicesqa.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaMapMarkerAlt size={12} /> Ain Khaled, Doha, Qatar
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
