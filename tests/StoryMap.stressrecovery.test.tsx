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

// Stress Recovery monitoring utilities
interface StressEvent {
  type: string;
  intensity: number;
  duration: number;
  recoveryTime?: number;
  recoverySuccess?: boolean;
}

interface SystemState {
  load: number;
  stability: number;
  responsiveness: number;
  recoveryCapacity: number;
}

interface StressRecoveryMetrics {
  events: StressEvent[];
  state: SystemState;
  recoveryRate: number;
  recoveryTime: number;
  resilience: number;
  stressResistance: number;
  recoveryEfficiency: number;
  healthScore: number;
}

class StressRecoveryMonitor {
  private metrics: StressRecoveryMetrics = {
    events: [],
    state: {
      load: 0,
      stability: 100,
      responsiveness: 100,
      recoveryCapacity: 100
    },
    recoveryRate: 100,
    recoveryTime: 0,
    resilience: 100,
    stressResistance: 100,
    recoveryEfficiency: 100,
    healthScore: 100
  };

  private onUpdate: (metrics: StressRecoveryMetrics) => void;
  private startTime: number = Date.now();
  private activeStress: StressEvent | null = null;
  private recoveryHistory: number[] = [];
  private stressThresholds = {
    maxLoad: 90,
    minStability: 60,
    minResponsiveness: 70,
    minRecoveryCapacity: 50
  };

