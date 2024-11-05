import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorAnalysis } from '../src/components/TelemetryDashboard/components/ErrorAnalysis';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Bar: () => <div>Bar</div>,
  Pie: () => <div>Pie</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Cell: () => <div>Cell</div>,
  Legend: () => <div>Legend</div>
}));

describe('ErrorAnalysis', () => {
  const mockData = {
    errorPatterns: {
      correlations: [
        { pattern: 'Network Error', count: 10, impact: 75 },
        { pattern: 'Timeout', count: 5, impact: 25 }
      ],
      trends: [
        { date: '2024-01-01', errors: 5 },
        { date: '2024-01-02', errors: 3 }
      ]
    },
    updateErrors: {
      total: 15,
      byType: {
        'network': 8,
        'timeout': 7
      },
      averageRetries: 2.5
    },
    isDarkMode: false
  };

  it('renders all main sections', () => {
    render(<ErrorAnalysis {...mockData} />);
    
    expect(screen.getByText('Error Trends')).toBeInTheDocument();
    expect(screen.getByText('Error Impact Analysis')).toBeInTheDocument();
    expect(screen.getByText('Update Errors Summary')).toBeInTheDocument();
  });

  it('renders charts', () => {
    render(<ErrorAnalysis {...mockData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('displays update error statistics correctly', () => {
    render(<ErrorAnalysis {...mockData} />);
    
    expect(screen.getByText('15')).toBeInTheDocument(); // Total errors
    expect(screen.getByText('2.50')).toBeInTheDocument(); // Average retries
    expect(screen.getByText('network:')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('timeout:')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    const darkModeData = { ...mockData, isDarkMode: true };
    render(<ErrorAnalysis {...darkModeData} />);
    
    const sections = screen.getAllByRole('heading', { level: 2 })
      .map(heading => heading.parentElement);
    
    sections.forEach(section => {
      expect(section).toHaveClass('bg-gray-700');
    });
  });

  it('applies light mode styles when isDarkMode is false', () => {
    render(<ErrorAnalysis {...mockData} />);
    
    const sections = screen.getAllByRole('heading', { level: 2 })
      .map(heading => heading.parentElement);
    
    sections.forEach(section => {
      expect(section).toHaveClass('bg-gray-100');
    });
  });

  it('renders error type breakdown', () => {
    render(<ErrorAnalysis {...mockData} />);
    
    expect(screen.getByText('Error Types')).toBeInTheDocument();
    Object.entries(mockData.updateErrors.byType).forEach(([type, count]) => {
      expect(screen.getByText(`${type}:`)).toBeInTheDocument();
      expect(screen.getByText(count.toString())).toBeInTheDocument();
    });
  });

  it('handles empty error patterns', () => {
    const emptyData = {
      ...mockData,
      errorPatterns: {
        correlations: [],
        trends: []
      }
    };
    
    render(<ErrorAnalysis {...emptyData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('formats average retries to 2 decimal places', () => {
    const dataWithLongDecimal = {
      ...mockData,
      updateErrors: {
        ...mockData.updateErrors,
        averageRetries: 2.3333333
      }
    };
    
    render(<ErrorAnalysis {...dataWithLongDecimal} />);
    expect(screen.getByText('2.33')).toBeInTheDocument();
  });
});
