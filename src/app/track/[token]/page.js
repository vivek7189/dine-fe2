'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiPackage, FiCheck, FiTruck, FiMapPin, FiPhone } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

/**
 * Public customer-facing delivery tracking page.
 * No auth required — uses tracking token from URL.
 */
export default function DeliveryTrackingPage() {
  const params = useParams();
  const token = params.token;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracking = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app';
      const res = await fetch(`${apiBase}/api/delivery/track/${token}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Tracking link not found');
      }
    } catch (err) {
      setError('Unable to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTracking();
      // Poll for updates every 15 seconds
      const interval = setInterval(fetchTracking, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FiPackage className="mx-auto text-gray-300" size={48} />
          <p className="mt-4 text-gray-600 font-medium">{error}</p>
          <p className="mt-1 text-sm text-gray-400">This link may have expired</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'assigned', label: 'Order Assigned', sublabel: 'Rider assigned to your order', icon: FiPackage },
    { key: 'accepted', label: 'Rider Accepted', sublabel: 'Heading to restaurant', icon: FiCheck },
    { key: 'picked_up', label: 'Picked Up', sublabel: 'On the way to you', icon: MdDeliveryDining },
    { key: 'delivered', label: 'Delivered', sublabel: 'Order delivered!', icon: FiMapPin },
  ];

  const statusOrder = ['assigned', 'accepted', 'picked_up', 'on_the_way', 'delivered'];
  const currentIdx = statusOrder.indexOf(data.deliveryStatus);

  const isCompleted = data.deliveryStatus === 'delivered';

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <MdDeliveryDining className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Order #{data.orderNumber}</h1>
              <p className="text-sm text-gray-500">
                {isCompleted ? 'Delivered' : 'Tracking your delivery'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {!isCompleted && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">
                  {data.deliveryStatus === 'picked_up' ? 'On the way!' : 'Preparing your order'}
                </span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const stepIdx = statusOrder.indexOf(step.key);
              const isActive = stepIdx <= currentIdx;
              const isCurrent = stepIdx === currentIdx;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive
                        ? isCurrent
                          ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-200'
                          : 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-gray-200'
                    }`}>
                      <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-10 my-1 ${isActive ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pt-2">
                    <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-gray-500' : 'text-gray-300'}`}>
                      {step.sublabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Info */}
        {data.driverName && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">{data.driverName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{data.driverName}</p>
                <p className="text-xs text-gray-500">Your delivery partner</p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {data.deliveryAddress && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <FiMapPin className="text-red-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-900">Delivering to</p>
                <p className="text-sm text-gray-600 mt-1">
                  {typeof data.deliveryAddress === 'string'
                    ? data.deliveryAddress
                    : [data.deliveryAddress.street, data.deliveryAddress.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by DineOpen
        </p>
      </div>
    </div>
  );
}
