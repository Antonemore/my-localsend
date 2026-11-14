import React, { useState } from 'react';
import { ChatChannel } from '../types';
import { Users, User, Download, Search, HardDrive, FileText, Image as ImageIcon } from 'lucide-react';

interface ChatMediaManagerProps {
  onExportChannel: (channel: ChatChannel) => void;
}

const MOCK_CHANNELS: ChatChannel[] = [
  {
    id: 'zalo-group-01',
    name: '[Zalo] Nhóm Dự Án & Thi Công 2026',
    app: 'zalo',
    is_group: true,
    member_count: 14,
    description: 'Bản vẽ CAD công trình, ảnh hiện trường nghiệm thu, báo cáo tiến độ tuần',
    photo_count: 186,
    file_count: 24,
    total_size_bytes: 428 * 1024 * 1024,
  },
  {
    id: 'zalo-contact-02',
    name: '[Zalo] Chị Mai - Kế Toán Trưởng',
    app: 'zalo',
    is_group: false,
    description: 'Hóa đơn điện tử VAT, bảng sao kê ngân hàng, hợp đồng thanh toán quyết toán',
    photo_count: 42,
    file_count: 32,
    total_size_bytes: 94 * 1024 * 1024,
  },
  {
    id: 'tele-group-03',
    name: '[Telegram] Team Kỹ Thuật & Dev Ops',
    app: 'telegram',
    is_group: true,
    member_count: 28,
    description: 'Tệp nhật ký log server, file sao lưu database .sql.gz, video quay bug',
    photo_count: 85,
    file_count: 310,
    total_size_bytes: 1250 * 1024 * 1024,
  },
  {
    id: 'zalo-group-04',
    name: '[Zalo] Ban Giám Đốc Điều Hành',
    app: 'zalo',
    is_group: true,
    member_count: 6,
    description: 'Chiến lược kinh doanh năm 2026, biên bản họp hội đồng, kế hoạch tài chính',
    photo_count: 35,
    file_count: 18,
    total_size_bytes: 65 * 1024 * 1024,
  },
  {
    id: 'wa-contact-05',
    name: '[WhatsApp] John Smith (Đối tác Quốc tế)',
    app: 'whatsapp',
    is_group: false,
    description: 'Catalog sản phẩm mẫu, hợp đồng ngoại thương tiếng Anh, hình ảnh container',
    photo_count: 64,
    file_count: 12,
    total_size_bytes: 110 * 1024 * 1024,
  },
];

export const ChatMediaManager: React.FC<ChatMediaManagerProps> = ({ onExportChannel }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterApp, setFilterApp] = useState<'all' | 'zalo' | 'telegram' | 'whatsapp'>('all');

  const filtered = MOCK_CHANNELS.filter((ch) => {
    const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterApp !== 'all' && ch.app !== filterApp) return false;
    return true;
  });

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
          <h1 className="text-base font-bold tracking-tight">Quản lý Dữ liệu Chat (Zalo / Telegram / WhatsApp)</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Tự động phân loại theo Nhóm chat và Đối tác - Không bị đổ đồng dữ liệu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 border rounded-lg px-3 py-1.5 text-xs"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên nhóm hoặc đối tác..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-52 text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </header>

      {/* Filter Chips */}
      <div
        className="h-11 border-b px-6 flex items-center gap-2 text-xs shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        {(['all', 'zalo', 'telegram', 'whatsapp'] as const).map((app) => (
          <button
            key={app}
            onClick={() => setFilterApp(app)}
            className={`px-3 py-1 rounded-full text-xs transition-all border ${
              filterApp === app
                ? 'font-semibold'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: filterApp === app ? 'rgba(0, 113, 227, 0.12)' : 'var(--bg-sidebar)',
              color: filterApp === app ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: filterApp === app ? 'var(--accent)' : 'var(--border-color)',
            }}
          >
            {app === 'all' && `Tất cả (${MOCK_CHANNELS.length})`}
            {app === 'zalo' && '💬 Zalo'}
            {app === 'telegram' && '✈️ Telegram'}
            {app === 'whatsapp' && '🟢 WhatsApp'}
          </button>
        ))}
      </div>

      {/* Channel Cards List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-3">
        {filtered.map((channel) => (
          <div
            key={channel.id}
            className="p-4 rounded-xl border transition-all flex items-center justify-between gap-4 shadow-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                channel.app === 'zalo' ? 'bg-blue-600/15 text-blue-500 border border-blue-500/30' :
                channel.app === 'telegram' ? 'bg-sky-500/15 text-sky-500 border border-sky-400/30' :
                'bg-emerald-600/15 text-emerald-500 border border-emerald-500/30'
              }`}>
                {channel.is_group ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{channel.name}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: 'var(--bg-sidebar)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {channel.is_group ? `Nhóm (${channel.member_count} thành viên)` : 'Đối tác riêng'}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{channel.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>{channel.photo_count} ảnh & video</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    <span>{channel.file_count} tệp tài liệu</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{(channel.total_size_bytes / (1024 * 1024)).toFixed(0)} MB</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onExportChannel(channel)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-sm transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Sao lưu về PC</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
