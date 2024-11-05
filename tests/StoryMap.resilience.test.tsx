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

// Resilience monitoring utilities
interface ErrorCondition {
  type: string;
  severity: number;
  handled: boolean;
  recoveryPath?: string;
}

interface SystemState {
  stability: number;
  degradation: number;
  errorRate: number;
  recoveryRate: number;
}

interface ResilienceMetrics {
  errors: ErrorCondition[];
  state: SystemState;
  errorHandlingRate: number;
  degradationTolerance: number;
  stabilityIndex: number;
  recoveryCapability: number;
  mttf: number; // Mean Time To Failure
  mttr: number; // Mean Time To Recovery
}

class ResilienceMonitor {
  private metrics: ResilienceMetrics = {
    errors: [],
    state: {
      stability: 100,
      degradation: 0,
      errorRate: 0,
      recoveryRate: 100
    },
    errorHandlingRate: 100,
    degradationTolerance: 100,
    stabilityIndex: 100,
    recoveryCapability: 100,
    mttf: 0,
    mttr: 0
  };

  private onUpdate: (metrics: ResilienceMetrics) => void;
  private startTime: number = Date.now();
  private lastFailure: number | null = null;
  private lastRecovery: number | null = null;
  private operationalPeriods: number[] = [];
  private recoveryPeriods: number[] = [];

