'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';
import { FaPlus, FaEnvelope, FaMicrophone, FaStop, FaCheck, FaTimes, FaArrowRight, FaTruck, FaFileInvoice, FaExchangeAlt, FaUndoAlt, FaClipboardCheck, FaBoxes, FaWarehouse, FaIndustry, FaSpinner } from 'react-icons/fa';

const BASE_SUB_TABS = [
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'orders', label: 'Purchase Orders' },
  { key: 'requisitions', label: 'Requisitions' },
  { key: 'grn', label: 'Goods Receipt' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'returns', label: 'Returns' },
  { key: 'transfers', label: 'Transfers' },
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

const sectionHeader = (title, buttonLabel, onClick, extra, canAdd = true) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {extra}
      {canAdd && <button style={btnPrimary} onClick={onClick}><FaPlus size={12} />{buttonLabel}</button>}
    </div>
  </div>
);

const priorityBadge = (priority) => {
  const map = { high: ['#fef2f2', '#dc2626'], medium: ['#fffbeb', '#d97706'], low: ['#f0fdf4', '#059669'] };
  const [bg, color] = map[priority] || map.low;
  return <span style={badge(bg, color)}>{priority}</span>;
};

const statusBadge = (status, colorFn) => {
  const c = colorFn ? colorFn(status) : '#6b7280';
  const color = typeof c === 'string' ? c : (c.text || '#374151');
  const bg = typeof c === 'string' ? `${c}18` : (c.bg || '#f3f4f6');
  return <span style={badge(bg, color)}>{status}</span>;
};

const invoiceStatusColor = (s) => {
  const map = { matched: { bg: '#dbeafe', text: '#1d4ed8' }, unmatched: { bg: '#fef3c7', text: '#92400e' }, paid: { bg: '#d1fae5', text: '#065f46' } };
  return map[s] || { bg: '#f3f4f6', text: '#374151' };
};

const returnTypeColor = (t) => {
  const map = { damaged: { bg: '#fef2f2', text: '#991b1b' }, expired: { bg: '#fef3c7', text: '#92400e' }, wrong: { bg: '#ede9fe', text: '#5b21b6' } };
  return map[t] || { bg: '#f3f4f6', text: '#374151' };
};

