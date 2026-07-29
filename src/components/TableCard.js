'use client';

import {
  FaChair, FaUsers, FaLayerGroup, FaUser, FaEye, FaSpinner, FaCalendarAlt,
  FaEdit, FaTrash, FaBan, FaTools, FaCheck, FaReceipt, FaPrint, FaExchangeAlt,
  FaUtensils, FaPlus, FaColumns, FaEllipsisV, FaCog,
} from 'react-icons/fa';

/**
 * Presentational card for a single table on the Tables page grid.
 * Extracted verbatim from tables/page.js — same styles, classes, conditionals.
 * The host owns all data, modals and navigation; this component only renders
 * and fires callbacks.
 */
export default function TableCard({
  // data / context
  table,
  isToday,
  isMobile,
  isMobileEmbed,
  posSettings = {},
  tblBookings = [],
  tableStatus,
  // capabilities
  canEditTableConfig,
  canEditTable,
  waitersCount = 0,
  // When false, the card-top management dropdown (un-merge/assign/book/edit/
  // service/clean/delete) is never rendered. Defaults true so the /tables page
  // is unaffected; the dashboard "quick live view" passes false.
  showManagementDropdown = true,
  // When true, draws a subtle highlight ring around the card root (used by the
  // dashboard's recently-updated flash). Defaults false — no layout change.
  highlighted = false,
  // transient UI state + setters
  activeDropdown,
  setActiveDropdown,
  hoveredTableId,
  setHoveredTableId,
  printDropdownTable,
  setPrintDropdownTable,
  printingTables = {},
  quickViewLoading,
  // helpers
  getTableStatusInfo,
  getElapsed,
  getElapsedHours,
  formatCurrency,
  t,
  // callbacks
  onTableAction,
  onQuickView,
  onPrintBill,
  onPrintKOT,
  onEditTable,
  onDeleteTable,
  onAssignServer,
  onUnmerge,
  onSplitTable,
  onOpenBilling,
  onMoveOrder,
  onBookTable,
  // Dynamic parties (Path A): sibling party tables of this base + handlers.
  parties = [],
  onAddParty,
  onOpenParty,
  // When provided, the ⋮ button opens a clean centered options modal (owned by the page)
  // instead of the cramped inline dropdown. Falls back to the inline dropdown if absent.
  onOpenActions,
}) {
  const hasBookings = tblBookings.length > 0;
  // A base table with an idle main check but a RUNNING sibling party should still read as
  // "occupied" at a glance (yellow badge + tint). We only recolour the status visual — the
  // base table's own Take-Order action stays available (its main check is still free).
  const anyPartyRunning = isToday && (parties || []).some(p => !!p.currentOrderId || p.status === 'occupied' || p.status === 'serving');
  const displayStatus = (isToday && tableStatus === 'available' && anyPartyRunning) ? 'occupied' : tableStatus;
  const sInfo = getTableStatusInfo(displayStatus);
  const StatusIcon = sInfo.icon;
  const isDropdownOpen = activeDropdown === table.id;
  const isOccupied = isToday && (tableStatus === 'occupied' || tableStatus === 'serving');
  const isAvailable = tableStatus === 'available';
  const elapsed = isToday ? getElapsed(table) : null;
  const elapsedHrs = isOccupied ? getElapsedHours(table) : 0;
  // Aging thresholds: configurable via posSettings, defaults 2h/6h
  const warnHours = posSettings?.tableWarnHours || 2;
  const dangerHours = posSettings?.tableDangerHours || 6;
  const elapsedIsLong = elapsedHrs >= dangerHours;
  const elapsedIsWarn = !elapsedIsLong && elapsedHrs >= warnHours;

  // Dynamic parties (Path A): a base dine-in table can host multiple independently-billed
  // parties (Party A = this table, B/C/… = siblings). Not offered for sub-tables, party
  // siblings, merged or split tables. Guarded by the onAddParty handler being passed.
  const partiesEnabled = !!onAddParty && !table.isSubTable && !table.isPartyTable && !table.isSplit && !table.mergeGroupId && !table.mergedInto;
  const pChipBase = {
    fontSize: isMobileEmbed ? '8px' : '10px', fontWeight: 800, color: '#fff', background: '#7c3aed',
    width: isMobileEmbed ? '16px' : '20px', height: isMobileEmbed ? '16px' : '20px', borderRadius: '6px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1,
  };
  const pChipSibling = { ...pChipBase, background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe', cursor: 'pointer', padding: 0 };
  const pChipAdd = { ...pChipBase, background: '#fff', color: '#7c3aed', border: '1px dashed #c4b5fd', cursor: 'pointer', padding: 0 };
  const nextPartyLabel = String.fromCharCode(66 + parties.length); // A=base, so next is B, C…

  return (
    <div key={table.id} className="tbl-card table-dropdown" style={{
      background: sInfo.bg,
      borderRadius: isMobileEmbed ? '8px' : '12px',
      border: isOccupied ? 'none' : `1px solid ${sInfo.border}`,
      boxShadow: highlighted
        ? '0 0 0 3px rgba(59,130,246,0.55), 0 1px 3px rgba(0,0,0,0.05)'
        : '0 1px 3px rgba(0,0,0,0.05)',
      padding: '0', position: 'relative', overflow: isMobileEmbed ? 'hidden' : 'visible',
      minHeight: isMobileEmbed ? 'auto' : '120px', display: 'flex', flexDirection: 'column',
    }} onClick={() => {
         // Tapping the card body is the PRIMARY action (POS-standard): take an order when the
         // table is free, or open the running order when occupied. Management actions live behind
         // the ⋮ kebab. If the kebab menu is open, a body tap just closes it.
         if (isDropdownOpen) { setActiveDropdown(null); return; }
         const st = tableStatus;
         if (st === 'cleaning' || st === 'out-of-service') { onTableAction?.('make-available', table); return; }
         if (isOccupied || table.currentOrderId) { onTableAction?.('view-order', table); return; }
         onTableAction?.('take-order', table);
       }}
       onMouseEnter={() => setHoveredTableId(table.id)}
       onMouseLeave={() => setHoveredTableId(null)}>

      {/* ⋮ Management kebab — the ONLY trigger for edit/split/assign/clean/delete. Keeps the card
          body a clean primary tap target (matches Toast/Square/Petpooja). */}
      {showManagementDropdown && isToday && (
        <button
          onClick={(e) => { e.stopPropagation(); if (onOpenActions) { onOpenActions(table); } else { setActiveDropdown(isDropdownOpen ? null : table.id); } }}
          title="Manage table"
          style={{
            position: 'absolute', top: '6px', right: '6px', zIndex: 4,
            width: '26px', height: '26px', borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: isDropdownOpen ? '#eef2ff' : '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: isDropdownOpen ? '#4f46e5' : '#475569', padding: 0,
          }}
        >
          <FaCog size={13} />
        </button>
      )}

      {/* Animated dotted border for occupied tables (today only) */}
      {isOccupied && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          <rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx={isMobileEmbed ? "6.5" : "10.5"} ry={isMobileEmbed ? "6.5" : "10.5"} fill="none" stroke={sInfo.color} strokeWidth={isMobileEmbed ? "1.5" : "2"} strokeDasharray={isMobileEmbed ? "4,4" : "6,6"} strokeDashoffset="100">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
          </rect>
        </svg>
      )}

      <div style={{ padding: isMobileEmbed ? '6px 8px' : '12px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        {/* Header: name + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobileEmbed ? '2px' : '8px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: isMobileEmbed ? '3px' : '6px' }}>
              <span style={{ fontSize: isMobileEmbed ? '12px' : '16px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                {table.name}
              </span>
              {table.mergePrimary && table.mergedTableNames?.length > 0 && (
                <span title={`Merged with ${table.mergedTableNames.join(', ')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: isMobileEmbed ? '8px' : '10px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: '5px', whiteSpace: 'nowrap' }}>
                  <FaLayerGroup size={8} /> +{table.mergedTableNames.length}
                </span>
              )}
              {table.mergedInto && (
                <span title={`Merged into ${table.mergedIntoName || ''}`} style={{ fontSize: isMobileEmbed ? '8px' : '10px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: '5px', whiteSpace: 'nowrap' }}>
                  → {table.mergedIntoName}
                </span>
              )}
              {isOccupied && elapsed && (
                <span style={{
                  fontSize: isMobileEmbed ? '8px' : '10px', fontWeight: 700, whiteSpace: 'nowrap',
                  color: elapsedIsLong ? '#fff' : elapsedIsWarn ? '#92400e' : '#6b7280',
                  ...(elapsedIsLong ? { background: '#dc2626', padding: '1px 3px', borderRadius: '3px' } : {}),
                  ...(elapsedIsWarn ? { background: '#fef3c7', padding: '1px 3px', borderRadius: '3px' } : {}),
                }}>
                  {elapsed}
                </span>
              )}
            </div>
            {!isMobileEmbed && (
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaChair size={9} /> {(table.mergePrimary && table.mergedCapacity) ? table.mergedCapacity : (table.capacity || '-')} {t('tables.seats')}{(table.mergePrimary && table.mergedCapacity) ? ' (merged)' : ''}
                {isOccupied && table.currentOrderCovers > 0 && (
                  <span title="Guests seated (covers)" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px', padding: '1px 5px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
                    <FaUsers size={9} /> {table.currentOrderCovers}
                  </span>
                )}
                {table.waiterName && (
                  <span title={`Server: ${table.waiterName}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px', padding: '1px 5px', borderRadius: '6px', background: '#f0fdfa', color: '#0d9488', fontWeight: 700, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <FaUser size={8} /> {table.waiterName}
                  </span>
                )}
                {isOccupied && table.currentOrderId && (
                  <button onClick={(e) => onQuickView(e, table)} title="Quick view order" style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    color: '#6b7280', display: 'flex', alignItems: 'center', marginLeft: '2px',
                  }}>
                    {quickViewLoading === table.id ? <FaSpinner size={10} className="animate-spin" /> : <FaEye size={10} />}
                  </button>
                )}
              </div>
            )}
            {isMobileEmbed && (
              <div style={{ fontSize: '8px', color: '#9ca3af', marginTop: '1px' }}>
                {(table.mergePrimary && table.mergedCapacity) ? table.mergedCapacity : (table.capacity || '-')} seats
              </div>
            )}
          </div>
          {isAvailable ? (
            <div style={{ width: isMobileEmbed ? '6px' : '8px', height: isMobileEmbed ? '6px' : '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px #d1fae5' }} />
          ) : (
            isMobileEmbed ? (
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sInfo.color, flexShrink: 0 }} />
            ) : (
              <div style={{
                background: sInfo.bg, color: sInfo.color, padding: '3px 8px', borderRadius: '12px',
                fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${sInfo.border}`,
                display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {sInfo.label}
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isToday ? (
            /* ── TODAY: show live data ── */
            <>
              {isOccupied && (table.currentOrderFinalAmount || table.currentOrderTotal) ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {!isMobileEmbed && <div style={{ fontSize: '9px', color: '#92400e', fontWeight: 500, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('tables.totalInclTax')} {table.currentOrderTax ? t('tables.inclTax') : ''}
                  </div>}
                  <div style={{
                    fontSize: isMobileEmbed ? '13px' : '18px', fontWeight: 800, color: '#b45309',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: isMobileEmbed ? '2px 6px' : '4px 12px',
                    borderRadius: isMobileEmbed ? '5px' : '8px', border: '1px solid #fcd34d',
                  }}>
                    {formatCurrency(table.currentOrderFinalAmount || table.currentOrderTotal)}
                  </div>
                </div>
              ) : isOccupied && table.customerName ? (
                <div style={{ textAlign: 'center', fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: 600, color: '#92400e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{table.customerName}</div>
              ) : tableStatus === 'reserved' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: isMobileEmbed ? '10px' : '12px', fontWeight: 600, color: '#1e40af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{table.customerName || t('tables.statusReserved')}</div>
                  {!isMobileEmbed && table.reservationTime && <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>{table.reservationTime}</div>}
                </div>
              ) : tableStatus === 'cleaning' ? (
                <div style={{ textAlign: 'center', fontSize: isMobileEmbed ? '9px' : '11px', color: '#64748b', fontStyle: 'italic' }}>{t('tables.beingCleaned')}</div>
              ) : tableStatus === 'out-of-service' ? (
                <div style={{ textAlign: 'center', fontSize: isMobileEmbed ? '9px' : '11px', color: '#ef4444' }}>{t('tables.unavailable')}</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                  <StatusIcon size={isMobileEmbed ? 20 : 32} color={sInfo.color} />
                </div>
              )}
            </>
          ) : (
            /* ── NON-TODAY: show booking info for this date ── */
            <>
              {hasBookings ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: isMobileEmbed ? '14px' : '20px', fontWeight: 800, color: '#1e40af', marginBottom: '2px',
                  }}>
                    {tblBookings.length}
                  </div>
                  <div style={{ fontSize: isMobileEmbed ? '8px' : '10px', color: '#3b82f6', fontWeight: 600 }}>
                    {tblBookings.length === 1 ? t('tables.booking') : t('tables.bookings')}
                  </div>
                  {!isMobileEmbed && tblBookings[0]?.customerName && (
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tblBookings[0].customerName}
                      {tblBookings.length > 1 && ` +${tblBookings.length - 1}`}
                    </div>
                  )}
                  {!isMobileEmbed && tblBookings[0]?.bookingTime && (
                    <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>
                      {tblBookings[0].bookingTime}
                      {tblBookings.length > 1 && ` ...`}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                    <FaChair size={isMobileEmbed ? 18 : 32} color="#10b981" />
                  </div>
                  {!isMobileEmbed && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{t('tables.noBookings')}</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hover tooltip showing booking details (non-today) */}
      {!isToday && hasBookings && hoveredTableId === table.id && !isDropdownOpen && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: '8px', backgroundColor: '#1f2937', color: 'white', borderRadius: '12px',
          padding: '10px 14px', fontSize: '11px', minWidth: '180px', maxWidth: '240px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 40,
          animation: 'tblDropdown 0.12s ease-out',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '12px' }}>
            {tblBookings.length} {tblBookings.length > 1 ? t('tables.bookings') : t('tables.booking')}
          </div>
          {tblBookings.slice(0, 4).map((b, bi) => (
            <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '3px 0', borderTop: bi > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <span style={{ opacity: 0.9 }}>{b.customerName || t('tables.guest')}</span>
              <span style={{ opacity: 0.6 }}>{b.bookingTime || '—'} · {b.partySize || '?'}p</span>
            </div>
          ))}
          {tblBookings.length > 4 && (
            <div style={{ opacity: 0.5, marginTop: '4px' }}>+{tblBookings.length - 4} {t('tables.more')}</div>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
            width: '10px', height: '10px', backgroundColor: '#1f2937',
            borderRadius: '2px', transform: 'translateX(-50%) rotate(45deg)',
          }} />
        </div>
      )}

      {/* Party chips (Path A) — Party A is this base table; siblings B/C… open their own order.
          Only rendered once at least one sibling party exists, so single-party tables stay clean. */}
      {isToday && partiesEnabled && parties.length > 0 && (
        <div style={{ padding: isMobileEmbed ? '0 6px 4px' : '0 8px 6px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.3px', marginRight: '1px' }}>Parties</span>
            <span title={table.partyName || 'Party A (this table)'} style={pChipBase}>A</span>
            {parties.map((p) => {
              const pOcc = !!p.currentOrderId || p.status === 'occupied' || p.status === 'serving';
              return (
                <button key={p.id} onClick={(e) => { e.stopPropagation(); onOpenParty?.(p); }}
                  title={`${p.partyName || `Party ${p.partyLabel || ''}`}${pOcc ? ' · running' : ' · empty'}`}
                  style={pOcc ? { ...pChipSibling, background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' } : pChipSibling}>
                  {p.partyLabel || '?'}
                </button>
              );
            })}
            <button onClick={(e) => { e.stopPropagation(); onAddParty?.(table); }} title={`Add Party ${nextPartyLabel}`} style={pChipAdd}>+</button>
          </div>
        </div>
      )}

      {/* Action buttons at bottom */}
      <div style={{ padding: isMobileEmbed ? '0 6px 6px' : '0 8px 8px', position: 'relative', zIndex: 2 }}>
        {isToday ? (
          /* ── TODAY: live action buttons ── */
          <>
            {isAvailable && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('take-order', table); }} style={{
                width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px', background: '#059669', color: 'white', border: 'none',
                borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
                whiteSpace: 'nowrap',
              }}>
                <FaUtensils size={isMobileEmbed ? 8 : 10} /> {isMobileEmbed ? 'Order' : t('tables.takeOrder')}
              </button>
            )}
            {isOccupied && (
              <div style={{ display: 'flex', gap: isMobileEmbed ? '4px' : '5px', position: 'relative' }}>
                {/* Add items — primary action */}
                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('view-order', table); }} style={{
                  flex: 1, padding: isMobileEmbed ? '4px 4px' : '7px 8px', background: 'white', border: '1px solid #e5e7eb', color: '#374151',
                  borderRadius: isMobileEmbed ? '6px' : '8px', fontSize: isMobileEmbed ? '9px' : '11px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', whiteSpace: 'nowrap',
                }}>
                  <FaPlus size={isMobileEmbed ? 7 : 9} style={{ color: '#059669' }} /> Add
                </button>
                {/* Complete Bill — primary action */}
                <button className="tbl-action" onClick={(e) => {
                  e.stopPropagation();
                  onOpenBilling(table);
                }} style={{
                  flex: 1, padding: isMobileEmbed ? '4px 4px' : '7px 8px', background: '#dc2626', border: 'none', color: 'white',
                  borderRadius: isMobileEmbed ? '6px' : '8px', fontSize: isMobileEmbed ? '9px' : '11px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', whiteSpace: 'nowrap',
                }}>
                  <FaReceipt size={isMobileEmbed ? 7 : 9} /> Bill
                </button>
                {/* Print + Move — combined in one icon menu */}
                <div style={{ position: 'relative' }}>
                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); setPrintDropdownTable(printDropdownTable === table.id ? null : table.id); }} style={{
                    width: isMobileEmbed ? '26px' : '32px', height: isMobileEmbed ? '26px' : '32px', padding: 0,
                    background: printingTables[table.id]
                      ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
                      : printDropdownTable === table.id ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'rgba(0,0,0,0.03)',
                    color: printingTables[table.id] ? '#3b82f6' : printDropdownTable === table.id ? '#b45309' : '#6b7280',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {printingTables[table.id] ? <FaSpinner size={10} className="spin" /> : <FaPrint size={11} />}
                  </button>
                  {printDropdownTable === table.id && (
                    <div onClick={(e) => e.stopPropagation()} style={{
                      position: 'absolute', bottom: '100%', right: 0, marginBottom: '4px',
                      background: 'white', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      border: '1px solid #e5e7eb', zIndex: 999, minWidth: '140px', overflow: 'hidden',
                      padding: '4px 0',
                    }}>
                      {posSettings.moveOrderEnabled && table.currentOrderId && (
                        <button onClick={(e) => { e.stopPropagation(); setPrintDropdownTable(null); onMoveOrder(table); }} style={{
                          width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                          fontSize: '11px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <FaExchangeAlt size={10} style={{ color: '#6366f1' }} /> Move Order
                        </button>
                      )}
                      <button onClick={() => { onPrintBill(table); setPrintDropdownTable(null); }} style={{
                        width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                        fontSize: '11px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <FaReceipt size={10} style={{ color: '#10b981' }} /> Print Bill
                      </button>
                      <button onClick={() => { onPrintKOT(table); setPrintDropdownTable(null); }} style={{
                        width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                        fontSize: '11px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <FaUtensils size={10} style={{ color: '#f59e0b' }} /> Print KOT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {tableStatus === 'reserved' && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('take-order', table); }} style={{
                width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px', background: '#059669', color: 'white', border: 'none',
                borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
                whiteSpace: 'nowrap',
              }}>
                <FaUtensils size={isMobileEmbed ? 8 : 10} /> {isMobileEmbed ? 'Seat' : t('tables.seatGuest')}
              </button>
            )}
            {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('make-available', table); }} style={{
                width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px', background: 'white', color: '#059669', border: '1px solid #d1fae5',
                borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
              }}>
                <FaCheck size={10} /> {t('tables.makeAvailable')}
              </button>
            )}
          </>
        ) : (
          /* ── NON-TODAY: book table button ── */
          <button className="tbl-action" onClick={(e) => {
            e.stopPropagation();
            onBookTable(table);
          }} style={{
            width: '100%', padding: isMobileEmbed ? '6px 4px' : '8px 12px',
            background: hasBookings ? 'white' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: hasBookings ? '#059669' : 'white',
            border: hasBookings ? '1px solid #bbf7d0' : 'none',
            borderRadius: '6px', fontSize: isMobileEmbed ? '10px' : '11px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobileEmbed ? '3px' : '6px',
          }}>
            <FaCalendarAlt size={10} /> {hasBookings ? t('tables.addBooking') : t('tables.bookTable')}
          </button>
        )}
      </div>

      {/* Dropdown overlay on card top (today only) — legacy fallback when no modal handler.
          When onOpenActions is provided the page renders a clean centered modal instead. */}
      {!onOpenActions && showManagementDropdown && isToday && isDropdownOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          backgroundColor: 'white', borderRadius: '12px 12px 0 0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 30, overflow: 'hidden',
          animation: 'tblDropdown 0.15s ease-out',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
            {partiesEnabled && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); onAddParty?.(table); }} style={{ flex: '1 1 100%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#7c3aed', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '5px', borderBottom: '1px solid #f5f5f5' }}>
                <FaUsers size={12} /> New Party ({nextPartyLabel})
              </button>
            )}
            {table.mergeGroupId && canEditTableConfig && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); onUnmerge(table); }} style={{ flex: '1 1 100%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#0284c7', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '5px', borderBottom: '1px solid #f5f5f5' }}>
                <FaLayerGroup size={12} /> Un-merge
              </button>
            )}
            {canEditTable && waitersCount > 0 && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onAssignServer(table); }} style={{ flex: '1 1 100%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#0d9488', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '5px', borderBottom: '1px solid #f5f5f5' }}>
                <FaUser size={12} /> {table.waiterName ? `Server: ${table.waiterName}` : 'Assign Server'}
              </button>
            )}
            {isAvailable && (
              <>
                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('book-table', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5' }}>
                  <FaCalendarAlt size={12} /> {t('tables.book')}
                </button>
                {canEditTableConfig && (
                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onEditTable(table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#2563eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5', borderLeft: '1px solid #f5f5f5' }}>
                    <FaEdit size={12} /> Edit
                  </button>
                )}
                {canEditTableConfig && onSplitTable && !table.isSubTable && (
                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onSplitTable(table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#7c3aed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5', borderLeft: '1px solid #f5f5f5' }}>
                    <FaColumns size={12} /> {t('tables.split') || 'Split'}
                  </button>
                )}
                {canEditTable && (
                  <>
                    <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('out-of-service', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#8b5cf6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: '1px solid #f5f5f5', borderLeft: '1px solid #f5f5f5' }}>
                      <FaBan size={12} /> {t('tables.service')}
                    </button>
                    <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('cleaning', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <FaTools size={12} /> {t('tables.clean')}
                    </button>
                  </>
                )}
                {canEditTableConfig && (
                    <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onDeleteTable(table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                      <FaTrash size={12} /> {t('tables.delete')}
                    </button>
                )}
              </>
            )}
            {isOccupied && (
              <>
                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('cleaning', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <FaTools size={12} /> {t('tables.clean')}
                </button>
                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('make-available', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5' }}>
                  <FaCheck size={12} /> {t('tables.free')}
                </button>
              </>
            )}
            {tableStatus === 'reserved' && (
              <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('make-available', table); }} style={{ flex: '1 1 100%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <FaCheck size={12} /> {t('tables.cancelAndFree')}
              </button>
            )}
            {(tableStatus === 'cleaning' || tableStatus === 'out-of-service') && (
              <>
                <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onTableAction('make-available', table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <FaCheck size={12} /> {t('tables.free')}
                </button>
                {/* Edit (name/seats) is intentionally NOT offered here — only when
                    the table is free/available. Delete is still allowed for a
                    cleaning / out-of-service table (owner/admin). */}
                {canEditTableConfig && (
                  <button className="tbl-action" onClick={(e) => { e.stopPropagation(); onDeleteTable(table); }} style={{ flex: '1 1 50%', padding: '10px 8px', border: 'none', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderLeft: '1px solid #f5f5f5', borderTop: '1px solid #f5f5f5' }}>
                    <FaTrash size={12} /> {t('tables.delete')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