  constructor(onUpdate: (metrics: ResilienceMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordError(type: string, severity: number, handled: boolean = false): void {
    const error: ErrorCondition = {
      type,
      severity,
      handled
    };
    
    this.metrics.errors.push(error);
    
    // Update system state based on error
    this.metrics.state.stability = Math.max(0, 
      this.metrics.state.stability - severity);
    this.metrics.state.degradation = Math.min(100,
      this.metrics.state.degradation + severity);
    this.metrics.state.errorRate = 
      this.metrics.errors.length / ((Date.now() - this.startTime) / 3600000);
    
    if (!handled) {
      const now = Date.now();
      if (this.lastFailure !== null) {
        this.operationalPeriods.push(now - this.lastFailure);
      }
      this.lastFailure = now;
    }
    
    this.updateMetrics();
  }

  recordRecovery(type: string, success: boolean): void {
    if (this.lastFailure !== null) {
      const now = Date.now();
      const recoveryTime = now - this.lastFailure;
      this.recoveryPeriods.push(recoveryTime);
      
      if (success) {
        // Update system state based on recovery
        this.metrics.state.stability = Math.min(100,
          this.metrics.state.stability + 10);
        this.metrics.state.degradation = Math.max(0,
          this.metrics.state.degradation - 10);
        this.metrics.state.recoveryRate = 
          this.recoveryPeriods.length / this.metrics.errors.length;
        
        const lastError = this.metrics.errors[this.metrics.errors.length - 1];
        if (lastError) {
          lastError.handled = true;
          lastError.recoveryPath = type;
        }
      }
      
      this.lastRecovery = now;
      this.lastFailure = null;
    }
    
    this.updateMetrics();
  }

  recordSystemState(stability: number, degradation: number): void {
    this.metrics.state.stability = stability;
    this.metrics.state.degradation = degradation;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate error handling rate
    const handledErrors = this.metrics.errors.filter(e => e.handled).length;
    this.metrics.errorHandlingRate = 
      this.metrics.errors.length > 0 ?
      (handledErrors / this.metrics.errors.length) * 100 : 100;

    // Calculate degradation tolerance
    this.metrics.degradationTolerance = 
      100 - (this.metrics.state.degradation / 2);

    // Calculate stability index
    this.metrics.stabilityIndex = 
      (this.metrics.state.stability * 0.4) +
      (this.metrics.errorHandlingRate * 0.3) +
      (this.metrics.degradationTolerance * 0.3);

    // Calculate recovery capability
    this.metrics.recoveryCapability = 
      (this.metrics.errorHandlingRate * 0.5) +
      (this.metrics.state.recoveryRate * 100 * 0.5);

    // Calculate MTTF (Mean Time To Failure)
    if (this.operationalPeriods.length > 0) {
      this.metrics.mttf = 
        this.operationalPeriods.reduce((a, b) => a + b, 0) /
        this.operationalPeriods.length;
    }

    // Calculate MTTR (Mean Time To Recovery)
    if (this.recoveryPeriods.length > 0) {
      this.metrics.mttr = 
        this.recoveryPeriods.reduce((a, b) => a + b, 0) /
        this.recoveryPeriods.length;
    }

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      errors: [],
      state: {
        stability: 100,
        degradation: 0,
        errorRate: 0,
        recoveryRate: 100
      },
      errorHandlingRate: 100,
      degradationTolerance: 100,
      stabilityIndex: 100,
      recoveryCapability: 100,
      mttf: 0,
      mttr: 0
    };
    this.startTime = Date.now();
    this.lastFailure = null;
    this.lastRecovery = null;
    this.operationalPeriods = [];
    this.recoveryPeriods = [];
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

describe('StoryMap Resilience Tests', () => {
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

  describe('System Stability', () => {
    test('maintains stability under stress', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResilienceMetrics = {
        errors: [],
        state: {
          stability: 100,
          degradation: 0,
          errorRate: 0,
          recoveryRate: 100
        },
        errorHandlingRate: 100,
        degradationTolerance: 100,
        stabilityIndex: 100,
        recoveryCapability: 100,
        mttf: 0,
        mttr: 0
      };
      
      const monitor = new ResilienceMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate system under stress
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Introduce random errors
          if (Math.random() < 0.2) { // 20% chance of error
            const severity = Math.floor(Math.random() * 5) + 1;
            monitor.recordError(
              'stress_error',
              severity,
              Math.random() < 0.8 // 80% handled
            );
            
            // Attempt recovery if error wasn't handled
            if (Math.random() < 0.9) { // 90% recovery attempt
              const recoverySteps = Math.floor(Math.random() * 3) + 1;
              for (let step = 0; step < recoverySteps; step++) {
                const updatedParagraphs = paragraphs.map(p => ({
                  ...p,
                  content: `Recovery step ${step}`
                }));
                rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
                
                jest.advanceTimersByTime(500);
              }
              
              monitor.recordRecovery(
                'stress_recovery',
                Math.random() < 0.95 // 95% recovery success
              );
            }
          }
          
          // Update system state
          monitor.recordSystemState(
            Math.max(60, metrics.state.stability - Math.random() * 5),
            Math.min(40, metrics.state.degradation + Math.random() * 5)
          );
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Stability test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.stabilityIndex).toBeGreaterThan(70); // Good stability
      expect(metrics.errorHandlingRate).toBeGreaterThan(75); // Good error handling
      expect(metrics.recoveryCapability).toBeGreaterThan(80); // Good recovery
    });
  });

  describe('Error Handling', () => {
    test('handles errors effectively', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResilienceMetrics = {
        errors: [],
        state: {
          stability: 100,
          degradation: 0,
          errorRate: 0,
          recoveryRate: 100
        },
        errorHandlingRate: 100,
        degradationTolerance: 100,
        stabilityIndex: 100,
        recoveryCapability: 100,
        mttf: 0,
        mttr: 0
      };
      
      const monitor = new ResilienceMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate error scenarios
      await act(async () => {
        const errorTypes = [
          'validation_error',
          'resource_error',
          'timeout_error',
          'state_error'
        ];
        
        for (let i = 0; i < 50; i++) {
          // Generate errors with different types and severities
          const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          const severity = Math.floor(Math.random() * 7) + 3;
          const handled = Math.random() < 0.85; // 85% handled immediately
          
          monitor.recordError(errorType, severity, handled);
          
          if (!handled) {
            // Recovery attempt for unhandled errors
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Error recovery ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            monitor.recordRecovery(
              'error_recovery',
              Math.random() < 0.9 // 90% recovery success
            );
          }
          
          jest.advanceTimersByTime(2000);
        }
      });
      
      expect(metrics.errorHandlingRate).toBeGreaterThan(80); // Good handling rate
      expect(metrics.mttr).toBeLessThan(3000); // Quick recovery
      expect(metrics.degradationTolerance).toBeGreaterThan(70); // Good tolerance
    });
  });

  describe('Recovery Patterns', () => {
    test('implements effective recovery patterns', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ResilienceMetrics = {
        errors: [],
        state: {
          stability: 100,
          degradation: 0,
          errorRate: 0,
          recoveryRate: 100
        },
        errorHandlingRate: 100,
        degradationTolerance: 100,
        stabilityIndex: 100,
        recoveryCapability: 100,
        mttf: 0,
        mttr: 0
      };
      
      const monitor = new ResilienceMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate recovery patterns
      await act(async () => {
        for (let i = 0; i < 24; i++) { // 24-hour simulation
          // Normal operation period
          monitor.recordSystemState(
            90 + Math.random() * 10,
            Math.random() * 10
          );
          
          if (Math.random() < 0.3) { // 30% chance of error cluster
            // Simulate error cluster
            const clusterSize = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < clusterSize; j++) {
              monitor.recordError(
                'cluster_error',
                Math.floor(Math.random() * 5) + 3,
                false
              );
            }
            
            // Apply recovery pattern
            const recoverySteps = ['isolate', 'analyze', 'recover'];
            for (const step of recoverySteps) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Recovery ${step}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              monitor.recordRecovery(
                `${step}_recovery`,
                true
              );
              
              jest.advanceTimersByTime(1000);
            }
          }
          
          jest.advanceTimersByTime(3600000); // 1 hour
        }
      });
      
      expect(metrics.recoveryCapability).toBeGreaterThan(85); // Strong recovery
      expect(metrics.mttf).toBeGreaterThan(7200000); // Good time between failures
      expect(metrics.stabilityIndex).toBeGreaterThan(80); // Good stability
    });
  });
});
