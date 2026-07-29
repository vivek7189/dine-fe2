'use client';

import { createPortal } from 'react-dom';
import { FaUsers, FaUtensils, FaFire, FaReceipt, FaTimes, FaPlus, FaEye } from 'react-icons/fa';

/**
 * "Checks" panel for a multi-party table (Path A). Lists every check on the table —
 * Party A (the base table) plus siblings B/C/… — each with its running total and its own
 * Open (add/edit), KOT (print that check's ticket) and Bill (settle that check) actions.
 * Portalled to <body> so the scrim covers the whole app. Red DineOpen theme, no purple.
 *
 * All actions reuse the page's existing per-table handlers, just applied to each party's
 * table object (each party IS a table with its own currentOrderId).
 */
export default function TableChecksSheet({
  table,
  parties = [],
  currencySymbol = '₹',
  nextPartyLabel = 'B',
  onClose,
  onOpen,          // (checkTable) → open/add-to that check's order
  onKOT,           // (checkTable) → print that check's KOT
  onBill,          // (checkTable) → settle that check
  onAddParty,      // (baseTable) → start a new party
  onPrintAllKOT,   // () → print KOT for every running check
}) {
  if (!table) return null;
  const money = (n) => `${currencySymbol}${Math.round(Number(n) || 0)}`;
  const totalOf = (x) => Number(x?.currentOrderFinalAmount || x?.currentOrderTotal || 0);
  const running = (x) => !!x?.currentOrderId || x?.status === 'occupied' || x?.status === 'serving';

  // Party A = the base table itself; then the siblings.
  const checks = [{ ref: table, label: 'A' }, ...parties.map((p) => ({ ref: p, label: p.partyLabel || '?' }))];
  const runningCount = checks.filter((c) => running(c.ref)).length;
  const grandTotal = checks.reduce((s, c) => s + (running(c.ref) ? totalOf(c.ref) : 0), 0);

  const act = (fn, x) => { fn?.(x); };

  const ActionBtn = ({ icon, label, color, bg, border, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: '8px 6px', borderRadius: '9px', border: `1px solid ${disabled ? '#e5e7eb' : border}`,
      background: disabled ? '#f8fafc' : bg, color: disabled ? '#cbd5e1' : color,
      fontSize: '12px', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      {icon} {label}
    </button>
  );

  const sheet = (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(9,13,26,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 2147483000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'tblFade 0.14s ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '440px', maxHeight: '88vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', animation: 'tblSheet 0.18s cubic-bezier(0.34,1.3,0.64,1)',
      }}>
        {/* Header — red gradient */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '18px 16px 16px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '19px', fontWeight: 900, color: '#fff' }}>
            {table.name}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Table {table.name} · Checks</div>
            <span style={{ display: 'inline-flex', marginTop: '4px', fontSize: '11px', fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.22)', padding: '2px 9px', borderRadius: '999px' }}>
              {runningCount} running · {money(grandTotal)}
            </span>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FaTimes size={13} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {checks.map((c) => {
            const isRun = running(c.ref);
            return (
              <div key={c.label} style={{ border: `1px solid ${isRun ? '#fde68a' : '#f1f5f9'}`, background: isRun ? '#fffbeb' : '#fff', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '9px', background: isRun ? '#fef3c7' : '#fef2f2', color: isRun ? '#b45309' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, flexShrink: 0 }}>
                    {c.label}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>Party {c.label}{c.label === 'A' ? ' · main' : ''}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isRun ? '#b45309' : '#94a3b8' }}>{isRun ? 'running' : 'empty'}</div>
                  </div>
                  {isRun && <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{money(totalOf(c.ref))}</div>}
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <ActionBtn icon={<FaEye size={11} />} label={isRun ? 'Open' : 'Take Order'} color="#0f766e" bg="#f0fdfa" border="#99f6e4" onClick={() => act(onOpen, c.ref)} />
                  <ActionBtn icon={<FaFire size={11} />} label="KOT" color="#2563eb" bg="#eff6ff" border="#bfdbfe" onClick={() => act(onKOT, c.ref)} disabled={!isRun} />
                  <ActionBtn icon={<FaReceipt size={11} />} label="Bill" color="#dc2626" bg="#fef2f2" border="#fecaca" onClick={() => act(onBill, c.ref)} disabled={!isRun} />
                </div>
              </div>
            );
          })}

          {/* Footer: new party + print-all */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <button onClick={() => act(onAddParty, table)} style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px',
              border: '1px dashed #fca5a5', background: '#fff5f5', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            }}>
              <FaPlus size={11} /> New Party ({nextPartyLabel})
            </button>
            {onPrintAllKOT && runningCount > 0 && (
              <button onClick={onPrintAllKOT} style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px',
                border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '12px', color: '#2563eb', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>
                <FaFire size={11} /> Print all KOT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(sheet, document.body) : sheet;
}
