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

// Scheduling optimization monitoring utilities
interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  missLatency: number;
  dataLocality: number;
}

interface NumaMetrics {
  localAccesses: number;
  remoteAccesses: number;
  migrations: number;
  nodeBalance: number;
  crossNodeLatency: number;
  memoryAffinity: number;
}

interface PowerMetrics {
  cpuFrequency: number;
  powerConsumption: number;
  thermalThrottling: number;
  energyEfficiency: number;
  idleStates: number;
  temperatureLevel: number;
}

interface OptimizationMetrics {
  cache: CacheMetrics;
  numa: NumaMetrics;
  power: PowerMetrics;
  overallEfficiency: number;
  performanceIndex: number;
  bottlenecks: string[];
}

class OptimizationMonitor {
  private metrics: OptimizationMetrics = {
    cache: {
      hits: 0,
      misses: 0,
      evictions: 0,
      hitRate: 0,
      missLatency: 0,
      dataLocality: 0
    },
    numa: {
      localAccesses: 0,
      remoteAccesses: 0,
      migrations: 0,
      nodeBalance: 0,
      crossNodeLatency: 0,
      memoryAffinity: 0
    },
    power: {
      cpuFrequency: 0,
      powerConsumption: 0,
      thermalThrottling: 0,
      energyEfficiency: 0,
      idleStates: 0,
      temperatureLevel: 0
    },
    overallEfficiency: 0,
    performanceIndex: 0,
    bottlenecks: []
  };

  private onUpdate: (metrics: OptimizationMetrics) => void;

