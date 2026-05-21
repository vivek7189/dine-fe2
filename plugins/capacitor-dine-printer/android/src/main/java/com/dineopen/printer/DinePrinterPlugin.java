package com.dineopen.printer;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.text.Layout;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Capacitor plugin for thermal printer communication.
 * Supports:
 *   1. Built-in serial port printers (Android POS devices like ZCS Z108, Sunmi, etc.)
 *   2. WiFi/Network printers (TCP socket on port 9100 — silent, no dialog)
 *   3. Bluetooth printers (external, paired via Bluetooth SPP)
 *   4. USB printers (external)
 *   5. Android system print dialog (fallback)
 */
@CapacitorPlugin(
    name = "DinePrinter",
    permissions = {
        @Permission(strings = { Manifest.permission.BLUETOOTH_CONNECT }, alias = "bluetooth_connect"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_SCAN }, alias = "bluetooth_scan"),
    }
)
public class DinePrinterPlugin extends Plugin {

    private static final String TAG = "DinePrinter";
    private static final String PREFS_NAME = "DinePrinterPrefs";
    private static final String PREF_DEFAULT_PRINTER = "defaultPrinterAddress";
    private static final String PREF_KOT_PRINTER = "kotPrinterAddress";
    private static final String PREF_BILL_PRINTER = "billPrinterAddress";
    // Standard SPP UUID for Bluetooth serial communication
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    // Default TCP port for thermal printers
    private static final int DEFAULT_TCP_PORT = 9100;
    // TCP connection/write timeout
    private static final int TCP_CONNECT_TIMEOUT = 3000;

    // Common serial port paths for built-in thermal printers on Android POS devices
    private static final String[] SERIAL_PORT_PATHS = {
        "/dev/ttyS1",   // Most common (ZCS, Sunmi, Telpo)
        "/dev/ttyS4",   // Some ZCS models
        "/dev/ttyS3",
        "/dev/ttyS0",
        "/dev/ttyS2",
        "/dev/usb/lp0", // USB printer device node
        "/dev/ttyMT0",  // MediaTek based devices
        "/dev/ttyMT1",
        "/dev/ttyMT2",
        "/dev/ttyGS0",  // USB gadget serial
        "/dev/ttyGS1",
        "/dev/ttyHSL0", // Qualcomm UART
    };

    // Vendor SDK class names for POS device built-in printers (checked via reflection)
    private static final String[][] VENDOR_SDK_CLASSES = {
        // { vendorName, printerClassName }
        { "Sunmi",   "com.sunmi.peripheral.printer.SunmiPrinterService" },
        { "ZCS",     "com.zcs.sdk.Printer" },
        { "Telpo",   "com.telpo.tps550.printer.ThermalPrinter" },
        { "PAX",     "com.pax.dal.IDAL" },
        { "Newland", "com.newland.nsdk.print.Printer" },
        { "iMin",    "com.imin.printer.PrinterHelper" },
    };

    // Cached serial port path
    private String cachedSerialPort = null;
    // Cached vendor SDK name (e.g. "Sunmi", "ZCS")
    private String cachedVendorSdk = null;

    // ZCS SmartPOS SDK — initialized lazily on first use
    private Object zcsPrinterObj = null;       // com.zcs.sdk.Printer
    private Object zcsDriverManager = null;    // com.zcs.sdk.DriverManager
    private boolean zcsInitialized = false;
    private boolean zcsAvailable = false;

    @PluginMethod
    public void print(PluginCall call) {
        String html = call.getString("html", "");
        String type = call.getString("type", "bill");
        int copies = call.getInt("copies", 1);
        int printerWidth = call.getInt("printerWidth", 80);

        if (html.isEmpty()) {
            call.reject("HTML content is required");
            return;
        }

        // Route to KOT/Bill-specific printer if configured
        String defaultAddress = getRoutedPrinterAddress(type);

        // 0. Vendor SDK built-in printer (ZCS, Sunmi, Telpo, etc. — highest priority)
        if (defaultAddress != null && defaultAddress.startsWith("vendor:")) {
            try {
                byte[] data = htmlToEscPos(html);
                for (int i = 0; i < copies; i++) {
                    printViaVendorSdk(defaultAddress, data);
                }
                call.resolve();
                return;
            } catch (Exception e) {
                Log.w(TAG, "Vendor SDK print failed: " + e.getMessage());
            }
        }

        // 1. Built-in serial port printer (silent, fast)
        if (defaultAddress != null && defaultAddress.startsWith("serial:")) {
            String portPath = defaultAddress.replace("serial:", "");
            try {
                for (int i = 0; i < copies; i++) {
                    printViaSerialPort(portPath, html);
                }
                call.resolve();
                return;
            } catch (Exception e) {
                Log.w(TAG, "Serial port print failed: " + e.getMessage());
            }
        }

        // 2. WiFi/Network TCP printer (silent, no dialog)
        if (defaultAddress != null && defaultAddress.startsWith("tcp:")) {
            try {
                for (int i = 0; i < copies; i++) {
                    printViaTcp(defaultAddress, html);
                }
                call.resolve();
                return;
            } catch (Exception e) {
                Log.w(TAG, "TCP print failed: " + e.getMessage());
            }
        }

        // 3. Auto-detect built-in printer if no default set
        if (defaultAddress == null || defaultAddress.equals("serial:auto")) {
            // 3a. Try vendor SDK first (most reliable on POS devices)
            String vendorName = detectVendorSdk();
            if (vendorName != null) {
                try {
                    byte[] data = htmlToEscPos(html);
                    for (int i = 0; i < copies; i++) {
                        printViaVendorSdk("vendor:" + vendorName, data);
                    }
                    SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                    prefs.edit().putString(PREF_DEFAULT_PRINTER, "vendor:" + vendorName).apply();
                    call.resolve();
                    return;
                } catch (Exception e) {
                    Log.w(TAG, "Auto-detected vendor SDK print failed: " + e.getMessage());
                }
            }

            // 3b. Try serial port
            String detectedPort = detectBuiltInPrinter();
            if (detectedPort != null) {
                try {
                    for (int i = 0; i < copies; i++) {
                        printViaSerialPort(detectedPort, html);
                    }
                    SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                    prefs.edit().putString(PREF_DEFAULT_PRINTER, "serial:" + detectedPort).apply();
                    call.resolve();
                    return;
                } catch (Exception e) {
                    Log.w(TAG, "Auto-detected serial print failed: " + e.getMessage());
                }
            }
        }

        // 4. USB printer
        if (defaultAddress != null && defaultAddress.startsWith("usb:")) {
            printViaSystem(html, type, call);
            return;
        }

        // 5. Bluetooth thermal printer
        if (defaultAddress != null && !defaultAddress.startsWith("usb:") && !defaultAddress.startsWith("serial:") && !defaultAddress.startsWith("tcp:")) {
            try {
                for (int i = 0; i < copies; i++) {
                    printViaBluetooth(defaultAddress, html);
                }
                call.resolve();
                return;
            } catch (Exception e) {
                Log.w(TAG, "Bluetooth print failed: " + e.getMessage());
            }
        }

        // 6. Fallback: Android system print dialog
        printViaSystem(html, type, call);
    }

