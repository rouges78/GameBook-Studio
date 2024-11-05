import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilters from '../src/components/TelemetryDashboard/components/CategoryFilters';

interface MockFixedSizeListProps {
  children: ({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => React.ReactElement;
  itemCount: number;
  itemData: any;
  height: number;
  width: string | number;
  itemSize: number;
}

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: React.forwardRef<HTMLDivElement, MockFixedSizeListProps>(
    ({ children, itemCount, itemData }, ref) => {
      const items = [];
      for (let i = 0; i < itemCount; i++) {
        items.push(children({ index: i, style: {}, data: itemData }));
      }
      return <div ref={ref} data-testid="virtualized-list">{items}</div>;
    }
  )
}));

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

  it('renders all category checkboxes in virtualized list', () => {
    render(<CategoryFilters {...defaultProps} />);

    const virtualizedList = screen.getByTestId('virtualized-list');
    expect(virtualizedList).toBeInTheDocument();

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
    const virtualizedList = screen.getByTestId('virtualized-list');
    expect(virtualizedList.children.length).toBe(0);
  });

  it('capitalizes category labels', () => {
    render(<CategoryFilters {...defaultProps} />);

    Object.keys(defaultCategories).forEach(category => {
      const label = screen.getByText(category, { exact: false });
      expect(label.className).toContain('capitalize');
    });
  });

  it('renders virtualized list with correct container styles', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const container = screen.getByRole('region');
    const listContainer = container.querySelector('div[style*="height: 300px"]');
    expect(listContainer).toBeInTheDocument();
    expect(listContainer?.className).toContain('border');
    expect(listContainer?.className).toContain('rounded-lg');
  });

  it('renders correct number of items', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const virtualizedList = screen.getByTestId('virtualized-list');
    const items = virtualizedList.children;
    expect(items.length).toBe(Object.keys(defaultCategories).length);
  });

  it('preserves checkbox state after rerender', () => {
    const { rerender } = render(<CategoryFilters {...defaultProps} />);
    
    // Verify initial state
    const checkbox = screen.getByLabelText('auto-update', { exact: false }) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    
    // Rerender with same props
    rerender(<CategoryFilters {...defaultProps} />);
    expect(checkbox.checked).toBe(true);
    
    // Rerender with modified categories
    rerender(<CategoryFilters {...defaultProps} categories={{ ...defaultCategories, 'auto-update': false }} />);
    expect(checkbox.checked).toBe(false);
  });
});
