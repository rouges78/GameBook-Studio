import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface TimeSeriesData {
  date: string;
  total?: number;
  error?: number;
  navigation?: number;
  [key: string]: string | number | undefined;
}

interface UseChartVirtualizationProps {
  data: TimeSeriesData[];
  width: number;
  pointWidth?: number;
  overscanCount?: number;
}

interface VirtualizationState {
  startIndex: number;
  endIndex: number;
  scrollLeft: number;
  scale: number;
}

export const useChartVirtualization = ({
  data,
  width,
  pointWidth = 50,
  overscanCount = 5
}: UseChartVirtualizationProps) => {
  const [state, setState] = useState<VirtualizationState>({
    startIndex: 0,
    endIndex: Math.ceil(width / pointWidth),
    scrollLeft: 0,
    scale: 1
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);
  const lastScrollTime = useRef(0);
  const animationFrame = useRef<number>();

  // Calculate total content width
  const totalWidth = useMemo(() => {
    return data.length * pointWidth * state.scale;
  }, [data.length, pointWidth, state.scale]);

  // Calculate visible window indices
  const calculateVisibleIndices = useCallback((scrollLeft: number, scale: number) => {
    const effectivePointWidth = pointWidth * scale;
    const start = Math.max(0, Math.floor(scrollLeft / effectivePointWidth) - overscanCount);
    const end = Math.min(
      data.length,
      Math.ceil((scrollLeft + width) / effectivePointWidth) + overscanCount
    );

    return { start, end };
  }, [data.length, width, pointWidth, overscanCount]);

  // Handle scroll
  const handleScroll = useCallback((scrollLeft: number) => {
    scrolling.current = true;
    lastScrollTime.current = Date.now();

    const { start, end } = calculateVisibleIndices(scrollLeft, state.scale);
    
    setState(prev => ({
      ...prev,
      startIndex: start,
      endIndex: end,
      scrollLeft
    }));

    // Debounce scroll end detection
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      if (Date.now() - lastScrollTime.current > 100) {
        scrolling.current = false;
      }
    });
  }, [calculateVisibleIndices, state.scale]);

  // Handle zoom
  const handleZoom = useCallback((scale: number) => {
    const newScale = Math.max(0.1, Math.min(5, scale));
    const { start, end } = calculateVisibleIndices(state.scrollLeft, newScale);

    setState(prev => ({
      ...prev,
      scale: newScale,
      startIndex: start,
      endIndex: end
    }));
  }, [calculateVisibleIndices, state.scrollLeft]);

  // Get visible data slice with virtual indices
  const visibleData = useMemo(() => {
    const slice = data.slice(state.startIndex, state.endIndex);
    return slice.map((item, index) => ({
      ...item,
      virtualIndex: state.startIndex + index
    }));
  }, [data, state.startIndex, state.endIndex]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return {
    containerRef,
    visibleData,
    totalWidth,
    scrollLeft: state.scrollLeft,
    scale: state.scale,
    handleScroll,
    handleZoom
  };
};
