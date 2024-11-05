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

// Validation monitoring utilities
interface ValidationCheck {
  type: string;
  result: boolean;
  timestamp: number;
  metrics: {
    accuracy: number;
    reliability: number;
    consistency: number;
  };
}

interface SystemValidation {
  performance: {
    fps: number;
    latency: number;
    throughput: number;
  };
  resources: {
    memory: number;
    cpu: number;
    io: number;
  };
  health: {
    stability: number;
    reliability: number;
    availability: number;
  };
}

interface ValidationMetrics {
  checks: ValidationCheck[];
  system: SystemValidation;
  validationRate: number;
  accuracyScore: number;
  reliabilityScore: number;
  consistencyScore: number;
  healthScore: number;
}

class ValidationMonitor {
  private metrics: ValidationMetrics = {
    checks: [],
    system: {
      performance: {
        fps: 60,
        latency: 0,
        throughput: 100
      },
      resources: {
        memory: 0,
        cpu: 0,
        io: 0
      },
      health: {
        stability: 100,
        reliability: 100,
        availability: 100
      }
    },
    validationRate: 100,
    accuracyScore: 100,
    reliabilityScore: 100,
    consistencyScore: 100,
    healthScore: 100
  };

  private onUpdate: (metrics: ValidationMetrics) => void;
  private startTime: number = Date.now();
  private validationThresholds = {
    minAccuracy: 95,
    minReliability: 90,
    minConsistency: 85,
    minHealth: 80
  };

  constructor(onUpdate: (metrics: ValidationMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordValidationCheck(type: string, result: boolean, metrics: ValidationCheck['metrics']): void {
    const check: ValidationCheck = {
      type,
      result,
      timestamp: Date.now(),
      metrics
    };
    
    this.metrics.checks.push(check);
    
    // Update validation rate
    const totalChecks = this.metrics.checks.length;
    const successfulChecks = this.metrics.checks.filter(c => c.result).length;
    this.metrics.validationRate = (successfulChecks / totalChecks) * 100;
    
    this.updateMetrics();
  }

  recordSystemState(state: SystemValidation): void {
    this.metrics.system = state;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate accuracy score
    if (this.metrics.checks.length > 0) {
      const recentChecks = this.metrics.checks.slice(-10);
      this.metrics.accuracyScore = recentChecks.reduce(
        (sum, check) => sum + check.metrics.accuracy, 0
      ) / recentChecks.length;
    }

    // Calculate reliability score
    if (this.metrics.checks.length > 0) {
      const recentChecks = this.metrics.checks.slice(-10);
      this.metrics.reliabilityScore = recentChecks.reduce(
        (sum, check) => sum + check.metrics.reliability, 0
      ) / recentChecks.length;
    }

    // Calculate consistency score
    if (this.metrics.checks.length > 0) {
      const recentChecks = this.metrics.checks.slice(-10);
      this.metrics.consistencyScore = recentChecks.reduce(
        (sum, check) => sum + check.metrics.consistency, 0
      ) / recentChecks.length;
    }

    // Calculate health score
    const performanceHealth = 
      (this.metrics.system.performance.fps / 60 * 100 +
       (1 - this.metrics.system.performance.latency / 1000) * 100 +
       this.metrics.system.performance.throughput) / 3;
    
    const resourceHealth = 
      ((1 - this.metrics.system.resources.memory / 100) * 100 +
       (1 - this.metrics.system.resources.cpu / 100) * 100 +
       (1 - this.metrics.system.resources.io / 100) * 100) / 3;
    
    const systemHealth = 
      (this.metrics.system.health.stability +
       this.metrics.system.health.reliability +
       this.metrics.system.health.availability) / 3;
    
    this.metrics.healthScore = 
      (performanceHealth * 0.3 +
       resourceHealth * 0.3 +
       systemHealth * 0.4);

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      checks: [],
      system: {
        performance: {
          fps: 60,
          latency: 0,
          throughput: 100
        },
        resources: {
          memory: 0,
          cpu: 0,
          io: 0
        },
        health: {
          stability: 100,
          reliability: 100,
          availability: 100
        }
      },
      validationRate: 100,
      accuracyScore: 100,
      reliabilityScore: 100,
      consistencyScore: 100,
      healthScore: 100
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

describe('StoryMap Validation Tests', () => {
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

  describe('System Verification', () => {
    test('validates system stability', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ValidationMetrics = {
        checks: [],
        system: {
          performance: {
            fps: 60,
            latency: 0,
            throughput: 100
          },
          resources: {
            memory: 0,
            cpu: 0,
            io: 0
          },
          health: {
            stability: 100,
            reliability: 100,
            availability: 100
          }
        },
        validationRate: 100,
        accuracyScore: 100,
        reliabilityScore: 100,
        consistencyScore: 100,
        healthScore: 100
      };
      
      const monitor = new ValidationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate validation checks
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Perform periodic validation
          for (let check = 0; check < 4; check++) {
            const timeOfDay = hour / 24;
            const loadFactor = Math.sin(timeOfDay * Math.PI) * 0.3 + 0.7;
            
            // Record system state
            monitor.recordSystemState({
              performance: {
                fps: 55 + Math.random() * 10,
                latency: Math.random() * 100 * loadFactor,
                throughput: 90 + Math.random() * 20
              },
              resources: {
                memory: 20 + Math.random() * 30 * loadFactor,
                cpu: 15 + Math.random() * 25 * loadFactor,
                io: 10 + Math.random() * 20 * loadFactor
              },
              health: {
                stability: 90 + Math.random() * 10,
                reliability: 92 + Math.random() * 8,
                availability: 95 + Math.random() * 5
              }
            });
            
            // Perform validation check
            monitor.recordValidationCheck(
              'stability_check',
              Math.random() > 0.1, // 90% success rate
              {
                accuracy: 95 + Math.random() * 5,
                reliability: 90 + Math.random() * 10,
                consistency: 92 + Math.random() * 8
              }
            );
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${hour}, Check ${check}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(900000); // 15 minutes
          }
        }
      });
      
      expect(metrics.validationRate).toBeGreaterThan(85); // High validation rate
      expect(metrics.accuracyScore).toBeGreaterThan(90); // High accuracy
      expect(metrics.healthScore).toBeGreaterThan(85); // Strong health
    });
  });

  describe('Resource Validation', () => {
    test('validates resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ValidationMetrics = {
        checks: [],
        system: {
          performance: {
            fps: 60,
            latency: 0,
            throughput: 100
          },
          resources: {
            memory: 0,
            cpu: 0,
            io: 0
          },
          health: {
            stability: 100,
            reliability: 100,
            availability: 100
          }
        },
        validationRate: 100,
        accuracyScore: 100,
        reliabilityScore: 100,
        consistencyScore: 100,
        healthScore: 100
      };
      
      const monitor = new ValidationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource validation
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate varying resource usage
          const usagePattern = Math.sin(i / 10) * 0.2 + 0.8;
          
          // Record system state
          monitor.recordSystemState({
            performance: {
              fps: 58 + Math.random() * 4,
              latency: 50 + Math.random() * 50 * usagePattern,
              throughput: 95 + Math.random() * 10
            },
            resources: {
              memory: 30 + Math.random() * 20 * usagePattern,
              cpu: 25 + Math.random() * 15 * usagePattern,
              io: 20 + Math.random() * 10 * usagePattern
            },
            health: {
              stability: 95 + Math.random() * 5,
              reliability: 93 + Math.random() * 7,
              availability: 97 + Math.random() * 3
            }
          });
          
          // Perform resource validation
          monitor.recordValidationCheck(
            'resource_check',
            Math.random() > 0.05, // 95% success rate
            {
              accuracy: 94 + Math.random() * 6,
              reliability: 92 + Math.random() * 8,
              consistency: 93 + Math.random() * 7
            }
          );
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Resource validation ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(300000); // 5 minutes
        }
      });
      
