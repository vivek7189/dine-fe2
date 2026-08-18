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

// A network (WiFi/Ethernet) printer identifier is stored as "IP" or "IP:port" (e.g.
// "192.168.1.150:9100"). Parse it so we can record host/port on the server — that's the ONLY
// device-neutral form other apps (dine-app) can print to over TCP. Returns null for OS/BT names.
export function parseNetworkAddr(id) {
  if (typeof id !== 'string') return null;
  const m = id.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::(\d+))?$/);
  if (!m) return null;
  return { host: m[1], port: m[2] ? parseInt(m[2], 10) : 9100 };
}

// Persist one station's printer to the server (best-effort; local save is the source of truth).
// For a network printer, also records host/port so any device can print to it over TCP.
export async function saveStationPrinterToServer(restaurantId, stationId, printerName) {
  try {
    if (!restaurantId || !stationId) return;
    const res = await apiClient.getPrintStations(restaurantId);
    const all = Array.isArray(res?.printStations) ? res.printStations : [];
    if (!all.length) return;
    const net = parseNetworkAddr(printerName);
    let changed = false;
    const updated = all.map((s) => {
      if (s.id !== stationId) return s;
      changed = true;
      const pc = { ...(s.printerConfig || {}) };
      pc.name = printerName || null;
      if (net) { pc.type = 'network'; pc.host = net.host; pc.port = net.port; }
      else if (!pc.type) pc.type = 'network';
      return { ...s, printerConfig: pc };
    });
    if (!changed) return; // station not found server-side — do nothing
    await apiClient.updatePrintStations(restaurantId, updated, res.kotPrintingMode || 'multi');
  } catch (_) { /* best-effort — the local assignment already succeeded */ }
}

// Persist the SINGLE (single-station mode) KOT printer to the server so other devices can fetch it.
// Sends printStations unchanged + only sets defaultPrinterConfig. For a network printer, records
// host/port. Best-effort; local save stays the source of truth.
export async function saveDefaultPrinterToServer(restaurantId, printerId) {
  try {
    if (!restaurantId) return;
    const res = await apiClient.getPrintStations(restaurantId);
    const stations = Array.isArray(res?.printStations) ? res.printStations : [];
    let cfg = null;
    if (printerId) {
      const net = parseNetworkAddr(printerId);
      cfg = net
        ? { type: 'network', name: printerId, host: net.host, port: net.port }
        : { type: null, name: printerId, host: null, port: null };
    }
    // Resend stations unchanged (PUT is replace-all) + set the single-printer config.
    await apiClient.updatePrintStations(restaurantId, stations, res.kotPrintingMode || 'single', cfg);
  } catch (_) { /* best-effort */ }
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

// On Electron startup: fill an EMPTY local single (KOT) printer from the server's defaultPrinterConfig.
// Only hydrates a device-neutral NETWORK printer (host:port) — OS/BT names may not exist on this
// machine. Never overwrites an existing local binding, so set-up terminals are untouched.
export async function hydrateDefaultPrinter(restaurantId) {
  try {
    if (!isElectron() || !restaurantId) return;
    const api = (typeof window !== 'undefined') ? window.electronAPI : null;
    if (!api?.getPrinterConfig || !api?.setPrinterConfig) return;
    const [cfg, res] = await Promise.all([
      api.getPrinterConfig().catch(() => null),
      apiClient.getPrintStations(restaurantId).catch(() => null),
    ]);
    if (cfg && cfg.kotPrinter) return; // already set locally — never overwrite
    const dp = res?.defaultPrinterConfig;
    if (dp && dp.host) {
      await api.setPrinterConfig({ kotPrinter: `${dp.host}:${dp.port || 9100}` });
    }
  } catch (_) { /* non-blocking — never affects startup */ }
}
