'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaTrash, FaBoxOpen, FaSearch, FaUtensils, FaCubes } from 'react-icons/fa';

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fff', color: '#1f2937'
};
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };
const fieldWrap = { marginBottom: '14px' };
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
  padding: '8px 14px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
  borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '5px'
};
const carryBtn = {
  padding: '8px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
  borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: '5px'
};

function ModalShell({ show, onClose, title, children, footer, maxWidth }) {
  if (!show || typeof document === 'undefined') return null;
  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)'
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: maxWidth || '600px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTrash size={14} /> {title}
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex',
          }}>
            <FaTimes size={13} />
          </button>
        </div>
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function ModalShellGreen({ show, onClose, title, children, footer, maxWidth }) {
  if (!show || typeof document === 'undefined') return null;
  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)'
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: maxWidth || '600px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex',
          }}>
            <FaTimes size={13} />
          </button>
        </div>
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Searchable Item/Dish Selector ──────────────────────────────────────────
function SearchableSelector({ inventoryItems, recipes, selected, onSelect }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = useMemo(() => {
    const q = search.toLowerCase().trim();
    const items = (inventoryItems || []).map(i => ({
      type: 'item', id: i.id, name: i.name, unit: i.unit,
      stock: i.currentStock, costPerUnit: i.costPerUnit || 0, raw: i
    }));
    const dishes = (recipes || []).map(r => ({
      type: 'dish', id: r.id, name: r.name || r.menuItemName,
      ingredients: r.ingredients || [], servings: r.servings || 1, raw: r
    }));
    const all = [...dishes, ...items];
    if (!q) return all;
    return all.filter(o => o.name?.toLowerCase().includes(q));
  }, [inventoryItems, recipes, search]);

  const dishCount = options.filter(o => o.type === 'dish').length;
  const itemCount = options.filter(o => o.type === 'item').length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        style={{
          ...inputStyle, display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', padding: '0 14px',
        }}
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <FaSearch size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
        {selected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '10px 0' }}>
            <span style={{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.03em',
              backgroundColor: selected.type === 'dish' ? '#fef3c7' : '#e0f2fe',
              color: selected.type === 'dish' ? '#92400e' : '#0369a1',
            }}>
              {selected.type === 'dish' ? 'Dish' : 'Item'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{selected.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null); setSearch(''); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex' }}
            >
              <FaTimes size={10} />
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search items or dishes..."
            style={{
              border: 'none', outline: 'none', flex: 1, fontSize: '14px',
              backgroundColor: 'transparent', padding: '10px 0', color: '#1f2937'
            }}
          />
        )}
      </div>

      {open && !selected && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: 'white', borderRadius: '12px', marginTop: '4px',
          border: '1.5px solid #e8ecf1', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          maxHeight: '280px', overflowY: 'auto', zIndex: 100,
        }}>
          {options.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No matches found
            </div>
          )}

          {/* Dishes section */}
          {dishCount > 0 && (
            <>
              <div style={{
                padding: '8px 14px', fontSize: '10px', fontWeight: 700, color: '#92400e',
                textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#fffbeb',
                borderBottom: '1px solid #fef3c7', position: 'sticky', top: 0, zIndex: 1,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <FaUtensils size={9} /> Dishes / Recipes ({dishCount})
              </div>
              {options.filter(o => o.type === 'dish').map(opt => (
                <div
                  key={`dish-${opt.id}`}
                  onClick={() => { onSelect(opt); setOpen(false); setSearch(''); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '10px', transition: 'background 0.1s',
                    borderBottom: '1px solid #f8fafc',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FaUtensils size={12} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{opt.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {opt.ingredients.length} ingredients · {opt.servings} serving{opt.servings !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Items section */}
          {itemCount > 0 && (
            <>
              <div style={{
                padding: '8px 14px', fontSize: '10px', fontWeight: 700, color: '#0369a1',
                textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f0f9ff',
                borderBottom: '1px solid #e0f2fe', position: 'sticky', top: dishCount > 0 ? undefined : 0, zIndex: 1,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <FaCubes size={9} /> Raw Items ({itemCount})
              </div>
              {options.filter(o => o.type === 'item').map(opt => (
                <div
                  key={`item-${opt.id}`}
                  onClick={() => { onSelect(opt); setOpen(false); setSearch(''); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '10px', transition: 'background 0.1s',
                    borderBottom: '1px solid #f8fafc',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FaCubes size={12} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{opt.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Stock: {opt.stock} {opt.unit}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick Waste Modal (Upgraded — Items + Dishes) ──────────────────────────
function QuickWasteModal({ waste, inventoryItems, recipes, formatCurrency }) {
  const { showQuickWasteModal, setShowQuickWasteModal, wasteFormData, setWasteFormData, handleCreateWasteEntry, handleCreateDishWasteEntry, loading } = waste;
  const [selected, setSelected] = useState(null);

  const isDish = selected?.type === 'dish';
  const isItem = selected?.type === 'item';

  // Compute ingredient breakdown for dish
  const ingredientBreakdown = useMemo(() => {
    if (!isDish || !wasteFormData.quantity) return [];
    const recipe = selected.raw;
    const servings = recipe.servings || 1;
    const multiplier = wasteFormData.quantity / servings;
    return (recipe.ingredients || []).map(ing => {
      const invItem = (inventoryItems || []).find(i => i.id === ing.inventoryItemId);
      const qty = Math.round(ing.quantity * multiplier * 100) / 100;
      const cost = invItem ? qty * (invItem.costPerUnit || 0) : 0;
      return {
        name: ing.inventoryItemName || ing.name,
        qty,
        unit: ing.unit,
        cost,
        stock: invItem?.currentStock,
        stockUnit: invItem?.unit,
      };
    });
  }, [isDish, selected, wasteFormData.quantity, inventoryItems]);

  const totalDishCost = ingredientBreakdown.reduce((s, i) => s + i.cost, 0);

  // Item waste value
  const itemWasteValue = isItem && wasteFormData.quantity
    ? wasteFormData.quantity * (selected.costPerUnit || 0)
    : 0;

  const handleSubmit = () => {
    if (isDish) {
      handleCreateDishWasteEntry(selected.raw, Number(wasteFormData.quantity), wasteFormData.reason, wasteFormData.notes);
      setSelected(null);
    } else {
      // Set the itemId from selected item before submitting
      setWasteFormData(prev => ({ ...prev, itemId: selected?.id }));
      // Need to call directly since setState is async
      handleCreateWasteEntry();
      setSelected(null);
    }
  };

  const handleClose = () => {
    setShowQuickWasteModal(false);
    setSelected(null);
    setWasteFormData({ itemId: '', quantity: '', reason: 'spillage', notes: '' });
  };

  // Keep wasteFormData.itemId in sync with selected item
  useEffect(() => {
    if (selected?.type === 'item') {
      setWasteFormData(prev => prev.itemId !== selected.id ? { ...prev, itemId: selected.id } : prev);
    } else {
      setWasteFormData(prev => prev.itemId ? { ...prev, itemId: '' } : prev);
    }
  }, [selected, setWasteFormData]);

  const canSubmit = selected && wasteFormData.quantity > 0 && !loading;

  return (
    <ModalShell
      show={showQuickWasteModal}
      onClose={handleClose}
      title="Log Waste"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={secondaryBtn} onClick={handleClose}>Cancel</button>
          <button
            style={{
              ...primaryBtn,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              opacity: canSubmit ? 1 : 0.5,
            }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <FaTrash size={12} /> {loading ? 'Logging...' : 'Log Waste'}
          </button>
        </div>
      }
    >
      {/* Type toggle hint */}
      <div style={{
        marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fef08a',
        fontSize: '12px', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <FaUtensils size={11} />
        Search for a <strong>dish</strong> (auto-calculates ingredients) or a <strong>raw item</strong> (direct deduction)
      </div>

      {/* Searchable selector */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Item or Dish</label>
        <SearchableSelector
          inventoryItems={inventoryItems}
          recipes={recipes}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {/* Stock info for raw items */}
      {isItem && (
        <div style={{ ...fieldWrap, padding: '10px 14px', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
          <span style={{ fontSize: '13px', color: '#0c4a6e' }}>
            Current Stock: <strong>{selected.stock} {selected.unit}</strong>
            {selected.costPerUnit > 0 && <> · Cost: <strong>{formatCurrency(selected.costPerUnit)}/{selected.unit}</strong></>}
          </span>
        </div>
      )}

      {/* Servings info for dishes */}
      {isDish && (
        <div style={{ ...fieldWrap, padding: '10px 14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fef08a' }}>
          <span style={{ fontSize: '13px', color: '#854d0e' }}>
            Recipe: <strong>{selected.name}</strong> · {selected.ingredients.length} ingredients · {selected.servings} serving{selected.servings !== 1 ? 's' : ''} per batch
          </span>
        </div>
      )}

      {/* Quantity */}
      <div style={fieldWrap}>
        <label style={labelStyle}>
          Quantity {isItem ? `(${selected.unit})` : isDish ? '(servings / plates)' : ''}
        </label>
        <input
          type="number"
          style={inputStyle}
          placeholder={isDish ? 'e.g. 2 plates wasted' : 'Enter quantity'}
          value={wasteFormData.quantity || ''}
          onChange={e => setWasteFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || '' }))}
          min="0"
          step="any"
        />
      </div>

      {/* Ingredient breakdown for dishes */}
      {isDish && ingredientBreakdown.length > 0 && wasteFormData.quantity > 0 && (
        <div style={{
          marginBottom: '14px', borderRadius: '12px', border: '1.5px solid #fef08a',
          backgroundColor: '#fffef5', overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px', backgroundColor: '#fefce8', borderBottom: '1px solid #fef08a',
            fontSize: '12px', fontWeight: 700, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <FaUtensils size={10} /> Ingredient Breakdown ({wasteFormData.quantity} {wasteFormData.quantity === 1 ? 'serving' : 'servings'})
          </div>
          <div style={{ padding: '8px 14px' }}>
            {ingredientBreakdown.map((ing, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: idx < ingredientBreakdown.length - 1 ? '1px solid #fef9c3' : 'none',
              }}>
                <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>{ing.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {ing.qty} {ing.unit}
                    {ing.stock != null && <span style={{ color: '#94a3b8' }}> / {ing.stock} {ing.stockUnit}</span>}
                  </span>
                  {ing.cost > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>
                      {formatCurrency(ing.cost)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalDishCost > 0 && (
            <div style={{
              padding: '10px 14px', borderTop: '1px solid #fef08a', backgroundColor: '#fefce8',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                Total Waste Value: {formatCurrency(totalDishCost)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Reason */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Reason</label>
        <select
          style={inputStyle}
          value={wasteFormData.reason || ''}
          onChange={e => setWasteFormData(prev => ({ ...prev, reason: e.target.value }))}
        >
          <option value="">Select reason...</option>
          <option value="spillage">Spillage</option>
          <option value="damaged">Damaged</option>
          <option value="expired">Expired</option>
          <option value="leftover">End-of-day Leftover</option>
          <option value="returned">Customer Return</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Notes */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Notes (optional)</label>
        <textarea
          style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
          placeholder="Optional notes..."
          value={wasteFormData.notes || ''}
          onChange={e => setWasteFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      {/* Waste value for raw items */}
      {isItem && itemWasteValue > 0 && (
        <div style={{
          padding: '12px 14px', backgroundColor: '#fef2f2', borderRadius: '10px',
          border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
            Waste Value
          </span>
          <span style={{ fontSize: '15px', color: '#dc2626', fontWeight: 700 }}>
            {formatCurrency(itemWasteValue)}
          </span>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Leftover Analysis Modal ────────────────────────────────────────────────
function LeftoverAnalysisModal({ waste, formatCurrency }) {
  const { showLeftoverModal, setShowLeftoverModal, leftoverAnalysis, confirmingLeftovers, handleConfirmLeftoverWaste,
    leftoverText, setLeftoverText, handleAnalyzeLeftovers, analyzingLeftovers } = waste;
  const [itemDecisions, setItemDecisions] = useState({});

  const items = leftoverAnalysis?.items || [];

  const totalWasteValue = items.reduce((sum, item, idx) => {
    if (itemDecisions[idx] === 'waste') return sum + (item.totalWasteValue || 0);
    return sum;
  }, 0);

  const wasteCount = Object.values(itemDecisions).filter(d => d === 'waste').length;

  const handleConfirm = () => {
    const wasteItems = items
      .filter((_, idx) => itemDecisions[idx] === 'waste')
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        recipeName: item.recipeName,
        recipeId: item.recipeId,
        estimatedServings: item.estimatedServings,
        ingredients: item.ingredients,
        totalWasteValue: item.totalWasteValue
      }));
    handleConfirmLeftoverWaste(wasteItems);
  };

  const handleClose = () => {
    setShowLeftoverModal(false);
    setItemDecisions({});
  };

  const thStyle = {
    textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: '#475569',
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8ecf1'
  };
  const tdStyle = { padding: '7px 10px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f1f5f9' };

  return (
    <ModalShellGreen
      show={showLeftoverModal}
      onClose={handleClose}
      title="AI Leftover Analysis"
      maxWidth="700px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
            {wasteCount > 0 ? `Total Waste: ${formatCurrency(totalWasteValue)}` : 'No items marked as waste'}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={secondaryBtn} onClick={handleClose}>Cancel</button>
            <button
              style={{ ...primaryBtn, opacity: (wasteCount === 0 || confirmingLeftovers) ? 0.6 : 1 }}
              onClick={handleConfirm}
              disabled={wasteCount === 0 || confirmingLeftovers}
            >
              <FaTrash size={12} /> {confirmingLeftovers ? 'Processing...' : 'Confirm & Deduct'}
            </button>
          </div>
        </div>
      }
    >
      {items.length === 0 && (
        <div style={{ padding: '8px 0' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6b7280' }}>
            Describe what food is left over — AI will estimate ingredient waste
          </p>
          <textarea
            rows={3}
            placeholder="e.g., 1kg paneer butter masala, 500ml dal, 3 rotis..."
            value={leftoverText || ''}
            onChange={(e) => setLeftoverText(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical',
              fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleAnalyzeLeftovers}
            disabled={analyzingLeftovers || !leftoverText?.trim()}
            style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: (!leftoverText?.trim() || analyzingLeftovers) ? '#d1d5db' : 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: (!leftoverText?.trim() || analyzingLeftovers) ? 'not-allowed' : 'pointer',
            }}
          >
            {analyzingLeftovers ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
      )}

      {items.map((item, idx) => {
        const decision = itemDecisions[idx];
        const isWaste = decision === 'waste';
        const isCarry = decision === 'carry';

        return (
          <div key={idx} style={{
            marginBottom: '16px', borderRadius: '12px', border: '1.5px solid',
            borderColor: isWaste ? '#fecaca' : isCarry ? '#bbf7d0' : '#e8ecf1',
            backgroundColor: isWaste ? '#fef2f2' : isCarry ? '#f0fdf4' : '#fff',
            overflow: 'hidden', transition: 'all 0.2s'
          }}>
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid',
              borderBottomColor: isWaste ? '#fecaca' : isCarry ? '#bbf7d0' : '#e8ecf1',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '14px', fontWeight: 700, color: '#1f2937',
                  textDecoration: isCarry ? 'line-through' : 'none'
                }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                  {item.quantity} {item.unit} &middot; {item.recipeId ? item.recipeName : 'AI estimated'}
                  {item.estimatedServings ? ` &middot; ~${item.estimatedServings} servings` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    ...dangerBtn,
                    backgroundColor: isWaste ? '#ef4444' : '#fef2f2',
                    color: isWaste ? '#fff' : '#ef4444'
                  }}
                  onClick={() => setItemDecisions(prev => ({ ...prev, [idx]: isWaste ? undefined : 'waste' }))}
                >
                  <FaTrash size={11} /> {isWaste ? 'Marked Waste' : 'Mark as Waste'}
                </button>
                <button
                  style={{
                    ...carryBtn,
                    backgroundColor: isCarry ? '#16a34a' : '#f0fdf4',
                    color: isCarry ? '#fff' : '#16a34a'
                  }}
                  onClick={() => setItemDecisions(prev => ({ ...prev, [idx]: isCarry ? undefined : 'carry' }))}
                >
                  <FaBoxOpen size={11} /> {isCarry ? 'Carrying' : 'Carry Forward'}
                </button>
              </div>
            </div>

            {item.ingredients && item.ingredients.length > 0 && (
              <div style={{ padding: '12px 16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Unit</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.ingredients.map((ing, iIdx) => (
                      <tr key={iIdx}>
                        <td style={tdStyle}>{ing.name}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{ing.qty}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>{ing.unit}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{formatCurrency(ing.wasteValue || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{
              padding: '10px 16px', borderTop: '1px solid',
              borderTopColor: isWaste ? '#fecaca' : isCarry ? '#bbf7d0' : '#f1f5f9',
              display: 'flex', justifyContent: 'flex-end'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: isWaste ? '#dc2626' : '#475569' }}>
                Waste Value: {formatCurrency(item.totalWasteValue || 0)}
              </span>
            </div>
          </div>
        );
      })}
    </ModalShellGreen>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function WasteModals({ waste, inventoryItems, recipes, formatCurrency }) {
  return (
    <>
      <QuickWasteModal waste={waste} inventoryItems={inventoryItems} recipes={recipes} formatCurrency={formatCurrency} />
      <LeftoverAnalysisModal waste={waste} formatCurrency={formatCurrency} />
    </>
  );
}