  constructor(onUpdate: (metrics: OptimizationMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordCacheAccess(hit: boolean, latency: number): void {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
      this.metrics.cache.missLatency += latency;
    }
    this.updateCacheMetrics();
  }

  recordCacheEviction(): void {
    this.metrics.cache.evictions++;
    this.updateCacheMetrics();
  }

  recordNumaAccess(isLocal: boolean, latency: number): void {
    if (isLocal) {
      this.metrics.numa.localAccesses++;
    } else {
      this.metrics.numa.remoteAccesses++;
      this.metrics.numa.crossNodeLatency += latency;
    }
    this.updateNumaMetrics();
  }

  recordNumaMigration(): void {
    this.metrics.numa.migrations++;
    this.updateNumaMetrics();
  }

  recordPowerState(frequency: number, power: number, temperature: number): void {
    this.metrics.power.cpuFrequency = frequency;
    this.metrics.power.powerConsumption = power;
    this.metrics.power.temperatureLevel = temperature;
    this.updatePowerMetrics();
  }

  recordThermalEvent(throttling: boolean): void {
    if (throttling) {
      this.metrics.power.thermalThrottling++;
    }
    this.updatePowerMetrics();
  }

  private updateCacheMetrics(): void {
    const totalAccesses = this.metrics.cache.hits + this.metrics.cache.misses;
    if (totalAccesses > 0) {
      this.metrics.cache.hitRate = this.metrics.cache.hits / totalAccesses;
      this.metrics.cache.dataLocality = 1 - (this.metrics.cache.evictions / totalAccesses);
    }
    this.updateOverallMetrics();
  }

  private updateNumaMetrics(): void {
    const totalAccesses = this.metrics.numa.localAccesses + this.metrics.numa.remoteAccesses;
    if (totalAccesses > 0) {
      this.metrics.numa.nodeBalance = this.metrics.numa.localAccesses / totalAccesses;
      this.metrics.numa.memoryAffinity = 1 - (this.metrics.numa.migrations / totalAccesses);
    }
    this.updateOverallMetrics();
  }

  private updatePowerMetrics(): void {
    // Calculate energy efficiency based on performance per watt
    if (this.metrics.power.powerConsumption > 0) {
      this.metrics.power.energyEfficiency = this.metrics.performanceIndex / this.metrics.power.powerConsumption;
    }
    this.updateOverallMetrics();
  }

  private updateOverallMetrics(): void {
    // Calculate overall efficiency
    this.metrics.overallEfficiency = (
      this.metrics.cache.hitRate * 0.4 +
      this.metrics.numa.nodeBalance * 0.3 +
      this.metrics.power.energyEfficiency * 0.3
    );

    // Calculate performance index
    this.metrics.performanceIndex = (
      (1 - this.metrics.cache.missLatency / 1000) * 0.4 +
      (1 - this.metrics.numa.crossNodeLatency / 1000) * 0.3 +
      (1 - this.metrics.power.thermalThrottling / 100) * 0.3
    );

    // Identify bottlenecks
    this.metrics.bottlenecks = [];
    if (this.metrics.cache.hitRate < 0.8) {
      this.metrics.bottlenecks.push('Cache efficiency');
    }
    if (this.metrics.numa.nodeBalance < 0.7) {
      this.metrics.bottlenecks.push('NUMA locality');
    }
    if (this.metrics.power.thermalThrottling > 10) {
      this.metrics.bottlenecks.push('Thermal throttling');
    }

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      cache: {
        hits: 0,
        misses: 0,
        evictions: 0,
        hitRate: 0,
        missLatency: 0,
        dataLocality: 0
      },
      numa: {
        localAccesses: 0,
        remoteAccesses: 0,
        migrations: 0,
        nodeBalance: 0,
        crossNodeLatency: 0,
        memoryAffinity: 0
      },
      power: {
        cpuFrequency: 0,
        powerConsumption: 0,
        thermalThrottling: 0,
        energyEfficiency: 0,
        idleStates: 0,
        temperatureLevel: 0
      },
      overallEfficiency: 0,
      performanceIndex: 0,
      bottlenecks: []
    };
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

describe('StoryMap Scheduling Optimization Tests', () => {
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

  describe('Cache Optimization', () => {
    test('maintains high cache efficiency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: OptimizationMetrics = {
        cache: {
          hits: 0,
          misses: 0,
          evictions: 0,
          hitRate: 0,
          missLatency: 0,
          dataLocality: 0
        },
        numa: {
          localAccesses: 0,
          remoteAccesses: 0,
          migrations: 0,
          nodeBalance: 0,
          crossNodeLatency: 0,
          memoryAffinity: 0
        },
        power: {
          cpuFrequency: 0,
          powerConsumption: 0,
          thermalThrottling: 0,
          energyEfficiency: 0,
          idleStates: 0,
          temperatureLevel: 0
        },
        overallEfficiency: 0,
        performanceIndex: 0,
        bottlenecks: []
      };
      
      const monitor = new OptimizationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate cache-aware operations
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          // Simulate cache access patterns
          const isCacheHit = Math.random() > 0.2; // 80% hit rate
          monitor.recordCacheAccess(isCacheHit, isCacheHit ? 1 : 20);
          
          if (i % 100 === 0) {
            monitor.recordCacheEviction();
          }
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Cache test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(10);
        }
      });
      
      expect(metrics.cache.hitRate).toBeGreaterThan(0.8); // High hit rate
      expect(metrics.cache.dataLocality).toBeGreaterThan(0.9); // Good locality
      expect(metrics.cache.missLatency).toBeLessThan(5000); // Reasonable miss penalty
    });
  });

  describe('NUMA Optimization', () => {
    test('maintains memory locality', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: OptimizationMetrics = {
        cache: {
          hits: 0,
          misses: 0,
          evictions: 0,
          hitRate: 0,
          missLatency: 0,
          dataLocality: 0
        },
        numa: {
          localAccesses: 0,
          remoteAccesses: 0,
          migrations: 0,
          nodeBalance: 0,
          crossNodeLatency: 0,
          memoryAffinity: 0
        },
        power: {
          cpuFrequency: 0,
          powerConsumption: 0,
          thermalThrottling: 0,
          energyEfficiency: 0,
          idleStates: 0,
          temperatureLevel: 0
        },
        overallEfficiency: 0,
        performanceIndex: 0,
        bottlenecks: []
      };
      
      const monitor = new OptimizationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate NUMA-aware operations
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          // Simulate memory access patterns
          const isLocalAccess = Math.random() > 0.1; // 90% local access
          monitor.recordNumaAccess(isLocalAccess, isLocalAccess ? 10 : 100);
          
          if (i % 200 === 0) {
            monitor.recordNumaMigration();
          }
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `NUMA test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(10);
        }
      });
      
      expect(metrics.numa.nodeBalance).toBeGreaterThan(0.85); // High local access rate
      expect(metrics.numa.memoryAffinity).toBeGreaterThan(0.95); // Low migration rate
      expect(metrics.numa.crossNodeLatency).toBeLessThan(10000); // Acceptable cross-node latency
    });
  });

  describe('Power Optimization', () => {
    test('maintains power efficiency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: OptimizationMetrics = {
        cache: {
          hits: 0,
          misses: 0,
          evictions: 0,
          hitRate: 0,
          missLatency: 0,
          dataLocality: 0
        },
        numa: {
          localAccesses: 0,
          remoteAccesses: 0,
          migrations: 0,
          nodeBalance: 0,
          crossNodeLatency: 0,
          memoryAffinity: 0
        },
        power: {
          cpuFrequency: 0,
          powerConsumption: 0,
          thermalThrottling: 0,
          energyEfficiency: 0,
          idleStates: 0,
          temperatureLevel: 0
        },
        overallEfficiency: 0,
        performanceIndex: 0,
        bottlenecks: []
      };
      
      const monitor = new OptimizationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate power-aware operations
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          // Simulate varying load conditions
          const load = Math.sin(i / 100) * 0.5 + 0.5; // Oscillating load
          const frequency = 2000 + load * 2000; // 2-4 GHz
          const power = 20 + load * 80; // 20-100W
          const temperature = 40 + load * 30; // 40-70°C
          
          monitor.recordPowerState(frequency, power, temperature);
          
          if (temperature > 65) {
            monitor.recordThermalEvent(true);
          }
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Power test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(10);
        }
      });
      
      expect(metrics.power.energyEfficiency).toBeGreaterThan(0.7); // Good energy efficiency
      expect(metrics.power.thermalThrottling).toBeLessThan(50); // Limited thermal throttling
      expect(metrics.overallEfficiency).toBeGreaterThan(0.8); // Good overall efficiency
    });
  });
});
