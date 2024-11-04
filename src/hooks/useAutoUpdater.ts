import { useState, useEffect, useCallback } from 'react';
import type { UpdateInfo, UpdateError } from '../components/UpdateNotification/types';
import { telemetry } from '../utils/telemetry';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useAutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>(undefined);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [error, setError] = useState<UpdateError | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Create callback functions
    const handleUpdateAvailable = (info: UpdateInfo) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
      setError(undefined);
      telemetry.trackEvent({
        category: 'auto-update',
        action: 'update-available',
        label: info.version,
        metadata: {
          version: info.version,
          releaseNotes: info.releaseNotes
        },
        timestamp: Date.now()
      });
    };

    const handleDownloadProgress = (progress: number) => {
      setDownloadProgress(progress);
      setIsDownloading(true);
      setError(undefined);
      if (progress === 100) {
        telemetry.trackEvent({
          category: 'auto-update',
          action: 'download-complete',
          value: progress,
          timestamp: Date.now()
        });
      }
    };

    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true);
      setIsDownloading(false);
      setError(undefined);
      telemetry.trackEvent({
        category: 'auto-update',
        action: 'update-downloaded',
        metadata: { version: updateInfo?.version },
        timestamp: Date.now()
      });
    };

    const handleError = (errorInfo: { message: string; code: string }) => {
      const updatedError = {
        ...errorInfo,
        retryCount,
      };
      setError(updatedError);
      setIsDownloading(false);
      telemetry.trackUpdateError(
        new Error(errorInfo.message),
        retryCount,
        MAX_RETRY_ATTEMPTS,
        RETRY_DELAY_MS
      );
    };

    // Register listeners
    window.electron.on('update-available', handleUpdateAvailable);
    window.electron.on('update-download-progress', handleDownloadProgress);
    window.electron.on('update-downloaded', handleUpdateDownloaded);
    window.electron.on('update-error', handleError);

    // Cleanup listeners
    return () => {
      window.electron.off('update-available', handleUpdateAvailable);
      window.electron.off('update-download-progress', handleDownloadProgress);
      window.electron.off('update-downloaded', handleUpdateDownloaded);
      window.electron.off('update-error', handleError);
    };
  }, [retryCount, updateInfo]);

  const startDownload = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(undefined);
      telemetry.trackEvent({
        category: 'auto-update',
        action: 'download-started',
        metadata: { version: updateInfo?.version },
        timestamp: Date.now()
      });
      await window.electron['update:start-download']();
    } catch (error) {
      console.error('Failed to start update download:', error);
      setIsDownloading(false);
      const updateError = {
        message: 'Failed to start update download',
        code: 'DOWNLOAD_FAILED',
        retryCount,
      };
      setError(updateError);
      telemetry.trackUpdateError(
        error instanceof Error ? error : new Error('Download failed'),
        retryCount,
        MAX_RETRY_ATTEMPTS,
        RETRY_DELAY_MS
      );
    }
  }, [retryCount, updateInfo]);

  const retryOperation = useCallback(async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      const maxRetryError = {
        message: 'Maximum retry attempts reached',
        code: 'MAX_RETRIES_EXCEEDED',
        retryCount,
      };
      setError(maxRetryError);
      telemetry.trackEvent({
        category: 'auto-update',
        action: 'max-retries-exceeded',
        metadata: {
          totalAttempts: retryCount,
          maxAttempts: MAX_RETRY_ATTEMPTS,
          operation: isDownloading ? 'download' : 'check'
        },
        timestamp: Date.now()
      });
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    telemetry.trackEvent({
      category: 'auto-update',
      action: 'retry-attempt',
      metadata: {
        attemptNumber: retryCount + 1,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        operation: isDownloading ? 'download' : 'check',
        delay: RETRY_DELAY_MS
      },
      timestamp: Date.now()
    });

    try {
      await delay(RETRY_DELAY_MS);
      
      if (isDownloading) {
        await startDownload();
      } else {
        await checkForUpdates();
      }
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, isDownloading]);

  const installUpdate = useCallback(() => {
    telemetry.trackEvent({
      category: 'auto-update',
      action: 'install-started',
      metadata: { version: updateInfo?.version },
      timestamp: Date.now()
    });
    window.electron['update:install']();
  }, [updateInfo]);

  const checkForUpdates = useCallback(async () => {
    try {
      setError(undefined);
      telemetry.trackEvent({
        category: 'auto-update',
        action: 'check-started',
        timestamp: Date.now()
      });
      await window.electron['update:check']();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      const updateError = {
        message: 'Failed to check for updates',
        code: 'CHECK_FAILED',
        retryCount,
      };
      setError(updateError);
      telemetry.trackUpdateError(
        error instanceof Error ? error : new Error('Check failed'),
        retryCount,
        MAX_RETRY_ATTEMPTS,
        RETRY_DELAY_MS
      );
    }
  }, [retryCount]);

  const dismissUpdate = useCallback(() => {
    telemetry.trackEvent({
      category: 'auto-update',
      action: 'update-dismissed',
      metadata: {
        version: updateInfo?.version,
        wasDownloading: isDownloading,
        wasDownloaded: updateDownloaded,
        hadError: !!error
      },
      timestamp: Date.now()
    });
    setUpdateAvailable(false);
    setUpdateInfo(undefined);
    setDownloadProgress(0);
    setIsDownloading(false);
    setUpdateDownloaded(false);
    setError(undefined);
    setRetryCount(0);
    setIsRetrying(false);
  }, [updateInfo, isDownloading, updateDownloaded, error]);

  return {
    updateAvailable,
    updateInfo,
    downloadProgress,
    isDownloading,
    updateDownloaded,
    error,
    isRetrying,
    startDownload,
    installUpdate,
    checkForUpdates,
    dismissUpdate,
    retryOperation,
  };
}
