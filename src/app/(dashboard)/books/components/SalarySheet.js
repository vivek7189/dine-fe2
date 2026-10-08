'use client';

// Books → Payroll → Salary sheet: each month's salary for every staff member, worked out live from
// attendance (nothing to generate). Click a row to change that person's days, OT, this month's salary,
// an extra / deduction, or type the final net pay; "Mark month paid" saves it as the month's payroll
// (payslips, advances, bonuses — same numbers as the sheet). Server: GET/PUT /api/payroll/:rid/sheet.
import { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCheck, FaPen, FaUndo, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

const card = { backgroundColor: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
const th = { textAlign: 'left', fontSize: '11px', color: '#6b7280', fontWeight: 700, padding: '8px 10px', borderBottom: '1px solid #eef0f2', whiteSpace: 'nowrap', textTransform: 'uppercase' };
const td = { padding: '10px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', verticalAlign: 'top' };
const input = { width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 4px' };
const btn = (bg, fg = '#fff') => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', borderRadius: 9, background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' });

const monthLabel = (m) => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo - 1, 15).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); };
const shiftMonth = (m, by) => { const [y, mo] = m.split('-').map(Number); const d = new Date(y, mo - 1 + by, 15); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const lastDayLabel = (m) => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo, 0).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };
const fmtDay = (ymd) => { if (!ymd) return ''; const d = new Date(ymd + 'T12:00:00'); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };

