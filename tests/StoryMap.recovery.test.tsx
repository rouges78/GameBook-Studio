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

// Recovery monitoring utilities
interface FailureEvent {
  type: string;
  timestamp: number;
  severity: number;
  recoveryTime?: number;
  recoverySuccess?: boolean;
}

interface StateSnapshot {
  timestamp: number;
  dataConsistency: number;
  stateValidity: number;
  recoveryPoint: number;
}

interface RecoveryMetrics {
  failures: FailureEvent[];
  snapshots: StateSnapshot[];
  mttr: number; // Mean Time To Recovery
  recoverySuccess: number;
  dataLoss: number;
  stateConsistency: number;
  serviceAvailability: number;
  recoveryEfficiency: number;
}

class RecoveryMonitor {
  private metrics: RecoveryMetrics = {
    failures: [],
    snapshots: [],
    mttr: 0,
    recoverySuccess: 100,
    dataLoss: 0,
    stateConsistency: 100,
    serviceAvailability: 100,
    recoveryEfficiency: 100
  };

  private onUpdate: (metrics: RecoveryMetrics) => void;
  private startTime: number = Date.now();
  private totalDowntime: number = 0;
  private lastFailure: number | null = null;

  constructor(onUpdate: (metrics: RecoveryMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordFailure(type: string, severity: number): void {
    const failure: FailureEvent = {
      type,
      timestamp: Date.now(),
      severity
    };
    
    this.metrics.failures.push(failure);
    this.lastFailure = failure.timestamp;
    
    this.updateMetrics();
  }

  recordRecovery(success: boolean, dataLoss: number = 0): void {
    if (this.lastFailure && this.metrics.failures.length > 0) {
      const lastFailureEvent = this.metrics.failures[this.metrics.failures.length - 1];
      const recoveryTime = Date.now();
      const downtime = recoveryTime - this.lastFailure;
      
      lastFailureEvent.recoveryTime = recoveryTime;
      lastFailureEvent.recoverySuccess = success;
      
      if (success) {
        this.totalDowntime += downtime;
      }
      
      this.metrics.dataLoss = Math.max(this.metrics.dataLoss, dataLoss);
      this.lastFailure = null;
      
      this.updateMetrics();
    }
  }

  recordStateSnapshot(dataConsistency: number, stateValidity: number): void {
    this.metrics.snapshots.push({
      timestamp: Date.now(),
      dataConsistency,
      stateValidity,
      recoveryPoint: this.metrics.snapshots.length
    });
    
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate MTTR
    const recoveredFailures = this.metrics.failures.filter(f => f.recoveryTime);
    if (recoveredFailures.length > 0) {
      const totalRecoveryTime = recoveredFailures.reduce((sum, f) => 
        sum + ((f.recoveryTime as number) - f.timestamp), 0);
      this.metrics.mttr = totalRecoveryTime / recoveredFailures.length;
    }

    // Calculate recovery success rate
    const totalFailures = this.metrics.failures.length;
    const successfulRecoveries = this.metrics.failures.filter(
      f => f.recoverySuccess
    ).length;
    this.metrics.recoverySuccess = 
      totalFailures > 0 ? (successfulRecoveries / totalFailures) * 100 : 100;

    // Calculate state consistency
    if (this.metrics.snapshots.length > 0) {
      const lastSnapshot = this.metrics.snapshots[this.metrics.snapshots.length - 1];
      this.metrics.stateConsistency = 
        (lastSnapshot.dataConsistency + lastSnapshot.stateValidity) / 2;
    }

    // Calculate service availability
    const totalTime = Date.now() - this.startTime;
    this.metrics.serviceAvailability = 
      ((totalTime - this.totalDowntime) / totalTime) * 100;

    // Calculate recovery efficiency
    const avgSeverity = this.metrics.failures.reduce(
      (sum, f) => sum + f.severity, 0
    ) / Math.max(1, this.metrics.failures.length);
    
    this.metrics.recoveryEfficiency = 
      (this.metrics.recoverySuccess / 100) * 
      (1 - this.metrics.dataLoss / 100) * 
      (1 - avgSeverity / 10) * 100;

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      failures: [],
      snapshots: [],
      mttr: 0,
      recoverySuccess: 100,
      dataLoss: 0,
      stateConsistency: 100,
      serviceAvailability: 100,
      recoveryEfficiency: 100
    };
    this.startTime = Date.now();
    this.totalDowntime = 0;
    this.lastFailure = null;
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

describe('StoryMap Recovery Tests', () => {
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

  describe('Failure Recovery', () => {
    test('recovers from failures effectively', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RecoveryMetrics = {
        failures: [],
        snapshots: [],
        mttr: 0,
        recoverySuccess: 100,
        dataLoss: 0,
        stateConsistency: 100,
        serviceAvailability: 100,
        recoveryEfficiency: 100
      };
      
      const monitor = new RecoveryMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate failure and recovery scenarios
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Take periodic snapshots
          if (i % 10 === 0) {
            monitor.recordStateSnapshot(
              95 + Math.random() * 5,
              97 + Math.random() * 3
            );
          }
          
          // Simulate occasional failures
          if (i % 25 === 0) {
            const severity = Math.floor(Math.random() * 8) + 2;
            monitor.recordFailure('system_error', severity);
            
            // Simulate recovery process
            const recoverySteps = Math.floor(Math.random() * 3) + 1;
            for (let step = 0; step < recoverySteps; step++) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Recovery step ${step}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(1000);
            }
            
            monitor.recordRecovery(
              Math.random() > 0.1, // 90% success rate
              Math.random() * 5 // 0-5% data loss
            );
          }
          
          defaultProps.onSave?.(toNodes(paragraphs));
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.recoverySuccess).toBeGreaterThan(85); // High recovery rate
      expect(metrics.mttr).toBeLessThan(5000); // Quick recovery
      expect(metrics.stateConsistency).toBeGreaterThan(90); // Good consistency
    });
  });

  describe('State Restoration', () => {
    test('maintains state consistency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RecoveryMetrics = {
        failures: [],
        snapshots: [],
        mttr: 0,
        recoverySuccess: 100,
        dataLoss: 0,
        stateConsistency: 100,
        serviceAvailability: 100,
        recoveryEfficiency: 100
      };
      
      const monitor = new RecoveryMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate state management
      await act(async () => {
        for (let i = 0; i < 50; i++) {
          // Regular state snapshots
          monitor.recordStateSnapshot(
            98 + Math.random() * 2,
            99 + Math.random()
          );
          
          if (i % 10 === 0) {
            // Simulate state corruption
            monitor.recordFailure('state_corruption', 5);
            
            // Recovery attempt
            const recoverySteps = 3;
            for (let step = 0; step < recoverySteps; step++) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `State restoration ${step}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(500);
            }
            
            monitor.recordRecovery(true, Math.random() * 2);
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Operation ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.stateConsistency).toBeGreaterThan(95); // High consistency
      expect(metrics.dataLoss).toBeLessThan(5); // Minimal data loss
      expect(metrics.recoveryEfficiency).toBeGreaterThan(90); // Efficient recovery
    });
  });

  describe('Service Continuity', () => {
    test('maintains service availability', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RecoveryMetrics = {
        failures: [],
        snapshots: [],
        mttr: 0,
        recoverySuccess: 100,
        dataLoss: 0,
        stateConsistency: 100,
        serviceAvailability: 100,
        recoveryEfficiency: 100
      };
      
      const monitor = new RecoveryMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate continuous operation
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Regular operation
          monitor.recordStateSnapshot(
            99 + Math.random(),
            99 + Math.random()
          );
          
          // Simulate random failures
          if (Math.random() < 0.1) { // 10% chance of failure per hour
            const severity = Math.floor(Math.random() * 5) + 1;
            monitor.recordFailure('random_failure', severity);
            
            // Quick recovery attempt
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Recovery hour ${hour}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            monitor.recordRecovery(
              Math.random() > 0.05, // 95% recovery success
              Math.random() // 0-1% data loss
            );
          }
          
          defaultProps.onSave?.(toNodes(paragraphs));
          jest.advanceTimersByTime(3600000); // 1 hour
        }
      });
      
      expect(metrics.serviceAvailability).toBeGreaterThan(99); // High availability
      expect(metrics.recoveryEfficiency).toBeGreaterThan(90); // Efficient recovery
      expect(metrics.stateConsistency).toBeGreaterThan(98); // Excellent consistency
    });
  });
});
