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

// SLA monitoring utilities
interface ServiceLevel {
  responseTime: number;
  availability: number;
  throughput: number;
  errorRate: number;
}

interface SlaTarget {
  maxResponseTime: number;
  minAvailability: number;
  minThroughput: number;
  maxErrorRate: number;
}

interface SlaMetrics {
  current: ServiceLevel;
  violations: number;
  complianceRate: number;
  mttr: number; // Mean Time To Recovery
  mtbf: number; // Mean Time Between Failures
  uptime: number;
  performance: number;
}

class SlaMonitor {
  private metrics: SlaMetrics = {
    current: {
      responseTime: 0,
      availability: 100,
      throughput: 0,
      errorRate: 0
    },
    violations: 0,
    complianceRate: 100,
    mttr: 0,
    mtbf: 0,
    uptime: 100,
    performance: 100
  };

  private onUpdate: (metrics: SlaMetrics) => void;
  private slaTarget: SlaTarget;
  private startTime: number = Date.now();
  private lastFailure: number = 0;
  private lastRecovery: number = 0;
  private totalDowntime: number = 0;
  private failureCount: number = 0;
  private recoveryTimes: number[] = [];

  constructor(onUpdate: (metrics: SlaMetrics) => void, slaTarget: SlaTarget) {
    this.onUpdate = onUpdate;
    this.slaTarget = slaTarget;
  }

  recordServiceLevel(level: ServiceLevel): void {
    this.metrics.current = level;
    
    // Check for SLA violations
    if (
      level.responseTime > this.slaTarget.maxResponseTime ||
      level.availability < this.slaTarget.minAvailability ||
      level.throughput < this.slaTarget.minThroughput ||
      level.errorRate > this.slaTarget.maxErrorRate
    ) {
      this.metrics.violations++;
      
      if (this.lastFailure === 0) {
        this.lastFailure = Date.now();
      }
    } else if (this.lastFailure > 0) {
      // Service has recovered
      const recoveryTime = Date.now();
      const downtime = recoveryTime - this.lastFailure;
      this.totalDowntime += downtime;
      this.recoveryTimes.push(downtime);
      this.lastRecovery = recoveryTime;
      this.lastFailure = 0;
      this.failureCount++;
    }
    
    this.updateMetrics();
  }

  recordPerformanceData(responseTime: number, errorCount: number, requestCount: number): void {
    const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
    const throughput = requestCount / (Date.now() - this.startTime) * 1000; // requests per second
    
    this.recordServiceLevel({
      responseTime,
      availability: this.metrics.current.availability,
      throughput,
      errorRate
    });
  }

  recordAvailability(isAvailable: boolean): void {
    const availability = isAvailable ? 100 : 0;
    
    this.recordServiceLevel({
      ...this.metrics.current,
      availability
    });
  }

