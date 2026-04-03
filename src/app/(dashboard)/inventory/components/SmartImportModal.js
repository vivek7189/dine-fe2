'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaMagic, FaTrash, FaCheck, FaTimes, FaArrowLeft, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaLeaf, FaDrumstickBite } from 'react-icons/fa';
import apiClient from '../../../../lib/api';

const primaryBtn = {
  padding: '11px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none',
  borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
};

const secondaryBtn = {
  padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
  borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '6px', transition: 'all 0.2s'
};

const dangerBtn = {
  padding: '6px 10px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none',
  borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '4px'
};

const sectionTitleStyle = {
  fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: '0 0 12px 0',
  display: 'flex', alignItems: 'center', gap: '8px'
};

const tableHeaderStyle = {
  padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left',
  borderBottom: '2px solid #e8ecf1', backgroundColor: '#f8fafc'
};

const tableCellStyle = {
  padding: '10px 12px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6'
};

const badgeWarning = {
  display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
  backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '10px',
  fontSize: '11px', fontWeight: 600
};

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e8ecf1',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', color: '#1f2937'
};

function Spinner() {
  return (
    <div style={{
      display: 'inline-block', width: '18px', height: '18px',
      border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
      borderRadius: '50%', animation: 'smartImportSpin 0.6s linear infinite'
    }}>
      <style>{`@keyframes smartImportSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Step 1: Input ──────────────────────────────────────────────────────────

function StepInput({ text, setText, onParse, loading, error }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.6 }}>
        Paste your recipe, ingredient list, menu data, or any text. Our AI will extract inventory items, menu items, categories, and recipes automatically.
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={"Example:\n\nPaneer Butter Masala\nIngredients: Paneer 250g, Butter 50g, Tomato puree 200ml, Cream 100ml, Kasuri methi 1 tsp\nPrice: ₹320, Veg\n\nChicken Biryani\nIngredients: Basmati rice 300g, Chicken 500g, Onion 200g, Yogurt 100g, Biryani masala 2 tbsp\nPrice: ₹380, Non-veg"}
        style={{
          width: '100%', minHeight: '260px', padding: '16px', borderRadius: '12px',
          border: '1.5px solid #e8ecf1', fontSize: '14px', lineHeight: 1.7, resize: 'vertical',
          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          backgroundColor: '#fafcfe', color: '#1f2937', transition: 'border-color 0.2s'
        }}
        onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)'; }}
        onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
      />
      {error && (
        <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle size={12} /> {error}
        </div>
      )}
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onParse}
          disabled={!text.trim() || loading}
          style={{
            ...primaryBtn,
            opacity: (!text.trim() || loading) ? 0.6 : 1,
            cursor: (!text.trim() || loading) ? 'not-allowed' : 'pointer',
            padding: '12px 28px', fontSize: '14px'
          }}
        >
          {loading ? <Spinner /> : <FaMagic size={14} />}
          {loading ? 'Parsing...' : 'Parse with AI'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Preview ────────────────────────────────────────────────────────

function InventoryItemsSection({ items, onRemove, onChange }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={sectionTitleStyle}>
        <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px' }}>📦</span>
        </span>
        Inventory Items
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>({items.length})</span>
      </h3>
      <div style={{ borderRadius: '10px', border: '1px solid #e8ecf1', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Unit</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Cost (₹)</th>
              <th style={{ ...tableHeaderStyle, width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ backgroundColor: item.isDuplicate ? '#fffbeb' : (i % 2 === 0 ? '#fff' : '#fafcfe') }}>
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input value={item.name || ''} onChange={e => onChange(i, 'name', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                    {item.isDuplicate && <span style={badgeWarning}><FaExclamationTriangle size={9} /> Duplicate</span>}
                  </div>
                </td>
                <td style={tableCellStyle}>
                  <input value={item.unit || ''} onChange={e => onChange(i, 'unit', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: '80px' }} />
                </td>
                <td style={tableCellStyle}>
                  <input value={item.category || ''} onChange={e => onChange(i, 'category', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                </td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                  <input type="number" value={item.costPerUnit || ''} onChange={e => onChange(i, 'costPerUnit', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: '80px', textAlign: 'right' }} />
                </td>
                <td style={tableCellStyle}>
                  <button onClick={() => onRemove(i)} style={dangerBtn} title="Remove"><FaTrash size={10} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuCategoriesSection({ categories, onRemove }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={sectionTitleStyle}>
        <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px' }}>📁</span>
        </span>
        Menu Categories
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>({categories.length})</span>
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map((cat, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', backgroundColor: '#f8fafc', borderRadius: '8px',
            border: '1px solid #e8ecf1', fontSize: '13px', fontWeight: 500, color: '#374151'
          }}>
            {typeof cat === 'string' ? cat : cat.name}
            <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <FaTimes size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuItemsSection({ items, onRemove, onChange }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={sectionTitleStyle}>
        <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px' }}>🍽️</span>
        </span>
        Menu Items
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>({items.length})</span>
      </h3>
      <div style={{ borderRadius: '10px', border: '1px solid #e8ecf1', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Name</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Price (₹)</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={tableHeaderStyle}>Veg/Non-Veg</th>
              <th style={{ ...tableHeaderStyle, width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ backgroundColor: item.isDuplicate ? '#fffbeb' : (i % 2 === 0 ? '#fff' : '#fafcfe') }}>
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input value={item.name || ''} onChange={e => onChange(i, 'name', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                    {item.isDuplicate && <span style={badgeWarning}><FaExclamationTriangle size={9} /> Duplicate</span>}
                  </div>
                </td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                  <input type="number" value={item.price || ''} onChange={e => onChange(i, 'price', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: '80px', textAlign: 'right' }} />
                </td>
                <td style={tableCellStyle}>
                  <input value={item.category || ''} onChange={e => onChange(i, 'category', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                </td>
                <td style={tableCellStyle}>
                  <button
                    onClick={() => onChange(i, 'isVeg', !item.isVeg)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px',
                      backgroundColor: item.isVeg ? '#ecfdf5' : '#fef2f2',
                      color: item.isVeg ? '#059669' : '#dc2626'
                    }}
                  >
                    {item.isVeg ? <FaLeaf size={10} /> : <FaDrumstickBite size={10} />}
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </button>
                </td>
                <td style={tableCellStyle}>
                  <button onClick={() => onRemove(i)} style={dangerBtn} title="Remove"><FaTrash size={10} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipesSection({ recipes, onRemove }) {
  const [expanded, setExpanded] = useState({});

  if (!recipes || recipes.length === 0) return null;

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={sectionTitleStyle}>
        <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px' }}>📋</span>
        </span>
        Recipes
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>({recipes.length})</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recipes.map((recipe, i) => (
          <div key={i} style={{
            border: '1px solid #e8ecf1', borderRadius: '10px', overflow: 'hidden',
            backgroundColor: '#fff'
          }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', cursor: 'pointer', backgroundColor: '#f8fafc'
              }}
              onClick={() => toggle(i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {expanded[i] ? <FaChevronUp size={10} style={{ color: '#94a3b8' }} /> : <FaChevronDown size={10} style={{ color: '#94a3b8' }} />}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{recipe.menuItemName || recipe.name || 'Unnamed Recipe'}</span>
                {recipe.ingredients && (
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    ({recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); onRemove(i); }}
                style={dangerBtn}
                title="Remove"
              >
                <FaTrash size={10} />
              </button>
            </div>
            {expanded[i] && (
              <div style={{ padding: '14px', borderTop: '1px solid #f3f4f6' }}>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div style={{ marginBottom: recipe.instructions ? '12px' : 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Ingredients
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {recipe.ingredients.map((ing, j) => (
                        <div key={j} style={{
                          fontSize: '13px', color: '#374151', padding: '4px 0',
                          display: 'flex', gap: '6px', alignItems: 'baseline'
                        }}>
                          <span style={{ color: '#94a3b8' }}>-</span>
                          <span>
                            {ing.itemName || ing.name || ing.item}
                            {(ing.qty || ing.quantity || ing.amount) && <span style={{ color: '#64748b' }}>{' '}({ing.qty || ing.quantity || ing.amount}{ing.unit ? ` ${ing.unit}` : ''})</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {recipe.instructions && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Instructions
                    </div>
                    <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {recipe.instructions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPreview({ data, setData, onBack, onConfirm, loading, error }) {
  const removeInventoryItem = (index) => {
    setData(prev => ({ ...prev, inventoryItems: prev.inventoryItems.filter((_, i) => i !== index) }));
  };
  const changeInventoryItem = (index, field, value) => {
    setData(prev => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };
  const removeCategory = (index) => {
    setData(prev => ({ ...prev, menuCategories: prev.menuCategories.filter((_, i) => i !== index) }));
  };
  const removeMenuItem = (index) => {
    setData(prev => ({ ...prev, menuItems: prev.menuItems.filter((_, i) => i !== index) }));
  };
  const changeMenuItem = (index, field, value) => {
    setData(prev => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };
  const removeRecipe = (index) => {
    setData(prev => ({ ...prev, recipes: prev.recipes.filter((_, i) => i !== index) }));
  };

  const totalItems = (data.inventoryItems?.length || 0) + (data.menuCategories?.length || 0) +
    (data.menuItems?.length || 0) + (data.recipes?.length || 0);

  return (
    <div>
      <div style={{
        padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px',
        marginBottom: '20px', fontSize: '13px', color: '#166534', fontWeight: 500
      }}>
        AI found {totalItems} item{totalItems !== 1 ? 's' : ''} to import. Review and edit before confirming.
      </div>

      <InventoryItemsSection items={data.inventoryItems} onRemove={removeInventoryItem} onChange={changeInventoryItem} />
      <MenuCategoriesSection categories={data.menuCategories} onRemove={removeCategory} />
      <MenuItemsSection items={data.menuItems} onRemove={removeMenuItem} onChange={changeMenuItem} />
      <RecipesSection recipes={data.recipes} onRemove={removeRecipe} />

      {totalItems === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
          All items have been removed. Go back to parse again or close the modal.
        </div>
      )}

      {error && (
        <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle size={12} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={onBack} style={secondaryBtn}>
          <FaArrowLeft size={11} /> Back
        </button>
        <button
          onClick={onConfirm}
          disabled={totalItems === 0 || loading}
          style={{
            ...primaryBtn,
            opacity: (totalItems === 0 || loading) ? 0.6 : 1,
            cursor: (totalItems === 0 || loading) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? <Spinner /> : <FaCheck size={12} />}
          {loading ? 'Importing...' : 'Import All'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Result ─────────────────────────────────────────────────────────

function StepResult({ result, onDone }) {
  const summary = result.summary || {};
  const counts = [
    { label: 'Inventory Items', count: summary.inventoryItems || 0, color: '#059669', bg: '#ecfdf5' },
    { label: 'Menu Categories', count: summary.menuCategories || 0, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Menu Items', count: summary.menuItems || 0, color: '#d97706', bg: '#fef3c7' },
    { label: 'Recipes', count: summary.recipes || 0, color: '#db2777', bg: '#fce7f3' },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          <FaCheck size={24} style={{ color: 'white' }} />
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
          Import Successful
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          {result.message || 'All items have been imported successfully.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {counts.map((item, i) => (
          <div key={i} style={{
            padding: '14px', borderRadius: '10px', backgroundColor: item.bg,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.count}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: item.color, opacity: 0.8, marginTop: '2px' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {result.errors && result.errors.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
            Some errors occurred:
          </div>
          {result.errors.map((err, i) => (
            <div key={i} style={{
              padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: '6px',
              fontSize: '12px', color: '#dc2626', marginBottom: '4px'
            }}>
              {typeof err === 'string' ? err : err.message || JSON.stringify(err)}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={onDone} style={{ ...primaryBtn, padding: '12px 36px', fontSize: '14px' }}>
          <FaCheck size={12} /> Done
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export default function SmartImportModal({ isOpen, onClose, restaurantId, onSuccess }) {
  const [step, setStep] = useState(1);
  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setStep(1);
    setText('');
    setParsedData(null);
    setResult(null);
    setLoading(false);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleParse = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.request(`/api/inventory/${restaurantId}/smart-import/parse`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setParsedData(res.data);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to parse text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.request(`/api/inventory/${restaurantId}/smart-import/confirm`, {
        method: 'POST',
        body: JSON.stringify(parsedData),
      });
      setResult(res);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to import. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    handleClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const stepTitles = { 1: 'Smart Import', 2: 'Review & Edit', 3: 'Import Complete' };

  return createPortal(
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)'
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMagic size={14} /> {stepTitles[step]}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  width: s === step ? '20px' : '8px', height: '8px',
                  borderRadius: '4px', transition: 'all 0.3s',
                  backgroundColor: s <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'
                }} />
              ))}
            </div>
            <button onClick={handleClose} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex',
            }}>
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
          {step === 1 && (
            <StepInput text={text} setText={setText} onParse={handleParse} loading={loading} error={error} />
          )}
          {step === 2 && parsedData && (
            <StepPreview
              data={parsedData}
              setData={setParsedData}
              onBack={() => { setStep(1); setError(''); }}
              onConfirm={handleConfirm}
              loading={loading}
              error={error}
            />
          )}
          {step === 3 && result && (
            <StepResult result={result} onDone={handleDone} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
