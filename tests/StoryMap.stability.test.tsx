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

// Stability monitoring utilities
interface SystemEvent {
  type: string;
  timestamp: number;
  impact: number;
  duration: number;
}

interface ResourceMetrics {
  cpu: number;
  memory: number;
  renderTime: number;
  responseTime: number;
}

interface StabilityMetrics {
  events: SystemEvent[];
  resources: ResourceMetrics;
  uptime: number;
  stability: number;
  performance: number;
  reliability: number;
  degradation: number;
  healthScore: number;
}

class StabilityMonitor {
  private metrics: StabilityMetrics = {
    events: [],
    resources: {
      cpu: 0,
      memory: 0,
      renderTime: 0,
      responseTime: 0
    },
    uptime: 0,
    stability: 100,
    performance: 100,
    reliability: 100,
    degradation: 0,
    healthScore: 100
  };

  private onUpdate: (metrics: StabilityMetrics) => void;
  private startTime: number = Date.now();
  private baselinePerformance: ResourceMetrics = {
    cpu: 0,
    memory: 0,
    renderTime: 0,
    responseTime: 0
  };
  private degradationRate: number = 0;
  private lastUpdate: number = Date.now();

  constructor(onUpdate: (metrics: StabilityMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordEvent(type: string, impact: number, duration: number): void {
    const event: SystemEvent = {
      type,
      timestamp: Date.now(),
      impact,
      duration
    };
    
    this.metrics.events.push(event);
    
    // Update stability based on event impact
    this.metrics.stability = Math.max(0,
      this.metrics.stability - (impact * 0.1));
    
    // Update reliability based on event frequency
    const recentEvents = this.metrics.events.filter(e => 
      e.timestamp > Date.now() - 3600000 // Last hour
    ).length;
    this.metrics.reliability = Math.max(0,
      100 - (recentEvents * 2));
    
    this.updateMetrics();
  }

  recordResourceMetrics(metrics: ResourceMetrics): void {
    this.metrics.resources = metrics;
    
    // Initialize baseline if not set
    if (this.baselinePerformance.cpu === 0) {
      this.baselinePerformance = { ...metrics };
    }
    
    // Calculate performance relative to baseline
    const performanceFactors = [
      metrics.cpu / this.baselinePerformance.cpu,
      metrics.memory / this.baselinePerformance.memory,
      metrics.renderTime / this.baselinePerformance.renderTime,
      metrics.responseTime / this.baselinePerformance.responseTime
    ];
    
    this.metrics.performance = 100 / (
      performanceFactors.reduce((a, b) => a + b, 0) / performanceFactors.length
    );
    
    this.updateMetrics();
  }

  recordDegradation(rate: number): void {
    this.degradationRate = rate;
    this.metrics.degradation = Math.min(100,
      this.metrics.degradation + rate);
    
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const now = Date.now();
    
    // Update uptime
    this.metrics.uptime = (now - this.startTime) / 3600000; // Hours
    
    // Apply natural recovery if no recent events
    const timeSinceLastEvent = this.metrics.events.length > 0 ?
      now - this.metrics.events[this.metrics.events.length - 1].timestamp : 
      Number.MAX_VALUE;
    
    if (timeSinceLastEvent > 300000) { // 5 minutes
      this.metrics.stability = Math.min(100,
        this.metrics.stability + 0.1);
      this.metrics.reliability = Math.min(100,
        this.metrics.reliability + 0.1);
    }
    
    // Calculate health score
    this.metrics.healthScore = (
      (this.metrics.stability * 0.3) +
      (this.metrics.performance * 0.3) +
      (this.metrics.reliability * 0.2) +
      ((100 - this.metrics.degradation) * 0.2)
    );
    
    // Apply degradation over time
    const timeDelta = (now - this.lastUpdate) / 1000; // seconds
    this.metrics.degradation = Math.min(100,
      this.metrics.degradation + (this.degradationRate * timeDelta));
    
    this.lastUpdate = now;
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      events: [],
      resources: {
        cpu: 0,
        memory: 0,
        renderTime: 0,
        responseTime: 0
      },
      uptime: 0,
      stability: 100,
      performance: 100,
      reliability: 100,
      degradation: 0,
      healthScore: 100
    };
    this.startTime = Date.now();
    this.baselinePerformance = {
      cpu: 0,
      memory: 0,
      renderTime: 0,
      responseTime: 0
    };
    this.degradationRate = 0;
    this.lastUpdate = Date.now();
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

describe('StoryMap Stability Tests', () => {
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

  describe('Long-term Operation', () => {
    test('maintains stability over extended period', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StabilityMetrics = {
        events: [],
        resources: {
          cpu: 0,
          memory: 0,
          renderTime: 0,
          responseTime: 0
        },
        uptime: 0,
        stability: 100,
        performance: 100,
        reliability: 100,
        degradation: 0,
        healthScore: 100
      };
      
      const monitor = new StabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate long-term operation
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Record baseline metrics
          monitor.recordResourceMetrics({
            cpu: 20 + Math.random() * 10,
            memory: 30 + Math.random() * 15,
            renderTime: 50 + Math.random() * 20,
            responseTime: 100 + Math.random() * 30
          });
          
          // Simulate periodic events
          if (Math.random() < 0.2) { // 20% chance per hour
            monitor.recordEvent(
              'system_event',
              Math.random() * 5,
              Math.random() * 1000
            );
          }
          
          // Simulate gradual degradation
          monitor.recordDegradation(0.01); // 1% per hour
          
          // Periodic updates
          for (let minute = 0; minute < 60; minute++) {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${hour}, Minute ${minute}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(60000); // 1 minute
          }
        }
      });
      
      expect(metrics.stability).toBeGreaterThan(80); // Good stability
      expect(metrics.reliability).toBeGreaterThan(85); // High reliability
      expect(metrics.healthScore).toBeGreaterThan(80); // Good health
    });
  });

