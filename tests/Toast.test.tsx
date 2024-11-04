import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast, ToastManager, useToast } from '../src/components/StoryMap/components/Toast';
import { soundManager } from '../src/utils/soundManager';

// Mock soundManager
jest.mock('../src/utils/soundManager', () => ({
  soundManager: {
    playSound: jest.fn().mockResolvedValue(undefined),
    setEnabled: jest.fn(),
    setVolume: jest.fn(),
    getConfig: jest.fn().mockReturnValue({ enabled: true, volume: 0.5 })
  }
}));

// Mock createPortal to render content directly
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock timers for testing animations and timeouts
beforeEach(() => {
  jest.useFakeTimers();
  (soundManager.playSound as jest.Mock).mockClear();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Toast Component', () => {
  const defaultProps = {
    message: 'Test message',
    type: 'info' as const,
    onClose: jest.fn(),
  };

  it('renders with default props', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-gray-800');
  });

  it('renders different types with correct styles', () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    const colorClasses = {
      success: 'bg-green-800',
      error: 'bg-red-800',
      warning: 'bg-yellow-800',
      info: 'bg-gray-800',
    };

    types.forEach(type => {
      const { container, rerender } = render(
        <Toast {...defaultProps} type={type} />
      );
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass(colorClasses[type]);
      rerender(<></>); // Clean up before next iteration
    });
  });

  it('plays appropriate sounds for different types', () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    
    types.forEach(type => {
      render(<Toast {...defaultProps} type={type} />);
      expect(soundManager.playSound).toHaveBeenCalledWith(type);
      (soundManager.playSound as jest.Mock).mockClear();
    });
  });

  it('plays critical sound for critical priority', () => {
    render(<Toast {...defaultProps} priority="critical" />);
    expect(soundManager.playSound).toHaveBeenCalledWith('critical');
  });

  it('handles different priority levels', () => {
    const priorities = ['low', 'normal', 'high', 'critical'] as const;
    const durations = {
      low: 2000,
      normal: 3000,
      high: 5000,
      critical: 0,
    };

    priorities.forEach(priority => {
      const onClose = jest.fn();
      render(
        <Toast {...defaultProps} priority={priority} onClose={onClose} />
      );

      // Advance timer past the expected duration
      act(() => {
        jest.advanceTimersByTime(durations[priority] + 1000);
      });

      // Critical and persistent notifications should not auto-close
      if (priority === 'critical') {
        expect(onClose).not.toHaveBeenCalled();
      } else {
        expect(onClose).toHaveBeenCalled();
      }

      // Clean up
      onClose.mockClear();
    });
  });

  it('handles persistent notifications', () => {
    const onClose = jest.fn();
    render(
      <Toast {...defaultProps} persistent={true} onClose={onClose} />
    );

    // Advance timer significantly
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Persistent notifications should not auto-close
    expect(onClose).not.toHaveBeenCalled();
  });

  it('prevents click-to-dismiss for critical notifications', () => {
    const onClose = jest.fn();
    render(
      <Toast {...defaultProps} priority="critical" onClose={onClose} />
    );

    const toast = screen.getByRole('alert');
    fireEvent.click(toast);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Close notification')).not.toBeInTheDocument();
  });

  it('maintains proper z-index based on priority', () => {
    const { container } = render(
      <Toast {...defaultProps} priority="high" index={0} />
    );
    const toast = screen.getByRole('alert');
    expect(toast).toHaveStyle({ zIndex: '10019' }); // 9999 - 0 + 20
  });
});

describe('ToastManager Component', () => {
  const messages = [
    { id: 1, message: 'Low priority', type: 'info' as const, priority: 'low' as const },
    { id: 2, message: 'Normal priority', type: 'success' as const, priority: 'normal' as const },
    { id: 3, message: 'High priority', type: 'error' as const, priority: 'high' as const },
    { id: 4, message: 'Critical message', type: 'warning' as const, priority: 'critical' as const },
  ];

  it('sorts messages by priority', () => {
    render(
      <ToastManager
        messages={[...messages].reverse()} // Reverse to ensure sorting works
        onMessageComplete={jest.fn()}
      />
    );
    
    const toasts = screen.getAllByRole('alert');
    // Messages should be sorted by priority (critical -> high -> normal)
    expect(toasts[0]).toHaveTextContent('Critical message');
    expect(toasts[1]).toHaveTextContent('High priority');
    expect(toasts[2]).toHaveTextContent('Normal priority');
  });

  it('maintains priority-based z-index ordering', () => {
    render(
      <ToastManager
        messages={messages.slice(0, 2)}
        onMessageComplete={jest.fn()}
      />
    );
    
    const toasts = screen.getAllByRole('alert');
    const firstToastZIndex = window.getComputedStyle(toasts[0]).zIndex;
    const secondToastZIndex = window.getComputedStyle(toasts[1]).zIndex;
    expect(Number(firstToastZIndex)).toBeGreaterThan(Number(secondToastZIndex));
  });

  it('plays sounds for each notification in order', () => {
    render(
      <ToastManager
        messages={messages}
        onMessageComplete={jest.fn()}
      />
    );

    // Should play sounds in priority order
    const calls = (soundManager.playSound as jest.Mock).mock.calls;
    expect(calls[0][0]).toBe('critical'); // Critical message
    expect(calls[1][0]).toBe('error'); // High priority
    expect(calls[2][0]).toBe('success'); // Normal priority
  });
});

describe('useToast Hook', () => {
  const TestComponent = () => {
    const { messages, showToast, removeMessage } = useToast();
    return (
      <div>
        <button onClick={() => showToast('Test message', 'success', 'high')}>
          Show Toast
        </button>
        <button onClick={() => showToast('Critical message', 'error', 'critical', true)}>
          Show Critical
        </button>
        <ToastManager
          messages={messages}
          onMessageComplete={removeMessage}
        />
      </div>
    );
  };

  it('handles priority and persistence', () => {
    render(<TestComponent />);
    
    // Show high priority toast
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(soundManager.playSound).toHaveBeenCalledWith('success');
    
    // Show critical persistent toast
    fireEvent.click(screen.getByText('Show Critical'));
    const criticalToast = screen.getByText('Critical message');
    expect(criticalToast).toBeInTheDocument();
    expect(soundManager.playSound).toHaveBeenCalledWith('critical');
    
    // Advance time
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    
    // High priority toast should be gone, critical should remain
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    expect(screen.getByText('Critical message')).toBeInTheDocument();
  });
});
