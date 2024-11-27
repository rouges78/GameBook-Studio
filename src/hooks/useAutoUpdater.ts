import { useState, useEffect, useCallback } from 'react';
import type { UpdateInfo, UpdateError } from '../components/UpdateNotification/types';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isElectron = !!(window as any).electron;

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
    if (!isElectron) return;

    // Create callback functions
    const handleUpdateAvailable = (info: UpdateInfo) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
      setError(undefined);
    };

    const handleDownloadProgress = (progress: number) => {
      setDownloadProgress(progress);
      setIsDownloading(true);
      setError(undefined);
    };

    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true);
      setIsDownloading(false);
      setError(undefined);
    };

    const handleError = (errorInfo: { message: string; code: string }) => {
      const updatedError = {
        ...errorInfo,
        retryCount,
      };
      setError(updatedError);
      setIsDownloading(false);
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
    if (!isElectron) return;

    try {
      setIsDownloading(true);
      setError(undefined);
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
    }
  }, [retryCount]);

  const retryOperation = useCallback(async () => {
    if (!isElectron) return;

    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      const maxRetryError = {
        message: 'Maximum retry attempts reached',
        code: 'MAX_RETRIES_EXCEEDED',
        retryCount,
      };
      setError(maxRetryError);
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

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
    if (!isElectron) return;
    window.electron['update:install']();
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (!isElectron) return;

    try {
      setError(undefined);
      await window.electron['update:check']();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      const updateError = {
        message: 'Failed to check for updates',
        code: 'CHECK_FAILED',
        retryCount,
      };
      setError(updateError);
    }
  }, [retryCount]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    setUpdateInfo(undefined);
    setDownloadProgress(0);
    setIsDownloading(false);
    setUpdateDownloaded(false);
    setError(undefined);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

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
