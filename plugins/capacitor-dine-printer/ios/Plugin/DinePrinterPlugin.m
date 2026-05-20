#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(DinePrinterPlugin, "DinePrinter",
    CAP_PLUGIN_METHOD(print, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(scanPrinters, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setDefaultPrinter, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getDefaultPrinter, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(isConnected, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setPrinterConfig, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getPrinterConfig, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(diagnose, CAPPluginReturnPromise);
)
