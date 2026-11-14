import React, { useState } from 'react';
import { PhotoItem, ViewMode } from '../types';
import { Download, CheckCircle2, Play, Search, LayoutGrid, Grid3X3, List, Aperture } from 'lucide-react';

interface PhotoGridProps {
  photos: PhotoItem[];
  onExportPhotos: (photoIds: string[], transcodeToJpg: boolean, includeLiveVideo: boolean) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onExportPhotos }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [transcodeJpg, setTranscodeJpg] = useState<boolean>(true);
  const [includeLiveVideo, setIncludeLiveVideo] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid-large');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredPhotos = photos.filter((p) => {
    const matchesSearch = p.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.chat_source && p.chat_source.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterType === 'video') return p.media_type === 'video';
    if (filterType === 'live') return p.is_live_photo;
    if (filterType === 'favorites') return p.is_favorite;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredPhotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPhotos.map((p) => p.id)));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 dark:bg-slate-950">
      {/* Top Action Bar */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold tracking-tight">Thư viện Ảnh & Video</h1>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700/60">
            {filteredPhotos.length} mục
          </span>
          {selectedIds.size > 0 && (
            <span className="text-xs text-sky-400 font-semibold">
              (Đã chọn {selectedIds.size})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên file, ngày..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-44"
            />
          </div>

          {/* View mode switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setViewMode('grid-large')}
              className={`p-1.5 rounded ${viewMode === 'grid-large' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Lưới lớn"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid-small')}
              className={`p-1.5 rounded ${viewMode === 'grid-small' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Lưới nhỏ"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('view-detail')}
              className={`p-1.5 rounded ${viewMode === 'view-detail' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Danh sách chi tiết"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={selectAll}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
          >
            {selectedIds.size === filteredPhotos.length ? 'Bỏ chọn' : 'Chọn hết'}
          </button>

          <button
            disabled={selectedIds.size === 0}
            onClick={() => onExportPhotos(Array.from(selectedIds), transcodeJpg, includeLiveVideo)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white shadow-md shadow-sky-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất về PC ({selectedIds.size})</span>
          </button>
        </div>
      </header>

      {/* Sub Bar: Filter chips & Live Photo options */}
      <div className="h-11 border-b border-slate-800/60 px-6 flex items-center justify-between bg-slate-900/30 text-xs shrink-0">
        <div className="flex items-center gap-2">
          {['all', 'live', 'video', 'favorites'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                filterType === type
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {type === 'all' && 'Tất cả'}
              {type === 'live' && '🔘 Live Photos'}
              {type === 'video' && '▶ Videos'}
              {type === 'favorites' && '⭐ Yêu thích'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={includeLiveVideo}
              onChange={(e) => setIncludeLiveVideo(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Live Photo: <b>Kèm Video MOV 3s</b></span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={transcodeJpg}
              onChange={(e) => setTranscodeJpg(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Đổi <b>HEIC ➔ JPG</b></span>
          </label>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {viewMode === 'view-detail' ? (
          /* DANH SÁCH CHI TIẾT (LIST DETAIL VIEW) */
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <span className="col-span-1">Chọn</span>
              <span className="col-span-5">Tên tệp</span>
              <span className="col-span-2">Định dạng</span>
              <span className="col-span-2">Dung lượng</span>
              <span className="col-span-2">Nguồn / Album</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {filteredPhotos.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`grid grid-cols-12 px-4 py-2.5 items-center text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-500/10 text-sky-300' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className="col-span-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded bg-slate-900 border-slate-700 text-sky-500"
                      />
                    </span>
                    <span className="col-span-5 font-medium flex items-center gap-2">
                      <img
                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&auto=format&fit=crop&q=80'}
                        alt={item.filename}
                        className="w-8 h-8 rounded object-cover border border-slate-700"
                      />
                      <span>{item.filename}</span>
                    </span>
                    <span className="col-span-2 flex items-center gap-1.5">
                      {item.is_live_photo && <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 font-semibold">LIVE</span>}
                      {item.media_type === 'video' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-semibold">VIDEO</span>}
                      <span className="text-slate-400">{item.filename.split('.').pop()?.toUpperCase()}</span>
                    </span>
                    <span className="col-span-2 text-slate-400 font-mono">
                      {(item.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <span className="col-span-2 text-slate-400">
                      {item.chat_source || 'Camera Roll'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LƯỚI ẢNH (LARGE & SMALL GRID) */
          <div className={viewMode === 'grid-large'
            ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3'
            : 'grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2'
          }>
            {filteredPhotos.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-500/30'
                      : 'border-transparent hover:border-slate-600 bg-slate-900'
                  }`}
                >
                  <img
                    src={item.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80'}
                    alt={item.filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Live Photo Badge */}
                  {item.is_live_photo && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-sky-600/80 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow">
                      <Aperture className="w-2.5 h-2.5" />
                      <span>LIVE</span>
                    </div>
                  )}

                  {/* Video Badge */}
                  {item.media_type === 'video' && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>{item.duration_seconds ? `${Math.round(item.duration_seconds)}s` : 'Video'}</span>
                    </div>
                  )}

                  {/* Time Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-1 py-0.5 rounded text-[9px] text-slate-300">
                    {item.filename}
                  </div>

                  {/* Selection Checkmark */}
                  <div className={`absolute top-2 right-2 transition-all ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-70 scale-90'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${
                      isSelected ? 'text-sky-500 fill-white' : 'text-slate-400'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
