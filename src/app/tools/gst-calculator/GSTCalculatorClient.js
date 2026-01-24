'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCalculator, FaRupeeSign, FaPercent, FaReceipt, FaArrowRight, FaExchangeAlt } from 'react-icons/fa';

export default function GSTCalculatorClient() {
  const [isMobile, setIsMobile] = useState(false);

  // Calculator mode
  const [mode, setMode] = useState('exclusive'); // 'exclusive' or 'inclusive'

  // Inputs
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('5');
  const [isInterstate, setIsInterstate] = useState(false);

  // Results
  const [results, setResults] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateGST = () => {
    const baseAmount = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 5;

    if (baseAmount > 0) {
      let netAmount, gstAmount, totalAmount;

      if (mode === 'exclusive') {
        // GST is added on top
        netAmount = baseAmount;
        gstAmount = baseAmount * (rate / 100);
        totalAmount = baseAmount + gstAmount;
      } else {
        // GST is included in amount
        totalAmount = baseAmount;
        netAmount = baseAmount / (1 + rate / 100);
        gstAmount = totalAmount - netAmount;
      }

      const cgst = isInterstate ? 0 : gstAmount / 2;
      const sgst = isInterstate ? 0 : gstAmount / 2;
      const igst = isInterstate ? gstAmount : 0;

      setResults({
        netAmount: netAmount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        rate: rate
      });
    }
  };

  const resetCalculator = () => {
    setAmount('');
    setGstRate('5');
    setIsInterstate(false);
    setResults(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #ede9fe 0%, #ffffff 100%)',
        padding: isMobile ? '40px 20px' : '60px 32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#ede9fe',
            borderRadius: '20px',
            marginBottom: '20px',
            border: '1px solid #ddd6fe'
          }}>
            <FaReceipt size={16} color="#7c3aed" />
            <span style={{ fontSize: '14px', color: '#6d28d9', fontWeight: '600' }}>
              Free Tool - No Login Required
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Restaurant GST Calculator
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Calculate GST on restaurant bills instantly. Supports 5% (non-AC) and 18% (AC) rates with CGST/SGST breakdown.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '32px'
          }}>
            {/* Input Section */}
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e9d5ff'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaCalculator color="#7c3aed" /> Calculate GST
              </h2>

              {/* Mode Toggle */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '10px'
                }}>
                  Calculation Mode
                </label>
                <div style={{
                  display: 'flex',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  padding: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={() => setMode('exclusive')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: mode === 'exclusive' ? '#7c3aed' : 'transparent',
                      color: mode === 'exclusive' ? 'white' : '#6b7280'
                    }}
                  >
                    Add GST
                  </button>
                  <button
                    onClick={() => setMode('inclusive')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: mode === 'inclusive' ? '#7c3aed' : 'transparent',
                      color: mode === 'inclusive' ? 'white' : '#6b7280'
                    }}
                  >
                    Extract GST
                  </button>
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginTop: '6px' }}>
                  {mode === 'exclusive' ? 'Enter amount before GST' : 'Enter amount including GST'}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {mode === 'exclusive' ? 'Amount (Before GST)' : 'Total Amount (With GST)'} (Rs)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 1000"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '18px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  GST Rate
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setGstRate('5')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '10px',
                      border: gstRate === '5' ? '2px solid #7c3aed' : '1px solid #d1d5db',
                      cursor: 'pointer',
                      backgroundColor: gstRate === '5' ? '#faf5ff' : 'white',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: '700', color: gstRate === '5' ? '#7c3aed' : '#374151' }}>
                      5%
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Non-AC / Takeaway</div>
                  </button>
                  <button
                    onClick={() => setGstRate('18')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '10px',
                      border: gstRate === '18' ? '2px solid #7c3aed' : '1px solid #d1d5db',
                      cursor: 'pointer',
                      backgroundColor: gstRate === '18' ? '#faf5ff' : 'white',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: '700', color: gstRate === '18' ? '#7c3aed' : '#374151' }}>
                      18%
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>AC Restaurant</div>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isInterstate}
                    onChange={(e) => setIsInterstate(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    Interstate (IGST instead of CGST+SGST)
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={calculateGST}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Calculate
                </button>
                <button
                  onClick={resetCalculator}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    background: 'white',
                    color: '#6b7280',
                    fontWeight: '600',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div style={{
              backgroundColor: results ? '#faf5ff' : '#f9fafb',
              borderRadius: '16px',
              padding: '28px',
              border: `1px solid ${results ? '#e9d5ff' : '#e5e7eb'}`
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaReceipt color="#7c3aed" /> Bill Breakdown
              </h2>

              {results ? (
                <div>
                  {/* Bill Preview */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'monospace'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      borderBottom: '1px dashed #d1d5db',
                      paddingBottom: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>GST @ {results.rate}%</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '15px'
                      }}>
                        <span style={{ color: '#6b7280' }}>Taxable Amount</span>
                        <span style={{ fontWeight: '600' }}>Rs {results.netAmount}</span>
                      </div>

                      {!isInterstate ? (
                        <>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '14px'
                          }}>
                            <span style={{ color: '#6b7280' }}>CGST @ {results.rate / 2}%</span>
                            <span>Rs {results.cgst}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '14px'
                          }}>
                            <span style={{ color: '#6b7280' }}>SGST @ {results.rate / 2}%</span>
                            <span>Rs {results.sgst}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px'
                        }}>
                          <span style={{ color: '#6b7280' }}>IGST @ {results.rate}%</span>
                          <span>Rs {results.igst}</span>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        color: '#7c3aed'
                      }}>
                        <span>Total GST</span>
                        <span style={{ fontWeight: '600' }}>Rs {results.gstAmount}</span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '18px',
                        paddingTop: '12px',
                        borderTop: '2px solid #111827',
                        marginTop: '8px'
                      }}>
                        <span style={{ fontWeight: '700' }}>Grand Total</span>
                        <span style={{ fontWeight: '800', color: '#7c3aed' }}>Rs {results.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#ede9fe',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '13px', color: '#6d28d9', marginBottom: '4px' }}>
                      {mode === 'exclusive' ? 'GST Added' : 'GST Extracted'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
                      Rs {results.gstAmount}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9ca3af'
                }}>
                  <FaPercent size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Enter amount and click Calculate to see GST breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            GST Rates for Restaurants in India
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#dcfce7',
                borderRadius: '6px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>5%</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                Non-AC Restaurants
              </h3>
              <ul style={{ fontSize: '14px', color: '#6b7280', paddingLeft: '16px', lineHeight: '1.8' }}>
                <li>Restaurants without air conditioning</li>
                <li>Takeaway and delivery orders</li>
                <li>Food trucks and kiosks</li>
                <li>Sweet shops and bakeries</li>
              </ul>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>18%</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                AC Restaurants
              </h3>
              <ul style={{ fontSize: '14px', color: '#6b7280', paddingLeft: '16px', lineHeight: '1.8' }}>
                <li>Air-conditioned restaurants</li>
                <li>Restaurants in hotels (room tariff &gt; Rs 7,500)</li>
                <li>Restaurants serving liquor</li>
                <li>Outdoor catering with ITC</li>
              </ul>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #fde68a'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>
              Important Note
            </h4>
            <p style={{ fontSize: '14px', color: '#a16207', lineHeight: '1.6' }}>
              Restaurants with turnover less than Rs 20 lakhs (Rs 10 lakhs for special category states)
              are exempt from GST registration. Composition scheme restaurants pay 5% GST with no input tax credit.
            </p>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section style={{ padding: isMobile ? '20px' : '40px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '16px' }}>
            More Free Tools
          </h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tools/food-cost-calculator" style={{
              padding: '10px 20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
              border: '1px solid #e5e7eb'
            }}>
              Food Cost Calculator
            </Link>
            <Link href="/tools/menu-price-calculator" style={{
              padding: '10px 20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
              border: '1px solid #e5e7eb'
            }}>
              Menu Price Calculator
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
