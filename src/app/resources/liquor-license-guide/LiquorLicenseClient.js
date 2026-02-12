'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function LiquorLicenseClient() {
  const licenseTypes = [
    { type: 'FL-1', desc: 'Wholesale liquor license', who: 'Distributors, wholesalers' },
    { type: 'FL-2', desc: 'Retail off-premise license', who: 'Wine shops, liquor stores' },
    { type: 'FL-3', desc: 'Retail on-premise license', who: 'Bars, restaurants, clubs' },
    { type: 'FL-4', desc: 'Permit room license', who: 'Hotels with bar service' },
  ];

  const documents = [
    'FSSAI License (for serving food)',
    'GST Registration Certificate',
    'Trade License from Municipal Corporation',
    'Fire NOC',
    'Building NOC / Ownership proof',
    'Police NOC (some states)',
    'PAN Card & Aadhaar of proprietor',
    'Passport size photos',
    'Layout plan of premises',
    'Character certificate',
  ];

  const stateFees = [
    { state: 'Maharashtra', fee: '₹1-5 Lakh', time: '3-6 months' },
    { state: 'Delhi', fee: '₹5-10 Lakh', time: '2-4 months' },
    { state: 'Karnataka', fee: '₹2-8 Lakh', time: '3-6 months' },
    { state: 'Goa', fee: '₹50K-2 Lakh', time: '1-3 months' },
    { state: 'Tamil Nadu', fee: '₹3-8 Lakh', time: '4-8 months' },
    { state: 'Telangana', fee: '₹2-6 Lakh', time: '3-6 months' },
  ];

  const steps = [
    { step: 1, title: 'Check Eligibility', desc: 'Location restrictions (distance from schools, temples), zoning laws' },
    { step: 2, title: 'Gather Documents', desc: 'All NOCs, licenses, identity proofs' },
    { step: 3, title: 'Apply to Excise Dept', desc: 'Submit application with fees at state excise office' },
    { step: 4, title: 'Inspection', desc: 'Excise officer visits premises for verification' },
    { step: 5, title: 'NOC Collection', desc: 'Get police, fire, municipal NOCs' },
    { step: 6, title: 'License Issued', desc: 'After all clearances, license is issued' },
    { step: 7, title: 'Annual Renewal', desc: 'Renew before expiry each year' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '48px' }}>🍷</span>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Liquor License Guide India</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Everything you need to know about getting a liquor license for your bar or restaurant.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: '#fef3c7', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            ⚠️ Liquor laws vary by state. Some states like Gujarat, Bihar, and Mizoram have prohibition. Always check local regulations.
          </p>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>License Types (Most States)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {licenseTypes.map((l, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '24px', fontWeight: '800', color: '#7c3aed', marginBottom: '8px' }}>{l.type}</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{l.desc}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{l.who}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px', textAlign: 'center' }}>
              For restaurants and bars, you typically need <strong>FL-3</strong> (or equivalent in your state)
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>📋 Documents Required</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <span style={{ color: '#7c3aed' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>💰 State-wise Costs (Approximate)</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '600', color: '#6b7280' }}>State</span>
                <span style={{ fontWeight: '600', color: '#6b7280' }}>License Fee</span>
                <span style={{ fontWeight: '600', color: '#6b7280' }}>Time</span>
              </div>
              {stateFees.map((s, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 24px', borderBottom: idx < stateFees.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <span style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>{s.state}</span>
                  <span style={{ fontSize: '15px', color: '#7c3aed', fontWeight: '600' }}>{s.fee}</span>
                  <span style={{ fontSize: '15px', color: '#6b7280' }}>{s.time}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px', textAlign: 'center' }}>
              *Fees vary based on location, area, and establishment type. Contact local excise office for exact fees.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Step-by-Step Process</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Guides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'FSSAI Registration', href: '/resources/fssai-registration', icon: '📜' },
                { name: 'All Licenses Checklist', href: '/resources/restaurant-licenses-india', icon: '✅' },
                { name: 'Fire Safety NOC', href: '/resources/fire-safety-noc', icon: '🔥' },
                { name: 'POS for Bars', href: '/for/bars-pubs', icon: '🍺' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#7c3aed', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>POS for Bars & Pubs</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Manage liquor inventory, track peg-wise sales, happy hour pricing, and more with DineOpen.</p>
            <Link href="/for/bars-pubs" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
