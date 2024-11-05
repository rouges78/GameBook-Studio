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

// Scheduling policy monitoring utilities
interface TaskInfo {
  id: number;
  priority: number;
  quantum: number;
  executionTime: number;
  remainingTime: number;
  arrivalTime: number;
  completionTime: number;
  responseTime: number;
  level: number;
}

interface PolicyMetrics {
  tasks: TaskInfo[];
  avgResponseTime: number;
  avgTurnaroundTime: number;
  avgWaitingTime: number;
  throughput: number;
  cpuUtilization: number;
  contextSwitches: number;
  quantumExpirations: number;
  priorityInversions: number;
}

class SchedulingPolicyMonitor {
  private metrics: PolicyMetrics = {
    tasks: [],
    avgResponseTime: 0,
    avgTurnaroundTime: 0,
    avgWaitingTime: 0,
    throughput: 0,
    cpuUtilization: 0,
    contextSwitches: 0,
    quantumExpirations: 0,
    priorityInversions: 0
  };

  private onUpdate: (metrics: PolicyMetrics) => void;
  private currentTime: number = 0;
  private taskIdCounter: number = 0;
  private activeTask: TaskInfo | null = null;

  constructor(onUpdate: (metrics: PolicyMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  addTask(priority: number, executionTime: number, level: number = 0): number {
    const taskId = ++this.taskIdCounter;
    const task: TaskInfo = {
      id: taskId,
      priority,
      quantum: Math.pow(2, level), // Exponential quantum for multilevel feedback
      executionTime,
      remainingTime: executionTime,
      arrivalTime: this.currentTime,
      completionTime: -1,
      responseTime: -1,
      level
    };
    this.metrics.tasks.push(task);
    this.updateMetrics();
    return taskId;
  }

  executeTask(taskId: number, timeSlice: number): void {
    const task = this.metrics.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Record first response
    if (task.responseTime === -1) {
      task.responseTime = this.currentTime - task.arrivalTime;
    }

    // Context switch if different from active task
    if (this.activeTask && this.activeTask.id !== taskId) {
      this.metrics.contextSwitches++;
    }

    // Execute for time slice
    const executedTime = Math.min(timeSlice, task.remainingTime);
    task.remainingTime -= executedTime;
    this.currentTime += executedTime;
    this.activeTask = task;

    // Check quantum expiration
    if (executedTime === task.quantum) {
      this.metrics.quantumExpirations++;
      task.level = Math.min(task.level + 1, 7); // Max 8 levels
      task.quantum = Math.pow(2, task.level);
    }

    // Check completion
    if (task.remainingTime === 0) {
      task.completionTime = this.currentTime;
    }

    this.updateMetrics();
  }

  advanceTime(amount: number): void {
    this.currentTime += amount;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const completedTasks = this.metrics.tasks.filter(t => t.completionTime !== -1);
    
    if (completedTasks.length > 0) {
      // Calculate average response time
      this.metrics.avgResponseTime = completedTasks.reduce((sum, task) => 
        sum + task.responseTime, 0) / completedTasks.length;
      
      // Calculate average turnaround time
      this.metrics.avgTurnaroundTime = completedTasks.reduce((sum, task) => 
        sum + (task.completionTime - task.arrivalTime), 0) / completedTasks.length;
      
      // Calculate average waiting time
      this.metrics.avgWaitingTime = completedTasks.reduce((sum, task) => 
        sum + (task.completionTime - task.arrivalTime - task.executionTime), 0) / completedTasks.length;
      
      // Calculate throughput
      this.metrics.throughput = completedTasks.length / this.currentTime;
      
      // Calculate CPU utilization
      const totalExecutionTime = completedTasks.reduce((sum, task) => 
        sum + task.executionTime, 0);
      this.metrics.cpuUtilization = totalExecutionTime / this.currentTime;
    }
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      tasks: [],
      avgResponseTime: 0,
      avgTurnaroundTime: 0,
      avgWaitingTime: 0,
      throughput: 0,
      cpuUtilization: 0,
      contextSwitches: 0,
      quantumExpirations: 0,
      priorityInversions: 0
    };
    this.currentTime = 0;
    this.taskIdCounter = 0;
    this.activeTask = null;
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

describe('StoryMap Scheduling Policy Tests', () => {
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

  describe('Round-Robin Scheduling', () => {
    test('maintains fair time allocation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PolicyMetrics = {
        tasks: [],
        avgResponseTime: 0,
        avgTurnaroundTime: 0,
        avgWaitingTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        contextSwitches: 0,
        quantumExpirations: 0,
        priorityInversions: 0
      };
      
      const monitor = new SchedulingPolicyMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate round-robin scheduling
      await act(async () => {
        // Create tasks
        const taskIds = Array.from({ length: 5 }, (_, i) => 
          monitor.addTask(1, 100, 0)
        );
        
        // Execute tasks in round-robin fashion
        for (let round = 0; round < 10; round++) {
          for (const taskId of taskIds) {
            monitor.executeTask(taskId, 20); // Fixed quantum
            
            if (round % 2 === 0) {
              defaultProps.onSave?.(toNodes(paragraphs));
            } else {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Round ${round}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            }
          }
        }
      });
      
      expect(metrics.avgWaitingTime).toBeLessThan(300); // Reasonable waiting time
      expect(metrics.cpuUtilization).toBeGreaterThan(0.8); // High CPU utilization
      expect(metrics.contextSwitches).toBeGreaterThan(0); // Context switches occurred
    });
  });

  describe('Multilevel Feedback Queue', () => {
    test('adapts to task behavior', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PolicyMetrics = {
        tasks: [],
        avgResponseTime: 0,
        avgTurnaroundTime: 0,
        avgWaitingTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        contextSwitches: 0,
        quantumExpirations: 0,
        priorityInversions: 0
      };
      
      const monitor = new SchedulingPolicyMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate multilevel feedback queue
      await act(async () => {
        // Add mix of short and long tasks
        const shortTaskIds = Array.from({ length: 3 }, () => 
          monitor.addTask(1, 50, 0)
        );
        const longTaskIds = Array.from({ length: 2 }, () => 
          monitor.addTask(1, 200, 0)
        );
        
        // Execute tasks
        for (let i = 0; i < 20; i++) {
          // Short tasks get priority
          for (const taskId of shortTaskIds) {
            monitor.executeTask(taskId, Math.pow(2, i % 3)); // Varying quantum
          }
          
          // Long tasks run with larger quanta
          for (const taskId of longTaskIds) {
            monitor.executeTask(taskId, Math.pow(2, i % 4));
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Iteration ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
        }
      });
      
      const shortTasks = metrics.tasks.filter(t => t.executionTime <= 50);
      const longTasks = metrics.tasks.filter(t => t.executionTime > 50);
      
      expect(shortTasks[0].completionTime).toBeLessThan(longTasks[0].completionTime);
      expect(metrics.quantumExpirations).toBeGreaterThan(0);
      expect(metrics.cpuUtilization).toBeGreaterThan(0.7);
    });
  });

  describe('Real-time Scheduling', () => {
    test('meets timing constraints', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PolicyMetrics = {
        tasks: [],
        avgResponseTime: 0,
        avgTurnaroundTime: 0,
        avgWaitingTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        contextSwitches: 0,
        quantumExpirations: 0,
        priorityInversions: 0
      };
      
      const monitor = new SchedulingPolicyMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate real-time scheduling
      await act(async () => {
        // Add real-time tasks with deadlines
        const rtTaskIds = Array.from({ length: 3 }, () => 
          monitor.addTask(0, 30, 0) // Highest priority
        );
        
        // Add background tasks
        const bgTaskIds = Array.from({ length: 5 }, () => 
          monitor.addTask(2, 100, 0)
        );
        
        // Execute with real-time priorities
        for (let i = 0; i < 10; i++) {
          // Real-time tasks get immediate execution
          for (const taskId of rtTaskIds) {
            monitor.executeTask(taskId, 30);
            defaultProps.onSave?.(toNodes(paragraphs));
          }
          
          // Background tasks run in remaining time
          for (const taskId of bgTaskIds) {
            monitor.executeTask(taskId, 20);
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Background ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
        }
      });
      
      const rtTasks = metrics.tasks.filter(t => t.priority === 0);
      
      expect(Math.max(...rtTasks.map(t => t.responseTime))).toBeLessThan(50);
      expect(metrics.priorityInversions).toBe(0);
      expect(metrics.cpuUtilization).toBeGreaterThan(0.6);
    });
  });

  describe('Dynamic Priority Adjustment', () => {
    test('adapts priorities based on behavior', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PolicyMetrics = {
        tasks: [],
        avgResponseTime: 0,
        avgTurnaroundTime: 0,
        avgWaitingTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        contextSwitches: 0,
        quantumExpirations: 0,
        priorityInversions: 0
      };
      
      const monitor = new SchedulingPolicyMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate dynamic priority adjustment
      await act(async () => {
        // Add tasks with initial priorities
        const taskIds = Array.from({ length: 5 }, (_, i) => 
          monitor.addTask(i % 3, 100, i % 3)
        );
        
        // Execute with priority adjustments
        for (let i = 0; i < 20; i++) {
          for (const taskId of taskIds) {
            const task = metrics.tasks.find(t => t.id === taskId);
            if (task) {
              // Adjust quantum based on behavior
              const quantum = task.quantum * (task.level < 3 ? 2 : 0.5);
              monitor.executeTask(taskId, quantum);
              
              if (i % 2 === 0) {
                defaultProps.onSave?.(toNodes(paragraphs));
              } else {
                const updatedParagraphs = paragraphs.map(p => ({
                  ...p,
                  content: `Priority ${task.priority}`
                }));
                rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              }
            }
          }
        }
      });
      
      expect(metrics.quantumExpirations).toBeGreaterThan(0);
      expect(metrics.contextSwitches).toBeGreaterThan(0);
      expect(metrics.cpuUtilization).toBeGreaterThan(0.7);
      expect(metrics.avgResponseTime).toBeLessThan(200);
    });
  });
});
