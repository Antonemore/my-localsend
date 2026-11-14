use crate::models::{DeviceInfo, FileNode, PairingRequest, PhotoItem, WsEvent};
use crate::pairing::PairingManager;
use axum::{
    body::Body,
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Multipart, Path, Query, State,
    },
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;
use std::sync::Arc;
use tokio::sync::broadcast;
use tower_http::cors::CorsLayer;
use tracing::{info, warn};

#[derive(Clone)]
pub struct AppState {
    pub pairing_mgr: Arc<PairingManager>,
    pub ws_sender: broadcast::Sender<WsEvent>,
    pub device_info: Arc<DeviceInfo>,
}

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub offset: Option<usize>,
    pub limit: Option<usize>,
}

#[derive(Debug, Deserialize)]
pub struct PathQuery {
    pub path: Option<String>,
}

pub fn create_router(state: AppState) -> Router {
    Router::new()
        // API ghép đôi và xác thực
        .route("/api/v1/pair", post(handle_pairing))
        .route("/api/v1/device-info", get(handle_device_info))
        // API PhotoKit
        .route("/api/v1/photos", get(handle_list_photos))
        .route("/api/v1/photos/:id/thumb", get(handle_get_photo_thumb))
        .route("/api/v1/photos/:id/original", get(handle_get_photo_original))
        // API Filesystem Explorer
        .route("/api/v1/files/tree", get(handle_file_tree))
        .route("/api/v1/files/download", get(handle_file_download))
        .route("/api/v1/files/upload", post(handle_file_upload))
        // WebSocket Telemetry
        .route("/api/v1/ws", get(handle_websocket_upgrade))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

/// Handler xử lý ghép đôi qua mã PIN
async fn handle_pairing(
    State(state): State<AppState>,
    Json(payload): Json<PairingRequest>,
) -> impl IntoResponse {
    let res = state.pairing_mgr.handle_pairing_request(payload).await;
    if res.success {
        (StatusCode::OK, Json(res))
    } else {
        (StatusCode::UNAUTHORIZED, Json(res))
    }
}

/// Lấy thông tin thiết bị (Pin, dung lượng, phiên bản)
async fn handle_device_info(State(state): State<AppState>) -> impl IntoResponse {
    Json((*state.device_info).clone())
}

/// Lấy danh sách ảnh từ PhotoKit có phân trang
async fn handle_list_photos(
    State(_state): State<AppState>,
    Query(pagination): Query<PaginationQuery>,
) -> impl IntoResponse {
    let offset = pagination.offset.unwrap_or(0);
    let limit = pagination.limit.unwrap_or(50);

    // Mẫu Mock Photo items (trong môi trường iOS thực tế sẽ gọi qua UniFFI bridge PhotoKit)
    let photos: Vec<PhotoItem> = (offset..offset + limit)
        .map(|i| PhotoItem {
            id: format!("ph-asset-{:05}", i),
            filename: format!("IMG_{:04}.HEIC", i),
            media_type: if i % 7 == 0 {
                crate::models::MediaType::Video
            } else {
                crate::models::MediaType::Image
            },
            creation_date: chrono::Utc::now() - chrono::Duration::hours(i as i64 * 3),
            width: 4032,
            height: 3024,
            duration_seconds: if i % 7 == 0 { Some(45.2) } else { None },
            file_size_bytes: 3_450_000,
            is_favorite: i % 5 == 0,
        })
        .collect();

    Json(photos)
}

/// Tải ảnh Thumbnail (150x150 hoặc 200x200) cho giao diện lưới mượt mà
async fn handle_get_photo_thumb(
    Path(id): Path<String>,
    State(_state): State<AppState>,
) -> Response {
    // 1x1 transparent PNG binary bytes
    const DUMMY_PNG: &[u8] = &[
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ];
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "image/png")
        .header(header::CACHE_CONTROL, "public, max-age=86400")
        .header("X-Asset-Id", id)
        .body(Body::from(DUMMY_PNG.to_vec()))
        .unwrap()
}

