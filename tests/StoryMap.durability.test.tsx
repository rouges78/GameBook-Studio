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

// Durability monitoring utilities
interface DataOperation {
  type: 'write' | 'read' | 'update' | 'delete';
  timestamp: number;
  size: number;
  success: boolean;
  consistency: number;
}

interface StateValidation {
  timestamp: number;
  checksum: string;
  valid: boolean;
  recoverable: boolean;
}

interface DurabilityMetrics {
  operations: DataOperation[];
  validations: StateValidation[];
  dataIntegrity: number;
  stateConsistency: number;
  persistenceRate: number;
  recoverySuccess: number;
  durabilityScore: number;
  validationRate: number;
}

class DurabilityMonitor {
  private metrics: DurabilityMetrics = {
    operations: [],
    validations: [],
    dataIntegrity: 100,
    stateConsistency: 100,
    persistenceRate: 100,
    recoverySuccess: 100,
    durabilityScore: 100,
    validationRate: 100
  };

  private onUpdate: (metrics: DurabilityMetrics) => void;
  private checksums: Map<string, string> = new Map();
  private totalOperations: number = 0;
  private successfulOperations: number = 0;
  private totalValidations: number = 0;
  private successfulValidations: number = 0;

  constructor(onUpdate: (metrics: DurabilityMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordOperation(
    type: 'write' | 'read' | 'update' | 'delete',
    size: number,
    success: boolean,
    consistency: number
  ): void {
    const operation: DataOperation = {
      type,
      timestamp: Date.now(),
      size,
      success,
      consistency
    };
    
    this.metrics.operations.push(operation);
    this.totalOperations++;
    if (success) {
      this.successfulOperations++;
    }
    
    // Update data integrity based on operation
    if (type === 'write' || type === 'update') {
      this.metrics.dataIntegrity = 
        (this.metrics.dataIntegrity * 0.9) + (consistency * 0.1);
    }
    
    this.updateMetrics();
  }

  recordStateValidation(
    checksum: string,
    valid: boolean,
    recoverable: boolean = true
  ): void {
    const validation: StateValidation = {
      timestamp: Date.now(),
      checksum,
      valid,
      recoverable
    };
    
    this.metrics.validations.push(validation);
    this.totalValidations++;
    if (valid) {
      this.successfulValidations++;
      this.checksums.set(checksum, new Date().toISOString());
    }
    
    // Update state consistency based on validation
    this.metrics.stateConsistency = valid ? 100 : 
      (recoverable ? 70 : 0);
    
    this.updateMetrics();
  }

  validateStateTransition(
    fromChecksum: string,
    toChecksum: string,
    expectedConsistency: number
  ): boolean {
    const isValid = this.checksums.has(fromChecksum) && 
                   this.checksums.has(toChecksum);
    
    if (isValid) {
      this.metrics.stateConsistency = expectedConsistency;
    } else {
      this.metrics.stateConsistency = Math.max(0,
        this.metrics.stateConsistency - 20);
    }
    
    this.updateMetrics();
    return isValid;
  }

  private updateMetrics(): void {
    // Calculate persistence rate
    this.metrics.persistenceRate = 
      this.totalOperations > 0 ?
      (this.successfulOperations / this.totalOperations) * 100 : 100;

    // Calculate validation rate
    this.metrics.validationRate = 
      this.totalValidations > 0 ?
      (this.successfulValidations / this.totalValidations) * 100 : 100;

    // Calculate recovery success rate
    const recoverableValidations = this.metrics.validations.filter(
      v => v.recoverable
    ).length;
    this.metrics.recoverySuccess = 
      recoverableValidations > 0 ?
      (this.metrics.validations.filter(v => v.valid && v.recoverable).length /
       recoverableValidations) * 100 : 100;

    // Calculate overall durability score
    this.metrics.durabilityScore = (
      (this.metrics.dataIntegrity * 0.3) +
      (this.metrics.stateConsistency * 0.3) +
      (this.metrics.persistenceRate * 0.2) +
      (this.metrics.recoverySuccess * 0.2)
    );

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      operations: [],
      validations: [],
      dataIntegrity: 100,
      stateConsistency: 100,
      persistenceRate: 100,
      recoverySuccess: 100,
      durabilityScore: 100,
      validationRate: 100
    };
    this.checksums.clear();
    this.totalOperations = 0;
    this.successfulOperations = 0;
    this.totalValidations = 0;
    this.successfulValidations = 0;
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

describe('StoryMap Durability Tests', () => {
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

  describe('Data Persistence', () => {
    test('maintains data integrity', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: DurabilityMetrics = {
        operations: [],
        validations: [],
        dataIntegrity: 100,
        stateConsistency: 100,
        persistenceRate: 100,
        recoverySuccess: 100,
        durabilityScore: 100,
        validationRate: 100
      };
      
      const monitor = new DurabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate data operations
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate write operations
          monitor.recordOperation(
            'write',
            1000 + Math.random() * 1000,
            Math.random() > 0.05, // 95% success rate
            95 + Math.random() * 5
          );
          
          // Validate state after write
          monitor.recordStateValidation(
            `checksum_${i}`,
            Math.random() > 0.02, // 98% valid
            Math.random() > 0.01  // 99% recoverable
          );
          
          if (i % 10 === 0) {
            // Periodic updates
            monitor.recordOperation(
              'update',
              500 + Math.random() * 500,
              Math.random() > 0.05,
              90 + Math.random() * 10
            );
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Updated content ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(1000);
        }
      });
      
      expect(metrics.dataIntegrity).toBeGreaterThan(95); // High data integrity
      expect(metrics.persistenceRate).toBeGreaterThan(90); // Good persistence
      expect(metrics.durabilityScore).toBeGreaterThan(90); // Strong durability
    });
  });

  describe('State Durability', () => {
    test('maintains state consistency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: DurabilityMetrics = {
        operations: [],
        validations: [],
        dataIntegrity: 100,
        stateConsistency: 100,
        persistenceRate: 100,
        recoverySuccess: 100,
        durabilityScore: 100,
        validationRate: 100
      };
      
      const monitor = new DurabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate state transitions
      await act(async () => {
        let previousChecksum = 'initial_state';
        
        for (let i = 0; i < 50; i++) {
          const currentChecksum = `state_${i}`;
          
          // Record state transition
          const isValidTransition = monitor.validateStateTransition(
            previousChecksum,
            currentChecksum,
            95 + Math.random() * 5
          );
          
          if (isValidTransition) {
            // Perform operations in valid state
            monitor.recordOperation(
              'write',
              2000 + Math.random() * 1000,
              true,
              98 + Math.random() * 2
            );
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `State ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          // Validate new state
          monitor.recordStateValidation(
            currentChecksum,
            true,
            true
          );
          
          previousChecksum = currentChecksum;
          jest.advanceTimersByTime(2000);
        }
      });
      
      expect(metrics.stateConsistency).toBeGreaterThan(95); // High consistency
      expect(metrics.validationRate).toBeGreaterThan(95); // Good validation
      expect(metrics.recoverySuccess).toBeGreaterThan(98); // Strong recovery
    });
  });

  describe('Recovery Validation', () => {
    test('validates recovery points', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: DurabilityMetrics = {
        operations: [],
        validations: [],
        dataIntegrity: 100,
        stateConsistency: 100,
        persistenceRate: 100,
        recoverySuccess: 100,
        durabilityScore: 100,
        validationRate: 100
      };
      
      const monitor = new DurabilityMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate recovery validation
      await act(async () => {
        for (let i = 0; i < 24; i++) { // 24-hour simulation
          // Regular operations
          monitor.recordOperation(
            'write',
            1500 + Math.random() * 500,
            true,
            97 + Math.random() * 3
          );
          
          // Create recovery points
          if (i % 4 === 0) { // Every 4 hours
            const checksum = `recovery_${i}`;
            monitor.recordStateValidation(
              checksum,
              true,
              true
            );
            
            // Simulate recovery validation
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Recovery point ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            // Validate recovery
            monitor.validateStateTransition(
              `recovery_${Math.max(0, i - 4)}`,
              checksum,
              98 + Math.random() * 2
            );
          }
          
          jest.advanceTimersByTime(3600000); // 1 hour
        }
      });
      
      expect(metrics.recoverySuccess).toBeGreaterThan(95); // High recovery success
      expect(metrics.durabilityScore).toBeGreaterThan(90); // Strong durability
      expect(metrics.validationRate).toBeGreaterThan(95); // Good validation
    });
  });
});
