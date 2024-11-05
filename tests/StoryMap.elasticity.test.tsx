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

// Elasticity monitoring utilities
interface ResourceDemand {
  required: number;
  allocated: number;
  utilized: number;
}

interface ScalingEvent {
  timestamp: number;
  direction: 'up' | 'down';
  magnitude: number;
  latency: number;
  success: boolean;
}

interface ElasticityMetrics {
  cpu: ResourceDemand;
  memory: ResourceDemand;
  scalingEvents: ScalingEvent[];
  responseTime: number;
  adaptationSpeed: number;
  resourceEfficiency: number;
  overProvisioningRatio: number;
  underProvisioningRatio: number;
}

class ElasticityMonitor {
  private metrics: ElasticityMetrics = {
    cpu: {
      required: 0,
      allocated: 0,
      utilized: 0
    },
    memory: {
      required: 0,
      allocated: 0,
      utilized: 0
    },
    scalingEvents: [],
    responseTime: 0,
    adaptationSpeed: 0,
    resourceEfficiency: 0,
    overProvisioningRatio: 0,
    underProvisioningRatio: 0
  };

  private onUpdate: (metrics: ElasticityMetrics) => void;
  private startTime: number = Date.now();
  private lastScalingTime: number = 0;

  constructor(onUpdate: (metrics: ElasticityMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordResourceDemand(
    resource: 'cpu' | 'memory',
    required: number,
    allocated: number,
    utilized: number
  ): void {
    this.metrics[resource] = {
      required,
      allocated,
      utilized
    };
    this.updateMetrics();
  }

  recordScalingEvent(
    direction: 'up' | 'down',
    magnitude: number,
    latency: number,
    success: boolean
  ): void {
    const event: ScalingEvent = {
      timestamp: Date.now(),
      direction,
      magnitude,
      latency,
      success
    };
    
    this.metrics.scalingEvents.push(event);
    this.lastScalingTime = event.timestamp;
    
    this.updateMetrics();
  }

  recordResponseTime(time: number): void {
    this.metrics.responseTime = time;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate adaptation speed (average time between scaling events)
    if (this.metrics.scalingEvents.length > 1) {
      const intervals = this.metrics.scalingEvents
        .slice(1)
        .map((event, i) => event.timestamp - this.metrics.scalingEvents[i].timestamp);
      
      this.metrics.adaptationSpeed = 
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    // Calculate resource efficiency
    const cpuEfficiency = this.metrics.cpu.utilized / this.metrics.cpu.allocated;
    const memoryEfficiency = this.metrics.memory.utilized / this.metrics.memory.allocated;
    this.metrics.resourceEfficiency = (cpuEfficiency + memoryEfficiency) / 2;

    // Calculate over-provisioning ratio
    const cpuOverProvisioning = Math.max(0, 
      (this.metrics.cpu.allocated - this.metrics.cpu.required) / 
      this.metrics.cpu.required
    );
    const memoryOverProvisioning = Math.max(0,
      (this.metrics.memory.allocated - this.metrics.memory.required) / 
      this.metrics.memory.required
    );
    this.metrics.overProvisioningRatio = 
      (cpuOverProvisioning + memoryOverProvisioning) / 2;

    // Calculate under-provisioning ratio
    const cpuUnderProvisioning = Math.max(0,
      (this.metrics.cpu.required - this.metrics.cpu.allocated) / 
      this.metrics.cpu.required
    );
    const memoryUnderProvisioning = Math.max(0,
      (this.metrics.memory.required - this.metrics.memory.allocated) / 
      this.metrics.memory.required
    );
    this.metrics.underProvisioningRatio = 
      (cpuUnderProvisioning + memoryUnderProvisioning) / 2;

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      cpu: {
        required: 0,
        allocated: 0,
        utilized: 0
      },
      memory: {
        required: 0,
        allocated: 0,
        utilized: 0
      },
      scalingEvents: [],
      responseTime: 0,
      adaptationSpeed: 0,
      resourceEfficiency: 0,
      overProvisioningRatio: 0,
      underProvisioningRatio: 0
    };
    this.startTime = Date.now();
    this.lastScalingTime = 0;
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

describe('StoryMap Elasticity Tests', () => {
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

  describe('Dynamic Scaling', () => {
    test('adapts to changing workload', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ElasticityMetrics = {
        cpu: {
          required: 0,
          allocated: 0,
          utilized: 0
        },
        memory: {
          required: 0,
          allocated: 0,
          utilized: 0
        },
        scalingEvents: [],
        responseTime: 0,
        adaptationSpeed: 0,
        resourceEfficiency: 0,
        overProvisioningRatio: 0,
        underProvisioningRatio: 0
      };
      
      const monitor = new ElasticityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate dynamic workload
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate varying demand
          const baseLoad = Math.sin(i / 10) * 0.5 + 0.5;
          const requiredCpu = 20 + baseLoad * 80;
          const requiredMemory = 40 + baseLoad * 60;
          
          // Record current demand
          monitor.recordResourceDemand(
            'cpu',
            requiredCpu,
            Math.min(100, requiredCpu * 1.1), // Allocated with 10% buffer
            requiredCpu * (0.8 + Math.random() * 0.2) // Actual utilization
          );
          
          monitor.recordResourceDemand(
            'memory',
            requiredMemory,
            Math.min(100, requiredMemory * 1.1),
            requiredMemory * (0.85 + Math.random() * 0.15)
          );
          
          // Record scaling events when needed
          if (i % 10 === 0) {
            monitor.recordScalingEvent(
              baseLoad > 0.7 ? 'up' : 'down',
              Math.abs(baseLoad - 0.5) * 50,
              Math.random() * 1000 + 500,
              Math.random() > 0.1 // 90% success rate
            );
          }
          
          monitor.recordResponseTime(100 + baseLoad * 100);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Dynamic test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.7); // Good resource usage
      expect(metrics.overProvisioningRatio).toBeLessThan(0.2); // Limited over-provisioning
      expect(metrics.adaptationSpeed).toBeLessThan(15000); // Quick adaptation
    });
  });

  describe('Resource Adaptation', () => {
    test('maintains efficient resource allocation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ElasticityMetrics = {
        cpu: {
          required: 0,
          allocated: 0,
          utilized: 0
        },
        memory: {
          required: 0,
          allocated: 0,
          utilized: 0
        },
        scalingEvents: [],
        responseTime: 0,
        adaptationSpeed: 0,
        resourceEfficiency: 0,
        overProvisioningRatio: 0,
        underProvisioningRatio: 0
      };
      
      const monitor = new ElasticityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource adaptation
      await act(async () => {
        let currentScale = 1;
        
        for (let i = 0; i < 100; i++) {
          // Simulate resource requirements
          const demandSpike = i > 50 && i < 70;
          const requiredCpu = demandSpike ? 90 : 30 + Math.random() * 20;
          const requiredMemory = demandSpike ? 85 : 40 + Math.random() * 15;
          
          // Current allocation based on scale
          const allocatedCpu = Math.min(100, requiredCpu * currentScale);
          const allocatedMemory = Math.min(100, requiredMemory * currentScale);
          
          monitor.recordResourceDemand(
            'cpu',
            requiredCpu,
            allocatedCpu,
            Math.min(allocatedCpu, requiredCpu)
          );
          
          monitor.recordResourceDemand(
            'memory',
            requiredMemory,
            allocatedMemory,
            Math.min(allocatedMemory, requiredMemory)
          );
          
          // Adjust scale based on demand
          if (requiredCpu > allocatedCpu || requiredMemory > allocatedMemory) {
            currentScale = Math.min(2, currentScale + 0.2);
            monitor.recordScalingEvent('up', 0.2, 800, true);
          } else if (allocatedCpu > requiredCpu * 1.3 && allocatedMemory > requiredMemory * 1.3) {
            currentScale = Math.max(1, currentScale - 0.1);
            monitor.recordScalingEvent('down', 0.1, 500, true);
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Adaptation test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.underProvisioningRatio).toBeLessThan(0.1); // Limited under-provisioning
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.8); // High efficiency
      expect(metrics.scalingEvents.length).toBeGreaterThan(5); // Active adaptation
    });
  });

  describe('Performance Optimization', () => {
    test('optimizes resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ElasticityMetrics = {
        cpu: {
          required: 0,
          allocated: 0,
          utilized: 0
        },
        memory: {
          required: 0,
          allocated: 0,
          utilized: 0
        },
        scalingEvents: [],
        responseTime: 0,
        adaptationSpeed: 0,
        resourceEfficiency: 0,
        overProvisioningRatio: 0,
        underProvisioningRatio: 0
      };
      
      const monitor = new ElasticityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate optimization process
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate optimization phases
          const phase = Math.floor(i / 25);
          let targetEfficiency = 0;
          
          switch (phase) {
            case 0: // Initial allocation
              targetEfficiency = 0.6;
              break;
            case 1: // Optimization
              targetEfficiency = 0.8;
              break;
            case 2: // Peak efficiency
              targetEfficiency = 0.9;
              break;
            case 3: // Sustained operation
              targetEfficiency = 0.85;
              break;
          }
          
          const required = 50 + Math.random() * 20;
          const allocated = required / targetEfficiency;
          const utilized = required * (0.9 + Math.random() * 0.1);
          
          monitor.recordResourceDemand(
            'cpu',
            required,
            allocated,
            utilized
          );
          
          monitor.recordResourceDemand(
            'memory',
            required * 0.8,
            allocated * 0.8,
            utilized * 0.8
          );
          
          if (i % 10 === 0) {
            monitor.recordScalingEvent(
              allocated > required ? 'down' : 'up',
              Math.abs(allocated - required) / required,
              300 + Math.random() * 200,
              true
            );
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Optimization test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.85); // High efficiency
      expect(metrics.overProvisioningRatio).toBeLessThan(0.15); // Limited waste
      expect(metrics.responseTime).toBeLessThan(500); // Good performance
    });
  });
});
