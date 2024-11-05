import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TimeSeriesChart } from '../src/components/TelemetryDashboard/components/TimeSeriesChart';
import { exportChart } from '../src/components/TelemetryDashboard/utils/chartExport';

// Mock the chart export utility
jest.mock('../src/components/TelemetryDashboard/utils/chartExport', () => ({
  exportChart: jest.fn(),
}));

describe('TimeSeriesChart', () => {
  const mockData = [
    { date: '2024-01-01', total: 10, error: 2, navigation: 8 },
    { date: '2024-01-02', total: 15, error: 3, navigation: 12 },
  ];

  const mockCategories = {
    error: true,
    navigation: true,
  };

  beforeEach(() => {
    // Clear mock before each test
    jest.clearAllMocks();
  });

  it('renders chart with export buttons', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Export PNG')).toBeInTheDocument();
    expect(screen.getByText('Export SVG')).toBeInTheDocument();
  });

  it('exports chart as PNG when PNG button is clicked', async () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={false}
      />
    );

    const pngButton = screen.getByText('Export PNG');
    fireEvent.click(pngButton);

    expect(exportChart).toHaveBeenCalledWith(
      expect.any(SVGElement),
      expect.objectContaining({
        format: 'PNG',
        filename: expect.stringContaining('telemetry-chart-'),
      })
    );
  });

  it('exports chart as SVG when SVG button is clicked', async () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={false}
      />
    );

    const svgButton = screen.getByText('Export SVG');
    fireEvent.click(svgButton);

    expect(exportChart).toHaveBeenCalledWith(
      expect.any(SVGElement),
      expect.objectContaining({
        format: 'SVG',
        filename: expect.stringContaining('telemetry-chart-'),
      })
    );
  });

  it('handles export error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (exportChart as jest.Mock).mockRejectedValueOnce(new Error('Export failed'));

    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={false}
      />
    );

    const pngButton = screen.getByText('Export PNG');
    fireEvent.click(pngButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to export chart:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('applies dark mode styles correctly', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={true}
      />
    );

    const container = screen.getByText('Events Over Time').closest('div');
    expect(container).toHaveClass('bg-gray-700');
  });

  it('renders chart with filtered categories', () => {
    const filteredCategories = {
      error: true,
      navigation: false,
    };

    render(
      <TimeSeriesChart
        data={mockData}
        categories={filteredCategories}
        isDarkMode={false}
      />
    );

    // Only error category should be rendered
    const chartContainer = screen.getByText('Events Over Time').closest('div');
    expect(chartContainer).toBeInTheDocument();
  });

  it('displays legend with correct formatting', () => {
    render(
      <TimeSeriesChart
        data={mockData}
        categories={mockCategories}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Click legend items to toggle visibility')).toBeInTheDocument();
  });
});
