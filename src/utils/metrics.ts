// Nuovo file: utils/metrics.ts
export const performanceMetrics = {
  renderTime: new Map<string, number>(),
  interactionTime: new Map<string, number>(),
  
  startMeasure: (id: string) => {
    performance.mark(`${id}-start`);
  },
  
  endMeasure: (id: string) => {
    performance.mark(`${id}-end`);
    performance.measure(id, `${id}-start`, `${id}-end`);
    
    const measures = performance.getEntriesByName(id);
    const latestMeasure = measures[measures.length - 1];
    performanceMetrics.renderTime.set(id, latestMeasure.duration);
    
    performance.clearMarks();
    performance.clearMeasures();
  }
};