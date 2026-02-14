'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaExchangeAlt, FaThermometerHalf, FaBalanceScale, FaTint } from 'react-icons/fa';

export default function KitchenConversionClient() {
  const [activeTab, setActiveTab] = useState('volume');

  // Volume conversion
  const [volumeValue, setVolumeValue] = useState('');
  const [volumeFrom, setVolumeFrom] = useState('cup');
  const [volumeTo, setVolumeTo] = useState('ml');

  // Weight conversion
  const [weightValue, setWeightValue] = useState('');
  const [weightFrom, setWeightFrom] = useState('g');
  const [weightTo, setWeightTo] = useState('oz');

  // Temperature conversion
  const [tempValue, setTempValue] = useState('');
  const [tempFrom, setTempFrom] = useState('celsius');

  // Ingredient conversion
  const [ingredientValue, setIngredientValue] = useState('');
  const [ingredient, setIngredient] = useState('flour');
  const [ingredientFrom, setIngredientFrom] = useState('cup');

  const volumeUnits = {
    ml: 1,
    L: 1000,
    tsp: 4.929,
    tbsp: 14.787,
    'fl oz': 29.574,
    cup: 236.588,
    pint: 473.176,
    quart: 946.353,
    gallon: 3785.41
  };

  const weightUnits = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592,
    mg: 0.001
  };

  // Grams per cup for common ingredients
  const ingredientDensity = {
    flour: { name: 'All-Purpose Flour', gramsPerCup: 125 },
    sugar: { name: 'Granulated Sugar', gramsPerCup: 200 },
    'brown-sugar': { name: 'Brown Sugar (packed)', gramsPerCup: 220 },
    'powdered-sugar': { name: 'Powdered Sugar', gramsPerCup: 120 },
    butter: { name: 'Butter', gramsPerCup: 227 },
    milk: { name: 'Milk', gramsPerCup: 245 },
    water: { name: 'Water', gramsPerCup: 237 },
    rice: { name: 'Rice (uncooked)', gramsPerCup: 185 },
    oats: { name: 'Rolled Oats', gramsPerCup: 90 },
    honey: { name: 'Honey', gramsPerCup: 340 },
    oil: { name: 'Vegetable Oil', gramsPerCup: 218 },
    'cocoa-powder': { name: 'Cocoa Powder', gramsPerCup: 85 },
    'bread-flour': { name: 'Bread Flour', gramsPerCup: 130 },
    'almond-flour': { name: 'Almond Flour', gramsPerCup: 96 },
    salt: { name: 'Table Salt', gramsPerCup: 288 },
  };

  const convertVolume = () => {
    if (!volumeValue) return '';
    const valueInMl = parseFloat(volumeValue) * volumeUnits[volumeFrom];
    const result = valueInMl / volumeUnits[volumeTo];
    return result.toFixed(3);
  };

  const convertWeight = () => {
    if (!weightValue) return '';
    const valueInGrams = parseFloat(weightValue) * weightUnits[weightFrom];
    const result = valueInGrams / weightUnits[weightTo];
    return result.toFixed(3);
  };

  const convertTemperature = () => {
    if (!tempValue) return { celsius: '', fahrenheit: '', gas: '' };
    const val = parseFloat(tempValue);
    let celsius, fahrenheit;

    if (tempFrom === 'celsius') {
      celsius = val;
      fahrenheit = (val * 9/5) + 32;
    } else {
      fahrenheit = val;
      celsius = (val - 32) * 5/9;
    }

    // Gas mark approximation
    let gas = '-';
    if (celsius >= 135 && celsius < 150) gas = '1';
    else if (celsius >= 150 && celsius < 165) gas = '2';
    else if (celsius >= 165 && celsius < 180) gas = '3';
    else if (celsius >= 180 && celsius < 190) gas = '4';
    else if (celsius >= 190 && celsius < 200) gas = '5';
    else if (celsius >= 200 && celsius < 220) gas = '6';
    else if (celsius >= 220 && celsius < 230) gas = '7';
    else if (celsius >= 230 && celsius < 245) gas = '8';
    else if (celsius >= 245) gas = '9';

    return {
      celsius: celsius.toFixed(1),
      fahrenheit: fahrenheit.toFixed(1),
      gas
    };
  };

  const convertIngredient = () => {
    if (!ingredientValue || !ingredient) return { grams: '', cups: '' };
    const val = parseFloat(ingredientValue);
    const density = ingredientDensity[ingredient].gramsPerCup;

    if (ingredientFrom === 'cup') {
      return {
        grams: (val * density).toFixed(1),
        cups: val.toFixed(2)
      };
    } else {
      return {
        grams: val.toFixed(1),
        cups: (val / density).toFixed(2)
      };
    }
  };

  const tabs = [
    { id: 'volume', label: 'Volume', icon: <FaTint /> },
    { id: 'weight', label: 'Weight', icon: <FaBalanceScale /> },
    { id: 'temperature', label: 'Temperature', icon: <FaThermometerHalf /> },
    { id: 'ingredient', label: 'Ingredient', icon: <FaExchangeAlt /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Kitchen Conversion Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Convert cooking measurements instantly. Volume, weight, temperature, and ingredient-specific conversions.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 20px',
                      backgroundColor: activeTab === tab.id ? '#7c3aed' : '#f3f4f6',
                      color: activeTab === tab.id ? 'white' : '#374151',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '14px', fontWeight: '600'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Volume Conversion */}
              {activeTab === 'volume' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Volume Conversion</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>From</label>
                      <input
                        type="number"
                        value={volumeValue}
                        onChange={(e) => setVolumeValue(e.target.value)}
                        placeholder="Enter value"
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', marginBottom: '8px' }}
                      />
                      <select
                        value={volumeFrom}
                        onChange={(e) => setVolumeFrom(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      >
                        {Object.keys(volumeUnits).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                    <FaExchangeAlt style={{ color: '#7c3aed', fontSize: '20px', marginBottom: '24px' }} />
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>To</label>
                      <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '24px', fontWeight: '700', color: '#7c3aed', textAlign: 'center', marginBottom: '8px', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {convertVolume() || '0'}
                      </div>
                      <select
                        value={volumeTo}
                        onChange={(e) => setVolumeTo(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      >
                        {Object.keys(volumeUnits).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Weight Conversion */}
              {activeTab === 'weight' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Weight Conversion</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>From</label>
                      <input
                        type="number"
                        value={weightValue}
                        onChange={(e) => setWeightValue(e.target.value)}
                        placeholder="Enter value"
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', marginBottom: '8px' }}
                      />
                      <select
                        value={weightFrom}
                        onChange={(e) => setWeightFrom(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      >
                        {Object.keys(weightUnits).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                    <FaExchangeAlt style={{ color: '#7c3aed', fontSize: '20px', marginBottom: '24px' }} />
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>To</label>
                      <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '24px', fontWeight: '700', color: '#7c3aed', textAlign: 'center', marginBottom: '8px', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {convertWeight() || '0'}
                      </div>
                      <select
                        value={weightTo}
                        onChange={(e) => setWeightTo(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      >
                        {Object.keys(weightUnits).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Temperature Conversion */}
              {activeTab === 'temperature' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Temperature Conversion</h3>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Enter Temperature</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder="180"
                        style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                      />
                      <select
                        value={tempFrom}
                        onChange={(e) => setTempFrom(e.target.value)}
                        style={{ padding: '12px 20px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      >
                        <option value="celsius">°C (Celsius)</option>
                        <option value="fahrenheit">°F (Fahrenheit)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Celsius</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{convertTemperature().celsius || '0'}°C</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Fahrenheit</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{convertTemperature().fahrenheit || '0'}°F</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Gas Mark</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{convertTemperature().gas || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredient Conversion */}
              {activeTab === 'ingredient' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Ingredient Conversion (Cups ↔ Grams)</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Select Ingredient</label>
                    <select
                      value={ingredient}
                      onChange={(e) => setIngredient(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      {Object.entries(ingredientDensity).map(([key, val]) => (
                        <option key={key} value={key}>{val.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <input
                      type="number"
                      value={ingredientValue}
                      onChange={(e) => setIngredientValue(e.target.value)}
                      placeholder="Enter amount"
                      style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                    />
                    <select
                      value={ingredientFrom}
                      onChange={(e) => setIngredientFrom(e.target.value)}
                      style={{ padding: '12px 20px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="cup">Cups</option>
                      <option value="grams">Grams</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Cups</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{convertIngredient().cups || '0'}</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Grams</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{convertIngredient().grams || '0'}g</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Quick Reference Charts</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed', marginBottom: '16px' }}>Common Volume</h3>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  <p style={{ marginBottom: '8px' }}>1 cup = 237 ml</p>
                  <p style={{ marginBottom: '8px' }}>1 tbsp = 15 ml</p>
                  <p style={{ marginBottom: '8px' }}>1 tsp = 5 ml</p>
                  <p style={{ marginBottom: '8px' }}>1 fl oz = 30 ml</p>
                </div>
              </div>
              <div style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed', marginBottom: '16px' }}>Common Weight</h3>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  <p style={{ marginBottom: '8px' }}>1 oz = 28.35 g</p>
                  <p style={{ marginBottom: '8px' }}>1 lb = 454 g</p>
                  <p style={{ marginBottom: '8px' }}>1 kg = 2.2 lb</p>
                  <p style={{ marginBottom: '8px' }}>100g = 3.5 oz</p>
                </div>
              </div>
              <div style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed', marginBottom: '16px' }}>Oven Temperatures</h3>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  <p style={{ marginBottom: '8px' }}>Low: 150°C / 300°F</p>
                  <p style={{ marginBottom: '8px' }}>Medium: 180°C / 350°F</p>
                  <p style={{ marginBottom: '8px' }}>High: 200°C / 400°F</p>
                  <p style={{ marginBottom: '8px' }}>Very High: 220°C / 425°F</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#7c3aed', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Your Kitchen Smarter</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen helps you standardize recipes and manage inventory efficiently.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
