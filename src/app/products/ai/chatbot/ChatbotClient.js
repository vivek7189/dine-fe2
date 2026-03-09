'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function ChatbotClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '💬', title: '24/7 Customer Support', description: 'The chatbot answers customer questions around the clock - menu inquiries, hours, dietary options, reservation policies. Even when you are closed, the AI is working.' },
    { icon: '📚', title: 'Knowledge Base Training', description: 'Upload PDF, Word, Excel, and text files with your menu, policies, and FAQs. The AI learns your specific restaurant information for accurate, relevant responses.' },
    { icon: '🔗', title: 'URL Content Learning', description: 'Add your website URL, menu page, or any relevant links. The AI crawls and learns the content to provide informed answers about your restaurant.' },
    { icon: '❓', title: 'FAQ Category Management', description: 'Organize FAQs by categories like Menu, Reservations, Delivery, and Dietary. Add, edit, and reorder entries. The chatbot uses these for consistent answers.' },
    { icon: '🍽️', title: 'Dietary & Allergy Answers', description: '"Is the pad thai gluten-free?" "Which items are vegan?" The chatbot answers dietary questions accurately based on your menu data.' },
    { icon: '🌍', title: 'Multi-Language Responses', description: 'Responds in the customer\'s language - Hindi, Tamil, Telugu, English, and more. Language detection is automatic, so no configuration needed per conversation.' },
  ];

  const chatExamples = [
    { customer: 'Do you have any gluten-free options?', ai: 'Yes! We have several gluten-free options: Grilled Chicken Salad, Steamed Fish with Vegetables, Rice Bowl with Curry, and all our rice-based dishes. Our staff can also modify most dishes to be gluten-free. Would you like to see the full menu?' },
    { customer: 'What are your opening hours on Sunday?', ai: 'We are open on Sundays from 11:00 AM to 10:00 PM. Our kitchen takes last orders at 9:30 PM. We also serve a special Sunday brunch from 11:00 AM to 3:00 PM.' },
    { customer: 'Do you take reservations for large groups?', ai: 'Yes! We accept reservations for groups of any size. For parties of 8 or more, we recommend booking at least 48 hours in advance. We have a private dining area for groups of 15+. Would you like to make a reservation?' },
  ];

  const knowledgeSources = [
    { type: 'PDF Files', desc: 'Upload your menu PDF, employee handbook, allergy guide, or any document. The AI extracts and learns all content.', icon: '📄' },
    { type: 'Word Documents', desc: 'Upload .docx files with policies, seasonal menus, catering information, or event details.', icon: '📝' },
    { type: 'Excel Files', desc: 'Upload spreadsheets with menu pricing, inventory data, or structured information.', icon: '📊' },
    { type: 'Text Files', desc: 'Upload plain text files with any information you want the AI to know about your restaurant.', icon: '📋' },
    { type: 'URLs', desc: 'Point the AI to your website, Google Maps listing, or any web page with restaurant information.', icon: '🔗' },
    { type: 'Manual FAQs', desc: 'Add question-answer pairs organized by category for the most common customer inquiries.', icon: '❓' },
  ];

  const faqs = [
    { q: 'How does the restaurant chatbot work?', a: 'The chatbot is trained on your restaurant\'s specific data - your menu, FAQs, policies, and any documents you upload. When customers ask questions, it searches through your knowledge base to provide accurate, relevant answers. It works 24/7 without human intervention, handling common questions that would otherwise require staff time.' },
    { q: 'How do I train the chatbot?', a: 'In DineOpen AI Studio, upload PDF, Word, Excel, or text files containing your menu, policies, and FAQs. You can add URLs for the AI to learn from. You can also manually add FAQ entries organized by category (Menu, Reservations, Delivery, etc.). The chatbot combines all sources into a comprehensive knowledge base.' },
    { q: 'Can the chatbot handle dietary and allergy questions?', a: 'Yes. If your uploaded menu data includes dietary information (vegetarian, vegan, gluten-free, nut-free, etc.), the chatbot accurately answers specific questions like "Which dishes are gluten-free?" or "Does the pad thai contain peanuts?" This reduces the burden on staff and provides instant answers to health-critical questions.' },
    { q: 'Is the chatbot available 24/7?', a: 'Yes. The chatbot runs around the clock. It answers questions about your menu, operating hours, location, reservation policies, dietary options, and more - even when your restaurant is closed. This captures potential customers who research restaurants late at night or early morning.' },
    { q: 'Can I organize FAQs by category?', a: 'Yes. DineOpen AI Studio lets you create categories like Menu, Reservations, Delivery, Dietary Info, Events, and more. Within each category, you can add, edit, reorder, and remove FAQ entries. The chatbot uses these organized FAQs alongside uploaded documents for comprehensive coverage.' },
    { q: 'Does the chatbot work in multiple languages?', a: 'Yes. The chatbot automatically detects the customer\'s language and responds accordingly. It supports Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more. No per-language configuration needed.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen AI / Chatbot
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              AI Chatbot That Knows<br />Your Restaurant Inside Out
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Train with your menu, FAQs, and policies. The chatbot answers customer questions 24/7 - dietary needs, hours, reservations, and more. In any language.
            </p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Chat Examples */}
        <section style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              See It in Action
            </h2>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
              {chatExamples.map((ex, idx) => (
                <div key={idx} style={{ marginBottom: idx < chatExamples.length - 1 ? '24px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <div style={{ maxWidth: '80%', backgroundColor: '#ef4444', color: 'white', borderRadius: '16px', padding: '12px 16px', fontSize: '14px', lineHeight: 1.5 }}>
                      <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>Customer</p>
                      {ex.customer}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ maxWidth: '85%', backgroundColor: '#e5e7eb', color: '#111827', borderRadius: '16px', padding: '12px 16px', fontSize: '14px', lineHeight: 1.5 }}>
                      <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px', opacity: 0.6 }}>AI Chatbot</p>
                      {ex.ai}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Chatbot Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Knowledge Sources */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Train Your Chatbot With Any Data
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>Upload documents, add URLs, or create FAQs manually. The AI learns it all.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {knowledgeSources.map((ks, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{ks.icon}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{ks.type}</h3>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{ks.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '40px' }}>Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Spark</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹300/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Blaze</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹2,500/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Answer Every Customer Question, Automatically</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>Set up your AI chatbot in minutes. Train with your data, go live 24/7.</p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
