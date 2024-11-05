import { CircuitBreaker, CircuitState } from '../src/components/TelemetryDashboard/utils/circuitBreaker';

// Mock worker pool
jest.mock('../src/components/TelemetryDashboard/utils/workerPool', () => ({
  getWorkerPool: jest.fn().mockReturnValue({
    getStats: jest.fn().mockReturnValue({
      activeWorkers: 0,
      performance: {
        currentMemoryUsage: 0,
        totalTasksProcessed: 0,
        failedTasks: 0
      }
    })
  })
}));

describe('CircuitBreaker', () => {
  let circuitBreaker: any;
  
  beforeEach(() => {
    // Reset the singleton instance before each test
    (CircuitBreaker as any).instance = undefined;
    circuitBreaker = CircuitBreaker.getInstance();
    jest.useFakeTimers();
  });

  afterEach(() => {
    circuitBreaker.dispose();
    jest.useRealTimers();
  });

  describe('State Management', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should transition to OPEN state on failure threshold', () => {
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should transition to HALF_OPEN state after reset timeout', () => {
      circuitBreaker.tripBreaker();
      jest.advanceTimersByTime(30000); // Reset timeout
      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });

    it('should return to CLOSED state on success in HALF_OPEN state', () => {
      circuitBreaker.tripBreaker();
      jest.advanceTimersByTime(30000);
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('Health Monitoring', () => {
    it('should monitor memory usage', async () => {
      const workerPool = require('../src/components/TelemetryDashboard/utils/workerPool').getWorkerPool();
      workerPool.getStats.mockReturnValue({
        activeWorkers: 0,
        performance: {
          currentMemoryUsage: 400 * 1024 * 1024, // Exceeds threshold
          totalTasksProcessed: 0,
          failedTasks: 0
        }
      });

      await circuitBreaker.checkHealth();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should monitor active tasks', async () => {
      const workerPool = require('../src/components/TelemetryDashboard/utils/workerPool').getWorkerPool();
      workerPool.getStats.mockReturnValue({
        activeWorkers: 15, // Exceeds threshold
        performance: {
          currentMemoryUsage: 0,
          totalTasksProcessed: 0,
          failedTasks: 0
        }
      });

      await circuitBreaker.checkHealth();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should monitor failure rate', async () => {
      const workerPool = require('../src/components/TelemetryDashboard/utils/workerPool').getWorkerPool();
      workerPool.getStats.mockReturnValue({
        activeWorkers: 0,
        performance: {
          currentMemoryUsage: 0,
          totalTasksProcessed: 10,
          failedTasks: 8 // 80% failure rate
        }
      });

      circuitBreaker.recordFailure(); // Add recent failure
      await circuitBreaker.checkHealth();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Event Handling', () => {
    it('should notify subscribers of state changes', () => {
      const stateChangeHandler = jest.fn();
      circuitBreaker.onStateChange(stateChangeHandler);
      
      circuitBreaker.tripBreaker();
      expect(stateChangeHandler).toHaveBeenCalledWith(CircuitState.OPEN);
      
      jest.advanceTimersByTime(30000);
      expect(stateChangeHandler).toHaveBeenCalledWith(CircuitState.HALF_OPEN);
    });

    it('should track failure metrics', () => {
      circuitBreaker.recordFailure();
      const metrics = circuitBreaker.getMetrics();
      
      expect(metrics.failures).toBe(1);
      expect(metrics.lastFailureTime).toBeDefined();
    });

    it('should reset metrics on successful recovery', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordSuccess();
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failures).toBe(1);
    });
  });

  describe('Execution Control', () => {
    it('should allow execution in CLOSED state', () => {
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should prevent execution in OPEN state', () => {
      circuitBreaker.tripBreaker();
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('should allow limited execution in HALF_OPEN state', () => {
      circuitBreaker.tripBreaker();
      jest.advanceTimersByTime(30000);
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe('Resource Management', () => {
    it('should clean up resources on disposal', () => {
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
      
      circuitBreaker.tripBreaker(); // Set up a reset timer
      circuitBreaker.dispose();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should handle multiple dispose calls safely', () => {
      expect(() => {
        circuitBreaker.dispose();
        circuitBreaker.dispose();
      }).not.toThrow();
    });
  });
});
