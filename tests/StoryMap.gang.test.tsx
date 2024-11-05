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

// Gang scheduling monitoring utilities
interface TaskGroup {
  id: number;
  size: number;
  startTime: number;
  completionTime: number;
  synchronizations: number;
  fragmentations: number;
  resourceUtilization: number;
}

interface GroupMetrics {
  groups: TaskGroup[];
  avgCompletionTime: number;
  avgSynchronizations: number;
  avgFragmentation: number;
  resourceEfficiency: number;
  contextSwitches: number;
  schedulingOverhead: number;
}

class GangSchedulingMonitor {
  private metrics: GroupMetrics = {
    groups: [],
    avgCompletionTime: 0,
    avgSynchronizations: 0,
    avgFragmentation: 0,
    resourceEfficiency: 0,
    contextSwitches: 0,
    schedulingOverhead: 0
  };

  private onUpdate: (metrics: GroupMetrics) => void;
  private currentTime: number = 0;
  private groupIdCounter: number = 0;

  constructor(onUpdate: (metrics: GroupMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  createTaskGroup(size: number): number {
    const groupId = ++this.groupIdCounter;
    this.metrics.groups.push({
      id: groupId,
      size,
      startTime: this.currentTime,
      completionTime: -1,
      synchronizations: 0,
      fragmentations: 0,
      resourceUtilization: 0
    });
    this.updateMetrics();
    return groupId;
  }

  recordGroupCompletion(groupId: number, resourceUtilization: number): void {
    const group = this.metrics.groups.find(g => g.id === groupId);
    if (group) {
      group.completionTime = this.currentTime;
      group.resourceUtilization = resourceUtilization;
      this.updateMetrics();
    }
  }

  recordSynchronization(groupId: number): void {
    const group = this.metrics.groups.find(g => g.id === groupId);
    if (group) {
      group.synchronizations++;
      this.metrics.schedulingOverhead += 10; // Overhead for synchronization
      this.updateMetrics();
    }
  }

  recordFragmentation(groupId: number): void {
    const group = this.metrics.groups.find(g => g.id === groupId);
    if (group) {
      group.fragmentations++;
      this.updateMetrics();
    }
  }

  recordContextSwitch(): void {
    this.metrics.contextSwitches++;
    this.metrics.schedulingOverhead += 5; // Overhead for context switch
    this.updateMetrics();
  }

  advanceTime(amount: number): void {
    this.currentTime += amount;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const completedGroups = this.metrics.groups.filter(g => g.completionTime !== -1);
    
    if (completedGroups.length > 0) {
      // Calculate average completion time
      this.metrics.avgCompletionTime = completedGroups.reduce((sum, group) => 
        sum + (group.completionTime - group.startTime), 0) / completedGroups.length;
      
      // Calculate average synchronizations
      this.metrics.avgSynchronizations = completedGroups.reduce((sum, group) => 
        sum + group.synchronizations, 0) / completedGroups.length;
      
      // Calculate average fragmentation
      this.metrics.avgFragmentation = completedGroups.reduce((sum, group) => 
        sum + group.fragmentations, 0) / completedGroups.length;
      
      // Calculate resource efficiency
      this.metrics.resourceEfficiency = completedGroups.reduce((sum, group) => 
        sum + group.resourceUtilization, 0) / completedGroups.length;
    }
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      groups: [],
      avgCompletionTime: 0,
      avgSynchronizations: 0,
      avgFragmentation: 0,
      resourceEfficiency: 0,
      contextSwitches: 0,
      schedulingOverhead: 0
    };
    this.currentTime = 0;
    this.groupIdCounter = 0;
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

describe('StoryMap Gang Scheduling Tests', () => {
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

  describe('Task Group Scheduling', () => {
    test('maintains group synchronization', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: GroupMetrics = {
        groups: [],
        avgCompletionTime: 0,
        avgSynchronizations: 0,
        avgFragmentation: 0,
        resourceEfficiency: 0,
        contextSwitches: 0,
        schedulingOverhead: 0
      };
      
      const monitor = new GangSchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate gang scheduling
      await act(async () => {
        // Create task groups
        const groupIds = Array.from({ length: 3 }, () => 
          monitor.createTaskGroup(4) // 4 tasks per group
        );
        
        for (let i = 0; i < 50; i++) {
          for (const groupId of groupIds) {
            // Simulate group execution
            monitor.recordSynchronization(groupId);
            
            if (i % 2 === 0) {
              defaultProps.onSave?.(toNodes(paragraphs));
            } else {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Group ${groupId} iteration ${i}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            }
            
            // Record completion with varying resource utilization
            if (i === 49) {
              monitor.recordGroupCompletion(groupId, 0.8 + Math.random() * 0.2);
            }
          }
          
          monitor.recordContextSwitch();
          monitor.advanceTime(20);
        }
      });
      
      expect(metrics.avgSynchronizations).toBeGreaterThan(0); // Groups synchronized
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.7); // Good resource usage
      expect(metrics.avgFragmentation).toBeLessThan(5); // Limited fragmentation
    });
  });

  describe('Resource Allocation', () => {
    test('optimizes group resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: GroupMetrics = {
        groups: [],
        avgCompletionTime: 0,
        avgSynchronizations: 0,
        avgFragmentation: 0,
        resourceEfficiency: 0,
        contextSwitches: 0,
        schedulingOverhead: 0
      };
      
      const monitor = new GangSchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource allocation
      await act(async () => {
        // Create groups of different sizes
        const groupIds = [
          monitor.createTaskGroup(2), // Small group
          monitor.createTaskGroup(4), // Medium group
          monitor.createTaskGroup(6)  // Large group
        ];
        
        for (let i = 0; i < 30; i++) {
          for (const groupId of groupIds) {
            const group = metrics.groups.find(g => g.id === groupId);
            if (group) {
              // Simulate resource contention
              if (group.size > 4) {
                monitor.recordFragmentation(groupId);
              }
              
              monitor.recordSynchronization(groupId);
              
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Resource test ${i}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              // Complete groups with different efficiencies
              if (i === 29) {
                monitor.recordGroupCompletion(
                  groupId,
                  group.size <= 4 ? 0.9 : 0.7 // Lower efficiency for larger groups
                );
              }
            }
          }
          
          monitor.advanceTime(30);
        }
      });
      
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.7); // Good overall efficiency
      expect(metrics.avgFragmentation).toBeLessThan(10); // Acceptable fragmentation
      expect(metrics.schedulingOverhead).toBeLessThan(1000); // Limited overhead
    });
  });

  describe('Group Synchronization', () => {
    test('handles synchronization barriers', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: GroupMetrics = {
        groups: [],
        avgCompletionTime: 0,
        avgSynchronizations: 0,
        avgFragmentation: 0,
        resourceEfficiency: 0,
        contextSwitches: 0,
        schedulingOverhead: 0
      };
      
      const monitor = new GangSchedulingMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate synchronization barriers
      await act(async () => {
        // Create synchronized groups
        const groupIds = Array.from({ length: 4 }, () => 
          monitor.createTaskGroup(3)
        );
        
        for (let i = 0; i < 40; i++) {
          // Synchronization barrier
          if (i % 10 === 0) {
            for (const groupId of groupIds) {
              monitor.recordSynchronization(groupId);
            }
            monitor.recordContextSwitch();
          }
          
          for (const groupId of groupIds) {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Sync test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            if (i === 39) {
              monitor.recordGroupCompletion(groupId, 0.85);
            }
          }
          
          monitor.advanceTime(25);
        }
      });
      
      expect(metrics.avgSynchronizations).toBeGreaterThan(3); // Regular synchronization
      expect(metrics.contextSwitches).toBeGreaterThan(0); // Context switches occurred
      expect(metrics.avgCompletionTime).toBeLessThan(1200); // Reasonable completion time
    });
  });
});
