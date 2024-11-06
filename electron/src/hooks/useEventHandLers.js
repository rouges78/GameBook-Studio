"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThrottledEventHandler = void 0;
// Nuovo file: hooks/useEventHandlers.ts
const react_1 = require("react");
const useThrottledEventHandler = (handler, delay = 150) => {
    const lastRun = (0, react_1.useRef)(Date.now());
    return (0, react_1.useCallback)((...args) => {
        const now = Date.now();
        if (now - lastRun.current >= delay) {
            handler(...args);
            lastRun.current = now;
        }
    }, [handler, delay]);
};
exports.useThrottledEventHandler = useThrottledEventHandler;
