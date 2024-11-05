import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilters from '../src/components/TelemetryDashboard/components/CategoryFilters';

describe('CategoryFilters', () => {
  const defaultCategories = {
    'auto-update': true,
    'system': false,
    'user-interaction': true,
    'error': false
  };

  const defaultProps = {
    categories: defaultCategories,
    onToggle: jest.fn(),
    isDarkMode: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when loading is true', () => {
    render(
      <CategoryFilters
        {...defaultProps}
        loading={true}
      />
    );

    const skeleton = screen.getByRole('status');
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('renders all category checkboxes', () => {
    render(<CategoryFilters {...defaultProps} />);

    Object.entries(defaultCategories).forEach(([category, isChecked]) => {
      const checkbox = screen.getByLabelText(category, { exact: false }) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.checked).toBe(isChecked);
    });
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(<CategoryFilters {...defaultProps} />);

    const checkbox = screen.getByLabelText('auto-update', { exact: false });
    fireEvent.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith('auto-update');
  });

  it('calls both onToggle and onCategoryChange when both are provided', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilters
        {...defaultProps}
        onCategoryChange={onCategoryChange}
      />
    );

    const checkbox = screen.getByLabelText('system', { exact: false });
    fireEvent.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith('system');
    expect(onCategoryChange).toHaveBeenCalledWith('system');
  });

  it('applies dark mode styles', () => {
    render(
      <CategoryFilters
        {...defaultProps}
        isDarkMode={true}
      />
    );

    const title = screen.getByText('Categories');
    expect(title.className).toContain('dark:text-gray-200');

    const labels = screen.getAllByRole('checkbox').map(checkbox => 
      checkbox.nextElementSibling
    );
    
    labels.forEach(label => {
      expect(label?.className).toContain('dark:text-gray-300');
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-filters';
    render(
      <CategoryFilters
        {...defaultProps}
        className={customClass}
      />
    );

    const container = screen.getByRole('region');
    expect(container.className).toContain(customClass);
  });

  it('handles empty categories object', () => {
    render(
      <CategoryFilters
        {...defaultProps}
        categories={{}}
      />
    );

    const container = screen.getByRole('region');
    expect(container).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('capitalizes category labels', () => {
    render(<CategoryFilters {...defaultProps} />);

    Object.keys(defaultCategories).forEach(category => {
      const label = screen.getByText(category, { exact: false });
      expect(label.className).toContain('capitalize');
    });
  });
});
