'use client';

import { createPortal } from 'react-dom';
import { FaTimes, FaSave, FaReceipt } from 'react-icons/fa';

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

export default function BooksModals(props) {
  const {
    showAddExpenseModal, setShowAddExpenseModal, editingExpense, setEditingExpense,
    expenseFormData, setExpenseFormData,
    handleAddExpense, handleUpdateExpense,
    getModalStyles, getModalContentStyles,
    EXPENSE_CATEGORIES, PAYMENT_METHODS
  } = props;

  if (!showAddExpenseModal || typeof document === 'undefined') return null;

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
