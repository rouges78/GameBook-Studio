import React from 'react';

interface ToolbarProps {
  onAddNode?: () => void;
  onToggleGrid?: () => void;
  onToggleLines?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onUploadImage?: () => void;
  showGrid?: boolean;
  useCurvedLines?: boolean;
  hasBackgroundImage?: boolean;
  language?: 'it' | 'en';
}

const translations = {
  it: {
    addNode: 'Aggiungi nodo',
    toggleGrid: 'Mostra/Nascondi griglia',
    toggleLines: 'Cambia stile linee',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    zoomReset: 'Reset zoom',
    uploadImage: 'Carica immagine',
    editImage: 'Modifica immagine'
  },
  en: {
    addNode: 'Add node',
    toggleGrid: 'Toggle grid',
    toggleLines: 'Toggle line style',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: 'Reset zoom',
    uploadImage: 'Upload image',
    editImage: 'Edit image'
  }
};

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onToggleGrid,
  onToggleLines,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onUploadImage,
  showGrid,
  useCurvedLines,
  hasBackgroundImage,
  language = 'it'
}) => {
  const t = translations[language];

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-[#1A2B3B] rounded-lg border border-gray-700 p-2 shadow-lg">
      {onAddNode && (
        <button
          onClick={onAddNode}
          className="px-3 py-1.5 rounded hover:bg-blue-600 transition-colors text-gray-200"
          title={t.addNode}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {onToggleGrid && (
        <button
          onClick={onToggleGrid}
          className={`px-3 py-1.5 rounded transition-colors text-gray-200 ${
            showGrid ? 'bg-blue-600' : 'hover:bg-blue-600'
          }`}
          title={t.toggleGrid}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14M4 12h16m-7-7v14M20 5v14" />
          </svg>
        </button>
      )}

      {onToggleLines && (
        <button
          onClick={onToggleLines}
          className={`px-3 py-1.5 rounded transition-colors text-gray-200 ${
            useCurvedLines ? 'bg-blue-600' : 'hover:bg-blue-600'
          }`}
          title={t.toggleLines}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {useCurvedLines ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c4-4 8 4 12 0s4-4 4 0" />
            )}
          </svg>
        </button>
      )}

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {onUploadImage && (
        <button
          onClick={onUploadImage}
          className={`px-3 py-1.5 rounded transition-colors text-gray-200 ${
            hasBackgroundImage ? 'bg-blue-600' : 'hover:bg-blue-600'
          }`}
          title={hasBackgroundImage ? t.editImage : t.uploadImage}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {onZoomIn && (
        <button
          onClick={onZoomIn}
          className="px-3 py-1.5 rounded hover:bg-blue-600 transition-colors text-gray-200"
          title={t.zoomIn}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-4 0H7" />
          </svg>
        </button>
      )}

      {onZoomOut && (
        <button
          onClick={onZoomOut}
          className="px-3 py-1.5 rounded hover:bg-blue-600 transition-colors text-gray-200"
          title={t.zoomOut}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-7 0h6" />
          </svg>
        </button>
      )}

      {onZoomReset && (
        <button
          onClick={onZoomReset}
          className="px-3 py-1.5 rounded hover:bg-blue-600 transition-colors text-gray-200"
          title={t.zoomReset}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
};
