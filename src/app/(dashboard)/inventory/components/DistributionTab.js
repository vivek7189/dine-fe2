'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';
import { FaRoute, FaPlus, FaTruck, FaCheck, FaTimes, FaSpinner, FaBoxes, FaStore, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const SUB_TABS = [
  { key: 'plans', label: 'Plans' },
  { key: 'create', label: 'Create' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'partially_dispatched', label: 'Partially Dispatched' },
  { key: 'fully_dispatched', label: 'Fully Dispatched' },
  { key: 'completed', label: 'Completed' },
];

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

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', fontSize: 13, color: '#111827', borderBottom: '1px solid #f3f4f6' };

const badge = (bg, color) => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: 10,
  fontSize: 11, fontWeight: 600, background: bg, color,
});

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

const emptyState = (msg) => (
  <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
    <FaBoxes size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
    <div style={{ fontSize: 14 }}>{msg}</div>
  </div>
);

const planStatusColor = (status) => {
  const map = {
    draft: { bg: '#f3f4f6', text: '#6b7280' },
    partially_dispatched: { bg: '#fffbeb', text: '#d97706' },
    fully_dispatched: { bg: '#dbeafe', text: '#1d4ed8' },
    completed: { bg: '#d1fae5', text: '#065f46' },
  };
  return map[status] || { bg: '#f3f4f6', text: '#6b7280' };
};

const allocationStatusColor = (status) => {
  const map = {
    planned: { bg: '#dbeafe', text: '#1d4ed8' },
    dispatched: { bg: '#ede9fe', text: '#7c3aed' },
    in_transit: { bg: '#fffbeb', text: '#d97706' },
    received: { bg: '#d1fae5', text: '#065f46' },
  };
  return map[status] || { bg: '#f3f4f6', text: '#6b7280' };
};

const formatDate = (d) => {
  if (!d) return '-';
  const ts = d._seconds ? d._seconds * 1000 : d;
  return new Date(ts).toLocaleDateString();
};

