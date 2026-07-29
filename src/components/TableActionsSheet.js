'use client';

import { createPortal } from 'react-dom';
import {
  FaUtensils, FaUsers, FaUser, FaCalendarAlt, FaEdit, FaColumns, FaLayerGroup,
  FaExchangeAlt, FaTools, FaBan, FaCheck, FaTrash, FaTimes, FaEye,
} from 'react-icons/fa';

/**
 * "Table options" modal — a centered sheet (portalled to <body> so it sits above the
 * whole app incl. the left nav). Red DineOpen theme, no purple. The primary action sits
 * on top, parties render as chips with each check's total, and the Manage/Status actions
 * are laid out in a compact two-column grid. All handlers are owned by the page.
 */
export default function TableActionsSheet({
  table,
  status,
  posSettings = {},
  canEditTable,
  canEditTableConfig,
  waitersCount = 0,
  parties = [],
  currencySymbol = '₹',
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
  const money = (n) => `${currencySymbol}${Math.round(Number(n) || 0)}`;
  const totalOf = (x) => Number(x?.currentOrderFinalAmount || x?.currentOrderTotal || 0);

  const statusMeta = isAvailable ? { label: 'Available', color: '#16a34a', bg: '#dcfce7' }
    : isOccupied ? { label: 'Occupied', color: '#b45309', bg: '#fef3c7' }
    : isReserved ? { label: 'Reserved', color: '#be123c', bg: '#ffe4e6' }
    : isCleaning ? { label: 'Cleaning', color: '#2563eb', bg: '#dbeafe' }
    : isOutOfService ? { label: 'Out of service', color: '#6b7280', bg: '#f3f4f6' }
    : { label: status, color: '#6b7280', bg: '#f3f4f6' };

  const run = (fn) => { onClose?.(); fn?.(table); };

  // Build the Manage + Status actions as a flat list → rendered in a 2-col grid.
  const actions = [];
  if (canEditTable && waitersCount > 0) actions.push({ icon: <FaUser size={13} />, color: '#0d9488', label: table.waiterName ? `Server: ${table.waiterName}` : 'Assign Server', onClick: () => run(onAssignServer) });
  if (isAvailable) actions.push({ icon: <FaCalendarAlt size={13} />, color: '#d97706', label: t?.('tables.book') || 'Book Table', onClick: () => run(onBook) });
  if (isAvailable && canEditTableConfig) actions.push({ icon: <FaEdit size={13} />, color: '#2563eb', label: 'Edit Table', onClick: () => run(onEdit) });
  if (isAvailable && canEditTableConfig && onSplit && !table.isSubTable) actions.push({ icon: <FaColumns size={13} />, color: '#dc2626', label: t?.('tables.split') || 'Split table', sub: 'A/B/C children', onClick: () => run(onSplit) });
  if (table.mergeGroupId && canEditTableConfig) actions.push({ icon: <FaLayerGroup size={13} />, color: '#0284c7', label: 'Un-merge', onClick: () => run(onUnmerge) });
  if (posSettings.moveOrderEnabled && isOccupied && table.currentOrderId) actions.push({ icon: <FaExchangeAlt size={13} />, color: '#0891b2', label: 'Move Order', onClick: () => run(onMoveOrder) });
  if (!isCleaning && canEditTable) actions.push({ icon: <FaTools size={13} />, color: '#64748b', label: t?.('tables.markCleaning') || 'Mark Cleaning', onClick: () => run(onSetCleaning) });
  if (isAvailable && canEditTable) actions.push({ icon: <FaBan size={13} />, color: '#e11d48', label: t?.('tables.markOutOfService') || 'Out of Service', onClick: () => run(onSetOutOfService) });
  if (isOccupied || isReserved) actions.push({ icon: <FaCheck size={13} />, color: '#16a34a', label: t?.('tables.free') || 'Free Table', onClick: () => run(onMakeAvailable) });

  const partyChip = (label, running, total, onClick) => (
    <button key={label} onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '10px',
      border: `1px solid ${running ? '#fcd34d' : '#fecaca'}`, background: running ? '#fef3c7' : '#fef2f2',
      color: running ? '#b45309' : '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
    }}>
      Party {label}{total > 0 ? ` · ${money(total)}` : ` · ${running ? 'running' : 'empty'}`}
    </button>
  );

  const sheet = (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(9,13,26,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 2147483000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'tblFade 0.14s ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '440px',
        maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', animation: 'tblSheet 0.18s cubic-bezier(0.34,1.3,0.64,1)',
      }}>
        {/* Header — red gradient */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '18px 16px 16px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '19px', fontWeight: 900, color: '#fff',
          }}>
            {table.name}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Table {table.name}</div>
            <span style={{ display: 'inline-flex', marginTop: '4px', fontSize: '11px', fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.22)', padding: '2px 9px', borderRadius: '999px' }}>
              {statusMeta.label}{table.capacity ? ` · ${table.capacity} seats` : ''}
            </span>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FaTimes size={13} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '14px 16px 16px' }}>
          {/* Primary action */}
          {(isAvailable || isReserved) && (
            <button onClick={() => run(onTakeOrder)} style={primaryBtn('#059669')}>
              <FaUtensils size={13} /> {isReserved ? (t?.('tables.seatGuest') || 'Seat Guest') : (t?.('tables.takeOrder') || 'Take Order')}
            </button>
          )}
          {isOccupied && (
            <button onClick={() => run(onViewOrder)} style={primaryBtn('#dc2626')}>
              <FaEye size={13} /> {t?.('tables.viewOrder') || 'View / Add to Order'}
            </button>
          )}
          {(isCleaning || isOutOfService) && (
            <button onClick={() => run(onMakeAvailable)} style={primaryBtn('#16a34a')}>
              <FaCheck size={13} /> {t?.('tables.makeAvailable') || 'Make Available'}
            </button>
          )}

          {/* Parties — each chip shows its own check total */}
          {partiesEnabled && (
            <>
              <SectionLabel>Parties &amp; Splits</SectionLabel>
              <button onClick={() => run(onAddParty)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                border: '1px dashed #fca5a5', background: '#fff5f5', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                  <FaUsers size={13} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>New Party ({nextPartyLabel})</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Start another independent check</span>
                </span>
              </button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {partyChip('A', isOccupied || !!table.currentOrderId, totalOf(table), () => run(isOccupied || table.currentOrderId ? onViewOrder : onTakeOrder))}
                {parties.map((p) => partyChip(p.partyLabel, !!p.currentOrderId || p.status === 'occupied' || p.status === 'serving', totalOf(p), () => { onClose?.(); onOpenParty?.(p); }))}
              </div>
            </>
          )}

          {/* Manage + Status — compact 2-column grid */}
          {actions.length > 0 && (
            <>
              <SectionLabel>Manage</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {actions.map((a, i) => (
                  <button key={i} onClick={a.onClick} style={{
                    display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 11px', border: '1px solid #f1f5f9',
                    background: '#fff', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', minWidth: 0,
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                    <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                      {a.icon}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</span>
                      {a.sub && <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.sub}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Danger */}
          {canEditTableConfig && (
            <button onClick={() => run(onDelete)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '12px',
              padding: '11px', border: '1px solid #fecaca', background: '#fef2f2', borderRadius: '12px', cursor: 'pointer',
              color: '#ef4444', fontSize: '13px', fontWeight: 700,
            }}>
              <FaTrash size={12} /> {t?.('tables.delete') || 'Delete Table'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Portal to <body> so the scrim covers the entire app (incl. the left nav), regardless
  // of any transformed/filtered ancestor that would otherwise confine position:fixed.
  return typeof document !== 'undefined' ? createPortal(sheet, document.body) : sheet;
}

const SectionLabel = ({ children }) => (
  <div style={{ padding: '14px 0 6px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#94a3b8' }}>{children}</div>
);

const primaryBtn = (bg) => ({
  width: '100%', padding: '12px', background: bg, color: '#fff', border: 'none',
  borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
});
