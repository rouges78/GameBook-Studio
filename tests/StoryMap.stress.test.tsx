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

describe('StoryMap Stress Tests', () => {
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
      x: 100 + (i % 50) * 200,
      y: 100 + Math.floor(i / 50) * 200,
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
      width: 10000,
      height: 8000,
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
    performance.clearMarks();
    performance.clearMeasures();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Extreme Load Tests', () => {
    test('handles extremely large number of nodes (5000+)', () => {
      const nodeCount = 5000;
      const paragraphs = generateParagraphs(nodeCount);
      
      performance.mark('render-start');
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      performance.mark('render-end');
      
      performance.measure('render-time', 'render-start', 'render-end');
      const measure = performance.getEntriesByName('render-time')[0];
      
      // Even with 5000 nodes, render should complete within 3 seconds
      expect(measure.duration).toBeLessThan(3000);
    });

    test('maintains stability during rapid consecutive operations', () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('operations-start');
      
      // Simulate 100 rapid consecutive operations
      for (let i = 0; i < 100; i++) {
        act(() => {
          // Zoom
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
          
          // Pan
          document.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: 100 + i,
              clientY: 100 + i
            })
          );

          // Node updates
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + 1,
            y: (p.y || 0) + 1
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        });
      }
      
      performance.mark('operations-end');
      performance.measure('operations-time', 'operations-start', 'operations-end');
      const measure = performance.getEntriesByName('operations-time')[0];
      
      // 100 consecutive operations should complete within 5 seconds
      expect(measure.duration).toBeLessThan(5000);
    });
  });

  describe('Long-Running Operation Tests', () => {
    test('maintains performance during extended drag sessions', () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('extended-drag-start');
      
      // Simulate 5 minutes of continuous dragging
      for (let i = 0; i < 300; i++) {
        act(() => {
          document.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: 100 + Math.sin(i) * 100,
              clientY: 100 + Math.cos(i) * 100
            })
          );
          jest.advanceTimersByTime(1000); // Advance 1 second
        });
      }
      
      performance.mark('extended-drag-end');
      performance.measure('extended-drag-time', 'extended-drag-start', 'extended-drag-end');
      const measure = performance.getEntriesByName('extended-drag-time')[0];
      
      // Extended drag operations should maintain consistent timing
      expect(measure.duration / 300).toBeLessThan(20); // Average 20ms per operation
    });

    test('handles continuous rapid zoom changes', () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      performance.mark('zoom-stress-start');
      
      // Simulate 1000 rapid zoom changes
      for (let i = 0; i < 1000; i++) {
        act(() => {
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
          jest.advanceTimersByTime(16); // Simulate 60fps
        });
      }
      
      performance.mark('zoom-stress-end');
      performance.measure('zoom-stress-time', 'zoom-stress-start', 'zoom-stress-end');
      const measure = performance.getEntriesByName('zoom-stress-time')[0];
      
      // Should maintain 60fps (16.67ms per frame)
      expect(measure.duration / 1000).toBeLessThan(17);
    });
  });

  describe('Memory Leak Tests', () => {
    test('maintains stable memory usage during extended operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender, unmount } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Record memory after initial render
      const afterRenderMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Perform 1000 operations
      for (let i = 0; i < 1000; i++) {
        act(() => {
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
          jest.advanceTimersByTime(16);
        });
      }
      
      // Record memory after operations
      const afterOperationsMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Unmount and garbage collect
      unmount();
      (global as any).gc?.();
      
      // Record final memory
      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      
      if (initialMemory && afterRenderMemory && afterOperationsMemory && finalMemory) {
        // Memory growth during operations should be reasonable
        const operationsGrowth = afterOperationsMemory - afterRenderMemory;
        expect(operationsGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
        
        // Memory should be mostly recovered after cleanup
        const memoryLeak = finalMemory - initialMemory;
        expect(memoryLeak).toBeLessThan(10 * 1024 * 1024); // Less than 10MB retained
      }
    });
  });

  describe('Error Recovery Tests', () => {
    test('recovers from rapid state changes with errors', () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);

      // Simulate 100 operations with random errors
      for (let i = 0; i < 100; i++) {
        act(() => {
          if (Math.random() < 0.1) {
            // 10% chance of error
            throw new Error('Simulated error');
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + 1,
            y: (p.y || 0) + 1
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        });
      }

      // Component should still be functional
      expect(() => {
        rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      }).not.toThrow();
    });
  });
});
