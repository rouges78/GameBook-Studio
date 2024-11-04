import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UpdateNotification from '../src/components/UpdateNotification';
import type { UpdateNotificationProps } from '../src/components/UpdateNotification/types';

const defaultProps: UpdateNotificationProps = {
  updateAvailable: true,
  updateInfo: {
    version: '1.0.1',
    releaseNotes: 'Bug fixes and improvements',
  },
  downloadProgress: 0,
  isDownloading: false,
  onStartDownload: jest.fn(),
  onInstallUpdate: jest.fn(),
  onDismiss: jest.fn(),
};

describe('UpdateNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when update is not available', () => {
    const { container } = render(
      <UpdateNotification {...defaultProps} updateAvailable={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should display update information', () => {
    render(<UpdateNotification {...defaultProps} />);
    
    expect(screen.getByText('Update Available')).toBeInTheDocument();
    expect(screen.getByText('Version 1.0.1 is now available')).toBeInTheDocument();
    expect(screen.getByText('Bug fixes and improvements')).toBeInTheDocument();
  });

  it('should show download button when not downloading', () => {
    render(<UpdateNotification {...defaultProps} />);
    
    const downloadButton = screen.getByText('Download Update');
    expect(downloadButton).toBeInTheDocument();
    
    fireEvent.click(downloadButton);
    expect(defaultProps.onStartDownload).toHaveBeenCalled();
  });

  it('should show progress bar when downloading', () => {
    render(
      <UpdateNotification
        {...defaultProps}
        isDownloading={true}
        downloadProgress={45}
      />
    );
    
    expect(screen.getByText('Downloading Update')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should show install button when download is complete', () => {
    render(
      <UpdateNotification
        {...defaultProps}
        downloadProgress={100}
      />
    );
    
    const installButton = screen.getByText('Install & Restart');
    expect(installButton).toBeInTheDocument();
    
    fireEvent.click(installButton);
    expect(defaultProps.onInstallUpdate).toHaveBeenCalled();
  });

  it('should display error message and retry button', () => {
    const error = {
      message: 'Failed to download update',
      code: 'DOWNLOAD_ERROR',
      retryCount: 1,
    };
    
    const onRetry = jest.fn();
    
    render(
      <UpdateNotification
        {...defaultProps}
        error={error}
        onRetry={onRetry}
      />
    );
    
    expect(screen.getByText('Failed to download update (Attempt 1 of 3)')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should disable retry button when retrying', () => {
    const error = {
      message: 'Failed to download update',
      code: 'DOWNLOAD_ERROR',
      retryCount: 1,
    };
    
    render(
      <UpdateNotification
        {...defaultProps}
        error={error}
        isRetrying={true}
        onRetry={jest.fn()}
      />
    );
    
    const retryButton = screen.getByText('Retrying...');
    expect(retryButton).toBeDisabled();
  });

  it('should not show retry button after max attempts', () => {
    const error = {
      message: 'Failed to download update',
      code: 'MAX_RETRIES_EXCEEDED',
      retryCount: 3,
    };
    
    render(
      <UpdateNotification
        {...defaultProps}
        error={error}
        onRetry={jest.fn()}
      />
    );
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should allow dismissing the notification', () => {
    render(<UpdateNotification {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });
});
