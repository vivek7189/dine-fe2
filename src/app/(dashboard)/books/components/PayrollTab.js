'use client';

import { useState, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaPlay, FaCheck, FaEye, FaTimes, FaSave, FaTrash, FaMoneyBillWave, FaUsers, FaCalendarAlt, FaPrint, FaCog, FaSlidersH } from 'react-icons/fa';
import useHrSettings from '../hooks/useHrSettings';
import { PayrollSettingsPanel } from './HrSettingsPanels';

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

const sumValues = (o) => Object.values(o || {}).reduce((t, v) => t + (Number(v) || 0), 0);
const escapeHtml = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STATUS_COLORS = {
  draft: { bg: '#fef3c7', color: '#92400e', label: 'Draft' },
  approved: { bg: '#dbeafe', color: '#1e40af', label: 'Approved' },
  paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
};

export default function PayrollTab({
  payrollConfig, payrollRuns, loadingPayroll, isMobile, formatCurrency,
  staffList, onSaveConfig, onDeleteConfig, onGenerateRun, onUpdateRun, onDeleteRun, onViewSlips, onSaveAdjustments, onSaveSlipAttendance,
  restaurantId, apiClient,
}) {
  // Pay components + payment modes are the restaurant's own lists (⚙ Settings; defaults HRA/Travel/
  // Food, PF/Tax/Other, Cash/Bank/UPI/Cheque). Allowance/deduction maps stay keyed by component.
  const { settings: hr, save: saveHr } = useHrSettings(restaurantId, apiClient);
  const earningTypes = hr.payroll.earnings;
  const deductionTypes = hr.payroll.deductions;
  const paymentModes = hr.payroll.paymentModes;
  const [showSettings, setShowSettings] = useState(false);
  const [adjustSlip, setAdjustSlip] = useState(null);   // slip being adjusted (one-off lines)
  const [payRun, setPayRun] = useState(null);           // run being marked paid
  const [confirmDeleteRun, setConfirmDeleteRun] = useState(null); // run id waiting for "Delete?" confirm
  // Name for a component key: current settings → name saved with the salary/payslip → the key.
  const labelFor = (kind, key, saved) => {
    const list = kind === 'deduction' ? deductionTypes : earningTypes;
    return (list.find(x => x.key === key) || {}).name || (saved && saved[key]) || key;
  };
  // A payslip is a record: print the name it was generated with, even if renamed since.
  const slipLabel = (kind, key, saved) => (saved && saved[key]) || labelFor(kind, key);
  // Components to show in the salary form: the settings list, plus any key already saved on this
  // salary that is no longer in the list (so nothing is silently dropped).
  const formKeys = (kind, values) => {
    const list = (kind === 'deduction' ? deductionTypes : earningTypes).map(x => x.key);
    const extra = Object.keys(values || {}).filter(k => !list.includes(k));
    return [...list, ...extra];
  };
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
  const [otHours, setOtHours] = useState({});         // { staffId: '' | number } — blank = from attendance / none
  const [editDaysSlip, setEditDaysSlip] = useState(null); // payslip whose days / OT are being edited

  const [form, setForm] = useState({
    staffId: '', staffName: '', role: '', baseSalary: '',
    allowances: {}, deductions: {}, componentLabels: {},
    payFrequency: 'monthly', bankAccount: '', paymentMode: '',
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
    const adj = (slip.adjustments && Array.isArray(slip.adjustments.items)) ? slip.adjustments.items : [];
    rows.push(['Basic salary', fc(slip.baseSalary), '']);
    Object.entries(allow).forEach(([k, v]) => { if (Number(v) > 0) rows.push([slipLabel('earning', k, slip.componentLabels), '+' + fc(v), '']); });
    if (slip.bonusPay > 0) rows.push(['Bonus / incentive', '+' + fc(slip.bonusPay), '']);
    if (slip.overtimePay > 0) rows.push(['Overtime pay', '+' + fc(slip.overtimePay), '']);
    adj.filter(a => a.kind === 'earning').forEach(a => rows.push([a.name + (a.reason ? ` — ${a.reason}` : ''), '+' + fc(a.amount), '']));
    Object.entries(deduct).forEach(([k, v]) => { if (Number(v) > 0) rows.push([slipLabel('deduction', k, slip.componentLabels), '', '-' + fc(v)]); });
    if (slip.lopDeduction > 0) rows.push(['Loss of pay (LOP)', '', '-' + fc(slip.lopDeduction)]);
    if (slip.advanceRecovery > 0) rows.push(['Advance recovery', '', '-' + fc(slip.advanceRecovery)]);
    adj.filter(a => a.kind === 'deduction').forEach(a => rows.push([a.name + (a.reason ? ` — ${a.reason}` : ''), '', '-' + fc(a.amount)]));
    const pay = slip.payment || run?.payment || null;
    const plannedMode = !pay && slip.paymentMode ? (paymentModes.find(m => m.id === slip.paymentMode) || {}).name || slip.paymentMode : null;
    const payHtml = pay ? `<div class="att">Paid by: ${escapeHtml(pay.modeName || pay.mode)}${pay.reference ? ' · Ref: ' + escapeHtml(pay.reference) : ''}</div>`
      : (plannedMode ? `<div class="att">Payment mode: ${escapeHtml(plannedMode)}</div>` : '');
    const attHtml = att ? `<div class="att">Working days: ${att.workingDays ?? '-'} · Present: ${att.presentDays ?? '-'} · Paid leave: ${att.paidLeaveDays ?? '-'} · LOP days: ${att.lopDays ?? '-'}${att.hoursWorked != null ? ` · Hours worked: ${att.hoursWorked}` : ''} · OT hrs: ${att.overtimeHours ?? '-'}</div>` : '';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip · ${escapeHtml(slip.staffName || 'Staff')}</title>
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
      <div class="meta"><div><b>${escapeHtml(slip.staffName || 'Staff')}</b>${slip.role ? ' · ' + escapeHtml(slip.role) : ''}</div><div>Pay period: ${run?.month || slip.month || ''}</div></div>
      <table><thead><tr><th>Component</th><th>Earnings</th><th>Deductions</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${escapeHtml(r[0])}</td><td class="earn">${r[1] || ''}</td><td class="ded">${r[2] || ''}</td></tr>`).join('')}
      </tbody></table>
      <div class="net"><span>Net pay</span><span>${fc(slip.netPay)}</span></div>
      ${attHtml}
      ${payHtml}
      <div class="foot">Generated by DineOpen</div>
      <script>window.onload=function(){setTimeout(function(){window.print();},250);}</script>
      </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const openAdd = () => {
    setEditConfig(null);
    setForm({ staffId: '', staffName: '', role: '', baseSalary: '', allowances: {}, deductions: {}, componentLabels: {}, payFrequency: 'monthly', bankAccount: '', paymentMode: '' });
    setShowConfigModal(true);
  };

  const openEdit = (cfg) => {
    setEditConfig(cfg);
    setForm({
      staffId: cfg.staffId, staffName: cfg.staffName, role: cfg.role,
      baseSalary: String(cfg.baseSalary || ''),
      allowances: Object.fromEntries(Object.entries(cfg.allowances || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, String(v)])),
      deductions: Object.fromEntries(Object.entries(cfg.deductions || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, String(v)])),
      componentLabels: cfg.componentLabels || {},
      payFrequency: cfg.payFrequency || 'monthly', bankAccount: cfg.bankAccount || '', paymentMode: cfg.paymentMode || '',
    });
    setShowConfigModal(true);
  };

  const handleSave = async () => {
    if (!form.staffId || !form.baseSalary) return;
    // Keep only filled components; remember each one's name for payslips.
    const pick = (values, kind) => {
      const out = {};
      Object.entries(values || {}).forEach(([k, v]) => { const n = parseFloat(v); if (n > 0) out[k] = n; });
      Object.keys(out).forEach(k => { labels[k] = labelFor(kind, k, form.componentLabels); });
      return out;
    };
    const labels = {};
    const allowances = pick(form.allowances, 'earning');
    const deductions = pick(form.deductions, 'deduction');
    await onSaveConfig({
      ...form,
      baseSalary: parseFloat(form.baseSalary),
      allowances,
      deductions,
      componentLabels: labels,
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setShowSettings(true)} title="Allowances, deductions & payment modes" style={{ ...btnPrimary, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', boxShadow: 'none' }}><FaCog size={11} /> Settings</button>
            <button onClick={openAdd} style={btnPrimary}><FaPlus size={11} /> Add Staff Salary</button>
          </div>
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
                    <td style={{ padding: '12px', color: '#059669' }}>+{formatCurrency(sumValues(cfg.allowances))}</td>
                    <td style={{ padding: '12px', color: '#dc2626' }}>-{formatCurrency(sumValues(cfg.deductions))}</td>
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
                      <td style={{ padding: '12px', fontWeight: 700, color: '#111827' }}>
                        {formatCurrency(run.totalNet)}
                        {(() => {
                          // Why net ≠ gross − deductions: loss of pay, advance recovery, bonus and one-off
                          // payslip lines are applied per payslip. Show the non-zero ones so the row adds up.
                          const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
                          const lop = r2(run.totalLopDeduction), adv = r2(run.totalAdvanceRecovery), bonus = r2(run.totalBonus), ot = r2(run.totalOvertimePay);
                          const other = r2(r2(run.totalNet) - (r2(run.totalGross) - r2(run.totalDeductions) - lop - adv + bonus + ot));
                          const parts = [];
                          if (lop) parts.push(`LOP −${formatCurrency(lop)}`);
                          if (ot) parts.push(`OT +${formatCurrency(ot)}`);
                          if (adv) parts.push(`advances −${formatCurrency(adv)}`);
                          if (bonus) parts.push(`bonus +${formatCurrency(bonus)}`);
                          if (Math.abs(other) >= 1) parts.push(`other ${other > 0 ? '+' : '−'}${formatCurrency(Math.abs(other))}`);
                          return parts.length ? <div style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginTop: '3px' }}>{parts.join(' · ')}</div> : null;
                        })()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                        {run.status === 'paid' && run.payment && (
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{run.payment.modeName || run.payment.mode}{run.payment.reference ? ` · ${run.payment.reference}` : ''}</div>
                        )}
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
                            <button onClick={() => setPayRun(run)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Mark Paid">
                              <FaMoneyBillWave size={11} color="#059669" />
                            </button>
                          )}
                          {run.status !== 'paid' && onDeleteRun && (confirmDeleteRun === run.id ? (
                            <>
                              <button onClick={async () => { await onDeleteRun(run.id); setConfirmDeleteRun(null); }} style={{ height: '32px', padding: '0 10px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#dc2626', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} title="Delete this run (advances and bonuses it used are restored)">Delete run?</button>
                              <button onClick={() => setConfirmDeleteRun(null)} style={{ height: '32px', padding: '0 10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDeleteRun(run.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete run (not paid yet) — generate it again after fixing salaries">
                              <FaTrash size={11} color="#dc2626" />
                            </button>
                          ))}
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
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>{hr.payroll.lopFromAttendance !== false
                  ? 'Leave “Days worked” blank to use attendance: staff who clock in are paid for days present + paid leave; staff who never clock in get full pay. Typing days overrides attendance for that person. (Change this in ⚙ Settings.)'
                  : 'Leave “Days worked” blank for full-month pay. Enter days only for staff who were absent — the salary is pro-rated (LOP for the missing days).'}</p>
            </div>
            <div style={{ padding: '12px 20px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px 12px', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Staff</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Days worked</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }} title="Blank = from attendance / biometric hours (Payroll → Settings → Overtime)">OT hours</div>
                {configs.map(cfg => (
                  <Fragment key={cfg.staffId || cfg.id}>
                    <div style={{ fontSize: '13px', color: '#111827' }}>
                      {cfg.staffName || cfg.staffId} <span style={{ color: '#9ca3af', fontSize: '11px' }}>· {formatCurrency(cfg.grossPay || cfg.baseSalary || 0)}</span>
                    </div>
                    <input type="number" min="0" step="0.5" placeholder="Full"
                      value={daysWorked[cfg.staffId] ?? ''}
                      onChange={e => setDaysWorked(d => ({ ...d, [cfg.staffId]: e.target.value }))}
                      style={{ ...inputStyle, width: '90px', padding: '8px 10px', fontSize: '13px', textAlign: 'right' }} />
                    <input type="number" min="0" step="0.5" placeholder="Auto"
                      value={otHours[cfg.staffId] ?? ''}
                      onChange={e => setOtHours(d => ({ ...d, [cfg.staffId]: e.target.value }))}
                      style={{ ...inputStyle, width: '80px', padding: '8px 10px', fontSize: '13px', textAlign: 'right' }} />
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowGenerateModal(false)} style={{ ...inputStyle, width: 'auto', padding: '9px 16px', cursor: 'pointer', backgroundColor: '#f9fafb', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => {
                const clean = {};
                Object.entries(daysWorked).forEach(([sid, v]) => { if (v !== '' && v != null && !isNaN(Number(v))) clean[sid] = Number(v); });
                const cleanOt = {};
                Object.entries(otHours).forEach(([sid, v]) => { if (v !== '' && v != null && !isNaN(Number(v))) cleanOt[sid] = Number(v); });
                onGenerateRun(runMonth, clean, cleanOt);
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {formKeys('earning', form.allowances).map(k => (
                      <div key={k}>
                        <label style={{ ...labelStyle, fontSize: '10px', textTransform: 'none' }}>{labelFor('earning', k, form.componentLabels)}</label>
                        <input type="number" min="0" value={form.allowances[k] ?? ''} onChange={e => setForm(f => ({ ...f, allowances: { ...f.allowances, [k]: e.target.value } }))} placeholder="0" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                  {earningTypes.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af' }}>No allowance types — add them in ⚙ Settings.</div>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...labelStyle, color: '#dc2626' }}>Deductions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {formKeys('deduction', form.deductions).map(k => (
                      <div key={k}>
                        <label style={{ ...labelStyle, fontSize: '10px', textTransform: 'none' }}>{labelFor('deduction', k, form.componentLabels)}</label>
                        <input type="number" min="0" value={form.deductions[k] ?? ''} onChange={e => setForm(f => ({ ...f, deductions: { ...f.deductions, [k]: e.target.value } }))} placeholder="0" style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                  {deductionTypes.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af' }}>No deduction types — add them in ⚙ Settings.</div>}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Fixed monthly amounts. One-off items (gift, penalty…) go on the payslip after generating a run.</div>
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
                <div>
                  <label style={labelStyle}>Payment Mode</label>
                  <select value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }} title="How this person is usually paid — pre-selected when the run is marked paid">
                    <option value="">Same as the run</option>
                    {paymentModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
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
                          {slipsRun?.status !== 'paid' && onSaveSlipAttendance && (
                            <button onClick={() => setEditDaysSlip(slip)} title="Days present, paid leave and OT hours — LOP, OT pay and net recalculate" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                              <FaCalendarAlt size={11} /> Days & OT
                            </button>
                          )}
                          {slipsRun?.status !== 'paid' && onSaveAdjustments && (
                            <button onClick={() => setAdjustSlip(slip)} title="Add one-off earnings / deductions" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                              <FaSlidersH size={11} /> Adjust
                            </button>
                          )}
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
                      {slip.adjustments?.items?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {slip.adjustments.items.map(a => (
                            <span key={a.id} title={a.reason || ''} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: a.kind === 'deduction' ? '#fef2f2' : '#ecfdf5', color: a.kind === 'deduction' ? '#b91c1c' : '#047857' }}>
                              {a.name}: {a.kind === 'deduction' ? '-' : '+'}{formatCurrency(a.amount)}
                            </span>
                          ))}
                        </div>
                      )}
                      {!slip.payment && slipsRun?.status !== 'paid' && slip.paymentMode && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>Payment mode: {(paymentModes.find(m => m.id === slip.paymentMode) || {}).name || slip.paymentMode}</div>
                      )}
                      {(slip.payment || (slipsRun?.status === 'paid' && slipsRun?.payment)) && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                          Paid by {(slip.payment || slipsRun.payment).modeName || (slip.payment || slipsRun.payment).mode}{(slip.payment || slipsRun.payment).reference ? ` · Ref ${(slip.payment || slipsRun.payment).reference}` : ''}
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
                          {slip.attendanceSummary.hoursWorked != null && (
                            <div style={{ fontSize: '12px', marginTop: '4px' }}><span style={{ color: '#9ca3af' }}>Hours worked:</span> <span style={{ fontWeight: 600 }}>{slip.attendanceSummary.hoursWorked}</span></div>
                          )}
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

      {adjustSlip && typeof document !== 'undefined' && createPortal(
        <AdjustmentsModal
          slip={adjustSlip}
          earningTypes={earningTypes}
          deductionTypes={deductionTypes}
          formatCurrency={formatCurrency}
          onClose={() => setAdjustSlip(null)}
          onSave={async (items) => {
            const res = await onSaveAdjustments(slipsRun.id, adjustSlip.id, items);
            if (!res?.slip) return false;
            setSlips(list => list.map(x => (x.id === adjustSlip.id ? { ...x, ...res.slip } : x)));
            setAdjustSlip(null);
            return true;
          }}
        />,
        document.body
      )}

      {editDaysSlip && typeof document !== 'undefined' && createPortal(
        <EditDaysModal
          slip={editDaysSlip}
          formatCurrency={formatCurrency}
          onClose={() => setEditDaysSlip(null)}
          onSave={async (data) => {
            const res = await onSaveSlipAttendance(slipsRun.id, editDaysSlip.id, data);
            if (!res?.slip) return false;
            setSlips(list => list.map(x => (x.id === editDaysSlip.id ? { ...x, ...res.slip } : x)));
            setEditDaysSlip(null);
            return true;
          }}
        />,
        document.body
      )}

      {payRun && typeof document !== 'undefined' && createPortal(
        <MarkPaidModal
          run={payRun}
          paymentModes={paymentModes}
          formatCurrency={formatCurrency}
          loadSlips={onViewSlips}
          onClose={() => setPayRun(null)}
          onConfirm={async (extra) => { if (await onUpdateRun(payRun.id, 'paid', extra)) setPayRun(null); }}
        />,
        document.body
      )}

      {showSettings && typeof document !== 'undefined' && createPortal(
        <PayrollSettingsPanel settings={hr} onSave={saveHr} onClose={() => setShowSettings(false)} />,
        document.body
      )}
    </div>
  );
}

// One-off lines on a payslip before the run is paid (gift, compensation, penalty…), each with a reason.
function AdjustmentsModal({ slip, earningTypes, deductionTypes, formatCurrency, onClose, onSave }) {
  const [items, setItems] = useState(() => (slip.adjustments?.items || []).map(x => ({ ...x, amount: String(x.amount) })));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const typesFor = (kind) => (kind === 'deduction' ? deductionTypes : earningTypes);
  const addLine = (kind) => {
    const first = typesFor(kind)[0];
    setItems(list => [...list, { id: `new${Date.now()}${list.length}`, kind, key: first ? first.key : '', name: first ? first.name : '', amount: '', reason: '' }]);
  };
  const setLine = (i, patch) => setItems(list => list.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const netBefore = slip.adjustments && slip.adjustments.netBefore != null ? Number(slip.adjustments.netBefore) : Number(slip.netPay || 0);
  const earn = items.filter(x => x.kind === 'earning').reduce((t, x) => t + (Number(x.amount) || 0), 0);
  const ded = items.filter(x => x.kind === 'deduction').reduce((t, x) => t + (Number(x.amount) || 0), 0);
  const save = async () => {
    setErr('');
    const bad = items.find(x => !(Number(x.amount) > 0) || !String(x.name || '').trim());
    if (bad) { setErr('Every line needs a name and an amount above 0.'); return; }
    setSaving(true);
    const ok = await onSave(items.map(x => ({ id: x.id, kind: x.kind, key: x.key || null, name: String(x.name).trim(), amount: Number(x.amount), reason: String(x.reason || '').trim() })));
    setSaving(false);
    if (!ok) setErr('Could not save — please try again.');
  };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10004, padding: 12 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Adjust payslip — {slip.staffName}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>One-off earnings (gift, compensation, extra shift…) or deductions (penalty, breakage…) for this month only.</div>
        </div>
        <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 12 }}>No adjustments on this payslip.</div>}
          {items.map((x, i) => {
            const types = typesFor(x.kind);
            const known = types.some(t => t.key === x.key);
            return (
              <div key={x.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px,0.8fr) minmax(130px,1.3fr) minmax(80px,0.7fr) minmax(120px,1.4fr) auto', gap: 6, alignItems: 'center' }}>
                <select value={x.kind} onChange={e => { const t = typesFor(e.target.value)[0]; setLine(i, { kind: e.target.value, key: t ? t.key : '', name: t ? t.name : '' }); }}
                  style={{ ...inputStyle, padding: '7px 8px', fontSize: 12, color: x.kind === 'deduction' ? '#b91c1c' : '#047857', fontWeight: 700 }}>
                  <option value="earning">+ Earning</option>
                  <option value="deduction">− Deduction</option>
                </select>
                {known || !x.key ? (
                  <select value={known ? x.key : '__other'} onChange={e => {
                    if (e.target.value === '__other') setLine(i, { key: '', name: '' });
                    else { const t = types.find(tt => tt.key === e.target.value); setLine(i, { key: t.key, name: t.name }); }
                  }} style={{ ...inputStyle, padding: '7px 8px', fontSize: 12 }}>
                    {types.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
                    <option value="__other">Other…</option>
                  </select>
                ) : (
                  <input value={x.name} readOnly style={{ ...inputStyle, padding: '7px 8px', fontSize: 12, background: '#f9fafb' }} />
                )}
                <input type="number" min="0" value={x.amount} onChange={e => setLine(i, { amount: e.target.value })} placeholder="Amount" style={{ ...inputStyle, padding: '7px 8px', fontSize: 12 }} />
                {(!known && !x.key) ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input value={x.name} maxLength={60} onChange={e => setLine(i, { name: e.target.value })} placeholder="Name" style={{ ...inputStyle, padding: '7px 8px', fontSize: 12 }} />
                    <input value={x.reason} maxLength={160} onChange={e => setLine(i, { reason: e.target.value })} placeholder="Reason" style={{ ...inputStyle, padding: '7px 8px', fontSize: 12 }} />
                  </div>
                ) : (
                  <input value={x.reason} maxLength={160} onChange={e => setLine(i, { reason: e.target.value })} placeholder="Reason (e.g. Diwali gift)" style={{ ...inputStyle, padding: '7px 8px', fontSize: 12 }} />
                )}
                <button onClick={() => setItems(list => list.filter((_, k) => k !== i))} title="Remove" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash size={10} /></button>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => addLine('earning')} style={{ ...btnPrimary, padding: '7px 12px', fontSize: 12, background: '#059669', boxShadow: 'none' }}><FaPlus size={10} /> Earning</button>
            <button onClick={() => addLine('deduction')} style={{ ...btnPrimary, padding: '7px 12px', fontSize: 12, background: '#dc2626', boxShadow: 'none' }}><FaPlus size={10} /> Deduction</button>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#374151', marginRight: 'auto' }}>
            Net {formatCurrency(netBefore)} <span style={{ color: '#059669' }}>+{formatCurrency(earn)}</span> <span style={{ color: '#dc2626' }}>−{formatCurrency(ded)}</span> = <b>{formatCurrency(netBefore + earn - ded)}</b>
            {netBefore + earn - ded < 0 && <span style={{ color: '#b91c1c', fontWeight: 700 }}> (negative!)</span>}
            {err && <div style={{ color: '#b91c1c', marginTop: 4 }}>{err}</div>}
          </div>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}><FaSave size={11} /> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// Edit one payslip's days present / paid leave / OT hours before the run is paid. The server
// recalculates LOP, OT pay and net pay (same maths as generating the run).
function EditDaysModal({ slip, formatCurrency, onClose, onSave }) {
  const att = slip.attendanceSummary || {};
  const wd = Number(att.workingDays) || 0;
  const [present, setPresent] = useState(String(att.presentDays ?? (wd || '')));
  const [leave, setLeave] = useState(String(att.paidLeaveDays ?? 0));
  const [ot, setOt] = useState(String(att.overtimeHours ?? 0));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const save = async () => {
    setErr('');
    const p = Number(present), l = Number(leave), o = Number(ot);
    if (![p, l, o].every(n => Number.isFinite(n) && n >= 0)) { setErr('Enter numbers (0 or more).'); return; }
    if (wd && p + l > wd) { setErr(`Present + paid leave can't be more than ${wd} working days.`); return; }
    setSaving(true);
    const ok = await onSave({ presentDays: p, paidLeaveDays: l, overtimeHours: o });
    setSaving(false);
    if (!ok) setErr('Could not save — see the message above.');
  };
  const field = (label, value, set, hint) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="number" min="0" step="0.5" value={value} onChange={e => set(e.target.value)} style={inputStyle} />
      {hint && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{hint}</div>}
    </div>
  );
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10004, padding: 12 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Days & overtime — {slip.staffName}</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{wd ? `${wd} working days this month` : ''}{att.hoursWorked != null ? ` · ${att.hoursWorked} hours worked (attendance)` : ''}</div>
        </div>
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Days present', present, setPresent)}
          {field('Paid leave days', leave, setLeave)}
          {field('OT hours', ot, setOt, att.otRate ? `Paid at ${att.otRate}× beyond ${att.otHoursPerDay} h/day` : 'Turn on overtime in ⚙ Settings to pay OT')}
        </div>
        <div style={{ padding: '0 20px 6px', fontSize: 12, color: '#6b7280' }}>Now: LOP {formatCurrency(slip.lopDeduction || 0)} · OT pay {formatCurrency(slip.overtimePay || 0)} · Net {formatCurrency(slip.netPay || 0)}</div>
        {err && <div style={{ padding: '0 20px 6px', fontSize: 12, color: '#b91c1c' }}>{err}</div>}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}><FaSave size={11} /> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// Mark a run paid: payment mode + reference for the run, optional different mode per staff member.