export default function DistributionTab({ currentRestaurant, isMobile, permissions = { read: true, add: true, update: true, delete: true } }) {
  const centralKitchenId = currentRestaurant?.id;

  // Org state
  const [orgSettings, setOrgSettings] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);

  // Sub-tab
  const [activeTab, setActiveTab] = useState('plans');

  // Plans state
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState({});

  // Create state
  const [productionOrders, setProductionOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [form, setForm] = useState({ itemName: '', totalQuantity: '', unit: '' });
  const [allocations, setAllocations] = useState([{ outletId: '', quantity: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Detect org on mount
  useEffect(() => {
    if (!currentRestaurant?.organizationId) {
      setOrgSettings(null);
      setOrgId(null);
      setOrgLoading(false);
      return;
    }
    const loadOrg = async () => {
      try {
        setOrgLoading(true);
        const res = await apiClient.getOrganization(currentRestaurant.organizationId);
        if (res.success) {
          setOrgSettings(res.organization?.settings || {});
          setOrgId(res.organization?.id || currentRestaurant.organizationId);
        }
      } catch (e) {
        console.error('Error loading org for distribution:', e);
        setOrgSettings({});
      } finally {
        setOrgLoading(false);
      }
    };
    loadOrg();
  }, [currentRestaurant?.organizationId]);

  // Load plans
  const loadPlans = useCallback(async () => {
    if (!orgId || !centralKitchenId) return;
    try {
      setPlansLoading(true);
      const res = await apiClient.getDistributionPlans(orgId, { centralKitchenId });
      setPlans(res.plans || []);
    } catch (e) {
      console.error('Error loading distribution plans:', e);
    } finally {
      setPlansLoading(false);
    }
  }, [orgId, centralKitchenId]);

  // Load production orders (completed) for create tab
  const loadProductionOrders = useCallback(async () => {
    if (!orgId || !centralKitchenId) return;
    try {
      setOrdersLoading(true);
      const res = await apiClient.getProductionOrders(orgId, { centralKitchenId, status: 'completed' });
      setProductionOrders(res.orders || []);
    } catch (e) {
      console.error('Error loading production orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  }, [orgId, centralKitchenId]);

  // Load outlets for create tab
  const loadOutlets = useCallback(async () => {
    if (!orgId) return;
    try {
      setOutletsLoading(true);
      const res = await apiClient.getOrgOutlets(orgId);
      if (res.success !== false) {
        // Filter to only type=outlet (exclude warehouse and central_kitchen)
        const allOutlets = res.outlets || [];
        const outletOnly = allOutlets.filter(o => (o.outletType || o.type) === 'outlet');
        setOutlets(outletOnly);
      }
    } catch (e) {
      console.error('Error loading outlets:', e);
    } finally {
      setOutletsLoading(false);
    }
  }, [orgId]);

  // Load data when tab changes
  useEffect(() => {
    if (!orgId) return;
    if (activeTab === 'plans') loadPlans();
    if (activeTab === 'create') {
      loadProductionOrders();
      loadOutlets();
    }
  }, [activeTab, orgId, loadPlans, loadProductionOrders, loadOutlets]);

  // Handle selecting a production order
  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    if (orderId) {
      const order = productionOrders.find(o => o.id === orderId);
      if (order) {
        setForm({
          itemName: order.recipeName || order.itemName || '',
          totalQuantity: order.producedQuantity || order.quantity || '',
          unit: order.unit || '',
        });
      }
    } else {
      setForm({ itemName: '', totalQuantity: '', unit: '' });
    }
  };

  // Dispatch allocation
  const handleDispatch = async (planId, outletId) => {
    const loadKey = `${planId}_${outletId}`;
    try {
      setDispatchLoading(prev => ({ ...prev, [loadKey]: true }));
      await apiClient.dispatchDistribution(orgId, planId, outletId);
      showToast('Allocation dispatched successfully');
      loadPlans();
    } catch (e) {
      showToast(e.message || 'Failed to dispatch allocation', 'error');
    } finally {
      setDispatchLoading(prev => ({ ...prev, [loadKey]: false }));
    }
  };

  // Create distribution plan
  const handleCreate = async () => {
    if (!form.itemName.trim()) return showToast('Enter an item name', 'error');
    if (!form.totalQuantity || Number(form.totalQuantity) <= 0) return showToast('Enter a valid total quantity', 'error');
    if (!form.unit.trim()) return showToast('Enter a unit', 'error');

    const validAllocations = allocations.filter(a => a.outletId && Number(a.quantity) > 0);
    if (validAllocations.length === 0) return showToast('Add at least one allocation with an outlet and quantity', 'error');

    const allocSum = validAllocations.reduce((sum, a) => sum + Number(a.quantity), 0);
    if (allocSum > Number(form.totalQuantity)) {
      return showToast(`Allocation total (${allocSum}) exceeds available quantity (${form.totalQuantity})`, 'error');
    }

    try {
      setSubmitting(true);
      const data = {
        centralKitchenId,
        itemName: form.itemName.trim(),
        totalQuantity: Number(form.totalQuantity),
        unit: form.unit.trim(),
        allocations: validAllocations.map(a => {
          const outlet = outlets.find(o => o.id === a.outletId);
          return {
            outletId: a.outletId,
            outletName: outlet?.name || outlet?.restaurantName || '',
            quantity: Number(a.quantity),
          };
        }),
      };
      if (selectedOrderId) data.productionOrderId = selectedOrderId;

      await apiClient.createDistributionPlan(orgId, data);
      showToast('Distribution plan created');
      setSelectedOrderId('');
      setForm({ itemName: '', totalQuantity: '', unit: '' });
      setAllocations([{ outletId: '', quantity: '' }]);
      setActiveTab('plans');
      loadPlans();
    } catch (e) {
      showToast(e.message || 'Failed to create distribution plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Allocation row helpers
  const addAllocationRow = () => setAllocations(prev => [...prev, { outletId: '', quantity: '' }]);
  const removeAllocationRow = (idx) => setAllocations(prev => prev.filter((_, i) => i !== idx));
  const updateAllocation = (idx, field, value) => {
    setAllocations(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // Filtered plans
  const filteredPlans = statusFilter === 'all' ? plans : plans.filter(p => p.status === statusFilter);

  // Allocation sum warning
  const allocSum = allocations.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
  const totalQty = Number(form.totalQuantity) || 0;
  const overAllocated = allocSum > totalQty && totalQty > 0;

  // === Guard renders ===
  if (!currentRestaurant?.organizationId) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
        <FaRoute size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14 }}>Not part of an organization</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Distribution management requires an organization setup.</div>
      </div>
    );
  }

  if (orgLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
        <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 8, fontSize: 13 }}>Loading organization...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!orgSettings?.centralKitchen) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
        <FaRoute size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14 }}>Central kitchen not enabled</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Enable the central kitchen feature in your organization settings to manage distribution.</div>
      </div>
    );
  }

  // === Plans sub-tab ===
  const renderPlans = () => (
    <div>
      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 500,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: statusFilter === f.key ? '#e0e7ff' : '#f9fafb',
              color: statusFilter === f.key ? '#3730a3' : '#6b7280',
              transition: 'all 0.15s',
            }}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {plansLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading distribution plans...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredPlans.length === 0 ? (
        emptyState(statusFilter === 'all' ? 'No distribution plans yet. Create one to get started.' : `No plans with status "${statusFilter.replace(/_/g, ' ')}".`)
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPlans.map(plan => {
            const sc = planStatusColor(plan.status);
            const isExpanded = expandedPlan === plan.id;
            return (
              <div key={plan.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                {/* Plan card header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: isMobile ? '10px 12px' : '12px 16px', cursor: 'pointer',
                    background: isExpanded ? '#f9fafb' : '#fff',
                    flexWrap: 'wrap', gap: 8,
                  }}
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                    <FaRoute size={14} style={{ color: '#6b7280' }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{plan.itemName || 'Unnamed'}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{plan.totalQuantity} {plan.unit}</span>
                    <span style={badge(sc.bg, sc.text)}>{(plan.status || 'draft').replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{plan.allocations?.length || 0} allocation{(plan.allocations?.length || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(plan.createdAt)}</span>
                    {isExpanded ? <FaChevronUp size={12} style={{ color: '#9ca3af' }} /> : <FaChevronDown size={12} style={{ color: '#9ca3af' }} />}
                  </div>
                </div>

                {/* Expanded allocations table */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e5e7eb', padding: isMobile ? 8 : 16, background: '#fafafa' }}>
                    {(!plan.allocations || plan.allocations.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '16px 8px', fontSize: 13, color: '#9ca3af' }}>No allocations in this plan.</div>
                    ) : (
                      <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 600 : 'auto' }}>
                          <thead>
                            <tr>
                              <th style={thStyle}>Outlet</th>
                              <th style={thStyle}>Allocated Qty</th>
                              <th style={thStyle}>Status</th>
                              <th style={thStyle}>Dispatched At</th>
                              <th style={thStyle}>Received At</th>
                              <th style={thStyle}>Actual Received Qty</th>
                              <th style={thStyle}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.allocations.map((alloc, idx) => {
                              const ac = allocationStatusColor(alloc.status);
                              const loadKey = `${plan.id}_${alloc.outletId}`;
                              return (
                                <tr key={alloc.outletId || idx}>
                                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                                    <FaStore size={11} style={{ marginRight: 4, color: '#9ca3af', verticalAlign: 'middle' }} />
                                    {alloc.outletName || alloc.outletId || '-'}
                                  </td>
                                  <td style={tdStyle}>{alloc.quantity} {plan.unit || ''}</td>
                                  <td style={tdStyle}>
                                    <span style={badge(ac.bg, ac.text)}>{(alloc.status || 'planned').replace(/_/g, ' ')}</span>
                                  </td>
                                  <td style={tdStyle}>{formatDate(alloc.dispatchedAt)}</td>
                                  <td style={tdStyle}>{formatDate(alloc.receivedAt)}</td>
                                  <td style={tdStyle}>{alloc.actualReceivedQty != null ? alloc.actualReceivedQty : '-'}</td>
                                  <td style={tdStyle}>
                                    {alloc.status === 'planned' && permissions.update !== false ? (
                                      <button
                                        style={btnSmall('#ede9fe', '#7c3aed')}
                                        onClick={(e) => { e.stopPropagation(); handleDispatch(plan.id, alloc.outletId); }}
                                        disabled={dispatchLoading[loadKey]}
                                      >
                                        {dispatchLoading[loadKey]
                                          ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} />
                                          : <FaTruck size={10} />}
                                        {' '}Dispatch
                                      </button>
                                    ) : alloc.status === 'dispatched' || alloc.status === 'in_transit' ? (
                                      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Awaiting Receipt</span>
                                    ) : alloc.status === 'received' ? (
                                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <FaCheck size={10} /> Received{alloc.actualReceivedQty != null ? ` (${alloc.actualReceivedQty})` : ''}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: 12, color: '#9ca3af' }}>-</span>
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // === Create sub-tab ===
  const renderCreate = () => (
    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#111827' }}>Create Distribution Plan</h3>

      {/* Section 1: Link production order or manual entry */}
      <div style={{ marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <label style={{ ...labelStyle, marginBottom: 8, fontSize: 13 }}>Link to Production Order (optional)</label>
        {ordersLoading ? (
          <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> Loading completed orders...
          </div>
        ) : (
          <select
            value={selectedOrderId}
            onChange={e => handleSelectOrder(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Select a completed production order --</option>
            {productionOrders.map(o => (
              <option key={o.id} value={o.id}>
                {o.recipeName || o.itemName || 'Order'} — {o.producedQuantity || o.quantity || 0} {o.unit || ''} (#{o.orderNumber || o.id.slice(0, 8)})
              </option>
            ))}
          </select>
        )}

        <div style={{ margin: '12px 0 8px', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
          {selectedOrderId ? 'Auto-filled from production order (editable)' : 'Or enter manually'}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>Item Name</label>
            <input
              type="text"
              placeholder="e.g. Paneer Tikka"
              value={form.itemName}
              onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label style={labelStyle}>Total Quantity</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={form.totalQuantity}
              onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <label style={labelStyle}>Unit</label>
            <input
              type="text"
              placeholder="kg, pcs, l"
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Allocations */}
      <div style={{ marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0, fontSize: 13 }}>Allocations</label>
          {totalQty > 0 && (
            <span style={{ fontSize: 12, color: overAllocated ? '#dc2626' : '#6b7280', fontWeight: 500 }}>
              {allocSum} / {totalQty} {form.unit || 'units'} allocated
            </span>
          )}
        </div>

        {overAllocated && (
          <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
            Warning: Allocation total ({allocSum}) exceeds available quantity ({totalQty}).
          </div>
        )}

        {outletsLoading ? (
          <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> Loading outlets...
          </div>
        ) : outlets.length === 0 ? (
          <div style={{ fontSize: 12, color: '#d97706', padding: '8px 12px', background: '#fffbeb', borderRadius: 8, marginBottom: 12 }}>
            No outlets found in your organization. Add outlets before creating distribution plans.
          </div>
        ) : null}

        {allocations.map((alloc, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 180 }}>
              <select
                value={alloc.outletId}
                onChange={e => updateAllocation(idx, 'outletId', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select outlet...</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name || o.restaurantName || o.id}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: 100 }}>
              <input
                type="number"
                placeholder="Qty"
                min="0"
                step="0.01"
                value={alloc.quantity}
                onChange={e => updateAllocation(idx, 'quantity', e.target.value)}
                style={inputStyle}
              />
            </div>
            {allocations.length > 1 && (
              <button
                onClick={() => removeAllocationRow(idx)}
                style={{ ...btnSmall('#fef2f2', '#991b1b'), padding: '6px 8px' }}
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addAllocationRow}
          style={{ ...btnSmall('#f0fdf4', '#059669'), marginTop: 4 }}
        >
          <FaPlus size={10} /> Add Allocation
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleCreate}
        disabled={submitting}
        style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaRoute size={12} />}
        {' '}Create Distribution Plan
      </button>
    </div>
  );

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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

      {/* Sub-tab pills */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {SUB_TABS.map(t => {
          // Only show Create tab if user has update permission
          if (t.key === 'create' && permissions.update === false) return null;
          return (
            <button
              key={t.key}
              style={pillStyle(activeTab === t.key)}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active sub-tab content */}
      <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 12 : 20, border: '1px solid #e5e7eb' }}>
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'create' && renderCreate()}
      </div>
    </div>
  );
}
