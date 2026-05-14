package com.dineopen.printer;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Capacitor plugin for thermal printer communication.
 * Supports Bluetooth printers (most common for restaurant POS).
 * Falls back to Android system print dialog for non-thermal printers.
 */
@CapacitorPlugin(
    name = "DinePrinter",
    permissions = {
        @Permission(strings = { Manifest.permission.BLUETOOTH_CONNECT }, alias = "bluetooth_connect"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_SCAN }, alias = "bluetooth_scan"),
    }
)
public class DinePrinterPlugin extends Plugin {

    private static final String PREFS_NAME = "DinePrinterPrefs";
    private static final String PREF_DEFAULT_PRINTER = "defaultPrinterAddress";
    // Standard SPP UUID for Bluetooth serial communication
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

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

        if (defaultAddress != null) {
            if (defaultAddress.startsWith("usb:")) {
                // USB printer — use system print dialog (handles USB/network printers)
                printViaSystem(html, type, call);
                return;
            }

            // Try Bluetooth thermal printer
            try {
                for (int i = 0; i < copies; i++) {
                    printViaBluetooth(defaultAddress, html);
                }
                call.resolve();
                return;
            } catch (Exception e) {
                // Bluetooth failed, fall through to system print
            }
        }

        // Fallback: Android system print dialog
        printViaSystem(html, type, call);
    }

    @PluginMethod
    public void scanPrinters(PluginCall call) {
        JSArray printers = new JSArray();
        Set<String> addedAddresses = new HashSet<>();

        // 1. Scan paired Bluetooth devices
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
                // Bluetooth permission not granted, continue with USB
            }
        }

        // 2. Scan USB connected devices (printers/serial devices)
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
            // USB scan failed, continue
        }

        JSObject result = new JSObject();
        result.put("printers", printers);
        call.resolve(result);
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
        call.resolve();
    }

    @PluginMethod
    public void getDefaultPrinter(PluginCall call) {
        String address = getDefaultPrinterAddress();
        if (address == null) {
            call.resolve(new JSObject()); // null-like response
            return;
        }

        // Check if it's a USB printer
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
            } catch (Exception e) {
                // Fall through
            }
            // USB device not found currently, return stored info
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
            } catch (SecurityException e) {
                // Fall through
            }
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

        // Check USB printer
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
            } catch (Exception e) {
                // Fall through
            }
            result.put("connected", connected);
            call.resolve(result);
            return;
        }

        // Check Bluetooth printer
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
            } catch (SecurityException e) {
                // Fall through
            }
        }

        result.put("connected", connected);
        call.resolve(result);
    }

    // --- Private helpers ---

    private String getDefaultPrinterAddress() {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(PREF_DEFAULT_PRINTER, null);
    }

    private void printViaBluetooth(String address, String html) throws IOException {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        BluetoothDevice device = adapter.getRemoteDevice(address);
        BluetoothSocket socket = null;

        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
            OutputStream outputStream = socket.getOutputStream();

            // Convert HTML to plain text for ESC/POS
            // For a production implementation, use a proper HTML-to-ESC/POS renderer
            // For now, we strip tags and send as plain text
            byte[] data = htmlToEscPos(html);
            outputStream.write(data);
            outputStream.flush();

            // Feed and cut
            outputStream.write(new byte[]{ 0x1B, 0x64, 0x04 }); // Feed 4 lines
            outputStream.write(new byte[]{ 0x1D, 0x56, 0x00 }); // Full cut

        } finally {
            if (socket != null) {
                try { socket.close(); } catch (IOException ignored) {}
            }
        }
    }

    private byte[] htmlToEscPos(String html) {
        // Basic HTML to ESC/POS conversion
        // Initialize printer
        StringBuilder sb = new StringBuilder();
        sb.append((char) 0x1B).append((char) 0x40); // ESC @ (initialize)

        // Strip HTML tags for basic text output
        String text = html
            .replaceAll("<br\\s*/?>", "\n")
            .replaceAll("<hr\\s*/?>", "--------------------------------\n")
            .replaceAll("<[^>]+>", "")
            .replaceAll("&nbsp;", " ")
            .replaceAll("&amp;", "&")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&#8377;|&rupee;", "Rs.")
            .replaceAll("\\s*\n\\s*\n\\s*", "\n\n") // Collapse multiple newlines
            .trim();

        sb.append(text);
        sb.append("\n\n\n"); // trailing feed

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
