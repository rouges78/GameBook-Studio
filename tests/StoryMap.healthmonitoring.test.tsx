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

// Health Monitoring utilities
interface HealthIndicator {
  type: string;
  value: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: number[];
}

interface SystemHealth {
  performance: {
    cpu: number;
    memory: number;
    io: number;
    network: number;
  };
  resources: {
    utilization: number;
    availability: number;
    efficiency: number;
    distribution: number;
  };
  stability: {
    uptime: number;
    errors: number;
    recoveries: number;
    reliability: number;
  };
}

interface HealthMetrics {
  indicators: HealthIndicator[];
  system: SystemHealth;
  healthScore: number;
  stabilityScore: number;
  efficiencyScore: number;
  reliabilityScore: number;
  warnings: string[];
}

class HealthMonitor {
  private metrics: HealthMetrics = {
    indicators: [],
    system: {
      performance: {
        cpu: 0,
        memory: 0,
        io: 0,
        network: 0
      },
      resources: {
        utilization: 0,
        availability: 100,
        efficiency: 100,
        distribution: 100
      },
      stability: {
        uptime: 0,
        errors: 0,
        recoveries: 0,
        reliability: 100
      }
    },
    healthScore: 100,
    stabilityScore: 100,
    efficiencyScore: 100,
    reliabilityScore: 100,
    warnings: []
  };

