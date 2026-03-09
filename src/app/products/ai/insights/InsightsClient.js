'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function InsightsClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const insightTypes = [
    { icon: '📈', title: 'Menu Performance', description: 'Identify your best and worst performing menu items. See which dishes generate the most revenue, which are rarely ordered, and which items are frequently ordered together for potential combo offers.' },
    { icon: '⏰', title: 'Peak Hour Analysis', description: 'Understand your busiest hours, days, and seasons. Optimize staff scheduling, prep quantities, and marketing efforts based on actual order patterns rather than guesswork.' },
    { icon: '👥', title: 'Customer Behavior Patterns', description: 'Learn what customers ask about most, their ordering preferences, dietary trends, and feedback patterns from chatbot conversations. Understand your audience deeply.' },
    { icon: '💬', title: 'Chatbot Interaction Analytics', description: 'See which questions customers ask most frequently, which topics get the most engagement, and where the chatbot needs better answers. Improve your FAQ data continuously.' },
    { icon: '💰', title: 'Revenue Trend Analysis', description: 'Track revenue trends over time - daily, weekly, monthly. Identify growth patterns, seasonal dips, and the impact of menu changes or marketing campaigns on sales.' },
    { icon: '🎯', title: 'AI Recommendations', description: 'Get actionable suggestions: items to promote, prices to adjust, combos to create, hours to extend, and FAQs to update. Data-driven decisions instead of gut feelings.' },
  ];

  const sampleInsights = [
    { insight: 'Butter Chicken is ordered 40% more on weekends. Consider a weekend combo deal.', category: 'Menu', impact: 'Revenue' },
    { insight: 'Peak ordering hours are 12:30-1:30 PM and 7:30-8:30 PM. Staff accordingly.', category: 'Operations', impact: 'Efficiency' },
    { insight: '"Do you have vegan options?" is your #1 chatbot question. Add more vegan items to menu.', category: 'Customer', impact: 'Satisfaction' },
    { insight: 'Naan and curry are ordered together 85% of the time. Create a bundle deal.', category: 'Menu', impact: 'Revenue' },
    { insight: 'Tuesday dinner orders are 35% below average. Run a Tuesday special promotion.', category: 'Marketing', impact: 'Revenue' },
    { insight: '23% of chatbot questions about delivery hours go unanswered. Update your FAQ.', category: 'Support', impact: 'Customer' },
  ];

  const faqs = [
    { q: 'What insights does DineOpen AI provide?', a: 'DineOpen AI analyzes your order data, chatbot interactions, and customer behavior to surface insights like top-performing menu items, peak ordering hours, common customer questions, items frequently ordered together, and revenue trends. It provides actionable recommendations, not just raw data, so you can make informed decisions.' },
    { q: 'How does the AI generate business recommendations?', a: 'The AI analyzes patterns across your order history, chatbot conversations, menu performance metrics, and seasonal trends. It identifies opportunities like underperforming items to reconsider, popular combinations for bundling, optimal staffing hours, and pricing suggestions. Recommendations are specific and actionable.' },
    { q: 'Do I need to set up anything for insights?', a: 'No special setup is required. DineOpen AI automatically analyzes data from your orders, chatbot interactions, and menu activity as you use the platform. The more data it has (more orders and interactions), the richer and more accurate the insights become over time.' },
    { q: 'Can I see which chatbot questions are most common?', a: 'Yes. DineOpen AI tracks every chatbot interaction and shows you the most frequently asked questions, the topics customers care about most, and questions the chatbot struggled to answer. This helps you continuously improve your FAQ and knowledge base to provide better customer support.' },
    { q: 'How often are insights updated?', a: 'Key metrics like order counts and revenue update in real-time as transactions happen. Deeper trend analysis, pattern recognition, and strategic recommendations are generated periodically (daily/weekly) to ensure statistical accuracy. You always have access to both live metrics and longer-term strategic insights.' },
    { q: 'Can insights help with menu engineering?', a: 'Absolutely. The AI categorizes menu items by popularity and profitability, identifies items that are stars (high popularity, high profit), puzzles (low popularity, high profit), plow horses (high popularity, low profit), and dogs (low both). This classic menu engineering matrix helps you decide what to promote, reprice, or remove.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen AI / Insights
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              AI Business Insights<br />Data-Driven Restaurant Decisions
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Understand what sells, when customers order, what they ask about, and where to improve. AI analyzes your data and provides actionable recommendations.
            </p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Insight Types */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Types of Insights You Get
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {insightTypes.map((it, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{it.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{it.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{it.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Insights */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Sample AI Insights
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>Real examples of what DineOpen AI surfaces from your data.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sampleInsights.map((si, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                  <p style={{ fontSize: '15px', color: '#111827', lineHeight: 1.5, margin: 0, flex: 1 }}>{si.insight}</p>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>{si.category}</span>
                    <span style={{ fontSize: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>{si.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Insights Work */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How AI Insights Work
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                { step: '1', title: 'Data Collection', desc: 'DineOpen automatically collects data from every order, chatbot conversation, and customer interaction. No manual setup needed.' },
                { step: '2', title: 'Pattern Analysis', desc: 'AI analyzes patterns across time, menu items, customer behavior, and chatbot interactions. Identifies trends humans would miss.' },
                { step: '3', title: 'Actionable Results', desc: 'Get specific recommendations: what to promote, when to staff, which FAQs to update, and where revenue opportunities exist.' },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '40px' }}>Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Spark</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹300/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Blaze</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹2,500/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: '24px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === idx && <p style={{ marginTop: '12px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Make Smarter Decisions with AI</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>Let AI analyze your restaurant data and tell you where the opportunities are.</p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
