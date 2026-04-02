'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaTimes, FaSave, FaBook, FaBalanceScale, FaListAlt } from 'react-icons/fa';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};
const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fff', color: '#1f2937',
};
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnPrimary = {
  padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px',
  fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
};

const ACCOUNT_TYPES = {
  asset: { color: '#2563eb', bg: '#eff6ff', label: 'Assets' },
  liability: { color: '#dc2626', bg: '#fef2f2', label: 'Liabilities' },
  equity: { color: '#7c3aed', bg: '#f5f3ff', label: 'Equity' },
  revenue: { color: '#059669', bg: '#ecfdf5', label: 'Revenue' },
  expense: { color: '#ea580c', bg: '#fff7ed', label: 'Expenses' },
};

const SUB_TABS = [
  { key: 'entries', label: 'Journal Entries', icon: FaBook },
  { key: 'trial', label: 'Trial Balance', icon: FaBalanceScale },
  { key: 'accounts', label: 'Chart of Accounts', icon: FaListAlt },
];

export default function LedgerTab({ restaurantId, apiClient, isMobile, formatCurrency }) {
  const [subTab, setSubTab] = useState('entries');
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', debitAccount: '', creditAccount: '', amount: '' });

  const fetchData = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      if (subTab === 'entries') {
        const res = await apiClient.getLedgerEntries(restaurantId, { limit: '100' });
        setEntries(res?.entries || []);
      } else if (subTab === 'trial') {
        const res = await apiClient.getTrialBalance(restaurantId);
        setTrialBalance(res);
      } else if (subTab === 'accounts') {
        const res = await apiClient.getLedgerAccounts(restaurantId);
        setAccounts(res?.accounts || []);
      }
    } catch (err) {
      console.error('Ledger fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [subTab, restaurantId]);

  // Ensure accounts are loaded for the entry form
  useEffect(() => {
    if (accounts.length === 0 && restaurantId) {
      apiClient.getLedgerAccounts(restaurantId).then(res => setAccounts(res?.accounts || [])).catch(() => {});
    }
  }, [restaurantId]);

  const handleAddEntry = async () => {
    if (!form.debitAccount || !form.creditAccount || !form.amount) return;
    try {
      await apiClient.createJournalEntry(restaurantId, form);
      setShowAddModal(false);
      setForm({ date: new Date().toISOString().split('T')[0], description: '', debitAccount: '', creditAccount: '', amount: '' });
      fetchData();
    } catch (err) {
      console.error('Create entry error:', err);
    }
  };

  const groupedAccounts = Object.entries(ACCOUNT_TYPES).map(([type, meta]) => ({
    ...meta, type,
    items: accounts.filter(a => a.type === type).sort((a, b) => a.code.localeCompare(b.code)),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
          {SUB_TABS.map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                backgroundColor: subTab === t.key ? 'white' : 'transparent',
                color: subTab === t.key ? '#2563eb' : '#64748b',
                boxShadow: subTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
              <t.icon size={11} /> {t.label}
            </button>
          ))}
        </div>
        {subTab === 'entries' && (
          <button onClick={() => setShowAddModal(true)} style={btnPrimary}><FaPlus size={11} /> Add Entry</button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading...
        </div>
      ) : (
        <>
          {/* Journal Entries */}
          {subTab === 'entries' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Journal Entries</h3>
              {entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <FaBook size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No journal entries yet. Add your first entry to get started.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        {['Date', 'Description', 'Debit Account', 'Credit Account', 'Amount', 'Type'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => (
                        <tr key={e.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 10px', color: '#6b7280' }}>{e.date ? new Date(e.date?._seconds ? e.date._seconds * 1000 : e.date).toLocaleDateString('en-IN') : ''}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#111827' }}>{e.description || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#dc2626' }}>{e.debitAccountName || e.debitAccount}</td>
                          <td style={{ padding: '8px 10px', color: '#059669' }}>{e.creditAccountName || e.creditAccount}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#111827' }}>{formatCurrency(e.amount)}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#64748b' }}>{e.reference?.type || 'manual'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Trial Balance */}
          {subTab === 'trial' && trialBalance && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>Trial Balance</h3>
                <span style={{
                  padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  backgroundColor: trialBalance.totals?.isBalanced ? '#d1fae5' : '#fef2f2',
                  color: trialBalance.totals?.isBalanced ? '#065f46' : '#991b1b',
                }}>
                  {trialBalance.totals?.isBalanced ? 'Balanced' : `Difference: ${formatCurrency(Math.abs(trialBalance.totals?.difference || 0))}`}
                </span>
              </div>
              {(trialBalance.trialBalance || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '13px' }}>No transactions recorded yet. Add journal entries to see the trial balance.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        {['Code', 'Account', 'Type', 'Debit', 'Credit', 'Balance'].map(h => (
                          <th key={h} style={{ textAlign: h === 'Debit' || h === 'Credit' || h === 'Balance' ? 'right' : 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(trialBalance.trialBalance || []).map((row, i) => {
                        const typeInfo = ACCOUNT_TYPES[row.type] || {};
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontFamily: 'monospace' }}>{row.code}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 600, color: '#111827' }}>{row.name}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: typeInfo.bg, color: typeInfo.color }}>{row.type}</span>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#111827' }}>{row.debit > 0 ? formatCurrency(row.debit) : '—'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#111827' }}>{row.credit > 0 ? formatCurrency(row.credit) : '—'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: row.balance >= 0 ? '#059669' : '#dc2626' }}>{formatCurrency(Math.abs(row.balance))}{row.balance < 0 ? ' Cr' : ' Dr'}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: '2px solid #374151', backgroundColor: '#f9fafb' }}>
                        <td colSpan={3} style={{ padding: '10px', fontWeight: 700, color: '#111827', fontSize: '13px' }}>Totals</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatCurrency(trialBalance.totals?.debit || 0)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatCurrency(trialBalance.totals?.credit || 0)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: trialBalance.totals?.isBalanced ? '#059669' : '#dc2626' }}>{formatCurrency(Math.abs(trialBalance.totals?.difference || 0))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Chart of Accounts */}
          {subTab === 'accounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {groupedAccounts.map(group => (
                <div key={group.type} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '4px', height: '20px', borderRadius: '2px', backgroundColor: group.color }} />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: group.color }}>{group.label}</h3>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>({group.items.length})</span>
                  </div>
                  {group.items.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', padding: '8px 0' }}>No accounts in this category</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
                      {group.items.map(acc => (
                        <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: group.bg, border: `1px solid ${group.color}15` }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: group.color, minWidth: '42px' }}>{acc.code}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{acc.name}</span>
                          {acc.isSystem && <span style={{ fontSize: '9px', color: '#9ca3af', marginLeft: 'auto' }}>System</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Entry Modal */}
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Add Journal Entry</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <FaTimes size={13} />
              </button>
            </div>
            <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Monthly rent payment" style={inputStyle} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#dc2626' }}>Debit Account *</label>
                  <select value={form.debitAccount} onChange={e => setForm(f => ({ ...f, debitAccount: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select debit account...</option>
                    {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#059669' }}>Credit Account *</label>
                  <select value={form.creditAccount} onChange={e => setForm(f => ({ ...f, creditAccount: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select credit account...</option>
                    {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Amount *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddEntry} style={btnPrimary}><FaSave size={12} /> Add Entry</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
