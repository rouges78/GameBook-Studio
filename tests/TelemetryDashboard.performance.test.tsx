import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';
import { TelemetryDashboard } from '../src/components/TelemetryDashboard';
import type { TelemetryEvent } from '../src/types/electron';

// Mock window.electron
const mockGetData = jest.fn();
(window as any).electron = {
  'telemetry:getData': mockGetData,
};

// Helper to generate large test datasets
const generateTestData = (count: number): TelemetryEvent[] => {
  const events: TelemetryEvent[] = [];
  const categories = ['error', 'navigation', 'interaction', 'system'];
  const actions = ['click', 'view', 'error', 'crash'];
  const platforms = ['win32', 'darwin', 'linux'];
  const versions = ['1.0.0', '1.0.1', '1.1.0'];
  const architectures = ['x64', 'arm64'];

  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
    events.push({
      category: categories[Math.floor(Math.random() * categories.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      timestamp,
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      appVersion: versions[Math.floor(Math.random() * versions.length)],
      arch: architectures[Math.floor(Math.random() * architectures.length)],
      metadata: {
        responseTime: Math.floor(Math.random() * 1000),
        errorType: Math.random() > 0.5 ? 'network' : 'validation',
        severity: Math.floor(Math.random() * 5) + 1,
      },
    });
  }
  return events;
};

describe('TelemetryDashboard Performance Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should efficiently render with large datasets (1000 events)', async () => {
    const testData = generateTestData(1000);
    mockGetData.mockResolvedValue(testData);

    const startTime = performance.now();
    
    render(<TelemetryDashboard isDarkMode={false} />);
    
    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
  });

  it('should handle search filtering efficiently', async () => {
    const testData = generateTestData(1000);
    mockGetData.mockResolvedValue(testData);

    render(<TelemetryDashboard isDarkMode={false} />);
    
    await act(async () => {
      await Promise.resolve();
    });

    const searchInput = screen.getByPlaceholderText(/search by category/i);
    
    const startTime = performance.now();
    
    // Type search term
    fireEvent.change(searchInput, { target: { value: 'error' } });
    
    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const filterTime = performance.now() - startTime;
    expect(filterTime).toBeLessThan(100); // Filtering should take less than 100ms
  });

  it('should efficiently update date range filters', async () => {
    const testData = generateTestData(1000);
    mockGetData.mockResolvedValue(testData);

    render(<TelemetryDashboard isDarkMode={false} />);
    
    await act(async () => {
      await Promise.resolve();
    });

    const startTime = performance.now();
    
    // Find and update date inputs
    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    // Wait for updates to process
    await act(async () => {
      await Promise.resolve();
    });

    const filterTime = performance.now() - startTime;
    expect(filterTime).toBeLessThan(100); // Date filtering should take less than 100ms
  });

  it('should maintain performance with category filter changes', async () => {
    const testData = generateTestData(1000);
    mockGetData.mockResolvedValue(testData);

    render(<TelemetryDashboard isDarkMode={false} />);
    
    await act(async () => {
      await Promise.resolve();
    });

    const startTime = performance.now();
    
    // Toggle category filters
    const categoryCheckboxes = screen.getAllByRole('checkbox');
    categoryCheckboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });

    // Wait for updates to process
    await act(async () => {
      await Promise.resolve();
    });

    const filterTime = performance.now() - startTime;
    expect(filterTime).toBeLessThan(100); // Category filtering should take less than 100ms
  });

  it('should handle chart updates efficiently', async () => {
    const testData = generateTestData(2000); // Larger dataset for chart rendering
    mockGetData.mockResolvedValue(testData);

    render(<TelemetryDashboard isDarkMode={false} />);
    
    await act(async () => {
      await Promise.resolve();
    });

    const startTime = performance.now();
    
    // Trigger chart update by changing date range
    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    // Wait for chart to update
    await act(async () => {
      await Promise.resolve();
    });

    const updateTime = performance.now() - startTime;
    expect(updateTime).toBeLessThan(200); // Chart updates should take less than 200ms
  });

  it('should efficiently handle concurrent filter updates', async () => {
    const testData = generateTestData(1000);
    mockGetData.mockResolvedValue(testData);

    render(<TelemetryDashboard isDarkMode={false} />);
    
    await act(async () => {
      await Promise.resolve();
    });

    const startTime = performance.now();
    
    // Simultaneously update multiple filters
    const searchInput = screen.getByPlaceholderText(/search by category/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const categoryCheckboxes = screen.getAllByRole('checkbox');

    fireEvent.change(searchInput, { target: { value: 'error' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.click(categoryCheckboxes[0]);

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Wait for all updates to process
    await act(async () => {
      await Promise.resolve();
    });

    const updateTime = performance.now() - startTime;
    expect(updateTime).toBeLessThan(300); // Concurrent updates should take less than 300ms
  });
});
