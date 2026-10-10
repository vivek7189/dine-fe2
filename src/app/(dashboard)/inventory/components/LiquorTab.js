'use client';

// Liquor (bar) stock — the way bars count spirits:
//   • stock per sealed bottle size, shown as bottles ("4 bottles + 60% open · ≈ 24 tots")
//   • every size on the menu links to a bottle: Bottle (selling it takes the whole bottle) or
//     Tot / peg (poured from a bottle — the pour size, a double = 2)
//   • pour size is a setting (country default: Kenya / UK 25 ml, India 30 ml, US 44 ml)
// "Set up all" reads the sizes from their names (1 Litre, 375 ML, Tot, Double…) for every spirit at once.

import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../../../lib/api';

const C = { purple: '#6d28d9', purpleBg: '#f5f3ff', border: '#eef0f3', gray: '#6b7280', green: '#047857', red: '#b91c1c', amber: '#b45309' };
const input = { padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const btn = (bg, fg = '#fff', border = 'none') => ({ padding: '7px 12px', borderRadius: 9, border, background: bg, color: fg, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' });
const chip = (on) => ({ padding: '6px 10px', borderRadius: 999, border: `1.5px solid ${on ? C.purple : '#e5e7eb'}`, background: on ? C.purpleBg : '#fff', color: on ? C.purple : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' });
const fmtMl = (ml) => (ml >= 1000 && ml % 100 === 0 ? `${ml / 1000} L` : `${ml} ml`);
const r1 = (n) => Math.round(n * 10) / 10;

// "4 bottles + 60% open" from ml in stock and the bottle size
function bottlesText(ml, bottleMl) {
  if (!(bottleMl > 0)) return `${r1(ml)} ml`;
  if (ml <= 0) return ml < 0 ? `Empty (${r1(ml)} ml over-poured)` : 'Empty';
  const full = Math.floor(ml / bottleMl + 1e-9);
  const part = Math.round(((ml - full * bottleMl) / bottleMl) * 100);
  if (!full) return `${part}% of a bottle`;
  return `${full} bottle${full === 1 ? '' : 's'}${part ? ` + ${part}% open` : ''}`;
}

// the editor's starting rows for an item: its saved links, else what the size names say
function draftFor(item, settings) {
  const sizes = item.sizes || [];
  const bottleSizes = sizes.map(z => z.link?.kind === 'bottle' ? z.link.bottleMl : z.proposal?.mode === 'bottle' ? z.proposal.bottleMl : z.suggestion?.kind === 'bottle' ? z.suggestion.ml : null).filter(Boolean);
  const biggest = bottleSizes.length ? Math.max(...bottleSizes) : settings.defaultBottleMl;
  return sizes.map(z => {
    const l = z.link;
    if (l) return { variantName: z.variantName, price: z.price, mode: l.kind, bottleMl: l.kind === 'bottle' ? String(l.bottleMl) : '', fromBottleMl: l.kind === 'pour' ? String(l.bottleMl) : String(biggest), pours: String(l.pours || 1), pourMl: l.followsSetting === false ? String(l.ml) : '', openingBottles: '' };
    const pr = z.proposal;
    if (pr) return { variantName: z.variantName, price: z.price, mode: pr.mode, bottleMl: pr.bottleMl ? String(pr.bottleMl) : String(settings.defaultBottleMl), fromBottleMl: String(pr.fromBottleMl || biggest), pours: String(pr.pours || 1), pourMl: pr.pourMl ? String(pr.pourMl) : '', openingBottles: '', check: !!pr.check };
    const g = z.suggestion;
    if (g?.kind === 'bottle') return { variantName: z.variantName, price: z.price, mode: 'bottle', bottleMl: String(g.ml || settings.defaultBottleMl), fromBottleMl: String(biggest), pours: '1', pourMl: '', openingBottles: '' };
    if (g?.kind === 'pour') return { variantName: z.variantName, price: z.price, mode: 'pour', bottleMl: '', fromBottleMl: String(biggest), pours: String(g.mult || 1), pourMl: '', openingBottles: '' };
    return { variantName: z.variantName, price: z.price, mode: sizes.length === 1 ? 'bottle' : 'off', bottleMl: String(settings.defaultBottleMl), fromBottleMl: String(biggest), pours: '1', pourMl: '', openingBottles: '' };
  });
}
const payloadOf = (rows) => rows.map(r => ({
  variantName: r.variantName, mode: r.mode,
  bottleMl: r.mode === 'bottle' ? Number(r.bottleMl) : undefined,
  fromBottleMl: r.mode === 'pour' ? Number(r.fromBottleMl) : undefined,
  pours: r.mode === 'pour' ? Number(r.pours) || 1 : undefined,
  pourMl: r.mode === 'pour' && r.pourMl !== '' ? Number(r.pourMl) : undefined,
  openingBottles: r.openingBottles !== '' ? Number(r.openingBottles) : undefined,
}));

export default function LiquorTab({ restaurantId, isMobile, canUpdate, formatCurrency, onMessage, focusMenuItemId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all'); // all | setup | notset | low
  const [editing, setEditing] = useState(null); // { menuItemId, rows }
  const [busy, setBusy] = useState(null);
  const [pour, setPour] = useState('');
  const [fromMl, setFromMl] = useState('');
  const [act, setAct] = useState(null); // { kind: 'add'|'count', bottle, value }
  const [bulkAsk, setBulkAsk] = useState(false);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try { const d = await apiClient.getLiquor(restaurantId); setData(d); setPour(String(d.settings?.pourMl || '')); setFromMl(String(d.settings?.defaultBottleMl || '')); setError(''); }
    catch (e) { setError(e?.message || 'Could not load liquor items.'); }
  }, [restaurantId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (focusMenuItemId) setQ(''); }, [focusMenuItemId]);

  const settings = data?.settings || { pourMl: 30, defaultBottleMl: 750 };
  const bottles = data?.bottles || [];
  const items = data?.items || [];
  const bottlesOf = (id) => bottles.filter(b => b.menuItemId === id).sort((a, b) => b.bottleMl - a.bottleMl);
  const isLow = (b) => b.currentStock <= (b.minStock || b.bottleMl);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter(i => (!t || i.name.toLowerCase().includes(t) || String(i.category).toLowerCase().includes(t))
      && (!focusMenuItemId || q || i.menuItemId === focusMenuItemId || filter !== 'all')
      && (filter === 'all' || (filter === 'setup' && i.setUp) || (filter === 'notset' && !i.setUp) || (filter === 'low' && i.setUp && bottlesOf(i.menuItemId).some(isLow))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, bottles, q, filter, focusMenuItemId]);
  const counts = useMemo(() => ({ setup: items.filter(i => i.setUp).length, notset: items.filter(i => !i.setUp).length,
    low: items.filter(i => i.setUp && bottlesOf(i.menuItemId).some(isLow)).length }), [items, bottles]); // eslint-disable-line react-hooks/exhaustive-deps

  const savePour = async () => {
    setBusy('pour'); setError('');
    try { await apiClient.saveLiquorSettings(restaurantId, { pourMl: Number(pour), defaultBottleMl: Number(fromMl) }); onMessage?.(`Saved: tot ${pour} ml, poured from a ${fmtMl(Number(fromMl))} bottle`); await load(); }
    catch (e) { setError(e?.message || 'Could not save.'); }
    finally { setBusy(null); }
  };
  const saveItem = async () => {
    const rows = editing.rows;
    for (const r of rows) {
      if (r.mode === 'bottle' && !(Number(r.bottleMl) > 0)) return setError(`Enter the bottle size (ml) for ${r.variantName || 'this item'}`);
      if (r.mode === 'pour' && !(Number(r.fromBottleMl) > 0)) return setError(`Choose which bottle ${r.variantName || 'the tot'} is poured from`);
    }
    setBusy('item'); setError('');
    try {
      const res = await apiClient.setupLiquor(restaurantId, [{ menuItemId: editing.menuItemId, sizes: payloadOf(rows) }]);
      const bad = (res.results || []).find(x => !x.ok);
      if (bad) throw new Error(bad.error || 'Could not save');
      onMessage?.('Saved — sales now take stock from the bottles.');
      setEditing(null); await load();
    } catch (e) { setError(e?.message || 'Could not save.'); }
    finally { setBusy(null); }
  };
  // one click: every spirit not set up yet, from what its size names say (counts can be entered later)
  const setupAll = async () => {
    setBusy('bulk'); setError('');
    try {
      const r = await apiClient.setupLiquorAuto(restaurantId);
      const failed = (r.results || []).filter(x => !x.ok).length;
      const check = (r.toCheck || []).length;
      onMessage?.(`${r.setUp || 0} liquor item${r.setUp === 1 ? '' : 's'} set up${failed ? `, ${failed} failed` : ''}${check ? ` — ${check} had no size in the name: check them (Edit)` : ''}. Now count the bottles on the shelf (Count).`);
      setBulkAsk(false); await load();
    } catch (e) { setError(e?.message || 'Could not set them up.'); }
    finally { setBusy(null); }
  };
  const doAct = async () => {
    const { kind, bottle, value } = act;
    const n = Number(value);
    if (!(n >= 0) || value === '' || (kind === 'add' && !(n > 0))) return setError(kind === 'add' ? 'How many bottles came in?' : 'How many bottles are there now?');
    setBusy('act'); setError('');
    try {
      if (kind === 'add') {
        await apiClient.receiveStock(restaurantId, bottle.id, { quantity: n * bottle.bottleMl, packs: n, packSize: `${fmtMl(bottle.bottleMl)} bottle${n === 1 ? '' : 's'}`, requestId: `liq-${bottle.id}-${Date.now()}` });
        onMessage?.(`${bottle.name}: +${n} bottle${n === 1 ? '' : 's'}`);
      } else {
        const r = await apiClient.countLiquor(restaurantId, bottle.id, n);
        const d = r?.difference || 0;
        onMessage?.(`${bottle.name}: counted ${n} bottles${d ? ` (${d > 0 ? '+' : ''}${r1(d)} ml vs system)` : ' — matches'}`);
      }
      setAct(null); await load();
    } catch (e) { setError(e?.message || 'Could not save.'); }
    finally { setBusy(null); }
  };

  if (!data && !error) return <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af' }}>Loading liquor…</div>;
  const perBottle = (ml) => Math.floor(ml / (settings.pourMl || 1));

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: isMobile ? 12 : 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ minWidth: 0, flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Liquor (by bottle)</div>
          <div style={{ fontSize: 12.5, color: C.gray, lineHeight: 1.5, maxWidth: 640 }}>
            Spirits and wine are counted per bottle size. A <b>bottle</b> sale takes a whole bottle; a <b>tot / peg</b> is poured from a bottle — {settings.pourMl} ml each, a double is 2.
            Example: 1 L = {perBottle(1000)} tots · 750 ml = {perBottle(750)} · 375 ml = {perBottle(375)}. Each size of a drink (1 L, 750 ml, 375 ml…) keeps its own bottle count; tots are poured from the drink&apos;s biggest bottle unless you choose another.
          </div>
        </div>
        {canUpdate && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 11.5, color: C.gray, fontWeight: 600 }}>Tot / peg size (ml)
              <input inputMode="decimal" value={pour} onChange={e => setPour(e.target.value)} style={{ ...input, width: 80, display: 'block', marginTop: 4 }} />
            </label>
            <label style={{ fontSize: 11.5, color: C.gray, fontWeight: 600 }} title="Used when a drink has no bottle size on the menu; otherwise its biggest bottle">Tots poured from
              <select value={fromMl} onChange={e => setFromMl(e.target.value)} style={{ ...input, width: 110, display: 'block', marginTop: 4 }}>
                {[...new Set([1000, 750, 700, Number(fromMl) || 750])].sort((a, b) => b - a).map(ml => <option key={ml} value={ml}>{fmtMl(ml)} bottle</option>)}
              </select>
            </label>
            {(() => { const same = Number(pour) === settings.pourMl && Number(fromMl) === settings.defaultBottleMl; return (
              <button type="button" disabled={busy === 'pour' || same} onClick={savePour} style={{ ...btn(C.purple), opacity: same ? 0.5 : 1 }}>Save</button>
            ); })()}
            {settings.countryDefaultPourMl && settings.countryDefaultPourMl !== settings.pourMl && <span style={{ fontSize: 11.5, color: C.gray }}>standard here: {settings.countryDefaultPourMl} ml</span>}
          </div>
        )}
      </div>

      {error && <div role="alert" style={{ padding: '9px 12px', borderRadius: 10, background: '#fef2f2', color: C.red, fontSize: 13, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <input placeholder="Search drinks" value={q} onChange={e => setQ(e.target.value)} style={{ ...input, flex: '1 1 200px', minWidth: 160 }} />
        {[['all', `All ${items.length}`], ['setup', `Set up ${counts.setup}`], ['notset', `Not set up ${counts.notset}`], ['low', `Low ${counts.low}`]].map(([k, t]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} style={chip(filter === k)}>{t}</button>
        ))}
        {canUpdate && counts.notset > 0 && (bulkAsk ? (
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12.5 }}>
            Set up {counts.notset} from their size names?
            <button type="button" disabled={busy === 'bulk'} onClick={setupAll} style={btn(C.purple)}>{busy === 'bulk' ? 'Setting up…' : 'Yes'}</button>
            <button type="button" onClick={() => setBulkAsk(false)} style={btn('#fff', '#374151', '1px solid #d1d5db')}>No</button>
          </span>
        ) : <button type="button" onClick={() => setBulkAsk(true)} style={btn('#fff', C.purple, `1.5px solid ${C.purple}`)}>Set up all {counts.notset}</button>)}
      </div>

      {!shown.length ? <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>{items.length ? 'Nothing here.' : 'No spirits or wine on the menu yet.'}</div> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {shown.map(i => {
            const own = bottlesOf(i.menuItemId);
            const open = editing?.menuItemId === i.menuItemId;
            return (
              <div key={i.menuItemId} style={{ border: `1px solid ${open ? C.purple : '#f1f5f9'}`, borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{i.name}{i.needsCheck && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: C.amber, background: '#fffbeb', borderRadius: 999, padding: '1px 8px' }}>check size</span>}</div>
                    <div style={{ fontSize: 12, color: C.gray }}>
                      {i.category} · {i.sizes.map(z => `${String(z.variantName || i.name).replace(i.name, '').replace(/^\s*[-–·]\s*/, '') || 'Bottle'}${z.price ? ` ${formatCurrency ? formatCurrency(z.price) : z.price}` : ''}${z.link ? (z.link.kind === 'pour' ? ` (${z.link.pours > 1 ? `${z.link.pours} tots` : 'tot'} from ${fmtMl(z.link.bottleMl)})` : ' (bottle)') : ''}`).join(' · ')}
                    </div>
                  </div>
                  {canUpdate && !open && <button type="button" onClick={() => { setError(''); setEditing({ menuItemId: i.menuItemId, rows: draftFor(i, settings) }); }} style={btn(i.setUp ? '#fff' : C.purple, i.setUp ? C.purple : '#fff', i.setUp ? `1.5px solid ${C.purple}` : 'none')}>{i.setUp ? 'Edit' : 'Set up'}</button>}
                </div>

                {/* bottles on the shelf */}
                {i.setUp && own.length > 0 && !open && (
                  <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                    {own.map(b => {
                      const low = isLow(b), empty = b.currentStock <= 0;
                      // tots left only for a bottle something is poured from (not for wine sold by the bottle)
                      const pour = i.sizes.find(z => z.link?.kind === 'pour' && z.link.inventoryItemId === b.id)?.link;
                      const tots = pour ? Math.max(0, Math.floor(b.currentStock / ((pour.followsSetting === false ? pour.ml / (pour.pours || 1) : 0) || settings.pourMl))) : null;
                      const acting = act?.bottle?.id === b.id;
                      return (
                        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 10px', borderRadius: 10, background: empty ? '#fff7f7' : low ? '#fffbeb' : '#f9fafb' }}>
                          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: C.gray }}>{fmtMl(b.bottleMl)} bottles</div>
                            <div style={{ fontWeight: 800, color: empty ? C.red : low ? C.amber : C.green }}>{bottlesText(b.currentStock, b.bottleMl)}</div>
                            <div style={{ fontSize: 11.5, color: C.gray }}>{tots !== null ? `≈ ${tots} tot${tots === 1 ? '' : 's'} · ` : ''}{r1(b.currentStock)} ml</div>
                          </div>
                          {canUpdate && (acting ? (
                            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12.5, flexWrap: 'wrap' }}>
                              {act.kind === 'add' ? 'Bottles in:' : 'Bottles now (e.g. 4.5):'}
                              <input autoFocus inputMode="decimal" value={act.value} onChange={e => setAct(a => ({ ...a, value: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doAct()} style={{ ...input, width: 80 }} />
                              <button type="button" disabled={busy === 'act'} onClick={doAct} style={btn(act.kind === 'add' ? '#059669' : C.purple)}>{act.kind === 'add' ? 'Add' : 'Save count'}</button>
                              <button type="button" onClick={() => setAct(null)} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Cancel</button>
                            </span>
                          ) : (
                            <>
                              <button type="button" onClick={() => setAct({ kind: 'add', bottle: b, value: '' })} style={btn('#059669')}>+ Bottles</button>
                              <button type="button" onClick={() => setAct({ kind: 'count', bottle: b, value: '' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Count</button>
                            </>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* set up / edit */}
                {open && (
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {editing.rows.map((r, idx) => {
                      const setRow = (patch) => setEditing(ed => ({ ...ed, rows: ed.rows.map((x, k) => (k === idx ? { ...x, ...patch } : x)) }));
                      const bottleOptions = [...new Set([...editing.rows.filter(x => x.mode === 'bottle' && Number(x.bottleMl) > 0).map(x => Number(x.bottleMl)), Number(r.fromBottleMl) || settings.defaultBottleMl, 1000, 750, 700])].sort((a, b) => b - a);
                      return (
                        <div key={idx} style={{ border: '1px solid #ede9fe', borderRadius: 10, padding: 10, background: '#fcfbff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <b style={{ fontSize: 13.5 }}>{r.check && <span title="No size in the name — please check" style={{ color: C.amber, marginRight: 4 }}>⚠</span>}{r.variantName || i.name}{r.price ? <span style={{ color: C.gray, fontWeight: 500 }}> · {formatCurrency ? formatCurrency(r.price) : r.price}</span> : null}</b>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {[['bottle', 'Bottle'], ['pour', 'Tot / peg'], ['off', 'Not counted']].map(([k, t]) => <button key={k} type="button" onClick={() => setRow({ mode: k })} style={chip(r.mode === k)}>{t}</button>)}
                            </div>
                          </div>
                          {r.mode === 'bottle' && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: C.gray }}>
                              <label>Bottle size (ml)<input inputMode="numeric" value={r.bottleMl} onChange={e => setRow({ bottleMl: e.target.value })} style={{ ...input, width: 100, display: 'block', marginTop: 3 }} /></label>
                              <label>Bottles you have now<input inputMode="decimal" value={r.openingBottles} onChange={e => setRow({ openingBottles: e.target.value })} placeholder={i.setUp ? 'leave = keep' : 'e.g. 6'} style={{ ...input, width: 120, display: 'block', marginTop: 3 }} /></label>
                            </div>
                          )}
                          {r.mode === 'pour' && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: C.gray }}>
                              <label>Poured from<select value={r.fromBottleMl} onChange={e => setRow({ fromBottleMl: e.target.value })} style={{ ...input, width: 120, display: 'block', marginTop: 3 }}>
                                {bottleOptions.map(ml => <option key={ml} value={ml}>{fmtMl(ml)} bottle</option>)}
                              </select></label>
                              <label>Tots per sale<select value={r.pours} onChange={e => setRow({ pours: e.target.value })} style={{ ...input, width: 100, display: 'block', marginTop: 3 }}>
                                <option value="1">1 (single)</option><option value="2">2 (double)</option><option value="3">3</option>
                              </select></label>
                              <label>ml per sale<input inputMode="decimal" value={r.pourMl} onChange={e => setRow({ pourMl: e.target.value })} placeholder={`${settings.pourMl * (Number(r.pours) || 1)} (setting)`} style={{ ...input, width: 120, display: 'block', marginTop: 3 }} /></label>
                              {!editing.rows.some(x => x.mode === 'bottle' && Number(x.bottleMl) === Number(r.fromBottleMl)) && (
                                <label>Open + full {fmtMl(Number(r.fromBottleMl) || 0)} bottles now<input inputMode="decimal" value={r.openingBottles} onChange={e => setRow({ openingBottles: e.target.value })} placeholder={i.setUp ? 'leave = keep' : 'e.g. 2.5'} style={{ ...input, width: 140, display: 'block', marginTop: 3 }} /></label>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div style={{ fontSize: 12, color: C.gray }}>Bottles can be part-open: 2.5 = two full + one half bottle. Leave the count empty to keep what the system has.</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setEditing(null); setError(''); }} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Cancel</button>
                      <button type="button" disabled={busy === 'item'} onClick={saveItem} style={btn(C.purple)}>{busy === 'item' ? 'Saving…' : 'Save'}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
