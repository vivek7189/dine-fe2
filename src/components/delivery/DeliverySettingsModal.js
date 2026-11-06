'use client';
import { useCallback, useEffect, useState } from 'react';
import { FiX, FiLoader, FiTrash2 } from 'react-icons/fi';

/**
 * Delivery settings (owner / admin): automatic assignment, how delivery boys get their orders
 * (DineOpen app / WhatsApp / both, per boy too), the WhatsApp workflow switches and the delivery boys
 * themselves (quick-add with name + WhatsApp number — no login needed for WhatsApp-only boys).
 * Backend: /api/delivery/:restaurantId/{settings,riders,whatsapp,whatsapp/templates}.
 */
const CHANNELS = [['app', 'DineOpen app'], ['whatsapp', 'WhatsApp'], ['both', 'Both']];
const WA_SWITCHES = [
  ['askPayment', 'Ask "Cash / UPI / Not collected" when he taps Delivered on an unpaid order'],
  ['customerPhone', "Show the customer's phone number in the message"],
  ['items', 'Show the items in the message'],
  ['dutyCommands', 'He can send ON / OFF (duty) and ORDERS (send my orders again)'],
  ['tellOnRemove', 'Message him when an order is taken off him or cancelled'],
];
const TPL_LABEL = { APPROVED: 'Approved ✓', PENDING: 'Waiting for Meta approval', IN_APPEAL: 'Waiting for Meta approval', REJECTED: 'Rejected by Meta', MISSING: 'Not submitted', PAUSED: 'Paused by Meta', DISABLED: 'Disabled by Meta' };

