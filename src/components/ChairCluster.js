'use client';

import React, { useState } from 'react';
import { FaChair, FaEye, FaPrint, FaPlus, FaReceipt } from 'react-icons/fa';

/**
 * ChairCluster — per-chair mini-cards for a dine-in table that has 2+ open
 * chair orders (order-level chairNumber). Each chair behaves like its OWN table:
 * its own running total + Add / Bill / Print / Quick-view actions. A table with
 * 0 or 1 open order never renders this (the normal <TableCard> is used instead),
 * so the existing single-order flow is completely untouched.
 *
 * All actions funnel through the SAME page handlers by wrapping each chair order
 * as a synthetic table object ({ ...table, currentOrderId: order.id }), exactly
 * how the existing "Checks" (parties) sheet drives its per-check actions.
 */
export default function ChairCluster({
  table,
  orders = [],              // open orders for THIS table (each carries chairNumber)
  formatCurrency,
  getElapsed,
  onOpenOrder,              // (synthTable) => open the order to add items
  onBill,                   // (synthTable) => open billing
  onPrintBill,              // (synthTable)
  onPrintPreBill,           // (synthTable)
  onPrintKOT,               // (synthTable)
  onQuickView,              // (e, synthTable)
}) {
  // Sort by chair label so seats read A, B, C… (a whole-table order, if any, last).
  const sorted = [...orders].sort((a, b) => {
    const ca = String(a?.chairNumber ?? '~');
    const cb = String(b?.chairNumber ?? '~');
    return ca.localeCompare(cb);
  });

  const amountOf = (o) => Number(o?.amount ?? o?.finalAmount ?? o?.totalAmount ?? 0);
  const grandTotal = sorted.reduce((s, o) => s + amountOf(o), 0);

  // Take only as much grid space as the chairs need (one column per chair, capped),
  // instead of hogging the whole row. Extra chairs wrap inside the cluster.
  const spanCols = Math.min(Math.max(sorted.length, 1), 4);

  // Elapsed since the order was placed (createdAt may be a Firestore Timestamp,
  // a {_seconds} blob, an ISO string, or a Date).
  const fmtElapsed = (createdAt) => {
    if (!createdAt) return null;
    let d;
    try {
      d = createdAt?.toDate ? createdAt.toDate()
        : createdAt?._seconds ? new Date(createdAt._seconds * 1000)
        : new Date(createdAt);
    } catch { return null; }
    if (!d || isNaN(d.getTime())) return null;
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  // Build a synthetic table so existing handlers (which read currentOrderId) work per chair.
  const synth = (o) => ({
    ...table,
    status: 'occupied',
    currentOrderId: o.id,
    currentOrderTotal: o.amount ?? o.totalAmount ?? o.finalAmount,
    currentOrderFinalAmount: o.amount ?? o.finalAmount ?? o.totalAmount,
    // keep the base table name; chair shown separately on each mini-card
    name: table.name,
  });

  return (
    <div
      style={{
        gridColumn: `span ${spanCols}`,  // only as wide as its chairs (not the whole row)
        border: '1.5px solid #fcd34d',
        background: '#fffdf5',
        borderRadius: '14px',
        padding: '10px 12px',
        minWidth: 0,
      }}
    >
      {/* Cluster header: Table N · X chairs · combined total */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: '#fef3c7', color: '#92400e' }}>
            <FaChair size={13} />
          </span>
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#1f2937' }}>Table {table.name}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 999 }}>
            {sorted.length} chairs
          </span>
        </div>
        <span style={{ fontWeight: 800, fontSize: '13px', color: '#b45309' }}>
          {formatCurrency ? formatCurrency(grandTotal) : `₹${grandTotal}`}
        </span>
      </div>

      {/* One compact mini-card per chair */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
        {sorted.map((o) => {
          const chairLabel = (o?.chairNumber != null && String(o.chairNumber).trim() !== '') ? String(o.chairNumber).trim() : '—';
          const isFull = chairLabel === '—';
          return (
            <ChairMiniCard
              key={o.id}
              titleLeft={isFull ? `${table.name} · Full` : `${table.name} · ${chairLabel}`}
              elapsed={fmtElapsed(o.createdAt)}
              amount={formatCurrency ? formatCurrency(amountOf(o)) : `₹${amountOf(o)}`}
              onOpen={() => onOpenOrder && onOpenOrder(synth(o))}
              onBill={() => onBill && onBill(synth(o))}
              onPrintBill={() => onPrintBill && onPrintBill(synth(o))}
              onPrintPreBill={() => onPrintPreBill && onPrintPreBill(synth(o))}
              onPrintKOT={() => onPrintKOT && onPrintKOT(synth(o))}
              onQuickView={(e) => onQuickView && onQuickView(e, synth(o))}
            />
          );
        })}
      </div>
    </div>
  );
}

function ChairMiniCard({ titleLeft, elapsed, amount, onOpen, onBill, onPrintBill, onPrintPreBill, onPrintKOT, onQuickView }) {
  const [showPrint, setShowPrint] = useState(false);
  const iconBtn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: 6, border: '1px solid #e5e7eb',
    background: '#fff', color: '#6b7280', cursor: 'pointer',
  };
  return (
    <div style={{ position: 'relative', border: '1px solid #fde68a', background: '#fff', borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
        <span style={{ fontWeight: 800, fontSize: '12px', color: '#1f2937' }}>{titleLeft}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button title="View" onClick={onQuickView} style={iconBtn}><FaEye size={11} /></button>
          <button title="Print" onClick={() => setShowPrint((v) => !v)} style={iconBtn}><FaPrint size={11} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        {elapsed ? <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{elapsed}</span> : <span />}
        <span style={{ fontWeight: 800, fontSize: '14px', color: '#b45309' }}>{amount}</span>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onOpen}
          style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <FaPlus size={9} /> Add
        </button>
        <button
          onClick={onBill}
          style={{ flex: 1, padding: '6px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <FaReceipt size={9} /> Bill
        </button>
      </div>

      {showPrint && (
        <div style={{ position: 'absolute', top: 34, right: 8, zIndex: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 128 }}>
          {[
            { label: 'Print KOT', fn: onPrintKOT },
            { label: 'Pre-Bill', fn: onPrintPreBill },
            { label: 'Print Bill', fn: onPrintBill },
          ].map((it) => (
            <button
              key={it.label}
              onClick={() => { setShowPrint(false); it.fn && it.fn(); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
