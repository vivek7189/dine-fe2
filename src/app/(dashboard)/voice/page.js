'use client';

// Voice Ticket — the server speaks an order, checks a kitchen ticket, and sends it to the kitchen.
// Off unless the owner turns on Admin → Settings → Voice Ticket (posSettings.voiceTicket.enabled).
// The ticket is understood by POST /api/voice-ticket/:rid/understand (audio → words → checked
// ticket); the order is then placed through the normal POST /api/orders and its KOT printed with the
// same station / order-type routing as every other KOT. Nothing here changes any other screen.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { isElectron } from '../../../utils/platform';
import { printDocument, buildKotDedupKey } from '../../../utils/printBridge';
import { printKOTByStations } from '../../../utils/printKotStations';
import { generateKOTHTML } from '../../../utils/printHtmlGenerator';
import { getCurrencySymbol } from '../../../utils/currency';

const MAX_SECONDS = 60;
const todayKey = (rid) => `vt:tickets:${rid}:${new Date().toISOString().slice(0, 10)}`;
const readJSON = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch { return d; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const isDineIn = (type) => /dine|table/i.test(String(type || ''));
const label = (type) => (isDineIn(type) ? 'Dine-in' : /deliver/i.test(String(type || '')) ? 'Delivery' : 'To-go');
const pickMime = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* keep looking */ }
  }
  return '';
};