    @PluginMethod
    public void scanPrinters(PluginCall call) {
        // Run scanning in background thread to avoid blocking UI
        new Thread(() -> {
            JSArray printers = new JSArray();
            Set<String> addedAddresses = new HashSet<>();

            // 1a. Detect vendor SDK built-in printer (ZCS, Sunmi, etc.)
            String vendorName = detectVendorSdk();
            if (vendorName != null) {
                JSObject printer = new JSObject();
                printer.put("name", "Built-in Printer (" + vendorName + " SDK)");
                printer.put("address", "vendor:" + vendorName);
                printer.put("type", "serial");
                printers.put(printer);
                addedAddresses.add("vendor:" + vendorName);
            }

            // 1b. Detect built-in serial port printer
            String detectedPort = detectBuiltInPrinter();
            if (detectedPort != null) {
                String serialAddr = "serial:" + detectedPort;
                if (!addedAddresses.contains(serialAddr)) {
                    JSObject printer = new JSObject();
                    printer.put("name", "Built-in Printer (" + detectedPort + ")");
                    printer.put("address", serialAddr);
                    printer.put("type", "serial");
                    printers.put(printer);
                    addedAddresses.add(serialAddr);
                }
            }

            // 2. Scan paired Bluetooth devices
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter != null) {
                try {
                    Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
                    if (pairedDevices != null) {
                        for (BluetoothDevice device : pairedDevices) {
                            String address = device.getAddress();
                            if (address != null && !addedAddresses.contains(address)) {
                                JSObject printer = new JSObject();
                                printer.put("name", device.getName() != null ? device.getName() : "Unknown");
                                printer.put("address", address);
                                printer.put("type", "bluetooth");
                                printers.put(printer);
                                addedAddresses.add(address);
                            }
                        }
                    }
                } catch (SecurityException e) {
                    Log.w(TAG, "Bluetooth scan permission denied");
                }
            }

            // 3. Scan USB devices
            try {
                UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
                if (usbManager != null) {
                    HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
                    if (deviceList != null) {
                        for (Map.Entry<String, UsbDevice> entry : deviceList.entrySet()) {
                            UsbDevice device = entry.getValue();
                            String address = "usb:" + device.getVendorId() + ":" + device.getProductId();
                            if (!addedAddresses.contains(address)) {
                                JSObject printer = new JSObject();
                                String name = device.getProductName();
                                if (name == null || name.isEmpty()) {
                                    name = "USB Device (" + device.getVendorId() + ":" + device.getProductId() + ")";
                                }
                                printer.put("name", name);
                                printer.put("address", address);
                                printer.put("type", "usb");
                                printers.put(printer);
                                addedAddresses.add(address);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "USB scan failed: " + e.getMessage());
            }

            // 4. Scan network printers via mDNS + subnet scan
            List<JSObject> networkPrinters = discoverNetworkPrinters();
            for (JSObject np : networkPrinters) {
                String addr = np.getString("address");
                if (addr != null && !addedAddresses.contains(addr)) {
                    printers.put(np);
                    addedAddresses.add(addr);
                }
            }

            JSObject result = new JSObject();
            result.put("printers", printers);
            call.resolve(result);
        }).start();
    }

    @PluginMethod
    public void setDefaultPrinter(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Printer address is required");
            return;
        }

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(PREF_DEFAULT_PRINTER, address).apply();

        if (!address.startsWith("serial:")) {
            cachedSerialPort = null;
        }

        call.resolve();
    }

    @PluginMethod
    public void getDefaultPrinter(PluginCall call) {
        String address = getDefaultPrinterAddress();
        if (address == null) {
            call.resolve(new JSObject());
            return;
        }

        // Vendor SDK printer
        if (address.startsWith("vendor:")) {
            String vendorName = address.replace("vendor:", "");
            JSObject printer = new JSObject();
            printer.put("name", "Built-in Printer (" + vendorName + " SDK)");
            printer.put("address", address);
            printer.put("type", "serial");
            call.resolve(printer);
            return;
        }

        // Serial port printer
        if (address.startsWith("serial:")) {
            String portPath = address.replace("serial:", "");
            JSObject printer = new JSObject();
            printer.put("name", "Built-in Printer (" + portPath + ")");
            printer.put("address", address);
            printer.put("type", "serial");
            call.resolve(printer);
            return;
        }

        // TCP/WiFi printer
        if (address.startsWith("tcp:")) {
            JSObject printer = new JSObject();
            String hostPort = address.replace("tcp:", "");
            printer.put("name", "WiFi Printer (" + hostPort + ")");
            printer.put("address", address);
            printer.put("type", "network");
            call.resolve(printer);
            return;
        }

        // USB printer
        if (address.startsWith("usb:")) {
            try {
                UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
                if (usbManager != null) {
                    String[] parts = address.replace("usb:", "").split(":");
                    int vendorId = Integer.parseInt(parts[0]);
                    int productId = Integer.parseInt(parts[1]);
                    for (UsbDevice device : usbManager.getDeviceList().values()) {
                        if (device.getVendorId() == vendorId && device.getProductId() == productId) {
                            JSObject printer = new JSObject();
                            String name = device.getProductName();
                            if (name == null || name.isEmpty()) {
                                name = "USB Device (" + vendorId + ":" + productId + ")";
                            }
                            printer.put("name", name);
                            printer.put("address", address);
                            printer.put("type", "usb");
                            call.resolve(printer);
                            return;
                        }
                    }
                }
            } catch (Exception e) { /* Fall through */ }
            JSObject printer = new JSObject();
            printer.put("name", "USB Printer");
            printer.put("address", address);
            printer.put("type", "usb");
            call.resolve(printer);
            return;
        }

        // Bluetooth printer
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter != null) {
            try {
                Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
                if (pairedDevices != null) {
                    for (BluetoothDevice device : pairedDevices) {
                        if (address.equals(device.getAddress())) {
                            JSObject printer = new JSObject();
                            printer.put("name", device.getName() != null ? device.getName() : "Unknown");
                            printer.put("address", device.getAddress());
                            printer.put("type", "bluetooth");
                            call.resolve(printer);
                            return;
                        }
                    }
                }
            } catch (SecurityException e) { /* Fall through */ }
        }

        call.resolve(new JSObject());
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        String address = getDefaultPrinterAddress();
        JSObject result = new JSObject();

        if (address == null) {
            result.put("connected", false);
            call.resolve(result);
            return;
        }

        boolean connected = false;

        // Vendor SDK — always considered connected if vendor detected
        if (address.startsWith("vendor:")) {
            String vendor = address.replace("vendor:", "");
            connected = (detectVendorSdk() != null);
            result.put("connected", connected);
            call.resolve(result);
            return;
        }

        // Serial port
        if (address.startsWith("serial:")) {
            String portPath = address.replace("serial:", "");
            File dev = new File(portPath);
            connected = dev.exists() && (dev.canWrite() || dev.canRead());
            result.put("connected", connected);
            call.resolve(result);
            return;
        }

        // TCP/WiFi — quick socket test
        if (address.startsWith("tcp:")) {
            final AtomicBoolean tcpConnected = new AtomicBoolean(false);
            Thread t = new Thread(() -> {
                try {
                    String[] hp = parseTcpAddress(address);
                    Socket socket = new Socket();
                    socket.connect(new InetSocketAddress(hp[0], Integer.parseInt(hp[1])), 1500);
                    socket.close();
                    tcpConnected.set(true);
                } catch (Exception e) { /* not connected */ }
            });
            t.start();
            try { t.join(2000); } catch (InterruptedException e) { /* timeout */ }
            result.put("connected", tcpConnected.get());
            call.resolve(result);
            return;
        }

        // USB
        if (address.startsWith("usb:")) {
            try {
                UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
                if (usbManager != null) {
                    String[] parts = address.replace("usb:", "").split(":");
                    int vendorId = Integer.parseInt(parts[0]);
                    int productId = Integer.parseInt(parts[1]);
                    for (UsbDevice device : usbManager.getDeviceList().values()) {
                        if (device.getVendorId() == vendorId && device.getProductId() == productId) {
                            connected = true;
                            break;
                        }
                    }
                }
            } catch (Exception e) { /* Fall through */ }
            result.put("connected", connected);
            call.resolve(result);
            return;
        }

        // Bluetooth
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter != null) {
            try {
                Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
                if (pairedDevices != null) {
                    for (BluetoothDevice device : pairedDevices) {
                        if (address.equals(device.getAddress())) {
                            connected = true;
                            break;
                        }
                    }
                }
            } catch (SecurityException e) { /* Fall through */ }
        }

