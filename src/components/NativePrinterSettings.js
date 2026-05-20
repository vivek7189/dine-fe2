'use client';

// Printer device selection UI for native apps (Capacitor/Tauri/Electron).
// Returns null on web — no UI change for web users.
// Shows: scan for printers, select default, KOT/Bill routing, test print, diagnostics.

import { useState, useEffect, useCallback } from 'react';
import { isWeb, isCapacitor, isTauri, isElectron } from '../utils/platform';
import { printDocument } from '../utils/printBridge';
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
            setSelectedPrinter({ name: config.defaultPrinter, address: config.defaultPrinter, type: 'usb' });
            setIsConnected(true);
          }
          if (config?.kotPrinter) {
            setKotPrinter({ name: config.kotPrinter, address: config.kotPrinter, type: 'usb' });
          }
          if (config?.billPrinter) {
            setBillPrinter({ name: config.billPrinter, address: config.billPrinter, type: 'usb' });
          }
        }
      } catch (err) {
        // No printer configured yet
      }
    };
    checkConnection();
  }, []);

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
        {isConnected ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16a34a', marginLeft: 'auto' }}>
            <FaCheckCircle /> Connected
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#dc2626', marginLeft: 'auto' }}>
            <FaTimesCircle /> Not connected
          </span>
        )}
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

      {/* KOT / Bill Printer Assignment (Electron + Capacitor) */}
      {supportsRouting && printers.length > 0 && (
        <div style={{
          marginTop: '12px', padding: '12px', backgroundColor: '#eff6ff',
          borderRadius: '8px', border: '1px solid #bfdbfe',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8', marginBottom: '10px' }}>
            Printer Routing — Assign printers by job type
          </div>

          {/* KOT Printer */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              KOT Printer (Kitchen Orders)
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select
                value={kotPrinter?.address || kotPrinter?.name || ''}
                onChange={(e) => {
                  const p = printers.find(pr => pr.address === e.target.value || pr.name === e.target.value);
                  assignPrinter('kot', p || null);
                }}
                style={{
                  flex: 1, padding: '6px 10px', fontSize: '13px', borderRadius: '6px',
                  border: '1px solid #d1d5db', backgroundColor: 'white',
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
                onClick={testKotPrint}
                disabled={!kotPrinter || testKotStatus === 'printing'}
                style={{
                  padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                  backgroundColor: kotPrinter ? '#f97316' : '#e5e7eb', color: 'white',
                  border: 'none', borderRadius: '6px',
                  cursor: kotPrinter ? 'pointer' : 'not-allowed',
                }}
              >
                {testKotStatus === 'printing' ? '...' : testKotStatus === 'success' ? 'OK' : testKotStatus === 'error' ? 'Fail' : 'Test'}
              </button>
            </div>
          </div>

          {/* Bill Printer */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              Bill Printer (Invoices / Receipts)
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select
                value={billPrinter?.address || billPrinter?.name || ''}
                onChange={(e) => {
                  const p = printers.find(pr => pr.address === e.target.value || pr.name === e.target.value);
                  assignPrinter('bill', p || null);
                }}
                style={{
                  flex: 1, padding: '6px 10px', fontSize: '13px', borderRadius: '6px',
                  border: '1px solid #d1d5db', backgroundColor: 'white',
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
                disabled={!billPrinter || testBillStatus === 'printing'}
                style={{
                  padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                  backgroundColor: billPrinter ? '#2563eb' : '#e5e7eb', color: 'white',
                  border: 'none', borderRadius: '6px',
                  cursor: billPrinter ? 'pointer' : 'not-allowed',
                }}
              >
                {testBillStatus === 'printing' ? '...' : testBillStatus === 'success' ? 'OK' : testBillStatus === 'error' ? 'Fail' : 'Test'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            If not assigned, both KOT and bill jobs go to the default printer above.
          </div>
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
