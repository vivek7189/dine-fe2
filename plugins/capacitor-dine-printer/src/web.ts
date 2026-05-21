import { WebPlugin } from '@capacitor/core';
import type { DinePrinterPlugin, PrintOptions, PrinterInfo, PrinterConfig, DiagnoseResult, PrinterStatus, DeviceCapabilities } from './definitions';

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

  async getPrinterStatus(): Promise<PrinterStatus> {
    return { status: 'unknown', vendorSdk: null };
  }

  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    return {
      vendorSdk: null, supportsCutter: false, supports80mm: false,
      supportsQRCode: false, supportsBarcode: false, supportsBitmap: false,
      supportsCashDrawer: false, supportsLabelPrint: false,
    };
  }

  async printQRCode(_options: { content: string; size?: number }): Promise<void> {
    console.warn('DinePrinter.printQRCode() is not available on web');
  }

  async printBarcode(_options: { data: string; format?: string; width?: number; height?: number; showText?: boolean }): Promise<void> {
    console.warn('DinePrinter.printBarcode() is not available on web');
  }

  async printBitmap(_options: { base64: string; alignment?: string; maxWidth?: number }): Promise<void> {
    console.warn('DinePrinter.printBitmap() is not available on web');
  }

  async cutPaper(): Promise<void> {
    console.warn('DinePrinter.cutPaper() is not available on web');
  }

  async openCashDrawer(): Promise<void> {
    console.warn('DinePrinter.openCashDrawer() is not available on web');
  }
}
