import React from 'react';
import { ImageAdjustments } from '../types';

import { Node as StoryMapNode } from '../types';

interface SidePanelProps {
  onBack: () => void;
  onUploadImage?: () => void;
  onImageAdjustment?: (key: keyof ImageAdjustments, value: number | boolean) => void;
  imageAdjustments?: ImageAdjustments;
  backgroundImage: string | null;
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
    back: 'Torna all\'editor paragrafi',
    mapSettings: 'Impostazioni mappa',
    showGrid: 'Mostra griglia',
    curvedLines: 'Linee curve',
    imageSettings: 'Impostazioni immagine',
    uploadImage: 'Carica immagine',
    editImage: 'Modifica immagine',
    contrast: 'Contrasto',
    transparency: 'Trasparenza',
    blackAndWhite: 'Bianco e nero',
    sharpness: 'Nitidezza',
    brightness: 'Luminosità',
    size: 'Dimensioni',
    width: 'Larghezza',
    height: 'Altezza',
    maintainRatio: 'Mantieni proporzioni',
    functions: 'Funzioni',
    addNode: 'Aggiungi nodo',
    deleteNode: 'Elimina nodo',
    connectNodes: 'Collega nodi',
    disconnectNodes: 'Scollega nodi',
    lockNode: 'Blocca nodo',
    unlockNode: 'Sblocca nodo'
  },
  en: {
    back: 'Back to paragraph editor',
    mapSettings: 'Map settings',
    showGrid: 'Show grid',
    curvedLines: 'Curved lines',
    imageSettings: 'Image settings',
    uploadImage: 'Upload image',
    editImage: 'Edit image',
    contrast: 'Contrast',
    transparency: 'Transparency',
    blackAndWhite: 'Black & white',
    sharpness: 'Sharpness',
    brightness: 'Brightness',
    size: 'Size',
    width: 'Width',
    height: 'Height',
    maintainRatio: 'Maintain ratio',
    functions: 'Functions',
    addNode: 'Add node',
    deleteNode: 'Delete node',
    connectNodes: 'Connect nodes',
    disconnectNodes: 'Disconnect nodes',
    lockNode: 'Lock node',
    unlockNode: 'Unlock node'
  }
};

export const SidePanel: React.FC<SidePanelProps> = ({
  onBack,
  onUploadImage,
  onImageAdjustment,
  imageAdjustments,
  backgroundImage,
  showGrid,
  useCurvedLines,
  onToggleGrid,
  onToggleLines,
  onAddNode,
  onDeleteNode,
  onConnectNodes,
  onDisconnectNodes,
  language = 'it'
}) => {
  const t = translations[language];
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div 
      className={`absolute left-0 top-0 bottom-0 bg-[#1A2B3B] border-r border-gray-700 transition-all duration-300 z-[1000] ${
        expanded ? 'w-80' : 'w-12'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-4 w-6 h-12 bg-[#1A2B3B] border border-gray-700 rounded-r flex items-center justify-center hover:bg-[#2A3B4B] transition-colors"
      >
        <svg
          className={`w-4 h-4 text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Panel content */}
      {expanded && (
        <div className="h-full p-4 space-y-6 overflow-y-auto">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">{t.back}</span>
          </button>

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
                      node.locked ? onUnlockNode?.() : onLockNode?.();
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

          {/* Image settings */}
          <div>
            <h3 className="text-gray-400 font-medium mb-2">{t.imageSettings}</h3>
            <button
              onClick={onUploadImage}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors mb-4"
            >
              {backgroundImage ? t.editImage : t.uploadImage}
            </button>

            {backgroundImage && imageAdjustments && onImageAdjustment && (
              <div className="space-y-4">
                {/* Image adjustments */}
                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400">
                    <span>{t.contrast}</span>
                    <span>{imageAdjustments.contrast}%</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={imageAdjustments.contrast}
                    onChange={(e) => onImageAdjustment('contrast', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400">
                    <span>{t.transparency}</span>
                    <span>{imageAdjustments.transparency}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={imageAdjustments.transparency}
                    onChange={(e) => onImageAdjustment('transparency', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400">
                    <span>{t.blackAndWhite}</span>
                    <span>{imageAdjustments.blackAndWhite}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageAdjustments.blackAndWhite}
                    onChange={(e) => onImageAdjustment('blackAndWhite', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400">
                    <span>{t.sharpness}</span>
                    <span>{imageAdjustments.sharpness}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageAdjustments.sharpness}
                    onChange={(e) => onImageAdjustment('sharpness', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400">
                    <span>{t.brightness}</span>
                    <span>{imageAdjustments.brightness}%</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={imageAdjustments.brightness}
                    onChange={(e) => onImageAdjustment('brightness', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Size controls */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">{t.size}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400 w-20">{t.width}</label>
                      <input
                        type="number"
                        value={Math.round(imageAdjustments.width)}
                        onChange={(e) => {
                          const newWidth = parseFloat(e.target.value);
                          if (!isNaN(newWidth) && newWidth > 0) {
                            onImageAdjustment('width', newWidth);
                            if (imageAdjustments.maintainAspectRatio) {
                              const ratio = imageAdjustments.height / imageAdjustments.width;
                              onImageAdjustment('height', newWidth * ratio);
                            }
                          }
                        }}
                        className="flex-1 px-2 py-1 bg-[#0A1929] text-gray-200 rounded border border-gray-700"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400 w-20">{t.height}</label>
                      <input
                        type="number"
                        value={Math.round(imageAdjustments.height)}
                        onChange={(e) => {
                          const newHeight = parseFloat(e.target.value);
                          if (!isNaN(newHeight) && newHeight > 0) {
                            onImageAdjustment('height', newHeight);
                            if (imageAdjustments.maintainAspectRatio) {
                              const ratio = imageAdjustments.width / imageAdjustments.height;
                              onImageAdjustment('width', newHeight * ratio);
                            }
                          }
                        }}
                        className="flex-1 px-2 py-1 bg-[#0A1929] text-gray-200 rounded border border-gray-700"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={imageAdjustments.maintainAspectRatio}
                        onChange={(e) => onImageAdjustment('maintainAspectRatio', e.target.checked)}
                        className="rounded border-gray-700"
                      />
                      {t.maintainRatio}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
