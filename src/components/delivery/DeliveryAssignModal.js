'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiX, FiUser, FiLoader, FiCheckCircle, FiSlash } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

/**
 * Give a delivery order to a delivery boy (or change / remove him, or mark it delivered for him).
 * Boys are shown as Free / On delivery (n) / Off duty. A busy boy can still be picked by hand —
 * the counter decides; automatic assignment never goes over the restaurant's limit.
 * Backend: /api/delivery/:restaurantId/{partners,assign,unassign,mark-delivered}.
 */
export default function DeliveryAssignModal({ isOpen, onClose, orderId, orderNumber, restaurantId, apiClient, onAssigned, currentStaff, deliveryStatus }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // staff id | 'unassign' | 'delivered'
  const [error, setError] = useState('');
  const [collected, setCollected] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getDeliveryPartners(restaurantId);
      if (res?.success) setPartners(res.data || []);
    } catch (err) {
      setError(err?.message || 'Could not load delivery boys');
    } finally {
      setLoading(false);
    }
  }, [apiClient, restaurantId]);

  useEffect(() => {
    if (isOpen && restaurantId) { setError(''); setCollected(false); fetchPartners(); }
  }, [isOpen, restaurantId, fetchPartners]);

  const run = async (key, fn) => {
    setBusy(key); setError('');
    try {
      const res = await fn();
      if (res && res.success === false) throw new Error(res.error || 'Something went wrong');
      onAssigned && onAssigned(res?.data);
      onClose();
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (!isOpen) return null;
  const hasRider = !!(currentStaff && currentStaff.id) && ['assigned', 'accepted', 'picked_up', 'on_the_way'].includes(deliveryStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <MdDeliveryDining className="text-emerald-600" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{hasRider ? 'Change Rider' : 'Assign Rider'}</h3>
              <p className="text-sm text-gray-500">Order #{orderNumber}{hasRider ? ` · now with ${currentStaff.name}` : deliveryStatus === 'queued' ? ' · waiting for a free rider' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {hasRider && (
          <div className="px-4 pt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={collected} onChange={(e) => setCollected(e.target.checked)} />
              Rider collected the payment (cash)
            </label>
            <div className="flex gap-2">
              <button disabled={!!busy} onClick={() => run('delivered', () => apiClient.markDeliveredByCounter(restaurantId, orderId, { paymentCollected: collected, paymentMethod: 'cash' }))}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">
                {busy === 'delivered' ? <FiLoader className="animate-spin" size={14} /> : <FiCheckCircle size={14} />} Mark delivered
              </button>
              <button disabled={!!busy} onClick={() => run('unassign', () => apiClient.unassignDelivery(restaurantId, orderId))}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-60">
                {busy === 'unassign' ? <FiLoader className="animate-spin" size={14} /> : <FiSlash size={14} />} Unassign
              </button>
            </div>
            <p className="text-xs text-gray-400">Or pick another rider below to change.</p>
          </div>
        )}

        {error && <div role="alert" className="mx-4 mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-gray-400" size={24} />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto text-gray-300" size={40} />
              <p className="mt-3 text-gray-500 text-sm">No delivery boys yet</p>
              <p className="text-gray-400 text-xs mt-1">Admin → Staff → edit a staff member → tick &quot;Delivery partner&quot;</p>
            </div>
          ) : (
            <div className="space-y-2">
              {partners.map((p) => {
                const isCurrent = hasRider && currentStaff.id === p.id;
                const label = p.status === 'off_duty' ? 'Off duty' : p.status === 'available' ? 'Free' : `On delivery${p.active ? ` (${p.active})` : ''}`;
                const cls = p.status === 'off_duty' ? 'bg-gray-100 text-gray-500' : p.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
                return (
                  <button
                    key={p.id}
                    onClick={() => !isCurrent && run(p.id, () => apiClient.assignDeliveryPartner(restaurantId, orderId, p.id, p.name))}
                    disabled={!!busy || isCurrent}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${isCurrent ? 'border-emerald-300 bg-emerald-50 cursor-default' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer'} ${p.status !== 'available' && !isCurrent ? 'opacity-80' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${p.status === 'available' ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                      {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">{p.name}{isCurrent ? ' (current)' : ''}</p>
                      <p className="text-xs text-gray-500">{p.phone || ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                      {busy === p.id && <FiLoader className="animate-spin text-emerald-500" size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
