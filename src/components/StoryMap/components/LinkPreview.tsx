import React from 'react';
import { Node } from '../types';
import { getConnectionPath } from '../utils';

interface LinkPreviewProps {
  sourceNode: Node;
  mousePosition: { x: number; y: number };
  useCurvedLines: boolean;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  sourceNode,
  mousePosition,
  useCurvedLines
}) => {
  // Create a temporary target node at mouse position
  const targetNode = {
    ...sourceNode,
    x: mousePosition.x,
    y: mousePosition.y
  };

  return (
    <path
      d={getConnectionPath(sourceNode, targetNode, useCurvedLines)}
      stroke="#4A90E2"
      strokeWidth="2"
      strokeDasharray="5,5"
      fill="none"
      className="pointer-events-none opacity-50"
    />
  );
};
