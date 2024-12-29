import { useCallback, useState } from 'react';
import { Node } from '../types';

interface UseNodeInteractionsProps {
  nodes: Node[];
  onNodeClick: (id: number) => void;
  onNodeDragStart: (event: React.MouseEvent, id: number) => void;
  onNodeDrag: (event: React.MouseEvent) => void;
  onNodeDragEnd: () => void;
  onLinkNodes?: (sourceId: number, targetId: number) => void;
}

export const useNodeInteractions = ({
  nodes,
  onNodeClick,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  onLinkNodes
}: UseNodeInteractionsProps) => {
  const [linkingNode, setLinkingNode] = useState<Node | null>(null);

  const handleNodeSelect = useCallback((id: number) => {
    onNodeClick(id);
  }, [onNodeClick]);

  const handleNodeDragStart = useCallback((event: React.MouseEvent, id: number) => {
    onNodeDragStart(event, id);
  }, [onNodeDragStart]);

  const handleNodeDrag = useCallback((event: React.MouseEvent) => {
    onNodeDrag(event);
  }, [onNodeDrag]);

  const handleNodeDragEnd = useCallback(() => {
    onNodeDragEnd();
  }, [onNodeDragEnd]);

  const handleLinkNodes = useCallback((sourceId: number, targetId: number) => {
    if (onLinkNodes) {
      onLinkNodes(sourceId, targetId);
    }
    setLinkingNode(null);
  }, [onLinkNodes]);

  return {
    linkingNode,
    setLinkingNode,
    handleNodeSelect,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragEnd,
    handleLinkNodes
  };
};
