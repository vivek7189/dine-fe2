'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaWhatsapp, FaRobot, FaShoppingCart, FaBell, FaCheck } from 'react-icons/fa';


export default function WhatsAppOrderingPage() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaWhatsapp style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>WhatsApp Ordering for Restaurants</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Let customers order via WhatsApp. Menu sharing, order confirmation, payment links. India&apos;s favorite app, now your ordering channel.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#25d366', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Why WhatsApp Ordering?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { stat: '500M+', desc: 'WhatsApp users in India' },
                { stat: '70%', desc: 'Customers prefer WhatsApp over calls' },
                { stat: '3x', desc: 'Higher response rate than SMS' },
                { stat: '0', desc: 'App downloads needed' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '32px', backgroundColor: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: '800', color: '#25d366', marginBottom: '8px' }}>{item.stat}</div>
                  <div style={{ fontSize: '16px', color: '#374151' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {[
                { icon: FaWhatsapp, title: 'Share Menu Link', desc: 'Customer clicks your WhatsApp link. Menu opens instantly in chat.' },
                { icon: FaShoppingCart, title: 'Build Order', desc: 'They browse, select items, add to cart. All within WhatsApp.' },
                { icon: FaRobot, title: 'Auto Confirmation', desc: 'Order sent to your dashboard. Customer gets confirmation with ETA.' },
                { icon: FaBell, title: 'Updates & Payment', desc: 'Order ready? Payment link? Promo? All via WhatsApp.' },
              ].map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#dcfce7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#25d366' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>What You Can Do</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                'Send digital menu via WhatsApp',
                'Accept orders directly in chat',
                'Send order confirmations',
                'Share payment links',
                'Broadcast offers to customers',
                'Send birthday/anniversary wishes',
                'Collect feedback after orders',
                'Build customer database',
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                  <FaCheck style={{ color: '#25d366', fontSize: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Perfect For</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/for/cloud-kitchens" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Cloud Kitchens</Link>
              <Link href="/for/cafes" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Cafes</Link>
              <Link href="/for/bakeries" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Bakeries</Link>
              <Link href="/loyalty/customer-retention" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Retention</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Start WhatsApp Ordering</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Setup in 5 minutes. No technical skills needed.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#25d366', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
