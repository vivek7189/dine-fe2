import { WebPlugin } from '@capacitor/core';
import type { DinePrinterPlugin, PrintOptions, PrinterInfo, PrinterConfig, DiagnoseResult } from './definitions';

// Web fallback — no-op for scanning, falls back to window.print() for printing
export class DinePrinterWeb extends WebPlugin implements DinePrinterPlugin {
  async print(_options: PrintOptions): Promise<void> {
    window.print();
  }

  async scanPrinters(): Promise<{ printers: PrinterInfo[] }> {
    console.warn('DinePrinter.scanPrinters() is not available on web');
    return { printers: [] };
  }

  async setDefaultPrinter(_options: { address: string }): Promise<void> {
    console.warn('DinePrinter.setDefaultPrinter() is not available on web');
  }

  async getDefaultPrinter(): Promise<PrinterInfo | null> {
    return null;
  }

  async isConnected(): Promise<{ connected: boolean }> {
    return { connected: false };
  }

  async setPrinterConfig(_config: PrinterConfig): Promise<void> {
    console.warn('DinePrinter.setPrinterConfig() is not available on web');
  }

  async getPrinterConfig(): Promise<PrinterConfig> {
    return { defaultPrinter: null, kotPrinter: null, billPrinter: null };
  }

  async diagnose(): Promise<DiagnoseResult> {
    return { report: 'Diagnostics not available on web platform' };
  }
}
