'use client';

// Books → Expenses → History (posSettings.booksAuditTrail, off by default): every expense added,
// edited or deleted — before and after, who, when and why — the edit log auditors ask for. Turning it
// on (owner) only starts keeping the record; expenses work exactly as before.
import { useCallback, useEffect, useState } from 'react';
import { FaTimes, FaHistory } from 'react-icons/fa';
import { paymentMethodLabel } from '../../../../utils/paymentMethodOptions';

const ACTION = {
  add: { label: 'Added', color: '#059669', bg: '#ecfdf5' },
  edit: { label: 'Edited', color: '#2563eb', bg: '#eff6ff' },
  delete: { label: 'Deleted', color: '#dc2626', bg: '#fef2f2' },
};
const FIELDS = [['amount', 'Amount'], ['category', 'Category'], ['date', 'Date'], ['description', 'Note'], ['vendor', 'Vendor'], ['paymentMethod', 'Paid by']];

const show = (k, v, formatCurrency, catLabel) => {
  if (v == null || v === '') return '—';
  if (k === 'amount') return formatCurrency(Number(v) || 0);
  if (k === 'date') { const d = new Date(v); return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
  if (k === 'category') return catLabel(v);
  if (k === 'paymentMethod') return paymentMethodLabel(v);
  return String(v);
};

export default function BooksHistoryModal({ open, onClose, restaurantId, apiClient, formatCurrency, CATEGORY_LABELS_MAP = {}, onEnabledChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const catLabel = (c) => CATEGORY_LABELS_MAP[c] || c;

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try { setData(await apiClient.getBooksAuditLog(restaurantId, { entity: 'expense', limit: 300 })); }
    catch (e) { setError(e.message || 'Could not load history'); }
    setLoading(false);
  }, [restaurantId, apiClient]);

  useEffect(() => { if (open) load(); }, [open, load]);

  if (!open) return null;

  const setOn = async (on) => {
    setSaving(true); setError('');
    try {
      await apiClient.updateRestaurant(restaurantId, { posSettingsPatch: { booksAuditTrail: on ? true : null } });
      onEnabledChange && onEnabledChange(on);
      await load();
    } catch (e) {
      setError(/denied|403/i.test(e.message || '') ? 'Only the owner can change this.' : (e.message || 'Could not save'));
    }
    setSaving(false);
  };

  const enabled = !!(data && data.enabled);
  const entries = (data && data.entries) || [];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} data-testid="books-history-modal" style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaHistory color="#2563eb" />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Expense history</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 6 }}><FaTimes /></button>
        </div>

        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: enabled ? '#ecfdf5' : '#f8fafc', border: `1px solid ${enabled ? '#a7f3d0' : '#e2e8f0'}` }}>
            <div style={{ flex: 1, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              {enabled
                ? <><b>Keeping a record</b> of every expense added, edited or deleted: who, when, before and after.</>
                : <>Keep a record of every expense added, edited or deleted (who, when, before and after), the edit log auditors ask for. Expenses work the same.</>}
            </div>
            {data && (
              <button onClick={() => setOn(!enabled)} disabled={saving} data-testid="books-history-toggle" style={{ padding: '8px 14px', borderRadius: 8, border: enabled ? '1px solid #cbd5e1' : 'none', background: enabled ? '#fff' : '#2563eb', color: enabled ? '#334155' : '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                {saving ? 'Saving…' : enabled ? 'Turn off' : 'Turn on'}
              </button>
            )}
          </div>

          {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>{error}</div>}
          {loading && <div style={{ fontSize: 13, color: '#6b7280' }}>Loading…</div>}
          {!loading && data && entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 10px', fontSize: 13, color: '#9ca3af' }}>{enabled ? 'No changes yet.' : 'Nothing recorded.'}</div>
          )}

          {entries.map(e => {
            const a = ACTION[e.action] || ACTION.edit;
            const b = e.before || {}, n = e.after || {};
            const rec = e.action === 'delete' ? b : n;
            const changed = e.action === 'edit' ? FIELDS.filter(([k]) => JSON.stringify(b[k] ?? null) !== JSON.stringify(n[k] ?? null)) : [];
            return (
              <div key={e.id} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: a.bg, color: a.color }}>{a.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{show('amount', rec.amount, formatCurrency, catLabel)}</span>
                  <span style={{ fontSize: 13, color: '#475569' }}>{[catLabel(rec.category || ''), rec.description].filter(Boolean).join(' · ')}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>
                    {new Date(e.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}{e.by ? ` · ${e.by}` : ''}{e.role ? ` (${e.role})` : ''}
                  </span>
                </div>
                {changed.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                    {changed.map(([k, l]) => (
                      <div key={k}>{l}: <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{show(k, b[k], formatCurrency, catLabel)}</span> → <b>{show(k, n[k], formatCurrency, catLabel)}</b></div>
                    ))}
                  </div>
                )}
                {e.reason && <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>Reason: {e.reason}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
