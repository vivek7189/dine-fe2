'use client';

// Books → Petty cash (posSettings.pettyCash, off by default): a cash box kept apart from the till.
// Top up (cash put in), Spend (paid out — also saved as an expense, so P&L includes it), Count (cash
// counted; a difference is saved as over / short). Balance and entries for the Books period.
import { useCallback, useEffect, useState } from 'react';
import { FaPlus, FaMinus, FaCalculator, FaWallet, FaBan } from 'react-icons/fa';

const card = { backgroundColor: 'white', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
const input = { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };
const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };
const btn = (bg, color = '#fff') => ({ padding: '10px 16px', background: bg, color, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 });
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Books period → from / to (this device's day boundaries, same presets as the period picker).
function rangeOf(period, customStart, customEnd) {
  const now = new Date();
  const sod = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const eod = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
  let from = new Date(now.getFullYear(), now.getMonth(), 1), to = eod(now);
  if (period === 'today') from = sod(now);
  else if (period === '7d') { from = sod(now); from.setDate(from.getDate() - 7); }
  else if (period === '30d') { from = sod(now); from.setDate(from.getDate() - 30); }
  else if (period === 'last_month') { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); to = eod(new Date(now.getFullYear(), now.getMonth(), 0)); }
  else if (period === 'this_year') from = new Date(now.getFullYear(), 0, 1);
  else if (period === 'custom') { if (customStart) from = sod(`${customStart}T00:00:00`); if (customEnd) to = eod(`${customEnd}T00:00:00`); }
  return { from: from.toISOString(), to: to.toISOString() };
}

const KIND = {
  topup: { label: 'Top up', color: '#059669', bg: '#ecfdf5' },
  spend: { label: 'Spend', color: '#dc2626', bg: '#fef2f2' },
  adjust: { label: 'Count', color: '#7c3aed', bg: '#f5f3ff' },
};

