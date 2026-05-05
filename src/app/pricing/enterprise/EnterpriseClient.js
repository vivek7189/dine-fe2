'use client';

import { useState } from 'react';

const PRIMARY = '#dc2626';
const PRIMARY_DARK = '#b91c1c';
const TEAL = '#0d9488';

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#dcfce7" />
    <path d="M5 8l2 2 4-4" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CROSS = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#fee2e2" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PAID = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#fef3c7" />
    <text x="8" y="11.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400e">₹</text>
  </svg>
);

const plans = [
  {
    id: 'chain3',
    name: 'Chain 3',
    tagline: 'Growing Chain',
    outlets: 3,
    monthly: 4999,
    annual: 49990,
    perOutletMonthly: 1666,
    color: '#2563eb',
    popular: false,
    features: [
      'Up to 3 outlets',
      'HQ Dashboard — all outlets in one view',
      'Central Menu Management',
      'Central Kitchen & Production',
      'Inter-branch Stock Transfers',
      'Consolidated Reports & Analytics',
      'AI-Powered Voice Ordering',
      'AI Menu & Sales Assistant',
      'Kitchen Display System (KDS)',
      'Captain/Waiter App',
      'Customer Loyalty Program',
      'WhatsApp Ordering Bot',
      'Online Ordering Website',
      'QR Menu & Table Ordering',
      'Unlimited Users & Terminals',
      'Inventory with Recipe Management',
      'Aggregator Integration (Swiggy/Zomato)',
      'Dedicated WhatsApp Support Channel',
    ],
  },
  {
    id: 'chain5',
    name: 'Chain 5',
    tagline: 'Established Brand',
    outlets: 5,
    monthly: 7999,
    annual: 79990,
    perOutletMonthly: 1600,
    color: PRIMARY,
    popular: true,
    features: [
      'Up to 5 outlets',
      'Everything in Chain 3, plus:',
      'Dedicated Account Manager',
      'Warehouse & Distribution Module',
      'Custom Reports & Dashboards',
      'Priority API Access',
      'Multi-brand Support',
      'Advanced Staff Permissions',
      'Quarterly Business Review Calls',
      'Priority Support (< 2hr response)',
    ],
  },
  {
    id: 'chain10',
    name: 'Chain 10+',
    tagline: 'Enterprise Scale',
    outlets: 10,
    monthly: null,
    perOutlet: 1299,
    annual: null,
    perOutletAnnual: 12990,
    perOutletMonthly: 1299,
    color: '#7c3aed',
    popular: false,
    features: [
      '10+ outlets (unlimited)',
      'Everything in Chain 5, plus:',
      'White-label Customer App',
      'On-site Training & Setup',
      'SLA-backed 99.9% Uptime',
      'Custom Integrations',
      'Franchise Management Tools',
      'Dedicated Technical POC',
      'Custom Billing Cycles',
      'Volume Discounts on Hardware',
    ],
  },
];

const competitorComparison = [
  { feature: 'Base POS & Billing', dineopen: 'included', petpooja: 'included', posist: 'included' },
  { feature: 'Online Ordering Website', dineopen: 'included', petpooja: 'paid', posist: 'paid' },
  { feature: 'WhatsApp Ordering Bot', dineopen: 'included', petpooja: 'paid', posist: 'no' },
  { feature: 'Customer Loyalty Program', dineopen: 'included', petpooja: 'paid', posist: 'paid' },
  { feature: 'Kitchen Display System', dineopen: 'included', petpooja: 'paid', posist: 'included' },
  { feature: 'AI Voice Ordering', dineopen: 'included', petpooja: 'no', posist: 'no' },
  { feature: 'AI Menu Generation', dineopen: 'included', petpooja: 'no', posist: 'no' },
  { feature: 'Advanced Analytics', dineopen: 'included', petpooja: 'paid', posist: 'included' },
  { feature: 'Captain/Waiter App', dineopen: 'included', petpooja: 'included', posist: 'included' },
  { feature: 'QR Menu & Ordering', dineopen: 'included', petpooja: 'included', posist: 'paid' },
  { feature: 'Inventory Management', dineopen: 'included', petpooja: 'included', posist: 'included' },
  { feature: 'Central Kitchen', dineopen: 'included', petpooja: 'paid', posist: 'included' },
  { feature: 'Transaction Fees', dineopen: '0%', petpooja: '1.5-2%', posist: '1-2%' },
  { feature: 'Annual Lock-in Contract', dineopen: 'no', petpooja: 'yes', posist: 'yes' },
];

