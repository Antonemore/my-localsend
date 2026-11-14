import React from 'react';
import { DeviceInfo, NavTab } from '../types';
import { 
  Smartphone, 
  Image, 
  FolderTree, 
  ClipboardCopy, 
  Settings, 
  BatteryCharging, 
  Battery, 
  HardDrive,
  Wifi
} from 'lucide-react';

interface SidebarProps {
  device: DeviceInfo;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDonate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ device, activeTab, onSelectTab, onOpenDonate }) => {
  const usedStorageBytes = device.storage_total_bytes - device.storage_free_bytes;
  const usedStoragePercent = Math.round((usedStorageBytes / device.storage_total_bytes) * 100);
  const usedGB = (usedStorageBytes / (1024 ** 3)).toFixed(1);
  const totalGB = (device.storage_total_bytes / (1024 ** 3)).toFixed(0);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'photos', label: 'Photos & Videos', icon: <Image className="w-5 h-5" />, badge: device.photo_count },
    { id: 'files', label: 'Files Explorer', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'clipboard', label: 'Clipboard Sync', icon: <ClipboardCopy className="w-5 h-5" /> },
    { id: 'settings', label: 'Device Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Device Card (iMazing style) */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{device.device_name}</h2>
            <p className="text-xs text-slate-400">{device.model} • {device.os_version}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <Wifi className="w-3 h-3 animate-pulse" /> Wireless LAN
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicators: Battery & Storage */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          {/* Battery */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              {device.is_charging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              ) : (
                <Battery className="w-4 h-4 text-slate-300" />
              )}
              Battery
            </span>
            <span className="font-semibold text-white">
              {Math.round(device.battery_level * 100)}%
              {device.is_charging && <span className="text-[10px] text-emerald-400 ml-1">Charging</span>}
            </span>
          </div>

          {/* Storage Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-slate-300" /> Storage
              </span>
              <span className="text-slate-300 font-medium">
                {usedGB} GB / {totalGB} GB
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${usedStoragePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
          Content Management
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 shadow-sm border border-sky-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Donate Button */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenDonate}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500/15 to-amber-500/15 hover:from-rose-500/25 hover:to-amber-500/25 border border-rose-500/20 text-rose-300 text-xs font-semibold shadow-sm transition-all"
        >
          <span>☕ Mời tác giả cốc cà phê (Donate)</span>
        </button>
        <div className="text-center text-[11px] text-slate-500">
          Send2All Open Source • 100% Free
        </div>
      </div>
    </aside>
  );
};
