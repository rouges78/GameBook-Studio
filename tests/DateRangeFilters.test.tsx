import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangeFilters from '../src/components/TelemetryDashboard/components/DateRangeFilters';

describe('DateRangeFilters', () => {
  const defaultProps = {
    dateRange: {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    onDateChange: jest.fn(),
    isDarkMode: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when loading is true', () => {
    render(
      <DateRangeFilters
        {...defaultProps}
        loading={true}
      />
    );

    const skeleton = screen.getByRole('status');
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('renders date inputs with correct values', () => {
    render(<DateRangeFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

    expect(startDateInput.value).toBe('2024-01-01');
    expect(endDateInput.value).toBe('2024-01-31');
  });

  it('calls onDateChange when dates are changed', () => {
    render(<DateRangeFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('startDate', '2024-02-01');

    fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('endDate', '2024-02-28');
  });

  it('renders preset buttons when onPresetSelect is provided', () => {
    const onPresetSelect = jest.fn();
    render(
      <DateRangeFilters
        {...defaultProps}
        onPresetSelect={onPresetSelect}
      />
    );

    const sevenDaysButton = screen.getByText(/last 7 days/i);
    const thirtyDaysButton = screen.getByText(/last 30 days/i);

    fireEvent.click(sevenDaysButton);
    expect(onPresetSelect).toHaveBeenCalledWith(7);

    fireEvent.click(thirtyDaysButton);
    expect(onPresetSelect).toHaveBeenCalledWith(30);
  });

  it('applies min and max date constraints', () => {
    const minDate = '2024-01-01';
    const maxDate = '2024-12-31';
    render(
      <DateRangeFilters
        {...defaultProps}
        minDate={minDate}
        maxDate={maxDate}
      />
    );

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    expect(startDateInput).toHaveAttribute('min', minDate);
    expect(startDateInput).toHaveAttribute('max', maxDate);
    expect(endDateInput).toHaveAttribute('min', defaultProps.dateRange.startDate);
    expect(endDateInput).toHaveAttribute('max', maxDate);
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    render(
      <DateRangeFilters
        {...defaultProps}
        isDarkMode={true}
      />
    );

    const title = screen.getByText(/date range/i);
    expect(title.className).toContain('dark:text-gray-200');

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input.className).toContain('dark:bg-gray-700');
      expect(input.className).toContain('dark:border-gray-600');
      expect(input.className).toContain('dark:text-white');
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-filters';
    render(
      <DateRangeFilters
        {...defaultProps}
        className={customClass}
      />
    );

    const container = screen.getByRole('region', { name: /date range/i });
    expect(container.className).toContain(customClass);
  });
});
