#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::*;
use reqwest::Client;
use tauri::Manager;
use tracing::info;

fn main() {
    tracing_subscriber::fmt::init();

    // Khởi tạo HTTP client với TLS tự ký (Self-signed certificate acceptance cho mạng LAN)
    let http_client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .expect("Không thể tạo HTTP client");

    let client_state = DesktopClientState {
        http_client,
        paired_device_ip: tokio::sync::RwLock::new(Some("192.168.99.111".to_string())), // Default LAN target
        auth_token: tokio::sync::RwLock::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .manage(client_state)
        .invoke_handler(tauri::generate_handler![
            get_connected_device_info,
            pair_with_device,
            fetch_photos,
            export_photos_to_pc,
            prepare_file_for_drag,
            upload_dropped_files_to_ios,
        ])
        .setup(|_app| {
            info!("Send2All Desktop Client khởi động thành công!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Lỗi khi chạy Tauri application");
}