export default function DeliverySettingsModal({ isOpen, onClose, restaurantId, apiClient, initial, onSaved }) {
  const [f, setF] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [riders, setRiders] = useState([]);
  const [wa, setWa] = useState(null);
  const [nr, setNr] = useState({ name: '', phone: '', channel: '' });
  const [busy, setBusy] = useState('');

  const loadRiders = useCallback(async () => {
    try { const r = await apiClient.getDeliveryRiders(restaurantId); if (r?.success) setRiders(r.data || []); } catch (_) { /* list only */ }
  }, [apiClient, restaurantId]);
  const loadWa = useCallback(async () => {
    try { const r = await apiClient.getDeliveryWhatsApp(restaurantId); if (r?.success) setWa(r.data); } catch (_) { setWa(null); }
  }, [apiClient, restaurantId]);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setF({
      autoAssign: !!initial?.autoAssign, requireAccept: !!initial?.requireAccept,
      acceptTimeoutMin: Number(initial?.acceptTimeoutMin) || 2, maxPerRider: Number(initial?.maxPerRider) || 1,
      channel: initial?.channel || 'app',
      whatsapp: { askPayment: true, customerPhone: true, items: true, dutyCommands: true, tellOnRemove: true, ...(initial?.whatsapp || {}) },
    });
    loadRiders(); loadWa();
  }, [isOpen, initial, loadRiders, loadWa]);

  if (!isOpen || !f) return null;
  const usesWa = f.channel !== 'app' || riders.some(r => r.channel === 'whatsapp' || r.channel === 'both');

  const run = async (key, fn) => {
    setBusy(key); setError('');
    try {
      const res = await fn();
      if (res && res.success === false) throw new Error(res.error || 'Something went wrong');
      return res;
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      return null;
    } finally { setBusy(''); }
  };
  const save = async () => {
    setSaving(true); setError('');
    try {
      const res = await apiClient.saveDeliveryAssignSettings(restaurantId, f);
      if (res && res.success === false) throw new Error(res.error || 'Could not save');
      if (res?.whatsapp) setWa(res.whatsapp);
      onSaved && onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };
  const addRider = async () => {
    const res = await run('add', () => apiClient.addDeliveryRider(restaurantId, { name: nr.name.trim(), phone: nr.phone.trim(), channel: nr.channel || null }));
    if (res) { setNr({ name: '', phone: '', channel: '' }); loadRiders(); }
  };
  const patchRider = async (id, patch) => { if (await run(id, () => apiClient.updateDeliveryRider(restaurantId, id, patch))) loadRiders(); };
  const submitTemplates = async () => { const res = await run('tpl', () => apiClient.submitDeliveryTemplates(restaurantId)); if (res?.data) setWa(res.data); };

  const row = 'flex items-start gap-3 p-3 rounded-xl border border-gray-200';
  const h = 'text-sm font-bold text-gray-900 mt-2';
  const input = 'border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Delivery boys — settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close"><FiX size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          <label className={row}>
            <input type="checkbox" className="mt-1" checked={f.autoAssign} onChange={(e) => setF({ ...f, autoAssign: e.target.checked })} />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Auto-assign delivery orders</span>
              <span className="block text-xs text-gray-500">Each new delivery order goes to a free delivery boy (the one with the fewest orders in hand). If nobody is free it waits and goes out as soon as someone is free.</span>
            </span>
          </label>
          <label className={row}>
            <input type="checkbox" className="mt-1" checked={f.requireAccept} onChange={(e) => setF({ ...f, requireAccept: e.target.checked })} />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-gray-900">Delivery boy must accept</span>
              <span className="block text-xs text-gray-500">Off = the order is simply his. On = he taps Accept; if he rejects or doesn&apos;t answer, it goes to the next free boy.</span>
              {f.requireAccept && (
                <span className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                  Accept within
                  <input type="number" min={1} max={30} value={f.acceptTimeoutMin} onChange={(e) => setF({ ...f, acceptTimeoutMin: e.target.value })} className="w-16 border border-gray-300 rounded-lg px-2 py-1" />
                  minutes
                </span>
              )}
            </span>
          </label>
          <div className={row}>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-gray-900">Orders per delivery boy at a time</span>
              <span className="block text-xs text-gray-500">Auto-assign never gives a boy more than this. You can still add more by hand.</span>
            </span>
            <select value={f.maxPerRider} onChange={(e) => setF({ ...f, maxPerRider: Number(e.target.value) })} className={input}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className={h}>How delivery boys get their orders</div>
          <div className="flex gap-2">
            {CHANNELS.map(([k, t]) => (
              <button key={k} type="button" onClick={() => setF({ ...f, channel: k })}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold ${f.channel === k ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>{t}</button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {f.channel === 'app' ? 'They use the Deliveries tab in the DineOpen app (with live location).' : f.channel === 'whatsapp' ? 'They get each order on WhatsApp (customer, phone, address, map, amount) with Picked up / Delivered buttons — no app needed.' : 'App notification and WhatsApp message.'}
            {' '}Each boy can also have his own choice below.
          </p>

          {usesWa && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
              <div className="text-sm font-semibold text-gray-900">WhatsApp</div>
              {!wa ? <div className="text-xs text-gray-500">Checking…</div> : !wa.connected ? (
                <div className="text-xs text-red-700">WhatsApp is not connected — connect it in Admin → WhatsApp first.</div>
              ) : (
                <div className="text-xs text-gray-700 space-y-1">
                  <div>Order message template: <b>{TPL_LABEL[wa.templates?.assigned] || wa.templates?.assigned}</b>{f.requireAccept ? <> · Accept template: <b>{TPL_LABEL[wa.templates?.offer] || wa.templates?.offer}</b></> : null}</div>
                  {wa.shared && <div className="text-gray-500">Sent from DineOpen&apos;s WhatsApp number (your own number shows your shop name).</div>}
                  {!wa.shared && (wa.templates?.assigned === 'MISSING' || (f.requireAccept && wa.templates?.offer === 'MISSING')) && (
                    <button type="button" onClick={submitTemplates} disabled={!!busy} className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-60">
                      {busy === 'tpl' ? 'Submitting…' : 'Submit templates to Meta'}
                    </button>
                  )}
                  {wa.templates?.assigned !== 'APPROVED' && <div className="text-amber-700">Until Meta approves it, WhatsApp-only boys get the order as an app notification and the order shows a warning.</div>}
                </div>
              )}
              {WA_SWITCHES.map(([k, t]) => (
                <label key={k} className="flex items-start gap-2 text-xs text-gray-700">
                  <input type="checkbox" className="mt-0.5" checked={!!f.whatsapp[k]} onChange={(e) => setF({ ...f, whatsapp: { ...f.whatsapp, [k]: e.target.checked } })} />
                  {t}
                </label>
              ))}
            </div>
          )}

          <div className={h}>Delivery boys ({riders.length})</div>
          {riders.length === 0 && <p className="text-xs text-gray-500">No delivery boys yet — add one below (or tick &quot;Delivery partner&quot; on a staff member in Admin → Staff).</p>}
          <div className="space-y-2">
            {riders.map(r => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-gray-200">
                <div className="flex-1 min-w-[120px]">
                  <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.phone || 'no phone'}{r.hasLogin ? ' · has app login' : ' · WhatsApp only'}</div>
                </div>
                <select value={r.channel || ''} onChange={(e) => patchRider(r.id, { channel: e.target.value || null })} className={input} disabled={!!busy}>
                  <option value="">Default ({CHANNELS.find(c => c[0] === f.channel)?.[1]})</option>
                  {CHANNELS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                </select>
                <label className="flex items-center gap-1 text-xs text-gray-700">
                  <input type="checkbox" checked={r.onDuty} onChange={(e) => patchRider(r.id, { onDuty: e.target.checked })} disabled={!!busy} /> On duty
                </label>
                <button type="button" title="Remove as delivery boy" onClick={() => { if (window.confirm(`Remove ${r.name} as a delivery boy? (His staff record stays.)`)) patchRider(r.id, { remove: true }); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" disabled={!!busy}><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center p-2 rounded-xl border border-dashed border-gray-300">
            <input className={`${input} flex-1 min-w-[110px]`} placeholder="Name" value={nr.name} onChange={(e) => setNr({ ...nr, name: e.target.value })} maxLength={80} />
            <input className={`${input} flex-1 min-w-[130px]`} placeholder="WhatsApp number" value={nr.phone} onChange={(e) => setNr({ ...nr, phone: e.target.value })} maxLength={20} />
            <select value={nr.channel} onChange={(e) => setNr({ ...nr, channel: e.target.value })} className={input}>
              <option value="">Default</option>
              {CHANNELS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
            <button type="button" onClick={addRider} disabled={!!busy || !nr.name.trim() || !nr.phone.trim()} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50">
              {busy === 'add' ? 'Adding…' : 'Add'}
            </button>
          </div>

          {error && <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <FiLoader className="animate-spin" size={14} />} Save settings
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