export default function ProcurementTab({
  procurementSubTab, setProcurementSubTab,
  suppliers = [], purchaseOrders = [], grns = [], purchaseRequisitions = [],
  supplierInvoices = [], supplierReturns = [], stockTransfers = [],
  supplierPerformance = {},
  isMobile, formatCurrency,
  setShowAddSupplierModal, setShowAddPurchaseOrderModal, setShowAddGRNModal,
  setShowAddRequisitionModal, setShowAddInvoiceModal, setShowAddReturnModal, setShowAddTransferModal,
  handleDeleteSupplier, handleUpdateOrderStatus, handleEmailPurchaseOrder,
  getOrderStatusColor,
  startVoiceListeningPO, isListeningVoice, voiceTranscript, processingVoice, voiceError,
  smartSuggestions, loadingSuggestions,
  selectedPOForGRN, setSelectedPOForGRN,
  permissions = { read: true, add: true, update: true, delete: true },
  currentRestaurant = null,
}) {
  // === Enterprise: Org detection + indent/delivery state ===
  const [orgSettings, setOrgSettings] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [indents, setIndents] = useState([]);
  const [indentsLoading, setIndentsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showCreateIndent, setShowCreateIndent] = useState(false);
  const [indentForm, setIndentForm] = useState({ warehouseId: '', priority: 'medium', items: [{ name: '', quantity: '', unit: 'kg' }] });
  const [indentSubmitting, setIndentSubmitting] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState({});
  const [toast, setToast] = useState(null);

  // Detect org membership from currentRestaurant
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
          // Extract warehouses from outlets
          const wh = (res.outlets?.warehouses || []);
          setWarehouses(wh);
        }
      } catch (e) {
        console.error('Error loading org for procurement:', e);
      }
    };
    loadOrg();
  }, [currentRestaurant?.organizationId]);

  const hasWarehouse = orgSettings?.centralWarehouse && orgId;
  const hasKitchen = orgSettings?.centralKitchen && orgId;

  // Load indents for this outlet
  const loadIndents = useCallback(async () => {
    if (!orgId || !currentRestaurant?.id) return;
    try {
      setIndentsLoading(true);
      const res = await apiClient.getIndents(orgId, { requestingOutletId: currentRestaurant.id });
      if (res.success) setIndents(res.indents || []);
    } catch (e) {
      console.error('Error loading indents:', e);
    } finally {
      setIndentsLoading(false);
    }
  }, [orgId, currentRestaurant?.id]);

  // Load distribution plans with allocations for this outlet
  const loadDeliveries = useCallback(async () => {
    if (!orgId || !currentRestaurant?.id) return;
    try {
      setDeliveriesLoading(true);
      const res = await apiClient.getDistributionPlans(orgId, {});
      if (res.success) {
        // Filter plans that have allocations for this outlet
        const myDeliveries = (res.distributionPlans || []).filter(plan =>
          plan.allocations?.some(a => a.outletId === currentRestaurant.id)
        ).map(plan => ({
          ...plan,
          myAllocation: plan.allocations.find(a => a.outletId === currentRestaurant.id)
        }));
        setDeliveries(myDeliveries);
      }
    } catch (e) {
      console.error('Error loading deliveries:', e);
    } finally {
      setDeliveriesLoading(false);
    }
  }, [orgId, currentRestaurant?.id]);

  // Load data when sub-tab changes
  useEffect(() => {
    if (procurementSubTab === 'indents' && hasWarehouse) loadIndents();
    if (procurementSubTab === 'deliveries' && hasKitchen) loadDeliveries();
  }, [procurementSubTab, hasWarehouse, hasKitchen, loadIndents, loadDeliveries]);

  // Load warehouse stock when creating indent
  useEffect(() => {
    if (!showCreateIndent || !indentForm.warehouseId || !orgId) return;
    const load = async () => {
      try {
        const res = await apiClient.getWarehouseStock(orgId, indentForm.warehouseId);
        if (res.success) setWarehouseStock(res.inventory || []);
      } catch (e) {
        console.error('Error loading warehouse stock:', e);
      }
    };
    load();
  }, [showCreateIndent, indentForm.warehouseId, orgId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Indent handlers
  const handleCreateIndent = async () => {
    if (!indentForm.warehouseId) return showToast('Select a warehouse', 'error');
    const validItems = indentForm.items.filter(i => i.name?.trim() && Number(i.quantity) > 0);
    if (!validItems.length) return showToast('Add at least one item with quantity', 'error');
    try {
      setIndentSubmitting(true);
      const res = await apiClient.createIndent(orgId, {
        requestingOutletId: currentRestaurant.id,
        warehouseId: indentForm.warehouseId,
        priority: indentForm.priority,
        items: validItems.map(i => ({
          inventoryItemName: i.name.trim(),
          inventoryItemId: i.inventoryItemId || null,
          requestedQty: Number(i.quantity),
          unit: i.unit || 'kg',
        })),
      });
      if (res.success) {
        showToast(`Indent ${res.indent?.indentNumber || ''} created`);
        setShowCreateIndent(false);
        setIndentForm({ warehouseId: '', priority: 'medium', items: [{ name: '', quantity: '', unit: 'kg' }] });
        loadIndents();
      }
    } catch (e) {
      showToast(e.message || 'Failed to create indent', 'error');
    } finally {
      setIndentSubmitting(false);
    }
  };

  const handleReceiveIndent = async (indent) => {
    try {
      setReceiveLoading(prev => ({ ...prev, [indent.id]: true }));
      const items = indent.items.map(i => ({
        inventoryItemId: i.inventoryItemId,
        inventoryItemName: i.inventoryItemName,
        receivedQty: i.pickedQty || i.approvedQty || i.requestedQty,
        unit: i.unit,
      }));
      const res = await apiClient.receiveIndent(orgId, indent.id, { items });
      if (res.success) {
        showToast(`Indent ${indent.indentNumber} received — stock updated`);
        loadIndents();
      }
    } catch (e) {
      showToast(e.message || 'Failed to receive indent', 'error');
    } finally {
      setReceiveLoading(prev => ({ ...prev, [indent.id]: false }));
    }
  };

  const handleCancelIndent = async (indent) => {
    if (!confirm(`Cancel indent ${indent.indentNumber}?`)) return;
    try {
      const res = await apiClient.cancelIndent(orgId, indent.id);
      if (res.success) {
        showToast(`Indent ${indent.indentNumber} cancelled`);
        loadIndents();
      }
    } catch (e) {
      showToast(e.message || 'Failed to cancel indent', 'error');
    }
  };

  const handleReceiveDelivery = async (plan) => {
    try {
      setReceiveLoading(prev => ({ ...prev, [`del_${plan.id}`]: true }));
      const alloc = plan.myAllocation;
      const res = await apiClient.receiveDistribution(orgId, plan.id, currentRestaurant.id, {
        actualReceivedQty: alloc.quantity,
      });
      if (res.success) {
        showToast(`${plan.itemName} received — stock updated`);
        loadDeliveries();
      }
    } catch (e) {
      showToast(e.message || 'Failed to receive delivery', 'error');
    } finally {
      setReceiveLoading(prev => ({ ...prev, [`del_${plan.id}`]: false }));
    }
  };

  const indentStatusColor = (s) => {
    const map = {
      requested: '#d97706', approved: '#2563eb', picking: '#7c3aed',
      dispatched: '#059669', in_transit: '#0891b2', received: '#16a34a',
      rejected: '#dc2626', cancelled: '#6b7280',
    };
    return map[s] || '#6b7280';
  };

  const tableWrap = { width: '100%', overflowX: 'auto' };
  const table = { width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 600 : 'auto' };

  const statusActions = (order) => {
    const s = order.status;
    const btns = [];
    if (s === 'pending') btns.push({ label: 'Approve', next: 'approved', icon: <FaCheck size={10} />, bg: '#d1fae5', color: '#065f46' });
    if (s === 'approved') btns.push({ label: 'Send', next: 'sent', icon: <FaArrowRight size={10} />, bg: '#dbeafe', color: '#1d4ed8' });
    if (s === 'sent') btns.push({ label: 'Receive', next: 'received', icon: <FaTruck size={10} />, bg: '#d1fae5', color: '#065f46' });
    if (s !== 'received' && s !== 'cancelled') btns.push({ label: 'Cancel', next: 'cancelled', icon: <FaTimes size={10} />, bg: '#fef2f2', color: '#991b1b' });
    return btns;
  };

  const renderSuppliers = () => (
    <div>
      {sectionHeader('Suppliers', 'Add Supplier', () => setShowAddSupplierModal(true), null, permissions.add)}
      {suppliers.length === 0 ? emptyState('No suppliers added yet') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>Name</th><th style={th}>Contact</th><th style={th}>Phone</th>
              <th style={th}>Email</th><th style={th}>Rating</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {suppliers.map(s => {
                const perf = supplierPerformance[s.id] || supplierPerformance[s._id];
                return (
                  <tr key={s.id || s._id}>
                    <td style={{ ...td, fontWeight: 600 }}>{s.name}</td>
                    <td style={td}>{s.contactPerson || s.contact || '-'}</td>
                    <td style={td}>{s.phone || '-'}</td>
                    <td style={td}>{s.email || '-'}</td>
                    <td style={td}>
                      {perf ? (
                        <span style={badge(perf.rating >= 4 ? '#d1fae5' : perf.rating >= 3 ? '#fef3c7' : '#fef2f2', perf.rating >= 4 ? '#065f46' : perf.rating >= 3 ? '#92400e' : '#991b1b')}>
                          {perf.rating?.toFixed(1) || '-'}/5
                        </span>
                      ) : <span style={{ color: '#9ca3af', fontSize: 12 }}>N/A</span>}
                    </td>
                    <td style={td}>
                      {permissions.delete && (
                        <button style={btnSmall('#fef2f2', '#991b1b')} onClick={() => handleDeleteSupplier(s.id || s._id)}>
                          <FaTimes size={10} /> Delete
                        </button>
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

  const renderPurchaseOrders = () => (
    <div>
      {sectionHeader('Purchase Orders', 'Create PO', () => setShowAddPurchaseOrderModal(true),
        permissions.add ? (
          <button
            style={{ ...btnSmall(isListeningVoice ? '#fef2f2' : '#f0fdf4', isListeningVoice ? '#991b1b' : '#059669'), padding: '8px 14px', fontSize: 13, fontWeight: 600 }}
            onClick={startVoiceListeningPO}
            disabled={processingVoice}
          >
            {isListeningVoice ? <><FaStop size={12} /> Stop</> : <><FaMicrophone size={12} /> Voice PO</>}
          </button>
        ) : null,
        permissions.add
      )}

      {isListeningVoice && voiceTranscript && (
        <div style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, marginBottom: 12, fontSize: 13, color: '#065f46' }}>
          Listening: &ldquo;{voiceTranscript}&rdquo;
        </div>
      )}
      {voiceError && (
        <div style={{ padding: '8px 12px', background: '#fef2f2', borderRadius: 8, marginBottom: 12, fontSize: 13, color: '#991b1b' }}>
          {voiceError}
        </div>
      )}

      {smartSuggestions?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#065f46' }}>
          <FaClipboardCheck size={14} />
          <span><strong>AI suggests</strong> reordering {smartSuggestions.length} item{smartSuggestions.length > 1 ? 's' : ''} based on usage patterns</span>
        </div>
      )}

      {purchaseOrders.length === 0 ? emptyState('No purchase orders yet') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>PO #</th><th style={th}>Supplier</th><th style={th}>Items</th>
              <th style={th}>Total</th><th style={th}>Status</th><th style={th}>Date</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.id || po._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{po.poNumber || po.id || po._id}</td>
                  <td style={td}>{po.supplierName || po.supplier || '-'}</td>
                  <td style={td}>{po.items?.length || 0}</td>
                  <td style={td}>{formatCurrency(po.totalAmount || po.total || 0)}</td>
                  <td style={td}>{statusBadge(po.status, getOrderStatusColor)}</td>
                  <td style={td}>{po.date ? new Date(po.date).toLocaleDateString() : '-'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {statusActions(po).map((a, i) => (
                        <button key={i} style={btnSmall(a.bg, a.color)} onClick={() => handleUpdateOrderStatus(po.id || po._id, a.next)}>
                          {a.icon} {a.label}
                        </button>
                      ))}
                      <button style={btnSmall('#ede9fe', '#5b21b6')} onClick={() => handleEmailPurchaseOrder(po)}>
                        <FaEnvelope size={10} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderRequisitions = () => (
    <div>
      {sectionHeader('Purchase Requisitions', 'New Requisition', () => setShowAddRequisitionModal(true), null, permissions.add)}
      {purchaseRequisitions.length === 0 ? emptyState('No requisitions yet') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>ID</th><th style={th}>Requested By</th><th style={th}>Items</th>
              <th style={th}>Priority</th><th style={th}>Status</th><th style={th}>Date</th>
            </tr></thead>
            <tbody>
              {purchaseRequisitions.map(r => (
                <tr key={r.id || r._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{r.requisitionNumber || r.id || r._id}</td>
                  <td style={td}>{r.requestedBy || '-'}</td>
                  <td style={td}>{r.items?.length || 0}</td>
                  <td style={td}>{priorityBadge(r.priority || 'low')}</td>
                  <td style={td}>{statusBadge(r.status, getOrderStatusColor)}</td>
                  <td style={td}>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderGRN = () => (
    <div>
      {sectionHeader('Goods Receipt Notes', 'Record Receipt', () => setShowAddGRNModal(true), null, permissions.add)}
      {grns.length === 0 ? emptyState('No goods receipts recorded') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>GRN #</th><th style={th}>PO Ref</th><th style={th}>Received Date</th>
              <th style={th}>Items</th><th style={th}>Status</th>
            </tr></thead>
            <tbody>
              {grns.map(g => (
                <tr key={g.id || g._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{g.grnNumber || g.id || g._id}</td>
                  <td style={td}>{g.poReference || g.purchaseOrderId || '-'}</td>
                  <td style={td}>{g.receivedDate ? new Date(g.receivedDate).toLocaleDateString() : '-'}</td>
                  <td style={td}>{g.items?.length || 0}</td>
                  <td style={td}>{statusBadge(g.status || 'received', getOrderStatusColor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div>
      {sectionHeader('Supplier Invoices', 'Add Invoice', () => setShowAddInvoiceModal(true), null, permissions.add)}
      {supplierInvoices.length === 0 ? emptyState('No invoices recorded') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>Invoice #</th><th style={th}>Supplier</th><th style={th}>Date</th>
              <th style={th}>Amount</th><th style={th}>Status</th>
            </tr></thead>
            <tbody>
              {supplierInvoices.map(inv => (
                <tr key={inv.id || inv._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{inv.invoiceNumber || inv.id || inv._id}</td>
                  <td style={td}>{inv.supplierName || inv.supplier || '-'}</td>
                  <td style={td}>{inv.date ? new Date(inv.date).toLocaleDateString() : '-'}</td>
                  <td style={td}>{formatCurrency(inv.amount || inv.total || 0)}</td>
                  <td style={td}>
                    <span style={badge(...Object.values(invoiceStatusColor(inv.status)))}>
                      {inv.status || 'unmatched'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReturns = () => (
    <div>
      {sectionHeader('Supplier Returns', 'New Return', () => setShowAddReturnModal(true), null, permissions.add)}
      {supplierReturns.length === 0 ? emptyState('No returns recorded') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>ID</th><th style={th}>Type</th><th style={th}>Supplier</th>
              <th style={th}>Items</th><th style={th}>Status</th>
            </tr></thead>
            <tbody>
              {supplierReturns.map(r => (
                <tr key={r.id || r._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{r.returnNumber || r.id || r._id}</td>
                  <td style={td}>
                    <span style={badge(...Object.values(returnTypeColor(r.type || r.reason)))}>
                      {r.type || r.reason || '-'}
                    </span>
                  </td>
                  <td style={td}>{r.supplierName || r.supplier || '-'}</td>
                  <td style={td}>{r.items?.length || 0}</td>
                  <td style={td}>{statusBadge(r.status || 'pending', getOrderStatusColor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTransfers = () => (
    <div>
      {sectionHeader('Stock Transfers', 'New Transfer', () => setShowAddTransferModal(true), null, permissions.add)}
      {stockTransfers.length === 0 ? emptyState('No transfers recorded') : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>ID</th><th style={th}>From</th><th style={th}>To</th>
              <th style={th}>Items</th><th style={th}>Status</th>
            </tr></thead>
            <tbody>
              {stockTransfers.map(t => (
                <tr key={t.id || t._id}>
                  <td style={{ ...td, fontWeight: 600 }}>{t.transferNumber || t.id || t._id}</td>
                  <td style={td}>{t.fromLocation || t.from || '-'}</td>
                  <td style={td}>{t.toLocation || t.to || '-'}</td>
                  <td style={td}>{t.items?.length || 0}</td>
                  <td style={td}>{statusBadge(t.status || 'pending', getOrderStatusColor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // === Warehouse Indents (outlet side) ===
  const renderIndents = () => (
    <div>
      {toast && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 500,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#059669',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {toast.msg}
        </div>
      )}

      {!showCreateIndent ? (
        <>
          {sectionHeader('Warehouse Indents', 'Request Stock', () => setShowCreateIndent(true), null, permissions.add)}

          {indentsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: 8, fontSize: 13 }}>Loading indents...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : indents.length === 0 ? (
            emptyState('No indent requests yet. Request stock from your warehouse.')
          ) : (
            <div style={tableWrap}>
              <table style={table}>
                <thead><tr>
                  <th style={th}>Indent #</th><th style={th}>Warehouse</th><th style={th}>Items</th>
                  <th style={th}>Priority</th><th style={th}>Status</th><th style={th}>Date</th><th style={th}>Actions</th>
                </tr></thead>
                <tbody>
                  {indents.map(ind => {
                    const color = indentStatusColor(ind.status);
                    return (
                      <tr key={ind.id}>
                        <td style={{ ...td, fontWeight: 600 }}>{ind.indentNumber || ind.id}</td>
                        <td style={td}>{ind.warehouseName || warehouses.find(w => w.id === ind.warehouseId)?.name || ind.warehouseId || '-'}</td>
                        <td style={td}>{ind.items?.length || 0}</td>
                        <td style={td}>{priorityBadge(ind.priority || 'medium')}</td>
                        <td style={td}>
                          <span style={badge(`${color}18`, color)}>{ind.status}</span>
                        </td>
                        <td style={td}>{ind.createdAt ? new Date(ind.createdAt._seconds ? ind.createdAt._seconds * 1000 : ind.createdAt).toLocaleDateString() : '-'}</td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(ind.status === 'dispatched' || ind.status === 'in_transit') && (
                              <button
                                style={btnSmall('#d1fae5', '#065f46')}
                                onClick={() => handleReceiveIndent(ind)}
                                disabled={receiveLoading[ind.id]}
                              >
                                {receiveLoading[ind.id] ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={10} />}
                                {' '}Receive
                              </button>
                            )}
                            {ind.status === 'requested' && (
                              <button style={btnSmall('#fef2f2', '#991b1b')} onClick={() => handleCancelIndent(ind)}>
                                <FaTimes size={10} /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* Create Indent Form */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Request Stock from Warehouse</h3>
            <button style={btnSmall()} onClick={() => setShowCreateIndent(false)}>
              <FaTimes size={10} /> Cancel
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Warehouse</label>
              <select
                value={indentForm.warehouseId}
                onChange={e => setIndentForm(f => ({ ...f, warehouseId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
              >
                <option value="">Select warehouse...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Priority</label>
              <select
                value={indentForm.priority}
                onChange={e => setIndentForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Warehouse stock hint */}
          {indentForm.warehouseId && warehouseStock.length > 0 && (
            <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#065f46' }}>
              <strong>{warehouseStock.length}</strong> items available in this warehouse. Pick items below or type freely.
            </div>
          )}

          {/* Items */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Items</label>
            {indentForm.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 160 }}>
                  <input
                    type="text"
                    placeholder="Item name"
                    list={`wh-stock-${idx}`}
                    value={item.name}
                    onChange={e => {
                      const items = [...indentForm.items];
                      items[idx].name = e.target.value;
                      // Auto-fill inventoryItemId if matching warehouse stock
                      const match = warehouseStock.find(s => s.name === e.target.value);
                      if (match) {
                        items[idx].inventoryItemId = match.id;
                        items[idx].unit = match.unit || items[idx].unit;
                      }
                      setIndentForm(f => ({ ...f, items }));
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                  />
                  <datalist id={`wh-stock-${idx}`}>
                    {warehouseStock.map(s => <option key={s.id} value={s.name}>{s.name} ({s.currentStock} {s.unit})</option>)}
                  </datalist>
                </div>
                <input
                  type="number" placeholder="Qty" min="0" step="0.01"
                  value={item.quantity}
                  onChange={e => { const items = [...indentForm.items]; items[idx].quantity = e.target.value; setIndentForm(f => ({ ...f, items })); }}
                  style={{ width: 80, padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                />
                <select
                  value={item.unit}
                  onChange={e => { const items = [...indentForm.items]; items[idx].unit = e.target.value; setIndentForm(f => ({ ...f, items })); }}
                  style={{ width: 70, padding: '8px 6px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                >
                  {['kg', 'g', 'l', 'ml', 'pcs', 'box', 'pack', 'dozen'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {indentForm.items.length > 1 && (
                  <button
                    onClick={() => { const items = indentForm.items.filter((_, i) => i !== idx); setIndentForm(f => ({ ...f, items })); }}
                    style={{ ...btnSmall('#fef2f2', '#991b1b'), padding: '6px 8px' }}
                  >
                    <FaTimes size={10} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setIndentForm(f => ({ ...f, items: [...f.items, { name: '', quantity: '', unit: 'kg' }] }))}
              style={{ ...btnSmall('#f0fdf4', '#059669'), marginTop: 4 }}
            >
              <FaPlus size={10} /> Add Item
            </button>
          </div>

          <button
            onClick={handleCreateIndent}
            disabled={indentSubmitting}
            style={{ ...btnPrimary, opacity: indentSubmitting ? 0.6 : 1 }}
          >
            {indentSubmitting ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaWarehouse size={12} />}
            {' '}Submit Indent Request
          </button>
        </div>
      )}
    </div>
  );

  // === Central Kitchen Deliveries (outlet side) ===
  const renderDeliveries = () => (
    <div>
      {toast && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 500,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#059669',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {toast.msg}
        </div>
      )}

      {sectionHeader('Kitchen Deliveries', '', null, null, false)}

      {deliveriesLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <FaSpinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading deliveries...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : deliveries.length === 0 ? (
        emptyState('No deliveries from central kitchen yet.')
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead><tr>
              <th style={th}>Item</th><th style={th}>From Kitchen</th><th style={th}>Quantity</th>
              <th style={th}>Status</th><th style={th}>Dispatched</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {deliveries.map(plan => {
                const alloc = plan.myAllocation;
                const color = indentStatusColor(alloc.status);
                return (
                  <tr key={plan.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{plan.itemName || '-'}</td>
                    <td style={td}>{plan.centralKitchenName || plan.centralKitchenId || '-'}</td>
                    <td style={td}>{alloc.quantity} {plan.unit || ''}</td>
                    <td style={td}>
                      <span style={badge(`${color}18`, color)}>{alloc.status}</span>
                    </td>
                    <td style={td}>
                      {alloc.dispatchedAt
                        ? new Date(alloc.dispatchedAt._seconds ? alloc.dispatchedAt._seconds * 1000 : alloc.dispatchedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td style={td}>
                      {(alloc.status === 'dispatched' || alloc.status === 'in_transit') ? (
                        <button
                          style={btnSmall('#d1fae5', '#065f46')}
                          onClick={() => handleReceiveDelivery(plan)}
                          disabled={receiveLoading[`del_${plan.id}`]}
                        >
                          {receiveLoading[`del_${plan.id}`] ? <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={10} />}
                          {' '}Receive
                        </button>
                      ) : alloc.status === 'received' ? (
                        <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>Received{alloc.actualReceivedQty ? ` (${alloc.actualReceivedQty})` : ''}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>Pending dispatch</span>
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

  const subTabContent = {
    suppliers: renderSuppliers,
    orders: renderPurchaseOrders,
    requisitions: renderRequisitions,
    grn: renderGRN,
    invoices: renderInvoices,
    returns: renderReturns,
    transfers: renderTransfers,
    indents: renderIndents,
    deliveries: renderDeliveries,
  };

  // Build dynamic sub-tabs list based on org features
  const subTabs = [
    ...BASE_SUB_TABS,
    ...(hasWarehouse ? [{ key: 'indents', label: 'Indents', icon: FaWarehouse }] : []),
    ...(hasKitchen ? [{ key: 'deliveries', label: 'Deliveries', icon: FaIndustry }] : []),
  ];

  return (
    <div>
      {/* Sub-tab pills */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {subTabs.map(t => (
          <button
            key={t.key}
            style={pillStyle(procurementSubTab === t.key)}
            onClick={() => setProcurementSubTab(t.key)}
          >
            {t.icon && <t.icon size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Active sub-tab content */}
      <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 12 : 20, border: '1px solid #e5e7eb' }}>
        {(subTabContent[procurementSubTab] || renderSuppliers)()}
      </div>
    </div>
  );
}
