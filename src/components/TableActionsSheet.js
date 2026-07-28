'use client';

import {
  FaUtensils, FaUsers, FaUser, FaCalendarAlt, FaEdit, FaColumns, FaLayerGroup,
  FaExchangeAlt, FaTools, FaBan, FaCheck, FaTrash, FaTimes, FaReceipt, FaEye,
} from 'react-icons/fa';

/**
 * Clean, centered "table options" modal — replaces the cramped inline card dropdown
 * that used to overlay and clip neighbouring cards. Rendered once at the page level;
 * the card's ⋮ button just sets the active table. All actions are the same handlers
 * the page already owns; this only presents them in an intuitive, roomy sheet.
 *
 * Rows are grouped: the big primary action (Take/View order) on top, then Order,
 * Manage, Status, and a Danger row. Everything is filtered by status + permission.
 */
export default function TableActionsSheet({
  table,
  status,
  posSettings = {},
  canEditTable,
  canEditTableConfig,
  waitersCount = 0,
  parties = [],
  t,
  onClose,
  // actions (same callbacks the grid card uses)
  onTakeOrder,
  onViewOrder,
  onAddParty,
  onOpenParty,
  onAssignServer,
  onBook,
  onEdit,
  onSplit,
  onUnmerge,
  onMoveOrder,
  onSetCleaning,
  onSetOutOfService,
  onMakeAvailable,
  onDelete,
}) {
  if (!table) return null;
  const isOccupied = status === 'occupied' || status === 'serving';
  const isAvailable = status === 'available';
  const isReserved = status === 'reserved';
  const isCleaning = status === 'cleaning';
  const isOutOfService = status === 'out-of-service';
  const partiesEnabled = !table.isSubTable && !table.isPartyTable && !table.isSplit && !table.mergeGroupId && !table.mergedInto;
  const nextPartyLabel = String.fromCharCode(66 + (parties?.length || 0));

  const statusMeta = isAvailable ? { label: 'Available', color: '#16a34a', bg: '#dcfce7' }
    : isOccupied ? { label: 'Occupied', color: '#b45309', bg: '#fef3c7' }
    : isReserved ? { label: 'Reserved', color: '#7c3aed', bg: '#f3e8ff' }
    : isCleaning ? { label: 'Cleaning', color: '#2563eb', bg: '#dbeafe' }
    : isOutOfService ? { label: 'Out of service', color: '#6b7280', bg: '#f3f4f6' }
    : { label: status, color: '#6b7280', bg: '#f3f4f6' };

  const run = (fn) => { onClose?.(); fn?.(table); };

  const Row = ({ icon, label, color = '#374151', onClick, sub }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
      padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
      textAlign: 'left', fontSize: '14px', fontWeight: 600, color,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span>{label}</span>
        {sub && <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>{sub}</span>}
      </span>
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#94a3b8' }}>{children}</div>
  );

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      animation: 'tblFade 0.12s ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '18px', width: '100%', maxWidth: '380px',
        maxHeight: '86vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'tblSheet 0.16s ease-out',
      }}>
        {/* Header: big table number + status + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px', background: '#eef2ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontSize: '18px', fontWeight: 900, color: '#4f46e5',
          }}>
            {table.name}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Table {table.name}</div>
            <span style={{ display: 'inline-flex', marginTop: '3px', fontSize: '11px', fontWeight: 700, color: statusMeta.color, background: statusMeta.bg, padding: '2px 8px', borderRadius: '999px' }}>
              {statusMeta.label}{table.capacity ? ` · ${table.capacity} seats` : ''}
            </span>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '9px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FaTimes size={13} />
          </button>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {/* Primary action */}
          <div style={{ padding: '12px 16px 4px' }}>
            {(isAvailable || isReserved) && (
              <button onClick={() => run(onTakeOrder)} style={primaryBtn('#059669')}>
                <FaUtensils size={13} /> {isReserved ? (t?.('tables.seatGuest') || 'Seat Guest') : (t?.('tables.takeOrder') || 'Take Order')}
              </button>
            )}
            {isOccupied && (
              <button onClick={() => run(onViewOrder)} style={primaryBtn('#4f46e5')}>
                <FaEye size={13} /> {t?.('tables.viewOrder') || 'View / Add to Order'}
              </button>
            )}
            {(isCleaning || isOutOfService) && (
              <button onClick={() => run(onMakeAvailable)} style={primaryBtn('#16a34a')}>
                <FaCheck size={13} /> {t?.('tables.makeAvailable') || 'Make Available'}
              </button>
            )}
          </div>

          {/* Parties */}
          {partiesEnabled && (
            <>
              <SectionLabel>Parties &amp; Splits</SectionLabel>
              <Row icon={<FaUsers size={14} />} color="#7c3aed"
                label={`New Party (${nextPartyLabel})`}
                sub="Start another independent check on this table"
                onClick={() => run(onAddParty)} />
              {parties.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '2px 16px 10px' }}>
                  {parties.map((p) => {
                    const pOcc = !!p.currentOrderId || p.status === 'occupied' || p.status === 'serving';
                    return (
                      <button key={p.id} onClick={() => { onClose?.(); onOpenParty?.(p); }} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '9px',
                        border: `1px solid ${pOcc ? '#fcd34d' : '#ddd6fe'}`, background: pOcc ? '#fef3c7' : '#f5f3ff',
                        color: pOcc ? '#b45309' : '#7c3aed', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      }}>
                        Party {p.partyLabel} · {pOcc ? 'running' : 'empty'}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Manage */}
          <SectionLabel>Manage</SectionLabel>
          {canEditTable && waitersCount > 0 && (
            <Row icon={<FaUser size={14} />} color="#0d9488"
              label={table.waiterName ? `Server: ${table.waiterName}` : 'Assign Server'}
              onClick={() => run(onAssignServer)} />
          )}
          {isAvailable && (
            <Row icon={<FaCalendarAlt size={14} />} color="#d97706" label={t?.('tables.book') || 'Book Table'} onClick={() => run(onBook)} />
          )}
          {isAvailable && canEditTableConfig && (
            <Row icon={<FaEdit size={14} />} color="#2563eb" label="Edit Table" onClick={() => run(onEdit)} />
          )}
          {isAvailable && canEditTableConfig && onSplit && !table.isSubTable && (
            <Row icon={<FaColumns size={14} />} color="#7c3aed" label={t?.('tables.split') || 'Split into sub-tables'} sub="Fixed A/B/C children" onClick={() => run(onSplit)} />
          )}
          {table.mergeGroupId && canEditTableConfig && (
            <Row icon={<FaLayerGroup size={14} />} color="#0284c7" label="Un-merge" onClick={() => run(onUnmerge)} />
          )}
          {posSettings.moveOrderEnabled && isOccupied && table.currentOrderId && (
            <Row icon={<FaExchangeAlt size={14} />} color="#6366f1" label="Move Order" onClick={() => run(onMoveOrder)} />
          )}

          {/* Status */}
          <SectionLabel>Status</SectionLabel>
          {!isCleaning && canEditTable && (
            <Row icon={<FaTools size={14} />} color="#64748b" label={t?.('tables.markCleaning') || 'Mark Cleaning'} onClick={() => run(onSetCleaning)} />
          )}
          {isAvailable && canEditTable && (
            <Row icon={<FaBan size={14} />} color="#8b5cf6" label={t?.('tables.markOutOfService') || 'Mark Out of Service'} onClick={() => run(onSetOutOfService)} />
          )}
          {(isOccupied || isReserved) && (
            <Row icon={<FaCheck size={14} />} color="#16a34a" label={t?.('tables.free') || 'Free Table'} onClick={() => run(onMakeAvailable)} />
          )}

          {/* Danger */}
          {canEditTableConfig && (
            <>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />
              <Row icon={<FaTrash size={13} />} color="#ef4444" label={t?.('tables.delete') || 'Delete Table'} onClick={() => run(onDelete)} />
            </>
          )}
          <div style={{ height: '10px' }} />
        </div>
      </div>
    </div>
  );
}

const primaryBtn = (bg) => ({
  width: '100%', padding: '12px', background: bg, color: '#fff', border: 'none',
  borderRadius: '11px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
});
