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
}

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
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  modified_at: string;
  children?: FileNode[];
}

export type NavTab = 'photos' | 'files' | 'clipboard' | 'backups' | 'settings';
