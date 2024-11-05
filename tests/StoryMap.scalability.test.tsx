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

// Scalability monitoring utilities
interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

interface LoadMetrics {
  requestRate: number;
  responseTime: number;
  errorRate: number;
  concurrentUsers: number;
}

interface ScalabilityMetrics {
  resources: ResourceUsage;
  load: LoadMetrics;
  scalingFactor: number;
  efficiency: number;
  saturationPoint: number;
  elasticityScore: number;
  performanceIndex: number;
  bottlenecks: string[];
}

class ScalabilityMonitor {
  private metrics: ScalabilityMetrics = {
    resources: {
      cpu: 0,
      memory: 0,
      network: 0,
      storage: 0
    },
    load: {
      requestRate: 0,
      responseTime: 0,
      errorRate: 0,
      concurrentUsers: 0
    },
    scalingFactor: 1,
    efficiency: 100,
    saturationPoint: 0,
    elasticityScore: 100,
    performanceIndex: 100,
    bottlenecks: []
  };

  private onUpdate: (metrics: ScalabilityMetrics) => void;
  private baselinePerformance: number = 0;
  private maxObservedLoad: number = 0;
  private resourceThresholds = {
    cpu: 80,
    memory: 75,
    network: 70,
    storage: 85
  };

  constructor(onUpdate: (metrics: ScalabilityMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordResourceUsage(usage: ResourceUsage): void {
    this.metrics.resources = usage;
    this.checkBottlenecks();
    this.updateMetrics();
  }

  recordLoadMetrics(metrics: LoadMetrics): void {
    this.metrics.load = metrics;
    this.maxObservedLoad = Math.max(this.maxObservedLoad, metrics.concurrentUsers);
    
    if (this.baselinePerformance === 0) {
      this.baselinePerformance = metrics.responseTime;
    }
    
    this.updateMetrics();
  }

  setScalingFactor(factor: number): void {
    this.metrics.scalingFactor = factor;
    this.updateMetrics();
  }

  private checkBottlenecks(): void {
    this.metrics.bottlenecks = [];
    
    if (this.metrics.resources.cpu > this.resourceThresholds.cpu) {
      this.metrics.bottlenecks.push('CPU saturation');
    }
    if (this.metrics.resources.memory > this.resourceThresholds.memory) {
      this.metrics.bottlenecks.push('Memory pressure');
    }
    if (this.metrics.resources.network > this.resourceThresholds.network) {
      this.metrics.bottlenecks.push('Network congestion');
    }
    if (this.metrics.resources.storage > this.resourceThresholds.storage) {
      this.metrics.bottlenecks.push('Storage limitation');
    }
  }

  private updateMetrics(): void {
    // Calculate efficiency (resource utilization vs performance)
    const avgResourceUtilization = (
      this.metrics.resources.cpu +
      this.metrics.resources.memory +
      this.metrics.resources.network +
      this.metrics.resources.storage
    ) / 4;
    
    const performanceRatio = this.baselinePerformance > 0 ?
      this.baselinePerformance / this.metrics.load.responseTime : 1;
    
    this.metrics.efficiency = 
      (performanceRatio * 100) / (avgResourceUtilization / 50);

    // Calculate saturation point
    if (
      this.metrics.load.responseTime > this.baselinePerformance * 2 ||
      this.metrics.load.errorRate > 5
    ) {
      this.metrics.saturationPoint = this.metrics.load.concurrentUsers;
    }

    // Calculate elasticity score
    const resourceScaling = this.metrics.scalingFactor;
    const loadScaling = this.metrics.load.concurrentUsers / 
      Math.max(1, this.maxObservedLoad);
    
    this.metrics.elasticityScore = 
      (Math.min(resourceScaling, loadScaling) / 
       Math.max(resourceScaling, loadScaling)) * 100;

    // Calculate performance index
    this.metrics.performanceIndex = (
      (this.metrics.efficiency * 0.3) +
      (this.metrics.elasticityScore * 0.3) +
      ((1 - this.metrics.load.errorRate / 100) * 100 * 0.2) +
      ((1 - this.metrics.bottlenecks.length / 4) * 100 * 0.2)
    );

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      resources: {
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0
      },
      load: {
        requestRate: 0,
        responseTime: 0,
        errorRate: 0,
        concurrentUsers: 0
      },
      scalingFactor: 1,
      efficiency: 100,
      saturationPoint: 0,
      elasticityScore: 100,
      performanceIndex: 100,
      bottlenecks: []
    };
    this.baselinePerformance = 0;
    this.maxObservedLoad = 0;
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

describe('StoryMap Scalability Tests', () => {
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

  describe('Load Handling', () => {
    test('scales with increasing load', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ScalabilityMetrics = {
        resources: {
          cpu: 0,
          memory: 0,
          network: 0,
          storage: 0
        },
        load: {
          requestRate: 0,
          responseTime: 0,
          errorRate: 0,
          concurrentUsers: 0
        },
        scalingFactor: 1,
        efficiency: 100,
        saturationPoint: 0,
        elasticityScore: 100,
        performanceIndex: 100,
        bottlenecks: []
      };
      
      const monitor = new ScalabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate increasing load
      await act(async () => {
        for (let users = 1; users <= 100; users += 10) {
          // Record load metrics
          monitor.recordLoadMetrics({
            requestRate: users * 10,
            responseTime: 100 + Math.pow(users / 10, 2),
            errorRate: users > 80 ? (users - 80) * 2 : 0,
            concurrentUsers: users
          });
          
          // Record resource usage
          monitor.recordResourceUsage({
            cpu: 20 + users * 0.7,
            memory: 30 + users * 0.5,
            network: 15 + users * 0.6,
            storage: 40 + users * 0.3
          });
          
          // Simulate scaling
          monitor.setScalingFactor(1 + Math.floor(users / 20));
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Load test ${users} users`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.saturationPoint).toBeGreaterThan(0); // Found saturation point
      expect(metrics.efficiency).toBeGreaterThan(70); // Maintained efficiency
      expect(metrics.performanceIndex).toBeGreaterThan(75); // Good overall performance
    });
  });

  describe('Resource Scaling', () => {
    test('adapts resource allocation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ScalabilityMetrics = {
        resources: {
          cpu: 0,
          memory: 0,
          network: 0,
          storage: 0
        },
        load: {
          requestRate: 0,
          responseTime: 0,
          errorRate: 0,
          concurrentUsers: 0
        },
        scalingFactor: 1,
        efficiency: 100,
        saturationPoint: 0,
        elasticityScore: 100,
        performanceIndex: 100,
        bottlenecks: []
      };
      
      const monitor = new ScalabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource scaling
      await act(async () => {
        for (let scale = 1; scale <= 5; scale++) {
          // Simulate load increase
          const baseLoad = scale * 20;
          
          for (let step = 0; step < 10; step++) {
            monitor.recordLoadMetrics({
              requestRate: baseLoad * (step + 1),
              responseTime: 100 + step * 10,
              errorRate: Math.max(0, step - 7) * 2,
              concurrentUsers: baseLoad * (step + 1) / 10
            });
            
            monitor.recordResourceUsage({
              cpu: Math.min(95, 20 + scale * 15 + step * 2),
              memory: Math.min(90, 30 + scale * 10 + step * 2),
              network: Math.min(85, 15 + scale * 12 + step * 2),
              storage: Math.min(80, 25 + scale * 8 + step)
            });
            
            monitor.setScalingFactor(scale);
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Scale ${scale}, Step ${step}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(1000);
          }
        }
      });
      
      expect(metrics.elasticityScore).toBeGreaterThan(80); // Good scaling elasticity
      expect(metrics.bottlenecks.length).toBeLessThan(2); // Few bottlenecks
      expect(metrics.performanceIndex).toBeGreaterThan(70); // Acceptable performance
    });
  });

  describe('Growth Capacity', () => {
    test('handles sustained growth', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ScalabilityMetrics = {
        resources: {
          cpu: 0,
          memory: 0,
          network: 0,
          storage: 0
        },
        load: {
          requestRate: 0,
          responseTime: 0,
          errorRate: 0,
          concurrentUsers: 0
        },
        scalingFactor: 1,
        efficiency: 100,
        saturationPoint: 0,
        elasticityScore: 100,
        performanceIndex: 100,
        bottlenecks: []
      };
      
      const monitor = new ScalabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate sustained growth
      await act(async () => {
        let totalUsers = 0;
        
        for (let hour = 0; hour < 24; hour++) {
          // Simulate daily growth pattern
          const timeOfDay = hour / 24;
          const growthFactor = Math.sin(timeOfDay * Math.PI) * 0.5 + 0.5;
          totalUsers = Math.floor(100 + hour * 10 * growthFactor);
          
          monitor.recordLoadMetrics({
            requestRate: totalUsers * 5,
            responseTime: 100 + Math.sqrt(totalUsers),
            errorRate: Math.max(0, (totalUsers - 200) / 20),
            concurrentUsers: totalUsers
          });
          
          const resourceUtilization = 20 + (totalUsers / 4);
          monitor.recordResourceUsage({
            cpu: Math.min(95, resourceUtilization + 10),
            memory: Math.min(90, resourceUtilization + 5),
            network: Math.min(85, resourceUtilization),
            storage: Math.min(80, resourceUtilization - 5)
          });
          
          monitor.setScalingFactor(1 + Math.floor(totalUsers / 50));
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Hour ${hour}, Users ${totalUsers}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(3600000); // 1 hour
        }
      });
      
      expect(metrics.saturationPoint).toBeGreaterThan(200); // High saturation point
      expect(metrics.efficiency).toBeGreaterThan(75); // Maintained efficiency
      expect(metrics.elasticityScore).toBeGreaterThan(85); // Good elasticity
    });
  });
});
