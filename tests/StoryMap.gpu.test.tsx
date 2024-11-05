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

// GPU Performance monitoring utilities
interface FrameMetrics {
  timestamp: number;
  duration: number;
  fps: number;
}

interface RenderMetrics {
  frames: FrameMetrics[];
  droppedFrames: number;
  averageFps: number;
  jankCount: number;
}

class GPUProfiler {
  private frames: FrameMetrics[] = [];
  private startTime: number = 0;
  private animationFrameId: number | null = null;
  private onUpdate: (metrics: RenderMetrics) => void;

  constructor(onUpdate: (metrics: RenderMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    this.startTime = performance.now();
    this.frames = [];
    this.scheduleFrame();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private scheduleFrame(): void {
    this.animationFrameId = requestAnimationFrame(this.recordFrame);
  }

  private recordFrame = (timestamp: number): void => {
    const frameDuration = timestamp - this.startTime;
    const fps = 1000 / frameDuration;

    this.frames.push({
      timestamp,
      duration: frameDuration,
      fps
    });

    // Calculate metrics
    const metrics = this.calculateMetrics();
    this.onUpdate(metrics);

    // Schedule next frame
    this.startTime = timestamp;
    this.scheduleFrame();
  };

  private calculateMetrics(): RenderMetrics {
    const droppedFrames = this.frames.filter(f => f.fps < 30).length;
    const totalFps = this.frames.reduce((sum, f) => sum + f.fps, 0);
    const averageFps = totalFps / this.frames.length;
    const jankCount = this.frames.filter(f => f.duration > 16.67).length;

    return {
      frames: this.frames,
      droppedFrames,
      averageFps,
      jankCount
    };
  }
}

describe('StoryMap GPU Tests', () => {
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

  describe('Rendering Performance', () => {
    test('maintains stable frame rate during normal operation', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RenderMetrics = {
        frames: [],
        droppedFrames: 0,
        averageFps: 0,
        jankCount: 0
      };
      
      const profiler = new GPUProfiler((m) => {
        metrics = m;
      });
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      profiler.start();
      
      // Simulate 1 second of rendering
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      profiler.stop();
      
      expect(metrics.averageFps).toBeGreaterThan(55); // Should maintain close to 60fps
      expect(metrics.droppedFrames).toBeLessThan(5); // Allow few dropped frames
      expect(metrics.jankCount).toBeLessThan(3); // Minimal jank
    });

    test('handles rapid visual updates efficiently', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RenderMetrics = {
        frames: [],
        droppedFrames: 0,
        averageFps: 0,
        jankCount: 0
      };
      
      const profiler = new GPUProfiler((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      profiler.start();
      
      // Simulate rapid updates
      for (let i = 0; i < 60; i++) {
        await act(async () => {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + Math.sin(i) * 5,
            y: (p.y || 0) + Math.cos(i) * 5
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          jest.advanceTimersByTime(16.67); // Simulate 60fps timing
        });
      }
      
      profiler.stop();
      
      expect(metrics.averageFps).toBeGreaterThan(50); // Should maintain good fps during updates
      expect(metrics.jankCount / metrics.frames.length).toBeLessThan(0.1); // Less than 10% jank
    });
  });

  describe('Animation Performance', () => {
    test('maintains smooth transitions', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RenderMetrics = {
        frames: [],
        droppedFrames: 0,
        averageFps: 0,
        jankCount: 0
      };
      
      const profiler = new GPUProfiler((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      profiler.start();
      
      // Simulate zoom transition
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          const scale = 1 + (i / 30) * 0.5; // Zoom to 1.5x
          rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
          jest.advanceTimersByTime(16.67);
        });
      }
      
      profiler.stop();
      
      expect(metrics.averageFps).toBeGreaterThan(55); // Smooth animation
      expect(metrics.droppedFrames).toBeLessThan(3); // Minimal frame drops during transition
    });

    test('handles concurrent animations', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RenderMetrics = {
        frames: [],
        droppedFrames: 0,
        averageFps: 0,
        jankCount: 0
      };
      
      const profiler = new GPUProfiler((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      profiler.start();
      
      // Simulate multiple concurrent animations
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          const scale = 1 + (i / 30) * 0.5;
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + Math.sin(i) * 3,
            y: (p.y || 0) + Math.cos(i) * 3
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          jest.advanceTimersByTime(16.67);
        });
      }
      
      profiler.stop();
      
      expect(metrics.averageFps).toBeGreaterThan(45); // Maintain acceptable fps under load
      expect(metrics.jankCount / metrics.frames.length).toBeLessThan(0.15); // Allow slightly more jank
    });
  });

  describe('Visual Stability', () => {
    test('prevents layout shifts during updates', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let layoutShifts = 0;
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Monitor layout shifts
      const observer = new (window as any).PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          layoutShifts += entry.value;
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Perform rapid updates
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            content: `Updated content ${i}`
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
          jest.advanceTimersByTime(16.67);
        });
      }
      
      observer.disconnect();
      
      expect(layoutShifts).toBeLessThan(0.1); // Minimal cumulative layout shift
    });

    test('maintains visual consistency during state changes', async () => {
      const nodeCount = 100;
      const paragraphs = generateParagraphs(nodeCount);
      let metrics: RenderMetrics = {
        frames: [],
        droppedFrames: 0,
        averageFps: 0,
        jankCount: 0
      };
      
      const profiler = new GPUProfiler((m) => {
        metrics = m;
      });
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      profiler.start();
      
      // Simulate various state changes
      await act(async () => {
        // Toggle dark mode
        rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} isDarkMode={true} />);
        jest.advanceTimersByTime(16.67);
        
        // Update map settings
        rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} isDarkMode={true} mapSettings={{
          ...defaultMapSettings,
          imageAdjustments: {
            ...defaultMapSettings.imageAdjustments,
            contrast: 110
          }
        }} />);
        jest.advanceTimersByTime(16.67);
        
        // Add new node
        const newNode: ExtendedParagraph = {
          id: nodeCount + 1,
          title: 'New Node',
          content: 'New Content',
          type: 'normale' as const,
          actions: [],
          incomingConnections: [],
          outgoingConnections: [],
          x: 500,
          y: 500,
          locked: false
        };
        
        const updatedParagraphs = [...paragraphs, newNode];
        rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} />);
        jest.advanceTimersByTime(16.67);
      });
      
      profiler.stop();
      
      expect(metrics.averageFps).toBeGreaterThan(50); // Maintain performance during state changes
      expect(metrics.droppedFrames).toBeLessThan(2); // Minimal frame drops
    });
  });
});
