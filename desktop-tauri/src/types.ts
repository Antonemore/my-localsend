export interface DeviceInfo {
  device_id: string;
  device_name: string;
  model: string;
  os_version: string;
  battery_level: number; // 0.0 to 1.0
  is_charging: boolean;
  storage_total_bytes: number;
  storage_free_bytes: number;
  photo_count: number;
  video_count: number;
  ip_address?: string;
  tls_fingerprint?: string;
}

export type ConnectionState = 'disconnected' | 'scanning' | 'pairing_required' | 'connected_live';

export interface PhotoItem {
  id: string;
  filename: string;
  media_type: 'image' | 'video';
  creation_date: string;
  width: number;
  height: number;
  duration_seconds?: number;
  file_size_bytes: number;
  is_favorite: boolean;
  is_live_photo?: boolean;
  thumbnail_url?: string;
  chat_source?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  app: 'zalo' | 'telegram' | 'whatsapp';
  is_group: boolean;
  member_count?: number;
  description: string;
  photo_count: number;
  file_count: number;
  total_size_bytes: number;
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  modified_at: string;
  children?: FileNode[];
}

export type NavTab = 'photos' | 'chats' | 'cleaner' | 'files' | 'clipboard' | 'settings';
export type ViewMode = 'grid-large' | 'grid-small' | 'view-detail';
export type AppTheme = 'itunes' | 'dark';
