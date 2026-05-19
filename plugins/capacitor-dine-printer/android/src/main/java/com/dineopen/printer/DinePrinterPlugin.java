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
    };

    // Cached serial port path
    private String cachedSerialPort = null;

    @PluginMethod
    public void print(PluginCall call) {
        String html = call.getString("html", "");
        String type = call.getString("type", "bill");
        int copies = call.getInt("copies", 1);

        if (html.isEmpty()) {
            call.reject("HTML content is required");
            return;
        }

        String defaultAddress = getDefaultPrinterAddress();

        // 1. Built-in serial port printer (highest priority — silent, fast)
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

            // 1. Detect built-in serial port printer
            String detectedPort = detectBuiltInPrinter();
            if (detectedPort != null) {
                JSObject printer = new JSObject();
                printer.put("name", "Built-in Printer (" + detectedPort + ")");
                printer.put("address", "serial:" + detectedPort);
                printer.put("type", "serial");
                printers.put(printer);
                addedAddresses.add("serial:" + detectedPort);
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

    // --- Private helpers ---

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

    private byte[] htmlToEscPos(String html) {
        StringBuilder sb = new StringBuilder();
        sb.append((char) 0x1B).append((char) 0x40); // ESC @ (initialize)

        String text = html
            .replaceAll("<br\\s*/?>", "\n")
            .replaceAll("<hr\\s*/?>", "--------------------------------\n")
            .replaceAll("<[^>]+>", "")
            .replaceAll("&nbsp;", " ")
            .replaceAll("&amp;", "&")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&#8377;|&rupee;", "Rs.")
            .replaceAll("\\s*\n\\s*\n\\s*", "\n\n")
            .trim();

        sb.append(text);
        sb.append("\n\n\n");

        return sb.toString().getBytes();
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
