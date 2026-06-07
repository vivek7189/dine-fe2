'use client';
import { useState, useEffect } from 'react';
import { FiRefreshCw, FiMapPin, FiClock, FiPhone } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import DeliveryStatusTimeline from './DeliveryStatusTimeline';

/**
 * Panel showing all active deliveries for a restaurant.
 * Can expand each to show tracking map or status timeline.
 */
export default function ActiveDeliveriesPanel({ restaurantId, apiClient, realtimeEnabled, restaurantLocation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchDeliveries = async () => {
    try {
      const res = await apiClient.getActiveDeliveries(restaurantId);
      if (res?.success) {
        setDeliveries(res.data || []);
      }
    } catch (err) {
      console.error('Fetch active deliveries error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchDeliveries();
      const interval = setInterval(fetchDeliveries, 300000); // 5-minute fallback (delivery status updates come via RTDB events)
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const getElapsedTime = (timestamp) => {
    if (!timestamp) return '';
    const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const statusColors = {
    assigned: 'bg-amber-100 text-amber-700',
    accepted: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-purple-100 text-purple-700',
    on_the_way: 'bg-indigo-100 text-indigo-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FiRefreshCw className="animate-spin text-gray-400" size={20} />
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MdDeliveryDining size={40} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No active deliveries</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MdDeliveryDining size={18} className="text-emerald-600" />
          Active Deliveries ({deliveries.length})
        </h3>
        <button
          onClick={fetchDeliveries}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiRefreshCw size={14} className="text-gray-500" />
        </button>
      </div>

      {deliveries.map((delivery) => {
        const isExpanded = expandedId === delivery.id;
        const addressText = typeof delivery.deliveryAddress === 'string'
          ? delivery.deliveryAddress
          : delivery.deliveryAddress?.street || 'No address';

        return (
          <div key={delivery.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : delivery.id)}
              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                {delivery.assignedStaff?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">
                    #{delivery.orderNumber}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                    statusColors[delivery.deliveryStatus] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {delivery.deliveryStatus?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {delivery.assignedStaff?.name} • {addressText}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ₹{Number(delivery.totalAmount || 0).toFixed(0)}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                  <FiClock size={10} />
                  {getElapsedTime(delivery.deliveryAssignedAt)}
                </p>
              </div>
            </button>

            {/* Expanded: Tracking Map or Timeline */}
            {isExpanded && (
              <div className="p-3 border-t border-gray-50">
                <DeliveryTrackingMap
                  restaurantId={restaurantId}
                  orderId={delivery.id}
                  delivery={delivery}
                  realtimeEnabled={realtimeEnabled}
                  restaurantLocation={restaurantLocation}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
