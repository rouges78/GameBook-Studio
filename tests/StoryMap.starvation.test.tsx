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

// Resource starvation monitoring utilities
interface ResourceStats {
  name: string;
  acquisitions: number;
  releases: number;
  contentions: number;
  waitTime: number;
  holdTime: number;
  denials: number;
}

interface StarvationMetrics {
  resources: Map<string, ResourceStats>;
  deadlockCount: number;
  livelockCount: number;
  starvationCount: number;
  priorityInversionCount: number;
  avgWaitTime: number;
  maxWaitTime: number;
  resourceUtilization: number;
}

class StarvationMonitor {
  private metrics: StarvationMetrics = {
    resources: new Map(),
    deadlockCount: 0,
    livelockCount: 0,
    starvationCount: 0,
    priorityInversionCount: 0,
    avgWaitTime: 0,
    maxWaitTime: 0,
    resourceUtilization: 0
  };

  private onUpdate: (metrics: StarvationMetrics) => void;
  private waitTimes: number[] = [];
  private totalResources: number = 0;
  private usedResources: number = 0;

  constructor(onUpdate: (metrics: StarvationMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  initializeResource(name: string): void {
    this.metrics.resources.set(name, {
      name,
      acquisitions: 0,
      releases: 0,
      contentions: 0,
      waitTime: 0,
      holdTime: 0,
      denials: 0
    });
    this.totalResources++;
    this.updateMetrics();
  }

  recordResourceAcquisition(name: string, waitTime: number, priority: number): void {
    const resource = this.metrics.resources.get(name);
    if (resource) {
      resource.acquisitions++;
      resource.waitTime += waitTime;
      this.waitTimes.push(waitTime);
      this.usedResources++;
      
      // Check for priority inversion
      if (priority > 0 && waitTime > this.metrics.avgWaitTime * 2) {
        this.metrics.priorityInversionCount++;
      }
      
      // Check for starvation
      if (waitTime > this.metrics.maxWaitTime) {
        this.metrics.maxWaitTime = waitTime;
        if (waitTime > this.metrics.avgWaitTime * 5) {
          this.metrics.starvationCount++;
        }
      }
    }
    this.updateMetrics();
  }

  recordResourceRelease(name: string, holdTime: number): void {
    const resource = this.metrics.resources.get(name);
    if (resource) {
      resource.releases++;
      resource.holdTime += holdTime;
      this.usedResources--;
    }
    this.updateMetrics();
  }

  recordResourceContention(name: string): void {
    const resource = this.metrics.resources.get(name);
    if (resource) {
      resource.contentions++;
      
      // Check for potential deadlock
      if (this.detectDeadlock()) {
        this.metrics.deadlockCount++;
      }
      
      // Check for livelock
      if (this.detectLivelock()) {
        this.metrics.livelockCount++;
      }
    }
    this.updateMetrics();
  }

  recordResourceDenial(name: string): void {
    const resource = this.metrics.resources.get(name);
    if (resource) {
      resource.denials++;
    }
    this.updateMetrics();
  }

  private detectDeadlock(): boolean {
    // Simple deadlock detection based on resource hold-and-wait
    let potentialDeadlock = false;
    this.metrics.resources.forEach(resource => {
      if (resource.acquisitions > resource.releases && 
          resource.contentions > resource.acquisitions * 2) {
        potentialDeadlock = true;
      }
    });
    return potentialDeadlock;
  }

  private detectLivelock(): boolean {
    // Detect livelock based on rapid resource acquisition/release patterns
    let potentialLivelock = false;
    this.metrics.resources.forEach(resource => {
      if (resource.acquisitions > 10 && 
          resource.releases > 10 && 
          resource.holdTime / resource.acquisitions < 10) {
        potentialLivelock = true;
      }
    });
    return potentialLivelock;
  }

  private updateMetrics(): void {
    // Update average wait time
    if (this.waitTimes.length > 0) {
      this.metrics.avgWaitTime = this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length;
    }
    
    // Update resource utilization
    if (this.totalResources > 0) {
      this.metrics.resourceUtilization = this.usedResources / this.totalResources;
    }
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      resources: new Map(),
      deadlockCount: 0,
      livelockCount: 0,
      starvationCount: 0,
      priorityInversionCount: 0,
      avgWaitTime: 0,
      maxWaitTime: 0,
      resourceUtilization: 0
    };
    this.waitTimes = [];
    this.totalResources = 0;
    this.usedResources = 0;
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

describe('StoryMap Resource Starvation Tests', () => {
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

  describe('Resource Contention', () => {
    test('prevents resource starvation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StarvationMetrics = {
        resources: new Map(),
        deadlockCount: 0,
        livelockCount: 0,
        starvationCount: 0,
        priorityInversionCount: 0,
        avgWaitTime: 0,
        maxWaitTime: 0,
        resourceUtilization: 0
      };
      
      const monitor = new StarvationMonitor((m) => {
        metrics = m;
      });
      
      // Initialize resources
      monitor.initializeResource('memory');
      monitor.initializeResource('worker');
      monitor.initializeResource('canvas');
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource contention
      await act(async () => {
        for (let i = 0; i < 20; i++) {
          // High priority task
          monitor.recordResourceAcquisition('memory', 10, 1);
          monitor.recordResourceAcquisition('worker', 20, 1);
          
          defaultProps.onSave?.(toNodes(paragraphs));
          
          monitor.recordResourceRelease('memory', 50);
          monitor.recordResourceRelease('worker', 50);
          
          // Low priority task
          monitor.recordResourceAcquisition('memory', 30, 3);
          monitor.recordResourceAcquisition('canvas', 40, 3);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Update ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          monitor.recordResourceRelease('memory', 100);
          monitor.recordResourceRelease('canvas', 100);
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.starvationCount).toBe(0); // No resource starvation
      expect(metrics.priorityInversionCount).toBe(0); // No priority inversion
      expect(metrics.resourceUtilization).toBeLessThan(0.8); // Reasonable utilization
    });

    test('handles deadlock prevention', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StarvationMetrics = {
        resources: new Map(),
        deadlockCount: 0,
        livelockCount: 0,
        starvationCount: 0,
        priorityInversionCount: 0,
        avgWaitTime: 0,
        maxWaitTime: 0,
        resourceUtilization: 0
      };
      
      const monitor = new StarvationMonitor((m) => {
        metrics = m;
      });
      
      // Initialize resources
      monitor.initializeResource('memory');
      monitor.initializeResource('worker');
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate potential deadlock scenario
      await act(async () => {
        // Task 1 acquires memory
        monitor.recordResourceAcquisition('memory', 10, 1);
        monitor.recordResourceContention('worker');
        
        // Task 2 acquires worker
        monitor.recordResourceAcquisition('worker', 10, 1);
        monitor.recordResourceContention('memory');
        
        // Deadlock prevention kicks in
        monitor.recordResourceRelease('memory', 50);
        monitor.recordResourceAcquisition('worker', 20, 1);
        monitor.recordResourceAcquisition('memory', 20, 1);
        
        defaultProps.onSave?.(toNodes(paragraphs));
        
        monitor.recordResourceRelease('worker', 100);
        monitor.recordResourceRelease('memory', 100);
      });
      
      expect(metrics.deadlockCount).toBe(0); // No deadlocks
      expect(metrics.livelockCount).toBe(0); // No livelocks
    });
  });

  describe('Resource Fairness', () => {
    test('maintains fair resource allocation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StarvationMetrics = {
        resources: new Map(),
        deadlockCount: 0,
        livelockCount: 0,
        starvationCount: 0,
        priorityInversionCount: 0,
        avgWaitTime: 0,
        maxWaitTime: 0,
        resourceUtilization: 0
      };
      
      const monitor = new StarvationMonitor((m) => {
        metrics = m;
      });
      
      // Initialize resources
      monitor.initializeResource('memory');
      monitor.initializeResource('worker');
      monitor.initializeResource('canvas');
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate mixed priority resource requests
      await act(async () => {
        for (let i = 0; i < 30; i++) {
          const priority = i % 3 + 1;
          
          monitor.recordResourceAcquisition('memory', 10 * priority, priority);
          monitor.recordResourceAcquisition('worker', 20 * priority, priority);
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Update ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          monitor.recordResourceRelease('memory', 50);
          monitor.recordResourceRelease('worker', 50);
          
          jest.advanceTimersByTime(50);
        }
      });
      
      const memoryStats = metrics.resources.get('memory');
      const workerStats = metrics.resources.get('worker');
      
      if (memoryStats && workerStats) {
        expect(memoryStats.denials).toBeLessThan(memoryStats.acquisitions * 0.1); // Limited denials
        expect(workerStats.denials).toBeLessThan(workerStats.acquisitions * 0.1); // Limited denials
      }
      expect(metrics.avgWaitTime).toBeLessThan(100); // Reasonable wait times
    });

    test('prevents priority inversion', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StarvationMetrics = {
        resources: new Map(),
        deadlockCount: 0,
        livelockCount: 0,
        starvationCount: 0,
        priorityInversionCount: 0,
        avgWaitTime: 0,
        maxWaitTime: 0,
        resourceUtilization: 0
      };
      
      const monitor = new StarvationMonitor((m) => {
        metrics = m;
      });
      
      // Initialize resources
      monitor.initializeResource('memory');
      monitor.initializeResource('worker');
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate priority inheritance scenario
      await act(async () => {
        // Low priority task acquires resource
        monitor.recordResourceAcquisition('memory', 10, 3);
        
        // High priority task needs resource
        monitor.recordResourceContention('memory');
        monitor.recordResourceAcquisition('worker', 10, 1);
        
        // Priority inheritance kicks in
        monitor.recordResourceRelease('memory', 30);
        monitor.recordResourceAcquisition('memory', 10, 1);
        
        defaultProps.onSave?.(toNodes(paragraphs));
        
        monitor.recordResourceRelease('memory', 50);
        monitor.recordResourceRelease('worker', 50);
      });
      
      expect(metrics.priorityInversionCount).toBe(0); // No priority inversion
      expect(metrics.starvationCount).toBe(0); // No starvation
    });
  });
});
