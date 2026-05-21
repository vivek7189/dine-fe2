// Type definitions for the DinePrinter Capacitor plugin

export interface PrintOptions {
  /** Full HTML string to print */
  html: string;
  /** Print job type */
  type: 'bill' | 'kot';
  /** Printer paper width in mm (58 or 80) */
  printerWidth?: number;
  /** Number of copies */
  copies?: number;
}

export interface PrinterInfo {
  /** Printer display name */
  name: string;
  /** Bluetooth MAC address, serial:path, tcp:host:port, or usb:vid:pid */
  address: string;
  /** Connection type */
  type: 'bluetooth' | 'usb' | 'network' | 'serial';
}

export interface PrinterConfig {
  /** Default printer address */
  defaultPrinter?: string | null;
  /** KOT printer address (falls back to default if null) */
  kotPrinter?: string | null;
  /** Bill printer address (falls back to default if null) */
  billPrinter?: string | null;
}

export interface DiagnoseResult {
  /** Human-readable diagnostic report */
  report: string;
}

export interface PrinterStatus {
  /** Printer status */
  status: 'ready' | 'no_paper' | 'overheated' | 'busy' | 'error' | 'unknown';
  /** Detected vendor SDK name, or null if none */
  vendorSdk: string | null;
  /** Raw vendor-specific status code (ZCS only) */
  statusCode?: number;
}

export interface DeviceCapabilities {
  /** Detected vendor SDK name, or null */
  vendorSdk: string | null;
  /** Device has a paper cutter */
  supportsCutter: boolean;
  /** Device supports 80mm paper */
  supports80mm: boolean;
  /** Device can print QR codes */
  supportsQRCode: boolean;
  /** Device can print barcodes */
  supportsBarcode: boolean;
  /** Device can print bitmap images */
  supportsBitmap: boolean;
  /** Device has a cash drawer port */
  supportsCashDrawer: boolean;
  /** Device supports label printing */
  supportsLabelPrint: boolean;
}

export interface DinePrinterPlugin {
  /** Print HTML content to the configured thermal printer */
  print(options: PrintOptions): Promise<void>;

  /** Scan for nearby Bluetooth/USB/network/built-in printers */
  scanPrinters(): Promise<{ printers: PrinterInfo[] }>;

  /** Set the default printer for future print jobs */
  setDefaultPrinter(options: { address: string }): Promise<void>;

  /** Get the currently configured default printer */
  getDefaultPrinter(): Promise<PrinterInfo | null>;

  /** Check if the default printer is currently connected */
  isConnected(): Promise<{ connected: boolean }>;

  /** Set printer routing config (KOT/Bill/Default printer assignments) */
  setPrinterConfig(config: PrinterConfig): Promise<void>;

  /** Get printer routing config */
  getPrinterConfig(): Promise<PrinterConfig>;

  /** Run printer diagnostics — returns device info, detected printers, config */
  diagnose(): Promise<DiagnoseResult>;

  /** Get real-time printer status (paper, temperature, etc.) */
  getPrinterStatus(): Promise<PrinterStatus>;

  /** Get device hardware capabilities */
  getDeviceCapabilities(): Promise<DeviceCapabilities>;

  /** Print a QR code */
  printQRCode(options: { content: string; size?: number }): Promise<void>;

  /** Print a barcode */
  printBarcode(options: { data: string; format?: string; width?: number; height?: number; showText?: boolean }): Promise<void>;

  /** Print a bitmap image from base64 data */
  printBitmap(options: { base64: string; alignment?: 'left' | 'center' | 'right'; maxWidth?: number }): Promise<void>;

  /** Cut paper */
  cutPaper(): Promise<void>;

  /** Open cash drawer */
  openCashDrawer(): Promise<void>;
}
