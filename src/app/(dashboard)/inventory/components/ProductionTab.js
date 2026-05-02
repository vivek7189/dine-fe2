'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';
import { FaIndustry, FaPlus, FaPlay, FaCheck, FaTimes, FaSpinner, FaCalendarAlt, FaExclamationTriangle, FaBoxes } from 'react-icons/fa';

const SUB_TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'create', label: 'Create' },
];

const STATUS_FILTERS = ['all', 'planned', 'in_production', 'completed', 'cancelled'];

const pillStyle = (active) => ({
  padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  background: active ? '#059669' : '#f3f4f6',
  color: active ? '#fff' : '#374151',
  transition: 'all 0.15s',
});

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', background: '#059669', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const btnSmall = (bg = '#f3f4f6', color = '#374151') => ({
  padding: '4px 10px', background: bg, color, border: 'none',
  borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 4,
});

const th = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' };
const td = { padding: '10px 12px', fontSize: 13, color: '#111827', borderBottom: '1px solid #f3f4f6' };

const badge = (bg, color) => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: 10,
  fontSize: 11, fontWeight: 600, background: bg, color,
});

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: '#374151',
  display: 'block', marginBottom: 4,
};

const emptyState = (msg) => (
  <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
    <FaBoxes size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
    <div style={{ fontSize: 14 }}>{msg}</div>
  </div>
);