        result.put("connected", connected);
        call.resolve(result);
    }

    @PluginMethod
    public void setPrinterConfig(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        if (call.hasOption("kotPrinter")) {
            String kotPrinter = call.getString("kotPrinter");
            if (kotPrinter != null && !kotPrinter.isEmpty()) {
                editor.putString(PREF_KOT_PRINTER, kotPrinter);
            } else {
                editor.remove(PREF_KOT_PRINTER);
            }
        }
        if (call.hasOption("billPrinter")) {
            String billPrinter = call.getString("billPrinter");
            if (billPrinter != null && !billPrinter.isEmpty()) {
                editor.putString(PREF_BILL_PRINTER, billPrinter);
            } else {
                editor.remove(PREF_BILL_PRINTER);
            }
        }
        if (call.hasOption("defaultPrinter")) {
            String defaultPrinter = call.getString("defaultPrinter");
            if (defaultPrinter != null && !defaultPrinter.isEmpty()) {
                editor.putString(PREF_DEFAULT_PRINTER, defaultPrinter);
            } else {
                editor.remove(PREF_DEFAULT_PRINTER);
            }
        }

        editor.apply();
        call.resolve();
    }

    @PluginMethod
    public void getPrinterConfig(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSObject config = new JSObject();
        config.put("defaultPrinter", prefs.getString(PREF_DEFAULT_PRINTER, null));
        config.put("kotPrinter", prefs.getString(PREF_KOT_PRINTER, null));
        config.put("billPrinter", prefs.getString(PREF_BILL_PRINTER, null));
        call.resolve(config);
    }

    @PluginMethod
    public void diagnose(PluginCall call) {
        new Thread(() -> {
            StringBuilder report = new StringBuilder();
            report.append("=== DinePrinter Diagnostics ===\n\n");

            // Device info
            report.append("Device: ").append(Build.MANUFACTURER).append(" ").append(Build.MODEL).append("\n");
            report.append("Android: ").append(Build.VERSION.RELEASE).append(" (API ").append(Build.VERSION.SDK_INT).append(")\n\n");

            // Saved config
            SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String defaultAddr = prefs.getString(PREF_DEFAULT_PRINTER, null);
            String kotAddr = prefs.getString(PREF_KOT_PRINTER, null);
            String billAddr = prefs.getString(PREF_BILL_PRINTER, null);
            report.append("--- Saved Config ---\n");
            report.append("Default: ").append(defaultAddr != null ? defaultAddr : "(none)").append("\n");
            report.append("KOT:     ").append(kotAddr != null ? kotAddr : "(use default)").append("\n");
            report.append("Bill:    ").append(billAddr != null ? billAddr : "(use default)").append("\n\n");

            // Vendor SDK
            report.append("--- Vendor SDK ---\n");
            String detectedVendor = detectVendorSdk();
            report.append("Detected: ").append(detectedVendor != null ? detectedVendor : "none").append("\n");
            report.append("Manufacturer: ").append(Build.MANUFACTURER).append("\n");
            report.append("Model: ").append(Build.MODEL).append("\n");
            for (String[] vendor : VENDOR_SDK_CLASSES) {
                try {
                    Class.forName(vendor[1]);
                    report.append(vendor[0]).append(" SDK: AVAILABLE (").append(vendor[1]).append(")\n");
                } catch (ClassNotFoundException e) {
                    report.append(vendor[0]).append(" SDK: not found\n");
                }
            }
            report.append("\n");

            // Serial ports
            report.append("--- Serial Ports ---\n");
            for (String path : SERIAL_PORT_PATHS) {
                File dev = new File(path);
                if (dev.exists()) {
                    report.append(path).append(" EXISTS");
                    report.append(dev.canRead() ? " R" : " -");
                    report.append(dev.canWrite() ? "W" : "-");
                    report.append("\n");
                }
            }
            String detected = detectBuiltInPrinter();
            report.append("Auto-detected: ").append(detected != null ? detected : "none").append("\n\n");

            // Bluetooth
            report.append("--- Bluetooth ---\n");
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter == null) {
                report.append("No Bluetooth adapter\n");
            } else {
                report.append("Enabled: ").append(adapter.isEnabled()).append("\n");
                try {
                    Set<BluetoothDevice> paired = adapter.getBondedDevices();
                    report.append("Paired devices: ").append(paired != null ? paired.size() : 0).append("\n");
                    if (paired != null) {
                        for (BluetoothDevice d : paired) {
                            report.append("  ").append(d.getName()).append(" [").append(d.getAddress()).append("]\n");
                        }
                    }
                } catch (SecurityException e) {
                    report.append("Permission denied\n");
                }
            }
            report.append("\n");

            // WiFi
            report.append("--- WiFi ---\n");
            String localIp = getLocalIpAddress();
            report.append("Local IP: ").append(localIp != null ? localIp : "not connected").append("\n\n");

            // USB
            report.append("--- USB ---\n");
            try {
                UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
                if (usbManager != null) {
                    HashMap<String, UsbDevice> devices = usbManager.getDeviceList();
                    report.append("USB devices: ").append(devices != null ? devices.size() : 0).append("\n");
                    if (devices != null) {
                        for (UsbDevice d : devices.values()) {
                            String name = d.getProductName();
                            report.append("  ").append(name != null ? name : "Unknown");
                            report.append(" [").append(d.getVendorId()).append(":").append(d.getProductId()).append("]\n");
                        }
                    }
                }
            } catch (Exception e) {
                report.append("USB scan failed: ").append(e.getMessage()).append("\n");
            }

            JSObject result = new JSObject();
            result.put("report", report.toString());
            call.resolve(result);
        }).start();
    }

    /**
     * Get real-time printer status — paper, temperature, busy, etc.
     * Returns structured status for ZCS devices, generic for others.
     */
    @PluginMethod
    public void getPrinterStatus(PluginCall call) {
        new Thread(() -> {
            JSObject result = new JSObject();
            String vendorName = detectVendorSdk();
            result.put("vendorSdk", vendorName);

            if ("ZCS".equals(vendorName) && initZcsSdk()) {
                int statusCode = getZcsPrinterStatusCode();
                String statusStr;
                switch (statusCode) {
                    case 0:   statusStr = "ready"; break;
                    case 1:   statusStr = "busy"; break;
                    case 240: statusStr = "no_paper"; break;
                    case 243: statusStr = "overheated"; break;
                    default:  statusStr = (statusCode == -1) ? "unknown" : "error"; break;
                }
                result.put("status", statusStr);
                result.put("statusCode", statusCode);
            } else {
                // Non-ZCS: check if we have a working printer at all
                String defaultAddr = getDefaultPrinterAddress();
                if (defaultAddr != null) {
                    result.put("status", "ready");
                } else {
                    result.put("status", "unknown");
                }
            }
            call.resolve(result);
        }).start();
    }

    /**
     * Get device capabilities — what features the current hardware supports.
     */
    @PluginMethod
    public void getDeviceCapabilities(PluginCall call) {
        new Thread(() -> {
            JSObject result = new JSObject();
            String vendorName = detectVendorSdk();
            result.put("vendorSdk", vendorName);

            boolean isZcs = "ZCS".equals(vendorName) && initZcsSdk() && zcsPrinterObj != null;

            if (isZcs) {
                // Check cutter support
                boolean supportsCutter = false;
                try {
                    java.lang.reflect.Method isSupportCutter = zcsPrinterObj.getClass().getMethod("isSupportCutter");
                    Object cutterResult = isSupportCutter.invoke(zcsPrinterObj);
                    supportsCutter = (cutterResult instanceof Boolean) && (Boolean) cutterResult;
                } catch (Throwable t) { /* not supported */ }

                // Check label print support
                boolean supportsLabel = false;
                try {
                    java.lang.reflect.Method isSupportLabel = zcsPrinterObj.getClass().getMethod("isSupportLabelPrint");
                    Object labelResult = isSupportLabel.invoke(zcsPrinterObj);
                    supportsLabel = (labelResult instanceof Boolean) && (Boolean) labelResult;
                } catch (Throwable t) { /* not supported */ }

                result.put("supportsCutter", supportsCutter);
                result.put("supports80mm", true);
                result.put("supportsQRCode", true);
                result.put("supportsBarcode", true);
                result.put("supportsBitmap", true);
                result.put("supportsCashDrawer", true);
                result.put("supportsLabelPrint", supportsLabel);
            } else {
                // Non-ZCS: ESC/POS fallbacks
                result.put("supportsCutter", true);   // ESC/POS GS V command
                result.put("supports80mm", true);
                result.put("supportsQRCode", true);    // ZXing bitmap fallback
                result.put("supportsBarcode", true);   // ZXing bitmap fallback
                result.put("supportsBitmap", true);    // ESC/POS raster
                result.put("supportsCashDrawer", true); // ESC p command
                result.put("supportsLabelPrint", false);
            }
            call.resolve(result);
        }).start();
    }

    /**
     * Print a QR code natively.
     * ZCS: uses setPrintAppendQRCode. Others: generates bitmap via ZXing, sends as ESC/POS raster.
     */
    @PluginMethod
    public void printQRCode(PluginCall call) {
        String content = call.getString("content");
        if (content == null || content.isEmpty()) {
            call.reject("QR code content is required");
            return;
        }
        int size = call.getInt("size", 200);

        new Thread(() -> {
            try {
                String vendorName = detectVendorSdk();
                if ("ZCS".equals(vendorName) && initZcsSdk() && zcsPrinterObj != null) {
                    // ZCS native QR code
                    int status = getZcsPrinterStatusCode();
                    if (status == 240) { call.reject("NO_PAPER", "Printer is out of paper"); return; }

                    java.lang.reflect.Method appendQR = zcsPrinterObj.getClass().getMethod(
                        "setPrintAppendQRCode", String.class, int.class, int.class, Layout.Alignment.class);
                    appendQR.invoke(zcsPrinterObj, content, size, size, Layout.Alignment.ALIGN_CENTER);

                    java.lang.reflect.Method printStart = zcsPrinterObj.getClass().getMethod("setPrintStart");
                    printStart.invoke(zcsPrinterObj);

                    Log.i(TAG, "ZCS QR code printed natively");
                    call.resolve();
                } else {
                    // Fallback: generate QR bitmap via ZXing, convert to ESC/POS raster
                    Bitmap qrBitmap = generateQRBitmap(content, size);
                    if (qrBitmap != null) {
                        byte[] rasterData = bitmapToEscPosRaster(qrBitmap, Layout.Alignment.ALIGN_CENTER);
                        sendEscPosToDefaultPrinter(rasterData);
                        call.resolve();
                    } else {
                        call.reject("GENERATION_FAILED", "Failed to generate QR code bitmap");
                    }
                }
            } catch (Throwable t) {
                Log.e(TAG, "printQRCode failed", t);
                call.reject("SDK_ERROR", t.getMessage());
            }
        }).start();
    }

    /**
     * Print a barcode natively.
     * ZCS: uses setPrintAppendBarCode. Others: generates bitmap via ZXing, sends as ESC/POS raster.
     */
    @PluginMethod
    public void printBarcode(PluginCall call) {
        String data = call.getString("data");
        if (data == null || data.isEmpty()) {
            call.reject("Barcode data is required");
            return;
        }
        String format = call.getString("format", "CODE_128");
        int width = call.getInt("width", 360);
        int height = call.getInt("height", 100);
        boolean showText = call.getBoolean("showText", true);

        new Thread(() -> {
            try {
                String vendorName = detectVendorSdk();
                if ("ZCS".equals(vendorName) && initZcsSdk() && zcsPrinterObj != null) {
                    int status = getZcsPrinterStatusCode();
                    if (status == 240) { call.reject("NO_PAPER", "Printer is out of paper"); return; }

                    // Resolve BarcodeFormat enum
                    Class<?> barcodeFormatClass = Class.forName("com.google.zxing.BarcodeFormat");
                    Object barcodeFormat;
                    try {
                        barcodeFormat = Enum.valueOf((Class<Enum>) barcodeFormatClass, format);
                    } catch (IllegalArgumentException e) {
                        barcodeFormat = Enum.valueOf((Class<Enum>) barcodeFormatClass, "CODE_128");
                    }

                    java.lang.reflect.Method appendBarcode = zcsPrinterObj.getClass().getMethod(
                        "setPrintAppendBarCode",
                        Context.class, String.class, int.class, int.class, boolean.class,
                        Layout.Alignment.class, barcodeFormatClass);
                    appendBarcode.invoke(zcsPrinterObj, getContext(), data, width, height, showText,
                        Layout.Alignment.ALIGN_CENTER, barcodeFormat);

                    java.lang.reflect.Method printStart = zcsPrinterObj.getClass().getMethod("setPrintStart");
                    printStart.invoke(zcsPrinterObj);

                    Log.i(TAG, "ZCS barcode printed natively");
                    call.resolve();
                } else {
                    // Fallback: generate barcode bitmap via ZXing
                    Bitmap barcodeBitmap = generateBarcodeBitmap(data, format, width, height);
                    if (barcodeBitmap != null) {
                        byte[] rasterData = bitmapToEscPosRaster(barcodeBitmap, Layout.Alignment.ALIGN_CENTER);
                        sendEscPosToDefaultPrinter(rasterData);
                        if (showText) {
                            // Print the barcode text below
                            byte[] textBytes = ("\n" + data + "\n").getBytes("UTF-8");
                            java.io.ByteArrayOutputStream combined = new java.io.ByteArrayOutputStream();
                            combined.write(new byte[]{ 0x1B, 0x61, 0x01 }); // center
                            combined.write(textBytes);
                            combined.write(new byte[]{ 0x1B, 0x61, 0x00 }); // left
                            sendEscPosToDefaultPrinter(combined.toByteArray());
                        }
                        call.resolve();
                    } else {
                        call.reject("GENERATION_FAILED", "Failed to generate barcode bitmap");
                    }
                }
            } catch (Throwable t) {
                Log.e(TAG, "printBarcode failed", t);
                call.reject("SDK_ERROR", t.getMessage());
            }
        }).start();
    }

    /**
     * Print a bitmap image (logo, signature, etc.).
     * Accepts base64-encoded image data.
     */
    @PluginMethod
    public void printBitmap(PluginCall call) {
        String base64 = call.getString("base64");
        if (base64 == null || base64.isEmpty()) {
            call.reject("base64 image data is required");
            return;
        }
        String alignment = call.getString("alignment", "center");
        int maxWidth = call.getInt("maxWidth", 384);

        new Thread(() -> {
            try {
                // Decode base64 to bitmap
                byte[] imageBytes = Base64.decode(base64, Base64.DEFAULT);
                Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
                if (bitmap == null) {
                    call.reject("DECODE_FAILED", "Failed to decode base64 image");
                    return;
                }

                // Scale if wider than maxWidth
                if (bitmap.getWidth() > maxWidth) {
                    float scale = (float) maxWidth / bitmap.getWidth();
                    int newHeight = (int) (bitmap.getHeight() * scale);
                    bitmap = Bitmap.createScaledBitmap(bitmap, maxWidth, newHeight, true);
                }

                Layout.Alignment align = "left".equals(alignment) ? Layout.Alignment.ALIGN_NORMAL
                    : "right".equals(alignment) ? Layout.Alignment.ALIGN_OPPOSITE
                    : Layout.Alignment.ALIGN_CENTER;

                String vendorName = detectVendorSdk();
                if ("ZCS".equals(vendorName) && initZcsSdk() && zcsPrinterObj != null) {
                    int status = getZcsPrinterStatusCode();
                    if (status == 240) { call.reject("NO_PAPER", "Printer is out of paper"); return; }

                    java.lang.reflect.Method appendBitmap = zcsPrinterObj.getClass().getMethod(
                        "setPrintAppendBitmap", Bitmap.class, Layout.Alignment.class);
                    appendBitmap.invoke(zcsPrinterObj, bitmap, align);

                    java.lang.reflect.Method printStart = zcsPrinterObj.getClass().getMethod("setPrintStart");
                    printStart.invoke(zcsPrinterObj);

                    Log.i(TAG, "ZCS bitmap printed natively");
                } else {
                    // ESC/POS raster fallback
                    byte[] rasterData = bitmapToEscPosRaster(bitmap, align);
                    sendEscPosToDefaultPrinter(rasterData);
                }
                call.resolve();
            } catch (Throwable t) {
                Log.e(TAG, "printBitmap failed", t);
                call.reject("SDK_ERROR", t.getMessage());
            }
        }).start();
    }

    /**
     * Cut paper — uses cutter if available, otherwise sends ESC/POS cut command.
     */
    @PluginMethod
    public void cutPaper(PluginCall call) {
        new Thread(() -> {
            try {
                String vendorName = detectVendorSdk();
                if ("ZCS".equals(vendorName) && initZcsSdk() && zcsPrinterObj != null) {
                    try {
                        java.lang.reflect.Method isSupportCutter = zcsPrinterObj.getClass().getMethod("isSupportCutter");
                        Object cutterResult = isSupportCutter.invoke(zcsPrinterObj);
                        if (cutterResult instanceof Boolean && (Boolean) cutterResult) {
                            java.lang.reflect.Method openCutter = zcsPrinterObj.getClass().getMethod("openPrnCutter", byte.class);
                            openCutter.invoke(zcsPrinterObj, (byte) 1);
                            Log.i(TAG, "ZCS paper cut via native cutter");
                            call.resolve();
                            return;
                        }
                    } catch (Throwable t) {
                        Log.w(TAG, "ZCS cutter failed, falling back to ESC/POS: " + t.getMessage());
                    }
                }

                // ESC/POS cut: feed + full cut
                byte[] cutCmd = new byte[]{ 0x1B, 0x64, 0x04, 0x1D, 0x56, 0x00 };
                sendEscPosToDefaultPrinter(cutCmd);
                call.resolve();
            } catch (Throwable t) {
                Log.e(TAG, "cutPaper failed", t);
                call.reject("SDK_ERROR", t.getMessage());
            }
        }).start();
    }

    /**
     * Open cash drawer — ZCS native openBox() or ESC/POS pulse command.
     */
    @PluginMethod
    public void openCashDrawer(PluginCall call) {
        new Thread(() -> {
            try {
                String vendorName = detectVendorSdk();
                if ("ZCS".equals(vendorName) && initZcsSdk() && zcsPrinterObj != null) {
                    try {
                        java.lang.reflect.Method openBox = zcsPrinterObj.getClass().getMethod("openBox");
                        openBox.invoke(zcsPrinterObj);
                        Log.i(TAG, "ZCS cash drawer opened via native SDK");
                        call.resolve();
                        return;
                    } catch (Throwable t) {
                        Log.w(TAG, "ZCS openBox failed, falling back to ESC/POS: " + t.getMessage());
                    }
                }

                // ESC/POS cash drawer pulse: ESC p 0 25 250
                byte[] drawerCmd = new byte[]{ 0x1B, 0x70, 0x00, 0x19, (byte) 0xFA };
                sendEscPosToDefaultPrinter(drawerCmd);
                call.resolve();
            } catch (Throwable t) {
                Log.e(TAG, "openCashDrawer failed", t);
                call.reject("SDK_ERROR", t.getMessage());
            }
        }).start();
    }

    // --- Private helpers ---

    /**
     * Get the printer address for the given job type, with fallback to default.
     * KOT jobs route to kotPrinter, bill jobs route to billPrinter, else default.
     */
    private String getRoutedPrinterAddress(String type) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String address = null;

        if ("kot".equals(type)) {
            address = prefs.getString(PREF_KOT_PRINTER, null);
        } else if ("bill".equals(type)) {
            address = prefs.getString(PREF_BILL_PRINTER, null);
        }

        // Fall back to default printer
        if (address == null || address.isEmpty()) {
            address = prefs.getString(PREF_DEFAULT_PRINTER, null);
        }

        return address;
    }

    private String getDefaultPrinterAddress() {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(PREF_DEFAULT_PRINTER, null);
    }

    /**
     * Detect built-in thermal printer by probing serial port device nodes.
     */
    private String detectBuiltInPrinter() {
        if (cachedSerialPort != null) {
            File dev = new File(cachedSerialPort);
            if (dev.exists() && (dev.canWrite() || dev.canRead())) {
                return cachedSerialPort;
            }
            cachedSerialPort = null;
        }

        for (String path : SERIAL_PORT_PATHS) {
            File dev = new File(path);
            if (dev.exists()) {
                if (dev.canWrite()) {
                    Log.i(TAG, "Built-in printer detected at " + path);
                    cachedSerialPort = path;
                    return path;
                }
                if (dev.canRead()) {
                    try {
                        FileOutputStream testStream = new FileOutputStream(dev);
                        testStream.write(new byte[]{ 0x10, 0x04, 0x01 }); // DLE EOT status query
                        testStream.close();
                        Log.i(TAG, "Built-in printer detected at " + path + " (test write ok)");
                        cachedSerialPort = path;
                        return path;
                    } catch (Exception e) {
                        Log.d(TAG, path + " not writable: " + e.getMessage());
                    }
                }
            }
        }
        return null;
    }

    /**
     * Detect vendor printer SDK available on this device via reflection.
     * Returns vendor name (e.g. "Sunmi", "ZCS") or null if none found.
     */
    private String detectVendorSdk() {
        if (cachedVendorSdk != null) return cachedVendorSdk;

        // Check manufacturer first for quick match
        String manufacturer = Build.MANUFACTURER != null ? Build.MANUFACTURER.toLowerCase() : "";
        String model = Build.MODEL != null ? Build.MODEL.toLowerCase() : "";

        for (String[] vendor : VENDOR_SDK_CLASSES) {
            String vendorName = vendor[0];
            String className = vendor[1];
            try {
                Class.forName(className);
                Log.i(TAG, "Vendor SDK detected: " + vendorName + " (" + className + ")");
                cachedVendorSdk = vendorName;
                return vendorName;
            } catch (ClassNotFoundException e) {
                // Not this vendor
            }
        }

        // Also check by manufacturer name even if SDK class not found
        // (some devices use AIDL services instead of direct SDK)
        if (manufacturer.contains("sunmi") || manufacturer.contains("shangmi")) {
            cachedVendorSdk = "Sunmi";
            return "Sunmi";
        }
        if (manufacturer.contains("zcs") || manufacturer.contains("zjiang") ||
            model.contains("z108") || model.contains("z90") || model.contains("z100")) {
            cachedVendorSdk = "ZCS";
            return "ZCS";
        }
        if (manufacturer.contains("telpo")) {
            cachedVendorSdk = "Telpo";
            return "Telpo";
        }
        if (manufacturer.contains("pax")) {
            cachedVendorSdk = "PAX";
            return "PAX";
        }
        if (manufacturer.contains("newland")) {
            cachedVendorSdk = "Newland";
            return "Newland";
        }
        if (manufacturer.contains("imin")) {
            cachedVendorSdk = "iMin";
            return "iMin";
        }

        return null;
    }

    /**
     * Print ESC/POS data via vendor SDK using reflection.
     * Supports Sunmi, ZCS, and other common POS vendors.
     * Falls back to AIDL service binding for Sunmi devices.
     */
    private void printViaVendorSdk(String vendorAddress, byte[] escposData) throws Exception {
        String vendorName = vendorAddress.replace("vendor:", "");
        Log.i(TAG, "Attempting vendor SDK print: " + vendorName);

        if ("Sunmi".equals(vendorName)) {
            printViaSunmi(escposData);
            return;
        }

        if ("ZCS".equals(vendorName)) {
            printViaZcs(escposData);
            return;
        }

        // Generic approach: try to find and invoke common printer service patterns
        // Most POS devices expose a print service that accepts raw ESC/POS data
        printViaGenericVendor(vendorName, escposData);
    }

    /**
     * Sunmi printer via AIDL service binding.
     * Sunmi devices expose woyou.aidlservice.jiuiv5.IWoyouService
     */
    private void printViaSunmi(byte[] escposData) throws Exception {
        try {
            // Try Sunmi's InnerPrinter (newer API)
            Class<?> innerPrinterClass = Class.forName("com.sunmi.peripheral.printer.InnerPrinterManager");
            java.lang.reflect.Method getInstanceMethod = innerPrinterClass.getMethod("getInstance");
            // If we get here, Sunmi SDK is available
            // Use raw data printing
            printViaRawBytes(escposData);
            return;
        } catch (ClassNotFoundException e) {
            // Not available
        }

        // Fallback: try binding to the AIDL service directly
        try {
            android.content.Intent intent = new android.content.Intent();
            intent.setPackage("woyou.aidlservice.jiuiv5");
            intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
            boolean bound = getContext().bindService(intent,
                new android.content.ServiceConnection() {
                    @Override
                    public void onServiceConnected(android.content.ComponentName name, android.os.IBinder service) {
                        try {
                            // Use reflection to call sendRawData on the service
                            Class<?> stubClass = Class.forName("woyou.aidlservice.jiuiv5.IWoyouService$Stub");
                            java.lang.reflect.Method asInterface = stubClass.getMethod("asInterface", android.os.IBinder.class);
                            Object printerService = asInterface.invoke(null, service);
                            java.lang.reflect.Method sendRawData = printerService.getClass().getMethod("sendRawData", byte[].class, Object.class);
                            sendRawData.invoke(printerService, escposData, null);
                            Log.i(TAG, "Sunmi AIDL print successful");
                        } catch (Exception ex) {
                            Log.w(TAG, "Sunmi AIDL print failed: " + ex.getMessage());
                        }
                        getContext().unbindService(this);
                    }
                    @Override
                    public void onServiceDisconnected(android.content.ComponentName name) {}
                },
                Context.BIND_AUTO_CREATE);

            if (!bound) {
                throw new Exception("Could not bind to Sunmi print service");
            }
            return;
        } catch (Exception e) {
            Log.w(TAG, "Sunmi AIDL binding failed: " + e.getMessage());
        }

        // Last resort for Sunmi: try serial port
        printViaRawBytes(escposData);
    }

    /**
     * Initialize ZCS SmartPOS SDK.
     * Called lazily on first ZCS operation. Safe to call multiple times.
     * Returns true if ZCS SDK is available and initialized on this device.
     */
    private boolean initZcsSdk() {
        if (zcsInitialized) return zcsAvailable;
        zcsInitialized = true;
        try {
            Class<?> dmClass = Class.forName("com.zcs.sdk.DriverManager");
            java.lang.reflect.Method getInstance = dmClass.getMethod("getInstance");
            zcsDriverManager = getInstance.invoke(null);

            // Get Sys device and init SDK
            java.lang.reflect.Method getBaseSys = dmClass.getMethod("getBaseSysDevice");
            Object sys = getBaseSys.invoke(zcsDriverManager);

            java.lang.reflect.Method sdkInit = sys.getClass().getMethod("sdkInit");
            Object statusObj = sdkInit.invoke(sys);
            int status = (statusObj instanceof Integer) ? (Integer) statusObj : -1;

            if (status != 0) {
                // Try power on and re-init
                try {
                    java.lang.reflect.Method sysPowerOn = sys.getClass().getMethod("sysPowerOn");
                    sysPowerOn.invoke(sys);
                    Thread.sleep(1000);
                    statusObj = sdkInit.invoke(sys);
                    status = (statusObj instanceof Integer) ? (Integer) statusObj : -1;
                } catch (Exception e) {
                    Log.w(TAG, "ZCS sysPowerOn failed: " + e.getMessage());
                }
            }

            if (status == 0) {
                // Get Printer instance
                java.lang.reflect.Method getPrinter = dmClass.getMethod("getPrinter");
                zcsPrinterObj = getPrinter.invoke(zcsDriverManager);
                zcsAvailable = true;
                Log.i(TAG, "ZCS SmartPOS SDK initialized successfully");
            } else {
                Log.w(TAG, "ZCS SDK init returned status: " + status);
            }
        } catch (ClassNotFoundException e) {
            Log.d(TAG, "ZCS SDK not available on this device");
        } catch (Throwable t) {
            Log.w(TAG, "ZCS SDK init failed: " + t.getMessage());
        }
        return zcsAvailable;
    }

    /**
     * Get ZCS printer status code via SDK.
     * Returns -1 if not available. Status codes: 0=ready, 1=busy, 240=paper out, etc.
     */
    private int getZcsPrinterStatusCode() {
        if (!initZcsSdk() || zcsPrinterObj == null) return -1;
        try {
            java.lang.reflect.Method getStatus = zcsPrinterObj.getClass().getMethod("getPrinterStatus");
            Object statusObj = getStatus.invoke(zcsPrinterObj);
            return (statusObj instanceof Integer) ? (Integer) statusObj : -1;
        } catch (Throwable t) {
            Log.w(TAG, "ZCS getPrinterStatus failed: " + t.getMessage());
            return -1;
        }
    }

    /**
     * ZCS printer via native SDK.
     * Uses direct SDK calls for printing ESC/POS data.
     * Falls back to raw serial bytes if SDK fails.
     */
    private void printViaZcs(byte[] escposData) throws Exception {
        if (initZcsSdk() && zcsPrinterObj != null) {
            try {
                // Check printer status first
                int status = getZcsPrinterStatusCode();
                // SdkResult.SDK_PRN_STATUS_PAPEROUT = 240 (0xF0)
                if (status == 240) {
                    throw new Exception("ZCS printer: out of paper");
                }

                // Use setPrintString to send raw ESC/POS data
                java.lang.reflect.Method setPrintString = zcsPrinterObj.getClass().getMethod("setPrintString", byte[].class);
                setPrintString.invoke(zcsPrinterObj, escposData);

                // Start the print job
                java.lang.reflect.Method setPrintStart = zcsPrinterObj.getClass().getMethod("setPrintStart");
                setPrintStart.invoke(zcsPrinterObj);

                // Try to cut paper if supported
                try {
                    java.lang.reflect.Method isSupportCutter = zcsPrinterObj.getClass().getMethod("isSupportCutter");
                    Object cutterSupported = isSupportCutter.invoke(zcsPrinterObj);
                    if (cutterSupported instanceof Boolean && (Boolean) cutterSupported) {
                        java.lang.reflect.Method openCutter = zcsPrinterObj.getClass().getMethod("openPrnCutter", byte.class);
                        openCutter.invoke(zcsPrinterObj, (byte) 1);
                    }
                } catch (Throwable t) {
                    Log.d(TAG, "ZCS cutter not available: " + t.getMessage());
                }

                Log.i(TAG, "ZCS SDK print successful");
                return;
            } catch (Exception e) {
                Log.w(TAG, "ZCS SDK print failed: " + e.getMessage());
                if (e.getMessage() != null && e.getMessage().contains("out of paper")) {
                    throw e;
                }
            }
        }

        // Fallback: try raw serial bytes
        printViaRawBytes(escposData);
    }

    /**
     * Generic vendor print — try common SDK patterns via reflection,
     * then fall back to raw serial port writing.
     */
    private void printViaGenericVendor(String vendorName, byte[] escposData) throws Exception {
        // Try each vendor SDK class
        for (String[] vendor : VENDOR_SDK_CLASSES) {
            if (vendor[0].equals(vendorName)) {
                try {
                    Class<?> printerClass = Class.forName(vendor[1]);
                    // Try common patterns: getInstance(), then write/print methods
                    Object printerInstance = null;

                    // Try getInstance()
                    try {
                        java.lang.reflect.Method getInstance = printerClass.getMethod("getInstance");
                        printerInstance = getInstance.invoke(null);
                    } catch (NoSuchMethodException e) {
                        // Try constructor
                        try {
                            printerInstance = printerClass.newInstance();
                        } catch (Exception ex) {
                            // Can't instantiate
                        }
                    }

                    if (printerInstance != null) {
                        // Try common method names for raw printing
                        String[] methodNames = { "write", "sendRawData", "printRawData", "sendData", "printBytes" };
                        for (String methodName : methodNames) {
                            try {
                                java.lang.reflect.Method m = printerClass.getMethod(methodName, byte[].class);
                                m.invoke(printerInstance, escposData);
                                Log.i(TAG, vendorName + " SDK print successful via " + methodName + "()");
                                return;
                            } catch (NoSuchMethodException e) {
                                // Try next method name
                            }
                        }
                    }
                } catch (ClassNotFoundException e) {
                    // SDK not available
                }
            }
        }

        // Fallback to raw serial bytes
        printViaRawBytes(escposData);
    }

    /**
     * Raw serial port byte writing — universal fallback for POS devices.
     * Tries all known serial port paths to find a writable printer.
     */
    private void printViaRawBytes(byte[] escposData) throws IOException {
        // Try cached port first
        if (cachedSerialPort != null) {
            File dev = new File(cachedSerialPort);
            if (dev.exists() && dev.canWrite()) {
                FileOutputStream fos = new FileOutputStream(dev);
                fos.write(escposData);
                fos.write(new byte[]{ 0x1B, 0x64, 0x04 }); // Feed
                fos.write(new byte[]{ 0x1D, 0x56, 0x00 }); // Cut
                fos.flush();
                fos.close();
                Log.i(TAG, "Raw serial print successful on cached " + cachedSerialPort);
                return;
            }
        }

        // Try all serial ports
        for (String path : SERIAL_PORT_PATHS) {
            File dev = new File(path);
            if (dev.exists() && dev.canWrite()) {
                try {
                    FileOutputStream fos = new FileOutputStream(dev);
                    fos.write(escposData);
                    fos.write(new byte[]{ 0x1B, 0x64, 0x04 });
                    fos.write(new byte[]{ 0x1D, 0x56, 0x00 });
                    fos.flush();
                    fos.close();
                    cachedSerialPort = path;
                    Log.i(TAG, "Raw serial print successful on " + path);
                    return;
                } catch (Exception e) {
                    Log.d(TAG, "Serial write failed on " + path + ": " + e.getMessage());
                }
            }
        }

        throw new IOException("No writable serial port found for raw printing");
    }

    /**
     * Discover network printers via mDNS and subnet TCP scan.
     */
    private List<JSObject> discoverNetworkPrinters() {
        List<JSObject> found = new ArrayList<>();

        // mDNS discovery
        try {
            found.addAll(discoverViaMdns());
        } catch (Exception e) {
            Log.w(TAG, "mDNS discovery failed: " + e.getMessage());
        }

        // Subnet TCP scan on port 9100
        try {
            found.addAll(scanSubnetForPrinters());
        } catch (Exception e) {
            Log.w(TAG, "Subnet scan failed: " + e.getMessage());
        }

        return found;
    }

    /**
     * mDNS/Bonjour discovery — looks for _pdl-datastream._tcp (raw print) and _ipp._tcp services.
     */
    private List<JSObject> discoverViaMdns() {
        List<JSObject> found = new ArrayList<>();
        Set<String> foundAddresses = new HashSet<>();
        NsdManager nsdManager = (NsdManager) getContext().getSystemService(Context.NSD_SERVICE);
        if (nsdManager == null) return found;

        String[] serviceTypes = { "_pdl-datastream._tcp.", "_ipp._tcp." };
        CountDownLatch latch = new CountDownLatch(serviceTypes.length);

        for (String serviceType : serviceTypes) {
            NsdManager.DiscoveryListener listener = new NsdManager.DiscoveryListener() {
                @Override public void onStartDiscoveryFailed(String s, int i) { latch.countDown(); }
                @Override public void onStopDiscoveryFailed(String s, int i) {}
                @Override public void onDiscoveryStarted(String s) {}
                @Override public void onDiscoveryStopped(String s) { latch.countDown(); }
                @Override public void onServiceLost(NsdServiceInfo info) {}

                @Override
                public void onServiceFound(NsdServiceInfo serviceInfo) {
                    nsdManager.resolveService(serviceInfo, new NsdManager.ResolveListener() {
                        @Override public void onResolveFailed(NsdServiceInfo info, int errorCode) {}
                        @Override
                        public void onServiceResolved(NsdServiceInfo info) {
                            String host = info.getHost() != null ? info.getHost().getHostAddress() : null;
                            int port = info.getPort();
                            if (host != null && port > 0) {
                                String addr = "tcp:" + host + ":" + port;
                                synchronized (foundAddresses) {
                                    if (!foundAddresses.contains(addr)) {
                                        foundAddresses.add(addr);
                                        JSObject printer = new JSObject();
                                        String name = info.getServiceName();
                                        if (name == null || name.isEmpty()) name = "Network Printer";
                                        printer.put("name", name + " (" + host + ")");
                                        printer.put("address", addr);
                                        printer.put("type", "network");
                                        synchronized (found) {
                                            found.add(printer);
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            };

            try {
                nsdManager.discoverServices(serviceType, NsdManager.PROTOCOL_DNS_SD, listener);
                // Give mDNS 3 seconds to discover
                new Thread(() -> {
                    try { Thread.sleep(3000); } catch (InterruptedException ignored) {}
                    try { nsdManager.stopServiceDiscovery(listener); } catch (Exception ignored) {}
                }).start();
            } catch (Exception e) {
                latch.countDown();
            }
        }

        try { latch.await(5, TimeUnit.SECONDS); } catch (InterruptedException ignored) {}
        return found;
    }

    /**
     * Scan local subnet for devices listening on port 9100 (standard raw print port).
     * Prioritizes .100-.200 range (common printer IP assignments).
     */
    private List<JSObject> scanSubnetForPrinters() {
        List<JSObject> found = new ArrayList<>();
        String localIp = getLocalIpAddress();
        if (localIp == null) return found;

        String subnet = localIp.substring(0, localIp.lastIndexOf('.') + 1);
        Set<String> foundIps = new HashSet<>();
        ExecutorService executor = Executors.newFixedThreadPool(20);

        // Build scan order: common printer range first, then rest
        List<Integer> scanOrder = new ArrayList<>();
        for (int i = 100; i <= 200; i++) scanOrder.add(i);
        for (int i = 2; i < 100; i++) scanOrder.add(i);
        for (int i = 201; i < 255; i++) scanOrder.add(i);

        CountDownLatch latch = new CountDownLatch(scanOrder.size());

        for (int hostPart : scanOrder) {
            String ip = subnet + hostPart;
            if (ip.equals(localIp)) { latch.countDown(); continue; }

            executor.submit(() -> {
                try {
                    Socket socket = new Socket();
                    socket.connect(new InetSocketAddress(ip, DEFAULT_TCP_PORT), 800);
                    socket.close();
                    synchronized (foundIps) {
                        if (!foundIps.contains(ip)) {
                            foundIps.add(ip);
                            JSObject printer = new JSObject();
                            // Try to get hostname
                            String hostname = null;
                            try {
                                hostname = InetAddress.getByName(ip).getHostName();
                            } catch (Exception ignored) {}
                            String name = (hostname != null && !hostname.equals(ip))
                                ? hostname + " (" + ip + ")"
                                : "WiFi Printer (" + ip + ")";
                            printer.put("name", name);
                            printer.put("address", "tcp:" + ip + ":" + DEFAULT_TCP_PORT);
                            printer.put("type", "network");
                            synchronized (found) {
                                found.add(printer);
                            }
                        }
                    }
                } catch (Exception ignored) {
                    // Not a printer — expected for most IPs
                } finally {
                    latch.countDown();
                }
            });
        }

        try { latch.await(10, TimeUnit.SECONDS); } catch (InterruptedException ignored) {}
        executor.shutdownNow();
        return found;
    }

    /**
     * Get the device's local WiFi IP address.
     */
    private String getLocalIpAddress() {
        try {
            WifiManager wifiManager = (WifiManager) getContext().getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                int ip = wifiInfo.getIpAddress();
                if (ip != 0) {
                    return String.format("%d.%d.%d.%d",
                        (ip & 0xff), (ip >> 8 & 0xff), (ip >> 16 & 0xff), (ip >> 24 & 0xff));
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to get WiFi IP: " + e.getMessage());
        }
        return null;
    }

    /**
     * Parse TCP address from "tcp:host:port" format.
     */
    private String[] parseTcpAddress(String address) {
        String hostPort = address.replace("tcp:", "");
        String[] parts = hostPort.split(":");
        String host = parts[0];
        String port = parts.length > 1 ? parts[1] : String.valueOf(DEFAULT_TCP_PORT);
        return new String[]{ host, port };
    }

    /**
     * Print via TCP socket — silent, no dialog.
     * Used for WiFi/network thermal printers on port 9100.
     */
    private void printViaTcp(String address, String html) throws IOException {
        String[] hp = parseTcpAddress(address);
        String host = hp[0];
        int port = Integer.parseInt(hp[1]);

        Socket socket = null;
        try {
            socket = new Socket();
            socket.connect(new InetSocketAddress(host, port), TCP_CONNECT_TIMEOUT);
            socket.setSoTimeout(TCP_CONNECT_TIMEOUT);

            OutputStream out = socket.getOutputStream();
            byte[] data = htmlToEscPos(html);
            out.write(data);
            out.flush();

            // Feed and cut
            out.write(new byte[]{ 0x1B, 0x64, 0x04 }); // Feed 4 lines
            out.write(new byte[]{ 0x1D, 0x56, 0x00 });  // Full cut
            out.flush();

            Log.i(TAG, "TCP print successful to " + host + ":" + port);
        } finally {
            if (socket != null) {
                try { socket.close(); } catch (IOException ignored) {}
            }
        }
    }

    /**
     * Print via serial port — silent, no dialog.
     * For Android POS devices with built-in thermal printers.
     */
    private void printViaSerialPort(String portPath, String html) throws IOException {
        File dev = new File(portPath);
        if (!dev.exists()) {
            throw new IOException("Serial port not found: " + portPath);
        }

        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(dev);
            byte[] data = htmlToEscPos(html);
            fos.write(data);
            fos.flush();
            fos.write(new byte[]{ 0x1B, 0x64, 0x04 }); // Feed 4 lines
            fos.write(new byte[]{ 0x1D, 0x56, 0x00 });  // Full cut
            fos.flush();
            Log.i(TAG, "Serial port print successful on " + portPath);
        } finally {
            if (fos != null) {
                try { fos.close(); } catch (IOException ignored) {}
            }
        }
    }

    private void printViaBluetooth(String address, String html) throws IOException {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        BluetoothDevice device = adapter.getRemoteDevice(address);
        BluetoothSocket socket = null;

        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
            OutputStream outputStream = socket.getOutputStream();

            byte[] data = htmlToEscPos(html);
            outputStream.write(data);
            outputStream.flush();

            outputStream.write(new byte[]{ 0x1B, 0x64, 0x04 }); // Feed 4 lines
            outputStream.write(new byte[]{ 0x1D, 0x56, 0x00 }); // Full cut
        } finally {
            if (socket != null) {
                try { socket.close(); } catch (IOException ignored) {}
            }
        }
    }

    /**
     * Convert HTML receipt to ESC/POS byte commands for thermal printers.
     * Handles bold, alignment (center), font size (double width/height),
     * horizontal rules, line breaks, tables, and HTML entities.
     */
    private byte[] htmlToEscPos(String html) {
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();

        try {
            // ESC @ — Initialize printer
            out.write(new byte[]{ 0x1B, 0x40 });

            // Pre-process: normalize whitespace within tags
            String h = html;

            // Strip entire <head>, <style>, <script> blocks (content included)
            h = h.replaceAll("(?is)<head[^>]*>.*?</head>", "");
            h = h.replaceAll("(?is)<style[^>]*>.*?</style>", "");
            h = h.replaceAll("(?is)<script[^>]*>.*?</script>", "");

            // Process block elements and inline formatting
            // Replace <br> with newline markers
            h = h.replaceAll("(?i)<br\\s*/?>", "\n");
            // Replace <hr> with dashed line
            h = h.replaceAll("(?i)<hr\\s*/?>", "\n" + "--------------------------------" + "\n");
            // Replace <p> and </p> with newlines
            h = h.replaceAll("(?i)<p[^>]*>", "\n");
            h = h.replaceAll("(?i)</p>", "\n");
            // Replace <div> and </div> with newlines
            h = h.replaceAll("(?i)<div[^>]*>", "\n");
            h = h.replaceAll("(?i)</div>", "\n");
            // Replace <tr> with newline, <td>/<th> with tab-like spacing
            h = h.replaceAll("(?i)<tr[^>]*>", "\n");
            h = h.replaceAll("(?i)</tr>", "");
            h = h.replaceAll("(?i)<td[^>]*>", "  ");
            h = h.replaceAll("(?i)</td>", "");
            h = h.replaceAll("(?i)<th[^>]*>", "  ");
            h = h.replaceAll("(?i)</th>", "");
            h = h.replaceAll("(?i)<table[^>]*>", "\n");
            h = h.replaceAll("(?i)</table>", "\n");

            // Process styled/formatted segments
            // Extract text with formatting markers before stripping all tags
            // Bold: <b>, <strong>
            h = h.replaceAll("(?i)<(b|strong)[^>]*>", "\u0001BOLD_ON\u0001");
            h = h.replaceAll("(?i)</(b|strong)>", "\u0001BOLD_OFF\u0001");

            // Center alignment from style="text-align:center" or <center>
            h = h.replaceAll("(?i)<center[^>]*>", "\u0001CENTER_ON\u0001");
            h = h.replaceAll("(?i)</center>", "\u0001CENTER_OFF\u0001");
            h = h.replaceAll("(?i)<[^>]*text-align\\s*:\\s*center[^>]*>", "\u0001CENTER_ON\u0001");

            // Large text: <h1>, <h2>, <h3>
            h = h.replaceAll("(?i)<h[1-2][^>]*>", "\u0001LARGE_ON\u0001\u0001BOLD_ON\u0001\u0001CENTER_ON\u0001");
            h = h.replaceAll("(?i)</h[1-2]>", "\u0001BOLD_OFF\u0001\u0001LARGE_OFF\u0001\u0001CENTER_OFF\u0001\n");
            h = h.replaceAll("(?i)<h[3-6][^>]*>", "\u0001BOLD_ON\u0001");
            h = h.replaceAll("(?i)</h[3-6]>", "\u0001BOLD_OFF\u0001\n");

            // Remove remaining HTML tags
            h = h.replaceAll("<[^>]+>", "");

            // Decode HTML entities
            h = h.replaceAll("&nbsp;", " ");
            h = h.replaceAll("&amp;", "&");
            h = h.replaceAll("&lt;", "<");
            h = h.replaceAll("&gt;", ">");
            h = h.replaceAll("&quot;", "\"");
            h = h.replaceAll("&#39;", "'");
            h = h.replaceAll("&#8377;|&rupee;|₹", "Rs.");
            h = h.replaceAll("&#?\\w+;", ""); // Remove any remaining entities

            // Collapse excessive blank lines
            h = h.replaceAll("\\n{3,}", "\n\n");
            h = h.trim();

            // Now process the text with formatting markers
            boolean bold = false;
            boolean center = false;
            boolean large = false;
            int lineWidth = 32; // 58mm = 32 chars, 80mm = 48 chars (handled at call site)

            String[] parts = h.split("\u0001");
            for (String part : parts) {
                switch (part) {
                    case "BOLD_ON":
                        if (!bold) {
                            out.write(new byte[]{ 0x1B, 0x45, 0x01 }); // ESC E 1
                            bold = true;
                        }
                        break;
                    case "BOLD_OFF":
                        if (bold) {
                            out.write(new byte[]{ 0x1B, 0x45, 0x00 }); // ESC E 0
                            bold = false;
                        }
                        break;
                    case "CENTER_ON":
                        if (!center) {
                            out.write(new byte[]{ 0x1B, 0x61, 0x01 }); // ESC a 1 (center)
                            center = true;
                        }
                        break;
                    case "CENTER_OFF":
                        if (center) {
                            out.write(new byte[]{ 0x1B, 0x61, 0x00 }); // ESC a 0 (left)
                            center = false;
                        }
                        break;
                    case "LARGE_ON":
                        if (!large) {
                            out.write(new byte[]{ 0x1D, 0x21, 0x11 }); // GS ! — double width+height
                            large = true;
                        }
                        break;
                    case "LARGE_OFF":
                        if (large) {
                            out.write(new byte[]{ 0x1D, 0x21, 0x00 }); // GS ! — normal size
                            large = false;
                        }
                        break;
                    default:
                        if (!part.isEmpty()) {
                            out.write(part.getBytes("UTF-8"));
                        }
                        break;
                }
            }

            // Reset formatting
            if (bold) out.write(new byte[]{ 0x1B, 0x45, 0x00 });
            if (center) out.write(new byte[]{ 0x1B, 0x61, 0x00 });
            if (large) out.write(new byte[]{ 0x1D, 0x21, 0x00 });

            out.write("\n\n\n".getBytes());

        } catch (IOException e) {
            // Fallback: basic text conversion
            byte[] init = { 0x1B, 0x40 };
            String fallback = html.replaceAll("<[^>]+>", "").replaceAll("&\\w+;", "").trim() + "\n\n\n";
            byte[] textBytes = fallback.getBytes();
            byte[] result = new byte[init.length + textBytes.length];
            System.arraycopy(init, 0, result, 0, init.length);
            System.arraycopy(textBytes, 0, result, init.length, textBytes.length);
            return result;
        }

        return out.toByteArray();
    }

    private void printViaSystem(String html, String type, PluginCall call) {
        getActivity().runOnUiThread(() -> {
            WebView webView = new WebView(getContext());
            webView.getSettings().setJavaScriptEnabled(false);
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    PrintManager printManager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                    String jobName = "DineOpen " + type.toUpperCase();
                    PrintDocumentAdapter printAdapter = view.createPrintDocumentAdapter(jobName);
                    PrintAttributes.Builder builder = new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A7)
                        .setResolution(new PrintAttributes.Resolution("default", "Default", 203, 203))
                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS);
                    printManager.print(jobName, printAdapter, builder.build());
                    call.resolve();
                }
            });
            webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
        });
    }

    /**
     * Send raw ESC/POS data to the default printer.
     * Routes through vendor SDK, serial, TCP, or Bluetooth based on saved config.
     */
    private void sendEscPosToDefaultPrinter(byte[] data) throws Exception {
        String defaultAddress = getDefaultPrinterAddress();

        // Vendor SDK
        if (defaultAddress != null && defaultAddress.startsWith("vendor:")) {
            printViaVendorSdk(defaultAddress, data);
            return;
        }

        // Serial port
        if (defaultAddress != null && defaultAddress.startsWith("serial:")) {
            String portPath = defaultAddress.replace("serial:", "");
            File dev = new File(portPath);
            FileOutputStream fos = new FileOutputStream(dev);
            fos.write(data);
            fos.flush();
            fos.close();
            return;
        }

        // TCP
        if (defaultAddress != null && defaultAddress.startsWith("tcp:")) {
            String[] hp = parseTcpAddress(defaultAddress);
            Socket socket = new Socket();
            socket.connect(new InetSocketAddress(hp[0], Integer.parseInt(hp[1])), TCP_CONNECT_TIMEOUT);
            OutputStream out = socket.getOutputStream();
            out.write(data);
            out.flush();
            socket.close();
            return;
        }

        // Auto-detect: try vendor SDK first
        String vendorName = detectVendorSdk();
        if (vendorName != null) {
            printViaVendorSdk("vendor:" + vendorName, data);
            return;
        }

        // Try raw serial
        printViaRawBytes(data);
    }

    /**
     * Generate QR code bitmap using ZXing library.
     */
    private Bitmap generateQRBitmap(String content, int size) {
        try {
            Class<?> writerClass = Class.forName("com.google.zxing.qrcode.QRCodeWriter");
            Object writer = writerClass.newInstance();
            Class<?> barcodeFormatClass = Class.forName("com.google.zxing.BarcodeFormat");
            Object qrFormat = Enum.valueOf((Class<Enum>) barcodeFormatClass, "QR_CODE");

            java.lang.reflect.Method encode = writerClass.getMethod("encode", String.class, barcodeFormatClass, int.class, int.class);
            Object bitMatrix = encode.invoke(writer, content, qrFormat, size, size);

            java.lang.reflect.Method getWidth = bitMatrix.getClass().getMethod("getWidth");
            java.lang.reflect.Method getHeight = bitMatrix.getClass().getMethod("getHeight");
            java.lang.reflect.Method get = bitMatrix.getClass().getMethod("get", int.class, int.class);

            int w = (Integer) getWidth.invoke(bitMatrix);
            int h = (Integer) getHeight.invoke(bitMatrix);

            int[] pixels = new int[w * h];
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    boolean isBlack = (Boolean) get.invoke(bitMatrix, x, y);
                    pixels[y * w + x] = isBlack ? 0xFF000000 : 0xFFFFFFFF;
                }
            }
            Bitmap bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
            bitmap.setPixels(pixels, 0, w, 0, 0, w, h);
            return bitmap;
        } catch (Throwable t) {
            Log.w(TAG, "QR code generation failed: " + t.getMessage());
            return null;
        }
    }

    /**
     * Generate barcode bitmap using ZXing library.
     */
    private Bitmap generateBarcodeBitmap(String data, String format, int width, int height) {
        try {
            Class<?> writerClass = Class.forName("com.google.zxing.MultiFormatWriter");
            Object writer = writerClass.newInstance();
            Class<?> barcodeFormatClass = Class.forName("com.google.zxing.BarcodeFormat");
            Object barcodeFormat;
            try {
                barcodeFormat = Enum.valueOf((Class<Enum>) barcodeFormatClass, format);
            } catch (IllegalArgumentException e) {
                barcodeFormat = Enum.valueOf((Class<Enum>) barcodeFormatClass, "CODE_128");
            }

            java.lang.reflect.Method encode = writerClass.getMethod("encode", String.class, barcodeFormatClass, int.class, int.class);
            Object bitMatrix = encode.invoke(writer, data, barcodeFormat, width, height);

            java.lang.reflect.Method getWidth = bitMatrix.getClass().getMethod("getWidth");
            java.lang.reflect.Method getHeight = bitMatrix.getClass().getMethod("getHeight");
            java.lang.reflect.Method get = bitMatrix.getClass().getMethod("get", int.class, int.class);

            int w = (Integer) getWidth.invoke(bitMatrix);
            int h = (Integer) getHeight.invoke(bitMatrix);

            int[] pixels = new int[w * h];
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    boolean isBlack = (Boolean) get.invoke(bitMatrix, x, y);
                    pixels[y * w + x] = isBlack ? 0xFF000000 : 0xFFFFFFFF;
                }
            }
            Bitmap bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
            bitmap.setPixels(pixels, 0, w, 0, 0, w, h);
            return bitmap;
        } catch (Throwable t) {
            Log.w(TAG, "Barcode generation failed: " + t.getMessage());
            return null;
        }
    }

    /**
     * Convert a Bitmap to ESC/POS raster image command bytes.
     * Uses GS v 0 command for raster bit image printing.
     */
    private byte[] bitmapToEscPosRaster(Bitmap bitmap, Layout.Alignment alignment) {
        try {
            int width = bitmap.getWidth();
            int height = bitmap.getHeight();

            // Ensure width is multiple of 8
            int byteWidth = (width + 7) / 8;

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();

            // Set alignment
            byte alignByte = 0x00; // left
            if (alignment == Layout.Alignment.ALIGN_CENTER) alignByte = 0x01;
            else if (alignment == Layout.Alignment.ALIGN_OPPOSITE) alignByte = 0x02;
            out.write(new byte[]{ 0x1B, 0x61, alignByte });

            // GS v 0 — raster bit image
            // Format: 1D 76 30 m xL xH yL yH d1...dk
            out.write(new byte[]{ 0x1D, 0x76, 0x30, 0x00 });
            out.write(new byte[]{ (byte)(byteWidth & 0xFF), (byte)((byteWidth >> 8) & 0xFF) });
            out.write(new byte[]{ (byte)(height & 0xFF), (byte)((height >> 8) & 0xFF) });

            // Convert pixels to monochrome raster data
            for (int y = 0; y < height; y++) {
                for (int byteX = 0; byteX < byteWidth; byteX++) {
                    int b = 0;
                    for (int bit = 0; bit < 8; bit++) {
                        int x = byteX * 8 + bit;
                        if (x < width) {
                            int pixel = bitmap.getPixel(x, y);
                            int gray = (((pixel >> 16) & 0xFF) + ((pixel >> 8) & 0xFF) + (pixel & 0xFF)) / 3;
                            if (gray < 128) { // dark pixel = print
                                b |= (0x80 >> bit);
                            }
                        }
                    }
                    out.write(b);
                }
            }

            // Reset alignment
            out.write(new byte[]{ 0x1B, 0x61, 0x00 });
            out.write("\n".getBytes());

            return out.toByteArray();
        } catch (IOException e) {
            Log.e(TAG, "bitmapToEscPosRaster failed", e);
            return new byte[0];
        }
    }
}
