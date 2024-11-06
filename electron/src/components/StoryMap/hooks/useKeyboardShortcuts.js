"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardShortcuts = void 0;
const react_1 = require("react");
const useKeyboardShortcuts = ({ onZoomIn, onZoomOut, onZoomReset, onToggleGrid, onToggleDragMode, onSave, onEscape, isEnabled = true }) => {
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        // Don't handle shortcuts if disabled or if user is typing in an input
        if (!isEnabled || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }
        // Handle key combinations
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
        if (ctrlOrCmd) {
            switch (event.key.toLowerCase()) {
                case '=':
                case '+':
                    event.preventDefault();
                    onZoomIn();
                    break;
                case '-':
                    event.preventDefault();
                    onZoomOut();
                    break;
                case '0':
                    event.preventDefault();
                    onZoomReset();
                    break;
                case 's':
                    event.preventDefault();
                    onSave();
                    break;
                case 'd':
                    event.preventDefault();
                    onToggleDragMode();
                    break;
            }
            return;
        }
        // Handle single keys
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                onEscape();
                break;
            case 'g':
                event.preventDefault();
                onToggleGrid();
                break;
        }
    }, [
        isEnabled,
        onZoomIn,
        onZoomOut,
        onZoomReset,
        onToggleGrid,
        onToggleDragMode,
        onSave,
        onEscape
    ]);
    (0, react_1.useEffect)(() => {
        if (isEnabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isEnabled, handleKeyDown]);
    // Return keyboard shortcut information for UI display
    return {
        shortcuts: [
            { key: '⌘/Ctrl + +', description: 'Zoom in' },
            { key: '⌘/Ctrl + -', description: 'Zoom out' },
            { key: '⌘/Ctrl + 0', description: 'Reset zoom' },
            { key: '⌘/Ctrl + S', description: 'Save map' },
            { key: '⌘/Ctrl + D', description: 'Toggle drag mode' },
            { key: 'G', description: 'Toggle grid' },
            { key: 'Esc', description: 'Close map' }
        ]
    };
};
exports.useKeyboardShortcuts = useKeyboardShortcuts;