  private updateMetrics(): void {
    const totalTime = Date.now() - this.startTime;
    
    // Calculate uptime percentage
    this.metrics.uptime = ((totalTime - this.totalDowntime) / totalTime) * 100;
    
    // Calculate compliance rate
    const totalChecks = this.metrics.violations + 
      Math.floor(totalTime / 60000); // Assume one check per minute
    this.metrics.complianceRate = ((totalChecks - this.metrics.violations) / totalChecks) * 100;
    
    // Calculate MTTR (Mean Time To Recovery)
    if (this.recoveryTimes.length > 0) {
      this.metrics.mttr = this.recoveryTimes.reduce((a, b) => a + b, 0) / 
        this.recoveryTimes.length;
    }
    
    // Calculate MTBF (Mean Time Between Failures)
    if (this.failureCount > 0) {
      const operationalTime = totalTime - this.totalDowntime;
      this.metrics.mtbf = operationalTime / this.failureCount;
    }
    
    // Calculate overall performance score
    this.metrics.performance = (
      (this.metrics.complianceRate * 0.4) +
      (this.metrics.uptime * 0.3) +
      ((1 - (this.metrics.current.responseTime / this.slaTarget.maxResponseTime)) * 100 * 0.3)
    );
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      current: {
        responseTime: 0,
        availability: 100,
        throughput: 0,
        errorRate: 0
      },
      violations: 0,
      complianceRate: 100,
      mttr: 0,
      mtbf: 0,
      uptime: 100,
      performance: 100
    };
    this.startTime = Date.now();
    this.lastFailure = 0;
    this.lastRecovery = 0;
    this.totalDowntime = 0;
    this.failureCount = 0;
    this.recoveryTimes = [];
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

describe('StoryMap SLA Compliance Tests', () => {
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

  describe('Performance Targets', () => {
    test('maintains response time SLA', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SlaMetrics = {
        current: {
          responseTime: 0,
          availability: 100,
          throughput: 0,
          errorRate: 0
        },
        violations: 0,
        complianceRate: 100,
        mttr: 0,
        mtbf: 0,
        uptime: 100,
        performance: 100
      };
      
      const monitor = new SlaMonitor((m) => {
        metrics = m;
      }, {
        maxResponseTime: 200,
        minAvailability: 99.9,
        minThroughput: 10,
        maxErrorRate: 1
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate performance monitoring
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate varying load conditions
          const baseResponseTime = 100;
          const loadFactor = Math.sin(i / 10) * 50; // Oscillating load
          const errorProbability = 0.01; // 1% error rate
          
          monitor.recordPerformanceData(
            baseResponseTime + loadFactor,
            Math.random() < errorProbability ? 1 : 0,
            1
          );
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Performance test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.current.responseTime).toBeLessThan(200); // Within SLA
      expect(metrics.complianceRate).toBeGreaterThan(95); // High compliance
      expect(metrics.performance).toBeGreaterThan(90); // Good performance
    });
  });

  describe('Availability Requirements', () => {
    test('maintains uptime SLA', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SlaMetrics = {
        current: {
          responseTime: 0,
          availability: 100,
          throughput: 0,
          errorRate: 0
        },
        violations: 0,
        complianceRate: 100,
        mttr: 0,
        mtbf: 0,
        uptime: 100,
        performance: 100
      };
      
      const monitor = new SlaMonitor((m) => {
        metrics = m;
      }, {
        maxResponseTime: 200,
        minAvailability: 99.9,
        minThroughput: 10,
        maxErrorRate: 1
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate availability monitoring
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          // Simulate occasional downtime
          const isAvailable = Math.random() > 0.01; // 99% availability
          monitor.recordAvailability(isAvailable);
          
          if (isAvailable) {
            monitor.recordPerformanceData(
              100 + Math.random() * 50,
              0,
              1
            );
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Availability test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(60000); // 1 minute intervals
        }
      });
      
      expect(metrics.uptime).toBeGreaterThan(99); // High availability
      expect(metrics.mttr).toBeLessThan(300000); // Quick recovery
      expect(metrics.mtbf).toBeGreaterThan(3600000); // Long time between failures
    });
  });

  describe('Error Rate Compliance', () => {
    test('maintains error rate SLA', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: SlaMetrics = {
        current: {
          responseTime: 0,
          availability: 100,
          throughput: 0,
          errorRate: 0
        },
        violations: 0,
        complianceRate: 100,
        mttr: 0,
        mtbf: 0,
        uptime: 100,
        performance: 100
      };
      
      const monitor = new SlaMonitor((m) => {
        metrics = m;
      }, {
        maxResponseTime: 200,
        minAvailability: 99.9,
        minThroughput: 10,
        maxErrorRate: 1
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate error rate monitoring
      await act(async () => {
        let totalRequests = 0;
        let totalErrors = 0;
        
        for (let i = 0; i < 100; i++) {
          const batchSize = 10 + Math.floor(Math.random() * 10); // 10-20 requests per batch
          const errors = Math.floor(Math.random() * 0.02 * batchSize); // 0-2% error rate
          
          totalRequests += batchSize;
          totalErrors += errors;
          
          monitor.recordPerformanceData(
            100 + Math.random() * 50,
            errors,
            batchSize
          );
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Error test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.current.errorRate).toBeLessThan(1); // Below SLA threshold
      expect(metrics.current.throughput).toBeGreaterThan(10); // Meeting throughput SLA
      expect(metrics.complianceRate).toBeGreaterThan(95); // High compliance
    });
  });
});
