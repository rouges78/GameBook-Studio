import React from 'react';
import { render, screen } from '@testing-library/react';
import TimeSeriesChart from '../src/components/TelemetryDashboard/components/TimeSeriesChart';

const mockData = [
  { date: '2024-01-01', total: 100, error: 20, navigation: 80 },
  { date: '2024-01-02', total: 150, error: 30, navigation: 120 },
  { date: '2024-01-03', total: 200, error: 40, navigation: 160 }
];

const mockCategories = {
  error: true,
  navigation: true
};

describe('TimeSeriesChart', () => {
  it('renders loading skeleton when loading prop is true', () => {
    render(
      <TimeSeriesChart
        data={[]}
        loading={true}
        categories={mockCategories}
      />
    );
    
    expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
  });

  it('renders chart with title when provided', () => {
    const title = 'Test Chart';
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        title={title}
      />
    );
    
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('renders chart with custom dimensions', () => {
    const width = 800;
    const height = 500;
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        width={width}
        height={height}
      />
    );
    
    const chartContainer = screen.getByRole('generic');
    expect(chartContainer).toHaveStyle({ width: `${width}px`, height: `${height}px` });
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={true}
      />
    );
    
    const chartContainer = screen.getByRole('generic');
    expect(chartContainer.querySelector('.stroke-gray-700')).toBeInTheDocument();
    expect(chartContainer.querySelector('.text-gray-300')).toBeInTheDocument();
  });

  it('shows only total line when no categories are selected', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={{
          error: false,
          navigation: false
        }}
      />
    );
    
    const lines = screen.getAllByRole('generic', { name: /line/i });
    expect(lines).toHaveLength(1);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows selected category lines', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={{
          error: true,
          navigation: false
        }}
      />
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });

  it('applies custom class name', () => {
    const customClass = 'custom-chart';
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        className={customClass}
      />
    );
    
    expect(screen.getByRole('generic')).toHaveClass(customClass);
  });

  it('renders tooltip with dark mode styles when isDarkMode is true', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={true}
      />
    );
    
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveStyle({
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      color: '#e2e8f0'
    });
  });
});
