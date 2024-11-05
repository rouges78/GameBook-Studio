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

// Work stealing monitoring utilities
interface WorkerQueue {
  id: number;
  tasks: number;
  steals: number;
  victims: number;
  successfulSteals: number;
  failedSteals: number;
  utilization: number;
}

interface StealingMetrics {
  queues: WorkerQueue[];
  totalSteals: number;
  successRate: number;
  loadImbalance: number;
  throughput: number;
  latency: number;
  fairnessIndex: number;
}

class WorkStealingMonitor {
  private metrics: StealingMetrics = {
    queues: [],
    totalSteals: 0,
    successRate: 0,
    loadImbalance: 0,
    throughput: 0,
    latency: 0,
    fairnessIndex: 0
  };

  private onUpdate: (metrics: StealingMetrics) => void;
  private startTime: number = Date.now();
  private completedTasks: number = 0;

  constructor(onUpdate: (metrics: StealingMetrics) => void, workerCount: number) {
    this.onUpdate = onUpdate;
    this.initializeQueues(workerCount);
  }

  private initializeQueues(count: number): void {
    this.metrics.queues = Array.from({ length: count }, (_, i) => ({
      id: i,
      tasks: 0,
      steals: 0,
      victims: 0,
      successfulSteals: 0,
      failedSteals: 0,
      utilization: 0
    }));
  }

  recordTaskAddition(queueId: number): void {
    const queue = this.metrics.queues[queueId];
    if (queue) {
      queue.tasks++;
      queue.utilization = Math.min(queue.utilization + 0.1, 1);
      this.updateMetrics();
    }
  }

  recordTaskCompletion(queueId: number): void {
    const queue = this.metrics.queues[queueId];
    if (queue) {
      queue.tasks--;
      queue.utilization = Math.max(queue.utilization - 0.1, 0);
      this.completedTasks++;
      this.updateMetrics();
    }
  }

  recordStealAttempt(thiefId: number, victimId: number, successful: boolean): void {
    const thief = this.metrics.queues[thiefId];
    const victim = this.metrics.queues[victimId];
    if (thief && victim) {
      thief.steals++;
      victim.victims++;
      this.metrics.totalSteals++;
      
      if (successful) {
        thief.successfulSteals++;
        thief.tasks++;
        victim.tasks--;
      } else {
        thief.failedSteals++;
      }
      
      this.updateMetrics();
    }
  }

  recordLatency(latency: number): void {
    this.metrics.latency = (this.metrics.latency + latency) / 2;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate success rate
    const totalAttempts = this.metrics.queues.reduce((sum, q) => sum + q.steals, 0);
    const successfulAttempts = this.metrics.queues.reduce((sum, q) => sum + q.successfulSteals, 0);
    this.metrics.successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;

    // Calculate load imbalance
    const loads = this.metrics.queues.map(q => q.tasks);
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const maxLoad = Math.max(...loads);
    this.metrics.loadImbalance = avgLoad > 0 ? (maxLoad / avgLoad - 1) : 0;

    // Calculate throughput
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.completedTasks / elapsedTime;

    // Calculate fairness index (Jain's fairness index)
    const utilizations = this.metrics.queues.map(q => q.utilization);
    const sumSquared = Math.pow(utilizations.reduce((a, b) => a + b, 0), 2);
    const sumOfSquares = utilizations.reduce((a, b) => a + Math.pow(b, 2), 0);
    this.metrics.fairnessIndex = sumSquared / (this.metrics.queues.length * sumOfSquares);

    this.onUpdate(this.metrics);
  }

