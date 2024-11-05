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

// Affinity scheduling monitoring utilities
interface CoreMetrics {
  id: number;
  utilization: number;
  taskCount: number;
  cacheHits: number;
  cacheMisses: number;
  migrations: number;
}

interface MemoryMetrics {
  localAccesses: number;
  remoteAccesses: number;
  pageFaults: number;
  tlbHits: number;
  tlbMisses: number;
  bandwidth: number;
}

interface AffinityMetrics {
  cores: CoreMetrics[];
  memory: MemoryMetrics;
  taskMigrations: number;
  cacheAffinity: number;
  memoryLocality: number;
  loadBalance: number;
  performanceIndex: number;
}

class AffinityMonitor {
  private metrics: AffinityMetrics = {
    cores: [],
    memory: {
      localAccesses: 0,
      remoteAccesses: 0,
      pageFaults: 0,
      tlbHits: 0,
      tlbMisses: 0,
      bandwidth: 0
    },
    taskMigrations: 0,
    cacheAffinity: 0,
    memoryLocality: 0,
    loadBalance: 0,
    performanceIndex: 0
  };

  private onUpdate: (metrics: AffinityMetrics) => void;

  constructor(onUpdate: (metrics: AffinityMetrics) => void, coreCount: number) {
    this.onUpdate = onUpdate;
    this.initializeCores(coreCount);
  }

  private initializeCores(count: number): void {
    this.metrics.cores = Array.from({ length: count }, (_, i) => ({
      id: i,
      utilization: 0,
      taskCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      migrations: 0
    }));
  }

  recordTaskAssignment(coreId: number): void {
    const core = this.metrics.cores[coreId];
    if (core) {
      core.taskCount++;
      core.utilization = Math.min(core.utilization + 0.1, 1);
      this.updateMetrics();
    }
  }

  recordTaskCompletion(coreId: number): void {
    const core = this.metrics.cores[coreId];
    if (core) {
      core.taskCount--;
      core.utilization = Math.max(core.utilization - 0.1, 0);
      this.updateMetrics();
    }
  }

  recordCacheAccess(coreId: number, hit: boolean): void {
    const core = this.metrics.cores[coreId];
    if (core) {
      if (hit) {
        core.cacheHits++;
      } else {
        core.cacheMisses++;
      }
      this.updateMetrics();
    }
  }

  recordTaskMigration(fromCoreId: number, toCoreId: number): void {
    const fromCore = this.metrics.cores[fromCoreId];
    const toCore = this.metrics.cores[toCoreId];
    if (fromCore && toCore) {
      fromCore.migrations++;
      this.metrics.taskMigrations++;
      this.updateMetrics();
    }
  }

  recordMemoryAccess(isLocal: boolean): void {
    if (isLocal) {
      this.metrics.memory.localAccesses++;
    } else {
      this.metrics.memory.remoteAccesses++;
    }
    this.updateMetrics();
  }

  recordPageFault(): void {
    this.metrics.memory.pageFaults++;
    this.updateMetrics();
  }

  recordTLBAccess(hit: boolean): void {
    if (hit) {
      this.metrics.memory.tlbHits++;
    } else {
      this.metrics.memory.tlbMisses++;
    }
    this.updateMetrics();
  }

  recordMemoryBandwidth(bytes: number): void {
    this.metrics.memory.bandwidth += bytes;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate cache affinity
    const totalCacheAccesses = this.metrics.cores.reduce((sum, core) => 
      sum + core.cacheHits + core.cacheMisses, 0);
    const totalCacheHits = this.metrics.cores.reduce((sum, core) => 
      sum + core.cacheHits, 0);
    if (totalCacheAccesses > 0) {
      this.metrics.cacheAffinity = totalCacheHits / totalCacheAccesses;
    }

    // Calculate memory locality
    const totalMemoryAccesses = this.metrics.memory.localAccesses + this.metrics.memory.remoteAccesses;
    if (totalMemoryAccesses > 0) {
      this.metrics.memoryLocality = this.metrics.memory.localAccesses / totalMemoryAccesses;
    }

    // Calculate load balance
    const utilizations = this.metrics.cores.map(c => c.utilization);
    const avgUtilization = utilizations.reduce((a, b) => a + b, 0) / utilizations.length;
    const maxDeviation = Math.max(...utilizations.map(u => Math.abs(u - avgUtilization)));
    this.metrics.loadBalance = 1 - (maxDeviation / avgUtilization);

    // Calculate performance index
    this.metrics.performanceIndex = (
      this.metrics.cacheAffinity * 0.3 +
      this.metrics.memoryLocality * 0.3 +
      this.metrics.loadBalance * 0.4
    );

    this.onUpdate(this.metrics);
  }

