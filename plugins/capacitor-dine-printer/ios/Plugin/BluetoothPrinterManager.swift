import Foundation
import CoreBluetooth

/// Printer info returned to JavaScript
struct PrinterInfo {
    let name: String
    let address: String  // CBPeripheral UUID string
    let type: String     // "bluetooth"

    func toDictionary() -> [String: Any] {
        return ["name": name, "address": address, "type": type]
    }
}

/// Manages BLE thermal printer discovery, connection, and data transmission.
///
/// iOS does not support Bluetooth Classic (SPP/RFCOMM) for third-party apps.
/// This uses CoreBluetooth (BLE) which works with modern thermal printers that
/// expose a Nordic UART Service (NUS) or similar BLE serial characteristic.
///
/// Common BLE printer service UUIDs:
///   - Nordic UART: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
///   - Generic:     49535343-FE7D-4AE5-8FA9-9FAFD205E455
///   - 18F0 service (some Chinese printers)
///   - E7810A71 (some ESC/POS printers)
class BluetoothPrinterManager: NSObject {

    // MARK: – Known BLE printer service UUIDs

    private static let printerServiceUUIDs: [CBUUID] = [
        CBUUID(string: "49535343-FE7D-4AE5-8FA9-9FAFD205E455"),  // Common BLE printer
        CBUUID(string: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"),  // Nordic UART (NUS)
        CBUUID(string: "18F0"),                                    // Some thermal printers
        CBUUID(string: "E7810A71-73AE-499D-8C15-FAA9AEF0C3F2"),  // ESC/POS BLE
    ]

    // Nordic UART TX characteristic (write to printer)
    private static let nusTxUUID = CBUUID(string: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E")
    // Common write characteristic
    private static let genericWriteUUID = CBUUID(string: "49535343-8841-43F4-A8D4-ECBE34729BB3")

    // MARK: – State

    private var centralManager: CBCentralManager!
    private var discoveredPeripherals: [CBPeripheral] = []
    private var connectedPeripheral: CBPeripheral?
    private var writeCharacteristic: CBCharacteristic?
    private var bluetoothState: CBManagerState = .unknown

    // Callbacks
    private var scanCompletion: (([PrinterInfo]) -> Void)?
    private var connectCompletion: ((Bool, String?) -> Void)?
    private var printData: Data?
    private var printCompletion: ((Bool, String?) -> Void)?

    // Scan timer
    private var scanTimer: Timer?
    private static let scanDuration: TimeInterval = 5.0

    // BLE write chunk size (conservative default; negotiated MTU may allow more)
    private static let chunkSize = 20

    // Singleton
    static let shared = BluetoothPrinterManager()

    private override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: DispatchQueue.global(qos: .userInitiated))
    }

    // MARK: – Public API

    /// Scan for BLE printers for ~5 seconds and return results.
    func scanForPrinters(completion: @escaping ([PrinterInfo]) -> Void) {
        discoveredPeripherals.removeAll()

        guard bluetoothState == .poweredOn else {
            // Bluetooth not ready — return empty
            completion([])
            return
        }

        scanCompletion = completion

        // First, check already-connected peripherals
        let connected = centralManager.retrieveConnectedPeripherals(
            withServices: BluetoothPrinterManager.printerServiceUUIDs
        )
        for p in connected {
            if !discoveredPeripherals.contains(where: { $0.identifier == p.identifier }) {
                discoveredPeripherals.append(p)
            }
        }

        // Start active scan
        centralManager.scanForPeripherals(
            withServices: nil, // Scan all — some printers don't advertise standard UUIDs
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )

        // Stop scan after duration
        DispatchQueue.main.async { [weak self] in
            self?.scanTimer?.invalidate()
            self?.scanTimer = Timer.scheduledTimer(withTimeInterval: BluetoothPrinterManager.scanDuration, repeats: false) { [weak self] _ in
                self?.finishScan()
            }
        }
    }

