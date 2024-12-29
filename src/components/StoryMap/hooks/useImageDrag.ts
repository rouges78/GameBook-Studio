import { useCallback, useState } from 'react';

interface UseImageDragProps {
  onImageDragStart: (event: React.MouseEvent) => void;
  onImageDrag: (event: React.MouseEvent, offsetX: number, offsetY: number) => void;
  onImageDragEnd: () => void;
  initialX: number;
  initialY: number;
}

export const useImageDrag = ({
  onImageDragStart,
  onImageDrag,
  onImageDragEnd,
  initialX,
  initialY
}: UseImageDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: initialX, y: initialY });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    setStartPos({
      x: event.clientX - offset.x,
      y: event.clientY - offset.y
    });
    onImageDragStart(event);
  }, [offset, onImageDragStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
      const newX = event.clientX - startPos.x;
      const newY = event.clientY - startPos.y;
      setOffset({ x: newX, y: newY });
      onImageDrag(event, newX, newY);
    }
  }, [isDragging, startPos, onImageDrag]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      onImageDragEnd();
    }
  }, [isDragging, onImageDragEnd]);

  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      onImageDragEnd();
    }
  }, [isDragging, onImageDragEnd]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    offsetX: offset.x,
    offsetY: offset.y
  };
};