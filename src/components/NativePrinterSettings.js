'use client';

// Printer device selection UI for native apps (Capacitor/Tauri/Electron).
// Returns null on web — no UI change for web users.
// Shows: scan for printers, select default, KOT/Bill routing, test print, diagnostics.

import { useState, useEffect, useCallback } from 'react';
import { isWeb, isCapacitor, isTauri, isElectron } from '../utils/platform';
import { printDocument } from '../utils/printBridge';
import apiClient from '../lib/api';
import { FaBluetooth, FaPrint, FaSync, FaCheckCircle, FaTimesCircle, FaUsb, FaWifi, FaStethoscope, FaMicrochip } from 'react-icons/fa';

// Icon for printer connection type
function PrinterIcon({ type }) {
  if (type === 'bluetooth') return <FaBluetooth style={{ color: '#3b82f6' }} title="Bluetooth" />;
  if (type === 'network') return <FaWifi style={{ color: '#8b5cf6' }} title="Network (TCP)" />;
  if (type === 'wifi') return <FaWifi style={{ color: '#3b82f6' }} title="WiFi / AirPrint" />;
  if (type === 'serial') return <FaMicrochip style={{ color: '#ea580c' }} title="Serial" />;
  if (type === 'default') return <FaPrint style={{ color: '#16a34a' }} title="System Default" />;
  return <FaUsb style={{ color: '#6b7280' }} title="USB" />;
}

