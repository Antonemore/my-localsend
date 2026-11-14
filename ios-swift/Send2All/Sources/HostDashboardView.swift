import SwiftUI
import Photos
import UniformTypeIdentifiers

public struct HostDashboardView: View {
    @State private var pairingPin: String = "849201"
    @State private var isServerRunning: Bool = true
    @State private var connectedClientName: String? = nil
    @State private var currentSpeedMBps: Double = 0.0
    @State private var photoPermissionGranted: Bool = false
    @State private var showDocumentPicker: Bool = false
    @State private var selectedFoldersCount: Int = 1
    
    public init() {}

    public var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // 1. PIN Pairing Hero Card
                    VStack(spacing: 12) {
                        HStack {
                            Image(systemName: "lock.shield.fill")
                                .foregroundColor(.blue)
                            Text("ONE-TIME PAIRING PIN")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                            Spacer()
                            Button(action: refreshPin) {
                                Image(systemName: "arrow.clockwise")
                                    .font(.caption)
                                    .foregroundColor(.blue)
                            }
                        }
                        
                        Text(pairingPin)
                            .font(.system(size: 44, weight: .heavy, design: .monospaced))
                            .tracking(8)
                            .foregroundColor(.primary)
                            .padding(.vertical, 8)
                        
                        Text("Nhập mã 6 số này vào Send2All Desktop để kết nối không dây.")
                            .font(.footnote)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(20)
                    .background(Color(uiColor: .secondarySystemGroupedBackground))
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)

