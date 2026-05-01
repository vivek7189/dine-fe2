'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaIndustry,
  FaPlus,
  FaPlay,
  FaStop,
  FaCheck,
  FaSpinner,
  FaArrowLeft,
  FaTruck,
  FaClipboardList,
  FaCalendarAlt,
  FaBoxOpen
} from 'react-icons/fa';
import apiClient from '../../../../lib/api';

// ============================================
// Status badge colors
// ============================================
const PRODUCTION_STATUS_COLORS = {
  planned: { bg: '#dbeafe', text: '#1d4ed8', label: 'Planned' },
  in_production: { bg: '#fef9c3', text: '#a16207', label: 'In Production' },
  completed: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
  cancelled: { bg: '#f3f4f6', text: '#6b7280', label: 'Cancelled' },
};

const DISTRIBUTION_STATUS_COLORS = {
  draft: { bg: '#f3f4f6', text: '#6b7280', label: 'Draft' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8', label: 'Confirmed' },
  partially_dispatched: { bg: '#fef9c3', text: '#a16207', label: 'Partially Dispatched' },
  fully_dispatched: { bg: '#f3e8ff', text: '#7c3aed', label: 'Fully Dispatched' },
  completed: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
};

const ALLOCATION_STATUS_COLORS = {
  planned: { bg: '#dbeafe', text: '#1d4ed8', label: 'Planned' },
  dispatched: { bg: '#fef9c3', text: '#a16207', label: 'Dispatched' },
  received: { bg: '#dcfce7', text: '#15803d', label: 'Received' },
};

// ============================================
// StatusBadge
// ============================================
const StatusBadge = ({ status, colorMap }) => {
  const colors = colorMap[status] || { bg: '#f3f4f6', text: '#6b7280', label: status };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: colors.bg,
      color: colors.text,
      whiteSpace: 'nowrap',
    }}>
      {colors.label}
    </span>
  );
};

// ============================================
// Shared styles
// ============================================
const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnDanger = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: '#fee2e2',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
};

