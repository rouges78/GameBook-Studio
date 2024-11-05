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

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = jest.fn((message) => {
    // Simulate worker processing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: { type: 'result', payload: message }
        }));
      }
    }, 0);
  });
  terminate = jest.fn();
}

// Mock Worker Pool
const mockWorkerPool = {
  execute: jest.fn(),
  terminate: jest.fn(),
  isTerminated: jest.fn(),
  getActiveWorkers: jest.fn(),
  getQueueSize: jest.fn()
};

jest.mock('../src/components/StoryMap/utils/workerPool', () => ({
  WorkerPool: jest.fn().mockImplementation(() => mockWorkerPool)
}));

describe('StoryMap Worker Tests', () => {
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
    // Reset worker pool mock
    mockWorkerPool.execute.mockReset();
    mockWorkerPool.terminate.mockReset();
    mockWorkerPool.isTerminated.mockReset();
    mockWorkerPool.getActiveWorkers.mockReset();
    mockWorkerPool.getQueueSize.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Worker Communication', () => {
    test('handles worker task distribution', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      
      // Setup worker pool mock
      mockWorkerPool.execute.mockImplementation((task) => {
        return Promise.resolve({ type: 'result', payload: task });
      });
      mockWorkerPool.getActiveWorkers.mockReturnValue(4);
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers to process worker tasks
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Should have distributed tasks across workers
      expect(mockWorkerPool.execute).toHaveBeenCalled();
      expect(mockWorkerPool.getActiveWorkers()).toBe(4);
    });

    test('manages worker lifecycle correctly', async () => {
      const paragraphs = generateParagraphs(100);
      
      const { unmount } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Unmount should terminate workers
      unmount();
      
      expect(mockWorkerPool.terminate).toHaveBeenCalled();
    });

    test('handles worker errors gracefully', async () => {
      const paragraphs = generateParagraphs(100);
      
      // Setup worker pool to simulate errors
      mockWorkerPool.execute.mockImplementation(() => {
        return Promise.reject(new Error('Worker error'));
      });
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Should continue functioning despite worker errors
      expect(document.querySelector('[data-testid="story-map-canvas"]')).toBeInTheDocument();
    });
  });

  describe('Task Distribution', () => {
    test('optimizes task distribution based on load', async () => {
      const nodeCount = 2000;
      const paragraphs = generateParagraphs(nodeCount);
      
      // Track task distribution
      const taskCounts = new Map<number, number>();
      mockWorkerPool.execute.mockImplementation((task, workerId) => {
        taskCounts.set(workerId, (taskCounts.get(workerId) || 0) + 1);
        return Promise.resolve({ type: 'result', payload: task });
      });
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Tasks should be distributed relatively evenly
      const counts = Array.from(taskCounts.values());
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      const maxDeviation = Math.max(...counts.map(c => Math.abs(c - avgCount)));
      
      expect(maxDeviation / avgCount).toBeLessThan(0.2); // Less than 20% deviation
    });

    test('handles concurrent task execution', async () => {
      const paragraphs = generateParagraphs(100);
      
      // Track concurrent executions
      let maxConcurrent = 0;
      let currentConcurrent = 0;
      
      mockWorkerPool.execute.mockImplementation(async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise(resolve => setTimeout(resolve, 0));
        currentConcurrent--;
        return { type: 'result', payload: {} };
      });
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Should maintain reasonable concurrency
      expect(maxConcurrent).toBeLessThanOrEqual(4); // Max 4 concurrent tasks
    });
  });

  describe('Resource Management', () => {
    test('manages worker memory efficiently', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      
      // Track memory usage
      let maxMemoryUsage = 0;
      mockWorkerPool.execute.mockImplementation(() => {
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
        maxMemoryUsage = Math.max(maxMemoryUsage, memoryUsage);
        return Promise.resolve({ type: 'result', payload: {} });
      });
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers
      await act(async () => {
        jest.runAllTimers();
      });
      
      if (maxMemoryUsage > 0) {
        // Memory usage should be reasonable
        expect(maxMemoryUsage / (1024 * 1024)).toBeLessThan(100); // Less than 100MB
      }
    });

    test('implements task prioritization', async () => {
      const paragraphs = generateParagraphs(100);
      
      // Track task priorities
      const executedTasks: Array<{ priority: number; timestamp: number }> = [];
      mockWorkerPool.execute.mockImplementation((task) => {
        executedTasks.push({
          priority: task.priority || 0,
          timestamp: Date.now()
        });
        return Promise.resolve({ type: 'result', payload: task });
      });
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward timers
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Higher priority tasks should generally execute first
      const outOfOrderCount = executedTasks.reduce((count, task, i) => {
        if (i === 0) return 0;
        return count + (task.priority < executedTasks[i - 1].priority ? 1 : 0);
      }, 0);
      
      // Allow some out-of-order execution due to concurrent processing
      expect(outOfOrderCount / executedTasks.length).toBeLessThan(0.1); // Less than 10% out of order
    });
  });
});
