'use client';

import { FaPlus, FaReceipt, FaEdit, FaTrash, FaSync, FaCog } from 'react-icons/fa';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};

const DEFAULT_CATEGORY_COLORS = {
  rent: '#2563eb', utilities: '#f59e0b', salaries: '#059669', marketing: '#8b5cf6',
  repairs: '#ef4444', supplies: '#06b6d4', insurance: '#ec4899', licenses: '#6366f1',
  equipment: '#14b8a6', miscellaneous: '#6b7280',
};

export default function ExpensesTab({
  expensesList, expensesSummary, loadingExpenses, isMobile, formatCurrency,
  setShowAddExpenseModal, handleEditExpense, handleDeleteExpense,
  expenseCategoryFilter, setExpenseCategoryFilter, EXPENSE_CATEGORIES,
  setShowManageCategories, CATEGORY_LABELS_MAP, CATEGORY_COLORS_MAP,
}) {
  const getCatLabel = (key) => CATEGORY_LABELS_MAP?.[key] || key;
  const getCatColor = (key) => CATEGORY_COLORS_MAP?.[key] || DEFAULT_CATEGORY_COLORS[key] || '#6b7280';

  const { total, byCategory, count } = expensesSummary || {};

  const categoryData = Object.entries(byCategory || {}).map(([key, val]) => ({ name: key, amount: val })).sort((a, b) => b.amount - a.amount);
  const maxCat = categoryData.length ? Math.max(...categoryData.map(c => c.amount)) : 0;

  // Find top category
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  // Count recurring
  const recurringTotal = expensesList?.filter(e => e.isRecurring).reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={expenseCategoryFilter}
            onChange={e => setExpenseCategoryFilter(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
              fontSize: '13px', fontWeight: 600, color: '#334155', backgroundColor: 'white',
              cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowManageCategories(true)}
            style={{
              padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569',
              border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <FaCog size={11} /> Categories
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            style={{
              padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}
          >
            <FaPlus size={11} /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Total Expenses</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{formatCurrency(total || 0)}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{count || 0} entries</div>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Recurring Total</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{formatCurrency(recurringTotal)}</div>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Top Category</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', textTransform: 'capitalize' }}>{topCategory ? (getCatLabel(topCategory.name)) : '—'}</div>
          {topCategory && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{formatCurrency(topCategory.amount)}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr', gap: '16px' }}>
        {/* Category Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaReceipt size={14} style={{ color: '#2563eb' }} />
            By Category
          </div>
          {categoryData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryData.map((cat, i) => {
                const pct = maxCat > 0 ? (cat.amount / maxCat) * 100 : 0;
                const color = getCatColor(cat.name);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{getCatLabel(cat.name)}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(cat.amount)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: '13px' }}>No expenses yet.</div>
          )}
        </div>

        {/* Expense List */}
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
            Expenses
            {loadingExpenses && <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginLeft: '8px' }}>Loading...</span>}
          </div>
          {expensesList?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expensesList.map((expense) => {
                const color = getCatColor(expense.category);
                return (
                  <div key={expense.id} style={{
                    padding: '12px 14px', backgroundColor: '#fafafa', borderRadius: '10px',
                    border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.03em',
                          backgroundColor: `${color}18`, color: color,
                        }}>
                          {getCatLabel(expense.category)}
                        </span>
                        {expense.isRecurring && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#8b5cf6', fontWeight: 600 }}>
                            <FaSync size={8} /> {expense.recurringFrequency}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {expense.date ? new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{formatCurrency(expense.amount)}</span>
                        {expense.description && <span style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.description}</span>}
                      </div>
                      {(expense.vendor || expense.paymentMethod) && (
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                          {expense.vendor && <span>{expense.vendor}</span>}
                          {expense.vendor && expense.paymentMethod && <span> {'\u00B7'} </span>}
                          {expense.paymentMethod && <span style={{ textTransform: 'capitalize' }}>{expense.paymentMethod}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleEditExpense(expense)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb',
                          backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#6b7280', transition: 'all 0.15s',
                        }}
                        title="Edit"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Delete this expense?')) handleDeleteExpense(expense.id); }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#ef4444', transition: 'all 0.15s',
                        }}
                        title="Delete"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: '13px' }}>
              No expenses found. Click &ldquo;Add Expense&rdquo; to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
