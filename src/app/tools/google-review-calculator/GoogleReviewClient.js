'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function GoogleReviewClient() {
  const [currentRating, setCurrentRating] = useState(3.8);
  const [currentCount, setCurrentCount] = useState(50);
  const [targetRating, setTargetRating] = useState(4.5);
  const [calculated, setCalculated] = useState(false);

  // Formula: (targetRating * (currentCount + n) - currentRating * currentCount) / 5 = n
  // targetRating * currentCount + targetRating * n - currentRating * currentCount = 5n
  // n * (targetRating - 5) = currentRating * currentCount - targetRating * currentCount
  // n = (currentCount * (currentRating - targetRating)) / (targetRating - 5)
  // Since targetRating < 5, denominator is negative, so we get positive n
  const reviewsNeeded = targetRating >= 5 ? Infinity :
    Math.max(0, Math.ceil((currentCount * (targetRating - currentRating)) / (5 - targetRating)));
  const isImpossible = targetRating <= currentRating;
  const newTotal = currentCount + reviewsNeeded;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Google Review Calculator' }]} />
      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>Free Calculator &bull; No Login</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Google Review Rating Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>Find out how many 5-star reviews you need to reach your target Google rating.</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your Google Reviews</h3>
                {[
                  { label: 'Current Rating', value: currentRating, set: setCurrentRating, min: 1, max: 4.9, step: 0.1 },
                  { label: 'Total Reviews', value: currentCount, set: setCurrentCount, min: 1, max: 1000, step: 1 },
                  { label: 'Target Rating', value: targetRating, set: setTargetRating, min: 3, max: 5, step: 0.1 },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{f.label}</span><span style={{ color: '#ea580c', fontSize: '18px' }}>{f.value}</span>
                    </label>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => f.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#ea580c' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>Calculate</button>
              </div>

              <div style={{ backgroundColor: calculated ? '#fff7ed' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Results</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isImpossible ? (
                      <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#065f46' }}>You already have a {currentRating} rating — that is at or above your target of {targetRating}!</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: '24px', backgroundColor: '#ea580c', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>5-Star Reviews Needed</p>
                          <p style={{ fontSize: '48px', fontWeight: '800' }}>{reviewsNeeded === Infinity ? '∞' : reviewsNeeded}</p>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Rating Change</p>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#374151' }}>
                            {'★'.repeat(Math.floor(currentRating))} {currentRating} → {'★'.repeat(Math.floor(targetRating))} {targetRating}
                          </p>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>New Total Reviews</p>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#374151' }}>{currentCount} → {newTotal}</p>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                          <p style={{ fontSize: '14px', color: '#9a3412', fontWeight: '600' }}>
                            Tip: Ask happy customers to leave a review right after their meal. QR codes on receipts work great!
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</p>
                    <p>Enter your current rating and target, then click Calculate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#ea580c', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate Review Collection</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen sends automated WhatsApp review requests after every order.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
        <InternalLinks currentPath="/tools/google-review-calculator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
