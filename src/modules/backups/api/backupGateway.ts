import { apiClient } from "../../../shared/api";

export interface BackupOptions {
  config: boolean;
  menu: boolean;
  history: boolean;
}

export interface BackupGateway {
  export(options: BackupOptions): Promise<void>;
  import(file: File): Promise<void>;
}

export const backupGateway: BackupGateway = {
  async export(options) {
    await apiClient("/backups/export", {
      method: "POST",
      body: JSON.stringify(options),
    });
  },

  async import(file) {
    const formData = new FormData();
    formData.append("backup", file);
    await apiClient("/backups/import", {
      method: "POST",
      body: formData,
    });
  },
};
