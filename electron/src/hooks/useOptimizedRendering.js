"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebounce = exports.useSkipFirstRender = void 0;
const react_1 = require("react");
const useSkipFirstRender = (callback, deps) => {
    const firstRender = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        callback();
    }, deps);
};
exports.useSkipFirstRender = useSkipFirstRender;
const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = (0, react_1.useState)(value);
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
};
exports.useDebounce = useDebounce;
