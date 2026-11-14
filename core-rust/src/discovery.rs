use crate::models::{DeviceType, DiscoveryBeacon};
use socket2::{Domain, Protocol, Socket, Type};
use std::collections::HashMap;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::Arc;
use std::time::Duration;
use tokio::net::UdpSocket;
use tokio::sync::{broadcast, RwLock};
use tracing::{error, info, warn};

pub const MULTICAST_IPV4: Ipv4Addr = Ipv4Addr::new(224, 0, 0, 167);
pub const DISCOVERY_PORT: u16 = 53317;

pub struct DiscoveryService {
    local_beacon: DiscoveryBeacon,
    discovered_devices: Arc<RwLock<HashMap<String, (DiscoveryBeacon, SocketAddr)>>>,
    notifier: broadcast::Sender<DiscoveryBeacon>,
}

impl DiscoveryService {
    pub fn new(local_beacon: DiscoveryBeacon) -> Self {
        let (notifier, _) = broadcast::channel(32);
        Self {
            local_beacon,
            discovered_devices: Arc::new(RwLock::new(HashMap::new())),
            notifier,
        }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<DiscoveryBeacon> {
        self.notifier.subscribe()
    }

    pub async fn get_discovered_devices(&self) -> HashMap<String, (DiscoveryBeacon, SocketAddr)> {
        self.discovered_devices.read().await.clone()
    }

    /// Khởi động luồng phát sóng định kỳ (Broadcaster) và luồng lắng nghe (Listener)
    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let socket = Self::bind_multicast_socket(MULTICAST_IPV4, DISCOVERY_PORT)?;
        let udp_socket = UdpSocket::from_std(socket.into())?;
        let shared_socket = Arc::new(udp_socket);

        // 1. Luồng Broadcaster: Phát beacon của chính mình mỗi 2.5 giây
        let broadcaster_socket = shared_socket.clone();
        let my_beacon = self.local_beacon.clone();
        tokio::spawn(async move {
            let target_addr = SocketAddr::new(IpAddr::V4(MULTICAST_IPV4), DISCOVERY_PORT);
            let mut interval = tokio::time::interval(Duration::from_millis(2500));
            loop {
                interval.tick().await;
                if let Ok(payload) = serde_json::to_vec(&my_beacon) {
                    if let Err(e) = broadcaster_socket.send_to(&payload, target_addr).await {
                        warn!("Không thể phát UDP multicast beacon: {}", e);
                    }
                }
            }
        });

        // 2. Luồng Listener: Lắng nghe beacon từ các thiết bị khác trong LAN
        let listener_socket = shared_socket.clone();
        let devices = self.discovered_devices.clone();
        let notifier = self.notifier.clone();
        let my_id = self.local_beacon.device_id.clone();

        tokio::spawn(async move {
            let mut buf = [0u8; 4096];
            loop {
                match listener_socket.recv_from(&mut buf).await {
                    Ok((len, peer_addr)) => {
                        if let Ok(beacon) = serde_json::from_slice::<DiscoveryBeacon>(&buf[..len]) {
                            // Bỏ qua gói tin do chính thiết bị này phát
                            if beacon.device_id == my_id {
                                continue;
                            }

                            let mut map = devices.write().await;
                            let is_new = !map.contains_key(&beacon.device_id);
                            map.insert(beacon.device_id.clone(), (beacon.clone(), peer_addr));

                            if is_new {
                                info!(
                                    "Phát hiện thiết bị mới: {} ({:?}) tại {}",
                                    beacon.device_name, beacon.device_type, peer_addr
                                );
                                let _ = notifier.send(beacon);
                            }
                        }
                    }
                    Err(e) => {
                        error!("Lỗi đọc socket UDP Multicast: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    /// Khởi tạo raw socket với cờ SO_REUSEADDR và SO_REUSEPORT đa nền tảng
    fn bind_multicast_socket(
        addr: Ipv4Addr,
        port: u16,
    ) -> Result<std::net::UdpSocket, Box<dyn std::error::Error + Send + Sync>> {
        let domain = Domain::IPV4;
        let socket = Socket::new(domain, Type::DGRAM, Some(Protocol::UDP))?;

        socket.set_reuse_address(true)?;
        #[cfg(not(windows))]
        socket.set_reuse_port(true)?;

        let bind_addr: SocketAddr = SocketAddr::new(IpAddr::V4(Ipv4Addr::UNSPECIFIED), port);
        socket.bind(&bind_addr.into())?;
        socket.join_multicast_v4(&addr, &Ipv4Addr::UNSPECIFIED)?;
        socket.set_multicast_loop_v4(true)?;
        socket.set_nonblocking(true)?;

        Ok(socket.into())
    }
}
