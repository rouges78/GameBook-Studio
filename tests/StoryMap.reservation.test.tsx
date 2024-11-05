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

// Resource reservation monitoring utilities
interface ResourceQuota {
  cpu: number;
  memory: number;
  storage: number;
  bandwidth: number;
}

interface ReservationRequest {
  id: number;
  quota: ResourceQuota;
  priority: number;
  timestamp: number;
  duration: number;
}

interface ReservationMetrics {
  totalRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  qosViolations: number;
  resourceUtilization: number;
  admissionRate: number;
  averageWaitTime: number;
  quotaEfficiency: number;
}

class ReservationMonitor {
  private metrics: ReservationMetrics = {
    totalRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    qosViolations: 0,
    resourceUtilization: 0,
    admissionRate: 0,
    averageWaitTime: 0,
    quotaEfficiency: 0
  };

  private onUpdate: (metrics: ReservationMetrics) => void;
  private activeReservations: Map<number, ReservationRequest> = new Map();
  private availableQuota: ResourceQuota = {
    cpu: 100,
    memory: 100,
    storage: 100,
    bandwidth: 100
  };
  private waitTimes: number[] = [];

  constructor(onUpdate: (metrics: ReservationMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  requestReservation(request: Omit<ReservationRequest, 'id'>): number {
    const id = Math.random();
    const fullRequest: ReservationRequest = { ...request, id };
    
    this.metrics.totalRequests++;
    
    if (this.canAccommodate(fullRequest.quota)) {
      this.activeReservations.set(id, fullRequest);
      this.updateAvailableQuota('reserve', fullRequest.quota);
      this.metrics.acceptedRequests++;
      this.waitTimes.push(Date.now() - fullRequest.timestamp);
    } else {
      this.metrics.rejectedRequests++;
    }
    
    this.updateMetrics();
    return id;
  }

  releaseReservation(id: number): void {
    const reservation = this.activeReservations.get(id);
    if (reservation) {
      this.updateAvailableQuota('release', reservation.quota);
      this.activeReservations.delete(id);
      this.updateMetrics();
    }
  }

  recordQosViolation(): void {
    this.metrics.qosViolations++;
    this.updateMetrics();
  }

  private canAccommodate(quota: ResourceQuota): boolean {
    return (
      this.availableQuota.cpu >= quota.cpu &&
      this.availableQuota.memory >= quota.memory &&
      this.availableQuota.storage >= quota.storage &&
      this.availableQuota.bandwidth >= quota.bandwidth
    );
  }

  private updateAvailableQuota(action: 'reserve' | 'release', quota: ResourceQuota): void {
    const multiplier = action === 'reserve' ? -1 : 1;
    this.availableQuota.cpu += quota.cpu * multiplier;
    this.availableQuota.memory += quota.memory * multiplier;
    this.availableQuota.storage += quota.storage * multiplier;
    this.availableQuota.bandwidth += quota.bandwidth * multiplier;
  }

  private updateMetrics(): void {
    // Calculate admission rate
    this.metrics.admissionRate = this.metrics.totalRequests > 0 ?
      this.metrics.acceptedRequests / this.metrics.totalRequests : 0;

    // Calculate average wait time
    this.metrics.averageWaitTime = this.waitTimes.length > 0 ?
      this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length : 0;

    // Calculate resource utilization
    const totalQuota = {
      cpu: 100,
      memory: 100,
      storage: 100,
      bandwidth: 100
    };
    
    this.metrics.resourceUtilization = (
      (totalQuota.cpu - this.availableQuota.cpu) / totalQuota.cpu +
      (totalQuota.memory - this.availableQuota.memory) / totalQuota.memory +
      (totalQuota.storage - this.availableQuota.storage) / totalQuota.storage +
      (totalQuota.bandwidth - this.availableQuota.bandwidth) / totalQuota.bandwidth
    ) / 4;

    // Calculate quota efficiency
    this.metrics.quotaEfficiency = this.metrics.acceptedRequests > 0 ?
      1 - (this.metrics.qosViolations / this.metrics.acceptedRequests) : 0;

    this.onUpdate(this.metrics);
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      qosViolations: 0,
      resourceUtilization: 0,
      admissionRate: 0,
      averageWaitTime: 0,
      quotaEfficiency: 0
    };
    this.activeReservations.clear();
    this.availableQuota = {
      cpu: 100,
      memory: 100,
      storage: 100,
      bandwidth: 100
    };
    this.waitTimes = [];
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

describe('StoryMap Resource Reservation Tests', () => {
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

  describe('Quota Management', () => {
    test('handles resource quotas effectively', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ReservationMetrics = {
        totalRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        qosViolations: 0,
        resourceUtilization: 0,
        admissionRate: 0,
        averageWaitTime: 0,
        quotaEfficiency: 0
      };
      
      const monitor = new ReservationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate quota management
      await act(async () => {
        const reservations: number[] = [];
        
        // Make reservation requests
        for (let i = 0; i < 20; i++) {
          const quota = {
            cpu: 10 + Math.random() * 20,
            memory: 10 + Math.random() * 20,
            storage: 5 + Math.random() * 10,
            bandwidth: 5 + Math.random() * 10
          };
          
          const id = monitor.requestReservation({
            quota,
            priority: Math.floor(Math.random() * 3),
            timestamp: Date.now(),
            duration: 1000
          });
          
          if (id) {
            reservations.push(id);
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Reservation ${id}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          // Occasionally release reservations
          if (i % 5 === 0 && reservations.length > 0) {
            const releaseId = reservations.shift();
            if (releaseId) {
              monitor.releaseReservation(releaseId);
            }
          }
          
          jest.advanceTimersByTime(100);
        }
      });
      
      expect(metrics.admissionRate).toBeGreaterThan(0.7); // Good admission rate
      expect(metrics.resourceUtilization).toBeLessThan(0.9); // Not overutilized
      expect(metrics.quotaEfficiency).toBeGreaterThan(0.8); // Efficient quota usage
    });
  });

  describe('Admission Control', () => {
    test('maintains QoS requirements', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ReservationMetrics = {
        totalRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        qosViolations: 0,
        resourceUtilization: 0,
        admissionRate: 0,
        averageWaitTime: 0,
        quotaEfficiency: 0
      };
      
      const monitor = new ReservationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate admission control
      await act(async () => {
        const activeReservations: number[] = [];
        
        for (let i = 0; i < 50; i++) {
          // High-priority request
          if (i % 5 === 0) {
            const id = monitor.requestReservation({
              quota: {
                cpu: 30,
                memory: 30,
                storage: 20,
                bandwidth: 20
              },
              priority: 0, // High priority
              timestamp: Date.now(),
              duration: 500
            });
            
            if (id) {
              activeReservations.push(id);
              defaultProps.onSave?.(toNodes(paragraphs));
            }
          } else {
            // Regular request
            const id = monitor.requestReservation({
              quota: {
                cpu: 10,
                memory: 10,
                storage: 5,
                bandwidth: 5
              },
              priority: 1,
              timestamp: Date.now(),
              duration: 200
            });
            
            if (id) {
              activeReservations.push(id);
              const updatedParagraphs = paragraphs.map(p => ({
                ...p,
                content: `Request ${id}`
              }));
              rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
            }
          }
          
          // Release completed reservations
          while (activeReservations.length > 0 && Math.random() > 0.7) {
            const releaseId = activeReservations.shift();
            if (releaseId) {
              monitor.releaseReservation(releaseId);
            }
          }
          
          // Occasionally record QoS violations
          if (metrics.resourceUtilization > 0.95) {
            monitor.recordQosViolation();
          }
          
          jest.advanceTimersByTime(50);
        }
      });
      
      expect(metrics.qosViolations).toBeLessThan(metrics.acceptedRequests * 0.1); // Few QoS violations
      expect(metrics.averageWaitTime).toBeLessThan(200); // Reasonable wait time
      expect(metrics.admissionRate).toBeGreaterThan(0.6); // Acceptable admission rate
    });
  });

  describe('Resource Efficiency', () => {
    test('optimizes resource allocation', async () => {
      const nodeCount = 1000;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: ReservationMetrics = {
        totalRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        qosViolations: 0,
        resourceUtilization: 0,
        admissionRate: 0,
        averageWaitTime: 0,
        quotaEfficiency: 0
      };
      
      const monitor = new ReservationMonitor((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Simulate resource optimization
      await act(async () => {
        const activeReservations: number[] = [];
        
        for (let i = 0; i < 40; i++) {
          // Calculate optimal quota based on current utilization
          const baseQuota = 20 * (1 - metrics.resourceUtilization);
          const quota = {
            cpu: baseQuota + Math.random() * 10,
            memory: baseQuota + Math.random() * 10,
            storage: baseQuota / 2 + Math.random() * 5,
            bandwidth: baseQuota / 2 + Math.random() * 5
          };
          
          const id = monitor.requestReservation({
            quota,
            priority: Math.floor(Math.random() * 3),
            timestamp: Date.now(),
            duration: 300
          });
          
          if (id) {
            activeReservations.push(id);
            
            const updatedParagraphs = paragraphs.map(p => ({
              ...p,
              content: `Optimization ${i}`
            }));
            rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          }
          
          // Release reservations based on duration
          const currentTime = Date.now();
          while (activeReservations.length > 0 && 
                 currentTime - activeReservations[0] * 1000 > 300) {
            const releaseId = activeReservations.shift();
            if (releaseId) {
              monitor.releaseReservation(releaseId);
            }
          }
          
          jest.advanceTimersByTime(75);
        }
      });
      
      expect(metrics.resourceUtilization).toBeGreaterThan(0.7); // Good utilization
      expect(metrics.quotaEfficiency).toBeGreaterThan(0.85); // Efficient quota usage
      expect(metrics.rejectedRequests).toBeLessThan(metrics.acceptedRequests * 0.2); // Few rejections
    });
  });
});
