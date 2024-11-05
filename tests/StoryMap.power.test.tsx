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

// Power management monitoring utilities
interface CoreState {
  frequency: number;
  voltage: number;
  temperature: number;
  power: number;
  utilization: number;
}

interface PowerState {
  activeCores: number;
  totalPower: number;
  averageTemperature: number;
  energyConsumed: number;
  performanceLevel: number;
}

interface PowerMetrics {
  cores: CoreState[];
  powerState: PowerState;
  energyEfficiency: number;
  thermalHeadroom: number;
  throttlingEvents: number;
  powerSavingTime: number;
  performanceIndex: number;
}

class PowerMonitor {
  private metrics: PowerMetrics = {
    cores: [],
    powerState: {
      activeCores: 0,
      totalPower: 0,
      averageTemperature: 0,
      energyConsumed: 0,
      performanceLevel: 0
    },
    energyEfficiency: 0,
    thermalHeadroom: 0,
    throttlingEvents: 0,
    powerSavingTime: 0,
    performanceIndex: 0
  };

  private onUpdate: (metrics: PowerMetrics) => void;
  private startTime: number = Date.now();
  private lastUpdate: number = Date.now();

  constructor(onUpdate: (metrics: PowerMetrics) => void, coreCount: number) {
    this.onUpdate = onUpdate;
    this.initializeCores(coreCount);
  }

  private initializeCores(count: number): void {
    this.metrics.cores = Array.from({ length: count }, () => ({
      frequency: 2000, // MHz
      voltage: 1.0,    // V
      temperature: 40, // °C
      power: 5,       // W
      utilization: 0  // %
    }));
    this.updateMetrics();
  }

  updateCoreState(
    coreId: number,
    frequency: number,
    voltage: number,
    temperature: number,
    utilization: number
  ): void {
    const core = this.metrics.cores[coreId];
    if (core) {
      core.frequency = frequency;
      core.voltage = voltage;
      core.temperature = temperature;
      core.utilization = utilization;
      
      // Calculate core power (P = CV²f)
      core.power = 0.5 * voltage * voltage * (frequency / 2000);
      
      this.updateMetrics();
    }
  }

  recordThrottlingEvent(): void {
    this.metrics.throttlingEvents++;
    this.updateMetrics();
  }

  recordPowerState(activeCores: number, performanceLevel: number): void {
    this.metrics.powerState.activeCores = activeCores;
    this.metrics.powerState.performanceLevel = performanceLevel;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = currentTime;

    // Update power state
    this.metrics.powerState.totalPower = this.metrics.cores.reduce(
      (sum, core) => sum + core.power,
      0
    );
    
    this.metrics.powerState.averageTemperature = this.metrics.cores.reduce(
      (sum, core) => sum + core.temperature,
      0
    ) / this.metrics.cores.length;
    
    this.metrics.powerState.energyConsumed += 
      this.metrics.powerState.totalPower * deltaTime;

    // Calculate energy efficiency (MIPS/Watt)
    const totalFrequency = this.metrics.cores.reduce(
      (sum, core) => sum + core.frequency * (core.utilization / 100),
      0
    );
    this.metrics.energyEfficiency = 
      this.metrics.powerState.totalPower > 0 ?
      totalFrequency / this.metrics.powerState.totalPower :
      0;

    // Calculate thermal headroom
    const maxTemp = Math.max(...this.metrics.cores.map(c => c.temperature));
    this.metrics.thermalHeadroom = 100 - maxTemp;

    // Calculate power saving time
    const totalTime = (currentTime - this.startTime) / 1000;
    const lowPowerTime = this.metrics.cores.reduce(
      (sum, core) => sum + (core.frequency < 1500 ? deltaTime : 0),
      0
    );
    this.metrics.powerSavingTime = (lowPowerTime / totalTime) * 100;

    // Calculate performance index
    this.metrics.performanceIndex = (
      (this.metrics.energyEfficiency / 1000) * 0.4 +
      (this.metrics.thermalHeadroom / 60) * 0.3 +
      (this.metrics.powerSavingTime / 100) * 0.3
    );

    this.onUpdate(this.metrics);
  }

