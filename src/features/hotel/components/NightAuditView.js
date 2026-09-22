'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaMoon, FaExclamationTriangle, FaCheckCircle, FaUserSlash, FaSignInAlt, FaSignOutAlt, FaBed } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Btn, StatCard } from './ui';

const fmtDate = (v) => { const s = typeof v === 'string' ? v.slice(0, 10) : ''; if (!s) return '—'; const [y, m, d] = s.split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${+d} ${M[+m - 1]} ${y}`; };
const canManage = (() => { try { return ['owner', 'admin', 'manager'].includes((JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase()); } catch { return false; } })();

function PendingRow({ icon: Icon, label, value, tone }) {
  const warn = tone === 'warn' && value > 0;
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${warn ? 'border-[#EAD1C9] bg-[#F9EFEA]' : 'border-[var(--h-border)] bg-white'}`}>
      <span className="flex items-center gap-2 text-[13px] text-[var(--h-ink2)]"><Icon size={12} className={warn ? 'text-[#9B4A3A]' : 'text-[var(--h-faint)]'} /> {label}</span>
      <span className={`text-[15px] font-semibold tabular-nums ${warn ? 'text-[#9B4A3A]' : 'text-[var(--h-ink)]'}`}>{value}</span>
    </div>
  );
}

export default function NightAuditView({ restaurantId, formatCurrency, notify }) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [running, setRunning] = useState(false);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [s, h] = await Promise.all([hotelApi.nightAuditStatus(restaurantId), hotelApi.nightAuditHistory(restaurantId, 30)]);
      setStatus(s); setHistory(h.audits || []);
    } catch (e) { notify('error', e.message || 'Failed to load night audit'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const run = async () => {
    setRunning(true);
    try {
      const r = await hotelApi.runNightAudit(restaurantId);
      notify('success', `Business date closed. New date: ${fmtDate(r.newBusinessDate)}`);
      setConfirm(false); await load();
    } catch (e) { notify('error', e.message || 'Night audit failed'); }
    finally { setRunning(false); }
  };

  if (loading) return <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>;
  const p = status?.pending || {};
  const warnings = (p.noShows || 0) + (p.overstays || 0);

  return (
    <div className="space-y-5">
      {/* Business date + run */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--h-border)] bg-white p-5 shadow-[0_1px_2px_rgba(40,33,20,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEAF6] text-[#5A4A85]"><FaMoon size={16} /></span>
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--h-faint)]">Current business date</div>
            <div className="font-serif text-[22px] font-semibold text-[var(--h-ink)]">{fmtDate(status?.businessDate)}</div>
          </div>
        </div>
        {canManage ? (
          <Btn onClick={() => setConfirm(true)}><FaMoon size={12} /> Run night audit</Btn>
        ) : <span className="text-[12px] text-[var(--h-faint)]">Manager access required to close the day.</span>}
      </div>

      {/* Pre-audit checklist */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--h-muted)]">Before you close</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <PendingRow icon={FaSignInAlt} label="Arrivals still expected today" value={p.arrivalsDue || 0} />
          <PendingRow icon={FaSignOutAlt} label="Departures still due today" value={p.departuresDue || 0} />
          <PendingRow icon={FaUserSlash} label="No-shows to process" value={p.noShows || 0} tone="warn" />
          <PendingRow icon={FaBed} label="Overstays (past departure)" value={p.overstays || 0} tone="warn" />
        </div>
        <div className={`mt-2 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] ${warnings > 0 ? 'border-[#EAD1C9] bg-[#F9EFEA] text-[#8A3F31]' : 'border-[#CFE3D6] bg-[#E7F1EA] text-[#2F6047]'}`}>
          {warnings > 0 ? <FaExclamationTriangle className="mt-0.5" size={12} /> : <FaCheckCircle className="mt-0.5" size={12} />}
          <span>{warnings > 0
            ? `Running the audit will mark ${p.noShows || 0} no-show(s) and roll the date forward. Overstays remain in-house and are only flagged.`
            : 'All clear — no pending no-shows or overstays. You can safely close the day.'}</span>
        </div>
      </div>

      {/* Last close snapshot */}
      {status?.lastAudit && (
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--h-muted)]">Last close · {fmtDate(status.lastAudit.auditDate)}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard tone="brass" label="Occupancy" value={`${status.lastAudit.occupancy ?? 0}%`} />
            <StatCard tone="emerald" label="Room revenue" value={money(status.lastAudit.roomRevenue)} />
            <StatCard tone="indigo" label="ADR" value={money(status.lastAudit.adr)} />
            <StatCard tone="sky" label="RevPAR" value={money(status.lastAudit.revpar)} />
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--h-muted)]">Audit history</div>
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--h-border)] py-8 text-center text-[13px] text-[var(--h-faint)]">No closes yet. The first night audit will appear here.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--h-border)]">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--h-hover)] text-[11px] uppercase tracking-wide text-[var(--h-muted)]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-right font-medium">Occ%</th>
                  <th className="px-3 py-2 text-right font-medium">Rooms</th>
                  <th className="px-3 py-2 text-right font-medium">ADR</th>
                  <th className="px-3 py-2 text-right font-medium">RevPAR</th>
                  <th className="px-3 py-2 text-right font-medium">Room rev</th>
                  <th className="px-3 py-2 text-right font-medium">Collected</th>
                  <th className="px-3 py-2 text-right font-medium">No-shows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--h-divider)]">
                {history.map((a) => (
                  <tr key={a.id} className="hover:bg-[color-mix(in_srgb,var(--h-hover)_60%,transparent)]">
                    <td className="px-3 py-2 font-medium text-[var(--h-ink)]">{fmtDate(a.auditDate)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{a.occupancy ?? 0}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{a.roomsSold}/{a.roomsAvailable}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{money(a.adr)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{money(a.revpar)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{money(a.roomRevenue)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[#356B4E]">{money(a.paymentsCollected)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{a.noShowsProcessed > 0 ? <span className="text-[#9B4A3A]">{a.noShowsProcessed}</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={confirm} title="Run night audit?" onClose={() => setConfirm(false)}
        footer={<><Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn><Btn onClick={run} disabled={running}>{running ? 'Closing…' : 'Close the day'}</Btn></>}>
        <div className="space-y-2 text-[13.5px] text-[var(--h-ink2)]">
          <p>This will close <strong>{fmtDate(status?.businessDate)}</strong> and roll the business date forward. It will:</p>
          <ul className="ml-4 list-disc space-y-1 text-[13px] text-[var(--h-text)]">
            <li>Mark <strong>{p.noShows || 0}</strong> no-show(s) and free their rooms</li>
            <li>Record an immutable daily snapshot (occupancy, ADR, RevPAR, money)</li>
            <li>Advance the business date to the next day</li>
          </ul>
          <p className="text-[12px] text-[var(--h-faint)]">A closed date cannot be re-opened.</p>
        </div>
      </Modal>
    </div>
  );
}