const statusColorMap = {
  planned: { bg: '#dbeafe', text: '#1d4ed8' },
  in_production: { bg: '#fef3c7', text: '#d97706' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  cancelled: { bg: '#f3f4f6', text: '#6b7280' },
};

const getStatusBadge = (status) => {
  const c = statusColorMap[status] || { bg: '#f3f4f6', text: '#6b7280' };
  const label = status === 'in_production' ? 'In Production' : status?.charAt(0).toUpperCase() + status?.slice(1);
  return <span style={badge(c.bg, c.text)}>{label}</span>;
};

const formatDate = (d) => {
  if (!d) return '-';
  const date = d._seconds ? new Date(d._seconds * 1000) : new Date(d);
  return date.toLocaleDateString();
};

const todayISO = () => new Date().toISOString().split('T')[0];

export default function ProductionTab({ currentRestaurant, isMobile, permissions = { read: true, add: true, update: true, delete: true } }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orgSettings, setOrgSettings] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [completeQtyMap, setCompleteQtyMap] = useState({});

  // Create form state
  const [form, setForm] = useState({
    recipeName: '',
    recipeId: '',
    targetQuantity: '',
    unit: 'servings',
    scheduledDate: todayISO(),
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const centralKitchenId = currentRestaurant?.id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Detect org
  useEffect(() => {
    if (!currentRestaurant?.organizationId) {
      setOrgSettings(null);
      setOrgId(null);
      return;
    }
    const loadOrg = async () => {
      try {
        const res = await apiClient.getOrganization(currentRestaurant.organizationId);
        if (res.success) {
          setOrgSettings(res.organization?.settings || {});
          setOrgId(res.organization?.id || currentRestaurant.organizationId);
        }
      } catch (e) {
        console.error('Error loading org for production:', e);
        setOrgSettings({});
      }
    };
    loadOrg();
  }, [currentRestaurant?.organizationId]);

  const hasKitchen = orgSettings?.centralKitchen && orgId;

  // Load dashboard
  const loadDashboard = useCallback(async () => {
    if (!orgId || !centralKitchenId) return;
    try {
      setLoading(true);
      const res = await apiClient.getKitchenDashboard(orgId, centralKitchenId);
      if (res.success !== false) {
        setDashboard(res);
      }
    } catch (e) {
      console.error('Error loading kitchen dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, centralKitchenId]);

  // Load orders
  const loadOrders = useCallback(async () => {
    if (!orgId || !centralKitchenId) return;
    try {
      setLoading(true);
      const res = await apiClient.getProductionOrders(orgId, { centralKitchenId });
      setOrders(res.orders || []);
    } catch (e) {
      console.error('Error loading production orders:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, centralKitchenId]);

  // Load data on tab change
  useEffect(() => {
    if (!hasKitchen) return;
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'orders') loadOrders();
  }, [activeTab, hasKitchen, loadDashboard, loadOrders]);

  // Actions
  const handleStartProduction = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'start' }));
      const res = await apiClient.startProduction(orgId, orderId);
      if (res.success !== false) {
        showToast('Production started');
        loadOrders();
      }
    } catch (e) {
      showToast(e.message || 'Failed to start production', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCompleteProduction = async (orderId) => {
    const producedQuantity = Number(completeQtyMap[orderId]);
    if (!producedQuantity || producedQuantity <= 0) {
      return showToast('Enter a valid produced quantity', 'error');
    }
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'complete' }));
      const res = await apiClient.completeProduction(orgId, orderId, { producedQuantity });
      if (res.success !== false) {
        showToast('Production completed');
        setCompleteQtyMap(prev => ({ ...prev, [orderId]: '' }));
        loadOrders();
      }
    } catch (e) {
      showToast(e.message || 'Failed to complete production', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    if (!confirm(`Cancel production order ${orderNumber || orderId}?`)) return;
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'cancel' }));
      const res = await apiClient.cancelProductionOrder(orgId, orderId);
      if (res.success !== false) {
        showToast('Production order cancelled');
        loadOrders();
      }
    } catch (e) {
      showToast(e.message || 'Failed to cancel order', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCreateOrder = async () => {
    if (!form.recipeName.trim()) return showToast('Recipe name is required', 'error');
    if (!form.targetQuantity || Number(form.targetQuantity) <= 0) return showToast('Enter a valid target quantity', 'error');
    if (!form.scheduledDate) return showToast('Scheduled date is required', 'error');
    try {
      setSubmitting(true);
      const res = await apiClient.createProductionOrder(orgId, {
        centralKitchenId,
        recipeId: form.recipeId.trim() || undefined,
        recipeName: form.recipeName.trim(),
        targetQuantity: Number(form.targetQuantity),
        unit: form.unit.trim() || 'servings',
        scheduledDate: form.scheduledDate,
        notes: form.notes.trim() || undefined,
      });
      if (res.success !== false) {
        showToast(`Production order ${res.orderNumber || ''} created`);
        setForm({ recipeName: '', recipeId: '', targetQuantity: '', unit: 'servings', scheduledDate: todayISO(), notes: '' });
        setActiveTab('orders');
      }
    } catch (e) {
      showToast(e.message || 'Failed to create production order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Guard: no org
  if (!currentRestaurant?.organizationId) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
        <FaIndustry size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14, fontWeight: 500 }}>Not part of an organization</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Production management requires an organization setup.</div>
      </div>
    );
  }

  // Guard: kitchen not enabled
  if (orgSettings !== null && !hasKitchen) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
        <FaIndustry size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14, fontWeight: 500 }}>Central kitchen not enabled</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Enable central kitchen in your organization settings to use production management.</div>
      </div>
    );
  }

  const tableWrap = { width: '100%', overflowX: 'auto' };
  const table = { width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 500 : 'auto' };

  // === Dashboard ===
  const renderDashboard = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading dashboard...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    if (!dashboard) return emptyState('No dashboard data available');

    const summary = dashboard.statusSummary || {};
    const summaryCards = [
      { label: 'Planned', value: summary.planned || 0, bg: '#dbeafe', color: '#1d4ed8', icon: <FaCalendarAlt size={14} /> },
      { label: 'In Production', value: summary.in_production || 0, bg: '#fef3c7', color: '#d97706', icon: <FaPlay size={14} /> },
      { label: 'Completed', value: summary.completed || 0, bg: '#d1fae5', color: '#065f46', icon: <FaCheck size={14} /> },
      { label: 'Cancelled', value: summary.cancelled || 0, bg: '#f3f4f6', color: '#6b7280', icon: <FaTimes size={14} /> },
    ];

    const ingredients = dashboard.ingredientRequirements || [];
    const completions = dashboard.recentCompletions || [];

    return (
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Today&apos;s Production Summary</h3>

        {/* Status summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {summaryCards.map(card => (
            <div key={card.label} style={{
              padding: '16px', borderRadius: 10, background: card.bg,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ color: card.color, opacity: 0.7 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: card.color, opacity: 0.8 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Ingredient Requirements */}
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Ingredient Requirements</h3>
        {ingredients.length === 0 ? (
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
            No ingredient requirements for today.
          </div>
        ) : (
          <div style={{ ...tableWrap, marginBottom: 24 }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Item Name</th>
                  <th style={th}>Required Qty</th>
                  <th style={th}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((item, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={{ ...td, fontWeight: 600 }}>{item.name}</td>
                    <td style={td}>{item.totalNeeded}</td>
                    <td style={td}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Completions */}
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Recent Completions (Last 7 Days)</h3>
        {completions.length === 0 ? (
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#9ca3af' }}>
            No recent completions.
          </div>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Recipe</th>
                  <th style={th}>Produced Qty</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {completions.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ ...td, fontWeight: 600 }}>{item.recipeName || '-'}</td>
                    <td style={td}>{item.producedQuantity} {item.unit || ''}</td>
                    <td style={td}>{formatDate(item.completedAt || item.scheduledDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // === Orders ===
  const renderOrders = () => {
    const filteredOrders = statusFilter === 'all'
      ? orders
      : orders.filter(o => o.status === statusFilter);

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Production Orders</h3>
          {permissions.add !== false && (
            <button style={btnPrimary} onClick={() => setActiveTab('create')}>
              <FaPlus size={12} /> New Order
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              style={pillStyle(statusFilter === f)}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'in_production' ? 'In Production' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: 8, fontSize: 13 }}>Loading orders...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredOrders.length === 0 ? (
          emptyState(statusFilter === 'all' ? 'No production orders yet' : `No ${statusFilter === 'in_production' ? 'in production' : statusFilter} orders`)
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Order #</th>
                  <th style={th}>Recipe</th>
                  <th style={th}>Target Qty</th>
                  <th style={th}>Produced Qty</th>
                  <th style={th}>Status</th>
                  <th style={th}>Scheduled</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrder === order.id;
                  const isActionLoading = actionLoading[order.id];
                  return (
                    <tr key={order.id} style={{ verticalAlign: 'top' }}>
                      <td style={{ ...td, fontWeight: 600 }}>
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#1d4ed8', textDecoration: 'underline', padding: 0 }}
                        >
                          {order.orderNumber || order.id}
                        </button>
                      </td>
                      <td style={td}>{order.recipeName || '-'}</td>
                      <td style={td}>{order.targetQuantity} {order.unit || ''}</td>
                      <td style={td}>
                        {order.status === 'completed' ? (
                          <span style={{ fontWeight: 600, color: '#065f46' }}>{order.producedQuantity} {order.unit || ''}</span>
                        ) : '-'}
                      </td>
                      <td style={td}>{getStatusBadge(order.status)}</td>
                      <td style={td}>{formatDate(order.scheduledDate)}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          {order.status === 'planned' && permissions.update !== false && (
                            <>
                              <button
                                style={btnSmall('#dbeafe', '#1d4ed8')}
                                onClick={() => handleStartProduction(order.id)}
                                disabled={!!isActionLoading}
                              >
                                {isActionLoading === 'start' ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlay size={10} />}
                                {' '}Start
                              </button>
                              <button
                                style={btnSmall('#fef2f2', '#991b1b')}
                                onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                                disabled={!!isActionLoading}
                              >
                                {isActionLoading === 'cancel' ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTimes size={10} />}
                                {' '}Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'in_production' && permissions.update !== false && (
                            <>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Qty"
                                value={completeQtyMap[order.id] || ''}
                                onChange={e => setCompleteQtyMap(prev => ({ ...prev, [order.id]: e.target.value }))}
                                style={{ width: 70, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                              />
                              <button
                                style={btnSmall('#d1fae5', '#065f46')}
                                onClick={() => handleCompleteProduction(order.id)}
                                disabled={!!isActionLoading}
                              >
                                {isActionLoading === 'complete' ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={10} />}
                                {' '}Complete
                              </button>
                              <button
                                style={btnSmall('#fef2f2', '#991b1b')}
                                onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                                disabled={!!isActionLoading}
                              >
                                {isActionLoading === 'cancel' ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTimes size={10} />}
                                {' '}Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <span style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Create Distribution Plan</span>
                          )}
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div style={{ marginTop: 12, padding: '12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            {/* Warnings */}
                            {order.warnings?.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                {order.warnings.map((w, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 10px', background: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e', marginBottom: 4 }}>
                                    <FaExclamationTriangle size={11} style={{ marginTop: 1, flexShrink: 0 }} />
                                    <span>{w}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Ingredients consumed */}
                            {order.ingredientsConsumed?.length > 0 ? (
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Ingredients Consumed</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ ...th, fontSize: 11, padding: '6px 8px' }}>Item</th>
                                      <th style={{ ...th, fontSize: 11, padding: '6px 8px' }}>Qty Used</th>
                                      <th style={{ ...th, fontSize: 11, padding: '6px 8px' }}>Prev Stock</th>
                                      <th style={{ ...th, fontSize: 11, padding: '6px 8px' }}>New Stock</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.ingredientsConsumed.map((ing, i) => (
                                      <tr key={i}>
                                        <td style={{ ...td, fontSize: 12, padding: '6px 8px' }}>{ing.item || ing.name || '-'}</td>
                                        <td style={{ ...td, fontSize: 12, padding: '6px 8px' }}>{ing.qtyUsed ?? ing.quantity ?? '-'}</td>
                                        <td style={{ ...td, fontSize: 12, padding: '6px 8px' }}>{ing.previousStock ?? '-'}</td>
                                        <td style={{ ...td, fontSize: 12, padding: '6px 8px' }}>{ing.newStock ?? '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: '#9ca3af' }}>No ingredient consumption data available.</div>
                            )}

                            {order.notes && (
                              <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                                <strong>Notes:</strong> {order.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // === Create ===
  const renderCreate = () => {
    if (permissions.add === false) {
      return emptyState('You do not have permission to create production orders.');
    }

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Create Production Order</h3>
          <button style={btnSmall()} onClick={() => setActiveTab('orders')}>
            <FaTimes size={10} /> Cancel
          </button>
        </div>

        <div style={{ maxWidth: 560 }}>
          {/* Recipe Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Recipe Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Paneer Tikka Masala"
              value={form.recipeName}
              onChange={e => setForm(f => ({ ...f, recipeName: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Recipe ID */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Recipe ID <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional — link to existing recipe)</span></label>
            <input
              type="text"
              placeholder="e.g. rec_abc123"
              value={form.recipeId}
              onChange={e => setForm(f => ({ ...f, recipeId: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Target Qty + Unit row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>Target Quantity <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 50"
                value={form.targetQuantity}
                onChange={e => setForm(f => ({ ...f, targetQuantity: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>Unit</label>
              <input
                type="text"
                placeholder="servings"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Scheduled Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Scheduled Date <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              placeholder="Additional instructions or notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleCreateOrder}
            disabled={submitting}
            style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaIndustry size={12} />}
            {' '}Create Production Order
          </button>
        </div>
      </div>
    );
  };

  const subTabContent = {
    dashboard: renderDashboard,
    orders: renderOrders,
    create: renderCreate,
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 500,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#059669',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Sub-tab pills */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            style={pillStyle(activeTab === t.key)}
            onClick={() => setActiveTab(t.key)}
          >
            {t.key === 'dashboard' && <FaIndustry size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {t.key === 'create' && <FaPlus size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Active sub-tab content */}
      <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 12 : 20, border: '1px solid #e5e7eb' }}>
        {(subTabContent[activeTab] || renderDashboard)()}
      </div>
    </div>
  );
}
