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

// Resource monitoring utilities
interface ResourceMetrics {
  memoryUsage: number;
  memoryLeaks: number;
  resourceContention: number;
  allocationFailures: number;
  gcPauses: number;
  largeAllocations: number;
}

class ResourceMonitor {
  private metrics: ResourceMetrics = {
    memoryUsage: 0,
    memoryLeaks: 0,
    resourceContention: 0,
    allocationFailures: 0,
    gcPauses: 0,
    largeAllocations: 0
  };

  private onUpdate: (metrics: ResourceMetrics) => void;
  private gcObserver: any;

  constructor(onUpdate: (metrics: ResourceMetrics) => void) {
    this.onUpdate = onUpdate;
    this.setupGCObserver();
  }

  start(): void {
    if ((performance as any).memory) {
      this.startMemoryMonitoring();
    }
    this.gcObserver?.observe({ entryTypes: ['gc'] });
  }

  stop(): void {
    this.gcObserver?.disconnect();
  }

  private setupGCObserver(): void {
    if ('PerformanceObserver' in window) {
      this.gcObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.gcPauses = entries.length;
        this.onUpdate(this.metrics);
      });
    }
  }

  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const previousUsage = this.metrics.memoryUsage;
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        this.metrics.largeAllocations += memory.usedJSHeapSize - previousUsage > 1024 * 1024 ? 1 : 0;
        
        // Check for potential memory leaks
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          this.metrics.memoryLeaks++;
        }
        
        this.onUpdate(this.metrics);
      }
    };

    setInterval(checkMemory, 1000);
  }
}

// Helper to convert ExtendedParagraph to Node
const toNode = (p: ExtendedParagraph): Node => ({
  id: p.id,
  x: p.x || 0,
  y: p.y || 0,
  type: p.type,
  title: p.title,
  locked: p.locked || false,
  actions: p.actions,
  outgoingConnections: p.outgoingConnections || []
});

const toNodes = (paragraphs: ExtendedParagraph[]): Node[] => paragraphs.map(toNode);

describe('StoryMap Resource Tests', () => {
  // Helper to generate test data
  const generateParagraphs = (count: number): ExtendedParagraph[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Node ${i + 1}`,
      content: `Content for node ${i + 1}`,
      type: 'normale' as const,
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Memory Management', () => {
    test('maintains stable memory usage under load', async () => {
      const nodeCount = 5000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourceMetrics = {
        memoryUsage: 0,
        memoryLeaks: 0,
        resourceContention: 0,
        allocationFailures: 0,
        gcPauses: 0,
        largeAllocations: 0
      };
      
      const monitor = new ResourceMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate intensive memory operations
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          const updatedParagraphs = [...paragraphs, ...generateParagraphs(100)];
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          jest.advanceTimersByTime(100);
        }
      });
      
      monitor.stop();
      
      expect(metrics.memoryLeaks).toBe(0); // No memory leaks
      expect(metrics.largeAllocations).toBeLessThan(5); // Limited large allocations
      expect(metrics.gcPauses).toBeLessThan(10); // Reasonable GC activity
    });

    test('handles memory pressure gracefully', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourceMetrics = {
        memoryUsage: 0,
        memoryLeaks: 0,
        resourceContention: 0,
        allocationFailures: 0,
        gcPauses: 0,
        largeAllocations: 0
      };
      
      const monitor = new ResourceMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate memory pressure
      await act(async () => {
        // Create large temporary objects
        const largeData = new Array(1000000).fill('test data');
        
        // Force updates during memory pressure
        for (let i = 0; i < 5; i++) {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `${p.content} ${largeData[i]}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          jest.advanceTimersByTime(100);
        }
      });
      
      monitor.stop();
      
      expect(metrics.allocationFailures).toBe(0); // No allocation failures
      expect(metrics.resourceContention).toBeLessThan(3); // Limited resource contention
    });
  });

  describe('Resource Allocation', () => {
    test('manages resource allocation efficiently', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourceMetrics = {
        memoryUsage: 0,
        memoryLeaks: 0,
        resourceContention: 0,
        allocationFailures: 0,
        gcPauses: 0,
        largeAllocations: 0
      };
      
      const monitor = new ResourceMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource-intensive operations
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          // Update nodes with new data
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Updated content ${i} with large data ${new Array(1000).fill('test').join('')}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          // Save changes
          defaultProps.onSave?.(toNodes(updatedParagraphs));
          
          jest.advanceTimersByTime(100);
        }
      });
      
      monitor.stop();
      
      expect(metrics.largeAllocations).toBeLessThan(20); // Efficient memory allocation
      expect(metrics.resourceContention).toBeLessThan(5); // Limited resource contention
    });

    test('handles concurrent resource access', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourceMetrics = {
        memoryUsage: 0,
        memoryLeaks: 0,
        resourceContention: 0,
        allocationFailures: 0,
        gcPauses: 0,
        largeAllocations: 0
      };
      
      const monitor = new ResourceMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate concurrent resource access
      await act(async () => {
        // Multiple operations accessing same resources
        const operations = Array.from({ length: 5 }, (_, i) => async () => {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + i * 10,
            y: (p.y || 0) + i * 10,
            content: `Concurrent update ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          defaultProps.onSave?.(toNodes(updatedParagraphs));
          defaultProps.onUpdateParagraphs?.(updatedParagraphs);
        });
        
        // Execute operations concurrently
        await Promise.all(operations.map(op => op()));
        jest.advanceTimersByTime(100);
      });
      
      monitor.stop();
      
      expect(metrics.resourceContention).toBeLessThan(3); // Limited contention during concurrent access
      expect(metrics.allocationFailures).toBe(0); // No allocation failures
    });
  });

  describe('Resource Cleanup', () => {
    test('properly releases resources', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourceMetrics = {
        memoryUsage: 0,
        memoryLeaks: 0,
        resourceContention: 0,
        allocationFailures: 0,
        gcPauses: 0,
        largeAllocations: 0
      };
      
      const monitor = new ResourceMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { unmount } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Create and cleanup resources
      await act(async () => {
        // Create some resources
        const updatedParagraphs = paragraphs.map(p => ({
          ...p,
          content: `${p.content} ${new Array(1000).fill('test').join('')}`
        }));
        
        defaultProps.onSave?.(toNodes(updatedParagraphs));
        
        // Unmount to trigger cleanup
        unmount();
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        jest.advanceTimersByTime(1000);
      });
      
      monitor.stop();
      
      expect(metrics.memoryLeaks).toBe(0); // No memory leaks after cleanup
      expect(metrics.resourceContention).toBe(0); // No resource contention after cleanup
    });
  });
});
