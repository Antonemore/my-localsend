import React, { useState } from 'react';
import { ChatChannel, ChatMediaItem, ChatFileType } from '../types';
import {
  Users,
  User,
  Download,
  Search,
  HardDrive,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Calendar,
  FileCode,
  FileSpreadsheet,
  Video,
  Archive,
  Trash2,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';

interface ChatMediaManagerProps {
  onExportChannel: (channel: ChatChannel) => void;
  onExportChatFiles?: (files: ChatMediaItem[]) => void;
  onDeleteChatFiles?: (files: ChatMediaItem[]) => void;
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

const MOCK_CHANNEL_FILES: Record<string, ChatMediaItem[]> = {
  'zalo-group-01': [
    {
      id: 'z1-1',
      channel_id: 'zalo-group-01',
      name: 'Ban_Ve_AutoCAD_Ket_Cau_Tang_1.dwg',
      file_type: 'cad',
      size_bytes: 18_400_000,
      timestamp: '2026-11-14T09:42:00Z',
      date_group: 'Hôm nay (14/11/2026)',
      time_str: '09:42 SA',
      sender: 'KTS. Hoàng Nam',
    },
    {
      id: 'z1-2',
      channel_id: 'zalo-group-01',
      name: 'Bien_Ban_Nghiem_Thu_Mong.pdf',
      file_type: 'pdf',
      size_bytes: 3_800_000,
      timestamp: '2026-11-14T10:15:00Z',
      date_group: 'Hôm nay (14/11/2026)',
      time_str: '10:15 SA',
      sender: 'Kỹ sư Tuấn',
    },
    {
      id: 'z1-3',
      channel_id: 'zalo-group-01',
      name: 'IMG_Nghiem_Thu_Tru_Betong.HEIC',
      file_type: 'image',
      size_bytes: 4_500_000,
      timestamp: '2026-11-14T11:20:00Z',
      date_group: 'Hôm nay (14/11/2026)',
      time_str: '11:20 SA',
      sender: 'Kỹ sư Tuấn',
      is_live_photo: true,
    },
    {
      id: 'z1-4',
      channel_id: 'zalo-group-01',
      name: 'Video_Quay_Flycam_Toan_Canh.mov',
      file_type: 'video',
      size_bytes: 142_000_000,
      timestamp: '2026-11-13T15:30:00Z',
      date_group: 'Hôm qua (13/11/2026)',
      time_str: '15:30 CH',
      sender: 'Đội Khảo sát',
    },
    {
      id: 'z1-5',
      channel_id: 'zalo-group-01',
      name: 'Du_Toan_Vat_Tu_Thep_Q4.xlsx',
      file_type: 'excel',
      size_bytes: 2_600_000,
      timestamp: '2026-11-13T16:05:00Z',
      date_group: 'Hôm qua (13/11/2026)',
      time_str: '16:05 CH',
      sender: 'Phòng Dự toán',
    },
    {
      id: 'z1-6',
      channel_id: 'zalo-group-01',
      name: 'Hop_Dong_Thau_Phu_Dien_Nuoc.pdf',
      file_type: 'pdf',
      size_bytes: 5_200_000,
      timestamp: '2026-11-13T17:12:00Z',
      date_group: 'Hôm qua (13/11/2026)',
      time_str: '17:12 CH',
      sender: 'GĐ. Nguyễn Văn An',
    },
    {
      id: 'z1-7',
      channel_id: 'zalo-group-01',
      name: 'Ban_Ve_Cap_Thoat_Nuoc_MEP.dwg',
      file_type: 'cad',
      size_bytes: 24_600_000,
      timestamp: '2026-11-10T14:00:00Z',
      date_group: '10/11/2026 (Tuần trước)',
      time_str: '14:00 CH',
      sender: 'KTS. Lê Quang',
    },
    {
      id: 'z1-8',
      channel_id: 'zalo-group-01',
      name: 'Goi_Ho_So_Phap_Ly_Du_An.zip',
      file_type: 'archive',
      size_bytes: 228_000_000,
      timestamp: '2026-10-28T09:00:00Z',
      date_group: 'Tháng 10/2026',
      time_str: '09:00 SA',
      sender: 'Phòng Pháp chế',
    },
  ],
  'zalo-contact-02': [
    {
      id: 'z2-1',
      channel_id: 'zalo-contact-02',
      name: 'Hoa_Don_VAT_Thang_11.pdf',
      file_type: 'pdf',
      size_bytes: 1_200_000,
      timestamp: '2026-11-14T08:30:00Z',
      date_group: 'Hôm nay (14/11/2026)',
      time_str: '08:30 SA',
      sender: 'Chị Mai Kế Toán',
    },
    {
      id: 'z2-2',
      channel_id: 'zalo-contact-02',
      name: 'Sao_Ke_Ngan_Hang_BIDV_Q3.xlsx',
      file_type: 'excel',
      size_bytes: 4_300_000,
      timestamp: '2026-11-13T14:15:00Z',
      date_group: 'Hôm qua (13/11/2026)',
      time_str: '14:15 CH',
      sender: 'Chị Mai Kế Toán',
    },
    {
      id: 'z2-3',
      channel_id: 'zalo-contact-02',
      name: 'Hop_Dong_Thue_Van_Phong.pdf',
      file_type: 'pdf',
      size_bytes: 3_100_000,
      timestamp: '2026-10-25T11:00:00Z',
      date_group: 'Tháng 10/2026',
      time_str: '11:00 SA',
      sender: 'Chị Mai Kế Toán',
    },
  ],
  'tele-group-03': [
    {
      id: 't3-1',
      channel_id: 'tele-group-03',
      name: 'dump_database_prod_20261114.sql.gz',
      file_type: 'archive',
      size_bytes: 380_000_000,
      timestamp: '2026-11-14T03:00:00Z',
      date_group: 'Hôm nay (14/11/2026)',
      time_str: '03:00 SA',
      sender: 'Cron Backup Bot',
    },
    {
      id: 't3-2',
      channel_id: 'tele-group-03',
      name: 'server_access_log_error.log',
      file_type: 'pdf',
      size_bytes: 45_000_000,
      timestamp: '2026-11-13T22:15:00Z',
      date_group: 'Hôm qua (13/11/2026)',
      time_str: '22:15 CH',
      sender: 'SRE Lead Alex',
    },
    {
      id: 't3-3',
      channel_id: 'tele-group-03',
      name: 'video_tai_hien_bug_login_ios.mov',
      file_type: 'video',
      size_bytes: 85_000_000,
      timestamp: '2026-11-13T19:40:00Z',
      date_group: 'Hôm qua (13/11/2026)',
      time_str: '19:40 CH',
      sender: 'QA Tester Linh',
    },
  ],
};

export const ChatMediaManager: React.FC<ChatMediaManagerProps> = ({
  onExportChannel,
  onExportChatFiles,
  onDeleteChatFiles,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterApp, setFilterApp] = useState<'all' | 'zalo' | 'telegram' | 'whatsapp'>('all');

  // Filter cho màn hình drill-down chi tiết của nhóm
  const [fileSearch, setFileSearch] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<'all' | 'huge' | 'medium' | 'small'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Filter channels list
  const filteredChannels = MOCK_CHANNELS.filter((ch) => {
    const matchesSearch =
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterApp !== 'all' && ch.app !== filterApp) return false;
    return true;
  });

  // Current files in selected group
  const currentFiles: ChatMediaItem[] = selectedChannel
    ? MOCK_CHANNEL_FILES[selectedChannel.id] || []
    : [];

  // Filter files in group
  const filteredFiles = currentFiles.filter((item) => {
    if (fileSearch && !item.name.toLowerCase().includes(fileSearch.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && item.file_type !== filterType) {
      return false;
    }
    if (filterDate !== 'all' && !item.date_group.includes(filterDate)) {
      return false;
    }
    if (filterSize === 'huge' && item.size_bytes < 100 * 1024 * 1024) return false;
    if (
      filterSize === 'medium' &&
      (item.size_bytes < 20 * 1024 * 1024 || item.size_bytes >= 100 * 1024 * 1024)
    )
      return false;
    if (filterSize === 'small' && item.size_bytes >= 20 * 1024 * 1024) return false;
    return true;
  });

  // Group files by date_group
  const groupedByDate: Record<string, ChatMediaItem[]> = {};
  filteredFiles.forEach((file) => {
    if (!groupedByDate[file.date_group]) {
      groupedByDate[file.date_group] = [];
    }
    groupedByDate[file.date_group].push(file);
  });

  // Toggle selection
  const toggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllInDate = (date: string) => {
    const items = groupedByDate[date] || [];
    const allSelected = items.every((f) => selectedFileIds.has(f.id));
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      items.forEach((f) => {
        if (allSelected) next.delete(f.id);
        else next.add(f.id);
      });
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedFileIds.size === filteredFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const handleExportSelected = () => {
    const toExport = filteredFiles.filter((f) => selectedFileIds.has(f.id));
    if (toExport.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tệp để sao lưu về PC!');
      return;
    }
    if (onExportChatFiles) {
      onExportChatFiles(toExport);
    } else {
      alert(`Đang sao lưu ${toExport.length} tệp đã chọn về thư mục PC!`);
    }
  };

  const handleDeleteSelected = () => {
    const toDelete = filteredFiles.filter((f) => selectedFileIds.has(f.id));
    if (toDelete.length === 0) return;
    if (confirm(`Bạn có chắc muốn xóa ${toDelete.length} tệp trên điện thoại để giải phóng bộ nhớ?`)) {
      if (onDeleteChatFiles) {
        onDeleteChatFiles(toDelete);
      } else {
        alert(`Đã xóa ${toDelete.length} tệp trên điện thoại!`);
      }
      setSelectedFileIds(new Set());
    }
  };

  const renderTypeIcon = (type: ChatFileType) => {
    switch (type) {
      case 'cad':
        return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  // ================= RENDER DRILL-DOWN CHI TIẾT NHÓM THEO NGÀY =================
  if (selectedChannel) {
    return (
      <div
        className="flex-1 flex flex-col h-screen overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Drill-down Header */}
        <header
          className="h-16 border-b px-6 flex items-center justify-between shrink-0"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedChannel(null);
                setSelectedFileIds(new Set());
              }}
              className="p-2 rounded-lg border transition-all hover:bg-slate-500/10"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              title="Quay lại danh sách nhóm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight">{selectedChannel.name}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-semibold">
                  Phân bổ theo Ngày
                </span>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {selectedChannel.is_group
                  ? `Nhóm (${selectedChannel.member_count} thành viên)`
                  : 'Hội thoại trực tiếp'} • {filteredFiles.length} tệp hiển thị
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllFiltered}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              {selectedFileIds.size === filteredFiles.length && filteredFiles.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{selectedFileIds.size > 0 ? `Đã chọn ${selectedFileIds.size}` : 'Chọn tất cả'}</span>
            </button>

            {selectedFileIds.size > 0 && (
              <>
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sao lưu về PC ({selectedFileIds.size})</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa trên Phone</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Multi-tier Filter Bar (Phân tầng thời gian & dung lượng) */}
        <div
          className="p-3 border-b space-y-2 shrink-0 text-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Row 1: Search & Type */}
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-2 border rounded-lg px-2.5 py-1 text-xs flex-1 max-w-sm"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)',
              }}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên tệp (CAD, PDF, Excel)..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'Tất cả loại' },
                { id: 'cad', label: '📐 Bản vẽ CAD' },
                { id: 'excel', label: '📊 Excel' },
                { id: 'pdf', label: '📄 PDF' },
                { id: 'video', label: '🎬 Video' },
                { id: 'image', label: '🖼️ Ảnh / Live' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] border transition-all whitespace-nowrap ${
                    filterType === t.id ? 'font-semibold' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: filterType === t.id ? 'rgba(0, 113, 227, 0.12)' : 'var(--bg-sidebar)',
                    color: filterType === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                    borderColor: filterType === t.id ? 'var(--accent)' : 'var(--border-color)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Phân tầng theo Dung lượng & Thời gian */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {/* Phân tầng thời gian */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                Thời gian:
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Hôm nay', label: 'Hôm nay' },
                { id: 'Hôm qua', label: 'Hôm qua' },
                { id: '10/11/2026', label: 'Tuần trước' },
                { id: 'Tháng 10', label: 'Tháng 10/2026' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setFilterDate(d.id)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-all ${
                    filterDate === d.id ? 'font-semibold' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: filterDate === d.id ? 'rgba(0, 113, 227, 0.12)' : 'var(--bg-sidebar)',
                    color: filterDate === d.id ? 'var(--accent)' : 'var(--text-secondary)',
                    borderColor: filterDate === d.id ? 'var(--accent)' : 'var(--border-color)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Phân tầng dung lượng */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                Dung lượng:
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'huge', label: '🔥 >100MB' },
                { id: 'medium', label: '⚡ 20-100MB' },
                { id: 'small', label: '🌱 <20MB' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilterSize(s.id as any)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-all ${
                    filterSize === s.id ? 'font-semibold' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: filterSize === s.id ? 'rgba(0, 113, 227, 0.12)' : 'var(--bg-sidebar)',
                    color: filterSize === s.id ? 'var(--accent)' : 'var(--text-secondary)',
                    borderColor: filterSize === s.id ? 'var(--accent)' : 'var(--border-color)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline File List Grouped by Date */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {Object.entries(groupedByDate).map(([dateLabel, items]) => {
            const allDateSelected = items.every((f) => selectedFileIds.has(f.id));
            const totalDateSize = items.reduce((acc, cur) => acc + cur.size_bytes, 0);

            return (
              <div
                key={dateLabel}
                className="rounded-xl border overflow-hidden shadow-sm transition-all"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* Date Group Header */}
                <div
                  className="px-4 py-2.5 border-b flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelectAllInDate(dateLabel)}
                      className="flex items-center gap-2 text-xs font-bold hover:text-sky-500 transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {allDateSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span>{dateLabel}</span>
                    </button>

                    <span
                      className="text-[10px] px-2 py-0.2 rounded-full border font-mono"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {items.length} tệp • {formatSize(totalDateSize)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (onExportChatFiles) {
                        onExportChatFiles(items);
                      } else {
                        alert(`Đang sao lưu trọn gói ${items.length} tệp của ngày [${dateLabel}] về PC!`);
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] text-sky-500 hover:text-sky-400 font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải cả ngày này</span>
                  </button>
                </div>

                {/* Items in date */}
                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {items.map((file) => {
                    const isSelected = selectedFileIds.has(file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleSelectFile(file.id)}
                        className={`p-3.5 flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isSelected ? 'bg-sky-500/5' : 'hover:bg-slate-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectFile(file.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded text-sky-500"
                          />
                          {renderTypeIcon(file.file_type)}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{file.name}</span>
                              {file.is_live_photo && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] flex items-center gap-3 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              <span>Người gửi: <b>{file.sender}</b></span>
                              <span>•</span>
                              <span>Lúc: {file.time_str}</span>
                              <span>•</span>
                              <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                                {formatSize(file.size_bytes)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onExportChatFiles) {
                                onExportChatFiles([file]);
                              } else {
                                alert(`Đang sao lưu tệp [${file.name}] về PC!`);
                              }
                            }}
                            className="p-1.5 rounded-lg border hover:bg-sky-500 hover:text-white transition-all text-slate-400"
                            style={{
                              backgroundColor: 'var(--bg-sidebar)',
                              borderColor: 'var(--border-color)',
                            }}
                            title="Sao lưu tệp này về PC"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredFiles.length === 0 && (
            <div className="p-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Không tìm thấy tệp nào phù hợp với bộ lọc thời gian và dung lượng đã chọn.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= RENDER DANH SÁCH NHÓM CHAT (OVERVIEW) =================
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
            Tự động phân loại theo Nhóm chat và Đối tác • Bấm vào nhóm để xem timeline theo ngày
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
              className="bg-transparent border-none outline-none w-56 text-xs"
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
              filterApp === app ? 'font-semibold' : 'opacity-70 hover:opacity-100'
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
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => setSelectedChannel(channel)}
            className="p-4 rounded-xl border transition-all flex items-center justify-between gap-4 shadow-sm cursor-pointer hover:border-sky-500"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                  channel.app === 'zalo'
                    ? 'bg-blue-600/15 text-blue-500 border border-blue-500/30'
                    : channel.app === 'telegram'
                    ? 'bg-sky-500/15 text-sky-500 border border-sky-400/30'
                    : 'bg-emerald-600/15 text-emerald-500 border border-emerald-500/30'
                }`}
              >
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
                  <span className="text-[10px] text-sky-500 font-medium">Bấm để mở timeline ngày ➔</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {channel.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>{channel.photo_count} ảnh & video</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    <span>{channel.file_count} tệp tài liệu</span>
                  </span>
                  <span
                    className="flex items-center gap-1 font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{(channel.total_size_bytes / (1024 * 1024)).toFixed(0)} MB</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExportChannel(channel);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-sm transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Sao lưu về PC</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
