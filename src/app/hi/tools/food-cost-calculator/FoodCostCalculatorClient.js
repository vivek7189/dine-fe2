'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import InternalLinks from '../../../../components/InternalLinks';
import { FaCalculator, FaRupeeSign, FaPercent, FaChartPie, FaLightbulb, FaArrowRight, FaPlus, FaTrash } from 'react-icons/fa';

const defaultIngredients = [
  { name: 'Paneer', purchaseCost: 320, purchaseQty: 1, purchaseUnit: 'kg', usedQty: 250, usedUnit: 'g' },
  { name: 'Butter', purchaseCost: 520, purchaseQty: 1, purchaseUnit: 'kg', usedQty: 50, usedUnit: 'g' },
  { name: 'Cream', purchaseCost: 280, purchaseQty: 1, purchaseUnit: 'L', usedQty: 100, usedUnit: 'ml' },
  { name: 'Tomato', purchaseCost: 40, purchaseQty: 1, purchaseUnit: 'kg', usedQty: 300, usedUnit: 'g' },
  { name: 'Spices & Oil', purchaseCost: 200, purchaseQty: 1, purchaseUnit: 'kg', usedQty: 30, usedUnit: 'g' },
];

const unitOptions = ['g', 'kg', 'ml', 'L', 'pcs'];

function convertToBase(qty, unit) {
  const q = parseFloat(qty) || 0;
  if (unit === 'g') return { value: q / 1000, baseUnit: 'kg' };
  if (unit === 'ml') return { value: q / 1000, baseUnit: 'L' };
  if (unit === 'kg') return { value: q, baseUnit: 'kg' };
  if (unit === 'L') return { value: q, baseUnit: 'L' };
  return { value: q, baseUnit: 'pcs' };
}

