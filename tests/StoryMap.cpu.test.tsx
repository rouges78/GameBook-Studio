import React from 'react';
import { render, act } from '@testing-library/react';
import StoryMap from '../src/components/StoryMap';
import type { ExtendedParagraph, MapSettings, StoryMapProps, Node } from '../src/components/StoryMap/types';

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

interface ProfileResult {
  duration: number;
  cpuUsage: number;
}

// CPU profiling utilities
const startCPUProfile = () => {
  if (typeof window.performance.mark !== 'function') return;
  
  // Clear existing marks and measures
  performance.clearMarks();
  performance.clearMeasures();
  
  // Start profiling
  performance.mark('cpu-profile-start');
  
  // Record initial CPU usage if available
  if ((performance as any).cpu) {
    (performance as any).cpu.mark('cpu-usage-start');
  }
};

const endCPUProfile = (): ProfileResult => {
  if (typeof window.performance.mark !== 'function') {
    return { duration: 0, cpuUsage: 0 };
  }
  
  // End profiling
  performance.mark('cpu-profile-end');
  performance.measure('cpu-profile', 'cpu-profile-start', 'cpu-profile-end');
  
  // Record final CPU usage if available
  if ((performance as any).cpu) {
    (performance as any).cpu.mark('cpu-usage-end');
    (performance as any).cpu.measure('cpu-usage', 'cpu-usage-start', 'cpu-usage-end');
  }
  
  return {
    duration: performance.getEntriesByName('cpu-profile')[0]?.duration || 0,
    cpuUsage: (performance as any).getEntriesByName('cpu-usage')[0]?.cpuUsage || 0
  };
};

describe('StoryMap CPU Tests', () => {
  // Helper to generate test data
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

  // Helper to convert ExtendedParagraph to Node
  const toNodes = (paragraphs: ExtendedParagraph[]): Node[] => {
    return paragraphs.map(p => ({
      id: p.id,
      x: p.x || 0,
      y: p.y || 0,
      type: p.type,
      title: p.title,
      locked: p.locked || false,
      actions: p.actions,
      outgoingConnections: p.outgoingConnections || []
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('CPU Usage Patterns', () => {
    test('maintains efficient CPU usage during initial render', () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      
      startCPUProfile();
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      const profile = endCPUProfile();
      
      // Initial render should be CPU efficient
      expect(profile.duration).toBeLessThan(1000);
    });

    test('optimizes CPU usage during rapid operations', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      startCPUProfile();
      // Perform 50 rapid operations
      for (let i = 0; i < 50; i++) {
        act(() => {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + 1,
            y: (p.y || 0) + 1
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          jest.advanceTimersByTime(16); // Simulate 60fps
        });
      }
      const profile = endCPUProfile();
      
      // Should maintain reasonable CPU usage
      expect(profile.duration / 50).toBeLessThan(16); // Average 16ms per operation
    });

    test('handles background tasks efficiently', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      startCPUProfile();
      // Simulate background tasks (auto-save, position updates, etc.)
      act(() => {
        for (let i = 0; i < 10; i++) {
          defaultProps.onSave?.(toNodes(paragraphs));
          jest.advanceTimersByTime(1000); // Advance 1 second
        }
      });
      const profile = endCPUProfile();
      
      // Background tasks should have minimal CPU impact
      expect(profile.duration / 10).toBeLessThan(100); // Average 100ms per task
    });
  });

  describe('Resource Utilization', () => {
    test('manages memory allocation efficiently', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      
      startCPUProfile();
      const { rerender, unmount } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Perform memory-intensive operations
      for (let i = 0; i < 100; i++) {
        act(() => {
          const updatedParagraphs = [...paragraphs];
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        });
      }
      
      unmount();
      const profile = endCPUProfile();
      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      
      if (initialMemory && finalMemory) {
        // Memory growth should be proportional to data size
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(nodeCount * 1024); // Less than 1KB per node
      }
      
      // CPU usage should be reasonable
      expect(profile.duration).toBeLessThan(2000);
    });

    test('optimizes rendering cycles', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      
      startCPUProfile();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Track render cycles
      let renderCount = 0;
      
      // Perform operations that should batch renders
      for (let i = 0; i < 10; i++) {
        act(() => {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + 1,
            y: (p.y || 0) + 1
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          renderCount++;
        });
      }
      
      const profile = endCPUProfile();
      
      // Should batch renders efficiently
      expect(renderCount).toBeLessThan(10); // Should batch some renders
      expect(profile.duration / renderCount).toBeLessThan(16); // 60fps threshold
    });
  });

  describe('Performance Optimization', () => {
    test('implements efficient memoization', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      
      startCPUProfile();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Perform repeated operations with same data
      for (let i = 0; i < 10; i++) {
        act(() => {
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
        });
      }
      
      const profile = endCPUProfile();
      
      // Subsequent renders should be faster due to memoization
      expect(profile.duration / 10).toBeLessThan(8); // Average 8ms per render
    });

    test('handles concurrent operations efficiently', () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      
      startCPUProfile();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate concurrent operations
      act(() => {
        // Update positions
        const updatedParagraphs = paragraphs.map(p => ({
          ...p,
          x: (p.x || 0) + 1,
          y: (p.y || 0) + 1
        }));
        rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        
        // Trigger save
        defaultProps.onSave?.(toNodes(updatedParagraphs));
        
        // Update settings
        defaultProps.onUpdateMapSettings?.({
          ...defaultMapSettings,
          imageAdjustments: {
            ...defaultMapSettings.imageAdjustments,
            contrast: 110
          }
        });
      });
      
      const profile = endCPUProfile();
      
      // Concurrent operations should be handled efficiently
      expect(profile.duration).toBeLessThan(100);
    });
  });
});
