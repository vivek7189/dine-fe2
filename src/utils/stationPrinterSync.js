// KOT station → printer persistence.
//
// The physical-printer binding for each KOT station lives on the DEVICE
// (Electron userData `stationPrinters[stationId]`) and drives routing. That's correct for
// multi-terminal setups (each terminal has its own printers) — but it means a fresh install /
// new machine / cleared config has NO binding, so every KOT silently falls back to one printer.
//
// This module adds a DURABLE BACKUP on the server (the station's existing `printerConfig.name`)
// without changing how routing works:
//   • saveStationPrinterToServer — when a printer is assigned locally, also record it on the server.
//   • hydrateStationPrinters     — on startup, fill ONLY empty local bindings from the server value.
// The local device config always wins; the server value is used only when a station has no local
// binding. So working terminals are 100% unchanged; only empty ones get restored.
import apiClient from '../lib/api';
import { isElectron } from './platform';

// Persist one station's printer name to the server (best-effort; local save is the source of truth).
export async function saveStationPrinterToServer(restaurantId, stationId, printerName) {
  try {
    if (!restaurantId || !stationId) return;
    const res = await apiClient.getPrintStations(restaurantId);
    const all = Array.isArray(res?.printStations) ? res.printStations : [];
    if (!all.length) return;
    let changed = false;
    const updated = all.map((s) => {
      if (s.id !== stationId) return s;
      changed = true;
      const pc = { ...(s.printerConfig || {}) };
      pc.name = printerName || null;
      if (!pc.type) pc.type = 'network';
      return { ...s, printerConfig: pc };
    });
    if (!changed) return; // station not found server-side — do nothing
    await apiClient.updatePrintStations(restaurantId, updated, res.kotPrintingMode || 'multi');
  } catch (_) { /* best-effort — the local assignment already succeeded */ }
}

// On Electron startup: fill any EMPTY local station→printer binding from the server's saved value.
// Never overwrites an existing local binding, so terminals that are already set up are untouched.
export async function hydrateStationPrinters(restaurantId) {
  try {
    if (!isElectron() || !restaurantId) return;
    const api = (typeof window !== 'undefined') ? window.electronAPI : null;
    if (!api?.getPrinterConfig || !api?.setPrinterConfig) return;
    const [cfg, res] = await Promise.all([
      api.getPrinterConfig().catch(() => null),
      apiClient.getPrintStations(restaurantId).catch(() => null),
    ]);
    const local = (cfg && cfg.stationPrinters) || {};
    const stations = Array.isArray(res?.printStations) ? res.printStations : [];
    const toSet = {};
    stations.forEach((s) => {
      const name = s?.printerConfig?.name;
      if (name && !local[s.id]) toSet[s.id] = name; // fill ONLY empties
    });
    if (Object.keys(toSet).length) await api.setPrinterConfig({ stationPrinters: toSet });
  } catch (_) { /* non-blocking — never affects startup */ }
}