export default function FoodCostCalculatorClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [dishName, setDishName] = useState('Paneer Butter Masala');
  const [targetFoodCost, setTargetFoodCost] = useState(30);
  const [ingredients, setIngredients] = useState(defaultIngredients.map(i => ({ ...i })));
  const [portions, setPortions] = useState(4);
  const [sellingPrice, setSellingPrice] = useState(320);
  const [openFaq, setOpenFaq] = useState(null);

  // Results
  const [results, setResults] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    calculateResults();
  }, [ingredients, portions, sellingPrice, targetFoodCost]);

  const calculateResults = () => {
    const ingredientCosts = ingredients.map(ing => {
      const purchaseBase = convertToBase(ing.purchaseQty, ing.purchaseUnit);
      const usedBase = convertToBase(ing.usedQty, ing.usedUnit);
      const cost = purchaseBase.value > 0 ? ((parseFloat(ing.purchaseCost) || 0) / purchaseBase.value) * usedBase.value : 0;
      return { name: ing.name, cost };
    });

    const totalRecipeCost = ingredientCosts.reduce((sum, i) => sum + i.cost, 0);
    const portionCount = parseFloat(portions) || 1;
    const costPerPortion = totalRecipeCost / portionCount;
    const price = parseFloat(sellingPrice) || 0;
    const target = parseFloat(targetFoodCost) || 30;
    const suggestedPrice = costPerPortion / (target / 100);

    let foodCostPercent = null;
    let grossProfit = null;
    let profitMargin = null;

    if (price > 0) {
      foodCostPercent = (costPerPortion / price) * 100;
      grossProfit = price - costPerPortion;
      profitMargin = (grossProfit / price) * 100;
    }

    const breakdown = ingredientCosts.map(i => ({
      name: i.name,
      cost: i.cost,
      percent: totalRecipeCost > 0 ? (i.cost / totalRecipeCost) * 100 : 0
    }));

    setResults({
      totalRecipeCost,
      costPerPortion,
      foodCostPercent,
      suggestedPrice,
      grossProfit,
      profitMargin,
      breakdown
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', purchaseCost: '', purchaseQty: '', purchaseUnit: 'g', usedQty: '', usedUnit: 'g' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const resetCalculator = () => {
    setDishName('Paneer Butter Masala');
    setTargetFoodCost(30);
    setIngredients(defaultIngredients.map(i => ({ ...i })));
    setPortions(4);
    setSellingPrice(320);
  };

  const getFoodCostStatus = (percent) => {
    if (percent === null || percent === undefined) return null;
    if (percent <= 28) return { color: '#22c55e', status: 'बहुत अच्छा', message: 'आपकी food cost काफी अच्छी optimized है!' };
    if (percent <= 32) return { color: '#f59e0b', status: 'ठीक है — Industry Standard', message: 'आपकी food cost industry standard range में है।' };
    if (percent <= 38) return { color: '#f97316', status: 'ज़्यादा — Optimize करें', message: 'Ingredient costs कम करने या pricing adjust करने पर विचार करें।' };
    return { color: '#ef4444', status: 'बहुत ज़्यादा — Attention चाहिए', message: 'आपकी food cost पर तुरंत ध्यान देने की ज़रूरत है। Ingredients और pricing review करें।' };
  };

  const status = results ? getFoodCostStatus(results.foodCostPercent) : null;

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  };

  const smallSelectStyle = {
    padding: '10px 6px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fff',
    width: '65px',
    boxSizing: 'border-box'
  };

  const faqs = [
    {
      q: 'Restaurant के लिए अच्छा food cost percentage कितना होना चाहिए?',
      a: 'ज़्यादातर restaurants के लिए 28-35% food cost percentage अच्छा माना जाता है। QSR के लिए 25-30%, casual dining के लिए 28-32%, fine dining के लिए 30-35%, और cloud kitchen के लिए 25-28% ideal है। 25% से कम होने पर quality concern हो सकता है। 38% से ज़्यादा होने पर तुरंत ingredient costs, portion sizes, और supplier pricing check करें।'
    },
    {
      q: 'Food cost percentage कैसे calculate करें?',
      a: 'Food Cost % = (Total Ingredient Cost per Portion \u00f7 Selling Price) \u00d7 100। उदाहरण: अगर एक recipe में \u20b9120 की ingredients लगती हैं और 4 portions बनते हैं, तो per portion cost \u20b930 है। अगर selling price \u20b9100 है, तो food cost 30% होगी।'
    },
    {
      q: 'Food cost और food cost percentage में क्या फर्क है?',
      a: 'Food cost वो actual rupee amount है जो ingredients पर खर्च होती है (जैसे \u20b980)। Food cost percentage उस amount का selling price से ratio है percentage में (\u20b980/\u20b9250 = 32%)। Percentage ज़्यादा useful है क्योंकि इससे अलग-अलग dishes की comparison और industry benchmarks से match किया जा सकता है।'
    },
    {
      q: 'Food cost कितनी बार calculate करनी चाहिए?',
      a: 'हर नई menu item के लिए food cost ज़रूर calculate करें और monthly review करें। India में vegetables, dairy, और poultry की prices बहुत fluctuate करती हैं। DineOpen जैसे software से हर sale के साथ automatically food cost track हो सकती है।'
    },
    {
      q: 'Food cost ज़्यादा क्यों होती है?',
      a: 'Common कारण: over-portioning, ingredient waste, theft/pilferage, inventory track न करना, ingredient prices बढ़ने पर menu price update न करना, और एक ही supplier से बिना compare किए buying करना। Standardized recipes और proper inventory management से 5-10% food cost कम हो सकती है।'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
        padding: isMobile ? '48px 20px' : '72px 32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {/* Language Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <Link href="/tools/food-cost-calculator" style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#9ca3af',
              backgroundColor: '#374151',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              English
            </Link>
            <span style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            }}>
              हिन्दी
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <FaCalculator size={14} color="#22c55e" />
            <span style={{ fontSize: '13px', color: '#d1d5db', fontWeight: '600' }}>
              Free Tool — Login ज़रूरी नहीं
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '30px' : '44px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '16px',
            lineHeight: '1.15'
          }}>
            रेस्टोरेंट फूड कॉस्ट <span style={{ color: '#ef4444' }}>कैलकुलेटर</span>
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            अपने menu की हर dish का food cost percentage, profit margin, और ideal selling price calculate करें। Ingredients डालें, portions set करें, और तुरंत results पाएं।
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section style={{ padding: isMobile ? '32px 16px' : '60px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
            gap: '28px',
            alignItems: 'start'
          }}>
            {/* LEFT: Inputs */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '28px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaRupeeSign color="#16a34a" /> अपने Numbers डालें
              </h2>

              {/* Dish Name & Target Food Cost */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={labelStyle}>Dish का नाम (optional)</label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g., Paneer Butter Masala"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Target Food Cost %</label>
                  <input
                    type="number"
                    value={targetFoodCost}
                    onChange={(e) => setTargetFoodCost(e.target.value)}
                    placeholder="30"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Ingredient Table */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>Ingredients</label>
                <div style={{
                  overflowX: isMobile ? 'auto' : 'visible',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: isMobile ? '600px' : 'auto',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Ingredient का नाम</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>खरीदी Price ({'\u20b9'})</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>खरीदी Qty</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Unit</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Recipe में Use</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Unit</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px', width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((ing, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6' }}>
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                              placeholder="Name"
                              style={{ ...inputStyle, padding: '8px 8px', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6' }}>
                            <input
                              type="number"
                              value={ing.purchaseCost}
                              onChange={(e) => updateIngredient(idx, 'purchaseCost', e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyle, padding: '8px 8px', fontSize: '13px', width: '80px' }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6' }}>
                            <input
                              type="number"
                              value={ing.purchaseQty}
                              onChange={(e) => updateIngredient(idx, 'purchaseQty', e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyle, padding: '8px 8px', fontSize: '13px', width: '70px' }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6' }}>
                            <select
                              value={ing.purchaseUnit}
                              onChange={(e) => updateIngredient(idx, 'purchaseUnit', e.target.value)}
                              style={smallSelectStyle}
                            >
                              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6' }}>
                            <input
                              type="number"
                              value={ing.usedQty}
                              onChange={(e) => updateIngredient(idx, 'usedQty', e.target.value)}
                              placeholder="0"
                              style={{ ...inputStyle, padding: '8px 8px', fontSize: '13px', width: '70px' }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6' }}>
                            <select
                              value={ing.usedUnit}
                              onChange={(e) => updateIngredient(idx, 'usedUnit', e.target.value)}
                              style={smallSelectStyle}
                            >
                              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '6px 4px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                            <button
                              onClick={() => removeIngredient(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: ingredients.length > 1 ? 'pointer' : 'not-allowed',
                                color: ingredients.length > 1 ? '#ef4444' : '#d1d5db',
                                padding: '4px',
                                fontSize: '14px'
                              }}
                              disabled={ingredients.length <= 1}
                            >
                              <FaTrash size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={addIngredient}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <FaPlus size={11} /> Ingredient जोड़ें
                </button>
              </div>

              {/* Portions & Selling Price */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={labelStyle}>कितने Portions</label>
                  <input
                    type="number"
                    value={portions}
                    onChange={(e) => setPortions(e.target.value)}
                    placeholder="1"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Selling Price ({'\u20b9'}) <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optional)</span></label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="e.g., 320"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={calculateResults}
                  style={{
                    flex: 1,
                    padding: '13px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FaCalculator size={14} /> Calculate करें
                </button>
                <button
                  onClick={resetCalculator}
                  style={{
                    padding: '13px 20px',
                    borderRadius: '10px',
                    background: 'white',
                    color: '#6b7280',
                    fontWeight: '600',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reset करें
                </button>
              </div>
            </div>

            {/* RIGHT: Results */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '28px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartPie color="#16a34a" /> Results {dishName && <span style={{ fontWeight: '400', fontSize: '14px', color: '#6b7280' }}>— {dishName}</span>}
              </h2>

              {results ? (
                <div>
                  {/* Food Cost % — Big Card */}
                  {results.foodCostPercent !== null && status && (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '14px',
                      border: `2px solid ${status.color}`,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Food Cost Percentage</div>
                      <div style={{ fontSize: '40px', fontWeight: '800', color: status.color }}>
                        {results.foodCostPercent.toFixed(1)}%
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 14px',
                        backgroundColor: `${status.color}18`,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: status.color,
                        marginTop: '6px'
                      }}>
                        {status.status}
                      </div>
                    </div>
                  )}

                  {/* Metric Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Total Recipe Cost</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{'\u20b9'}{results.totalRecipeCost.toFixed(2)}</div>
                    </div>
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Per Portion Cost</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{'\u20b9'}{results.costPerPortion.toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', color: '#92400e', marginBottom: '4px' }}>Suggested Price</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>{'\u20b9'}{results.suggestedPrice.toFixed(2)}</div>
                      <div style={{ fontSize: '10px', color: '#a16207' }}>{targetFoodCost}% food cost पर</div>
                    </div>
                    {results.grossProfit !== null ? (
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: '10px',
                        padding: '14px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>Gross Profit</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>{'\u20b9'}{results.grossProfit.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                        padding: '14px',
                        textAlign: 'center',
                        border: '1px solid #f3f4f6'
                      }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Gross Profit</div>
                        <div style={{ fontSize: '14px', color: '#9ca3af' }}>Selling price डालें</div>
                      </div>
                    )}
                  </div>

                  {results.profitMargin !== null && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                      marginBottom: '14px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>Profit Margin</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{results.profitMargin.toFixed(1)}%</div>
                    </div>
                  )}

                  {/* Ingredient Breakdown */}
                  {results.breakdown && results.breakdown.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Ingredient Breakdown</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Ingredient</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Cost ({'\u20b9'})</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.breakdown.map((item, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{item.name || '—'}</td>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', color: '#111827', fontWeight: '500' }}>{'\u20b9'}{item.cost.toFixed(2)}</td>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', color: '#6b7280' }}>{item.percent.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                  <FaPercent size={36} style={{ marginBottom: '16px', opacity: 0.4 }} />
                  <p style={{ fontSize: '14px' }}>Results देखने के लिए ingredients डालें</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* H2: Food Cost Percentage क्या है? */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Food Cost Percentage क्या है?
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Food cost percentage आपकी ingredient cost और menu selling price का ratio है, जो percentage में express किया जाता है। यह restaurant profitability के लिए सबसे important metric है क्योंकि यह directly बताता है कि कमाए गए हर rupee में से कितना ingredients पर खर्च हो रहा है और कितना profit है।
            </p>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '12px',
              fontFamily: 'monospace',
              fontSize: '15px',
              color: '#374151'
            }}>
              Food Cost % = (Ingredient Cost {'\u00f7'} Selling Price) {'\u00d7'} 100
            </div>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              उदाहरण: अगर एक dish बनाने में {'\u20b9'}80 लगते हैं और selling price {'\u20b9'}250 है, तो food cost percentage 32% होगा। India में ज़्यादातर successful restaurants अपनी food cost 28-35% के बीच रखते हैं, restaurant type और segment के हिसाब से।
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              इस metric को regularly track करने से आप अपने menu की pricing सही रख सकते हैं, पता लगा सकते हैं कि कौन सी dishes पर loss हो रहा है, और पूरे menu पर healthy profit margins maintain कर सकते हैं। Food cost percentage जाने बिना, आप basically guess कर रहे हैं कि आपका restaurant हर dish पर profit कमा रहा है या नहीं।
            </p>
          </div>

          {/* H2: Restaurant Type के अनुसार Ideal Food Cost */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Restaurant Type के अनुसार Ideal Food Cost
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' }}>
              अलग-अलग restaurant formats के लिए अलग ideal food cost targets होते हैं। नीचे दी गई table में industry benchmarks हैं जिनसे आप अपनी food cost performance evaluate कर सकते हैं।
            </p>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#ffffff', borderBottom: '2px solid #374151' }}>Restaurant Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#ffffff', borderBottom: '2px solid #374151' }}>Ideal Food Cost %</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#ffffff', borderBottom: '2px solid #374151' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Quick Service (QSR)', '25-30%', 'High volume, कम prices'],
                    ['Casual Dining', '28-32%', 'Balanced approach'],
                    ['Fine Dining', '30-35%', 'Premium ingredients, ज़्यादा prices'],
                    ['Cloud Kitchen', '25-28%', 'Dine-in cost नहीं'],
                    ['Bakery & Cafe', '20-25%', 'Beverages पर high margin'],
                    ['Bar & Pub', '20-25% (food), 18-22% (drinks)', 'Beverages profit centers हैं'],
                  ].map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '500', color: '#111827' }}>{row[0]}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '600', color: '#16a34a' }}>{row[1]}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7' }}>
              इन benchmarks को starting point की तरह use करें। आपका actual target आपके rent, labor costs, और desired profit margin पर depend करेगा।
            </p>
          </div>

          {/* H2: Food Cost Calculate कैसे करें — Step by Step */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Food Cost Calculate कैसे करें — Step by Step
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              अपने menu की किसी भी dish के लिए food cost calculate करने के लिए इन 5 steps को follow करें। ऊपर दिया गया calculator यही process automatically करता है।
            </p>
            <div style={{ marginBottom: '20px' }}>
              {[
                { step: 1, title: 'Recipe में use होने वाली सभी ingredients list करें', desc: 'Dish में लगने वाली हर ingredient लिख लें — oil, spices, और garnishes सहित। छोटी items miss करने से food cost calculation में 5-10% तक का error आ सकता है।' },
                { step: 2, title: 'हर ingredient की purchase cost और quantity note करें', desc: 'जो price pay किया और जितनी quantity खरीदी, दोनों लिखें। जैसे: Paneer \u20b9320 per kg, Butter \u20b9520 per kg। Accuracy के लिए हमेशा most recent purchase price use करें।' },
                { step: 3, title: 'Actually use हुई quantity की cost calculate करें', desc: 'अगर 1 kg Paneer \u20b9320 में खरीदा लेकिन सिर्फ 250g use किया, तो उस ingredient की cost \u20b980 होगी। Purchase cost को purchase quantity से divide करें, फिर used quantity से multiply करें।' },
                { step: 4, title: 'सभी ingredient costs जोड़कर total recipe cost निकालें', desc: 'सभी individual ingredient costs add करें। इससे आपको पूरी recipe batch की total raw material cost मिलेगी।' },
                { step: 5, title: 'Portions से divide करें, फिर food cost percentage calculate करें', desc: 'Total recipe cost को portions की संख्या से divide करके per portion cost निकालें। फिर selling price से divide करके 100 से multiply करें — यह आपका food cost percentage है।' },
              ].map((item) => (
                <div key={item.step} style={{
                  display: 'flex',
                  gap: '14px',
                  marginBottom: '16px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    marginTop: '2px'
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '10px',
              padding: '16px 20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.8'
            }}>
              Total Recipe Cost = Sum of all (Purchase Cost / Purchase Qty {'\u00d7'} Qty Used)<br />
              Cost Per Portion = Total Recipe Cost / Number of Portions<br />
              Food Cost % = (Cost Per Portion / Selling Price) {'\u00d7'} 100
            </div>
          </div>

          {/* H2: Food Cost कम करने के 5 तरीके */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Food Cost कम करने के 5 तरीके
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' }}>
              अगर आपकी food cost percentage target से ज़्यादा है, तो quality compromise किए बिना इसे कम करने के 5 proven तरीके यहां हैं।
            </p>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>1. Inventory religiously track करें</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    एक proper <Link href="/products/inventory" style={{ color: '#16a34a', textDecoration: 'underline' }}>inventory management system</Link> use करें ताकि हर ingredient जो आती है और जाती है, track हो। Tracking के बिना waste, theft, या over-ordering identify नहीं हो सकती। सिर्फ 5% waste कम होने से सालाना लाखों बच सकते हैं।
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>2. Recipes और portions standardize करें</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    हर dish के लिए exact measurements वाली standard recipe cards बनाएं। Kitchen staff को train करें कि वो उन्हें follow करें। Consistent output मतलब predictable costs। एक cook जो per dish 50g extra paneer डालता है, वो monthly हज़ारों का नुकसान कर सकता है।
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>3. Multiple suppliers से negotiate करें</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    कभी एक ही supplier पर depend न रहें। हर major ingredient के लिए 2-3 vendors से quotes लें। Paneer, oil, या chicken पर 5-10% better price भी आपकी overall food cost percentage significantly कम कर सकता है।
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>4. Seasonal ingredients use करें</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    Seasonal produce off-season alternatives से 30-50% सस्ती होती है। अपना menu ऐसे design करें जिसमें seasonal vegetables और fruits featured हों। इससे dishes का taste और freshness भी improve होता है, जो customers notice करते हैं।
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>5. Menu engineering से menu analyze करें</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    <Link href="/tools/menu-engineering" style={{ color: '#16a34a', textDecoration: 'underline' }}>Menu engineering techniques</Link> use करके पता लगाएं कि कौन सी dishes profitable और popular हैं, और कौन सी आपकी margins down कर रही हैं। High food cost और low sales वाली dishes को remove या re-price करें।
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* H2: Food Cost vs Food Cost Percentage — क्या फर्क है? */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Food Cost vs Food Cost Percentage — क्या फर्क है?
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Food cost वो actual rupee amount है जो आप किसी dish की ingredients पर खर्च करते हैं। जैसे, अगर paneer butter masala बनाने में {'\u20b9'}80 लगते हैं, तो वो आपकी food cost है। यह एक absolute number है।
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Food cost percentage दूसरी तरफ एक relative metric है। यह बताता है कि selling price का कितना percentage ingredients पर जा रहा है। अगर आप वो dish {'\u20b9'}250 में बेचते हैं, तो food cost percentage ({'\u20b9'}80 / {'\u20b9'}250) {'\u00d7'} 100 = 32% होगा।
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Percentage absolute number से कहीं ज़्यादा useful है क्योंकि इससे आप अलग-अलग price point वाली dishes की comparison कर सकते हैं, time के साथ trends track कर सकते हैं, और industry standards से benchmark कर सकते हैं। {'\u20b9'}500 की ingredient cost ज़्यादा लगती है, लेकिन {'\u20b9'}2000 की dish के लिए यह ठीक है (25% food cost) और {'\u20b9'}600 की dish के लिए बहुत ज़्यादा (83% food cost)।
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              Pricing और menu decisions लेते समय हमेशा food cost percentage use करें, absolute food cost नहीं। यही वो metric है जो आपको full picture दिखाता है और informed business choices लेने में मदद करता है।
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            अक्सर पूछे जाने वाले सवाल
          </h2>
          <div>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{
                marginBottom: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#111827'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{
                    fontSize: '18px',
                    color: '#9ca3af',
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {'\u25BC'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div style={{
                    padding: '0 20px 16px 20px',
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.7'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          borderRadius: '20px',
          padding: isMobile ? '32px 24px' : '48px 40px'
        }}>
          <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
            Food Costs Automatically Track करना चाहते हैं?
          </h3>
          <p style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            DineOpen आपकी inventory track करता है, हर sale के साथ automatically per dish food cost calculate करता है, और जब costs target से ऊपर जाएं तो alert देता है।
          </p>
          <Link
            href="/#pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '10px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '15px'
            }}
          >
            DineOpen शुरू करें <FaArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Related Tools */}
      <section style={{ padding: isMobile ? '20px' : '40px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '16px' }}>
            और Free Tools
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
            <Link href="/tools/recipe-cost-calculator" style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
              border: '1px solid #e5e7eb'
            }}>
              Recipe Cost Calculator
            </Link>
            <Link href="/tools/break-even-calculator" style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
              border: '1px solid #e5e7eb'
            }}>
              Break Even Calculator
            </Link>
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/hi/tools/food-cost-calculator" variant="tool" />
      <Footer />
    </div>
  );
}
