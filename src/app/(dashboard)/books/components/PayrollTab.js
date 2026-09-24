'use client';

import { useState, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaPlay, FaCheck, FaEye, FaTimes, FaSave, FaTrash, FaMoneyBillWave, FaUsers, FaCalendarAlt, FaPrint } from 'react-icons/fa';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};
const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fff', color: '#1f2937',
};
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnPrimary = {
  padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px',
  fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
};

const STATUS_COLORS = {
  draft: { bg: '#fef3c7', color: '#92400e', label: 'Draft' },
  approved: { bg: '#dbeafe', color: '#1e40af', label: 'Approved' },
  paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
};

export default function PayrollTab({
  payrollConfig, payrollRuns, loadingPayroll, isMobile, formatCurrency,
  staffList, onSaveConfig, onDeleteConfig, onGenerateRun, onUpdateRun, onViewSlips,
}) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSlipsModal, setShowSlipsModal] = useState(false);
  const [editConfig, setEditConfig] = useState(null);
  const [slips, setSlips] = useState([]);
  const [slipsRun, setSlipsRun] = useState(null);
  const [runMonth, setRunMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [daysWorked, setDaysWorked] = useState({}); // { staffId: '' | number } — blank = full month

  const [form, setForm] = useState({
    staffId: '', staffName: '', role: '', baseSalary: '',
    allowances: { hra: '', travel: '', food: '' },
    deductions: { pf: '', tax: '', other: '' },
    payFrequency: 'monthly', bankAccount: '',
  });

  const configs = payrollConfig || [];
  const runs = payrollRuns || [];
  const totalMonthly = configs.reduce((s, c) => s + (c.netPay || 0), 0);

  // Print / save-as-PDF a single payslip with the full breakdown (allowances,
  // deductions, LOP, overtime, advance recovery, bonus → net).
  const printPayslip = (slip, run) => {
    const fc = (n) => formatCurrency(n || 0);
    const allow = slip.allowances || {};
    const deduct = slip.deductions || {};
    const att = slip.attendanceSummary || null;
    const rows = [];
    rows.push(['Basic salary', fc(slip.baseSalary), '']);
    Object.entries(allow).forEach(([k, v]) => { if (Number(v) > 0) rows.push([`Allowance · ${k}`, '+' + fc(v), '']); });
    if (slip.bonusPay > 0) rows.push(['Bonus / incentive', '+' + fc(slip.bonusPay), '']);
    if (slip.overtimePay > 0) rows.push(['Overtime pay', '+' + fc(slip.overtimePay), '']);
    Object.entries(deduct).forEach(([k, v]) => { if (Number(v) > 0) rows.push([`Deduction · ${k}`, '', '-' + fc(v)]); });
    if (slip.lopDeduction > 0) rows.push(['Loss of pay (LOP)', '', '-' + fc(slip.lopDeduction)]);
    if (slip.advanceRecovery > 0) rows.push(['Advance recovery', '', '-' + fc(slip.advanceRecovery)]);
    const attHtml = att ? `<div class="att">Working days: ${att.workingDays ?? '-'} · Present: ${att.presentDays ?? '-'} · Paid leave: ${att.paidLeaveDays ?? '-'} · LOP days: ${att.lopDays ?? '-'} · OT hrs: ${att.overtimeHours ?? '-'}</div>` : '';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip · ${(slip.staffName || 'Staff')}</title>
      <style>
        body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;max-width:640px;margin:24px auto;padding:0 16px;}
        h1{font-size:20px;margin:0 0 2px;} .sub{color:#6b7280;font-size:13px;margin-bottom:16px;}
        .meta{display:flex;justify-content:space-between;font-size:13px;color:#374151;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:10px 0;margin-bottom:12px;}
        table{width:100%;border-collapse:collapse;font-size:13px;} th,td{text-align:left;padding:7px 4px;border-bottom:1px solid #f3f4f6;}
        th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3){text-align:right;} .earn{color:#047857;} .ded{color:#b91c1c;}
        .net{display:flex;justify-content:space-between;font-size:18px;font-weight:800;margin-top:14px;padding-top:12px;border-top:2px solid #111827;}
        .att{font-size:12px;color:#6b7280;margin-top:14px;} .foot{margin-top:24px;font-size:11px;color:#9ca3af;text-align:center;}
        @media print{button{display:none;}}
      </style></head><body>
      <h1>Payslip</h1><div class="sub">${run?.month || slip.month || ''}</div>
      <div class="meta"><div><b>${(slip.staffName || 'Staff')}</b>${slip.role ? ' · ' + slip.role : ''}</div><div>Pay period: ${run?.month || slip.month || ''}</div></div>
      <table><thead><tr><th>Component</th><th>Earnings</th><th>Deductions</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${r[0]}</td><td class="earn">${r[1] || ''}</td><td class="ded">${r[2] || ''}</td></tr>`).join('')}
      </tbody></table>
      <div class="net"><span>Net pay</span><span>${fc(slip.netPay)}</span></div>
      ${attHtml}
      <div class="foot">Generated by DineOpen</div>
      <script>window.onload=function(){setTimeout(function(){window.print();},250);}</script>
      </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const openAdd = () => {
    setEditConfig(null);
    setForm({ staffId: '', staffName: '', role: '', baseSalary: '', allowances: { hra: '', travel: '', food: '' }, deductions: { pf: '', tax: '', other: '' }, payFrequency: 'monthly', bankAccount: '' });
    setShowConfigModal(true);
  };

  const openEdit = (cfg) => {
    setEditConfig(cfg);
    setForm({
      staffId: cfg.staffId, staffName: cfg.staffName, role: cfg.role,
      baseSalary: String(cfg.baseSalary || ''),
      allowances: { hra: String(cfg.allowances?.hra || ''), travel: String(cfg.allowances?.travel || ''), food: String(cfg.allowances?.food || '') },
      deductions: { pf: String(cfg.deductions?.pf || ''), tax: String(cfg.deductions?.tax || ''), other: String(cfg.deductions?.other || '') },
      payFrequency: cfg.payFrequency || 'monthly', bankAccount: cfg.bankAccount || '',
    });
    setShowConfigModal(true);
  };

  const handleSave = async () => {
    if (!form.staffId || !form.baseSalary) return;
    await onSaveConfig({
      ...form,
      baseSalary: parseFloat(form.baseSalary),
      allowances: { hra: parseFloat(form.allowances.hra || 0), travel: parseFloat(form.allowances.travel || 0), food: parseFloat(form.allowances.food || 0) },
      deductions: { pf: parseFloat(form.deductions.pf || 0), tax: parseFloat(form.deductions.tax || 0), other: parseFloat(form.deductions.other || 0) },
    });
    setShowConfigModal(false);
  };

  const handleViewSlips = async (run) => {
    setSlipsRun(run);
    const data = await onViewSlips(run.id);
    setSlips(data?.slips || []);
    setShowSlipsModal(true);
  };

  if (loadingPayroll) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Loading payroll...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Monthly Payroll</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaMoneyBillWave size={12} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{formatCurrency(totalMonthly)}</div>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Staff Configured</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUsers size={12} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{configs.length}</div>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Runs This Year</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaCalendarAlt size={12} color="#92400e" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{runs.length}</div>
        </div>
      </div>

      {/* Salary Configuration */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Salary Configuration</h3>
          <button onClick={openAdd} style={btnPrimary}><FaPlus size={11} /> Add Staff Salary</button>
        </div>
        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <FaUsers size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px' }}>No salary configurations yet. Add staff salary details to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['Name', 'Role', 'Base', 'Allowances', 'Deductions', 'Net Pay', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {configs.map(cfg => (
                  <tr key={cfg.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{cfg.staffName}</td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{cfg.role}</td>
                    <td style={{ padding: '12px', color: '#111827' }}>{formatCurrency(cfg.baseSalary)}</td>
                    <td style={{ padding: '12px', color: '#059669' }}>+{formatCurrency((cfg.allowances?.hra || 0) + (cfg.allowances?.travel || 0) + (cfg.allowances?.food || 0))}</td>
                    <td style={{ padding: '12px', color: '#dc2626' }}>-{formatCurrency((cfg.deductions?.pf || 0) + (cfg.deductions?.tax || 0) + (cfg.deductions?.other || 0))}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#111827' }}>{formatCurrency(cfg.netPay)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openEdit(cfg)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaSave size={11} color="#6b7280" />
                        </button>
                        <button onClick={() => onDeleteConfig(cfg.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaTrash size={11} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payroll Run */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Payroll Runs</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="month" value={runMonth} onChange={e => setRunMonth(e.target.value)}
              style={{ ...inputStyle, width: 'auto', padding: '8px 12px', fontSize: '13px' }} />
            <button onClick={() => { setDaysWorked({}); setShowGenerateModal(true); }} style={btnPrimary} disabled={configs.length === 0}>
              <FaPlay size={10} /> Generate
            </button>
          </div>
        </div>
        {runs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <FaCalendarAlt size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px' }}>No payroll runs yet. Configure staff salaries and generate your first run.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['Month', 'Staff', 'Gross', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map(run => {
                  const st = STATUS_COLORS[run.status] || STATUS_COLORS.draft;
                  return (
                    <tr key={run.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{run.month}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{run.staffCount}</td>
                      <td style={{ padding: '12px', color: '#111827' }}>{formatCurrency(run.totalGross)}</td>
                      <td style={{ padding: '12px', color: '#dc2626' }}>-{formatCurrency(run.totalDeductions)}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#111827' }}>{formatCurrency(run.totalNet)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleViewSlips(run)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="View Slips">
                            <FaEye size={11} color="#6b7280" />
                          </button>
                          {run.status === 'draft' && (
                            <button onClick={() => onUpdateRun(run.id, 'approved')} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Approve">
                              <FaCheck size={11} color="#2563eb" />
                            </button>
                          )}
                          {run.status === 'approved' && (
                            <button onClick={() => onUpdateRun(run.id, 'paid')} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Mark Paid">
                              <FaMoneyBillWave size={11} color="#059669" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Run Modal — optional per-staff days-worked to pro-rate salary */}
      {showGenerateModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setShowGenerateModal(false); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '92%', maxWidth: '520px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Generate Payroll — {runMonth}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>Leave “Days worked” blank for full-month pay. Enter days only for staff who were absent — the salary is pro-rated (LOP for the missing days).</p>
            </div>
            <div style={{ padding: '12px 20px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 12px', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Staff</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Days worked</div>
                {configs.map(cfg => (
                  <Fragment key={cfg.staffId || cfg.id}>
                    <div style={{ fontSize: '13px', color: '#111827' }}>
                      {cfg.staffName || cfg.staffId} <span style={{ color: '#9ca3af', fontSize: '11px' }}>· {formatCurrency(cfg.grossPay || cfg.baseSalary || 0)}</span>
                    </div>
                    <input type="number" min="0" step="0.5" placeholder="Full"
                      value={daysWorked[cfg.staffId] ?? ''}
                      onChange={e => setDaysWorked(d => ({ ...d, [cfg.staffId]: e.target.value }))}
                      style={{ ...inputStyle, width: '90px', padding: '8px 10px', fontSize: '13px', textAlign: 'right' }} />
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowGenerateModal(false)} style={{ ...inputStyle, width: 'auto', padding: '9px 16px', cursor: 'pointer', backgroundColor: '#f9fafb', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => {
                const clean = {};
                Object.entries(daysWorked).forEach(([sid, v]) => { if (v !== '' && v != null && !isNaN(Number(v))) clean[sid] = Number(v); });
                onGenerateRun(runMonth, clean);
                setShowGenerateModal(false);
              }} style={btnPrimary}>
                <FaPlay size={10} /> Generate
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Config Modal */}
      {showConfigModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setShowConfigModal(false); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>{editConfig ? 'Edit' : 'Add'} Salary Config</h2>
              <button onClick={() => setShowConfigModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <FaTimes size={13} />
              </button>
            </div>
            <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#fafcfe' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                <div>
                  <label style={labelStyle}>Staff Member *</label>
                  <select value={form.staffId} onChange={e => {
                    const s = (staffList || []).find(st => st.id === e.target.value);
                    setForm(f => ({ ...f, staffId: e.target.value, staffName: s?.name || s?.displayName || '', role: s?.role || '' }));
                  }} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select staff...</option>
                    {(staffList || []).map(s => <option key={s.id} value={s.id}>{s.name || s.displayName} ({s.role})</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Base Salary *</label>
                  <input type="number" value={form.baseSalary} onChange={e => setForm(f => ({ ...f, baseSalary: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...labelStyle, color: '#059669' }}>Allowances</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {['hra', 'travel', 'food'].map(k => (
                      <div key={k}>
                        <label style={{ ...labelStyle, fontSize: '10px', textTransform: 'capitalize' }}>{k}</label>
                        <input type="number" value={form.allowances[k]} onChange={e => setForm(f => ({ ...f, allowances: { ...f.allowances, [k]: e.target.value } }))} placeholder="0" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...labelStyle, color: '#dc2626' }}>Deductions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {['pf', 'tax', 'other'].map(k => (
                      <div key={k}>
                        <label style={{ ...labelStyle, fontSize: '10px', textTransform: 'uppercase' }}>{k}</label>
                        <input type="number" value={form.deductions[k]} onChange={e => setForm(f => ({ ...f, deductions: { ...f.deductions, [k]: e.target.value } }))} placeholder="0" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Pay Frequency</label>
                  <select value={form.payFrequency} onChange={e => setForm(f => ({ ...f, payFrequency: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Bank Account</label>
                  <input value={form.bankAccount} onChange={e => setForm(f => ({ ...f, bankAccount: e.target.value }))} placeholder="Account number" style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowConfigModal(false)} style={{ padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btnPrimary}><FaSave size={12} /> Save</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Pay Slips Modal */}
      {showSlipsModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setShowSlipsModal(false); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Pay Slips — {slipsRun?.month}</h2>
              <button onClick={() => setShowSlipsModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <FaTimes size={13} />
              </button>
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
              {slips.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No pay slips found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {slips.map(slip => (
                    <div key={slip.id} style={{ ...cardStyle, padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{slip.staffName}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{slip.role}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(slip.netPay)}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Base: {formatCurrency(slip.baseSalary)}</div>
                          </div>
                          <button onClick={() => printPayslip(slip, slipsRun)} title="Print / save PDF" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                            <FaPrint size={11} /> Print
                          </button>
                        </div>
                      </div>
                      {/* Advance recovery / bonus adjustments (from the payroll run) */}
                      {(slip.advanceRecovery > 0 || slip.bonusPay > 0) && (
                        <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '12px', flexWrap: 'wrap' }}>
                          {slip.bonusPay > 0 && <span style={{ color: '#059669', fontWeight: 600 }}>Bonus: +{formatCurrency(slip.bonusPay)}</span>}
                          {slip.advanceRecovery > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>Advance recovery: -{formatCurrency(slip.advanceRecovery)}</span>}
                        </div>
                      )}
                      {slip.attendanceSummary && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>Attendance Summary</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '12px' }}>
                            <div><span style={{ color: '#9ca3af' }}>Present:</span> <span style={{ fontWeight: 600, color: '#059669' }}>{slip.attendanceSummary.presentDays}</span></div>
                            <div><span style={{ color: '#9ca3af' }}>Leaves:</span> <span style={{ fontWeight: 600, color: '#3b82f6' }}>{slip.attendanceSummary.paidLeaveDays}</span></div>
                            <div><span style={{ color: '#9ca3af' }}>LOP:</span> <span style={{ fontWeight: 600, color: '#dc2626' }}>{slip.attendanceSummary.lopDays}</span></div>
                            <div><span style={{ color: '#9ca3af' }}>OT Hrs:</span> <span style={{ fontWeight: 600, color: '#f59e0b' }}>{slip.attendanceSummary.overtimeHours}</span></div>
                          </div>
                          {(slip.lopDeduction > 0 || slip.overtimePay > 0) && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
                              {slip.lopDeduction > 0 && <span style={{ color: '#dc2626' }}>LOP Deduction: -{formatCurrency(slip.lopDeduction)}</span>}
                              {slip.overtimePay > 0 && <span style={{ color: '#059669' }}>OT Pay: +{formatCurrency(slip.overtimePay)}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
