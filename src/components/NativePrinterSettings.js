'use client';

// Printer device selection UI for native apps (Capacitor/Tauri).
// Returns null on web — no UI change for web users.
// Shows: scan for printers, select default, test print, connection status.

import { useState, useEffect, useCallback } from 'react';
import { isWeb, isCapacitor, isTauri } from '../utils/platform';
import { printDocument } from '../utils/printBridge';
import { FaBluetooth, FaPrint, FaSync, FaCheckCircle, FaTimesCircle, FaUsb } from 'react-icons/fa';

export default function NativePrinterSettings({ restaurantId }) {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState(null);
  const [webPlatform, setWebPlatform] = useState(true);

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
      }
      setSelectedPrinter(printer);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to set default printer:', err);
      setIsConnected(false);
    }
  }, []);

  const testPrint = useCallback(async () => {
    setTestPrintStatus('printing');
    try {
      const testHtml = `
        <!DOCTYPE html><html><head>
        <style>@page{size:80mm auto;margin:0;}body{font-family:'Courier New',monospace;padding:16px;text-align:center;}</style>
        </head><body>
          <h2>DineOpen POS</h2>
          <p>--- TEST PRINT ---</p>
          <p>Printer is working correctly!</p>
          <p>${new Date().toLocaleString()}</p>
          <p>================================</p>
        </body></html>
      `;
      await printDocument({ html: testHtml, type: 'bill' });
      setTestPrintStatus('success');
    } catch (err) {
      console.error('Test print failed:', err);
      setTestPrintStatus('error');
    }
    setTimeout(() => setTestPrintStatus(null), 3000);
  }, []);

  // Detect platform on mount
  useEffect(() => {
    setWebPlatform(isWeb());
  }, []);

  // Check connection status on mount
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
        } else if (isTauri()) {
          const { invoke } = await import('@tauri-apps/api/core');
          const defaultPrinter = await invoke('get_default_printer');
          if (defaultPrinter && defaultPrinter.name) {
            setSelectedPrinter(defaultPrinter);
            setIsConnected(true);
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
          {selectedPrinter.type === 'bluetooth' ? <FaBluetooth style={{ color: '#3b82f6' }} /> : <FaUsb style={{ color: '#6b7280' }} />}
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
              {printer.type === 'bluetooth' ? <FaBluetooth style={{ color: '#3b82f6' }} /> : <FaUsb style={{ color: '#6b7280' }} />}
              <div>
                <div style={{ fontWeight: 500 }}>{printer.name}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{printer.address}</div>
              </div>
              {selectedPrinter?.address === printer.address && (
                <FaCheckCircle style={{ color: '#16a34a', marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
