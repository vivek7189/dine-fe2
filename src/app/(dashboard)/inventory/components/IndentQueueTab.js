'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import apiClient from '../../../../lib/api';
import { FaCheck, FaTimes, FaTruck, FaBoxes, FaWarehouse, FaSpinner, FaChevronDown, FaChevronRight, FaClipboardList } from 'react-icons/fa';

const SUB_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'allIndents', label: 'All Indents' },
  { key: 'stock', label: 'Stock' },
];

const STATUS_FILTERS = ['all', 'requested', 'approved', 'picking', 'dispatched', 'received', 'rejected'];

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

const emptyState = (msg) => (
  <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
    <FaBoxes size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
    <div style={{ fontSize: 14 }}>{msg}</div>
  </div>
);

const sectionHeader = (title, extra) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>
    {extra && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{extra}</div>}
  </div>
);

const priorityBadge = (priority) => {
  const map = {
    urgent: ['#fef2f2', '#dc2626'],
    high: ['#fef2f2', '#b91c1c'],
    medium: ['#fffbeb', '#d97706'],
    low: ['#f0fdf4', '#059669'],
  };
  const [bg, color] = map[priority] || map.low;
  return <span style={badge(bg, color)}>{priority}</span>;
};

const statusColor = (s) => {
  const map = {
    requested: { bg: '#dbeafe', text: '#2563eb' },
    approved: { bg: '#d1fae5', text: '#059669' },
    picking: { bg: '#fef3c7', text: '#d97706' },
    dispatched: { bg: '#ede9fe', text: '#7c3aed' },
    received: { bg: '#d1fae5', text: '#065f46' },
    rejected: { bg: '#fef2f2', text: '#dc2626' },
    cancelled: { bg: '#f3f4f6', text: '#6b7280' },
  };
  return map[s] || { bg: '#f3f4f6', text: '#6b7280' };
};

const renderStatusBadge = (status) => {
  const c = statusColor(status);
  return <span style={badge(c.bg, c.text)}>{status}</span>;
};

const stockStatusBadge = (qty) => {
  if (qty <= 0) return <span style={badge('#fef2f2', '#dc2626')}>Out of Stock</span>;
  if (qty <= 10) return <span style={badge('#fef3c7', '#d97706')}>Low</span>;
  return <span style={badge('#d1fae5', '#059669')}>In Stock</span>;
};

const formatDate = (d) => {
  if (!d) return '-';
  const date = d._seconds ? new Date(d._seconds * 1000) : new Date(d);
  return date.toLocaleDateString();
};

