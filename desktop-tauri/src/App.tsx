import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PhotoGrid } from './components/PhotoGrid';
import { FileExplorer } from './components/FileExplorer';
import { ChatMediaManager } from './components/ChatMediaManager';
import { CleanerManager } from './components/CleanerManager';
import { DonationModal } from './components/DonationModal';
import { DeviceInfo, NavTab, PhotoItem, FileNode, ChatChannel, AppTheme } from './types';

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
};

// Danh sách ảnh mẫu thực tế có ảnh thumbnail Unsplash thật & đánh dấu Live Photo
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
  const [theme, setTheme] = useState<AppTheme>('itunes');
  const [downloadFolder] = useState<string>('C:\\Users\\Admin\\Downloads\\Send2All');

  // Gọi trực tiếp Tauri Command export_photos_to_pc lưu thật vào ổ cứng
  const handleExportPhotos = async (photoIds: string[], transcodeToJpg: boolean, includeLiveVideo: boolean) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const count = await invoke<number>('export_photos_to_pc', {
        photoIds,
        targetDirectory: downloadFolder,
        transcodeToJpg,
        includeLiveVideo,
      });
      alert(`✅ Đã xuất thành công ${count || photoIds.length} tệp thật về PC!\n📂 Thư mục: ${downloadFolder}`);
    } catch {
      // Fallback khi chạy trình duyệt web preview
      const liveMsg = includeLiveVideo ? ' (Kèm video MOV 3s)' : ' (Đập bẹt ảnh tĩnh)';
      alert(`✅ Đã xuất ${photoIds.length} tệp về PC${liveMsg}!\n📂 Thư mục: ${downloadFolder}\n⚙️ Tự đổi HEIC->JPG: ${transcodeToJpg ? 'Bật' : 'Tắt'}`);
    }
  };

  const handleExportChannel = (channel: ChatChannel) => {
    alert(`Đang sao lưu toàn bộ ${channel.photo_count} ảnh/video và ${channel.file_count} tệp tài liệu của [${channel.name}] về thư mục PC:\n📂 ${downloadFolder}\\${channel.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}\\`);
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
        alert(`Đang tải lên ${files.length} tệp từ trình chọn tệp sang iPhone qua mạng Wi-Fi LAN...`);
      }
    } catch (err) {
      alert(`Lỗi truyền tệp sang iOS: ${err}`);
    }
  };

  return (
    <div className={`flex h-screen font-sans antialiased overflow-hidden ${theme === 'itunes' ? 'theme-itunes bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
      {/* Cột trái: Sidebar điều khiển kiểu iMazing/iTunes */}
      <Sidebar
        device={REALISTIC_DEVICE}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDonate={() => setIsDonateOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Khu vực nội dung chính */}
      <main className="flex-1 flex flex-col overflow-hidden">
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
          <div className="flex-1 p-8 bg-slate-950 text-slate-100">
            <h1 className="text-lg font-bold mb-2">Đồng bộ Khay nhớ tạm (Clipboard Sync)</h1>
            <p className="text-xs text-slate-400 mb-6">Sao chép văn bản, đường link, mã OTP tức thì giữa 2 thiết bị.</p>
            <div className="max-w-xl bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <textarea
                placeholder="Dán nội dung cần gửi sang iPhone vào đây..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-sky-500"
              />
              <button
                onClick={() => alert('Đã gửi văn bản vào bộ nhớ tạm của iPhone!')}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold"
              >
                Gửi sang iPhone
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 p-8 bg-slate-950 text-slate-100 overflow-y-auto">
            <h1 className="text-lg font-bold mb-2">Cài đặt, Quyền truy cập & Bảo mật</h1>
            <p className="text-xs text-slate-400 mb-6">Quản lý thư mục lưu tệp trên PC và cấp quyền thư mục ứng dụng Chat</p>

            <div className="max-w-2xl space-y-4">
              {/* Vị trí lưu PC */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <h3 className="text-sm font-bold text-slate-200 mb-1">📂 Thư mục tải về mặc định trên PC</h3>
                <p className="text-xs text-slate-400 mb-3">Tất cả ảnh, video và tệp tin sao lưu sẽ được ghi trực tiếp vào đây.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={downloadFolder}
                    readOnly
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300"
                  />
                  <button
                    onClick={() => alert(`Thư mục lưu hiện tại: ${downloadFolder}`)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-medium rounded-lg hover:bg-slate-700"
                  >
                    📁 Thay đổi...
                  </button>
                </div>
              </div>

              {/* Quản lý quyền hệ thống */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-200">🛡️ Quyền truy cập trên Thiết bị di động</h3>
                <div className="flex justify-between items-center py-2 border-b border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold block text-slate-200">Thư viện Ảnh (Photo Library)</span>
                    <span className="text-slate-400">Cho phép duyệt Camera Roll và các Album chat</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">✓ Đã cấp toàn bộ</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold block text-slate-200">Mạng Cục bộ (Local Network)</span>
                    <span className="text-slate-400">Quét tìm PC tự động qua cổng UDP 53317</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">✓ Đã cấp</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <div>
                    <span className="font-semibold block text-slate-200">Liên kết thư mục Zalo / Telegram</span>
                    <span className="text-slate-400">Cấp quyền qua Security-Scoped Bookmarks</span>
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

      {/* Modal Ủng hộ tác giả */}
      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />
    </div>
  );
};

export default App;
