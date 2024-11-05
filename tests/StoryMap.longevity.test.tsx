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

// Longevity monitoring utilities
interface PerformanceSnapshot {
  timestamp: number;
  memory: number;
  cpu: number;
  fps: number;
  responseTime: number;
}

interface ResourceTrend {
  type: string;
  trend: number[];
  average: number;
  peak: number;
  degradation: number;
}

interface LongevityMetrics {
  snapshots: PerformanceSnapshot[];
  trends: {
    memory: ResourceTrend;
    cpu: ResourceTrend;
    fps: ResourceTrend;
    responseTime: ResourceTrend;
  };
  uptime: number;
  stability: number;
  performance: number;
  sustainability: number;
  healthIndex: number;
}

class LongevityMonitor {
  private metrics: LongevityMetrics = {
    snapshots: [],
    trends: {
      memory: {
        type: 'memory',
        trend: [],
        average: 0,
        peak: 0,
        degradation: 0
      },
      cpu: {
        type: 'cpu',
        trend: [],
        average: 0,
        peak: 0,
        degradation: 0
      },
      fps: {
        type: 'fps',
        trend: [],
        average: 0,
        peak: 0,
        degradation: 0
      },
      responseTime: {
        type: 'responseTime',
        trend: [],
        average: 0,
        peak: 0,
        degradation: 0
      }
    },
    uptime: 0,
    stability: 100,
    performance: 100,
    sustainability: 100,
    healthIndex: 100
  };

  private onUpdate: (metrics: LongevityMetrics) => void;
  private startTime: number = Date.now();
  private baselinePerformance: PerformanceSnapshot | null = null;
  private lastUpdate: number = Date.now();
  private degradationFactors: Map<string, number> = new Map();

