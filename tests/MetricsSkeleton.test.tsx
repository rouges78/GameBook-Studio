import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsSkeleton from '../src/components/TelemetryDashboard/components/MetricsSkeleton';

describe('MetricsSkeleton', () => {
  it('renders with default props', () => {
    render(<MetricsSkeleton />);
    
    // Check if skeleton container has animation class
    const container = screen.getByRole('status');
    expect(container.className).toContain('animate-pulse');
    
    // Check if correct number of metric skeletons are rendered
    const metricSkeletons = screen.getAllByTestId('metric-skeleton');
    expect(metricSkeletons).toHaveLength(6);
  });

  it('applies custom className', () => {
    const customClass = 'custom-metrics';
    render(<MetricsSkeleton className={customClass} />);
    
    const container = screen.getByRole('status');
    expect(container.className).toContain(customClass);
  });

  it('renders correct grid layout classes', () => {
    render(<MetricsSkeleton />);
    
    const container = screen.getByRole('status');
    expect(container.className).toContain('grid');
    expect(container.className).toContain('grid-cols-1');
    expect(container.className).toContain('md:grid-cols-2');
    expect(container.className).toContain('lg:grid-cols-3');
  });

  it('renders metric cards with correct structure', () => {
    render(<MetricsSkeleton />);
    
    const metricCards = screen.getAllByTestId('metric-skeleton');
    
    metricCards.forEach(card => {
      // Check for title skeleton
      const titleSkeleton = card.children[0];
      expect(titleSkeleton.className).toContain('bg-gray-200');
      expect(titleSkeleton.className).toContain('dark:bg-gray-700');
      
      // Check for value skeleton
      const valueSkeleton = card.children[1];
      expect(valueSkeleton.className).toContain('bg-gray-200');
      expect(valueSkeleton.className).toContain('dark:bg-gray-700');
      
      // Check for change indicator skeleton
      const changeIndicator = card.children[2];
      expect(changeIndicator.className).toContain('flex');
      expect(changeIndicator.children).toHaveLength(2); // Icon and text
    });
  });

  it('applies dark mode classes', () => {
    render(<MetricsSkeleton />);
    
    const metricCards = screen.getAllByTestId('metric-skeleton');
    metricCards.forEach(card => {
      expect(card.className).toContain('dark:bg-gray-800');
      
      // Check all skeleton elements have dark mode classes
      const skeletonElements = card.querySelectorAll('[class*="bg-gray-200"]');
      skeletonElements.forEach(element => {
        expect(element.className).toContain('dark:bg-gray-700');
      });
    });
  });

  it('has correct ARIA label', () => {
    render(<MetricsSkeleton />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading metrics');
  });
});
