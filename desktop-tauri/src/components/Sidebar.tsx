import React from 'react';
import { DeviceInfo, NavTab, AppTheme } from '../types';
import {
  Smartphone,
  BatteryCharging,
  HardDrive,
  Image,
  FolderOpen,
  ClipboardCopy,
  Settings,
  Heart,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  device: DeviceInfo;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDonate: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  device,
  activeTab,
  onTabChange,
  onOpenDonate,
  theme,
  onThemeChange,
}) => {
  const usedStorageBytes = device.storage_total_bytes - device.storage_free_bytes;
  const usedGb = (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGb = (device.storage_total_bytes / (1024 * 1024 * 1024)).toFixed(0);

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
              2
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm text-slate-100">Send2All</span>
              <p className="text-[10px] text-slate-400">Apple Bridge Pro</p>
            </div>
          </div>

          {/* Theme switcher button */}
          <button
            onClick={() => onThemeChange(theme === 'itunes' ? 'dark' : 'itunes')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
            title={theme === 'itunes' ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện iTunes Sáng'}
          >
            {theme === 'itunes' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Device Telemetry Card (iTunes Style) */}
        <div className="m-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-slate-200 truncate">{device.device_name}</h2>
              <p className="text-[10px] text-slate-400">{device.model} • {device.os_version}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-750">
            <span className="text-slate-400 flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pin:</span>
            </span>
            <span className="font-semibold text-emerald-400 font-mono">
              {Math.round(device.battery_level * 100)}% {device.is_charging && '⚡'}
            </span>
          </div>

          {/* iTunes Multi-colored Storage Bar */}
          <div className="space-y-1 pt-1 border-t border-slate-750">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-sky-400" />
                <span>Bộ nhớ:</span>
              </span>
              <span className="font-mono text-slate-200">{usedGb} / {totalGb} GB</span>
            </div>
            <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden flex">
              <div style={{ width: '27%' }} className="h-full bg-amber-400" title="Ảnh: 68 GB" />
              <div style={{ width: '18%' }} className="h-full bg-purple-500" title="Video: 45 GB" />
              <div style={{ width: '10%' }} className="h-full bg-emerald-500" title="Ứng dụng: 25 GB" />
              <div style={{ width: '7%' }}  className="h-full bg-sky-500" title="Tài liệu: 18 GB" />
              <div style={{ width: '38%' }} className="h-full bg-slate-600/40" title="Trống: 98 GB" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Đã dùng 62%</span>
              <span className="text-emerald-400 font-medium">Trống 97.6 GB</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 space-y-1">
          <button
            onClick={() => onTabChange('photos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Image className="w-4 h-4" />
              <span>Ảnh & Video (Live Photo)</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400">
              {device.photo_count}
            </span>
          </button>

          <button
            onClick={() => onTabChange('chats')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chats'
                ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Dữ liệu Chat (Zalo / Tele)</span>
            </div>
            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
              MỚI
            </span>
          </button>

          <button
            onClick={() => onTabChange('files')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'files'
                ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4" />
              <span>Tập tin (Documents)</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange('cleaner')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'cleaner'
                ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Dọn dẹp Bộ nhớ (Cleaner)</span>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold">3.8 GB</span>
          </button>

          <button
            onClick={() => onTabChange('clipboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'clipboard'
                ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ClipboardCopy className="w-4 h-4" />
              <span>Đồng bộ Clipboard</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4" />
              <span>Cài đặt & Quyền truy cập</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer & Donate */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onOpenDonate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-md shadow-rose-500/10 transition-all"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>Mời tác giả cốc cà phê (Donate)</span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">Send2All Open Source • 100% Free</p>
      </div>
    </aside>
  );
};
