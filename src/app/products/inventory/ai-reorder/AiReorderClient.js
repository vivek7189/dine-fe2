'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaRobot, FaChartLine, FaCalendarAlt, FaMicrophone, FaExclamationTriangle, FaLightbulb, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function AiReorderClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <FaRobot size={28} />,
      title: 'Smart Reorder Suggestions',
      desc: 'AI analyzes your historical consumption data, current stock levels, and supplier lead times to calculate the optimal reorder point for each ingredient. Get suggestions like "Order 50kg tomatoes by Thursday - your current stock will last until Saturday at current consumption rate." One-click to create a purchase order.'
    },
    {
      icon: <FaChartLine size={28} />,
      title: 'Consumption Pattern Analysis',
      desc: 'Machine learning identifies your usage patterns across days of the week, time of month, and seasons. See which ingredients have rising or falling demand, which are overstocked relative to usage, and where your biggest cost fluctuations occur. Data-driven insights replace guesswork.'
    },
    {
      icon: <FaExclamationTriangle size={28} />,
      title: 'Waste Prediction & Prevention',
      desc: 'AI combines expiry dates with consumption rates to predict which items are likely to go to waste. Get proactive alerts: "15kg chicken breast expires in 3 days, but you typically use only 8kg in that time. Consider a special or discount to prevent Rs.2,100 in waste."'
    },
    {
      icon: <FaCalendarAlt size={28} />,
      title: 'Seasonal & Event Awareness',
      desc: 'The system learns from historical data to predict demand spikes around festivals (Diwali, Eid, Christmas), weekends, weather changes, and local events. Reorder suggestions adjust automatically: order more before busy periods, scale back during slow seasons.'
    },
    {
      icon: <FaMicrophone size={28} />,
      title: 'Voice Recognition for Stock Entry',
      desc: 'During physical stock counts, use voice commands to record items hands-free. Say "Tomatoes, 25 kilograms" or "Olive oil, 12 bottles" and DineOpen records the entry. Supports Hindi and English. Significantly faster than manual data entry during audits.'
    },
    {
      icon: <FaLightbulb size={28} />,
      title: 'Cost Optimization Insights',
      desc: 'AI identifies cost-saving opportunities: bulk purchase suggestions when prices are low, alternative ingredient recommendations when usual items are expensive, and supplier switching recommendations based on price trends. Track estimated savings from following AI suggestions.'
    },
  ];

  const aiInsights = [
    { insight: 'Reorder timing accuracy', value: '85-90%', desc: 'After 2-3 months of usage data' },
    { insight: 'Waste reduction', value: '30%', desc: 'Average across DineOpen restaurants' },
    { insight: 'Cost savings from suggestions', value: '15-20%', desc: 'On ingredient procurement costs' },
    { insight: 'Stock-out prevention', value: '95%', desc: 'Critical items always in stock' },
  ];

  const faqs = [
    { q: 'How does AI reorder suggestion work?', a: 'DineOpen AI analyzes your historical consumption data, current stock levels, supplier lead times, and seasonal patterns. It calculates optimal reorder points and quantities, ensuring you order the right amount at the right time.' },
    { q: 'Can AI predict waste?', a: 'Yes. Based on expiry dates, consumption rates, and historical waste data, AI predicts which items are likely to expire before use. It suggests menu specials or promotions to use up items nearing expiry.' },
    { q: 'Does it account for seasonal demand?', a: 'Yes. AI learns seasonal patterns (festivals, weekends, weather impacts) and adjusts reorder suggestions accordingly. Order more before busy periods, less during slow seasons.' },
    { q: 'Is voice entry supported?', a: 'Yes. Use voice recognition to add items during stock counts. Say the item name and quantity, and DineOpen records it hands-free. Supports Hindi and English.' },
    { q: 'How accurate are AI predictions?', a: 'AI accuracy improves with data. After 2-3 months of usage, predictions typically achieve 85-90% accuracy for reorder timing and 80-85% for quantity suggestions. The system continuously learns.' },
    { q: 'Does AI work from day one?', a: 'Basic reorder alerts based on minimum stock levels work immediately. AI-powered predictions need 2-3 months of data to be accurate. In the meantime, you can manually set reorder points.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>AI-Powered</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              AI Reorder Suggestions & Waste Predictions
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Let AI analyze your consumption patterns, predict stockouts, suggest optimal order quantities, and prevent waste. Voice recognition for hands-free stock entry. Reduce waste by 30% and never run out of critical ingredients.
            </p>
            <Link href="/login?ref=inventory" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* AI Stats */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '20px' }}>
            {aiInsights.map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>{item.value}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>{item.insight}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>AI Inventory Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Related Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/inventory', title: 'Inventory Overview', desc: 'Complete inventory management suite.' },
                { href: '/products/inventory/stock', title: 'Stock Management', desc: 'Real-time tracking that feeds AI.' },
                { href: '/products/inventory/purchase-orders', title: 'Purchase Orders', desc: 'One-click PO from AI suggestions.' },
                { href: '/products/inventory/recipes', title: 'Recipe Costing', desc: 'Consumption data for AI predictions.' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{link.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#9ca3af', flexShrink: 0, marginLeft: '12px' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>AI Reorder FAQ</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 24px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </button>
                  {openFaq === idx && <div style={{ padding: '0 24px 20px' }}><p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Let AI Manage Your Inventory</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Smart reorder suggestions and waste predictions. Free 7-day trial.</p>
            <Link href="/login?ref=inventory" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
