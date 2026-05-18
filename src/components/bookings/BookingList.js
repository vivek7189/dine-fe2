'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaEye, FaEdit, FaMoneyBill, FaCheck, FaTimes, FaFileInvoice, FaSpinner,
  FaSearch, FaFilter, FaTrash, FaDownload, FaEllipsisV, FaCalendarAlt,
  FaUser, FaPhone, FaHashtag, FaChevronDown,
} from 'react-icons/fa';

const typeColors = {
  catering: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  advance_order: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  venue: { bg: '#f3e8ff', color: '#6b21a8', dot: '#8b5cf6' },
};

const statusColors = {
  confirmed: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  in_progress: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  completed: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const typeLabels = { catering: 'Catering', advance_order: 'Advance Order', venue: 'Venue' };
const statusLabels = { confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

function Badge({ label, colors }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      backgroundColor: colors?.bg || '#f3f4f6', color: colors?.color || '#374151',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors?.dot || '#9ca3af' }} />
      {label}
    </span>
  );
}

// ─── Action Dropdown Menu ───
function ActionMenu({ booking, onView, onEdit, onAddPayment, onComplete, onCancel, onDelete, onShareInvoice }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const isActive = booking.status !== 'cancelled' && booking.status !== 'completed';

  const items = [
    { icon: FaEye, label: 'View Details', color: '#6b7280', onClick: () => onView(booking) },
    ...(isActive ? [
      { icon: FaEdit, label: 'Edit Booking', color: '#3b82f6', onClick: () => onEdit(booking) },
      { icon: FaMoneyBill, label: 'Add Payment', color: '#10b981', onClick: () => onAddPayment(booking) },
      { icon: FaCheck, label: 'Mark Complete', color: '#16a34a', onClick: () => onComplete(booking) },
      { icon: FaTimes, label: 'Cancel Booking', color: '#f59e0b', onClick: () => onCancel(booking) },
    ] : []),
    { icon: FaFileInvoice, label: 'Invoice', color: '#8b5cf6', onClick: () => onShareInvoice(booking) },
    { icon: FaDownload, label: 'Download Invoice', color: '#6366f1', onClick: () => onShareInvoice(booking, 'download') },
    { divider: true },
    { icon: FaTrash, label: 'Delete Booking', color: '#ef4444', onClick: () => onDelete(booking), danger: true },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb',
          background: open ? '#f9fafb' : 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <FaEllipsisV size={12} color="#6b7280" />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '4px',
          background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 999,
          minWidth: '180px', overflow: 'hidden', padding: '4px 0',
        }}>
          {items.map((item, idx) => {
            if (item.divider) return <div key={idx} style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />;
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick(); }}
                style={{
                  width: '100%', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '12px', fontWeight: 500, color: item.danger ? '#ef4444' : '#374151',
                  background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={12} style={{ color: item.color, flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Confirmation Modal ───
function ConfirmModal({ isOpen, title, message, confirmLabel, confirmColor, onConfirm, onClose, showReason, loading }) {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'white', borderRadius: '16px', maxWidth: '420px', width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
          background: confirmColor === '#ef4444' ? 'linear-gradient(135deg, #fef2f2, #fff)' : 'linear-gradient(135deg, #f0fdf4, #fff)',
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111' }}>{title}</h3>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>{message}</p>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {showReason && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Reason {showReason === 'required' ? '*' : '(optional)'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter reason..."
                autoFocus
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: 'white', color: '#374151', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={loading || (showReason === 'required' && !reason.trim())}
              style={{
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: confirmColor || '#ef4444', color: 'white', fontSize: '13px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || (showReason === 'required' && !reason.trim()) ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {loading && <FaSpinner size={12} className="animate-spin" />}
              {confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingList({
  bookings,
  loading,
  onView,
  onEdit,
  onAddPayment,
  onComplete,
  onCancel,
  onDelete,
  onShareInvoice,
  isMobile,
  formatCurrency,
  filters,
  onFiltersChange,
}) {
  const [searchInput, setSearchInput] = useState(filters?.search || '');
  const [confirmModal, setConfirmModal] = useState(null); // { type, booking }
  const [actionLoading, setActionLoading] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleFilterChange('search', searchInput);
  };

  // ─── Modal-based actions ───
  const handleCompleteClick = (booking) => {
    setConfirmModal({ type: 'complete', booking });
  };

  const handleCancelClick = (booking) => {
    setConfirmModal({ type: 'cancel', booking });
  };

  const handleDeleteClick = (booking) => {
    setConfirmModal({ type: 'delete', booking });
  };

  const handleConfirm = async (reason) => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      if (confirmModal.type === 'complete') {
        await onComplete(confirmModal.booking);
      } else if (confirmModal.type === 'cancel') {
        await onCancel(confirmModal.booking, reason);
      } else if (confirmModal.type === 'delete') {
        await onDelete(confirmModal.booking, reason);
      }
    } catch (err) {
      // errors handled by parent
    }
    setActionLoading(false);
    setConfirmModal(null);
  };

  // ─── Filter Bar ───
  const filtersRow = (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '14px 16px',
      backgroundColor: '#ffffff', borderRadius: '12px', marginBottom: '16px',
      alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
    }}>
      <FaFilter size={11} color="#9ca3af" />

      <select
        value={filters?.type || ''}
        onChange={(e) => handleFilterChange('type', e.target.value)}
        style={{
          padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
          fontSize: '13px', color: '#374151', background: '#fafafa', fontWeight: 500,
          cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="">All Types</option>
        <option value="catering">Catering</option>
        <option value="advance_order">Advance Order</option>
        <option value="venue">Venue</option>
      </select>

      <select
        value={filters?.status || ''}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        style={{
          padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
          fontSize: '13px', color: '#374151', background: '#fafafa', fontWeight: 500,
          cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        type="date"
        value={filters?.startDate || ''}
        onChange={(e) => handleFilterChange('startDate', e.target.value)}
        style={{
          padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
          fontSize: '13px', color: '#374151', background: '#fafafa',
        }}
      />

      <input
        type="date"
        value={filters?.endDate || ''}
        onChange={(e) => handleFilterChange('endDate', e.target.value)}
        style={{
          padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
          fontSize: '13px', color: '#374151', background: '#fafafa',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: isMobile ? '1 1 100%' : 'none' }}>
        <FaSearch size={11} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search... (Enter to apply)"
          style={{
            padding: '7px 12px 7px 30px', borderRadius: '8px', border: '1px solid #e5e7eb',
            fontSize: '13px', width: isMobile ? '100%' : '200px', background: '#fafafa',
          }}
        />
      </div>
    </div>
  );

  // ─── Modals ───
  const modals = (
    <>
      <ConfirmModal
        isOpen={confirmModal?.type === 'complete'}
        title="Complete Booking"
        message={`Mark booking #${confirmModal?.booking?.booking_number || ''} as completed?`}
        confirmLabel="Mark Complete"
        confirmColor="#16a34a"
        onConfirm={handleConfirm}
        onClose={() => setConfirmModal(null)}
        loading={actionLoading}
      />
      <ConfirmModal
        isOpen={confirmModal?.type === 'cancel'}
        title="Cancel Booking"
        message={`Cancel booking #${confirmModal?.booking?.booking_number || ''}? This action cannot be undone.`}
        confirmLabel="Cancel Booking"
        confirmColor="#f59e0b"
        showReason="optional"
        onConfirm={handleConfirm}
        onClose={() => setConfirmModal(null)}
        loading={actionLoading}
      />
      <ConfirmModal
        isOpen={confirmModal?.type === 'delete'}
        title="Delete Booking"
        message={`Permanently delete booking #${confirmModal?.booking?.booking_number || ''}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="#ef4444"
        showReason="required"
        onConfirm={handleConfirm}
        onClose={() => setConfirmModal(null)}
        loading={actionLoading}
      />
    </>
  );

  if (loading) {
    return (
      <div>
        {filtersRow}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
          <FaSpinner size={24} color="#6b7280" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div>
        {filtersRow}
        <div style={{
          textAlign: 'center', padding: '60px 20px', color: '#6b7280',
          backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <FaSearch size={18} color="#ef4444" />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>No bookings found</p>
          <p style={{ fontSize: '13px' }}>Try adjusting your filters or create a new booking.</p>
        </div>
      </div>
    );
  }

  // ─── Mobile Cards ───
  if (isMobile) {
    return (
      <div>
        {filtersRow}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bookings.map((booking) => (
            <div
              key={booking.id || booking.booking_number}
              onClick={() => onView(booking)}
              style={{
                borderRadius: '12px', padding: '14px 16px', backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
                borderLeft: `4px solid ${typeColors[booking.type]?.dot || '#9ca3af'}`,
                cursor: 'pointer', transition: 'box-shadow 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>#{booking.booking_number}</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <Badge label={typeLabels[booking.type] || booking.type} colors={typeColors[booking.type]} />
                    <Badge label={statusLabels[booking.status] || booking.status} colors={statusColors[booking.status]} />
                  </div>
                </div>
                <ActionMenu
                  booking={booking}
                  onView={onView} onEdit={onEdit} onAddPayment={onAddPayment}
                  onComplete={handleCompleteClick} onCancel={handleCancelClick}
                  onDelete={handleDeleteClick} onShareInvoice={onShareInvoice}
                />
              </div>
              <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                <strong>{booking.customer_name}</strong>
                {booking.customer_phone && <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '12px' }}>{booking.customer_phone}</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                {booking.event_name && <span>{booking.event_name} · </span>}
                {booking.event_date}
                {booking.guests && <span> · {booking.guests} guests</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{formatCurrency(booking.total_amount)}</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                  Paid {formatCurrency(booking.paid_amount)} · Bal {formatCurrency(booking.balance_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {modals}
      </div>
    );
  }

  // ─── Desktop Table ───
  return (
    <div>
      {filtersRow}
      <div style={{
        overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', background: 'white',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{
              background: 'linear-gradient(135deg, #fef2f2, #fff5f5)',
              borderBottom: '2px solid #fecaca',
            }}>
              {['Booking #', 'Type', 'Customer', 'Event', 'Date', 'Guests', 'Amount', 'Paid / Balance', 'Status', ''].map((header) => (
                <th key={header} style={{
                  padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                  color: '#991b1b', whiteSpace: 'nowrap', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr
                key={booking.id || booking.booking_number}
                onClick={() => onView(booking)}
                style={{
                  borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                  transition: 'background 0.1s',
                  background: index % 2 === 0 ? 'white' : '#fafafa',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
              >
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontWeight: 700, color: '#111', fontSize: '13px' }}>
                    <FaHashtag size={9} style={{ color: '#d1d5db', marginRight: '2px' }} />
                    {booking.booking_number}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge label={typeLabels[booking.type] || booking.type} colors={typeColors[booking.type]} />
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{booking.customer_name || '—'}</div>
                  {booking.customer_phone && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                      <FaPhone size={8} /> {booking.customer_phone}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 14px', color: '#374151' }}>{booking.event_name || '—'}</td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#374151' }}>
                    <FaCalendarAlt size={10} color="#d1d5db" />
                    {booking.event_date || '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: '#374151', textAlign: 'center' }}>{booking.guests || '—'}</td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 700, color: '#111' }}>
                  {formatCurrency(booking.total_amount)}
                </td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>{formatCurrency(booking.paid_amount)}</div>
                  <div style={{ fontSize: '11px', color: booking.balance_amount > 0 ? '#ef4444' : '#9ca3af', fontWeight: 500 }}>
                    Bal: {formatCurrency(booking.balance_amount)}
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge label={statusLabels[booking.status] || booking.status} colors={statusColors[booking.status]} />
                </td>
                <td style={{ padding: '12px 14px' }} onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    booking={booking}
                    onView={onView} onEdit={onEdit} onAddPayment={onAddPayment}
                    onComplete={handleCompleteClick} onCancel={handleCancelClick}
                    onDelete={handleDeleteClick} onShareInvoice={onShareInvoice}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modals}
    </div>
  );
}
