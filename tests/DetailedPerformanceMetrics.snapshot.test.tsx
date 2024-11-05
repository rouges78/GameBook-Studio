import React from 'react';
import { render } from '@testing-library/react';
import DetailedPerformanceMetrics from '../src/components/TelemetryDashboard/components/DetailedPerformanceMetrics';

// Mock Chart.js to prevent canvas errors
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

describe('DetailedPerformanceMetrics Snapshots', () => {
  const mockPerformanceData = {
    timestamp: Date.now(),
    responseTime: 150,
    cpuUsage: 45,
    memoryUsage: 1024,
    errorRate: 2.5,
    circuitBreakerState: 'CLOSED' as const
  };

  it('should match snapshot with default props', () => {
    const { container } = render(
      <DetailedPerformanceMetrics
        data={[mockPerformanceData]}
        isDarkMode={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot in dark mode', () => {
    const { container } = render(
      <DetailedPerformanceMetrics
        data={[mockPerformanceData]}
        isDarkMode={true}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with empty data', () => {
    const { container } = render(
      <DetailedPerformanceMetrics
        data={[]}
        isDarkMode={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with multiple data points', () => {
    const multipleDataPoints = Array(5).fill(null).map((_, index) => ({
      ...mockPerformanceData,
      timestamp: Date.now() + index * 300000, // 5-minute intervals
      responseTime: 150 + index * 10,
      cpuUsage: 45 + index * 5,
      memoryUsage: 1024 + index * 100,
      errorRate: 2.5 - index * 0.5,
      circuitBreakerState: index % 2 === 0 ? 'CLOSED' as const : 'HALF_OPEN' as const
    }));

    const { container } = render(
      <DetailedPerformanceMetrics
        data={multipleDataPoints}
        isDarkMode={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with circuit breaker states', () => {
    const dataWithDifferentStates = [
      { ...mockPerformanceData, circuitBreakerState: 'CLOSED' as const },
      { ...mockPerformanceData, circuitBreakerState: 'OPEN' as const, timestamp: Date.now() + 300000 },
      { ...mockPerformanceData, circuitBreakerState: 'HALF_OPEN' as const, timestamp: Date.now() + 600000 }
    ];

    const { container } = render(
      <DetailedPerformanceMetrics
        data={dataWithDifferentStates}
        isDarkMode={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with high error rates', () => {
    const dataWithHighErrors = [
      { ...mockPerformanceData, errorRate: 75.5 },
      { ...mockPerformanceData, errorRate: 85.0, timestamp: Date.now() + 300000 },
      { ...mockPerformanceData, errorRate: 95.5, timestamp: Date.now() + 600000 }
    ];

    const { container } = render(
      <DetailedPerformanceMetrics
        data={dataWithHighErrors}
        isDarkMode={false}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with high resource usage', () => {
    const dataWithHighUsage = [
      { ...mockPerformanceData, cpuUsage: 90, memoryUsage: 7168 },
      { ...mockPerformanceData, cpuUsage: 95, memoryUsage: 7680, timestamp: Date.now() + 300000 },
      { ...mockPerformanceData, cpuUsage: 98, memoryUsage: 8192, timestamp: Date.now() + 600000 }
    ];

    const { container } = render(
      <DetailedPerformanceMetrics
        data={dataWithHighUsage}
        isDarkMode={false}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
