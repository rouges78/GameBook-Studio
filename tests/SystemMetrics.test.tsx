import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemMetrics } from '../src/components/TelemetryDashboard/components/SystemMetrics';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>
}));

describe('SystemMetrics', () => {
  const mockData = {
    metrics: {
      performance: {
        avgResponseTime: 245.67,
        errorRate: 1.23,
        totalCrashes: 5
      },
      byPlatform: {
        'windows': 75,
        'mac': 20,
        'linux': 5
      },
      byVersion: {
        '1.0.0': 30,
        '1.1.0': 45,
        '1.2.0': 25
      },
      byArch: {
        'x64': 80,
        'arm64': 15,
        'ia32': 5
      }
    },
    isDarkMode: false
  };

  it('renders all main sections', () => {
    render(<SystemMetrics {...mockData} />);
    
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Platform Distribution')).toBeInTheDocument();
    expect(screen.getByText('Version Distribution')).toBeInTheDocument();
    expect(screen.getByText('Architecture Distribution')).toBeInTheDocument();
  });

  it('displays performance metrics with correct formatting', () => {
    render(<SystemMetrics {...mockData} />);
    
    expect(screen.getByText('245.67')).toBeInTheDocument();
    expect(screen.getByText('ms')).toBeInTheDocument();
    expect(screen.getByText('1.23')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders distribution charts', () => {
    render(<SystemMetrics {...mockData} />);
    
    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts).toHaveLength(2); // Platform and Version charts
  });

  it('displays architecture distribution with percentages', () => {
    render(<SystemMetrics {...mockData} />);
    
    // Check architecture names
    expect(screen.getByText('x64')).toBeInTheDocument();
    expect(screen.getByText('arm64')).toBeInTheDocument();
    expect(screen.getByText('ia32')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Check percentages
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByText('15.0%')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    const darkModeData = { ...mockData, isDarkMode: true };
    render(<SystemMetrics {...darkModeData} />);
    
    const sections = screen.getAllByRole('heading', { level: 2 })
      .map(heading => heading.parentElement);
    
    sections.forEach(section => {
      expect(section).toHaveClass('bg-gray-700');
    });

    // Check architecture cards
    const archCards = screen.getAllByText(/x64|arm64|ia32/).map(text => text.parentElement);
    archCards.forEach(card => {
      expect(card).toHaveClass('bg-gray-600');
    });
  });

  it('applies light mode styles when isDarkMode is false', () => {
    render(<SystemMetrics {...mockData} />);
    
    const sections = screen.getAllByRole('heading', { level: 2 })
      .map(heading => heading.parentElement);
    
    sections.forEach(section => {
      expect(section).toHaveClass('bg-gray-100');
    });

    // Check architecture cards
    const archCards = screen.getAllByText(/x64|arm64|ia32/).map(text => text.parentElement);
    archCards.forEach(card => {
      expect(card).toHaveClass('bg-gray-200');
    });
  });

  it('handles empty metrics data', () => {
    const emptyData = {
      metrics: {
        performance: {
          avgResponseTime: 0,
          errorRate: 0,
          totalCrashes: 0
        },
        byPlatform: {},
        byVersion: {},
        byArch: {}
      },
      isDarkMode: false
    };
    
    render(<SystemMetrics {...emptyData} />);
    
    expect(screen.getByText('0.00')).toBeInTheDocument(); // avgResponseTime
    expect(screen.getByText('0.00')).toBeInTheDocument(); // errorRate
    expect(screen.getByText('0')).toBeInTheDocument(); // totalCrashes
  });

  it('formats decimal numbers correctly', () => {
    const dataWithLongDecimals = {
      ...mockData,
      metrics: {
        ...mockData.metrics,
        performance: {
          avgResponseTime: 245.6789,
          errorRate: 1.2345,
          totalCrashes: 5
        }
      }
    };
    
    render(<SystemMetrics {...dataWithLongDecimals} />);
    
    expect(screen.getByText('245.68')).toBeInTheDocument(); // avgResponseTime rounded to 2 decimals
    expect(screen.getByText('1.23')).toBeInTheDocument(); // errorRate rounded to 2 decimals
  });
});
