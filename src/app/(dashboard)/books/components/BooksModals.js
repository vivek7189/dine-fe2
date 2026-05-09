'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSave, FaReceipt, FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fff', color: '#1f2937'
};

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };

function FocusInput({ style, type, ...props }) {
  const isNumeric = type === 'number';
  return (
    <input
      style={style || inputStyle}
      type={isNumeric ? 'text' : (type || 'text')}
      inputMode={isNumeric ? 'decimal' : undefined}
      onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
  );
}

function FocusTextarea({ style, ...props }) {
  return (
    <textarea
      style={{ ...(style || inputStyle), minHeight: '60px', resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
  );
}

function CustomSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
      onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
      onBlur={e => { e.target.style.borderColor = '#e8ecf1'; e.target.style.boxShadow = 'none'; }}
    >
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const PRESET_COLORS = ['#2563eb', '#f59e0b', '#059669', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a855f7'];

function ManageCategoriesModal({ customCategories, allCategories, onSave, onClose, getModalStyles, getModalContentStyles }) {
  const [cats, setCats] = useState(customCategories || []);
  // Track sub-category overrides for default categories (stored as custom entries with same value)
  const [defaultSubCatOverrides, setDefaultSubCatOverrides] = useState(() => {
    const overrides = {};
    for (const cc of (customCategories || [])) {
      // If a custom category has same value as a default, it's a sub-category override
      const defaultCat = (allCategories || []).find(d => d.value === cc.value && !cc.color);
      if (defaultCat || cc._isDefaultOverride) {
        overrides[cc.value] = cc.subCategories || [];
      }
    }
    return overrides;
  });
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newSubCat, setNewSubCat] = useState('');

  // Build full category list: defaults + custom (non-override)
  const defaultCats = (allCategories || []).filter(c => !cats.some(cc => cc.value === c.value && cc.color));
  const customOnly = cats.filter(c => c.color); // Custom categories have color set

  // Get sub-categories for a category
  const getSubCats = (catValue) => {
    // Check overrides first, then custom cats, then defaults
    if (defaultSubCatOverrides[catValue] !== undefined) return defaultSubCatOverrides[catValue];
    const custom = cats.find(c => c.value === catValue);
    if (custom?.subCategories) return custom.subCategories;
    const def = (allCategories || []).find(c => c.value === catValue);
    return def?.subCategories || [];
  };

  const setSubCats = (catValue, subCats) => {
    const isDefault = defaultCats.some(d => d.value === catValue);
    if (isDefault) {
      setDefaultSubCatOverrides(prev => ({ ...prev, [catValue]: subCats }));
    } else {
      setCats(prev => prev.map(c => c.value === catValue ? { ...c, subCategories: subCats } : c));
    }
  };

  const handleAddSubCat = (catValue) => {
    const label = newSubCat.trim();
    if (!label) return;
    const current = getSubCats(catValue);
    if (current.some(s => s.toLowerCase() === label.toLowerCase())) return;
    setSubCats(catValue, [...current, label]);
    setNewSubCat('');
  };

  const handleRemoveSubCat = (catValue, subCatLabel) => {
    const current = getSubCats(catValue);
    setSubCats(catValue, current.filter(s => s !== subCatLabel));
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (!value) return;
    if (cats.some(c => c.value === value) || defaultCats.some(c => c.value === value)) return;
    setCats([...cats, { value, label, color: newColor, subCategories: [] }]);
    setNewLabel('');
    setNewColor(PRESET_COLORS[(cats.length + 1) % PRESET_COLORS.length]);
  };

  const handleRemove = (value) => {
    setCats(cats.filter(c => c.value !== value));
  };

  const handleSave = () => {
    // Merge: custom categories + default sub-category overrides
    const toSave = [...customOnly];
    // Add default overrides as entries (so sub-categories persist)
    for (const [catValue, subCats] of Object.entries(defaultSubCatOverrides)) {
      const existing = toSave.find(c => c.value === catValue);
      if (existing) {
        existing.subCategories = subCats;
      } else {
        const def = defaultCats.find(d => d.value === catValue);
        if (def) {
          toSave.push({ value: catValue, label: def.label, subCategories: subCats });
        }
      }
    }
    onSave(toSave);
    onClose();
  };

  const renderCategoryRow = (cat, isCustom) => {
    const isExpanded = expandedCategory === cat.value;
    const subCats = getSubCats(cat.value);
    const color = cat.color || '#6b7280';

    return (
      <div key={cat.value} style={{ marginBottom: '4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', backgroundColor: '#fff', borderRadius: isExpanded ? '10px 10px 0 0' : '10px',
          border: '1px solid #f3f4f6', cursor: 'pointer',
        }} onClick={() => setExpandedCategory(isExpanded ? null : cat.value)}>
          <span style={{ color: '#9ca3af', fontSize: '10px', width: '14px', display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </span>
          <div style={{
            width: '18px', height: '18px', borderRadius: '5px',
            backgroundColor: color, flexShrink: 0,
          }} />
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{cat.label}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', marginRight: '4px' }}>
            {subCats.length > 0 ? `${subCats.length} sub` : ''}
          </span>
          {isCustom && (
            <button onClick={e => { e.stopPropagation(); handleRemove(cat.value); }} style={{
              background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px',
              display: 'flex', alignItems: 'center',
            }}>
              <FaTrash size={11} />
            </button>
          )}
        </div>
        {isExpanded && (
          <div style={{
            padding: '10px 12px 12px 44px', backgroundColor: '#f9fafb',
            border: '1px solid #f3f4f6', borderTop: 'none', borderRadius: '0 0 10px 10px',
          }}>
            {subCats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {subCats.map(sub => (
                  <div key={sub} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 8px', backgroundColor: '#fff', borderRadius: '6px',
                    border: '1px solid #e8ecf1', fontSize: '13px', color: '#374151',
                  }}>
                    <span style={{ flex: 1 }}>{sub}</span>
                    <button onClick={() => handleRemoveSubCat(cat.value, sub)} style={{
                      background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
                      padding: '2px', display: 'flex', alignItems: 'center',
                    }} title="Remove">
                      <FaTimes size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={newSubCat}
                onChange={e => setNewSubCat(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSubCat(cat.value); }}
                placeholder="Add sub-category..."
                style={{ ...inputStyle, flex: 1, padding: '7px 10px', fontSize: '12px' }}
                onClick={e => e.stopPropagation()}
              />
              <button onClick={e => { e.stopPropagation(); handleAddSubCat(cat.value); }} style={{
                padding: '7px 12px', background: '#e0e7ff', color: '#3b82f6',
                border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
              }}>
                <FaPlus size={8} /> Add
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return createPortal(
    <div style={{ ...getModalStyles(), zIndex: 10003, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...getModalContentStyles(), padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', maxWidth: '560px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
          padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Manage Expense Categories</h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaTimes size={13} />
          </button>
        </div>

        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>
            Click any category to manage its sub-categories. Add custom categories below.
          </p>

          {/* Default Categories with sub-category support */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Default Categories</div>
            {defaultCats.map(cat => renderCategoryRow(cat, false))}
          </div>

          {/* Add New Category */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Custom Categories</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                placeholder="e.g. Transport, Packaging"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
            <div>
              <input
                type="color"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
                style={{ width: '44px', height: '44px', border: '1.5px solid #e8ecf1', borderRadius: '10px', cursor: 'pointer', padding: '2px' }}
              />
            </div>
            <button onClick={handleAdd} style={{
              padding: '11px 16px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px', height: '44px', whiteSpace: 'nowrap',
            }}>
              <FaPlus size={10} /> Add
            </button>
          </div>

          {/* Custom Categories List */}
          {customOnly.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {customOnly.map(cat => renderCategoryRow(cat, true))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
              No custom categories added yet.
            </div>
          )}
        </div>

        <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{
            padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
            borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            padding: '11px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            <FaSave /> Save Categories
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function BooksModals(props) {
  const {
    showAddExpenseModal, setShowAddExpenseModal, editingExpense, setEditingExpense,
    expenseFormData, setExpenseFormData,
    handleAddExpense, handleUpdateExpense,
    getModalStyles, getModalContentStyles,
    EXPENSE_CATEGORIES, PAYMENT_METHODS, SUB_CATEGORIES_MAP,
    showManageCategories, setShowManageCategories,
    customCategories, handleSaveCustomCategories,
  } = props;

  if (typeof document === 'undefined') return null;

  return (
    <>
      {showManageCategories && (
        <ManageCategoriesModal
          customCategories={customCategories}
          allCategories={EXPENSE_CATEGORIES}
          onSave={handleSaveCustomCategories}
          onClose={() => setShowManageCategories(false)}
          getModalStyles={getModalStyles}
          getModalContentStyles={getModalContentStyles}
        />
      )}
      {showAddExpenseModal && <ExpenseFormModal {...props} />}
    </>
  );
}

function ExpenseFormModal(props) {
  const {
    showAddExpenseModal, setShowAddExpenseModal, editingExpense, setEditingExpense,
    expenseFormData, setExpenseFormData,
    handleAddExpense, handleUpdateExpense,
    getModalStyles, getModalContentStyles,
    EXPENSE_CATEGORIES, PAYMENT_METHODS, SUB_CATEGORIES_MAP,
    customCategories, handleSaveCustomCategories,
  } = props;

  const [newSubInput, setNewSubInput] = useState('');
  const isEdit = !!editingExpense;
  const close = () => {
    setShowAddExpenseModal(false);
    setEditingExpense(null);
    setExpenseFormData({
      category: '', subCategories: [], amount: '', date: new Date().toISOString().split('T')[0],
      description: '', paymentMethod: 'cash', vendor: '', isRecurring: false, recurringFrequency: 'monthly'
    });
  };
  const update = (field, value) => setExpenseFormData(prev => ({ ...prev, [field]: value }));

  // Available sub-categories for selected category
  const availableSubCats = SUB_CATEGORIES_MAP?.[expenseFormData.category] || [];
  const selectedSubCats = expenseFormData.subCategories || [];

  const toggleSubCat = (sub) => {
    const current = selectedSubCats;
    if (current.includes(sub)) {
      update('subCategories', current.filter(s => s !== sub));
    } else {
      update('subCategories', [...current, sub]);
    }
  };

  const handleAddNewSubCat = () => {
    const label = newSubInput.trim();
    if (!label) return;
    // Add to selected
    if (!selectedSubCats.includes(label)) {
      update('subCategories', [...selectedSubCats, label]);
    }
    // Also save to category's sub-categories list if not already there
    if (!availableSubCats.some(s => s.toLowerCase() === label.toLowerCase()) && handleSaveCustomCategories) {
      const catValue = expenseFormData.category;
      const updatedCats = (customCategories || []).map(c => {
        if (c.value === catValue) {
          return { ...c, subCategories: [...(c.subCategories || []), label] };
        }
        return c;
      });
      // If category not in custom list, add it as an override
      if (!updatedCats.some(c => c.value === catValue)) {
        const catDef = EXPENSE_CATEGORIES.find(c => c.value === catValue);
        if (catDef) {
          updatedCats.push({ value: catValue, label: catDef.label, subCategories: [...(catDef.subCategories || []), label] });
        }
      }
      handleSaveCustomCategories(updatedCats);
    }
    setNewSubInput('');
  };

  return createPortal(
    <div style={{ ...getModalStyles(), zIndex: 10002, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ ...getModalContentStyles(), padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaReceipt size={14} /> {isEdit ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={close} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaTimes size={13} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <CustomSelect value={expenseFormData.category} onChange={v => { update('category', v); update('subCategories', []); }} options={EXPENSE_CATEGORIES} placeholder="Select category" />
            </div>
            <div>
              <label style={labelStyle}>Amount *</label>
              <FocusInput type="number" value={expenseFormData.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" />
            </div>

            {/* Sub-category picker — shown when category is selected and has sub-categories or allows adding */}
            {expenseFormData.category && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Sub-Category</label>
                <div style={{
                  border: '1.5px solid #e8ecf1', borderRadius: '10px', padding: '8px 10px',
                  backgroundColor: '#fff', minHeight: '44px',
                }}>
                  {/* Chip tags for available sub-categories */}
                  {(availableSubCats.length > 0 || selectedSubCats.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: availableSubCats.length > 0 || selectedSubCats.length > 0 ? '8px' : 0 }}>
                      {/* Show available sub-cats as toggleable chips */}
                      {[...new Set([...availableSubCats, ...selectedSubCats])].map(sub => {
                        const isSelected = selectedSubCats.includes(sub);
                        return (
                          <button key={sub} onClick={() => toggleSubCat(sub)} style={{
                            padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                            border: isSelected ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#fff',
                            color: isSelected ? '#2563eb' : '#6b7280',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                            {isSelected && <span style={{ marginRight: '3px' }}>&#10003;</span>}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Inline add new sub-category */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      value={newSubInput}
                      onChange={e => setNewSubInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewSubCat(); } }}
                      placeholder="Type to add new..."
                      style={{
                        flex: 1, border: 'none', outline: 'none', fontSize: '12px', color: '#374151',
                        padding: '4px 2px', backgroundColor: 'transparent',
                      }}
                    />
                    {newSubInput.trim() && (
                      <button onClick={handleAddNewSubCat} style={{
                        padding: '3px 8px', background: '#e0e7ff', color: '#3b82f6',
                        border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}>
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Date *</label>
              <FocusInput type="date" value={expenseFormData.date} onChange={e => update('date', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Payment Method</label>
              <CustomSelect value={expenseFormData.paymentMethod} onChange={v => update('paymentMethod', v)} options={PAYMENT_METHODS} placeholder="Select method" />
            </div>
            <div>
              <label style={labelStyle}>Vendor</label>
              <FocusInput value={expenseFormData.vendor} onChange={e => update('vendor', e.target.value)} placeholder="e.g. Electric Company" />
            </div>
            <div>
              <label style={labelStyle}>Recurring</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '44px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input type="checkbox" checked={expenseFormData.isRecurring} onChange={e => update('isRecurring', e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                  Recurring
                </label>
                {expenseFormData.isRecurring && (
                  <select value={expenseFormData.recurringFrequency} onChange={e => update('recurringFrequency', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e8ecf1', fontSize: '12px', outline: 'none' }}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <FocusTextarea value={expenseFormData.description} onChange={e => update('description', e.target.value)} placeholder="Optional notes" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={close} style={{
            padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
            borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>Cancel</button>
          <button onClick={isEdit ? handleUpdateExpense : handleAddExpense} style={{
            padding: '11px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
            alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
          }}>
            <FaSave /> {isEdit ? 'Update' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
