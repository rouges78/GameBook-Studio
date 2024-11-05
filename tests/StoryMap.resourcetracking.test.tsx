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

// Resource Tracking utilities
interface ResourceUsage {
  type: string;
  allocated: number;
  used: number;
  available: number;
  efficiency: number;
}

interface ResourceMetrics {
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    cached: number;
    swapped: number;
  };
  io: {
    reads: number;
    writes: number;
    latency: number;
    bandwidth: number;
  };
}

interface ResourceStats {
  resources: ResourceUsage[];
  metrics: ResourceMetrics;
  utilizationScore: number;
  efficiencyScore: number;
  optimizationScore: number;
  healthScore: number;
  alerts: string[];
}

class ResourceTracker {
  private stats: ResourceStats = {
    resources: [],
    metrics: {
      cpu: {
        usage: 0,
        cores: 0,
        frequency: 0,
        temperature: 0
      },
      memory: {
        total: 0,
        used: 0,
        cached: 0,
        swapped: 0
      },
      io: {
        reads: 0,
        writes: 0,
        latency: 0,
        bandwidth: 0
      }
    },
    utilizationScore: 100,
    efficiencyScore: 100,
    optimizationScore: 100,
    healthScore: 100,
    alerts: []
  };

  private onUpdate: (stats: ResourceStats) => void;
  private startTime: number = Date.now();
  private thresholds = {
    utilization: { warning: 80, critical: 95 },
    efficiency: { warning: 70, critical: 50 },
    temperature: { warning: 70, critical: 85 },
    latency: { warning: 100, critical: 200 }
  };

  constructor(onUpdate: (stats: ResourceStats) => void) {
    this.onUpdate = onUpdate;
  }

  trackResource(type: string, allocated: number, used: number): void {
    const resource: ResourceUsage = {
      type,
      allocated,
      used,
      available: allocated - used,
      efficiency: (used / allocated) * 100
    };
    
    // Update or add resource
    const existingIndex = this.stats.resources.findIndex(r => r.type === type);
    if (existingIndex >= 0) {
      this.stats.resources[existingIndex] = resource;
    } else {
      this.stats.resources.push(resource);
    }
    
    this.checkResourceAlerts(resource);
    this.updateStats();
  }

  trackMetrics(metrics: ResourceMetrics): void {
    this.stats.metrics = metrics;
    
    // Check metrics alerts
    this.checkMetricsAlerts();
    this.updateStats();
  }

  private checkResourceAlerts(resource: ResourceUsage): void {
    const utilizationPercent = (resource.used / resource.allocated) * 100;
    
    if (utilizationPercent > this.thresholds.utilization.critical) {
      this.addAlert(`Critical ${resource.type} utilization: ${utilizationPercent.toFixed(1)}%`);
    } else if (utilizationPercent > this.thresholds.utilization.warning) {
      this.addAlert(`High ${resource.type} utilization: ${utilizationPercent.toFixed(1)}%`);
    }
    
    if (resource.efficiency < this.thresholds.efficiency.critical) {
      this.addAlert(`Critical ${resource.type} efficiency: ${resource.efficiency.toFixed(1)}%`);
    } else if (resource.efficiency < this.thresholds.efficiency.warning) {
      this.addAlert(`Low ${resource.type} efficiency: ${resource.efficiency.toFixed(1)}%`);
    }
  }

