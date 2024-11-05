import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilters } from '../src/components/TelemetryDashboard/components/CategoryFilters';

describe('CategoryFilters', () => {
  const defaultProps = {
    categories: {
      'auto-update': true,
      'system': false,
      'user-interaction': true,
      'error': false
    },
    onToggle: jest.fn(),
    isDarkMode: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all category buttons', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    Object.keys(defaultProps.categories).forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('calls onToggle with correct category when button is clicked', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const systemButton = screen.getByText('system');
    fireEvent.click(systemButton);
    
    expect(defaultProps.onToggle).toHaveBeenCalledWith('system');
  });

  it('applies correct styles for enabled categories', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const enabledButton = screen.getByText('auto-update').closest('button');
    const disabledButton = screen.getByText('system').closest('button');
    
    expect(enabledButton).toHaveClass('bg-blue-500', 'text-white');
    expect(disabledButton).toHaveClass('bg-gray-300', 'text-gray-600');
  });

  it('applies dark mode styles when isDarkMode is true', () => {
    render(<CategoryFilters {...defaultProps} isDarkMode={true} />);
    
    const enabledButton = screen.getByText('auto-update').closest('button');
    const disabledButton = screen.getByText('system').closest('button');
    
    expect(enabledButton).toHaveClass('bg-blue-600', 'text-white');
    expect(disabledButton).toHaveClass('bg-gray-600', 'text-gray-400');
  });

  it('sets correct aria-pressed attribute based on category state', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const enabledButton = screen.getByText('auto-update').closest('button');
    const disabledButton = screen.getByText('system').closest('button');
    
    expect(enabledButton).toHaveAttribute('aria-pressed', 'true');
    expect(disabledButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('displays correct title attribute for each button', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const enabledButton = screen.getByText('auto-update').closest('button');
    const disabledButton = screen.getByText('system').closest('button');
    
    expect(enabledButton).toHaveAttribute('title', 'Hide auto-update events');
    expect(disabledButton).toHaveAttribute('title', 'Show system events');
  });

  it('renders help text', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    expect(screen.getByText('Click a category to toggle its visibility in the charts')).toBeInTheDocument();
  });

  it('renders indicator dots with correct colors', () => {
    render(<CategoryFilters {...defaultProps} />);
    
    const enabledDot = screen.getByText('auto-update').previousSibling;
    const disabledDot = screen.getByText('system').previousSibling;
    
    expect(enabledDot).toHaveClass('bg-white');
    expect(disabledDot).toHaveClass('bg-gray-400');
  });

  it('handles empty categories object', () => {
    render(<CategoryFilters {...defaultProps} categories={{}} />);
    
    expect(screen.getByText('Event Categories')).toBeInTheDocument();
    expect(screen.getByText('Click a category to toggle its visibility in the charts')).toBeInTheDocument();
  });
});
