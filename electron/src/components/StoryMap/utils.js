"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBackupTime = exports.getConnectionPath = exports.getNodeColor = void 0;
const getNodeColor = (type, isLocked) => {
    const baseColors = {
        normale: '#7B8CDE', // Blue
        nodo: '#F4B860', // Yellow
        finale: '#95B8A4' // Green
    };
    const lightColors = {
        normale: '#A0B0FF', // Light Blue
        nodo: '#FFE0A0', // Light Yellow
        finale: '#B0FFB0' // Light Green
    };
    return isLocked ? lightColors[type] : baseColors[type];
};
exports.getNodeColor = getNodeColor;
const getConnectionPath = (source, target, useCurvedLines) => {
    if (useCurvedLines) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const cp1x = source.x + dx * 0.25;
        const cp1y = source.y;
        const cp2x = source.x + dx * 0.75;
        const cp2y = target.y;
        return `M ${source.x},${source.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${target.x},${target.y}`;
    }
    else {
        return `M ${source.x},${source.y} L ${target.x},${target.y}`;
    }
};
exports.getConnectionPath = getConnectionPath;
const formatBackupTime = (date) => {
    return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.formatBackupTime = formatBackupTime;
