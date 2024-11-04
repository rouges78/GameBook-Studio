import { useCallback, useRef } from 'react';

interface ScrollVelocity {
  x: number;
  y: number;
}

interface InertiaScrollOptions {
  friction?: number;
  minVelocity?: number;
}

export const useInertiaScroll = (
  onScroll: (dx: number, dy: number) => void,
  options: InertiaScrollOptions = {}
) => {
  const {
    friction = 0.95, // Friction coefficient (lower = more friction)
    minVelocity = 0.1 // Minimum velocity before stopping
  } = options;

  const velocityRef = useRef<ScrollVelocity>({ x: 0, y: 0 });
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  const updateVelocity = useCallback((currentPosition: { x: number; y: number }) => {
    if (!lastPositionRef.current || !lastTimeRef.current) return;

    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    if (deltaTime === 0) return;

    // Calculate velocity in pixels per millisecond
    velocityRef.current = {
      x: (currentPosition.x - lastPositionRef.current.x) / deltaTime,
      y: (currentPosition.y - lastPositionRef.current.y) / deltaTime
    };

    lastPositionRef.current = currentPosition;
    lastTimeRef.current = now;
  }, []);

  const startTracking = useCallback((position: { x: number; y: number }) => {
    lastPositionRef.current = position;
    lastTimeRef.current = performance.now();
    velocityRef.current = { x: 0, y: 0 };

    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const updateTracking = useCallback((position: { x: number; y: number }) => {
    updateVelocity(position);
  }, [updateVelocity]);

  const stopTracking = useCallback(() => {
    if (!velocityRef.current) return;

    const animate = () => {
      const velocity = velocityRef.current;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

      if (speed < minVelocity) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      // Apply friction
      velocityRef.current = {
        x: velocity.x * friction,
        y: velocity.y * friction
      };

      // Calculate the distance to move this frame
      const dx = velocity.x * 16; // Assuming 60fps (16ms per frame)
      const dy = velocity.y * 16;

      onScroll(dx, dy);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [friction, minVelocity, onScroll]);

  return {
    startTracking,
    updateTracking,
    stopTracking
  };
};
