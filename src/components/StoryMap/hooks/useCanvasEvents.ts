import { useCallback, useState } from 'react';

interface UseCanvasEventsProps {
  svgRef: React.RefObject<SVGSVGElement>;
  viewBox: { x: number; y: number; width: number; height: number };
  nodes: any[];
  onMapPanStart: (event: React.MouseEvent) => void;
  onMapPan: (event: React.MouseEvent) => void;
  onMapPanEnd: () => void;
  onNodeDragStart: (event: React.MouseEvent, id: number) => void;
  onNodeDrag: (event: React.MouseEvent) => void;
  onNodeDragEnd: () => void;
  onLinkNodes?: (sourceId: number, targetId: number) => void;
}

export const useCanvasEvents = ({
  svgRef,
  viewBox,
  nodes,
  onMapPanStart,
  onMapPan,
  onMapPanEnd,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  onLinkNodes
}: UseCanvasEventsProps) => {
  const [isPanning, setIsPanning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) {
      setIsPanning(true);
      onMapPanStart(event);
    }
  }, [onMapPanStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) * viewBox.width / rect.width + viewBox.x;
    const y = (event.clientY - rect.top) * viewBox.height / rect.height + viewBox.y;
    
    setMousePosition({ x, y });
    onMapPan(event);
    onNodeDrag(event);
  }, [svgRef, viewBox, onMapPan, onNodeDrag]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    setIsPanning(false);
    onMapPanEnd();
    onNodeDragEnd();
  }, [onMapPanEnd, onNodeDragEnd]);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    onMapPanEnd();
    onNodeDragEnd();
  }, [onMapPanEnd, onNodeDragEnd]);

  return {
    isPanning,
    mousePosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
};
