import { WebPlugin } from '@capacitor/core';

export class DinePrinterWeb extends WebPlugin {
  async print(_options) {
    window.print();
  }

  async scanPrinters() {
    console.warn('DinePrinter.scanPrinters() is not available on web');
    return { printers: [] };
  }

  async setDefaultPrinter(_options) {
    console.warn('DinePrinter.setDefaultPrinter() is not available on web');
  }

  async getDefaultPrinter() {
    return null;
  }

  async isConnected() {
    return { connected: false };
  }

  async setPrinterConfig(_config) {
    console.warn('DinePrinter.setPrinterConfig() is not available on web');
  }

  async getPrinterConfig() {
    return { defaultPrinter: null, kotPrinter: null, billPrinter: null };
  }

  async diagnose() {
    return { report: 'Diagnostics not available on web platform' };
  }

  async getPrinterStatus() {
    return { status: 'unknown', vendorSdk: null };
  }

  async getDeviceCapabilities() {
    return {
      vendorSdk: null, supportsCutter: false, supports80mm: false,
      supportsQRCode: false, supportsBarcode: false, supportsBitmap: false,
      supportsCashDrawer: false, supportsLabelPrint: false,
    };
  }

  async printQRCode(_options) {
    console.warn('DinePrinter.printQRCode() is not available on web');
  }

  async printBarcode(_options) {
    console.warn('DinePrinter.printBarcode() is not available on web');
  }

  async printBitmap(_options) {
    console.warn('DinePrinter.printBitmap() is not available on web');
  }

  async cutPaper() {
    console.warn('DinePrinter.cutPaper() is not available on web');
  }

  async openCashDrawer() {
    console.warn('DinePrinter.openCashDrawer() is not available on web');
  }
}
