import React, { useState, useEffect } from 'react';
import { FileNode } from '../types';
import { Folder, File, UploadCloud, ChevronRight, Download, Trash2 } from 'lucide-react';

interface FileExplorerProps {
  rootNode: FileNode;
  onUploadFiles: (files: FileList | string[]) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ rootNode, onUploadFiles }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // Lắng nghe sự kiện kéo thả từ Windows Shell / Finder qua Tauri event emitter
    let unlisten: (() => void) | undefined;
    (async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        unlisten = await listen<string[]>('os-files-dropped', (event) => {
          if (event.payload && event.payload.length > 0) {
            onUploadFiles(event.payload);
          }
        });
      } catch (e) {
        // Fallback môi trường web dev
      }
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [onUploadFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="font-semibold text-white">iPhone Storage</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-sky-400 font-medium">Documents</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 cursor-pointer transition-all">
            <UploadCloud className="w-4 h-4" />
            <span>Upload from PC</span>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => e.target.files && onUploadFiles(e.target.files)} 
            />
          </label>
        </div>
      </header>

      {/* Drag & Drop Target Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 p-6 overflow-y-auto transition-colors ${
          isDragOver ? 'bg-sky-500/10 border-2 border-dashed border-sky-500' : ''
        }`}
      >
        {isDragOver && (
          <div className="h-full flex flex-col items-center justify-center pointer-events-none text-sky-400">
            <UploadCloud className="w-16 h-16 animate-bounce mb-3" />
            <p className="text-lg font-bold">Thả tệp vào đây để chuyển ngay sang iPhone</p>
            <p className="text-xs text-slate-400 mt-1">Hỗ trợ mọi định dạng tệp (PDF, ZIP, Video, Nhạc)</p>
          </div>
        )}

        {!isDragOver && (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 px-4 py-2 border-b border-slate-800 uppercase tracking-wider">
              <span className="col-span-6">Tên tệp</span>
              <span className="col-span-3">Ngày sửa đổi</span>
              <span className="col-span-2 text-right">Kích thước</span>
              <span className="col-span-1 text-center">Thao tác</span>
            </div>

            {rootNode.children?.map((item) => (
              <div
                key={item.path}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-slate-900/80 transition-colors text-sm border border-transparent hover:border-slate-800/60"
              >
                <div className="col-span-6 flex items-center gap-3">
                  {item.is_dir ? (
                    <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  ) : (
                    <File className="w-5 h-5 text-sky-400" />
                  )}
                  <span className="font-medium text-slate-200">{item.name}</span>
                </div>
                <span className="col-span-3 text-xs text-slate-400">
                  {new Date(item.modified_at).toLocaleDateString()}
                </span>
                <span className="col-span-2 text-xs font-mono text-slate-400 text-right">
                  {(item.size_bytes / (1024 * 1024)).toFixed(1)} MB
                </span>
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button className="text-slate-400 hover:text-sky-400 p-1">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
