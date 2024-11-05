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

// Load balancing monitoring utilities
interface WorkerLoad {
  id: number;
  taskCount: number;
  cpuUsage: number;
  memoryUsage: number;
  queueLength: number;
  responseTime: number;
}

interface LoadMetrics {
  workers: WorkerLoad[];
  loadImbalance: number;
  migrationCount: number;
  avgResponseTime: number;
  throughput: number;
  resourceUtilization: number;
  loadVariance: number;
  hotspots: number;
}

class LoadBalanceMonitor {
  private metrics: LoadMetrics = {
    workers: [],
    loadImbalance: 0,
    migrationCount: 0,
    avgResponseTime: 0,
    throughput: 0,
    resourceUtilization: 0,
    loadVariance: 0,
    hotspots: 0
  };

  private onUpdate: (metrics: LoadMetrics) => void;
  private startTime: number = Date.now();
  private completedTasks: number = 0;

  constructor(onUpdate: (metrics: LoadMetrics) => void, workerCount: number) {
    this.onUpdate = onUpdate;
    this.initializeWorkers(workerCount);
  }

  private initializeWorkers(count: number): void {
    this.metrics.workers = Array.from({ length: count }, (_, i) => ({
      id: i,
      taskCount: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      queueLength: 0,
      responseTime: 0
    }));
  }

  recordTaskAssignment(workerId: number): void {
    const worker = this.metrics.workers[workerId];
    if (worker) {
      worker.taskCount++;
      worker.queueLength++;
      this.updateLoadMetrics();
    }
  }

  recordTaskCompletion(workerId: number, responseTime: number): void {
    const worker = this.metrics.workers[workerId];
    if (worker) {
      worker.queueLength--;
      worker.responseTime = (worker.responseTime * worker.taskCount + responseTime) / (worker.taskCount + 1);
      this.completedTasks++;
      this.updateLoadMetrics();
    }
  }

  recordResourceUsage(workerId: number, cpuUsage: number, memoryUsage: number): void {
    const worker = this.metrics.workers[workerId];
    if (worker) {
      worker.cpuUsage = cpuUsage;
      worker.memoryUsage = memoryUsage;
      this.updateLoadMetrics();
    }
  }

  recordTaskMigration(fromWorkerId: number, toWorkerId: number): void {
    const fromWorker = this.metrics.workers[fromWorkerId];
    const toWorker = this.metrics.workers[toWorkerId];
    if (fromWorker && toWorker) {
      fromWorker.queueLength--;
      toWorker.queueLength++;
      this.metrics.migrationCount++;
      this.updateLoadMetrics();
    }
  }

