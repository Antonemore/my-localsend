use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Thông điệp phát sóng tìm kiếm thiết bị qua UDP Multicast (Port 53317)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryBeacon {
    pub protocol: String,       // "send2all-v1"
    pub device_id: String,      // UUID định danh duy nhất
    pub device_name: String,    // Ví dụ: "Avison's iPhone 15 Pro"
    pub device_type: DeviceType,// iOS | macOS | Windows | Linux
    pub port: u16,              // Port dịch vụ HTTPS (ví dụ 53318)
    pub fingerprint: String,    // SHA-256 fingerprint của cert TLS tự ký
    pub paired: bool,           // Trạng thái đã ghép đôi hay chưa
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceType {
    IOS,
    MacOS,
    Windows,
    Linux,
    Android,
}

/// Yêu cầu ghép đôi lần đầu qua mã PIN 6 số hoặc QR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingRequest {
    pub client_device_id: String,
    pub client_name: String,
    pub client_fingerprint: String,
    pub pin: String, // 6 số ngẫu nhiên do iOS hiển thị
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingResponse {
    pub success: bool,
    pub auth_token: Option<String>,
    pub server_fingerprint: String,
    pub message: String,
}

/// Thông tin thời gian thực của thiết bị (truy vấn qua REST hoặc đẩy qua WebSocket)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub device_name: String,
    pub model: String,            // Ví dụ: "iPhone 15 Pro Max"
    pub os_version: String,       // Ví dụ: "iOS 18.2"
    pub battery_level: f32,       // 0.0 -> 1.0 (ví dụ 0.85 = 85%)
    pub is_charging: bool,
    pub storage_total_bytes: u64, // Ví dụ: 256GB
    pub storage_free_bytes: u64,  // Ví dụ: 98GB
    pub photo_count: u32,
    pub video_count: u32,
}

/// Metadata của một bức ảnh/video lấy từ PhotoKit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhotoItem {
    pub id: String,               // Local Identifier trong PhotoKit
    pub filename: String,         // "IMG_2026.HEIC"
    pub media_type: MediaType,    // Image | Video
    pub creation_date: DateTime<Utc>,
    pub width: u32,
    pub height: u32,
    pub duration_seconds: Option<f64>, // Dành cho video
    pub file_size_bytes: u64,
    pub is_favorite: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Image,
    Video,
}

/// Cây thư mục quản lý file (Filesystem Tree)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size_bytes: u64,
    pub modified_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileNode>>,
}

/// Payload WebSocket Telemetry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum WsEvent {
    BatteryUpdate { level: f32, is_charging: bool },
    StorageUpdate { free_bytes: u64, total_bytes: u64 },
    PhotoLibraryChanged { new_items: u32 },
    TransferProgress { file_id: String, progress: f64, speed_bps: u64 },
}

/// Dữ liệu Snapshot danh mục tệp theo yêu cầu (On-Demand Catalog)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotResponse {
    pub device: DeviceInfo,
    pub photos: Vec<PhotoItem>,
    pub files: Vec<FileNode>,
    pub timestamp: DateTime<Utc>,
    pub session_token: String,
}

/// Lệnh thực thi chuyển tệp theo lô đã chọn (Batch Transfer)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchTransferRequest {
    pub session_token: String,
    pub file_ids: Vec<String>,
    pub target_folder: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchTransferResponse {
    pub success: bool,
    pub total_files: usize,
    pub total_bytes: u64,
    pub message: String,
}
