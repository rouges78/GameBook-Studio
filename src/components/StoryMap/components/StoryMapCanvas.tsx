import React, { useMemo, useCallback } from 'react';
import './StoryMapCanvas.css';
import { Node, Link, ImageAdjustments } from '../types';
import { getNodeColor, getConnectionPath } from '../utils';

interface StoryMapCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  nodes: Node[];
  links: Link[];
  viewBox: { x: number; y: number; width: number; height: number };
  showGrid: boolean;
  backgroundImage: string | null;
  imageAdjustments: ImageAdjustments;
  useCurvedLines: boolean;
  selectedNode: number | null;
  isDragMode: boolean;
  onNodeClick: (id: number) => void;
  onNodeDragStart: (event: React.MouseEvent, id: number) => void;
  onMapPanStart: (event: React.MouseEvent) => void;
  onMapPan: (event: React.MouseEvent) => void;
  onMapPanEnd: () => void;
  onNodeDrag: (event: React.MouseEvent) => void;
  onNodeDragEnd: () => void;
  onZoom: (delta: number) => void;
}

export const StoryMapCanvas: React.FC<StoryMapCanvasProps> = ({
  svgRef,
  nodes,
  links,
  viewBox,
  showGrid,
  backgroundImage,
  imageAdjustments,
  useCurvedLines,
  selectedNode,
  isDragMode,
  onNodeClick,
  onNodeDragStart,
  onMapPanStart,
  onMapPan,
  onMapPanEnd,
  onNodeDrag,
  onNodeDragEnd,
  onZoom
}) => {
  const [isPanning, setIsPanning] = React.useState(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    onMapPanStart({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as React.MouseEvent);
  }, [onMapPanStart]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    onMapPan({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as React.MouseEvent);
    onNodeDrag({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as React.MouseEvent);
  }, [onMapPan, onNodeDrag]);

  const handleTouchEnd = useCallback(() => {
    onMapPanEnd();
    onNodeDragEnd();
  }, [onMapPanEnd, onNodeDragEnd]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsPanning(true);
    onMapPanStart(event);
  }, [onMapPanStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    onMapPanEnd();
    onNodeDragEnd();
  }, [onMapPanEnd, onNodeDragEnd]);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    onMapPanEnd();
    onNodeDragEnd();
  }, [onMapPanEnd, onNodeDragEnd]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (backgroundImage) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      onZoom(delta);
    }
  }, [backgroundImage, onZoom]);

  const renderLinks = useMemo(() => links.map((link) => {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    
    if (sourceNode && targetNode) {
      const linkId = `link-${link.source}-${link.target}`;
      const pathData = getConnectionPath(sourceNode, targetNode, useCurvedLines);
      
      return (
        <g key={linkId} className="pointer-events-none">
          <path
            d={pathData}
            stroke={link.isHighlighted ? "#FFE55C" : "#4A90E2"}
            strokeWidth={link.isHighlighted ? "3" : "2"}
            strokeDasharray="10,10"
            fill="none"
            markerEnd={`url(#${link.isHighlighted ? 'arrowhead-highlighted' : 'arrowhead'})`}
            className={link.isHighlighted ? "filter drop-shadow-[0_0_8px_rgba(255,229,92,0.5)]" : ""}
          />
        </g>
      );
    }
    return null;
  }), [links, nodes, useCurvedLines]);

  const renderNodes = useMemo(() => nodes.map(node => (
    <g
      key={`node-${node.id}`}
      transform={`translate(${node.x},${node.y})`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onNodeDragStart(e, node.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node.id);
      }}
      style={{ cursor: isDragMode && !node.locked ? 'move' : 'pointer' }}
    >
      {node.locked && (
        <circle
          key={`lock-circle-${node.id}`}
          r="32"
          fill="none"
          stroke="white"
          strokeWidth="2"
          className="animate-pulse opacity-50"
        />
      )}
      <circle
        key={`node-circle-${node.id}`}
        r="30"
        fill={getNodeColor(node.type, node.locked)}
        className={`filter transition-colors duration-200 ${
          selectedNode === node.id ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : ''
        }`}
      />
      <text
        key={`node-text-${node.id}`}
        textAnchor="middle"
        dy="5"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        className="pointer-events-none"
      >
        #{node.id}
      </text>
    </g>
  )), [nodes, isDragMode, onNodeClick, onNodeDragStart, selectedNode]);

  return (
    <div className="flex flex-col h-full bg-[#0A1929]">
      <div className="h-12 bg-[#132F4C] shadow-md flex-shrink-0" />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-[#132F4C] shadow-md flex-shrink-0" />
        <div className="flex-1 relative">
          <svg
            ref={svgRef}
            className={`w-full h-full select-none story-map-canvas ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
              onMapPan(e);
              onNodeDrag(e);
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onWheel={handleWheel}
          >
            {backgroundImage && (
              <image
                key="background-image"
                href={backgroundImage}
                width={imageAdjustments.width}
                height={imageAdjustments.height}
                className="pointer-events-none story-map-image"
                style={{
                  filter: `
                    contrast(${imageAdjustments.contrast}%)
                    brightness(${imageAdjustments.brightness}%)
                    grayscale(${imageAdjustments.blackAndWhite}%)
                    opacity(${imageAdjustments.transparency}%)
                    ${imageAdjustments.sharpness !== 100 ? `blur(${(100 - imageAdjustments.sharpness) * 0.1}px)` : ''}
                  `
                }}
              />
            )}
            
            {showGrid && (
              <g key="grid">
                <pattern
                  id="grid-pattern"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="#1E3A5F"
                    strokeWidth="0.5"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" className="pointer-events-none" />
              </g>
            )}

            {renderLinks}
            {renderNodes}

            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#4A90E2" />
              </marker>
              <marker
                id="arrowhead-highlighted"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#FFE55C"
                  className="filter drop-shadow-[0_0_8px_rgba(255,229,92,0.5)]"
                />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
