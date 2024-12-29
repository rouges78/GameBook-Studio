import { RefObject, useCallback, useState } from 'react';

interface UsePanZoomProps {
  svgRef: RefObject<SVGSVGElement>;
  onZoom: (delta: number, mouseX: number, mouseY: number) => void;
  onMapPanStart: (event: React.MouseEvent) => void;
  onMapPan: (event: React.MouseEvent) => void;
  onMapPanEnd: () => void;
}

export const usePanZoom = ({
  svgRef,
  onZoom,
  onMapPanStart,
  onMapPan,
  onMapPanEnd
}: UsePanZoomProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Get mouse position relative to SVG
    const rect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate zoom delta with smoothing
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.1), 3);

    if (newZoom !== zoomLevel) {
      setIsZooming(true);
      setZoomLevel(newZoom);
      onZoom(delta, mouseX, mouseY);
      
      // Smooth transition
      setTimeout(() => setIsZooming(false), 200);
    }
  }, [zoomLevel, svgRef, onZoom]);

  const setupWheelListener = useCallback(() => {
    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (svgElement) {
        svgElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [svgRef, handleWheel]);

  return {
    setupWheelListener,
    onMapPanStart,
    onMapPan,
    onMapPanEnd,
    zoomLevel,
    isZooming
  };
};