export default function NativePrinterSettings({ restaurantId }) {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [kotPrinter, setKotPrinter] = useState(null);
  const [billPrinter, setBillPrinter] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // progress message during scan
  const [scanError, setScanError] = useState(null); // error message from last scan
  const [isConnected, setIsConnected] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState(null);
  const [testKotStatus, setTestKotStatus] = useState(null);
  const [testBillStatus, setTestBillStatus] = useState(null);
  const [perPrinterTestStatus, setPerPrinterTestStatus] = useState({}); // { [printerAddress]: 'printing'|'success'|'error' }
  const [webPlatform, setWebPlatform] = useState(true);
  const [diagReport, setDiagReport] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [appVersion, setAppVersion] = useState(null);
  const [printStations, setPrintStations] = useState([]);
  const [stationPrinters, setStationPrinters] = useState({});
  const [stationTestStatus, setStationTestStatus] = useState({});
  const [networkIpInput, setNetworkIpInput] = useState('');
  const [networkPrinters, setNetworkPrinters] = useState([]); // manually added IP printers
  const [printerHealth, setPrinterHealth] = useState({}); // { [printerName]: 'online'|'offline'|'checking' }
  const [categories, setCategories] = useState([]); // menu categories for station assignment
  const [editingStationId, setEditingStationId] = useState(null); // stationId being renamed
  const [addingStation, setAddingStation] = useState(false); // whether add-station form is open
  const [newStationName, setNewStationName] = useState('');
  const [newStationType, setNewStationType] = useState('kitchen');
  const [newStationCatIds, setNewStationCatIds] = useState([]);
  const [newStationPrinter, setNewStationPrinter] = useState(''); // printer to assign on creation
  const isElectronPlatform = !isWeb() && isElectron();
  const isCapacitorPlatform = !isWeb() && isCapacitor();
  // Show printer routing for both Electron and Capacitor
  const supportsRouting = isElectronPlatform || isCapacitorPlatform;

  const scanPrinters = useCallback(async () => {
    setIsScanning(true);
    setScanStatus('Scanning printers...');
    setScanError(null);
    let allPrinters = [];
    let osScanFailed = false;
    try {
      // Phase 1: OS-installed printers (USB, WiFi/AirPrint, Bluetooth, CUPS-configured)
      if (isCapacitor()) {
        const { DinePrinter } = await import('capacitor-dine-printer');
        const result = await DinePrinter.scanPrinters();
        allPrinters = result.printers || [];
      } else if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        const result = await invoke('list_printers');
        allPrinters = result || [];
      } else if (isElectron()) {
        const printers = await window.electronAPI.getPrinters();
        allPrinters = (printers || []).map(p => {
          // Use enriched connectionType from Electron main process if available,
          // otherwise fall back to heuristic classification.
          let type = p.connectionType || 'usb';
          if (type === 'virtual') type = 'virtual'; // PDF/Fax/XPS — keep but mark
          if (p.isDefault && type === 'usb') type = 'default';
          return {
            name: p.displayName || p.name,
            address: p.name,
            type,
            description: p.description || '',
            status: p.status, // 0 = idle, 1 = printing, 2 = error
          };
        });
      }
    } catch (err) {
      console.error('Failed to scan OS printers:', err);
      setScanError('Printer scan failed: ' + (err.message || 'Unknown error'));
      osScanFailed = true;
    }

    // Filter out system virtual printers (Fax, XPS, OneNote)
    const virtualPrinters = allPrinters.filter(p => p.type === 'virtual');
    allPrinters = allPrinters.filter(p => p.type !== 'virtual');

    // Phase 2: LAN scan for network thermal printers (Electron only)
    // Scans all subnets on ports 9100 (RAW), 515 (LPD), 631 (IPP)
    if (isElectron() && window.electronAPI?.scanNetworkPrinters) {
      const osCount = allPrinters.length;
      setScanStatus(
        osCount > 0
          ? `Found ${osCount} printer${osCount !== 1 ? 's' : ''}. Scanning network...`
          : 'Scanning network for printers...'
      );
      try {
        const result = await window.electronAPI.scanNetworkPrinters();
        if (result?.printers?.length) {
          // Dedup: OS WiFi printers may appear in LAN scan too.
          // Match by IP — OS printer descriptions/names sometimes contain the IP.
          const osAddresses = new Set(allPrinters.map(p => p.address));
          const osDescriptions = allPrinters.map(p => (p.description || '').toLowerCase()).join(' ');
          const lanPrinters = result.printers.filter(p => {
            if (osAddresses.has(p.address)) return false;
            // Check if this IP is already known from OS printer description
            const ip = p.address.split(':')[0];
            if (osDescriptions.includes(ip)) return false;
            return true;
          });
          allPrinters = [...allPrinters, ...lanPrinters];
        }
      } catch (err) {
        console.warn('Network scan failed (non-critical):', err.message);
        // Network scan failure is non-critical — OS printers still work
      }
    }

    // Phase 3: Merge manually added network printers (saved in local settings)
    if (networkPrinters.length > 0) {
      const existing = new Set(allPrinters.map(p => p.address));
      const manualPrinters = networkPrinters.filter(p => !existing.has(p.address));
      allPrinters = [...allPrinters, ...manualPrinters];
    }

    setPrinters(allPrinters);
    if (allPrinters.length === 0 && !osScanFailed) {
      setScanStatus(null);
      setScanError(
        'No printers found. Make sure your printer is turned on and connected via USB, WiFi, or Ethernet, then try again. You can also add a network printer by IP address.'
      );
    } else if (allPrinters.length > 0) {
      const summary = [];
      const osDriverCount = allPrinters.filter(p => p.type !== 'network').length;
      const networkCount = allPrinters.filter(p => p.type === 'network').length;
      if (osDriverCount > 0) summary.push(`${osDriverCount} system`);
      if (networkCount > 0) summary.push(`${networkCount} network`);
      if (virtualPrinters.length > 0) summary.push(`${virtualPrinters.length} virtual hidden`);
      setScanStatus(`Found ${allPrinters.length} printer${allPrinters.length !== 1 ? 's' : ''} (${summary.join(', ')})`);
      setTimeout(() => setScanStatus(null), 4000);
    }
    setIsScanning(false);
  }, [networkPrinters]);

  const selectPrinter = useCallback(async (printer) => {
    try {
      if (isCapacitor()) {
        const { DinePrinter } = await import('capacitor-dine-printer');
        await DinePrinter.setDefaultPrinter({ address: printer.address });
      } else if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_default_printer', { printerName: printer.name });
      } else if (isElectron()) {
        // For network/IP printers, store the raw IP address (e.g., "192.168.1.100:9100")
        // so Electron main process can detect it via isIpAddress() and route to TCP path.
        // For OS printers, store the OS printer name.
        const printerIdentifier = printer.type === 'network' ? printer.address : printer.name;
        await window.electronAPI.setDefaultPrinter(printerIdentifier);
      }
      setSelectedPrinter(printer);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to set default printer:', err);
      setIsConnected(false);
    }
  }, []);

  // Assign a printer to a specific role (KOT/Bill routing)
  const assignPrinter = useCallback(async (role, printer) => {
    const config = {};
    if (role === 'kot') {
      config.kotPrinter = printer ? printer.address || printer.name : null;
      setKotPrinter(printer);
    } else if (role === 'bill') {
      config.billPrinter = printer ? printer.address || printer.name : null;
      setBillPrinter(printer);
    }
    try {
      if (isCapacitorPlatform) {
        const { DinePrinter } = await import('capacitor-dine-printer');
        await DinePrinter.setPrinterConfig(config);
      } else if (isElectronPlatform) {
        // For network/IP printers, store the raw IP address so Electron routes to TCP path.
        // For OS printers, store the OS printer name.
        const electronConfig = {};
        const id = printer ? (printer.type === 'network' ? printer.address : printer.name) : null;
        if (role === 'kot') electronConfig.kotPrinter = id;
        if (role === 'bill') electronConfig.billPrinter = id;
        await window.electronAPI.setPrinterConfig(electronConfig);
      }
    } catch (err) {
      console.error('Failed to save printer config:', err);
    }
  }, [isElectronPlatform, isCapacitorPlatform]);

  const makeTestHtml = (label) => `
    <!DOCTYPE html><html><head>
    <style>@page{size:80mm auto;margin:0;}body{font-family:'Courier New',monospace;padding:16px;text-align:center;}</style>
    </head><body>
      <h2>DineOpen POS</h2>
      <p>--- ${label} TEST ---</p>
      <p>Printer is working correctly!</p>
      <p>${new Date().toLocaleString()}</p>
      <p>================================</p>
    </body></html>
  `;

  const testPrint = useCallback(async () => {
    setTestPrintStatus('printing');
    try {
      await printDocument({ html: makeTestHtml('PRINT'), type: 'bill' });
      setTestPrintStatus('success');
    } catch (err) {
      console.error('Test print failed:', err);
      setTestPrintStatus('error');
    }
    setTimeout(() => setTestPrintStatus(null), 3000);
  }, []);

  const testKotPrint = useCallback(async () => {
    setTestKotStatus('printing');
    try {
      await printDocument({ html: makeTestHtml('KOT PRINTER'), type: 'kot' });
      setTestKotStatus('success');
    } catch (err) {
      setTestKotStatus('error');
    }
    setTimeout(() => setTestKotStatus(null), 3000);
  }, []);

  const testBillPrint = useCallback(async () => {
    setTestBillStatus('printing');
    try {
      await printDocument({ html: makeTestHtml('BILL PRINTER'), type: 'bill' });
      setTestBillStatus('success');
    } catch (err) {
      setTestBillStatus('error');
    }
    setTimeout(() => setTestBillStatus(null), 3000);
  }, []);

  // Test a specific printer by address/name (sends directly to that printer)
  const testSpecificPrinter = useCallback(async (printer) => {
    const key = printer.address || printer.name;
    setPerPrinterTestStatus(prev => ({ ...prev, [key]: 'printing' }));
    try {
      const printerId = printer.type === 'network' ? printer.address : printer.name;
      if (isElectron() && window.electronAPI?.print) {
        const result = await window.electronAPI.print(makeTestHtml(`TEST: ${printer.name}`), {
          type: 'bill',
          printerOverride: printerId,
        });
        if (result?.success === false) throw new Error(result.error || 'Print failed');
      } else {
        await printDocument({ html: makeTestHtml(`TEST: ${printer.name}`), type: 'bill' });
      }
      setPerPrinterTestStatus(prev => ({ ...prev, [key]: 'success' }));
    } catch (err) {
      console.error('Test print failed for', printer.name, err);
      setPerPrinterTestStatus(prev => ({ ...prev, [key]: 'error' }));
    }
    setTimeout(() => setPerPrinterTestStatus(prev => ({ ...prev, [key]: null })), 3000);
  }, []);

  const runDiagnostics = useCallback(async () => {
    setIsDiagnosing(true);
    setDiagReport(null);
    try {
      if (isCapacitor()) {
        const { DinePrinter } = await import('capacitor-dine-printer');
        const result = await DinePrinter.diagnose();
        setDiagReport(result.report);
      } else if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        const report = await invoke('diagnose_print');
        setDiagReport(report);
      }
    } catch (err) {
      setDiagReport('Diagnostics failed: ' + err.message);
    } finally {
      setIsDiagnosing(false);
    }
  }, []);

  // Detect platform, app version, and auto-scan printers on mount
  useEffect(() => {
    setWebPlatform(isWeb());
    if (isTauri()) {
      import('@tauri-apps/api/app').then(({ getVersion }) => {
        getVersion().then(v => setAppVersion(v)).catch(() => {});
      }).catch(() => {});
    } else if (isElectron()) {
      window.electronAPI.getVersion().then(v => setAppVersion(v)).catch(() => {});
    }
    // Auto-scan printers on mount so the list is ready immediately
    if (!isWeb()) {
      // Small delay to let the config load first (so networkPrinters are available for merge)
      const timer = setTimeout(() => scanPrinters(), 500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check connection status and load printer config on mount
  useEffect(() => {
    if (isWeb()) return;
    const checkConnection = async () => {
      try {
        if (isCapacitor()) {
          const { DinePrinter } = await import('capacitor-dine-printer');
          const defaultPrinter = await DinePrinter.getDefaultPrinter();
          if (defaultPrinter && defaultPrinter.name) {
            setSelectedPrinter(defaultPrinter);
            const status = await DinePrinter.isConnected();
            setIsConnected(status.connected);
          }
          // Load KOT/Bill routing config
          try {
            const config = await DinePrinter.getPrinterConfig();
            if (config?.kotPrinter) {
              setKotPrinter({ name: config.kotPrinter, address: config.kotPrinter, type: 'unknown' });
            }
            if (config?.billPrinter) {
              setBillPrinter({ name: config.billPrinter, address: config.billPrinter, type: 'unknown' });
            }
          } catch (e) { /* getPrinterConfig not available in older versions */ }
        } else if (isTauri()) {
          const { invoke } = await import('@tauri-apps/api/core');
          const defaultPrinter = await invoke('get_default_printer');
          if (defaultPrinter && defaultPrinter.name) {
            setSelectedPrinter(defaultPrinter);
            setIsConnected(true);
          }
        } else if (isElectron()) {
          const config = await window.electronAPI.getPrinterConfig();
          if (config?.defaultPrinter) {
            const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(config.defaultPrinter);
            setSelectedPrinter({ name: config.defaultPrinter, address: config.defaultPrinter, type: isIp ? 'network' : 'usb' });
            setIsConnected(true);
          }
          if (config?.kotPrinter) {
            const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(config.kotPrinter);
            setKotPrinter({ name: config.kotPrinter, address: config.kotPrinter, type: isIp ? 'network' : 'usb' });
          }
          if (config?.billPrinter) {
            const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(config.billPrinter);
            setBillPrinter({ name: config.billPrinter, address: config.billPrinter, type: isIp ? 'network' : 'usb' });
          }
          // Load saved network printers and merge into printer list
          if (config?.networkPrinters?.length) {
            setNetworkPrinters(config.networkPrinters);
            setPrinters(prev => {
              const existing = new Set(prev.map(p => p.address));
              const newPrinters = config.networkPrinters.filter(p => !existing.has(p.address));
              return [...prev, ...newPrinters];
            });
          }
        }
      } catch (err) {
        // No printer configured yet
      }
    };
    checkConnection();
  }, []);

  // Subscribe to printer heartbeat status updates (Electron only)
  useEffect(() => {
    if (!isElectronPlatform || !window.electronAPI?.onPrinterStatus) return;
    // Load initial health state
    window.electronAPI.getPrinterHealth?.().then(health => {
      if (health) {
        const healthMap = {};
        for (const [name, info] of Object.entries(health)) {
          healthMap[name] = info.status || 'checking';
        }
        setPrinterHealth(healthMap);
      }
    }).catch(() => {});
    // Subscribe to live status changes
    const unsub = window.electronAPI.onPrinterStatus((data) => {
      setPrinterHealth(prev => ({ ...prev, [data.printer]: data.status }));
      // Also dispatch a window event for PrintEventToast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dine-printer-status', { detail: data }));
      }
    });
    return unsub;
  }, [isElectronPlatform]);

  // Load print stations from API + station printer config from device
  useEffect(() => {
    if (isWeb() || !restaurantId) return;
    // Fetch print stations and categories
    apiClient.getPrintStations(restaurantId).then(res => {
      if (res?.success) {
        setPrintStations((res.printStations || []).filter(s => s.enabled));
        if (res.categories) setCategories(res.categories);
      }
    }).catch(() => {});
    // Fetch station printer assignments from local device config
    const loadStationPrinters = async () => {
      try {
        if (isElectron() && window.electronAPI?.getPrinterConfig) {
          const config = await window.electronAPI.getPrinterConfig();
          if (config?.stationPrinters) setStationPrinters(config.stationPrinters);
        }
      } catch (e) { /* ignore */ }
    };
    loadStationPrinters();
  }, [restaurantId]);

  const assignStationPrinter = useCallback(async (stationId, printerName) => {
    const updated = { ...stationPrinters, [stationId]: printerName || null };
    setStationPrinters(updated);
    try {
      if (isElectronPlatform && window.electronAPI?.setPrinterConfig) {
        await window.electronAPI.setPrinterConfig({ stationPrinters: { [stationId]: printerName || null } });
      }
    } catch (err) {
      console.error('Failed to save station printer:', err);
    }
  }, [stationPrinters, isElectronPlatform]);

  // Add a network printer by IP address
  const addNetworkPrinter = useCallback(async (ipInput) => {
    if (!ipInput?.trim()) return;
    let address = ipInput.trim();
    // Add default port if not specified
    if (!address.includes(':')) address += ':9100';
    // Check if already in list
    if (networkPrinters.some(p => p.address === address)) return;
    const printer = { name: `Network (${address})`, address, type: 'network' };
    const updated = [...networkPrinters, printer];
    setNetworkPrinters(updated);
    // Also add to scanned printers list so it appears in dropdowns
    setPrinters(prev => {
      if (prev.some(p => p.address === address)) return prev;
      return [...prev, printer];
    });
    // Persist to settings
    if (isElectronPlatform && window.electronAPI?.setPrinterConfig) {
      await window.electronAPI.setPrinterConfig({ networkPrinters: updated });
    }
    setNetworkIpInput('');
  }, [networkPrinters, isElectronPlatform]);

  // Remove a manually added network printer
  const removeNetworkPrinter = useCallback(async (address) => {
    const updated = networkPrinters.filter(p => p.address !== address);
    setNetworkPrinters(updated);
    setPrinters(prev => prev.filter(p => p.address !== address));
    if (isElectronPlatform && window.electronAPI?.setPrinterConfig) {
      await window.electronAPI.setPrinterConfig({ networkPrinters: updated });
    }
  }, [networkPrinters, isElectronPlatform]);

  const testStationPrint = useCallback(async (stationId, stationName) => {
    setStationTestStatus(prev => ({ ...prev, [stationId]: 'printing' }));
    try {
      const testHtml = `<!DOCTYPE html><html><head>
        <style>@page{size:80mm auto;margin:0;}body{font-family:'Courier New',monospace;padding:16px;text-align:center;}</style>
        </head><body>
          <h2>DineOpen POS</h2>
          <p>--- STATION TEST ---</p>
          <p><b>${stationName}</b></p>
          <p>Printer is working correctly!</p>
          <p>${new Date().toLocaleString()}</p>
          <p>================================</p>
        </body></html>`;
      await printDocument({ html: testHtml, type: 'kot', stationId });
      setStationTestStatus(prev => ({ ...prev, [stationId]: 'success' }));
    } catch (err) {
      setStationTestStatus(prev => ({ ...prev, [stationId]: 'error' }));
    }
    setTimeout(() => setStationTestStatus(prev => ({ ...prev, [stationId]: null })), 3000);
  }, []);

  // --- Multi-printer helpers ---
  const updateStationCategories = useCallback(async (stationId, categoryIds) => {
    const updated = printStations.map(s =>
      s.id === stationId ? { ...s, categoryIds, updatedAt: new Date().toISOString() } : s
    );
    try {
      const res = await apiClient.updatePrintStations(restaurantId, updated, 'multi');
      if (res?.success) setPrintStations((res.printStations || updated).filter(s => s.enabled));
    } catch (err) { console.error('Failed to update station categories:', err); }
  }, [printStations, restaurantId]);

  const addStation = useCallback(async (form) => {
    if (!form?.name?.trim()) return null;
    const stationId = form.id || `ps_${Date.now().toString(36)}`;
    const newStation = {
      id: stationId,
      name: form.name.trim(),
      type: form.type || 'kitchen',
      categoryIds: form.categoryIds || [],
      isDefault: printStations.length === 0,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...printStations, newStation];
    try {
      const res = await apiClient.updatePrintStations(restaurantId, updated, 'multi');
      if (res?.success) {
        setPrintStations((res.printStations || updated).filter(s => s.enabled));
        if (res.categories) setCategories(res.categories);
      }
      return stationId;
    } catch (err) { console.error('Failed to add station:', err); return null; }
  }, [printStations, restaurantId]);

  const deleteStation = useCallback(async (stationId) => {
    if (!confirm('Delete this station? This cannot be undone.')) return;
    const updated = printStations.filter(s => s.id !== stationId);
    const mode = updated.length > 0 ? 'multi' : 'single';
    try {
      await apiClient.updatePrintStations(restaurantId, updated, mode);
      setPrintStations(updated);
      const updatedSP = { ...stationPrinters };
      delete updatedSP[stationId];
      setStationPrinters(updatedSP);
      if (isElectronPlatform && window.electronAPI?.setPrinterConfig) {
        await window.electronAPI.setPrinterConfig({ stationPrinters: { [stationId]: null } });
      }
    } catch (err) { console.error('Failed to delete station:', err); }
  }, [printStations, stationPrinters, restaurantId, isElectronPlatform]);

  const updateStation = useCallback(async (stationId, updates) => {
    const updated = printStations.map(s =>
      s.id === stationId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    try {
      const res = await apiClient.updatePrintStations(restaurantId, updated, 'multi');
      if (res?.success) setPrintStations((res.printStations || updated).filter(s => s.enabled));
      setEditingStationId(null);
    } catch (err) { console.error('Failed to update station:', err); }
  }, [printStations, restaurantId]);

  const switchToSimple = useCallback(async () => {
    if (!confirm('Switch to simple mode? This will clear printer routing on this device. Your stations will be preserved.')) return;
    assignPrinter('kot', null);
    assignPrinter('bill', null);
    if (isElectronPlatform && window.electronAPI?.setPrinterConfig) {
      const clearMap = {};
      for (const s of printStations) clearMap[s.id] = null;
      await window.electronAPI.setPrinterConfig({ stationPrinters: clearMap });
    }
    setStationPrinters({});
    // Delete all stations from server to go back to simple mode
    try {
      await apiClient.updatePrintStations(restaurantId, [], 'single');
      setPrintStations([]);
    } catch (err) { console.error('Failed to clear stations:', err); }
  }, [printStations, assignPrinter, isElectronPlatform, restaurantId]);

  const switchToMulti = useCallback(() => {
    setAddingStation(true);
    setNewStationName('');
    setNewStationType('kitchen');
    setNewStationCatIds([]);
    setNewStationPrinter('');
  }, []);

  const assignedCatIds = new Set(printStations.flatMap(s => s.categoryIds || []));

  // Don't render on web (after all hooks)
  if (webPlatform) return null;

  // Find printer by address from the scanned list (for dropdown display)
  const findPrinterByAddress = (address) => {
    if (!address) return null;
    return printers.find(p => p.address === address) || { name: address, address, type: 'unknown' };
  };

  // Helper: get printer identifier for Electron config
  const getPrinterId = (printer) => {
    if (!printer) return '';
    return isElectronPlatform ? (printer.type === 'network' ? printer.address : printer.name) : printer.address;
  };

  // Helper: render health dot
  const renderHealthDot = (printerKey, size = 7) => {
    if (!isElectronPlatform || !printerKey) return null;
    const h = printerHealth[printerKey];
    if (!h) return null;
    return (
      <span style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%', flexShrink: 0,
        backgroundColor: h === 'online' ? '#22c55e' : '#ef4444',
        boxShadow: h === 'online' ? '0 0 4px #22c55e' : '0 0 4px #ef4444',
      }} title={h === 'online' ? 'Printer reachable' : 'Printer unreachable'} />
    );
  };

  // Helper: render printer dropdown options
  const renderPrinterOptions = () => printers.map((p, i) => (
    <option key={p.address || i} value={getPrinterId(p)}>
      {p.name}{p.type === 'serial' ? ' (Built-in)' : ''}
    </option>
  ));

  // Handle adding a new station with printer assignment in one step
  const handleAddStation = async () => {
    const type = newStationType || 'kitchen';
    // Auto-generate name from type if not provided
    let name = newStationName.trim();
    if (!name) {
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      const sameTypeCount = printStations.filter(s => (s.type || '').toLowerCase() === type.toLowerCase()).length;
      name = sameTypeCount > 0 ? `${typeLabel} ${sameTypeCount + 1}` : typeLabel;
    }
    const stationId = await addStation({
      name,
      type,
      categoryIds: newStationCatIds,
    });
    if (stationId && newStationPrinter) {
      await assignStationPrinter(stationId, newStationPrinter);
    }
    setAddingStation(false);
    setNewStationName('');
    setNewStationType('kitchen');
    setNewStationCatIds([]);
    setNewStationPrinter('');
  };

  return (
    <div style={{
      marginTop: '16px', padding: '16px', backgroundColor: '#f0fdf4',
      borderRadius: '12px', border: '1px solid #bbf7d0',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <FaPrint style={{ color: '#16a34a' }} />
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#15803d' }}>
          Printer Setup
        </h4>
        {appVersion && (
          <span style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '10px' }}>
            v{appVersion}
          </span>
        )}
        {(() => {
          const defaultHealth = selectedPrinter ? (printerHealth[selectedPrinter.address] || printerHealth[selectedPrinter.name]) : null;
          const effectiveConnected = isElectronPlatform && defaultHealth ? defaultHealth === 'online' : isConnected;
          return effectiveConnected ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16a34a', marginLeft: 'auto' }}>
              <FaCheckCircle /> Online
            </span>
          ) : selectedPrinter ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#dc2626', marginLeft: 'auto' }}>
              <FaTimesCircle /> {defaultHealth === 'offline' ? 'Offline' : 'Not connected'}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
              No printer set
            </span>
          );
        })()}
      </div>

      {/* ── Discover Printers ── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
        <button
          onClick={scanPrinters}
          disabled={isScanning}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', fontSize: '12px', fontWeight: 500,
            backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px',
            cursor: isScanning ? 'not-allowed' : 'pointer', opacity: isScanning ? 0.7 : 1,
          }}
        >
          <FaSync style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none', fontSize: '11px' }} />
          {isScanning ? 'Scanning...' : 'Find Printers'}
        </button>
        {/* Test Print — next to Find Printers when a default printer is set */}
        {selectedPrinter && printStations.length === 0 && (
          <button
            onClick={testPrint}
            disabled={testPrintStatus === 'printing'}
            style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 500,
              backgroundColor: testPrintStatus === 'success' ? '#16a34a' : testPrintStatus === 'error' ? '#dc2626' : '#2563eb',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}
          >
            {testPrintStatus === 'printing' ? 'Printing...' : testPrintStatus === 'success' ? 'Test OK' : testPrintStatus === 'error' ? 'Test Failed' : 'Test Print'}
          </button>
        )}
        {scanStatus && (
          <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isScanning && <FaSync style={{ animation: 'spin 1s linear infinite', fontSize: '10px' }} />}
            {scanStatus}
          </span>
        )}
      </div>
      {/* Add by IP — secondary action, smaller row */}
      {isElectronPlatform && (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '10px', color: '#9ca3af' }}>or add by IP:</span>
          <input
            type="text"
            value={networkIpInput}
            onChange={(e) => setNetworkIpInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addNetworkPrinter(networkIpInput); }}
            placeholder="192.168.1.100"
            style={{
              padding: '4px 8px', fontSize: '11px', borderRadius: '4px',
              border: '1px solid #d1d5db', width: '140px',
            }}
          />
          <button
            onClick={() => addNetworkPrinter(networkIpInput)}
            disabled={!networkIpInput.trim()}
            style={{
              padding: '4px 8px', fontSize: '11px', fontWeight: 500,
              backgroundColor: networkIpInput.trim() ? '#7c3aed' : '#e5e7eb', color: 'white',
              border: 'none', borderRadius: '4px',
              cursor: networkIpInput.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Add
          </button>
        </div>
      )}
      {!isElectronPlatform && <div style={{ marginBottom: '10px' }} />}
      {scanError && (
        <div style={{ fontSize: '11px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '6px 10px', borderRadius: '6px', marginBottom: '10px' }}>
          {scanError}
        </div>
      )}

      {/* Discovered printers list */}
      {printers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
            Select your printer:
          </div>
          {printers.map((printer, idx) => {
            const isSelected = selectedPrinter?.address === printer.address;
            const printerKey = getPrinterId(printer);
            const health = printerHealth[printerKey] || printerHealth[printer.address] || printerHealth[printer.name];
            const testStatus = perPrinterTestStatus[printer.address || printer.name];
            return (
              <div
                key={printer.address || idx}
                onClick={() => selectPrinter(printer)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', backgroundColor: 'white', border: `1px solid ${isSelected ? '#16a34a' : '#e5e7eb'}`,
                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                  ...(isSelected && { backgroundColor: '#f0fdf4' }),
                }}
              >
                <PrinterIcon type={printer.type} />
                <span style={{ fontWeight: 500 }}>{printer.name}</span>
                <span style={{ color: '#9ca3af', fontSize: '11px' }}>{printer.address}</span>
                {/* Health status indicator */}
                {health && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px',
                    color: health === 'online' ? '#16a34a' : health === 'offline' ? '#dc2626' : '#9ca3af',
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: health === 'online' ? '#22c55e' : health === 'offline' ? '#ef4444' : '#d1d5db',
                      boxShadow: health === 'online' ? '0 0 4px #22c55e' : health === 'offline' ? '0 0 4px #ef4444' : 'none',
                    }} />
                    {health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : ''}
                  </span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {/* Test button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); testSpecificPrinter(printer); }}
                    disabled={testStatus === 'printing'}
                    style={{
                      padding: '2px 8px', fontSize: '10px', fontWeight: 500,
                      backgroundColor: testStatus === 'success' ? '#16a34a' : testStatus === 'error' ? '#dc2626' : '#6b7280',
                      color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    {testStatus === 'printing' ? '...' : testStatus === 'success' ? 'OK' : testStatus === 'error' ? 'Fail' : 'Test'}
                  </button>
                  {printer.type === 'network' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNetworkPrinter(printer.address); }}
                      style={{ fontSize: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >Remove</button>
                  )}
                  {isSelected && (
                    <FaCheckCircle style={{ color: '#16a34a', fontSize: '12px' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info line — when single printer, no stations */}
      {selectedPrinter && printStations.length === 0 && (
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
          All bills & KOTs print to <strong>{selectedPrinter.name}</strong>
        </div>
      )}

      {/* ── KOT Stations (multi-printer routing) ── */}
      {supportsRouting && (
        <div style={{ marginTop: printStations.length > 0 || addingStation ? '4px' : '0' }}>

          {/* Station Cards — only show when stations exist */}
          {printStations.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>KOT Stations</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                  — orders route to printers by category
                </span>
              </div>

              {/* Bill printer override */}
              {printers.length > 0 && (
                <div style={{
                  display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px',
                  padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0',
                }}>
                  <FaPrint style={{ color: '#2563eb', fontSize: '12px', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500, flexShrink: 0 }}>Bill Printer:</span>
                  <select
                    value={billPrinter?.address || billPrinter?.name || ''}
                    onChange={(e) => {
                      const p = printers.find(pr => (pr.address === e.target.value || pr.name === e.target.value));
                      assignPrinter('bill', p || null);
                    }}
                    style={{
                      flex: 1, padding: '5px 8px', fontSize: '11px', borderRadius: '5px',
                      border: '1px solid #d1d5db', backgroundColor: 'white',
                    }}
                  >
                    <option value="">{selectedPrinter?.name || 'Default printer'}</option>
                    {renderPrinterOptions()}
                  </select>
                  <button
                    onClick={testBillPrint}
                    disabled={testBillStatus === 'printing'}
                    style={{
                      padding: '4px 10px', fontSize: '11px', fontWeight: 500,
                      backgroundColor: '#2563eb', color: 'white',
                      border: 'none', borderRadius: '5px', cursor: 'pointer',
                    }}
                  >
                    {testBillStatus === 'printing' ? '...' : testBillStatus === 'success' ? 'OK' : testBillStatus === 'error' ? 'Fail' : 'Test'}
                  </button>
                </div>
              )}

              {printStations.map(station => {
                const st = stationTestStatus[station.id];
                const isEditing = editingStationId === station.id;
                const catCount = (station.categoryIds || []).length;
                const assignedPrinterKey = stationPrinters[station.id];
                const assignedPrinterObj = printers.find(p => getPrinterId(p) === assignedPrinterKey);
                const assignedCatNames = (station.categoryIds || [])
                  .map(id => categories.find(c => c.id === id)?.name).filter(Boolean);
                return (
                  <div key={station.id} style={{
                    padding: isEditing ? '10px 12px' : '8px 12px', backgroundColor: 'white', borderRadius: '8px',
                    border: `1px solid ${isEditing ? '#93c5fd' : '#e5e7eb'}`, marginBottom: '6px',
                  }}>
                    {/* Compact row — always visible */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {station.type && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: '#fff7ed', color: '#c2410c', textTransform: 'uppercase',
                        }}>{station.type}</span>
                      )}
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>{station.name}</span>
                      {renderHealthDot(assignedPrinterKey)}
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {assignedPrinterObj?.name || assignedPrinterKey || 'Default printer'}
                      </span>
                      {!isEditing && catCount > 0 && (
                        <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '2px' }}>
                          ({catCount} cat{catCount !== 1 ? 's' : ''})
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setEditingStationId(isEditing ? null : station.id)}
                          style={{ fontSize: '11px', color: isEditing ? '#2563eb' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: isEditing ? 600 : 400 }}
                        >{isEditing ? 'Done' : 'Edit'}</button>
                        <button onClick={() => deleteStation(station.id)} style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>

                    {/* Expanded edit panel — only when editing */}
                    {isEditing && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                        {/* Station name */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0, width: '50px' }}>Name:</span>
                          <input
                            type="text"
                            defaultValue={station.name}
                            autoFocus
                            maxLength={50}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) updateStation(station.id, { name: e.target.value.trim() });
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim() && e.target.value.trim() !== station.name) updateStation(station.id, { name: e.target.value.trim() });
                            }}
                            style={{ flex: 1, padding: '5px 8px', fontSize: '12px', borderRadius: '5px', border: '1px solid #d1d5db' }}
                          />
                        </div>
                        {/* Printer dropdown + test */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0, width: '50px' }}>Printer:</span>
                          <select
                            value={assignedPrinterKey || ''}
                            onChange={(e) => assignStationPrinter(station.id, e.target.value || null)}
                            style={{
                              flex: 1, padding: '5px 8px', fontSize: '12px', borderRadius: '5px',
                              border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
                            }}
                          >
                            <option value="">{selectedPrinter?.name || 'Default printer'}</option>
                            {renderPrinterOptions()}
                          </select>
                          <button
                            onClick={() => testStationPrint(station.id, station.name)}
                            disabled={st === 'printing'}
                            style={{
                              padding: '4px 10px', fontSize: '11px', fontWeight: 500,
                              backgroundColor: '#f97316', color: 'white',
                              border: 'none', borderRadius: '5px', cursor: 'pointer',
                            }}
                          >
                            {st === 'printing' ? '...' : st === 'success' ? 'OK' : st === 'error' ? 'Fail' : 'Test'}
                          </button>
                        </div>
                        {/* Categories */}
                        {categories.length > 0 && (
                          <div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>
                              Categories ({catCount}){catCount === 0 && <span style={{ color: '#f59e0b' }}> — all items route here</span>}:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                              {categories.map(cat => {
                                const isSelected = (station.categoryIds || []).includes(cat.id);
                                const assignedElsewhere = !isSelected && printStations.some(s => s.id !== station.id && (s.categoryIds || []).includes(cat.id));
                                return (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      const newIds = isSelected
                                        ? (station.categoryIds || []).filter(id => id !== cat.id)
                                        : [...(station.categoryIds || []), cat.id];
                                      updateStationCategories(station.id, newIds);
                                    }}
                                    disabled={assignedElsewhere}
                                    style={{
                                      padding: '3px 8px', borderRadius: '12px', fontSize: '11px', border: 'none',
                                      cursor: assignedElsewhere ? 'not-allowed' : 'pointer',
                                      backgroundColor: isSelected ? '#2563eb' : assignedElsewhere ? '#f3f4f6' : '#e5e7eb',
                                      color: isSelected ? '#fff' : assignedElsewhere ? '#9ca3af' : '#374151',
                                      opacity: assignedElsewhere ? 0.5 : 1,
                                    }}
                                  >
                                    {cat.name}{assignedElsewhere ? ' (taken)' : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned categories notice */}
              {(() => {
                const unassigned = categories.filter(c => !assignedCatIds.has(c.id));
                return unassigned.length > 0 ? (
                  <div style={{ fontSize: '11px', color: '#92400e', padding: '6px 8px', backgroundColor: '#fef3c7', borderRadius: '6px', marginBottom: '8px' }}>
                    <strong>Unassigned:</strong> {unassigned.map(c => c.name).join(', ')} — these route to the default printer.
                  </div>
                ) : null;
              })()}
            </>
          )}

          {/* Add Station Form or Button */}
          {addingStation ? (
            <div style={{
              padding: '10px 12px', backgroundColor: 'white', borderRadius: '8px',
              border: '2px dashed #93c5fd', marginBottom: '8px',
            }}>
              {/* Row 1: Type → Printer → Name (optional) → Add/Cancel */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: categories.length > 0 ? '8px' : '0' }}>
                <select
                  value={newStationType}
                  onChange={(e) => setNewStationType(e.target.value)}
                  autoFocus
                  style={{
                    width: '110px', padding: '6px 8px', fontSize: '12px', borderRadius: '6px',
                    border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontWeight: 500,
                  }}
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="bar">Bar</option>
                  <option value="expo">Expo</option>
                  <option value="pastry">Pastry</option>
                  <option value="grill">Grill</option>
                  <option value="drinks">Drinks</option>
                  <option value="packing">Packing</option>
                </select>
                <select
                  value={newStationPrinter}
                  onChange={(e) => setNewStationPrinter(e.target.value)}
                  style={{
                    flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px',
                    border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
                  }}
                >
                  <option value="">{selectedPrinter?.name || 'Default printer'}</option>
                  {renderPrinterOptions()}
                </select>
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  maxLength={50}
                  style={{
                    width: '140px', padding: '6px 8px', fontSize: '12px', borderRadius: '6px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <button
                  onClick={handleAddStation}
                  style={{
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: 'white',
                    backgroundColor: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >Add</button>
                <button
                  onClick={() => { setAddingStation(false); setNewStationName(''); setNewStationCatIds([]); setNewStationPrinter(''); }}
                  style={{
                    padding: '6px 8px', fontSize: '12px', color: '#6b7280',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >Cancel</button>
              </div>
              {/* Row 2: Category selection */}
              {categories.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>Assign categories:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                    {categories.map(cat => {
                      const isSelected = newStationCatIds.includes(cat.id);
                      const assignedElsewhere = printStations.some(s => (s.categoryIds || []).includes(cat.id));
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setNewStationCatIds(prev =>
                              isSelected ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          disabled={assignedElsewhere}
                          style={{
                            padding: '3px 8px', borderRadius: '12px', fontSize: '11px', border: 'none',
                            cursor: assignedElsewhere ? 'not-allowed' : 'pointer',
                            backgroundColor: isSelected ? '#2563eb' : assignedElsewhere ? '#f3f4f6' : '#e5e7eb',
                            color: isSelected ? '#fff' : assignedElsewhere ? '#9ca3af' : '#374151',
                            opacity: assignedElsewhere ? 0.5 : 1,
                          }}
                        >
                          {cat.name}{assignedElsewhere ? ' (taken)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={switchToMulti}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                width: '100%', padding: '8px', fontSize: '12px', color: '#6b7280',
                backgroundColor: 'transparent', border: '1px dashed #d1d5db', borderRadius: '8px',
                cursor: 'pointer', marginBottom: '8px',
              }}
            >
              + Add KOT Station {printStations.length === 0 && <span style={{ fontSize: '11px', color: '#9ca3af' }}>(for multi-printer setup)</span>}
            </button>
          )}
        </div>
      )}

      {/* ── Diagnostics ── */}
      <div style={{ marginTop: '12px', borderTop: '1px solid #d1d5db', paddingTop: '12px' }}>
        <button
          onClick={runDiagnostics}
          disabled={isDiagnosing}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center',
            padding: '8px 12px', fontSize: '12px', fontWeight: 500,
            backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px',
            cursor: isDiagnosing ? 'not-allowed' : 'pointer',
          }}
        >
          <FaStethoscope />
          {isDiagnosing ? 'Running Diagnostics...' : 'Run Print Diagnostics'}
        </button>
        {diagReport && (
          <pre style={{
            marginTop: '8px', padding: '10px', backgroundColor: '#1f2937', color: '#10b981',
            borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflow: 'auto',
          }}>
            {diagReport}
          </pre>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
