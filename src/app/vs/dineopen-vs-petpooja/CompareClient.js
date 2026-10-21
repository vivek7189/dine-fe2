'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Published starting price', dineopen: '₹899/month (India)', petpooja: '₹12,000 + taxes, Base plan (billing period not stated)', winner: 'tie' },
  { feature: 'Per-transaction fee charged by the POS', dineopen: 'None', petpooja: 'None listed on pricing page', winner: 'tie' },
  { feature: 'Online payment charges', dineopen: 'Payment gateway\'s own fee', petpooja: 'Payment gateway\'s own fee', winner: 'tie' },
  { feature: 'Zomato/Swiggy Integration', dineopen: '✗ (Not yet)', petpooja: '✓ Direct', winner: 'petpooja' },
  { feature: 'AI Voice Ordering', dineopen: '✓ Included', petpooja: 'AI agent listed in Base plan; ask what it covers', winner: 'tie' },
  { feature: 'AI Menu Extraction', dineopen: '✓ Included', petpooja: 'Ask Petpooja', winner: 'tie' },
  { feature: 'GST Billing', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Inventory Management', dineopen: '✓ Included', petpooja: '✓ Base plan', winner: 'tie' },
  { feature: 'Captain app / KDS', dineopen: '✓ Included', petpooja: 'Operations Manager plan (from ₹20,000 + taxes, Base included)', winner: 'dineopen' },
  { feature: 'CRM / Loyalty', dineopen: '✓ Included', petpooja: 'Marketing Manager plan (from ₹20,000 + taxes, Base included)', winner: 'dineopen' },
  { feature: 'Free Trial', dineopen: '7 days, no card', petpooja: 'Free demo (no trial listed)', winner: 'dineopen' },
  { feature: 'Devices', dineopen: 'Android, iPhone/iPad, Windows, browser', petpooja: 'iOS, Windows, Android', winner: 'tie' },
];

const publishedPrices = [
  { plan: 'Base Plan (POS)', price: '₹12,000' },
  { plan: 'Operations Manager: Growth', price: '₹20,000' },
  { plan: 'Operations Manager: Scale', price: '₹30,000' },
  { plan: 'Marketing Manager: Core', price: '₹20,000' },
  { plan: 'Marketing Manager: Growth', price: '₹30,000' },
  { plan: 'Marketing Manager: Scale', price: '₹40,000' },
];

