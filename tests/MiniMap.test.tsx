import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MiniMap } from '../src/components/StoryMap/components/MiniMap';
import type { Node, Link } from '../src/components/StoryMap/types';

describe('MiniMap Component', () => {
  const defaultProps = {
    nodes: [
      { id: 1, x: 100, y: 100, title: 'Node 1', type: 'normale', locked: false, actions: [], outgoingConnections: [] },
      { id: 2, x: 200, y: 200, title: 'Node 2', type: 'nodo', locked: false, actions: [], outgoingConnections: [] }
    ] as Node[],
    links: [
      { source: 1, target: 2, isPaused: false, isHighlighted: false }
    ] as Link[],
    viewBox: { x: 0, y: 0, width: 1000, height: 800 },
    mapWidth: 2000,
    mapHeight: 1600,
    onViewBoxChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<MiniMap {...defaultProps} />);
    expect(screen.getByTestId('mini-map-container')).toBeInTheDocument();
  });

  test('renders nodes and links', () => {
    render(<MiniMap {...defaultProps} />);
    const nodes = screen.getAllByTestId('mini-map-node');
    const links = screen.getAllByTestId('mini-map-link');
    
    expect(nodes).toHaveLength(2);
    expect(links).toHaveLength(1);
  });

  test('handles viewport drag', () => {
    render(<MiniMap {...defaultProps} />);
    const viewport = screen.getByTestId('mini-map-viewport');
    
    fireEvent.mouseDown(viewport, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(viewport, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(viewport);

    expect(defaultProps.onViewBoxChange).toHaveBeenCalled();
  });

  test('handles click to move viewport', () => {
    render(<MiniMap {...defaultProps} />);
    const container = screen.getByTestId('mini-map-container');
    
    fireEvent.click(container, { clientX: 150, clientY: 150 });

    expect(defaultProps.onViewBoxChange).toHaveBeenCalled();
  });

  test('scales nodes and viewport correctly', () => {
    const { container } = render(<MiniMap {...defaultProps} />);
    
    const viewport = screen.getByTestId('mini-map-viewport');
    const viewportRect = viewport.getBoundingClientRect();
    
    // Check if viewport dimensions are scaled correctly
    expect(viewportRect.width).toBeLessThan(container.clientWidth);
    expect(viewportRect.height).toBeLessThan(container.clientHeight);
  });

  test('updates viewport position when viewBox changes', () => {
    const { rerender } = render(<MiniMap {...defaultProps} />);
    const initialViewport = screen.getByTestId('mini-map-viewport');
    const initialPosition = initialViewport.getAttribute('transform');

    const newProps = {
      ...defaultProps,
      viewBox: { x: 100, y: 100, width: 1000, height: 800 }
    };

    rerender(<MiniMap {...newProps} />);
    const updatedViewport = screen.getByTestId('mini-map-viewport');
    const updatedPosition = updatedViewport.getAttribute('transform');

    expect(updatedPosition).not.toBe(initialPosition);
  });

  test('handles window resize', () => {
    const { unmount } = render(<MiniMap {...defaultProps} />);
    
    // Trigger window resize
    global.dispatchEvent(new Event('resize'));
    
    // Clean up
    unmount();
  });

  test('maintains aspect ratio', () => {
    const wideProps = {
      ...defaultProps,
      mapWidth: 3000,
      mapHeight: 1000
    };

    const { container } = render(<MiniMap {...wideProps} />);
    const miniMap = screen.getByTestId('mini-map-container');
    
    // The mini-map should maintain the same aspect ratio as the full map
    const aspectRatio = wideProps.mapWidth / wideProps.mapHeight;
    const miniMapAspectRatio = miniMap.clientWidth / miniMap.clientHeight;
    
    expect(Math.abs(aspectRatio - miniMapAspectRatio)).toBeLessThan(0.1);
  });

  test('highlights selected nodes', () => {
    const propsWithSelectedNode = {
      ...defaultProps,
      nodes: [
        { ...defaultProps.nodes[0], isSelected: true },
        defaultProps.nodes[1]
      ]
    };

    render(<MiniMap {...propsWithSelectedNode} />);
    const nodes = screen.getAllByTestId('mini-map-node');
    
    expect(nodes[0]).toHaveClass('selected');
    expect(nodes[1]).not.toHaveClass('selected');
  });

  test('shows correct viewport size for zoomed view', () => {
    const zoomedProps = {
      ...defaultProps,
      viewBox: {
        ...defaultProps.viewBox,
        width: defaultProps.viewBox.width / 2,
        height: defaultProps.viewBox.height / 2
      }
    };

    render(<MiniMap {...zoomedProps} />);
    const viewport = screen.getByTestId('mini-map-viewport');
    const initialViewport = screen.getByTestId('mini-map-viewport');
    
    // Viewport should be smaller when zoomed in
    expect(viewport.getBoundingClientRect().width).toBeLessThan(
      initialViewport.getBoundingClientRect().width
    );
  });
});
