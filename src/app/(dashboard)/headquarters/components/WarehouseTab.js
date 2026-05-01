'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaWarehouse,
  FaPlus,
  FaTruck,
  FaCheck,
  FaSpinner,
  FaArrowLeft,
  FaClipboardList,
  FaBox,
  FaExclamationTriangle,
  FaTimes,
  FaFilter
} from 'react-icons/fa';
import apiClient from '../../../../lib/api';

// ============================================
// Status & Priority Config
// ============================================

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: '#3b82f6', bg: '#eff6ff' },
  approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4' },
  picking: { label: 'Picking', color: '#eab308', bg: '#fefce8' },
  dispatched: { label: 'Dispatched', color: '#9333ea', bg: '#faf5ff' },
  received: { label: 'Received', color: '#6b7280', bg: '#f9fafb' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#f9fafb' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6b7280', bg: '#f9fafb' },
  medium: { label: 'Medium', color: '#3b82f6', bg: '#eff6ff' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  urgent: { label: 'Urgent', color: '#ef4444', bg: '#fef2f2' },
};

const STATUS_ORDER = ['requested', 'approved', 'picking', 'dispatched', 'received'];
const FILTER_TABS = ['all', 'requested', 'approved', 'picking', 'dispatched', 'received'];

// ============================================
// Shared Styles
// ============================================

const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const btnPrimary = {
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

const btnSecondary = {
  background: '#f3f4f6',
  color: '#374151',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

const btnDanger = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
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

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
};

// ============================================
// Sub-components
// ============================================

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.requested;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}20`,
      textTransform: 'capitalize',
    }}>
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}20`,
      textTransform: 'capitalize',
    }}>
      {priority === 'urgent' && <FaExclamationTriangle style={{ marginRight: '4px', fontSize: '10px' }} />}
      {config.label}
    </span>
  );
};

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#9ca3af' }}>
    <FaSpinner style={{ fontSize: '28px', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
    <span style={{ fontSize: '14px' }}>{text}</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#9ca3af' }}>
    <Icon style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }} />
    <p style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', margin: '0 0 4px' }}>{title}</p>
    {subtitle && <p style={{ fontSize: '13px', margin: 0 }}>{subtitle}</p>}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    flex: '1 1 200px',
    minWidth: '180px',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon style={{ fontSize: '20px', color }} />
    </div>
    <div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#6b7280' }}>{label}</div>
    </div>
  </div>
);

// ============================================
// Timeline Component
// ============================================

