export class MockAudio {
  src: string;
  preload: string = '';
  volume: number = 1;
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor(src: string) {
    this.src = src;
  }

  addEventListener(type: string, callback: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  removeEventListener(type: string, callback: EventListener): void {
    this.listeners.get(type)?.delete(callback);
  }

  dispatchEvent(event: Event): boolean {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
    return true;
  }

  load(): void {
    // Simulate successful loading
    setTimeout(() => {
      this.dispatchEvent(new Event('canplaythrough'));
    }, 0);
  }

  play(): Promise<void> {
    return Promise.resolve();
  }
}

// Create a mock implementation
const mockAudio = jest.fn().mockImplementation((src: string) => new MockAudio(src));

// Export the mock class and constructor
export { mockAudio as Audio };