/// Tải ảnh gốc (Original Full File)
async fn handle_get_photo_original(
    Path(id): Path<String>,
    State(_state): State<AppState>,
) -> Response {
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/octet-stream")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}.heic\"", id),
        )
        .body(Body::from(vec![0u8; 1024]))
        .unwrap()
}

/// Lấy cây thư mục tập tin (Filesystem Tree)
async fn handle_file_tree(
    Query(q): Query<PathQuery>,
    State(_state): State<AppState>,
) -> impl IntoResponse {
    let current_path = q.path.unwrap_or_else(|| "/Documents".to_string());
    let node = FileNode {
        name: "Documents".to_string(),
        path: current_path,
        is_dir: true,
        size_bytes: 0,
        modified_at: chrono::Utc::now(),
        children: Some(vec![
            FileNode {
                name: "Work_Report.pdf".to_string(),
                path: "/Documents/Work_Report.pdf".to_string(),
                is_dir: false,
                size_bytes: 2_450_000,
                modified_at: chrono::Utc::now() - chrono::Duration::days(1),
                children: None,
            },
            FileNode {
                name: "Archive.zip".to_string(),
                path: "/Documents/Archive.zip".to_string(),
                is_dir: false,
                size_bytes: 45_800_000,
                modified_at: chrono::Utc::now() - chrono::Duration::days(3),
                children: None,
            },
        ]),
    };

    Json(node)
}

/// Tải file hỗ trợ HTTP Range Requests (tiếp tục tải và streaming trực tiếp)
async fn handle_file_download(
    headers: HeaderMap,
    Query(q): Query<PathQuery>,
    State(_state): State<AppState>,
) -> Response {
    let path = q.path.unwrap_or_default();
    let total_size: u64 = 10_000_000; // 10MB test size

    if let Some(range_header) = headers.get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            info!("Yêu cầu HTTP Range: {} cho tệp: {}", range_str, path);
            // Trả về 206 Partial Content
            return Response::builder()
                .status(StatusCode::PARTIAL_CONTENT)
                .header(header::CONTENT_RANGE, format!("bytes 0-1048575/{}", total_size))
                .header(header::CONTENT_LENGTH, "1048576")
                .header(header::CONTENT_TYPE, "application/octet-stream")
                .body(Body::from(vec![0u8; 1048576]))
                .unwrap();
        }
    }

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_LENGTH, total_size.to_string())
        .header(header::CONTENT_TYPE, "application/octet-stream")
        .header(
            header::CONTENT_DISPOSITION,
            "attachment; filename=\"downloaded_file.bin\"",
        )
        .body(Body::from(vec![0u8; 1024]))
        .unwrap()
}

/// Tiếp nhận tệp tải lên từ PC kéo thả vào (Multipart Streaming)
async fn handle_file_upload(
    State(_state): State<AppState>,
    mut multipart: Multipart,
) -> Result<StatusCode, (StatusCode, String)> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        let file_name = field
            .file_name()
            .unwrap_or("unnamed_file")
            .to_string();
        info!("Bắt đầu nhận tệp kéo thả từ PC: {}", file_name);

        let mut data_stream = field;
        let mut total_received = 0u64;

        while let Some(chunk) = data_stream
            .next()
            .await
        {
            let chunk = chunk.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            total_received += chunk.len() as u64;
            // Ở tầng thực tế: Ghi chunk trực tiếp vào disk / PhotoKit
        }

        info!("Đã ghi thành công tệp {} ({} bytes)", file_name, total_received);
    }

    Ok(StatusCode::CREATED)
}

/// WebSocket Upgrade cho Realtime Telemetry (Dung lượng, Pin, Live Photos)
async fn handle_websocket_upgrade(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_websocket_session(socket, state))
}

async fn handle_websocket_session(mut socket: WebSocket, state: AppState) {
    let mut rx = state.ws_sender.subscribe();

    // Vòng lặp gửi sự kiện từ broadcast channel sang client
    while let Ok(event) = rx.recv().await {
        if let Ok(text) = serde_json::to_string(&event) {
            if socket.send(Message::Text(text)).await.is_err() {
                // Client đã ngắt kết nối
                break;
            }
        }
    }
}
