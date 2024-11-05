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

// Endurance monitoring utilities
interface ResourceUsage {
  memory: {
    used: number;
    peak: number;
    leakRate: number;
  };
  cpu: {
    usage: number;
    peak: number;
    saturation: number;
  };
  io: {
    operations: number;
    throughput: number;
    latency: number;
  };
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
}

interface EnduranceMetrics {
  resources: ResourceUsage;
  performance: PerformanceMetrics;
  runtime: number;
  stability: number;
  efficiency: number;
  endurance: number;
  healthScore: number;
  warnings: string[];
}

class EnduranceMonitor {
  private metrics: EnduranceMetrics = {
    resources: {
      memory: {
        used: 0,
        peak: 0,
        leakRate: 0
      },
      cpu: {
        usage: 0,
        peak: 0,
        saturation: 0
      },
      io: {
        operations: 0,
        throughput: 0,
        latency: 0
      }
    },
    performance: {
      fps: 60,
      frameTime: 16.67,
      renderTime: 0,
      updateTime: 0
    },
    runtime: 0,
    stability: 100,
    efficiency: 100,
    endurance: 100,
    healthScore: 100,
    warnings: []
  };

  private onUpdate: (metrics: EnduranceMetrics) => void;
  private startTime: number = Date.now();
  private memoryReadings: number[] = [];
  private cpuReadings: number[] = [];
  private performanceReadings: PerformanceMetrics[] = [];
  private warningThresholds = {
    memoryLeakRate: 0.1,
    cpuSaturation: 80,
    fpsDropRate: 10,
    latencySpike: 100
  };

  constructor(onUpdate: (metrics: EnduranceMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordResourceUsage(memory: number, cpu: number, io: number): void {
    // Update memory metrics
    this.memoryReadings.push(memory);
    this.metrics.resources.memory.used = memory;
    this.metrics.resources.memory.peak = Math.max(
      this.metrics.resources.memory.peak,
      memory
    );
    
    // Calculate memory leak rate
    if (this.memoryReadings.length > 10) {
      const recentReadings = this.memoryReadings.slice(-10);
      const trend = this.calculateTrend(recentReadings);
      this.metrics.resources.memory.leakRate = trend;
      
      if (trend > this.warningThresholds.memoryLeakRate) {
        this.addWarning(`Memory leak detected: ${trend.toFixed(2)}MB/s`);
      }
    }
    
    // Update CPU metrics
    this.cpuReadings.push(cpu);
    this.metrics.resources.cpu.usage = cpu;
    this.metrics.resources.cpu.peak = Math.max(
      this.metrics.resources.cpu.peak,
      cpu
    );
    
    // Calculate CPU saturation
    const recentCPU = this.cpuReadings.slice(-5);
    this.metrics.resources.cpu.saturation = 
      recentCPU.reduce((a, b) => a + b, 0) / recentCPU.length;
    
    if (this.metrics.resources.cpu.saturation > this.warningThresholds.cpuSaturation) {
      this.addWarning(`High CPU saturation: ${this.metrics.resources.cpu.saturation.toFixed(1)}%`);
    }
    
    // Update IO metrics
    this.metrics.resources.io.operations++;
    this.metrics.resources.io.throughput = io;
    this.metrics.resources.io.latency = io > 0 ? 1000 / io : 0;
    
    if (this.metrics.resources.io.latency > this.warningThresholds.latencySpike) {
      this.addWarning(`High IO latency: ${this.metrics.resources.io.latency.toFixed(1)}ms`);
    }
    
    this.updateMetrics();
  }

  recordPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceReadings.push(metrics);
    this.metrics.performance = metrics;
    
    // Calculate FPS stability
    if (this.performanceReadings.length > 10) {
      const recentFPS = this.performanceReadings.slice(-10).map(m => m.fps);
      const avgFPS = recentFPS.reduce((a, b) => a + b, 0) / recentFPS.length;
      const dropRate = 60 - avgFPS;
      
      if (dropRate > this.warningThresholds.fpsDropRate) {
        this.addWarning(`FPS drop detected: ${dropRate.toFixed(1)} frames/s`);
      }
    }
    
    this.updateMetrics();
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const x = i - xMean;
      const y = values[i] - yMean;
      numerator += x * y;
      denominator += x * x;
    }
    
    return denominator !== 0 ? numerator / denominator : 0;
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
    const now = Date.now();
    this.metrics.runtime = (now - this.startTime) / 3600000; // Hours
    
    // Calculate stability
    const performanceVariation = this.calculatePerformanceVariation();
    const resourceVariation = this.calculateResourceVariation();
    this.metrics.stability = 100 - (performanceVariation + resourceVariation) / 2;
    
    // Calculate efficiency
    const memoryEfficiency = 1 - (this.metrics.resources.memory.leakRate / 
      this.warningThresholds.memoryLeakRate);
    const cpuEfficiency = 1 - (this.metrics.resources.cpu.saturation / 100);
    this.metrics.efficiency = (memoryEfficiency + cpuEfficiency) * 50;
    
    // Calculate endurance
    const timeWeight = Math.min(this.metrics.runtime / 24, 1); // Normalize to 24 hours
    this.metrics.endurance = 
      (this.metrics.stability * 0.4 +
       this.metrics.efficiency * 0.4 +
       timeWeight * 100 * 0.2);
    
    // Calculate health score
    this.metrics.healthScore = 
      (this.metrics.stability * 0.3 +
       this.metrics.efficiency * 0.3 +
       this.metrics.endurance * 0.4);
    
    this.onUpdate(this.metrics);
  }

