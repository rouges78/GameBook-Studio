import React from 'react';
import { Node as MapNode } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  node: MapNode | null;
  nodes: MapNode[];
  onClose: () => void;
  onAddNode?: (x: number, y: number) => void;
  onEditNode?: (id: number) => void;
  onDeleteNode?: (id: number) => void;
  onLockNode?: (id: number) => void;
  onChangeType?: (id: number, type: 'normale' | 'nodo' | 'finale') => void;
  onChangeParagraphNumber?: (id: number, newNumber: number) => void;
  onUpdateTitle?: (id: number, title: string) => void;
  language?: 'it' | 'en';
}

const translations = {
  it: {
    addNode: 'Aggiungi nodo',
    editNode: 'Modifica nodo',
    deleteNode: 'Elimina nodo',
    lockNode: 'Blocca nodo',
    unlockNode: 'Sblocca nodo',
    nodeType: 'Tipo nodo',
    normal: 'Normale',
    node: 'Nodo',
    final: 'Finale',
    nodeDetails: 'Dettagli nodo',
    paragraphNumber: 'Numero paragrafo',
    title: 'Titolo',
    save: 'Salva',
    cancel: 'Annulla',
    actions: 'Azioni',
    type: 'Tipo',
    status: 'Stato',
    locked: 'Bloccato',
    unlocked: 'Sbloccato'
  },
  en: {
    addNode: 'Add node',
    editNode: 'Edit node',
    deleteNode: 'Delete node',
    lockNode: 'Lock node',
    unlockNode: 'Unlock node',
    nodeType: 'Node type',
    normal: 'Normal',
    node: 'Node',
    final: 'Final',
    nodeDetails: 'Node details',
    paragraphNumber: 'Paragraph number',
    title: 'Title',
    save: 'Save',
    cancel: 'Cancel',
    actions: 'Actions',
    type: 'Type',
    status: 'Status',
    locked: 'Locked',
    unlocked: 'Unlocked'
  }
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onLockNode,
  onChangeType,
  onChangeParagraphNumber,
  onUpdateTitle,
  language = 'it'
}) => {
  const t = translations[language];
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [editingNumber, setEditingNumber] = React.useState(false);
  const [title, setTitle] = React.useState(node?.title || '');
  const [number, setNumber] = React.useState(node?.id || 0);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  React.useEffect(() => {
    if (node) {
      setTitle(node.title);
      setNumber(node.id);
    }
  }, [node]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-[#1A2B3B] rounded-lg shadow-lg border border-gray-700 py-1 min-w-[300px]"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {!node && onAddNode && (
        <button
          className="w-full px-4 py-2 text-left text-gray-200 hover:bg-blue-600 transition-colors"
          onClick={() => {
            onAddNode(x, y);
            onClose();
          }}
        >
          {t.addNode}
        </button>
      )}

      {node && (
        <>
          {/* Node Details Section */}
          <div className="px-4 py-2">
            <h3 className="text-gray-400 font-medium mb-2">{t.nodeDetails}</h3>
            
            {/* Paragraph Number */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">{t.paragraphNumber}</label>
                {editingNumber ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={number}
                      onChange={(e) => setNumber(parseInt(e.target.value))}
                      className="w-20 px-2 py-1 bg-[#0A1929] text-gray-200 rounded border border-gray-700"
                    />
                    <button
                      onClick={() => {
                        onChangeParagraphNumber?.(node.id, number);
                        setEditingNumber(false);
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={() => {
                        setNumber(node.id);
                        setEditingNumber(false);
                      }}
                      className="text-sm text-gray-400 hover:text-gray-300"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNumber(true)}
                    className="text-gray-200 hover:text-white"
                  >
                    #{node.id}
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">{t.title}</label>
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-40 px-2 py-1 bg-[#0A1929] text-gray-200 rounded border border-gray-700"
                    />
                    <button
                      onClick={() => {
                        onUpdateTitle?.(node.id, title);
                        setEditingTitle(false);
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={() => {
                        setTitle(node.title);
                        setEditingTitle(false);
                      }}
                      className="text-sm text-gray-400 hover:text-gray-300"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="text-gray-200 hover:text-white"
                  >
                    {node.title}
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t.status}</span>
              <span className="text-gray-200">
                {node.locked ? t.locked : t.unlocked}
              </span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t.type}</span>
              <span className="text-gray-200">
                {node.type === 'normale' ? t.normal : node.type === 'nodo' ? t.node : t.final}
              </span>
            </div>
          </div>

          {/* Actions Section */}
          <div className="border-t border-gray-700">
            <div className="px-4 py-2">
              <h3 className="text-gray-400 font-medium mb-2">{t.actions}</h3>
              
              {onEditNode && (
                <button
                  className="w-full px-4 py-2 text-left text-gray-200 hover:bg-blue-600 transition-colors rounded"
                  onClick={() => {
                    onEditNode(node.id);
                    onClose();
                  }}
                >
                  {t.editNode}
                </button>
              )}

              {onLockNode && (
                <button
                  className="w-full px-4 py-2 text-left text-gray-200 hover:bg-blue-600 transition-colors rounded"
                  onClick={() => {
                    onLockNode(node.id);
                    onClose();
                  }}
                >
                  {node.locked ? t.unlockNode : t.lockNode}
                </button>
              )}
            </div>
          </div>

          {/* Node Type Section */}
          {onChangeType && (
            <div className="border-t border-gray-700">
              <div className="px-4 py-2">
                <h3 className="text-gray-400 font-medium mb-2">{t.nodeType}</h3>
                <div className="space-y-1">
                  <button
                    className={`w-full px-2 py-1 text-left rounded ${
                      node.type === 'normale' ? 'bg-blue-600' : 'hover:bg-gray-700'
                    } transition-colors text-gray-200`}
                    onClick={() => {
                      onChangeType(node.id, 'normale');
                      onClose();
                    }}
                  >
                    {t.normal}
                  </button>
                  <button
                    className={`w-full px-2 py-1 text-left rounded ${
                      node.type === 'nodo' ? 'bg-blue-600' : 'hover:bg-gray-700'
                    } transition-colors text-gray-200`}
                    onClick={() => {
                      onChangeType(node.id, 'nodo');
                      onClose();
                    }}
                  >
                    {t.node}
                  </button>
                  <button
                    className={`w-full px-2 py-1 text-left rounded ${
                      node.type === 'finale' ? 'bg-blue-600' : 'hover:bg-gray-700'
                    } transition-colors text-gray-200`}
                    onClick={() => {
                      onChangeType(node.id, 'finale');
                      onClose();
                    }}
                  >
                    {t.final}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Section */}
          {onDeleteNode && (
            <div className="border-t border-gray-700">
              <button
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/50 transition-colors"
                onClick={() => {
                  onDeleteNode(node.id);
                  onClose();
                }}
              >
                {t.deleteNode}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
