'use client';
import { FiCheck, FiPackage, FiTruck, FiMapPin } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

/**
 * Timeline/stepper showing delivery progress.
 */
export default function DeliveryStatusTimeline({ deliveryStatus, driverName, timestamps = {} }) {
  const steps = [
    { key: 'assigned', label: 'Assigned', icon: FiPackage, time: timestamps.deliveryAssignedAt },
    { key: 'accepted', label: 'Accepted', icon: FiCheck, time: timestamps.deliveryAcceptedAt },
    { key: 'picked_up', label: 'Picked Up', icon: MdDeliveryDining, time: timestamps.deliveryPickedUpAt },
    { key: 'delivered', label: 'Delivered', icon: FiMapPin, time: timestamps.deliveryCompletedAt },
  ];

  const statusOrder = ['assigned', 'accepted', 'picked_up', 'on_the_way', 'delivered'];
  const currentIdx = statusOrder.indexOf(deliveryStatus);

  const getStepStatus = (stepKey) => {
    const stepIdx = statusOrder.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      {driverName && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-semibold text-sm">{driverName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{driverName}</p>
            <p className="text-xs text-gray-500">Delivery Partner</p>
          </div>
        </div>
      )}

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-start gap-3">
              {/* Line + Dot */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                  status === 'current' ? 'bg-blue-500 border-blue-500' :
                  'bg-white border-gray-200'
                }`}>
                  <Icon size={14} className={
                    status === 'completed' || status === 'current' ? 'text-white' : 'text-gray-400'
                  } />
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-0.5 h-8 ${
                    status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Label */}
              <div className="pt-1">
                <p className={`text-sm font-medium ${
                  status === 'completed' ? 'text-gray-900' :
                  status === 'current' ? 'text-blue-600' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.time && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(step.time)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
