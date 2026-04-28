'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSave, FaReceipt, FaPlus, FaTrash } from 'react-icons/fa';

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

function ManageCategoriesModal({ customCategories, onSave, onClose, getModalStyles, getModalContentStyles }) {
  const [cats, setCats] = useState(customCategories || []);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (!value) return;
    if (cats.some(c => c.value === value)) return;
    setCats([...cats, { value, label, color: newColor }]);
    setNewLabel('');
    setNewColor(PRESET_COLORS[(cats.length + 1) % PRESET_COLORS.length]);
  };

  const handleRemove = (value) => {
    setCats(cats.filter(c => c.value !== value));
  };

  return createPortal(
    <div style={{ ...getModalStyles(), zIndex: 10003, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...getModalContentStyles(), padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
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
            Default categories (Rent, Utilities, etc.) are always available. Add your own custom categories below.
          </p>

          {/* Add New Category */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Category</label>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                placeholder="e.g. Transport, Packaging"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</label>
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
          {cats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cats.map(cat => (
                <div key={cat.value} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', backgroundColor: '#fff', borderRadius: '10px',
                  border: '1px solid #f3f4f6',
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '6px',
                    backgroundColor: cat.color || '#6b7280', flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{cat.label}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{cat.value}</span>
                  <button onClick={() => handleRemove(cat.value)} style={{
                    background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
              No custom categories added yet.
            </div>
          )}
        </div>

        <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{
            padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
            borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={() => { onSave(cats); onClose(); }} style={{
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
    EXPENSE_CATEGORIES, PAYMENT_METHODS,
    showManageCategories, setShowManageCategories,
    customCategories, handleSaveCustomCategories,
  } = props;

  if (typeof document === 'undefined') return null;

  return (
    <>
      {showManageCategories && (
        <ManageCategoriesModal
          customCategories={customCategories}
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
    EXPENSE_CATEGORIES, PAYMENT_METHODS,
  } = props;

  const isEdit = !!editingExpense;
  const close = () => {
    setShowAddExpenseModal(false);
    setEditingExpense(null);
    setExpenseFormData({
      category: '', amount: '', date: new Date().toISOString().split('T')[0],
      description: '', paymentMethod: 'cash', vendor: '', isRecurring: false, recurringFrequency: 'monthly'
    });
  };
  const update = (field, value) => setExpenseFormData(prev => ({ ...prev, [field]: value }));

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
              <CustomSelect value={expenseFormData.category} onChange={v => update('category', v)} options={EXPENSE_CATEGORIES} placeholder="Select category" />
            </div>
            <div>
              <label style={labelStyle}>Amount *</label>
              <FocusInput type="number" value={expenseFormData.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" />
            </div>
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