export default function SalarySheet({ restaurantId, apiClient, formatCurrency, paymentModes = [], payrollConfig = [], isMobile, onChanged }) {
  // Selected month survives the Payroll tab reloading (it remounts the sheet after a payment).
  const memKey = `salarySheetMonth:${restaurantId || ''}`;
  const remembered = () => { try { const m = sessionStorage.getItem(memKey); return /^\d{4}-\d{2}$/.test(m || '') ? m : null; } catch (_) { return null; } };
  const [month, setMonthState] = useState(null); // null = this month (server decides, restaurant clock)
  const setMonth = (m) => { setMonthState(m); try { if (m) sessionStorage.setItem(memKey, m); } catch (_) {} };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async (m) => {
    if (!restaurantId) return;
    setLoading(true); setErr('');
    try {
      const res = await apiClient.getSalarySheet(restaurantId, m || undefined);
      setData(res); if (!m) setMonth(res.month);
    } catch (e) { setErr(e?.message || 'Could not load the salary sheet'); }
    finally { setLoading(false); }
  }, [restaurantId, apiClient]);
  useEffect(() => { const m = remembered(); if (m) setMonthState(m); load(m); }, [load]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (by) => { const m = shiftMonth(month, by); setMonth(m); load(m); };

  const rows = data?.rows || [];
  const locked = !!data?.locked;
  const runStatus = data?.run?.status;
  const fc = (n) => formatCurrency(Number(n) || 0);

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>Salary sheet</h3>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            {locked
              ? (runStatus === 'paid' ? '✅ Paid — this month is closed.' : 'Payroll for this month is already generated — change it in “Payroll Runs” below.')
              : 'Worked out from attendance and updated live. Click any person to change their salary for this month.'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => go(-1)} disabled={!month || loading} style={btn('#f3f4f6', '#374151')} aria-label="Previous month"><FaChevronLeft size={11} /></button>
          <div style={{ minWidth: 140, textAlign: 'center', fontWeight: 800, fontSize: 14, color: '#111827' }}>{month ? monthLabel(month) : '…'}</div>
          <button onClick={() => go(1)} disabled={!month || loading || (data?.thisMonth && month >= data.thisMonth)} style={btn('#f3f4f6', '#374151')} aria-label="Next month"><FaChevronRight size={11} /></button>
        </div>
      </div>

      {err && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, margin: '8px 0' }}>{err}</div>}
      {loading ? <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Calculating…</div> : rows.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
          {data?.message || 'No staff salaries yet.'} Add them under <b>Salary Configuration</b> below.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginTop: 8, border: '1px solid #f3f4f6', borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 720 : 0 }}>
              <thead><tr>
                <th style={th}>Staff</th><th style={th}>Salary</th><th style={th}>Days paid</th><th style={th}>Overtime</th>
                <th style={th}>Advance / Bonus</th><th style={th}>Extra / Deduct</th><th style={{ ...th, textAlign: 'right' }}>Net pay</th>
              </tr></thead>
              <tbody>
                {rows.map(r => {
                  const edited = r.edits && Object.keys(r.edits).some(k => !['updatedAt', 'updatedBy'].includes(k) && !/Note$/.test(k));
                  const paidDays = (Number(r.presentDays) || 0) + (Number(r.paidLeaveDays) || 0);
                  return (
                    <tr key={r.staffId} onClick={() => !locked && setEditRow(r)} style={{ cursor: locked ? 'default' : 'pointer', background: edited ? '#fffbeb' : undefined }}>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{r.staffName}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{r.role}{edited ? ' · edited' : ''}</div>
                      </td>
                      <td style={td}>
                        <div>{fc(r.grossPay)}</div>
                        {r.edits?.salary != null && <div style={{ fontSize: 11, color: '#b45309' }}>this month only (setup {fc(r.setupSalary)})</div>}
                        {r.fixedDeductions > 0 && <div style={{ fontSize: 11, color: '#9ca3af' }}>− {fc(r.fixedDeductions)} fixed</div>}
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{r.workingDays ? `${paidDays} / ${r.workingDays}` : 'Full month'}</div>
                        {(() => {
                          // Unpaid days = days before joining + real absences; split the deduction per day.
                          const nj = Math.min(Number(r.notJoinedDays) || 0, Number(r.absentDays) || 0);
                          const abs = Math.max(0, (Number(r.absentDays) || 0) - nj);
                          const perDay = r.absentDays > 0 ? (Number(r.lopDeduction) || 0) / r.absentDays : 0;
                          return <>
                            {nj > 0 && <div style={{ fontSize: 11, color: '#6b7280' }}>joined {fmtDay(r.joinedOn)} · {nj} days before · −{fc(perDay * nj)}</div>}
                            {abs > 0 && <div style={{ fontSize: 11, color: '#b91c1c' }}>{abs} absent · −{fc(perDay * abs)}</div>}
                          </>;
                        })()}
                        {r.creditedDays > 0 && <div style={{ fontSize: 11, color: '#059669' }}>+{r.creditedDays} before attendance began</div>}
                        {r.projectedDays > 0 && <div style={{ fontSize: 11, color: '#6366f1' }}>{r.projectedDays} days still to come</div>}
                        {r.edits?.days != null && <div style={{ fontSize: 11, color: '#b45309' }}>set by you</div>}
                      </td>
                      <td style={td}>{r.overtimePay > 0 ? <><div>+{fc(r.overtimePay)}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{r.otHours} h</div></> : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                      <td style={td}>
                        {r.advanceRecovery > 0 && <div style={{ color: '#b91c1c' }}>− {fc(r.advanceRecovery)} advance</div>}
                        {r.bonusPay > 0 && <div style={{ color: '#059669' }}>+ {fc(r.bonusPay)} bonus</div>}
                        {!(r.advanceRecovery > 0) && !(r.bonusPay > 0) && <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={td}>
                        {r.extra > 0 && <div style={{ color: '#059669' }}>+ {fc(r.extra)} {r.edits?.extraNote || ''}</div>}
                        {r.deduct > 0 && <div style={{ color: '#b91c1c' }}>− {fc(r.deduct)} {r.edits?.deductNote || ''}</div>}
                        {r.manualAdjustment !== 0 && <div style={{ color: '#b45309' }}>{r.manualAdjustment > 0 ? '+' : '−'} {fc(Math.abs(r.manualAdjustment))} net set by you</div>}
                        {(r.otherAdjustments || []).map((a, i) => <div key={i} style={{ color: a.kind === 'earning' ? '#059669' : '#b91c1c' }}>{a.kind === 'earning' ? '+' : '−'} {fc(a.amount)} {a.name}</div>)}
                        {!(r.extra > 0) && !(r.deduct > 0) && !r.manualAdjustment && !(r.otherAdjustments || []).length && <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{fc(r.netPay)}</div>
                        {!locked && <div style={{ fontSize: 11, color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaPen size={9} /> change</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{ fontSize: 14, color: '#374151' }}>
              Total for {rows.length} staff: <b style={{ fontSize: 17, color: '#111827' }}>{fc(data?.totals?.net)}</b>
              {data?.inProgress && <span style={{ fontSize: 12, color: '#6366f1' }}> · month in progress (days still to come counted as present)</span>}
            </div>
            {!locked && (data?.inProgress
              ? <button disabled title="The month isn't over — the numbers still count days to come as present" style={{ ...btn('#e5e7eb', '#6b7280'), cursor: 'not-allowed' }}><FaMoneyBillWave size={12} /> Pay after {month ? lastDayLabel(month) : 'month end'}</button>
              : <button onClick={() => setPaying(true)} style={btn('linear-gradient(135deg,#059669,#047857)')}><FaMoneyBillWave size={12} /> Mark {month ? monthLabel(month) : ''} paid</button>)}
          </div>
          {(data?.skipped || []).length > 0 && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Not included: {data.skipped.map(s => `${s.staffName || s.staffId} (${s.reason})`).join(', ')}</div>
          )}
        </>
      )}

      {editRow && (
        <EditRowModal row={editRow} month={month} formatCurrency={formatCurrency} config={payrollConfig.find(c => c.staffId === editRow.staffId)}
          onClose={() => setEditRow(null)}
          onSave={async (body, alsoSetup) => {
            if (alsoSetup) {
              const c = payrollConfig.find(x => x.staffId === editRow.staffId);
              if (c) {
                await apiClient.savePayrollConfig(restaurantId, { staffId: c.staffId, staffName: c.staffName, role: c.role, baseSalary: alsoSetup, payFrequency: c.payFrequency, bankAccount: c.bankAccount, allowances: c.allowances, deductions: c.deductions, ...(c.componentLabels ? { componentLabels: c.componentLabels } : {}) });
                onChanged && onChanged();
              }
            }
            await apiClient.saveSalarySheetRow(restaurantId, month, editRow.staffId, body);
            setEditRow(null); await load(month);
          }} />
      )}
      {paying && (
        <PayMonthModal month={month} total={data?.totals?.net} paymentModes={paymentModes} formatCurrency={formatCurrency}
          onClose={() => setPaying(false)}
          onConfirm={async (payment) => {
            const run = await apiClient.generatePayrollRun(restaurantId, { month });
            await apiClient.updatePayrollRun(restaurantId, run.id, { status: 'paid', payment });
            setPaying(false); await load(month); onChanged && onChanged();
          }} />
      )}
    </div>
  );
}

function Modal({ title, children, onClose, footer }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} aria-label="Close"><FaTimes /></button>
        </div>
        <div style={{ padding: '16px 20px', overflowY: 'auto' }}>{children}</div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>{footer}</div>
      </div>
    </div>
  );
}

function EditRowModal({ row, month, config, formatCurrency, onClose, onSave }) {
  const e = row.edits || {};
  const v = (x) => (x === undefined || x === null ? '' : String(x));
  const [days, setDays] = useState(v(e.days));
  const [ot, setOt] = useState(v(e.otHours));
  const [salary, setSalary] = useState(v(e.salary));
  const [alsoSetup, setAlsoSetup] = useState(false);
  const [extra, setExtra] = useState(v(e.extra)); const [extraNote, setExtraNote] = useState(v(e.extraNote));
  const [deduct, setDeduct] = useState(v(e.deduct)); const [deductNote, setDeductNote] = useState(v(e.deductNote));
  const [net, setNet] = useState(v(e.netPay)); const [netNote, setNetNote] = useState(v(e.netNote));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fc = (n) => formatCurrency(Number(n) || 0);
  const autoDays = (Number(row.presentDays) || 0) + (Number(row.paidLeaveDays) || 0);

  const save = async (body, setup) => {
    setBusy(true); setErr('');
    try { await onSave(body, setup); }
    catch (x) { setErr(x?.message || 'Could not save'); setBusy(false); }
  };
  const submit = () => {
    const n = (s) => (String(s).trim() === '' ? null : Number(s));
    const body = { days: n(days), otHours: n(ot), extra: n(extra), extraNote: extraNote.trim() || null, deduct: n(deduct), deductNote: deductNote.trim() || null, netPay: n(net), netNote: netNote.trim() || null };
    if (row.workingDays && body.days != null && body.days > row.workingDays) { setErr(`Days paid can't be more than the ${row.workingDays} working days`); return; }
    for (const [k, val] of Object.entries(body)) if (typeof val === 'number' && (!Number.isFinite(val) || val < 0)) { setErr('Please enter positive numbers only'); return; }
    const sal = n(salary);
    if (sal != null && (!Number.isFinite(sal) || sal < 0)) { setErr('Please enter a valid salary'); return; }
    // "From this month onward" changes the salary setup itself — then no this-month-only override.
    if (sal != null && alsoSetup) { body.salary = null; return save(body, sal); }
    body.salary = sal;
    return save(body, null);
  };

  return (
    <Modal title={`${row.staffName} — ${monthLabel(month)}`} onClose={onClose}
      footer={<>
        <button disabled={busy} onClick={() => save({ reset: true }, null)} style={btn('#f3f4f6', '#374151')}><FaUndo size={11} /> Back to automatic</button>
        <button disabled={busy} onClick={onClose} style={btn('#f3f4f6', '#374151')}>Cancel</button>
        <button disabled={busy} onClick={submit} style={btn('linear-gradient(135deg,#2563eb,#1d4ed8)')}><FaCheck size={11} /> {busy ? 'Saving…' : 'Save'}</button>
      </>}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        Now: <b>{fc(row.netPay)}</b>. Leave a box empty to keep it automatic.
      </div>
      {err && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <span style={label}>Days paid</span>
          <input type="number" min="0" step="0.5" value={days} onChange={x => setDays(x.target.value)} placeholder={row.workingDays ? `${autoDays} (auto) of ${row.workingDays}` : 'full month'} style={input} />
        </div>
        <div>
          <span style={label}>Overtime hours</span>
          <input type="number" min="0" step="0.5" value={ot} onChange={x => setOt(x.target.value)} placeholder={`${row.otHours || 0} (auto)`} style={input} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span style={label}>Salary</span>
          <input type="number" min="0" value={salary} onChange={x => setSalary(x.target.value)} placeholder={`${config?.baseSalary ?? row.setupSalary} (from salary setup)`} style={input} />
          {salary.trim() !== '' && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#374151', marginTop: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={alsoSetup} onChange={x => setAlsoSetup(x.target.checked)} />
              Also use this salary from {monthLabel(month)} onward (updates the salary setup)
            </label>
          )}
        </div>
        <div>
          <span style={label}>Extra (+)</span>
          <input type="number" min="0" value={extra} onChange={x => setExtra(x.target.value)} placeholder="0" style={input} />
          <input value={extraNote} onChange={x => setExtraNote(x.target.value)} placeholder="What for? e.g. Diwali" style={{ ...input, marginTop: 6, fontSize: 13 }} />
        </div>
        <div>
          <span style={label}>Deduct (−)</span>
          <input type="number" min="0" value={deduct} onChange={x => setDeduct(x.target.value)} placeholder="0" style={input} />
          <input value={deductNote} onChange={x => setDeductNote(x.target.value)} placeholder="What for? e.g. breakage" style={{ ...input, marginTop: 6, fontSize: 13 }} />
        </div>
        <div style={{ gridColumn: '1 / -1', padding: 12, borderRadius: 10, background: '#f9fafb', border: '1px dashed #e5e7eb' }}>
          <span style={label}>Or type the final net pay</span>
          <input type="number" min="0" value={net} onChange={x => setNet(x.target.value)} placeholder="Leave empty to calculate" style={input} />
          <input value={netNote} onChange={x => setNetNote(x.target.value)} placeholder="Reason (shown on the payslip)" style={{ ...input, marginTop: 6, fontSize: 13 }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>The difference is shown on the payslip as a “Manual adjustment”.</div>
        </div>
      </div>
    </Modal>
  );
}

function PayMonthModal({ month, total, paymentModes, formatCurrency, onClose, onConfirm }) {
  const modes = paymentModes.length ? paymentModes : [{ id: 'cash', name: 'Cash' }];
  const [mode, setMode] = useState(modes[0].id);
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const confirm = async () => {
    setBusy(true); setErr('');
    const m = modes.find(x => x.id === mode) || modes[0];
    try { await onConfirm({ mode: m.id, modeName: m.name, ...(reference.trim() ? { reference: reference.trim() } : {}) }); }
    catch (x) { setErr(x?.message || 'Could not mark paid'); setBusy(false); }
  };
  return (
    <Modal title={`Pay ${monthLabel(month)}`} onClose={onClose}
      footer={<>
        <button disabled={busy} onClick={onClose} style={btn('#f3f4f6', '#374151')}>Cancel</button>
        <button disabled={busy} onClick={confirm} style={btn('linear-gradient(135deg,#059669,#047857)')}><FaCheck size={11} /> {busy ? 'Saving…' : `Mark paid · ${formatCurrency(Number(total) || 0)}`}</button>
      </>}>
      {err && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>This saves payslips for everyone on the sheet, recovers advances and pays approved bonuses — then the month is closed.</div>
      <span style={label}>Paid by</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {modes.map(m => (
          <button key={m.id} type="button" onClick={() => setMode(m.id)} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: mode === m.id ? '2px solid #059669' : '1px solid #e5e7eb', background: mode === m.id ? '#ecfdf5' : '#fff' }}>{m.name}</button>
        ))}
      </div>
      <span style={label}>Reference (optional)</span>
      <input value={reference} onChange={x => setReference(x.target.value)} placeholder="e.g. bank transfer ref" style={input} />
    </Modal>
  );
}
