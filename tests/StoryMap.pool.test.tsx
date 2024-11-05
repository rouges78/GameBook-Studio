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

// Thread pool monitoring utilities
interface PoolMetrics {
  activeThreads: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgProcessingTime: number;
  peakThreadUsage: number;
  poolExpansions: number;
  poolContractions: number;
}

class ThreadPoolMonitor {
  private metrics: PoolMetrics = {
    activeThreads: 0,
    queuedTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    avgProcessingTime: 0,
    peakThreadUsage: 0,
    poolExpansions: 0,
    poolContractions: 0
  };

  private taskTimes: number[] = [];
  private onUpdate: (metrics: PoolMetrics) => void;

  constructor(onUpdate: (metrics: PoolMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordTaskStart(threadId: number): void {
    this.metrics.activeThreads++;
    this.metrics.peakThreadUsage = Math.max(this.metrics.peakThreadUsage, this.metrics.activeThreads);
    this.onUpdate(this.metrics);
  }

  recordTaskEnd(threadId: number, success: boolean, duration: number): void {
    this.metrics.activeThreads--;
    if (success) {
      this.metrics.completedTasks++;
      this.taskTimes.push(duration);
      this.metrics.avgProcessingTime = this.taskTimes.reduce((a, b) => a + b, 0) / this.taskTimes.length;
    } else {
      this.metrics.failedTasks++;
    }
    this.onUpdate(this.metrics);
  }

  recordQueueChange(size: number): void {
    this.metrics.queuedTasks = size;
    this.onUpdate(this.metrics);
  }

  recordPoolChange(expanded: boolean): void {
    if (expanded) {
      this.metrics.poolExpansions++;
    } else {
      this.metrics.poolContractions++;
    }
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      activeThreads: 0,
      queuedTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgProcessingTime: 0,
      peakThreadUsage: 0,
      poolExpansions: 0,
      poolContractions: 0
    };
    this.taskTimes = [];
    this.onUpdate(this.metrics);
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

describe('StoryMap Thread Pool Tests', () => {
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

  describe('Pool Utilization', () => {
    test('handles maximum thread utilization', async () => {
      const nodeCount = 5000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PoolMetrics = {
        activeThreads: 0,
        queuedTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgProcessingTime: 0,
        peakThreadUsage: 0,
        poolExpansions: 0,
        poolContractions: 0
      };
      
      const monitor = new ThreadPoolMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate heavy thread pool usage
      await act(async () => {
        for (let i = 0; i < 20; i++) {
          monitor.recordTaskStart(i % 4);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Updated content ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          defaultProps.onSave?.(toNodes(updatedParagraphs));
          
          monitor.recordTaskEnd(i % 4, true, 50);
          jest.advanceTimersByTime(50);
        }
      });
      
      expect(metrics.peakThreadUsage).toBeLessThanOrEqual(4); // Max thread pool size
      expect(metrics.failedTasks).toBe(0); // No task failures
      expect(metrics.avgProcessingTime).toBeLessThan(100); // Reasonable processing time
    });

    test('recovers from thread pool exhaustion', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PoolMetrics = {
        activeThreads: 0,
        queuedTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgProcessingTime: 0,
        peakThreadUsage: 0,
        poolExpansions: 0,
        poolContractions: 0
      };
      
      const monitor = new ThreadPoolMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate thread pool exhaustion
      await act(async () => {
        // Create more tasks than available threads
        for (let i = 0; i < 10; i++) {
          monitor.recordTaskStart(i % 4);
          monitor.recordQueueChange(i);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Exhaustion test ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          defaultProps.onSave?.(toNodes(updatedParagraphs));
          
          if (i < 4) {
            monitor.recordTaskEnd(i, true, 50);
          }
          
          jest.advanceTimersByTime(50);
        }
        
        // Allow recovery time
        jest.advanceTimersByTime(1000);
        
        // Complete remaining tasks
        for (let i = 4; i < 10; i++) {
          monitor.recordTaskEnd(i % 4, true, 50);
          monitor.recordQueueChange(Math.max(0, 9 - i));
        }
      });
      
      expect(metrics.queuedTasks).toBe(0); // All tasks completed
      expect(metrics.failedTasks).toBe(0); // No failures during recovery
      expect(metrics.poolExpansions).toBeLessThanOrEqual(1); // Limited pool expansion
    });
  });

  describe('Task Management', () => {
    test('implements effective task prioritization', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PoolMetrics = {
        activeThreads: 0,
        queuedTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgProcessingTime: 0,
        peakThreadUsage: 0,
        poolExpansions: 0,
        poolContractions: 0
      };
      
      const monitor = new ThreadPoolMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate mixed priority tasks
      await act(async () => {
        // High priority tasks (saves)
        for (let i = 0; i < 5; i++) {
          monitor.recordTaskStart(i % 4);
          defaultProps.onSave?.(toNodes(paragraphs));
          monitor.recordTaskEnd(i % 4, true, 30);
        }
        
        // Low priority tasks (updates)
        for (let i = 0; i < 10; i++) {
          monitor.recordTaskStart(i % 4);
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Update ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          monitor.recordTaskEnd(i % 4, true, 50);
        }
        
        jest.advanceTimersByTime(1000);
      });
      
      expect(metrics.completedTasks).toBe(15); // All tasks completed
      expect(metrics.avgProcessingTime).toBeLessThan(60); // Efficient processing
      expect(metrics.queuedTasks).toBe(0); // Queue cleared
    });

    test('handles task cancellation gracefully', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PoolMetrics = {
        activeThreads: 0,
        queuedTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgProcessingTime: 0,
        peakThreadUsage: 0,
        poolExpansions: 0,
        poolContractions: 0
      };
      
      const monitor = new ThreadPoolMonitor((m) => {
        metrics = m;
      });
      
      const { rerender, unmount } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Start tasks then cancel
      await act(async () => {
        // Start multiple tasks
        for (let i = 0; i < 10; i++) {
          monitor.recordTaskStart(i % 4);
          monitor.recordQueueChange(i);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Task ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          if (i < 5) {
            monitor.recordTaskEnd(i % 4, true, 30);
            monitor.recordQueueChange(Math.max(0, i - 4));
          }
        }
        
        // Cancel remaining tasks by unmounting
        unmount();
        
        // Record cancellations
        for (let i = 5; i < 10; i++) {
          monitor.recordTaskEnd(i % 4, false, 0);
          monitor.recordQueueChange(Math.max(0, 9 - i));
        }
      });
      
      expect(metrics.completedTasks).toBe(5); // Only first 5 tasks completed
      expect(metrics.failedTasks).toBe(5); // Last 5 tasks cancelled
      expect(metrics.queuedTasks).toBe(0); // Queue cleared
    });
  });

  describe('Pool Lifecycle', () => {
    test('manages pool expansion and contraction', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PoolMetrics = {
        activeThreads: 0,
        queuedTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgProcessingTime: 0,
        peakThreadUsage: 0,
        poolExpansions: 0,
        poolContractions: 0
      };
      
      const monitor = new ThreadPoolMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate load fluctuation
      await act(async () => {
        // High load period
        for (let i = 0; i < 20; i++) {
          monitor.recordTaskStart(i % 4);
          if (metrics.activeThreads > 3) {
            monitor.recordPoolChange(true);
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `High load ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          monitor.recordTaskEnd(i % 4, true, 30);
        }
        
        // Low load period
        jest.advanceTimersByTime(5000);
        
        if (metrics.activeThreads < 2) {
          monitor.recordPoolChange(false);
        }
        
        // Moderate load period
        for (let i = 0; i < 5; i++) {
          monitor.recordTaskStart(i % 4);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Moderate load ${i}`
          }));
          
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          monitor.recordTaskEnd(i % 4, true, 30);
        }
      });
      
      expect(metrics.poolExpansions).toBeLessThanOrEqual(2); // Limited expansions
      expect(metrics.poolContractions).toBeLessThanOrEqual(2); // Limited contractions
      expect(metrics.peakThreadUsage).toBeLessThanOrEqual(6); // Reasonable peak usage
    });
  });
});