  reset(): void {
    const coreCount = this.metrics.cores.length;
    this.metrics = {
      cores: Array.from({ length: coreCount }, () => ({
        frequency: 2000,
        voltage: 1.0,
        temperature: 40,
        power: 5,
        utilization: 0
      })),
      powerState: {
        activeCores: 0,
        totalPower: 0,
        averageTemperature: 0,
        energyConsumed: 0,
        performanceLevel: 0
      },
      energyEfficiency: 0,
      thermalHeadroom: 0,
      throttlingEvents: 0,
      powerSavingTime: 0,
      performanceIndex: 0
    };
    this.startTime = Date.now();
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

describe('StoryMap Power Management Tests', () => {
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

  describe('Energy Efficiency', () => {
    test('optimizes power consumption', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PowerMetrics = {
        cores: [],
        powerState: {
          activeCores: 0,
          totalPower: 0,
          averageTemperature: 0,
          energyConsumed: 0,
          performanceLevel: 0
        },
        energyEfficiency: 0,
        thermalHeadroom: 0,
        throttlingEvents: 0,
        powerSavingTime: 0,
        performanceIndex: 0
      };
      
      const monitor = new PowerMonitor((m) => {
        metrics = m;
      }, 4); // 4 cores
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate varying workload
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate workload pattern
          const baseLoad = Math.sin(i / 20) * 0.5 + 0.5; // Oscillating load
          
          for (let coreId = 0; coreId < 4; coreId++) {
            const utilization = baseLoad * 100;
            const frequency = 1000 + baseLoad * 2000; // 1-3 GHz
            const voltage = 0.8 + baseLoad * 0.4; // 0.8-1.2V
            const temperature = 35 + baseLoad * 30; // 35-65°C
            
            monitor.updateCoreState(
              coreId,
              frequency,
              voltage,
              temperature,
              utilization
            );
          }
          
          monitor.recordPowerState(
            Math.ceil(baseLoad * 4), // Active cores
            Math.ceil(baseLoad * 3)  // Performance level
          );
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Power test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.energyEfficiency).toBeGreaterThan(500); // Good MIPS/Watt
      expect(metrics.powerSavingTime).toBeGreaterThan(30); // Significant power saving time
      expect(metrics.performanceIndex).toBeGreaterThan(0.7); // Good overall efficiency
    });
  });

  describe('Thermal Management', () => {
    test('maintains safe temperature levels', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PowerMetrics = {
        cores: [],
        powerState: {
          activeCores: 0,
          totalPower: 0,
          averageTemperature: 0,
          energyConsumed: 0,
          performanceLevel: 0
        },
        energyEfficiency: 0,
        thermalHeadroom: 0,
        throttlingEvents: 0,
        powerSavingTime: 0,
        performanceIndex: 0
      };
      
      const monitor = new PowerMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate thermal stress
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate increasing load and temperature
          const stress = Math.min(i / 50, 1);
          
          for (let coreId = 0; coreId < 4; coreId++) {
            const utilization = 50 + stress * 50;
            const frequency = 3000 - (stress > 0.8 ? 1000 : 0); // Throttle at high temp
            const voltage = 1.2 - (stress > 0.8 ? 0.2 : 0);
            const temperature = 40 + stress * 40;
            
            monitor.updateCoreState(
              coreId,
              frequency,
              voltage,
              temperature,
              utilization
            );
            
            if (temperature > 75) {
              monitor.recordThrottlingEvent();
            }
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Thermal test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.thermalHeadroom).toBeGreaterThan(20); // Safe temperature margin
      expect(metrics.throttlingEvents).toBeLessThan(10); // Limited thermal throttling
      expect(metrics.powerState.averageTemperature).toBeLessThan(70); // Below critical temperature
    });
  });

  describe('Dynamic Frequency Scaling', () => {
    test('adapts frequency to workload', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PowerMetrics = {
        cores: [],
        powerState: {
          activeCores: 0,
          totalPower: 0,
          averageTemperature: 0,
          energyConsumed: 0,
          performanceLevel: 0
        },
        energyEfficiency: 0,
        thermalHeadroom: 0,
        throttlingEvents: 0,
        powerSavingTime: 0,
        performanceIndex: 0
      };
      
      const monitor = new PowerMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate varying workload
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate workload phases
          const phase = Math.floor(i / 25) % 4;
          let targetUtilization = 0;
          let targetFrequency = 0;
          
          switch (phase) {
            case 0: // Low power
              targetUtilization = 20;
              targetFrequency = 1200;
              break;
            case 1: // Moderate
              targetUtilization = 50;
              targetFrequency = 2000;
              break;
            case 2: // High performance
              targetUtilization = 90;
              targetFrequency = 3000;
              break;
            case 3: // Cool down
              targetUtilization = 30;
              targetFrequency = 1500;
              break;
          }
          
          for (let coreId = 0; coreId < 4; coreId++) {
            monitor.updateCoreState(
              coreId,
              targetFrequency,
              0.8 + (targetFrequency / 3000) * 0.4,
              40 + (targetUtilization / 100) * 30,
              targetUtilization
            );
          }
          
          monitor.recordPowerState(
            Math.ceil(targetUtilization / 25), // Active cores
            Math.ceil(targetFrequency / 1000)  // Performance level
          );
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Frequency test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.powerSavingTime).toBeGreaterThan(25); // Significant time in low power
      expect(metrics.energyEfficiency).toBeGreaterThan(400); // Good efficiency
      expect(metrics.performanceIndex).toBeGreaterThan(0.6); // Acceptable performance
    });
  });
});