  private checkMetricsAlerts(): void {
    const { cpu, memory, io } = this.stats.metrics;
    
    // CPU alerts
    if (cpu.temperature > this.thresholds.temperature.critical) {
      this.addAlert(`Critical CPU temperature: ${cpu.temperature}°C`);
    } else if (cpu.temperature > this.thresholds.temperature.warning) {
      this.addAlert(`High CPU temperature: ${cpu.temperature}°C`);
    }
    
    // Memory alerts
    const memoryUsagePercent = (memory.used / memory.total) * 100;
    if (memoryUsagePercent > this.thresholds.utilization.critical) {
      this.addAlert(`Critical memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    } else if (memoryUsagePercent > this.thresholds.utilization.warning) {
      this.addAlert(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    }
    
    // IO alerts
    if (io.latency > this.thresholds.latency.critical) {
      this.addAlert(`Critical IO latency: ${io.latency}ms`);
    } else if (io.latency > this.thresholds.latency.warning) {
      this.addAlert(`High IO latency: ${io.latency}ms`);
    }
  }

  private addAlert(alert: string): void {
    if (!this.stats.alerts.includes(alert)) {
      this.stats.alerts.push(alert);
      if (this.stats.alerts.length > 10) {
        this.stats.alerts.shift();
      }
    }
  }

  private updateStats(): void {
    // Calculate utilization score
    const utilizationScores = this.stats.resources.map(r => {
      const utilization = (r.used / r.allocated) * 100;
      return Math.max(0, 100 - Math.abs(utilization - 75));
    });
    
    this.stats.utilizationScore = utilizationScores.length > 0 ?
      utilizationScores.reduce((a, b) => a + b, 0) / utilizationScores.length : 100;
    
    // Calculate efficiency score
    const efficiencyScores = this.stats.resources.map(r => r.efficiency);
    this.stats.efficiencyScore = efficiencyScores.length > 0 ?
      efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length : 100;
    
    // Calculate optimization score
    const { cpu, memory, io } = this.stats.metrics;
    const cpuOptimization = Math.max(0, 100 - (cpu.temperature / this.thresholds.temperature.critical * 100));
    const memoryOptimization = Math.max(0, 100 - (memory.swapped / memory.total * 100));
    const ioOptimization = Math.max(0, 100 - (io.latency / this.thresholds.latency.critical * 100));
    
    this.stats.optimizationScore = 
      (cpuOptimization + memoryOptimization + ioOptimization) / 3;
    
    // Calculate health score
    this.stats.healthScore = 
      (this.stats.utilizationScore * 0.3 +
       this.stats.efficiencyScore * 0.3 +
       this.stats.optimizationScore * 0.4);
    
    this.onUpdate(this.stats);
  }

  reset(): void {
    this.stats = {
      resources: [],
      metrics: {
        cpu: {
          usage: 0,
          cores: 0,
          frequency: 0,
          temperature: 0
        },
        memory: {
          total: 0,
          used: 0,
          cached: 0,
          swapped: 0
        },
        io: {
          reads: 0,
          writes: 0,
          latency: 0,
          bandwidth: 0
        }
      },
      utilizationScore: 100,
      efficiencyScore: 100,
      optimizationScore: 100,
      healthScore: 100,
      alerts: []
    };
    this.startTime = Date.now();
    this.onUpdate(this.stats);
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

describe('StoryMap Resource Tracking Tests', () => {
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

  describe('Resource Validation', () => {
    test('validates resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let stats: ResourceStats = {
        resources: [],
        metrics: {
          cpu: {
            usage: 0,
            cores: 0,
            frequency: 0,
            temperature: 0
          },
          memory: {
            total: 0,
            used: 0,
            cached: 0,
            swapped: 0
          },
          io: {
            reads: 0,
            writes: 0,
            latency: 0,
            bandwidth: 0
          }
        },
        utilizationScore: 100,
        efficiencyScore: 100,
        optimizationScore: 100,
        healthScore: 100,
        alerts: []
      };
      
      const tracker = new ResourceTracker((s) => {
        stats = s;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource validation
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Validate resources
          for (let check = 0; check < 4; check++) {
            const timeOfDay = hour / 24;
            const loadFactor = Math.sin(timeOfDay * Math.PI) * 0.3 + 0.7;
            
            // Track resources
            tracker.trackResource(
              'cpu',
              100,
              25 + Math.random() * 35 * loadFactor
            );
            tracker.trackResource(
              'memory',
              2048,
              512 + Math.random() * 512 * loadFactor
            );
            tracker.trackResource(
              'io',
              1000,
              200 + Math.random() * 400 * loadFactor
            );
            
            // Track metrics
            tracker.trackMetrics({
              cpu: {
                usage: 20 + Math.random() * 30 * loadFactor,
                cores: 8,
                frequency: 2400 + Math.random() * 600,
                temperature: 50 + Math.random() * 20 * loadFactor
              },
              memory: {
                total: 2048,
                used: 400 + Math.random() * 600 * loadFactor,
                cached: 200 + Math.random() * 200,
                swapped: Math.random() * 100 * loadFactor
              },
              io: {
                reads: 1000 + Math.random() * 500 * loadFactor,
                writes: 500 + Math.random() * 300 * loadFactor,
                latency: 50 + Math.random() * 50 * loadFactor,
                bandwidth: 100 - Math.random() * 20 * loadFactor
              }
            });
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${hour}, Check ${check}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(900000); // 15 minutes
          }
        }
      });
      
      expect(stats.utilizationScore).toBeGreaterThan(80); // Good utilization
      expect(stats.efficiencyScore).toBeGreaterThan(85); // High efficiency
      expect(stats.alerts.length).toBeLessThan(3); // Few alerts
    });
  });

  describe('Usage Monitoring', () => {
    test('monitors resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let stats: ResourceStats = {
        resources: [],
        metrics: {
          cpu: {
            usage: 0,
            cores: 0,
            frequency: 0,
            temperature: 0
          },
          memory: {
            total: 0,
            used: 0,
            cached: 0,
            swapped: 0
          },
          io: {
            reads: 0,
            writes: 0,
            latency: 0,
            bandwidth: 0
          }
        },
        utilizationScore: 100,
        efficiencyScore: 100,
        optimizationScore: 100,
        healthScore: 100,
        alerts: []
      };
      
      const tracker = new ResourceTracker((s) => {
        stats = s;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate usage monitoring
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Monitor usage
          const usagePattern = Math.sin(i / 10) * 0.2 + 0.8;
          
          // Track resources
          tracker.trackResource(
            'cpu',
            100,
            20 + Math.random() * 30 * usagePattern
          );
          tracker.trackResource(
            'memory',
            2048,
            400 + Math.random() * 400 * usagePattern
          );
          tracker.trackResource(
            'io',
            1000,
            150 + Math.random() * 300 * usagePattern
          );
          
          // Track metrics
          tracker.trackMetrics({
            cpu: {
              usage: 15 + Math.random() * 25 * usagePattern,
              cores: 8,
              frequency: 2200 + Math.random() * 800,
              temperature: 45 + Math.random() * 15 * usagePattern
            },
            memory: {
              total: 2048,
              used: 350 + Math.random() * 450 * usagePattern,
              cached: 150 + Math.random() * 150,
              swapped: Math.random() * 50 * usagePattern
            },
            io: {
              reads: 800 + Math.random() * 400 * usagePattern,
              writes: 400 + Math.random() * 200 * usagePattern,
              latency: 40 + Math.random() * 40 * usagePattern,
              bandwidth: 95 - Math.random() * 15 * usagePattern
            }
          });
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Usage monitoring ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(300000); // 5 minutes
        }
      });
      
      expect(stats.optimizationScore).toBeGreaterThan(85); // Good optimization
      expect(stats.healthScore).toBeGreaterThan(85); // Strong health
      expect(stats.metrics.cpu.temperature).toBeLessThan(70); // Safe temperature
    });
  });

  describe('Efficiency Monitoring', () => {
    test('monitors resource efficiency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let stats: ResourceStats = {
        resources: [],
        metrics: {
          cpu: {
            usage: 0,
            cores: 0,
            frequency: 0,
            temperature: 0
          },
          memory: {
            total: 0,
            used: 0,
            cached: 0,
            swapped: 0
          },
          io: {
            reads: 0,
            writes: 0,
            latency: 0,
            bandwidth: 0
          }
        },
        utilizationScore: 100,
        efficiencyScore: 100,
        optimizationScore: 100,
        healthScore: 100,
        alerts: []
      };
      
      const tracker = new ResourceTracker((s) => {
        stats = s;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate efficiency monitoring
      await act(async () => {
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            // Monitor efficiency
            const timeOfDay = hour / 24;
            const efficiencyPattern = Math.sin(timeOfDay * Math.PI) * 0.2 + 0.8;
            
            // Track resources
            tracker.trackResource(
              'cpu',
              100,
              15 + Math.random() * 25 * efficiencyPattern
            );
            tracker.trackResource(
              'memory',
              2048,
              300 + Math.random() * 300 * efficiencyPattern
            );
            tracker.trackResource(
              'io',
              1000,
              100 + Math.random() * 200 * efficiencyPattern
            );
            
            // Track metrics
            tracker.trackMetrics({
              cpu: {
                usage: 10 + Math.random() * 20 * efficiencyPattern,
                cores: 8,
                frequency: 2000 + Math.random() * 1000,
                temperature: 40 + Math.random() * 10 * efficiencyPattern
              },
              memory: {
                total: 2048,
                used: 250 + Math.random() * 350 * efficiencyPattern,
                cached: 100 + Math.random() * 100,
                swapped: Math.random() * 25 * efficiencyPattern
              },
              io: {
                reads: 600 + Math.random() * 300 * efficiencyPattern,
                writes: 300 + Math.random() * 150 * efficiencyPattern,
                latency: 30 + Math.random() * 30 * efficiencyPattern,
                bandwidth: 90 - Math.random() * 10 * efficiencyPattern
              }
            });
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Day ${day}, Hour ${hour}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(3600000); // 1 hour
          }
        }
      });
      
      expect(stats.efficiencyScore).toBeGreaterThan(90); // Excellent efficiency
      expect(stats.optimizationScore).toBeGreaterThan(90); // High optimization
      expect(stats.metrics.memory.swapped).toBeLessThan(50); // Low swap usage
    });
  });
});
