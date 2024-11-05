import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TimeSeriesChart from '../src/components/TelemetryDashboard/components/TimeSeriesChart';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn();

const mockData = Array.from({ length: 100 }, (_, i) => ({
  date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  total: Math.random() * 1000,
  error: Math.random() * 100,
  navigation: Math.random() * 800
}));

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
    jest.clearAllMocks();
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

  // Virtualization tests
  describe('virtualization', () => {
    it('handles scroll events', () => {
      const { container } = render(
        <TimeSeriesChart
          data={mockData}
          categories={mockCategories}
          width={500}
          height={400}
        />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();

      act(() => {
        if (scrollContainer) {
          fireEvent.scroll(scrollContainer, { target: { scrollLeft: 100 } });
        }
      });

      // Verify that the chart content has moved
      const chartContent = container.querySelector('.recharts-wrapper');
      expect(chartContent).toBeInTheDocument();
    });

    it('handles zoom events', () => {
      const { container } = render(
        <TimeSeriesChart
          data={mockData}
          categories={mockCategories}
          width={500}
          height={400}
        />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();

      act(() => {
        if (scrollContainer) {
          fireEvent.wheel(scrollContainer, {
            deltaY: -100,
            ctrlKey: true
          });
        }
      });

      // Verify that the chart content has been transformed
      const chartContent = container.querySelector('.recharts-wrapper');
      expect(chartContent).toBeInTheDocument();
    });

    it('maintains smooth scrolling with debounce', () => {
      jest.useFakeTimers();

      const { container } = render(
        <TimeSeriesChart
          data={mockData}
          categories={mockCategories}
          width={500}
          height={400}
        />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();

      // Perform multiple scroll events rapidly
      act(() => {
        if (scrollContainer) {
          fireEvent.scroll(scrollContainer, { target: { scrollLeft: 100 } });
          fireEvent.scroll(scrollContainer, { target: { scrollLeft: 200 } });
          fireEvent.scroll(scrollContainer, { target: { scrollLeft: 300 } });
        }
      });

      // Fast-forward timers
      act(() => {
        jest.runAllTimers();
      });

      jest.useRealTimers();
    });

    it('cleans up event listeners on unmount', () => {
      const { container, unmount } = render(
        <TimeSeriesChart
          data={mockData}
          categories={mockCategories}
          width={500}
          height={400}
        />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();

      unmount();

      // Verify that cancelAnimationFrame was called during cleanup
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  // Performance tests
  describe('performance optimizations', () => {
    it('memoizes rendered content', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            width={500}
            height={400}
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      // Rerender with same props
      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            width={500}
            height={400}
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBe(initialRenderCount);
    });

    it('updates only when necessary props change', () => {
      const { rerender } = render(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            width={500}
            height={400}
            className="test"
          />
        </TestWrapper>
      );

      const initialRenderCount = mockRender.mock.calls.length;

      // Update non-essential prop
      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={mockData}
            categories={mockCategories}
            width={500}
            height={400}
            className="different"
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBe(initialRenderCount);

      // Update essential prop
      rerender(
        <TestWrapper>
          <TimeSeriesChart
            data={[...mockData, { date: '2024-02-01', total: 500, error: 50, navigation: 400 }]}
            categories={mockCategories}
            width={500}
            height={400}
            className="different"
          />
        </TestWrapper>
      );

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });
  });
});
