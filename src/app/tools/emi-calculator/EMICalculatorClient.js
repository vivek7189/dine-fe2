'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function EMICalculatorClient() {
  const [loanAmount, setLoanAmount] = useState('2000000');
  const [interestRate, setInterestRate] = useState('14');
  const [tenure, setTenure] = useState('36');
  const [loanType, setLoanType] = useState('term');

  const loanTypes = {
    term: { name: 'Term Loan', rateRange: '12-18%', typical: 14 },
    mudra: { name: 'MUDRA Loan', rateRange: '8-12%', typical: 10 },
    msme: { name: 'MSME Loan', rateRange: '10-15%', typical: 12 },
    equipment: { name: 'Equipment Finance', rateRange: '12-16%', typical: 13 },
  };

  const calculateEMI = () => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const months = parseInt(tenure) || 0;

    if (P <= 0 || months <= 0) return null;

    const r = annualRate / 12 / 100; // Monthly interest rate

    let emi;
    if (r === 0) {
      emi = P / months;
    } else {
      emi = P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    // Amortization for first year
    let balance = P;
    let yearlyBreakdown = [];
    for (let year = 1; year <= Math.min(5, Math.ceil(months / 12)); year++) {
      let yearInterest = 0;
      let yearPrincipal = 0;
      for (let m = 0; m < 12 && (year - 1) * 12 + m < months; m++) {
        const interestPart = balance * r;
        const principalPart = emi - interestPart;
        yearInterest += interestPart;
        yearPrincipal += principalPart;
        balance -= principalPart;
      }
      yearlyBreakdown.push({ year, interest: yearInterest, principal: yearPrincipal, balance: Math.max(0, balance) });
    }

    // Revenue needed to afford loan
    const revenueNeeded = emi / 0.10; // EMI should be max 10% of revenue

    return {
      emi,
      totalPayment,
      totalInterest,
      principal: P,
      months,
      yearlyBreakdown,
      revenueNeeded,
      dailyRevenueNeeded: revenueNeeded / 30,
    };
  };

  const result = calculateEMI();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Loan EMI Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Plan your business loan and calculate monthly EMI payments
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Loan Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Loan Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {Object.entries(loanTypes).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => { setLoanType(key); setInterestRate(val.typical.toString()); }}
                        style={{
                          padding: '10px',
                          backgroundColor: loanType === key ? '#1e40af' : '#f3f4f6',
                          color: loanType === key ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        <div>{val.name}</div>
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>{val.rateRange}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Loan Amount: ₹{(parseInt(loanAmount) / 100000).toFixed(1)}L
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                    <span>₹1L</span>
                    <span>₹1Cr</span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Interest Rate: {interestRate}% p.a.
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                    <span>8%</span>
                    <span>24%</span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Loan Tenure: {tenure} months ({(parseInt(tenure) / 12).toFixed(1)} years)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="84"
                    step="6"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                    <span>1 Year</span>
                    <span>7 Years</span>
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
                  <strong>Tip:</strong> Keep EMI below 10% of monthly revenue for healthy cash flow.
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>EMI Calculation</h3>

                {result ? (
                  <>
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Monthly EMI</p>
                      <p style={{ fontSize: '42px', fontWeight: '800' }}>₹{Math.round(result.emi).toLocaleString()}</p>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>for {result.months} months</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Principal Amount</span>
                        <span style={{ fontWeight: '600' }}>₹{result.principal.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Interest</span>
                        <span style={{ fontWeight: '600', color: '#dc2626' }}>₹{Math.round(result.totalInterest).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                        <span style={{ fontWeight: '700' }}>Total Payment</span>
                        <span style={{ fontWeight: '700', fontSize: '18px' }}>₹{Math.round(result.totalPayment).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Pie chart visual */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Payment Split</p>
                      <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ width: `${(result.principal / result.totalPayment) * 100}%`, backgroundColor: '#1e40af' }}></div>
                        <div style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%`, backgroundColor: '#dc2626' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#1e40af' }}>■ Principal ({((result.principal / result.totalPayment) * 100).toFixed(0)}%)</span>
                        <span style={{ color: '#dc2626' }}>■ Interest ({((result.totalInterest / result.totalPayment) * 100).toFixed(0)}%)</span>
                      </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#fef9c3', borderRadius: '8px', fontSize: '13px', color: '#854d0e' }}>
                      <strong>Revenue Required:</strong> ₹{(result.revenueNeeded / 100000).toFixed(1)}L/month
                      <br />
                      <span style={{ fontSize: '12px' }}>(₹{Math.round(result.dailyRevenueNeeded).toLocaleString()}/day to keep EMI at 10% of revenue)</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Adjust loan parameters to calculate EMI</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#1e40af', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Planning to Open a Restaurant?</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Read our complete startup guide with investment breakdown and timelines.</p>
            <Link href="/resources/startup-guide" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#1e40af', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Read Startup Guide
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
