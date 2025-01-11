import React, { useCallback } from 'react';
import { Node, Link } from '../types';

interface MiniMapProps {
  nodes: Node[];
  links: Link[];
  viewBox: { x: number; y: number; width: number; height: number };
  mapWidth: number;
  mapHeight: number;
  onViewBoxChange: (x: number, y: number) => void;
  backgroundImage: string | null;
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const NODE_SIZE = 4;

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  links,
  viewBox,
  mapWidth,
  mapHeight,
  onViewBoxChange,
  backgroundImage
}) => {
  // Calculate scale to fit the entire map in the minimap
  const scale = Math.min(MINIMAP_WIDTH / mapWidth, MINIMAP_HEIGHT / mapHeight);
  
  // Calculate dimensions to maintain aspect ratio
  const scaledWidth = mapWidth * scale;
  const scaledHeight = mapHeight * scale;
  
  // Center the scaled map in the minimap container
  const offsetX = (MINIMAP_WIDTH - scaledWidth) / 2;
  const offsetY = (MINIMAP_HEIGHT - scaledHeight) / 2;

  // Calculate viewport rectangle dimensions
  const viewportWidth = (viewBox.width / mapWidth) * scaledWidth;
  const viewportHeight = (viewBox.height / mapHeight) * scaledHeight;
  const viewportX = (viewBox.x / mapWidth) * scaledWidth + offsetX;
  const viewportY = (viewBox.y / mapHeight) * scaledHeight + offsetY;

  const handleClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - offsetX;
    const y = event.clientY - rect.top - offsetY;
    
    // Convert click coordinates back to map coordinates
    const mapX = (x / scaledWidth) * mapWidth;
    const mapY = (y / scaledHeight) * mapHeight;
    
    // Center the viewport on the clicked point
    const newX = Math.max(0, Math.min(mapWidth - viewBox.width, mapX - viewBox.width / 2));
    const newY = Math.max(0, Math.min(mapHeight - viewBox.height, mapY - viewBox.height / 2));
    
    onViewBoxChange(newX, newY);
  }, [mapWidth, mapHeight, scaledWidth, scaledHeight, offsetX, offsetY, viewBox.width, viewBox.height, onViewBoxChange]);

  return (
    <div className="absolute bottom-4 left-4 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        onClick={handleClick}
        className="cursor-pointer"
      >
        {/* Background */}
        {backgroundImage ? (
          <image
            href={backgroundImage}
            x={offsetX}
            y={offsetY}
            width={scaledWidth}
            height={scaledHeight}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.7}
          />
        ) : (
          <rect
            x={0}
            y={0}
            width={MINIMAP_WIDTH}
            height={MINIMAP_HEIGHT}
            fill="#1a1a1a"
          />
        )}

        {/* Links */}
        <g transform={`translate(${offsetX},${offsetY})`}>
          {links.map((link) => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (!source || !target) return null;

            return (
              <line
                key={`${link.source}-${link.target}`}
                x1={source.x * scale}
                y1={source.y * scale}
                x2={target.x * scale}
                y2={target.y * scale}
                stroke={link.isHighlighted ? '#4CAF50' : '#666'}
                strokeWidth={1}
                opacity={0.5}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g transform={`translate(${offsetX},${offsetY})`}>
          {nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.x * scale}
              cy={node.y * scale}
              r={NODE_SIZE}
              fill={node.type === 'finale' ? '#e74c3c' : node.type === 'nodo' ? '#3498db' : '#2ecc71'}
              opacity={0.8}
            />
          ))}
        </g>

        {/* Viewport Rectangle */}
        <rect
          x={viewportX}
          y={viewportY}
          width={viewportWidth}
          height={viewportHeight}
          fill="none"
          stroke="#fff"
          strokeWidth={1}
          opacity={0.5}
        />
      </svg>
    </div>
  );
};