const savingsExample = {
  monthlyOnlineOrders: 500000,
  petpoojaTransactionFee: 0.015,
  petpoojaBase: 2500,
  petpoojaAddons: 3500,
  dineopen: 4999,
};

export default function EnterpriseClient() {
  const [billingCycle, setBillingCycle] = useState('annual');
  const isAnnual = billingCycle === 'annual';

  const formatINR = (n) => '₹' + n.toLocaleString('en-IN');

  const petpoojaTotal = savingsExample.petpoojaBase + savingsExample.petpoojaAddons + (savingsExample.monthlyOnlineOrders * savingsExample.petpoojaTransactionFee);
  const annualSavings = (petpoojaTotal - savingsExample.dineopen) * 12;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        color: '#fff', padding: '64px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)',
            borderRadius: 100, padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: 20,
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            Enterprise Plans for Restaurant Chains
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.15 }}>
            One POS. All Features.<br />
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Zero Hidden Costs.
            </span>
          </h1>

          <p style={{ fontSize: 18, opacity: 0.8, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Everything included in every plan — AI, WhatsApp ordering, loyalty, KDS, online ordering, analytics.
            No per-transaction fees. No paid add-ons. No annual lock-in.
          </p>

          {/* Billing toggle */}
          <div className="no-print" style={{
            display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 4,
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <button onClick={() => setBillingCycle('monthly')} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              background: !isAnnual ? '#fff' : 'transparent',
              color: !isAnnual ? '#1e1b4b' : 'rgba(255,255,255,0.7)'
            }}>Monthly</button>
            <button onClick={() => setBillingCycle('annual')} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              background: isAnnual ? '#fff' : 'transparent',
              color: isAnnual ? '#1e1b4b' : 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              Annual
              <span style={{
                background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '2px 8px', borderRadius: 100
              }}>Save 17%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div style={{
        maxWidth: 1100, margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 2
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20, alignItems: 'stretch'
        }}>
          {plans.map(plan => {
            const price = plan.monthly
              ? (isAnnual ? Math.round(plan.annual / 12) : plan.monthly)
              : (isAnnual ? Math.round(plan.perOutletAnnual / 12) : plan.perOutlet);
            const totalAnnual = plan.annual || (plan.perOutletAnnual * plan.outlets);

            return (
              <div key={plan.id} style={{
                background: '#fff', borderRadius: 20, overflow: 'hidden',
                border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e5e7eb',
                boxShadow: plan.popular ? `0 8px 40px rgba(220,38,38,0.15)` : '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', position: 'relative',
                animation: 'fadeUp 0.5s ease', transform: plan.popular ? 'scale(1.03)' : 'none'
              }}>
                {plan.popular && (
                  <div style={{
                    background: plan.color, color: '#fff', textAlign: 'center',
                    fontSize: 12, fontWeight: 700, padding: '6px 0', letterSpacing: 1, textTransform: 'uppercase'
                  }}>Most Popular</div>
                )}

                <div style={{ padding: '28px 24px 0' }}>
                  <div style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                    background: `${plan.color}10`, color: plan.color, fontSize: 12, fontWeight: 700,
                    marginBottom: 8, border: `1px solid ${plan.color}20`
                  }}>{plan.tagline}</div>

                  <h3 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '4px 0 4px' }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
                    {plan.monthly ? `Up to ${plan.outlets} outlets` : `${plan.outlets}+ outlets`}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                      {plan.monthly ? formatINR(price) : formatINR(price)}
                    </span>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                      {plan.monthly ? '/mo' : '/outlet/mo'}
                    </span>
                  </div>

                  {isAnnual && plan.monthly && (
                    <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                      {formatINR(totalAnnual)}/year — Save {formatINR(plan.monthly * 12 - totalAnnual)}
                    </div>
                  )}
                  {!isAnnual && plan.monthly && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      ~{formatINR(plan.perOutletMonthly)}/outlet/month
                    </div>
                  )}

                  <div style={{
                    margin: '20px 0 0', padding: '16px 0', borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      What&apos;s included
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151',
                          fontWeight: f.includes('Everything in') ? 600 : 400
                        }}>
                          {!f.includes('Everything in') && CHECK}
                          {f.includes('Everything in') && (
                            <span style={{ fontSize: 12, marginTop: 1 }}>↑</span>
                          )}
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 24px 24px', marginTop: 'auto' }}>
                  <a href="https://wa.me/919004459951?text=Hi%2C%20I%27m%20interested%20in%20the%20DineOpen%20Enterprise%20plan%20("
                    style={{
                      display: 'block', textAlign: 'center', padding: '14px 24px', borderRadius: 12,
                      background: plan.popular ? plan.color : '#111827', color: '#fff',
                      fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s',
                      boxShadow: plan.popular ? `0 4px 16px ${plan.color}40` : 'none'
                    }}>
                    Get Started
                  </a>
                  <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
                    14-day free trial. No credit card required.
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra outlet add-on */}
        <div style={{
          margin: '24px 0', padding: '16px 24px', background: '#fff', borderRadius: 14,
          border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Need more outlets?</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Add extra outlets to any plan</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{formatINR(isAnnual ? 1199 : 1399)}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>/outlet/month</span>
          </div>
        </div>
      </div>

      {/* Zero Transaction Fees Banner */}
      <div style={{
        maxWidth: 1100, margin: '40px auto', padding: '0 20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
          borderRadius: 20, padding: '40px 32px', color: '#fff', textAlign: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, margin: '0 0 12px' }}>
            Zero Transaction Fees. Always.
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Other POS systems charge 1.5-2% on every online order. If you process ₹5 lakh/month in online orders,
            that&apos;s ₹7,500-10,000/month just in transaction fees — <strong>₹90,000-1,20,000/year gone.</strong>
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.15)',
            borderRadius: 14, padding: '16px 28px', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>Other POS</div>
              <div style={{ fontSize: 24, fontWeight: 800, textDecoration: 'line-through', opacity: 0.6 }}>1.5-2%</div>
            </div>
            <div style={{ fontSize: 24, opacity: 0.5 }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#86efac' }}>DineOpen</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#86efac' }}>0%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="print-break" style={{
        maxWidth: 1100, margin: '48px auto', padding: '0 20px'
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 8 }}>
          Why Chains Switch to DineOpen
        </h2>
        <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>
          Everything included vs paid add-ons. See the real difference.
        </p>

        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', width: '40%' }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: PRIMARY, borderBottom: '2px solid #e5e7eb', width: '20%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span>DineOpen</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '1px 8px', borderRadius: 100 }}>All included</span>
                    </div>
                  </th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #e5e7eb', width: '20%' }}>Petpooja</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #e5e7eb', width: '20%' }}>POSist</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 20px', color: '#374151', fontWeight: 500 }}>{row.feature}</td>
                    {['dineopen', 'petpooja', 'posist'].map(col => {
                      const val = row[col];
                      return (
                        <td key={col} style={{ padding: '12px 20px', textAlign: 'center' }}>
                          {val === 'included' || val === '0%' || val === 'no' && col === 'dineopen' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              {val === 'no' ? (
                                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>No lock-in</span>
                              ) : (
                                <>
                                  {CHECK}
                                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>{val === '0%' ? '0%' : 'Included'}</span>
                                </>
                              )}
                            </div>
                          ) : val === 'paid' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              {PAID}
                              <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>Paid Add-on</span>
                            </div>
                          ) : val === 'no' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              {CROSS}
                              <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Not Available</span>
                            </div>
                          ) : val === 'yes' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              {CROSS}
                              <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Required</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              {val.includes('1') || val.includes('2') ? PAID : CHECK}
                              <span style={{ fontSize: 12, color: val.includes('1') || val.includes('2') ? '#92400e' : '#16a34a', fontWeight: 600 }}>{val}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Savings Calculator */}
      <div style={{
        maxWidth: 1100, margin: '48px auto', padding: '0 20px'
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px 28px', background: 'linear-gradient(135deg, #fef3c7 0%, #fff 100%)',
            borderBottom: '1px solid #fde68a'
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              Real Cost Comparison (3-outlet chain)
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
              What you actually pay per month — base + add-ons + transaction fees
            </p>
          </div>

          <div style={{ padding: '24px 28px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20
            }}>
              {/* Competitor Cost */}
              <div style={{
                padding: '20px', borderRadius: 14, border: '1px solid #fecaca',
                background: '#fef2f2'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 12 }}>Typical POS (per outlet)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#374151' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Base plan</span>
                    <span style={{ fontWeight: 600 }}>₹2,500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Online ordering module</span>
                    <span style={{ fontWeight: 600 }}>₹1,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>WhatsApp ordering</span>
                    <span style={{ fontWeight: 600 }}>₹500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Loyalty program</span>
                    <span style={{ fontWeight: 600 }}>₹500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>KDS module</span>
                    <span style={{ fontWeight: 600 }}>₹500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Advanced analytics</span>
                    <span style={{ fontWeight: 600 }}>₹500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Transaction fees (₹5L orders)</span>
                    <span style={{ fontWeight: 600 }}>₹7,500</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 4,
                    borderTop: '2px solid #fecaca', fontWeight: 800, fontSize: 15
                  }}>
                    <span>Per outlet/month</span>
                    <span style={{ color: '#dc2626' }}>₹13,000</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, color: '#991b1b'
                  }}>
                    <span>3 outlets/month</span>
                    <span>₹39,000</span>
                  </div>
                </div>
              </div>

              {/* DineOpen Cost */}
              <div style={{
                padding: '20px', borderRadius: 14, border: '1px solid #bbf7d0',
                background: '#f0fdf4'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 12 }}>DineOpen Chain 3 (per outlet)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#374151' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Complete POS + all features</span>
                    <span style={{ fontWeight: 600 }}>₹4,999</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Online ordering</span>
                    <span style={{ fontWeight: 600 }}>Included</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>WhatsApp ordering</span>
                    <span style={{ fontWeight: 600 }}>Included</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Loyalty + KDS + Analytics</span>
                    <span style={{ fontWeight: 600 }}>Included</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>AI features (voice, menu, sales)</span>
                    <span style={{ fontWeight: 600 }}>Included</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Transaction fees</span>
                    <span style={{ fontWeight: 700 }}>₹0</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 4,
                    borderTop: '2px solid #bbf7d0', fontWeight: 800, fontSize: 15
                  }}>
                    <span>Per outlet/month</span>
                    <span style={{ color: '#166534' }}>~₹1,666</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, color: '#166534'
                  }}>
                    <span>3 outlets/month</span>
                    <span>₹4,999</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual savings */}
            <div style={{
              marginTop: 20, padding: '16px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
              border: '1px solid #fde68a', textAlign: 'center'
            }}>
              <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Annual savings with DineOpen</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#92400e', margin: '4px 0' }}>
                ₹{((39000 - 4999) * 12).toLocaleString('en-IN')}+
              </div>
              <div style={{ fontSize: 13, color: '#92400e', opacity: 0.8 }}>saved per year for a 3-outlet chain</div>
            </div>
          </div>
        </div>
      </div>

      {/* What Enterprise Gets */}
      <div className="print-break" style={{
        maxWidth: 1100, margin: '48px auto', padding: '0 20px'
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 8 }}>
          Built for Multi-Outlet Operations
        </h2>
        <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>
          Features that only matter when you run multiple outlets
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16
        }}>
          {[
            { icon: '🏢', title: 'HQ Dashboard', desc: 'See all outlets in one view — revenue, orders, staff performance, inventory levels across every location in real-time.' },
            { icon: '🍽️', title: 'Central Menu Management', desc: 'Update prices, add items, change categories once — push to all outlets instantly. Per-outlet overrides supported.' },
            { icon: '👨‍🍳', title: 'Central Kitchen & Production', desc: 'Manage production planning, batch cooking, and distribution from a central kitchen to all outlets.' },
            { icon: '📦', title: 'Warehouse & Transfers', desc: 'Track warehouse inventory, create purchase orders, and manage inter-branch stock transfers with full audit trail.' },
            { icon: '📊', title: 'Consolidated Analytics', desc: 'Cross-outlet comparison reports, best/worst performing outlets, peak hour analysis, and AI-powered insights.' },
            { icon: '👥', title: 'Staff & Access Control', desc: 'Centralized staff management with role-based permissions. Managers see their outlet, owners see everything.' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '24px', background: '#fff', borderRadius: 16,
              border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{
        maxWidth: 800, margin: '56px auto', padding: '0 20px'
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 32 }}>
          Frequently Asked Questions
        </h2>

        {[
          { q: 'Can I start with 3 outlets and add more later?', a: 'Yes. Start with any plan and add extra outlets anytime at ₹1,199-1,399/outlet/month. No migration needed — your HQ dashboard scales automatically.' },
          { q: 'Is there a setup or onboarding fee?', a: 'No setup fees for Chain 3 and Chain 5. Chain 10+ includes free on-site training. We also offer free data migration from Petpooja, POSist, or any other POS.' },
          { q: 'Do you charge transaction fees on online orders?', a: 'Never. Zero transaction fees on all plans, forever. Your online ordering revenue is 100% yours. Payment gateway charges (Razorpay/Paytm) apply separately at their standard rates.' },
          { q: 'What if I need a feature that\'s not listed?', a: 'Chain 10+ plans include custom integrations. For Chain 3/5, we can build custom features as a one-time project. Most requests are already on our roadmap.' },
          { q: 'Is there an annual lock-in contract?', a: 'No lock-in on any plan. Pay monthly and cancel anytime. Annual billing is optional and saves 17%. We earn your business every month.' },
          { q: 'How does migration from Petpooja/POSist work?', a: 'We handle it for free. Our team exports your menu, customer data, and settings, and sets up everything in DineOpen. Typical migration takes 2-3 days with zero downtime.' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '18px 0', borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none'
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{item.q}</h4>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{item.a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '56px 24px', textAlign: 'center', color: '#fff'
      }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 12px' }}>
          Ready to scale your restaurant chain?
        </h2>
        <p style={{ fontSize: 16, opacity: 0.8, maxWidth: 500, margin: '0 auto 28px' }}>
          Start your 14-day free trial or talk to our enterprise team.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="https://www.dineopen.com/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 12, background: '#fff', color: '#1e1b4b',
            fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            Start Free Trial
          </a>
          <a href="https://wa.me/919004459951?text=Hi%2C%20I%27m%20interested%20in%20DineOpen%20Enterprise%20plans" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff',
            fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Talk to Sales
          </a>
        </div>
        <p style={{ fontSize: 12, opacity: 0.5, marginTop: 20 }}>
          No credit card required. No annual lock-in. Cancel anytime.
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 24px', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
        DineOpen Technologies Pvt. Ltd. — Enterprise Pricing valid as of May 2026. Prices exclusive of GST.
      </div>
    </div>
  );
}