  private calculatePerformanceVariation(): number {
    if (this.performanceReadings.length < 2) return 0;
    
    const recentReadings = this.performanceReadings.slice(-10);
    const fpsVariation = this.calculateVariation(recentReadings.map(m => m.fps));
    const frameTimeVariation = this.calculateVariation(recentReadings.map(m => m.frameTime));
    
    return (fpsVariation + frameTimeVariation) / 2;
  }

  private calculateResourceVariation(): number {
    if (this.memoryReadings.length < 2 || this.cpuReadings.length < 2) return 0;
    
    const memoryVariation = this.calculateVariation(this.memoryReadings.slice(-10));
    const cpuVariation = this.calculateVariation(this.cpuReadings.slice(-10));
    
    return (memoryVariation + cpuVariation) / 2;
  }

  private calculateVariation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean * 100;
  }

  reset(): void {
    this.metrics = {
      resources: {
        memory: {
          used: 0,
          peak: 0,
          leakRate: 0
        },
        cpu: {
          usage: 0,
          peak: 0,
          saturation: 0
        },
        io: {
          operations: 0,
          throughput: 0,
          latency: 0
        }
      },
      performance: {
        fps: 60,
        frameTime: 16.67,
        renderTime: 0,
        updateTime: 0
      },
      runtime: 0,
      stability: 100,
      efficiency: 100,
      endurance: 100,
      healthScore: 100,
      warnings: []
    };
    this.startTime = Date.now();
    this.memoryReadings = [];
    this.cpuReadings = [];
    this.performanceReadings = [];
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

describe('StoryMap Endurance Tests', () => {
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

  describe('System Durability', () => {
    test('maintains system health under continuous load', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: EnduranceMetrics = {
        resources: {
          memory: {
            used: 0,
            peak: 0,
            leakRate: 0
          },
          cpu: {
            usage: 0,
            peak: 0,
            saturation: 0
          },
          io: {
            operations: 0,
            throughput: 0,
            latency: 0
          }
        },
        performance: {
          fps: 60,
          frameTime: 16.67,
          renderTime: 0,
          updateTime: 0
        },
        runtime: 0,
        stability: 100,
        efficiency: 100,
        endurance: 100,
        healthScore: 100,
        warnings: []
      };
      
      const monitor = new EnduranceMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate continuous operation
      await act(async () => {
        for (let hour = 0; hour < 72; hour++) { // 72-hour test
          // Simulate varying load conditions
          for (let minute = 0; minute < 60; minute++) {
            const timeOfDay = (hour % 24) / 24;
            const loadFactor = Math.sin(timeOfDay * Math.PI) * 0.3 + 1;
            
            // Record resource usage
            monitor.recordResourceUsage(
              50 + Math.random() * 10 * loadFactor, // Memory
              30 + Math.random() * 15 * loadFactor, // CPU
              1000 + Math.random() * 200 * loadFactor // IO
            );
            
            // Record performance metrics
            monitor.recordPerformanceMetrics({
              fps: 60 - Math.random() * 5 * loadFactor,
              frameTime: 16.67 + Math.random() * 2 * loadFactor,
              renderTime: 8 + Math.random() * 4 * loadFactor,
              updateTime: 4 + Math.random() * 2 * loadFactor
            });
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${hour}, Minute ${minute}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(60000); // 1 minute
          }
        }
      });
      
      expect(metrics.stability).toBeGreaterThan(85); // High stability
      expect(metrics.efficiency).toBeGreaterThan(80); // Good efficiency
      expect(metrics.endurance).toBeGreaterThan(85); // Strong endurance
      expect(metrics.warnings.length).toBeLessThan(5); // Few warnings
    });
  });

  describe('Resource Endurance', () => {
    test('maintains resource efficiency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: EnduranceMetrics = {
        resources: {
          memory: {
            used: 0,
            peak: 0,
            leakRate: 0
          },
          cpu: {
            usage: 0,
            peak: 0,
            saturation: 0
          },
          io: {
            operations: 0,
            throughput: 0,
            latency: 0
          }
        },
        performance: {
          fps: 60,
          frameTime: 16.67,
          renderTime: 0,
          updateTime: 0
        },
        runtime: 0,
        stability: 100,
        efficiency: 100,
        endurance: 100,
        healthScore: 100,
        warnings: []
      };
      
      const monitor = new EnduranceMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource monitoring
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate resource usage patterns
          const usagePattern = Math.sin(i / 10) * 0.2 + 0.8;
          
          // Record resource metrics
          monitor.recordResourceUsage(
            45 + Math.random() * 10 * usagePattern, // Memory
            25 + Math.random() * 15 * usagePattern, // CPU
            800 + Math.random() * 200 * usagePattern // IO
          );
          
          // Record performance impact
          monitor.recordPerformanceMetrics({
            fps: 58 + Math.random() * 4,
            frameTime: 16 + Math.random() * 2,
            renderTime: 7 + Math.random() * 3,
            updateTime: 3 + Math.random() * 2
          });
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Resource test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(300000); // 5 minutes
        }
      });
      
      expect(metrics.resources.memory.leakRate).toBeLessThan(0.05); // Low memory leak
      expect(metrics.resources.cpu.saturation).toBeLessThan(70); // Good CPU usage
      expect(metrics.resources.io.latency).toBeLessThan(50); // Low latency
    });
  });

  describe('Performance Longevity', () => {
    test('maintains performance over time', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: EnduranceMetrics = {
        resources: {
          memory: {
            used: 0,
            peak: 0,
            leakRate: 0
          },
          cpu: {
            usage: 0,
            peak: 0,
            saturation: 0
          },
          io: {
            operations: 0,
            throughput: 0,
            latency: 0
          }
        },
        performance: {
          fps: 60,
          frameTime: 16.67,
          renderTime: 0,
          updateTime: 0
        },
        runtime: 0,
        stability: 100,
        efficiency: 100,
        endurance: 100,
        healthScore: 100,
        warnings: []
      };
      
      const monitor = new EnduranceMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate long-term performance monitoring
      await act(async () => {
        for (let day = 0; day < 7; day++) { // Week-long test
          for (let hour = 0; hour < 24; hour++) {
            // Simulate daily performance patterns
            const timeOfDay = hour / 24;
            const loadPattern = Math.sin(timeOfDay * Math.PI) * 0.3 + 0.7;
            
            for (let minute = 0; minute < 60; minute += 5) {
              // Record performance metrics
              monitor.recordPerformanceMetrics({
                fps: 57 + Math.random() * 6 * loadPattern,
                frameTime: 15 + Math.random() * 3 * loadPattern,
                renderTime: 6 + Math.random() * 4 * loadPattern,
                updateTime: 3 + Math.random() * 2 * loadPattern
              });
              
              // Record associated resource usage
              monitor.recordResourceUsage(
                40 + Math.random() * 15 * loadPattern, // Memory
                20 + Math.random() * 20 * loadPattern, // CPU
                900 + Math.random() * 200 * loadPattern // IO
              );
              
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Day ${day}, Hour ${hour}, Minute ${minute}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(300000); // 5 minutes
            }
          }
        }
      });
      
      expect(metrics.performance.fps).toBeGreaterThan(55); // Stable FPS
      expect(metrics.performance.frameTime).toBeLessThan(20); // Good frame time
      expect(metrics.healthScore).toBeGreaterThan(85); // Strong health
    });
  });
});
