# Send2All Wireless Protocol & Architecture Specification (v1.0)

## 1. Overview
**Send2All** là hệ thống quản lý và truyền tải tệp hai chiều không dây hiệu năng cao giữa iOS và Máy tính (Windows/macOS/Linux).
Hệ thống kết hợp khả năng tự động khám phá mạng nội bộ không cần cấu hình của **LocalSend** với trải nghiệm quản trị tệp kéo thả trực quan của **iMazing / iTools**, loại bỏ 100% dây cáp USB và phụ thuộc iTunes/Apple Mobile Device Support.

---

## 2. Discovery & One-Time Pairing Handshake

### A. UDP Multicast Discovery
- **Multicast Group:** `224.0.0.167`
- **Port:** `53317`
- **Chu kỳ phát:** Mỗi 2.5 giây từ cả hai phía (iOS Host và Desktop Client).
- **Cấu trúc Beacon JSON:**
```json
{
  "protocol": "send2all-v1",
  "device_id": "c1f7b5a8-3a9d-4e59-8802-998811223344",
  "device_name": "Avison's iPhone 15 Pro",
  "device_type": "ios",
  "port": 53318,
  "fingerprint": "8A:1F:B2:4C:E3:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB",
  "paired": false
}
```

### B. Ghép đôi một lần (One-Time PIN/QR Handshake)
1. **Khởi tạo:** Khi phát hiện thiết bị chưa ghép đôi (`paired: false`), iOS hiển thị mã PIN 6 số ngẫu nhiên (hoặc mã QR chứa `ip`, `port`, `pin`, `fingerprint`).
2. **Xác thực:** Desktop gửi yêu cầu `POST https://<ios-ip>:53318/api/v1/pair`:
```json
{
  "client_device_id": "d98123aa-bb22-44cc-88ee-1234567890ab",
  "client_name": "Antigravity Workstation (Windows)",
  "client_fingerprint": "B2:3C:D4:E5:...",
  "pin": "739281"
}
```
3. **Phản hồi & Lưu trữ:**
   - iOS xác nhận mã PIN hợp lệ ➔ sinh `auth_token` (UUID v4) và lưu `client_fingerprint` vào danh sách tin cậy.
   - Desktop lưu `auth_token` và `server_fingerprint` vào Keystore/Credential Manager.
   - **Tất cả các lần kết nối sau:** Tự động kết nối TLS và xác thực qua Token + Certificate Pinning, không bao giờ phải nhập lại PIN hay bấm nút chấp nhận.

---

## 3. REST API Specification

### 3.1 Device Information
- **Endpoint:** `GET /api/v1/device-info`
- **Headers:** `Authorization: Bearer <auth_token>`
- **Response 200 OK:**
```json
{
  "device_id": "c1f7b5a8-3a9d-4e59-8802-998811223344",
  "device_name": "Avison's iPhone 15 Pro",
  "model": "iPhone 15 Pro Max",
  "os_version": "iOS 18.2",
  "battery_level": 0.88,
  "is_charging": true,
  "storage_total_bytes": 256000000000,
  "storage_free_bytes": 142500000000,
  "photo_count": 4820,
  "video_count": 312
}
```

### 3.2 PhotoKit Media Management
- **List Media:** `GET /api/v1/photos?offset=0&limit=100`
- **Fetch Thumbnail:** `GET /api/v1/photos/{id}/thumb` (Binary JPEG/PNG, kích thước 200x200, HTTP Cache `max-age=86400`)
- **Download Full Resolution:** `GET /api/v1/photos/{id}/original` (Hỗ trợ cờ `?transcode=jpg` để tự động đổi HEIC sang JPEG chất lượng cao)

### 3.3 Filesystem Explorer & Concurrent Chunk Streaming
- **Directory Tree:** `GET /api/v1/files/tree?path=/Documents`
- **Download File with HTTP Range:** `GET /api/v1/files/download?path=/Documents/Archive.zip`
  - Hỗ trợ header `Range: bytes=0-1048575` ➔ Phản hồi `206 Partial Content`.
  - Cho phép tải đa luồng song song (Multi-threaded chunked downloads).
- **Upload File (Drag from PC to iPhone):** `POST /api/v1/files/upload`
  - Content-Type: `multipart/form-data`
  - Stream trực tiếp vào `FileManager` hoặc nạp vào Camera Roll (`PhotoKit`) nếu là ảnh/video.

---

## 4. Realtime WebSocket Telemetry (`/api/v1/ws`)
Desktop duy trì kết nối WebSocket song song để cập nhật trạng thái mà không cần polling:
- `BatteryUpdate`: Thông báo khi pin thay đổi hoặc cắm/rút sạc.
- `StorageUpdate`: Cập nhật dung lượng bộ nhớ khả dụng.
- `PhotoLibraryChanged`: Bắn sự kiện khi trên iPhone vừa chụp thêm ảnh mới ➔ Desktop tự động nạp ảnh mới nhất lên đầu danh sách.
- `TransferProgress`: Báo tiến độ và tốc độ truyền tải thời gian thực.

---

## 5. Kiến Trúc Hai Chiều Kéo Thả (Two-Way Native Drag & Drop)
1. **iPhone ➔ PC (Kéo ra ngoài Windows Explorer):**
   - Người dùng bôi đen 10 bức ảnh trên giao diện Send2All Desktop ➔ Nhấn giữ chuột kéo thả ra thư mục `D:\Photos` trên Windows Explorer.
   - Tauri bắt sự kiện `tauri://drag-start` ➔ Sinh danh sách URL tải tạm thời ➔ Kích hoạt Windows Shell File Drop (`IDataObject` / `CF_HDROP`) ➔ Rust Core nhận luồng tải trực tiếp từ iPhone và ghi thẳng vào ổ cứng đĩa đích.
2. **PC ➔ iPhone (Kéo từ Windows Explorer thả vào cửa sổ Send2All):**
   - Kéo file/folder thả vào vùng "Drop files here".
   - Tauri bắt sự kiện `tauri://file-drop` ➔ Gửi danh sách đường dẫn file cho Rust Core ➔ Rust Core mở `POST /api/v1/files/upload` đa luồng đẩy trực tiếp vào iPhone.
