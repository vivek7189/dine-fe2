export interface PrintOptions {
  html: string;
  type: 'bill' | 'kot';
  printerWidth?: number;
  copies?: number;
}

export interface PrinterInfo {
  name: string;
  address: string;
  type: 'bluetooth' | 'usb' | 'network' | 'serial';
}

export interface PrinterConfig {
  defaultPrinter?: string | null;
  kotPrinter?: string | null;
  billPrinter?: string | null;
}

export interface DiagnoseResult {
  report: string;
}

export interface PrinterStatus {
  status: 'ready' | 'no_paper' | 'overheated' | 'busy' | 'error' | 'unknown';
  vendorSdk: string | null;
  statusCode?: number;
}

export interface DeviceCapabilities {
  vendorSdk: string | null;
  supportsCutter: boolean;
  supports80mm: boolean;
  supportsQRCode: boolean;
  supportsBarcode: boolean;
  supportsBitmap: boolean;
  supportsCashDrawer: boolean;
  supportsLabelPrint: boolean;
}

export interface DinePrinterPlugin {
  print(options: PrintOptions): Promise<void>;
  scanPrinters(): Promise<{ printers: PrinterInfo[] }>;
  setDefaultPrinter(options: { address: string }): Promise<void>;
  getDefaultPrinter(): Promise<PrinterInfo | null>;
  isConnected(): Promise<{ connected: boolean }>;
  setPrinterConfig(config: PrinterConfig): Promise<void>;
  getPrinterConfig(): Promise<PrinterConfig>;
  diagnose(): Promise<DiagnoseResult>;
  getPrinterStatus(): Promise<PrinterStatus>;
  getDeviceCapabilities(): Promise<DeviceCapabilities>;
  printQRCode(options: { content: string; size?: number }): Promise<void>;
  printBarcode(options: { data: string; format?: string; width?: number; height?: number; showText?: boolean }): Promise<void>;
  printBitmap(options: { base64: string; alignment?: 'left' | 'center' | 'right'; maxWidth?: number }): Promise<void>;
  cutPaper(): Promise<void>;
  openCashDrawer(): Promise<void>;
}

export declare const DinePrinter: DinePrinterPlugin;
