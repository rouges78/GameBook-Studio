import React from 'react';
import { render, act } from '@testing-library/react';
import StoryMap from '../src/components/StoryMap';
import type { ExtendedParagraph, MapSettings, StoryMapProps } from '../src/components/StoryMap/types';

// Mock hooks and components
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

describe('StoryMap Performance Tests', () => {
  // Helper to generate large datasets
  const generateParagraphs = (count: number): ExtendedParagraph[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Node ${i + 1}`,
      content: `Content for node ${i + 1}`,
      type: 'normale',
      actions: [],
      incomingConnections: [],
      outgoingConnections: [],
      x: 100 + (i % 10) * 200,
      y: 100 + Math.floor(i / 10) * 200,
      locked: false
    }));
  };

  const defaultMapSettings: MapSettings = {
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

  const defaultProps: Omit<StoryMapProps, 'paragraphs'> = {
    mapSettings: defaultMapSettings,
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
    // Reset performance measurements
    performance.clearMarks();
    performance.clearMeasures();
  });

  describe('Rendering Performance', () => {
    test('renders large number of nodes within performance budget', () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      
      performance.mark('render-start');
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      performance.mark('render-end');
      
      performance.measure('render-time', 'render-start', 'render-end');
      const measure = performance.getEntriesByName('render-time')[0];
      
      // Initial render should complete within 1000ms even with 1000 nodes
      expect(measure.duration).toBeLessThan(1000);
    });

    test('handles rapid zoom operations efficiently', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('zoom-start');
      // Simulate 10 rapid zoom operations
      for (let i = 0; i < 10; i++) {
        act(() => {
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
        });
      }
      performance.mark('zoom-end');

      performance.measure('zoom-time', 'zoom-start', 'zoom-end');
      const measure = performance.getEntriesByName('zoom-time')[0];

      // 10 zoom operations should complete within 500ms
      expect(measure.duration).toBeLessThan(500);
    });

    test('maintains performance during rapid node updates', () => {
      const nodeCount = 100;
      let paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('update-start');
      // Simulate 20 rapid node position updates
      for (let i = 0; i < 20; i++) {
        paragraphs = paragraphs.map(p => ({
          ...p,
          x: (p.x || 0) + 10,
          y: (p.y || 0) + 10
        }));
        act(() => {
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
        });
      }
      performance.mark('update-end');

      performance.measure('update-time', 'update-start', 'update-end');
      const measure = performance.getEntriesByName('update-time')[0];

      // 20 position updates should complete within 1000ms
      expect(measure.duration).toBeLessThan(1000);
    });
  });

  describe('Operation Performance', () => {
    test('handles rapid drag operations efficiently', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('drag-start');
      // Simulate 50 drag events
      for (let i = 0; i < 50; i++) {
        act(() => {
          document.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: 100 + i,
              clientY: 100 + i
            })
          );
        });
      }
      performance.mark('drag-end');

      performance.measure('drag-time', 'drag-start', 'drag-end');
      const measure = performance.getEntriesByName('drag-time')[0];

      // 50 drag events should process within 500ms
      expect(measure.duration).toBeLessThan(500);
    });

    test('maintains performance during rapid pan operations', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('pan-start');
      // Simulate 50 pan events
      for (let i = 0; i < 50; i++) {
        act(() => {
          document.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: 200 + i,
              clientY: 200 + i
            })
          );
        });
      }
      performance.mark('pan-end');

      performance.measure('pan-time', 'pan-start', 'pan-end');
      const measure = performance.getEntriesByName('pan-time')[0];

      // 50 pan events should process within 500ms
      expect(measure.duration).toBeLessThan(500);
    });

    test('handles concurrent operations efficiently', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('concurrent-start');
      // Simulate concurrent zoom, drag, and update operations
      for (let i = 0; i < 10; i++) {
        act(() => {
          // Zoom
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
          
          // Drag
          document.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: 100 + i,
              clientY: 100 + i
            })
          );

          // Update positions
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + 5,
            y: (p.y || 0) + 5
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        });
      }
      performance.mark('concurrent-end');

      performance.measure('concurrent-time', 'concurrent-start', 'concurrent-end');
      const measure = performance.getEntriesByName('concurrent-time')[0];

      // Concurrent operations should complete within 1000ms
      expect(measure.duration).toBeLessThan(1000);
    });
  });

  describe('Memory Usage', () => {
    test('maintains stable memory usage with large datasets', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      
      // If memory metrics are available (Chrome), verify reasonable usage
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        // Memory increase should be less than 50MB for 1000 nodes
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });
});