export default function IndentQueueTab({ currentRestaurant, isMobile, permissions = { read: true, add: true, update: true, delete: true } }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [orgSettings, setOrgSettings] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Pending tab state
  const [pendingIndents, setPendingIndents] = useState([]);
  const [pendingSummary, setPendingSummary] = useState({ requested: 0, approved: 0, picking: 0, totalItemsPending: 0 });
  const [expandedRows, setExpandedRows] = useState({});

  // All Indents tab state
  const [allIndents, setAllIndents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [allExpandedRows, setAllExpandedRows] = useState({});

  // Stock tab state
  const [stock, setStock] = useState([]);

  // Inline editing state
  const [approveEditing, setApproveEditing] = useState(null); // indentId being edited for approval
  const [approveItems, setApproveItems] = useState({}); // { itemId: approvedQty }
  const [rejectEditing, setRejectEditing] = useState(null); // indentId being edited for rejection
  const [rejectReason, setRejectReason] = useState('');
  const [dispatchEditing, setDispatchEditing] = useState(null); // indentId being edited for dispatch
  const [dispatchItems, setDispatchItems] = useState({}); // { itemId: pickedQty }
  const [actionLoading, setActionLoading] = useState({});

  const warehouseId = currentRestaurant?.id;

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
        console.error('Error loading org for indent queue:', e);
        setOrgSettings({});
      }
    };
    loadOrg();
  }, [currentRestaurant?.organizationId]);

  const hasWarehouse = orgSettings?.centralWarehouse && orgId;

  // Load pending indents
  const loadPending = useCallback(async () => {
    if (!orgId || !warehouseId) return;
    try {
      setLoading(true);
      const res = await apiClient.getWarehousePending(orgId, warehouseId);
      if (res.success) {
        setPendingIndents(res.indents || []);
        setPendingSummary(res.summary || { requested: 0, approved: 0, picking: 0, totalItemsPending: 0 });
      }
    } catch (e) {
      console.error('Error loading pending indents:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, warehouseId]);

  // Load all indents
  const loadAllIndents = useCallback(async () => {
    if (!orgId || !warehouseId) return;
    try {
      setLoading(true);
      const res = await apiClient.getIndents(orgId, { warehouseId });
      if (res.success) {
        setAllIndents(res.indents || []);
      }
    } catch (e) {
      console.error('Error loading all indents:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, warehouseId]);

  // Load stock
  const loadStock = useCallback(async () => {
    if (!orgId || !warehouseId) return;
    try {
      setLoading(true);
      const res = await apiClient.getWarehouseStock(orgId, warehouseId);
      if (res.success) {
        setStock(res.stock || []);
      }
    } catch (e) {
      console.error('Error loading warehouse stock:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, warehouseId]);

  // Load data when tab changes
  useEffect(() => {
    if (!hasWarehouse) return;
    if (activeTab === 'pending') loadPending();
    else if (activeTab === 'allIndents') loadAllIndents();
    else if (activeTab === 'stock') loadStock();
  }, [activeTab, hasWarehouse, loadPending, loadAllIndents, loadStock]);

  // --- Action handlers ---

  const handleApprove = async (indent) => {
    const items = indent.items.map(i => ({
      inventoryItemId: i.inventoryItemId,
      approvedQty: Number(approveItems[i.inventoryItemId] ?? i.requestedQty),
    }));
    try {
      setActionLoading(prev => ({ ...prev, [indent.id]: true }));
      const res = await apiClient.approveIndent(orgId, indent.id, { items });
      if (res.success) {
        showToast(`Indent ${indent.indentNumber || indent.id} approved`);
        setApproveEditing(null);
        setApproveItems({});
        loadPending();
      }
    } catch (e) {
      showToast(e.message || 'Failed to approve indent', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [indent.id]: false }));
    }
  };

  const handleReject = async (indent) => {
    if (!rejectReason.trim()) return showToast('Please provide a reason for rejection', 'error');
    try {
      setActionLoading(prev => ({ ...prev, [indent.id]: true }));
      const res = await apiClient.rejectIndent(orgId, indent.id, { reason: rejectReason.trim() });
      if (res.success) {
        showToast(`Indent ${indent.indentNumber || indent.id} rejected`);
        setRejectEditing(null);
        setRejectReason('');
        loadPending();
      }
    } catch (e) {
      showToast(e.message || 'Failed to reject indent', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [indent.id]: false }));
    }
  };

  const handlePick = async (indent) => {
    try {
      setActionLoading(prev => ({ ...prev, [indent.id]: true }));
      const res = await apiClient.pickIndent(orgId, indent.id);
      if (res.success) {
        showToast(`Indent ${indent.indentNumber || indent.id} marked as picking`);
        loadPending();
      }
    } catch (e) {
      showToast(e.message || 'Failed to start picking', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [indent.id]: false }));
    }
  };

  const handleDispatch = async (indent) => {
    const items = indent.items.map(i => ({
      inventoryItemId: i.inventoryItemId,
      pickedQty: Number(dispatchItems[i.inventoryItemId] ?? i.approvedQty ?? i.requestedQty),
    }));
    try {
      setActionLoading(prev => ({ ...prev, [indent.id]: true }));
      const res = await apiClient.dispatchIndent(orgId, indent.id, { items });
      if (res.success) {
        showToast(`Indent ${indent.indentNumber || indent.id} dispatched`);
        setDispatchEditing(null);
        setDispatchItems({});
        loadPending();
      }
    } catch (e) {
      showToast(e.message || 'Failed to dispatch indent', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [indent.id]: false }));
    }
  };

  const toggleRow = (id, setter) => {
    setter(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tableWrap = { width: '100%', overflowX: 'auto' };
  const table = { width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 600 : 'auto' };

  // --- Not part of org ---
  if (!currentRestaurant?.organizationId) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
        <FaWarehouse size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14 }}>Not part of an organization</div>
      </div>
    );
  }

  // --- Central warehouse not enabled ---
  if (orgSettings && !orgSettings.centralWarehouse) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
        <FaWarehouse size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <div style={{ fontSize: 14 }}>Central warehouse not enabled</div>
      </div>
    );
  }

  // --- Loading org ---
  if (!orgSettings) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
        <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 8, fontSize: 13 }}>Loading...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- Item details sub-table ---
  const renderItemDetails = (items) => (
    <tr>
      <td colSpan={7} style={{ padding: 0 }}>
        <div style={{ background: '#f9fafb', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, fontSize: 11, padding: '6px 10px' }}>Item Name</th>
                <th style={{ ...th, fontSize: 11, padding: '6px 10px' }}>Requested</th>
                <th style={{ ...th, fontSize: 11, padding: '6px 10px' }}>Approved</th>
                <th style={{ ...th, fontSize: 11, padding: '6px 10px' }}>Picked</th>
                <th style={{ ...th, fontSize: 11, padding: '6px 10px' }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item, idx) => (
                <tr key={item.inventoryItemId || idx}>
                  <td style={{ ...td, fontSize: 12, padding: '6px 10px', fontWeight: 500 }}>{item.inventoryItemName || item.name || '-'}</td>
                  <td style={{ ...td, fontSize: 12, padding: '6px 10px' }}>{item.requestedQty ?? '-'}</td>
                  <td style={{ ...td, fontSize: 12, padding: '6px 10px' }}>{item.approvedQty ?? '-'}</td>
                  <td style={{ ...td, fontSize: 12, padding: '6px 10px' }}>{item.pickedQty ?? '-'}</td>
                  <td style={{ ...td, fontSize: 12, padding: '6px 10px' }}>{item.unit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );

  // --- Pending Tab ---
  const renderPending = () => (
    <div>
      {sectionHeader('Pending Indents')}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Pending', value: pendingSummary.totalItemsPending || 0, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Awaiting Approval', value: pendingSummary.requested || 0, color: '#d97706', bg: '#fef3c7' },
          { label: 'Picking', value: pendingSummary.picking || 0, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Dispatched', value: pendingSummary.dispatched || 0, color: '#059669', bg: '#d1fae5' },
        ].map((card, i) => (
          <div key={i} style={{
            padding: '14px 16px', borderRadius: 10, background: card.bg,
            border: `1px solid ${card.color}20`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: card.color, textTransform: 'uppercase', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading pending indents...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : pendingIndents.length === 0 ? (
        emptyState('No pending indent requests')
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...th, width: 30 }}></th>
                <th style={th}>Indent #</th>
                <th style={th}>From</th>
                <th style={th}>Items</th>
                <th style={th}>Priority</th>
                <th style={th}>Status</th>
                <th style={th}>Date</th>
                {permissions.update !== false && <th style={th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pendingIndents.map(ind => {
                const isExpanded = expandedRows[ind.id];
                const isApproving = approveEditing === ind.id;
                const isRejecting = rejectEditing === ind.id;
                const isDispatching = dispatchEditing === ind.id;
                const isLoading = actionLoading[ind.id];

                return (
                  <Fragment key={ind.id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => toggleRow(ind.id, setExpandedRows)}>
                      <td style={td}>
                        {isExpanded ? <FaChevronDown size={10} color="#9ca3af" /> : <FaChevronRight size={10} color="#9ca3af" />}
                      </td>
                      <td style={{ ...td, fontWeight: 600 }}>{ind.indentNumber || ind.id}</td>
                      <td style={td}>{ind.outletName || ind.requestingOutletName || '-'}</td>
                      <td style={td}>{ind.items?.length || 0}</td>
                      <td style={td}>{priorityBadge(ind.priority || 'medium')}</td>
                      <td style={td}>{renderStatusBadge(ind.status)}</td>
                      <td style={td}>{formatDate(ind.createdAt)}</td>
                      {permissions.update !== false && (
                        <td style={td} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {ind.status === 'requested' && !isApproving && !isRejecting && (
                              <>
                                <button
                                  style={btnSmall('#d1fae5', '#065f46')}
                                  onClick={() => {
                                    setApproveEditing(ind.id);
                                    setRejectEditing(null);
                                    setDispatchEditing(null);
                                    const initial = {};
                                    (ind.items || []).forEach(i => { initial[i.inventoryItemId] = i.requestedQty; });
                                    setApproveItems(initial);
                                  }}
                                >
                                  <FaCheck size={10} /> Approve
                                </button>
                                <button
                                  style={btnSmall('#fef2f2', '#991b1b')}
                                  onClick={() => {
                                    setRejectEditing(ind.id);
                                    setApproveEditing(null);
                                    setDispatchEditing(null);
                                    setRejectReason('');
                                  }}
                                >
                                  <FaTimes size={10} /> Reject
                                </button>
                              </>
                            )}
                            {ind.status === 'approved' && !isDispatching && (
                              <>
                                <button
                                  style={btnSmall('#fef3c7', '#92400e')}
                                  onClick={() => handlePick(ind)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaClipboardList size={10} />}
                                  {' '}Pick
                                </button>
                                <button
                                  style={btnSmall('#ede9fe', '#5b21b6')}
                                  onClick={() => {
                                    setDispatchEditing(ind.id);
                                    setApproveEditing(null);
                                    setRejectEditing(null);
                                    const initial = {};
                                    (ind.items || []).forEach(i => { initial[i.inventoryItemId] = i.approvedQty ?? i.requestedQty; });
                                    setDispatchItems(initial);
                                  }}
                                >
                                  <FaTruck size={10} /> Dispatch
                                </button>
                              </>
                            )}
                            {ind.status === 'picking' && !isDispatching && (
                              <button
                                style={btnSmall('#ede9fe', '#5b21b6')}
                                onClick={() => {
                                  setDispatchEditing(ind.id);
                                  setApproveEditing(null);
                                  setRejectEditing(null);
                                  const initial = {};
                                  (ind.items || []).forEach(i => { initial[i.inventoryItemId] = i.approvedQty ?? i.requestedQty; });
                                  setDispatchItems(initial);
                                }}
                              >
                                <FaTruck size={10} /> Dispatch
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Inline approve editor */}
                    {isApproving && (
                      <tr>
                        <td colSpan={permissions.update !== false ? 8 : 7} style={{ padding: 0 }}>
                          <div style={{ background: '#f0fdf4', padding: '14px 16px', borderBottom: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 10 }}>Set approved quantities:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                              {(ind.items || []).map(item => (
                                <div key={item.inventoryItemId} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 13, fontWeight: 500, minWidth: 150 }}>{item.inventoryItemName || item.name}</span>
                                  <span style={{ fontSize: 12, color: '#6b7280' }}>Requested: {item.requestedQty} {item.unit}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={approveItems[item.inventoryItemId] ?? ''}
                                    onChange={e => setApproveItems(prev => ({ ...prev, [item.inventoryItemId]: e.target.value }))}
                                    style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                                  />
                                  <span style={{ fontSize: 12, color: '#6b7280' }}>{item.unit}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                style={{ ...btnPrimary, opacity: isLoading ? 0.6 : 1 }}
                                onClick={() => handleApprove(ind)}
                                disabled={isLoading}
                              >
                                {isLoading ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />}
                                {' '}Confirm Approval
                              </button>
                              <button style={btnSmall()} onClick={() => { setApproveEditing(null); setApproveItems({}); }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Inline reject editor */}
                    {isRejecting && (
                      <tr>
                        <td colSpan={permissions.update !== false ? 8 : 7} style={{ padding: 0 }}>
                          <div style={{ background: '#fef2f2', padding: '14px 16px', borderBottom: '1px solid #fecaca' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 10 }}>Reason for rejection:</div>
                            <input
                              type="text"
                              placeholder="Enter reason..."
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              style={{ width: '100%', maxWidth: 400, padding: '8px 12px', borderRadius: 6, border: '1px solid #fca5a5', fontSize: 13, marginBottom: 12 }}
                              autoFocus
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                style={{ ...btnSmall('#dc2626', '#fff'), padding: '6px 14px', fontWeight: 600, opacity: isLoading ? 0.6 : 1 }}
                                onClick={() => handleReject(ind)}
                                disabled={isLoading}
                              >
                                {isLoading ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTimes size={10} />}
                                {' '}Confirm Rejection
                              </button>
                              <button style={btnSmall()} onClick={() => { setRejectEditing(null); setRejectReason(''); }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Inline dispatch editor */}
                    {isDispatching && (
                      <tr>
                        <td colSpan={permissions.update !== false ? 8 : 7} style={{ padding: 0 }}>
                          <div style={{ background: '#ede9fe', padding: '14px 16px', borderBottom: '1px solid #c4b5fd' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 10 }}>Set picked/dispatch quantities:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                              {(ind.items || []).map(item => (
                                <div key={item.inventoryItemId} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 13, fontWeight: 500, minWidth: 150 }}>{item.inventoryItemName || item.name}</span>
                                  <span style={{ fontSize: 12, color: '#6b7280' }}>Approved: {item.approvedQty ?? item.requestedQty} {item.unit}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={dispatchItems[item.inventoryItemId] ?? ''}
                                    onChange={e => setDispatchItems(prev => ({ ...prev, [item.inventoryItemId]: e.target.value }))}
                                    style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                                  />
                                  <span style={{ fontSize: 12, color: '#6b7280' }}>{item.unit}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                style={{ ...btnSmall('#7c3aed', '#fff'), padding: '6px 14px', fontWeight: 600, opacity: isLoading ? 0.6 : 1 }}
                                onClick={() => handleDispatch(ind)}
                                disabled={isLoading}
                              >
                                {isLoading ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTruck size={12} />}
                                {' '}Confirm Dispatch
                              </button>
                              <button style={btnSmall()} onClick={() => { setDispatchEditing(null); setDispatchItems({}); }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expanded item details */}
                    {isExpanded && !isApproving && !isRejecting && !isDispatching && renderItemDetails(ind.items)}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // --- All Indents Tab ---
  const filteredIndents = statusFilter === 'all' ? allIndents : allIndents.filter(ind => ind.status === statusFilter);

  const renderAllIndents = () => (
    <div>
      {sectionHeader('All Indents')}

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            style={pillStyle(statusFilter === f)}
            onClick={() => setStatusFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading indents...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredIndents.length === 0 ? (
        emptyState(statusFilter === 'all' ? 'No indents found' : `No ${statusFilter} indents`)
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...th, width: 30 }}></th>
                <th style={th}>Indent #</th>
                <th style={th}>From</th>
                <th style={th}>Items</th>
                <th style={th}>Priority</th>
                <th style={th}>Status</th>
                <th style={th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndents.map(ind => {
                const isExpanded = allExpandedRows[ind.id];
                return (
                  <Fragment key={ind.id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => toggleRow(ind.id, setAllExpandedRows)}>
                      <td style={td}>
                        {isExpanded ? <FaChevronDown size={10} color="#9ca3af" /> : <FaChevronRight size={10} color="#9ca3af" />}
                      </td>
                      <td style={{ ...td, fontWeight: 600 }}>{ind.indentNumber || ind.id}</td>
                      <td style={td}>{ind.outletName || ind.requestingOutletName || '-'}</td>
                      <td style={td}>{ind.items?.length || 0}</td>
                      <td style={td}>{priorityBadge(ind.priority || 'medium')}</td>
                      <td style={td}>{renderStatusBadge(ind.status)}</td>
                      <td style={td}>{formatDate(ind.createdAt)}</td>
                    </tr>
                    {isExpanded && renderItemDetails(ind.items)}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // --- Stock Tab ---
  const renderStock = () => (
    <div>
      {sectionHeader('Warehouse Stock Levels')}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading stock...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : stock.length === 0 ? (
        emptyState('No stock data available')
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Item Name</th>
                <th style={th}>Current Stock</th>
                <th style={th}>Unit</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item, idx) => (
                <tr key={item.id || item.inventoryItemId || idx}>
                  <td style={{ ...td, fontWeight: 600 }}>{item.inventoryItemName || item.name || '-'}</td>
                  <td style={td}>{item.currentStock ?? 0}</td>
                  <td style={td}>{item.unit || '-'}</td>
                  <td style={td}>{stockStatusBadge(item.currentStock ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

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
            {t.label}
          </button>
        ))}
      </div>

      {/* Active sub-tab content */}
      <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 12 : 20, border: '1px solid #e5e7eb' }}>
        {activeTab === 'pending' && renderPending()}
        {activeTab === 'allIndents' && renderAllIndents()}
        {activeTab === 'stock' && renderStock()}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
