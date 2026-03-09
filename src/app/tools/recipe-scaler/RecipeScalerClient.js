'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function RecipeScalerClient() {
  const [recipeName, setRecipeName] = useState('');
  const [originalServings, setOriginalServings] = useState(4);
  const [targetServings, setTargetServings] = useState(20);
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: 'g' },
  ]);

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }]);
  const removeIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx));
  const updateIngredient = (idx, field, value) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setIngredients(updated);
  };

  const scaleFactor = originalServings > 0 ? targetServings / originalServings : 1;

  const scaleQuantity = (qty) => {
    const num = parseFloat(qty);
    if (isNaN(num)) return qty;
    const scaled = num * scaleFactor;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2);
  };

  const units = ['g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'pcs', 'nos', 'pinch'];

  const hasIngredients = ingredients.some(i => i.name.trim() && i.quantity);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Recipe Scaler' }]} />
      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>Free Tool &bull; No Login</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Recipe Scaler</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>Scale any recipe up or down instantly. Perfect for batch cooking, catering, and restaurant prep.</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Original Recipe</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Recipe Name</label>
                  <input type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g., Butter Chicken" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Original Servings</label>
                    <input type="number" value={originalServings} onChange={(e) => setOriginalServings(Number(e.target.value))} min="1" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Target Servings</label>
                    <input type="number" value={targetServings} onChange={(e) => setTargetServings(Number(e.target.value))} min="1" style={{ width: '100%', padding: '10px', border: '2px solid #d97706', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }} />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Ingredients</label>
                {ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 70px 30px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input type="text" value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)} placeholder="Ingredient" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                    <input type="text" value={ing.quantity} onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)} placeholder="Qty" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                    <select value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}>
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {ingredients.length > 1 && (
                      <button onClick={() => removeIngredient(idx)} style={{ padding: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>×</button>
                    )}
                  </div>
                ))}
                <button onClick={addIngredient} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '8px' }}>+ Add Ingredient</button>
              </div>

              {/* Scaled Output */}
              <div style={{ backgroundColor: hasIngredients ? '#fffbeb' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
                  Scaled Recipe {recipeName && `— ${recipeName}`}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  {originalServings} servings → <strong style={{ color: '#d97706' }}>{targetServings} servings</strong> (×{scaleFactor.toFixed(2)})
                </p>

                {hasIngredients ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ingredients.filter(i => i.name.trim()).map((ing, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{ing.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#d97706' }}>
                          {scaleQuantity(ing.quantity)} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
                    <p>Add ingredients to see scaled quantities in real-time</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#d97706', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Recipe Management Built Into DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Create standardized recipes, auto-scale for batch orders, and track ingredient costs.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#d97706', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
        <InternalLinks currentPath="/tools/recipe-scaler" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
