import React, { useState } from 'react';
import { Trash2, ShieldCheck, Film, Image as ImageIcon, Archive, Download } from 'lucide-react';

interface CleanerManagerProps {
  onCleanItem: (type: string, sizeBytes: number) => void;
}

export const CleanerManager: React.FC<CleanerManagerProps> = ({ onCleanItem }) => {
  const [cleanedTotal, setCleanedTotal] = useState<number>(0);

  const cleanups = [
    {
      id: 'large-videos',
      title: 'Video dung lượng lớn (> 100 MB)',
      desc: 'Các video quay 4K 60fps cũ đã xem lâu, chiếm phần lớn dung lượng bộ nhớ máy',
      size: '2.4 GB',
      sizeBytes: 2.4 * 1024 * 1024 * 1024,
      count: '8 video',
      icon: Film,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'screenshots',
      title: 'Ảnh chụp màn hình cũ (Screenshots)',
      desc: '142 ảnh chụp biên lai ngân hàng, mã OTP, tin nhắn tạm thời từ tháng trước',
      size: '450 MB',
      sizeBytes: 450 * 1024 * 1024,
      count: '142 ảnh',
      icon: ImageIcon,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'chat-cache',
      title: 'Tệp đệm ứng dụng Chat (Zalo / Telegram Cache)',
      desc: 'Các file tạm, video đã xem trong tin nhắn nhóm chat tự động lưu trong bộ nhớ máy',
      size: '950 MB',
      sizeBytes: 950 * 1024 * 1024,
      count: 'Hơn 500 file tạm',
      icon: Archive,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
  ];

  const handleClean = (item: typeof cleanups[0]) => {
    setCleanedTotal((prev) => prev + item.sizeBytes);
    onCleanItem(item.id, item.sizeBytes);
  };

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)',
      }}
    >
      <header
        className="h-16 border-b px-6 flex items-center justify-between shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div>
          <h1 className="text-base font-bold tracking-tight">Bộ Quản lý & Dọn dẹp Dung lượng (Device Cleaner)</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Quét tìm tệp nặng, video 4K cũ và bộ nhớ đệm để giải phóng dung lượng iPhone
          </p>
        </div>

        {cleanedTotal > 0 && (
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Đã giải phóng: {(cleanedTotal / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
          </div>
        )}
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {cleanups.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl border flex items-center justify-between gap-6 shadow-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{item.title}</span>
                    <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {item.size} ({item.count})
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleClean(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>Sao lưu về PC rồi Xóa</span>
                </button>

                <button
                  onClick={() => handleClean(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa giải phóng</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
