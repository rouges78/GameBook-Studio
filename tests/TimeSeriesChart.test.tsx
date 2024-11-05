import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimeSeriesChart } from '../src/components/TelemetryDashboard/components/TimeSeriesChart';
import { CHART_COLORS } from '../src/components/TelemetryDashboard/types';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid={`line-${dataKey}`} data-stroke={stroke}>Line</div>
  ),
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>
}));

describe('TimeSeriesChart', () => {
  const mockData = [
    {
      date: '2024-01-01',
      total: 25,
      'auto-update': 10,
      'system': 5,
      'user-interaction': 8,
      'error': 2
    },
    {
      date: '2024-01-02',
      total: 26,
      'auto-update': 12,
      'system': 6,
      'user-interaction': 7,
      'error': 1
    }
  ];

  const mockCategories = {
    'auto-update': true,
    'system': true,
    'user-interaction': false,
    'error': true
  };

  const defaultProps = {
    data: mockData,
    categories: mockCategories,
    isDarkMode: false
  };

  it('renders the chart container', () => {
    render(<TimeSeriesChart {...defaultProps} />);
    
    expect(screen.getByText('Events Over Time')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders only enabled category lines', () => {
    render(<TimeSeriesChart {...defaultProps} />);
    
    // Should render lines for enabled categories
    expect(screen.getByTestId('line-auto-update')).toBeInTheDocument();
    expect(screen.getByTestId('line-system')).toBeInTheDocument();
    expect(screen.getByTestId('line-error')).toBeInTheDocument();
    
    // Should not render line for disabled category
    expect(screen.queryByTestId('line-user-interaction')).not.toBeInTheDocument();
  });

  it('applies correct colors to category lines', () => {
    render(<TimeSeriesChart {...defaultProps} />);
    
    Object.entries(mockCategories)
      .filter(([_, isEnabled]) => isEnabled)
      .forEach(([category]) => {
        const line = screen.getByTestId(`line-${category}`);
        expect(line).toHaveAttribute(
          'data-stroke',
          CHART_COLORS[category as keyof typeof CHART_COLORS] || '#999999'
        );
      });
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    const darkModeProps = { ...defaultProps, isDarkMode: true };
    render(<TimeSeriesChart {...darkModeProps} />);
    
    const container = screen.getByText('Events Over Time').parentElement;
    expect(container).toHaveClass('bg-gray-700');
  });

  it('applies light mode styles when isDarkMode is false', () => {
    render(<TimeSeriesChart {...defaultProps} />);
    
    const container = screen.getByText('Events Over Time').parentElement;
    expect(container).toHaveClass('bg-gray-100');
  });

  it('displays help text', () => {
    render(<TimeSeriesChart {...defaultProps} />);
    
    expect(screen.getByText('Click legend items to toggle visibility')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    const emptyDataProps = {
      ...defaultProps,
      data: []
    };
    
    render(<TimeSeriesChart {...emptyDataProps} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('handles empty categories object', () => {
    const emptyCategoriesProps = {
      ...defaultProps,
      categories: {}
    };
    
    render(<TimeSeriesChart {...emptyCategoriesProps} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders chart with single data point', () => {
    const singleDataProps = {
      ...defaultProps,
      data: [{
        date: '2024-01-01',
        total: 17,
        'auto-update': 10,
        'system': 5,
        'error': 2
      }]
    };
    
    render(<TimeSeriesChart {...singleDataProps} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-auto-update')).toBeInTheDocument();
    expect(screen.getByTestId('line-system')).toBeInTheDocument();
    expect(screen.getByTestId('line-error')).toBeInTheDocument();
  });

  it('handles undefined category values in data', () => {
    const incompleteDataProps = {
      ...defaultProps,
      data: [{
        date: '2024-01-01',
        total: 12,
        'auto-update': 10,
        // system is undefined
        'error': 2
      }]
    };
    
    render(<TimeSeriesChart {...incompleteDataProps} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-auto-update')).toBeInTheDocument();
    expect(screen.getByTestId('line-error')).toBeInTheDocument();
  });
});
