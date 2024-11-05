import { renderHook, act } from '@testing-library/react';
import { useStoryMap } from '../src/components/StoryMap/hooks/useStoryMap';
import type { ExtendedParagraph, Node, MapSettings } from '../src/components/StoryMap/types';

describe('useStoryMap Hook', () => {
  const mockParagraphs: ExtendedParagraph[] = [
    {
      id: 1,
      title: 'Node 1',
      content: 'Content 1',
      type: 'normale',
      actions: [],
      incomingConnections: [],
      outgoingConnections: []
    }
  ];

  const mockMapSettings: MapSettings = {
    backgroundImage: null,
    imageAdjustments: {
      contrast: 100,
      transparency: 100,
      blackAndWhite: 0,
      sharpness: 100,
      brightness: 100,
      width: 1000,
      height: 800,
      maintainAspectRatio: true
    }
  };

  const mockOnSave = jest.fn();
  const mockOnUpdateParagraphs = jest.fn();
  const mockOnUpdateMapSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Node Initialization', () => {
    test('initializes nodes with saved positions', () => {
      const paragraphsWithPositions: ExtendedParagraph[] = [
        {
          ...mockParagraphs[0],
          x: 100,
          y: 200
        }
      ];

      const { result } = renderHook(() =>
        useStoryMap(
          paragraphsWithPositions,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      expect(result.current.state.nodes[0]).toEqual(
        expect.objectContaining({
          id: 1,
          x: 100,
          y: 200
        })
      );
    });

    test('assigns grid positions for nodes without saved positions', () => {
      const manyParagraphs: ExtendedParagraph[] = Array.from({ length: 6 }, (_, i) => ({
        ...mockParagraphs[0],
        id: i + 1
      }));

      const { result } = renderHook(() =>
        useStoryMap(
          manyParagraphs,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      // Check grid positioning (100 + (index % 5) * 200 for x, 100 + Math.floor(index / 5) * 200 for y)
      expect(result.current.state.nodes[0].x).toBe(100); // First column
      expect(result.current.state.nodes[0].y).toBe(100); // First row
      expect(result.current.state.nodes[5].x).toBe(100); // Back to first column
      expect(result.current.state.nodes[5].y).toBe(300); // Second row
    });
  });

  describe('Node Boundary Constraints', () => {
    test('constrains node position within map bounds during drag', () => {
      const { result } = renderHook(() =>
        useStoryMap(
          mockParagraphs,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      // Enable drag mode
      act(() => {
        result.current.actions.setIsDragMode(true);
      });

      // Start dragging
      act(() => {
        result.current.actions.handleNodeDragStart(
          { clientX: 0, clientY: 0 } as React.MouseEvent,
          1
        );
      });

      // Attempt to drag beyond bounds
      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: -100, clientY: -100 } as React.MouseEvent
        );
      });

      // Node should be constrained to minimum bounds (30px padding)
      expect(result.current.state.nodes[0].x).toBe(30);
      expect(result.current.state.nodes[0].y).toBe(30);

      // Attempt to drag beyond maximum bounds
      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: 2000, clientY: 2000 } as React.MouseEvent
        );
      });

      // Node should be constrained to maximum bounds (width/height - 30px padding)
      expect(result.current.state.nodes[0].x).toBe(970); // 1000 - 30
      expect(result.current.state.nodes[0].y).toBe(770); // 800 - 30
    });

    test('prevents dragging of locked nodes', () => {
      const paragraphWithLockedNode: ExtendedParagraph[] = [
        {
          ...mockParagraphs[0],
          locked: true,
          x: 100,
          y: 100
        }
      ];

      const { result } = renderHook(() =>
        useStoryMap(
          paragraphWithLockedNode,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      // Enable drag mode
      act(() => {
        result.current.actions.setIsDragMode(true);
      });

      // Initial position
      const initialX = result.current.state.nodes[0].x;
      const initialY = result.current.state.nodes[0].y;

      // Attempt to drag locked node
      act(() => {
        result.current.actions.handleNodeDragStart(
          { clientX: 0, clientY: 0 } as React.MouseEvent,
          1
        );
      });

      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: 100, clientY: 100 } as React.MouseEvent
        );
      });

      // Position should remain unchanged
      expect(result.current.state.nodes[0].x).toBe(initialX);
      expect(result.current.state.nodes[0].y).toBe(initialY);
    });

    test('prevents dragging when not in drag mode', () => {
      const { result } = renderHook(() =>
        useStoryMap(
          mockParagraphs,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      // Initial position
      const initialX = result.current.state.nodes[0].x;
      const initialY = result.current.state.nodes[0].y;

      // Attempt to drag with drag mode disabled
      act(() => {
        result.current.actions.handleNodeDragStart(
          { clientX: 0, clientY: 0 } as React.MouseEvent,
          1
        );
      });

      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: 100, clientY: 100 } as React.MouseEvent
        );
      });

      // Position should remain unchanged
      expect(result.current.state.nodes[0].x).toBe(initialX);
      expect(result.current.state.nodes[0].y).toBe(initialY);
    });
  });

  describe('Node Position with Zoom', () => {
    test('adjusts node drag distance based on zoom level', () => {
      const { result } = renderHook(() =>
        useStoryMap(
          mockParagraphs,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      // Enable drag mode
      act(() => {
        result.current.actions.setIsDragMode(true);
      });

      // Set zoom to 2x
      act(() => {
        result.current.actions.setZoom(2);
      });

      // Start dragging
      act(() => {
        result.current.actions.handleNodeDragStart(
          { clientX: 0, clientY: 0 } as React.MouseEvent,
          1
        );
      });

      // Drag 100px at 2x zoom (should move node 50px)
      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: 100, clientY: 100 } as React.MouseEvent
        );
      });

      const draggedNode = result.current.state.nodes[0];
      const expectedMove = 100 / 2; // 100px movement at 2x zoom = 50px actual movement

      // Allow for small floating-point differences
      expect(Math.abs(draggedNode.x - (result.current.state.nodes[0].x + expectedMove))).toBeLessThan(0.1);
      expect(Math.abs(draggedNode.y - (result.current.state.nodes[0].y + expectedMove))).toBeLessThan(0.1);
    });

    test('maintains node constraints at different zoom levels', () => {
      const { result } = renderHook(() =>
        useStoryMap(
          mockParagraphs,
          mockMapSettings,
          mockOnSave,
          mockOnUpdateParagraphs,
          mockOnUpdateMapSettings
        )
      );

      // Enable drag mode
      act(() => {
        result.current.actions.setIsDragMode(true);
      });

      // Test at minimum zoom (0.25)
      act(() => {
        result.current.actions.setZoom(0.25);
      });

      // Start dragging
      act(() => {
        result.current.actions.handleNodeDragStart(
          { clientX: 0, clientY: 0 } as React.MouseEvent,
          1
        );
      });

      // Attempt to drag beyond bounds at minimum zoom
      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: -1000, clientY: -1000 } as React.MouseEvent
        );
      });

      // Node should still be constrained to minimum bounds
      expect(result.current.state.nodes[0].x).toBe(30);
      expect(result.current.state.nodes[0].y).toBe(30);

      // Test at maximum zoom (4)
      act(() => {
        result.current.actions.setZoom(4);
      });

      // Attempt to drag beyond bounds at maximum zoom
      act(() => {
        result.current.actions.handleNodeDrag(
          { clientX: 5000, clientY: 5000 } as React.MouseEvent
        );
      });

      // Node should still be constrained to maximum bounds
      expect(result.current.state.nodes[0].x).toBe(970);
      expect(result.current.state.nodes[0].y).toBe(770);
    });
  });
});