  reset(): void {
    const workerCount = this.metrics.queues.length;
    this.metrics = {
      queues: Array.from({ length: workerCount }, (_, i) => ({
        id: i,
        tasks: 0,
        steals: 0,
        victims: 0,
        successfulSteals: 0,
        failedSteals: 0,
        utilization: 0
      })),
      totalSteals: 0,
      successRate: 0,
      loadImbalance: 0,
      throughput: 0,
      latency: 0,
      fairnessIndex: 0
    };
    this.startTime = Date.now();
    this.completedTasks = 0;
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

describe('StoryMap Work Stealing Tests', () => {
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

  describe('Task Stealing', () => {
    test('balances load through stealing', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StealingMetrics = {
        queues: [],
        totalSteals: 0,
        successRate: 0,
        loadImbalance: 0,
        throughput: 0,
        latency: 0,
        fairnessIndex: 0
      };
      
      const monitor = new WorkStealingMonitor((m) => {
        metrics = m;
      }, 4); // 4 workers
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate work stealing
      await act(async () => {
        // Create initial imbalance
        for (let i = 0; i < 20; i++) {
          monitor.recordTaskAddition(0); // Overload first worker
        }
        
        // Process tasks with stealing
        for (let i = 0; i < 50; i++) {
          // Attempt steals from overloaded workers
          const queues = metrics.queues;
          const mostLoaded = queues.reduce((max, q) => q.tasks > max.tasks ? q : max);
          const leastLoaded = queues.reduce((min, q) => q.tasks < min.tasks ? q : min);
          
          if (mostLoaded.tasks - leastLoaded.tasks > 2) {
            monitor.recordStealAttempt(
              leastLoaded.id,
              mostLoaded.id,
              Math.random() > 0.2 // 80% success rate
            );
          }
          
          // Process some tasks
          for (const queue of queues) {
            if (queue.tasks > 0) {
              if (i % 2 === 0) {
                defaultProps.onSave?.(toNodes(paragraphs));
              } else {
                const updatedParagraphs = paragraphs.map(p => ({
                  ...p,
                  content: `Worker ${queue.id} iteration ${i}`
                }));
                rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              }
              
              monitor.recordTaskCompletion(queue.id);
              monitor.recordLatency(Math.random() * 20 + 10);
            }
          }
          
          jest.advanceTimersByTime(50);
        }
      });
      
      expect(metrics.loadImbalance).toBeLessThan(0.3); // Good load balance
      expect(metrics.successRate).toBeGreaterThan(0.7); // High steal success rate
      expect(metrics.fairnessIndex).toBeGreaterThan(0.8); // Fair resource usage
    });
  });

  describe('Queue Management', () => {
    test('maintains efficient queue operations', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StealingMetrics = {
        queues: [],
        totalSteals: 0,
        successRate: 0,
        loadImbalance: 0,
        throughput: 0,
        latency: 0,
        fairnessIndex: 0
      };
      
      const monitor = new WorkStealingMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate queue operations
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Add tasks with varying distribution
          const targetQueue = i % 4;
          monitor.recordTaskAddition(targetQueue);
          
          if (i % 10 === 0) {
            // Periodic load balancing
            const queues = metrics.queues;
            for (let j = 0; j < queues.length; j++) {
              const nextQueue = (j + 1) % queues.length;
              if (queues[j].tasks > queues[nextQueue].tasks + 1) {
                monitor.recordStealAttempt(nextQueue, j, true);
              }
            }
          }
          
          // Process tasks
          metrics.queues.forEach(queue => {
            if (queue.tasks > 0) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Queue ${queue.id} task ${i}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              monitor.recordTaskCompletion(queue.id);
            }
          });
          
          monitor.recordLatency(Math.random() * 15 + 5);
          jest.advanceTimersByTime(20);
        }
      });
      
      expect(metrics.throughput).toBeGreaterThan(2); // Good throughput
      expect(metrics.latency).toBeLessThan(30); // Acceptable latency
      expect(metrics.loadImbalance).toBeLessThan(0.4); // Reasonable balance
    });
  });

  describe('Fairness Control', () => {
    test('maintains fair resource distribution', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StealingMetrics = {
        queues: [],
        totalSteals: 0,
        successRate: 0,
        loadImbalance: 0,
        throughput: 0,
        latency: 0,
        fairnessIndex: 0
      };
      
      const monitor = new WorkStealingMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate fair stealing
      await act(async () => {
        for (let i = 0; i < 80; i++) {
          // Add tasks with intentional imbalance
          if (i % 20 === 0) {
            for (let j = 0; j < 5; j++) {
              monitor.recordTaskAddition(0); // Overload first worker
            }
          }
          
          // Allow stealing based on fairness
          const queues = metrics.queues;
          queues.forEach((queue, index) => {
            const nextQueue = (index + 1) % queues.length;
            if (queue.tasks > queues[nextQueue].tasks * 1.5) {
              monitor.recordStealAttempt(
                nextQueue,
                index,
                queue.victims < queue.tasks * 0.5 // Succeed if victim hasn't lost too many tasks
              );
            }
            
            if (queue.tasks > 0) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Fairness test ${i}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              monitor.recordTaskCompletion(queue.id);
            }
          });
          
          jest.advanceTimersByTime(25);
        }
      });
      
      expect(metrics.fairnessIndex).toBeGreaterThan(0.85); // High fairness
      expect(metrics.queues.every(q => q.victims < q.tasks * 0.6)).toBe(true); // No excessive victimization
      expect(metrics.loadImbalance).toBeLessThan(0.25); // Good balance
    });
  });
});