function MarkPaidModal({ run, paymentModes, formatCurrency, loadSlips, onClose, onConfirm }) {
  const [mode, setMode] = useState(paymentModes[0]?.id || 'cash');
  const [reference, setReference] = useState('');
  const [perStaff, setPerStaff] = useState(false);
  const [slips, setSlips] = useState(null);
  const [overrides, setOverrides] = useState({}); // slipId → mode id
  const [busy, setBusy] = useState(false);
  const modeName = (id) => (paymentModes.find(m => m.id === id) || {}).name || id;
  const openPerStaff = async () => {
    setPerStaff(true);
    if (!slips) { const d = await loadSlips(run.id); setSlips(d?.slips || []); }
  };
  // Staff with a payment mode on their salary setup: pre-select it (and open "per staff").
  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await loadSlips(run.id);
      if (!alive) return;
      const list = d?.slips || [];
      setSlips(list);
      const pre = {};
      list.forEach(sl => { if (sl.paymentMode && paymentModes.some(m => m.id === sl.paymentMode)) pre[sl.id] = sl.paymentMode; });
      if (Object.keys(pre).length) {
        setOverrides(pre);
        // Run default = the most common mode, so "per staff" only lists the exceptions.
        const counts = {}; Object.values(pre).forEach(m => { counts[m] = (counts[m] || 0) + 1; });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        setMode(top);
        setPerStaff(true);
      }
    })();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id]);
  const confirm = async () => {
    setBusy(true);
    const payment = { mode, modeName: modeName(mode), reference: reference.trim() };
    const slipPayments = {};
    if (perStaff) Object.entries(overrides).forEach(([sid, m]) => { if (m && m !== mode) slipPayments[sid] = { mode: m, modeName: modeName(m) }; });
    try { await onConfirm({ payment, slipPayments }); } finally { setBusy(false); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10004, padding: 12 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Mark paid — {run.month}</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{run.staffCount} staff · {formatCurrency(run.totalNet)}</div>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Payment mode</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {paymentModes.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: '7px 12px', borderRadius: 999, border: `1.5px solid ${mode === m.id ? '#059669' : '#e5e7eb'}`, background: mode === m.id ? '#ecfdf5' : '#fff', color: mode === m.id ? '#047857' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{m.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Reference (optional)</label>
            <input value={reference} maxLength={80} onChange={e => setReference(e.target.value)} placeholder="UTR / cheque no. / note" style={inputStyle} />
          </div>
          {!perStaff ? (
            <button onClick={openPerStaff} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: 0 }}>Some staff paid differently?</button>
          ) : (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>PER STAFF (blank = {modeName(mode)})</div>
              {!slips ? <div style={{ fontSize: 12, color: '#9ca3af' }}>Loading…</div> : slips.map(sl => (
                <div key={sl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ fontSize: 13 }}>{sl.staffName} <span style={{ color: '#9ca3af', fontSize: 11 }}>· {formatCurrency(sl.netPay)}</span></span>
                  <select value={overrides[sl.id] || ''} onChange={e => setOverrides(o => ({ ...o, [sl.id]: e.target.value }))} style={{ ...inputStyle, width: 'auto', padding: '5px 8px', fontSize: 12 }}>
                    <option value="">{modeName(mode)}</option>
                    {paymentModes.filter(m => m.id !== mode).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirm} disabled={busy} style={{ ...btnPrimary, background: '#059669', opacity: busy ? 0.6 : 1 }}><FaCheck size={11} /> {busy ? 'Saving…' : 'Mark paid'}</button>
        </div>
      </div>
    </div>
  );
}
