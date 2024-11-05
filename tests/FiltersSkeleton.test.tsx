import React from 'react';
import { render, screen } from '@testing-library/react';
import FiltersSkeleton from '../src/components/TelemetryDashboard/components/FiltersSkeleton';

describe('FiltersSkeleton', () => {
  it('renders with default props', () => {
    render(<FiltersSkeleton />);
    
    // Check if skeleton container has animation class
    const container = screen.getByRole('status');
    expect(container).toHaveClass('animate-pulse');
    
    // Check if date range section is rendered
    const dateRangeSection = screen.getByTestId('date-range-skeleton');
    expect(dateRangeSection).toBeInTheDocument();
    
    // Check if category filters section is rendered
    const categorySection = screen.getByTestId('category-filters-skeleton');
    expect(categorySection).toBeInTheDocument();
    
    // Check for correct number of category options
    const categoryCheckboxes = screen.getAllByTestId('category-checkbox-skeleton');
    expect(categoryCheckboxes).toHaveLength(3);
  });

  it('applies custom className', () => {
    const customClass = 'custom-skeleton';
    render(<FiltersSkeleton className={customClass} />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass(customClass);
    expect(container).toHaveClass('animate-pulse');
  });

  it('renders correct number of date range inputs', () => {
    render(<FiltersSkeleton />);
    
    const dateInputs = screen.getAllByTestId('date-input-skeleton');
    expect(dateInputs).toHaveLength(2); // Start date and end date inputs
  });

  it('renders correct number of category checkboxes', () => {
    render(<FiltersSkeleton />);
    
    const checkboxes = screen.getAllByTestId('category-checkbox-skeleton');
    expect(checkboxes).toHaveLength(3); // Three category options
  });

  it('renders section titles', () => {
    render(<FiltersSkeleton />);
    
    const titles = screen.getAllByTestId('section-title-skeleton');
    expect(titles).toHaveLength(2); // Date range and category titles
    
    titles.forEach(title => {
      expect(title).toHaveClass('bg-gray-200');
      expect(title).toHaveClass('dark:bg-gray-700');
      expect(title).toHaveClass('rounded');
    });
  });

  it('has correct ARIA label', () => {
    render(<FiltersSkeleton />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading filters');
  });
});
