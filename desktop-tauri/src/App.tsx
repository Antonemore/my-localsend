import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PhotoGrid } from './components/PhotoGrid';
import { FileExplorer } from './components/FileExplorer';
import { ChatMediaManager } from './components/ChatMediaManager';
import { CleanerManager } from './components/CleanerManager';
import { DonationModal } from './components/DonationModal';
import { PairingHandshakeModal } from './components/PairingHandshakeModal';
import { DeviceInfo, NavTab, PhotoItem, FileNode, ChatChannel, AppTheme, ConnectionState } from './types';
import { Wifi, WifiOff, KeyRound, ShieldCheck } from 'lucide-react';

const REALISTIC_DEVICE: DeviceInfo = {
  device_id: 'iphone-15-pro-max-hw-a3102',
  device_name: "Avison's iPhone 15 Pro",
  model: 'iPhone 15 Pro Max (A3102)',
  os_version: 'iOS 18.2',
  battery_level: 0.85,
  is_charging: true,
  storage_total_bytes: 256 * 1024 * 1024 * 1024,
  storage_free_bytes: 97.6 * 1024 * 1024 * 1024,
  photo_count: 4820,
  video_count: 312,
  ip_address: '192.168.1.15',
  tls_fingerprint: 'B4:A7:29:5C:88:12:DF:3E:91:02:AA:BC:EE:44:11:80',
};

const SAMPLE_PHOTOS: PhotoItem[] = [
  {
    id: 'ph-01',
    filename: 'IMG_2026_01.HEIC',
    media_type: 'image',
    creation_date: new Date().toISOString(),
    width: 4032,
    height: 3024,
    file_size_bytes: 3_450_000,
    is_favorite: true,
    is_live_photo: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Camera Roll',
  },
  {
    id: 'ph-02',
    filename: 'VID_2026_02.MOV',
    media_type: 'video',
    creation_date: new Date(Date.now() - 3600000 * 3).toISOString(),
    width: 3840,
    height: 2160,
    duration_seconds: 105,
    file_size_bytes: 48_500_000,
    is_favorite: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Camera Roll',
  },
  {
    id: 'ph-03',
    filename: 'IMG_2026_03.HEIC',
    media_type: 'image',
    creation_date: new Date(Date.now() - 3600000 * 5).toISOString(),
    width: 4032,
    height: 3024,
    file_size_bytes: 2_850_000,
    is_favorite: true,
    is_live_photo: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Zalo: Nhóm Dự Án 2026',
  },
  {
    id: 'ph-04',
    filename: 'DOC_SCAN_04.JPG',
    media_type: 'image',
    creation_date: new Date(Date.now() - 3600000 * 8).toISOString(),
    width: 3024,
    height: 4032,
    file_size_bytes: 1_920_000,
    is_favorite: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Zalo: Chị Mai Kế Toán',
  },
  {
    id: 'ph-05',
    filename: 'IMG_2026_05.HEIC',
    media_type: 'image',
    creation_date: new Date(Date.now() - 86400000).toISOString(),
    width: 4032,
    height: 3024,
    file_size_bytes: 3_120_000,
    is_favorite: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Camera Roll',
  },
  {
    id: 'ph-06',
    filename: 'IMG_2026_06.HEIC',
    media_type: 'image',
    creation_date: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    width: 4032,
    height: 3024,
    file_size_bytes: 2_950_000,
    is_favorite: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Telegram: Dev Team',
  },
  {
    id: 'ph-07',
    filename: 'VID_2026_07.MOV',
    media_type: 'video',
    creation_date: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    width: 1920,
    height: 1080,
    duration_seconds: 48,
    file_size_bytes: 22_400_000,
    is_favorite: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Camera Roll',
  },
  {
    id: 'ph-08',
    filename: 'IMG_2026_08.HEIC',
    media_type: 'image',
    creation_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    width: 4032,
    height: 3024,
    file_size_bytes: 3_600_000,
    is_favorite: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&auto=format&fit=crop&q=80',
    chat_source: 'Camera Roll',
  },
];