export default function PettyCashTab({ restaurantId, apiClient, formatCurrency, isMobile, period, customStart, customEnd, EXPENSE_CATEGORIES = [], CATEGORY_LABELS_MAP = {}, setError, setSuccess, onEnabledChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // { kind, amount, date, category, description, paidTo, source } | { kind: 'count', counted, note }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const r = await apiClient.getPettyCash(restaurantId, rangeOf(period, customStart, customEnd));
      setData(r);
    } catch (e) { setError && setError(e.message || 'Could not load petty cash'); }
    setLoading(false);
  }, [restaurantId, apiClient, period, customStart, customEnd, setError]);

  useEffect(() => { load(); }, [load]);

  const turnOn = async () => {
    setSaving(true);
    try {
      await apiClient.updateRestaurant(restaurantId, { posSettingsPatch: { pettyCash: true } });
      onEnabledChange && onEnabledChange(true);
      await load();
    } catch (e) {
      setError && setError(/denied|403/i.test(e.message || '') ? 'Only the owner can turn on petty cash.' : (e.message || 'Could not turn on'));
    }
    setSaving(false);
  };

  const submit = async () => {
    if (!form || saving) return;
    setSaving(true); setFormError('');
    try {
      if (form.kind === 'count') {
        const r = await apiClient.countPettyCash(restaurantId, { counted: form.counted, note: form.note });
        setSuccess && setSuccess(r.matched ? 'Cash count matches the book balance.' : `Cash count saved: ${r.difference > 0 ? 'over' : 'short'} by ${formatCurrency(Math.abs(r.difference))}.`);
      } else {
        await apiClient.addPettyCashEntry(restaurantId, form);
        setSuccess && setSuccess(form.kind === 'topup' ? 'Top up saved.' : 'Spend saved (also in Expenses).');
      }
      setForm(null);
      await load();
    } catch (e) { setFormError(e.message || 'Could not save'); }
    setSaving(false);
  };

  const voidEntry = async (e) => {
    const reason = typeof window !== 'undefined' ? window.prompt(`Void this ${KIND[e.kind]?.label.toLowerCase() || 'entry'} of ${formatCurrency(Math.abs(e.amount))}? Reason (optional):`, '') : '';
    if (reason === null) return;
    try {
      await apiClient.voidPettyCashEntry(restaurantId, e.id, reason);
      setSuccess && setSuccess('Entry voided.');
      await load();
    } catch (err) { setError && setError(err.message || 'Could not void'); }
  };

  if (loading && !data) return <div style={{ ...card, color: '#6b7280', fontSize: 14 }}>Loading petty cash…</div>;

  if (data && data.enabled === false) {
    return (
      <div style={{ ...card, maxWidth: 560 }} data-testid="petty-cash-off">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <FaWallet color="#2563eb" size={18} />
          <span style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>Petty cash</span>
        </div>
        <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 6px' }}>Keep a cash box for small bills, apart from the till.</p>
        <ul style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px', paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Top up the box, and record each payment out of it with a category.</li>
          <li>Payments also show in Expenses and P&amp;L.</li>
          <li>Count the cash any time; any difference is recorded as over or short.</li>
        </ul>
        <button onClick={turnOn} disabled={saving} data-testid="petty-cash-turn-on" style={btn(saving ? '#9ca3af' : '#2563eb')}>{saving ? 'Turning on…' : 'Turn on petty cash'}</button>
      </div>
    );
  }
  if (!data) return null;

  const t = data.totals || {};
  const catLabel = (c) => CATEGORY_LABELS_MAP[c] || c || '';
  const cats = EXPENSE_CATEGORIES.length ? EXPENSE_CATEGORIES : [{ value: 'miscellaneous', label: 'Miscellaneous' }];
  const byCat = Object.entries(data.byCategory || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => { setFormError(''); setForm({ kind: 'topup', amount: '', date: today(), source: '', description: '' }); }} data-testid="petty-topup" style={btn('#059669')}><FaPlus size={10} /> Top up</button>
        <button onClick={() => { setFormError(''); setForm({ kind: 'spend', amount: '', date: today(), category: cats[0].value, description: '', paidTo: '' }); }} data-testid="petty-spend" style={btn('#dc2626')}><FaMinus size={10} /> Spend</button>
        <button onClick={() => { setFormError(''); setForm({ kind: 'count', counted: '', note: '' }); }} data-testid="petty-count" style={btn('#f1f5f9', '#334155')}><FaCalculator size={11} /> Count cash</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { k: 'In the box now', v: data.balance, c: '#111827', big: true },
          { k: 'Topped up', v: t.topups, c: '#059669' },
          { k: 'Spent', v: t.spends, c: '#dc2626' },
          { k: 'Over / short', v: t.adjustments, c: t.adjustments < 0 ? '#dc2626' : '#6b7280' },
        ].map(s => (
          <div key={s.k} style={card}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.k}</div>
            <div data-testid={s.big ? 'petty-balance' : undefined} style={{ fontSize: s.big ? 24 : 20, fontWeight: 800, color: s.big && s.v < 0 ? '#dc2626' : s.c, marginTop: 6 }}>{(s.v || 0) < 0 ? '−' : ''}{formatCurrency(Math.abs(s.v || 0))}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile || !byCat.length ? '1fr' : '2fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Entries</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Opening {formatCurrency(data.opening)} · Closing {formatCurrency(data.closing)}</span>
          </div>
          {data.entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#9ca3af', fontSize: 13 }}>Nothing in this period.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.entries.map(e => {
                const k = KIND[e.kind] || KIND.adjust;
                const sign = e.kind === 'spend' ? -1 : 1;
                const amt = sign * e.amount;
                const voided = !!e.voidedAt;
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 2px', borderTop: '1px solid #f3f4f6', opacity: voided ? 0.5 : 1 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: k.bg, color: k.color, flexShrink: 0 }}>{k.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: voided ? 'line-through' : 'none' }}>
                        {e.kind === 'spend' ? [catLabel(e.category), e.description, e.paidTo].filter(Boolean).join(' · ') : e.kind === 'topup' ? ([e.source, e.description].filter(Boolean).join(' · ') || 'Cash added') : `${e.description || 'Cash count'}${e.counted != null ? ` (counted ${formatCurrency(e.counted)})` : ''}`}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(e.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}{e.by ? ` · ${e.by}` : ''}{voided ? ` · voided${e.voidReason ? `: ${e.voidReason}` : ''}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: amt < 0 ? '#dc2626' : '#059669' }}>{amt < 0 ? '−' : '+'}{formatCurrency(Math.abs(amt))}</div>
                      {!voided && <div style={{ fontSize: 11, color: e.balance < 0 ? '#dc2626' : '#9ca3af' }}>bal {e.balance < 0 ? '−' : ''}{formatCurrency(Math.abs(e.balance))}</div>}
                    </div>
                    {!voided && e.kind !== 'adjust' && (
                      <button onClick={() => voidEntry(e)} title="Void" aria-label="Void" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaBan size={11} /></button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {byCat.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Spent by category</div>
            {byCat.map(([c, v]) => (
              <div key={c} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderTop: '1px solid #f3f4f6' }}>
                <span style={{ color: '#374151' }}>{catLabel(c)}</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{formatCurrency(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {form && (
        <div onClick={() => !saving && setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={ev => ev.stopPropagation()} data-testid="petty-form" style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 440, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
              {form.kind === 'topup' ? 'Top up petty cash' : form.kind === 'spend' ? 'Pay from petty cash' : 'Count the cash'}
            </div>
            {form.kind === 'count' ? (
              <>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Book balance: <b style={{ color: '#111827' }}>{formatCurrency(data.balance)}</b>. Enter what is in the box.</div>
                <div><span style={lbl}>Cash counted</span><input autoFocus type="number" min="0" step="0.01" inputMode="decimal" value={form.counted} onChange={e => setForm({ ...form, counted: e.target.value })} style={input} /></div>
                <div><span style={lbl}>Note (optional)</span><input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={input} maxLength={300} /></div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}><span style={lbl}>Amount</span><input autoFocus type="number" min="0" step="0.01" inputMode="decimal" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={input} /></div>
                  <div style={{ width: 160 }}><span style={lbl}>Date</span><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={input} /></div>
                </div>
                {form.kind === 'spend' && (
                  <>
                    <div><span style={lbl}>Category</span>
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={input}>
                        {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div><span style={lbl}>Paid to (optional)</span><input value={form.paidTo} onChange={e => setForm({ ...form, paidTo: e.target.value })} placeholder="e.g. market vendor" style={input} maxLength={120} /></div>
                  </>
                )}
                {form.kind === 'topup' && (
                  <div><span style={lbl}>From (optional)</span><input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="e.g. from the till, from bank" style={input} maxLength={120} /></div>
                )}
                <div><span style={lbl}>Note (optional)</span><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={form.kind === 'spend' ? 'e.g. gas refill, cleaning items' : ''} style={input} maxLength={300} /></div>
              </>
            )}
            {formError && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button onClick={() => setForm(null)} disabled={saving} style={btn('#f1f5f9', '#334155')}>Cancel</button>
              <button onClick={submit} disabled={saving} data-testid="petty-save" style={btn(saving ? '#9ca3af' : '#2563eb')}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