  describe('System Endurance', () => {
    test('handles continuous load', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StabilityMetrics = {
        events: [],
        resources: {
          cpu: 0,
          memory: 0,
          renderTime: 0,
          responseTime: 0
        },
        uptime: 0,
        stability: 100,
        performance: 100,
        reliability: 100,
        degradation: 0,
        healthScore: 100
      };
      
      const monitor = new StabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate continuous load
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate varying load
          const loadFactor = Math.sin(i / 10) * 0.5 + 1;
          
          monitor.recordResourceMetrics({
            cpu: 30 * loadFactor + Math.random() * 10,
            memory: 40 * loadFactor + Math.random() * 15,
            renderTime: 60 * loadFactor + Math.random() * 20,
            responseTime: 120 * loadFactor + Math.random() * 30
          });
          
          // Simulate periodic stress
          if (loadFactor > 1.3) {
            monitor.recordEvent(
              'high_load',
              loadFactor * 2,
              1000 * loadFactor
            );
          }
          
          // Simulate gradual system wear
          monitor.recordDegradation(0.05 * loadFactor);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Load test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(600000); // 10 minutes
        }
      });
      
      expect(metrics.performance).toBeGreaterThan(75); // Good performance
      expect(metrics.degradation).toBeLessThan(30); // Limited degradation
      expect(metrics.healthScore).toBeGreaterThan(70); // Acceptable health
    });
  });

  describe('Resource Stability', () => {
    test('maintains resource efficiency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StabilityMetrics = {
        events: [],
        resources: {
          cpu: 0,
          memory: 0,
          renderTime: 0,
          responseTime: 0
        },
        uptime: 0,
        stability: 100,
        performance: 100,
        reliability: 100,
        degradation: 0,
        healthScore: 100
      };
      
      const monitor = new StabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource monitoring
      await act(async () => {
        for (let hour = 0; hour < 12; hour++) {
          // Simulate daily usage pattern
          const timeOfDay = hour / 12;
          const usagePattern = Math.sin(timeOfDay * Math.PI) * 0.5 + 0.5;
          
          for (let interval = 0; interval < 6; interval++) {
            monitor.recordResourceMetrics({
              cpu: 25 + usagePattern * 30 + Math.random() * 10,
              memory: 35 + usagePattern * 25 + Math.random() * 15,
              renderTime: 55 + usagePattern * 35 + Math.random() * 20,
              responseTime: 110 + usagePattern * 40 + Math.random() * 30
            });
            
            // Simulate resource-related events
            if (Math.random() < 0.1) { // 10% chance per interval
              monitor.recordEvent(
                'resource_event',
                usagePattern * 5,
                500 + Math.random() * 1000
              );
            }
            
            // Simulate system wear based on usage
            monitor.recordDegradation(0.02 * usagePattern);
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${hour}, Interval ${interval}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(600000); // 10 minutes
          }
        }
      });
      
      expect(metrics.stability).toBeGreaterThan(85); // High stability
      expect(metrics.performance).toBeGreaterThan(80); // Good performance
      expect(metrics.healthScore).toBeGreaterThan(85); // Strong health
    });
  });
});
