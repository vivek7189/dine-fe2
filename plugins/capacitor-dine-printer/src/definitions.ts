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
  /** Bluetooth MAC address or USB identifier */
  address: string;
  /** Connection type */
  type: 'bluetooth' | 'usb';
}

export interface DinePrinterPlugin {
  /** Print HTML content to the configured thermal printer */
  print(options: PrintOptions): Promise<void>;

  /** Scan for nearby Bluetooth/USB printers */
  scanPrinters(): Promise<{ printers: PrinterInfo[] }>;

  /** Set the default printer for future print jobs */
  setDefaultPrinter(options: { address: string }): Promise<void>;

  /** Get the currently configured default printer */
  getDefaultPrinter(): Promise<PrinterInfo | null>;

  /** Check if the default printer is currently connected */
  isConnected(): Promise<{ connected: boolean }>;
}
