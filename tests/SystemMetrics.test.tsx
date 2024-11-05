import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemMetrics from '../src/components/TelemetryDashboard/components/SystemMetrics';

describe('SystemMetrics', () => {
  const arrayMetrics = [
    {
      title: 'Response Time',
      value: 250,
      change: 5,
      unit: 'ms'
    },
    {
      title: 'Error Rate',
      value: 1.5,
      change: -0.5,
      unit: '%'
    }
  ];

  const objectMetrics = {
    performance: {
      avgResponseTime: 250,
      errorRate: 1.5,
      totalCrashes: 10
    },
    byPlatform: {
      windows: 75,
      mac: 20,
      linux: 5
    }
  };

  it('renders loading skeleton when loading is true', () => {
    render(
      <SystemMetrics
        metrics={arrayMetrics}
        loading={true}
        isDarkMode={false}
      />
    );

    const skeleton = screen.getByRole('status');
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('renders array-based metrics correctly', () => {
    render(
      <SystemMetrics
        metrics={arrayMetrics}
        isDarkMode={false}
      />
    );

    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards).toHaveLength(arrayMetrics.length);

    arrayMetrics.forEach(metric => {
      expect(screen.getByText(metric.title)).toBeInTheDocument();
      expect(screen.getByText(metric.value.toString())).toBeInTheDocument();
      if (metric.unit) {
        expect(screen.getByText(metric.unit)).toBeInTheDocument();
      }
    });
  });

  it('renders object-based metrics correctly', () => {
    render(
      <SystemMetrics
        metrics={objectMetrics}
        isDarkMode={false}
      />
    );

    // Check performance metrics
    expect(screen.getByText('Average Response Time')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('1.5')).toBeInTheDocument();
    expect(screen.getByText('Total Crashes')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Check platform metrics
    expect(screen.getByText('Windows Usage')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('Mac Usage')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Linux Usage')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    render(
      <SystemMetrics
        metrics={arrayMetrics}
        isDarkMode={true}
      />
    );

    const metricCards = screen.getAllByTestId('metric-card');
    metricCards.forEach(card => {
      expect(card.className).toContain('dark:bg-gray-800');
      
      // Check title color
      const title = card.querySelector('h3');
      expect(title?.className).toContain('dark:text-gray-400');
      
      // Check value color
      const value = card.querySelector('p');
      expect(value?.className).toContain('dark:text-white');
    });
  });

  it('handles empty metrics object', () => {
    const emptyMetrics = {
      performance: {
        avgResponseTime: 0,
        errorRate: 0,
        totalCrashes: 0
      },
      byPlatform: {},
      byVersion: {},
      byArch: {}
    };

    render(
      <SystemMetrics
        metrics={emptyMetrics}
        isDarkMode={false}
      />
    );

    // Should still render performance metrics
    expect(screen.getByText('Average Response Time')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('Total Crashes')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-metrics';
    render(
      <SystemMetrics
        metrics={arrayMetrics}
        isDarkMode={false}
        className={customClass}
      />
    );

    const container = screen.getByRole('region');
    expect(container.className).toContain(customClass);
  });

  it('shows change indicators only when change is not zero', () => {
    const metricsWithZeroChange = [
      {
        title: 'Metric 1',
        value: 100,
        change: 0
      },
      {
        title: 'Metric 2',
        value: 200,
        change: 5
      }
    ];

    render(
      <SystemMetrics
        metrics={metricsWithZeroChange}
        isDarkMode={false}
      />
    );

    const arrows = screen.queryAllByRole('img', { hidden: true });
    expect(arrows).toHaveLength(1); // Only one metric has non-zero change
  });
});
