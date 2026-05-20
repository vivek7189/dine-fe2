'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const DinePrinter = core.registerPlugin('DinePrinter', {
  web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.DinePrinterWeb()),
});

class DinePrinterWeb extends core.WebPlugin {
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
}

var web = /*#__PURE__*/Object.freeze({
  __proto__: null,
  DinePrinterWeb: DinePrinterWeb
});

exports.DinePrinter = DinePrinter;
exports.DinePrinterWeb = DinePrinterWeb;
