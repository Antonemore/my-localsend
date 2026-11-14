use crate::models::{PairingRequest, PairingResponse};
use ring::rand::{SecureRandom, SystemRandom};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct PairedDevice {
    pub device_id: String,
    pub device_name: String,
    pub fingerprint: String, // SHA-256 fingerprint
    pub auth_token: String,
    pub paired_at: chrono::DateTime<chrono::Utc>,
}

pub struct PairingManager {
    current_pin: Arc<RwLock<Option<String>>>,
    server_fingerprint: String,
    paired_store: Arc<RwLock<HashMap<String, PairedDevice>>>,
}

impl PairingManager {
    pub fn new(server_fingerprint: String) -> Self {
        Self {
            current_pin: Arc::new(RwLock::new(None)),
            server_fingerprint,
            paired_store: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Sinh mã PIN 6 số ngẫu nhiên hiển thị trên màn hình iOS
    pub async fn generate_new_pin(&self) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let rng = SystemRandom::new();
        let mut bytes = [0u8; 4];
        rng.fill(&mut bytes)
            .map_err(|_| "Không thể khởi tạo bộ tạo số ngẫu nhiên an toàn")?;
        
        let num = u32::from_be_bytes(bytes) % 1_000_000;
        let pin = format!("{:06}", num);
        
        let mut pin_lock = self.current_pin.write().await;
        *pin_lock = Some(pin.clone());
        Ok(pin)
    }

    /// Xử lý yêu cầu ghép đôi từ Desktop
    pub async fn handle_pairing_request(&self, req: PairingRequest) -> PairingResponse {
        let current_pin = self.current_pin.read().await;
        
        // Kiểm tra xem PIN có tồn tại và khớp không
        if let Some(expected_pin) = &*current_pin {
            if req.pin == *expected_pin {
                // Sinh token phiên làm việc
                let token = uuid::Uuid::new_v4().to_string();
                let paired = PairedDevice {
                    device_id: req.client_device_id.clone(),
                    device_name: req.client_name,
                    fingerprint: req.client_fingerprint,
                    auth_token: token.clone(),
                    paired_at: chrono::Utc::now(),
                };

                let mut store = self.paired_store.write().await;
                store.insert(req.client_device_id, paired);

                return PairingResponse {
                    success: true,
                    auth_token: Some(token),
                    server_fingerprint: self.server_fingerprint.clone(),
                    message: "Ghép đôi thiết bị thành công".to_string(),
                };
            }
        }

        PairingResponse {
            success: false,
            auth_token: None,
            server_fingerprint: self.server_fingerprint.clone(),
            message: "Mã PIN không chính xác hoặc đã hết hạn".to_string(),
        }
    }

    /// Xác thực token của request đến
    pub async fn verify_token(&self, device_id: &str, token: &str) -> bool {
        let store = self.paired_store.read().await;
        if let Some(device) = store.get(device_id) {
            device.auth_token == token
        } else {
            false
        }
    }

    /// Tính toán SHA-256 Fingerprint từ DER certificate bytes
    pub fn compute_sha256_fingerprint(cert_der: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(cert_der);
        let hash = hasher.finalize();
        hex::encode_upper(hash)
            .as_bytes()
            .chunks(2)
            .map(|c| std::str::from_utf8(c).unwrap())
            .collect::<Vec<_>>()
            .join(":")
    }
}
