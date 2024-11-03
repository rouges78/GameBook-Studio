import React from 'react';
import { StoryMapProps } from './types';
import { translations } from './translations';
import { useStoryMap } from './hooks/useStoryMap';
import { StoryMapControls } from './components/StoryMapControls';
import { StoryMapCanvas } from './components/StoryMapCanvas';
import { ImageControls } from './components/ImageControls';
import { ActionButtons } from './components/ActionButtons';

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
  const t = translations[language];

  const handleClose = () => {
    // First update paragraphs to save positions
    if (onUpdateParagraphs) {
      const updatedParagraphs = paragraphs.map(p => {
        const node = state.nodes.find(n => n.id === p.id);
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
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A1929] overflow-hidden">
      {/* Hidden file input for background image */}
      <input
        type="file"
        ref={state.fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={actions.handleBackgroundUpload}
      />

      {/* Header */}
      <div className="flex-none h-14 border-b border-gray-700">
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
          onToggleGrid={() => actions.setShowGrid(!state.showGrid)}
          onToggleDragMode={() => actions.setIsDragMode(!state.isDragMode)}
          onToggleLines={() => actions.setUseCurvedLines(!state.useCurvedLines)}
          onSave={actions.handleManualSave}
          onEditParagraph={onEditParagraph}
          onDeleteParagraph={onDeleteParagraph}
          onToggleNodeLock={actions.toggleNodeLock}
          onActionSelect={actions.handleActionSelect}
        />
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

        {state.backgroundImage && (
          <div className="absolute bottom-4 right-4 z-10">
            <ImageControls
              imageAdjustments={state.imageAdjustments}
              onAdjustment={actions.handleImageAdjustment}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-none h-14 border-t border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm">
            {state.selectedNode ? `Selected Node: ${state.selectedNode}` : 'No node selected'}
          </div>
          {state.selectedNode && (
            <ActionButtons
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
  );
};

export default StoryMap;
