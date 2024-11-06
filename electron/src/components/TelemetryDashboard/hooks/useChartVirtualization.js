"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChartVirtualization = void 0;
const react_1 = require("react");
const useChartVirtualization = ({ data, width, pointWidth = 50, overscanCount = 5 }) => {
    const [state, setState] = (0, react_1.useState)({
        startIndex: 0,
        endIndex: Math.ceil(width / pointWidth),
        scrollLeft: 0,
        scale: 1
    });
    const containerRef = (0, react_1.useRef)(null);
    const scrolling = (0, react_1.useRef)(false);
    const lastScrollTime = (0, react_1.useRef)(0);
    const animationFrame = (0, react_1.useRef)();
    // Calculate total content width
    const totalWidth = (0, react_1.useMemo)(() => {
        return data.length * pointWidth * state.scale;
    }, [data.length, pointWidth, state.scale]);
    // Calculate visible window indices
    const calculateVisibleIndices = (0, react_1.useCallback)((scrollLeft, scale) => {
        const effectivePointWidth = pointWidth * scale;
        const start = Math.max(0, Math.floor(scrollLeft / effectivePointWidth) - overscanCount);
        const end = Math.min(data.length, Math.ceil((scrollLeft + width) / effectivePointWidth) + overscanCount);
        return { start, end };
    }, [data.length, width, pointWidth, overscanCount]);
    // Handle scroll
    const handleScroll = (0, react_1.useCallback)((scrollLeft) => {
        scrolling.current = true;
        lastScrollTime.current = Date.now();
        const { start, end } = calculateVisibleIndices(scrollLeft, state.scale);
        setState(prev => ({
            ...prev,
            startIndex: start,
            endIndex: end,
            scrollLeft
        }));
        // Debounce scroll end detection
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
        animationFrame.current = requestAnimationFrame(() => {
            if (Date.now() - lastScrollTime.current > 100) {
                scrolling.current = false;
            }
        });
    }, [calculateVisibleIndices, state.scale]);
    // Handle zoom
    const handleZoom = (0, react_1.useCallback)((scale) => {
        const newScale = Math.max(0.1, Math.min(5, scale));
        const { start, end } = calculateVisibleIndices(state.scrollLeft, newScale);
        setState(prev => ({
            ...prev,
            scale: newScale,
            startIndex: start,
            endIndex: end
        }));
    }, [calculateVisibleIndices, state.scrollLeft]);
    // Get visible data slice with virtual indices
    const visibleData = (0, react_1.useMemo)(() => {
        const slice = data.slice(state.startIndex, state.endIndex);
        return slice.map((item, index) => ({
            ...item,
            virtualIndex: state.startIndex + index
        }));
    }, [data, state.startIndex, state.endIndex]);
    // Cleanup
    (0, react_1.useEffect)(() => {
        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, []);
    return {
        containerRef,
        visibleData,
        totalWidth,
        scrollLeft: state.scrollLeft,
        scale: state.scale,
        handleScroll,
        handleZoom
    };
};
exports.useChartVirtualization = useChartVirtualization;
