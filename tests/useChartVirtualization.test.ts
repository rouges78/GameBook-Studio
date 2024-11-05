import { renderHook, act } from '@testing-library/react';
import { useChartVirtualization } from '../src/components/TelemetryDashboard/hooks/useChartVirtualization';

const generateMockData = (length: number) => {
  return Array.from({ length }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    value: Math.random() * 100
  }));
};

describe('useChartVirtualization', () => {
  const mockData = generateMockData(100);
  const defaultProps = {
    data: mockData,
    width: 500,
    pointWidth: 50,
    overscanCount: 2
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct visible data window', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    // With width=500 and pointWidth=50, we should see 10 points initially
    expect(result.current.visibleData.length).toBeLessThanOrEqual(14); // 10 visible + 2 overscan on each side
  });

  it('updates visible data on scroll', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    act(() => {
      result.current.handleScroll(250); // Scroll halfway through first window
    });

    // Check that the window has moved
    expect(result.current.scrollLeft).toBe(250);
    expect(result.current.visibleData.length).toBeLessThanOrEqual(14);
  });

  it('handles zoom correctly', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    act(() => {
      result.current.handleZoom(2); // Zoom in 2x
    });

    expect(result.current.scale).toBe(2);
    // At 2x zoom, each point takes 100px, so we should see fewer points
    expect(result.current.visibleData.length).toBeLessThanOrEqual(9); // 5 visible + 2 overscan on each side
  });

  it('calculates total width correctly', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    const expectedWidth = mockData.length * defaultProps.pointWidth;
    expect(result.current.totalWidth).toBe(expectedWidth);

    act(() => {
      result.current.handleZoom(2);
    });

    expect(result.current.totalWidth).toBe(expectedWidth * 2);
  });

  it('maintains smooth scrolling with debounce', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    act(() => {
      result.current.handleScroll(100);
    });

    // Fast consecutive scrolls should update immediately
    act(() => {
      result.current.handleScroll(200);
    });

    expect(result.current.scrollLeft).toBe(200);

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Data should still be correct after debounce
    expect(result.current.visibleData.length).toBeLessThanOrEqual(14);
  });

  it('cleans up animation frame on unmount', () => {
    const cancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useChartVirtualization(defaultProps));

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('respects minimum and maximum zoom levels', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    act(() => {
      result.current.handleZoom(0.05); // Try to zoom out too far
    });
    expect(result.current.scale).toBe(0.1); // Should clamp to minimum

    act(() => {
      result.current.handleZoom(6); // Try to zoom in too far
    });
    expect(result.current.scale).toBe(5); // Should clamp to maximum
  });

  it('adds virtual index to data during scrolling', () => {
    const { result } = renderHook(() => useChartVirtualization(defaultProps));

    act(() => {
      result.current.handleScroll(100);
    });

    // Check that virtual indices are added
    result.current.visibleData.forEach((item: any, index: number) => {
      expect(item).toHaveProperty('virtualIndex');
      expect(item.virtualIndex).toBe(result.current.visibleData[index].virtualIndex);
    });
  });
});
