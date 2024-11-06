"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertEventToChartData = exports.PIE_CHART_COLORS = void 0;
exports.PIE_CHART_COLORS = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF'
];
// Helper function to convert TelemetryEvent to chart data format
const convertEventToChartData = (event) => ({
    date: new Date(event.timestamp).toISOString().split('T')[0],
    category: event.category,
    action: event.action,
    value: event.value || 1,
    metadata: event.metadata
});
exports.convertEventToChartData = convertEventToChartData;
