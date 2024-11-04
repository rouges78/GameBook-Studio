import React from 'react';
import { render, screen } from '@testing-library/react';
import { UpdateErrorBoundary } from '../src/components/UpdateNotification/ErrorBoundary';

// Mock console.error to avoid test output noise
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('UpdateErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <UpdateErrorBoundary>
        <div>Test Content</div>
      </UpdateErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <UpdateErrorBoundary>
        <ThrowError />
      </UpdateErrorBoundary>
    );

    expect(screen.getByText('Update Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders fallback message when error has no message', () => {
    const ThrowErrorWithoutMessage = () => {
      throw new Error();
    };

    render(
      <UpdateErrorBoundary>
        <ThrowErrorWithoutMessage />
      </UpdateErrorBoundary>
    );

    expect(screen.getByText('An error occurred while checking for updates')).toBeInTheDocument();
  });
});
