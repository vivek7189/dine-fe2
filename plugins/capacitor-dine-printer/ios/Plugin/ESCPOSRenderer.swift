import Foundation

/// Converts HTML content to ESC/POS byte commands for thermal printers.
/// Direct port of Android's `htmlToEscPos()` method.
class ESCPOSRenderer {

    /// Render HTML string into ESC/POS binary data ready to send to a thermal printer.
    static func render(html: String) -> Data {
        var result = Data()

        // ESC @ — Initialize / reset printer
        result.append(contentsOf: [0x1B, 0x40])

        // Strip HTML → plain text
        var text = html

        // Convert <br> to newline
        text = text.replacingOccurrences(
            of: "<br\\s*/?>",
            with: "\n",
            options: .regularExpression
        )

        // Convert <hr> to dashed line
        text = text.replacingOccurrences(
            of: "<hr\\s*/?>",
            with: "--------------------------------\n",
            options: .regularExpression
        )

        // Remove all remaining HTML tags
        text = text.replacingOccurrences(
            of: "<[^>]+>",
            with: "",
            options: .regularExpression
        )

        // Decode HTML entities
        text = text.replacingOccurrences(of: "&nbsp;", with: " ")
        text = text.replacingOccurrences(of: "&amp;", with: "&")
        text = text.replacingOccurrences(of: "&lt;", with: "<")
        text = text.replacingOccurrences(of: "&gt;", with: ">")
        text = text.replacingOccurrences(of: "&#8377;", with: "Rs.")
        text = text.replacingOccurrences(of: "&rupee;", with: "Rs.")

        // Collapse multiple blank lines
        text = text.replacingOccurrences(
            of: "\\s*\n\\s*\n\\s*",
            with: "\n\n",
            options: .regularExpression
        )

        text = text.trimmingCharacters(in: .whitespacesAndNewlines)

        // Append text content
        if let data = text.data(using: .utf8) {
            result.append(data)
        }

        // Trailing line feeds
        result.append(contentsOf: [0x0A, 0x0A, 0x0A])

        // ESC d 4 — Feed 4 lines
        result.append(contentsOf: [0x1B, 0x64, 0x04])

        // GS V 0 — Full cut
        result.append(contentsOf: [0x1D, 0x56, 0x00])

        return result
    }
}
