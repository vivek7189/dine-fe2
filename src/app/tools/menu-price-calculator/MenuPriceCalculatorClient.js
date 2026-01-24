'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCalculator, FaRupeeSign, FaUtensils, FaChartLine, FaArrowRight, FaInfoCircle } from 'react-icons/fa';

export default function MenuPriceCalculatorClient() {
  const [isMobile, setIsMobile] = useState(false);

  // Calculator inputs
  const [ingredientCost, setIngredientCost] = useState('');
  const [targetFoodCost, setTargetFoodCost] = useState('30');
  const [laborPercent, setLaborPercent] = useState('25');
  const [overheadPercent, setOverheadPercent] = useState('15');
  const [targetProfit, setTargetProfit] = useState('15');

  // Results
  const [minimumPrice, setMinimumPrice] = useState(null);
  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculatePrice = () => {
    const cost = parseFloat(ingredientCost) || 0;
    const foodCostTarget = parseFloat(targetFoodCost) || 30;
    const labor = parseFloat(laborPercent) || 25;
    const overhead = parseFloat(overheadPercent) || 15;
    const profit = parseFloat(targetProfit) || 15;

    if (cost > 0) {
      // Method 1: Based on food cost percentage
      const priceFromFoodCost = cost / (foodCostTarget / 100);

      // Method 2: Factor-based pricing (industry standard 3x-4x)
      const factorPrice = cost * 3.3;

      // Method 3: Full cost-plus pricing
      const totalCostPercent = foodCostTarget + labor + overhead;
      const priceWithProfit = cost / ((foodCostTarget - profit) / 100);

      // Calculate breakdown for recommended price
      const recPrice = Math.round(priceFromFoodCost);
      const foodCostAmount = cost;
      const laborAmount = recPrice * (labor / 100);
      const overheadAmount = recPrice * (overhead / 100);
      const profitAmount = recPrice - foodCostAmount - laborAmount - overheadAmount;

      setMinimumPrice(Math.round(cost * 2.5));
      setRecommendedPrice(Math.round(priceFromFoodCost));
      setPremiumPrice(Math.round(priceFromFoodCost * 1.25));
      setBreakdown({
        food: foodCostAmount.toFixed(0),
        labor: laborAmount.toFixed(0),
        overhead: overheadAmount.toFixed(0),
        profit: profitAmount.toFixed(0),
        total: recPrice
      });
    }
  };

  const resetCalculator = () => {
    setIngredientCost('');
    setTargetFoodCost('30');
    setLaborPercent('25');
    setOverheadPercent('15');
    setTargetProfit('15');
    setMinimumPrice(null);
    setRecommendedPrice(null);
    setPremiumPrice(null);
    setBreakdown(null);
  };

  // Round to nearest 5 or 9
  const roundToMenu = (price) => {
    const base = Math.floor(price / 10) * 10;
    return base + 9; // e.g., 349, 259, etc.
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #fef3c7 0%, #ffffff 100%)',
        padding: isMobile ? '40px 20px' : '60px 32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#fef3c7',
            borderRadius: '20px',
            marginBottom: '20px',
            border: '1px solid #fde68a'
          }}>
            <FaUtensils size={16} color="#f59e0b" />
            <span style={{ fontSize: '14px', color: '#b45309', fontWeight: '600' }}>
              Free Tool - No Login Required
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Menu Price Calculator
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find the ideal selling price for your dishes. Enter ingredient costs and get pricing recommendations.
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
              backgroundColor: '#fffbeb',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #fde68a'
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
                <FaRupeeSign color="#f59e0b" /> Dish Information
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Ingredient Cost per Portion (Rs) *
                </label>
                <input
                  type="number"
                  value={ingredientCost}
                  onChange={(e) => setIngredientCost(e.target.value)}
                  placeholder="e.g., 80"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Target Food Cost %
                  <FaInfoCircle size={12} color="#9ca3af" title="Industry standard is 28-32%" />
                </label>
                <input
                  type="number"
                  value={targetFoodCost}
                  onChange={(e) => setTargetFoodCost(e.target.value)}
                  placeholder="30"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Industry standard: 28-32%
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Labor Cost %
                  </label>
                  <input
                    type="number"
                    value={laborPercent}
                    onChange={(e) => setLaborPercent(e.target.value)}
                    placeholder="25"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '15px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Overhead %
                  </label>
                  <input
                    type="number"
                    value={overheadPercent}
                    onChange={(e) => setOverheadPercent(e.target.value)}
                    placeholder="15"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '15px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={calculatePrice}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Calculate Price
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
              backgroundColor: recommendedPrice ? '#fef3c7' : '#f9fafb',
              borderRadius: '16px',
              padding: '28px',
              border: `1px solid ${recommendedPrice ? '#fde68a' : '#e5e7eb'}`
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
                <FaChartLine color="#f59e0b" /> Pricing Suggestions
              </h2>

              {recommendedPrice ? (
                <div>
                  {/* Pricing Tiers */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        Budget Price
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#6b7280' }}>
                        Rs {minimumPrice}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Menu: Rs {roundToMenu(minimumPrice)}
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '12px',
                      border: '2px solid #f59e0b'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#b45309',
                        marginBottom: '8px'
                      }}>
                        RECOMMENDED
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        Standard Price
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b' }}>
                        Rs {recommendedPrice}
                      </div>
                      <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                        Menu: Rs {roundToMenu(recommendedPrice)}
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        Premium Price
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>
                        Rs {premiumPrice}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Menu: Rs {roundToMenu(premiumPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  {breakdown && (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                        Cost Breakdown (at Rs {breakdown.total})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#6b7280' }}>Food Cost</span>
                          <span style={{ fontWeight: '600' }}>Rs {breakdown.food}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#6b7280' }}>Labor</span>
                          <span style={{ fontWeight: '600' }}>Rs {breakdown.labor}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#6b7280' }}>Overhead</span>
                          <span style={{ fontWeight: '600' }}>Rs {breakdown.overhead}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          paddingTop: '8px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <span style={{ color: '#16a34a', fontWeight: '600' }}>Profit</span>
                          <span style={{ fontWeight: '700', color: '#16a34a' }}>Rs {breakdown.profit}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9ca3af'
                }}>
                  <FaCalculator size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Enter ingredient cost to get pricing suggestions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Menu Pricing Tips
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
          }}>
            {[
              { title: 'Psychological Pricing', desc: 'Use prices ending in 9 (Rs 249, Rs 349) - they feel cheaper.' },
              { title: 'Bundle Deals', desc: 'Create combos that increase average order value while giving perceived savings.' },
              { title: 'Anchor Pricing', desc: 'Place a premium item first to make other items seem reasonable.' },
              { title: 'Review Regularly', desc: 'Update prices quarterly based on ingredient cost changes.' },
            ].map((tip, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                  {tip.title}
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {tip.desc}
                </p>
              </div>
            ))}
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
            <Link href="/tools/gst-calculator" style={{
              padding: '10px 20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
              border: '1px solid #e5e7eb'
            }}>
              GST Calculator
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
