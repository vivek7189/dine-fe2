import Foundation
import Capacitor
import UIKit

/// Capacitor plugin for thermal printer support on iOS.
///
/// Provides the same API surface as the Android DinePrinterPlugin:
///   - print(html, type, copies)
///   - scanPrinters()
///   - setDefaultPrinter(address)
///   - getDefaultPrinter()
///   - isConnected()
///
/// Uses CoreBluetooth (BLE) for direct silent printing to thermal printers.
/// Falls back to UIPrintInteractionController (AirPrint / system print dialog)
/// when no BLE printer is configured.
@objc(DinePrinterPlugin)
public class DinePrinterPlugin: CAPPlugin {

    private static let prefsDefaultPrinter = "DinePrinter_defaultAddress"
    private static let prefsDefaultPrinterName = "DinePrinter_defaultName"
    private static let prefsAirPrintURL = "DinePrinter_airprintURL"

    private let btManager = BluetoothPrinterManager.shared

    // MARK: – print()

    @objc func print(_ call: CAPPluginCall) {
        let html = call.getString("html") ?? ""
        let type = call.getString("type") ?? "bill"
        let copies = call.getInt("copies") ?? 1

        guard !html.isEmpty else {
            call.reject("HTML content is required")
            return
        }

        let defaultAddress = UserDefaults.standard.string(forKey: DinePrinterPlugin.prefsDefaultPrinter)

        if let address = defaultAddress, !address.isEmpty, !address.hasPrefix("airprint:") {
            // BLE thermal printer — silent print
            let escposData = ESCPOSRenderer.render(html: html)
            var remaining = copies

            func printNext() {
                guard remaining > 0 else {
                    call.resolve()
                    return
                }
                remaining -= 1
                btManager.printData(escposData, toAddress: address) { success, error in
                    if success {
                        printNext()
                    } else {
                        // BLE failed — fall back to system print
                        self.printViaSystem(html: html, type: type, call: call)
                    }
                }
            }

            printNext()
        } else {
            // No BLE printer configured — use system print dialog
            printViaSystem(html: html, type: type, call: call)
        }
    }

    // MARK: – scanPrinters()

    @objc func scanPrinters(_ call: CAPPluginCall) {
        btManager.scanForPrinters { printers in
            var result: [[String: Any]] = printers.map { $0.toDictionary() }

            // Also check if AirPrint is available
            if UIPrintInteractionController.isPrintingAvailable {
                result.append([
                    "name": "AirPrint (System Print Dialog)",
                    "address": "airprint:system",
                    "type": "network"
                ])
            }

            call.resolve(["printers": result])
        }
    }

    // MARK: – setDefaultPrinter()

    @objc func setDefaultPrinter(_ call: CAPPluginCall) {
        guard let address = call.getString("address") else {
            call.reject("Printer address is required")
            return
        }

        UserDefaults.standard.set(address, forKey: DinePrinterPlugin.prefsDefaultPrinter)

        // Store the name if available (from scanPrinters results)
        if let name = call.getString("name") {
            UserDefaults.standard.set(name, forKey: DinePrinterPlugin.prefsDefaultPrinterName)
        }

        call.resolve()
    }

    // MARK: – getDefaultPrinter()

    @objc func getDefaultPrinter(_ call: CAPPluginCall) {
        guard let address = UserDefaults.standard.string(forKey: DinePrinterPlugin.prefsDefaultPrinter),
              !address.isEmpty else {
            call.resolve([:])
            return
        }

        let name = UserDefaults.standard.string(forKey: DinePrinterPlugin.prefsDefaultPrinterName) ?? "Saved Printer"
        let type = address.hasPrefix("airprint:") ? "network" : "bluetooth"

        call.resolve([
            "name": name,
            "address": address,
            "type": type
        ])
    }

    // MARK: – isConnected()

    @objc func isConnected(_ call: CAPPluginCall) {
        guard let address = UserDefaults.standard.string(forKey: DinePrinterPlugin.prefsDefaultPrinter),
              !address.isEmpty else {
            call.resolve(["connected": false])
            return
        }

        if address.hasPrefix("airprint:") {
            // AirPrint is always "available" if printing is supported
            call.resolve(["connected": UIPrintInteractionController.isPrintingAvailable])
        } else {
            let connected = btManager.isConnected(address: address)
            call.resolve(["connected": connected])
        }
    }

    // MARK: – System Print Fallback

    /// Uses iOS UIPrintInteractionController to render HTML and print.
    /// If an AirPrint printer URL was previously saved, prints silently to it.
    /// Otherwise shows the system print dialog.
    private func printViaSystem(html: String, type: String, call: CAPPluginCall) {
        DispatchQueue.main.async {
            let printController = UIPrintInteractionController.shared

            let printInfo = UIPrintInfo(dictionary: nil)
            printInfo.outputType = .general
            printInfo.jobName = "DineOpen \(type.uppercased())"
            printController.printInfo = printInfo

            let formatter = UIMarkupTextPrintFormatter(markupText: html)
            formatter.perPageContentInsets = UIEdgeInsets.zero
            printController.printFormatter = formatter

            // Try silent print to saved AirPrint printer
            if let urlString = UserDefaults.standard.string(forKey: DinePrinterPlugin.prefsAirPrintURL),
               let url = URL(string: urlString) {
                let printer = UIPrinter(url: url)
                printController.print(to: printer) { _, completed, error in
                    if completed {
                        call.resolve()
                    } else if let error = error {
                        // Saved printer failed — show dialog as fallback
                        self.showPrintDialog(controller: printController, call: call)
                    } else {
                        call.reject("Print cancelled")
                    }
                }
            } else {
                // No saved printer — show dialog
                self.showPrintDialog(controller: printController, call: call)
            }
        }
    }

    private func showPrintDialog(controller: UIPrintInteractionController, call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("No view controller available")
                return
            }

            if UIDevice.current.userInterfaceIdiom == .pad {
                controller.present(from: viewController.view.bounds, in: viewController.view, animated: true) { _, completed, error in
                    if completed {
                        // Save the selected printer for future silent prints
                        if let printerURL = controller.printInfo?.printerID {
                            // printerID is not the URL, but we can store what's available
                        }
                        call.resolve()
                    } else {
                        call.reject(error?.localizedDescription ?? "Print cancelled")
                    }
                }
            } else {
                controller.present(animated: true) { _, completed, error in
                    if completed {
                        call.resolve()
                    } else {
                        call.reject(error?.localizedDescription ?? "Print cancelled")
                    }
                }
            }
        }
    }
}
