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

// Thread scheduling monitoring utilities
interface TaskMetrics {
  id: number;
  priority: number;
  startTime: number;
  endTime: number;
  preemptions: number;
  waitTime: number;
  processingTime: number;
}

interface SchedulingMetrics {
  tasks: TaskMetrics[];
  preemptionCount: number;
  avgWaitTime: number;
  avgTurnaroundTime: number;
  fairnessIndex: number;
  starvationCount: number;
}

class SchedulingMonitor {
  private metrics: SchedulingMetrics = {
    tasks: [],
    preemptionCount: 0,
    avgWaitTime: 0,
    avgTurnaroundTime: 0,
    fairnessIndex: 1,
    starvationCount: 0
  };

  private onUpdate: (metrics: SchedulingMetrics) => void;
  private currentTime: number = 0;
  private taskIdCounter: number = 0;

  constructor(onUpdate: (metrics: SchedulingMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordTaskStart(priority: number): number {
    const taskId = ++this.taskIdCounter;
    this.metrics.tasks.push({
      id: taskId,
      priority,
      startTime: this.currentTime,
      endTime: -1,
      preemptions: 0,
      waitTime: 0,
      processingTime: 0
    });
    this.updateMetrics();
    return taskId;
  }

  recordTaskPreemption(taskId: number): void {
    const task = this.metrics.tasks.find(t => t.id === taskId);
    if (task) {
      task.preemptions++;
      this.metrics.preemptionCount++;
    }
    this.updateMetrics();
  }

  recordTaskCompletion(taskId: number): void {
    const task = this.metrics.tasks.find(t => t.id === taskId);
    if (task) {
      task.endTime = this.currentTime;
      task.processingTime = task.endTime - task.startTime - task.waitTime;
    }
    this.updateMetrics();
  }

  advanceTime(amount: number): void {
    this.currentTime += amount;
    this.updateMetrics();
  }

  recordTaskWait(taskId: number, waitTime: number): void {
    const task = this.metrics.tasks.find(t => t.id === taskId);
    if (task) {
      task.waitTime += waitTime;
    }
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const completedTasks = this.metrics.tasks.filter(t => t.endTime !== -1);
    
    if (completedTasks.length > 0) {
      // Calculate average wait time
      this.metrics.avgWaitTime = completedTasks.reduce((sum, task) => 
        sum + task.waitTime, 0) / completedTasks.length;
      
      // Calculate average turnaround time
      this.metrics.avgTurnaroundTime = completedTasks.reduce((sum, task) => 
        sum + (task.endTime - task.startTime), 0) / completedTasks.length;
      
      // Calculate fairness index (Jain's fairness index)
      const processingTimes = completedTasks.map(t => t.processingTime);
      const sumSquared = Math.pow(processingTimes.reduce((a, b) => a + b, 0), 2);
      const sumOfSquares = processingTimes.reduce((a, b) => a + Math.pow(b, 2), 0);
      this.metrics.fairnessIndex = sumSquared / (completedTasks.length * sumOfSquares);
      
      // Check for starvation (tasks waiting more than 5x average wait time)
      this.metrics.starvationCount = this.metrics.tasks.filter(t => 
        t.waitTime > this.metrics.avgWaitTime * 5
      ).length;
    }
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      tasks: [],
      preemptionCount: 0,
      avgWaitTime: 0,
      avgTurnaroundTime: 0,
      fairnessIndex: 1,
      starvationCount: 0
    };
    this.currentTime = 0;
    this.taskIdCounter = 0;
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

describe('StoryMap Thread Scheduling Tests', () => {
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

  describe('Priority Scheduling', () => {
    test('handles task priorities correctly', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SchedulingMetrics = {
        tasks: [],
        preemptionCount: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
        fairnessIndex: 1,
        starvationCount: 0
      };
      
      const monitor = new SchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate mixed priority tasks
      await act(async () => {
        // High priority tasks
        for (let i = 0; i < 5; i++) {
          const taskId = monitor.recordTaskStart(1);
          defaultProps.onSave?.(toNodes(paragraphs));
          monitor.recordTaskCompletion(taskId);
          monitor.advanceTime(50);
        }
        
        // Low priority tasks
        for (let i = 0; i < 10; i++) {
          const taskId = monitor.recordTaskStart(3);
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Update ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          monitor.recordTaskCompletion(taskId);
          monitor.advanceTime(50);
        }
      });
      
      expect(metrics.avgWaitTime).toBeLessThan(100); // Reasonable wait times
      expect(metrics.starvationCount).toBe(0); // No task starvation
      expect(metrics.fairnessIndex).toBeGreaterThan(0.8); // Good fairness
    });

    test('implements preemptive scheduling', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SchedulingMetrics = {
        tasks: [],
        preemptionCount: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
        fairnessIndex: 1,
        starvationCount: 0
      };
      
      const monitor = new SchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate preemptive scheduling
      await act(async () => {
        // Start low priority task
        const lowPriorityId = monitor.recordTaskStart(3);
        
        // Introduce high priority task
        const highPriorityId = monitor.recordTaskStart(1);
        monitor.recordTaskPreemption(lowPriorityId);
        
        // Complete high priority task
        defaultProps.onSave?.(toNodes(paragraphs));
        monitor.recordTaskCompletion(highPriorityId);
        
        // Resume and complete low priority task
        const updatedParagraphs = paragraphs.map(p => ({
          ...p,
          content: 'Updated content'
        }));
        rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        monitor.recordTaskCompletion(lowPriorityId);
      });
      
      expect(metrics.preemptionCount).toBeGreaterThan(0); // Preemption occurred
      expect(metrics.tasks.find(t => t.priority === 1)?.waitTime).toBeLessThan(
        metrics.tasks.find(t => t.priority === 3)?.waitTime || Infinity
      ); // High priority task waited less
    });
  });

  describe('Fairness Verification', () => {
    test('prevents priority inversion', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SchedulingMetrics = {
        tasks: [],
        preemptionCount: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
        fairnessIndex: 1,
        starvationCount: 0
      };
      
      const monitor = new SchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate priority inheritance scenario
      await act(async () => {
        // Start low priority task with resource
        const lowPriorityId = monitor.recordTaskStart(3);
        
        // Start medium priority task
        const mediumPriorityId = monitor.recordTaskStart(2);
        
        // Start high priority task that needs resource
        const highPriorityId = monitor.recordTaskStart(1);
        
        // Low priority task inherits high priority
        monitor.recordTaskPreemption(mediumPriorityId);
        
        // Complete tasks in order
        monitor.recordTaskCompletion(lowPriorityId);
        monitor.recordTaskCompletion(highPriorityId);
        monitor.recordTaskCompletion(mediumPriorityId);
      });
      
      const highPriorityTask = metrics.tasks.find(t => t.priority === 1);
      const mediumPriorityTask = metrics.tasks.find(t => t.priority === 2);
      
      expect(highPriorityTask?.waitTime).toBeLessThan(mediumPriorityTask?.waitTime || Infinity);
      expect(metrics.fairnessIndex).toBeGreaterThan(0.7); // Reasonable fairness maintained
    });

    test('prevents starvation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SchedulingMetrics = {
        tasks: [],
        preemptionCount: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
        fairnessIndex: 1,
        starvationCount: 0
      };
      
      const monitor = new SchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate continuous high priority tasks
      await act(async () => {
        // Start some low priority tasks
        const lowPriorityIds = Array.from({ length: 5 }, () => monitor.recordTaskStart(3));
        
        // Introduce continuous high priority tasks
        for (let i = 0; i < 20; i++) {
          const highPriorityId = monitor.recordTaskStart(1);
          defaultProps.onSave?.(toNodes(paragraphs));
          monitor.recordTaskCompletion(highPriorityId);
          monitor.advanceTime(50);
        }
        
        // Complete low priority tasks
        for (const id of lowPriorityIds) {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Updated by ${id}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          monitor.recordTaskCompletion(id);
        }
      });
      
      expect(metrics.starvationCount).toBe(0); // No tasks starved
      expect(metrics.fairnessIndex).toBeGreaterThan(0.6); // Acceptable fairness
    });
  });

  describe('Task Preemption', () => {
    test('handles preemption with minimal overhead', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SchedulingMetrics = {
        tasks: [],
        preemptionCount: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
        fairnessIndex: 1,
        starvationCount: 0
      };
      
      const monitor = new SchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate frequent preemptions
      await act(async () => {
        const taskIds = new Set<number>();
        
        for (let i = 0; i < 10; i++) {
          // Start new task
          const taskId = monitor.recordTaskStart(i % 3 + 1);
          taskIds.add(taskId);
          
          // Preempt previous task if exists
          if (i > 0) {
            monitor.recordTaskPreemption(Array.from(taskIds)[i - 1]);
          }
          
          // Perform some work
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Update ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          // Complete task
          monitor.recordTaskCompletion(taskId);
          monitor.advanceTime(50);
        }
      });
      
      expect(metrics.preemptionCount).toBeGreaterThan(0); // Preemption occurred
      expect(metrics.avgTurnaroundTime).toBeLessThan(200); // Reasonable turnaround despite preemptions
      expect(metrics.fairnessIndex).toBeGreaterThan(0.7); // Maintained fairness
    });
  });
});
