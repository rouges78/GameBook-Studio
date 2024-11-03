import React from 'react';
import { Node } from '../types';

interface ActionButtonsProps {
  selectedNode: number | null;
  nodes: Node[];
  selectedAction: number | null;
  onActionSelect: (index: number) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedNode,
  nodes,
  selectedAction,
  onActionSelect
}) => {
  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  if (!selectedNodeData) return null;

  const actions = selectedNodeData.actions;
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionSelect(index)}
            className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
              selectedAction === index
                ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {`Azione n.${index + 1}`}
          </button>
        ))}
      </div>
      {selectedAction !== null && actions[selectedAction] && (
        <div className="text-yellow-300 text-sm">
          {actions[selectedAction].text}
        </div>
      )}
    </div>
  );
};
