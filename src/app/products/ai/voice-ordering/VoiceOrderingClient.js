'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function VoiceOrderingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '🗣️', title: 'Natural Language Understanding', description: 'Customers speak naturally like they would to a waiter. "Give me two butter chickens, extra spicy, and three naans." The AI parses items, quantities, modifiers, and preferences.' },
    { icon: '🌍', title: '10+ Languages', description: 'Works in Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, and English. Customers order in their mother tongue - no language barrier.' },
    { icon: '🔧', title: 'Modifier Handling', description: 'Understands "extra cheese," "no onion," "medium spicy," size variants, and cooking preferences. Complex orders with different modifiers per item are handled smoothly.' },
    { icon: '✅', title: 'Order Confirmation', description: 'AI reads back the complete order for confirmation before placing it. Customers can correct items, change quantities, or add more. Ensures accuracy.' },
    { icon: '⚡', title: 'Realtime & Cost-Optimized Modes', description: 'Choose realtime mode for the most natural conversation with sub-second responses, or cost-optimized mode for budget-friendly voice ordering with slightly higher latency.' },
    { icon: '🎙️', title: 'Customizable Voice', description: 'Select from multiple voice options for the AI. Choose a voice that matches your restaurant brand - warm, professional, friendly. Customize the greeting message.' },
    { icon: '📞', title: 'Phone & Web Channels', description: 'Voice ordering works via your web ordering page (microphone button) or phone calls to your AI-enabled number. Customers choose the channel they prefer.' },
    { icon: '🔗', title: 'Direct Kitchen Integration', description: 'Voice orders go directly into your order system and kitchen display as KOTs. Same workflow as waiter-placed or QR orders. No manual re-entry.' },
  ];

  const conversationExample = [
    { speaker: 'Customer', text: '"Mujhe do butter chicken chahiye, extra spicy, aur teen garlic naan"', lang: 'Hindi' },
    { speaker: 'AI', text: '"Samajh gaya! Do butter chicken extra spicy aur teen garlic naan. Kuch aur add karna hai?"', lang: '' },
    { speaker: 'Customer', text: '"Haan, ek dal makhani bhi, medium spicy"', lang: '' },
    { speaker: 'AI', text: '"Perfect! Aapka order: 2 butter chicken (extra spicy), 3 garlic naan, 1 dal makhani (medium spicy). Confirm karun?"', lang: '' },
    { speaker: 'Customer', text: '"Haan, confirm karo"', lang: '' },
    { speaker: 'AI', text: '"Order place ho gaya! Estimated time: 20 minutes. Dhanyavaad!"', lang: '' },
  ];

  const faqs = [
    { q: 'How does AI voice ordering work?', a: 'Customers speak their order naturally, like talking to a waiter. The AI uses speech recognition and natural language processing to understand items, quantities, modifiers, and special requests. It confirms the order verbally, handles corrections, and places the order into your kitchen system. The entire conversation happens naturally in the customer\'s preferred language.' },
    { q: 'What languages are supported?', a: 'DineOpen AI supports Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more. The AI detects the language being spoken and responds in the same language. Customers can even mix languages (Hinglish, for example) and the AI still understands.' },
    { q: 'Can the AI handle complex orders?', a: 'Yes. The AI handles multi-item orders with different modifiers per item, special cooking instructions, dietary preferences, and follow-up changes. It can process orders like "two paneer tikka medium spicy, one butter chicken extra hot, and four plain naan" in a single conversation.' },
    { q: 'What is the difference between realtime and cost-optimized voice modes?', a: 'Realtime mode uses advanced AI for sub-second responses and the most natural conversational experience. Cost-optimized mode processes voice with slightly higher latency but at a lower cost per interaction. Choose realtime for premium customer experience, or cost-optimized for high volume with budget constraints.' },
    { q: 'Do customers need to install anything?', a: 'No. Voice ordering works through the web browser on your ordering page (customers tap a microphone button) or via phone calls to your restaurant\'s AI number. No app download, no account creation, no special setup on the customer\'s end.' },
    { q: 'How accurate is the voice ordering?', a: 'Very accurate. The AI is trained on restaurant-specific vocabulary and menu items. It handles accents, background noise, and colloquial speech well. The confirmation step ensures any misunderstandings are caught before the order is placed. Accuracy improves over time as the system learns your menu context.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen AI / Voice Ordering
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              AI Voice Ordering<br />Speak Your Order, Any Language
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Customers speak their order naturally in Hindi, Tamil, Telugu, English, or any of 10+ supported languages. The AI understands, confirms, and places the order - just like a human.
            </p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Conversation Example */}
        <section style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              A Real Voice Order Conversation
            </h2>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
              {conversationExample.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.speaker === 'Customer' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    maxWidth: '80%',
                    backgroundColor: msg.speaker === 'Customer' ? '#ef4444' : '#e5e7eb',
                    color: msg.speaker === 'Customer' ? 'white' : '#111827',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}>
                    <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>{msg.speaker} {msg.lang && `(${msg.lang})`}</p>
                    <p style={{ margin: 0 }}>{msg.text}</p>
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
              Voice Ordering Features
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

        {/* Languages Grid */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '40px' }}>
              Supported Languages
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
              {['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'English', 'And more...'].map((lang, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', fontWeight: idx < 11 ? '600' : '400', color: idx < 11 ? '#111827' : '#6b7280', fontSize: '15px' }}>
                  {lang}
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
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹299/mo in India</p>
                <Link href="/login?ref=ai" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Pro</h3>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Let AI Take Orders for You</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>Voice ordering in 10+ languages. Set up in minutes, no technical skills needed.</p>
            <Link href="/login?ref=ai" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
