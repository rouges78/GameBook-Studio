export interface UpdateInfo {
  version: string;
  releaseNotes?: string;
}

export interface UpdateError {
  message: string;
  code: string;
  retryCount: number;
}

export interface UpdateNotificationProps {
  updateAvailable: boolean;
  updateInfo?: UpdateInfo;
  downloadProgress?: number;
  isDownloading: boolean;
  error?: UpdateError;
  onStartDownload: () => void;
  onInstallUpdate: () => void;
  onDismiss: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}
