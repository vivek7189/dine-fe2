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

export interface DinePrinterPlugin {
  print(options: PrintOptions): Promise<void>;
  scanPrinters(): Promise<{ printers: PrinterInfo[] }>;
  setDefaultPrinter(options: { address: string }): Promise<void>;
  getDefaultPrinter(): Promise<PrinterInfo | null>;
  isConnected(): Promise<{ connected: boolean }>;
  setPrinterConfig(config: PrinterConfig): Promise<void>;
  getPrinterConfig(): Promise<PrinterConfig>;
  diagnose(): Promise<DiagnoseResult>;
}

export declare const DinePrinter: DinePrinterPlugin;
