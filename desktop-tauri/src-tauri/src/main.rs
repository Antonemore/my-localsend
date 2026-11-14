#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::*;
use reqwest::Client;
use std::sync::Arc;
use tauri::{Emitter, Listener, Manager};
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
        .plugin(tauri_plugin_drag::init())
        .plugin(tauri_plugin_fs::init())
        .manage(client_state)
        .invoke_handler(tauri::generate_handler![
            get_connected_device_info,
            pair_with_device,
            fetch_photos,
            export_photos_to_pc,
            start_native_drag_out,
            upload_dropped_files_to_ios,
        ])
        .setup(|app| {
            info!("Send2All Desktop Client khởi động thành công!");

            let main_window = app.get_webview_window("main").expect("Main window not found");

            // Bắt sự kiện Kéo-Thả tệp từ Windows Explorer / Finder vào giao diện
            let app_handle = app.handle().clone();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::DragDrop(drag_event) = event {
                    match drag_event {
                        tauri::DragDropEvent::Drop { paths, .. } => {
                            let file_paths: Vec<String> = paths
                                .iter()
                                .map(|p| p.to_string_lossy().to_string())
                                .collect();
                            info!("Bắt được sự kiện File Drop từ Windows Explorer: {:?}", file_paths);
                            
                            // Gửi sự kiện sang React frontend để hiển thị trạng thái đang upload
                            let _ = app_handle.emit("os-files-dropped", file_paths);
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Lỗi khi chạy Tauri application");
}
