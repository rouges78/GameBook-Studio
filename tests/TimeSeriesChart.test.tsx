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

// Mock function to track renders
const mockRender = jest.fn();

// Wrapper component to track renders
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    mockRender();
  });
  return <>{children}</>;
};

describe('TimeSeriesChart', () => {
  beforeEach(() => {
    mockRender.mockClear();
  });

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

  // Memoization tests
  describe('memoization', () => {
    it('does not re-render when non-essential props change', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            className="test"
            title="Test Chart"
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      // Update non-essential props
      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            className="different-class"
            title="Different Title"
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBe(initialRenderCount);
    });

    it('re-renders when data changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      const newData = [...mockData, { date: '2024-01-04', total: 250, error: 50, navigation: 200 }];
      
      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={newData}
            categories={mockCategories}
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });

    it('re-renders when categories change', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      const newCategories = { ...mockCategories, error: false };
      
      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={newCategories}
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });

    it('re-renders when loading state changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            loading={false}
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            loading={true}
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });

    it('re-renders when dimensions change', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            width={600}
            height={400}
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            width={800}
            height={500}
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });

    it('re-renders when dark mode changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            isDarkMode={false}
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            isDarkMode={true}
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });
  });
});
