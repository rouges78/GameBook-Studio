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

// Cost modeling monitoring utilities
interface ResourceCost {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

interface BudgetLimits {
  hourly: number;
  daily: number;
  monthly: number;
}

interface CostMetrics {
  currentCosts: ResourceCost;
  accumulatedCosts: ResourceCost;
  budgetUtilization: number;
  costEfficiency: number;
  savingsRate: number;
  budgetAlerts: number;
  optimizationScore: number;
}

class CostMonitor {
  private metrics: CostMetrics = {
    currentCosts: {
      cpu: 0,
      memory: 0,
      storage: 0,
      network: 0
    },
    accumulatedCosts: {
      cpu: 0,
      memory: 0,
      storage: 0,
      network: 0
    },
    budgetUtilization: 0,
    costEfficiency: 0,
    savingsRate: 0,
    budgetAlerts: 0,
    optimizationScore: 0
  };

  private onUpdate: (metrics: CostMetrics) => void;
  private startTime: number = Date.now();
  private budgetLimits: BudgetLimits;
  private resourcePricing = {
    cpu: 0.05,    // $ per core hour
    memory: 0.01, // $ per GB hour
    storage: 0.1, // $ per GB month
    network: 0.1  // $ per GB
  };

  constructor(onUpdate: (metrics: CostMetrics) => void, budgetLimits: BudgetLimits) {
    this.onUpdate = onUpdate;
    this.budgetLimits = budgetLimits;
  }

  recordResourceUsage(
    cpuCores: number,
    memoryGB: number,
    storageGB: number,
    networkGB: number,
    duration: number // hours
  ): void {
    // Calculate current costs
    this.metrics.currentCosts = {
      cpu: cpuCores * this.resourcePricing.cpu * duration,
      memory: memoryGB * this.resourcePricing.memory * duration,
      storage: storageGB * this.resourcePricing.storage * (duration / 720), // Convert to month fraction
      network: networkGB * this.resourcePricing.network
    };

    // Update accumulated costs
    this.metrics.accumulatedCosts.cpu += this.metrics.currentCosts.cpu;
    this.metrics.accumulatedCosts.memory += this.metrics.currentCosts.memory;
    this.metrics.accumulatedCosts.storage += this.metrics.currentCosts.storage;
    this.metrics.accumulatedCosts.network += this.metrics.currentCosts.network;

    this.updateMetrics();
  }

