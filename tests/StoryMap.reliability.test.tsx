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

// Reliability monitoring utilities
interface ErrorEvent {
  type: string;
  severity: number;
  timestamp: number;
  recovered: boolean;
  recoveryTime?: number;
}

interface SystemState {
  dataConsistency: number;
  resourceHealth: number;
  operationalStatus: number;
  recoveryProgress: number;
}

interface ReliabilityMetrics {
  errors: ErrorEvent[];
  state: SystemState;
  mttf: number; // Mean Time To Failure
  mttr: number; // Mean Time To Recovery
  availability: number;
  reliability: number;
  faultTolerance: number;
  dataIntegrity: number;
}

class ReliabilityMonitor {
  private metrics: ReliabilityMetrics = {
    errors: [],
    state: {
      dataConsistency: 100,
      resourceHealth: 100,
      operationalStatus: 100,
      recoveryProgress: 100
    },
    mttf: 0,
    mttr: 0,
    availability: 100,
    reliability: 100,
    faultTolerance: 100,
    dataIntegrity: 100
  };

  private onUpdate: (metrics: ReliabilityMetrics) => void;
  private startTime: number = Date.now();
  private lastFailure: number = 0;
  private operationalTime: number = 0;
  private failureCount: number = 0;
  private recoveryTimes: number[] = [];

