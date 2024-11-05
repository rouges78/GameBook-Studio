export default class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }
  terminate() {}
}

export const workerData = {
  url: 'mock-worker-url'
};
