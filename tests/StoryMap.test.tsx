import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import StoryMap from '../src/components/StoryMap';
import { useStoryMap } from '../src/components/StoryMap/hooks/useStoryMap';
import { useKeyboardShortcuts } from '../src/components/StoryMap/hooks/useKeyboardShortcuts';
import { useToast } from '../src/components/StoryMap/components/Toast';
import type { ImageAdjustments, StoryMapProps } from '../src/components/StoryMap/types';

// Mock the hooks and components
jest.mock('../src/components/StoryMap/hooks/useStoryMap');
jest.mock('../src/components/StoryMap/hooks/useKeyboardShortcuts');
jest.mock('../src/components/StoryMap/components/Toast');
jest.mock('../src/components/StoryMap/components/StoryMapControls', () => ({
  StoryMapControls: () => <div data-testid="story-map-controls">Controls</div>
}));
jest.mock('../src/components/StoryMap/components/StoryMapCanvas', () => ({
  StoryMapCanvas: () => <div data-testid="story-map-canvas">Canvas</div>
}));
jest.mock('../src/components/StoryMap/components/MiniMap', () => ({
  MiniMap: () => <div data-testid="mini-map">MiniMap</div>
}));

describe('StoryMap Component', () => {
  const defaultImageAdjustments: ImageAdjustments = {
    contrast: 1,
    transparency: 1,
    blackAndWhite: 0,
    sharpness: 1,
    brightness: 1,
    width: 1000,
    height: 800,
    maintainAspectRatio: true
  };

  const defaultProps: StoryMapProps = {
    paragraphs: [],
    mapSettings: {
      backgroundImage: null,
      imageAdjustments: defaultImageAdjustments
    },
    onClose: jest.fn(),
    isDarkMode: false,
    language: 'it',
    onEditParagraph: jest.fn(),
    onDeleteParagraph: jest.fn(),
    onAddNote: jest.fn(),
    onAddParagraph: jest.fn(),
    onLinkParagraphs: jest.fn(),
    onSave: jest.fn(),
    onUpdateParagraphs: jest.fn(),
    onUpdateMapSettings: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    (useStoryMap as jest.Mock).mockReturnValue({
      state: {
        nodes: [],
        links: [],
        selectedNode: null,
        viewBox: { x: 0, y: 0, width: 1000, height: 800 },
        zoom: 1,
        showGrid: false,
        isDragMode: false,
        backgroundImage: null,
        imageAdjustments: defaultImageAdjustments,
        useCurvedLines: true,
        lastBackup: null,
        fileInputRef: { current: null },
        svgRef: { current: null }
      },
      actions: {
        setSelectedNode: jest.fn(),
        handleNodeDragStart: jest.fn(),
        handleNodeDrag: jest.fn(),
        handleNodeDragEnd: jest.fn(),
        handleMapPanStart: jest.fn(),
        handleMapPan: jest.fn(),
        handleMapPanEnd: jest.fn(),
        handleZoom: jest.fn(),
        handleImageAdjustment: jest.fn(),
        handleActionSelect: jest.fn(),
        handleManualSave: jest.fn(),
        handleBackgroundUpload: jest.fn(),
        setShowGrid: jest.fn(),
        setIsDragMode: jest.fn(),
        setUseCurvedLines: jest.fn(),
        setZoom: jest.fn(),
        setViewBox: jest.fn(),
        toggleNodeLock: jest.fn()
      }
    });

    (useKeyboardShortcuts as jest.Mock).mockImplementation((config) => {
      config.registerShortcuts?.();
      return {
        registerShortcuts: config.registerShortcuts || jest.fn(),
        unregisterShortcuts: config.unregisterShortcuts || jest.fn()
      };
    });

    (useToast as jest.Mock).mockReturnValue({
      messages: [],
      showToast: jest.fn(),
      removeMessage: jest.fn()
    });
  });

  test('renders without crashing', () => {
    render(<StoryMap {...defaultProps} />);
    expect(screen.getByTestId('story-map-controls')).toBeInTheDocument();
    expect(screen.getByTestId('story-map-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('mini-map')).toBeInTheDocument();
  });

  test('handles save action', async () => {
    const mockShowToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      messages: [],
      showToast: mockShowToast,
      removeMessage: jest.fn()
    });

    const { actions } = (useStoryMap as jest.Mock).mock.results[0].value;
    actions.handleManualSave.mockResolvedValueOnce(undefined);
    
    render(<StoryMap {...defaultProps} />);
    
    // Trigger save through keyboard shortcut handler
    const shortcutsConfig = (useKeyboardShortcuts as jest.Mock).mock.calls[0][0];
    await shortcutsConfig.onSave();
    
    expect(actions.handleManualSave).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('Map saved successfully', 'success');
  });

  test('handles close action with saving', () => {
    const mockNodes = [
      { id: 1, x: 100, y: 100, locked: false, title: 'Node 1', type: 'normale' as const, actions: [] }
    ];
    
    (useStoryMap as jest.Mock).mockReturnValue({
      state: {
        nodes: mockNodes,
        backgroundImage: 'test.jpg',
        imageAdjustments: defaultImageAdjustments
      },
      actions: {
        handleManualSave: jest.fn()
      }
    });

    render(<StoryMap {...defaultProps} />);
    
    // Trigger close through keyboard shortcut handler
    const shortcutsConfig = (useKeyboardShortcuts as jest.Mock).mock.calls[0][0];
    shortcutsConfig.onEscape();
    
    expect(defaultProps.onUpdateParagraphs).toHaveBeenCalled();
    expect(defaultProps.onUpdateMapSettings).toHaveBeenCalled();
    expect(defaultProps.onSave).toHaveBeenCalledWith(mockNodes);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('handles zoom controls', () => {
    const mockShowToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      messages: [],
      showToast: mockShowToast,
      removeMessage: jest.fn()
    });

    const mockHandleZoom = jest.fn();
    const mockSetZoom = jest.fn();
    (useStoryMap as jest.Mock).mockReturnValue({
      state: { zoom: 1 },
      actions: {
        handleZoom: mockHandleZoom,
        setZoom: mockSetZoom
      }
    });

    render(<StoryMap {...defaultProps} />);
    
    const shortcutsConfig = (useKeyboardShortcuts as jest.Mock).mock.calls[0][0];
    
    // Test zoom in
    shortcutsConfig.onZoomIn();
    expect(mockHandleZoom).toHaveBeenCalledWith(0.1);
    expect(mockShowToast).toHaveBeenCalledWith('Zoomed in', 'info');
    
    // Test zoom out
    shortcutsConfig.onZoomOut();
    expect(mockHandleZoom).toHaveBeenCalledWith(-0.1);
    expect(mockShowToast).toHaveBeenCalledWith('Zoomed out', 'info');
    
    // Test zoom reset
    shortcutsConfig.onZoomReset();
    expect(mockSetZoom).toHaveBeenCalledWith(1);
    expect(mockShowToast).toHaveBeenCalledWith('Zoom reset to 100%', 'success');
  });
});
