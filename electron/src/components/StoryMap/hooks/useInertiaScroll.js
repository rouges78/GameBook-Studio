"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInertiaScroll = void 0;
const react_1 = require("react");
const useInertiaScroll = (onScroll, options = {}) => {
    const { friction = 0.95, // Friction coefficient (lower = more friction)
    minVelocity = 0.1 // Minimum velocity before stopping
     } = options;
    const velocityRef = (0, react_1.useRef)({ x: 0, y: 0 });
    const lastPositionRef = (0, react_1.useRef)(null);
    const lastTimeRef = (0, react_1.useRef)(0);
    const animationFrameRef = (0, react_1.useRef)();
    const updateVelocity = (0, react_1.useCallback)((currentPosition) => {
        if (!lastPositionRef.current || !lastTimeRef.current)
            return;
        const now = performance.now();
        const deltaTime = now - lastTimeRef.current;
        if (deltaTime === 0)
            return;
        // Calculate velocity in pixels per millisecond
        velocityRef.current = {
            x: (currentPosition.x - lastPositionRef.current.x) / deltaTime,
            y: (currentPosition.y - lastPositionRef.current.y) / deltaTime
        };
        lastPositionRef.current = currentPosition;
        lastTimeRef.current = now;
    }, []);
    const startTracking = (0, react_1.useCallback)((position) => {
        lastPositionRef.current = position;
        lastTimeRef.current = performance.now();
        velocityRef.current = { x: 0, y: 0 };
        // Cancel any ongoing animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);
    const updateTracking = (0, react_1.useCallback)((position) => {
        updateVelocity(position);
    }, [updateVelocity]);
    const stopTracking = (0, react_1.useCallback)(() => {
        if (!velocityRef.current)
            return;
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
exports.useInertiaScroll = useInertiaScroll;
