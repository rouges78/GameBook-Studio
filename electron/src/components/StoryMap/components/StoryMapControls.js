"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryMapControls = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../utils");
const StoryMapControls = ({ selectedNode, selectedAction, nodes, isDragMode, useCurvedLines, lastBackup, t, fileInputRef, onClose, onZoom, onToggleGrid, onToggleDragMode, onToggleLines, onSave, onEditParagraph, onDeleteParagraph, onToggleNodeLock, onActionSelect }) => {
    const selectedNodeData = nodes.find(n => n.id === selectedNode);
    return (<div className="bg-[#0F2744] h-full flex flex-col">
      <div className="h-14 flex items-center px-4 justify-between border-b border-[#1E3A5F]">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors">
            <lucide_react_1.X size={18}/>
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => onZoom(0.1)} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.zoomIn}>
              <lucide_react_1.ZoomIn size={18}/>
            </button>
            <button onClick={() => onZoom(-0.1)} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.zoomOut}>
              <lucide_react_1.ZoomOut size={18}/>
            </button>
            <button onClick={onToggleGrid} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.toggleGrid}>
              <lucide_react_1.Grid size={18}/>
            </button>
            <button onClick={onToggleDragMode} className={`p-1.5 rounded hover:bg-[#1E3A5F] transition-colors ${isDragMode ? 'text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-gray-400 hover:text-white'}`} title={t.dragMode}>
              <lucide_react_1.Hand size={18}/>
            </button>
            <button onClick={onToggleLines} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.toggleLines}>
              <lucide_react_1.ArrowRightToLine size={18} className={`transform transition-transform duration-300 ${useCurvedLines ? 'scale-x-[-1]' : ''}`}/>
            </button>
            <button onClick={onSave} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.save}>
              <lucide_react_1.Save size={18}/>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.uploadBackground}>
              <lucide_react_1.Upload size={18}/>
            </button>
          </div>
        </div>

        {selectedNode && selectedNodeData && (<div className="flex items-center gap-1">
            <button onClick={() => onEditParagraph(selectedNode)} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.edit}>
              <lucide_react_1.Edit3 size={18}/>
            </button>
            <button onClick={() => onDeleteParagraph(selectedNode)} className="p-1.5 rounded hover:bg-[#1E3A5F] text-gray-400 hover:text-white transition-colors" title={t.delete}>
              <lucide_react_1.Trash2 size={18}/>
            </button>
            <button onClick={() => onToggleNodeLock(selectedNode)} className="p-1.5 rounded hover:bg-[#1E3A5F] transition-colors" title={selectedNodeData.locked ? t.unlock : t.lock}>
              {selectedNodeData.locked ? (<lucide_react_1.Lock size={18} className="text-red-500"/>) : (<lucide_react_1.Unlock size={18} className="text-green-500"/>)}
            </button>
          </div>)}

        <div className="text-sm text-gray-400">
          {lastBackup ? (<>{t.autoBackup} {(0, utils_1.formatBackupTime)(lastBackup)}</>) : (t.backup)}
        </div>
      </div>

      {selectedNode && selectedNodeData && (<div className="flex-none h-8 px-4 bg-[#1E3A5F] text-white text-sm flex items-center justify-between">
          <div>
            {t.selected}: #{selectedNode} {selectedNodeData.title}
          </div>
          {selectedAction !== null && (<div className="text-yellow-300">
              {`${t.action} ${selectedAction + 1}`}
            </div>)}
        </div>)}
    </div>);
};
exports.StoryMapControls = StoryMapControls;
