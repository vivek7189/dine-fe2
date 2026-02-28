'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { FaCalculator, FaRupeeSign, FaPercent, FaChartPie, FaLightbulb, FaArrowRight } from 'react-icons/fa';

export default function FoodCostCalculatorClient() {
  const [isMobile, setIsMobile] = useState(false);

  // Calculator inputs
  const [ingredientCost, setIngredientCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [portionSize, setPortionSize] = useState('1');

  // Results
  const [foodCostPercent, setFoodCostPercent] = useState(null);
  const [grossProfit, setGrossProfit] = useState(null);
  const [profitMargin, setProfitMargin] = useState(null);
  const [idealPrice, setIdealPrice] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateFoodCost = () => {
    const cost = parseFloat(ingredientCost) || 0;
    const price = parseFloat(sellingPrice) || 0;
    const portions = parseFloat(portionSize) || 1;

    if (cost > 0 && price > 0) {
      const costPerPortion = cost / portions;
      const foodCost = (costPerPortion / price) * 100;
      const profit = price - costPerPortion;
      const margin = (profit / price) * 100;
      const ideal = costPerPortion / 0.30; // 30% food cost target

      setFoodCostPercent(foodCost.toFixed(1));
      setGrossProfit(profit.toFixed(2));
      setProfitMargin(margin.toFixed(1));
      setIdealPrice(ideal.toFixed(2));
    }
  };

  const resetCalculator = () => {
    setIngredientCost('');
    setSellingPrice('');
    setPortionSize('1');
    setFoodCostPercent(null);
    setGrossProfit(null);
    setProfitMargin(null);
    setIdealPrice(null);
  };

  const getFoodCostStatus = () => {
    if (!foodCostPercent) return null;
    const percent = parseFloat(foodCostPercent);
    if (percent <= 28) return { color: '#22c55e', status: 'Excellent', message: 'Your food cost is well optimized!' };
    if (percent <= 32) return { color: '#f59e0b', status: 'Good', message: 'Your food cost is within industry standard.' };
    if (percent <= 38) return { color: '#f97316', status: 'High', message: 'Consider optimizing ingredient costs or pricing.' };
    return { color: '#ef4444', status: 'Too High', message: 'Your food cost needs immediate attention.' };
  };

  const status = getFoodCostStatus();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)',
        padding: isMobile ? '40px 20px' : '60px 32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#dcfce7',
            borderRadius: '20px',
            marginBottom: '20px',
            border: '1px solid #bbf7d0'
          }}>
            <FaCalculator size={16} color="#16a34a" />
            <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
              Free Tool - No Login Required
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Food Cost Calculator
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Calculate your food cost percentage, profit margins, and find the ideal selling price for your dishes.
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
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e5e7eb'
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
                <FaRupeeSign color="#16a34a" /> Enter Your Numbers
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Total Ingredient Cost (Rs)
                </label>
                <input
                  type="number"
                  value={ingredientCost}
                  onChange={(e) => setIngredientCost(e.target.value)}
                  placeholder="e.g., 150"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Total cost of all ingredients for this dish
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
                  Selling Price per Portion (Rs)
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="e.g., 350"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Price you charge customers for one portion
                </span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Number of Portions from Ingredients
                </label>
                <input
                  type="number"
                  value={portionSize}
                  onChange={(e) => setPortionSize(e.target.value)}
                  placeholder="e.g., 1"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  How many servings you get from these ingredients
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={calculateFoodCost}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
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
              backgroundColor: foodCostPercent ? '#f0fdf4' : '#f9fafb',
              borderRadius: '16px',
              padding: '28px',
              border: `1px solid ${foodCostPercent ? '#bbf7d0' : '#e5e7eb'}`
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
                <FaChartPie color="#16a34a" /> Results
              </h2>

              {foodCostPercent ? (
                <div>
                  {/* Food Cost Percentage */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    border: `2px solid ${status?.color || '#e5e7eb'}`
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                      Food Cost Percentage
                    </div>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: '800',
                      color: status?.color || '#111827'
                    }}>
                      {foodCostPercent}%
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: `${status?.color}20`,
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: status?.color,
                      marginTop: '8px'
                    }}>
                      {status?.status}
                    </div>
                  </div>

                  {/* Other Metrics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Gross Profit
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                        Rs {grossProfit}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Profit Margin
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                        {profitMargin}%
                      </div>
                    </div>
                  </div>

                  {/* Ideal Price Suggestion */}
                  <div style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <FaLightbulb size={20} color="#f59e0b" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                        Suggested Price (30% Food Cost)
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>
                        Rs {idealPrice}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a16207', marginTop: '4px' }}>
                        {status?.message}
                      </div>
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
                  <p>Enter your numbers and click Calculate to see results</p>
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
            Understanding Food Cost Percentage
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#16a34a'
              }}>
                28%
              </div>
              <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '4px' }}>Excellent</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Well optimized pricing</div>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#f59e0b'
              }}>
                32%
              </div>
              <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>Industry Standard</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Average for restaurants</div>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#ef4444'
              }}>
                38%+
              </div>
              <div style={{ fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>Too High</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Needs optimization</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
              Formula Used
            </h3>
            <code style={{
              display: 'block',
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151'
            }}>
              Food Cost % = (Ingredient Cost / Selling Price) x 100
            </code>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: '#f0fdf4',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
            Want to Track Food Costs Automatically?
          </h3>
          <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '20px' }}>
            DineOpen tracks your inventory, calculates food costs per dish, and alerts you when costs rise.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '15px'
            }}
          >
            Try DineOpen Free <FaArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Related Tools */}
      <section style={{ padding: isMobile ? '20px' : '40px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '16px' }}>
            More Free Tools
          </h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tools/menu-price-calculator" style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
              border: '1px solid #e5e7eb'
            }}>
              Menu Price Calculator
            </Link>
            <Link href="/tools/gst-calculator" style={{
              padding: '10px 20px',
              backgroundColor: 'white',
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

      <InternalLinks currentPath="/tools/food-cost-calculator" variant="tool" />
      <Footer />
    </div>
  );
}
