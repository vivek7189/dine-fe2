'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSpinner, FaPrint, FaTimes, FaFileInvoiceDollar } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';

const fmtDate = (v) => { const s = typeof v === 'string' ? v.slice(0, 10) : ''; if (!s) return '—'; const [y, m, d] = s.split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${+d} ${M[+m - 1]} ${y}`; };
const fmtDateTime = (v) => { if (!v) return '—'; try { const d = new Date(v); return `${fmtDate(d.toISOString())} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; } catch { return '—'; } };

export default function InvoiceModal({ restaurantId, folioId, open, onClose, notify }) {
  const [doc, setDoc] = useState(null);
  const [issued, setIssued] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!open || !folioId) return;
    setLoading(true); setDoc(null); setIssued(null);
    try {
      const existing = await hotelApi.invoiceByFolio(restaurantId, folioId);
      if (existing.invoice) { setIssued(existing.invoice); setDoc(existing.invoice.document); }
      else { const p = await hotelApi.invoicePreview(restaurantId, folioId); setDoc(p.document); }
    } catch (e) { notify && notify('error', e.message || 'Could not load invoice'); }
    finally { setLoading(false); }
  }, [open, folioId, restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const issue = async () => {
    setBusy(true);
    try {
      const r = await hotelApi.generateInvoice(restaurantId, folioId);
      setIssued(r.invoice); setDoc(r.invoice.document);
      notify && notify('success', `Invoice ${r.invoice.invoiceNumber} issued`);
    } catch (e) { notify && notify('error', e.message || 'Could not issue invoice'); }
    finally { setBusy(false); }
  };
  const print = () => { if (typeof window !== 'undefined') window.print(); };

  if (!open || typeof document === 'undefined') return null;
  const cur = doc?.currency || '';
  const money = (v) => `${cur}${cur ? ' ' : ''}${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const isDraft = !issued;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-[#2A241B]/50 p-4 backdrop-blur-[2px] sm:items-center">
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #hotel-invoice, #hotel-invoice * { visibility: visible !important; }
        #hotel-invoice { position: fixed !important; inset: 0 !important; margin: 0 !important; box-shadow: none !important; border: 0 !important; max-width: none !important; width: 100% !important; }
        .no-print { display: none !important; }
      }`}</style>

      <div className="w-full max-w-2xl">
        {/* toolbar */}
        <div className="no-print mb-2 flex items-center justify-between">
          <div className="text-[13px] font-medium text-white/90">{isDraft ? 'Invoice preview (not yet issued)' : `Invoice ${issued.invoiceNumber}`}</div>
          <div className="flex items-center gap-2">
            {isDraft && <button onClick={issue} disabled={busy || loading} className="inline-flex items-center gap-1.5 rounded-lg bg-[#9A7B45] px-3 py-1.5 text-[13px] font-semibold text-white hover:brightness-110 disabled:opacity-60"><FaFileInvoiceDollar size={12} /> {busy ? 'Issuing…' : 'Issue invoice'}</button>}
            <button onClick={print} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold text-[#4A4335] hover:bg-[#F3EFE6] disabled:opacity-60"><FaPrint size={12} /> Print</button>
            <button onClick={onClose} className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"><FaTimes size={13} /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
        ) : !doc ? (
          <div className="rounded-2xl bg-white py-16 text-center text-[#A79C88]">No invoice available.</div>
        ) : (
          <div id="hotel-invoice" className="relative rounded-2xl bg-white p-8 text-[#2A241B] shadow-2xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {isDraft && <div className="no-print pointer-events-none absolute inset-0 flex items-center justify-center"><span className="rotate-[-24deg] text-[64px] font-bold text-[#9A7B45]/10">DRAFT</span></div>}

            {/* header */}
            <div className="flex items-start justify-between border-b-2 border-[#2A241B] pb-4">
              <div>
                <div className="text-[20px] font-bold">{doc.seller?.name}</div>
                {doc.seller?.tradeName && doc.seller.tradeName !== doc.seller.name && <div className="text-[12px] text-[#6E6656]">{doc.seller.tradeName}</div>}
                <div className="mt-1 text-[11.5px] leading-snug text-[#4A4335]">
                  {doc.seller?.address && <div>{doc.seller.address}{doc.seller.city ? `, ${doc.seller.city}` : ''}</div>}
                  {(doc.seller?.phone || doc.seller?.email) && <div>{[doc.seller.phone, doc.seller.email].filter(Boolean).join('  ·  ')}</div>}
                  {doc.seller?.showTaxId && doc.seller?.taxId && <div className="font-semibold">{doc.seller.taxIdLabel}: {doc.seller.taxId}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold tracking-wide">{doc.documentTitle || 'TAX INVOICE'}</div>
                <div className="mt-1 text-[12px]"><span className="text-[#8A8172]">No: </span><span className="font-semibold">{doc.invoiceNumber}</span></div>
                <div className="text-[12px]"><span className="text-[#8A8172]">Date: </span>{fmtDateTime(doc.issuedAt)}</div>
              </div>
            </div>

            {/* bill-to + stay */}
            <div className="mt-4 grid grid-cols-2 gap-6 text-[12px]">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#8A8172]">Bill to</div>
                <div className="font-semibold">{doc.buyer?.name}</div>
                {doc.buyer?.company && <div>{doc.buyer.company}</div>}
                {doc.buyer?.address && <div className="text-[#4A4335]">{doc.buyer.address}{doc.buyer.city ? `, ${doc.buyer.city}` : ''}</div>}
                {(doc.buyer?.phone || doc.buyer?.email) && <div className="text-[#4A4335]">{[doc.buyer.phone, doc.buyer.email].filter(Boolean).join('  ·  ')}</div>}
                {doc.buyer?.taxId && <div className="text-[#4A4335]">{doc.seller?.taxIdLabel || 'Tax Reg. No.'}: {doc.buyer.taxId}</div>}
              </div>
              {doc.stay && (doc.stay.checkIn || doc.stay.roomNumber) && (
                <div className="text-right">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#8A8172]">Stay</div>
                  {doc.stay.roomNumber && <div>Room <span className="font-semibold">{doc.stay.roomNumber}</span></div>}
                  {doc.stay.checkIn && <div>{fmtDate(doc.stay.checkIn)} → {fmtDate(doc.stay.checkOut)}{doc.stay.nights ? ` · ${doc.stay.nights} night(s)` : ''}</div>}
                  {doc.stay.code && <div className="text-[#8A8172]">Ref {doc.stay.code}</div>}
                </div>
              )}
            </div>

            {/* charges table */}
            <table className="mt-5 w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#C9BFA8] text-left text-[10px] uppercase tracking-wide text-[#8A8172]">
                  <th className="py-1.5 font-semibold">Description</th>
                  <th className="py-1.5 text-center font-semibold">Qty</th>
                  <th className="py-1.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(doc.charges || []).map((c, i) => (
                  <tr key={i} className="border-b border-[#EFE9DD]">
                    <td className="py-1.5">{c.description}{c.category ? <span className="text-[#A79C88]"> · {c.category}</span> : ''}</td>
                    <td className="py-1.5 text-center tabular-nums">{c.quantity ?? 1}</td>
                    <td className="py-1.5 text-right tabular-nums">{money(c.amount)}</td>
                  </tr>
                ))}
                {doc.discountTotal ? (
                  <tr className="border-b border-[#EFE9DD] text-[#8A3F31]"><td className="py-1.5">Discount</td><td /><td className="py-1.5 text-right tabular-nums">{money(doc.discountTotal)}</td></tr>
                ) : null}
              </tbody>
            </table>

            {/* totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 text-[12px]">
                <Row k="Subtotal" v={money(doc.totals?.subtotal)} />
                {(doc.taxLines || []).map((t, i) => (
                  <Row key={i} k={`${t.name}${t.rate != null ? ` @ ${t.rate}%` : ''}`} v={money(t.amount)} sub />
                ))}
                <div className="my-1 border-t border-[#C9BFA8]" />
                <Row k="Total" v={money(doc.totals?.total)} bold />
                {doc.totals?.totalPaid ? <Row k="Paid" v={`− ${money(doc.totals.totalPaid)}`} /> : null}
                <div className="my-1 border-t border-[#2A241B]" />
                <Row k="Balance due" v={money(doc.totals?.balance)} bold big />
              </div>
            </div>

            {/* payments */}
            {(doc.payments || []).length > 0 && (
              <div className="mt-4 text-[11px] text-[#4A4335]">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#8A8172]">Payments</div>
                {doc.payments.map((p, i) => (
                  <div key={i} className="flex justify-between border-b border-[#EFE9DD] py-1">
                    <span className="capitalize">{p.method}{p.reference ? ` · ${p.reference}` : ''}</span>
                    <span className="tabular-nums">{money(p.amount)} <span className="text-[#A79C88]">{fmtDateTime(p.paidAt)}</span></span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-[#EFE9DD] pt-3 text-center text-[10.5px] text-[#8A8172]">
              This is a computer-generated invoice.{doc.seller?.name ? ` Thank you for staying with ${doc.seller.tradeName || doc.seller.name}.` : ''}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function Row({ k, v, bold, big, sub }) {
  return (
    <div className={`flex justify-between ${sub ? 'text-[#6E6656]' : ''} ${bold ? 'font-semibold' : ''} ${big ? 'text-[14px]' : ''} py-0.5`}>
      <span>{k}</span><span className="tabular-nums">{v}</span>
    </div>
  );
}
