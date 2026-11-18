'use client';

// Inventory → Total Value → "Stock value": how stock and COGS are costed, and (with FIFO) what the
// stock left is worth item by item, made of which purchases.
//   Latest price (default): stock and COGS use each item's latest purchase price.
//   FIFO: usage takes the oldest purchase price first; the stock left is valued at the newest
//         purchases. Changes Books COGS / P&L and the usage reports. Saved on the restaurant
//         (posSettings.inventoryCosting) — only the owner can change it.
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import apiClient from '../../../../lib/api';
import { fmtQty } from '../utils/formatQty';

const METHODS = [
  { value: 'latest', title: 'Latest purchase price', text: 'Stock and cost of goods use each item\'s latest purchase price.' },
  { value: 'fifo', title: 'FIFO (first in, first out)', text: 'Stock used is costed at the oldest purchase price first. Stock left is valued at the newest purchases. Use this when you buy the same item at different prices.' },
];

export default function StockValueModal({ open, onClose, restaurantId, costingMethod, totalValue, formatCurrency, onChanged }) {
  const [method, setMethod] = useState(costingMethod || 'latest');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) { setMethod(costingMethod || 'latest'); setError(''); } }, [open, costingMethod]);

  useEffect(() => {
    if (!open || !restaurantId || costingMethod !== 'fifo') { setData(null); return; }
    let live = true;
    setLoading(true);
    apiClient.getFifoValuation(restaurantId)
      .then(r => { if (live) setData(r); })
      .catch(e => { if (live) setError(e.message || 'Could not load FIFO value'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [open, restaurantId, costingMethod]);

  if (!open) return null;

  const save = async () => {
    if (method === (costingMethod || 'latest') || saving) return;
    setSaving(true); setError('');
    try {
      // null = back to the default (latest price), so nothing is left behind.
      await apiClient.updateRestaurant(restaurantId, { posSettingsPatch: { inventoryCosting: method === 'fifo' ? 'fifo' : null } });
      onChanged && onChanged(method);
    } catch (e) {
      setError(/denied|403/i.test(e.message || '') ? 'Only the owner can change the costing method.' : (e.message || 'Could not save'));
    } finally { setSaving(false); }
  };

  const items = (data && data.items || []).filter(i => i.currentStock > 0);
  const fmt = (n) => (formatCurrency ? formatCurrency(n) : n);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} data-testid="stock-value-modal" style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Stock value</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{fmt(totalValue || 0)} · {costingMethod === 'fifo' ? 'FIFO' : 'latest purchase price'}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 6 }}><FaTimes /></button>
        </div>

        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Costing method</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {METHODS.map(m => (
                <label key={m.value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: method === m.value ? '2px solid #2563eb' : '1px solid #e5e7eb', background: method === m.value ? '#eff6ff' : '#fff' }}>
                  <input type="radio" name="costing" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} style={{ marginTop: 3 }} />
                  <span>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#111827' }}>{m.title}</span>
                    <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 2 }}>{m.text}</span>
                  </span>
                </label>
              ))}
            </div>
            {method !== (costingMethod || 'latest') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>Changes stock value, cost of goods and P&amp;L in Books for all dates. You can switch back any time.</span>
                <button onClick={save} disabled={saving} data-testid="costing-save" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: saving ? '#9ca3af' : '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>{error}</div>}

          {costingMethod === 'fifo' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Value by item (FIFO)</div>
              {loading && <div style={{ fontSize: 13, color: '#6b7280' }}>Loading…</div>}
              {!loading && items.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af' }}>No stock on hand.</div>}
              {!loading && items.length > 0 && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={th}>Item</th>
                        <th style={{ ...th, textAlign: 'right' }}>In stock</th>
                        <th style={{ ...th, textAlign: 'right' }}>FIFO value</th>
                        <th style={{ ...th, textAlign: 'right' }}>At latest price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(i => (
                        <tr key={i.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td style={td}>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{i.name}</div>
                            {i.layers.length > 0 && (
                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                                {i.layers.map(l => `${fmtQty(l.qty)} ${i.unit || ''} @ ${fmt(l.cost)}`).join(' · ')}
                              </div>
                            )}
                          </td>
                          <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtQty(i.currentStock)} {i.unit}</td>
                          <td style={{ ...td, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(i.fifoValue)}</td>
                          <td style={{ ...td, textAlign: 'right', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(i.latestValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                        <td style={{ ...td, fontWeight: 700 }}>Total</td>
                        <td style={td} />
                        <td style={{ ...td, textAlign: 'right', fontWeight: 800 }}>{fmt(data.totalValue)}</td>
                        <td style={{ ...td, textAlign: 'right', color: '#6b7280' }}>{fmt(data.latestValue)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const th = { padding: '9px 12px', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' };
const td = { padding: '9px 12px', verticalAlign: 'top' };
