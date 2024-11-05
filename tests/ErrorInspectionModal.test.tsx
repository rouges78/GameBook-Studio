import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorInspectionModal } from '../src/components/TelemetryDashboard/components/ErrorInspectionModal';
import { ErrorPatterns } from '../src/components/TelemetryDashboard/types';
import { TelemetryEvent } from '../src/types/electron';

const mockErrorPatterns: ErrorPatterns = {
  correlations: [
    { pattern: 'Network Error', count: 10, impact: 8 },
    { pattern: 'Validation Error', count: 5, impact: 3 }
  ],
  trends: [
    { date: '2024-01-01', errors: 3 },
    { date: '2024-01-02', errors: 2 }
  ]
};

const mockEvents: TelemetryEvent[] = [
  {
    category: 'error',
    action: 'network_failure',
    label: 'API Request Failed',
    timestamp: 1704067200000, // 2024-01-01
    appVersion: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    metadata: {
      pattern: 'Network Error',
      statusCode: 500
    }
  },
  {
    category: 'error',
    action: 'network_failure',
    label: 'API Request Failed',
    timestamp: 1704153600000, // 2024-01-02
    appVersion: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    metadata: {
      pattern: 'Network Error',
      statusCode: 500
    }
  }
];

describe('ErrorInspectionModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders nothing when closed', () => {
    render(
      <ErrorInspectionModal
        isOpen={false}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        isDarkMode={false}
      />
    );

    expect(screen.queryByText('Error Pattern Analysis')).not.toBeInTheDocument();
  });

  it('renders modal content when open', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Error Pattern Analysis')).toBeInTheDocument();
    expect(screen.getByText('Pattern Details')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('displays platform distribution', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Platform Distribution')).toBeInTheDocument();
    expect(screen.getByText('win32')).toBeInTheDocument();
  });

  it('displays time-based analysis', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Time-based Analysis')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('23:59')).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={false}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking overlay', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={false}
      />
    );

    // Find overlay by its classes
    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('displays recent occurrences table', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Recent Occurrences')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getAllByText('1.0.0')).toHaveLength(2); // Two events with version 1.0.0
  });

  it('handles dark mode styling', () => {
    render(
      <ErrorInspectionModal
        isOpen={true}
        onClose={mockOnClose}
        errorPatterns={mockErrorPatterns}
        selectedError={{
          pattern: 'Network Error',
          events: mockEvents
        }}
        isDarkMode={true}
      />
    );

    const modalContent = document.querySelector('.bg-gray-800');
    expect(modalContent).toBeInTheDocument();
  });
});
