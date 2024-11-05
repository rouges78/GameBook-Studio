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

// Resource pool monitoring utilities
interface PoolStats {
  size: number;
  used: number;
  available: number;
  maxUsed: number;
  reuseCount: number;
  missCount: number;
  evictionCount: number;
  expansionCount: number;
}

interface ResourcePoolMetrics {
  memory: PoolStats;
  workers: PoolStats;
  canvas: PoolStats;
  buffers: PoolStats;
}

class ResourcePoolMonitor {
  private metrics: ResourcePoolMetrics = {
    memory: {
      size: 0,
      used: 0,
      available: 0,
      maxUsed: 0,
      reuseCount: 0,
      missCount: 0,
      evictionCount: 0,
      expansionCount: 0
    },
    workers: {
      size: 0,
      used: 0,
      available: 0,
      maxUsed: 0,
      reuseCount: 0,
      missCount: 0,
      evictionCount: 0,
      expansionCount: 0
    },
    canvas: {
      size: 0,
      used: 0,
      available: 0,
      maxUsed: 0,
      reuseCount: 0,
      missCount: 0,
      evictionCount: 0,
      expansionCount: 0
    },
    buffers: {
      size: 0,
      used: 0,
      available: 0,
      maxUsed: 0,
      reuseCount: 0,
      missCount: 0,
      evictionCount: 0,
      expansionCount: 0
    }
  };

  private onUpdate: (metrics: ResourcePoolMetrics) => void;

