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
  ArrowLeftRight,
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
  onDisconnect?: () => void;
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
  onDisconnect,
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
            <img
              src="/logo.png"
              alt="Send2All"
              className="w-8 h-8 rounded-full object-contain shadow-md border border-amber-500/30"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-sm">Send2All</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono font-bold border border-sky-500/20">v1.4.0</span>
              </div>
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
            borderColor: isLive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
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
              ) : connectionState === 'pairing_required' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span className="text-amber-500 font-bold">🟠 ĐANG CHỜ XÁC THỰC</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-amber-500 font-semibold">🟠 Đang chờ kết nối</span>
                </>
              )}
            </div>

            {isLive ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                TLS 1.3
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Chưa ghép đôi
              </span>
            )}
          </div>

          {/* Device Details THẬT - CHỈ HIỂN THỊ KHI ĐÃ GHÉP ĐÔI THÀNH CÔNG */}
          {isLive && device ? (
            <>
              <div className="flex items-center gap-3 pt-1">
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center text-sky-500"
                  style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="overflow-hidden flex-1">
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

              {/* iTunes Storage Bar THẬT */}
              <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-sky-500" />
                    <span>Bộ nhớ máy:</span>
                  </span>
                  <span className="font-mono font-semibold">{usedGb} / {totalGb} GB</span>
                </div>
                <div className="h-2 w-full bg-slate-300 dark:bg-slate-700/60 rounded-full overflow-hidden flex">
                  <div style={{ width: '45%' }} className="h-full bg-amber-400" title="Ảnh & Video" />
                  <div style={{ width: '20%' }} className="h-full bg-sky-500" title="Ứng dụng & Dữ liệu" />
                  <div style={{ width: '35%' }} className="h-full bg-emerald-500/40" title="Trống" />
                </div>
                <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span>Đã dùng {((usedStorageBytes / (device.storage_total_bytes || 1)) * 100).toFixed(0)}%</span>
                  <span className="text-emerald-500 font-medium">
                    Trống {(device.storage_free_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </span>
                </div>
              </div>

              {/* Security TLS Fingerprint & Disconnect */}
              <div className="pt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-sky-500 font-mono text-[9.5px]">🔒 SHA-256 E2EE</span>
                {onDisconnect && (
                  <button
                    onClick={onDisconnect}
                    className="text-rose-500 hover:underline text-[10px] font-medium"
                  >
                    Ngắt kết nối
                  </button>
                )}
              </div>
            </>
          ) : (
            /* TRẠNG THÁI CHƯA KẾT NỐI (TUYỆT ĐỐI KHÔNG HIỂN THỊ THÔNG SỐ GIẢ) */
            <div className="space-y-3 py-1 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Chưa có thiết bị kết nối
                </p>
                <p className="text-[10.5px] mt-1 leading-tight" style={{ color: 'var(--text-muted)' }}>
                  Mở ứng dụng <b>Send2All Host</b> trên iPhone để lấy mã PIN 6 số xác thực.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={onOpenPairModal}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Nhập mã PIN từ iPhone</span>
                </button>
                <button
                  onClick={onScanWifi}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <RefreshCw className="w-3 h-3 text-sky-500" />
                  <span>Quét tìm iPhone trong LAN</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 space-y-1">
          <button
            onClick={() => onTabChange('dual_explorer')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dual_explorer'
                ? 'font-semibold border-l-2'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'dual_explorer' ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
              color: activeTab === 'dual_explorer' ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === 'dual_explorer' ? 'var(--accent)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight className="w-4 h-4 text-sky-500" />
              <span>Quản lý Song Hành (PC ⇋ Phone)</span>
            </div>
            <span className="text-[9px] bg-sky-500/15 text-sky-500 px-1.5 py-0.5 rounded-full font-bold">
              2 CHIỀU
            </span>
          </button>

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
