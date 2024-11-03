// Nuovo file: hooks/useEventHandlers.ts
import { useCallback, useRef } from 'react';

export const useThrottledEventHandler = <T extends (...args: any[]) => void>(
  handler: T,
  delay: number = 150
) => {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      handler(...args);
      lastRun.current = now;
    }
  }, [handler, delay]);
};