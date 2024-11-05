import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilters } from '../src/components/TelemetryDashboard/components/DateRangeFilters';
import { PRESET_RANGES } from '../src/components/TelemetryDashboard/types';

describe('DateRangeFilters', () => {
  const defaultProps = {
    dateRange: {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    onDateChange: jest.fn(),
    onPresetSelect: jest.fn(),
    isDarkMode: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<DateRangeFilters {...defaultProps} />);
    
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Quick Ranges')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('End Date')).toHaveValue('2024-01-31');
  });

  it('renders all preset range buttons', () => {
    render(<DateRangeFilters {...defaultProps} />);
    
    PRESET_RANGES.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls onDateChange when date inputs change', () => {
    render(<DateRangeFilters {...defaultProps} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('startDate', '2024-02-01');
    
    const endDateInput = screen.getByLabelText('End Date');
    fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });
    
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('endDate', '2024-02-28');
  });

  it('calls onPresetSelect when preset range is clicked', () => {
    render(<DateRangeFilters {...defaultProps} />);
    
    const sevenDaysButton = screen.getByText('Last 7 Days');
    fireEvent.click(sevenDaysButton);
    
    expect(defaultProps.onPresetSelect).toHaveBeenCalledWith(7);
  });

  it('respects min and max date constraints', () => {
    const propsWithConstraints = {
      ...defaultProps,
      minDate: '2024-01-01',
      maxDate: '2024-12-31'
    };
    
    render(<DateRangeFilters {...propsWithConstraints} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    expect(startDateInput).toHaveAttribute('min', '2024-01-01');
    expect(startDateInput).toHaveAttribute('max', '2024-01-31');
    expect(endDateInput).toHaveAttribute('min', '2024-01-01');
    expect(endDateInput).toHaveAttribute('max', '2024-12-31');
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    const darkModeProps = {
      ...defaultProps,
      isDarkMode: true
    };
    
    render(<DateRangeFilters {...darkModeProps} />);
    
    const container = screen.getByText('Date Range').parentElement;
    expect(container).toHaveClass('bg-gray-700');
    
    const dateInputs = screen.getAllByRole('textbox');
    dateInputs.forEach(input => {
      expect(input).toHaveClass('bg-gray-600', 'text-gray-200');
    });
  });
});
