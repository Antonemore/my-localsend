import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PhotoGrid } from './components/PhotoGrid';
import { FileExplorer } from './components/FileExplorer';
import { DonationModal } from './components/DonationModal';
import { DeviceInfo, NavTab, PhotoItem, FileNode } from './types';

// Mock Device Data cho prototype
const MOCK_DEVICE: DeviceInfo = {
  device_id: 'c1f7b5a8-3a9d-4e59-8802-998811223344',
  device_name: "Avison's iPhone 15 Pro",
  model: 'iPhone 15 Pro Max',
  os_version: 'iOS 18.2',
  battery_level: 0.85,
  is_charging: true,
  storage_total_bytes: 256 * 1024 * 1024 * 1024,
  storage_free_bytes: 142 * 1024 * 1024 * 1024,
  photo_count: 4820,
  video_count: 312,
};

const MOCK_PHOTOS: PhotoItem[] = Array.from({ length: 48 }, (_, i) => ({
  id: `ph-item-${i}`,
  filename: `IMG_${2024 + i}.${i % 6 === 0 ? 'MOV' : 'HEIC'}`,
  media_type: i % 6 === 0 ? 'video' : 'image',
  creation_date: new Date(Date.now() - i * 3600000 * 8).toISOString(),
  width: 4032,
  height: 3024,
  duration_seconds: i % 6 === 0 ? 34.5 : undefined,
  file_size_bytes: 2800000 + i * 150000,
  is_favorite: i % 4 === 0,
}));

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

  const handleExportPhotos = (photoIds: string[], transcodeToJpg: boolean) => {
    alert(`Đang xuất ${photoIds.length} tệp sang PC (Auto HEIC->JPG: ${transcodeToJpg ? 'Bật' : 'Tắt'})`);
  };

  const handleUploadFiles = async (files: FileList | string[]) => {
    try {
      if (Array.isArray(files)) {
        // Danh sách đường dẫn file thực từ sự kiện Windows Drag & Drop
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
    <div className="flex h-screen bg-slate-950 font-sans antialiased text-slate-100 overflow-hidden">
      {/* Cột trái: Sidebar điều khiển kiểu iMazing */}
      <Sidebar 
        device={MOCK_DEVICE} 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* Cột phải: Viewport hiển thị theo Tab */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'photos' && (
          <PhotoGrid 
            photos={MOCK_PHOTOS} 
            onExportPhotos={handleExportPhotos} 
          />
        )}

        {activeTab === 'files' && (
          <FileExplorer 
            rootNode={MOCK_FILES} 
            onUploadFiles={handleUploadFiles} 
          />
        )}

        {activeTab === 'clipboard' && (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Clipboard Live Sync - Đồng bộ khay nhớ tạm hai chiều tức thì
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Cài đặt mạng, bảo mật TLS & Chứng chỉ ghép đôi
          </div>
        )}
      </main>

      {/* Donation / Support Modal */}
      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />
    </div>
  );
};

export default App;
