import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Folder,
  FileText,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Video,
  Archive,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Search,
  HardDrive,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { FileItemInfo } from '../types';

interface DualPaneExplorerProps {
  onExportToPc: (files: FileItemInfo[], deleteFromPhoneAfter: boolean) => void;
  onImportToPhone: (files: FileItemInfo[]) => void;
  onDeletePhoneFiles: (files: FileItemInfo[]) => void;
  pcDirectory: string;
}

const INITIAL_PHONE_FILES: FileItemInfo[] = [
  {
    id: 'ph-doc-1',
    name: 'Hop_Dong_Nghiem_Thu_2026.pdf',
    path: '/Documents/Send2All/Hop_Dong_Nghiem_Thu_2026.pdf',
    size_bytes: 3_450_000,
    modified_at: '2026-11-14T09:30:00Z',
    is_dir: false,
    file_type: 'pdf',
  },
  {
    id: 'ph-doc-2',
    name: 'Ban_Ve_AutoCAD_Tang_3.dwg',
    path: '/Documents/Send2All/Ban_Ve_AutoCAD_Tang_3.dwg',
    size_bytes: 14_800_000,
    modified_at: '2026-11-14T08:15:00Z',
    is_dir: false,
    file_type: 'file',
  },
  {
    id: 'ph-doc-3',
    name: 'Bang_Ke_Khoi_Luong_Q4.xlsx',
    path: '/Documents/Send2All/Bang_Ke_Khoi_Luong_Q4.xlsx',
    size_bytes: 2_150_000,
    modified_at: '2026-11-13T16:20:00Z',
    is_dir: false,
    file_type: 'doc',
  },
  {
    id: 'ph-doc-4',
    name: 'Video_Khao_Sat_Cong_Trinh_4K.mov',
    path: '/Documents/Send2All/Video_Khao_Sat_Cong_Trinh_4K.mov',
    size_bytes: 125_400_000,
    modified_at: '2026-11-13T14:10:00Z',
    is_dir: false,
    file_type: 'video',
  },
  {
    id: 'ph-doc-5',
    name: 'IMG_2026_Cong_Trinh_Live.HEIC',
    path: '/Documents/Send2All/IMG_2026_Cong_Trinh_Live.HEIC',
    size_bytes: 4_200_000,
    modified_at: '2026-11-12T11:05:00Z',
    is_dir: false,
    file_type: 'image',
  },
  {
    id: 'ph-doc-6',
    name: 'Backup_Zalo_Chats_Nov.zip',
    path: '/Documents/Send2All/Backup_Zalo_Chats_Nov.zip',
    size_bytes: 340_000_000,
    modified_at: '2026-11-10T10:00:00Z',
    is_dir: false,
    file_type: 'archive',
  },
];

const INITIAL_PC_FILES: FileItemInfo[] = [
  {
    id: 'pc-file-1',
    name: 'Tai_Lieu_Thiet_Ke_Kien_Truc_V2.pdf',
    path: 'C:\\Users\\Admin\\Downloads\\Send2All\\Tai_Lieu_Thiet_Ke_Kien_Truc_V2.pdf',
    size_bytes: 8_200_000,
    modified_at: '2026-11-14T07:10:00Z',
    is_dir: false,
    file_type: 'pdf',
  },
  {
    id: 'pc-file-2',
    name: 'Phan_Mem_Du_Toan_Setup.exe',
    path: 'C:\\Users\\Admin\\Downloads\\Send2All\\Phan_Mem_Du_Toan_Setup.exe',
    size_bytes: 45_600_000,
    modified_at: '2026-11-13T11:45:00Z',
    is_dir: false,
    file_type: 'file',
  },
  {
    id: 'pc-file-3',
    name: 'Danh_Sach_Nhan_Su_2026.xlsx',
    path: 'C:\\Users\\Admin\\Downloads\\Send2All\\Danh_Sach_Nhan_Su_2026.xlsx',
    size_bytes: 1_450_000,
    modified_at: '2026-11-12T15:20:00Z',
    is_dir: false,
    file_type: 'doc',
  },
];

