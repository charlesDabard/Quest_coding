import Foundation
import IOKit.hid

// Minimal Apple keyboard HID descriptor with Fn/Globe key
// Uses Apple Vendor Top Case usage page (0xFF) with Fn usage (0x0003)
let descriptorBytes: [UInt8] = [
    // Standard keyboard part
    0x05, 0x01,        // Usage Page (Generic Desktop)
    0x09, 0x06,        // Usage (Keyboard)
    0xA1, 0x01,        // Collection (Application)

    // Modifier byte (standard: Ctrl, Shift, Alt, GUI)
    0x05, 0x07,        //   Usage Page (Keyboard/Keypad)
    0x19, 0xE0,        //   Usage Minimum (Left Control)
    0x29, 0xE7,        //   Usage Maximum (Right GUI)
    0x15, 0x00,        //   Logical Minimum (0)
    0x25, 0x01,        //   Logical Maximum (1)
    0x75, 0x01,        //   Report Size (1)
    0x95, 0x08,        //   Report Count (8)
    0x81, 0x02,        //   Input (Data, Variable, Absolute)

    // Reserved byte
    0x95, 0x01,        //   Report Count (1)
    0x75, 0x08,        //   Report Size (8)
    0x81, 0x01,        //   Input (Constant)

    // Key array (6 keys)
    0x95, 0x06,        //   Report Count (6)
    0x75, 0x08,        //   Report Size (8)
    0x15, 0x00,        //   Logical Minimum (0)
    0x26, 0xFF, 0x00,  //   Logical Maximum (255)
    0x05, 0x07,        //   Usage Page (Keyboard/Keypad)
    0x19, 0x00,        //   Usage Minimum (0)
    0x29, 0xFF,        //   Usage Maximum (255)
    0x81, 0x00,        //   Input (Data, Array)

    0xC0,              // End Collection

    // Apple Vendor Top Case collection for Fn/Globe key
    0x06, 0xFF, 0x00,  // Usage Page (0x00FF - Apple Vendor Top Case)
    0x09, 0x01,        // Usage (Top Case)
    0xA1, 0x01,        // Collection (Application)

    // Fn/Globe key (1 bit)
    0x09, 0x03,        //   Usage (0x0003 - Keyboard Fn)
    0x15, 0x00,        //   Logical Minimum (0)
    0x25, 0x01,        //   Logical Maximum (1)
    0x75, 0x01,        //   Report Size (1)
    0x95, 0x01,        //   Report Count (1)
    0x81, 0x02,        //   Input (Data, Variable, Absolute)

    // Padding (7 bits)
    0x75, 0x07,        //   Report Size (7)
    0x95, 0x01,        //   Report Count (1)
    0x81, 0x01,        //   Input (Constant)

    0xC0               // End Collection
]

// Standard keyboard report: [modifiers(1)] [reserved(1)] [keys(6)] = 8 bytes
// Apple Fn report: [fn_bit + padding(1)] = 1 byte
// Total: 9 bytes

func createVirtualKeyboard() -> IOHIDUserDevice? {
    let properties: [String: Any] = [
        kIOHIDVendorIDKey as String: 0x05AC,           // Apple
        kIOHIDProductIDKey as String: 0x0342,           // Apple Internal Keyboard
        kIOHIDProductKey as String: "Quest Virtual Keyboard",
        kIOHIDManufacturerKey as String: "Apple Inc.",
        kIOHIDTransportKey as String: "USB",
        kIOHIDReportDescriptorKey as String: Data(descriptorBytes),
        kIOHIDPrimaryUsagePageKey as String: 0x01,      // Generic Desktop
        kIOHIDPrimaryUsageKey as String: 0x06,           // Keyboard
    ]

    return IOHIDUserDeviceCreate(kCFAllocatorDefault, properties as CFDictionary)?.takeRetainedValue()
}

func sendReport(_ device: IOHIDUserDevice, modifiers: UInt8 = 0, keys: [UInt8] = [], fn: Bool = false) {
    // 8 bytes keyboard + 1 byte Fn
    var report: [UInt8] = [modifiers, 0x00, 0, 0, 0, 0, 0, 0, fn ? 0x01 : 0x00]
    // Fill in keys
    for (i, key) in keys.prefix(6).enumerated() {
        report[2 + i] = key
    }
    let result = IOHIDUserDeviceHandleReport(device, report, report.count)
    if result != kIOReturnSuccess {
        print("ERROR: HandleReport failed: \(result)")
    }
}

func main() {
    guard let device = createVirtualKeyboard() else {
        print("ERROR: Failed to create virtual keyboard")
        exit(1)
    }

    // Let the system recognize the device
    RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.5))

    // First Fn tap
    sendReport(device, fn: true)    // Fn down
    usleep(50_000)
    sendReport(device, fn: false)   // Fn up

    usleep(200_000)                  // 200ms gap

    // Second Fn tap
    sendReport(device, fn: true)    // Fn down
    usleep(50_000)
    sendReport(device, fn: false)   // Fn up

    // Keep alive briefly so the system processes events
    RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.3))

    print("OK")
}

main()
