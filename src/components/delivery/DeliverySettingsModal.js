'use client';
import { useEffect, useState } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

/**
 * Delivery settings (owner / admin): automatic assignment to free delivery boys.
 * Backend: PUT /api/delivery/:restaurantId/settings — turning auto-assign on also turns the delivery
 * flow on. Delivery boys are staff with "Delivery partner" ticked (Admin → Staff).
 */
export default function DeliverySettingsModal({ isOpen, onClose, restaurantId, apiClient, initial, onSaved }) {
  const [f, setF] = useState({ autoAssign: false, requireAccept: false, acceptTimeoutMin: 2, maxPerRider: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setF({
        autoAssign: !!initial?.autoAssign, requireAccept: !!initial?.requireAccept,
        acceptTimeoutMin: Number(initial?.acceptTimeoutMin) || 2, maxPerRider: Number(initial?.maxPerRider) || 1,
      });
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;
  const save = async () => {
    setSaving(true); setError('');
    try {
      const res = await apiClient.saveDeliveryAssignSettings(restaurantId, f);
      if (res && res.success === false) throw new Error(res.error || 'Could not save');
      onSaved && onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };
  const row = 'flex items-start gap-3 p-3 rounded-xl border border-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Delivery boys — settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close"><FiX size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-3">
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
            <select value={f.maxPerRider} onChange={(e) => setF({ ...f, maxPerRider: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500">Delivery boys: Admin → Staff → edit → tick &quot;Delivery partner&quot;. They use the DineOpen app (Deliveries tab) and can switch On duty / Off duty.</p>
          {error && <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <FiLoader className="animate-spin" size={14} />} Save
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