// ============================================
// CentralKitchenTab Component
// ============================================
const CentralKitchenTab = ({ orgData, outlets, formatCurrency }) => {
  // --- Top-level sub-tab ---
  const [subTab, setSubTab] = useState('production'); // 'production' | 'distribution' | 'dashboard'

  // --- Production Orders state ---
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  // --- Create Order form ---
  const [orderForm, setOrderForm] = useState({
    centralKitchenId: '',
    recipeName: '',
    recipeId: '',
    targetQuantity: '',
    unit: '',
    scheduledDate: '',
    notes: '',
  });
  const [orderFormSubmitting, setOrderFormSubmitting] = useState(false);
  const [orderFormError, setOrderFormError] = useState(null);

  // --- Production action states ---
  const [actionLoading, setActionLoading] = useState(null);
  const [producedQtyInput, setProducedQtyInput] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // --- Distribution Plans state ---
  const [plans, setPlans] = useState([]);
  const [plansTotal, setPlansTotal] = useState(0);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetailLoading, setPlanDetailLoading] = useState(false);
  const [planDetailError, setPlanDetailError] = useState(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  // --- Create Plan form ---
  const [planForm, setPlanForm] = useState({
    productionOrderId: '',
    itemName: '',
    totalQuantity: '',
    unit: '',
    allocations: [{ outletId: '', quantity: '' }],
  });
  const [planFormSubmitting, setPlanFormSubmitting] = useState(false);
  const [planFormError, setPlanFormError] = useState(null);

  // --- Distribution action states ---
  const [distActionLoading, setDistActionLoading] = useState(null);
  const [receiveQtyInputs, setReceiveQtyInputs] = useState({});

  // --- Kitchen Dashboard state ---
  const [dashboardKitchenId, setDashboardKitchenId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  const centralKitchens = outlets?.central_kitchen || [];
  const outletList = outlets?.outlet || [];

  // ============================================
  // Load Production Orders
  // ============================================
  const loadOrders = useCallback(async () => {
    if (!orgData?.id) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await apiClient.getProductionOrders(orgData.id, params);
      setOrders(res?.orders || []);
      setOrdersTotal(res?.total || 0);
    } catch (err) {
      setOrdersError(err.message || 'Failed to load production orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [orgData?.id, statusFilter]);

  useEffect(() => {
    if (subTab === 'production') {
      loadOrders();
    }
  }, [subTab, loadOrders]);

  // ============================================
  // Load Distribution Plans
  // ============================================
  const loadPlans = useCallback(async () => {
    if (!orgData?.id) return;
    setPlansLoading(true);
    setPlansError(null);
    try {
      const res = await apiClient.getDistributionPlans(orgData.id);
      setPlans(res?.plans || []);
      setPlansTotal(res?.total || 0);
    } catch (err) {
      setPlansError(err.message || 'Failed to load distribution plans');
    } finally {
      setPlansLoading(false);
    }
  }, [orgData?.id]);

  useEffect(() => {
    if (subTab === 'distribution') {
      loadPlans();
    }
  }, [subTab, loadPlans]);

  // ============================================
  // Load Order Detail
  // ============================================
  const loadOrderDetail = useCallback(async (orderId) => {
    if (!orgData?.id) return;
    setOrderDetailLoading(true);
    setOrderDetailError(null);
    try {
      const res = await apiClient.getProductionOrder(orgData.id, orderId);
      setSelectedOrder(res);
    } catch (err) {
      setOrderDetailError(err.message || 'Failed to load order details');
    } finally {
      setOrderDetailLoading(false);
    }
  }, [orgData?.id]);

  // ============================================
  // Load Plan Detail
  // ============================================
  const loadPlanDetail = useCallback(async (planId) => {
    if (!orgData?.id) return;
    setPlanDetailLoading(true);
    setPlanDetailError(null);
    try {
      const res = await apiClient.getDistributionPlan(orgData.id, planId);
      setSelectedPlan(res);
    } catch (err) {
      setPlanDetailError(err.message || 'Failed to load plan details');
    } finally {
      setPlanDetailLoading(false);
    }
  }, [orgData?.id]);

  // ============================================
  // Load Kitchen Dashboard
  // ============================================
  const loadDashboard = useCallback(async (kitchenId) => {
    if (!orgData?.id || !kitchenId) return;
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const res = await apiClient.getKitchenDashboard(orgData.id, kitchenId);
      setDashboardData(res);
    } catch (err) {
      setDashboardError(err.message || 'Failed to load kitchen dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [orgData?.id]);

  useEffect(() => {
    if (subTab === 'dashboard' && dashboardKitchenId) {
      loadDashboard(dashboardKitchenId);
    }
  }, [subTab, dashboardKitchenId, loadDashboard]);

  // ============================================
  // Create Production Order
  // ============================================
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.centralKitchenId || !orderForm.recipeName || !orderForm.targetQuantity || !orderForm.unit) {
      setOrderFormError('Please fill in all required fields');
      return;
    }
    setOrderFormSubmitting(true);
    setOrderFormError(null);
    try {
      await apiClient.createProductionOrder(orgData.id, {
        centralKitchenId: orderForm.centralKitchenId,
        recipeName: orderForm.recipeName,
        recipeId: orderForm.recipeId || undefined,
        targetQuantity: parseFloat(orderForm.targetQuantity),
        unit: orderForm.unit,
        scheduledDate: orderForm.scheduledDate || undefined,
        notes: orderForm.notes || undefined,
      });
      setShowCreateOrder(false);
      setOrderForm({ centralKitchenId: '', recipeName: '', recipeId: '', targetQuantity: '', unit: '', scheduledDate: '', notes: '' });
      await loadOrders();
    } catch (err) {
      setOrderFormError(err.message || 'Failed to create production order');
    } finally {
      setOrderFormSubmitting(false);
    }
  };

  // ============================================
  // Production Actions
  // ============================================
  const handleStartProduction = async (orderId) => {
    setActionLoading(orderId);
    try {
      await apiClient.startProduction(orgData.id, orderId);
      await loadOrderDetail(orderId);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to start production');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteProduction = async (orderId) => {
    const qty = parseFloat(producedQtyInput);
    if (!qty || qty <= 0) {
      alert('Please enter a valid produced quantity');
      return;
    }
    setActionLoading(orderId);
    try {
      await apiClient.completeProduction(orgData.id, orderId, { producedQuantity: qty });
      setShowCompleteModal(false);
      setProducedQtyInput('');
      await loadOrderDetail(orderId);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to complete production');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this production order?')) return;
    setActionLoading(orderId);
    try {
      await apiClient.cancelProductionOrder(orgData.id, orderId);
      await loadOrderDetail(orderId);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel production order');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // Create Distribution Plan
  // ============================================
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!planForm.itemName || !planForm.totalQuantity || !planForm.unit) {
      setPlanFormError('Please fill in all required fields');
      return;
    }
    const validAllocations = planForm.allocations.filter(a => a.outletId && a.quantity);
    const totalAllocated = validAllocations.reduce((sum, a) => sum + parseFloat(a.quantity || 0), 0);
    if (totalAllocated > parseFloat(planForm.totalQuantity)) {
      setPlanFormError('Total allocated quantity exceeds available quantity');
      return;
    }
    setPlanFormSubmitting(true);
    setPlanFormError(null);
    try {
      await apiClient.createDistributionPlan(orgData.id, {
        productionOrderId: planForm.productionOrderId || undefined,
        itemName: planForm.itemName,
        totalQuantity: parseFloat(planForm.totalQuantity),
        unit: planForm.unit,
        allocations: validAllocations.map(a => ({
          outletId: a.outletId,
          quantity: parseFloat(a.quantity),
        })),
      });
      setShowCreatePlan(false);
      setPlanForm({ productionOrderId: '', itemName: '', totalQuantity: '', unit: '', allocations: [{ outletId: '', quantity: '' }] });
      await loadPlans();
    } catch (err) {
      setPlanFormError(err.message || 'Failed to create distribution plan');
    } finally {
      setPlanFormSubmitting(false);
    }
  };

  // ============================================
  // Distribution Actions
  // ============================================
  const handleDispatch = async (planId, outletId) => {
    setDistActionLoading(`dispatch-${outletId}`);
    try {
      await apiClient.dispatchDistribution(orgData.id, planId, outletId);
      await loadPlanDetail(planId);
      await loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to dispatch');
    } finally {
      setDistActionLoading(null);
    }
  };

  const handleReceive = async (planId, outletId) => {
    const qty = parseFloat(receiveQtyInputs[outletId]);
    if (!qty || qty <= 0) {
      alert('Please enter a valid received quantity');
      return;
    }
    setDistActionLoading(`receive-${outletId}`);
    try {
      await apiClient.receiveDistribution(orgData.id, planId, outletId, { actualReceivedQty: qty });
      setReceiveQtyInputs(prev => { const n = { ...prev }; delete n[outletId]; return n; });
      await loadPlanDetail(planId);
      await loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to receive');
    } finally {
      setDistActionLoading(null);
    }
  };

  // ============================================
  // Allocation row helpers
  // ============================================
  const addAllocationRow = () => {
    setPlanForm(prev => ({
      ...prev,
      allocations: [...prev.allocations, { outletId: '', quantity: '' }],
    }));
  };

  const removeAllocationRow = (index) => {
    setPlanForm(prev => ({
      ...prev,
      allocations: prev.allocations.filter((_, i) => i !== index),
    }));
  };

  const updateAllocation = (index, field, value) => {
    setPlanForm(prev => ({
      ...prev,
      allocations: prev.allocations.map((a, i) => i === index ? { ...a, [field]: value } : a),
    }));
  };

  // ============================================
  // Format date
  // ============================================
  const fmtDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  // ============================================
  // Status filter tabs data
  // ============================================
  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'planned', label: 'Planned' },
    { key: 'in_production', label: 'In Production' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  // ============================================
  // Completed orders for distribution plan linking
  // ============================================
  const completedOrders = orders.filter(o => o.status === 'completed');

  // ============================================
  // RENDER: Loading spinner
  // ============================================
  const renderSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
      <FaSpinner style={{ fontSize: '28px', color: '#16a34a', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  // ============================================
  // RENDER: Error
  // ============================================
  const renderError = (message, onRetry) => (
    <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#dc2626' }}>
      <p style={{ marginBottom: '12px', fontSize: '15px' }}>{message}</p>
      {onRetry && (
        <button style={btnPrimary} onClick={onRetry}>Retry</button>
      )}
    </div>
  );

  // ============================================
  // RENDER: Empty state
  // ============================================
  const renderEmpty = (icon, title, subtitle) => (
    <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>{subtitle}</p>
    </div>
  );

  // ============================================
  // RENDER: Create Production Order Form
  // ============================================
  const renderCreateOrderForm = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          style={{ ...btnSecondary, padding: '8px 12px' }}
          onClick={() => { setShowCreateOrder(false); setOrderFormError(null); }}
        >
          <FaArrowLeft />
        </button>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Create Production Order</h3>
      </div>

      {orderFormError && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
          {orderFormError}
        </div>
      )}

      <form onSubmit={handleCreateOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Central Kitchen *</label>
            <select
              style={selectStyle}
              value={orderForm.centralKitchenId}
              onChange={(e) => setOrderForm(prev => ({ ...prev, centralKitchenId: e.target.value }))}
            >
              <option value="">Select kitchen...</option>
              {centralKitchens.map(ck => (
                <option key={ck.id} value={ck.id}>{ck.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Recipe Name *</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Paneer Tikka Base"
              value={orderForm.recipeName}
              onChange={(e) => setOrderForm(prev => ({ ...prev, recipeName: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Recipe ID (optional)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. RCP-001"
              value={orderForm.recipeId}
              onChange={(e) => setOrderForm(prev => ({ ...prev, recipeId: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Quantity *</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 50"
              value={orderForm.targetQuantity}
              onChange={(e) => setOrderForm(prev => ({ ...prev, targetQuantity: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Unit *</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. kg, pcs, liters"
              value={orderForm.unit}
              onChange={(e) => setOrderForm(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Scheduled Date</label>
            <input
              style={inputStyle}
              type="date"
              value={orderForm.scheduledDate}
              onChange={(e) => setOrderForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Any additional notes..."
            value={orderForm.notes}
            onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            style={{ ...btnPrimary, opacity: orderFormSubmitting ? 0.7 : 1 }}
            disabled={orderFormSubmitting}
          >
            {orderFormSubmitting ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlus />}
            {orderFormSubmitting ? 'Creating...' : 'Create Order'}
          </button>
          <button
            type="button"
            style={btnSecondary}
            onClick={() => { setShowCreateOrder(false); setOrderFormError(null); }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  // ============================================
  // RENDER: Production Order Detail
  // ============================================
  const renderOrderDetail = () => {
    if (orderDetailLoading) return renderSpinner();
    if (orderDetailError) return renderError(orderDetailError, () => loadOrderDetail(selectedOrder?.id || selectedOrder?._id));

    const order = selectedOrder;
    if (!order) return null;

    const orderId = order.id || order._id;
    const kitchenName = centralKitchens.find(ck => ck.id === order.centralKitchenId)?.name || order.centralKitchenName || order.centralKitchenId || '-';

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{ ...btnSecondary, padding: '8px 12px' }}
            onClick={() => { setSelectedOrder(null); setOrderDetailError(null); }}
          >
            <FaArrowLeft />
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Production Order {order.orderNumber || orderId}
          </h3>
          <StatusBadge status={order.status} colorMap={PRODUCTION_STATUS_COLORS} />
        </div>

        {/* Order Info */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order Number</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{order.orderNumber || orderId}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Recipe</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{order.recipeName || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Kitchen</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{kitchenName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Target Quantity</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{order.targetQuantity} {order.unit}</div>
            </div>
            {order.producedQuantity != null && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Produced Quantity</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#16a34a' }}>{order.producedQuantity} {order.unit}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Scheduled Date</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{fmtDate(order.scheduledDate)}</div>
            </div>
            {order.completedDate && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Completed Date</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{fmtDate(order.completedDate)}</div>
              </div>
            )}
            {order.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '14px', color: '#374151' }}>{order.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Warnings */}
        {order.warnings && order.warnings.length > 0 && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef9c3',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #fde68a',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#a16207', margin: '0 0 8px 0' }}>Warnings</h4>
            {order.warnings.map((w, i) => (
              <p key={i} style={{ fontSize: '13px', color: '#92400e', margin: '4px 0' }}>{w}</p>
            ))}
          </div>
        )}

        {/* Ingredients consumed (completed orders) */}
        {order.status === 'completed' && order.ingredientsConsumed && order.ingredientsConsumed.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Ingredients Consumed</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Ingredient</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Qty Used</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Unit</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Previous Stock</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>New Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {order.ingredientsConsumed.map((ing, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', color: '#111827', fontWeight: 500 }}>{ing.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827' }}>{ing.quantityUsed}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{ing.unit}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6b7280' }}>{ing.previousStock ?? '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827', fontWeight: 500 }}>{ing.newStock ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {order.status === 'planned' && (
            <>
              <button
                style={{ ...btnPrimary, opacity: actionLoading === orderId ? 0.7 : 1 }}
                disabled={actionLoading === orderId}
                onClick={() => handleStartProduction(orderId)}
              >
                {actionLoading === orderId ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlay />}
                Start Production
              </button>
              <button
                style={{ ...btnDanger, opacity: actionLoading === orderId ? 0.7 : 1 }}
                disabled={actionLoading === orderId}
                onClick={() => handleCancelOrder(orderId)}
              >
                <FaStop /> Cancel Order
              </button>
            </>
          )}

          {order.status === 'in_production' && !showCompleteModal && (
            <>
              <button
                style={btnPrimary}
                onClick={() => setShowCompleteModal(true)}
              >
                <FaCheck /> Complete Production
              </button>
              <button
                style={{ ...btnDanger, opacity: actionLoading === orderId ? 0.7 : 1 }}
                disabled={actionLoading === orderId}
                onClick={() => handleCancelOrder(orderId)}
              >
                <FaStop /> Cancel Order
              </button>
            </>
          )}

          {order.status === 'in_production' && showCompleteModal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: '4px' }}>Produced Quantity ({order.unit})</label>
                <input
                  style={{ ...inputStyle, width: '160px' }}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={`Target: ${order.targetQuantity}`}
                  value={producedQtyInput}
                  onChange={(e) => setProducedQtyInput(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                style={{ ...btnPrimary, opacity: actionLoading === orderId ? 0.7 : 1 }}
                disabled={actionLoading === orderId}
                onClick={() => handleCompleteProduction(orderId)}
              >
                {actionLoading === orderId ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck />}
                Confirm
              </button>
              <button
                style={btnSecondary}
                onClick={() => { setShowCompleteModal(false); setProducedQtyInput(''); }}
              >
                Cancel
              </button>
            </div>
          )}

          {order.status === 'completed' && (
            <button
              style={btnPrimary}
              onClick={() => {
                setSubTab('distribution');
                setShowCreatePlan(true);
                setPlanForm(prev => ({
                  ...prev,
                  productionOrderId: orderId,
                  itemName: order.recipeName || '',
                  unit: order.unit || '',
                  totalQuantity: String(order.producedQuantity || order.targetQuantity || ''),
                }));
                setSelectedOrder(null);
              }}
            >
              <FaTruck /> Create Distribution Plan
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: Production Orders List
  // ============================================
  const renderOrdersList = () => {
    if (showCreateOrder) return renderCreateOrderForm();
    if (selectedOrder) return renderOrderDetail();

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            <FaIndustry style={{ marginRight: '8px', color: '#16a34a' }} />
            Production Orders
            {ordersTotal > 0 && <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>({ordersTotal})</span>}
          </h3>
          <button style={btnPrimary} onClick={() => setShowCreateOrder(true)}>
            <FaPlus /> Create Production Order
          </button>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: statusFilter === tab.key ? '#16a34a' : '#e5e7eb',
                backgroundColor: statusFilter === tab.key ? '#dcfce7' : '#fff',
                color: statusFilter === tab.key ? '#15803d' : '#6b7280',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {ordersLoading ? renderSpinner() : ordersError ? renderError(ordersError, loadOrders) : orders.length === 0 ? (
          renderEmpty(<FaIndustry />, 'No Production Orders', statusFilter !== 'all' ? 'No orders found with this status' : 'Create your first production order to get started')
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {orders.map(order => {
              const oid = order.id || order._id;
              const kitchenName = centralKitchens.find(ck => ck.id === order.centralKitchenId)?.name || order.centralKitchenName || '-';
              return (
                <div
                  key={oid}
                  onClick={() => loadOrderDetail(oid)}
                  style={{
                    ...cardStyle,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Order #</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{order.orderNumber || oid}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Recipe</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{order.recipeName || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Quantity</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      {order.producedQuantity != null ? `${order.producedQuantity} / ` : ''}{order.targetQuantity} {order.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Kitchen</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{kitchenName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Scheduled</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{fmtDate(order.scheduledDate)}</div>
                  </div>
                  <div>
                    <StatusBadge status={order.status} colorMap={PRODUCTION_STATUS_COLORS} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER: Create Distribution Plan Form
  // ============================================
  const renderCreatePlanForm = () => {
    const totalAllocated = planForm.allocations.reduce((sum, a) => sum + parseFloat(a.quantity || 0), 0);
    const totalQty = parseFloat(planForm.totalQuantity || 0);
    const overAllocated = totalAllocated > totalQty && totalQty > 0;

    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{ ...btnSecondary, padding: '8px 12px' }}
            onClick={() => { setShowCreatePlan(false); setPlanFormError(null); }}
          >
            <FaArrowLeft />
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Create Distribution Plan</h3>
        </div>

        {planFormError && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            {planFormError}
          </div>
        )}

        <form onSubmit={handleCreatePlan}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Production Order (optional)</label>
              <select
                style={selectStyle}
                value={planForm.productionOrderId}
                onChange={(e) => {
                  const selected = completedOrders.find(o => (o.id || o._id) === e.target.value);
                  setPlanForm(prev => ({
                    ...prev,
                    productionOrderId: e.target.value,
                    itemName: selected?.recipeName || prev.itemName,
                    unit: selected?.unit || prev.unit,
                    totalQuantity: selected ? String(selected.producedQuantity || selected.targetQuantity || '') : prev.totalQuantity,
                  }));
                }}
              >
                <option value="">Select completed order...</option>
                {completedOrders.map(o => (
                  <option key={o.id || o._id} value={o.id || o._id}>
                    {o.orderNumber || o.id || o._id} - {o.recipeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Item Name *</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Paneer Tikka Base"
                value={planForm.itemName}
                onChange={(e) => setPlanForm(prev => ({ ...prev, itemName: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Total Quantity *</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 50"
                value={planForm.totalQuantity}
                onChange={(e) => setPlanForm(prev => ({ ...prev, totalQuantity: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Unit *</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. kg, pcs"
                value={planForm.unit}
                onChange={(e) => setPlanForm(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>
          </div>

          {/* Allocations */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Allocations
                {totalQty > 0 && (
                  <span style={{ fontWeight: 400, color: overAllocated ? '#dc2626' : '#6b7280', marginLeft: '8px' }}>
                    ({totalAllocated} / {totalQty} {planForm.unit} allocated)
                  </span>
                )}
              </label>
              <button type="button" style={{ ...btnSecondary, padding: '6px 12px', fontSize: '13px' }} onClick={addAllocationRow}>
                <FaPlus /> Add Outlet
              </button>
            </div>

            {planForm.allocations.map((alloc, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  style={{ ...selectStyle, flex: 2, minWidth: '180px' }}
                  value={alloc.outletId}
                  onChange={(e) => updateAllocation(index, 'outletId', e.target.value)}
                >
                  <option value="">Select outlet...</option>
                  {outletList.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: '100px' }}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Quantity"
                  value={alloc.quantity}
                  onChange={(e) => updateAllocation(index, 'quantity', e.target.value)}
                />
                {planForm.allocations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAllocationRow(index)}
                    style={{
                      padding: '8px',
                      border: 'none',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}

            {overAllocated && (
              <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '8px' }}>
                Total allocated ({totalAllocated}) exceeds available quantity ({totalQty})
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              style={{ ...btnPrimary, opacity: planFormSubmitting || overAllocated ? 0.7 : 1 }}
              disabled={planFormSubmitting || overAllocated}
            >
              {planFormSubmitting ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlus />}
              {planFormSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
            <button
              type="button"
              style={btnSecondary}
              onClick={() => { setShowCreatePlan(false); setPlanFormError(null); }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // ============================================
  // RENDER: Distribution Plan Detail
  // ============================================
  const renderPlanDetail = () => {
    if (planDetailLoading) return renderSpinner();
    if (planDetailError) return renderError(planDetailError, () => loadPlanDetail(selectedPlan?.id || selectedPlan?._id));

    const plan = selectedPlan;
    if (!plan) return null;

    const planId = plan.id || plan._id;
    const allocations = plan.allocations || [];

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{ ...btnSecondary, padding: '8px 12px' }}
            onClick={() => { setSelectedPlan(null); setPlanDetailError(null); }}
          >
            <FaArrowLeft />
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Distribution Plan
          </h3>
          <StatusBadge status={plan.status} colorMap={DISTRIBUTION_STATUS_COLORS} />
        </div>

        {/* Plan Info */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Item Name</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{plan.itemName || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Quantity</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{plan.totalQuantity} {plan.unit}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Allocations</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{allocations.length} outlets</div>
            </div>
            {plan.productionOrderId && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Production Order</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1d4ed8' }}>{plan.productionOrderId}</div>
              </div>
            )}
          </div>
        </div>

        {/* Allocations Table */}
        <div style={{ ...cardStyle }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Allocations</h4>
          {allocations.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No allocations yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Outlet</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Allocated Qty</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Dispatched</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Received</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Actual Received</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc, i) => {
                    const allocOutletId = alloc.outletId;
                    const outletName = outletList.find(o => o.id === allocOutletId)?.name || alloc.outletName || allocOutletId;
                    const allocStatus = alloc.status || 'planned';

                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 12px', color: '#111827', fontWeight: 500 }}>{outletName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827' }}>{alloc.quantity} {plan.unit}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <StatusBadge status={allocStatus} colorMap={ALLOCATION_STATUS_COLORS} />
                        </td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{fmtDate(alloc.dispatchedDate)}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{fmtDate(alloc.receivedDate)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827' }}>
                          {alloc.actualReceivedQty != null ? `${alloc.actualReceivedQty} ${plan.unit}` : '-'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {allocStatus === 'planned' && (
                            <button
                              style={{
                                ...btnPrimary,
                                padding: '6px 14px',
                                fontSize: '13px',
                                opacity: distActionLoading === `dispatch-${allocOutletId}` ? 0.7 : 1,
                              }}
                              disabled={distActionLoading === `dispatch-${allocOutletId}`}
                              onClick={() => handleDispatch(planId, allocOutletId)}
                            >
                              {distActionLoading === `dispatch-${allocOutletId}` ? (
                                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <FaTruck />
                              )}
                              Dispatch
                            </button>
                          )}
                          {allocStatus === 'dispatched' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                              <input
                                style={{ ...inputStyle, width: '100px', textAlign: 'right' }}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Qty"
                                value={receiveQtyInputs[allocOutletId] || ''}
                                onChange={(e) => setReceiveQtyInputs(prev => ({ ...prev, [allocOutletId]: e.target.value }))}
                              />
                              <button
                                style={{
                                  ...btnPrimary,
                                  padding: '6px 14px',
                                  fontSize: '13px',
                                  opacity: distActionLoading === `receive-${allocOutletId}` ? 0.7 : 1,
                                }}
                                disabled={distActionLoading === `receive-${allocOutletId}`}
                                onClick={() => handleReceive(planId, allocOutletId)}
                              >
                                {distActionLoading === `receive-${allocOutletId}` ? (
                                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <FaCheck />
                                )}
                                Receive
                              </button>
                            </div>
                          )}
                          {allocStatus === 'received' && (
                            <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 500 }}>
                              <FaCheck style={{ marginRight: '4px' }} /> Done
                            </span>
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
      </div>
    );
  };

  // ============================================
  // RENDER: Distribution Plans List
  // ============================================
  const renderPlansList = () => {
    if (showCreatePlan) return renderCreatePlanForm();
    if (selectedPlan) return renderPlanDetail();

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            <FaTruck style={{ marginRight: '8px', color: '#16a34a' }} />
            Distribution Plans
            {plansTotal > 0 && <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>({plansTotal})</span>}
          </h3>
          <button style={btnPrimary} onClick={() => setShowCreatePlan(true)}>
            <FaPlus /> Create Distribution Plan
          </button>
        </div>

        {plansLoading ? renderSpinner() : plansError ? renderError(plansError, loadPlans) : plans.length === 0 ? (
          renderEmpty(<FaTruck />, 'No Distribution Plans', 'Create a distribution plan to allocate production to outlets')
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {plans.map(plan => {
              const pid = plan.id || plan._id;
              return (
                <div
                  key={pid}
                  onClick={() => loadPlanDetail(pid)}
                  style={{
                    ...cardStyle,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Item</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{plan.itemName || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Quantity</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{plan.totalQuantity} {plan.unit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Allocations</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{plan.allocations?.length || 0} outlets</div>
                  </div>
                  <div>
                    <StatusBadge status={plan.status} colorMap={DISTRIBUTION_STATUS_COLORS} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER: Kitchen Dashboard
  // ============================================
  const renderDashboard = () => {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            <FaClipboardList style={{ marginRight: '8px', color: '#16a34a' }} />
            Kitchen Dashboard
          </h3>
          <select
            style={{ ...selectStyle, width: '280px' }}
            value={dashboardKitchenId}
            onChange={(e) => setDashboardKitchenId(e.target.value)}
          >
            <option value="">Select a kitchen...</option>
            {centralKitchens.map(ck => (
              <option key={ck.id} value={ck.id}>{ck.name}</option>
            ))}
          </select>
        </div>

        {!dashboardKitchenId ? (
          renderEmpty(<FaIndustry />, 'Select a Kitchen', 'Choose a central kitchen to view its dashboard')
        ) : dashboardLoading ? (
          renderSpinner()
        ) : dashboardError ? (
          renderError(dashboardError, () => loadDashboard(dashboardKitchenId))
        ) : !dashboardData ? (
          renderEmpty(<FaClipboardList />, 'No Data', 'No dashboard data available for this kitchen')
        ) : (
          <div>
            {/* Today's orders by status */}
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                <FaCalendarAlt style={{ marginRight: '8px', color: '#6b7280' }} />
                Today&apos;s Orders
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {Object.entries(dashboardData.todayOrders || {}).map(([status, count]) => {
                  const colors = PRODUCTION_STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#6b7280', label: status };
                  return (
                    <div
                      key={status}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: colors.bg,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '28px', fontWeight: 700, color: colors.text }}>{count}</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: colors.text, marginTop: '4px' }}>{colors.label}</div>
                    </div>
                  );
                })}
                {(!dashboardData.todayOrders || Object.keys(dashboardData.todayOrders).length === 0) && (
                  <p style={{ color: '#6b7280', fontSize: '14px', gridColumn: '1 / -1' }}>No orders today</p>
                )}
              </div>
            </div>

            {/* Ingredient Requirements */}
            {dashboardData.ingredientRequirements && dashboardData.ingredientRequirements.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                  <FaBoxOpen style={{ marginRight: '8px', color: '#6b7280' }} />
                  Ingredient Requirements
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Ingredient</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Required</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Available</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Unit</th>
                        <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ingredientRequirements.map((ing, i) => {
                        const sufficient = (ing.available || 0) >= (ing.required || 0);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 12px', color: '#111827', fontWeight: 500 }}>{ing.name}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827' }}>{ing.required}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: sufficient ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                              {ing.available}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>{ing.unit}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: sufficient ? '#dcfce7' : '#fee2e2',
                                color: sufficient ? '#15803d' : '#dc2626',
                              }}>
                                {sufficient ? 'Sufficient' : 'Low Stock'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Completions (7 days) */}
            {dashboardData.recentCompletions && dashboardData.recentCompletions.length > 0 && (
              <div style={cardStyle}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                  <FaCheck style={{ marginRight: '8px', color: '#16a34a' }} />
                  Recent Completions (7 days)
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {dashboardData.recentCompletions.map((order, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {order.recipeName || order.orderNumber || '-'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {fmtDate(order.completedDate)}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#16a34a' }}>
                        {order.producedQuantity} {order.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!dashboardData.recentCompletions || dashboardData.recentCompletions.length === 0) &&
             (!dashboardData.ingredientRequirements || dashboardData.ingredientRequirements.length === 0) &&
             (!dashboardData.todayOrders || Object.keys(dashboardData.todayOrders).length === 0) && (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No activity data available for this kitchen yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div>
      {/* CSS keyframe for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Sub-tab navigation */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px',
        width: 'fit-content',
      }}>
        {[
          { key: 'production', label: 'Production Orders', icon: <FaIndustry /> },
          { key: 'distribution', label: 'Distribution Plans', icon: <FaTruck /> },
          { key: 'dashboard', label: 'Kitchen Dashboard', icon: <FaClipboardList /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setSubTab(tab.key);
              setSelectedOrder(null);
              setSelectedPlan(null);
              setShowCreateOrder(false);
              setShowCreatePlan(false);
              setShowCompleteModal(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: subTab === tab.key ? '#fff' : 'transparent',
              color: subTab === tab.key ? '#16a34a' : '#6b7280',
              boxShadow: subTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.icon}
            <span style={{ display: 'inline' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {subTab === 'production' && renderOrdersList()}
      {subTab === 'distribution' && renderPlansList()}
      {subTab === 'dashboard' && renderDashboard()}
    </div>
  );
};

export default CentralKitchenTab;
