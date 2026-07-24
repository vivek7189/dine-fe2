'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function DisplayClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '📺', title: 'Works on Any Screen', description: 'Use a tablet, TV, monitor, or laptop. The KDS interface adapts to any screen size automatically. No proprietary hardware required - just open a browser.' },
    { icon: '🔔', title: 'Sound Alerts', description: 'Audible notifications when new orders arrive. Kitchen staff hear new tickets instantly, even during the noisiest service hours. Adjustable volume and tone.' },
    { icon: '⏱️', title: 'Cooking Timers', description: 'Each order shows an elapsed timer from the moment it was received. Track preparation times, identify bottlenecks, and ensure timely service.' },
    { icon: '🎨', title: 'Color-Coded Statuses', description: 'Orders are visually coded by status - pending, in-progress, ready. Glance at the screen and instantly understand the state of every order in your kitchen.' },
    { icon: '🔄', title: 'Real-Time via Pusher', description: 'Orders appear the instant they are placed. Status changes sync across all displays immediately. No polling, no refreshing - true real-time powered by Pusher.' },
    { icon: '📅', title: 'Date & Status Filters', description: 'Filter the display to show today, last 24 hours, or all orders. Combine with status filters (pending, in-progress, ready, completed) for a focused view.' },
    { icon: '▶️', title: 'One-Tap Transitions', description: 'Kitchen staff tap once to start an order, tap again to mark it ready. Minimal interaction needed - designed for busy hands and fast-paced kitchens.' },
    { icon: '📱', title: 'Multi-Display Support', description: 'Run displays at multiple stations - one at grill, one at prep, one at expediting. Each can be filtered to show only relevant orders for that station.' },
  ];

  const setupSteps = [
    { step: '1', title: 'Sign Up', desc: 'Create your DineOpen account in under 2 minutes. No credit card required for the free trial.' },
    { step: '2', title: 'Set Up Menu', desc: 'Add your menu items, categories, and modifiers. Import from existing menu or enter manually.' },
    { step: '3', title: 'Open KDS', desc: 'On your kitchen device, open the KDS URL in any browser. Bookmark it for quick access.' },
    { step: '4', title: 'Start Taking Orders', desc: 'Orders from POS, waiter app, QR ordering, or online all appear on the kitchen display instantly.' },
  ];

  const faqs = [
    { q: 'What screen size works best for a kitchen display?', a: 'For busy kitchens, a 22-inch or larger monitor or TV is ideal since it can show multiple orders at once. Smaller kitchens or single-station setups do well with a 10-inch tablet. DineOpen auto-adjusts the layout to fit any screen size, so there is no minimum requirement.' },
    { q: 'How do sound notifications work?', a: 'When a new order arrives, the display device plays an audible alert through its speakers. This works on tablets, monitors connected to speakers, or TVs. Sound can be adjusted for volume or muted during off-peak hours.' },
    { q: 'Are orders updated in real-time on the display?', a: 'Yes. DineOpen uses Pusher real-time technology to push updates instantly. New orders appear within a second of being placed. Status changes by kitchen staff sync across all connected displays immediately. No manual refreshing needed.' },
    { q: 'Can I use a smart TV as a kitchen display?', a: 'Absolutely. Any smart TV with a web browser works. You can also connect a Chromecast, Amazon Fire Stick, or a mini PC (like Raspberry Pi) to a regular TV. Just open the DineOpen KDS URL in the browser.' },
    { q: 'Can different stations see different orders?', a: 'Yes. You can open multiple display instances filtered to different categories. For example, the bar station sees only drink orders, the grill sees only mains, and the expediter sees all orders. Each display runs independently in its own browser tab or device.' },
    { q: 'What happens if the internet goes down?', a: 'The display will show the last loaded orders and alert you about the connection loss. Once internet returns, it automatically reconnects and syncs all pending orders. For critical setups, we recommend a backup mobile hotspot.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Kitchen / Display
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Kitchen Display Screens<br />Real-Time, Any Device
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Turn any tablet, TV, or monitor into a powerful kitchen display system. Real-time orders, sound alerts, cooking timers, and color-coded statuses - all in a web browser.
            </p>
            <Link href="/login?ref=kitchen" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Display Features Built for Kitchens
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

        {/* Setup Steps */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Set Up in Minutes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '32px' }}>
              {setupSteps.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Device Options */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Use Any Device You Already Own
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>No proprietary hardware needed. DineOpen KDS runs in any web browser.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { device: 'Tablet', desc: 'Android or iPad tablets. Mount on kitchen wall for a dedicated display. 10-inch recommended for small kitchens.', icon: '📱' },
                { device: 'TV / Monitor', desc: 'Smart TVs, monitors, or regular TVs with a streaming stick. 22-inch or larger for busy kitchens.', icon: '📺' },
                { device: 'Laptop / Desktop', desc: 'Any computer with a browser works. Great for expediting stations or manager oversight.', icon: '💻' },
              ].map((d, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>{d.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{d.device}</h3>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Pricing</h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>Kitchen display included in all plans. Zero transaction fees.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹299/mo in India</p>
                <Link href="/login?ref=kitchen" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Pro</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹1,799/mo in India</p>
                <Link href="/login?ref=kitchen" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
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
              Set Up Your Kitchen Display Now
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
              Turn any screen into a kitchen command center. Free trial, no credit card required.
            </p>
            <Link href="/login?ref=kitchen" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
