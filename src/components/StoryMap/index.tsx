import React, { useState } from 'react';
import { StoryMapProps, Node } from './types';
import { translations } from './translations';
import { useStoryMap } from './hooks/useStoryMap';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToast, ToastManager } from './components/Toast';
import { StoryMapControls } from './components/StoryMapControls';
import { StoryMapCanvas } from './components/StoryMapCanvas';
import { ImageControls } from './components/ImageControls';
import { ActionButtons } from './components/ActionButtons';
import { MiniMap } from './components/MiniMap';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { SidePanel } from './components/SidePanel';

const ZOOM_STEP = 0.1;

const StoryMap: React.FC<StoryMapProps> = ({
  paragraphs,
  mapSettings,
  onClose,
  isDarkMode,
  language = 'it',
  onEditParagraph,
  onDeleteParagraph,
  onAddNote,
  onAddParagraph,
  onLinkParagraphs,
  onSave,
  onUpdateParagraphs,
  onUpdateMapSettings
}) => {
  const { state, actions } = useStoryMap(
    paragraphs,
    mapSettings,
    onSave,
    onUpdateParagraphs,
    onUpdateMapSettings
  );
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const { messages, showToast, removeMessage } = useToast();
  const t = translations[language];

  const handleClose = () => {
    // First update paragraphs to save positions
    if (onUpdateParagraphs) {
      const updatedParagraphs = paragraphs.map(p => {
        const node = state.nodes.find((n: Node) => n.id === p.id);
        if (!node) return p;
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

  const handleViewBoxChange = (x: number, y: number) => {
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
    } else {
      showToast('Maximum zoom reached', 'warning');
    }
  };

  const handleZoomOut = () => {
    const newZoom = state.zoom - ZOOM_STEP;
    if (newZoom >= 0.25) {
      actions.handleZoom(-ZOOM_STEP);
      showToast('Zoomed out', 'info');
    } else {
      showToast('Minimum zoom reached', 'warning');
    }
  };

  const handleZoomReset = () => {
    actions.setZoom(1);
    showToast('Zoom reset to 100%', 'success');
  };

  const handleToggleGrid = () => {
    actions.setShowGrid(!state.showGrid);
    showToast(
      state.showGrid ? 'Grid hidden' : 'Grid shown',
      'info'
    );
  };

  const handleToggleDragMode = () => {
    actions.setIsDragMode(!state.isDragMode);
    showToast(
      state.isDragMode ? 'Drag mode disabled' : 'Drag mode enabled',
      'info'
    );
  };

  const handleSave = async () => {
    try {
      await actions.handleManualSave();
      showToast('Map saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save map', 'error');
    }
  };

  const handleNodeLock = (id: number) => {
    const node = state.nodes.find(n => n.id === id);
    if (node) {
      actions.toggleNodeLock(id);
      showToast(
        node.locked ? 'Node unlocked' : 'Node locked',
        'info'
      );
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await actions.handleBackgroundUpload(event);
      showToast('Background image uploaded successfully', 'success');
    } catch (error) {
      showToast('Failed to upload background image', 'error');
    }
  };

  // Keyboard shortcuts handlers
  useKeyboardShortcuts({
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
    onToggleGrid: handleToggleGrid,
    onToggleDragMode: handleToggleDragMode,
    onSave: handleSave,
    onEscape: handleClose,
    isEnabled: true
  });

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0A1929] overflow-hidden">
      {/* Hidden file input for background image */}
      <input
        type="file"
        ref={state.fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleBackgroundUpload}
      />

      {/* Left Column */}
      <div className="w-80 bg-[#1A2B3B] border-r border-gray-700">
        <SidePanel
          onBack={handleClose}
          onUploadImage={() => state.fileInputRef.current?.click()}
          onImageAdjustment={actions.handleImageAdjustment}
          imageAdjustments={state.imageAdjustments}
          backgroundImage={state.backgroundImage}
          showGrid={state.showGrid}
          useCurvedLines={state.useCurvedLines}
          onToggleGrid={handleToggleGrid}
          onToggleLines={() => actions.setUseCurvedLines(!state.useCurvedLines)}
          onAddNode={() => actions.handleAddNode()}
          onDeleteNode={() => state.selectedNode && actions.handleDeleteNode(state.selectedNode)}
          onConnectNodes={() => actions.handleConnectNodes()}
          onDisconnectNodes={() => actions.handleDisconnectNodes()}
          onLockNode={(id) => actions.toggleNodeLock(id)}
          selectedNode={state.selectedNode}
          nodes={state.nodes}
          language={language}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-none h-14 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex-1">
            <StoryMapControls
              selectedNode={state.selectedNode}
              selectedAction={state.selectedAction}
              nodes={state.nodes}
              isDragMode={state.isDragMode}
              useCurvedLines={state.useCurvedLines}
              lastBackup={state.lastBackup}
              t={t}
              fileInputRef={state.fileInputRef}
              onClose={handleClose}
              onZoom={actions.handleZoom}
              onToggleGrid={handleToggleGrid}
              onToggleDragMode={handleToggleDragMode}
              onToggleLines={() => actions.setUseCurvedLines(!state.useCurvedLines)}
              onSave={handleSave}
              onEditParagraph={onEditParagraph}
              onDeleteParagraph={onDeleteParagraph}
              onToggleNodeLock={handleNodeLock}
              onActionSelect={actions.handleActionSelect}
            />
          </div>
          <div className="flex-none ml-4">
            <KeyboardShortcutsHelp />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <StoryMapCanvas
            svgRef={state.svgRef}
            nodes={state.nodes}
            links={state.links}
            viewBox={state.viewBox}
            showGrid={state.showGrid}
            backgroundImage={state.backgroundImage}
            imageAdjustments={state.imageAdjustments}
            useCurvedLines={state.useCurvedLines}
            selectedNode={state.selectedNode}
            isDragMode={state.isDragMode}
            onNodeClick={(id) => actions.setSelectedNode(id === state.selectedNode ? null : id)}
            onNodeDragStart={actions.handleNodeDragStart}
            onMapPanStart={actions.handleMapPanStart}
            onMapPan={actions.handleMapPan}
            onMapPanEnd={actions.handleMapPanEnd}
            onNodeDrag={actions.handleNodeDrag}
            onNodeDragEnd={actions.handleNodeDragEnd}
            onZoom={actions.handleZoom}
          />

          {/* MiniMap */}
          <MiniMap
            nodes={state.nodes}
            links={state.links}
            viewBox={state.viewBox}
            mapWidth={state.imageAdjustments.width}
            mapHeight={state.imageAdjustments.height}
            onViewBoxChange={handleViewBoxChange}
          />

          {state.backgroundImage && (
            <div className="absolute bottom-4 right-4 z-10">
              <ImageControls
                imageAdjustments={state.imageAdjustments}
                onAdjustment={actions.handleImageAdjustment}
                t={t}
              />
            </div>
          )}

          {/* Toast Messages */}
          <ToastManager
            messages={messages}
            onMessageComplete={removeMessage}
          />
        </div>

        {/* Footer */}
        <div className="flex-none h-14 border-t border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm">
              {state.selectedNode ? `Selected Node: ${state.selectedNode}` : 'No node selected'}
            </div>
            {state.selectedNode && (
              <ActionButtons
                key={`action-buttons-${state.selectedNode}`}
                selectedNode={state.selectedNode}
                nodes={state.nodes}
                selectedAction={state.selectedAction}
                onActionSelect={actions.handleActionSelect}
              />
            )}
          </div>
          <div className="text-gray-400 text-sm">
            {state.lastBackup ? `Last saved: ${new Date(state.lastBackup).toLocaleTimeString()}` : 'Not saved yet'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryMap;