export default function VoiceTicketPage() {
  const [rid, setRid] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [orderTypes, setOrderTypes] = useState(['dine-in', 'takeaway']);
  const [menu, setMenu] = useState([]);
  const [printSettings, setPrintSettings] = useState({});
  const [staff, setStaff] = useState([]);
  const [server, setServer] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [phase, setPhase] = useState('idle'); // idle | listening | thinking | check | sending | sent
  const [error, setError] = useState('');
  const [heard, setHeard] = useState('');
  const [ticket, setTicket] = useState(null); // { orderType, tableNumber, customerName, orderNotes, lines, unclear }
  const [sel, setSel] = useState(null);
  const [editHead, setEditHead] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [tickets, setTickets] = useState([]);
  const [toast, setToast] = useState('');
  const [conflict, setConflict] = useState(null); // table already has an open order → offer to add to it
  const [secs, setSecs] = useState(0);
  const [levels, setLevels] = useState(() => Array(14).fill(0.08));

  const rec = useRef({ stream: null, recorder: null, chunks: [], timer: null, raf: null, ctx: null, started: 0, metered: false, voiced: 0 });
  const toastTimer = useRef(null);
  const flash = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  // ── load ──
  useEffect(() => {
    const id = (typeof window !== 'undefined' && localStorage.getItem('selectedRestaurantId')) || null;
    if (!id) { setLoadError('Pick a restaurant first'); return; }
    setRid(id);
    let me = null;
    try { me = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* none */ }
    const meName = me?.name || me?.displayName || 'Me';
    setServer({ id: me?.id || me?.userId || null, name: meName, role: me?.role || '' });
    setTickets(readJSON(todayKey(id), []));
    (async () => {
      try {
        const [vs, rs, ms, ps] = await Promise.all([
          apiClient.getVoiceTicketSettings(id),
          apiClient.getRestaurant(id).catch(() => null),
          apiClient.getMenu(id).catch(() => ({ menuItems: [] })),
          apiClient.getPrintSettings(id).catch(() => ({})),
        ]);
        setSettings(vs?.settings || { enabled: false });
        if (Array.isArray(vs?.orderTypes) && vs.orderTypes.length) setOrderTypes(vs.orderTypes);
        setRestaurant(rs?.restaurant || rs || null);
        const items = ms?.menuItems || ms?.items || ms?.menu?.items || [];
        setMenu(items.filter((it) => it && it.id && it.name && !['deleted', 'inactive'].includes(String(it.status || '').toLowerCase())));
        setPrintSettings(ps?.printSettings || {});
        if (vs?.settings?.askServer) {
          const st = await apiClient.getStaff(id).catch(() => null);
          const list = (Array.isArray(st) ? st : st?.staff || st?.data || [])
            .filter((s) => s && s.name && !['deleted', 'inactive', 'disabled'].includes(String(s.status || '').toLowerCase()))
            .map((s) => ({ id: s.id || s.userId, name: s.name, role: s.role || '' }));
          setStaff(list.slice(0, 12));
        }
      } catch (e) {
        setLoadError(e?.message || 'Could not load Voice Ticket');
      }
    })();
  }, []);

  useEffect(() => () => {
    const r = rec.current;
    clearInterval(r.timer); cancelAnimationFrame(r.raf);
    try { r.recorder && r.recorder.state !== 'inactive' && r.recorder.stop(); } catch { /* gone */ }
    r.stream && r.stream.getTracks().forEach((tr) => tr.stop());
    try { r.ctx && r.ctx.close(); } catch { /* gone */ }
  }, []);

  // ── recording ──
  const stopMeters = () => {
    const r = rec.current;
    clearInterval(r.timer); cancelAnimationFrame(r.raf);
    r.stream && r.stream.getTracks().forEach((tr) => tr.stop());
    try { r.ctx && r.ctx.close(); } catch { /* gone */ }
    r.stream = null; r.ctx = null;
    setLevels(Array(14).fill(0.08));
  };

  const understand = useCallback(async (payload) => {
    setPhase('thinking'); setError('');
    try {
      const res = await apiClient.voiceTicketUnderstand(rid, payload);
      if (!res?.success) throw new Error(res?.error || 'Could not build the ticket');
      setHeard(res.transcript || '');
      setTicket((prev) => {
        // speaking again adds to the ticket being checked
        if (prev && (prev.lines.length || prev.unclear.length)) {
          return {
            ...prev,
            orderType: prev.orderType || res.ticket.orderType,
            tableNumber: prev.tableNumber || res.ticket.tableNumber,
            customerName: prev.customerName || res.ticket.customerName,
            lines: [...prev.lines, ...res.ticket.lines.map((l) => ({ ...l, key: l.key + '_' + Date.now() }))],
            unclear: [...prev.unclear, ...res.ticket.unclear.map((u) => ({ ...u, key: u.key + '_' + Date.now() }))],
          };
        }
        return res.ticket;
      });
      setPhase('check');
    } catch (e) {
      setError(e?.message || 'Voice service had a problem — please try again');
      setPhase(ticket ? 'check' : 'idle');
    }
  }, [rid, ticket]);

  const startListening = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This device cannot record here. Use Add item instead.'); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const mimeType = pickMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const r = rec.current;
      r.stream = stream; r.recorder = recorder; r.chunks = []; r.started = Date.now(); r.metered = false; r.voiced = 0;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size) r.chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(r.chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
        const dur = (Date.now() - r.started) / 1000;
        stopMeters();
        if (dur < 0.8) { setPhase(ticket ? 'check' : 'idle'); setError('That was too short — tap the mic and say the order'); return; }
        // nobody actually spoke (mic muted / far away): never send silence — a speech model can invent words
        if ((r.metered && r.voiced < 15) || blob.size < 1500) { setPhase(ticket ? 'check' : 'idle'); setError('Didn\u2019t hear anything — check the mic and speak a little closer'); return; }
        understand({ audio: blob });
      };
      // live level meter
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx(); r.ctx = ctx;
        const an = ctx.createAnalyser(); an.fftSize = 64;
        ctx.createMediaStreamSource(stream).connect(an);
        const data = new Uint8Array(an.frequencyBinCount);
        r.metered = true;
        const loop = () => {
          an.getByteFrequencyData(data);
          let sum = 0; for (let k = 2; k < 24; k++) sum += data[k] || 0;
          if (sum / 22 > 22) r.voiced += 1; // a frame with real voice energy
          const out = Array.from({ length: 14 }, (_, i) => Math.max(0.08, Math.min(1, (data[i + 2] || 0) / 200)));
          setLevels(out);
          r.raf = requestAnimationFrame(loop);
        };
        loop();
      } catch { /* meter is decoration */ }
      setSecs(0);
      r.timer = setInterval(() => {
        const s = Math.floor((Date.now() - r.started) / 1000);
        setSecs(s);
        if (s >= MAX_SECONDS) { try { recorder.stop(); } catch { /* stopped */ } }
      }, 250);
      recorder.start(250);
      setPhase('listening');
    } catch (e) {
      stopMeters();
      setError(e?.name === 'NotAllowedError' ? 'Microphone is blocked — allow it in the browser / device settings' : 'Could not start the microphone');
    }
  };
  const stopListening = () => { try { rec.current.recorder && rec.current.recorder.state !== 'inactive' && rec.current.recorder.stop(); } catch { /* stopped */ } };

  // ── ticket edits ──
  const upd = (key, fn) => setTicket((tk) => ({ ...tk, lines: tk.lines.map((l) => (l.key === key ? fn(l) : l)) }));
  const removeLine = (key) => { setTicket((tk) => ({ ...tk, lines: tk.lines.filter((l) => l.key !== key) })); setSel(null); };
  const resolve = (u, opt) => {
    const item = menu.find((m) => m.id === opt.menuItemId) || {};
    const variants = Array.isArray(item.variants) ? item.variants.filter((v) => v?.name).map((v) => v.name) : [];
    setTicket((tk) => ({
      ...tk,
      unclear: tk.unclear.filter((x) => x.key !== u.key),
      lines: [...tk.lines, { key: 'r' + Date.now(), menuItemId: opt.menuItemId, name: opt.name, price: Number(item.price) || opt.price || 0, quantity: u.quantity || 1, notes: u.notes || [], variant: null, needsVariant: variants.length > 0, variants, categoryId: item.categoryId || item.category || '' }],
    }));
  };
  const dropUnclear = (u) => setTicket((tk) => ({ ...tk, unclear: tk.unclear.filter((x) => x.key !== u.key) }));
  const setVariant = (l, name) => {
    const item = menu.find((m) => m.id === l.menuItemId) || {};
    const v = (item.variants || []).find((x) => x.name === name);
    upd(l.key, (x) => ({ ...x, variant: name, needsVariant: false, price: v && Number(v.price) ? Number(v.price) : x.price }));
  };
  const addNote = (l) => {
    const n = noteDraft.trim();
    if (!n) return;
    upd(l.key, (x) => ({ ...x, notes: [...x.notes, n.slice(0, 80)] }));
    setNoteDraft('');
  };
  const addItem = (item) => {
    const variants = Array.isArray(item.variants) ? item.variants.filter((v) => v?.name).map((v) => v.name) : [];
    setTicket((tk) => {
      const base = tk || { orderType: orderTypes[0] || 'dine-in', tableNumber: null, customerName: null, orderNotes: null, lines: [], unclear: [] };
      return { ...base, lines: [...base.lines, { key: 'a' + Date.now(), menuItemId: item.id, name: item.name, price: Number(item.price) || 0, quantity: 1, notes: [], variant: null, needsVariant: variants.length > 0, variants, categoryId: item.categoryId || item.category || '' }] };
    });
    setPhase('check'); setAdding(false); setSearch('');
  };
  const startOver = () => { setTicket(null); setHeard(''); setSel(null); setEditHead(false); setError(''); setPhase('idle'); };

  // ── send + print ──
  const printTicket = useCallback(async (orderId, order, { reprint = false, incremental = false } = {}) => {
    if (printSettings.kotPrinterEnabled === false) return 'kds';
    if (printSettings.multiTerminalPrinting && !isElectron()) return 'terminal';
    if (!reprint && typeof window !== 'undefined') { window.__lastLocalPrintedKOT = orderId; window.__lastKOTPrintedByEffect = orderId; }
    try {
      const routed = await printKOTByStations({ restaurantId: rid, orderId, order, restaurantName: restaurant?.name || '', categories: restaurant?.categories || [], printSettings, posSettings: restaurant?.posSettings || {}, t, currencySymbol: getCurrencySymbol(), isIncremental: incremental });
      if (routed?.handled) return 'stations';
    } catch { /* fall back to one printer */ }
    const rd = await apiClient.getKOTRender(rid, orderId, { newOnly: incremental });
    if (!rd?.kot) return 'none';
    const kot = { ...rd.kot, restaurantName: rd?.restaurant?.name || restaurant?.name || '', ...(reprint ? { isReprint: true } : {}) };
    const html = generateKOTHTML(kot, { ...printSettings, showPriceOnKot: !!restaurant?.posSettings?.showPriceOnKot, currencySymbol: getCurrencySymbol() });
    await printDocument({ html, type: 'kot', orderId, restaurantId: rid, printSettings, dedupKey: reprint ? null : buildKotDedupKey(rd.kot, null) });
    return 'printer';
  }, [printSettings, restaurant, rid]);

  const canSend = ticket && ticket.lines.length > 0 && ticket.unclear.length === 0 && !ticket.lines.some((l) => l.needsVariant) && phase === 'check'
    && (!isDineIn(ticket.orderType) || !!String(ticket.tableNumber || '').trim() || true);

  const toItems = (tk) => tk.lines.map((l) => ({
    menuItemId: l.menuItemId, name: l.name, price: l.price, quantity: l.quantity, total: l.price * l.quantity,
    notes: l.notes.join(', '), categoryId: l.categoryId || undefined, noteLine: true,
    ...(l.variant ? { selectedVariant: { name: l.variant, price: l.price } } : {}),
  }));
  const finishSent = (tk, orderId, order, printed, added) => {
    const dine = isDineIn(tk.orderType);
    const who = server || {};
    const head = dine ? (tk.tableNumber ? `Table ${tk.tableNumber}` : 'Dine-in') : `${label(tk.orderType)}${tk.customerName ? ' · ' + tk.customerName : ''}`;
    const count = tk.lines.reduce((a, l) => a + l.quantity, 0);
    const entry = { orderId, head: added ? `${head} (added)` : head, count, who: who.name || '', at: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), number: order?.dailyOrderId || order?.orderNumber || order?.kotNumber || '' };
    setTickets((prev) => {
      const next = [entry, ...prev.filter((x) => !(x.orderId === entry.orderId && x.head === entry.head && x.at === entry.at))].slice(0, 80);
      writeJSON(todayKey(rid), next);
      return next;
    });
    setPhase('sent'); setConflict(null);
    flash(printed === 'failed' ? 'Saved — but the printer did not answer. Use Reprint.' : printed === 'kds' ? 'Sent to the kitchen screen' : added ? `Added to ${head} — sent to the kitchen` : `${head} sent to the kitchen`);
    setTimeout(() => { setTicket(null); setHeard(''); setSel(null); setEditHead(false); setPhase((p) => (p === 'sent' ? 'idle' : p)); }, 1600);
  };

  // The table already has an open order: add these items to it (kitchen gets only the new items).
  const addToOpenOrder = async () => {
    if (!conflict || !ticket) return;
    setPhase('sending'); setError('');
    try {
      const full = await apiClient.getOrderById(conflict.orderId);
      const existing = full?.order || (Array.isArray(full?.orders) ? full.orders[0] : null) || full?.data || full;
      if (!existing?.id || ['completed', 'cancelled', 'paid', 'settled'].includes(existing.status)) throw new Error('That order is already closed — send this as a new order');
      const who = server || {};
      const res = await apiClient.updateOrder(existing.id, {
        restaurantId: rid,
        items: [...(existing.items || []), ...toItems(ticket)],
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: { name: who.name || 'Staff Member', id: who.id || 'unknown' },
      });
      if (!(res?.data || res?.success || res?.order)) throw new Error(res?.error || 'Could not add to the order');
      let printed = 'none';
      try { printed = await printTicket(existing.id, null, { incremental: true }); } catch { printed = 'failed'; }
      finishSent(ticket, existing.id, existing, printed, true);
    } catch (e) {
      setError(e?.message || 'Could not add to the open order');
      setPhase('check');
    }
  };

  const send = async ({ tableNotSetUp = false } = {}) => {
    if (!canSend && !tableNotSetUp) return;
    setPhase('sending'); setError('');
    const tk = ticket;
    const dine = isDineIn(tk.orderType);
    const who = server || {};
    setConflict(null);
    const orderData = {
      restaurantId: rid,
      idempotencyKey: 'vt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      items: toItems(tk),
      orderType: tk.orderType || orderTypes[0] || 'dine-in',
      // a table the restaurant hasn't set up: no table link, the number goes on the ticket instead
      tableNumber: dine && tk.tableNumber && !tableNotSetUp ? String(tk.tableNumber) : null,
      customerInfo: { name: tk.customerName || '', tableNumber: dine ? (tk.tableNumber || null) : null },
      customerName: tk.customerName || undefined,
      staffInfo: { userId: who.id || null, name: who.name || '', role: who.role || '' },
      specialInstructions: [tableNotSetUp && tk.tableNumber ? `TABLE ${tk.tableNumber}` : '', tk.orderNotes || ''].filter(Boolean).join(' · '),
      notes: 'Voice order',
      paymentMethod: 'cash',
      status: 'confirmed',
    };
    try {
      const res = await apiClient.createOrder(orderData);
      const order = res?.order || res?.data || null;
      const orderId = order?.id || res?.orderId || res?.id;
      if (!orderId) throw new Error(res?.error || 'Order was not saved');
      let printed = 'none';
      try { printed = await printTicket(orderId, { ...orderData, id: orderId }); } catch { printed = 'failed'; }
      if (settings?.afterSend === 'mark_served') { try { await apiClient.markServed(orderId); } catch { /* stays open */ } }
      finishSent(tk, orderId, order, printed, false);
    } catch (e) {
      const msg = e?.message || '';
      // Table already taken by an open order → offer to add to it instead of a dead end
      if (dine && tk.tableNumber && /occupied|already/i.test(msg)) {
        try {
          const open = await apiClient.getOpenOrders(rid);
          const hit = (open?.openOrders || []).find((o) => String(o.tableNumber || '') === String(tk.tableNumber) && !['completed', 'cancelled'].includes(o.status));
          if (hit) { setConflict({ orderId: hit.id, number: hit.orderNumber || '', items: hit.itemCount || (hit.items || []).length, table: tk.tableNumber }); setPhase('check'); return; }
        } catch { /* fall through to the plain message */ }
      }
      // Table number the restaurant hasn't set up in DineOpen → offer to send with the number on the ticket
      if (dine && tk.tableNumber && !tableNotSetUp && /not found/i.test(msg)) {
        setConflict({ missing: true, table: tk.tableNumber }); setPhase('check'); return;
      }
      setError(msg || 'Could not send — nothing was printed. Please try again.');
      setPhase('check');
    }
  };

  const reprint = async (entry) => {
    try { const r = await printTicket(entry.orderId, null, { reprint: true }); flash(r === 'kds' ? 'Printing is off — the kitchen screen has it' : `Reprinting ${entry.head}`); }
    catch { flash('Reprint failed — check the printer'); }
  };

  // ── derived ──
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menu.slice(0, 24);
    return menu.filter((m) => m.name.toLowerCase().includes(q) || String(m.shortCode || '').toLowerCase() === q).slice(0, 24);
  }, [menu, search]);
  const itemCount = ticket ? ticket.lines.reduce((a, l) => a + l.quantity, 0) : 0;
  const needs = ticket ? ticket.unclear.length + ticket.lines.filter((l) => l.needsVariant).length : 0;
  const headText = ticket
    ? (isDineIn(ticket.orderType) ? (ticket.tableNumber ? `TABLE ${ticket.tableNumber}` : 'DINE-IN') : `${label(ticket.orderType).toUpperCase()}${ticket.customerName ? ' · ' + ticket.customerName.toUpperCase() : ''}`)
    : 'NEW ORDER';

  let status = { tone: '', title: 'Ready', text: 'Tap the mic and say the whole order' };
  if (phase === 'listening') status = { tone: 'live', title: `Listening · 0:${String(secs).padStart(2, '0')}`, text: 'Tap again when you’re done' };
  else if (phase === 'thinking') status = { tone: '', title: 'Building the ticket', text: 'Matching what you said to the menu…' };
  else if (phase === 'sending') status = { tone: '', title: 'Sending', text: 'Placing the order and printing…' };
  else if (phase === 'sent') status = { tone: 'ok', title: 'Sent', text: 'Printed in the kitchen' };
  else if (phase === 'check' && needs) status = { tone: 'warn', title: needs === 1 ? 'Check 1 item' : `Check ${needs} items`, text: 'Pick the right choice, then send' };
  else if (phase === 'check') status = { tone: 'ok', title: 'Ready to send', text: 'Tap a line to change it · tap the mic to add more' };

  if (loadError) return <div className="vt-wrap"><p className="vt-msg">{loadError}</p><style>{CSS}</style></div>;
  if (!settings) return <div className="vt-wrap"><p className="vt-msg">Loading Voice Ticket…</p><style>{CSS}</style></div>;
  if (!settings.enabled) {
    return (
      <div className="vt-wrap">
        <div className="vt-off">
          <h1>Voice Ticket is off</h1>
          <p>Speak an order, check it, and print it in the kitchen. The owner can turn it on in Admin → Settings → Voice Ticket.</p>
          <Link href="/admin?tab=settings" className="vt-btn vt-btn-dark">Open settings</Link>
        </div>
        <style>{CSS}</style>
      </div>
    );
  }

  const listening = phase === 'listening';
  const busy = phase === 'thinking' || phase === 'sending';

  return (
    <div className="vt-wrap">
      <header className="vt-top">
        <div className="vt-brand">
          <span className="vt-mark" aria-hidden="true"><MicIcon size={16} /></span>
          <b>Voice Ticket</b>
        </div>
        {settings.askServer && (
          <div className="vt-servers" role="group" aria-label="Who is taking the order">
            <span>Taken by</span>
            {[server, ...staff.filter((s) => s.id !== server?.id)].filter(Boolean).slice(0, 8).map((s) => (
              <button key={s.id || s.name} type="button" className={'vt-chip' + (server?.id === s.id && server?.name === s.name ? ' on' : '')} onClick={() => setServer(s)}>{s.name.split(' ')[0]}</button>
            ))}
          </div>
        )}
      </header>

      <div className="vt-main">
        <section className="vt-stage" aria-label="Ticket">
          <article className={'vt-paper' + (phase === 'sent' ? ' sent' : '')} aria-live="polite">
            <div className="vt-sub">KITCHEN TICKET</div>
            <button type="button" className={'vt-head' + (ticket ? '' : ' ghost')} onClick={() => ticket && setEditHead((v) => !v)} disabled={!ticket} aria-label="Change table or name">{headText}</button>
            {editHead && ticket && (
              <div className="vt-headedit">
                <div className="vt-seg" role="group" aria-label="Order type">
                  {orderTypes.slice(0, 4).map((ot) => (
                    <button key={ot} type="button" className={ticket.orderType === ot ? 'on' : ''} onClick={() => setTicket((tk) => ({ ...tk, orderType: ot }))}>{label(ot) === 'Dine-in' && !/^dine/i.test(ot) ? ot : label(ot)}</button>
                  ))}
                </div>
                {isDineIn(ticket.orderType) ? (
                  <label className="vt-field">Table<input id="vt-table" inputMode="numeric" value={ticket.tableNumber || ''} onChange={(e) => setTicket((tk) => ({ ...tk, tableNumber: e.target.value.slice(0, 20) }))} /></label>
                ) : (
                  <label className="vt-field">Name<input id="vt-name" value={ticket.customerName || ''} onChange={(e) => setTicket((tk) => ({ ...tk, customerName: e.target.value.slice(0, 60) }))} /></label>
                )}
                <button type="button" className="vt-btn vt-btn-dark" onClick={() => setEditHead(false)}>Done</button>
              </div>
            )}
            <div className="vt-meta"><span>{server?.name ? `Server: ${server.name.split(' ')[0]}` : ''}</span><span>{itemCount ? `${itemCount} ITEM${itemCount === 1 ? '' : 'S'}` : ''}</span></div>
            <div className="vt-rule" />

            <div className="vt-items">
              {!ticket && phase !== 'thinking' && (
                <div className="vt-empty">Tap the mic and say the order —<br />table or to-go name first, then each item and any changes.</div>
              )}
              {phase === 'thinking' && !ticket && <div className="vt-empty"><span className="vt-spin" /> Building the ticket…</div>}

              {ticket && ticket.lines.map((l) => (
                <div key={l.key} className={'vt-line' + (sel === l.key ? ' sel' : '')}>
                  <button type="button" className="vt-linebtn" onClick={() => { setSel(sel === l.key ? null : l.key); setNoteDraft(''); }} aria-label={`Change ${l.name}`}>
                    <span className="vt-q">{l.quantity}</span>
                    <span className="vt-name">{l.name.toUpperCase()}{l.variant ? ` (${l.variant.toUpperCase()})` : ''}</span>
                  </button>
                  {l.notes.map((n, k) => (
                    <div key={k} className={'vt-note ' + (/^(no|hold|without)\b/i.test(n) ? 'no' : /^(extra|add|with)\b/i.test(n) ? 'add' : '')}>** {n.toUpperCase()}</div>
                  ))}
                  {l.needsVariant && (
                    <div className="vt-pick"><p>Which size?</p><div>{l.variants.map((v) => <button key={v} type="button" onClick={() => setVariant(l, v)}>{v}</button>)}</div></div>
                  )}
                  {sel === l.key && (
                    <div className="vt-edit">
                      <div className="vt-row">
                        <button type="button" aria-label="One less" onClick={() => upd(l.key, (x) => ({ ...x, quantity: Math.max(1, x.quantity - 1) }))}>−</button>
                        <button type="button" aria-label="One more" onClick={() => upd(l.key, (x) => ({ ...x, quantity: x.quantity + 1 }))}>+</button>
                        <button type="button" className="rm" onClick={() => removeLine(l.key)}>Remove</button>
                        <button type="button" className="done" onClick={() => setSel(null)}>Done</button>
                      </div>
                      {l.notes.length > 0 && (
                        <div className="vt-row">{l.notes.map((n, k) => <button key={k} type="button" className="vt-x" onClick={() => upd(l.key, (x) => ({ ...x, notes: x.notes.filter((_, j) => j !== k) }))}>{n} ✕</button>)}</div>
                      )}
                      <form className="vt-row" onSubmit={(e) => { e.preventDefault(); addNote(l); }}>
                        <input id={`vt-note-${l.key}`} placeholder="Add a note, e.g. No onion" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
                        <button type="submit">Add</button>
                      </form>
                    </div>
                  )}
                </div>
              ))}

              {ticket && ticket.unclear.map((u) => (
                <div key={u.key} className="vt-pick big" role="group" aria-label="Check this item">
                  <p>{u.reason === 'sold_out' ? `${u.heard} is sold out.` : `Heard “${u.heard}”.`} {u.options.length ? 'Which one?' : 'Not on the menu.'}{u.quantity > 1 ? ` (×${u.quantity})` : ''}</p>
                  <div>
                    {u.options.map((o) => <button key={o.menuItemId} type="button" onClick={() => resolve(u, o)}>{o.name}</button>)}
                    <button type="button" className="ghost" onClick={() => { dropUnclear(u); setAdding(true); setSearch(u.heard); }}>Search menu</button>
                    <button type="button" className="ghost" onClick={() => dropUnclear(u)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="vt-rule" />
            <div className="vt-foot">
              <button type="button" className="vt-link" onClick={() => setAdding((v) => !v)}>+ Add item</button>
              {ticket && <button type="button" className="vt-link" onClick={startOver}>Start over</button>}
            </div>
            {adding && (
              <div className="vt-add">
                <input id="vt-search" autoFocus placeholder="Search the menu" value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="vt-results">
                  {results.map((m) => <button key={m.id} type="button" onClick={() => addItem(m)}>{m.name}</button>)}
                  {!results.length && <span className="vt-none">No match</span>}
                </div>
              </div>
            )}
          </article>
          {heard && <p className="vt-heard"><b>Heard:</b> “{heard}”</p>}
        </section>

        <aside className="vt-today" aria-label="Today's tickets">
          <div className="vt-today-h"><b>Today</b><span>{tickets.length} tickets</span></div>
          {!tickets.length && <p className="vt-none">Sent tickets show here for reprint.</p>}
          <ul>
            {tickets.map((e) => (
              <li key={e.orderId}>
                <div><b>{e.head}</b><span>{[e.number && `#${e.number}`, e.who, `${e.count} items`, e.at].filter(Boolean).join(' · ')}</span></div>
                <button type="button" aria-label={`Reprint ${e.head}`} onClick={() => reprint(e)}><PrintIcon /></button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {conflict && !conflict.missing && (
        <div className="vt-conflict" role="alert">
          <div><b>Table {conflict.table} already has an open order.</b> Add these items to it? The kitchen gets only the new items.</div>
          <div className="vt-row">
            <button type="button" className="done" onClick={addToOpenOrder} disabled={phase === 'sending'}>Add to Table {conflict.table}&apos;s order</button>
            <button type="button" onClick={() => setConflict(null)}>Cancel</button>
          </div>
        </div>
      )}
      {conflict && conflict.missing && (
        <div className="vt-conflict" role="alert">
          <div><b>Table {conflict.table} isn&apos;t set up in DineOpen.</b> Send it anyway with “Table {conflict.table}” printed on the kitchen ticket?</div>
          <div className="vt-row">
            <button type="button" className="done" onClick={() => send({ tableNotSetUp: true })} disabled={phase === 'sending'}>Send with Table {conflict.table} on the ticket</button>
            <button type="button" onClick={() => { setConflict(null); setEditHead(true); }}>Change table</button>
          </div>
        </div>
      )}

      <footer className="vt-bar">
        <button type="button" className={'vt-mic' + (listening ? ' live' : '')} onClick={listening ? stopListening : startListening} disabled={busy} aria-label={listening ? 'Stop listening' : 'Start speaking'}>
          {listening ? <StopIcon /> : <MicIcon size={30} />}
        </button>
        <div className="vt-status">
          {listening && <div className="vt-wave" aria-hidden="true">{levels.map((v, i) => <i key={i} style={{ height: `${Math.round(6 + v * 26)}px` }} />)}</div>}
          {busy && <span className="vt-spin" aria-hidden="true" />}
          <div className="vt-status-t">
            <div className={'vt-st ' + status.tone}>{error ? 'Problem' : status.title}</div>
            <div className={'vt-sx' + (error ? ' err' : '')} role={error ? 'alert' : undefined}>{error || status.text}</div>
          </div>
        </div>
        <button type="button" className="vt-send" onClick={send} disabled={!canSend}>
          Send to kitchen{itemCount ? <span>{itemCount}</span> : null}
        </button>
      </footer>

      {toast && <div className="vt-toast" role="status">{toast}</div>}
      <style>{CSS}</style>
    </div>
  );
}

function MicIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>;
}
function StopIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" /></svg>;
}
function PrintIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v7H7z" /></svg>;
}

const CSS = `
.vt-wrap{--vt-bg:#EEEDEA;--vt-surface:#fff;--vt-ink:#18181B;--vt-muted:#5B5B63;--vt-line:#E4E3DF;--vt-red:#D92D20;--vt-ok:#0F7A43;--vt-warn:#B45309;
  font-family:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--vt-ink);background:var(--vt-bg);min-height:100%;display:flex;flex-direction:column;padding:16px 20px 0;box-sizing:border-box}
.vt-wrap *{box-sizing:border-box}
.vt-msg{padding:40px;text-align:center;color:var(--vt-muted)}
.vt-off{max-width:520px;margin:60px auto;background:var(--vt-surface);border-radius:20px;padding:32px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center}
.vt-off h1{margin:0;font-size:26px}.vt-off p{margin:0;color:var(--vt-muted)}
.vt-btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 20px;border-radius:12px;border:0;font:600 15px inherit;font-family:inherit;cursor:pointer;text-decoration:none}
.vt-btn-dark{background:var(--vt-ink);color:#fff}
.vt-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.vt-brand{display:flex;align-items:center;gap:10px;font-size:19px}
.vt-mark{width:32px;height:32px;border-radius:9px;background:var(--vt-red);color:#fff;display:grid;place-items:center}
.vt-servers{display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:var(--vt-muted);font-size:14px}
.vt-chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--vt-line);background:var(--vt-surface);color:var(--vt-ink);font:600 14px inherit;font-family:inherit;cursor:pointer}
.vt-chip.on{background:var(--vt-ink);color:#fff;border-color:var(--vt-ink)}
.vt-main{flex:1;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:20px;min-height:0;padding-bottom:16px}
@media (max-width:900px){.vt-main{grid-template-columns:minmax(0,1fr)}}
.vt-stage{display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.vt-paper{width:min(440px,100%);background:#fff;color:#111;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;padding:20px 20px 26px;border-radius:4px;
  box-shadow:0 2px 3px rgba(0,0,0,.08),0 18px 30px -18px rgba(0,0,0,.35);transition:transform .5s,opacity .5s}
.vt-paper.sent{transform:translateY(-8px);opacity:.6}
.vt-sub{text-align:center;font-size:12px;font-weight:600;letter-spacing:.08em;color:#555}
.vt-head{display:block;width:100%;background:none;border:0;font:700 28px/1.15 'IBM Plex Mono',ui-monospace,monospace;color:#111;text-align:center;margin:4px 0;cursor:pointer;padding:4px;border-radius:8px}
.vt-head:hover:not(:disabled){background:#F4F4F2}.vt-head.ghost{color:#C9C9C9;cursor:default}
.vt-headedit{display:flex;flex-direction:column;gap:10px;padding:12px;background:#F7F7F5;border-radius:12px;margin:6px 0;font-family:'IBM Plex Sans',system-ui,sans-serif}
.vt-seg{display:flex;gap:4px;background:#E9E8E4;border-radius:999px;padding:4px}
.vt-seg button{flex:1;height:40px;border:0;border-radius:999px;background:transparent;font:600 14px inherit;font-family:inherit;cursor:pointer;color:#444}
.vt-seg button.on{background:#fff;color:#111;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.vt-field{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600}
.vt-field input,.vt-add input,.vt-edit input{flex:1;height:44px;border:1px solid #D6D6D2;border-radius:10px;padding:0 12px;font:16px inherit;font-family:inherit;min-width:0}
.vt-meta{display:flex;justify-content:space-between;font-size:13px;font-weight:500;min-height:18px}
.vt-rule{border-top:2px dashed #111;margin:10px 0}
.vt-items{display:flex;flex-direction:column;gap:4px;min-height:160px}
.vt-empty{font-family:'IBM Plex Sans',system-ui,sans-serif;color:#777;font-size:15px;text-align:center;padding:36px 8px;display:flex;flex-direction:column;align-items:center;gap:10px}
.vt-line{border-radius:10px;margin:0 -8px;padding:2px 8px;animation:vtin .3s}
.vt-line.sel{background:#F7F7F5;box-shadow:inset 0 0 0 2px #111}
.vt-linebtn{display:flex;gap:12px;width:100%;background:none;border:0;padding:6px 0;text-align:left;cursor:pointer;font:700 19px 'IBM Plex Mono',ui-monospace,monospace;color:#111;min-height:44px;align-items:center}
.vt-q{min-width:22px}
.vt-note{font-size:15px;font-weight:700;margin:0 0 4px 34px;color:#2D31A6}.vt-note.no{color:#B42318}.vt-note.add{color:#0F7A43}
.vt-pick{background:#FFF6E0;border:2px solid #E8A317;border-radius:10px;padding:10px 12px;margin:4px 0 4px 26px;font-family:'IBM Plex Sans',system-ui,sans-serif}
.vt-pick.big{margin:6px -8px}
.vt-pick p{margin:0 0 8px;font-size:15px;font-weight:600;color:#7A3E06}
.vt-pick div{display:flex;gap:8px;flex-wrap:wrap}
.vt-pick button{height:44px;padding:0 16px;border-radius:10px;border:2px solid #C4790A;background:#fff;color:#7A3E06;font:600 15px inherit;font-family:inherit;cursor:pointer}
.vt-pick button.ghost{border-color:#E3CFA5;color:#7A5A1E}
.vt-edit{display:flex;flex-direction:column;gap:8px;padding:6px 0 10px 34px;font-family:'IBM Plex Sans',system-ui,sans-serif}
.vt-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.vt-row button{height:44px;min-width:44px;padding:0 14px;border-radius:10px;border:1px solid #D6D6D2;background:#fff;color:#111;font:600 15px inherit;font-family:inherit;cursor:pointer}
.vt-row .rm{color:#B42318}.vt-row .done{background:#111;color:#fff;border-color:#111;margin-left:auto}
.vt-x{font-size:13px!important}
.vt-foot{display:flex;justify-content:space-between;gap:8px;font-family:'IBM Plex Sans',system-ui,sans-serif}
.vt-link{background:none;border:0;color:#111;font:600 15px inherit;font-family:inherit;cursor:pointer;height:44px;padding:0 6px;text-decoration:underline;text-underline-offset:3px}
.vt-add{display:flex;flex-direction:column;gap:8px;margin-top:8px;font-family:'IBM Plex Sans',system-ui,sans-serif}
.vt-results{display:flex;flex-wrap:wrap;gap:6px;max-height:220px;overflow:auto}
.vt-results button{height:40px;padding:0 12px;border-radius:999px;border:1px solid #D6D6D2;background:#fff;font:500 14px inherit;font-family:inherit;cursor:pointer}
.vt-none{color:var(--vt-muted);font-size:14px}
.vt-heard{max-width:440px;margin:0;color:var(--vt-muted);font-size:14px;text-align:center}
.vt-today{background:var(--vt-surface);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:8px;min-height:0;max-height:calc(100vh - 230px);overflow:auto;align-self:start}
.vt-today-h{display:flex;justify-content:space-between;align-items:baseline}.vt-today-h span{color:var(--vt-muted);font-size:13px}
.vt-today ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.vt-today li{display:flex;align-items:center;gap:10px;border:1px solid var(--vt-line);border-radius:12px;padding:8px 8px 8px 12px}
.vt-today li div{flex:1;min-width:0;display:flex;flex-direction:column}.vt-today li span{font-size:12px;color:var(--vt-muted)}
.vt-today li button{width:44px;height:44px;border-radius:10px;border:0;background:#F4F4F2;cursor:pointer;display:grid;place-items:center;color:#111}
.vt-bar{position:sticky;bottom:0;display:flex;align-items:center;gap:14px;padding:14px 0 calc(14px + env(safe-area-inset-bottom,0px));background:var(--vt-bg);border-top:1px solid var(--vt-line);flex-wrap:wrap}
.vt-mic{width:72px;height:72px;border-radius:50%;border:0;background:var(--vt-red);color:#fff;display:grid;place-items:center;cursor:pointer;flex-shrink:0;box-shadow:0 10px 22px -10px rgba(217,45,32,.7)}
.vt-mic.live{background:#111;box-shadow:0 0 0 6px rgba(217,45,32,.25)}
.vt-mic:disabled{opacity:.5;cursor:wait}
.vt-status{flex:1 1 260px;min-width:0;min-height:72px;border-radius:18px;background:var(--vt-surface);padding:10px 18px;display:flex;align-items:center;gap:14px}
.vt-status-t{min-width:0}
.vt-st{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--vt-muted)}
.vt-st.live{color:var(--vt-red)}.vt-st.ok{color:var(--vt-ok)}.vt-st.warn{color:var(--vt-warn)}
.vt-sx{font-size:16px}.vt-sx.err{color:#B42318;font-weight:600}
.vt-wave{display:flex;align-items:center;gap:3px;height:32px;flex-shrink:0}.vt-wave i{width:4px;border-radius:2px;background:var(--vt-red);transition:height .08s}
.vt-spin{width:20px;height:20px;border-radius:50%;border:3px solid #E4E3DF;border-top-color:var(--vt-red);animation:vtspin .8s linear infinite;display:inline-block;flex-shrink:0}
.vt-send{height:72px;flex:0 1 260px;border:0;border-radius:18px;background:#111;color:#fff;font:600 18px inherit;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
.vt-send span{font:600 14px 'IBM Plex Mono',monospace;background:#3F3F46;border-radius:8px;padding:2px 8px}
.vt-send:disabled{background:#DCDBD7;color:#8A8A90;cursor:not-allowed}.vt-send:disabled span{background:#C9C8C4}
.vt-conflict{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#FFF6E0;border:2px solid #E8A317;border-radius:16px;padding:12px 16px;margin-bottom:10px;color:#7A3E06;font-size:15px}
.vt-conflict .vt-row button{height:44px}
.vt-toast{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);background:#111;color:#fff;border-radius:14px;padding:12px 20px;font-size:15px;font-weight:500;z-index:50;box-shadow:0 18px 40px -14px rgba(0,0,0,.5)}
@media (max-width:640px){.vt-send{flex:1 1 100%}.vt-wrap{padding:12px 12px 0}}
@keyframes vtspin{to{transform:rotate(360deg)}}
@keyframes vtin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.vt-wrap *{animation:none!important;transition:none!important}}
.vt-wrap button:focus-visible,.vt-wrap input:focus-visible{outline:3px solid var(--vt-red);outline-offset:2px}
`;