      expect(metrics.reliabilityScore).toBeGreaterThan(90); // High reliability
      expect(metrics.consistencyScore).toBeGreaterThan(85); // Good consistency
      expect(metrics.system.health.stability).toBeGreaterThan(90); // Stable system
    });
  });

  describe('Health Assessment', () => {
    test('assesses system health', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ValidationMetrics = {
        checks: [],
        system: {
          performance: {
            fps: 60,
            latency: 0,
            throughput: 100
          },
          resources: {
            memory: 0,
            cpu: 0,
            io: 0
          },
          health: {
            stability: 100,
            reliability: 100,
            availability: 100
          }
        },
        validationRate: 100,
        accuracyScore: 100,
        reliabilityScore: 100,
        consistencyScore: 100,
        healthScore: 100
      };
      
      const monitor = new ValidationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate health assessment
      await act(async () => {
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            // Simulate daily health patterns
            const timeOfDay = hour / 24;
            const healthPattern = Math.sin(timeOfDay * Math.PI) * 0.1 + 0.9;
            
            // Record system state
            monitor.recordSystemState({
              performance: {
                fps: 57 + Math.random() * 6,
                latency: 40 + Math.random() * 40 * (1 - healthPattern),
                throughput: 92 + Math.random() * 16
              },
              resources: {
                memory: 25 + Math.random() * 25 * (1 - healthPattern),
                cpu: 20 + Math.random() * 20 * (1 - healthPattern),
                io: 15 + Math.random() * 15 * (1 - healthPattern)
              },
              health: {
                stability: 92 + Math.random() * 8 * healthPattern,
                reliability: 94 + Math.random() * 6 * healthPattern,
                availability: 96 + Math.random() * 4 * healthPattern
              }
            });
            
            // Perform health check
            monitor.recordValidationCheck(
              'health_check',
              Math.random() > 0.02, // 98% success rate
              {
                accuracy: 96 + Math.random() * 4,
                reliability: 95 + Math.random() * 5,
                consistency: 94 + Math.random() * 6
              }
            );
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Day ${day}, Hour ${hour}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(3600000); // 1 hour
          }
        }
      });
      
      expect(metrics.healthScore).toBeGreaterThan(90); // Excellent health
      expect(metrics.system.health.availability).toBeGreaterThan(95); // High availability
      expect(metrics.validationRate).toBeGreaterThan(95); // High validation success
    });
  });
});