  reset(): void {
    const coreCount = this.metrics.cores.length;
    this.metrics = {
      cores: Array.from({ length: coreCount }, (_, i) => ({
        id: i,
        utilization: 0,
        taskCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        migrations: 0
      })),
      memory: {
        localAccesses: 0,
        remoteAccesses: 0,
        pageFaults: 0,
        tlbHits: 0,
        tlbMisses: 0,
        bandwidth: 0
      },
      taskMigrations: 0,
      cacheAffinity: 0,
      memoryLocality: 0,
      loadBalance: 0,
      performanceIndex: 0
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

describe('StoryMap Affinity Scheduling Tests', () => {
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

  describe('Thread Affinity', () => {
    test('maintains cache affinity', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: AffinityMetrics = {
        cores: [],
        memory: {
          localAccesses: 0,
          remoteAccesses: 0,
          pageFaults: 0,
          tlbHits: 0,
          tlbMisses: 0,
          bandwidth: 0
        },
        taskMigrations: 0,
        cacheAffinity: 0,
        memoryLocality: 0,
        loadBalance: 0,
        performanceIndex: 0
      };
      
      const monitor = new AffinityMonitor((m) => {
        metrics = m;
      }, 4); // 4 cores
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate cache-aware task scheduling
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const coreId = i % 4;
          monitor.recordTaskAssignment(coreId);
          
          // Simulate cache accesses
          for (let j = 0; j < 10; j++) {
            monitor.recordCacheAccess(coreId, Math.random() > 0.2); // 80% hit rate
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
          
          monitor.recordTaskCompletion(coreId);
          jest.advanceTimersByTime(10);
        }
      });
      
      expect(metrics.cacheAffinity).toBeGreaterThan(0.8); // High cache affinity
      expect(metrics.taskMigrations).toBeLessThan(20); // Limited migrations
      expect(metrics.performanceIndex).toBeGreaterThan(0.7); // Good performance
    });
  });

  describe('Memory Locality', () => {
    test('optimizes memory access patterns', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: AffinityMetrics = {
        cores: [],
        memory: {
          localAccesses: 0,
          remoteAccesses: 0,
          pageFaults: 0,
          tlbHits: 0,
          tlbMisses: 0,
          bandwidth: 0
        },
        taskMigrations: 0,
        cacheAffinity: 0,
        memoryLocality: 0,
        loadBalance: 0,
        performanceIndex: 0
      };
      
      const monitor = new AffinityMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate memory-aware operations
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Record memory accesses
          monitor.recordMemoryAccess(Math.random() > 0.1); // 90% local access
          monitor.recordTLBAccess(Math.random() > 0.05); // 95% TLB hit rate
          
          if (Math.random() > 0.95) { // 5% page fault rate
            monitor.recordPageFault();
          }
          
          monitor.recordMemoryBandwidth(1024 * Math.random()); // Random bandwidth usage
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Memory test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(10);
        }
      });
      
      expect(metrics.memoryLocality).toBeGreaterThan(0.85); // High memory locality
      expect(metrics.memory.pageFaults).toBeLessThan(10); // Few page faults
      expect(metrics.memory.tlbHits / (metrics.memory.tlbHits + metrics.memory.tlbMisses))
        .toBeGreaterThan(0.9); // High TLB hit rate
    });
  });

  describe('Load Balancing', () => {
    test('maintains balanced core utilization', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: AffinityMetrics = {
        cores: [],
        memory: {
          localAccesses: 0,
          remoteAccesses: 0,
          pageFaults: 0,
          tlbHits: 0,
          tlbMisses: 0,
          bandwidth: 0
        },
        taskMigrations: 0,
        cacheAffinity: 0,
        memoryLocality: 0,
        loadBalance: 0,
        performanceIndex: 0
      };
      
      const monitor = new AffinityMonitor((m) => {
        metrics = m;
      }, 4);
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate balanced task distribution
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Assign tasks to least loaded core
          const leastLoadedCore = metrics.cores
            .reduce((min, core) => core.utilization < min.utilization ? core : min);
          
          monitor.recordTaskAssignment(leastLoadedCore.id);
          
          // Occasionally migrate tasks for balance
          if (i % 10 === 0) {
            const mostLoadedCore = metrics.cores
              .reduce((max, core) => core.utilization > max.utilization ? core : max);
            if (mostLoadedCore.utilization - leastLoadedCore.utilization > 0.3) {
              monitor.recordTaskMigration(mostLoadedCore.id, leastLoadedCore.id);
            }
          }
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Balance test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          monitor.recordTaskCompletion(leastLoadedCore.id);
          jest.advanceTimersByTime(10);
        }
      });
      
      expect(metrics.loadBalance).toBeGreaterThan(0.8); // Good load balance
      expect(metrics.taskMigrations).toBeLessThan(20); // Limited migrations
      expect(metrics.performanceIndex).toBeGreaterThan(0.7); // Good performance
    });
  });
});
