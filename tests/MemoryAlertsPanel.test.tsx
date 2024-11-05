import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryAlertsPanel } from '../src/components/TelemetryDashboard/components/MemoryAlertsPanel';
import { useMemoryAlerts } from '../src/components/TelemetryDashboard/hooks/useMemoryAlerts';
import { MemoryAlertLevel } from '../src/components/TelemetryDashboard/utils/memoryAlertManager';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
    defaults: {},
    prototype: {}
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn()
}));

// Mock react-chartjs-2 Line component
jest.mock('react-chartjs-2', () => ({
  Line: () => null
}));

// Mock the useMemoryAlerts hook
jest.mock('../src/components/TelemetryDashboard/hooks/useMemoryAlerts');

describe('MemoryAlertsPanel', () => {
  const mockAlerts = [
    {
      level: MemoryAlertLevel.WARNING,
      timestamp: Date.now(),
      message: 'Memory usage is approaching critical levels',
      memoryUsage: 160 * 1024 * 1024 // 160MB
    },
    {
      level: MemoryAlertLevel.NORMAL,
      timestamp: Date.now() - 1000,
      message: 'Memory usage is normal',
      memoryUsage: 100 * 1024 * 1024 // 100MB
    }
  ];

  beforeEach(() => {
    // Reset mock before each test
    (useMemoryAlerts as jest.Mock).mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without alerts', () => {
    (useMemoryAlerts as jest.Mock).mockReturnValue({
      alerts: [],
      currentMemoryStatus: MemoryAlertLevel.NORMAL,
      clearAlertHistory: jest.fn()
    });

    render(<MemoryAlertsPanel />);
    expect(screen.getByText('No memory alerts')).toBeInTheDocument();
  });

  it('renders alerts correctly', () => {
    (useMemoryAlerts as jest.Mock).mockReturnValue({
      alerts: mockAlerts,
      currentMemoryStatus: MemoryAlertLevel.WARNING,
      clearAlertHistory: jest.fn()
    });

    render(<MemoryAlertsPanel />);
    
    // Check if alerts are rendered
    expect(screen.getByText('Memory usage is approaching critical levels')).toBeInTheDocument();
    expect(screen.getByText('Memory usage is normal')).toBeInTheDocument();
    
    // Check if memory usage is formatted correctly
    expect(screen.getByText('Memory Usage: 160.00 MB')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage: 100.00 MB')).toBeInTheDocument();
  });

  it('shows trend analysis when there are enough data points', async () => {
    const baseTime = Date.now();
    // Create alerts in ascending order to show an increasing trend
    const mockAlertsWithTrend = Array.from({ length: 5 }, (_, i) => ({
      level: MemoryAlertLevel.WARNING,
      timestamp: baseTime + i * 1000, // Timestamps in ascending order
      message: 'Warning alert',
      memoryUsage: (160 + i * 20) * 1024 * 1024 // Memory usage increases by 20MB each time
    }));

    // Mock the useMemoryAlerts hook with initial alerts
    (useMemoryAlerts as jest.Mock).mockReturnValue({
      alerts: mockAlertsWithTrend,
      currentMemoryStatus: MemoryAlertLevel.WARNING,
      clearAlertHistory: jest.fn()
    });

    // Render and wait for initial state updates
    const { rerender } = render(<MemoryAlertsPanel />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Add more alerts one by one to trigger useEffect
    for (let i = 0; i < 5; i++) {
      const newAlerts = [
        {
          level: MemoryAlertLevel.WARNING,
          timestamp: baseTime + (i + 5) * 1000,
          message: 'Warning alert',
          memoryUsage: (260 + i * 20) * 1024 * 1024
        },
        ...mockAlertsWithTrend
      ];

      await act(async () => {
        (useMemoryAlerts as jest.Mock).mockReturnValue({
          alerts: newAlerts,
          currentMemoryStatus: MemoryAlertLevel.WARNING,
          clearAlertHistory: jest.fn()
        });
        rerender(<MemoryAlertsPanel />);
        jest.advanceTimersByTime(1000);
      });
    }

    // Wait for the trend analysis button to appear
    await waitFor(() => {
      const button = screen.queryByTestId('trend-analysis-button');
      if (!button) {
        throw new Error('Button not found');
      }
      return button;
    }, { timeout: 3000 });

    // Find and click the trend analysis button
    const trendButton = screen.getByTestId('trend-analysis-button');
    await act(async () => {
      fireEvent.click(trendButton);
      jest.advanceTimersByTime(1000);
    });
    
    // Check if trend information is displayed
    expect(screen.getByText(/increasing/)).toBeInTheDocument();
  });

  it('clears alert history when clear button is clicked', async () => {
    const clearAlertHistory = jest.fn();
    (useMemoryAlerts as jest.Mock).mockReturnValue({
      alerts: mockAlerts,
      currentMemoryStatus: MemoryAlertLevel.WARNING,
      clearAlertHistory
    });

    await act(async () => {
      render(<MemoryAlertsPanel />);
      jest.advanceTimersByTime(1000);
    });
    
    // Click clear button
    const clearButton = screen.getByRole('button', { name: /Clear Alert History/i });
    await act(async () => {
      fireEvent.click(clearButton);
      jest.advanceTimersByTime(1000);
    });
    
    // Check if clearAlertHistory was called
    expect(clearAlertHistory).toHaveBeenCalled();
  });

  it('updates chart when new alerts arrive', async () => {
    // Initial render with some alerts
    (useMemoryAlerts as jest.Mock).mockReturnValue({
      alerts: mockAlerts,
      currentMemoryStatus: MemoryAlertLevel.WARNING,
      clearAlertHistory: jest.fn()
    });

    const { rerender } = render(<MemoryAlertsPanel />);

    // Update with new alert
    const newAlerts = [
      {
        level: MemoryAlertLevel.CRITICAL,
        timestamp: Date.now() + 1000,
        message: 'Critical memory usage',
        memoryUsage: 250 * 1024 * 1024
      },
      ...mockAlerts
    ];

    await act(async () => {
      (useMemoryAlerts as jest.Mock).mockReturnValue({
        alerts: newAlerts,
        currentMemoryStatus: MemoryAlertLevel.CRITICAL,
        clearAlertHistory: jest.fn()
      });

      rerender(<MemoryAlertsPanel />);
      jest.advanceTimersByTime(1000);
    });

    // Check if new alert is rendered
    expect(screen.getByText('Critical memory usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage: 250.00 MB')).toBeInTheDocument();
  });
});
