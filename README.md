# 🚀 Send2All — Cross-Platform Wireless Device Manager

<p align="center">
  <img src="https://raw.githubusercontent.com/Antonemore/send2all/main/assets/banner.png" alt="Send2All Banner" width="700"/>
</p>

<p align="center">
  <b>The modern, 100% open-source & wireless alternative to iMazing, iTunes & AirDrop.</b><br/>
  Zero cables. Zero cloud bloat. Full two-way native drag-and-drop between mobile and PC over local Wi-Fi.
</p>

<p align="center">
  <a href="https://github.com/Antonemore/send2all/releases"><img src="https://img.shields.io/github/v/release/Antonemore/send2all?style=flat-square&color=38bdf8" alt="Latest Release"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License"/></a>
  <a href="https://github.com/Antonemore/send2all/actions"><img src="https://img.shields.io/github/actions/workflow/status/Antonemore/send2all/build.yml?style=flat-square" alt="Build Status"/></a>
  <a href="https://buymeacoffee.com/antonemore"><img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-ff813f.svg?style=flat-square" alt="Buy Me A Coffee"/></a>
  <a href="https://github.com/sponsors/Antonemore"><img src="https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-ea4aaa.svg?style=flat-square" alt="GitHub Sponsors"/></a>
</p>

---

## 🌟 Tại Sao Lại Là Send2All?

Hầu hết các công cụ quản lý tệp di động hiện nay đều có nhược điểm:
- **iTunes / Finder / iMazing:** Bắt buộc cắm dây cáp USB, cài driver nặng nề (Apple Mobile Device Support), tốc độ truyền cáp Lightning bị giới hạn ở chuẩn USB 2.0 cổ lỗ sĩ (~30 MB/s).
- **LocalSend / AirDrop:** Rất tốt để bắn tệp nhanh một chiều, nhưng **không có giao diện quản lý hai chiều (two-way explorer)** để bạn duyệt kho ảnh, chọn lọc tệp và kéo thả thoải mái từ máy tính.

**Send2All giải quyết triệt để vấn đề này:**
1. **Hoàn toàn không dây (Wireless LAN):** Kết nối qua Wi-Fi 5GHz / Wi-Fi 6 tốc độ cao (50 – 100+ MB/s).
2. **Kéo thả hai chiều (Native Two-Way Drag & Drop):** Kéo ảnh từ Send2All thả thẳng vào Windows Explorer / macOS Finder; kéo tệp từ PC thả vào cửa sổ Send2All để lưu ngay vào điện thoại.
3. **Tự động chuyển đổi HEIC sang JPEG tức thì:** GPU trên điện thoại tự transcode HEIC thành JPEG chuẩn sRGB khi bạn kéo ảnh sang PC.
4. **Ghép đôi 1 lần (One-Time 6-Digit PIN Pairing):** Nhập mã 6 số một lần duy nhất, các lần sau tự động nhận diện an toàn qua Certificate Pinning (SHA-256).

---

## 📱 & 💻 Hỗ Trợ Đa Nền Tảng Toàn Diện (Cross-Platform)

| Nền Tảng | Vai Trò | Công Nghệ Cốt Lõi | Định Dạng Cài Đặt |
| :--- | :--- | :--- | :--- |
| **iOS** | Host Server | Swift, SwiftUI, PhotoKit, Security-Scoped Bookmarks | `.ipa` (Sideloadly / AltStore / TestFlight) |
| **Android** | Host Server | Kotlin, Jetpack Compose, MediaStore API, SAF | `.apk` (Sideload / F-Droid / GitHub) |
| **Windows** | Desktop Client | Tauri v2, Rust Core, React, TailwindCSS, Windows Shell | `.msi`, `.exe` installer |
| **macOS** | Desktop Client | Tauri v2, Rust Core, React, TailwindCSS, Cocoa Drag | `.dmg`, `.app` (Universal Apple Silicon & Intel) |
| **Linux** | Desktop Client | Tauri v2, Rust Core, React, GTK / WebKitGTK | `.AppImage`, `.deb`, `.rpm` |

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                 Desktop Client (Tauri v2)                   │
│   Windows Explorer / macOS Finder / Linux File Manager      │
│     ▲                                                 │     │
│  Native Drag-Out (tauri-plugin-drag)          Native Drop-In│
│     │                                                 ▼     │
│   React UI ◄── IPC Commands ──► Core Rust Engine (Axum)     │
└───────────────────────▲─────────────────────────────────────┘
                        │ Wireless LAN (TLS 1.3 / Port 53318)
                        │ UDP Multicast Discovery (Port 53317)
┌───────────────────────▼─────────────────────────────────────┐
│               Mobile Host Server (iOS & Android)            │
│   Rust Engine (UniFFI / JNI) ◄──► Native Media Bridges      │
│   • PhotoKit / MediaStore       • FileStorage / SAF Sandbox │
│   • Realtime WebSocket Telemetry • On-the-fly HEIC Transcode│
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Hướng Dẫn Biên Dịch & Phát Triển (Development)

### Yêu Cầu Môi Trường
- **Rust Toolchain:** `rustup default stable`
- **Node.js:** `>= 18.x`
- **Tauri CLI v2:** `cargo install tauri-cli --version "^2.0.0"`
- *(Dành cho iOS)*: macOS với Xcode 15+
- *(Dành cho Android)*: Android Studio với Android SDK 34+

### Chạy Bản Desktop Thử Nghiệm
```bash
# 1. Đi tới thư mục Desktop
cd send2all/desktop-tauri

# 2. Cài đặt các gói npm
npm install

# 3. Chạy ở chế độ phát triển
npm run tauri dev
```

---

## ☕ Ủng Hộ & Quyên Góp (Support & Donate)

**Send2All** là phần mềm mã nguồn mở hoàn toàn **MIỄN PHÍ 100%** và không bao giờ chèn quảng cáo. Nếu ứng dụng mang lại tiện ích cho bạn, bạn có thể ủng hộ tác giả một ly cà phê nhỏ để duy trì server và các chứng chỉ phát triển:

- ☕ **Buy Me a Coffee:** [buymeacoffee.com/antonemore](https://buymeacoffee.com/antonemore)
- 💖 **GitHub Sponsors:** [github.com/sponsors/Antonemore](https://github.com/sponsors/Antonemore)
- 💳 **Ko-fi:** [ko-fi.com/antonemore](https://ko-fi.com/antonemore)

---

## 📄 Bản Quyền (License)
Dự án được phân phối theo giấy phép [MIT License](LICENSE) — Bạn hoàn toàn có quyền sử dụng, sửa đổi và đóng góp mã nguồn tự do.
