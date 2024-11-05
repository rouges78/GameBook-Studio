import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorAnalysis } from '../src/components/TelemetryDashboard/components/ErrorAnalysis';
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

const mockUpdateErrors = {
  total: 15,
  byType: {
    'network': 10,
    'validation': 5
  },
  averageRetries: 2.5
};

const mockRawEvents: TelemetryEvent[] = [
  {
    category: 'error',
    action: 'network_failure',
    label: 'API Request Failed',
    timestamp: 1704067200000,
    appVersion: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    metadata: {
      pattern: 'Network Error',
      statusCode: 500
    }
  }
];

describe('ErrorAnalysis', () => {
  it('renders error trends chart', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Error Trends')).toBeInTheDocument();
    expect(screen.getByText('Analyze Trends')).toBeInTheDocument();
  });

  it('renders error impact analysis', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Error Impact Analysis')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('renders update errors summary', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('Update Errors Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Errors')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
  });

  it('opens modal when clicking analyze trends', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    fireEvent.click(screen.getByText('Analyze Trends'));
    expect(screen.getByText('Error Pattern Analysis')).toBeInTheDocument();
  });

  it('opens modal when clicking view details', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    fireEvent.click(screen.getByText('View Details'));
    expect(screen.getByText('Error Pattern Analysis')).toBeInTheDocument();
  });

  it('opens modal when clicking error type', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    fireEvent.click(screen.getByText('network:'));
    expect(screen.getByText('Error Pattern Analysis')).toBeInTheDocument();
  });

  it('closes modal when clicking close button', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Analyze Trends'));
    expect(screen.getByText('Error Pattern Analysis')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByText('Pattern Details')).not.toBeInTheDocument();
  });

  it('handles dark mode styling', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={true}
      />
    );

    const darkModeElements = document.querySelectorAll('.bg-gray-700');
    expect(darkModeElements.length).toBeGreaterThan(0);
  });

  it('filters raw events for selected pattern', () => {
    render(
      <ErrorAnalysis
        errorPatterns={mockErrorPatterns}
        updateErrors={mockUpdateErrors}
        rawEvents={mockRawEvents}
        isDarkMode={false}
      />
    );

    // Click on a pattern that matches the raw event
    fireEvent.click(screen.getByText('Network Error'));
    expect(screen.getByText('1.0.0')).toBeInTheDocument(); // Version from raw event
    expect(screen.getByText('win32')).toBeInTheDocument(); // Platform from raw event
  });
});