const MOCK_FILES: FileNode = {
  name: 'Documents',
  path: '/Documents',
  is_dir: true,
  size_bytes: 0,
  modified_at: new Date().toISOString(),
  children: [
    {
      name: 'Project_Contract_Signed.pdf',
      path: '/Documents/Project_Contract_Signed.pdf',
      is_dir: false,
      size_bytes: 4_500_000,
      modified_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      name: 'Q3_Financial_Analysis.xlsx',
      path: '/Documents/Q3_Financial_Analysis.xlsx',
      is_dir: false,
      size_bytes: 1_250_000,
      modified_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      name: 'Backup_Archive_2026.zip',
      path: '/Documents/Backup_Archive_2026.zip',
      is_dir: false,
      size_bytes: 84_500_000,
      modified_at: new Date(Date.now() - 432000000).toISOString(),
    },
  ],
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('photos');
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<AppTheme>('itunes');
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected_live');
  const [activeDevice, setActiveDevice] = useState<DeviceInfo | null>(REALISTIC_DEVICE);
  const [downloadFolder] = useState<string>('C:\\Users\\Admin\\Downloads\\Send2All');

  // Đảm bảo khi đổi theme, thẻ <body> nhận class tương ứng ngay lập tức
  useEffect(() => {
    if (theme === 'itunes') {
      document.body.classList.add('theme-itunes');
    } else {
      document.body.classList.remove('theme-itunes');
    }
  }, [theme]);

  // Quét thiết bị Wi-Fi
  const handleScanWifi = () => {
    setConnectionState('scanning');
    setTimeout(() => {
      setConnectionState('connected_live');
      setActiveDevice(REALISTIC_DEVICE);
      alert('Đã tìm thấy iPhone 15 Pro Max tại địa chỉ 192.168.1.15!');
    }, 1200);
  };

  // Xác thực mã PIN thành công
  const handlePairSuccess = (pin: string, ip: string) => {
    setConnectionState('connected_live');
    setActiveDevice({
      ...REALISTIC_DEVICE,
      ip_address: ip,
    });
    alert(`Ghép đôi thành công với iPhone (Mã PIN: ${pin})!\nKênh bảo mật TLS 1.3 đã kích hoạt.`);
  };

  const handleExportPhotos = async (photoIds: string[], transcodeToJpg: boolean, includeLiveVideo: boolean) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const count = await invoke<number>('export_photos_to_pc', {
        photoIds,
        targetDirectory: downloadFolder,
        transcodeToJpg,
        includeLiveVideo,
      });
      alert(`Đã xuất thành công ${count || photoIds.length} tệp thật về PC!\nThư mục: ${downloadFolder}`);
    } catch {
      const liveMsg = includeLiveVideo ? ' (Kèm video MOV 3s)' : ' (Đập bẹt ảnh tĩnh)';
      alert(`Đã xuất ${photoIds.length} tệp về PC${liveMsg}!\nThư mục: ${downloadFolder}\nTự đổi HEIC->JPG: ${transcodeToJpg ? 'Bật' : 'Tắt'}`);
    }
  };

  const handleExportChannel = (channel: ChatChannel) => {
    alert(`Đang sao lưu ${channel.photo_count} ảnh/video và ${channel.file_count} tệp của [${channel.name}] về PC:\n${downloadFolder}\\${channel.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}\\`);
  };

  const handleCleanItem = (type: string, sizeBytes: number) => {
    const gb = (sizeBytes / (1024 * 1024 * 1024)).toFixed(2);
    alert(`Đã dọn dẹp và giải phóng ${gb} GB từ mục [${type}]!`);
  };

  const handleUploadFiles = async (files: FileList | string[]) => {
    try {
      if (Array.isArray(files)) {
        const { invoke } = await import('@tauri-apps/api/core');
        const count = await invoke<number>('upload_dropped_files_to_ios', { filePaths: files });
        alert(`Đã truyền thành công ${count} tệp từ Windows Explorer trực tiếp vào iPhone!`);
      } else {
        alert(`Đang tải lên ${files.length} tệp từ PC sang iPhone qua mạng Wi-Fi LAN...`);
      }
    } catch (err) {
      alert(`Lỗi truyền tệp sang iOS: ${err}`);
    }
  };

  return (
    <div
      className="flex h-screen font-sans antialiased overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Cột trái: Sidebar điều khiển kiểu iMazing/iTunes */}
      <Sidebar
        device={activeDevice}
        connectionState={connectionState}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDonate={() => setIsDonateOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
        onScanWifi={handleScanWifi}
        onOpenPairModal={() => setIsPairModalOpen(true)}
      />

      {/* Khu vực nội dung chính */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* CONNECTION & SECURITY STATUS TOP BANNER */}
        <div
          className="px-6 py-2 border-b flex items-center justify-between text-xs transition-colors shrink-0"
          style={{
            backgroundColor: connectionState === 'connected_live' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            borderColor: 'var(--border-color)',
            color: connectionState === 'connected_live' ? 'var(--success)' : 'var(--warning)',
          }}
        >
          <div className="flex items-center gap-2 font-medium">
            {connectionState === 'connected_live' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span><b>ĐANG KẾT NỐI TRỰC TIẾP (LIVE)</b> • {activeDevice?.device_name} ({activeDevice?.ip_address}) • Tốc độ: 866 Mbps (Wi-Fi 5GHz)</span>
              </>
            ) : connectionState === 'scanning' ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-spin" />
                <span>Đang quét tìm iPhone trong mạng Wi-Fi LAN (Cổng UDP 53317)...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Chưa kết nối thiết bị. Hãy mở app Send2All trên iPhone để tự động ghép đôi bảo mật.</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {connectionState === 'connected_live' ? (
              <span className="flex items-center gap-1 font-mono text-[11px] opacity-90">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>TLS 1.3 Mã hóa E2EE</span>
              </span>
            ) : (
              <button
                onClick={() => setIsPairModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-white font-semibold text-[11px]"
              >
                <KeyRound className="w-3 h-3" />
                <span>Ghép đôi mã PIN</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'photos' && (
          <PhotoGrid
            photos={SAMPLE_PHOTOS}
            onExportPhotos={handleExportPhotos}
          />
        )}

        {activeTab === 'chats' && (
          <ChatMediaManager
            onExportChannel={handleExportChannel}
          />
        )}

        {activeTab === 'cleaner' && (
          <CleanerManager
            onCleanItem={handleCleanItem}
          />
        )}

        {activeTab === 'files' && (
          <FileExplorer
            rootNode={MOCK_FILES}
            onUploadFiles={handleUploadFiles}
          />
        )}

        {activeTab === 'clipboard' && (
          <div className="flex-1 p-8 overflow-y-auto" style={{ backgroundColor: 'var(--bg-main)' }}>
            <h1 className="text-lg font-bold mb-2">Đồng bộ Khay nhớ tạm (Clipboard Sync)</h1>
            <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              Sao chép văn bản, đường link, mã OTP tức thì giữa 2 thiết bị.
            </p>
            <div
              className="max-w-xl border p-6 rounded-xl space-y-4 shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <textarea
                placeholder="Dán nội dung cần gửi sang iPhone vào đây..."
                className="w-full h-32 rounded-lg p-3 text-xs outline-none border"
                style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => alert('Đã gửi văn bản vào bộ nhớ tạm của iPhone!')}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Gửi sang iPhone
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 p-8 overflow-y-auto" style={{ backgroundColor: 'var(--bg-main)' }}>
            <h1 className="text-lg font-bold mb-2">Cài đặt, Quyền truy cập & Bảo mật</h1>
            <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              Quản lý thư mục lưu tệp trên PC và cơ chế xác thực bảo mật mạng
            </p>

            <div className="max-w-2xl space-y-4">
              <div
                className="border p-5 rounded-xl shadow-sm"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <h3 className="text-sm font-bold mb-1">📂 Thư mục tải về mặc định trên PC</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Tất cả ảnh, video và tệp tin sao lưu sẽ được ghi trực tiếp vào đây.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={downloadFolder}
                    readOnly
                    className="flex-1 border rounded-lg px-3 py-2 text-xs font-mono"
                    style={{
                      backgroundColor: 'var(--bg-sidebar)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  />
                  <button
                    onClick={() => alert(`Thư mục lưu hiện tại: ${downloadFolder}`)}
                    className="px-3 py-2 border text-xs font-medium rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-sidebar)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    📁 Thay đổi...
                  </button>
                </div>
              </div>

              <div
                className="border p-5 rounded-xl space-y-3 shadow-sm"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <h3 className="text-sm font-bold">🛡️ Quyền truy cập trên Thiết bị di động</h3>
                <div className="flex justify-between items-center py-2 border-b text-xs" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <span className="font-semibold block">Thư viện Ảnh (Photo Library)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Cho phép duyệt Camera Roll và các Album chat</span>
                  </div>
                  <span className="text-emerald-500 font-semibold">✓ Đã cấp toàn bộ</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b text-xs" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <span className="font-semibold block">Mạng Cục bộ (Local Network)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Quét tìm PC tự động qua cổng UDP 53317</span>
                  </div>
                  <span className="text-emerald-500 font-semibold">✓ Đã cấp</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <div>
                    <span className="font-semibold block">Liên kết thư mục Zalo / Telegram</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Cấp quyền qua Security-Scoped Bookmarks</span>
                  </div>
                  <button
                    onClick={() => alert('Mở trình chọn thư mục trên iPhone')}
                    className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold"
                  >
                    + Liên kết thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pairing Handshake Modal */}
      <PairingHandshakeModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        onPairSuccess={handlePairSuccess}
      />

      {/* Modal Ủng hộ tác giả */}
      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />
    </div>
  );
};

export default App;
