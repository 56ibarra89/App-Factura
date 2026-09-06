import { apiClient } from "../../../shared/api";
import { accessTokenStore } from "../../../shared/api/accessTokenStore";

export type BackupType = 'AUTOMATIC' | 'MANUAL' | 'SHIFT_CLOSE' | 'SAFETY_SNAPSHOT';
export type BackupLocation = 'LOCAL' | 'CLOUD' | 'SYNCED';

export interface BackupItem {
  filename: string;
  sizeBytes: number;
  sizeMb: number;
  createdAt: string;
  type: BackupType;
  location: BackupLocation;
}

export interface BackupConfig {
  enabled: boolean;
  hour: number;
  minute: number;
  backupOnShiftClose: boolean;
  retentionDays: number;
}

export interface RestoreResult {
  success: boolean;
  safetySnapshot: string;
  restoredFrom: string;
  message: string;
}

export interface BackupGateway {
  list(): Promise<BackupItem[]>;
  generate(): Promise<BackupItem>;
  getConfig(): Promise<BackupConfig>;
  updateConfig(config: Partial<BackupConfig>): Promise<BackupConfig>;
  download(filename: string): Promise<void>;
  restore(filename: string): Promise<RestoreResult>;
  restoreFromFile(file: File): Promise<RestoreResult>;
  delete(filename: string): Promise<{ success: boolean; message: string }>;
}

export const backupGateway: BackupGateway = {
  async list(): Promise<BackupItem[]> {
    const data = await apiClient("/backups");
    return data || [];
  },

  async generate(): Promise<BackupItem> {
    return apiClient("/backups/generate", {
      method: "POST",
    });
  },

  async getConfig(): Promise<BackupConfig> {
    return apiClient("/backups/config");
  },

  async updateConfig(config: Partial<BackupConfig>): Promise<BackupConfig> {
    return apiClient("/backups/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  },

  async download(filename: string): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const token = accessTokenStore.get();
    const response = await fetch(
      `${baseUrl}/backups/${encodeURIComponent(filename)}/download`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo descargar el archivo de respaldo del servidor.");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    window.URL.revokeObjectURL(blobUrl);
  },

  async restore(filename: string): Promise<RestoreResult> {
    return apiClient("/backups/restore", {
      method: "POST",
      body: JSON.stringify({ filename }),
    });
  },

  async restoreFromFile(file: File): Promise<RestoreResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient("/backups/restore", {
      method: "POST",
      body: formData,
    });
  },

  async delete(filename: string): Promise<{ success: boolean; message: string }> {
    return apiClient(`/backups/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    });
  },
};
