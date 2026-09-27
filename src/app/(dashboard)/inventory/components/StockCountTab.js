'use client';

// Stock count (stock take). Staff count what is physically on the shelf; an owner / manager reviews
// the differences and posts them. Posting corrects stock by the difference (never overwrites), and
// the Variance report uses these counts to show shrinkage.
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaClipboardCheck, FaPlus, FaArrowLeft, FaCheck, FaTimes, FaSearch, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import apiClient from '../../../../lib/api';
import { toJsDate } from '../../../../utils/dateParse';
import { fmtQty } from '../utils/formatQty';

const card = { backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
const btn = (bg, color, border = 'none') => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px',
  background: bg, color, border, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
});
const input = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'white' };
const th = { padding: '9px 10px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' };
const td = { padding: '8px 10px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' };

const STATUS = {
  draft: { label: 'Counting', bg: '#fef3c7', color: '#92400e' },
  submitted: { label: 'Waiting for approval', bg: '#dbeafe', color: '#1e40af' },
  posting: { label: 'Posting…', bg: '#e0e7ff', color: '#3730a3' },
  posted: { label: 'Posted', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'Cancelled', bg: '#f3f4f6', color: '#6b7280' },
};
const Badge = ({ status }) => {
  const s = STATUS[status] || STATUS.draft;
  return <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>;
};
const fmtDate = (v) => { const d = toJsDate(v); return d ? d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'; };
const isCounted = (l) => l.countedQty !== null && l.countedQty !== undefined;
const diffOf = (l) => (isCounted(l) ? Math.round((l.countedQty - (l.systemAtCount ?? 0)) * 10000) / 10000 : null);

export default function StockCountTab({ currentRestaurant, inventoryItems = [], isMobile, formatCurrency, onPosted }) {
  const rid = currentRestaurant?.id;
  const fmt = formatCurrency || ((n) => `₹${(Number(n) || 0).toFixed(2)}`);
  const [counts, setCounts] = useState([]);
  const [canApprove, setCanApprove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [count, setCount] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [scopeType, setScopeType] = useState('all');
  const [scopeValue, setScopeValue] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [drafts, setDrafts] = useState({}); // itemId → text being typed
  const [saving, setSaving] = useState({}); // itemId → 'saving' | 'saved' | 'error'
  const [confirmPost, setConfirmPost] = useState(false);
  const savedTimers = useRef({});

  const categories = useMemo(() => [...new Set(inventoryItems.map(i => (i.category || '').trim()).filter(Boolean))].sort(), [inventoryItems]);
  const locations = useMemo(() => [...new Set(inventoryItems.map(i => (i.location || '').trim()).filter(Boolean))].sort(), [inventoryItems]);

  const loadList = useCallback(async () => {
    if (!rid) return;
    setLoading(true); setError('');
    try {
      const r = await apiClient.getStockCounts(rid);
      setCounts(r.counts || []); setCanApprove(!!r.canApprove);
    } catch (e) { setError(e.message || 'Failed to load stock counts'); }
    finally { setLoading(false); }
  }, [rid]);

  const openCount = useCallback(async (id) => {
    if (!rid || !id) return;
    setOpenId(id); setCount(null); setDrafts({}); setSaving({}); setError(''); setSearch(''); setFilter('all');
    try {
      const r = await apiClient.getStockCount(rid, id);
      setCount(r.count); setCanApprove(!!r.canApprove);
    } catch (e) { setError(e.message || 'Failed to open count'); }
  }, [rid]);

  useEffect(() => { loadList(); }, [loadList]);

  const startCount = async () => {
    if (!rid || busy) return;
    if (scopeType !== 'all' && !scopeValue) { setError(`Pick a ${scopeType === 'category' ? 'category' : 'storage area'}`); return; }
    setBusy(true); setError('');
    try {
      const r = await apiClient.createStockCount(rid, {
        name: name.trim(),
        ...(scopeType === 'category' ? { category: scopeValue } : {}),
        ...(scopeType === 'location' ? { location: scopeValue } : {}),
      });
      setShowStart(false); setName(''); setScopeType('all'); setScopeValue('');
      loadList();
      setOpenId(r.count.id); setCount(r.count); setDrafts({}); setSaving({});
    } catch (e) { setError(e.message || 'Failed to start count'); }
    finally { setBusy(false); }
  };

  const editable = count && (count.status === 'draft' || (count.status === 'submitted' && canApprove));
  // Counters count "blind" (without seeing what the system expects); approvers see the comparison.
  const showSystem = canApprove || count?.status === 'posted';

  const saveLine = async (line) => {
    const raw = drafts[line.itemId];
    if (raw === undefined) return;
    const text = String(raw).trim();
    const value = text === '' ? null : Number(text);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setSaving(p => ({ ...p, [line.itemId]: 'error' })); return;
    }
    if ((value === null && !isCounted(line)) || (value !== null && isCounted(line) && Math.abs(value - line.countedQty) < 1e-9)) {
      setDrafts(p => { const n = { ...p }; delete n[line.itemId]; return n; }); return;
    }
    setSaving(p => ({ ...p, [line.itemId]: 'saving' }));
    try {
      const r = await apiClient.saveStockCountLines(rid, count.id, [{ itemId: line.itemId, countedQty: value }]);
      setCount(r.count);
      setDrafts(p => { const n = { ...p }; delete n[line.itemId]; return n; });
      setSaving(p => ({ ...p, [line.itemId]: 'saved' }));
      clearTimeout(savedTimers.current[line.itemId]);
      savedTimers.current[line.itemId] = setTimeout(() => setSaving(p => { const n = { ...p }; delete n[line.itemId]; return n; }), 1500);
    } catch (e) {
      setSaving(p => ({ ...p, [line.itemId]: 'error' }));
      setError(e.message || 'Could not save that count');
    }
  };

  const act = async (action) => {
    if (!count || busy) return;
    if (action === 'cancel' && !confirm('Cancel this count? Nothing will change in stock.')) return;
    setBusy(true); setError('');
    try {
      // A number still in its box (typed, not yet saved) is saved before submitting / posting.
      if (action !== 'cancel') {
        for (const itemId of Object.keys(drafts)) {
          const line = (count.items || []).find(l => l.itemId === itemId);
          if (line) await saveLine(line);
        }
      }
      const r = await apiClient.stockCountAction(rid, count.id, action);
      setCount(r.count); setConfirmPost(false);
      loadList();
      if (action === 'post' && onPosted) onPosted();
    } catch (e) { setError(e.message || `Failed to ${action}`); }
    finally { setBusy(false); }
  };

  // ── Count sheet ──
  if (openId) {
    const lines = count?.items || [];
    const q = search.trim().toLowerCase();
    const shown = lines.filter(l => {
      if (q && !`${l.itemName} ${l.category}`.toLowerCase().includes(q)) return false;
      if (filter === 'todo') return !isCounted(l);
      if (filter === 'diff') return isCounted(l) && diffOf(l) !== 0;
      return true;
    });
    const s = count?.summary || { totalItems: 0, countedItems: 0, itemsWithDifference: 0, differenceValue: 0 };
    const pct = s.totalItems ? Math.round((s.countedItems / s.totalItems) * 100) : 0;
    let lastCat = null;
    const pending = Object.keys(drafts).length > 0 || Object.values(saving).includes('saving');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ ...card, padding: isMobile ? '14px' : '18px' }}>
          <button style={{ ...btn('transparent', '#374151'), padding: '4px 0', marginBottom: '8px' }} onClick={() => { setOpenId(null); setCount(null); loadList(); }}>
            <FaArrowLeft size={11} /> All counts
          </button>
          {!count ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>{error || <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading…</>}</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>{count.name}</div>
                  <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px' }}>{count.scope} · started {fmtDate(count.createdAt)}</div>
                </div>
                <Badge status={count.status} />
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                  <span>{s.countedItems} of {s.totalItems} counted</span>
                  {showSystem && s.countedItems > 0 && (
                    <span>{s.itemsWithDifference} with a difference · <b style={{ color: s.differenceValue < 0 ? '#dc2626' : s.differenceValue > 0 ? '#059669' : '#475569' }}>{fmt(s.differenceValue)}</b></span>
                  )}
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#059669', transition: 'width .2s' }} />
                </div>
              </div>
              {count.status === 'draft' && (
                <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '10px', lineHeight: 1.5 }}>
                  Type what is physically there, in the unit shown. Each number saves as soon as you leave the box. Leave items you didn&apos;t count empty — they won&apos;t change.
                  {!canApprove && ' When you finish, press Submit so the owner / manager can approve it.'}
                </div>
              )}
            </>
          )}
        </div>

        {error && count && <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{error}</div>}

        {count && (
          <div style={{ ...card, padding: isMobile ? '10px' : '14px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <FaSearch size={12} style={{ position: 'absolute', left: '10px', top: '11px', color: '#9ca3af' }} />
                <input style={{ ...input, width: '100%', paddingLeft: '28px', boxSizing: 'border-box' }} placeholder="Search item" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {[['all', 'All'], ['todo', 'Not counted'], ...(showSystem ? [['diff', 'Differences']] : [])].map(([k, label]) => (
                <button key={k} onClick={() => setFilter(k)} style={{ ...btn(filter === k ? '#059669' : '#f3f4f6', filter === k ? 'white' : '#374151'), padding: '7px 12px' }}>{label}</button>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: showSystem ? '620px' : '360px' }}>
                <thead><tr>
                  <th style={th}>Item</th>
                  <th style={th}>Counted</th>
                  {showSystem && <><th style={th}>System</th><th style={th}>Difference</th><th style={th}>Value</th></>}
                </tr></thead>
                <tbody>
                  {shown.length === 0 && (
                    <tr><td style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: '24px' }} colSpan={showSystem ? 5 : 2}>Nothing here</td></tr>
                  )}
                  {shown.map(l => {
                    const catRow = l.category !== lastCat ? (lastCat = l.category, true) : false;
                    const d = diffOf(l);
                    const val = d != null ? Math.round(d * (Number(l.costPerUnit) || 0) * 100) / 100 : null;
                    const st = saving[l.itemId];
                    const text = drafts[l.itemId] !== undefined ? drafts[l.itemId] : (isCounted(l) ? String(l.countedQty) : '');
                    return [
                      catRow && (
                        <tr key={`c-${l.itemId}`}><td colSpan={showSystem ? 5 : 2} style={{ ...td, background: '#f8fafc', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em' }}>{l.category || 'Uncategorised'}</td></tr>
                      ),
                      <tr key={l.itemId}>
                        <td style={td}>
                          <div style={{ fontWeight: 600 }}>{l.itemName}</div>
                          {l.location && <div style={{ fontSize: '11px', color: '#9ca3af' }}>{l.location}</div>}
                        </td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          {editable ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                style={{ ...input, width: '92px', borderColor: st === 'error' ? '#dc2626' : '#d1d5db' }}
                                inputMode="decimal" placeholder="—" value={text}
                                onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setDrafts(p => ({ ...p, [l.itemId]: v })); }}
                                onBlur={() => saveLine(l)}
                                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                              />
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>{l.unit}</span>
                              {st === 'saving' && <FaSpinner size={11} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />}
                              {st === 'saved' && <FaCheckCircle size={12} color="#059669" />}
                              {st === 'error' && <span style={{ fontSize: '11px', color: '#dc2626' }}>not saved</span>}
                            </span>
                          ) : (
                            <span>{isCounted(l) ? `${fmtQty(l.countedQty)} ${l.unit}` : <span style={{ color: '#9ca3af' }}>not counted</span>}</span>
                          )}
                        </td>
                        {showSystem && (
                          <>
                            <td style={{ ...td, color: '#6b7280' }}>{isCounted(l) ? `${fmtQty(l.systemAtCount)} ${l.unit}` : `${fmtQty(l.systemAtStart)} ${l.unit}`}</td>
                            <td style={{ ...td, fontWeight: 700, color: d == null || d === 0 ? '#9ca3af' : d < 0 ? '#dc2626' : '#059669' }}>
                              {d == null ? '—' : d === 0 ? 'matches' : `${d > 0 ? '+' : '−'}${fmtQty(Math.abs(d))} ${l.unit}`}
                            </td>
                            <td style={{ ...td, color: val < 0 ? '#dc2626' : val > 0 ? '#059669' : '#9ca3af' }}>{val ? fmt(val) : '—'}</td>
                          </>
                        )}
                      </tr>,
                    ];
                  })}
                </tbody>
              </table>
            </div>

            {(count.status === 'draft' || count.status === 'submitted') && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '14px', alignItems: 'center' }}>
                {pending && <span style={{ fontSize: '12px', color: '#9ca3af', marginRight: 'auto' }}>Saving…</span>}
                {(count.status === 'draft' || canApprove) && (
                  <button style={btn('white', '#991b1b', '1px solid #fecaca')} disabled={busy} onClick={() => act('cancel')}><FaTimes size={11} /> Cancel count</button>
                )}
                {count.status === 'draft' && !canApprove && (
                  <button style={btn('#059669', 'white')} disabled={busy || pending || s.countedItems === 0} onClick={() => act('submit')}><FaCheck size={11} /> Submit for approval</button>
                )}
                {canApprove && (
                  <button style={btn('#059669', 'white')} disabled={busy || pending || s.countedItems === 0} onClick={() => setConfirmPost(true)}><FaCheck size={11} /> Approve &amp; update stock</button>
                )}
              </div>
            )}
            {confirmPost && (
              <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '13px', color: '#14532d' }}>
                <div style={{ marginBottom: '8px' }}>
                  Stock will be corrected for <b>{s.itemsWithDifference}</b> item{s.itemsWithDifference === 1 ? '' : 's'} (total {fmt(s.differenceValue)}).
                  Items not counted stay as they are. Sales made after each item was counted are kept. This can&apos;t be undone.
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button style={btn('white', '#374151', '1px solid #d1d5db')} disabled={busy} onClick={() => setConfirmPost(false)}>Back</button>
                  <button style={btn('#059669', 'white')} disabled={busy} onClick={() => act('post')}>{busy ? 'Posting…' : 'Yes, update stock'}</button>
                </div>
              </div>
            )}
            {count.status === 'posted' && (
              <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#166534' }}>
                Posted {fmtDate(count.postedAt)} — {count.itemsAdjusted || 0} item{count.itemsAdjusted === 1 ? '' : 's'} corrected. Differences now show in the Variance tab.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── List ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ ...card, padding: isMobile ? '14px' : '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaClipboardCheck size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Stock count</div>
              <div style={{ fontSize: '12.5px', color: '#6b7280' }}>Count what is really on the shelf and fix the numbers.</div>
            </div>
          </div>
          <button style={btn('#059669', 'white')} onClick={() => { setShowStart(v => !v); setError(''); }}><FaPlus size={11} /> Start count</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px', marginTop: '14px' }}>
          {[
            ['1', 'Count', 'Start a count and type what you find, item by item. Staff don’t see the expected number.'],
            ['2', 'Submit', 'When done, submit it. Nothing changes in stock yet.'],
            ['3', 'Approve', 'Owner / manager checks the differences and approves — stock is corrected and the Variance tab shows the loss.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #eef2f7' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}><span style={{ color: '#059669' }}>{n}.</span> {t}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>

        {showStart && (
          <div style={{ marginTop: '14px', padding: '14px', borderRadius: '12px', border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>WHAT TO COUNT</label>
              <select style={input} value={scopeType} onChange={e => { setScopeType(e.target.value); setScopeValue(''); }}>
                <option value="all">All items</option>
                {categories.length > 0 && <option value="category">One category</option>}
                {locations.length > 0 && <option value="location">One storage area</option>}
              </select>
            </div>
            {scopeType !== 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>{scopeType === 'category' ? 'CATEGORY' : 'AREA'}</label>
                <select style={input} value={scopeValue} onChange={e => setScopeValue(e.target.value)}>
                  <option value="">Select…</option>
                  {(scopeType === 'category' ? categories : locations).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>NAME (OPTIONAL)</label>
              <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Month-end count" />
            </div>
            <button style={btn('#059669', 'white')} disabled={busy} onClick={startCount}>{busy ? 'Starting…' : 'Start'}</button>
          </div>
        )}
        {error && <div style={{ marginTop: '10px', fontSize: '13px', color: '#b91c1c' }}>{error}</div>}
      </div>

      <div style={{ ...card, padding: isMobile ? '10px' : '14px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : counts.length === 0 ? (
          <div style={{ padding: '32px 12px', textAlign: 'center', color: '#9ca3af', fontSize: '13.5px' }}>No counts yet. Start one — a monthly count is a good habit.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead><tr>
                <th style={th}>Count</th><th style={th}>Started</th><th style={th}>Progress</th><th style={th}>Status</th>
                {canApprove && <th style={th}>Difference</th>}<th style={th}></th>
              </tr></thead>
              <tbody>
                {counts.map(c => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCount(c.id)}>
                    <td style={td}><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: '11.5px', color: '#9ca3af' }}>{c.scope}</div></td>
                    <td style={td}>{fmtDate(c.createdAt)}</td>
                    <td style={td}>{c.summary?.countedItems || 0} / {c.summary?.totalItems || 0}</td>
                    <td style={td}><Badge status={c.status} /></td>
                    {canApprove && (
                      <td style={{ ...td, color: (c.summary?.differenceValue || 0) < 0 ? '#dc2626' : '#374151' }}>
                        {c.summary?.itemsWithDifference ? `${c.summary.itemsWithDifference} items · ${fmt(c.summary.differenceValue)}` : '—'}
                      </td>
                    )}
                    <td style={{ ...td, textAlign: 'right' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#059669' }}>{['draft', 'submitted'].includes(c.status) ? (c.status === 'submitted' && canApprove ? 'Review' : 'Continue') : 'View'} →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
