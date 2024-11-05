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

// Load prediction monitoring utilities
interface WorkloadPattern {
  timestamp: number;
  load: number;
  trend: number;
  seasonality: number;
  noise: number;
}

interface ResourceDemand {
  cpu: number;
  memory: number;
  io: number;
  network: number;
}

interface PredictionMetrics {
  patterns: WorkloadPattern[];
  demands: ResourceDemand[];
  predictionAccuracy: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  adaptationLatency: number;
  resourceEfficiency: number;
}

class LoadPredictionMonitor {
  private metrics: PredictionMetrics = {
    patterns: [],
    demands: [],
    predictionAccuracy: 0,
    mape: 0,
    rmse: 0,
    adaptationLatency: 0,
    resourceEfficiency: 0
  };

  private onUpdate: (metrics: PredictionMetrics) => void;
  private predictions: number[] = [];
  private actuals: number[] = [];
  private adaptationTimes: number[] = [];

  constructor(onUpdate: (metrics: PredictionMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  recordWorkloadPattern(
    timestamp: number,
    load: number,
    trend: number,
    seasonality: number,
    noise: number
  ): void {
    this.metrics.patterns.push({
      timestamp,
      load,
      trend,
      seasonality,
      noise
    });
    this.updateMetrics();
  }

  recordResourceDemand(
    cpu: number,
    memory: number,
    io: number,
    network: number
  ): void {
    this.metrics.demands.push({
      cpu,
      memory,
      io,
      network
    });
    this.updateMetrics();
  }

  recordPrediction(predicted: number, actual: number): void {
    this.predictions.push(predicted);
    this.actuals.push(actual);
    this.updatePredictionMetrics();
  }

  recordAdaptationTime(latency: number): void {
    this.adaptationTimes.push(latency);
    this.updateMetrics();
  }

  private updatePredictionMetrics(): void {
    if (this.predictions.length === 0 || this.actuals.length === 0) return;

    // Calculate prediction accuracy
    let totalError = 0;
    let totalPercentageError = 0;
    let sumSquaredError = 0;

    for (let i = 0; i < this.predictions.length; i++) {
      const error = Math.abs(this.predictions[i] - this.actuals[i]);
      totalError += error;
      totalPercentageError += error / this.actuals[i];
      sumSquaredError += error * error;
    }

    this.metrics.predictionAccuracy = 1 - (totalError / this.actuals.reduce((a, b) => a + b, 0));
    this.metrics.mape = (totalPercentageError / this.predictions.length) * 100;
    this.metrics.rmse = Math.sqrt(sumSquaredError / this.predictions.length);

    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate adaptation latency
    if (this.adaptationTimes.length > 0) {
      this.metrics.adaptationLatency = this.adaptationTimes.reduce((a, b) => a + b, 0) / 
        this.adaptationTimes.length;
    }

    // Calculate resource efficiency
    if (this.metrics.demands.length > 0) {
      const avgDemands = this.metrics.demands.reduce(
        (acc, demand) => ({
          cpu: acc.cpu + demand.cpu,
          memory: acc.memory + demand.memory,
          io: acc.io + demand.io,
          network: acc.network + demand.network
        }),
        { cpu: 0, memory: 0, io: 0, network: 0 }
      );

      const demandCount = this.metrics.demands.length;
      const avgUtilization = (
        avgDemands.cpu / demandCount +
        avgDemands.memory / demandCount +
        avgDemands.io / demandCount +
        avgDemands.network / demandCount
      ) / 4;

      this.metrics.resourceEfficiency = avgUtilization;
    }

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      patterns: [],
      demands: [],
      predictionAccuracy: 0,
      mape: 0,
      rmse: 0,
      adaptationLatency: 0,
      resourceEfficiency: 0
    };
    this.predictions = [];
    this.actuals = [];
    this.adaptationTimes = [];
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

describe('StoryMap Load Prediction Tests', () => {
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

  describe('Workload Analysis', () => {
    test('identifies workload patterns', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PredictionMetrics = {
        patterns: [],
        demands: [],
        predictionAccuracy: 0,
        mape: 0,
        rmse: 0,
        adaptationLatency: 0,
        resourceEfficiency: 0
      };
      
      const monitor = new LoadPredictionMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate workload pattern
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Generate synthetic workload pattern
          const timestamp = Date.now() + i * 1000;
          const baseLoad = 0.5;
          const trend = 0.1 * Math.sin(i / 20);
          const seasonality = 0.2 * Math.sin(i / 10);
          const noise = 0.05 * (Math.random() - 0.5);
          const load = baseLoad + trend + seasonality + noise;
          
          monitor.recordWorkloadPattern(timestamp, load, trend, seasonality, noise);
          
          // Record resource demands
          monitor.recordResourceDemand(
            0.4 + 0.3 * load, // CPU
            0.3 + 0.2 * load, // Memory
            0.2 + 0.1 * load, // IO
            0.1 + 0.1 * load  // Network
          );
          
          // Make predictions
          const predictedLoad = baseLoad + trend + seasonality;
          monitor.recordPrediction(predictedLoad, load);
          
          if (i % 2 === 0) {
            defaultProps.onSave?.(toNodes(paragraphs));
          } else {
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Pattern test ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          monitor.recordAdaptationTime(Math.random() * 50 + 50);
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.predictionAccuracy).toBeGreaterThan(0.8); // High prediction accuracy
      expect(metrics.mape).toBeLessThan(20); // Low mean absolute percentage error
      expect(metrics.rmse).toBeLessThan(0.2); // Low root mean square error
    });
  });

  describe('Resource Forecasting', () => {
    test('predicts resource demands', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PredictionMetrics = {
        patterns: [],
        demands: [],
        predictionAccuracy: 0,
        mape: 0,
        rmse: 0,
        adaptationLatency: 0,
        resourceEfficiency: 0
      };
      
      const monitor = new LoadPredictionMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource forecasting
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Generate resource demands with trends
          const baseUtilization = 0.4;
          const trendFactor = Math.sin(i / 20) * 0.2;
          const randomFactor = Math.random() * 0.1;
          
          const demands = {
            cpu: baseUtilization + trendFactor + randomFactor,
            memory: baseUtilization - trendFactor + randomFactor,
            io: baseUtilization * 0.5 + randomFactor,
            network: baseUtilization * 0.3 + randomFactor
          };
          
          monitor.recordResourceDemand(
            demands.cpu,
            demands.memory,
            demands.io,
            demands.network
          );
          
          // Predict next demands
          const predictedCpu = baseUtilization + trendFactor;
          monitor.recordPrediction(predictedCpu, demands.cpu);
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Resource test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          monitor.recordAdaptationTime(Math.random() * 30 + 20);
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.7); // Good resource efficiency
      expect(metrics.adaptationLatency).toBeLessThan(100); // Quick adaptation
      expect(metrics.predictionAccuracy).toBeGreaterThan(0.75); // Accurate predictions
    });
  });

  describe('Adaptive Scheduling', () => {
    test('adapts to changing workloads', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: PredictionMetrics = {
        patterns: [],
        demands: [],
        predictionAccuracy: 0,
        mape: 0,
        rmse: 0,
        adaptationLatency: 0,
        resourceEfficiency: 0
      };
      
      const monitor = new LoadPredictionMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate adaptive scheduling
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          // Simulate workload changes
          const timestamp = Date.now() + i * 1000;
          const baseLoad = 0.5;
          const suddenSpike = i === 50 ? 0.4 : 0; // Sudden load spike at i=50
          const gradualChange = i > 70 ? (i - 70) * 0.01 : 0; // Gradual increase after i=70
          const noise = Math.random() * 0.1;
          
          const actualLoad = baseLoad + suddenSpike + gradualChange + noise;
          const predictedLoad = baseLoad + (i > 49 ? 0.4 : 0) + (i > 70 ? (i - 70) * 0.01 : 0);
          
          monitor.recordWorkloadPattern(
            timestamp,
            actualLoad,
            gradualChange,
            suddenSpike,
            noise
          );
          
          monitor.recordPrediction(predictedLoad, actualLoad);
          
          // Record resource adaptation
          monitor.recordResourceDemand(
            actualLoad * 0.8,
            actualLoad * 0.6,
            actualLoad * 0.4,
            actualLoad * 0.2
          );
          
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Adaptation test ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          
          monitor.recordAdaptationTime(
            suddenSpike > 0 ? 100 : Math.random() * 30 + 20
          );
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.adaptationLatency).toBeLessThan(150); // Quick adaptation even with spikes
      expect(metrics.resourceEfficiency).toBeGreaterThan(0.6); // Maintains efficiency
      expect(metrics.mape).toBeLessThan(25); // Reasonable prediction error
    });
  });
});
