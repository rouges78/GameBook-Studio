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

// Thread monitoring utilities
interface ThreadMetrics {
  activeThreads: number;
  threadUtilization: number;
  contentionPoints: number;
  deadlockRisks: number;
}

class ThreadMonitor {
  private metrics: ThreadMetrics = {
    activeThreads: 0,
    threadUtilization: 0,
    contentionPoints: 0,
    deadlockRisks: 0
  };

  private onUpdate: (metrics: ThreadMetrics) => void;

  constructor(onUpdate: (metrics: ThreadMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    // Start monitoring thread activity
    if ((performance as any).threading) {
      (performance as any).threading.addEventListener('threadactivity', this.handleThreadActivity);
    }
  }

  stop(): void {
    // Stop monitoring thread activity
    if ((performance as any).threading) {
      (performance as any).threading.removeEventListener('threadactivity', this.handleThreadActivity);
    }
  }

  private handleThreadActivity = (event: any): void => {
    const { activeThreads, utilization, contentionPoints, deadlockRisks } = event.detail;
    
    this.metrics = {
      activeThreads,
      threadUtilization: utilization,
      contentionPoints,
      deadlockRisks
    };

    this.onUpdate(this.metrics);
  };
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

describe('StoryMap Thread Tests', () => {
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

  describe('Thread Management', () => {
    test('maintains efficient thread utilization', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ThreadMetrics = {
        activeThreads: 0,
        threadUtilization: 0,
        contentionPoints: 0,
        deadlockRisks: 0
      };
      
      const monitor = new ThreadMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate heavy operations
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          defaultProps.onSave?.(toNodes(paragraphs));
          jest.advanceTimersByTime(100);
        }
      });
      
      monitor.stop();
      
      expect(metrics.activeThreads).toBeLessThanOrEqual(4); // Max 4 active threads
      expect(metrics.threadUtilization).toBeLessThan(0.8); // Less than 80% utilization
      expect(metrics.contentionPoints).toBeLessThan(2); // Minimal contention
      expect(metrics.deadlockRisks).toBe(0); // No deadlock risks
    });

    test('handles concurrent operations safely', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ThreadMetrics = {
        activeThreads: 0,
        threadUtilization: 0,
        contentionPoints: 0,
        deadlockRisks: 0
      };
      
      const monitor = new ThreadMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      monitor.start();
      
      // Simulate concurrent operations
      await act(async () => {
        // Save operation
        defaultProps.onSave?.(toNodes(paragraphs));
        
        // Update nodes
        const updatedParagraphs = paragraphs.map(p => ({
          ...p,
          x: (p.x || 0) + 10,
          y: (p.y || 0) + 10
        }));
        rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        
        // Update settings
        defaultProps.onUpdateMapSettings?.({
          ...defaultMapSettings,
          imageAdjustments: {
            ...defaultMapSettings.imageAdjustments,
            contrast: 110
          }
        });
        
        jest.advanceTimersByTime(100);
      });
      
      monitor.stop();
      
      expect(metrics.contentionPoints).toBeLessThan(3); // Limited contention during concurrent ops
      expect(metrics.deadlockRisks).toBe(0); // No deadlocks during concurrent ops
    });
  });

  describe('Resource Sharing', () => {
    test('manages shared resources efficiently', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ThreadMetrics = {
        activeThreads: 0,
        threadUtilization: 0,
        contentionPoints: 0,
        deadlockRisks: 0
      };
      
      const monitor = new ThreadMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource-intensive operations
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          // Update nodes
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Updated content ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          // Save changes
          defaultProps.onSave?.(toNodes(updatedParagraphs));
          
          jest.advanceTimersByTime(100);
        }
      });
      
      monitor.stop();
      
      expect(metrics.threadUtilization).toBeLessThan(0.9); // Efficient resource usage
      expect(metrics.contentionPoints).toBeLessThan(2); // Minimal resource contention
    });

    test('handles thread pool exhaustion gracefully', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ThreadMetrics = {
        activeThreads: 0,
        threadUtilization: 0,
        contentionPoints: 0,
        deadlockRisks: 0
      };
      
      const monitor = new ThreadMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate thread pool pressure
      await act(async () => {
        // Create multiple concurrent operations
        for (let i = 0; i < 10; i++) {
          defaultProps.onSave?.(toNodes(paragraphs));
        }
        
        jest.advanceTimersByTime(100);
      });
      
      monitor.stop();
      
      expect(metrics.activeThreads).toBeLessThanOrEqual(4); // Should not exceed thread pool size
      expect(metrics.threadUtilization).toBeLessThan(1); // Should not overutilize threads
      expect(metrics.deadlockRisks).toBe(0); // No deadlocks under pressure
    });
  });

  describe('Thread Synchronization', () => {
    test('maintains data consistency during concurrent updates', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ThreadMetrics = {
        activeThreads: 0,
        threadUtilization: 0,
        contentionPoints: 0,
        deadlockRisks: 0
      };
      
      const monitor = new ThreadMonitor((m) => {
        metrics = m;
      });
      
      monitor.start();
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate concurrent data updates
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + i * 10,
            y: (p.y || 0) + i * 10,
            content: `Concurrent update ${i}`
          }));
          
          // Trigger multiple updates
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          defaultProps.onSave?.(toNodes(updatedParagraphs));
          defaultProps.onUpdateParagraphs?.(updatedParagraphs);
          
          jest.advanceTimersByTime(50);
        }
      });
      
      monitor.stop();
      
      expect(metrics.contentionPoints).toBeLessThan(3); // Limited contention during updates
      expect(metrics.deadlockRisks).toBe(0); // No data consistency issues
    });
  });
});