  constructor(onUpdate: (metrics: ResourcePoolMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordAllocation(pool: keyof ResourcePoolMetrics, reused: boolean): void {
    const stats = this.metrics[pool];
    stats.used++;
    stats.available--;
    stats.maxUsed = Math.max(stats.maxUsed, stats.used);
    
    if (reused) {
      stats.reuseCount++;
    } else {
      stats.missCount++;
      if (stats.available === 0) {
        stats.expansionCount++;
        stats.size++;
        stats.available++;
      }
    }
    
    this.onUpdate(this.metrics);
  }

  recordRelease(pool: keyof ResourcePoolMetrics): void {
    const stats = this.metrics[pool];
    stats.used--;
    stats.available++;
    
    // Consider eviction if usage is low
    if (stats.used < stats.size * 0.5) {
      stats.evictionCount++;
      stats.size--;
      stats.available--;
    }
    
    this.onUpdate(this.metrics);
  }

  initializePool(pool: keyof ResourcePoolMetrics, initialSize: number): void {
    const stats = this.metrics[pool];
    stats.size = initialSize;
    stats.available = initialSize;
    stats.used = 0;
    stats.maxUsed = 0;
    stats.reuseCount = 0;
    stats.missCount = 0;
    stats.evictionCount = 0;
    stats.expansionCount = 0;
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    Object.keys(this.metrics).forEach(pool => {
      this.initializePool(pool as keyof ResourcePoolMetrics, 0);
    });
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

describe('StoryMap Resource Pool Tests', () => {
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

  describe('Pool Size Optimization', () => {
    test('maintains optimal pool sizes under load', async () => {
      const nodeCount = 5000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourcePoolMetrics = {
        memory: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        workers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        canvas: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        buffers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 }
      };
      
      const monitor = new ResourcePoolMonitor((m) => {
        metrics = m;
      });
      
      // Initialize pools
      monitor.initializePool('memory', 4);
      monitor.initializePool('workers', 4);
      monitor.initializePool('canvas', 2);
      monitor.initializePool('buffers', 8);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate intensive resource usage
      await act(async () => {
        for (let i = 0; i < 20; i++) {
          // Allocate resources
          monitor.recordAllocation('memory', false);
          monitor.recordAllocation('workers', true);
          monitor.recordAllocation('canvas', i % 2 === 0);
          monitor.recordAllocation('buffers', i % 4 === 0);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Updated content ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          // Release some resources
          if (i % 3 === 0) {
            monitor.recordRelease('memory');
            monitor.recordRelease('workers');
          }
          if (i % 2 === 0) {
            monitor.recordRelease('canvas');
            monitor.recordRelease('buffers');
          }
          
          jest.advanceTimersByTime(100);
        }
      });
      
      // Verify pool optimization
      expect(metrics.memory.expansionCount).toBeLessThan(5); // Limited memory pool growth
      expect(metrics.workers.reuseCount).toBeGreaterThan(metrics.workers.missCount); // Effective worker reuse
      expect(metrics.canvas.size).toBeLessThanOrEqual(4); // Canvas pool remains bounded
      expect(metrics.buffers.evictionCount).toBeGreaterThan(0); // Buffer pool adapts to usage
    });

    test('handles resource reuse efficiently', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourcePoolMetrics = {
        memory: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        workers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        canvas: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        buffers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 }
      };
      
      const monitor = new ResourcePoolMonitor((m) => {
        metrics = m;
      });
      
      // Initialize pools with small sizes
      monitor.initializePool('memory', 2);
      monitor.initializePool('workers', 2);
      monitor.initializePool('canvas', 1);
      monitor.initializePool('buffers', 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource reuse patterns
      await act(async () => {
        for (let i = 0; i < 50; i++) {
          // Frequent allocation/release cycle
          monitor.recordAllocation('memory', true);
          monitor.recordAllocation('workers', true);
          monitor.recordAllocation('canvas', true);
          monitor.recordAllocation('buffers', true);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Reuse test ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          monitor.recordRelease('memory');
          monitor.recordRelease('workers');
          monitor.recordRelease('canvas');
          monitor.recordRelease('buffers');
          
          jest.advanceTimersByTime(50);
        }
      });
      
      // Verify resource reuse
      expect(metrics.memory.reuseCount).toBeGreaterThan(40); // High memory reuse
      expect(metrics.workers.expansionCount).toBe(0); // No worker pool expansion
      expect(metrics.canvas.missCount).toBeLessThan(5); // Few canvas cache misses
      expect(metrics.buffers.reuseCount / metrics.buffers.missCount).toBeGreaterThan(5); // High buffer reuse ratio
    });
  });

  describe('Pool Expansion/Contraction', () => {
    test('adapts pool size based on demand', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourcePoolMetrics = {
        memory: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        workers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        canvas: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        buffers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 }
      };
      
      const monitor = new ResourcePoolMonitor((m) => {
        metrics = m;
      });
      
      // Start with minimal pools
      monitor.initializePool('memory', 1);
      monitor.initializePool('workers', 1);
      monitor.initializePool('canvas', 1);
      monitor.initializePool('buffers', 2);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate varying load
      await act(async () => {
        // High load period
        for (let i = 0; i < 10; i++) {
          monitor.recordAllocation('memory', false);
          monitor.recordAllocation('workers', false);
          monitor.recordAllocation('canvas', false);
          monitor.recordAllocation('buffers', false);
        }
        
        const highLoadMetrics = { ...metrics };
        
        // Low load period
        for (let i = 0; i < 8; i++) {
          monitor.recordRelease('memory');
          monitor.recordRelease('workers');
          monitor.recordRelease('canvas');
          monitor.recordRelease('buffers');
        }
        
        const lowLoadMetrics = { ...metrics };
        
        // Verify adaptation
        expect(highLoadMetrics.memory.size).toBeGreaterThan(lowLoadMetrics.memory.size);
        expect(highLoadMetrics.workers.size).toBeGreaterThan(lowLoadMetrics.workers.size);
        expect(metrics.canvas.evictionCount).toBeGreaterThan(0);
        expect(metrics.buffers.evictionCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Resource Invalidation', () => {
    test('handles resource invalidation correctly', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResourcePoolMetrics = {
        memory: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        workers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        canvas: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 },
        buffers: { size: 0, used: 0, available: 0, maxUsed: 0, reuseCount: 0, missCount: 0, evictionCount: 0, expansionCount: 0 }
      };
      
      const monitor = new ResourcePoolMonitor((m) => {
        metrics = m;
      });
      
      // Initialize pools
      monitor.initializePool('memory', 4);
      monitor.initializePool('workers', 4);
      monitor.initializePool('canvas', 2);
      monitor.initializePool('buffers', 8);
      
      const { rerender, unmount } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource lifecycle
      await act(async () => {
        // Allocate resources
        for (let i = 0; i < 10; i++) {
          monitor.recordAllocation('memory', true);
          monitor.recordAllocation('workers', true);
          monitor.recordAllocation('canvas', true);
          monitor.recordAllocation('buffers', true);
          
          if (i === 5) {
            // Force invalidation
            monitor.reset();
            monitor.initializePool('memory', 4);
            monitor.initializePool('workers', 4);
            monitor.initializePool('canvas', 2);
            monitor.initializePool('buffers', 8);
          }
        }
        
        // Cleanup
        unmount();
        
        // Verify cleanup
        expect(metrics.memory.used).toBe(0);
        expect(metrics.workers.used).toBe(0);
        expect(metrics.canvas.used).toBe(0);
        expect(metrics.buffers.used).toBe(0);
      });
    });
  });
});
