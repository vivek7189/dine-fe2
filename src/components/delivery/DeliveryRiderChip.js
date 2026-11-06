'use client';
import { useEffect, useState } from 'react';
import { MdDeliveryDining } from 'react-icons/md';
import DeliveryAssignModal from './DeliveryAssignModal';

/**
 * Delivery boy on an order card (Order History): who has it and where it is, and — for owner / admin /
 * manager / cashier, while the order is open — Assign / Change rider (the new boy gets it on his
 * channel, the old one is told it is no longer his). Renders nothing for orders that never had a boy
 * and can't get one.
 */
const MANAGE = ['owner', 'co-owner', 'admin', 'manager', 'cashier'];
const LABEL = {
  queued: 'Waiting for a rider', assigned: 'Waiting to accept', accepted: 'With', picked_up: 'On the way —',
  on_the_way: 'On the way —', delivered: 'Delivered by', cancelled: 'Delivery cancelled', rejected: 'Rider rejected',
};
const COLOR = {
  queued: ['#fffbeb', '#b45309', '#fde68a'], assigned: ['#fef3c7', '#92400e', '#fde68a'], accepted: ['#eff6ff', '#1d4ed8', '#bfdbfe'],
  picked_up: ['#f5f3ff', '#6d28d9', '#ddd6fe'], on_the_way: ['#f5f3ff', '#6d28d9', '#ddd6fe'], delivered: ['#ecfdf5', '#047857', '#a7f3d0'],
  cancelled: ['#f3f4f6', '#6b7280', '#e5e7eb'], rejected: ['#fef2f2', '#b91c1c', '#fecaca'],
};
const OPEN = ['pending', 'confirmed', 'preparing', 'ready', 'served'];

export default function DeliveryRiderChip({ order, restaurantId, apiClient, onChanged, compact = false }) {
  const [open, setOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  useEffect(() => {
    try { setCanManage(MANAGE.includes(String(JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase())); } catch (_) { setCanManage(false); }
  }, []);
  if (!order || String(order.orderType || '').toLowerCase() !== 'delivery') return null;
  const st = order.deliveryStatus || null;
  const name = order.assignedStaff?.name || '';
  const isOpen = OPEN.includes(String(order.status || '').toLowerCase());
  if (!st && !(isOpen && canManage)) return null;
  const [bg, fg, bd] = COLOR[st] || ['#f8fafc', '#475569', '#e2e8f0'];
  const label = !st ? 'No rider yet' : `${LABEL[st] || st}${['accepted', 'picked_up', 'on_the_way', 'delivered'].includes(st) && name ? ` ${name}` : ''}`;
  const failed = order.deliveryNotify?.whatsapp === 'failed' && order.deliveryNotify?.riderId === order.assignedStaff?.id && ['assigned', 'accepted', 'picked_up'].includes(st);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: bg, color: fg, border: `1px solid ${bd}` }} title={order.deliveryCashCollected ? `Collected ${order.deliveryCashCollected.method}` : undefined}>
        <MdDeliveryDining size={12} /> {label}
      </span>
      {failed && <span className="text-[11px] font-semibold text-red-700" title={order.deliveryNotify.error || ''}>⚠ WhatsApp not sent</span>}
      {canManage && isOpen && (
        <button type="button" onClick={() => setOpen(true)} className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold text-blue-700 underline`}>
          {order.assignedStaff && ['assigned', 'accepted', 'picked_up', 'on_the_way'].includes(st) ? 'Change rider' : 'Assign rider'}
        </button>
      )}
      {open && (
        <DeliveryAssignModal
          isOpen={open}
          onClose={() => setOpen(false)}
          orderId={order.id}
          orderNumber={order.dailyOrderId || order.orderNumber || String(order.id).slice(-6)}
          restaurantId={restaurantId || order.restaurantId}
          apiClient={apiClient}
          currentStaff={order.assignedStaff}
          deliveryStatus={st}
          onAssigned={() => onChanged && onChanged()}
        />
      )}
    </span>
  );
}
