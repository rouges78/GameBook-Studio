import { renderHook, act } from '@testing-library/react';
import { useStoryMap } from '../src/components/StoryMap/hooks/useStoryMap';
import type { ExtendedParagraph, MapSettings, Node } from '../src/components/StoryMap/types';

// Mock useInertiaScroll hook
jest.mock('../src/components/StoryMap/hooks/useInertiaScroll', () => ({
  useInertiaScroll: () => ({
    startTracking: jest.fn(),
    updateTracking: jest.fn(),
    stopTracking: jest.fn()
  })
}));

describe('useStoryMap Hook', () => {
  const defaultImageAdjustments = {
    contrast: 100,
    transparency: 100,
    blackAndWhite: 0,
    sharpness: 100,
    brightness: 100,
    width: 1000,
    height: 800,
    maintainAspectRatio: true
  };

  const defaultMapSettings: MapSettings = {
    backgroundImage: null,
    imageAdjustments: defaultImageAdjustments
  };

  const mockParagraphs: ExtendedParagraph[] = [
    {
      id: 1,
      title: 'Test Node 1',
      type: 'normale',
      actions: [],
      x: 100,
      y: 100
    },
    {
      id: 2,
      title: 'Test Node 2',
      type: 'nodo',
      actions: [],
      x: 200,
      y: 200
    }
  ];

  const mockOnSave = jest.fn();
  const mockOnUpdateParagraphs = jest.fn();
  const mockOnUpdateMapSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with correct state', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    expect(result.current.state.nodes).toHaveLength(2);
    expect(result.current.state.nodes[0]).toMatchObject({
      id: 1,
      title: 'Test Node 1',
      x: 100,
      y: 100
    });
    expect(result.current.state.zoom).toBe(1);
    expect(result.current.state.showGrid).toBe(true);
    expect(result.current.state.isDragMode).toBe(false);
  });

  test('handles node selection', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    act(() => {
      result.current.actions.setSelectedNode(1);
    });

    expect(result.current.state.selectedNode).toBe(1);

    act(() => {
      result.current.actions.setSelectedNode(null);
    });

    expect(result.current.state.selectedNode).toBeNull();
  });

  test('handles node dragging', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    // Enable drag mode
    act(() => {
      result.current.actions.setIsDragMode(true);
    });

    const mockEvent = {
      clientX: 150,
      clientY: 150,
      preventDefault: jest.fn()
    } as unknown as React.MouseEvent;

    // Start dragging
    act(() => {
      result.current.actions.handleNodeDragStart(mockEvent, 1);
    });

    expect(result.current.state.isDragging).toBe(true);
    expect(result.current.state.selectedNode).toBe(1);

    // Perform drag
    const mockMoveEvent = {
      clientX: 200,
      clientY: 200,
      preventDefault: jest.fn()
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.actions.handleNodeDrag(mockMoveEvent);
    });

    const updatedNode = result.current.state.nodes.find(n => n.id === 1);
    expect(updatedNode?.x).not.toBe(100); // Position should have changed
    expect(updatedNode?.y).not.toBe(100);

    // End dragging
    act(() => {
      result.current.actions.handleNodeDragEnd();
    });

    expect(result.current.state.isDragging).toBe(false);
    expect(mockOnUpdateParagraphs).toHaveBeenCalled();
  });

  test('handles map panning', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    const mockEvent = {
      clientX: 100,
      clientY: 100,
      preventDefault: jest.fn()
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.actions.handleMapPanStart(mockEvent);
    });

    expect(result.current.state.isPanning).toBe(true);

    const mockMoveEvent = {
      clientX: 150,
      clientY: 150,
      preventDefault: jest.fn()
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.actions.handleMapPan(mockMoveEvent);
    });

    expect(result.current.state.viewBox.x).not.toBe(0);
    expect(result.current.state.viewBox.y).not.toBe(0);

    act(() => {
      result.current.actions.handleMapPanEnd();
    });

    expect(result.current.state.isPanning).toBe(false);
  });

  test('handles zoom controls', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    act(() => {
      result.current.actions.handleZoom(0.1); // Zoom in
    });

    expect(result.current.state.zoom).toBe(1.1);

    act(() => {
      result.current.actions.handleZoom(-0.1); // Zoom out
    });

    expect(result.current.state.zoom).toBe(1);
  });

  test('handles manual save', async () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    await act(async () => {
      await result.current.actions.handleManualSave();
    });

    expect(mockOnSave).toHaveBeenCalledWith(result.current.state.nodes);
    expect(mockOnUpdateParagraphs).toHaveBeenCalled();
    expect(mockOnUpdateMapSettings).toHaveBeenCalled();
  });

  test('handles grid toggle', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    act(() => {
      result.current.actions.setShowGrid(false);
    });

    expect(result.current.state.showGrid).toBe(false);

    act(() => {
      result.current.actions.setShowGrid(true);
    });

    expect(result.current.state.showGrid).toBe(true);
  });

  test('handles drag mode toggle', () => {
    const { result } = renderHook(() => useStoryMap(
      mockParagraphs,
      defaultMapSettings,
      mockOnSave,
      mockOnUpdateParagraphs,
      mockOnUpdateMapSettings
    ));

    act(() => {
      result.current.actions.setIsDragMode(true);
    });

    expect(result.current.state.isDragMode).toBe(true);

    act(() => {
      result.current.actions.setIsDragMode(false);
    });

    expect(result.current.state.isDragMode).toBe(false);
  });
});
