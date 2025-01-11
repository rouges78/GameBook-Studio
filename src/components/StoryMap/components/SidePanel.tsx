import React from 'react';

import { Node as StoryMapNode } from '../types';

interface SidePanelProps {
  onUploadImage?: () => void;
  showGrid: boolean;
  useCurvedLines: boolean;
  onToggleGrid?: () => void;
  onToggleLines?: () => void;
  onAddNode?: () => void;
  onDeleteNode?: () => void;
  onConnectNodes?: () => void;
  onDisconnectNodes?: () => void;
  onLockNode?: (id: number) => void;
  onUnlockNode?: () => void;
  selectedNode?: number | null;
  nodes?: StoryMapNode[];
  language?: 'it' | 'en';
}

const translations = {
  it: {
    mapSettings: 'Impostazioni mappa',
    showGrid: 'Mostra griglia',
    curvedLines: 'Linee curve',
    functions: 'Funzioni',
    addNode: 'Aggiungi nodo',
    deleteNode: 'Elimina nodo',
    connectNodes: 'Collega nodi',
    disconnectNodes: 'Scollega nodi',
    lockNode: 'Blocca nodo',
    unlockNode: 'Sblocca nodo',
    uploadImage: 'Carica immagine di sfondo'
  },
  en: {
    mapSettings: 'Map settings',
    showGrid: 'Show grid',
    curvedLines: 'Curved lines',
    functions: 'Functions',
    addNode: 'Add node',
    deleteNode: 'Delete node',
    connectNodes: 'Connect nodes',
    disconnectNodes: 'Disconnect nodes',
    lockNode: 'Lock node',
    unlockNode: 'Unlock node',
    uploadImage: 'Upload background image'
  }
};

export const SidePanel: React.FC<SidePanelProps> = ({
  onUploadImage,
  showGrid,
  useCurvedLines,
  onToggleGrid,
  onToggleLines,
  onAddNode,
  onDeleteNode,
  onConnectNodes,
  onDisconnectNodes,
  onLockNode,
  onUnlockNode,
  selectedNode,
  nodes,
  language = 'it'
}) => {
  const t = translations[language];

  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#1A2B3B] border-r border-gray-700 z-[1000]">
      <div className="h-full pt-8 pb-4 px-4 space-y-8 overflow-y-auto">
        {/* Functions section */}
        <div>
          <h3 className="text-gray-400 font-medium mb-2">{t.functions}</h3>
          <div className="space-y-2">
            <button
              onClick={onAddNode}
              className="w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t.addNode}</span>
            </button>
            <button
              onClick={onDeleteNode}
              className="w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{t.deleteNode}</span>
            </button>
            <button
              onClick={onConnectNodes}
              className="w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 hover:bg-gray-700"
              aria-label={t.connectNodes}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{t.connectNodes}</span>
            </button>
            <button
              onClick={onDisconnectNodes}
              className="w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{t.disconnectNodes}</span>
            </button>
            {selectedNode && nodes && (
              <button
                onClick={() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  if (node) {
                    node.locked ? onUnlockNode?.() : onLockNode?.(node.id);
                  }
                }}
                className="w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>
                  {nodes.find(n => n.id === selectedNode)?.locked
                    ? t.unlockNode
                    : t.lockNode}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Map settings */}
        <div>
          <h3 className="text-gray-400 font-medium mb-2">{t.mapSettings}</h3>
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <button
                onClick={onUploadImage}
                className="w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t.uploadImage}</span>
              </button>
              <button
                onClick={() => onToggleGrid?.()}
                className={`w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 ${
                  showGrid ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14M4 12h16m-7-7v14M20 5v14" />
                </svg>
                <span>{t.showGrid}</span>
                <div className={`ml-auto w-4 h-4 rounded border border-gray-500 ${showGrid ? 'bg-blue-500' : ''}`} />
              </button>
              <button
                onClick={() => onToggleLines?.()}
                className={`w-full px-4 py-2 text-left rounded flex items-center gap-2 transition-colors text-gray-200 ${
                  useCurvedLines ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {useCurvedLines ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c4-4 8 4 12 0s4-4 4 0" />
                  )}
                </svg>
                <span>{t.curvedLines}</span>
                <div className={`ml-auto w-4 h-4 rounded border border-gray-500 ${useCurvedLines ? 'bg-blue-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