  private onUpdate: (metrics: HealthMetrics) => void;
  private startTime: number = Date.now();
  private thresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    io: { warning: 75, critical: 90 },
    network: { warning: 70, critical: 85 },
    errors: { warning: 5, critical: 10 }
  };

  constructor(onUpdate: (metrics: HealthMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordHealthIndicator(type: string, value: number, threshold: number): void {
    const indicator: HealthIndicator = {
      type,
      value,
      threshold,
      status: this.determineStatus(value, threshold),
      trend: []
    };
    
    // Update or add indicator
    const existingIndex = this.metrics.indicators.findIndex(i => i.type === type);
    if (existingIndex >= 0) {
      indicator.trend = [...this.metrics.indicators[existingIndex].trend, value];
      if (indicator.trend.length > 10) indicator.trend.shift();
      this.metrics.indicators[existingIndex] = indicator;
    } else {
      indicator.trend = [value];
      this.metrics.indicators.push(indicator);
    }
    
    this.updateWarnings(indicator);
    this.updateMetrics();
  }

  recordSystemHealth(health: SystemHealth): void {
    this.metrics.system = health;
    
    // Update warnings based on system health
    this.checkSystemWarnings();
    this.updateMetrics();
  }

  private determineStatus(value: number, threshold: number): 'healthy' | 'warning' | 'critical' {
    const ratio = value / threshold;
    if (ratio >= 0.9) return 'critical';
    if (ratio >= 0.7) return 'warning';
    return 'healthy';
  }

  private updateWarnings(indicator: HealthIndicator): void {
    const warning = `${indicator.type}: ${indicator.status} (${indicator.value.toFixed(1)}/${indicator.threshold})`;
    
    if (indicator.status !== 'healthy') {
      if (!this.metrics.warnings.includes(warning)) {
        this.metrics.warnings.push(warning);
        if (this.metrics.warnings.length > 10) {
          this.metrics.warnings.shift();
        }
      }
    } else {
      this.metrics.warnings = this.metrics.warnings.filter(w => !w.startsWith(indicator.type));
    }
  }

  private checkSystemWarnings(): void {
    const { performance, resources, stability } = this.metrics.system;
    
    // Check performance
    if (performance.cpu > this.thresholds.cpu.warning) {
      this.addWarning(`High CPU usage: ${performance.cpu.toFixed(1)}%`);
    }
    if (performance.memory > this.thresholds.memory.warning) {
      this.addWarning(`High memory usage: ${performance.memory.toFixed(1)}%`);
    }
    
    // Check resources
    if (resources.availability < 50) {
      this.addWarning(`Low resource availability: ${resources.availability.toFixed(1)}%`);
    }
    if (resources.efficiency < 70) {
      this.addWarning(`Low resource efficiency: ${resources.efficiency.toFixed(1)}%`);
    }
    
    // Check stability
    if (stability.errors > this.thresholds.errors.warning) {
      this.addWarning(`High error rate: ${stability.errors} errors`);
    }
  }

  private addWarning(warning: string): void {
    if (!this.metrics.warnings.includes(warning)) {
      this.metrics.warnings.push(warning);
      if (this.metrics.warnings.length > 10) {
        this.metrics.warnings.shift();
      }
    }
  }

  private updateMetrics(): void {
    // Calculate health score
    const healthIndicators = this.metrics.indicators.map(i => {
      const ratio = 1 - (i.value / i.threshold);
      return Math.max(0, ratio * 100);
    });
    
    this.metrics.healthScore = healthIndicators.length > 0 ?
      healthIndicators.reduce((a, b) => a + b, 0) / healthIndicators.length : 100;
    
    // Calculate stability score
    const { stability } = this.metrics.system;
    this.metrics.stabilityScore = 
      (stability.uptime > 0 ? 100 : 0) *
      (1 - (stability.errors / (stability.errors + stability.recoveries + 1))) *
      (stability.reliability / 100);
    
    // Calculate efficiency score
    const { resources } = this.metrics.system;
    this.metrics.efficiencyScore = 
      (resources.efficiency + resources.distribution) / 2;
    
    // Calculate reliability score
    this.metrics.reliabilityScore = 
      (this.metrics.healthScore * 0.4 +
       this.metrics.stabilityScore * 0.3 +
       this.metrics.efficiencyScore * 0.3);
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      indicators: [],
      system: {
        performance: {
          cpu: 0,
          memory: 0,
          io: 0,
          network: 0
        },
        resources: {
          utilization: 0,
          availability: 100,
          efficiency: 100,
          distribution: 100
        },
        stability: {
          uptime: 0,
          errors: 0,
          recoveries: 0,
          reliability: 100
        }
      },
      healthScore: 100,
      stabilityScore: 100,
      efficiencyScore: 100,
      reliabilityScore: 100,
      warnings: []
    };
    this.startTime = Date.now();
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

describe('StoryMap Health Monitoring Tests', () => {
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

  describe('Health Monitoring', () => {
    test('monitors system health', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: HealthMetrics = {
        indicators: [],
        system: {
          performance: {
            cpu: 0,
            memory: 0,
            io: 0,
            network: 0
          },
          resources: {
            utilization: 0,
            availability: 100,
            efficiency: 100,
            distribution: 100
          },
          stability: {
            uptime: 0,
            errors: 0,
            recoveries: 0,
            reliability: 100
          }
        },
        healthScore: 100,
        stabilityScore: 100,
        efficiencyScore: 100,
        reliabilityScore: 100,
        warnings: []
      };
      
      const monitor = new HealthMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate health monitoring
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Monitor system health
          for (let check = 0; check < 4; check++) {
            const timeOfDay = hour / 24;
            const loadFactor = Math.sin(timeOfDay * Math.PI) * 0.3 + 0.7;
            
            // Record health indicators
            monitor.recordHealthIndicator(
              'cpu_usage',
              30 + Math.random() * 40 * loadFactor,
              90
            );
            monitor.recordHealthIndicator(
              'memory_usage',
              40 + Math.random() * 30 * loadFactor,
              85
            );
            monitor.recordHealthIndicator(
              'io_operations',
              20 + Math.random() * 50 * loadFactor,
              80
            );
            
            // Record system health
            monitor.recordSystemHealth({
              performance: {
                cpu: 25 + Math.random() * 35 * loadFactor,
                memory: 35 + Math.random() * 25 * loadFactor,
                io: 15 + Math.random() * 45 * loadFactor,
                network: 20 + Math.random() * 30 * loadFactor
              },
              resources: {
                utilization: 30 + Math.random() * 40 * loadFactor,
                availability: 100 - Math.random() * 20 * loadFactor,
                efficiency: 95 - Math.random() * 15 * loadFactor,
                distribution: 90 - Math.random() * 10 * loadFactor
              },
              stability: {
                uptime: hour + check / 4,
                errors: Math.floor(Math.random() * 3 * loadFactor),
                recoveries: Math.floor(Math.random() * 5),
                reliability: 98 - Math.random() * 6 * loadFactor
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
      
      expect(metrics.healthScore).toBeGreaterThan(85); // Good health
      expect(metrics.stabilityScore).toBeGreaterThan(90); // High stability
      expect(metrics.warnings.length).toBeLessThan(3); // Few warnings
    });
  });

  describe('Resource Tracking', () => {
    test('tracks resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: HealthMetrics = {
        indicators: [],
        system: {
          performance: {
            cpu: 0,
            memory: 0,
            io: 0,
            network: 0
          },
          resources: {
            utilization: 0,
            availability: 100,
            efficiency: 100,
            distribution: 100
          },
          stability: {
            uptime: 0,
            errors: 0,
            recoveries: 0,
            reliability: 100
          }
        },
        healthScore: 100,
        stabilityScore: 100,
        efficiencyScore: 100,
        reliabilityScore: 100,
        warnings: []
      };
      
      const monitor = new HealthMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource tracking
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Track resource usage
          const usagePattern = Math.sin(i / 10) * 0.2 + 0.8;
          
          // Record health indicators
          monitor.recordHealthIndicator(
            'resource_usage',
            35 + Math.random() * 35 * usagePattern,
            85
          );
          monitor.recordHealthIndicator(
            'resource_efficiency',
            80 + Math.random() * 15 * usagePattern,
            95
          );
          
          // Record system health
          monitor.recordSystemHealth({
            performance: {
              cpu: 20 + Math.random() * 30 * usagePattern,
              memory: 30 + Math.random() * 20 * usagePattern,
              io: 10 + Math.random() * 40 * usagePattern,
              network: 15 + Math.random() * 25 * usagePattern
            },
            resources: {
              utilization: 25 + Math.random() * 35 * usagePattern,
              availability: 95 - Math.random() * 15 * usagePattern,
              efficiency: 90 - Math.random() * 10 * usagePattern,
              distribution: 85 - Math.random() * 5 * usagePattern
            },
            stability: {
              uptime: i / 4,
              errors: Math.floor(Math.random() * 2 * usagePattern),
              recoveries: Math.floor(Math.random() * 4),
              reliability: 95 - Math.random() * 5 * usagePattern
            }
          });
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Resource tracking ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(300000); // 5 minutes
        }
      });
      
      expect(metrics.efficiencyScore).toBeGreaterThan(85); // Good efficiency
      expect(metrics.system.resources.availability).toBeGreaterThan(80); // High availability
      expect(metrics.system.resources.efficiency).toBeGreaterThan(80); // Good efficiency
    });
  });

  describe('Performance Monitoring', () => {
    test('monitors performance metrics', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: HealthMetrics = {
        indicators: [],
        system: {
          performance: {
            cpu: 0,
            memory: 0,
            io: 0,
            network: 0
          },
          resources: {
            utilization: 0,
            availability: 100,
            efficiency: 100,
            distribution: 100
          },
          stability: {
            uptime: 0,
            errors: 0,
            recoveries: 0,
            reliability: 100
          }
        },
        healthScore: 100,
        stabilityScore: 100,
        efficiencyScore: 100,
        reliabilityScore: 100,
        warnings: []
      };
      
      const monitor = new HealthMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate performance monitoring
      await act(async () => {
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            // Monitor performance metrics
            const timeOfDay = hour / 24;
            const performancePattern = Math.sin(timeOfDay * Math.PI) * 0.2 + 0.8;
            
            // Record health indicators
            monitor.recordHealthIndicator(
              'performance_cpu',
              25 + Math.random() * 25 * performancePattern,
              80
            );
            monitor.recordHealthIndicator(
              'performance_memory',
              30 + Math.random() * 20 * performancePattern,
              75
            );
            monitor.recordHealthIndicator(
              'performance_io',
              15 + Math.random() * 35 * performancePattern,
              70
            );
            
            // Record system health
            monitor.recordSystemHealth({
              performance: {
                cpu: 20 + Math.random() * 20 * performancePattern,
                memory: 25 + Math.random() * 15 * performancePattern,
                io: 10 + Math.random() * 30 * performancePattern,
                network: 15 + Math.random() * 20 * performancePattern
              },
              resources: {
                utilization: 20 + Math.random() * 30 * performancePattern,
                availability: 90 - Math.random() * 10 * performancePattern,
                efficiency: 85 - Math.random() * 5 * performancePattern,
                distribution: 80 - Math.random() * 5 * performancePattern
              },
              stability: {
                uptime: day * 24 + hour,
                errors: Math.floor(Math.random() * performancePattern),
                recoveries: Math.floor(Math.random() * 3),
                reliability: 90 - Math.random() * 5 * performancePattern
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
      
      expect(metrics.reliabilityScore).toBeGreaterThan(85); // High reliability
      expect(metrics.system.performance.cpu).toBeLessThan(50); // Good CPU usage
      expect(metrics.system.performance.memory).toBeLessThan(45); // Good memory usage
    });
  });
});
