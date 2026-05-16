'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
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
  }, [ingredients, portions, sellingPrice, targetFoodCost]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (percent <= 28) return { color: '#22c55e', status: 'Excellent', message: 'Your food cost is well optimized!' };
    if (percent <= 32) return { color: '#f59e0b', status: 'Good — Industry Standard', message: 'Your food cost is within industry standard range.' };
    if (percent <= 38) return { color: '#f97316', status: 'High — Optimize', message: 'Consider optimizing ingredient costs or adjusting pricing.' };
    return { color: '#ef4444', status: 'Too High — Needs Attention', message: 'Your food cost needs immediate attention. Review ingredients and pricing.' };
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
      q: 'What is a good food cost percentage for a restaurant?',
      a: 'Most restaurants aim for 28-35%. QSR targets 25-30%, casual dining 28-32%, fine dining 30-35%. Below 25% may indicate quality concerns. Above 38% needs immediate attention — check ingredient costs, portion sizes, and supplier pricing.'
    },
    {
      q: 'How do you calculate food cost percentage?',
      a: 'Food Cost % = (Total Ingredient Cost per Portion \u00f7 Selling Price) \u00d7 100. For a recipe with \u20b9120 ingredient cost making 4 portions, cost per portion is \u20b930. If selling at \u20b9100, food cost is 30%.'
    },
    {
      q: 'What\u2019s the difference between food cost and food cost percentage?',
      a: 'Food cost is the absolute rupee value of ingredients (\u20b980). Food cost percentage is that amount relative to selling price (\u20b980/\u20b9250 = 32%). Percentage is more useful for comparison and benchmarking across dishes.'
    },
    {
      q: 'How often should I calculate food cost?',
      a: 'Calculate food cost for every new menu item and review monthly. Ingredient prices fluctuate — especially vegetables and dairy. Use software like DineOpen to track food costs automatically with every sale.'
    },
    {
      q: 'What causes food cost to be too high?',
      a: 'Common causes: over-portioning, ingredient waste, theft/pilferage, not tracking inventory, not updating prices when ingredients get costlier, and buying from a single supplier without comparing prices.'
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
              Free Tool — No Login Required
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '30px' : '44px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '16px',
            lineHeight: '1.15'
          }}>
            Food Cost Calculator
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Calculate food cost percentage, profit margins, and ideal selling price for every dish on your menu. Add ingredients, set portions, and get instant results.
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
                <FaRupeeSign color="#16a34a" /> Recipe Details
              </h2>

              {/* Dish Name & Target Food Cost */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={labelStyle}>Dish Name (optional)</label>
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
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Ingredient</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Purchase Cost ({'\u20b9'})</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Purchase Qty</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Unit</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>Qty Used</th>
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
                  <FaPlus size={11} /> Add Ingredient
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
                  <label style={labelStyle}>Number of Portions</label>
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
                  <FaCalculator size={14} /> Calculate
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
                  Reset
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
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Cost Per Portion</div>
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
                      <div style={{ fontSize: '10px', color: '#a16207' }}>at {targetFoodCost}% food cost</div>
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
                        <div style={{ fontSize: '14px', color: '#9ca3af' }}>Enter selling price</div>
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
                  <p style={{ fontSize: '14px' }}>Add ingredients to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* H2: What is Food Cost Percentage? */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              What is Food Cost Percentage?
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Food cost percentage is the ratio of ingredient costs to the menu selling price, expressed as a percentage. It is the single most important metric for restaurant profitability because it directly measures how much of every rupee earned goes toward ingredients versus profit.
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
              For example, if a dish costs {'\u20b9'}80 to make and sells for {'\u20b9'}250, the food cost percentage is 32%. Most successful restaurants in India keep their food cost between 28-35%, depending on the type of restaurant and the segment they serve.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              Tracking this metric consistently helps you price your menu correctly, identify dishes that are losing money, and maintain healthy profit margins across your entire menu. Without knowing your food cost percentage, you are essentially guessing whether your restaurant is making money on each dish.
            </p>
          </div>

          {/* H2: Ideal Food Cost Percentage by Restaurant Type */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Ideal Food Cost Percentage by Restaurant Type
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' }}>
              Different restaurant formats have different ideal food cost targets. The table below shows industry benchmarks that you can use to evaluate your own food cost performance.
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
                    ['Quick Service (QSR)', '25-30%', 'High volume, lower prices'],
                    ['Casual Dining', '28-32%', 'Balanced approach'],
                    ['Fine Dining', '30-35%', 'Premium ingredients, higher prices'],
                    ['Cloud Kitchen', '25-28%', 'No dine-in costs'],
                    ['Bakery & Cafe', '20-25%', 'High-margin beverages'],
                    ['Bar & Pub', '20-25% (food), 18-22% (drinks)', 'Beverages are profit centers'],
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
              Use these benchmarks as a starting point. Your actual target should account for your rent, labor costs, and desired profit margin.
            </p>
          </div>

          {/* H2: How to Calculate Food Cost — Step by Step */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              How to Calculate Food Cost — Step by Step
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              Follow these five steps to calculate the food cost for any dish on your menu. This process is exactly what our calculator above automates for you.
            </p>
            <div style={{ marginBottom: '20px' }}>
              {[
                { step: 1, title: 'List all ingredients used in the recipe', desc: 'Write down every ingredient that goes into the dish, including oil, spices, and garnishes. Missing even small items can add up to 5-10% error in your food cost calculation.' },
                { step: 2, title: 'Record the purchase cost and quantity for each ingredient', desc: 'Note the price you paid and the quantity you bought. For example, paneer at \u20b9320 per kg, butter at \u20b9520 per kg. Always use the most recent purchase price for accuracy.' },
                { step: 3, title: 'Calculate the cost of the quantity actually used', desc: 'If you bought 1 kg of paneer for \u20b9320 but only used 250g, the cost for that ingredient is \u20b980. Divide the purchase cost by purchase quantity, then multiply by the quantity used.' },
                { step: 4, title: 'Sum all ingredient costs to get total recipe cost', desc: 'Add up the individual ingredient costs. This gives you the total raw material cost for the entire recipe batch.' },
                { step: 5, title: 'Divide by portions, then calculate food cost percentage', desc: 'Divide total recipe cost by the number of portions to get cost per portion. Then divide by selling price and multiply by 100 to get food cost percentage.' },
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

          {/* H2: 5 Ways to Reduce Your Food Cost */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              5 Ways to Reduce Your Food Cost
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' }}>
              If your food cost percentage is higher than your target, here are five proven strategies to bring it down without sacrificing quality.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>1. Track inventory religiously</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    Use a proper <Link href="/products/inventory" style={{ color: '#16a34a', textDecoration: 'underline' }}>inventory management system</Link> to track every ingredient that comes in and goes out. Without tracking, you cannot identify waste, theft, or over-ordering. Even a 5% reduction in waste can save lakhs annually.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>2. Standardize recipes and portions</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    Create standard recipe cards with exact measurements for every dish. Train your kitchen staff to follow them. Consistent output means predictable costs. A cook who adds an extra 50g of paneer per dish can cost you thousands per month.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>3. Negotiate with multiple suppliers</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    Never rely on a single supplier. Get quotes from 2-3 vendors for every major ingredient. Even a 5-10% better price on paneer, oil, or chicken can significantly lower your overall food cost percentage.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>4. Use seasonal ingredients</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    Seasonal produce is 30-50% cheaper than off-season alternatives. Design your menu to feature seasonal vegetables and fruits. This also improves the taste and freshness of your dishes, which customers notice and appreciate.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <FaLightbulb size={18} color="#f59e0b" style={{ marginTop: '3px', minWidth: '18px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>5. Analyze your menu with menu engineering</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                    Use <Link href="/tools/menu-engineering" style={{ color: '#16a34a', textDecoration: 'underline' }}>menu engineering techniques</Link> to identify which dishes are profitable and popular, and which are dragging down your margins. Remove or re-price dishes that have high food costs and low sales.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* H2: Food Cost vs Food Cost Percentage */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Food Cost vs Food Cost Percentage — What{'\u2019'}s the Difference?
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Food cost is the actual rupee amount you spend on ingredients for a dish. For example, if the ingredients for a paneer butter masala cost {'\u20b9'}80, that is your food cost. It is an absolute number.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              Food cost percentage, on the other hand, is a relative metric. It tells you what percentage of the selling price goes toward ingredients. If you sell that dish for {'\u20b9'}250, your food cost percentage is ({'\u20b9'}80 / {'\u20b9'}250) {'\u00d7'} 100 = 32%.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '12px' }}>
              The percentage is far more useful than the absolute number because it lets you compare across dishes regardless of price point, track trends over time, and benchmark against industry standards. A {'\u20b9'}500 ingredient cost sounds high, but it is fine for a {'\u20b9'}2000 dish (25% food cost) and terrible for a {'\u20b9'}600 dish (83% food cost).
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              Always use food cost percentage rather than absolute food cost when making pricing and menu decisions. This is the metric that lets you see the full picture and make informed business choices.
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
            Frequently Asked Questions
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
            Want to Track Food Costs Automatically?
          </h3>
          <p style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            DineOpen tracks your inventory, calculates food costs per dish automatically with every sale, and alerts you when costs rise above your target.
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
            Get Started with DineOpen <FaArrowRight size={14} />
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

      <InternalLinks currentPath="/tools/food-cost-calculator" variant="tool" />
      <Footer />
    </div>
  );
}