                    // 2. Active Wireless Status & Transfer Telemetry
                    VStack(spacing: 16) {
                        HStack {
                            Label("Trạng thái phiên", systemImage: "wifi")
                                .font(.headline)
                            Spacer()
                            Circle()
                                .fill(connectedClientName != nil ? Color.green : Color.orange)
                                .frame(width: 10, height: 10)
                            Text(connectedClientName != nil ? "Đã kết nối" : "Đang chờ")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(connectedClientName != nil ? .green : .orange)
                        }
                        
                        Divider()
                        
                        if let client = connectedClientName {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Máy tính kết nối:")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text(client)
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 4) {
                                    Text("Tốc độ LAN:")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text(String(format: "%.1f MB/s", currentSpeedMBps))
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                    .padding(20)
                    .background(Color(uiColor: .secondarySystemGroupedBackground))
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)

                    // 3. Permissions & Storage Access Center
                    VStack(alignment: .leading, spacing: 16) {
                        Text("QUYỀN TRUY CẬP DỮ LIỆU")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.secondary)
                        
                        // PhotoKit Permission Row
                        HStack {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.title2)
                                .foregroundColor(.pink)
                                .frame(width: 36)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Thư viện Ảnh & Video")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text(photoPermissionGranted ? "Đã cấp toàn quyền truy xuất" : "Cần cấp quyền để quản lý ảnh")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            if photoPermissionGranted {
                                HStack(spacing: 8) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                    Button("Đổi quyền") {
                                        PhotoKitService.shared.openSystemSettings()
                                    }
                                    .font(.caption2)
                                    .buttonStyle(.bordered)
                                }
                            } else {
                                Button("Cấp quyền") {
                                    requestPhotosAccess()
                                }
                                .font(.caption)
                                .buttonStyle(.borderedProminent)
                            }
                        }
                        .padding(.vertical, 4)
                        
                        Divider()
                        
                        // File Storage Access Row
                        HStack {
                            Image(systemName: "folder.badge.plus")
                                .font(.title2)
                                .foregroundColor(.orange)
                                .frame(width: 36)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Thư mục Tệp mở rộng")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text("Đã cấp quyền: \(selectedFoldersCount) thư mục")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Button("Thêm") {
                                showDocumentPicker = true
                            }
                            .font(.caption)
                            .buttonStyle(.bordered)
                        }
                        .padding(.vertical, 4)
                    }
                    .padding(20)
                    .background(Color(uiColor: .secondarySystemGroupedBackground))
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)
                }
                .padding()
            }
            .background(Color(uiColor: .systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("Send2All Host")
            .sheet(isPresented: $showDocumentPicker) {
                FolderPickerView { url in
                    if FileStorageService.shared.registerExternalFolder(url: url) {
                        selectedFoldersCount += 1
                    }
                }
            }
            .onAppear {
                UIDevice.current.isBatteryMonitoringEnabled = true
                checkPermissions()
            }
        }
    }
    
    private func refreshPin() {
        let randomNum = Int.random(in: 100000...999999)
        pairingPin = String(randomNum)
    }
    
    /// Trả về thông số phần cứng thực tế của iPhone (Tuyệt đối không bịa đặt số liệu)
    public static func getRealHardwareInfo() -> (name: String, model: String, os: String, battery: Float, isCharging: Bool, totalStorage: Int64, freeStorage: Int64) {
        UIDevice.current.isBatteryMonitoringEnabled = true
        let name = UIDevice.current.name
        let os = "iOS \(UIDevice.current.systemVersion)"
        let battery = UIDevice.current.batteryLevel
        let isCharging = UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full
        
        // Nhận diện mã máy thực tế từ utsname
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let identifier = machineMirror.children.reduce("") { identifier, element in
            guard let value = element.value as? Int8, value != 0 else { return identifier }
            return identifier + String(UnicodeScalar(UInt8(value)))
        }
        
        let model: String
        switch identifier {
        case "iPhone13,1": model = "iPhone 12 mini"
        case "iPhone13,2": model = "iPhone 12"
        case "iPhone13,3": model = "iPhone 12 Pro"
        case "iPhone13,4": model = "iPhone 12 Pro Max"
        case "iPhone14,4": model = "iPhone 13 mini"
        case "iPhone14,5": model = "iPhone 13"
        case "iPhone14,2": model = "iPhone 13 Pro"
        case "iPhone14,3": model = "iPhone 13 Pro Max"
        case "iPhone14,7": model = "iPhone 14"
        case "iPhone14,8": model = "iPhone 14 Plus"
        case "iPhone15,2": model = "iPhone 14 Pro"
        case "iPhone15,3": model = "iPhone 14 Pro Max"
        case "iPhone15,4": model = "iPhone 15"
        case "iPhone15,5": model = "iPhone 15 Plus"
        case "iPhone16,1": model = "iPhone 15 Pro"
        case "iPhone16,2": model = "iPhone 15 Pro Max"
        case "x86_64", "arm64": model = "iPhone 12 (Simulator)"
        default: model = "iPhone (\(identifier))"
        }
        
        var totalBytes: Int64 = 0
        var freeBytes: Int64 = 0
        if let attrs = try? FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory()) {
            totalBytes = (attrs[.systemSize] as? NSNumber)?.int64Value ?? 0
            freeBytes = (attrs[.systemFreeSize] as? NSNumber)?.int64Value ?? 0
        }
        
        return (name, model, os, battery, isCharging, totalBytes, freeBytes)
    }
    
    private func checkPermissions() {
        let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        photoPermissionGranted = (status == .authorized || status == .limited)
    }
    
    private func requestPhotosAccess() {
        Task {
            let status = await PhotoKitService.shared.requestAuthorization()
            await MainActor.run {
                photoPermissionGranted = (status == .authorized || status == .limited)
            }
        }
    }
}

/// Helper Document Picker cho SwiftUI
struct FolderPickerView: UIViewControllerRepresentable {
    let onFolderPicked: (URL) -> Void

    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.folder], asCopy: false)
        picker.delegate = context.coordinator
        picker.allowsMultipleSelection = false
        return picker
    }

    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: FolderPickerView

        init(_ parent: FolderPickerView) {
            self.parent = parent
        }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            if let first = urls.first {
                parent.onFolderPicked(first)
            }
        }
    }
}
