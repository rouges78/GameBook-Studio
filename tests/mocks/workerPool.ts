export const mockWorkerPool = {
  getStats: jest.fn().mockReturnValue({
    totalWorkers: 4,
    activeWorkers: 0,
    queuedTasks: 0,
    performance: {
      averageExecutionTime: 0,
      totalTasksProcessed: 0,
      failedTasks: 0,
      successRate: 100,
      peakMemoryUsage: 100 * 1024 * 1024,
      currentMemoryUsage: 100 * 1024 * 1024,
      taskHistory: []
    }
  })
};

export const getWorkerPool = jest.fn().mockReturnValue(mockWorkerPool);
