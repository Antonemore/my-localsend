import React from 'react';
import { DeviceInfo, NavTab, AppTheme, ConnectionState } from '../types';
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
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  device: DeviceInfo | null;
  connectionState: ConnectionState;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDonate: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onScanWifi: () => void;
  onOpenPairModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  device,
  connectionState,
  activeTab,
  onTabChange,
  onOpenDonate,
  theme,
  onThemeChange,
  onScanWifi,
  onOpenPairModal,
}) => {
  const isLive = connectionState === 'connected_live' && device !== null;
  const usedStorageBytes = device ? device.storage_total_bytes - device.storage_free_bytes : 0;
  const usedGb = (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGb = device ? (device.storage_total_bytes / (1024 * 1024 * 1024)).toFixed(0) : '0';

  return (
    <aside
      className="w-72 flex flex-col justify-between shrink-0 select-none border-r transition-colors"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Brand Header */}
      <div>
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
              2
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm">Send2All</span>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Apple Bridge Pro</p>
            </div>
          </div>

          {/* Theme switcher button */}
          <button
            onClick={() => onThemeChange(theme === 'itunes' ? 'dark' : 'itunes')}
            className="p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            title={theme === 'itunes' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang iTunes Sáng'}
          >
            {theme === 'itunes' ? <Moon className="w-3.5 h-3.5 text-amber-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="text-[10px]">{theme === 'itunes' ? 'Sáng' : 'Tối'}</span>
          </button>
        </div>

        {/* CONNECTION & SECURITY STATUS HERO CARD */}
        <div
          className="m-3 p-3.5 rounded-xl border space-y-2.5 transition-all shadow-sm"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: isLive ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
          }}
        >
          {/* Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {isLive ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span className="text-emerald-500 font-bold">🟢 KẾT NỐI TRỰC TIẾP (LIVE)</span>
                </>
              ) : connectionState === 'scanning' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span className="text-amber-500">Đang quét mạng Wi-Fi...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                  <span style={{ color: 'var(--text-muted)' }}>Chưa kết nối thiết bị</span>
                </>
              )}
            </div>

            {isLive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                TLS 1.3
              </span>
            )}
          </div>

          {/* Device Details */}
          {isLive && device ? (
            <>
              <div className="flex items-center gap-3 pt-1">
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center text-sky-500"
                  style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-xs font-bold truncate">{device.device_name}</h2>
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {device.model} • {device.os_version}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pin máy:</span>
                </span>
                <span className="font-semibold text-emerald-500 font-mono">
                  {Math.round(device.battery_level * 100)}% {device.is_charging && '⚡ Đang sạc'}
                </span>
              </div>

              {/* iTunes Multi-colored Storage Bar */}
              <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-sky-500" />
                    <span>Bộ nhớ máy:</span>
                  </span>
                  <span className="font-mono font-semibold">{usedGb} / {totalGb} GB</span>
                </div>
                <div className="h-2 w-full bg-slate-300 dark:bg-slate-700/60 rounded-full overflow-hidden flex">
                  <div style={{ width: '27%' }} className="h-full bg-amber-400" title="Ảnh: 68 GB" />
                  <div style={{ width: '18%' }} className="h-full bg-purple-500" title="Video: 45 GB" />
                  <div style={{ width: '10%' }} className="h-full bg-emerald-500" title="Ứng dụng: 25 GB" />
                  <div style={{ width: '7%' }}  className="h-full bg-sky-500" title="Tài liệu: 18 GB" />
                  <div style={{ width: '38%' }} className="h-full bg-slate-400/30" title="Trống: 98 GB" />
                </div>
                <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span>Đã dùng 62%</span>
                  <span className="text-emerald-500 font-medium">Trống 97.6 GB</span>
                </div>
              </div>

              {/* Security TLS Fingerprint */}
              {device.tls_fingerprint && (
                <div className="pt-1.5 border-t text-[9.5px] flex items-center justify-between" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-500" />
                    <span>Mã vân tay:</span>
                  </span>
                  <span className="font-mono text-sky-500 truncate max-w-[120px]">{device.tls_fingerprint}</span>
                </div>
              )}
            </>
          ) : (
            /* DISCONNECTED ACTIONS */
            <div className="space-y-2 py-1 text-center">
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Mở ứng dụng <b>Send2All</b> trên iPhone trong cùng mạng Wi-Fi để ghép đôi bảo mật.
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={onScanWifi}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-sm"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Quét Wi-Fi</span>
                </button>
                <button
                  onClick={onOpenPairModal}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nhập PIN</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 space-y-1">
          <button
            onClick={() => onTabChange('photos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'photos'
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'photos' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'photos' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'photos' ? 'var(--accent)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Image className="w-4 h-4" />
              <span>Ảnh & Video (Live Photo)</span>
            </div>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
            >
              {device ? device.photo_count : 0}
            </span>
          </button>

          <button
            onClick={() => onTabChange('chats')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chats'
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'chats' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'chats' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'chats' ? 'var(--accent)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Dữ liệu Chat (Zalo / Tele)</span>
            </div>
            <span className="text-[9px] bg-blue-500/15 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">
              MỚI
            </span>
          </button>

          <button
            onClick={() => onTabChange('files')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'files'
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'files' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'files' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'files' ? 'var(--accent)' : 'transparent',
            }}
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
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'cleaner' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'cleaner' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'cleaner' ? 'var(--accent)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Dọn dẹp Bộ nhớ (Cleaner)</span>
            </div>
            <span className="text-[10px] text-rose-500 font-semibold">3.8 GB</span>
          </button>

          <button
            onClick={() => onTabChange('clipboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'clipboard'
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'clipboard' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'clipboard' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'clipboard' ? 'var(--accent)' : 'transparent',
            }}
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
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'settings' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'settings' ? 'var(--accent)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4" />
              <span>Cài đặt & Quyền truy cập</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer & Donate */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onOpenDonate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-md shadow-rose-500/10 transition-all"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>Mời tác giả cốc cà phê (Donate)</span>
        </button>
        <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          Send2All Open Source • 100% Free
        </p>
      </div>
    </aside>
  );
};
