"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const translations_1 = require("./translations");
const useStoryMap_1 = require("./hooks/useStoryMap");
const useKeyboardShortcuts_1 = require("./hooks/useKeyboardShortcuts");
const Toast_1 = require("./components/Toast");
const StoryMapControls_1 = require("./components/StoryMapControls");
const StoryMapCanvas_1 = require("./components/StoryMapCanvas");
const ImageControls_1 = require("./components/ImageControls");
const ActionButtons_1 = require("./components/ActionButtons");
const MiniMap_1 = require("./components/MiniMap");
const KeyboardShortcutsHelp_1 = require("./components/KeyboardShortcutsHelp");
const ZOOM_STEP = 0.1;
const StoryMap = ({ paragraphs, mapSettings, onClose, isDarkMode, language = 'it', onEditParagraph, onDeleteParagraph, onAddNote, onAddParagraph, onLinkParagraphs, onSave, onUpdateParagraphs, onUpdateMapSettings }) => {
    const { state, actions } = (0, useStoryMap_1.useStoryMap)(paragraphs, mapSettings, onSave, onUpdateParagraphs, onUpdateMapSettings);
    const [showShortcutsHelp, setShowShortcutsHelp] = (0, react_1.useState)(false);
    const { messages, showToast, removeMessage } = (0, Toast_1.useToast)();
    const t = translations_1.translations[language];
    const handleClose = () => {
        // First update paragraphs to save positions
        if (onUpdateParagraphs) {
            const updatedParagraphs = paragraphs.map(p => {
                const node = state.nodes.find((n) => n.id === p.id);
                if (!node)
                    return p;
                return {
                    ...p,
                    x: node.x,
                    y: node.y,
                    locked: node.locked,
                    title: node.title,
                    type: node.type,
                    actions: node.actions
                };
            });
            onUpdateParagraphs(updatedParagraphs);
        }
        // Then save map settings
        if (onUpdateMapSettings) {
            onUpdateMapSettings({
                backgroundImage: state.backgroundImage,
                imageAdjustments: state.imageAdjustments
            });
        }
        // Then save nodes to ensure positions are included
        if (onSave) {
            onSave(state.nodes);
            showToast('Changes saved successfully', 'success');
        }
        onClose();
    };
    const handleViewBoxChange = (x, y) => {
        actions.setViewBox({
            ...state.viewBox,
            x,
            y
        });
    };
    const handleZoomIn = () => {
        const newZoom = state.zoom + ZOOM_STEP;
        if (newZoom <= 4) {
            actions.handleZoom(ZOOM_STEP);
            showToast('Zoomed in', 'info');
        }
        else {
            showToast('Maximum zoom reached', 'warning');
        }
    };
    const handleZoomOut = () => {
        const newZoom = state.zoom - ZOOM_STEP;
        if (newZoom >= 0.25) {
            actions.handleZoom(-ZOOM_STEP);
            showToast('Zoomed out', 'info');
        }
        else {
            showToast('Minimum zoom reached', 'warning');
        }
    };
    const handleZoomReset = () => {
        actions.setZoom(1);
        showToast('Zoom reset to 100%', 'success');
    };
    const handleToggleGrid = () => {
        actions.setShowGrid(!state.showGrid);
        showToast(state.showGrid ? 'Grid hidden' : 'Grid shown', 'info');
    };
    const handleToggleDragMode = () => {
        actions.setIsDragMode(!state.isDragMode);
        showToast(state.isDragMode ? 'Drag mode disabled' : 'Drag mode enabled', 'info');
    };
    const handleSave = async () => {
        try {
            await actions.handleManualSave();
            showToast('Map saved successfully', 'success');
        }
        catch (error) {
            showToast('Failed to save map', 'error');
        }
    };
    const handleNodeLock = (id) => {
        const node = state.nodes.find(n => n.id === id);
        if (node) {
            actions.toggleNodeLock(id);
            showToast(node.locked ? 'Node unlocked' : 'Node locked', 'info');
        }
    };
    const handleBackgroundUpload = async (event) => {
        try {
            await actions.handleBackgroundUpload(event);
            showToast('Background image uploaded successfully', 'success');
        }
        catch (error) {
            showToast('Failed to upload background image', 'error');
        }
    };
    // Keyboard shortcuts handlers
    (0, useKeyboardShortcuts_1.useKeyboardShortcuts)({
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
        onZoomReset: handleZoomReset,
        onToggleGrid: handleToggleGrid,
        onToggleDragMode: handleToggleDragMode,
        onSave: handleSave,
        onEscape: handleClose,
        isEnabled: true
    });
    return (<div className="fixed inset-0 z-50 flex flex-col bg-[#0A1929] overflow-hidden">
      {/* Hidden file input for background image */}
      <input type="file" ref={state.fileInputRef} className="hidden" accept="image/*" onChange={handleBackgroundUpload}/>

      {/* Header */}
      <div className="flex-none h-14 border-b border-gray-700 flex items-center justify-between px-4">
        <StoryMapControls_1.StoryMapControls selectedNode={state.selectedNode} selectedAction={state.selectedAction} nodes={state.nodes} isDragMode={state.isDragMode} useCurvedLines={state.useCurvedLines} lastBackup={state.lastBackup} t={t} fileInputRef={state.fileInputRef} onClose={handleClose} onZoom={actions.handleZoom} onToggleGrid={handleToggleGrid} onToggleDragMode={handleToggleDragMode} onToggleLines={() => actions.setUseCurvedLines(!state.useCurvedLines)} onSave={handleSave} onEditParagraph={onEditParagraph} onDeleteParagraph={onDeleteParagraph} onToggleNodeLock={handleNodeLock} onActionSelect={actions.handleActionSelect}/>
        <KeyboardShortcutsHelp_1.KeyboardShortcutsHelp />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <StoryMapCanvas_1.StoryMapCanvas svgRef={state.svgRef} nodes={state.nodes} links={state.links} viewBox={state.viewBox} showGrid={state.showGrid} backgroundImage={state.backgroundImage} imageAdjustments={state.imageAdjustments} useCurvedLines={state.useCurvedLines} selectedNode={state.selectedNode} isDragMode={state.isDragMode} onNodeClick={(id) => actions.setSelectedNode(id === state.selectedNode ? null : id)} onNodeDragStart={actions.handleNodeDragStart} onMapPanStart={actions.handleMapPanStart} onMapPan={actions.handleMapPan} onMapPanEnd={actions.handleMapPanEnd} onNodeDrag={actions.handleNodeDrag} onNodeDragEnd={actions.handleNodeDragEnd} onZoom={actions.handleZoom}/>

        {/* MiniMap */}
        <MiniMap_1.MiniMap nodes={state.nodes} links={state.links} viewBox={state.viewBox} mapWidth={state.imageAdjustments.width} mapHeight={state.imageAdjustments.height} onViewBoxChange={handleViewBoxChange}/>

        {state.backgroundImage && (<div className="absolute bottom-4 right-4 z-10">
            <ImageControls_1.ImageControls imageAdjustments={state.imageAdjustments} onAdjustment={actions.handleImageAdjustment} t={t}/>
          </div>)}

        {/* Toast Messages */}
        <Toast_1.ToastManager messages={messages} onMessageComplete={removeMessage}/>
      </div>

      {/* Footer */}
      <div className="flex-none h-14 border-t border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm">
            {state.selectedNode ? `Selected Node: ${state.selectedNode}` : 'No node selected'}
          </div>
          {state.selectedNode && (<ActionButtons_1.ActionButtons selectedNode={state.selectedNode} nodes={state.nodes} selectedAction={state.selectedAction} onActionSelect={actions.handleActionSelect}/>)}
        </div>
        <div className="text-gray-400 text-sm">
          {state.lastBackup ? `Last saved: ${new Date(state.lastBackup).toLocaleTimeString()}` : 'Not saved yet'}
        </div>
      </div>
    </div>);
};
exports.default = StoryMap;
