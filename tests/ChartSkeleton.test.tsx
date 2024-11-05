import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartSkeleton from '../src/components/TelemetryDashboard/components/ChartSkeleton';

describe('ChartSkeleton', () => {
  it('renders with default props', () => {
    render(<ChartSkeleton />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveStyle({ width: '600px', height: '400px' });
  });

  it('applies custom dimensions', () => {
    render(<ChartSkeleton width={800} height={500} />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({ width: '800px', height: '500px' });
  });

  it('applies custom className', () => {
    const customClass = 'custom-skeleton';
    render(<ChartSkeleton className={customClass} />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass(customClass);
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('renders correct number of skeleton elements', () => {
    render(<ChartSkeleton />);
    
    // Check for header skeleton
    expect(screen.getByRole('generic', { name: /chart header skeleton/i })).toBeInTheDocument();
    
    // Check for Y-axis labels (4 elements)
    const yAxisLabels = screen.getAllByRole('generic', { name: /y-axis label skeleton/i });
    expect(yAxisLabels).toHaveLength(4);
    
    // Check for chart bars/lines (6 elements)
    const chartBars = screen.getAllByRole('generic', { name: /chart bar skeleton/i });
    expect(chartBars).toHaveLength(6);
    
    // Check for X-axis labels (6 elements)
    const xAxisLabels = screen.getAllByRole('generic', { name: /x-axis label skeleton/i });
    expect(xAxisLabels).toHaveLength(6);
  });

  it('applies dark mode classes correctly', () => {
    render(<ChartSkeleton />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('dark:bg-gray-700');
    
    const bars = screen.getAllByRole('generic', { name: /chart bar skeleton/i });
    bars.forEach(bar => {
      expect(bar).toHaveClass('dark:bg-gray-600');
    });
  });
});
