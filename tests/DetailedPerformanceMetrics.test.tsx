import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DetailedPerformanceMetrics } from '../src/components/TelemetryDashboard/components/DetailedPerformanceMetrics';
import { Line } from 'react-chartjs-2';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(() => null)
}));

// Mock heroicons
jest.mock('@heroicons/react/24/solid', () => ({
  ArrowTrendingUpIcon: () => <div data-testid="trend-up-icon" />,
  ArrowTrendingDownIcon: () => <div data-testid="trend-down-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />
}));

type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface PerformanceData {
  timestamp: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  circuitBreakerState: CircuitBreakerState;
}

describe('DetailedPerformanceMetrics', () => {
  const mockData: PerformanceData[] = [
    {
      timestamp: 1699200000000, // 2023-11-05T12:00:00
      responseTime: 100,
      cpuUsage: 50,
      memoryUsage: 60,
      errorRate: 1,
      circuitBreakerState: 'CLOSED'
    },
    {
      timestamp: 1699200060000, // 2023-11-05T12:01:00
      responseTime: 150,
      cpuUsage: 55,
      memoryUsage: 65,
      errorRate: 2,
      circuitBreakerState: 'CLOSED'
    },
    {
      timestamp: 1699200120000, // 2023-11-05T12:02:00
      responseTime: 200,
      cpuUsage: 60,
      memoryUsage: 70,
      errorRate: 3,
      circuitBreakerState: 'CLOSED'
    }
  ];

  beforeEach(() => {
    (Line as jest.Mock).mockClear();
  });

  it('renders without crashing', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={false} />);
    expect(screen.getByText('Detailed Performance Metrics')).toBeInTheDocument();
  });

  it('displays circuit breaker status correctly', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={false} />);
    expect(screen.getByText('Circuit Breaker Status: CLOSED')).toBeInTheDocument();
    expect(screen.getByText('System is operating normally')).toBeInTheDocument();
  });

  it('displays all metric cards', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={false} />);
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
  });

  it('shows trend indicators for increasing metrics', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={false} />);
    const trendUpIcons = screen.getAllByTestId('trend-up-icon');
    expect(trendUpIcons.length).toBeGreaterThan(0);
  });

  it('calculates and displays predictions', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={false} />);
    const predictions = screen.getAllByText(/Predicted:/);
    expect(predictions.length).toBe(4); // One for each metric
  });

  it('applies dark mode styles when enabled', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={true} />);
    expect(screen.getByText('Detailed Performance Metrics').parentElement)
      .toHaveClass('bg-gray-800');
  });

  it('handles empty data gracefully', () => {
    render(<DetailedPerformanceMetrics data={[]} isDarkMode={false} />);
    expect(screen.getByText('Detailed Performance Metrics')).toBeInTheDocument();
  });

  it('shows warning icon for critical metrics', () => {
    const criticalData: PerformanceData[] = [{
      timestamp: 1699200000000,
      responseTime: 1500, // Above threshold (1000ms)
      cpuUsage: 95, // Above threshold (90%)
      memoryUsage: 90, // Above threshold (85%)
      errorRate: 6, // Above threshold (5%)
      circuitBreakerState: 'CLOSED'
    }];
    
    render(<DetailedPerformanceMetrics data={criticalData} isDarkMode={false} />);
    const warningIcons = screen.getAllByTestId('warning-icon');
    expect(warningIcons.length).toBe(4); // One for each critical metric
  });

  it('passes correct data to Line chart', () => {
    render(<DetailedPerformanceMetrics data={mockData} isDarkMode={false} />);
    
    const lastChartCall = (Line as jest.Mock).mock.lastCall[0];
    expect(lastChartCall.data.datasets).toHaveLength(4);
    expect(lastChartCall.data.datasets[0].label).toBe('Response Time (ms)');
    expect(lastChartCall.data.datasets[1].label).toBe('CPU Usage (%)');
    expect(lastChartCall.data.datasets[2].label).toBe('Memory Usage (%)');
    expect(lastChartCall.data.datasets[3].label).toBe('Error Rate (%)');
  });

  describe('Circuit Breaker States', () => {
    it('shows correct status for OPEN state', () => {
      const openData: PerformanceData[] = [{
        ...mockData[0],
        circuitBreakerState: 'OPEN'
      }];
      
      render(<DetailedPerformanceMetrics data={openData} isDarkMode={false} />);
      expect(screen.getByText('Circuit Breaker Status: OPEN')).toBeInTheDocument();
      expect(screen.getByText('System is preventing cascading failures')).toBeInTheDocument();
    });

    it('shows correct status for HALF_OPEN state', () => {
      const halfOpenData: PerformanceData[] = [{
        ...mockData[0],
        circuitBreakerState: 'HALF_OPEN'
      }];
      
      render(<DetailedPerformanceMetrics data={halfOpenData} isDarkMode={false} />);
      expect(screen.getByText('Circuit Breaker Status: HALF_OPEN')).toBeInTheDocument();
      expect(screen.getByText('System is testing recovery')).toBeInTheDocument();
    });
  });

  describe('Metric Status Colors', () => {
    it('applies correct color classes based on metric status', () => {
      const mixedData: PerformanceData[] = [{
        timestamp: 1699200000000,
        responseTime: 500, // Healthy
        cpuUsage: 75, // Warning
        memoryUsage: 90, // Critical
        errorRate: 1, // Healthy
        circuitBreakerState: 'CLOSED'
      }];

      render(<DetailedPerformanceMetrics data={mixedData} isDarkMode={false} />);
      
      // Find metric values by their container classes
      const metrics = screen.getAllByText(/\d+\.\d/);
      
      // Response Time and Error Rate should be green (healthy)
      expect(metrics[0].className).toContain('text-green-500');
      expect(metrics[3].className).toContain('text-green-500');
      
      // CPU Usage should be yellow (warning)
      expect(metrics[1].className).toContain('text-yellow-500');
      
      // Memory Usage should be red (critical)
      expect(metrics[2].className).toContain('text-red-500');
    });
  });
});
