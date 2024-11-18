import React from 'react';
import { 
  ZoomIn, ZoomOut, Grid, Upload, X, Edit3, Trash2, 
  Lock, Unlock, Hand, Save, ArrowRightToLine 
} from 'lucide-react';
import { Node, Translations } from '../types';
import { formatBackupTime } from '../utils';

interface StoryMapControlsProps {
  selectedNode: number | null;
  selectedAction: number | null;
  nodes: Node[];
  isDragMode: boolean;
  useCurvedLines: boolean;
  lastBackup: Date | null;
  t: Translations;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
  onZoom: (delta: number) => void;
  onToggleGrid: () => void;
  onToggleDragMode: () => void;
  onToggleLines: () => void;
  onSave: () => void;
  onEditParagraph: (id: number) => void;
  onDeleteParagraph: (id: number) => void;
  onToggleNodeLock: (id: number) => void;
  onActionSelect: (index: number) => void;
}

export const StoryMapControls: React.FC<StoryMapControlsProps> = ({
  selectedNode,
  selectedAction,
  nodes,
  isDragMode,
  useCurvedLines,
  lastBackup,
  t,
  fileInputRef,
  onClose,
  onZoom,
  onToggleGrid,
  onToggleDragMode,
  onToggleLines,
  onSave,
  onEditParagraph,
  onDeleteParagraph,
  onToggleNodeLock,
  onActionSelect
}) => {
  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="bg-[#0F2744] h-full flex flex-col">
      <div className="h-14 flex items-center px-4 justify-between border-b border-[#1E3A5F]">
        {/* Left side - Close and general controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleGrid}
              className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors"
              title={t.toggleGrid}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={onToggleDragMode}
              className={`p-1.5 rounded hover:bg-[#1E3A5F] transition-colors ${
                isDragMode ? 'text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-gray-400 hover:text-white'
              }`}
              title={t.dragMode}
            >
              <Hand size={18} />
            </button>
            <button
              onClick={onToggleLines}
              className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors"
              title={t.toggleLines}
            >
              <ArrowRightToLine 
                size={18}
                className={`transform transition-transform duration-300 ${
                  useCurvedLines ? 'scale-x-[-1]' : ''
                }`}
              />
            </button>
            <button
              onClick={onSave}
              className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors"
              title={t.save}
            >
              <Save size={18} />
            </button>
          </div>
        </div>

        {/* Center - Node controls */}
        {selectedNode && selectedNodeData && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditParagraph(selectedNode)}
              className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors"
              title={t.edit}
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => onDeleteParagraph(selectedNode)}
              className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors"
              title={t.delete}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => onToggleNodeLock(selectedNode)}
              className="p-1.5 rounded hover:bg-[#1E3A5F] transition-colors"
              title={selectedNodeData.locked ? t.unlock : t.lock}
            >
              {selectedNodeData.locked ? (
                <Lock size={18} className="text-red-500" />
              ) : (
                <Unlock size={18} className="text-green-500" />
              )}
            </button>
          </div>
        )}

        {/* Right side - Map controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-l border-[#1E3A5F] pl-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded bg-amber-900 hover:bg-amber-800 text-white transition-colors flex items-center gap-2"
              title={t.uploadBackground}
            >
              <Upload size={18} />
              <span className="text-sm">{t.uploadBackground}</span>
            </button>
            <div className="h-8 w-px bg-[#1E3A5F] mx-2" />
            <div className="flex items-center gap-1 bg-[#1E3A5F] rounded-md p-1">
              <button
                onClick={() => onZoom(0.1)}
                className="p-1.5 rounded hover:bg-[#2E4A6F] text-gray-200 hover:text-white transition-colors"
                title={t.zoomIn}
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => onZoom(-0.1)}
                className="p-1.5 rounded hover:bg-[#2E4A6F] text-gray-200 hover:text-white transition-colors"
                title={t.zoomOut}
              >
                <ZoomOut size={18} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {lastBackup ? (
              <>{t.autoBackup} {formatBackupTime(lastBackup)}</>
            ) : (
              t.backup
            )}
          </div>
        </div>
      </div>

      {selectedNode && selectedNodeData && (
        <div className="flex-none h-8 px-4 bg-[#1E3A5F] text-white text-sm flex items-center justify-between">
          <div>
            {t.selected}: #{selectedNode} {selectedNodeData.title}
          </div>
          {selectedAction !== null && (
            <div className="text-yellow-300">
              {`${t.action} ${selectedAction + 1}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
