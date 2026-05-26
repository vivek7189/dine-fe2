'use client';
import { useState, useEffect } from 'react';
import { FiX, FiUser, FiCheck, FiLoader } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

/**
 * Modal to assign a delivery partner to an order.
 * Shows list of available delivery staff with their current status.
 */
export default function DeliveryAssignModal({ isOpen, onClose, orderId, orderNumber, restaurantId, apiClient, onAssigned }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    if (isOpen && restaurantId) {
      fetchPartners();
    }
  }, [isOpen, restaurantId]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getDeliveryPartners(restaurantId);
      if (res?.success) {
        setPartners(res.data || []);
      }
    } catch (err) {
      console.error('Fetch partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (partner) => {
    setAssigning(partner.id);
    try {
      const res = await apiClient.assignDeliveryPartner(restaurantId, orderId, partner.id, partner.name);
      if (res?.success) {
        onAssigned && onAssigned(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setAssigning(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <MdDeliveryDining className="text-emerald-600" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign Rider</h3>
              <p className="text-sm text-gray-500">Order #{orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Partner List */}
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-gray-400" size={24} />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto text-gray-300" size={40} />
              <p className="mt-3 text-gray-500 text-sm">No delivery partners found</p>
              <p className="text-gray-400 text-xs mt-1">Mark staff as delivery partner in admin settings</p>
            </div>
          ) : (
            <div className="space-y-2">
              {partners.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => handleAssign(partner)}
                  disabled={assigning === partner.id || partner.status === 'busy'}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    partner.status === 'busy'
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    partner.status === 'available' ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}>
                    {partner.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 text-sm">{partner.name}</p>
                    <p className="text-xs text-gray-500">{partner.phone || partner.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      partner.status === 'available'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {partner.status === 'available' ? 'Free' : 'On Delivery'}
                    </span>
                    {assigning === partner.id && (
                      <FiLoader className="animate-spin text-emerald-500" size={16} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
