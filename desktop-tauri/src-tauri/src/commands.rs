use reqwest::Client;
use send2all_core::models::{DeviceInfo, FileNode, PairingRequest, PairingResponse, PhotoItem};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager, State};
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tracing::{error, info};

pub struct DesktopClientState {
    pub http_client: Client,
    pub paired_device_ip: tokio::sync::RwLock<Option<String>>,
    pub auth_token: tokio::sync::RwLock<Option<String>>,
}

/// Lấy thông tin thiết bị iPhone (Pin, dung lượng, phiên bản)
#[tauri::command]
pub async fn get_connected_device_info(
    state: State<'_, DesktopClientState>,
) -> Result<DeviceInfo, String> {
    let ip = state
        .paired_device_ip
        .read()
        .await
        .clone()
        .ok_or_else(|| "Chưa kết nối tới thiết bị iOS nào".to_string())?;

    let url = format!("https://{}:53318/api/v1/device-info", ip);
    let res = state
        .http_client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Lỗi truy vấn device-info: {}", e))?;

    res.json::<DeviceInfo>()
        .await
        .map_err(|e| format!("Lỗi parse JSON: {}", e))
}

/// Gửi yêu cầu ghép đôi mã PIN 6 số tới iPhone
#[tauri::command]
pub async fn pair_with_device(
    ip: String,
    pin: String,
    state: State<'_, DesktopClientState>,
) -> Result<PairingResponse, String> {
    let url = format!("https://{}:53318/api/v1/pair", ip);
    let req = PairingRequest {
        client_device_id: uuid::Uuid::new_v4().to_string(),
        client_name: "Desktop Workstation".to_string(),
        client_fingerprint: "DESKTOP_SHA256_FINGERPRINT".to_string(),
        pin,
    };

    let res = state
        .http_client
        .post(&url)
        .json(&req)
        .send()
        .await
        .map_err(|e| format!("Lỗi gửi yêu cầu ghép đôi: {}", e))?;

    let pairing_res = res
        .json::<PairingResponse>()
        .await
        .map_err(|e| format!("Lỗi nhận phản hồi: {}", e))?;

    if pairing_res.success {
        if let Some(token) = &pairing_res.auth_token {
            *state.auth_token.write().await = Some(token.clone());
            *state.paired_device_ip.write().await = Some(ip);
            info!("Ghép đôi thành công và lưu Auth Token");
        }
    }

    Ok(pairing_res)
}

/// Lấy danh sách ảnh/video từ iPhone
#[tauri::command]
pub async fn fetch_photos(
    offset: usize,
    limit: usize,
    state: State<'_, DesktopClientState>,
) -> Result<Vec<PhotoItem>, String> {
    let ip = state
        .paired_device_ip
        .read()
        .await
        .clone()
        .unwrap_or_else(|| "127.0.0.1".to_string());

    let url = format!("https://{}:53318/api/v1/photos?offset={}&limit={}", ip, offset, limit);
    let res = state
        .http_client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Lỗi tải danh sách ảnh: {}", e))?;

    res.json::<Vec<PhotoItem>>()
        .await
        .map_err(|e| format!("Lỗi parse photos: {}", e))
}

/// Xuất hàng loạt ảnh/video về thư mục trên PC
#[tauri::command]
pub async fn export_photos_to_pc(
    photo_ids: Vec<String>,
    target_directory: String,
    transcode_to_jpg: bool,
    state: State<'_, DesktopClientState>,
) -> Result<usize, String> {
    let ip = state
        .paired_device_ip
        .read()
        .await
        .clone()
        .ok_or_else(|| "Chưa kết nối thiết bị".to_string())?;

    let dest_dir = PathBuf::from(target_directory);
    if !dest_dir.exists() {
        tokio::fs::create_dir_all(&dest_dir)
            .await
            .map_err(|e| e.to_string())?;
    }

    let mut successful_exports = 0;
    for id in photo_ids {
        let url = format!(
            "https://{}:53318/api/v1/photos/{}/original?transcode={}",
            ip, id, transcode_to_jpg
        );

        if let Ok(res) = state.http_client.get(&url).send().await {
            let extension = if transcode_to_jpg { "jpg" } else { "heic" };
            let file_path = dest_dir.join(format!("{}.{}", id, extension));

            if let Ok(bytes) = res.bytes().await {
                if let Ok(mut f) = File::create(&file_path).await {
                    let _ = f.write_all(&bytes).await;
                    successful_exports += 1;
                }
            }
        }
    }

    Ok(successful_exports)
}

/// Kích hoạt Native Drag-out sang Windows Explorer qua plugin `tauri-plugin-drag`
#[tauri::command]
pub async fn start_native_drag_out(
    app: AppHandle,
    photo_id: String,
    filename: String,
    state: State<'_, DesktopClientState>,
) -> Result<(), String> {
    // 1. Chuẩn bị file tạm trong App Cache
    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let temp_file = cache_dir.join(&filename);

    // 2. Tải nhanh file gốc từ iPhone vào temp nếu chưa có
    if !temp_file.exists() {
        let ip = state
            .paired_device_ip
            .read()
            .await
            .clone()
            .ok_or_else(|| "Chưa kết nối".to_string())?;

        let url = format!("https://{}:53318/api/v1/photos/{}/original", ip, photo_id);
        let res = state
            .http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let bytes = res.bytes().await.map_err(|e| e.to_string())?;
        tokio::fs::write(&temp_file, &bytes)
            .await
            .map_err(|e| e.to_string())?;
    }

    // 3. Gọi plugin Drag native của Tauri v2 để Windows Explorer hứng file thực tế
    info!("Kích hoạt Native Drag ra Windows Explorer cho: {:?}", temp_file);
    let item_paths = vec![temp_file.to_string_lossy().to_string()];
    
    // Gọi tauri_plugin_drag::start_drag
    tauri_plugin_drag::start_drag(
        &app.get_webview_window("main").unwrap(),
        item_paths,
        None,
    ).map_err(|e| e.to_string())?;

    Ok(())
}

/// Đẩy tệp kéo thả từ PC lên iPhone (POST /api/v1/files/upload)
#[tauri::command]
pub async fn upload_dropped_files_to_ios(
    file_paths: Vec<String>,
    state: State<'_, DesktopClientState>,
) -> Result<usize, String> {
    let ip = state
        .paired_device_ip
        .read()
        .await
        .clone()
        .ok_or_else(|| "Chưa kết nối iPhone".to_string())?;

    let url = format!("https://{}:53318/api/v1/files/upload", ip);
    let mut uploaded_count = 0;

    for path_str in file_paths {
        let path = Path::new(&path_str);
        if !path.exists() || path.is_dir() {
            continue;
        }

        let file_name = path
            .file_name()
            .map(|f| f.to_string_lossy().to_string())
            .unwrap_or_else(|| "upload_file".to_string());

        if let Ok(file_bytes) = tokio::fs::read(path).await {
            let part = reqwest::multipart::Part::bytes(file_bytes)
                .file_name(file_name);
            let form = reqwest::multipart::Form::new().part("file", part);

            if let Ok(res) = state.http_client.post(&url).multipart(form).send().await {
                if res.status().is_success() {
                    uploaded_count += 1;
                }
            }
        }
    }

    Ok(uploaded_count)
}
