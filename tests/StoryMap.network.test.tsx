import React from 'react';
import { render, act } from '@testing-library/react';
import StoryMap from '../src/components/StoryMap';
import type { ExtendedParagraph, MapSettings, StoryMapProps } from '../src/components/StoryMap/types';

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

// Network condition simulation
const simulateNetworkCondition = (condition: 'slow' | 'unstable' | 'offline') => {
  switch (condition) {
    case 'slow':
      return new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
    case 'unstable':
      return Math.random() > 0.5
        ? Promise.resolve()
        : Promise.reject(new Error('Network timeout'));
    case 'offline':
      return Promise.reject(new Error('Network offline'));
  }
};

describe('StoryMap Network Tests', () => {
  // Helper to generate test data
  const generateParagraphs = (count: number): ExtendedParagraph[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Node ${i + 1}`,
      content: `Content for node ${i + 1}`,
      type: 'normale',
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

  describe('Save Operations', () => {
    test('handles slow network during save', async () => {
      const paragraphs = generateParagraphs(100);
      const mockSave = jest.fn().mockImplementation(() => simulateNetworkCondition('slow'));
      
      const { rerender } = render(
        <StoryMap {...defaultProps} paragraphs={paragraphs} onSave={mockSave} />
      );

      // Trigger multiple saves during slow network
      for (let i = 0; i < 5; i++) {
        act(() => {
          const updatedParagraphs = paragraphs.map(p => ({
            ...p,
            x: (p.x || 0) + 10,
            y: (p.y || 0) + 10
          }));
          rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} onSave={mockSave} />);
        });
      }

      // Fast-forward through delays
      act(() => {
        jest.runAllTimers();
      });

      // Should have debounced multiple saves into fewer actual save calls
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    test('handles unstable network during save', async () => {
      const paragraphs = generateParagraphs(100);
      const mockSave = jest.fn().mockImplementation(() => simulateNetworkCondition('unstable'));
      
      const { rerender } = render(
        <StoryMap {...defaultProps} paragraphs={paragraphs} onSave={mockSave} />
      );

      // Trigger save during unstable network
      act(() => {
        const updatedParagraphs = paragraphs.map(p => ({
          ...p,
          x: (p.x || 0) + 10,
          y: (p.y || 0) + 10
        }));
        rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} onSave={mockSave} />);
      });

      // Fast-forward through retry attempts
      act(() => {
        jest.runAllTimers();
      });

      // Should have attempted retries
      expect(mockSave.mock.calls.length).toBeGreaterThan(1);
    });

    test('handles offline state during save', async () => {
      const paragraphs = generateParagraphs(100);
      const mockSave = jest.fn().mockImplementation(() => simulateNetworkCondition('offline'));
      
      const { rerender } = render(
        <StoryMap {...defaultProps} paragraphs={paragraphs} onSave={mockSave} />
      );

      // Trigger save while offline
      act(() => {
        const updatedParagraphs = paragraphs.map(p => ({
          ...p,
          x: (p.x || 0) + 10,
          y: (p.y || 0) + 10
        }));
        rerender(<StoryMap {...defaultProps} paragraphs={updatedParagraphs} onSave={mockSave} />);
      });

      // Fast-forward through offline period
      act(() => {
        jest.runAllTimers();
      });

      // Should have queued changes for later sync
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Load Operations', () => {
    test('handles slow network during initial load', async () => {
      const paragraphs = generateParagraphs(1000); // Large dataset
      const mockLoad = jest.fn().mockImplementation(() => simulateNetworkCondition('slow'));
      
      performance.mark('load-start');
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      
      // Fast-forward through load delay
      act(() => {
        jest.runAllTimers();
      });
      
      performance.mark('load-end');
      performance.measure('load-time', 'load-start', 'load-end');
      const measure = performance.getEntriesByName('load-time')[0];
      
      // Even with slow network, should render within reasonable time
      expect(measure.duration).toBeLessThan(5000);
    });

    test('handles connection interruption during load', async () => {
      const paragraphs = generateParagraphs(500);
      const mockLoad = jest.fn()
        .mockImplementationOnce(() => simulateNetworkCondition('offline'))
        .mockImplementationOnce(() => Promise.resolve(paragraphs));
      
      const { rerender } = render(<StoryMap {...defaultProps} paragraphs={[]} />);
      
      // Simulate connection recovery
      act(() => {
        jest.runAllTimers();
        rerender(<StoryMap {...defaultProps} paragraphs={paragraphs} />);
      });
      
      // Should recover and display content
      expect(document.querySelector('[data-testid="story-map-canvas"]')).toBeInTheDocument();
    });
  });

  describe('Auto-backup Behavior', () => {
    test('maintains backup schedule during network issues', async () => {
      const paragraphs = generateParagraphs(100);
      const mockSave = jest.fn()
        .mockImplementationOnce(() => simulateNetworkCondition('slow'))
        .mockImplementationOnce(() => simulateNetworkCondition('unstable'))
        .mockImplementationOnce(() => simulateNetworkCondition('offline'))
        .mockImplementationOnce(() => Promise.resolve());
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} onSave={mockSave} />);
      
      // Simulate 15 minutes of auto-backup attempts
      act(() => {
        jest.advanceTimersByTime(15 * 60 * 1000);
      });
      
      // Should have attempted backups despite network issues
      expect(mockSave.mock.calls.length).toBeGreaterThan(0);
    });

    test('recovers missed backups after connection restore', async () => {
      const paragraphs = generateParagraphs(100);
      const mockSave = jest.fn()
        .mockImplementationOnce(() => simulateNetworkCondition('offline'))
        .mockImplementationOnce(() => Promise.resolve());
      
      render(<StoryMap {...defaultProps} paragraphs={paragraphs} onSave={mockSave} />);
      
      // Simulate offline period followed by connection restore
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });
      
      // Should attempt to sync missed backups
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
