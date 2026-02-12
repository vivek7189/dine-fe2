'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function SwiggyOnboardingClient() {
  const requirements = [
    { doc: 'FSSAI License', required: true, note: 'Basic/State/Central based on turnover' },
    { doc: 'GST Registration', required: true, note: 'GSTIN mandatory for all restaurants' },
    { doc: 'PAN Card', required: true, note: 'Business or proprietor PAN' },
    { doc: 'Bank Account Details', required: true, note: 'For payment settlements' },
    { doc: 'Menu with Prices', required: true, note: 'Digital format preferred' },
    { doc: 'Restaurant Photos', required: true, note: 'Storefront, interior, food images' },
    { doc: 'Address Proof', required: true, note: 'Rent agreement or utility bill' },
    { doc: 'Owner ID Proof', required: false, note: 'Aadhaar/Passport (sometimes required)' },
  ];

  const steps = [
    { step: 1, title: 'Visit Swiggy Partner Portal', desc: 'Go to partner.swiggy.com and click "Register"', time: '2 min' },
    { step: 2, title: 'Fill Basic Details', desc: 'Restaurant name, address, contact, cuisine type', time: '5 min' },
    { step: 3, title: 'Upload Documents', desc: 'FSSAI, GST, PAN, bank details', time: '10 min' },
    { step: 4, title: 'Add Menu', desc: 'Upload menu with items, prices, and photos', time: '30 min' },
    { step: 5, title: 'Verification Call', desc: 'Swiggy team calls to verify details', time: '1-2 days' },
    { step: 6, title: 'Onboarding Visit', desc: 'Swiggy rep visits for photo shoot and tablet setup', time: '1-3 days' },
    { step: 7, title: 'Go Live!', desc: 'Restaurant appears on Swiggy app', time: 'Same day' },
  ];

  const commissions = [
    { type: 'Food Orders', rate: '15-25%', note: 'Varies by city and volume' },
    { type: 'Swiggy One Orders', rate: '5-10% extra', note: 'Premium delivery membership' },
    { type: 'Payment Gateway', rate: '~2%', note: 'For online payments' },
    { type: 'Packaging', rate: 'Your cost', note: 'Swiggy provides branded bags (optional)' },
  ];

  const tips = [
    { tip: 'High-quality photos', desc: 'Good food photos can increase orders by 30%' },
    { tip: 'Competitive pricing', desc: 'Factor in commission when setting menu prices' },
    { tip: 'Complete menu', desc: 'More items = more visibility in search' },
    { tip: 'Fast preparation', desc: 'Quick prep times improve your rating' },
    { tip: 'Accept all orders initially', desc: 'Build reputation before being selective' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #fc8019 0%, #e67312 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍔</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>How to Register on Swiggy</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Complete guide to list your restaurant on Swiggy. Get approved in 5-7 days.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
            {[
              { stat: '5-7 days', label: 'Approval Time' },
              { stat: '15-25%', label: 'Commission' },
              { stat: '500+', label: 'Cities' },
              { stat: 'Weekly', label: 'Payouts' },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#fc8019' }}>{item.stat}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>📋 Documents Required</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {requirements.map((req, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: idx < requirements.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>{req.required ? '✅' : '📎'}</span>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{req.doc}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>{req.note}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: req.required ? '#dcfce7' : '#f3f4f6', color: req.required ? '#166534' : '#6b7280', borderRadius: '12px' }}>
                    {req.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px', textAlign: 'center' }}>
              Don&apos;t have FSSAI? <Link href="/resources/fssai-registration" style={{ color: '#fc8019', textDecoration: 'underline' }}>Get it here</Link>
            </p>
          </div>
        </section>

        {/* Steps */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>🚀 Registration Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fc8019', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>{s.step}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.desc}</p>
                  </div>
                  <div style={{ fontSize: '13px', color: '#fc8019', fontWeight: '600', whiteSpace: 'nowrap' }}>⏱ {s.time}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>💰 Swiggy Commission Structure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {commissions.map((c, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{c.type}</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: '#fc8019' }}>{c.rate}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>{c.note}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link href="/tools/swiggy-zomato-calculator" style={{ color: '#fc8019', fontWeight: '600', textDecoration: 'underline' }}>
                Calculate your actual earnings →
              </Link>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>💡 Pro Tips for Success</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {tips.map((t, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#9a3412', marginBottom: '6px' }}>{t.tip}</p>
                  <p style={{ fontSize: '14px', color: '#c2410c' }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related */}
        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Guides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Zomato Registration', href: '/resources/zomato-onboarding', icon: '🍽️' },
                { name: 'FSSAI Registration', href: '/resources/fssai-registration', icon: '📜' },
                { name: 'GST for Restaurants', href: '/resources/gst-restaurants', icon: '🧾' },
                { name: 'Commission Calculator', href: '/tools/swiggy-zomato-calculator', icon: '🧮' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#fc8019', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Swiggy Orders in Your POS</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen integrates with Swiggy. Auto-accept orders, print KOT, track earnings - all in one place.</p>
            <Link href="/india" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#fc8019', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
