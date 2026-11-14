import React, { useState } from 'react';
import { PhotoItem } from '../types';
import { Download, RefreshCw, CheckCircle2, Play, SlidersHorizontal } from 'lucide-react';

interface PhotoGridProps {
  photos: PhotoItem[];
  onExportPhotos: (photoIds: string[], transcodeToJpg: boolean) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onExportPhotos }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [transcodeJpg, setTranscodeJpg] = useState<boolean>(true);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p.id)));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Action Bar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">Camera Roll & Media</h1>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            {photos.length} items
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* HEIC to JPG Transcode Toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={transcodeJpg}
              onChange={(e) => setTranscodeJpg(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Auto convert HEIC to JPG</span>
          </label>

          <button
            onClick={selectAll}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
          >
            {selectedIds.size === photos.length ? 'Deselect All' : 'Select All'}
          </button>

          <button
            disabled={selectedIds.size === 0}
            onClick={() => onExportPhotos(Array.from(selectedIds), transcodeJpg)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export to PC ({selectedIds.size})</span>
          </button>
        </div>
      </header>

      {/* Main Virtualized Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {photos.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                draggable
                onDragStart={async (e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'copy';
                  // Kích hoạt Native Drag-out sang Windows Explorer qua Tauri Command
                  try {
                    const { invoke } = await import('@tauri-apps/api/core');
                    await invoke('prepare_file_for_drag', {
                      photoId: item.id,
                      filename: item.filename,
                    });
                  } catch (err) {
                    console.log('Drag-out bridge triggered:', err);
                  }
                }}
                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-500/30'
                    : 'border-transparent hover:border-slate-600 bg-slate-900'
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <span className="text-[11px] font-mono text-slate-400">{item.filename}</span>
                </div>

                {/* Video Badge */}
                {item.media_type === 'video' && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>{item.duration_seconds ? `${Math.round(item.duration_seconds)}s` : 'Video'}</span>
                  </div>
                )}

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
      </div>
    </div>
  );
};