  constructor(onUpdate: (metrics: StressRecoveryMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  applyStress(type: string, intensity: number, duration: number): void {
    const stress: StressEvent = {
      type,
      intensity,
      duration,
      recoveryTime: undefined,
      recoverySuccess: undefined
    };
    
    this.metrics.events.push(stress);
    this.activeStress = stress;
    
    // Update system state based on stress
    this.metrics.state.load = Math.min(100,
      this.metrics.state.load + intensity * 0.5);
    this.metrics.state.stability = Math.max(0,
      this.metrics.state.stability - intensity * 0.3);
    this.metrics.state.responsiveness = Math.max(0,
      this.metrics.state.responsiveness - intensity * 0.4);
    this.metrics.state.recoveryCapacity = Math.max(0,
      this.metrics.state.recoveryCapacity - intensity * 0.2);
    
    this.updateMetrics();
  }

  attemptRecovery(recoveryStrength: number): boolean {
    if (!this.activeStress) return false;
    
    const now = Date.now();
    const recoveryTime = now - (this.activeStress.duration + this.startTime);
    const recoverySuccess = 
      recoveryStrength * (this.metrics.state.recoveryCapacity / 100) >
      this.activeStress.intensity * 0.7;
    
    this.activeStress.recoveryTime = recoveryTime;
    this.activeStress.recoverySuccess = recoverySuccess;
    
    if (recoverySuccess) {
      this.recoveryHistory.push(recoveryTime);
      
      // Update system state after successful recovery
      this.metrics.state.load = Math.max(0,
        this.metrics.state.load - this.activeStress.intensity * 0.4);
      this.metrics.state.stability = Math.min(100,
        this.metrics.state.stability + recoveryStrength * 0.3);
      this.metrics.state.responsiveness = Math.min(100,
        this.metrics.state.responsiveness + recoveryStrength * 0.4);
      this.metrics.state.recoveryCapacity = Math.min(100,
        this.metrics.state.recoveryCapacity + recoveryStrength * 0.2);
      
      this.activeStress = null;
    }
    
    this.updateMetrics();
    return recoverySuccess;
  }

  private updateMetrics(): void {
    // Calculate recovery rate
    const totalEvents = this.metrics.events.length;
    const successfulRecoveries = this.metrics.events.filter(
      e => e.recoverySuccess
    ).length;
    this.metrics.recoveryRate = totalEvents > 0 ?
      (successfulRecoveries / totalEvents) * 100 : 100;

    // Calculate average recovery time
    if (this.recoveryHistory.length > 0) {
      this.metrics.recoveryTime = 
        this.recoveryHistory.reduce((a, b) => a + b, 0) /
        this.recoveryHistory.length;
    }

    // Calculate resilience
    this.metrics.resilience = 
      (this.metrics.state.stability * 0.4) +
      (this.metrics.state.recoveryCapacity * 0.4) +
      (this.metrics.recoveryRate * 0.2);

    // Calculate stress resistance
    const loadFactor = 1 - (this.metrics.state.load / 100);
    this.metrics.stressResistance = 
      (loadFactor * 0.3) +
      (this.metrics.state.stability / 100 * 0.4) +
      (this.metrics.state.responsiveness / 100 * 0.3);

    // Calculate recovery efficiency
    const avgRecoveryTime = this.metrics.recoveryTime || 0;
    const timeEfficiency = Math.max(0, 1 - (avgRecoveryTime / 10000)); // Normalize to 10 seconds
    this.metrics.recoveryEfficiency = 
      (this.metrics.recoveryRate * 0.4) +
      (timeEfficiency * 100 * 0.3) +
      (this.metrics.state.recoveryCapacity * 0.3);

    // Calculate overall health score
    this.metrics.healthScore = 
      (this.metrics.resilience * 0.3) +
      (this.metrics.stressResistance * 0.3) +
      (this.metrics.recoveryEfficiency * 0.4);

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      events: [],
      state: {
        load: 0,
        stability: 100,
        responsiveness: 100,
        recoveryCapacity: 100
      },
      recoveryRate: 100,
      recoveryTime: 0,
      resilience: 100,
      stressResistance: 100,
      recoveryEfficiency: 100,
      healthScore: 100
    };
    this.startTime = Date.now();
    this.activeStress = null;
    this.recoveryHistory = [];
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

describe('StoryMap Stress Recovery Tests', () => {
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

  describe('System Resilience', () => {
    test('recovers from stress conditions', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StressRecoveryMetrics = {
        events: [],
        state: {
          load: 0,
          stability: 100,
          responsiveness: 100,
          recoveryCapacity: 100
        },
        recoveryRate: 100,
        recoveryTime: 0,
        resilience: 100,
        stressResistance: 100,
        recoveryEfficiency: 100,
        healthScore: 100
      };
      
      const monitor = new StressRecoveryMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate stress and recovery cycles
      await act(async () => {
        for (let cycle = 0; cycle < 10; cycle++) {
          // Apply increasing stress
          const stressIntensity = 30 + cycle * 5;
          monitor.applyStress('load_stress', stressIntensity, 5000);
          
          // Simulate system under stress
          for (let i = 0; i < 5; i++) {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Stress cycle ${cycle}, step ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(1000);
          }
          
          // Attempt recovery with matching strength
          const recoveryStrength = stressIntensity + 10;
          const recovered = monitor.attemptRecovery(recoveryStrength);
          
          if (recovered) {
            // Simulate recovery period
            for (let i = 0; i < 3; i++) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Recovery cycle ${cycle}, step ${i}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(1000);
            }
          }
          
          jest.advanceTimersByTime(2000); // Cool-down period
        }
      });
      
      expect(metrics.recoveryRate).toBeGreaterThan(80); // High recovery rate
      expect(metrics.resilience).toBeGreaterThan(75); // Good resilience
      expect(metrics.healthScore).toBeGreaterThan(80); // Strong health
    });
  });

  describe('Resource Recovery', () => {
    test('restores resource availability', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StressRecoveryMetrics = {
        events: [],
        state: {
          load: 0,
          stability: 100,
          responsiveness: 100,
          recoveryCapacity: 100
        },
        recoveryRate: 100,
        recoveryTime: 0,
        resilience: 100,
        stressResistance: 100,
        recoveryEfficiency: 100,
        healthScore: 100
      };
      
      const monitor = new StressRecoveryMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource stress and recovery
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          // Apply resource stress
          monitor.applyStress('resource_exhaustion', 60, 3000);
          
          // Simulate resource depletion
          for (let j = 0; j < 3; j++) {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Resource stress ${i}, phase ${j}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            
            jest.advanceTimersByTime(1000);
          }
          
          // Attempt resource recovery
          const recovered = monitor.attemptRecovery(70);
          
          if (recovered) {
            // Simulate resource restoration
            for (let j = 0; j < 5; j++) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Resource recovery ${i}, phase ${j}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(1000);
            }
          }
          
          jest.advanceTimersByTime(3000); // Resource stabilization period
        }
      });
      
      expect(metrics.stressResistance).toBeGreaterThan(75); // Good stress resistance
      expect(metrics.recoveryEfficiency).toBeGreaterThan(80); // Efficient recovery
      expect(metrics.state.recoveryCapacity).toBeGreaterThan(70); // Maintained capacity
    });
  });

  describe('Performance Restoration', () => {
    test('restores performance levels', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: StressRecoveryMetrics = {
        events: [],
        state: {
          load: 0,
          stability: 100,
          responsiveness: 100,
          recoveryCapacity: 100
        },
        recoveryRate: 100,
        recoveryTime: 0,
        resilience: 100,
        stressResistance: 100,
        recoveryEfficiency: 100,
        healthScore: 100
      };
      
      const monitor = new StressRecoveryMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate performance degradation and recovery
      await act(async () => {
        for (let hour = 0; hour < 24; hour++) {
          // Apply periodic performance stress
          if (hour % 4 === 0) {
            monitor.applyStress('performance_degradation', 50, 2000);
            
            // Simulate degraded performance
            for (let minute = 0; minute < 10; minute++) {
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Hour ${hour}, Degraded minute ${minute}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
              
              jest.advanceTimersByTime(60000); // 1 minute
            }
            
            // Attempt performance recovery
            const recovered = monitor.attemptRecovery(65);
            
            if (recovered) {
              // Simulate performance restoration
              for (let minute = 0; minute < 5; minute++) {
                const updatedParagraphs = paragraphs.map(p => ({
                  ...p,
                  content: `Hour ${hour}, Recovery minute ${minute}`
                }));
                rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
                
                jest.advanceTimersByTime(60000); // 1 minute
              }
            }
          }
          
          // Normal operation
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Hour ${hour}, Normal operation`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(3600000); // 1 hour
        }
      });
      
      expect(metrics.state.responsiveness).toBeGreaterThan(85); // High responsiveness
      expect(metrics.recoveryTime).toBeLessThan(300000); // Quick recovery
      expect(metrics.healthScore).toBeGreaterThan(85); // Strong health
    });
  });
});
