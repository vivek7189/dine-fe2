'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function AiLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const capabilities = [
    { icon: '🎤', title: 'AI Voice Ordering', description: 'Customers speak their order naturally in any language. The AI understands items, modifiers, quantities, and special requests. Handles complex multi-item orders conversationally.' },
    { icon: '💬', title: 'Customer Chatbot', description: 'An AI chatbot answers customer questions about your menu, hours, dietary options, and more - 24/7. Trained on your specific restaurant data for accurate answers.' },
    { icon: '📚', title: 'Knowledge Base Management', description: 'Upload PDF, Word, Excel, and text files. Add URLs for the AI to learn from. Build a comprehensive knowledge base that powers accurate AI responses.' },
    { icon: '❓', title: 'FAQ Management', description: 'Add and organize FAQs by category. Edit answers, reorder entries. The AI uses your FAQs to provide consistent, accurate responses to common questions.' },
    { icon: '🗣️', title: 'Voice Customization', description: 'Choose voice options, select between realtime and cost-optimized modes, customize greetings, and configure response behavior. Control how your AI sounds and interacts.' },
    { icon: '🌍', title: 'Multi-Language Support', description: 'Works in Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more. Customers speak naturally in their preferred language.' },
    { icon: '🔗', title: 'URL Content Ingestion', description: 'Point the AI to your website, menu page, or any URL. It reads and learns the content to provide informed responses about your restaurant.' },
    { icon: '📊', title: 'Smart Table Management', description: 'Manage table assignments and seating through voice commands. The AI handles table status updates, reservation lookups, and availability checks.' },
  ];

  const useCases = [
    { title: 'Phone Order Taking', desc: 'AI answers phone calls and takes orders naturally. Customers speak their order in any supported language and the AI processes it into your system.', icon: '📞' },
    { title: 'Menu Questions', desc: '"Is the paneer tikka spicy?" "Do you have gluten-free options?" The chatbot answers instantly using your uploaded menu and FAQ data.', icon: '🍽️' },
    { title: 'After-Hours Support', desc: 'When your restaurant is closed, the AI still answers questions, takes pre-orders, and provides information about hours, location, and menu.', icon: '🌙' },
    { title: 'Multi-Language Service', desc: 'Serve customers in their language. A Tamil-speaking customer can order in Tamil, while the next customer orders in English. No staff language barrier.', icon: '🌐' },
  ];

  const workflow = [
    { step: '1', title: 'Upload Your Data', desc: 'Upload menu, policies, FAQs as PDF, Word, or text files' },
    { step: '2', title: 'Configure AI', desc: 'Set voice, language, greeting, and response preferences' },
    { step: '3', title: 'Train & Test', desc: 'AI learns your data. Test with sample questions and orders' },
    { step: '4', title: 'Go Live', desc: 'Enable the AI and start handling voice orders and chat' },
  ];

  const faqs = [
    { q: 'What is DineOpen AI?', a: 'DineOpen AI is an AI-powered assistant built specifically for restaurants. It handles voice ordering (customers speak their order naturally), answers questions via chatbot (menu, hours, dietary info), and manages a knowledge base you train with your own data. It works in 10+ languages including Hindi, Tamil, and Telugu.' },
    { q: 'How does AI voice ordering work?', a: 'Customers speak their order naturally - for example, "I want two butter chickens and three garlic naans, extra spicy." The AI understands items, quantities, modifiers, and special requests. It confirms the order, handles follow-up questions, and places it into your system. Works in multiple languages including regional Indian languages.' },
    { q: 'What languages does DineOpen AI support?', a: 'It supports Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more. Customers can speak in their preferred language, and the AI responds in the same language. This eliminates language barriers for both ordering and customer support.' },
    { q: 'How do I train the AI with my restaurant data?', a: 'Upload PDF, Word, Excel, or text files containing your menu, policies, and FAQs in the DineAI Studio. You can also add URLs for the AI to learn from, and manually add FAQ entries organized by category. The AI builds a knowledge base from all sources to answer customer questions accurately.' },
    { q: 'Can I customize the AI voice and behavior?', a: 'Yes. DineOpen AI Studio lets you select different voice options, choose between realtime and cost-optimized voice modes, customize the greeting message, and configure how the AI responds. You have full control over how your AI sounds and behaves with customers.' },
    { q: 'Is the AI chatbot available 24/7?', a: 'Yes. The chatbot runs around the clock answering questions about your menu, operating hours, dietary options, reservation policies, and more. It uses your uploaded knowledge base for accurate, restaurant-specific answers. Perfect for after-hours inquiries and reducing phone call volume.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen AI
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              AI That Takes Orders,<br />Answers Questions, Speaks Your Language
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Voice ordering in Hindi, Tamil, Telugu, and 10+ languages. A chatbot trained on your menu and FAQs. Knowledge base you control. Built from 957 lines of real AI studio code.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=ai" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', backgroundColor: 'transparent' }}>
                See Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Language Banner */}
        <section style={{ backgroundColor: '#111827', padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ color: 'white', fontWeight: '700' }}>Speaks 10+ languages:</span> Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more
          </p>
        </section>

        {/* Capabilities */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              AI Capabilities
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              Everything is managed through DineAI Studio - upload data, configure settings, and go live.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {capabilities.map((c, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{c.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{c.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Real Use Cases
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {useCases.map((uc, idx) => (
                <div key={idx} style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{uc.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{uc.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How to Set Up Your AI
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {workflow.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sub-product Links */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Explore AI Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              <Link href="/products/ai/voice-ordering" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Voice Ordering</h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>Customers speak their order naturally in any language.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
              <Link href="/products/ai/chatbot" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Customer Chatbot</h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>24/7 AI chatbot trained on your restaurant data.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
              <Link href="/products/ai/insights" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>AI Insights</h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>AI-powered business insights and analytics.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>AI features included. Zero transaction fees.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>For small restaurants</p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹299/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Pro</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>For multi-location restaurants</p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹1,799/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
              Give Your Restaurant an AI Brain
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
              Voice ordering, chatbot, multi-language support - set up in minutes. Free trial, no credit card.
            </p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
