'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaSpinner, FaBuilding, FaTimes, FaPen, FaTrash, FaMoneyBillWave } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn } from './ui';

const fmtDateTime = (v) => { if (!v) return '—'; try { const d = new Date(v); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${d.getDate()} ${M[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; } catch { return '—'; } };
const canManage = (() => { try { return ['owner', 'admin', 'manager'].includes((JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase()); } catch { return false; } })();
const EMPTY = { name: '', contactName: '', phone: '', email: '', taxId: '', address: '', creditLimit: '', active: true };
const PAY = ['cash', 'card', 'upi', 'bank', 'other'];

export default function CompaniesView({ restaurantId, formatCurrency, notify }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.listCompanies(restaurantId, true); setCompanies(r.companies || []); }
    catch (e) { notify('error', e.message || 'Failed to load companies'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => { setForm({ name: c.name, contactName: c.contactName || '', phone: c.phone || '', email: c.email || '', taxId: c.taxId || '', address: c.address || '', creditLimit: c.creditLimit ?? '', active: c.active }); setEditing(c); };
  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Company name is required');
    setSaving(true);
    try {
      const body = { ...form, creditLimit: form.creditLimit === '' ? null : Number(form.creditLimit) };
      if (editing.id) await hotelApi.updateCompany(restaurantId, editing.id, body);
      else await hotelApi.createCompany(restaurantId, body);
      notify('success', `Company ${editing.id ? 'updated' : 'created'}`); setEditing(null); await load();
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const remove = async (c) => { if (!window.confirm(`Delete "${c.name}"?`)) return; try { await hotelApi.deleteCompany(restaurantId, c.id); notify('success', 'Company deleted'); await load(); } catch (e) { notify('error', e.message); } };

  const totalOutstanding = companies.reduce((s, c) => s + (c.balance || 0), 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[#8A8172]">Corporate / travel-agent accounts. Bill a guest folio to a company at checkout, then settle the receivable later.</p>
        {canManage && <Btn onClick={openNew}><FaPlus size={12} /> New company</Btn>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#EBE4D6] py-12 text-center text-[#A79C88]">
          <FaBuilding className="mx-auto mb-2" size={22} /> No company accounts yet.
        </div>
      ) : (
        <>
          {totalOutstanding > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-[#EAD1C9] bg-[#F9EFEA] px-4 py-2.5 text-[13px]">
              <span className="text-[#8A3F31]">Total receivable across companies</span>
              <span className="font-semibold text-[#8A3F31]">{money(totalOutstanding)}</span>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {companies.map((c) => (
              <button key={c.id} onClick={() => setOpenId(c.id)}
                className="rounded-2xl border border-[#EBE4D6] bg-white p-4 text-left shadow-[0_1px_2px_rgba(40,33,20,0.05)] transition hover:border-[#D8CDB6] hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-serif text-[16px] font-semibold text-[#2A241B]">{c.name}{!c.active && <span className="ml-2 rounded bg-[#F1ECE1] px-1.5 py-0.5 text-[10px] text-[#A79C88]">inactive</span>}</div>
                    {c.contactName && <div className="mt-0.5 text-[12px] text-[#9A9081]">{c.contactName}{c.phone ? ` · ${c.phone}` : ''}</div>}
                    {c.taxId && <div className="text-[11px] text-[#B3A88F]">Tax: {c.taxId}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#A79C88]">Balance</div>
                    <div className={`text-[16px] font-semibold tabular-nums ${c.balance > 0 ? 'text-[#8A3F31]' : 'text-[#356B4E]'}`}>{money(c.balance)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <Modal open={!!editing} wide title={editing?.id ? 'Edit company' : 'New company account'} onClose={() => setEditing(null)}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn></>}>
        <div className="space-y-3">
          <Field label="Company name" required><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Corp / Makemytrip" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact person"><input className={inputCls} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Tax / GST No."><input className={inputCls} value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} /></Field>
          </div>
          <Field label="Address"><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Credit limit" hint="optional"><input type="number" min="0" className={inputCls} value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} /></Field>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-[#6E6656]"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-[#DFD7C6]" /> Active</label></div>
          </div>
        </div>
      </Modal>

      {openId && (
        <CompanyDrawer restaurantId={restaurantId} companyId={openId} money={money} notify={notify} canManage={canManage}
          onClose={() => setOpenId(null)} onEdit={(c) => { setOpenId(null); openEdit(c); }} onChanged={load} onDeleted={() => { setOpenId(null); load(); }} />
      )}
    </div>
  );
}

function CompanyDrawer({ restaurantId, companyId, money, notify, canManage, onClose, onEdit, onChanged, onDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pay, setPay] = useState({ amount: '', method: 'bank', reference: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await hotelApi.companyStatement(restaurantId, companyId); setData(r); }
    catch (e) { notify('error', e.message); }
    finally { setLoading(false); }
  }, [restaurantId, companyId, notify]);
  useEffect(() => { load(); }, [load]);

  const recordPayment = async () => {
    const amount = Number(pay.amount);
    if (!(amount > 0)) return notify('error', 'Enter an amount');
    setBusy(true);
    try {
      await hotelApi.companyPayment(restaurantId, companyId, { amount, method: pay.method, reference: pay.reference || null });
      notify('success', `Payment of ${money(amount)} recorded`); setPay({ amount: '', method: 'bank', reference: '' }); setPayOpen(false);
      await load(); onChanged && onChanged();
    } catch (e) { notify('error', e.message); } finally { setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm('Delete this company?')) return;
    setBusy(true);
    try { await hotelApi.deleteCompany(restaurantId, companyId); notify('success', 'Company deleted'); onDeleted && onDeleted(); }
    catch (e) { notify('error', e.message); setBusy(false); }
  };

  if (typeof document === 'undefined') return null;
  const c = data?.company; const totals = data?.totals;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-end bg-[#2A241B]/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-[#FBF9F4] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-[#EFE9DD] px-5 py-4">
          <div className="min-w-0">
            <div className="font-serif text-[18px] font-semibold text-[#2A241B]">{c?.name || 'Company'}</div>
            {c && <div className="mt-0.5 text-[12px] text-[#9A9081]">{[c.contactName, c.phone, c.taxId && `Tax ${c.taxId}`].filter(Boolean).join(' · ')}</div>}
          </div>
          <button onClick={onClose} className="text-[#A79C88] hover:text-[#6E6656]"><FaTimes /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading || !c ? (
            <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Charged" value={money(totals.charged)} />
                <Stat label="Paid" value={money(totals.paid)} tone="green" />
                <Stat label="Balance" value={money(totals.balance)} tone={totals.balance > 0 ? 'rose' : 'green'} />
              </div>

              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A8172]">Statement</div>
                {data.entries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#EBE4D6] py-6 text-center text-[12px] text-[#A79C88]">No entries yet.</div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[#EBE4D6]">
                    <table className="min-w-full text-sm">
                      <tbody className="divide-y divide-[#F5F1E8]">
                        {data.entries.map((e) => (
                          <tr key={e.id} className="hover:bg-[#F3EFE6]/60">
                            <td className="px-3 py-2">
                              <div className="text-[12.5px] text-[#2A241B]">{e.description || (e.entryType === 'payment' ? 'Payment' : 'Charge')}</div>
                              <div className="text-[10.5px] text-[#A79C88]">{fmtDateTime(e.createdAt)}{e.method ? ` · ${e.method}` : ''}</div>
                            </td>
                            <td className={`px-3 py-2 text-right tabular-nums ${e.entryType === 'charge' ? 'text-[#8A3F31]' : 'text-[#356B4E]'}`}>{e.entryType === 'charge' ? '+' : '−'}{money(e.amount)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-[#8A8172]">{money(e.runningBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {c && (
          <div className="flex items-center justify-between gap-2 border-t border-[#EFE9DD] px-5 py-3">
            {canManage ? <button onClick={del} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#9B4A3A] hover:bg-rose-50 disabled:opacity-50"><FaTrash size={11} /> Delete</button> : <span />}
            <div className="flex gap-2">
              {canManage && <Btn variant="ghost" onClick={() => onEdit(c)}><FaPen size={11} /> Edit</Btn>}
              <Btn onClick={() => setPayOpen(true)} disabled={busy}><FaMoneyBillWave size={12} /> Record payment</Btn>
            </div>
          </div>
        )}
      </div>

      {payOpen && (
        <Modal open title="Record company payment" onClose={() => setPayOpen(false)}
          footer={<><Btn variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Btn><Btn onClick={recordPayment} disabled={busy}>{busy ? 'Saving…' : 'Record'}</Btn></>}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" required><input type="number" min="0" step="0.01" className={inputCls} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} autoFocus /></Field>
            <Field label="Method"><select className={inputCls} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{PAY.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
          </div>
          <Field label="Reference"><input className={inputCls} value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} placeholder="Cheque / UTR / note" /></Field>
        </Modal>
      )}
    </div>,
    document.body
  );
}

function Stat({ label, value, tone }) {
  const c = tone === 'green' ? 'text-[#356B4E]' : tone === 'rose' ? 'text-[#8A3F31]' : 'text-[#2A241B]';
  return (
    <div className="rounded-xl border border-[#EBE4D6] bg-white p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-[#A79C88]">{label}</div>
      <div className={`mt-0.5 text-[15px] font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}
