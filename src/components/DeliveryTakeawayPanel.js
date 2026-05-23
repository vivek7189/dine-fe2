'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaClock, FaPhoneAlt, FaUser, FaEye, FaSpinner,
  FaChevronRight, FaTruck, FaShoppingBag, FaConciergeBell,
  FaReceipt, FaCheckCircle
} from 'react-icons/fa';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../firebase';

// Status config — colors match the tables page pattern
const statusConfig = {
  pending:   { color: '#6b7280', bg: '#f9fafb', text: '#374151', border: '#e5e7eb' },
  confirmed: { color: '#3b82f6', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  preparing: { color: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
  ready:     { color: '#10b981', bg: '#f0fdf4', text: '#166534', border: '#6ee7b7' },
  served:    { color: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9', border: '#c4b5fd' },
};

const typeBadge = {
  delivery:  { color: '#dc2626', bg: '#fef2f2', label: 'Delivery',  icon: FaTruck },
  takeaway:  { color: '#7c3aed', bg: '#f5f3ff', label: 'Takeaway',  icon: FaShoppingBag },
};

function getStatusLabel(status, orderType) {
  if (status === 'served' && orderType === 'delivery') return 'Out for Delivery';
  if (status === 'served' && orderType === 'takeaway') return 'Picked Up';
  if (status === 'ready') return 'Ready for Pickup';
  const labels = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing' };
  return labels[status] || status;
}

function getNextStatus(status) {
  const flow = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'served', served: 'completed' };
  return flow[status] || null;
}

function getNextStatusLabel(status, orderType) {
  if (status === 'pending') return 'Confirm';
  if (status === 'confirmed') return 'Start Preparing';
  if (status === 'preparing') return 'Mark Ready';
  if (status === 'ready' && orderType === 'delivery') return 'Out for Delivery';
  if (status === 'ready' && orderType === 'takeaway') return 'Picked Up';
  if (status === 'served') return 'Complete';
  return null;
}

function getNextStatusColor(status) {
  if (status === 'pending') return '#3b82f6';
  if (status === 'confirmed') return '#f59e0b';
  if (status === 'preparing') return '#10b981';
  if (status === 'ready') return '#8b5cf6';
  if (status === 'served') return '#059669';
  return '#6b7280';
}

function getElapsed(order) {
  const created = order.createdAt;
  if (!created) return null;
  const d = created._seconds ? new Date(created._seconds * 1000)
    : created.toDate ? created.toDate()
    : new Date(created);
  if (isNaN(d.getTime())) return null;
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function getElapsedMinutes(order) {
  const created = order.createdAt;
  if (!created) return 0;
  const d = created._seconds ? new Date(created._seconds * 1000)
    : created.toDate ? created.toDate()
    : new Date(created);
  if (isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 60000);
}

export default function DeliveryTakeawayPanel({ restaurantId, isMobile, refreshSignal, formatCurrency }) {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [, setTick] = useState(0);
  const refreshTimerRef = useRef(null);
  const fc = formatCurrency || (v => '₹' + (v || 0).toLocaleString('en-IN'));

  // Fetch active delivery/takeaway orders
  const fetchOrders = useCallback(async (showLoader) => {
    if (!restaurantId) return;
    if (showLoader) setLoading(true);
    try {
      const resp = await apiClient.getOrders(restaurantId, { todayOnly: 'true', limit: 200 });
      const allOrders = resp.orders || [];
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served'];
      const filtered = allOrders.filter(o =>
        (o.orderType === 'delivery' || o.orderType === 'takeaway') &&
        activeStatuses.includes(o.status)
      );
      filtered.sort((a, b) => {
        const aT = a.createdAt?._seconds || (new Date(a.createdAt).getTime() / 1000) || 0;
        const bT = b.createdAt?._seconds || (new Date(b.createdAt).getTime() / 1000) || 0;
        return bT - aT;
      });
      setOrders(filtered);
    } catch (err) {
      console.error('DeliveryTakeawayPanel: fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Initial load
  useEffect(() => { fetchOrders(true); }, [restaurantId]);

  // Firebase RTDB subscription for real-time order updates (replaces Pusher)
  const fetchOrdersRef = useRef(fetchOrders);
  useEffect(() => { fetchOrdersRef.current = fetchOrders; });
  useEffect(() => {
    if (!restaurantId || !database) return;
    let debounceTimer = null;

    const now = Date.now();
    const ordersRef = query(ref(database, `events/${restaurantId}/orders`), orderByChild('ts'), startAt(now));

    console.log(`🚚 DeliveryTakeawayPanel: Subscribed to Firebase RTDB events/${restaurantId}/orders`);

    const handleEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const orderEvents = ['order-created', 'order-updated', 'order-status-updated', 'order-completed', 'order-deleted'];
      if (orderEvents.includes(data.type)) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fetchOrdersRef.current?.(false), 1200);
      }
    };
    onChildAdded(ordersRef, handleEvent);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      console.log(`🚚 DeliveryTakeawayPanel: Unsubscribing from Firebase RTDB`);
      off(ordersRef, 'child_added', handleEvent);
    };
  }, [restaurantId]);

  // Also respond to parent's refresh signal (for events the parent catches)
  useEffect(() => {
    if (refreshSignal === 0) return;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => fetchOrders(false), 1500);
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [refreshSignal, fetchOrders]);

  // Auto-refresh every 30s as fallback
  useEffect(() => {
    const iv = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  // Elapsed time ticker
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  // Advance order status
  const handleAdvanceStatus = async (order) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    setUpdatingId(order.id);
    // Optimistic update
    if (next === 'completed') {
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } else {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
    }
    try {
      await apiClient.updateOrderStatus(order.id, next, restaurantId);
    } catch (err) {
      console.error('Status update failed:', err);
      fetchOrders(false); // revert
    } finally {
      setUpdatingId(null);
    }
  };

  // View order in dashboard
  const handleViewOrder = (order) => {
    router.push(`/dashboard?orderId=${order.id}&mode=edit`);
  };

  // Filtered orders
  const filteredOrders = filterType === 'all' ? orders : orders.filter(o => o.orderType === filterType);

  // Stats
  const deliveryCount = orders.filter(o => o.orderType === 'delivery').length;
  const takeawayCount = orders.filter(o => o.orderType === 'takeaway').length;
  const stats = {
    total: filteredOrders.length,
    preparing: filteredOrders.filter(o => o.status === 'preparing' || o.status === 'confirmed' || o.status === 'pending').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    outOrPickedUp: filteredOrders.filter(o => o.status === 'served').length,
  };

  // Shimmer loading
  if (loading) {
    return (
      <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: '120px', height: '52px', borderRadius: '12px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'tblShimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: '200px', borderRadius: '12px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'tblShimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto' }}>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Total', count: stats.total, bg: '#f8fafc', dot: '#64748b', border: '#e2e8f0' },
          { label: 'Preparing', count: stats.preparing, bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a' },
          { label: 'Ready', count: stats.ready, bg: '#f0fdf4', dot: '#10b981', border: '#bbf7d0' },
          ...(stats.outOrPickedUp > 0 ? [{ label: 'Out / Picked Up', count: stats.outOrPickedUp, bg: '#f5f3ff', dot: '#8b5cf6', border: '#ddd6fe' }] : []),
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '12px', backgroundColor: s.bg, border: `1px solid ${s.border}`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.dot }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{s.count}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Sub-filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'all', label: 'All', count: orders.length },
          { key: 'delivery', label: 'Delivery', count: deliveryCount, icon: FaTruck },
          { key: 'takeaway', label: 'Takeaway', count: takeawayCount, icon: FaShoppingBag },
        ].map(tab => {
          const active = filterType === tab.key;
          return (
            <button key={tab.key} onClick={() => setFilterType(tab.key)} style={{
              padding: '7px 16px', borderRadius: '24px', border: active ? 'none' : '1px solid #e2e8f0',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backgroundColor: active ? '#ef4444' : 'white',
              color: active ? 'white' : '#475569',
              boxShadow: active ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
            }}>
              {tab.icon && <tab.icon size={11} />}
              {tab.label}
              <span style={{
                padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              }}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <FaConciergeBell size={24} color="#94a3b8" />
          </div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>
            No active {filterType === 'all' ? 'delivery or takeaway' : filterType} orders
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            Orders will appear here in real-time as they come in
          </div>
        </div>
      )}

      {/* Orders Grid */}
      {filteredOrders.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: isMobile ? '12px' : '16px',
        }}>
          {filteredOrders.map((order, idx) => {
            const sConfig = statusConfig[order.status] || statusConfig.pending;
            const tBadge = typeBadge[order.orderType] || typeBadge.delivery;
            const elapsed = getElapsed(order);
            const elapsedMins = getElapsedMinutes(order);
            const isOverdue = elapsedMins >= 15;
            const isUpdating = updatingId === order.id;
            const nextLabel = getNextStatusLabel(order.status, order.orderType);
            const nextColor = getNextStatusColor(order.status);
            const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
            const customerName = order.customerInfo?.name || order.customerName || '';
            const customerPhone = order.customerInfo?.phone || order.customerPhone || '';
            const orderNum = order.orderNumber || order.id?.slice(-6)?.toUpperCase() || '';

            return (
              <div key={order.id} className="tbl-card" style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: `1.5px solid ${sConfig.border}`,
                borderLeft: `4px solid ${sConfig.color}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                opacity: 0,
                animation: `tblFadeIn 0.3s ease-out ${idx * 0.04}s forwards`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Row 1: Order # + Type badge + Elapsed */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                      #{orderNum}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                      backgroundColor: tBadge.bg, color: tBadge.color, letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                    }}>
                      <tBadge.icon size={9} /> {tBadge.label}
                    </span>
                  </div>
                  {elapsed && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: '600',
                      color: isOverdue ? '#ef4444' : '#6b7280',
                      animation: isOverdue ? 'tblPulse 2s ease-in-out infinite' : 'none',
                    }}>
                      <FaClock size={10} /> {elapsed}
                    </span>
                  )}
                </div>

                {/* Row 2: Customer info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {customerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      <FaUser size={10} color="#9ca3af" /> {customerName}
                    </div>
                  )}
                  {customerPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <FaPhoneAlt size={9} color="#9ca3af" /> {customerPhone}
                    </div>
                  )}
                </div>

                {/* Row 3: Items + Total */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '8px', backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    <FaReceipt size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                    {fc(order.totalAmount || order.finalAmount || 0)}
                  </span>
                </div>

                {/* Row 4: Status Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '8px',
                  backgroundColor: sConfig.bg,
                  border: `1px solid ${sConfig.border}`,
                  alignSelf: 'flex-start',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: sConfig.color }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: sConfig.text }}>
                    {getStatusLabel(order.status, order.orderType)}
                  </span>
                </div>

                {/* Row 5: Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  {/* View */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}
                    className="tbl-action"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                      backgroundColor: '#fff', color: '#475569', fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <FaEye size={10} /> View
                  </button>

                  {/* Advance Status */}
                  {nextLabel && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(order); }}
                      disabled={isUpdating}
                      className="tbl-action"
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '7px 12px', borderRadius: '8px', border: 'none',
                        background: `linear-gradient(135deg, ${nextColor}, ${nextColor}dd)`,
                        color: '#fff', fontSize: '12px', fontWeight: '700',
                        cursor: isUpdating ? 'wait' : 'pointer',
                        opacity: isUpdating ? 0.7 : 1,
                        boxShadow: `0 2px 6px ${nextColor}40`,
                      }}
                    >
                      {isUpdating ? (
                        <FaSpinner size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
                      ) : (
                        <>
                          {order.status === 'served' ? <FaCheckCircle size={10} /> : <FaChevronRight size={9} />}
                          {nextLabel}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
