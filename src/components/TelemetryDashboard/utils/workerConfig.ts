// In development and production, we use a relative path
const defaultWorkerUrl = './dataProcessor.worker.ts';

export const getWorkerUrl = () => {
  // In test environment, return mock URL
  if (process.env.NODE_ENV === 'test') {
    return 'mock-worker-url';
  }

  // In development/production, use the default worker URL
  return defaultWorkerUrl;
};
