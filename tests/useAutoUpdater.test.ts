import { renderHook, act } from '@testing-library/react';
import { useAutoUpdater } from '../src/hooks/useAutoUpdater';
import { telemetry } from '../src/utils/telemetry';

// Mock telemetry
jest.mock('../src/utils/telemetry', () => ({
  telemetry: {
    trackEvent: jest.fn(),
    trackUpdateError: jest.fn(),
  },
}));

// Mock electron API
const mockElectron = {
  on: jest.fn(),
  off: jest.fn(),
  'update:start-download': jest.fn(),
  'update:install': jest.fn(),
  'update:check': jest.fn(),
};

// Mock window.electron
(global as any).window = {
  electron: mockElectron,
};

describe('useAutoUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAutoUpdater());

    expect(result.current.updateAvailable).toBe(false);
    expect(result.current.updateInfo).toBeUndefined();
    expect(result.current.downloadProgress).toBe(0);
    expect(result.current.isDownloading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isRetrying).toBe(false);
  });

  it('should handle update available event and track telemetry', () => {
    const { result } = renderHook(() => useAutoUpdater());
    const updateInfo = { version: '1.0.1', releaseNotes: 'Bug fixes' };

    act(() => {
      const handleUpdateAvailable = mockElectron.on.mock.calls.find(
        call => call[0] === 'update-available'
      )[1];
      handleUpdateAvailable(updateInfo);
    });

    expect(result.current.updateAvailable).toBe(true);
    expect(result.current.updateInfo).toEqual(updateInfo);
    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'update-available',
      label: '1.0.1',
      metadata: updateInfo
    }));
  });

  it('should handle download progress and track completion', () => {
    const { result } = renderHook(() => useAutoUpdater());

    act(() => {
      const handleProgress = mockElectron.on.mock.calls.find(
        call => call[0] === 'update-download-progress'
      )[1];
      handleProgress(100);
    });

    expect(result.current.downloadProgress).toBe(100);
    expect(result.current.isDownloading).toBe(true);
    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'download-complete',
      value: 100
    }));
  });

  it('should handle update downloaded and track telemetry', () => {
    const { result } = renderHook(() => useAutoUpdater());
    const updateInfo = { version: '1.0.1', releaseNotes: 'Bug fixes' };

    act(() => {
      const handleUpdateAvailable = mockElectron.on.mock.calls.find(
        call => call[0] === 'update-available'
      )[1];
      handleUpdateAvailable(updateInfo);
    });

    act(() => {
      const handleDownloaded = mockElectron.on.mock.calls.find(
        call => call[0] === 'update-downloaded'
      )[1];
      handleDownloaded();
    });

    expect(result.current.updateDownloaded).toBe(true);
    expect(result.current.isDownloading).toBe(false);
    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'update-downloaded',
      metadata: { version: '1.0.1' }
    }));
  });

  it('should handle retry mechanism and track errors', async () => {
    const error = new Error('Network error');
    mockElectron['update:start-download'].mockRejectedValueOnce(error);
    const { result } = renderHook(() => useAutoUpdater());

    await act(async () => {
      await result.current.startDownload();
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Failed to start update download');
    expect(telemetry.trackUpdateError).toHaveBeenCalledWith(
      expect.any(Error),
      0,
      3,
      2000
    );

    // Retry the operation
    mockElectron['update:start-download'].mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.retryOperation();
    });

    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'retry-attempt',
      metadata: expect.objectContaining({
        attemptNumber: 1,
        maxAttempts: 3
      })
    }));
  });

  it('should limit retry attempts and track max retries', async () => {
    mockElectron['update:start-download'].mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAutoUpdater());

    // Attempt multiple retries
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        await result.current.retryOperation();
      });
    }

    expect(result.current.error?.code).toBe('MAX_RETRIES_EXCEEDED');
    expect(result.current.error?.retryCount).toBe(3);
    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'max-retries-exceeded',
      metadata: expect.objectContaining({
        totalAttempts: 3,
        maxAttempts: 3
      })
    }));
  });

  it('should track update dismissal', () => {
    const { result } = renderHook(() => useAutoUpdater());
    const updateInfo = { version: '1.0.1', releaseNotes: 'Bug fixes' };

    act(() => {
      const handleUpdateAvailable = mockElectron.on.mock.calls.find(
        call => call[0] === 'update-available'
      )[1];
      handleUpdateAvailable(updateInfo);
    });

    act(() => {
      result.current.dismissUpdate();
    });

    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'update-dismissed',
      metadata: expect.objectContaining({
        version: '1.0.1',
        wasDownloading: false,
        wasDownloaded: false,
        hadError: false
      })
    }));
  });

  it('should track update installation', () => {
    const { result } = renderHook(() => useAutoUpdater());
    const updateInfo = { version: '1.0.1', releaseNotes: 'Bug fixes' };

    act(() => {
      const handleUpdateAvailable = mockElectron.on.mock.calls.find(
        call => call[0] === 'update-available'
      )[1];
      handleUpdateAvailable(updateInfo);
    });

    act(() => {
      result.current.installUpdate();
    });

    expect(telemetry.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'auto-update',
      action: 'install-started',
      metadata: { version: '1.0.1' }
    }));
    expect(mockElectron['update:install']).toHaveBeenCalled();
  });

  it('should clean up listeners on unmount', () => {
    const { unmount } = renderHook(() => useAutoUpdater());
    unmount();

    expect(mockElectron.off).toHaveBeenCalledWith('update-available', expect.any(Function));
    expect(mockElectron.off).toHaveBeenCalledWith('update-download-progress', expect.any(Function));
    expect(mockElectron.off).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
    expect(mockElectron.off).toHaveBeenCalledWith('update-error', expect.any(Function));
  });
});