export default function CompareClient() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px 60px',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            Honest Side-by-Side Comparison
          </div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '20px',
            lineHeight: '1.2',
          }}>
            DineOpen vs Petpooja: Honest Comparison (2026)
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#4b5563',
            lineHeight: '1.7',
            maxWidth: '650px',
            margin: '0 auto 16px',
          }}>
            Both are solid restaurant POS platforms. We will let the facts speak — feature by feature, price by price — so you can decide which one fits your business.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}>
            No spin, no bashing. Just an honest breakdown.
          </p>
        </div>
      </section>

      {/* Quick Summary */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Quick Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* DineOpen Card */}
            <div style={{
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#eff6ff',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '16px' }}>DineOpen</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'From ₹899/month in India',
                  'AI-powered (voice ordering, chat, menu extraction)',
                  'No per-transaction fee from DineOpen',
                  'Available in 20+ countries',
                  '7-day free trial, no card',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '700', flexShrink: 0 }}>&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Petpooja Card */}
            <div style={{
              border: '2px solid #7c3aed',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#f5f3ff',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed', marginBottom: '16px' }}>Petpooja</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Base plan listed at ₹12,000 + taxes',
                  'Large, established company with a partner network',
                  'Direct Swiggy and Zomato integration',
                  'Higher Operations and Marketing plans from ₹20,000',
                  'No per-order fee listed on its pricing page',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#7c3aed', fontWeight: '700', flexShrink: 0 }}>&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature-by-Feature Comparison Table */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Feature-by-Feature Comparison
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#ffffff', fontSize: '15px', fontWeight: '700' }}>Feature</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#60a5fa', fontSize: '15px', fontWeight: '700' }}>DineOpen</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#c4b5fd', fontSize: '15px', fontWeight: '700' }}>Petpooja</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{row.feature}</td>
                    <td style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'dineopen' ? '#16a34a' : '#374151',
                      fontWeight: row.winner === 'dineopen' ? '700' : '400',
                    }}>
                      {row.dineopen}
                      {row.winner === 'dineopen' && <span style={{ marginLeft: '6px', color: '#16a34a' }}>&#10003;</span>}
                    </td>
                    <td style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'petpooja' ? '#16a34a' : '#374151',
                      fontWeight: row.winner === 'petpooja' ? '700' : '400',
                    }}>
                      {row.petpooja}
                      {row.winner === 'petpooja' && <span style={{ marginLeft: '6px', color: '#16a34a' }}>&#10003;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
            Petpooja details from petpooja.com/pricing, checked 21 October 2026. &#10003; marks a clear difference.
          </p>
        </div>
      </section>

      {/* Where DineOpen Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#eff6ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where DineOpen Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Areas where DineOpen has a clear advantage
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { title: 'AI Features', desc: 'Voice ordering, chat assistant, and menu extraction that automate operations and reduce staff workload.' },
              { title: 'Price You Can See', desc: 'From ₹899/month in India with captain app, KDS, inventory and loyalty included. No add-ons to price out.' },
              { title: 'Try It First', desc: '7-day free trial with no card. Set it up yourself on the phone, tablet or laptop you already have.' },
              { title: 'Works Abroad Too', desc: 'Runs in 20+ countries with local currency and tax settings, if you plan to open outside India.' },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #bfdbfe',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where Petpooja Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f5f3ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where Petpooja Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Credit where it is due — Petpooja has real strengths
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Swiggy and Zomato Integration', desc: 'Petpooja connects directly to Swiggy and Zomato, so delivery orders land in the POS. DineOpen does not do this yet.' },
              { title: 'Longer Track Record', desc: 'Petpooja has been in the market longer and has a proven track record with thousands of Indian restaurants.' },
              { title: 'Larger India Support Team', desc: 'A bigger on-ground support team across Indian cities for in-person setup and troubleshooting.' },
              { title: 'More Third-Party Integrations', desc: 'A wider ecosystem of third-party integrations built over years, including accounting and ERP tools.' },
              { title: 'Established Brand Recognition', desc: 'Well-known name in the Indian restaurant industry. Many restaurant owners already know and trust the brand.' },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #ddd6fe',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#7c3aed', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Published Prices */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Published Prices, Side by Side
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Only what each company shows on its own pricing page. No guesses.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '24px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '16px', color: '#1d4ed8', marginBottom: '12px', fontWeight: '700' }}>DineOpen (dineopen.com/pricing)</p>
              <p style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>From ₹899/month in India</p>
              <p style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>Billing, KOT, inventory, captain app, KDS, QR ordering and loyalty included</p>
              <p style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>7-day free trial, no card needed</p>
              <p style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>No per-transaction fee from DineOpen</p>
              <p style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>No automatic Swiggy/Zomato sync</p>
            </div>
            <div style={{ backgroundColor: '#f5f3ff', borderRadius: '12px', padding: '24px', border: '1px solid #ddd6fe' }}>
              <p style={{ fontSize: '16px', color: '#6d28d9', marginBottom: '12px', fontWeight: '700' }}>Petpooja (petpooja.com/pricing)</p>
              {publishedPrices.map((row, i) => (
                <p key={i} style={{ fontSize: '14px', color: '#374151', margin: '6px 0', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>{row.plan}</span><strong>{row.price}</strong>
                </p>
              ))}
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px', marginBottom: 0 }}>
                All listed as exclusive of applicable taxes. The Operations and Marketing plans include Base. The page does not state the billing period and lists no per-order fee. Food aggregator integrations are in Base.
              </p>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.7' }}>
            Petpooja prices checked on petpooja.com/pricing on 21 October 2026. Prices change, so confirm with Petpooja before you decide. Online card and UPI payments carry your payment gateway&apos;s own charges (often around 2%) whichever POS you use.
          </p>
        </div>
      </section>

      {/* Who Should Choose DineOpen */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f0f9ff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            Who Should Choose DineOpen?
          </h2>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid #bfdbfe',
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'New restaurants looking for a modern, affordable POS from day one',
                'Tech-savvy owners who want AI-powered automation (voice ordering, chat assistant)',
                'Owners with several outlets who want them on one account',
                'Owners who want to see the full price before talking to sales',
                'Businesses expanding internationally — DineOpen works in 20+ countries',
                'Owners who want WhatsApp ordering to reach more customers',
              ].map((item, i) => (
                <li key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none',
                  fontSize: '15px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>&#10140;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who Should Choose Petpooja */}
      <section style={{ padding: '60px 20px', backgroundColor: '#faf5ff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            Who Should Choose Petpooja?
          </h2>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid #ddd6fe',
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Restaurants that get a lot of Swiggy and Zomato orders and want them synced into the POS',
                'Restaurants already on Petpooja with deep integrations they don\'t want to rebuild',
                'Businesses that need a large local on-ground support team across Indian cities',
                'Enterprises with custom needs requiring dedicated account management',
                'Owners who prefer an established, well-known brand with a long track record',
              ].map((item, i) => (
                <li key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none',
                  fontSize: '15px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{ color: '#7c3aed', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>&#10140;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The Verdict */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
            The Verdict
          </h2>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '16px',
            padding: '40px 32px',
            border: '1px solid #e5e7eb',
          }}>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              If you want <strong>AI features, a low published price and everything in one plan</strong>, DineOpen is a strong fit. You can try it for 7 days before paying.
            </p>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              If <strong>Swiggy and Zomato orders are a big part of your sales</strong>, or you want a large, established company with a partner network, Petpooja remains a solid choice.
            </p>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
              Either way, we recommend trying DineOpen&apos;s free 7-day trial. You can test everything risk-free and decide based on your own experience.
            </p>
          </div>
        </div>
      </section>

      {/* Best for Small Restaurants */}
      <section style={{ padding: '60px 20px', backgroundColor: '#fff7ed' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Best POS for Small Restaurants with Single Outlet
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px', fontSize: '16px' }}>
            If you run a single restaurant, here is what matters most
          </p>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #fed7aa' }}>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', margin: '0 0 20px 0' }}>
              Small restaurants with a single outlet have different needs than chains. You need <strong>affordable pricing</strong>, <strong>quick setup</strong>, and <strong>all features in one place</strong> without paying for modules you do not use yet.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Published price', dineopen: '₹899/month', petpooja: '₹12,000 + taxes (Base)' },
                { label: 'Captain app / KDS', dineopen: 'Included', petpooja: 'Operations Manager plan' },
                { label: 'Swiggy/Zomato sync', dineopen: 'No', petpooja: 'Yes, direct' },
                { label: 'Free trial', dineopen: '7 days, no card', petpooja: 'Free demo' },
              ].map((row, i) => (
                <div key={i} style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{row.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a', marginBottom: '4px' }}>DineOpen: {row.dineopen}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Petpooja: {row.petpooja}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: '1.7' }}>
              Ask Petpooja what billing period the ₹12,000 covers and which plan you would need, then compare that with DineOpen&apos;s monthly price. If delivery apps drive most of your orders, weigh Petpooja&apos;s Swiggy/Zomato sync heavily.
            </p>
          </div>
        </div>
      </section>

      {/* Migration Guide */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f0fdf4' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            How to Switch from Petpooja to DineOpen
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { step: '1', title: 'Start a free trial (2 minutes)', desc: 'Sign up at dineopen.com. No credit card, no contracts. You get full access to all features for 7 days.' },
              { step: '2', title: 'Import your menu with AI (2 minutes)', desc: 'Take a photo of your physical menu or screenshot your Petpooja menu. DineOpen AI extracts all items, prices, and categories automatically.' },
              { step: '3', title: 'Run both systems in parallel (3-5 days)', desc: 'Keep Petpooja running while you test DineOpen alongside it. Train staff on the new system — takes about 15 minutes per person.' },
              { step: '4', title: 'Switch over fully', desc: 'Once your team is comfortable, make DineOpen your primary POS. Export your Petpooja data for records. Cancel your Petpooja subscription.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', minWidth: '36px' }}>{item.step}</div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Reading */}
      <section style={{ padding: '48px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Reading</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { title: 'Petpooja Review 2026', href: '/blog/petpooja-review-2026', desc: 'Honest, in-depth review' },
              { title: 'Petpooja Alternative', href: '/alternatives/petpooja', desc: 'Full alternative comparison' },
              { title: 'Best POS India', href: '/blog/best-restaurant-pos-systems-india-comparison-2024', desc: 'Market comparison guide' },
              { title: 'Billing App Guide', href: '/blog/restaurant-billing-app-complete-guide', desc: 'Complete buyer\'s guide' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>{link.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
            Try DineOpen Free for 7 Days
          </h2>
          <p style={{ fontSize: '18px', color: '#dbeafe', marginBottom: '32px', lineHeight: '1.6' }}>
            See the difference yourself. No credit card required. Full access to all features including AI voice ordering.
          </p>
          <Link
            href="https://dineopen.com/login"
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              color: '#1e40af',
              padding: '16px 40px',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '800',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            Start Free Trial — See the Difference
          </Link>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['No credit card needed', '7-day full access', 'Cancel anytime'].map((item, i) => (
              <span key={i} style={{ color: '#bfdbfe', fontSize: '14px' }}>
                &#10003; {item}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>View Pricing</Link>
            <Link href="/products/ai-agent" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>Explore AI Agent</Link>
            <Link href="/products/pos-software" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>POS Software</Link>
            <Link href="/alternatives/petpooja" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>Petpooja Alternative</Link>
            <Link href="/tools/roi-calculator" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>ROI Calculator</Link>
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/vs/dineopen-vs-petpooja" variant="alternative" />
      <Footer />
    </div>
  );
}