export const DualPaneExplorer: React.FC<DualPaneExplorerProps> = ({
  onExportToPc,
  onImportToPhone,
  onDeletePhoneFiles,
  pcDirectory,
}) => {
  const [phoneFiles, setPhoneFiles] = useState<FileItemInfo[]>(INITIAL_PHONE_FILES);
  const [pcFiles, setPcFiles] = useState<FileItemInfo[]>(INITIAL_PC_FILES);
  const [selectedPhoneIds, setSelectedPhoneIds] = useState<Set<string>>(new Set());
  const [selectedPcIds, setSelectedPcIds] = useState<Set<string>>(new Set());
  const [phoneFolder, setPhoneFolder] = useState<string>('/Documents/Send2All');
  const [deleteAfterExport, setDeleteAfterExport] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dragOverPane, setDragOverPane] = useState<'phone' | 'pc' | null>(null);

  // Toggle selection
  const toggleSelectPhone = (id: string) => {
    setSelectedPhoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPc = (id: string) => {
    setSelectedPcIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPhone = () => {
    if (selectedPhoneIds.size === phoneFiles.length) {
      setSelectedPhoneIds(new Set());
    } else {
      setSelectedPhoneIds(new Set(phoneFiles.map((f) => f.id)));
    }
  };

  const selectAllPc = () => {
    if (selectedPcIds.size === pcFiles.length) {
      setSelectedPcIds(new Set());
    } else {
      setSelectedPcIds(new Set(pcFiles.map((f) => f.id)));
    }
  };

  // Export from Phone to PC
  const handleExportSelected = () => {
    const toExport = phoneFiles.filter((f) => selectedPhoneIds.has(f.id));
    if (toExport.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tệp bên iPhone để sao chép sang PC!');
      return;
    }

    onExportToPc(toExport, deleteAfterExport);

    // Thêm các tệp này sang bên PC list
    const newPcEntries = toExport.map((f) => ({
      ...f,
      id: `pc-${Date.now()}-${f.name}`,
      path: `${pcDirectory}\\${f.name}`,
    }));
    setPcFiles((prev) => [...prev, ...newPcEntries]);

    if (deleteAfterExport) {
      setPhoneFiles((prev) => prev.filter((f) => !selectedPhoneIds.has(f.id)));
      setSelectedPhoneIds(new Set());
    }
  };

  // Import from PC to Phone
  const handleImportSelected = () => {
    const toImport = pcFiles.filter((f) => selectedPcIds.has(f.id));
    if (toImport.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tệp bên PC để nạp vào iPhone!');
      return;
    }

    onImportToPhone(toImport);

    // Thêm các tệp này sang Phone list
    const newPhoneEntries = toImport.map((f) => ({
      ...f,
      id: `ph-${Date.now()}-${f.name}`,
      path: `${phoneFolder}/${f.name}`,
    }));
    setPhoneFiles((prev) => [...prev, ...newPhoneEntries]);
  };

  // Xóa tệp trên Phone
  const handleDeleteSelectedPhone = () => {
    const toDelete = phoneFiles.filter((f) => selectedPhoneIds.has(f.id));
    if (toDelete.length === 0) return;

    if (confirm(`Bạn có chắc muốn xóa ${toDelete.length} tệp trên iPhone để giải phóng dung lượng?`)) {
      onDeletePhoneFiles(toDelete);
      setPhoneFiles((prev) => prev.filter((f) => !selectedPhoneIds.has(f.id)));
      setSelectedPhoneIds(new Set());
    }
  };

  // Drag and Drop handlers
  const handleDragStartFromPhone = (e: React.DragEvent, file: FileItemInfo) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'phone', file }));
  };

  const handleDragStartFromPc = (e: React.DragEvent, file: FileItemInfo) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'pc', file }));
  };

  const handleDropOnPc = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPane(null);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.source === 'phone') {
        const file = data.file as FileItemInfo;
        onExportToPc([file], deleteAfterExport);
        setPcFiles((prev) => [
          ...prev,
          {
            ...file,
            id: `pc-${Date.now()}-${file.name}`,
            path: `${pcDirectory}\\${file.name}`,
          },
        ]);
        if (deleteAfterExport) {
          setPhoneFiles((prev) => prev.filter((f) => f.id !== file.id));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDropOnPhone = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPane(null);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.source === 'pc') {
          const file = data.file as FileItemInfo;
          onImportToPhone([file]);
          setPhoneFiles((prev) => [
            ...prev,
            {
              ...file,
              id: `ph-${Date.now()}-${file.name}`,
              path: `${phoneFolder}/${file.name}`,
            },
          ]);
          return;
        }
      }

      // Xử lý kéo thả tệp từ ngoài Windows Explorer vào
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const newItems: FileItemInfo[] = droppedFiles.map((f) => ({
          id: `ph-drop-${Date.now()}-${f.name}`,
          name: f.name,
          path: `${phoneFolder}/${f.name}`,
          size_bytes: f.size,
          modified_at: new Date().toISOString(),
          is_dir: false,
          file_type: f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.xlsx') ? 'doc' : 'file',
        }));
        onImportToPhone(newItems);
        setPhoneFiles((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderFileIcon = (type: string, name: string) => {
    if (name.endsWith('.dwg') || name.endsWith('.dxf')) {
      return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    if (type === 'pdf') {
      return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    if (type === 'doc' || name.endsWith('.xlsx') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    if (type === 'image' || name.endsWith('.heic') || name.endsWith('.jpg') || name.endsWith('.png')) {
      return <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />;
    }
    if (type === 'video' || name.endsWith('.mov') || name.endsWith('.mp4')) {
      return <Video className="w-4 h-4 text-purple-500 shrink-0" />;
    }
    if (type === 'archive' || name.endsWith('.zip') || name.endsWith('.rar')) {
      return <Archive className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  const filteredPhone = phoneFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPc = pcFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header */}
      <header
        className="h-16 border-b px-6 flex items-center justify-between shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">Trình Quản Lý Song Hành 2 Chiều (PC ⇋ iPhone)</h1>
            <span className="text-[10px] bg-blue-500/15 text-blue-500 px-2 py-0.5 rounded-full font-bold">
              KÉO THẢ 2 CHIỀU
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Duyệt file song song, sao chép 2 chiều mượt mà và dọn dẹp trực tiếp trên điện thoại
          </p>
        </div>

        {/* Global Search & Action */}
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
              placeholder="Tìm kiếm tệp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-44 text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={deleteAfterExport}
              onChange={(e) => setDeleteAfterExport(e.target.checked)}
              className="rounded text-sky-500 focus:ring-0"
            />
            <span>Xóa trên Phone sau khi sao chép</span>
          </label>
        </div>
      </header>

      {/* Main Dual-Pane Body */}
      <div className="flex-1 p-5 overflow-hidden flex gap-4">
        {/* ================= PANE TRÁI: ĐIỆN THOẠI IPHONE ================= */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverPane('phone');
          }}
          onDragLeave={() => setDragOverPane(null)}
          onDrop={handleDropOnPhone}
          className={`flex-1 rounded-xl border flex flex-col overflow-hidden transition-all shadow-sm ${
            dragOverPane === 'phone' ? 'ring-2 ring-sky-500 border-sky-500' : ''
          }`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: dragOverPane === 'phone' ? 'var(--accent)' : 'var(--border-color)',
          }}
        >
          {/* Pane Header */}
          <div
            className="p-3 border-b flex items-center justify-between"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>BỘ NHỚ IPHONE</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-500 font-normal">
                    {phoneFiles.length} tệp
                  </span>
                </div>
                <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {phoneFolder}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={selectAllPhone}
                className="p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
                title="Chọn tất cả"
              >
                {selectedPhoneIds.size === phoneFiles.length && phoneFiles.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>{selectedPhoneIds.size > 0 ? `Đã chọn ${selectedPhoneIds.size}` : 'Chọn tất cả'}</span>
              </button>

              {selectedPhoneIds.size > 0 && (
                <button
                  onClick={handleDeleteSelectedPhone}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[11px] font-medium flex items-center gap-1 transition-all"
                  title="Xóa tệp đã chọn trên Phone"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ({selectedPhoneIds.size})</span>
                </button>
              )}
            </div>
          </div>

          {/* Phone Quick Folders Switcher */}
          <div
            className="px-3 py-1.5 border-b flex items-center gap-2 text-xs overflow-x-auto shrink-0"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            {[
              { path: '/Documents/Send2All', label: '📁 Send2All Docs' },
              { path: '/DCIM/100APPLE', label: '📸 Camera Roll' },
              { path: '/Zalo/Downloads', label: '💬 Zalo Saved' },
              { path: '/Telegram/Media', label: '✈️ Telegram Data' },
            ].map((f) => (
              <button
                key={f.path}
                onClick={() => setPhoneFolder(f.path)}
                className={`px-2.5 py-0.5 rounded text-[11px] border transition-all whitespace-nowrap ${
                  phoneFolder === f.path ? 'font-semibold' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: phoneFolder === f.path ? 'rgba(0, 113, 227, 0.12)' : 'var(--bg-card)',
                  color: phoneFolder === f.path ? 'var(--accent)' : 'var(--text-secondary)',
                  borderColor: phoneFolder === f.path ? 'var(--accent)' : 'var(--border-color)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Phone File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredPhone.map((file) => {
              const isSelected = selectedPhoneIds.has(file.id);
              return (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStartFromPhone(e, file)}
                  onClick={() => toggleSelectPhone(file.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-grab active:cursor-grabbing transition-all ${
                    isSelected ? 'ring-1 ring-sky-500' : 'hover:bg-slate-500/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'rgba(0, 113, 227, 0.08)' : 'var(--bg-card)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPhone(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded text-sky-500"
                    />
                    {renderFileIcon(file.file_type, file.name)}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {formatSize(file.size_bytes)} • {new Date(file.modified_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPhone.length === 0 && (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Không có tệp nào trong thư mục này.
              </div>
            )}
          </div>

          {/* Phone Footer drop hint */}
          <div
            className="p-2 border-t text-[11px] text-center"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            Thả tệp từ PC vào đây để nạp vào iPhone
          </div>
        </div>

        {/* ================= TRỤ ĐIỀU KHIỂN CHUYỂN TIẾP Ở GIỮA ================= */}
        <div className="w-16 flex flex-col items-center justify-center gap-3 shrink-0">
          <button
            onClick={handleExportSelected}
            className="w-11 h-11 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 transition-all hover:scale-110 active:scale-95"
            title="Sao chép các tệp đã chọn từ iPhone sang PC"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleImportSelected}
            className="w-11 h-11 rounded-full border bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            title="Nạp các tệp đã chọn từ PC vào iPhone"
          >
            <ArrowLeft className="w-5 h-5 text-sky-500" />
          </button>
        </div>

        {/* ================= PANE PHẢI: MÁY TÍNH PC WINDOWS ================= */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverPane('pc');
          }}
          onDragLeave={() => setDragOverPane(null)}
          onDrop={handleDropOnPc}
          className={`flex-1 rounded-xl border flex flex-col overflow-hidden transition-all shadow-sm ${
            dragOverPane === 'pc' ? 'ring-2 ring-sky-500 border-sky-500' : ''
          }`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: dragOverPane === 'pc' ? 'var(--accent)' : 'var(--border-color)',
          }}
        >
          {/* PC Header */}
          <div
            className="p-3 border-b flex items-center justify-between"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>MÁY TÍNH WINDOWS PC</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-normal">
                    {pcFiles.length} tệp
                  </span>
                </div>
                <div className="text-[11px] font-mono truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  {pcDirectory}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={selectAllPc}
                className="p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
                title="Chọn tất cả"
              >
                {selectedPcIds.size === pcFiles.length && pcFiles.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>{selectedPcIds.size > 0 ? `Đã chọn ${selectedPcIds.size}` : 'Chọn tất cả'}</span>
              </button>
            </div>
          </div>

          {/* PC Quick Path Bar */}
          <div
            className="px-3 py-1.5 border-b flex items-center justify-between text-xs shrink-0"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Vị trí lưu trên PC: <b>Downloads\Send2All</b>
              </span>
            </div>
            <button
              onClick={() => alert(`Mở thư mục trong File Explorer:\n${pcDirectory}`)}
              className="text-[11px] text-sky-500 hover:underline"
            >
              Mở trong Explorer
            </button>
          </div>

          {/* PC File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredPc.map((file) => {
              const isSelected = selectedPcIds.has(file.id);
              return (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStartFromPc(e, file)}
                  onClick={() => toggleSelectPc(file.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-grab active:cursor-grabbing transition-all ${
                    isSelected ? 'ring-1 ring-emerald-500' : 'hover:bg-slate-500/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                    borderColor: isSelected ? 'var(--success)' : 'var(--border-color)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPc(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded text-emerald-500"
                    />
                    {renderFileIcon(file.file_type, file.name)}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {formatSize(file.size_bytes)} • {new Date(file.modified_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPc.length === 0 && (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Chưa có tệp nào được xuất sang PC. Hãy kéo tệp từ iPhone sang đây!
              </div>
            )}
          </div>

          {/* PC Footer drop hint */}
          <div
            className="p-2 border-t text-[11px] text-center"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            Thả tệp từ iPhone vào đây để sao chép sang PC
          </div>
        </div>
      </div>
    </div>
  );
};