    /// Print ESC/POS data to a BLE printer identified by its UUID string.
    func printData(_ data: Data, toAddress address: String, completion: @escaping (Bool, String?) -> Void) {
        guard bluetoothState == .poweredOn else {
            completion(false, "Bluetooth is not available")
            return
        }

        // Try to retrieve the peripheral by UUID
        guard let uuid = UUID(uuidString: address) else {
            completion(false, "Invalid printer address")
            return
        }

        let peripherals = centralManager.retrievePeripherals(withIdentifiers: [uuid])
        guard let peripheral = peripherals.first else {
            completion(false, "Printer not found. Make sure it is powered on and nearby.")
            return
        }

        self.printData = data
        self.printCompletion = completion
        self.connectedPeripheral = peripheral
        peripheral.delegate = self

        if peripheral.state == .connected {
            // Already connected — discover services directly
            peripheral.discoverServices(BluetoothPrinterManager.printerServiceUUIDs)
        } else {
            centralManager.connect(peripheral, options: nil)
        }

        // Timeout after 15 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 15) { [weak self] in
            if self?.printCompletion != nil {
                self?.cancelPrint(reason: "Connection timed out")
            }
        }
    }

    /// Check if a peripheral with the given UUID is in connected state.
    func isConnected(address: String) -> Bool {
        guard let uuid = UUID(uuidString: address) else { return false }
        let peripherals = centralManager.retrievePeripherals(withIdentifiers: [uuid])
        return peripherals.first?.state == .connected
    }

    // MARK: – Private Helpers

    private func finishScan() {
        centralManager.stopScan()
        let printers = discoveredPeripherals.map { peripheral -> PrinterInfo in
            PrinterInfo(
                name: peripheral.name ?? "Unknown Printer",
                address: peripheral.identifier.uuidString,
                type: "bluetooth"
            )
        }
        scanCompletion?(printers)
        scanCompletion = nil
    }

    private func sendDataToPeripheral() {
        guard let peripheral = connectedPeripheral,
              let characteristic = writeCharacteristic,
              let data = printData else {
            cancelPrint(reason: "No write characteristic found")
            return
        }

        let chunkSize = BluetoothPrinterManager.chunkSize
        var offset = 0

        // Determine write type
        let writeType: CBCharacteristicWriteType = characteristic.properties.contains(.writeWithoutResponse)
            ? .withoutResponse
            : .withResponse

        while offset < data.count {
            let end = min(offset + chunkSize, data.count)
            let chunk = data.subdata(in: offset..<end)
            peripheral.writeValue(chunk, for: characteristic, type: writeType)
            offset = end
        }

        // Give the printer time to process, then report success
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.printCompletion?(true, nil)
            self?.printCompletion = nil
            self?.printData = nil
        }
    }

    private func cancelPrint(reason: String) {
        if let peripheral = connectedPeripheral, peripheral.state == .connecting || peripheral.state == .connected {
            centralManager.cancelPeripheralConnection(peripheral)
        }
        printCompletion?(false, reason)
        printCompletion = nil
        printData = nil
        connectedPeripheral = nil
        writeCharacteristic = nil
    }
}

// MARK: – CBCentralManagerDelegate

extension BluetoothPrinterManager: CBCentralManagerDelegate {

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        bluetoothState = central.state
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral,
                         advertisementData: [String: Any], rssi RSSI: NSNumber) {
        // Filter: only add devices that look like printers
        // Accept if device has a name (most printers advertise one) or if it advertises printer services
        let hasName = peripheral.name != nil && !peripheral.name!.isEmpty
        let advertisedServices = advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] ?? []
        let hasPrinterService = !Set(advertisedServices).isDisjoint(with: Set(BluetoothPrinterManager.printerServiceUUIDs))

        if hasName || hasPrinterService {
            if !discoveredPeripherals.contains(where: { $0.identifier == peripheral.identifier }) {
                discoveredPeripherals.append(peripheral)
            }
        }
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        // Connection succeeded — discover printer services
        peripheral.discoverServices(nil) // Discover all services to find write characteristic
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        cancelPrint(reason: error?.localizedDescription ?? "Failed to connect to printer")
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        // If we were printing and got disconnected unexpectedly
        if printCompletion != nil {
            cancelPrint(reason: "Printer disconnected unexpectedly")
        }
    }
}

// MARK: – CBPeripheralDelegate

extension BluetoothPrinterManager: CBPeripheralDelegate {

    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard error == nil, let services = peripheral.services else {
            cancelPrint(reason: error?.localizedDescription ?? "No services found")
            return
        }

        for service in services {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard error == nil, let characteristics = service.characteristics else { return }

        // Look for a writable characteristic
        for char in characteristics {
            // Check known write characteristic UUIDs first
            if char.uuid == BluetoothPrinterManager.nusTxUUID ||
               char.uuid == BluetoothPrinterManager.genericWriteUUID {
                writeCharacteristic = char
                sendDataToPeripheral()
                return
            }
        }

        // Fallback: find any characteristic with write property
        for char in characteristics {
            if char.properties.contains(.write) || char.properties.contains(.writeWithoutResponse) {
                writeCharacteristic = char
                sendDataToPeripheral()
                return
            }
        }
    }
}
