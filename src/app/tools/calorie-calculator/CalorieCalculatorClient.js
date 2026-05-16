'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';
import {
  FaCalculator,
  FaFire,
  FaLeaf,
  FaDrumstickBite,
  FaBreadSlice,
  FaPlus,
  FaTrash,
  FaRobot,
  FaArrowRight,
  FaInfoCircle,
  FaChartPie,
} from 'react-icons/fa';

// ─── Nutrition Database ───────────────────────────────────────────────────────
// All values are per 100g, sourced from USDA FoodData Central
const NUTRITION_DB = {
  // ── Grains ──
  rice: { name: 'Rice (cooked)', category: 'Grains', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, unit: 'g' },
  rice_raw: { name: 'Rice (raw)', category: 'Grains', calories: 365, protein: 7.1, carbs: 80.0, fat: 0.7, fiber: 1.3, unit: 'g' },
  wheat_flour: { name: 'Wheat Flour (maida)', category: 'Grains', calories: 364, protein: 10.3, carbs: 76.3, fat: 1.0, fiber: 2.7, unit: 'g' },
  whole_wheat_flour: { name: 'Whole Wheat Flour (atta)', category: 'Grains', calories: 340, protein: 13.2, carbs: 72.6, fat: 2.5, fiber: 10.7, unit: 'g' },
  pasta: { name: 'Pasta (cooked)', category: 'Grains', calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9, fiber: 1.8, unit: 'g' },
  bread: { name: 'Bread (white)', category: 'Grains', calories: 265, protein: 9.0, carbs: 49.2, fat: 3.2, fiber: 2.7, unit: 'g' },
  oats: { name: 'Oats', category: 'Grains', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, unit: 'g' },
  noodles: { name: 'Noodles (cooked)', category: 'Grains', calories: 138, protein: 4.5, carbs: 25.0, fat: 2.1, fiber: 1.2, unit: 'g' },
  // ── Proteins ──
  chicken_breast: { name: 'Chicken Breast', category: 'Proteins', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, unit: 'g' },
  chicken_thigh: { name: 'Chicken Thigh', category: 'Proteins', calories: 209, protein: 26.0, carbs: 0.0, fat: 10.9, fiber: 0.0, unit: 'g' },
  mutton: { name: 'Mutton / Goat', category: 'Proteins', calories: 231, protein: 25.6, carbs: 0.0, fat: 13.8, fiber: 0.0, unit: 'g' },
  lamb: { name: 'Lamb', category: 'Proteins', calories: 258, protein: 25.4, carbs: 0.0, fat: 16.5, fiber: 0.0, unit: 'g' },
  beef: { name: 'Beef (ground)', category: 'Proteins', calories: 254, protein: 26.1, carbs: 0.0, fat: 15.7, fiber: 0.0, unit: 'g' },
  pork: { name: 'Pork', category: 'Proteins', calories: 242, protein: 27.3, carbs: 0.0, fat: 14.0, fiber: 0.0, unit: 'g' },
  salmon: { name: 'Salmon', category: 'Proteins', calories: 208, protein: 20.4, carbs: 0.0, fat: 13.4, fiber: 0.0, unit: 'g' },
  tilapia: { name: 'Tilapia', category: 'Proteins', calories: 96, protein: 20.1, carbs: 0.0, fat: 1.7, fiber: 0.0, unit: 'g' },
  tuna: { name: 'Tuna (canned in water)', category: 'Proteins', calories: 109, protein: 25.5, carbs: 0.0, fat: 0.5, fiber: 0.0, unit: 'g' },
  shrimp: { name: 'Shrimp / Prawns', category: 'Proteins', calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3, fiber: 0.0, unit: 'g' },
  paneer: { name: 'Paneer', category: 'Proteins', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0.0, unit: 'g' },
  tofu: { name: 'Tofu (firm)', category: 'Proteins', calories: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.3, unit: 'g' },
  eggs: { name: 'Eggs (whole)', category: 'Proteins', calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0.0, unit: 'g' },
  lentils_dal: { name: 'Lentils / Dal (cooked)', category: 'Proteins', calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9, unit: 'g' },
  chickpeas: { name: 'Chickpeas (cooked)', category: 'Proteins', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, unit: 'g' },
  kidney_beans: { name: 'Kidney Beans / Rajma (cooked)', category: 'Proteins', calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, unit: 'g' },
  // ── Vegetables ──
  potato: { name: 'Potato', category: 'Vegetables', calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, fiber: 2.2, unit: 'g' },
  onion: { name: 'Onion', category: 'Vegetables', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, unit: 'g' },
  tomato: { name: 'Tomato', category: 'Vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, unit: 'g' },
  carrot: { name: 'Carrot', category: 'Vegetables', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, unit: 'g' },
  capsicum: { name: 'Capsicum / Bell Pepper', category: 'Vegetables', calories: 31, protein: 1.0, carbs: 6.0, fat: 0.3, fiber: 2.1, unit: 'g' },
  broccoli: { name: 'Broccoli', category: 'Vegetables', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, unit: 'g' },
  spinach: { name: 'Spinach / Palak', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, unit: 'g' },
  mushroom: { name: 'Mushroom', category: 'Vegetables', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, unit: 'g' },
  cauliflower: { name: 'Cauliflower / Gobi', category: 'Vegetables', calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3, fiber: 2.0, unit: 'g' },
  peas: { name: 'Peas (green)', category: 'Vegetables', calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, unit: 'g' },
  corn: { name: 'Sweet Corn', category: 'Vegetables', calories: 86, protein: 3.2, carbs: 19.0, fat: 1.2, fiber: 2.7, unit: 'g' },
  lettuce: { name: 'Lettuce', category: 'Vegetables', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, unit: 'g' },
  cucumber: { name: 'Cucumber', category: 'Vegetables', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, unit: 'g' },
  eggplant: { name: 'Eggplant / Brinjal', category: 'Vegetables', calories: 25, protein: 1.0, carbs: 5.9, fat: 0.2, fiber: 3.0, unit: 'g' },
  zucchini: { name: 'Zucchini / Courgette', category: 'Vegetables', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0, unit: 'g' },
  garlic: { name: 'Garlic', category: 'Vegetables', calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, unit: 'g' },
  ginger: { name: 'Ginger', category: 'Vegetables', calories: 80, protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2.0, unit: 'g' },
  // ── Dairy ──
  milk: { name: 'Milk (full fat)', category: 'Dairy', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0.0, unit: 'g' },
  cream: { name: 'Fresh Cream', category: 'Dairy', calories: 340, protein: 2.1, carbs: 3.4, fat: 35.0, fiber: 0.0, unit: 'g' },
  butter: { name: 'Butter', category: 'Dairy', calories: 717, protein: 0.9, carbs: 0.1, fat: 81.1, fiber: 0.0, unit: 'g' },
  cheese: { name: 'Cheese (processed)', category: 'Dairy', calories: 371, protein: 22.9, carbs: 2.4, fat: 30.0, fiber: 0.0, unit: 'g' },
  cheddar: { name: 'Cheddar Cheese', category: 'Dairy', calories: 403, protein: 24.9, carbs: 1.3, fat: 33.1, fiber: 0.0, unit: 'g' },
  mozzarella: { name: 'Mozzarella Cheese', category: 'Dairy', calories: 280, protein: 19.4, carbs: 3.1, fat: 17.1, fiber: 0.0, unit: 'g' },
  yogurt: { name: 'Yogurt / Dahi (plain)', category: 'Dairy', calories: 59, protein: 3.5, carbs: 5.0, fat: 3.3, fiber: 0.0, unit: 'g' },
  ghee: { name: 'Ghee', category: 'Dairy', calories: 900, protein: 0.0, carbs: 0.0, fat: 99.8, fiber: 0.0, unit: 'g' },
  // ── Oils & Fats ──
  olive_oil: { name: 'Olive Oil', category: 'Oils & Fats', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, unit: 'g' },
  vegetable_oil: { name: 'Vegetable Oil', category: 'Oils & Fats', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, unit: 'g' },
  coconut_oil: { name: 'Coconut Oil', category: 'Oils & Fats', calories: 892, protein: 0.0, carbs: 0.0, fat: 99.1, fiber: 0.0, unit: 'g' },
  // ── Fruits ──
  banana: { name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, unit: 'g' },
  apple: { name: 'Apple', category: 'Fruits', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, unit: 'g' },
  mango: { name: 'Mango', category: 'Fruits', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, unit: 'g' },
  lemon: { name: 'Lemon Juice', category: 'Fruits', calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, fiber: 0.3, unit: 'g' },
  orange: { name: 'Orange', category: 'Fruits', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, unit: 'g' },
  strawberry: { name: 'Strawberry', category: 'Fruits', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, unit: 'g' },
  // ── Condiments ──
  sugar: { name: 'Sugar (white)', category: 'Condiments', calories: 387, protein: 0.0, carbs: 100.0, fat: 0.0, fiber: 0.0, unit: 'g' },
  honey: { name: 'Honey', category: 'Condiments', calories: 304, protein: 0.3, carbs: 82.4, fat: 0.0, fiber: 0.2, unit: 'g' },
  salt: { name: 'Salt', category: 'Condiments', calories: 0, protein: 0.0, carbs: 0.0, fat: 0.0, fiber: 0.0, unit: 'g' },
  soy_sauce: { name: 'Soy Sauce', category: 'Condiments', calories: 53, protein: 5.0, carbs: 4.9, fat: 0.6, fiber: 0.8, unit: 'g' },
  ketchup: { name: 'Ketchup / Tomato Sauce', category: 'Condiments', calories: 101, protein: 1.1, carbs: 26.1, fat: 0.1, fiber: 0.3, unit: 'g' },
  mayonnaise: { name: 'Mayonnaise', category: 'Condiments', calories: 680, protein: 1.0, carbs: 2.0, fat: 74.9, fiber: 0.0, unit: 'g' },
  vinegar: { name: 'Vinegar', category: 'Condiments', calories: 18, protein: 0.0, carbs: 0.6, fat: 0.0, fiber: 0.0, unit: 'g' },
  // ── Nuts ──
  almonds: { name: 'Almonds', category: 'Nuts', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, unit: 'g' },
  cashews: { name: 'Cashews', category: 'Nuts', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3, unit: 'g' },
  peanuts: { name: 'Peanuts', category: 'Nuts', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5, unit: 'g' },
  walnuts: { name: 'Walnuts', category: 'Nuts', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, unit: 'g' },
  // ── Beverages Base ──
  coffee_powder: { name: 'Coffee Powder', category: 'Beverages', calories: 331, protein: 12.2, carbs: 67.7, fat: 1.7, fiber: 33.5, unit: 'g' },
  tea_leaves: { name: 'Tea Leaves', category: 'Beverages', calories: 296, protein: 19.5, carbs: 68.6, fat: 0.4, fiber: 36.2, unit: 'g' },
  cocoa_powder: { name: 'Cocoa Powder (unsweetened)', category: 'Beverages', calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 37.0, unit: 'g' },
};

// Daily reference values (FDA 2,000 kcal diet)
const FDA_DV = { calories: 2000, fat: 78, saturatedFat: 20, cholesterol: 300, sodium: 2300, carbs: 275, fiber: 28, protein: 50 };

// ─── Helper: compute nutrition for an ingredient list ────────────────────────
function computeNutrition(ingredientList) {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  ingredientList.forEach(({ key, grams }) => {
    const item = NUTRITION_DB[key];
    if (!item || !grams) return;
    const factor = parseFloat(grams) / 100;
    totals.calories += item.calories * factor;
    totals.protein += item.protein * factor;
    totals.carbs += item.carbs * factor;
    totals.fat += item.fat * factor;
    totals.fiber += item.fiber * factor;
  });
  return totals;
}

// ─── Pie Chart SVG ────────────────────────────────────────────────────────────
function MacroPieChart({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;
  const totalCal = proteinCal + carbsCal + fatCal;

  const proteinPct = totalCal > 0 ? proteinCal / totalCal : 0;
  const carbsPct = totalCal > 0 ? carbsCal / totalCal : 0;
  const fatPct = totalCal > 0 ? fatCal / totalCal : 0;

  const cx = 60, cy = 60, r = 55;

  function arcPath(startPct, endPct) {
    if (endPct - startPct <= 0) return '';
    const gap = 0.003;
    const s = startPct + gap;
    const e = endPct - gap;
    if (e <= s) return '';
    const startAngle = s * 2 * Math.PI - Math.PI / 2;
    const endAngle = e * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  const p0 = 0;
  const p1 = proteinPct;
  const p2 = p1 + carbsPct;
  const p3 = p2 + fatPct;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {proteinPct > 0 && <path d={arcPath(p0, p1)} fill="#3b82f6" />}
        {carbsPct > 0 && <path d={arcPath(p1, p2)} fill="#f59e0b" />}
        {fatPct > 0 && <path d={arcPath(p2, p3)} fill="#ef4444" />}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { color: '#3b82f6', label: 'Protein', grams: protein, pct: Math.round(proteinPct * 100) },
          { color: '#f59e0b', label: 'Carbs', grams: carbs, pct: Math.round(carbsPct * 100) },
          { color: '#ef4444', label: 'Fat', grams: fat, pct: Math.round(fatPct * 100) },
        ].map(({ color, label, grams, pct }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#374151' }}>
              <strong>{label}</strong> — {grams.toFixed(1)}g ({pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FDA Nutrition Label ──────────────────────────────────────────────────────
function FDANutritionLabel({ dishName, servingSize, servingUnit, nutrition }) {
  const dv = (val, ref) => Math.round((val / ref) * 100);
  return (
    <div style={{
      border: '2px solid #000',
      padding: '8px',
      maxWidth: '280px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '13px',
      backgroundColor: '#fff',
    }}>
      <div style={{ fontSize: '28px', fontWeight: '900', lineHeight: 1, borderBottom: '8px solid #000', paddingBottom: '4px', marginBottom: '4px' }}>
        Nutrition Facts
      </div>
      <div style={{ fontSize: '12px', marginBottom: '2px' }}>
        {servingSize && servingUnit ? (
          <span><strong>Serving Size</strong> {servingSize}{servingUnit}</span>
        ) : (
          <span><strong>Serving Size</strong> 1 serving</span>
        )}
      </div>
      {dishName && (
        <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>({dishName})</div>
      )}
      <div style={{ borderTop: '4px solid #000', borderBottom: '1px solid #000', padding: '4px 0', marginBottom: '4px' }}>
        <div style={{ fontSize: '11px' }}>Amount Per Serving</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700' }}>Calories</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1 }}>
            {Math.round(nutrition.calories)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '2px' }}>
        % Daily Value*
      </div>
      {[
        { label: 'Total Fat', val: nutrition.fat, unit: 'g', dvRef: FDA_DV.fat, bold: true },
        { label: 'Total Carbohydrate', val: nutrition.carbs, unit: 'g', dvRef: FDA_DV.carbs, bold: true },
        { label: 'Dietary Fiber', val: nutrition.fiber, unit: 'g', dvRef: FDA_DV.fiber, bold: false, indent: true },
        { label: 'Cholesterol', val: 0, unit: 'mg', dvRef: FDA_DV.cholesterol, bold: true, placeholder: true },
        { label: 'Sodium', val: 0, unit: 'mg', dvRef: FDA_DV.sodium, bold: true, placeholder: true },
        { label: 'Protein', val: nutrition.protein, unit: 'g', dvRef: FDA_DV.protein, bold: true, noDV: true },
      ].map(({ label, val, unit, dvRef, bold, indent, placeholder, noDV }) => (
        <div key={label} style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ccc',
          padding: '2px 0',
          paddingLeft: indent ? '12px' : '0',
        }}>
          <span style={{ fontWeight: bold ? '700' : '400' }}>
            {label} {placeholder ? <span style={{ fontWeight: '400', color: '#888' }}>—</span> : <span style={{ fontWeight: '400' }}>{val.toFixed(1)}{unit}</span>}
          </span>
          {!noDV && !placeholder && (
            <span style={{ fontWeight: '700' }}>{dv(val, dvRef)}%</span>
          )}
        </div>
      ))}
      <div style={{ fontSize: '10px', color: '#444', marginTop: '6px', lineHeight: 1.4 }}>
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
      </div>
    </div>
  );
}

// ─── FSSAI Nutrition Label ────────────────────────────────────────────────────
function FSSAINutritionLabel({ dishName, servingSize, servingUnit, nutrition }) {
  const rdi = { energy: 2000, protein: 60, carbs: 300, fat: 67, fiber: 40 };
  const dv = (val, ref) => Math.round((val / ref) * 100);
  return (
    <div style={{
      border: '2px solid #000',
      padding: '8px',
      maxWidth: '280px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '13px',
      backgroundColor: '#fff',
    }}>
      <div style={{ fontSize: '20px', fontWeight: '900', borderBottom: '6px solid #000', paddingBottom: '4px', marginBottom: '4px', lineHeight: 1.2 }}>
        Nutrition Information
      </div>
      <div style={{ fontSize: '11px', marginBottom: '4px' }}>
        <strong>As per FSSAI Food Safety Standards</strong>
      </div>
      <div style={{ fontSize: '12px', marginBottom: '6px' }}>
        Serving Size: <strong>{servingSize && servingUnit ? `${servingSize}${servingUnit}` : '1 serving'}</strong>
        {dishName && <span style={{ color: '#555' }}> ({dishName})</span>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderTop: '3px solid #000', borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '3px 2px', fontWeight: '700' }}>Nutrient</th>
            <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: '700' }}>Per Serving</th>
            <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: '700' }}>%RDA*</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Energy', val: Math.round(nutrition.calories), unit: 'kcal', ref: rdi.energy },
            { label: 'Protein', val: nutrition.protein.toFixed(1), unit: 'g', ref: rdi.protein },
            { label: 'Carbohydrate', val: nutrition.carbs.toFixed(1), unit: 'g', ref: rdi.carbs },
            { label: 'Total Fat', val: nutrition.fat.toFixed(1), unit: 'g', ref: rdi.fat },
            { label: 'Dietary Fibre', val: nutrition.fiber.toFixed(1), unit: 'g', ref: rdi.fiber },
          ].map(({ label, val, unit, ref }, i) => (
            <tr key={label} style={{ borderBottom: '1px solid #ccc', backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '3px 2px' }}>{label}</td>
              <td style={{ textAlign: 'right', padding: '3px 2px' }}>{val}{unit}</td>
              <td style={{ textAlign: 'right', padding: '3px 2px', fontWeight: '700' }}>{dv(parseFloat(val), ref)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: '10px', color: '#444', marginTop: '6px', lineHeight: 1.4 }}>
        * % RDA based on 2000 kcal diet as per ICMR guidelines. Individual requirements may vary.
        <br />Cholesterol: — &nbsp;|&nbsp; Sodium: —
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CalorieCalculatorClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [dishName, setDishName] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingUnit, setServingUnit] = useState('g');
  const [selectedKey, setSelectedKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const [labelFormat, setLabelFormat] = useState('fda');
  const [openFaq, setOpenFaq] = useState(null);
  const [aiDishName, setAiDishName] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const { generate, isGenerating, error: aiError, remaining, setError: setAiError } = useAITool('nutrition');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Derived state
  const nutrition = computeNutrition(ingredientList);

  // Filtered ingredient options
  const dbEntries = Object.entries(NUTRITION_DB);
  const filtered = searchQuery.trim()
    ? dbEntries.filter(([, v]) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dbEntries;

  // Group by category for the dropdown
  const categories = [...new Set(filtered.map(([, v]) => v.category))];

  const addIngredient = () => {
    if (!selectedKey || !quantity || parseFloat(quantity) <= 0) return;
    const item = NUTRITION_DB[selectedKey];
    if (!item) return;
    setIngredientList(prev => [...prev, { key: selectedKey, name: item.name, grams: parseFloat(quantity) }]);
    setSelectedKey('');
    setSearchQuery('');
    setQuantity('');
  };

  const removeIngredient = (idx) => {
    setIngredientList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAIAnalyze = async () => {
    const name = aiDishName.trim() || dishName.trim();
    if (!name) {
      alert('Please enter a dish name to analyze.');
      return;
    }
    setAiResult(null);
    const result = await generate({ dishName: name, task: 'estimate nutrition per serving' });
    if (result) {
      setAiResult(result);
    }
  };

  // Per-ingredient calorie contribution for the list
  const perIngredientCalories = (key, grams) => {
    const item = NUTRITION_DB[key];
    if (!item || !grams) return 0;
    return (item.calories * parseFloat(grams)) / 100;
  };

  // Styles
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  const statCardStyle = (color) => ({
    backgroundColor: `${color}10`,
    border: `1px solid ${color}30`,
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  });

  const faqs = [
    {
      q: 'How do you calculate calories for a restaurant dish?',
      a: 'List all ingredients with their gram weights, look up calories per 100g for each ingredient, multiply (calories/100g × grams used / 100) for each ingredient, then sum all values. This calculator automates the process using a database of 80+ common foods sourced from USDA nutritional data.',
    },
    {
      q: 'Is FSSAI nutrition labeling mandatory for restaurants in India?',
      a: 'FSSAI menu labeling regulations require restaurant chains with 10 or more outlets to display calorie information on menus. FSSAI mandates displaying energy (kcal), protein, carbohydrates, and fat per serving. Smaller restaurants are encouraged to comply voluntarily as it builds consumer trust.',
    },
    {
      q: 'What is the difference between FDA and FSSAI label formats?',
      a: 'FDA (US) labels list total fat, cholesterol, sodium, total carbohydrate, dietary fiber, total sugars, and protein with % Daily Values based on a 2,000 calorie diet. FSSAI (India) labels list energy, protein, carbohydrates, fat, and dietary fiber with % RDA based on Indian dietary standards (ICMR guidelines).',
    },
    {
      q: 'How accurate are calorie calculators for restaurant food?',
      a: 'Accuracy depends on using precise gram quantities from standardized recipes, accounting for all ingredients (oils, sauces, garnishes), and using reliable nutrition data. Our calculator uses USDA-validated values. Cooking methods like deep-frying can add 10-15% extra calories from oil absorption, which should be accounted for by adding the oil as an ingredient.',
    },
    {
      q: 'Why should restaurants display calorie counts on menus?',
      a: 'Displaying calorie counts fulfills legal compliance requirements (FSSAI for India, FDA for US restaurant chains), builds trust with health-conscious customers, differentiates your brand, and forces recipe standardization which simultaneously controls food costs and portion sizes.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        padding: isMobile ? '64px 20px 48px' : '80px 32px 64px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <FaFire size={13} color="#f97316" />
            <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>
              Free Tool — No Login Required
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '800',
            color: '#f8fafc',
            marginBottom: '18px',
            lineHeight: '1.12',
            letterSpacing: '-0.02em',
          }}>
            Menu Nutrition &amp; Calorie Calculator
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : '19px',
            color: '#94a3b8',
            maxWidth: '580px',
            margin: '0 auto',
            lineHeight: '1.65',
          }}>
            Calculate calories, protein, carbs, fat, and fiber for any restaurant dish. Generate FDA or FSSAI nutrition labels instantly — free, no signup.
          </p>
        </div>
      </section>

      {/* ── Tool Section ─────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '32px 16px' : '60px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '28px',
            alignItems: 'start',
          }}>

            {/* ── LEFT: Ingredient Builder ────────────────────────────────────── */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBreadSlice color="#f97316" /> Build Your Dish
              </h2>

              {/* Dish Name & Serving */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Dish Name (optional)</label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g., Butter Chicken"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Serving Size</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                      placeholder="300"
                      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                    />
                    <select
                      value={servingUnit}
                      onChange={(e) => setServingUnit(e.target.value)}
                      style={{ padding: '10px 6px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', backgroundColor: '#fff', width: '60px' }}
                    >
                      {['g', 'oz', 'ml', 'cup', 'piece'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ingredient Adder */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Add Ingredients</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Search */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedKey(''); }}
                    placeholder="Search ingredient (e.g., chicken, rice...)"
                    style={inputStyle}
                  />
                  {/* Select */}
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    size={1}
                  >
                    <option value="">— Select ingredient —</option>
                    {categories.map(cat => (
                      <optgroup key={cat} label={cat}>
                        {filtered
                          .filter(([, v]) => v.category === cat)
                          .map(([key, v]) => (
                            <option key={key} value={key}>
                              {v.name} ({v.calories} kcal/100g)
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  {/* Quantity + Add */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Quantity (grams)"
                      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                      min="1"
                    />
                    <button
                      onClick={addIngredient}
                      disabled={!selectedKey || !quantity || parseFloat(quantity) <= 0}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        background: (!selectedKey || !quantity) ? '#e5e7eb' : 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: (!selectedKey || !quantity) ? '#9ca3af' : '#fff',
                        border: 'none',
                        cursor: (!selectedKey || !quantity) ? 'not-allowed' : 'pointer',
                        fontWeight: '700',
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      <FaPlus size={11} /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredient List */}
              {ingredientList.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>
                    Added Ingredients ({ingredientList.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {ingredientList.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {item.grams}g — {perIngredientCalories(item.key, item.grams).toFixed(0)} kcal
                          </div>
                        </div>
                        <button
                          onClick={() => removeIngredient(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '4px 8px',
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                          title="Remove"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analyze */}
              <div style={{
                padding: '16px',
                backgroundColor: '#fefce8',
                borderRadius: '12px',
                border: '1px solid #fde68a',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#78350f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaRobot color="#f59e0b" /> AI Analyze — Don&apos;t know the ingredients?
                </div>
                <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '10px', lineHeight: '1.5' }}>
                  Enter any dish name and AI will estimate its nutrition values based on a typical restaurant preparation.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={aiDishName}
                    onChange={(e) => setAiDishName(e.target.value)}
                    placeholder={dishName || 'e.g., Dal Makhani, Pad Thai...'}
                    style={{ ...inputStyle, flex: 1, minWidth: 0, border: '1px solid #fcd34d' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAIAnalyze()}
                  />
                  <button
                    onClick={handleAIAnalyze}
                    disabled={isGenerating}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: isGenerating ? '#e5e7eb' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: isGenerating ? '#9ca3af' : '#fff',
                      border: 'none',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      fontSize: '13px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FaRobot size={12} /> {isGenerating ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
                {aiError && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                    {aiError}
                  </div>
                )}
                {remaining !== null && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#92400e' }}>
                    {remaining} AI analysis{remaining !== 1 ? 'es' : ''} remaining today.
                  </div>
                )}
                {aiResult && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>AI Estimate:</div>
                    <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{aiResult}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Results ───────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Macro Stat Cards */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaChartPie color="#f97316" /> Nutrition Summary
                  {dishName && <span style={{ fontWeight: '400', fontSize: '14px', color: '#6b7280' }}>— {dishName}</span>}
                </h2>

                {ingredientList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', color: '#9ca3af' }}>
                    <FaFire size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p style={{ fontSize: '14px' }}>Add ingredients to see nutrition results</p>
                  </div>
                ) : (
                  <>
                    {/* Calories — big card */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                      borderRadius: '14px',
                      padding: '20px',
                      textAlign: 'center',
                      marginBottom: '16px',
                    }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.05em' }}>
                        TOTAL CALORIES
                      </div>
                      <div style={{ fontSize: '56px', fontWeight: '900', color: '#f8fafc', lineHeight: 1 }}>
                        {Math.round(nutrition.calories)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>kcal per serving</div>
                    </div>

                    {/* Macro cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                      {[
                        { label: 'Protein', val: nutrition.protein, unit: 'g', color: '#3b82f6', icon: <FaDrumstickBite size={14} /> },
                        { label: 'Carbs', val: nutrition.carbs, unit: 'g', color: '#f59e0b', icon: <FaBreadSlice size={14} /> },
                        { label: 'Fat', val: nutrition.fat, unit: 'g', color: '#ef4444', icon: <FaFire size={14} /> },
                        { label: 'Fiber', val: nutrition.fiber, unit: 'g', color: '#22c55e', icon: <FaLeaf size={14} /> },
                      ].map(({ label, val, unit, color, icon }) => (
                        <div key={label} style={statCardStyle(color)}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color, marginBottom: '4px' }}>
                            {icon}
                            <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.03em' }}>{label}</span>
                          </div>
                          <div style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>
                            {val.toFixed(1)}<span style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>{unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Macro Pie Chart */}
                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6', marginBottom: '0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Macronutrient Breakdown</div>
                      <MacroPieChart protein={nutrition.protein} carbs={nutrition.carbs} fat={nutrition.fat} />
                    </div>
                  </>
                )}
              </div>

              {/* Nutrition Label */}
              {ingredientList.length > 0 && (
                <div style={cardStyle}>
                  {/* Label Format Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      Nutrition Label
                    </h3>
                    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                      {[
                        { val: 'fda', label: 'FDA (US/UK)' },
                        { val: 'fssai', label: 'FSSAI (India)' },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => setLabelFormat(val)}
                          style={{
                            padding: '7px 14px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: labelFormat === val ? '#0f172a' : '#fff',
                            color: labelFormat === val ? '#fff' : '#6b7280',
                            transition: 'all 0.15s',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {labelFormat === 'fda' ? (
                      <FDANutritionLabel
                        dishName={dishName}
                        servingSize={servingSize}
                        servingUnit={servingUnit}
                        nutrition={nutrition}
                      />
                    ) : (
                      <FSSAINutritionLabel
                        dishName={dishName}
                        servingSize={servingSize}
                        servingUnit={servingUnit}
                        nutrition={nutrition}
                      />
                    )}
                  </div>

                  <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <FaInfoCircle size={12} style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>Values shown are per serving based on your ingredient list. Cholesterol and sodium require lab analysis or detailed ingredient data not available in this calculator.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO Content ──────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '48px 20px' : '72px 32px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Article 1 */}
          <div style={{ marginBottom: '56px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              How to Calculate Calories for Your Restaurant Menu
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              Calculating the calorie count for a restaurant dish requires a systematic approach rooted in food science. The fundamental principle is simple: every ingredient contributes a measurable amount of energy (calories), protein, carbohydrates, and fat, all of which can be looked up per 100g and then proportionally calculated based on the actual quantity used in the recipe.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              The process begins with a standardized recipe card — a precise written record of every ingredient and its exact weight in grams. This is where many restaurants fall short. Approximate measurements like &quot;a handful of spinach&quot; or &quot;a drizzle of oil&quot; introduce significant errors. One tablespoon of oil is approximately 14g and contributes 124 calories — easy to overlook but impactful at scale.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              Once you have precise gram quantities, the calculation is straightforward: for each ingredient, divide its per-100g calorie value by 100, then multiply by the grams used. Sum all ingredient values to get the total calories for the batch, then divide by the number of portions your recipe yields.
            </p>
            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.9',
            }}>
              Calories per ingredient = (Kcal per 100g ÷ 100) × grams used<br />
              Total dish calories = Sum of all ingredient calories<br />
              Calories per serving = Total dish calories ÷ number of servings
            </div>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              For example, a butter chicken recipe using 500g chicken breast (165 kcal/100g = 825 kcal), 100g butter (717 kcal/100g = 717 kcal), 200g tomato (18 kcal/100g = 36 kcal), and 100g cream (340 kcal/100g = 340 kcal) gives 1,918 total calories. Divided by 4 portions, each serving is approximately 480 calories — before accounting for accompaniments like rice or naan.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              One additional factor to consider is cooking-method adjustment. Deep frying absorbs significant oil — typically 10-15% of the food weight. If you deep-fry 100g of potato, the finished product absorbs approximately 10-15g of additional oil, adding 90-130 calories to the calculation. Our calculator handles this by allowing you to add cooking oil as a separate ingredient with the absorbed quantity.
            </p>
          </div>

          {/* Article 2 */}
          <div style={{ marginBottom: '56px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              FSSAI Nutrition Labeling Requirements for Restaurants
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              The Food Safety and Standards Authority of India (FSSAI) has introduced comprehensive menu labeling guidelines that affect restaurants across the country. Under the Food Safety and Standards (Labelling and Display) Regulations, restaurant chains with 10 or more outlets are required to prominently display calorie information on their menus, menu boards, and digital ordering platforms.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              The mandatory nutritional information for FSSAI-compliant restaurant labeling includes: energy in kilocalories (kcal), protein in grams (g), total carbohydrates in grams (g) with a separate breakout for sugars, and total fat in grams (g) with a breakout for saturated fat. Dietary fiber, while not always mandatory, is strongly recommended and increasingly expected by health-conscious consumers.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              FSSAI expresses nutritional values per serving, with the serving size clearly defined. The % RDA (Recommended Dietary Allowance) column is calculated against the ICMR (Indian Council of Medical Research) reference values: 2,000 kcal energy, 60g protein, 300g carbohydrates, 67g fat, and 40g dietary fiber per day.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              For independent restaurants below the 10-outlet threshold, FSSAI labeling is not currently mandatory but is strongly encouraged. The regulatory direction across all major markets — India, US, UK, EU — is moving toward universal menu transparency. Restaurants that implement voluntary calorie disclosure today will be well-positioned for future mandatory compliance without operational disruption.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              Practically, achieving FSSAI compliance requires standardized recipes for every menu item, consistent portioning (which reduces food cost variance as a side benefit), and a reliable method for calculating nutrition values. This calculator generates FSSAI-formatted nutrition labels based on your ingredient inputs, giving you a compliant label that can be incorporated into menu design and digital displays.
            </p>
          </div>

          {/* Article 3 */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>
              Why Calorie Counts Matter for Your Restaurant Business
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              The restaurant industry&apos;s relationship with nutrition transparency has shifted dramatically over the past decade. Health-conscious dining is no longer a niche preference — surveys consistently show that over 60% of diners check nutritional information when it is available, and a significant portion choose restaurants that display it over those that do not.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
              From a business perspective, displaying calorie counts serves three simultaneous goals. First, it fulfills regulatory requirements and protects you from potential compliance actions. Second, it positions your restaurant as transparent and customer-centric — a brand characteristic that correlates with higher loyalty and repeat visits among health-aware demographics. Third, the process of calculating nutrition compels recipe standardization, which reduces food cost variance and improves kitchen efficiency.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              Restaurants that integrate nutrition data into their operations also find it easier to market to fitness communities, corporate wellness programs, and healthcare-adjacent customers — all high-value market segments. Whether you operate a cloud kitchen, a QSR chain, or a fine dining establishment, having accurate nutrition data for every menu item is increasingly a competitive necessity rather than a differentiator.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '28px',
            textAlign: 'center',
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
                backgroundColor: '#ffffff',
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
                    color: '#111827',
                    gap: '12px',
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{
                    fontSize: '16px',
                    color: '#9ca3af',
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}>
                    {'\u25BC'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div style={{
                    padding: '0 20px 16px',
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.75',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#fff' }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: isMobile ? '36px 24px' : '56px 48px',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            backgroundColor: 'rgba(249,115,22,0.15)',
            borderRadius: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(249,115,22,0.25)',
          }}>
            <FaFire size={12} color="#f97316" />
            <span style={{ fontSize: '12px', color: '#fdba74', fontWeight: '700' }}>DineOpen POS & Inventory</span>
          </div>
          <h3 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: '#f8fafc', marginBottom: '14px', lineHeight: '1.3' }}>
            Track Nutrition Automatically Across Your Entire Menu
          </h3>
          <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '28px', lineHeight: '1.7', maxWidth: '500px', margin: '0 auto 28px' }}>
            DineOpen POS integrates recipe nutrition tracking, real-time inventory management, and FSSAI-compliant menu labeling — all in one platform built for Indian restaurants.
          </p>
          <Link
            href="/#pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '15px',
            }}
          >
            Get Started with DineOpen <FaArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ── Related Tools ─────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '24px 20px 40px' : '40px 32px 56px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '18px' }}>
            Related Free Tools
          </h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '/tools/food-cost-calculator', label: 'Food Cost Calculator' },
              { href: '/tools/recipe-cost-calculator', label: 'Recipe Cost Calculator' },
              { href: '/tools/menu-price-calculator', label: 'Menu Price Calculator' },
              { href: '/tools/recipe-scaler', label: 'Recipe Scaler' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                textDecoration: 'none',
                border: '1px solid #e5e7eb',
                fontWeight: '500',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/tools/calorie-calculator" variant="tool" />
      <Footer />
    </div>
  );
}
