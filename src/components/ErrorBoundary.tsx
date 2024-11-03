import React, { Component, ErrorInfo, ReactNode } from 'react';
import { saveProject, getProjects } from '../utils/storage';
import { createBackup } from '../utils/autoBackup';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error
    console.error('Error caught by boundary:', error, errorInfo);

    // Attempt to save current state
    this.saveCurrentState();

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private async saveCurrentState() {
    try {
      // Get current projects
      const projects = await getProjects();
      
      // Create emergency backup
      await createBackup();

      // Save each project with error flag
      for (const project of projects) {
        await saveProject({
          ...project,
          lastError: {
            timestamp: new Date().toISOString(),
            message: this.state.error?.message || 'Unknown error',
            stack: this.state.error?.stack || '',
            componentStack: this.state.errorInfo?.componentStack || ''
          }
        });
      }
    } catch (backupError) {
      console.error('Failed to save error state:', backupError);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <div className="mb-4 text-gray-700 dark:text-gray-300">
              <p>An error occurred in the application. Your work has been automatically saved.</p>
              <p className="mt-2">Error details:</p>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-sm">
                {this.state.error?.message}
              </pre>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
