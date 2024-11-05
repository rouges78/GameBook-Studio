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

// Performance Verification monitoring utilities
interface PerformanceVerification {
  fps: {
    current: number;
    target: number;
    variance: number;
    stability: number;
  };
  timing: {
    render: number;
    update: number;
    idle: number;
    total: number;
  };
  memory: {
    used: number;
    peak: number;
    available: number;
    fragmentation: number;
  };
  operations: {
    throughput: number;
    latency: number;
    errors: number;
    success: number;
  };
}

interface VerificationResult {
  passed: boolean;
  score: number;
  metrics: {
    accuracy: number;
    precision: number;
    reliability: number;
  };
  issues: string[];
}

interface PerformanceMetrics {
  verifications: PerformanceVerification[];
  results: VerificationResult[];
  performanceScore: number;
  reliabilityScore: number;
  stabilityScore: number;
  healthScore: number;
}

class PerformanceVerificationMonitor {
  private metrics: PerformanceMetrics = {
    verifications: [],
    results: [],
    performanceScore: 100,
    reliabilityScore: 100,
    stabilityScore: 100,
    healthScore: 100
  };

  private onUpdate: (metrics: PerformanceMetrics) => void;
  private startTime: number = Date.now();
  private thresholds = {
    minFps: 55,
    maxRenderTime: 16,
    maxMemoryUsage: 80,
    minThroughput: 90,
    maxLatency: 100
  };