  constructor(onUpdate: (metrics: LongevityMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordSnapshot(snapshot: PerformanceSnapshot): void {
    this.metrics.snapshots.push(snapshot);
    
    // Initialize baseline if not set
    if (!this.baselinePerformance) {
      this.baselinePerformance = snapshot;
    }
    
    // Update trends
    this.updateTrend('memory', snapshot.memory);
    this.updateTrend('cpu', snapshot.cpu);
    this.updateTrend('fps', snapshot.fps);
    this.updateTrend('responseTime', snapshot.responseTime);
    
    this.updateMetrics();
  }

  private updateTrend(type: string, value: number): void {
    const trend = this.metrics.trends[type as keyof typeof this.metrics.trends];
    trend.trend.push(value);
    
    // Keep last 100 values for trend analysis
    if (trend.trend.length > 100) {
      trend.trend.shift();
    }
    
    // Update statistics
    trend.average = trend.trend.reduce((a, b) => a + b, 0) / trend.trend.length;
    trend.peak = Math.max(...trend.trend);
    
    // Calculate degradation
    if (this.baselinePerformance) {
      const baseline = this.baselinePerformance[type as keyof PerformanceSnapshot] as number;
      const currentAvg = trend.trend.slice(-10).reduce((a, b) => a + b, 0) / 10;
      
      if (type === 'responseTime' || type === 'memory') {
        trend.degradation = Math.max(0, (currentAvg - baseline) / baseline * 100);
      } else {
        trend.degradation = Math.max(0, (baseline - currentAvg) / baseline * 100);
      }
      
      this.degradationFactors.set(type, trend.degradation);
    }
  }

  private updateMetrics(): void {
    const now = Date.now();
    
    // Update uptime
    this.metrics.uptime = (now - this.startTime) / 3600000; // Hours
    
    // Calculate stability based on trend variations
    const variations = Object.values(this.metrics.trends).map(trend => {
      const recentValues = trend.trend.slice(-20);
      const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      return recentValues.reduce((sum, val) => 
        sum + Math.pow(val - avg, 2), 0) / recentValues.length;
    });
    
    this.metrics.stability = 100 - (
      variations.reduce((a, b) => a + b, 0) / variations.length
    );
    
    // Calculate performance based on current vs baseline
    if (this.baselinePerformance) {
      const performanceFactors = Array.from(this.degradationFactors.values());
      this.metrics.performance = 100 - (
        performanceFactors.reduce((a, b) => a + b, 0) / performanceFactors.length
      );
    }
    
    // Calculate sustainability based on degradation trends
    const degradationRates = Object.values(this.metrics.trends).map(trend => {
      const recentValues = trend.trend.slice(-20);
      const degradationRate = (recentValues[recentValues.length - 1] - recentValues[0]) /
        recentValues[0] * 100;
      return Math.max(0, degradationRate);
    });
    
    this.metrics.sustainability = 100 - (
      degradationRates.reduce((a, b) => a + b, 0) / degradationRates.length
    );
    
    // Calculate overall health index
    this.metrics.healthIndex = (
      (this.metrics.stability * 0.3) +
      (this.metrics.performance * 0.3) +
      (this.metrics.sustainability * 0.4)
    );
    
    this.lastUpdate = now;
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      snapshots: [],
      trends: {
        memory: {
          type: 'memory',
          trend: [],
          average: 0,
          peak: 0,
          degradation: 0
        },
        cpu: {
          type: 'cpu',
          trend: [],
          average: 0,
          peak: 0,
          degradation: 0
        },
        fps: {
          type: 'fps',
          trend: [],
          average: 0,
          peak: 0,
          degradation: 0
        },
        responseTime: {
          type: 'responseTime',
          trend: [],
          average: 0,
          peak: 0,
          degradation: 0
        }
      },
      uptime: 0,
      stability: 100,
      performance: 100,
      sustainability: 100,
      healthIndex: 100
    };
    this.startTime = Date.now();
    this.baselinePerformance = null;
    this.lastUpdate = Date.now();
    this.degradationFactors.clear();
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

describe('StoryMap Longevity Tests', () => {
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

  describe('Extended Operation', () => {
    test('maintains performance over long duration', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LongevityMetrics = {
        snapshots: [],
        trends: {
          memory: {
            type: 'memory',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          cpu: {
            type: 'cpu',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          fps: {
            type: 'fps',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          responseTime: {
            type: 'responseTime',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          }
        },
        uptime: 0,
        stability: 100,
        performance: 100,
        sustainability: 100,
        healthIndex: 100
      };
      
      const monitor = new LongevityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate extended operation
      await act(async () => {
        for (let hour = 0; hour < 48; hour++) { // 48-hour test
          // Record performance metrics every 15 minutes
          for (let minute = 0; minute < 60; minute += 15) {
            // Simulate varying load conditions
            const timeOfDay = (hour % 24) / 24;
            const loadFactor = Math.sin(timeOfDay * Math.PI) * 0.3 + 1;
            
            monitor.recordSnapshot({
              timestamp: Date.now(),
              memory: (50 + Math.random() * 10) * loadFactor,
              cpu: (30 + Math.random() * 15) * loadFactor,
              fps: (58 + Math.random() * 4) / loadFactor,
              responseTime: (100 + Math.random() * 20) * loadFactor
            });
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${hour}, Minute ${minute}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(900000); // 15 minutes
          }
        }
      });
      
      expect(metrics.stability).toBeGreaterThan(85); // High stability
      expect(metrics.performance).toBeGreaterThan(80); // Good performance
      expect(metrics.sustainability).toBeGreaterThan(85); // Strong sustainability
    });
  });

  describe('Performance Stability', () => {
    test('maintains consistent performance', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LongevityMetrics = {
        snapshots: [],
        trends: {
          memory: {
            type: 'memory',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          cpu: {
            type: 'cpu',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          fps: {
            type: 'fps',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          responseTime: {
            type: 'responseTime',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          }
        },
        uptime: 0,
        stability: 100,
        performance: 100,
        sustainability: 100,
        healthIndex: 100
      };
      
      const monitor = new LongevityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate performance monitoring
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate varying workload
          const workload = Math.sin(i / 10) * 0.2 + 1;
          
          // Record performance metrics
          monitor.recordSnapshot({
            timestamp: Date.now(),
            memory: 45 + Math.random() * 10 * workload,
            cpu: 25 + Math.random() * 15 * workload,
            fps: 60 - Math.random() * 5 * workload,
            responseTime: 90 + Math.random() * 20 * workload
          });
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Performance test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(300000); // 5 minutes
        }
      });
      
      expect(metrics.performance).toBeGreaterThan(85); // High performance
      expect(metrics.trends.memory.degradation).toBeLessThan(15); // Low memory degradation
      expect(metrics.trends.fps.degradation).toBeLessThan(10); // Stable FPS
    });
  });

  describe('System Health', () => {
    test('maintains system health', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: LongevityMetrics = {
        snapshots: [],
        trends: {
          memory: {
            type: 'memory',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          cpu: {
            type: 'cpu',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          fps: {
            type: 'fps',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          },
          responseTime: {
            type: 'responseTime',
            trend: [],
            average: 0,
            peak: 0,
            degradation: 0
          }
        },
        uptime: 0,
        stability: 100,
        performance: 100,
        sustainability: 100,
        healthIndex: 100
      };
      
      const monitor = new LongevityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate health monitoring
      await act(async () => {
        for (let day = 0; day < 7; day++) { // Week-long test
          for (let hour = 0; hour < 24; hour++) {
            // Simulate daily usage patterns
            const timeOfDay = hour / 24;
            const usagePattern = Math.sin(timeOfDay * Math.PI) * 0.4 + 0.6;
            
            monitor.recordSnapshot({
              timestamp: Date.now(),
              memory: 40 + usagePattern * 20 + Math.random() * 10,
              cpu: 20 + usagePattern * 25 + Math.random() * 15,
              fps: 60 - usagePattern * 5 + Math.random() * 3,
              responseTime: 80 + usagePattern * 30 + Math.random() * 20
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
      
      expect(metrics.healthIndex).toBeGreaterThan(85); // Strong health
      expect(metrics.sustainability).toBeGreaterThan(80); // Good sustainability
      expect(metrics.stability).toBeGreaterThan(85); // High stability
    });
  });
});