const IndentTimeline = ({ status }) => {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const isTerminal = status === 'rejected' || status === 'cancelled';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', margin: '20px 0', flexWrap: 'wrap' }}>
      {STATUS_ORDER.map((step, idx) => {
        const isCompleted = !isTerminal && idx <= currentIdx;
        const isCurrent = !isTerminal && idx === currentIdx;
        const config = STATUS_CONFIG[step];

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_ORDER.length - 1 ? '1' : '0' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              minWidth: '80px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                background: isCompleted ? config.color : '#f3f4f6',
                color: isCompleted ? '#fff' : '#9ca3af',
                border: isCurrent ? `3px solid ${config.color}` : 'none',
                boxShadow: isCurrent ? `0 0 0 4px ${config.color}20` : 'none',
              }}>
                {isCompleted && idx < currentIdx ? <FaCheck style={{ fontSize: '12px' }} /> : idx + 1}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: isCurrent ? '700' : '500',
                color: isCompleted ? config.color : '#9ca3af',
                textTransform: 'capitalize',
              }}>
                {config.label}
              </span>
            </div>
            {idx < STATUS_ORDER.length - 1 && (
              <div style={{
                flex: 1,
                height: '3px',
                background: !isTerminal && idx < currentIdx ? config.color : '#e5e7eb',
                margin: '0 4px',
                borderRadius: '2px',
                alignSelf: 'flex-start',
                marginTop: '15px',
              }} />
            )}
          </div>
        );
      })}
      {isTerminal && (
        <div style={{
          marginLeft: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: STATUS_CONFIG[status].color,
            color: '#fff',
          }}>
            <FaTimes style={{ fontSize: '12px' }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: STATUS_CONFIG[status].color, textTransform: 'capitalize' }}>
            {STATUS_CONFIG[status].label}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// Create Indent Form
// ============================================

const CreateIndentForm = ({ orgData, outlets, onClose, onCreated }) => {
  const [requestingOutletId, setRequestingOutletId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'pcs' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => {
    setItems(prev => [...prev, { name: '', quantity: '', unit: 'pcs' }]);
  };

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!requestingOutletId || !warehouseId) {
      setError('Please select both requesting outlet and warehouse.');
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one item with name and quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.createIndent(orgData.id, {
        requestingOutletId,
        warehouseId,
        priority,
        items: validItems.map(item => ({
          name: item.name.trim(),
          quantity: Number(item.quantity),
          unit: item.unit,
        })),
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create indent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onClose} style={{ ...btnSecondary, padding: '8px 12px' }}>
          <FaArrowLeft />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Create New Indent</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            <div>
              <label style={labelStyle}>Requesting Outlet *</label>
              <select
                style={selectStyle}
                value={requestingOutletId}
                onChange={(e) => setRequestingOutletId(e.target.value)}
                required
              >
                <option value="">Select outlet...</option>
                {(outlets.outlet || []).map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Warehouse *</label>
              <select
                style={selectStyle}
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
              >
                <option value="">Select warehouse...</option>
                {(outlets.warehouse || []).map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                style={selectStyle}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Items</h3>
            <button type="button" onClick={addItem} style={{ ...btnSecondary, padding: '6px 14px', fontSize: '13px' }}>
              <FaPlus style={{ fontSize: '11px' }} /> Add Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 40px',
                gap: '10px',
                alignItems: 'end',
              }}>
                <div>
                  {idx === 0 && <label style={labelStyle}>Item Name</label>}
                  <input
                    style={inputStyle}
                    placeholder="e.g. Tomatoes"
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  />
                </div>
                <div>
                  {idx === 0 && <label style={labelStyle}>Quantity</label>}
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  />
                </div>
                <div>
                  {idx === 0 && <label style={labelStyle}>Unit</label>}
                  <select
                    style={selectStyle}
                    value={item.unit}
                    onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="box">box</option>
                    <option value="case">case</option>
                    <option value="dozen">dozen</option>
                    <option value="packet">packet</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: items.length <= 1 ? '#d1d5db' : '#ef4444',
                      cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      padding: '10px',
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaClipboardList />}
            {submitting ? 'Creating...' : 'Create Indent'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// Indent Detail View
// ============================================

const IndentDetailView = ({ indent, orgData, outlets, onBack, onUpdated }) => {
  const [actionLoading, setActionLoading] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [itemQtyEdits, setItemQtyEdits] = useState({});
  const [error, setError] = useState('');

  const allOutlets = [
    ...(outlets.outlet || []),
    ...(outlets.central_kitchen || []),
    ...(outlets.warehouse || []),
  ];

  const getOutletName = (id) => {
    const found = allOutlets.find(o => o.id === id);
    return found ? found.name : id;
  };

  const updateItemQty = (itemIdx, field, value) => {
    setItemQtyEdits(prev => ({
      ...prev,
      [itemIdx]: { ...(prev[itemIdx] || {}), [field]: value },
    }));
  };

  const handleAction = async (action) => {
    setError('');
    setActionLoading(action);
    try {
      const payload = {};

      if (action === 'approve') {
        payload.items = (indent.items || []).map((item, idx) => ({
          ...item,
          approvedQty: Number(itemQtyEdits[idx]?.approvedQty ?? item.quantity),
        }));
      }

      if (action === 'reject') {
        payload.reason = rejectReason;
      }

      if (action === 'dispatch') {
        payload.items = (indent.items || []).map((item, idx) => ({
          ...item,
          pickedQty: Number(itemQtyEdits[idx]?.pickedQty ?? item.approvedQty ?? item.quantity),
        }));
      }

      if (action === 'receive') {
        payload.items = (indent.items || []).map((item, idx) => ({
          ...item,
          receivedQty: Number(itemQtyEdits[idx]?.receivedQty ?? item.pickedQty ?? item.quantity),
        }));
      }

      await apiClient.updateIndentStatus(orgData.id, indent.id, action, payload);
      setShowRejectModal(false);
      onUpdated();
    } catch (err) {
      setError(err.message || `Failed to ${action} indent`);
    } finally {
      setActionLoading('');
    }
  };

  const status = indent.status;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ ...btnSecondary, padding: '8px 12px' }}>
          <FaArrowLeft />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Indent #{indent.indentNumber || indent.id?.slice(-6)}
          </h2>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {indent.requestedAt ? new Date(indent.requestedAt).toLocaleString() : ''}
          </span>
        </div>
        <StatusBadge status={status} />
        <PriorityBadge priority={indent.priority || 'medium'} />
      </div>

      {/* Timeline */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 8px' }}>Status Timeline</h3>
        <IndentTimeline status={status} />
      </div>

      {/* Indent Info */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Requesting Outlet</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{getOutletName(indent.requestingOutletId)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Warehouse</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{getOutletName(indent.warehouseId)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Priority</div>
            <PriorityBadge priority={indent.priority || 'medium'} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Items Count</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{(indent.items || []).length}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 16px' }}>Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Requested</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Approved</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Picked</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Received</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {(indent.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{item.name}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {status === 'requested' ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        style={{ ...inputStyle, width: '80px', padding: '6px 8px', textAlign: 'right' }}
                        defaultValue={item.quantity}
                        onChange={(e) => updateItemQty(idx, 'approvedQty', e.target.value)}
                      />
                    ) : (
                      <span style={{ color: item.approvedQty != null ? '#16a34a' : '#9ca3af' }}>
                        {item.approvedQty ?? '-'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {(status === 'approved' || status === 'picking') ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        style={{ ...inputStyle, width: '80px', padding: '6px 8px', textAlign: 'right' }}
                        defaultValue={item.approvedQty ?? item.quantity}
                        onChange={(e) => updateItemQty(idx, 'pickedQty', e.target.value)}
                      />
                    ) : (
                      <span style={{ color: item.pickedQty != null ? '#9333ea' : '#9ca3af' }}>
                        {item.pickedQty ?? '-'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {status === 'dispatched' ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        style={{ ...inputStyle, width: '80px', padding: '6px 8px', textAlign: 'right' }}
                        defaultValue={item.pickedQty ?? item.quantity}
                        onChange={(e) => updateItemQty(idx, 'receivedQty', e.target.value)}
                      />
                    ) : (
                      <span style={{ color: item.receivedQty != null ? '#6b7280' : '#9ca3af' }}>
                        {item.receivedQty ?? '-'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{item.unit || 'pcs'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#dc2626',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ ...cardStyle }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 16px' }}>Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {status === 'requested' && (
            <>
              <button
                onClick={() => handleAction('approve')}
                disabled={!!actionLoading}
                style={{ ...btnPrimary, opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading === 'approve' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck />}
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={!!actionLoading}
                style={{ ...btnDanger, opacity: actionLoading ? 0.7 : 1 }}
              >
                <FaTimes /> Reject
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
                style={{ ...btnSecondary, opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading === 'cancel' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTimes />}
                Cancel Indent
              </button>
            </>
          )}
          {status === 'approved' && (
            <>
              <button
                onClick={() => handleAction('picking')}
                disabled={!!actionLoading}
                style={{ ...btnPrimary, background: '#eab308', opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading === 'picking' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaBox />}
                Mark Picking
              </button>
              <button
                onClick={() => handleAction('dispatch')}
                disabled={!!actionLoading}
                style={{ ...btnPrimary, background: '#9333ea', opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading === 'dispatch' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTruck />}
                Dispatch
              </button>
            </>
          )}
          {status === 'picking' && (
            <button
              onClick={() => handleAction('dispatch')}
              disabled={!!actionLoading}
              style={{ ...btnPrimary, background: '#9333ea', opacity: actionLoading ? 0.7 : 1 }}
            >
              {actionLoading === 'dispatch' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTruck />}
              Dispatch
            </button>
          )}
          {status === 'dispatched' && (
            <button
              onClick={() => handleAction('receive')}
              disabled={!!actionLoading}
              style={{ ...btnPrimary, opacity: actionLoading ? 0.7 : 1 }}
            >
              {actionLoading === 'receive' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck />}
              Mark Received
            </button>
          )}
          {(status === 'received' || status === 'rejected' || status === 'cancelled') && (
            <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              No further actions available for this indent.
            </span>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{ ...cardStyle, maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>Reject Indent</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px' }}>
              Please provide a reason for rejecting indent #{indent.indentNumber || indent.id?.slice(-6)}.
            </p>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} style={btnSecondary}>Cancel</button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!rejectReason.trim() || !!actionLoading}
                style={{ ...btnDanger, opacity: (!rejectReason.trim() || actionLoading) ? 0.7 : 1 }}
              >
                {actionLoading === 'reject' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTimes />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Warehouse Stock View
// ============================================

const WarehouseStockView = ({ orgData, outlets, onBack }) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [stock, setStock] = useState([]);
  const [pendingIndents, setPendingIndents] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [error, setError] = useState('');

  const warehouses = outlets.warehouse || [];

  const loadStock = useCallback(async (whId) => {
    if (!whId) return;
    setLoadingStock(true);
    setError('');
    try {
      const res = await apiClient.getWarehouseStock(orgData.id, whId);
      setStock(res.stock || res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load stock');
      setStock([]);
    } finally {
      setLoadingStock(false);
    }
  }, [orgData.id]);

  const loadPending = useCallback(async (whId) => {
    if (!whId) return;
    setLoadingPending(true);
    try {
      const res = await apiClient.getWarehousePending(orgData.id, whId);
      setPendingIndents(res.indents || res.pending || []);
    } catch (err) {
      setPendingIndents([]);
    } finally {
      setLoadingPending(false);
    }
  }, [orgData.id]);

  useEffect(() => {
    if (selectedWarehouseId) {
      loadStock(selectedWarehouseId);
      loadPending(selectedWarehouseId);
    }
  }, [selectedWarehouseId, loadStock, loadPending]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ ...btnSecondary, padding: '8px 12px' }}>
          <FaArrowLeft />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Warehouse Stock</h2>
      </div>

      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <label style={labelStyle}>Select Warehouse</label>
        <select
          style={{ ...selectStyle, maxWidth: '400px' }}
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
        >
          <option value="">Choose a warehouse...</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#dc2626',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {!selectedWarehouseId && (
        <EmptyState icon={FaWarehouse} title="Select a warehouse" subtitle="Choose a warehouse above to view stock levels" />
      )}

      {selectedWarehouseId && loadingStock && <LoadingSpinner text="Loading stock..." />}

      {selectedWarehouseId && !loadingStock && (
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px' }}>
            Current Stock ({stock.length} items)
          </h3>
          {stock.length === 0 ? (
            <EmptyState icon={FaBox} title="No stock data" subtitle="This warehouse has no stock records" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Item Name</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Current Stock</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6b7280', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{item.name}</td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: (item.currentStock || item.stock || 0) <= 0 ? '#ef4444' : '#111827',
                      }}>
                        {item.currentStock ?? item.stock ?? 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{item.unit || 'pcs'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedWarehouseId && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px' }}>
            Pending Indents
          </h3>
          {loadingPending ? (
            <LoadingSpinner text="Loading pending indents..." />
          ) : pendingIndents.length === 0 ? (
            <EmptyState icon={FaClipboardList} title="No pending indents" subtitle="All indents for this warehouse are fulfilled" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingIndents.map((ind, idx) => (
                <div key={ind.id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                      #{ind.indentNumber || ind.id?.slice(-6)}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '12px' }}>
                      {(ind.items || []).length} items
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <PriorityBadge priority={ind.priority || 'medium'} />
                    <StatusBadge status={ind.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Main WarehouseTab Component
// ============================================

const WarehouseTab = ({ orgData, outlets, formatCurrency }) => {
  const [view, setView] = useState('dashboard'); // dashboard | create | detail | stock
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIndent, setSelectedIndent] = useState(null);

  const allOutlets = [
    ...(outlets.outlet || []),
    ...(outlets.central_kitchen || []),
    ...(outlets.warehouse || []),
  ];

  const getOutletName = (id) => {
    const found = allOutlets.find(o => o.id === id);
    return found ? found.name : id;
  };

  const loadIndents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.getIndents(orgData.id);
      setIndents(res.indents || []);
    } catch (err) {
      setError(err.message || 'Failed to load indents');
      setIndents([]);
    } finally {
      setLoading(false);
    }
  }, [orgData.id]);

  useEffect(() => {
    loadIndents();
  }, [loadIndents]);

  const filteredIndents = statusFilter === 'all'
    ? indents
    : indents.filter(i => i.status === statusFilter);

  const stats = {
    total: indents.length,
    pending: indents.filter(i => i.status === 'requested').length,
    picking: indents.filter(i => i.status === 'picking').length,
    dispatched: indents.filter(i => i.status === 'dispatched').length,
  };

  const handleIndentClick = (indent) => {
    setSelectedIndent(indent);
    setView('detail');
  };

  const handleIndentUpdated = () => {
    loadIndents();
    setView('dashboard');
    setSelectedIndent(null);
  };

  const handleIndentCreated = () => {
    loadIndents();
    setView('dashboard');
  };

  // ---- Sub-view routing ----

  if (view === 'create') {
    return (
      <CreateIndentForm
        orgData={orgData}
        outlets={outlets}
        onClose={() => setView('dashboard')}
        onCreated={handleIndentCreated}
      />
    );
  }

  if (view === 'detail' && selectedIndent) {
    return (
      <IndentDetailView
        indent={selectedIndent}
        orgData={orgData}
        outlets={outlets}
        onBack={() => { setView('dashboard'); setSelectedIndent(null); }}
        onUpdated={handleIndentUpdated}
      />
    );
  }

  if (view === 'stock') {
    return (
      <WarehouseStockView
        orgData={orgData}
        outlets={outlets}
        onBack={() => setView('dashboard')}
      />
    );
  }

  // ---- Dashboard View ----

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>
            <FaWarehouse style={{ marginRight: '10px', color: '#16a34a' }} />
            Warehouse &amp; Indents
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Manage indent requests and warehouse stock levels
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setView('stock')} style={btnSecondary}>
            <FaBox /> Warehouse Stock
          </button>
          <button onClick={() => setView('create')} style={btnPrimary}>
            <FaPlus /> New Indent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <StatCard icon={FaClipboardList} label="Total Indents" value={stats.total} color="#3b82f6" />
        <StatCard icon={FaExclamationTriangle} label="Pending Approval" value={stats.pending} color="#f97316" />
        <StatCard icon={FaBox} label="Picking" value={stats.picking} color="#eab308" />
        <StatCard icon={FaTruck} label="Dispatched" value={stats.dispatched} color="#9333ea" />
      </div>

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {FILTER_TABS.map(tab => {
          const isActive = statusFilter === tab;
          const count = tab === 'all' ? indents.length : indents.filter(i => i.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? '2px solid #16a34a' : '1px solid #e5e7eb',
                background: isActive ? '#f0fdf4' : '#fff',
                color: isActive ? '#16a34a' : '#6b7280',
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab === 'all' ? (
                <><FaFilter style={{ fontSize: '10px' }} /> All</>
              ) : (
                STATUS_CONFIG[tab]?.label || tab
              )}
              <span style={{
                background: isActive ? '#16a34a' : '#e5e7eb',
                color: isActive ? '#fff' : '#6b7280',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '10px',
                padding: '2px 7px',
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#dc2626',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner text="Loading indents..." />}

      {/* Empty State */}
      {!loading && filteredIndents.length === 0 && (
        <div style={cardStyle}>
          <EmptyState
            icon={FaClipboardList}
            title={statusFilter === 'all' ? 'No indents yet' : `No ${statusFilter} indents`}
            subtitle={statusFilter === 'all' ? 'Create your first indent to get started' : 'Try a different filter'}
          />
        </div>
      )}

      {/* Indent List */}
      {!loading && filteredIndents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredIndents.map(indent => (
            <div
              key={indent.id}
              onClick={() => handleIndentClick(indent)}
              style={{
                ...cardStyle,
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                border: '1px solid #f0f0f0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#16a34a40';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                      #{indent.indentNumber || indent.id?.slice(-6)}
                    </span>
                    <StatusBadge status={indent.status} />
                    <PriorityBadge priority={indent.priority || 'medium'} />
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
                    <span>
                      <strong style={{ color: '#374151' }}>From:</strong> {getOutletName(indent.requestingOutletId)}
                    </span>
                    <span>
                      <strong style={{ color: '#374151' }}>Warehouse:</strong> {getOutletName(indent.warehouseId)}
                    </span>
                    <span>
                      <strong style={{ color: '#374151' }}>Items:</strong> {(indent.items || []).length}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {indent.requestedAt ? new Date(indent.requestedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarehouseTab;