  recordOptimization(savings: ResourceCost): void {
    const totalSavings = 
      savings.cpu +
      savings.memory +
      savings.storage +
      savings.network;

    const totalCosts = 
      this.metrics.currentCosts.cpu +
      this.metrics.currentCosts.memory +
      this.metrics.currentCosts.storage +
      this.metrics.currentCosts.network;

    if (totalCosts > 0) {
      this.metrics.savingsRate = totalSavings / totalCosts;
    }

    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate total current costs
    const totalCurrentCosts = 
      this.metrics.currentCosts.cpu +
      this.metrics.currentCosts.memory +
      this.metrics.currentCosts.storage +
      this.metrics.currentCosts.network;

    // Calculate budget utilization (based on hourly budget)
    this.metrics.budgetUtilization = totalCurrentCosts / this.budgetLimits.hourly;

    // Check budget alerts
    if (totalCurrentCosts > this.budgetLimits.hourly) {
      this.metrics.budgetAlerts++;
    }

    // Calculate cost efficiency (work done per dollar)
    const totalWork = this.metrics.currentCosts.cpu * 1000; // Assume CPU cost correlates with work
    this.metrics.costEfficiency = totalCurrentCosts > 0 ? totalWork / totalCurrentCosts : 0;

    // Calculate optimization score (0-1)
    this.metrics.optimizationScore = (
      (1 - this.metrics.budgetUtilization) * 0.4 +
      this.metrics.savingsRate * 0.3 +
      (this.metrics.costEfficiency / 1000) * 0.3
    );

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      currentCosts: {
        cpu: 0,
        memory: 0,
        storage: 0,
        network: 0
      },
      accumulatedCosts: {
        cpu: 0,
        memory: 0,
        storage: 0,
        network: 0
      },
      budgetUtilization: 0,
      costEfficiency: 0,
      savingsRate: 0,
      budgetAlerts: 0,
      optimizationScore: 0
    };
    this.startTime = Date.now();
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

describe('StoryMap Cost Modeling Tests', () => {
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

  describe('Resource Pricing', () => {
    test('calculates costs accurately', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: CostMetrics = {
        currentCosts: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        accumulatedCosts: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        budgetUtilization: 0,
        costEfficiency: 0,
        savingsRate: 0,
        budgetAlerts: 0,
        optimizationScore: 0
      };
      
      const monitor = new CostMonitor((m) => {
        metrics = m;
      }, {
        hourly: 10,
        daily: 200,
        monthly: 5000
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource usage
      await act(async () => {
        for (let i = 0; i < 24; i++) { // Simulate 24 hours
          // Record varying resource usage
          monitor.recordResourceUsage(
            2 + Math.sin(i / 6) * 1,  // CPU cores
            4 + Math.sin(i / 4) * 2,  // Memory GB
            100,                       // Storage GB
            0.5 + Math.random() * 0.5, // Network GB
            1                          // 1 hour duration
          );
          
          // Record optimizations
          monitor.recordOptimization({
            cpu: 0.1 * Math.random(),
            memory: 0.05 * Math.random(),
            storage: 0.02 * Math.random(),
            network: 0.01 * Math.random()
          });
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Hour ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          jest.advanceTimersByTime(3600000); // Advance 1 hour
        }
      });
      
      expect(metrics.budgetUtilization).toBeLessThan(1); // Within budget
      expect(metrics.savingsRate).toBeGreaterThan(0); // Some cost savings
      expect(metrics.optimizationScore).toBeGreaterThan(0.6); // Good optimization
    });
  });

  describe('Budget Control', () => {
    test('maintains budget limits', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: CostMetrics = {
        currentCosts: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        accumulatedCosts: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        budgetUtilization: 0,
        costEfficiency: 0,
        savingsRate: 0,
        budgetAlerts: 0,
        optimizationScore: 0
      };
      
      const monitor = new CostMonitor((m) => {
        metrics = m;
      }, {
        hourly: 5,
        daily: 100,
        monthly: 2500
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate budget-aware resource usage
      await act(async () => {
        for (let i = 0; i < 12; i++) {
          const budgetFactor = Math.max(0.1, 1 - metrics.budgetUtilization);
          
          // Scale resource usage based on remaining budget
          monitor.recordResourceUsage(
            2 * budgetFactor,  // CPU cores
            4 * budgetFactor,  // Memory GB
            100,               // Storage GB
            0.5 * budgetFactor, // Network GB
            1                  // 1 hour duration
          );
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Budget test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(3600000);
        }
      });
      
      expect(metrics.budgetAlerts).toBeLessThan(3); // Few budget alerts
      expect(metrics.budgetUtilization).toBeLessThan(1.1); // Near budget limit
      expect(metrics.optimizationScore).toBeGreaterThan(0.5); // Acceptable optimization
    });
  });

  describe('Cost Optimization', () => {
    test('improves resource efficiency', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: CostMetrics = {
        currentCosts: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        accumulatedCosts: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0
        },
        budgetUtilization: 0,
        costEfficiency: 0,
        savingsRate: 0,
        budgetAlerts: 0,
        optimizationScore: 0
      };
      
      const monitor = new CostMonitor((m) => {
        metrics = m;
      }, {
        hourly: 8,
        daily: 150,
        monthly: 4000
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate optimization process
      await act(async () => {
        for (let i = 0; i < 48; i++) {
          // Initial resource usage
          if (i < 24) {
            monitor.recordResourceUsage(
              4,    // CPU cores
              8,    // Memory GB
              200,  // Storage GB
              1,    // Network GB
              0.5   // 30 minutes duration
            );
          } else {
            // Optimized resource usage
            monitor.recordResourceUsage(
              2,    // Reduced CPU cores
              6,    // Reduced Memory GB
              150,  // Optimized Storage GB
              0.8,  // Optimized Network GB
              0.5   // 30 minutes duration
            );
            
            // Record cost savings
            monitor.recordOptimization({
              cpu: 0.2,
              memory: 0.1,
              storage: 0.05,
              network: 0.02
            });
          }
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Optimization ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          jest.advanceTimersByTime(1800000); // 30 minutes
        }
      });
      
      expect(metrics.savingsRate).toBeGreaterThan(0.2); // Significant savings
      expect(metrics.costEfficiency).toBeGreaterThan(metrics.budgetUtilization); // Efficient resource use
      expect(metrics.optimizationScore).toBeGreaterThan(0.7); // Good optimization
    });
  });
});
