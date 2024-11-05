import React from 'react';
import { render, screen } from '@testing-library/react';
import { VirtualizedErrorTable } from '../src/components/TelemetryDashboard/components/VirtualizedErrorTable';
import type { TelemetryEvent } from '../src/types/electron';

// Mock the react-window FixedSizeList component
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }: any) => {
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 10); i++) {
      items.push(children({ index: i, style: {}, data: itemData }));
    }
    return <div data-testid="virtual-list">{items}</div>;
  }
}));

describe('VirtualizedErrorTable', () => {
  const mockEvents: TelemetryEvent[] = [
    {
      timestamp: Date.parse('2024-01-01T10:00:00Z'),
      appVersion: '1.0.0',
      platform: 'win32',
      arch: 'x64',
      category: 'error',
      action: 'test',
      metadata: {}
    },
    {
      timestamp: Date.parse('2024-01-02T11:00:00Z'),
      appVersion: '1.0.1',
      platform: 'darwin',
      arch: 'arm64',
      category: 'error',
      action: 'test',
      metadata: {}
    }
  ];

  it('renders table headers correctly', () => {
    render(<VirtualizedErrorTable events={mockEvents} isDarkMode={false} />);
    
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('renders event data correctly', () => {
    render(<VirtualizedErrorTable events={mockEvents} isDarkMode={false} />);
    
    // Check if the first event data is rendered
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('win32')).toBeInTheDocument();

    // Check if the second event data is rendered
    expect(screen.getByText(/2024-01-02/)).toBeInTheDocument();
    expect(screen.getByText('1.0.1')).toBeInTheDocument();
    expect(screen.getByText('darwin')).toBeInTheDocument();
  });

  it('applies dark mode styles correctly', () => {
    const { container } = render(<VirtualizedErrorTable events={mockEvents} isDarkMode={true} />);
    
    // Check if dark mode classes are applied
    expect(container.firstChild).toHaveClass('border-gray-700');
  });

  it('handles empty events array', () => {
    render(<VirtualizedErrorTable events={[]} isDarkMode={false} />);
    
    // Headers should still be rendered
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();

    // Virtual list should be rendered with 0 items
    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(0);
  });
});
