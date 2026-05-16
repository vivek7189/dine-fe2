'use client';

import { useState } from 'react';
import { FaEye, FaEdit, FaMoneyBill, FaCheck, FaTimes, FaFileInvoice, FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';

const typeColors = {
  catering: { bg: '#dcfce7', color: '#166534' },
  advance_order: { bg: '#dbeafe', color: '#1e40af' },
  venue: { bg: '#f3e8ff', color: '#6b21a8' },
};

const statusColors = {
  confirmed: { bg: '#dbeafe', color: '#1e40af' },
  in_progress: { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

const typeLabels = {
  catering: 'Catering',
  advance_order: 'Advance Order',
  venue: 'Venue',
};

const statusLabels = {
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function Badge({ label, colors }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
      backgroundColor: colors?.bg || '#f3f4f6',
      color: colors?.color || '#374151',
    }}>
      {label}
    </span>
  );
}

function ActionButton({ icon: Icon, title, onClick, color = '#6b7280' }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '4px',
        color,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <Icon size={14} />
    </button>
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
  onShareInvoice,
  isMobile,
  formatCurrency,
  filters,
  onFiltersChange,
}) {
  const [searchInput, setSearchInput] = useState(filters?.search || '');

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', searchInput);
    }
  };

  const getActions = (booking) => {
    const actions = [];
    actions.push({ icon: FaEye, title: 'View', onClick: () => onView(booking), color: '#6b7280' });

    if (booking.status !== 'cancelled' && booking.status !== 'completed') {
      actions.push({ icon: FaEdit, title: 'Edit', onClick: () => onEdit(booking), color: '#3b82f6' });
      actions.push({ icon: FaMoneyBill, title: 'Add Payment', onClick: () => onAddPayment(booking), color: '#10b981' });
      actions.push({ icon: FaCheck, title: 'Complete', onClick: () => onComplete(booking), color: '#16a34a' });
      actions.push({ icon: FaTimes, title: 'Cancel', onClick: () => onCancel(booking), color: '#ef4444' });
    }

    if (booking.status === 'completed') {
      actions.push({ icon: FaFileInvoice, title: 'Share Invoice', onClick: () => onShareInvoice(booking), color: '#8b5cf6' });
    }

    return actions;
  };

  // Filters row
  const filtersRow = (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '16px',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FaFilter size={12} color="#6b7280" />
      </div>

      <select
        value={filters?.type || ''}
        onChange={(e) => handleFilterChange('type', e.target.value)}
        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
      >
        <option value="">All Types</option>
        <option value="catering">Catering</option>
        <option value="advance_order">Advance Order</option>
        <option value="venue">Venue</option>
      </select>

      <select
        value={filters?.status || ''}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
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
        placeholder="Start Date"
        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
      />

      <input
        type="date"
        value={filters?.endDate || ''}
        onChange={(e) => handleFilterChange('endDate', e.target.value)}
        placeholder="End Date"
        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: isMobile ? '1 1 100%' : 'none' }}>
        <FaSearch size={12} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search... (Enter to apply)"
          style={{
            padding: '8px 12px 8px 30px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            width: isMobile ? '100%' : '200px',
          }}
        />
      </div>
    </div>
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
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No bookings found</p>
          <p style={{ fontSize: '14px' }}>Try adjusting your filters or search criteria.</p>
        </div>
      </div>
    );
  }

  // Mobile cards
  if (isMobile) {
    return (
      <div>
        {filtersRow}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((booking) => (
            <div key={booking.id || booking.booking_number} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>#{booking.booking_number}</span>
                <Badge label={statusLabels[booking.status] || booking.status} colors={statusColors[booking.status]} />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Badge label={typeLabels[booking.type] || booking.type} colors={typeColors[booking.type]} />
              </div>

              <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                <strong>{booking.customer_name}</strong>
                {booking.customer_phone && <span style={{ color: '#6b7280', marginLeft: '8px' }}>{booking.customer_phone}</span>}
              </div>

              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                {booking.event_name && <span>{booking.event_name} | </span>}
                {booking.event_date}
                {booking.guests && <span> | {booking.guests} guests</span>}
              </div>

              <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                <span style={{ fontWeight: 500 }}>Amount: {formatCurrency(booking.total_amount)}</span>
                <span style={{ color: '#6b7280', marginLeft: '12px' }}>
                  Paid: {formatCurrency(booking.paid_amount)} / Balance: {formatCurrency(booking.balance_amount)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {getActions(booking).map((action, idx) => (
                  <ActionButton key={idx} icon={action.icon} title={action.title} onClick={action.onClick} color={action.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop table
  return (
    <div>
      {filtersRow}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Booking #', 'Type', 'Customer', 'Event', 'Date', 'Guests', 'Amount', 'Paid/Balance', 'Status', 'Actions'].map((header) => (
                <th key={header} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id || booking.booking_number} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>#{booking.booking_number}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge label={typeLabels[booking.type] || booking.type} colors={typeColors[booking.type]} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div>{booking.customer_name}</div>
                  {booking.customer_phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.customer_phone}</div>}
                </td>
                <td style={{ padding: '12px 16px' }}>{booking.event_name || '-'}</td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{booking.event_date}</td>
                <td style={{ padding: '12px 16px' }}>{booking.guests || '-'}</td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{formatCurrency(booking.total_amount)}</td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '13px' }}>{formatCurrency(booking.paid_amount)}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Bal: {formatCurrency(booking.balance_amount)}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge label={statusLabels[booking.status] || booking.status} colors={statusColors[booking.status]} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {getActions(booking).map((action, idx) => (
                      <ActionButton key={idx} icon={action.icon} title={action.title} onClick={action.onClick} color={action.color} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
