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
import { getOrderItemKey } from '../../../utils/orderItemKey';
import { startVadSession } from '../../../utils/voiceVad';
import { startLiveVoice, playAiVoice } from '../../../utils/voiceLive';

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
  // hands-free conversation (settings.handsFree)
  const [convo, setConvo] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [thinking, setThinking] = useState(0);
  const [reply, setReply] = useState('');
  const [autoSend, setAutoSend] = useState(null); // { left: seconds } — "done" said → send unless Undo
  const vadRef = useRef(null);
  const convoRef = useRef(false);
  const chainRef = useRef(Promise.resolve());
  const ticketRef = useRef(null);
  const [log, setLog] = useState([]); // what was said / done / answered, newest last
  const [floor, setFloor] = useState([]); // [{ n, busy }]
  const [showToday, setShowToday] = useState(false);
  const logEnd = useRef(null);
  // live two-way voice (restaurant.voiceAi.engine === 'live')
  const liveRef = useRef(null);
  const [live, setLive] = useState(false);
  const [aiState, setAiState] = useState('idle'); // idle | connecting | listening | hearing | thinking | speaking
  const [youText, setYouText] = useState('');
  const [aiText, setAiText] = useState('');
  const [muted, setMuted] = useState(false);
  const sendWaiter = useRef(null);
  const reportSend = (msg) => { const w = sendWaiter.current; sendWaiter.current = null; if (w) w(msg); };
  const stageRef = useRef(null);
  const levelsRef = useRef(null);
  const handlers = useRef({});
  const pushLog = useCallback((kind, text) => {
    if (!text) return;
    setLog((l) => [...l, { id: Date.now() + Math.random(), kind, text: String(text).slice(0, 240) }].slice(-24));
  }, []);
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

  useEffect(() => { ticketRef.current = ticket; }, [ticket]);
  useEffect(() => { try { logEnd.current && logEnd.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch { /* ignore */ } }, [log]);

  // Tables at a glance: free / has an order (refreshed every 30 s and after each send)
  const loadFloor = useCallback(async () => {
    if (!rid) return;
    try {
      const res = await apiClient.getFloors(rid);
      const list = [];
      (res?.floors || []).forEach((f) => (f.tables || []).forEach((t) => {
        const n = t.number ?? t.tableNumber ?? t.name;
        if (n != null && String(n).trim()) list.push({ n: String(n).trim(), busy: t.status === 'occupied' || !!t.currentOrderId });
      }));
      list.sort((a, b) => a.n.localeCompare(b.n, undefined, { numeric: true }));
      setFloor(list.slice(0, 60));
    } catch { /* chips are a convenience */ }
  }, [rid]);
  useEffect(() => {
    loadFloor();
    const t = setInterval(loadFloor, 30000);
    return () => clearInterval(t);
  }, [loadFloor]);

  useEffect(() => () => {
    try { vadRef.current && vadRef.current.stop(); } catch { /* gone */ }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* none */ }
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
      pushLog('you', `“${res.transcript || ''}”`);
      pushLog('did', `${res.ticket.lines.length ? `Added ${res.ticket.lines.reduce((a, l) => a + l.quantity, 0)} item(s)` : 'Nothing added'}${res.ticket.unclear.length ? ` · ${res.ticket.unclear.length} to check` : ''}`);
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
  }, [rid, ticket, pushLog]);

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

  // ── hands-free conversation ──
  const speak = (text) => {
    if (settings?.replies !== 'voice' || !text || typeof window === 'undefined') return;
    if (settings?.ai?.aiVoice && rid) {
      // natural AI voice (dine-admin turned it on); the mic pauses so it never hears itself
      vadRef.current && vadRef.current.pause();
      setAiState('speaking');
      const resume = () => { setAiState('idle'); if (convoRef.current && vadRef.current) vadRef.current.resume(); };
      playAiVoice(rid, text, { onEnd: resume }).catch(() => resume());
      return;
    }
    if (!window.speechSynthesis) return;
    try {
      const u = new window.SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      vadRef.current && vadRef.current.pause(); // do not hear our own reply
      // resume when speech ends — or after its expected length: some engines never report "end"
      let resumed = false;
      const resume = () => { if (resumed) return; resumed = true; if (convoRef.current && vadRef.current) vadRef.current.resume(); };
      u.onend = resume; u.onerror = resume;
      setTimeout(resume, Math.min(8000, 900 + text.split(/\s+/).length * 330));
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { /* speech not available — the reply is on screen */ }
  };

  const applyAgent = (res) => {
    if (res.cancel) { ticketRef.current = null; setTicket(null); setHeard(''); return null; }
    const base = ticketRef.current || { orderType: orderTypes[0] || 'dine-in', tableNumber: null, customerName: null, orderNotes: null, lines: [], unclear: [] };
    const removed = new Set(res.remove || []);
    let tk = { ...base, lines: base.lines.filter((l) => !removed.has(l.key)), unclear: [...(base.unclear || [])] };
    if (res.header) tk = { ...tk, ...res.header };
    for (const c of res.changes || []) {
      tk.lines = tk.lines.map((l) => {
        if (l.key !== c.key) return l;
        const x = { ...l, notes: [...(l.notes || [])] };
        if (c.quantity) x.quantity = c.quantity;
        if (c.variant) {
          const item = menu.find((m) => m.id === l.menuItemId) || {};
          const v = (item.variants || []).find((o) => o && o.name && o.name.toLowerCase() === c.variant.toLowerCase());
          if (v) { x.variant = v.name; x.needsVariant = false; if (Number(v.price)) x.price = Number(v.price); }
          else if (!x.notes.includes(c.variant)) x.notes.push(c.variant);
        }
        const drop = (c.removeNotes || []).map((n) => n.toLowerCase());
        x.notes = [...x.notes.filter((n) => !drop.includes(n.toLowerCase())), ...(c.addNotes || []).filter((n) => !x.notes.includes(n))];
        return x;
      });
    }
    tk.lines = [...tk.lines, ...(res.addLines || [])];
    tk.unclear = [...tk.unclear, ...(res.unclear || [])];
    const empty = !tk.lines.length && !tk.unclear.length && !tk.tableNumber && !tk.customerName;
    ticketRef.current = empty ? null : tk;
    setTicket(empty ? null : tk);
    return ticketRef.current;
  };

  const stopConvo = () => {
    convoRef.current = false;
    setConvo(false); setHearing(false);
    try { vadRef.current && vadRef.current.stop(); } catch { /* gone */ }
    vadRef.current = null;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* none */ }
    setLevels(Array(14).fill(0.08));
    setPhase(ticketRef.current ? 'check' : 'idle');
  };

  const requestAutoSend = (tk) => {
    if (!tk || !tk.lines.length) { const m = 'Nothing on the ticket yet.'; setReply(m); speak(m); return; }
    if (tk.unclear.length || tk.lines.some((l) => l.needsVariant)) { const m = 'Pick the highlighted item first, then say send.'; setReply(m); speak(m); return; }
    stopConvo();
    setPhase('check');
    setAutoSend({ left: 3 });
    pushLog('say', 'Sending to the kitchen — tap Undo to keep editing');
  };

  const handleSegment = (blob) => {
    chainRef.current = chainRef.current.then(async () => {
      if (!convoRef.current) return;
      setThinking((n) => n + 1);
      try {
        const res = await apiClient.voiceTicketConverse(rid, { audio: blob, draft: ticketRef.current });
        if (!res?.success) throw new Error(res?.error || 'Could not understand that');
        if (res.heardNothing || !convoRef.current) return;
        setError('');
        setHeard(res.transcript || '');
        pushLog('you', `“${res.transcript}”`);
        const tk = applyAgent(res);
        if (res.touched || res.cancel) pushLog('did', res.say || (res.cancel ? 'Cleared the ticket' : 'Updated the ticket'));
        else if (res.say) pushLog('say', res.say);
        // Speak only what needs ears — answers, "sending", "cancelled". Order edits are on the ticket;
        // speaking them would pause the mic (it must not hear its own voice) while staff keep talking.
        if (res.say) { setReply(res.say); if (!res.touched || res.send || res.cancel) speak(res.say); }
        if (res.send) requestAutoSend(tk);
      } catch (e) {
        setError(e?.message || 'Voice service had a problem — keep talking or tap to edit');
      } finally {
        setThinking((n) => Math.max(0, n - 1));
      }
    });
  };

  const startConvo = async () => {
    setError(''); setReply(''); setAutoSend(null);
    if (!navigator.mediaDevices?.getUserMedia) { setError('This device cannot record here. Use Add item instead.'); return; }
    try {
      convoRef.current = true;
      setConvo(true); setPhase('listening');
      vadRef.current = await startVadSession({
        onSegment: handleSegment,
        onLevels: (lv) => { levelsRef.current = lv; setLevels(lv); },
        onSpeaking: setHearing,
        onIdle: () => { if (convoRef.current) { stopConvo(); flash('Stopped listening — tap the mic to talk again'); } },
      });
      if (!convoRef.current) { vadRef.current.stop(); vadRef.current = null; }
    } catch (e) {
      convoRef.current = false; setConvo(false); setPhase(ticketRef.current ? 'check' : 'idle');
      setError(e?.name === 'NotAllowedError' ? 'Microphone is blocked — allow it in the browser / device settings' : 'Could not start the microphone');
    }
  };

  // ── live two-way voice ──
  // The live call keeps running across renders; it reaches the latest screen functions through this ref.
  handlers.current = {
    applyOps: (ops) => {
      const tk = applyAgent(ops);
      if (tk) setPhase('check');
      return tk;
    },
    sendVoice: () => new Promise((resolve) => {
      const tk = ticketRef.current;
      if (!tk || !tk.lines.length) { resolve('Nothing on the order yet.'); return; }
      if (tk.unclear.length || tk.lines.some((l) => l.needsVariant)) { resolve('Cannot send yet: an item still needs a choice (see ORDER NOW). Ask the staff.'); return; }
      sendWaiter.current = resolve;
      setTimeout(() => reportSend('Still sending — tell them to check the screen.'), 25000);
      send({ auto: true });
    }),
    cancel: () => { ticketRef.current = null; setTicket(null); setSel(null); setConflict(null); setPhase('idle'); },
  };

  const startLive = async () => {
    if (liveRef.current) return;
    setError(''); setYouText(''); setAiText(''); setMuted(false);
    if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') { setError('This device cannot do live voice here. Use Add item instead.'); return; }
    setLive(true); setAiState('connecting');
    try {
      liveRef.current = await startLiveVoice({
        restaurantId: rid,
        getDraft: () => ticketRef.current,
        onOps: (ops) => handlers.current.applyOps(ops),
        onSend: () => handlers.current.sendVoice(),
        onCancel: () => handlers.current.cancel(),
        onState: (st) => setAiState(st === 'ended' ? 'idle' : st),
        onYou: (txt, fin) => { setYouText(txt); if (fin && txt) pushLog('you', txt); },
        onAi: (txt, fin) => { setAiText(txt); if (fin && txt) pushLog('say', txt); },
        onError: (m) => setError(m),
        onEnd: (why) => {
          liveRef.current = null; setLive(false); setAiState('idle');
          if (why === 'time') flash('Live voice ended (time limit) — tap to talk again');
          else if (why === 'dropped') flash('Connection dropped — tap to talk again');
        },
      });
    } catch (e) {
      liveRef.current = null; setLive(false); setAiState('idle');
      setError(e?.name === 'NotAllowedError' ? 'Microphone is blocked — allow it in the browser / device settings' : (e?.message || 'Could not start the live voice'));
    }
  };
  const stopLive = () => { const l = liveRef.current; liveRef.current = null; if (l) l.stop('user'); setLive(false); setAiState('idle'); };
  useEffect(() => () => { if (liveRef.current) liveRef.current.stop('user'); }, []);

  // orb follows the voices (no re-render: CSS variables on the stage, every animation frame)
  useEffect(() => {
    if (!live && !convo) { if (stageRef.current) { stageRef.current.style.setProperty('--you', '0'); stageRef.current.style.setProperty('--ai', '0'); } return undefined; }
    let raf = 0; let you = 0; let ai = 0;
    const tick = () => {
      let y = 0; let a = 0;
      if (liveRef.current) { const lv = liveRef.current.levels(); y = lv.you; a = lv.ai; }
      else if (levelsRef.current) { const arr = levelsRef.current; y = Math.min(1, Math.max(...arr.slice(3, 9)) * 1.4); }
      you += (y - you) * 0.35; ai += (a - ai) * 0.35;
      if (stageRef.current) { stageRef.current.style.setProperty('--you', you.toFixed(3)); stageRef.current.style.setProperty('--ai', ai.toFixed(3)); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, convo]);

  // "That's it" → 3 s to Undo, then the normal send (auto: an occupied table gets the items added)
  useEffect(() => {
    if (!autoSend) return undefined;
    if (autoSend.left <= 0) { setAutoSend(null); send({ auto: true }); return undefined; }
    const t = setTimeout(() => setAutoSend((a) => (a ? { left: a.left - 1 } : a)), 1000);
    return () => clearTimeout(t);
  }, [autoSend]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const startOver = () => { setTicket(null); setHeard(''); setSel(null); setEditHead(false); setError(''); setPhase('idle'); setLog([]); };

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

  const canSend = ticket && ticket.lines.length > 0 && ticket.unclear.length === 0 && !ticket.lines.some((l) => l.needsVariant) && (phase === 'check' || (convo && phase === 'listening'))
    && (!isDineIn(ticket.orderType) || !!String(ticket.tableNumber || '').trim() || true);

  const toItems = (tk) => tk.lines.map((l) => ({
    menuItemId: l.menuItemId, name: l.name, price: l.price, quantity: l.quantity, total: l.price * l.quantity,
    notes: l.notes.join(', '), categoryId: l.categoryId || undefined, noteLine: true,
    ...(l.variant ? { selectedVariant: { name: l.variant, price: l.price } } : {}),
  }));
  const finishSent = (tk, orderId, order, printed, added) => {
    reportSend(`${printed === 'failed' ? 'Saved, but the printer did not answer — tell them to reprint.' : 'Sent to the kitchen.'}${added ? ` Added to ${tk.tableNumber ? 'table ' + tk.tableNumber + "'s" : 'the'} open order.` : ''}${order?.dailyOrderId || order?.orderNumber ? ` Order number ${order.dailyOrderId || order.orderNumber}.` : ''}`);
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
    loadFloor();
    setTimeout(() => { setTicket(null); setHeard(''); setSel(null); setEditHead(false); setLog([]); setPhase((p) => (p === 'sent' ? 'idle' : p)); }, 1600);
  };

  // Same item already on the open order (same item / size / options, and no kitchen note of its own)
  // → raise that line's quantity, like the POS does. The server then marks it "updated +N", so the
  // kitchen ticket shows the extra quantity. (Sending it as a separate line let the server merge it
  // into the old line after marking, and the extra never reached the kitchen.) Lines with a note
  // stay separate (noteLine), as before.
  const mergeIntoOpenOrder = (existingItems, newItems) => {
    const merged = (existingItems || []).map((it) => ({ ...it }));
    // same dish (item / size / options / seat) AND the same kitchen notes — a plain burger never joins
    // "burger, no lettuce"; an existing POS line (no noteLine flag) still counts as the same dish.
    const dish = (it) => getOrderItemKey({ ...it, noteLine: false });
    const notesOf = (it) => (Array.isArray(it.notes) ? it.notes.join(',') : String(it.notes || '')).toLowerCase().split(',').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean).sort().join(',');
    for (const it of newItems) {
      const idx = merged.findIndex((x) => dish(x) === dish(it) && notesOf(x) === notesOf(it));
      if (idx >= 0) {
        const q = (Number(merged[idx].quantity) || 0) + (Number(it.quantity) || 0);
        merged[idx] = { ...merged[idx], quantity: q, total: (Number(merged[idx].price) || 0) * q };
      } else {
        merged.push(it);
      }
    }
    return merged;
  };

  // The table already has an open order: add these items to it (kitchen gets only the new items).
  const addToOpenOrder = async (conf = conflict) => {
    const ticket = ticketRef.current; // eslint-disable-line no-shadow
    if (!conf || !ticket) return;
    setPhase('sending'); setError('');
    try {
      const full = await apiClient.getOrderById(conf.orderId);
      const existing = full?.order || (Array.isArray(full?.orders) ? full.orders[0] : null) || full?.data || full;
      if (!existing?.id || ['completed', 'cancelled', 'paid', 'settled'].includes(existing.status)) throw new Error('That order is already closed — send this as a new order');
      const who = server || {};
      const res = await apiClient.updateOrder(existing.id, {
        restaurantId: rid,
        items: mergeIntoOpenOrder(existing.items, toItems(ticket)),
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: { name: who.name || 'Staff Member', id: who.id || 'unknown' },
      });
      if (!(res?.data || res?.success || res?.order)) throw new Error(res?.error || 'Could not add to the order');
      let printed = 'none';
      try { printed = await printTicket(existing.id, null, { incremental: true }); } catch { printed = 'failed'; }
      finishSent(ticket, existing.id, existing, printed, true);
    } catch (e) {
      setError(e?.message || 'Could not add to the open order');
      reportSend(`Failed: ${e?.message || 'could not add to the open order'}`);
      setPhase('check');
    }
  };

  const send = async ({ tableNotSetUp = false, auto = false } = {}) => {
    const tk = ticketRef.current || ticket;
    const ready = tk && tk.lines.length > 0 && tk.unclear.length === 0 && !tk.lines.some((l) => l.needsVariant);
    if (!canSend && !(tableNotSetUp && ready) && !(auto && ready)) { reportSend('Nothing ready to send.'); return; }
    if (convoRef.current) stopConvo();
    setPhase('sending'); setError('');
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
          if (hit) {
            const conf = { orderId: hit.id, number: hit.orderNumber || '', items: hit.itemCount || (hit.items || []).length, table: tk.tableNumber };
            // spoken "Table 5 … that's it" for a table that is already eating → add to its order
            if (auto) { setPhase('check'); await addToOpenOrder(conf); return; }
            setConflict(conf); setPhase('check'); reportSend(`Table ${tk.tableNumber} already has an open order — the staff must choose on screen.`); return;
          }
        } catch { /* fall through to the plain message */ }
      }
      // Table number the restaurant hasn't set up in DineOpen → offer to send with the number on the ticket
      if (dine && tk.tableNumber && !tableNotSetUp && /not found/i.test(msg)) {
        // spoken order (live): send it with the number printed on the ticket; by tap: ask first
        if (auto && live) { await send({ tableNotSetUp: true, auto: true }); return; }
        setConflict({ missing: true, table: tk.tableNumber }); setPhase('check'); reportSend(`Table ${tk.tableNumber} is not set up — the staff must choose on screen.`); return;
      }
      setError(msg || 'Could not send — nothing was printed. Please try again.');
      reportSend(`Failed: ${msg || 'could not send'}. Nothing was printed.`);
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

  const handsFree = settings?.handsFree !== false;
  let status = { tone: '', title: handsFree ? 'Tap and just talk' : 'Tap and say the order', text: handsFree ? 'Say the table or to-go name, then the items. No need to tap again between sentences — say “that’s it” to send.' : 'Say the table or to-go name, then each item and any changes. Tap again when you’re done.' };
  if (autoSend) status = { tone: 'ok', title: `Sending in ${autoSend.left}`, text: 'Tap Undo to keep editing' };
  else if (convo) status = { tone: 'live', title: hearing ? 'Hearing you' : thinking ? 'Got it…' : 'Listening', text: 'Talk naturally · ask anything · say “that’s it” to send' };
  else if (phase === 'listening') status = { tone: 'live', title: `Listening · 0:${String(secs).padStart(2, '0')}`, text: 'Tap again when you’re done' };
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

  const orbLive = convo || listening;
  const engineLive = settings?.ai?.engine === 'live';
  const talking = engineLive ? live : (handsFree ? convo : listening);
  const stageState = engineLive
    ? (live ? aiState : (phase === 'sending' ? 'thinking' : 'idle'))
    : (autoSend ? 'done' : aiState === 'speaking' ? 'speaking' : convo ? (thinking > 0 && !hearing ? 'thinking' : hearing ? 'hearing' : 'listening') : listening ? 'hearing' : busy ? 'thinking' : 'idle');
  const stageLabel = autoSend ? `Sending in ${autoSend.left}` : ({ connecting: 'Connecting…', listening: 'Listening', hearing: 'Hearing you', thinking: 'Thinking…', speaking: 'Speaking', done: 'Order complete' }[stageState]) || (phase === 'sent' ? 'Sent to the kitchen' : status.title);
  const mainAction = engineLive ? (live ? stopLive : startLive) : handsFree ? (convo ? stopConvo : startConvo) : (listening ? stopListening : startListening);
  const mainDisabled = engineLive ? aiState === 'connecting' : handsFree ? (phase === 'sending' || !!autoSend) : busy;
  const eyebrow = autoSend ? 'Order complete' : error ? 'Problem' : orbLive ? 'Listening' : phase === 'sent' ? 'Sent' : busy ? 'Working' : 'Ready';
  const estTotal = ticket ? ticket.lines.reduce((a, l) => a + (Number(l.price) || 0) * l.quantity, 0) : 0;
  const examples = [
    { kind: 'Order', say: 'Table five, two cheeseburgers, one no onion, and a Coke' },
    { kind: 'Change', say: 'Make it two Cokes, no ice' },
    { kind: 'Ask', say: 'What’s on table twelve, and how much is the bill?' },
    { kind: 'Send', say: handsFree ? 'That’s it' : 'Tap Send when it looks right' },
  ];

  return (
    <div className="vt-wrap">
      <header className="vt-top">
        <div className="vt-brand">
          {/* Full screen (no side nav): the menu opens the nav as an overlay, like the dashboard. */}
          <button type="button" className="vt-menu" aria-label="Open menu" title="Menu"
            onClick={() => { try { window.dispatchEvent(new Event('openNavSidebar')); } catch { /* ignore */ } }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="vt-mark" aria-hidden="true"><MicIcon size={16} /></span>
          <span className="vt-brand-t"><b>Voice Ticket</b>{restaurant?.name ? <small>{restaurant.name}</small> : null}</span>
        </div>

        {floor.length > 0 && (
          <div className="vt-floor" aria-label="Tables">
            <span className="vt-floor-l">Tables</span>
            {floor.map((t) => {
              const mine = ticket && isDineIn(ticket.orderType) && String(ticket.tableNumber || '') === t.n;
              return <span key={t.n} className={'vt-tb' + (mine ? ' mine' : t.busy ? ' busy' : '')} title={mine ? 'This ticket' : t.busy ? 'Has an order' : 'Free'}>{t.n}</span>;
            })}
            <span className="vt-floor-key"><i className="free" />free <i className="busy" />has an order</span>
          </div>
        )}

        <div className="vt-topr">
          {settings.askServer && (
            <div className="vt-servers" role="group" aria-label="Who is taking the order">
              <span>Taken by</span>
              {[server, ...staff.filter((s) => s.id !== server?.id)].filter(Boolean).slice(0, 6).map((s) => (
                <button key={s.id || s.name} type="button" className={'vt-chip' + (server?.id === s.id && server?.name === s.name ? ' on' : '')} onClick={() => setServer(s)}>{s.name.split(' ')[0]}</button>
              ))}
            </div>
          )}
          <button type="button" className="vt-todaybtn" onClick={() => setShowToday(true)} aria-label={`Today's tickets: ${tickets.length}`}>
            <PrintIcon /> Today <span>{tickets.length}</span>
          </button>
        </div>
      </header>

      <div className="vt-main">
        <section className={'vt-convo vt-stage2 st-' + stageState} aria-label="Conversation" ref={stageRef}>
          <div className="vt-engine">
            <span className={'vt-engdot' + (talking ? ' on' : '')} aria-hidden="true" />
            {engineLive ? 'Live voice' : 'Voice'}{settings?.ai?.aiVoice && !engineLive ? ' · AI voice' : ''}
          </div>

          <div className="vt-orbzone">
            <button type="button" className="vt-orb3" onClick={mainAction} disabled={mainDisabled} aria-label={talking ? 'Stop' : 'Start talking'}>
              <span className="vt-aura" aria-hidden="true" />
              <span className="vt-ring r1" aria-hidden="true" />
              <span className="vt-ring r2" aria-hidden="true" />
              <span className="vt-ring r3" aria-hidden="true" />
              <span className="vt-core" aria-hidden="true">
                {stageState === 'thinking' || stageState === 'connecting'
                  ? <span className="vt-dots"><i /><i /><i /></span>
                  : stageState === 'speaking' || stageState === 'hearing' || stageState === 'listening'
                    ? <span className="vt-wave3">{[0.55, 0.85, 1, 0.75, 0.5].map((k, i) => <i key={i} style={{ '--k': k }} />)}</span>
                    : autoSend ? <CheckIcon /> : <MicIcon size={54} />}
              </span>
            </button>
            <div className="vt-statelbl" aria-live="polite">{error ? 'Something went wrong' : stageLabel}</div>
          </div>

          <div className="vt-captions" aria-live="polite">
            {error ? <p className="vt-cap-err" role="alert">{error}</p> : null}
            {!error && youText ? <p className="vt-cap-you">{youText}</p> : null}
            {!error && aiText ? <p className="vt-cap-ai">{aiText}</p> : null}
            {!error && !youText && !aiText && (
              <p className="vt-cap-hint">{talking ? (engineLive ? 'Talk naturally — “Table five, two cheeseburgers, one no onion”' : 'Say the table, then the items. “That’s it” sends.') : (engineLive ? 'Tap the orb and talk — it answers you, and you can interrupt it.' : status.text)}</p>
            )}
          </div>

          <div className="vt-ctrls">
            {engineLive && live && (
              <button type="button" className={'vt-cbtn' + (muted ? ' on' : '')} onClick={() => { const m = !muted; setMuted(m); liveRef.current && liveRef.current.mute(m); }} aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? <MicOffIcon /> : <MicIcon size={20} />}<span>{muted ? 'Unmute' : 'Mute'}</span>
              </button>
            )}
            <button type="button" className={'vt-mainbtn' + (talking ? ' stop' : '')} onClick={mainAction} disabled={mainDisabled}>
              {talking ? <><StopIcon /> End</> : <><MicIcon size={20} /> {engineLive ? 'Start live voice' : 'Start talking'}</>}
            </button>
            <button type="button" className="vt-cbtn" onClick={() => setAdding(true)} aria-label="Add by typing"><KeyIcon /><span>Type</span></button>
          </div>

      {conflict && !conflict.missing && (
        <div className="vt-conflict" role="alert">
          <div><b>Table {conflict.table} already has an open order.</b> Add these items to it? The kitchen gets only the new items.</div>
          <div className="vt-row">
            <button type="button" className="done" onClick={() => addToOpenOrder()} disabled={phase === 'sending'}>Add to Table {conflict.table}&apos;s order</button>
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


          {log.length > 0 && (
            <ol className="vt-hist" aria-label="Earlier in this order">
              {log.slice(-6).map((t) => (
                <li key={t.id} className={t.kind}><b>{t.kind === 'you' ? 'You' : t.kind === 'did' ? '✓' : 'AI'}</b><span>{t.text.replace(/^“|”$/g, '')}</span></li>
              ))}
              <li ref={logEnd} aria-hidden="true" className="vt-logend" />
            </ol>
          )}
        </section>

        <aside className="vt-side" aria-label="Kitchen ticket">
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
                  <div className="vt-empty">The ticket builds itself as you talk.<br />Table or to-go name first, then the items.</div>
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
            <div className="vt-sendwrap">
              {ticket && ticket.lines.length > 0 && <span className="vt-est">Est. {getCurrencySymbol()}{estTotal.toFixed(2)}</span>}
              {autoSend ? (
                <button type="button" className="vt-send vt-undo" onClick={() => { setAutoSend(null); flash('Not sent — keep editing'); pushLog('say', 'Not sent — keep editing'); }}>
                  <span className="vt-undofill" aria-hidden="true" />
                  <b>Sending in {autoSend.left} — tap to Undo</b>
                </button>
              ) : (
                <button type="button" className="vt-send" onClick={() => send()} disabled={!canSend}>
                  Send to kitchen{itemCount ? <span>{itemCount}</span> : null}
                </button>
              )}
              {handsFree && !autoSend && <span className="vt-hint">or just say “that’s it”</span>}
            </div>
        </aside>
      </div>

      {showToday && (
        <div className="vt-drawerbg" onClick={(e) => { if (e.target === e.currentTarget) setShowToday(false); }}>
          <aside className="vt-drawer" role="dialog" aria-modal="true" aria-label="Today's tickets">
            <div className="vt-today-h"><b>Today</b><span>{tickets.length} tickets</span><button type="button" className="vt-x2" aria-label="Close" onClick={() => setShowToday(false)}>✕</button></div>
            {!tickets.length && <p className="vt-none">Sent tickets show here for reprint.</p>}
            <ul>
              {tickets.map((e, i) => (
                <li key={`${e.orderId}-${e.at}-${i}`}>
                  <div><b>{e.head}</b><span>{[e.number && `#${e.number}`, e.who, `${e.count} items`, e.at].filter(Boolean).join(' · ')}</span></div>
                  <button type="button" aria-label={`Reprint ${e.head}`} onClick={() => reprint(e)}><PrintIcon /></button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {toast && <div className="vt-toast" role="status">{toast}</div>}
      <style>{CSS}</style>
    </div>
  );
}

function MicIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>;
}
function CheckIcon() {
  return <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
}
function MicOffIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18" /><path d="M9 9v2a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3" /><path d="M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.6 2.8" /><path d="M12 18v3" /></svg>;
}
function KeyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></svg>;
}
function StopIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" /></svg>;
}
function PrintIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v7H7z" /></svg>;
}

const CSS = `
.vt-wrap{--vt-bg:#F8F1EF;--vt-head:#FFFAF8;--vt-surface:#fff;--vt-ink:#1C1917;--vt-muted:#57534E;--vt-line:#EFDDD8;--vt-red:#D92D20;--vt-deep:#9F1F14;--vt-soft:#FDE8E5;--vt-ok:#0F7A43;--vt-warn:#B45309;
  font-family:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--vt-ink);background:var(--vt-bg);min-height:100vh;min-height:100dvh;width:100%;display:flex;flex-direction:column;padding:0;box-sizing:border-box}
.vt-wrap *{box-sizing:border-box}
.vt-msg{padding:40px;text-align:center;color:var(--vt-muted)}
.vt-off{max-width:520px;margin:60px auto;background:var(--vt-surface);border-radius:20px;padding:32px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center}
.vt-off h1{margin:0;font-size:26px}.vt-off p{margin:0;color:var(--vt-muted)}
.vt-btn{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 20px;border-radius:12px;border:0;font:600 15px inherit;font-family:inherit;cursor:pointer;text-decoration:none}
.vt-btn-dark{background:var(--vt-ink);color:#fff}
.vt-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.vt-brand{display:flex;align-items:center;gap:10px;font-size:19px}
.vt-menu{width:40px;height:40px;border-radius:12px;border:1px solid var(--vt-line);background:var(--vt-surface);color:var(--vt-ink);display:grid;place-items:center;cursor:pointer;padding:0}
.vt-menu:hover{background:#F4F4F2}
@media (max-width:767px){.vt-menu{display:none}.vt-top{padding-left:52px}}
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
.vt-mic.live.hearing{background:var(--vt-red);animation:vtPulse 1.1s ease-in-out infinite}
@keyframes vtPulse{0%,100%{box-shadow:0 0 0 6px rgba(217,45,32,.25)}50%{box-shadow:0 0 0 14px rgba(217,45,32,.12)}}
@media (prefers-reduced-motion:reduce){.vt-mic.live.hearing{animation:none}}
.vt-wave.calm i{background:#C9C8C4}
.vt-send.vt-undo{background:var(--vt-ok)}.vt-send.vt-undo span{background:rgba(255,255,255,.22)}
.vt-reply{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);max-width:min(560px,calc(100vw - 32px));display:flex;align-items:center;gap:10px;background:var(--vt-surface);color:var(--vt-ink);border:1px solid var(--vt-line);border-radius:16px;padding:12px 16px;font-size:15px;line-height:1.35;box-shadow:0 18px 40px -18px rgba(0,0,0,.35);z-index:40}
.vt-reply-dot{width:24px;height:24px;border-radius:8px;background:var(--vt-red);color:#fff;display:grid;place-items:center;flex-shrink:0}
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
/* ── 2026-10 redesign: conversation left, ticket right, red theme ── */
.vt-top{margin:0;padding:12px 24px;background:var(--vt-head);border-bottom:1px solid var(--vt-line);gap:16px}
.vt-brand-t{display:flex;flex-direction:column;line-height:1.15}.vt-brand-t b{font-size:18px}.vt-brand-t small{font-size:12px;color:var(--vt-muted)}
.vt-floor{display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex:1 1 360px;justify-content:center;min-width:0}
.vt-floor-l{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--vt-muted);margin-right:4px}
.vt-tb{min-width:34px;height:34px;padding:0 8px;border-radius:9px;display:inline-grid;place-items:center;font:600 14px 'IBM Plex Mono',ui-monospace,monospace;background:#fff;color:var(--vt-ink);border:1.5px solid #CFCAC4}
.vt-tb.busy{background:var(--vt-soft);color:var(--vt-deep);border-color:var(--vt-red)}
.vt-tb.mine{background:var(--vt-red);color:#fff;border-color:var(--vt-red)}
.vt-floor-key{display:flex;align-items:center;gap:6px;margin-left:8px;font-size:12px;color:var(--vt-muted)}
.vt-floor-key i{width:10px;height:10px;border-radius:3px;display:inline-block}.vt-floor-key i.free{border:1.5px solid #9C9893}.vt-floor-key i.busy{background:var(--vt-soft);border:1.5px solid var(--vt-red);margin-left:6px}
.vt-topr{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.vt-chip.on{background:var(--vt-red);border-color:var(--vt-red);color:#fff}
.vt-todaybtn{height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--vt-line);background:#fff;color:var(--vt-ink);font:600 14px 'IBM Plex Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px}
.vt-todaybtn span{font:600 12px 'IBM Plex Mono',monospace;background:var(--vt-soft);color:var(--vt-deep);border-radius:6px;padding:2px 7px}
.vt-main{flex:1;display:flex;flex-wrap:wrap;gap:28px;padding:24px;max-width:1480px;width:100%;margin:0 auto;align-items:flex-start;grid-template-columns:none}
.vt-convo{flex:999 1 560px;min-width:0;display:flex;flex-direction:column;gap:18px}
.vt-side{flex:1 1 380px;max-width:460px;min-width:0;display:flex;flex-direction:column;gap:14px;position:sticky;top:16px}
.vt-side .vt-paper{max-width:none;width:100%}
.vt-orbcard{display:flex;align-items:center;gap:26px;padding:24px 28px;background:#fff;border-radius:24px;border:1px solid var(--vt-line)}
.vt-orb{position:relative;width:128px;height:128px;flex:0 0 128px;border-radius:50%;border:0;padding:0;cursor:pointer;background:var(--vt-red);color:#fff;display:grid;place-items:center;box-shadow:0 22px 44px -20px rgba(217,45,32,.75)}
.vt-orb.live{box-shadow:0 0 0 10px rgba(217,45,32,.12),0 22px 44px -18px rgba(217,45,32,.75)}
.vt-orb.ok{background:var(--vt-ok);box-shadow:0 22px 44px -20px rgba(15,122,67,.7)}
.vt-orb:disabled{cursor:default}
.vt-ringa{position:absolute;inset:0;border-radius:50%;border:2px solid var(--vt-red);animation:vtRingA 1.8s ease-out infinite;pointer-events:none}
.vt-ringa.two{animation-delay:.9s}
.vt-orb:not(.hearing) .vt-ringa{animation-duration:3.2s;opacity:.4}
@keyframes vtRingA{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.55);opacity:0}}
.vt-obars{display:flex;align-items:center;gap:5px;height:46px}.vt-obars i{display:block;width:5px;border-radius:3px;background:#fff;transition:height .08s}
.vt-orbtxt{display:flex;flex-direction:column;gap:5px;min-width:0}
.vt-eyebrow{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--vt-red);display:flex;align-items:center;gap:8px}
.vt-eyebrow.ok{color:var(--vt-ok)}.vt-eyebrow.err{color:#B42318}
.vt-otitle{font-size:28px;font-weight:600;line-height:1.15;letter-spacing:-.01em}
.vt-otext{font-size:16px;color:var(--vt-muted);line-height:1.45}.vt-otext.err{color:#B42318;font-weight:600}
.vt-live{font-size:16px;font-style:italic;margin-top:2px;color:var(--vt-ink)}
.vt-spin.sm{width:14px;height:14px;border-width:2px}
.vt-cap{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--vt-muted)}
.vt-examples{display:flex;flex-direction:column;gap:12px}
.vt-exgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.vt-ex{background:#fff;border:1px solid var(--vt-line);border-radius:18px;padding:16px 18px;font-size:17px;line-height:1.4;display:flex;flex-direction:column;gap:6px}
.vt-ex span{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--vt-deep)}
.vt-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;max-height:calc(100vh - 340px);overflow:auto}
.vt-turn{display:flex;gap:14px;align-items:flex-start;padding:13px 16px;border-radius:18px}
.vt-turn > div{display:flex;flex-direction:column;gap:3px;min-width:0}
.vt-tb2{flex:0 0 auto;min-width:28px;height:28px;padding:0 8px;border-radius:8px;display:grid;place-items:center;font:700 12px 'IBM Plex Sans',sans-serif}
.vt-who{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#78716C}
.vt-tt{font-size:17px;line-height:1.45}
.vt-turn.you .vt-tb2{background:#fff;border:1px solid var(--vt-line);color:#44403C}.vt-turn.you .vt-tt{color:#44403C}
.vt-turn.did{background:#fff;border:1px solid var(--vt-line)}.vt-turn.did .vt-tb2{background:var(--vt-ok);color:#fff}.vt-turn.did .vt-tt{font-weight:500}
.vt-turn.say{background:var(--vt-soft);border:1px solid var(--vt-red)}.vt-turn.say .vt-tb2{background:var(--vt-red);color:#fff;font-size:11px}.vt-turn.say .vt-tt{color:var(--vt-deep);font-weight:600}
.vt-logend{height:1px}
.vt-try{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--vt-muted)}
.vt-try i{font-style:normal;font-size:14px;background:#fff;border:1px solid var(--vt-line);border-radius:999px;padding:7px 13px;color:var(--vt-ink)}
.vt-conflict{margin:0;border-radius:18px}
.vt-sendwrap{display:flex;flex-direction:column;gap:8px}
.vt-est{text-align:right;font-size:14px;color:var(--vt-muted)}
.vt-side .vt-send{flex:none;width:100%;height:76px;border-radius:20px;background:var(--vt-red);font-size:20px;position:relative;overflow:hidden}
.vt-side .vt-send span{background:var(--vt-deep)}
.vt-side .vt-send:disabled{background:#E7E1DE;color:#8A8580}.vt-side .vt-send:disabled span{background:#D6CFCB}
.vt-side .vt-send.vt-undo{background:var(--vt-ok)}
.vt-undofill{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.18);animation:vtFill 3s linear forwards}
.vt-side .vt-send b{position:relative;font-weight:600}
@keyframes vtFill{from{width:100%}to{width:0%}}
.vt-hint{text-align:center;font-size:13px;color:var(--vt-muted)}
.vt-btn-dark{background:var(--vt-red)}
.vt-toast{background:var(--vt-deep)}
.vt-drawerbg{position:fixed;inset:0;background:rgba(28,25,23,.35);z-index:60;display:flex;justify-content:flex-end}
.vt-drawer{width:min(420px,100vw);height:100%;background:var(--vt-bg);padding:18px;display:flex;flex-direction:column;gap:12px;overflow:auto;box-shadow:-20px 0 40px -20px rgba(0,0,0,.4)}
.vt-drawer .vt-today-h{display:flex;align-items:center;gap:10px}.vt-drawer .vt-today-h b{font-size:20px;flex:1}
.vt-drawer ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.vt-drawer li{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--vt-line);border-radius:14px;padding:12px}
.vt-drawer li div{flex:1;display:flex;flex-direction:column;gap:2px}.vt-drawer li span{font-size:12px;color:var(--vt-muted)}
.vt-drawer li button,.vt-x2{width:44px;height:44px;border-radius:12px;border:1px solid var(--vt-line);background:#fff;display:grid;place-items:center;cursor:pointer;color:var(--vt-ink)}
@media (prefers-reduced-motion:reduce){.vt-ringa,.vt-undofill{animation:none}}
@media (max-width:900px){.vt-side{position:static;max-width:none}.vt-orbcard{gap:18px;padding:18px}.vt-orb{width:96px;height:96px;flex-basis:96px}.vt-otitle{font-size:22px}.vt-exgrid{grid-template-columns:minmax(0,1fr)}.vt-log{max-height:none}.vt-floor{justify-content:flex-start;order:3;flex-basis:100%}}
@media (max-width:767px){.vt-top{padding-left:64px}}
/* ── 2026-10-17 live stage: animated orb that follows both voices, live captions ── */
.vt-stage2{--you:0;--ai:0;position:relative;align-items:center;text-align:center;gap:14px;background:radial-gradient(120% 80% at 50% 0%,#FFF6F4 0%,var(--vt-bg) 70%);border:1px solid var(--vt-line);border-radius:28px;padding:22px 24px 26px}
.vt-engine{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 12px;border-radius:999px;background:#fff;border:1px solid var(--vt-line);font-size:13px;font-weight:600;color:var(--vt-deep)}
.vt-engdot{width:8px;height:8px;border-radius:50%;background:#CFC6C2}.vt-engdot.on{background:var(--vt-red);box-shadow:0 0 0 0 rgba(217,45,32,.6);animation:vtDot 1.4s infinite}
@keyframes vtDot{0%{box-shadow:0 0 0 0 rgba(217,45,32,.55)}100%{box-shadow:0 0 0 10px rgba(217,45,32,0)}}
.vt-orbzone{display:flex;flex-direction:column;align-items:center;gap:14px;padding:18px 0 4px}
.vt-orb3{position:relative;width:230px;height:230px;border:0;background:none;padding:0;cursor:pointer;display:grid;place-items:center;-webkit-tap-highlight-color:transparent}
.vt-orb3:disabled{cursor:default}
.vt-aura{position:absolute;inset:-26px;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,120,100,.0),rgba(255,120,100,.45),rgba(217,45,32,.25),rgba(255,180,160,.5),rgba(255,120,100,.0));filter:blur(26px);opacity:.35;animation:vtSpin 9s linear infinite;transform:scale(calc(.9 + var(--ai)*.35 + var(--you)*.2));transition:opacity .4s}
.vt-ring{position:absolute;inset:18px;border-radius:50%;border:2px solid rgba(217,45,32,.28);transform:scale(calc(1 + var(--you)*.22));transition:transform .08s linear,opacity .3s;opacity:0}
.vt-ring.r2{inset:4px;border-color:rgba(217,45,32,.18);transform:scale(calc(1 + var(--you)*.32))}
.vt-ring.r3{inset:-10px;border-color:rgba(217,45,32,.10);transform:scale(calc(1 + var(--you)*.44))}
.vt-core{position:relative;width:176px;height:176px;border-radius:50%;display:grid;place-items:center;color:#fff;
  background:radial-gradient(circle at 34% 28%,#FF9A8A 0%,#F0463A 38%,#D92D20 62%,#9F1F14 100%);
  box-shadow:inset 0 -14px 30px rgba(110,10,0,.35),inset 0 10px 24px rgba(255,255,255,.25),0 28px 60px -24px rgba(217,45,32,.9);
  transform:scale(calc(1 + var(--you)*.07 + var(--ai)*.09));transition:transform .08s linear}
.st-idle .vt-core{animation:vtBreathe 3.6s ease-in-out infinite}
@keyframes vtBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
.st-listening .vt-ring,.st-hearing .vt-ring,.st-speaking .vt-ring{opacity:1}
.st-listening .vt-aura{opacity:.5}.st-hearing .vt-aura{opacity:.75}.st-speaking .vt-aura{opacity:1;animation-duration:4s}
.st-thinking .vt-aura,.st-connecting .vt-aura{opacity:.6;animation-duration:2.4s}
.st-speaking .vt-core{background:radial-gradient(circle at 34% 28%,#FFB3A6 0%,#F25A4C 40%,#D92D20 66%,#8E1A10 100%)}
.st-done .vt-core{background:radial-gradient(circle at 34% 28%,#7FE0A8 0%,#1F9D5B 55%,#0F7A43 100%);box-shadow:0 28px 60px -24px rgba(15,122,67,.8)}
.vt-wave3{display:flex;align-items:center;gap:7px;height:70px}
.vt-wave3 i{display:block;width:8px;border-radius:5px;background:#fff;height:calc(12px + (var(--you) + var(--ai)) * var(--k) * 60px);transition:height .07s linear}
.st-listening .vt-wave3 i{animation:vtIdleBar 1.6s ease-in-out infinite;animation-delay:calc(var(--k) * -1s)}
@keyframes vtIdleBar{0%,100%{height:12px}50%{height:22px}}
.vt-dots{display:flex;gap:9px}.vt-dots i{width:12px;height:12px;border-radius:50%;background:#fff;animation:vtBounce 1s ease-in-out infinite}
.vt-dots i:nth-child(2){animation-delay:.15s}.vt-dots i:nth-child(3){animation-delay:.3s}
@keyframes vtBounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-9px);opacity:1}}
@keyframes vtSpin{to{rotate:360deg}}
.vt-statelbl{font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--vt-deep);min-height:20px}
.vt-captions{min-height:118px;max-width:640px;width:100%;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:flex-start}
.vt-captions p{margin:0;animation:vtCap .25s ease-out}
.vt-cap-you{font-size:26px;line-height:1.3;font-weight:500;color:var(--vt-ink);letter-spacing:-.01em}
.vt-cap-ai{font-size:22px;line-height:1.35;font-weight:600;color:var(--vt-red)}
.vt-cap-hint{font-size:17px;line-height:1.45;color:var(--vt-muted)}
.vt-cap-err{font-size:17px;font-weight:600;color:#B42318}
@keyframes vtCap{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.vt-ctrls{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}
.vt-mainbtn{height:56px;padding:0 26px;border-radius:999px;border:0;background:var(--vt-red);color:#fff;font:600 17px inherit;font-family:inherit;display:inline-flex;align-items:center;gap:10px;cursor:pointer;box-shadow:0 16px 30px -16px rgba(217,45,32,.9)}
.vt-mainbtn.stop{background:var(--vt-ink);box-shadow:0 16px 30px -18px rgba(0,0,0,.6)}
.vt-mainbtn:disabled{opacity:.55;cursor:default}
.vt-cbtn{height:56px;min-width:56px;padding:0 16px;border-radius:999px;border:1px solid var(--vt-line);background:#fff;color:var(--vt-ink);display:inline-flex;align-items:center;gap:8px;font:600 15px inherit;font-family:inherit;cursor:pointer}
.vt-cbtn.on{background:var(--vt-soft);border-color:var(--vt-red);color:var(--vt-deep)}
.vt-hist{list-style:none;margin:6px 0 0;padding:0;width:100%;max-width:640px;display:flex;flex-direction:column;gap:6px;text-align:left;max-height:220px;overflow:auto;mask-image:linear-gradient(to bottom,transparent 0,#000 30px)}
.vt-hist li{display:flex;gap:10px;font-size:15px;line-height:1.4;color:var(--vt-muted)}
.vt-hist li b{flex:0 0 34px;font-size:12px;font-weight:700;letter-spacing:.04em;color:#A8A29E;padding-top:2px}
.vt-hist li.say span{color:var(--vt-deep)}.vt-hist li.did span{color:var(--vt-ok)}
.vt-stage2 .vt-conflict{width:100%;text-align:left}
@media (max-width:900px){.vt-orb3{width:180px;height:180px}.vt-core{width:140px;height:140px}.vt-cap-you{font-size:21px}.vt-cap-ai{font-size:18px}.vt-captions{min-height:90px}}
@media (prefers-reduced-motion:reduce){.vt-aura,.vt-core,.vt-dots i,.vt-wave3 i,.vt-engdot{animation:none!important}}

`;
