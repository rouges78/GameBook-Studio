import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { KeyboardShortcutsHelp } from '../src/components/StoryMap/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '../src/components/StoryMap/hooks/useKeyboardShortcuts';

// Mock the useKeyboardShortcuts hook
jest.mock('../src/components/StoryMap/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn()
}));

describe('KeyboardShortcutsHelp Component', () => {
  beforeEach(() => {
    // Reset any mocks and clear the DOM
    jest.clearAllMocks();
    document.body.innerHTML = '';

    // Setup default mock implementation
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({
      shortcuts: [
        { key: 'Ctrl + +', description: 'Zoom in' },
        { key: 'Ctrl + -', description: 'Zoom out' },
        { key: 'Ctrl + 0', description: 'Reset zoom' },
        { key: 'G', description: 'Toggle grid' },
        { key: 'Ctrl + S', description: 'Save map' }
      ]
    });
  });

  test('renders help button', () => {
    render(<KeyboardShortcutsHelp />);
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    expect(helpButton).toBeInTheDocument();
  });

  test('shows shortcuts modal when clicked', () => {
    render(<KeyboardShortcutsHelp />);
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    
    fireEvent.click(helpButton);
    
    // Check if modal is shown
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    
    // Check for shortcuts
    expect(screen.getByText('Zoom in')).toBeInTheDocument();
    expect(screen.getByText('Zoom out')).toBeInTheDocument();
    expect(screen.getByText('Reset zoom')).toBeInTheDocument();
    expect(screen.getByText('Toggle grid')).toBeInTheDocument();
    expect(screen.getByText('Save map')).toBeInTheDocument();
  });

  test('closes modal when backdrop is clicked', () => {
    render(<KeyboardShortcutsHelp />);
    
    // Open modal
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    fireEvent.click(helpButton);
    
    // Click backdrop
    const backdrop = screen.getByTestId('backdrop');
    fireEvent.click(backdrop);
    
    // Modal should be removed from the document
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    const customClass = 'custom-class';
    render(<KeyboardShortcutsHelp className={customClass} />);
    
    const container = screen.getByTestId('shortcuts-container');
    expect(container.className).toContain(customClass);
  });

  test('renders keyboard shortcuts with correct styling', () => {
    render(<KeyboardShortcutsHelp />);
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    fireEvent.click(helpButton);
    
    const shortcuts = screen.getAllByRole('listitem');
    shortcuts.forEach(shortcut => {
      const kbd = shortcut.querySelector('kbd');
      expect(kbd?.className).toContain('px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono');
    });
  });

  test('initializes useKeyboardShortcuts with disabled shortcuts', () => {
    render(<KeyboardShortcutsHelp />);
    
    expect(useKeyboardShortcuts).toHaveBeenCalledWith({
      onZoomIn: expect.any(Function),
      onZoomOut: expect.any(Function),
      onZoomReset: expect.any(Function),
      onToggleGrid: expect.any(Function),
      onToggleDragMode: expect.any(Function),
      onSave: expect.any(Function),
      onEscape: expect.any(Function),
      isEnabled: false
    });
  });

  test('renders help text for toggling menu', () => {
    render(<KeyboardShortcutsHelp />);
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    fireEvent.click(helpButton);
    
    expect(screen.getByText(/press/i)).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText(/to toggle this help menu/i)).toBeInTheDocument();
  });

  test('toggles modal visibility on button click', () => {
    render(<KeyboardShortcutsHelp />);
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    
    // Open modal
    fireEvent.click(helpButton);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(helpButton);
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  test('renders icon in help button', () => {
    render(<KeyboardShortcutsHelp />);
    const helpButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
    const icon = helpButton.querySelector('svg');
    
    expect(icon).toBeInTheDocument();
    expect(icon?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(icon?.className).toContain('w-5 h-5');
  });
});