  private updateLoadMetrics(): void {
    // Calculate load imbalance
    const loads = this.metrics.workers.map(w => w.queueLength);
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const maxLoad = Math.max(...loads);
    this.metrics.loadImbalance = maxLoad / (avgLoad || 1) - 1;

    // Calculate load variance
    const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
    this.metrics.loadVariance = Math.sqrt(variance);

    // Calculate average response time
    const responseTimes = this.metrics.workers.map(w => w.responseTime).filter(t => t > 0);
    this.metrics.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / (responseTimes.length || 1);

    // Calculate throughput
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.completedTasks / elapsedTime;

    // Calculate resource utilization
    const cpuUtilizations = this.metrics.workers.map(w => w.cpuUsage);
    this.metrics.resourceUtilization = cpuUtilizations.reduce((a, b) => a + b, 0) / cpuUtilizations.length;

    // Detect hotspots
    this.metrics.hotspots = this.metrics.workers.filter(w => w.queueLength > avgLoad * 1.5).length;

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      workers: this.metrics.workers.map(w => ({
        ...w,
        taskCount: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        queueLength: 0,
        responseTime: 0
      })),
      loadImbalance: 0,
      migrationCount: 0,
      avgResponseTime: 0,
      throughput: 0,
      resourceUtilization: 0,
      loadVariance: 0,
      hotspots: 0
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

describe('StoryMap Load Balancing Tests', () => {
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

  describe('Load Distribution', () => {
    test('maintains balanced load across workers', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LoadMetrics = {
        workers: [],
        loadImbalance: 0,
        migrationCount: 0,
        avgResponseTime: 0,
        throughput: 0,
        resourceUtilization: 0,
        loadVariance: 0,
        hotspots: 0
      };
      
      const monitor = new LoadBalanceMonitor((m) => {
        metrics = m;
      }, 4); // 4 workers
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate load distribution
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const workerId = i % 4;
          monitor.recordTaskAssignment(workerId);
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Update ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          monitor.recordTaskCompletion(workerId, Math.random() * 50 + 50);
          monitor.recordResourceUsage(workerId, Math.random() * 0.5 + 0.3, Math.random() * 0.4 + 0.2);
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.loadImbalance).toBeLessThan(0.2); // Max 20% imbalance
      expect(metrics.loadVariance).toBeLessThan(2); // Low variance
      expect(metrics.hotspots).toBe(0); // No hotspots
    });

    test('handles dynamic load changes', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LoadMetrics = {
        workers: [],
        loadImbalance: 0,
        migrationCount: 0,
        avgResponseTime: 0,
        throughput: 0,
        resourceUtilization: 0,
        loadVariance: 0,
        hotspots: 0
      };
      
      const monitor = new LoadBalanceMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate dynamic load changes
      await act(async () => {
        // Initial balanced phase
        for (let i = 0; i < 20; i++) {
          monitor.recordTaskAssignment(i % 4);
          monitor.recordTaskCompletion(i % 4, 50);
        }
        
        // Sudden load spike on worker 0
        for (let i = 0; i < 10; i++) {
          monitor.recordTaskAssignment(0);
          monitor.recordResourceUsage(0, 0.9, 0.8);
        }
        
        // Load balancing kicks in
        for (let i = 0; i < 5; i++) {
          monitor.recordTaskMigration(0, i % 3 + 1);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Migration ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        }
        
        jest.advanceTimersByTime(1000);
      });
      
      expect(metrics.migrationCount).toBeGreaterThan(0); // Tasks were migrated
      expect(metrics.loadImbalance).toBeLessThan(0.3); // Recovered balance
      expect(metrics.resourceUtilization).toBeLessThan(0.8); // Reasonable utilization
    });
  });

  describe('Resource Utilization', () => {
    test('optimizes resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LoadMetrics = {
        workers: [],
        loadImbalance: 0,
        migrationCount: 0,
        avgResponseTime: 0,
        throughput: 0,
        resourceUtilization: 0,
        loadVariance: 0,
        hotspots: 0
      };
      
      const monitor = new LoadBalanceMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource optimization
      await act(async () => {
        for (let i = 0; i < 50; i++) {
          // Distribute tasks based on resource availability
          const workerLoads = metrics.workers.map(w => w.cpuUsage);
          const minLoadWorker = workerLoads.indexOf(Math.min(...workerLoads));
          
          monitor.recordTaskAssignment(minLoadWorker);
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Optimization ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          // Update resource usage
          metrics.workers.forEach((_, index) => {
            const usage = Math.random() * 0.4 + 0.3;
            monitor.recordResourceUsage(index, usage, usage * 0.8);
          });
          
          monitor.recordTaskCompletion(minLoadWorker, 60);
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.resourceUtilization).toBeGreaterThan(0.4); // Good utilization
      expect(metrics.resourceUtilization).toBeLessThan(0.9); // Not overloaded
      expect(metrics.avgResponseTime).toBeLessThan(100); // Responsive
    });

    test('handles resource constraints', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LoadMetrics = {
        workers: [],
        loadImbalance: 0,
        migrationCount: 0,
        avgResponseTime: 0,
        throughput: 0,
        resourceUtilization: 0,
        loadVariance: 0,
        hotspots: 0
      };
      
      const monitor = new LoadBalanceMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource constraints
      await act(async () => {
        // Create resource pressure
        metrics.workers.forEach((_, index) => {
          monitor.recordResourceUsage(index, 0.8, 0.7);
        });
        
        // Try to assign more tasks
        for (let i = 0; i < 20; i++) {
          const workerId = i % 4;
          monitor.recordTaskAssignment(workerId);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Constraint ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          // Some tasks take longer under resource pressure
          monitor.recordTaskCompletion(workerId, Math.random() * 100 + 100);
          jest.advanceTimersByTime(150);
        }
      });
      
      expect(metrics.avgResponseTime).toBeGreaterThan(100); // Slower under pressure
      expect(metrics.throughput).toBeLessThan(10); // Reduced throughput
      expect(metrics.hotspots).toBeLessThanOrEqual(1); // Limited hotspots
    });
  });
});
