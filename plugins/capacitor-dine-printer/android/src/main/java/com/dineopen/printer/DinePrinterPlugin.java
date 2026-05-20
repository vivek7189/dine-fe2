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
     * ZCS printer via SDK reflection or serial port.
     * ZCS Z108 and similar devices.
     */
    private void printViaZcs(byte[] escposData) throws Exception {
        try {
            // Try ZCS SDK: com.zcs.sdk.Printer
            Class<?> printerClass = Class.forName("com.zcs.sdk.Printer");
            java.lang.reflect.Method getInstance = printerClass.getMethod("getInstance");
            Object printer = getInstance.invoke(null);

            // getPrinterStatus() — 0 means ready
            java.lang.reflect.Method getStatus = printerClass.getMethod("getPrinterStatus");
            Object statusObj = getStatus.invoke(printer);
            int status = (statusObj instanceof Integer) ? (Integer) statusObj : -1;
            Log.i(TAG, "ZCS printer status: " + status);

            // write(byte[]) or printRawData(byte[])
            try {
                java.lang.reflect.Method writeMethod = printerClass.getMethod("write", byte[].class);
                writeMethod.invoke(printer, escposData);
                // Feed and cut
                writeMethod.invoke(printer, new byte[]{ 0x1B, 0x64, 0x04 });
                writeMethod.invoke(printer, new byte[]{ 0x1D, 0x56, 0x00 });
                Log.i(TAG, "ZCS SDK print successful via write()");
                return;
            } catch (NoSuchMethodException e) {
                // Try alternative method names
            }

            try {
                java.lang.reflect.Method printRaw = printerClass.getMethod("printRawData", byte[].class);
                printRaw.invoke(printer, escposData);
                Log.i(TAG, "ZCS SDK print successful via printRawData()");
                return;
            } catch (NoSuchMethodException e) {
                // Try alternative
            }

            // Try sendData
            try {
                java.lang.reflect.Method sendData = printerClass.getMethod("sendData", byte[].class);
                sendData.invoke(printer, escposData);
                Log.i(TAG, "ZCS SDK print successful via sendData()");
                return;
            } catch (NoSuchMethodException e) {
                // Fall through to raw bytes
            }

        } catch (ClassNotFoundException e) {
            Log.d(TAG, "ZCS SDK class not found, trying raw bytes");
        } catch (Exception e) {
            Log.w(TAG, "ZCS SDK failed: " + e.getMessage());
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
}
