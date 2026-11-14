import SwiftUI
import Photos

public struct HostDashboardView: View {
    @State private var pairingPin: String = "849201"
    @State private var isServerRunning: Bool = true
    @State private var connectedClientName: String? = "Antigravity Workstation (Windows)"
    @State private var currentSpeedMBps: Double = 48.5
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
                    .background(Color(UIColor.secondarySystemGroupedBackground))
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
                    .background(Color(UIColor.secondarySystemGroupedBackground))
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
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
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
                                .foregroundColor(.amber)
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
                    .background(Color(UIColor.secondarySystemGroupedBackground))
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("Send2All Host")
            .sheet(isPresented: $showDocumentPicker) {
                FolderPickerView { url in
                    if FileStorageService.shared.registerExternalFolder(url: url) {
                        selectedFoldersCount += 1
                    }
                }
            }
            .onAppear {
                checkPermissions()
            }
        }
    }
    
    private func refreshPin() {
        let randomNum = Int.random(in: 100000...999999)
        pairingPin = String(randomNum)
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
