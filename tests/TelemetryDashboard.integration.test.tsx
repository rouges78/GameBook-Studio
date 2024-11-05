import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelemetryDashboard } from '../src/components/TelemetryDashboard';
import type { TelemetryEvent } from '../src/types/electron';

// Mock telemetry data
const mockTelemetryData: TelemetryEvent[] = [
  {
    timestamp: new Date('2024-01-01').getTime(),
    category: 'auto-update',
    action: 'check',
    platform: 'win32',
    arch: 'x64',
    appVersion: '1.0.0',
    metadata: { responseTime: 100 }
  },
  {
    timestamp: new Date('2024-01-01').getTime(),
    category: 'error',
    action: 'error',
    platform: 'win32',
    arch: 'x64',
    appVersion: '1.0.0',
    metadata: { type: 'crash', errorType: 'uncaught', severity: 3 }
  },
  {
    timestamp: new Date('2024-01-02').getTime(),
    category: 'system',
    action: 'startup',
    platform: 'win32',
    arch: 'x64',
    appVersion: '1.0.0',
    metadata: { responseTime: 150 }
  }
];

// Mock window.electron
const mockGetData = jest.fn().mockResolvedValue(mockTelemetryData);
Object.defineProperty(window, 'electron', {
  value: {
    'telemetry:getData': mockGetData
  }
});

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = jest.fn();
URL.revokeObjectURL = jest.fn();

describe('TelemetryDashboard Integration', () => {
  beforeEach(() => {
    mockGetData.mockClear();
    (URL.createObjectURL as jest.Mock).mockClear();
    (URL.revokeObjectURL as jest.Mock).mockClear();
  });

  it('loads and displays telemetry data correctly', async () => {
    render(<TelemetryDashboard isDarkMode={false} />);

    // Check loading state
    expect(screen.getByText('Loading telemetry data...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Verify telemetry data is displayed
    expect(screen.getByText('Total Events: 3')).toBeInTheDocument();
    expect(screen.getByText(/Time Range:/)).toBeInTheDocument();
  });

  it('filters data by date range correctly', async () => {
    render(<TelemetryDashboard isDarkMode={false} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Find date inputs
    const startDateInput = screen.getByLabelText(/Start Date/i);
    const endDateInput = screen.getByLabelText(/End Date/i);

    // Change date range
    await act(async () => {
      fireEvent.change(startDateInput, { target: { value: '2024-01-02' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-02' } });
    });

    // Verify filtered data
    await waitFor(() => {
      expect(screen.getByText('Total Events: 1')).toBeInTheDocument();
    });
  });

  it('filters data by category correctly', async () => {
    render(<TelemetryDashboard isDarkMode={false} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Find and click category filter
    const systemFilter = screen.getByRole('checkbox', { name: /system/i });
    fireEvent.click(systemFilter);

    // Verify filtered data
    await waitFor(() => {
      expect(screen.getByText('Total Events: 2')).toBeInTheDocument();
    });
  });

  it('searches data correctly', async () => {
    render(<TelemetryDashboard isDarkMode={false} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Find search input
    const searchInput = screen.getByPlaceholderText(/Search by category/i);

    // Search for 'crash'
    await act(async () => {
      await userEvent.type(searchInput, 'crash');
    });

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Total Events: 1')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('exports data correctly', async () => {
    render(<TelemetryDashboard isDarkMode={false} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Mock document.createElement
    const mockLink = {
      click: jest.fn(),
      href: '',
      download: ''
    };
    const originalCreateElement = document.createElement;
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') return mockLink as any;
      return originalCreateElement.call(document, tagName);
    });

    // Click export button
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    // Verify export functionality
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toMatch(/telemetry_export_.*\.csv/);

    // Restore original createElement
    (document.createElement as jest.Mock).mockRestore();
  });

  it('handles errors gracefully', async () => {
    // Mock API error
    mockGetData.mockRejectedValueOnce(new Error('API Error'));

    render(<TelemetryDashboard isDarkMode={false} />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });

  it('updates system metrics when filters change', async () => {
    render(<TelemetryDashboard isDarkMode={false} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Initial metrics should include all platforms
    expect(screen.getByText(/win32/i)).toBeInTheDocument();

    // Filter by date to exclude some data
    const startDateInput = screen.getByLabelText(/Start Date/i);
    await act(async () => {
      fireEvent.change(startDateInput, { target: { value: '2024-01-02' } });
    });

    // Verify metrics update
    await waitFor(() => {
      const metricsText = screen.getByText(/Performance Metrics/i).parentElement?.textContent;
      expect(metricsText).toContain('150'); // Average response time from the single event
    });
  });

  it('handles dark mode correctly', async () => {
    render(<TelemetryDashboard isDarkMode={true} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    // Check for dark mode classes
    const dashboard = screen.getByText('Telemetry Dashboard').closest('div');
    expect(dashboard).toHaveClass('bg-gray-800');
  });
});
