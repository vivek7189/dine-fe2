'use client';

// Printer device selection UI for native apps (Capacitor/Tauri/Electron).
// Returns null on web — no UI change for web users.
// Shows: scan for printers, select default, KOT/Bill routing, test print, diagnostics.

import { useState, useEffect, useCallback } from 'react';
import { isWeb, isCapacitor, isTauri, isElectron } from '../utils/platform';
import { printDocument } from '../utils/printBridge';
import apiClient from '../lib/api';
import { FaBluetooth, FaPrint, FaSync, FaCheckCircle, FaTimesCircle, FaUsb, FaWifi, FaStethoscope, FaMicrochip } from 'react-icons/fa';

// Icon for printer type
function PrinterIcon({ type }) {
  if (type === 'bluetooth') return <FaBluetooth style={{ color: '#3b82f6' }} />;
  if (type === 'network') return <FaWifi style={{ color: '#8b5cf6' }} />;
  if (type === 'serial') return <FaMicrochip style={{ color: '#ea580c' }} />;
  return <FaUsb style={{ color: '#6b7280' }} />;
}

export default function NativePrinterSettings({ restaurantId }) {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [kotPrinter, setKotPrinter] = useState(null);
  const [billPrinter, setBillPrinter] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState(null);
  const [testKotStatus, setTestKotStatus] = useState(null);
  const [testBillStatus, setTestBillStatus] = useState(null);
  const [webPlatform, setWebPlatform] = useState(true);
  const [diagReport, setDiagReport] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [appVersion, setAppVersion] = useState(null);
  const [printStations, setPrintStations] = useState([]);
  const [stationPrinters, setStationPrinters] = useState({});
  const [stationTestStatus, setStationTestStatus] = useState({});
  const [networkIpInput, setNetworkIpInput] = useState('');
  const [isNetworkScanning, setIsNetworkScanning] = useState(false);
  const [networkPrinters, setNetworkPrinters] = useState([]); // manually added IP printers
  const [printerHealth, setPrinterHealth] = useState({}); // { [printerName]: 'online'|'offline'|'checking' }
  const [categories, setCategories] = useState([]); // menu categories for station assignment
  const [editingDestination, setEditingDestination] = useState(null); // stationId being edited
  const [newStationForm, setNewStationForm] = useState(null); // { name, type, categoryIds }
  const [expandedStation, setExpandedStation] = useState(null); // stationId with expanded categories
  const isElectronPlatform = !isWeb() && isElectron();
  const isCapacitorPlatform = !isWeb() && isCapacitor();
  // Show printer routing for both Electron and Capacitor
  const supportsRouting = isElectronPlatform || isCapacitorPlatform;

  const scanPrinters = useCallback(async () => {
    setIsScanning(true);
    try {
      if (isCapacitor()) {
        const { DinePrinter } = await import('capacitor-dine-printer');
        const result = await DinePrinter.scanPrinters();
        setPrinters(result.printers || []);
      } else if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        const result = await invoke('list_printers');
        setPrinters(result || []);
      } else if (isElectron()) {
        const printers = await window.electronAPI.getPrinters();
        setPrinters((printers || []).map(p => ({
          name: p.displayName || p.name,
          address: p.name,
          type: p.isDefault ? 'default' : 'usb',
        })));
      }
    } catch (err) {
      console.error('Failed to scan printers:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const selectPrinter = useCallback(async (printer) => {
    try {
      if (isCapacitor()) {
        const { DinePrinter } = await import('capacitor-dine-printer');
        await DinePrinter.setDefaultPrinter({ address: printer.address });
      } else if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_default_printer', { printerName: printer.name });
      } else if (isElectron()) {
        await window.electronAPI.setDefaultPrinter(printer.name);
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
        // Electron uses printer name, not address
        const electronConfig = {};
        if (role === 'kot') electronConfig.kotPrinter = printer ? printer.name : null;
        if (role === 'bill') electronConfig.billPrinter = printer ? printer.name : null;
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

  // Detect platform and app version on mount
  useEffect(() => {
    setWebPlatform(isWeb());
    if (isTauri()) {
      import('@tauri-apps/api/app').then(({ getVersion }) => {
        getVersion().then(v => setAppVersion(v)).catch(() => {});
      }).catch(() => {});
    } else if (isElectron()) {
      window.electronAPI.getVersion().then(v => setAppVersion(v)).catch(() => {});
    }
  }, []);

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

  // Scan network for thermal printers (Electron only)
  const scanNetworkPrinters = useCallback(async () => {
    if (!isElectronPlatform || !window.electronAPI?.scanNetworkPrinters) return;
    setIsNetworkScanning(true);
    try {
      const result = await window.electronAPI.scanNetworkPrinters();
      if (result?.printers?.length) {
        // Merge discovered printers into the list (avoid duplicates)
        setPrinters(prev => {
          const existing = new Set(prev.map(p => p.address));
          const newPrinters = result.printers.filter(p => !existing.has(p.address));
          return [...prev, ...newPrinters];
        });
      }
    } catch (err) {
      console.error('Network scan failed:', err);
    } finally {
      setIsNetworkScanning(false);
    }
  }, [isElectronPlatform]);

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
  const printerMode = printStations.length > 0 ? 'multi' : 'simple';

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
    if (!form?.name?.trim()) return;
    const newStation = {
      id: `ps_${Date.now().toString(36)}`,
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
        setNewStationForm(null);
      }
    } catch (err) { console.error('Failed to add station:', err); }
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
      setEditingDestination(null);
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
    setNewStationForm({ name: '', type: 'kitchen', categoryIds: [] });
  }, []);

  const assignedCatIds = new Set(printStations.flatMap(s => s.categoryIds || []));

  // Don't render on web (after all hooks)
  if (webPlatform) return null;

  // Find printer by address from the scanned list (for dropdown display)
  const findPrinterByAddress = (address) => {
    if (!address) return null;
    return printers.find(p => p.address === address) || { name: address, address, type: 'unknown' };
  };

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f0fdf4',
      borderRadius: '12px',
      border: '1px solid #bbf7d0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <FaPrint style={{ color: '#16a34a' }} />
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#15803d' }}>
          Native Printer Setup
        </h4>
        {appVersion && (
          <span style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '10px' }}>
            v{appVersion}
          </span>
        )}
        {(() => {
          // Use heartbeat status for Electron when available
          const defaultHealth = selectedPrinter ? printerHealth[selectedPrinter.name] : null;
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

      {selectedPrinter && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'white',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <PrinterIcon type={selectedPrinter.type} />
          <span style={{ fontWeight: 500 }}>{selectedPrinter.name}</span>
          <span style={{ color: '#9ca3af', fontSize: '11px' }}>{selectedPrinter.address}</span>
          {isElectronPlatform && printerHealth[selectedPrinter.name] && (
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', marginLeft: 'auto',
              backgroundColor: printerHealth[selectedPrinter.name] === 'online' ? '#22c55e' : '#ef4444',
              boxShadow: printerHealth[selectedPrinter.name] === 'online' ? '0 0 4px #22c55e' : '0 0 4px #ef4444',
            }} title={printerHealth[selectedPrinter.name] === 'online' ? 'Printer reachable' : 'Printer unreachable — check power & network'} />
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={scanPrinters}
          disabled={isScanning}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 12px', fontSize: '13px', fontWeight: 500,
            backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px',
            cursor: isScanning ? 'not-allowed' : 'pointer', opacity: isScanning ? 0.7 : 1,
          }}
        >
          <FaSync style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
          {isScanning ? 'Scanning...' : 'Scan Printers'}
        </button>

        <button
          onClick={testPrint}
          disabled={!selectedPrinter || testPrintStatus === 'printing'}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 12px', fontSize: '13px', fontWeight: 500,
            backgroundColor: selectedPrinter ? '#2563eb' : '#d1d5db', color: 'white',
            border: 'none', borderRadius: '8px',
            cursor: selectedPrinter ? 'pointer' : 'not-allowed',
          }}
        >
          <FaPrint />
          {testPrintStatus === 'printing' ? 'Printing...' :
           testPrintStatus === 'success' ? 'Success!' :
           testPrintStatus === 'error' ? 'Failed' : 'Test Print'}
        </button>
      </div>

      {/* Network Printer — Add by IP (Electron only) */}
      {isElectronPlatform && (
        <div style={{
          marginBottom: '12px', padding: '10px', backgroundColor: '#faf5ff',
          borderRadius: '8px', border: '1px solid #e9d5ff',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed', marginBottom: '8px' }}>
            Add Network Printer (IP Address)
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input
              type="text"
              value={networkIpInput}
              onChange={(e) => setNetworkIpInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addNetworkPrinter(networkIpInput); }}
              placeholder="e.g. 192.168.1.100 or 192.168.1.100:9100"
              style={{
                flex: 1, padding: '6px 10px', fontSize: '13px', borderRadius: '6px',
                border: '1px solid #d1d5db', backgroundColor: 'white',
              }}
            />
            <button
              onClick={() => addNetworkPrinter(networkIpInput)}
              disabled={!networkIpInput.trim()}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                backgroundColor: networkIpInput.trim() ? '#7c3aed' : '#e5e7eb', color: 'white',
                border: 'none', borderRadius: '6px',
                cursor: networkIpInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add
            </button>
            <button
              onClick={scanNetworkPrinters}
              disabled={isNetworkScanning}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                backgroundColor: '#8b5cf6', color: 'white',
                border: 'none', borderRadius: '6px',
                cursor: isNetworkScanning ? 'not-allowed' : 'pointer',
                opacity: isNetworkScanning ? 0.7 : 1,
              }}
            >
              <FaSync style={{ display: 'inline', marginRight: '4px', animation: isNetworkScanning ? 'spin 1s linear infinite' : 'none' }} />
              {isNetworkScanning ? 'Scanning...' : 'Scan LAN'}
            </button>
          </div>
          {networkPrinters.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {networkPrinters.map((p) => (
                <div key={p.address} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '4px 8px', backgroundColor: 'white', borderRadius: '6px',
                  border: '1px solid #e5e7eb', fontSize: '12px',
                }}>
                  <FaWifi style={{ color: '#8b5cf6', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{p.address}</span>
                  <button
                    onClick={() => removeNetworkPrinter(p.address)}
                    style={{
                      padding: '2px 8px', fontSize: '11px', color: '#ef4444',
                      backgroundColor: 'transparent', border: '1px solid #fca5a5', borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
            For thermal printers connected directly via IP (not installed as OS driver). Default port: 9100.
          </div>
        </div>
      )}

      {printers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            Found {printers.length} printer{printers.length !== 1 ? 's' : ''}:
          </div>
          {printers.map((printer, idx) => (
            <button
              key={printer.address || idx}
              onClick={() => selectPrinter(printer)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', backgroundColor: 'white', border: '1px solid #e5e7eb',
                borderRadius: '8px', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                ...(selectedPrinter?.address === printer.address && {
                  borderColor: '#16a34a', backgroundColor: '#f0fdf4',
                }),
              }}
            >
              <PrinterIcon type={printer.type} />
              <div>
                <div style={{ fontWeight: 500 }}>{printer.name}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {printer.address}
                  {printer.type === 'serial' && <span style={{ marginLeft: '6px', color: '#ea580c', fontWeight: 500 }}>(Built-in)</span>}
                </div>
              </div>
              {selectedPrinter?.address === printer.address && (
                <FaCheckCircle style={{ color: '#16a34a', marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Print Destinations — Unified Printer Routing ── */}
      {supportsRouting && printers.length > 0 && (
        <div style={{ marginTop: '12px' }}>

          {/* Mode indicator */}
          {printerMode === 'simple' && !newStationForm ? (
            <div style={{
              padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px',
              border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#15803d', marginBottom: '4px' }}>
                All KOT and bill prints go to the selected printer above.
              </div>
              <button
                onClick={switchToMulti}
                style={{
                  fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, textDecoration: 'underline',
                }}
              >
                Need multiple printers? Set up multi-printer routing →
              </button>
            </div>
          ) : printerMode === 'simple' && newStationForm ? (
            <div style={{
              padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px',
              border: '1px solid #bfdbfe',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8', marginBottom: '10px' }}>
                Set up multi-printer routing
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                Create your first KOT station. Orders will be split by category and sent to different printers.
              </div>
              <div style={{
                padding: '10px 12px', backgroundColor: 'white', borderRadius: '8px',
                border: '2px dashed #bfdbfe', marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Station name (e.g. Main Kitchen)"
                    value={newStationForm.name}
                    onChange={(e) => setNewStationForm(prev => ({ ...prev, name: e.target.value }))}
                    autoFocus
                    maxLength={50}
                    style={{
                      flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: '6px',
                      border: '1px solid #d1d5db', backgroundColor: 'white',
                    }}
                  />
                  <input
                    type="text"
                    list="station-types-list"
                    placeholder="Type (e.g. Kitchen)"
                    value={newStationForm.type === 'kitchen' && !newStationForm._typeEdited ? '' : newStationForm.type}
                    onChange={(e) => setNewStationForm(prev => ({ ...prev, type: e.target.value || 'kitchen', _typeEdited: true }))}
                    maxLength={30}
                    style={{
                      width: '130px', padding: '6px 10px', fontSize: '12px', borderRadius: '6px',
                      border: '1px solid #d1d5db', backgroundColor: 'white',
                    }}
                  />
                  <datalist id="station-types-list">
                    <option value="Kitchen" />
                    <option value="Bar" />
                    <option value="Expo" />
                    <option value="Pastry" />
                    <option value="Grill" />
                    <option value="Drinks" />
                    <option value="Packing" />
                  </datalist>
                </div>
                {categories.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Assign categories:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                      {categories.map(cat => {
                        const isSelected = (newStationForm.categoryIds || []).includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setNewStationForm(prev => ({
                                ...prev,
                                categoryIds: isSelected
                                  ? prev.categoryIds.filter(id => id !== cat.id)
                                  : [...prev.categoryIds, cat.id]
                              }));
                            }}
                            style={{
                              padding: '3px 8px', borderRadius: '12px', fontSize: '11px', border: 'none',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#2563eb' : '#e5e7eb',
                              color: isSelected ? '#fff' : '#374151',
                            }}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setNewStationForm(null)}
                    style={{
                      padding: '6px 12px', fontSize: '12px', color: '#6b7280',
                      background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
                    }}
                  >Cancel</button>
                  <button
                    onClick={() => addStation(newStationForm)}
                    disabled={!newStationForm.name.trim()}
                    style={{
                      padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'white',
                      backgroundColor: newStationForm.name.trim() ? '#2563eb' : '#d1d5db',
                      border: 'none', borderRadius: '6px',
                      cursor: newStationForm.name.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >Add Station</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px',
              border: '1px solid #bfdbfe',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>
                  Print Destinations
                </div>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                  {printStations.length} station{printStations.length !== 1 ? 's' : ''} + receipt
                </span>
              </div>

              {/* Receipt Printer (always shown in multi mode) */}
              <div style={{
                padding: '10px 12px', backgroundColor: 'white', borderRadius: '8px',
                border: '1px solid #e5e7eb', marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FaPrint style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>Receipt Printer</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                    backgroundColor: '#dbeafe', color: '#1d4ed8', textTransform: 'uppercase',
                  }}>Receipt</span>
                  {isElectronPlatform && billPrinter && printerHealth[billPrinter.name] && (
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%', marginLeft: 'auto',
                      backgroundColor: printerHealth[billPrinter.name] === 'online' ? '#22c55e' : '#ef4444',
                    }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select
                    value={billPrinter?.address || billPrinter?.name || ''}
                    onChange={(e) => {
                      const p = printers.find(pr => pr.address === e.target.value || pr.name === e.target.value);
                      assignPrinter('bill', p || null);
                    }}
                    style={{
                      flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: '6px',
                      border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
                    }}
                  >
                    <option value="">Use default printer</option>
                    {printers.map((p, i) => (
                      <option key={p.address || i} value={isElectronPlatform ? p.name : p.address}>
                        {p.name}{p.type === 'serial' ? ' (Built-in)' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={testBillPrint}
                    disabled={testBillStatus === 'printing'}
                    style={{
                      padding: '6px 12px', fontSize: '11px', fontWeight: 500,
                      backgroundColor: '#2563eb', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    {testBillStatus === 'printing' ? '...' : testBillStatus === 'success' ? '✓' : testBillStatus === 'error' ? '✗' : 'Test'}
                  </button>
                </div>
              </div>

              {/* KOT Station rows */}
              {printStations.map(station => {
                const st = stationTestStatus[station.id];
                const isEditing = editingDestination === station.id;
                const isExpanded = expandedStation === station.id;
                const catCount = (station.categoryIds || []).length;
                return (
                  <div key={station.id} style={{
                    padding: '10px 12px', backgroundColor: 'white', borderRadius: '8px',
                    border: '1px solid #e5e7eb', marginBottom: '8px',
                  }}>
                    {/* Station header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <FaPrint style={{ color: '#f97316', flexShrink: 0 }} />
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                          <input
                            type="text"
                            defaultValue={station.name}
                            autoFocus
                            maxLength={50}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) updateStation(station.id, { name: e.target.value.trim() });
                              if (e.key === 'Escape') setEditingDestination(null);
                            }}
                            style={{ flex: 1, padding: '3px 6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                          />
                          <button onClick={() => setEditingDestination(null)} style={{ fontSize: '11px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>{station.name}</span>
                          {station.type && (
                            <span style={{
                              fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: '#fff7ed', color: '#c2410c', textTransform: 'uppercase',
                            }}>{station.type}</span>
                          )}
                          {station.isDefault && (
                            <span style={{
                              fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: '#dcfce7', color: '#15803d',
                            }}>DEFAULT</span>
                          )}
                          {isElectronPlatform && stationPrinters[station.id] && printerHealth[stationPrinters[station.id]] && (
                            <span style={{
                              width: '7px', height: '7px', borderRadius: '50%',
                              backgroundColor: printerHealth[stationPrinters[station.id]] === 'online' ? '#22c55e' : '#ef4444',
                            }} />
                          )}
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                            <button onClick={() => setEditingDestination(station.id)} style={{ fontSize: '11px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit name">✏️</button>
                            <button onClick={() => deleteStation(station.id)} style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">🗑</button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Printer dropdown */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                      <select
                        value={stationPrinters[station.id] || ''}
                        onChange={(e) => assignStationPrinter(station.id, e.target.value || null)}
                        style={{
                          flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: '6px',
                          border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
                        }}
                      >
                        <option value="">Use default printer</option>
                        {printers.map((p, i) => (
                          <option key={p.address || i} value={isElectronPlatform ? p.name : p.address}>
                            {p.name}{p.type === 'serial' ? ' (Built-in)' : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => testStationPrint(station.id, station.name)}
                        disabled={st === 'printing'}
                        style={{
                          padding: '6px 12px', fontSize: '11px', fontWeight: 500,
                          backgroundColor: '#f97316', color: 'white',
                          border: 'none', borderRadius: '6px', cursor: 'pointer',
                        }}
                      >
                        {st === 'printing' ? '...' : st === 'success' ? '✓' : st === 'error' ? '✗' : 'Test'}
                      </button>
                    </div>

                    {/* Categories — expandable */}
                    <button
                      onClick={() => setExpandedStation(isExpanded ? null : station.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', width: '100%',
                        padding: '4px 0', fontSize: '11px', color: '#6b7280',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
                      {catCount} categor{catCount === 1 ? 'y' : 'ies'} assigned
                      {catCount === 0 && <span style={{ color: '#f59e0b', marginLeft: '4px' }}>(routes to default)</span>}
                    </button>
                    {isExpanded && categories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px', maxHeight: '120px', overflowY: 'auto' }}>
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
                                padding: '3px 8px', borderRadius: '12px', fontSize: '11px', border: 'none', cursor: assignedElsewhere ? 'not-allowed' : 'pointer',
                                backgroundColor: isSelected ? '#2563eb' : assignedElsewhere ? '#f3f4f6' : '#e5e7eb',
                                color: isSelected ? '#fff' : assignedElsewhere ? '#9ca3af' : '#374151',
                                opacity: assignedElsewhere ? 0.5 : 1,
                              }}
                            >
                              {cat.name}{assignedElsewhere ? ' ✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add new station form */}
              {newStationForm ? (
                <div style={{
                  padding: '10px 12px', backgroundColor: 'white', borderRadius: '8px',
                  border: '2px dashed #bfdbfe', marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Station name (e.g. Main Kitchen)"
                      value={newStationForm.name}
                      onChange={(e) => setNewStationForm(prev => ({ ...prev, name: e.target.value }))}
                      autoFocus
                      maxLength={50}
                      style={{
                        flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: '6px',
                        border: '1px solid #d1d5db', backgroundColor: 'white',
                      }}
                    />
                    <input
                      type="text"
                      list="station-types-list-multi"
                      placeholder="Type (e.g. Kitchen)"
                      value={newStationForm.type === 'kitchen' && !newStationForm._typeEdited ? '' : newStationForm.type}
                      onChange={(e) => setNewStationForm(prev => ({ ...prev, type: e.target.value || 'kitchen', _typeEdited: true }))}
                      maxLength={30}
                      style={{
                        width: '130px', padding: '6px 10px', fontSize: '12px', borderRadius: '6px',
                        border: '1px solid #d1d5db', backgroundColor: 'white',
                      }}
                    />
                    <datalist id="station-types-list-multi">
                      <option value="Kitchen" />
                      <option value="Bar" />
                      <option value="Expo" />
                      <option value="Pastry" />
                      <option value="Grill" />
                      <option value="Drinks" />
                      <option value="Packing" />
                    </datalist>
                  </div>
                  {/* Category selection for new station */}
                  {categories.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Assign categories:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                        {categories.map(cat => {
                          const isSelected = (newStationForm.categoryIds || []).includes(cat.id);
                          const assignedElsewhere = printStations.some(s => (s.categoryIds || []).includes(cat.id));
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setNewStationForm(prev => ({
                                  ...prev,
                                  categoryIds: isSelected
                                    ? prev.categoryIds.filter(id => id !== cat.id)
                                    : [...prev.categoryIds, cat.id]
                                }));
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
                              {cat.name}{assignedElsewhere ? ' ✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setNewStationForm(null)}
                      style={{
                        padding: '6px 12px', fontSize: '12px', color: '#6b7280',
                        background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
                      }}
                    >Cancel</button>
                    <button
                      onClick={() => addStation(newStationForm)}
                      disabled={!newStationForm.name.trim()}
                      style={{
                        padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'white',
                        backgroundColor: newStationForm.name.trim() ? '#2563eb' : '#d1d5db',
                        border: 'none', borderRadius: '6px',
                        cursor: newStationForm.name.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >Add Station</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setNewStationForm({ name: '', type: 'kitchen', categoryIds: [] })}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    width: '100%', padding: '8px', fontSize: '12px', color: '#1d4ed8',
                    backgroundColor: 'white', border: '1px dashed #93c5fd', borderRadius: '8px',
                    cursor: 'pointer', marginBottom: '8px',
                  }}
                >
                  + Add KOT Station
                </button>
              )}

              {/* Unassigned categories notice */}
              {(() => {
                const unassigned = categories.filter(c => !assignedCatIds.has(c.id));
                return unassigned.length > 0 && printStations.length > 0 ? (
                  <div style={{ fontSize: '11px', color: '#92400e', padding: '6px 8px', backgroundColor: '#fef3c7', borderRadius: '6px', marginBottom: '8px' }}>
                    <strong>Unassigned:</strong> {unassigned.map(c => c.name).join(', ')} — these route to the default station.
                  </div>
                ) : null;
              })()}

              {/* Switch to simple */}
              <button
                onClick={switchToSimple}
                style={{
                  fontSize: '11px', color: '#6b7280', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, textDecoration: 'underline',
                }}
              >
                Switch to simple mode (single printer)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics */}
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