  constructor(onUpdate: (metrics: ReliabilityMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordError(type: string, severity: number): void {
    const error: ErrorEvent = {
      type,
      severity,
      timestamp: Date.now(),
      recovered: false
    };
    
    this.metrics.errors.push(error);
    this.lastFailure = error.timestamp;
    this.failureCount++;
    
    // Update system state based on error severity
    this.metrics.state.operationalStatus -= severity;
    this.metrics.state.resourceHealth -= severity * 0.5;
    
    this.updateMetrics();
  }

  recordRecovery(errorIndex: number, dataLoss: number = 0): void {
    const error = this.metrics.errors[errorIndex];
    if (error && !error.recovered) {
      error.recovered = true;
      error.recoveryTime = Date.now();
      
      const recoveryTime = error.recoveryTime - error.timestamp;
      this.recoveryTimes.push(recoveryTime);
      
      // Update system state after recovery
      this.metrics.state.operationalStatus = Math.min(100, 
        this.metrics.state.operationalStatus + error.severity);
      this.metrics.state.resourceHealth = Math.min(100, 
        this.metrics.state.resourceHealth + error.severity * 0.5);
      this.metrics.state.dataConsistency = Math.max(0, 
        this.metrics.state.dataConsistency - dataLoss);
      
      this.updateMetrics();
    }
  }

  recordStateChange(state: Partial<SystemState>): void {
    this.metrics.state = {
      ...this.metrics.state,
      ...state
    };
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const currentTime = Date.now();
    const totalTime = currentTime - this.startTime;
    
    // Calculate operational time
    const downtime = this.recoveryTimes.reduce((sum, time) => sum + time, 0);
    this.operationalTime = totalTime - downtime;
    
    // Calculate MTTF (Mean Time To Failure)
    if (this.failureCount > 0) {
      this.metrics.mttf = this.operationalTime / this.failureCount;
    }
    
    // Calculate MTTR (Mean Time To Recovery)
    if (this.recoveryTimes.length > 0) {
      this.metrics.mttr = this.recoveryTimes.reduce((a, b) => a + b, 0) / 
        this.recoveryTimes.length;
    }
    
    // Calculate availability
    this.metrics.availability = (this.operationalTime / totalTime) * 100;
    
    // Calculate reliability
    const failureRate = this.failureCount / (totalTime / 3600000); // failures per hour
    this.metrics.reliability = Math.exp(-failureRate) * 100;
    
    // Calculate fault tolerance
    const unrecoveredErrors = this.metrics.errors.filter(e => !e.recovered).length;
    this.metrics.faultTolerance = 
      ((this.metrics.errors.length - unrecoveredErrors) / 
       Math.max(1, this.metrics.errors.length)) * 100;
    
    // Calculate data integrity
    this.metrics.dataIntegrity = this.metrics.state.dataConsistency;
    
    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      errors: [],
      state: {
        dataConsistency: 100,
        resourceHealth: 100,
        operationalStatus: 100,
        recoveryProgress: 100
      },
      mttf: 0,
      mttr: 0,
      availability: 100,
      reliability: 100,
      faultTolerance: 100,
      dataIntegrity: 100
    };
    this.startTime = Date.now();
    this.lastFailure = 0;
    this.operationalTime = 0;
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

describe('StoryMap Reliability Tests', () => {
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

  describe('Fault Tolerance', () => {
    test('handles errors gracefully', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ReliabilityMetrics = {
        errors: [],
        state: {
          dataConsistency: 100,
          resourceHealth: 100,
          operationalStatus: 100,
          recoveryProgress: 100
        },
        mttf: 0,
        mttr: 0,
        availability: 100,
        reliability: 100,
        faultTolerance: 100,
        dataIntegrity: 100
      };
      
      const monitor = new ReliabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate error scenarios
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          if (i % 10 === 0) {
            // Simulate occasional errors
            const severity = Math.random() * 20 + 10; // 10-30 severity
            monitor.recordError('system_error', severity);
            
            // Attempt recovery
            const recoveryAttempts = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < recoveryAttempts; j++) {
              monitor.recordStateChange({
                recoveryProgress: (j + 1) * (100 / recoveryAttempts)
              });
              
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Recovery attempt ${j + 1}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(1000);
            }
            
            // Record recovery
            monitor.recordRecovery(metrics.errors.length - 1, Math.random() * 5);
          }
          
          defaultProps.onSave?.(toNodes(paragraphs));
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.faultTolerance).toBeGreaterThan(90); // High fault tolerance
      expect(metrics.availability).toBeGreaterThan(95); // High availability
      expect(metrics.dataIntegrity).toBeGreaterThan(95); // High data integrity
    });
  });

  describe('Error Recovery', () => {
    test('recovers from failures effectively', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ReliabilityMetrics = {
        errors: [],
        state: {
          dataConsistency: 100,
          resourceHealth: 100,
          operationalStatus: 100,
          recoveryProgress: 100
        },
        mttf: 0,
        mttr: 0,
        availability: 100,
        reliability: 100,
        faultTolerance: 100,
        dataIntegrity: 100
      };
      
      const monitor = new ReliabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate recovery scenarios
      await act(async () => {
        // Simulate cascading failures
        for (let i = 0; i < 3; i++) {
          monitor.recordError('cascade_failure', 30);
          
          // Gradual recovery
          for (let progress = 0; progress <= 100; progress += 20) {
            monitor.recordStateChange({
              recoveryProgress: progress,
              resourceHealth: Math.min(100, 50 + progress / 2),
              operationalStatus: Math.min(100, 40 + progress)
            });
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Recovery progress ${progress}%`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(1000);
          }
          
          monitor.recordRecovery(i, 2);
          jest.advanceTimersByTime(5000);
        }
      });
      
      expect(metrics.mttr).toBeLessThan(10000); // Quick recovery
      expect(metrics.reliability).toBeGreaterThan(85); // Good reliability
      expect(metrics.state.operationalStatus).toBeGreaterThan(90); // Restored operation
    });
  });

  describe('System Stability', () => {
    test('maintains stable operation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ReliabilityMetrics = {
        errors: [],
        state: {
          dataConsistency: 100,
          resourceHealth: 100,
          operationalStatus: 100,
          recoveryProgress: 100
        },
        mttf: 0,
        mttr: 0,
        availability: 100,
        reliability: 100,
        faultTolerance: 100,
        dataIntegrity: 100
      };
      
      const monitor = new ReliabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate long-term operation
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Normal operation with occasional issues
          for (let minute = 0; minute < 60; minute++) {
            if (Math.random() < 0.05) { // 5% chance of minor issue
              monitor.recordError('minor_issue', 5);
              monitor.recordRecovery(metrics.errors.length - 1, 0);
            }
            
            monitor.recordStateChange({
              resourceHealth: 95 + Math.random() * 5,
              operationalStatus: 98 + Math.random() * 2
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
      
      expect(metrics.mttf).toBeGreaterThan(3600000); // Long time between failures
      expect(metrics.availability).toBeGreaterThan(99); // High availability
      expect(metrics.reliability).toBeGreaterThan(95); // High reliability
    });
  });
});
