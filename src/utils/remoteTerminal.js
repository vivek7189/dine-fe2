// Desktop terminals managed from our side (server: utils/remoteTerminals, POST /api/terminals/:id/checkin).
//
// The desktop reports what it has (PC name, version, Windows printers, its printer settings) and gets
// back a change support queued for THIS terminal, if any. The change is applied once with the same
// setters the Print Settings screen uses; nothing here is on the print path. A printer name is only
// applied when Windows has that printer. Old servers (404) or any error → nothing happens.
import { isAutoUpdateEnabled, setAutoUpdateEnabled } from './autoUpdater';

const squash = (s) => String(s || '').toLowerCase().replace(/[\s_\-]+/g, '');

// Support's printer name → the exact Windows name ('DINE_IN' finds 'DINE-IN'); null = clear.
// undefined = no such printer (or two that look the same) → not applied.
export function matchPrinter(wanted, osNames) {
  if (wanted === null) return null;
  const names = (osNames || []).filter(Boolean);
  if (names.includes(wanted)) return wanted;
  const ci = names.filter((n) => n.toLowerCase() === String(wanted).toLowerCase());
  if (ci.length === 1) return ci[0];
  const sq = names.filter((n) => squash(n) === squash(wanted));
  return sq.length === 1 ? sq[0] : undefined;
}

let machine = null; // { hostname, os } — read once per app start

// What this desktop reports at check-in. The Windows printer list and print queue are slower to read,
// so only when asked (the server keeps the last ones it got).
export async function readTerminalState(api, { withPrinters = false, withQueue = false } = {}) {
  const out = { printers: null, config: null, printQueue: null, hostname: null, os: null };
  if (withPrinters) {
    try {
      const list = await api.getPrinters();
      if (Array.isArray(list)) out.printers = list.map((p) => ({ name: p?.name, status: p?.status, isDefault: p?.isDefault === true })).filter((p) => p.name);
    } catch { /* report without */ }
  }
  try {
    const cfg = (await api.getPrinterConfig()) || {};
    out.config = {
      defaultPrinter: cfg.defaultPrinter || null, kotPrinter: cfg.kotPrinter || null, billPrinter: cfg.billPrinter || null,
      stationPrinters: cfg.stationPrinters || {}, autoUpdate: isAutoUpdateEnabled(),
    };
  } catch { /* report without */ }
  try {
    if (!machine && typeof api.getPrintDiagnostics === 'function') {
      const d = await api.getPrintDiagnostics({ limit: 1 });
      if (d?.machine) machine = { hostname: d.machine.hostname || null, os: d.machine.os || null };
    }
  } catch { /* report without */ }
  if (machine) { out.hostname = machine.hostname; out.os = machine.os; }
  if (withQueue && typeof api.getPrintQueue === 'function') {
    try { const q = await api.getPrintQueue(); if (q?.ok) out.printQueue = q.queue || []; } catch { /* report without */ }
  }
  return out;
}

// Apply support's change. Returns { ok, done[], errors[], action? } — `action` (update / restart) is
// left to the caller, which owns the banner and must report before the app restarts.
export async function applyPending(pending, api) {
  const done = []; const errors = [];
  if (!pending || typeof pending !== 'object') return { ok: false, done, errors: ['empty change'] };
  let osNames = null;
  const loadNames = async () => {
    if (!osNames) { const l = await api.getPrinters(); osNames = Array.isArray(l) ? l.map((p) => p?.name).filter(Boolean) : []; }
    return osNames;
  };

  if (pending.printers && typeof pending.printers === 'object') {
    try {
      const names = await loadNames();
      const cfg = {};
      ['defaultPrinter', 'kotPrinter', 'billPrinter'].forEach((k) => {
        if (pending.printers[k] === undefined) return;
        const m = matchPrinter(pending.printers[k], names);
        if (m === undefined) errors.push(`${k}: printer "${pending.printers[k]}" not found on this PC`);
        else cfg[k] = m;
      });
      if (pending.printers.stationPrinters && typeof pending.printers.stationPrinters === 'object') {
        const st = {};
        Object.entries(pending.printers.stationPrinters).forEach(([id, n]) => {
          const m = matchPrinter(n, names);
          if (m === undefined) errors.push(`station ${id}: printer "${n}" not found on this PC`);
          else st[id] = m;
        });
        if (Object.keys(st).length) cfg.stationPrinters = st;
      }
      if (Object.keys(cfg).length) { await api.setPrinterConfig(cfg); done.push(`printers ${JSON.stringify(cfg)}`); }
    } catch (e) { errors.push(`printers: ${e?.message || e}`); }
  }

  if (typeof pending.autoUpdate === 'boolean') { setAutoUpdateEnabled(pending.autoUpdate); done.push(`autoUpdate=${pending.autoUpdate}`); }

  if (pending.clearQueue) {
    if (typeof api.clearPrintQueue !== 'function') errors.push('clearQueue: this app version cannot clear the Windows queue — update first');
    else {
      try {
        const names = await loadNames();
        const printer = matchPrinter(pending.clearQueue.printer, names);
        if (!printer) errors.push(`clearQueue: printer "${pending.clearQueue.printer}" not found on this PC`);
        else {
          const r = await api.clearPrintQueue({ printer, olderThanMinutes: pending.clearQueue.olderThanMinutes });
          if (r?.ok) done.push(`cleared ${r.removed} old job(s) from ${printer}`);
          else errors.push(`clearQueue: ${r?.error || 'failed'}`);
        }
      } catch (e) { errors.push(`clearQueue: ${e?.message || e}`); }
    }
  }

  const action = pending.action === 'update' || pending.action === 'restart' ? pending.action : null;
  return { ok: errors.length === 0, done, errors, action, force: pending.force === true };
}