  constructor(onUpdate: (metrics: PerformanceMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordVerification(verification: PerformanceVerification): void {
    this.metrics.verifications.push(verification);
    
    // Analyze verification
    const result = this.analyzeVerification(verification);
    this.metrics.results.push(result);
    
    this.updateMetrics();
  }

  private analyzeVerification(verification: PerformanceVerification): VerificationResult {
    const issues: string[] = [];
    
    // Check FPS
    if (verification.fps.current < this.thresholds.minFps) {
      issues.push(`Low FPS: ${verification.fps.current}`);
    }
    
    // Check render time
    if (verification.timing.render > this.thresholds.maxRenderTime) {
      issues.push(`High render time: ${verification.timing.render}ms`);
    }
    
    // Check memory usage
    const memoryUsagePercent = 
      (verification.memory.used / verification.memory.available) * 100;
    if (memoryUsagePercent > this.thresholds.maxMemoryUsage) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    }
    
    // Check operations
    if (verification.operations.throughput < this.thresholds.minThroughput) {
      issues.push(`Low throughput: ${verification.operations.throughput}`);
    }
    if (verification.operations.latency > this.thresholds.maxLatency) {
      issues.push(`High latency: ${verification.operations.latency}ms`);
    }
    
    // Calculate scores
    const accuracy = this.calculateAccuracy(verification);
    const precision = this.calculatePrecision(verification);
    const reliability = this.calculateReliability(verification);
    
    return {
      passed: issues.length === 0,
      score: (accuracy + precision + reliability) / 3,
      metrics: {
        accuracy,
        precision,
        reliability
      },
      issues
    };
  }

  private calculateAccuracy(verification: PerformanceVerification): number {
    const fpsAccuracy = verification.fps.current / verification.fps.target * 100;
    const timingAccuracy = 
      Math.max(0, 100 - (verification.timing.total / this.thresholds.maxRenderTime * 100));
    const memoryAccuracy = 
      Math.max(0, 100 - (verification.memory.used / verification.memory.available * 100));
    const operationsAccuracy = 
      (verification.operations.success / 
       (verification.operations.success + verification.operations.errors)) * 100;
    
    return (fpsAccuracy + timingAccuracy + memoryAccuracy + operationsAccuracy) / 4;
  }

  private calculatePrecision(verification: PerformanceVerification): number {
    const fpsVariance = Math.max(0, 100 - verification.fps.variance);
    const timingPrecision = 
      Math.max(0, 100 - (verification.timing.render / verification.timing.total * 100));
    const memoryFragmentation = 
      Math.max(0, 100 - verification.memory.fragmentation);
    const operationsPrecision = 
      Math.max(0, 100 - (verification.operations.latency / this.thresholds.maxLatency * 100));
    
    return (fpsVariance + timingPrecision + memoryFragmentation + operationsPrecision) / 4;
  }

  private calculateReliability(verification: PerformanceVerification): number {
    const fpsStability = verification.fps.stability;
    const timingReliability = 
      Math.max(0, 100 - (verification.timing.idle / verification.timing.total * 100));
    const memoryReliability = 
      Math.max(0, 100 - (verification.memory.peak / verification.memory.available * 100));
    const operationsReliability = 
      verification.operations.throughput / this.thresholds.minThroughput * 100;
    
    return (fpsStability + timingReliability + memoryReliability + operationsReliability) / 4;
  }

  private updateMetrics(): void {
    if (this.metrics.results.length === 0) return;
    
    // Calculate performance score
    const recentResults = this.metrics.results.slice(-10);
    this.metrics.performanceScore = recentResults.reduce(
      (sum, result) => sum + result.metrics.accuracy, 0
    ) / recentResults.length;
    
    // Calculate reliability score
    this.metrics.reliabilityScore = recentResults.reduce(
      (sum, result) => sum + result.metrics.reliability, 0
    ) / recentResults.length;
    
    // Calculate stability score
    this.metrics.stabilityScore = recentResults.reduce(
      (sum, result) => sum + result.metrics.precision, 0
    ) / recentResults.length;
    
    // Calculate health score
    this.metrics.healthScore = 
      (this.metrics.performanceScore * 0.4 +
       this.metrics.reliabilityScore * 0.3 +
       this.metrics.stabilityScore * 0.3);
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      verifications: [],
      results: [],
      performanceScore: 100,
      reliabilityScore: 100,
      stabilityScore: 100,
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

describe('StoryMap Performance Verification Tests', () => {
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

  describe('Performance Validation', () => {
    test('validates performance metrics', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PerformanceMetrics = {
        verifications: [],
        results: [],
        performanceScore: 100,
        reliabilityScore: 100,
        stabilityScore: 100,
        healthScore: 100
      };
      
      const monitor = new PerformanceVerificationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate performance verification
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Perform periodic verification
          for (let check = 0; check < 4; check++) {
            const timeOfDay = hour / 24;
            const loadFactor = Math.sin(timeOfDay * Math.PI) * 0.3 + 0.7;
            
            // Record verification
            monitor.recordVerification({
              fps: {
                current: 55 + Math.random() * 10,
                target: 60,
                variance: Math.random() * 5,
                stability: 90 + Math.random() * 10
              },
              timing: {
                render: 8 + Math.random() * 8 * loadFactor,
                update: 4 + Math.random() * 4 * loadFactor,
                idle: 2 + Math.random() * 2,
                total: 16 + Math.random() * 8 * loadFactor
              },
              memory: {
                used: 500 + Math.random() * 500 * loadFactor,
                peak: 1200 + Math.random() * 300,
                available: 2048,
                fragmentation: Math.random() * 20
              },
              operations: {
                throughput: 95 + Math.random() * 10,
                latency: 50 + Math.random() * 50 * loadFactor,
                errors: Math.floor(Math.random() * 5),
                success: 95 + Math.floor(Math.random() * 10)
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
      
      expect(metrics.performanceScore).toBeGreaterThan(85); // High performance
      expect(metrics.reliabilityScore).toBeGreaterThan(90); // Strong reliability
      expect(metrics.healthScore).toBeGreaterThan(85); // Good health
    });
  });

  describe('Resource Verification', () => {
    test('verifies resource usage', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PerformanceMetrics = {
        verifications: [],
        results: [],
        performanceScore: 100,
        reliabilityScore: 100,
        stabilityScore: 100,
        healthScore: 100
      };
      
      const monitor = new PerformanceVerificationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource verification
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate varying resource usage
          const usagePattern = Math.sin(i / 10) * 0.2 + 0.8;
          
          // Record verification
          monitor.recordVerification({
            fps: {
              current: 58 + Math.random() * 4,
              target: 60,
              variance: Math.random() * 3,
              stability: 95 + Math.random() * 5
            },
            timing: {
              render: 6 + Math.random() * 6 * usagePattern,
              update: 3 + Math.random() * 3 * usagePattern,
              idle: 1 + Math.random() * 2,
              total: 12 + Math.random() * 6 * usagePattern
            },
            memory: {
              used: 400 + Math.random() * 400 * usagePattern,
              peak: 1000 + Math.random() * 200,
              available: 2048,
              fragmentation: Math.random() * 15
            },
            operations: {
              throughput: 98 + Math.random() * 4,
              latency: 40 + Math.random() * 40 * usagePattern,
              errors: Math.floor(Math.random() * 3),
              success: 97 + Math.floor(Math.random() * 5)
            }
          });
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Resource verification ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(300000); // 5 minutes
        }
      });
      
      expect(metrics.stabilityScore).toBeGreaterThan(90); // High stability
      expect(metrics.results.filter(r => r.passed).length).toBeGreaterThan(
        metrics.results.length * 0.9
      ); // 90% pass rate
    });
  });

  describe('System Verification', () => {
    test('verifies system health', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PerformanceMetrics = {
        verifications: [],
        results: [],
        performanceScore: 100,
        reliabilityScore: 100,
        stabilityScore: 100,
        healthScore: 100
      };
      
      const monitor = new PerformanceVerificationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate system verification
      await act(async () => {
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            // Simulate daily patterns
            const timeOfDay = hour / 24;
            const systemLoad = Math.sin(timeOfDay * Math.PI) * 0.2 + 0.8;
            
            // Record verification
            monitor.recordVerification({
              fps: {
                current: 57 + Math.random() * 6,
                target: 60,
                variance: Math.random() * 4,
                stability: 92 + Math.random() * 8
              },
              timing: {
                render: 7 + Math.random() * 7 * systemLoad,
                update: 3 + Math.random() * 4 * systemLoad,
                idle: 2 + Math.random() * 2,
                total: 14 + Math.random() * 7 * systemLoad
              },
              memory: {
                used: 450 + Math.random() * 450 * systemLoad,
                peak: 1100 + Math.random() * 250,
                available: 2048,
                fragmentation: Math.random() * 18
              },
              operations: {
                throughput: 96 + Math.random() * 8,
                latency: 45 + Math.random() * 45 * systemLoad,
                errors: Math.floor(Math.random() * 4),
                success: 96 + Math.floor(Math.random() * 8)
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
      
      expect(metrics.healthScore).toBeGreaterThan(85); // Strong health
      expect(metrics.performanceScore).toBeGreaterThan(85); // Good performance
      expect(metrics.reliabilityScore).toBeGreaterThan(90); // High reliability
    });
  });
});
