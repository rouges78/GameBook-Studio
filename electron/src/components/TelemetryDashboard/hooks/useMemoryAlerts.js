"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMemoryAlerts = useMemoryAlerts;
const react_1 = require("react");
const memoryAlertManager_1 = require("../utils/memoryAlertManager");
function useMemoryAlerts() {
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    const [currentMemoryStatus, setCurrentMemoryStatus] = (0, react_1.useState)({
        level: memoryAlertManager_1.MemoryAlertLevel.NORMAL,
        percentage: 0,
        usage: 0
    });
    const [thresholds, setThresholds] = (0, react_1.useState)({
        warning: 60,
        critical: 70,
        maximum: 80
    });
    (0, react_1.useEffect)(() => {
        // Initial load of alert history and status
        setAlerts(memoryAlertManager_1.memoryAlertManager.getAlertHistory());
        setCurrentMemoryStatus(memoryAlertManager_1.memoryAlertManager.getCurrentMemoryStatus());
        setThresholds(memoryAlertManager_1.memoryAlertManager.getMemoryThresholds());
        // Set up callback for new alerts
        const handleAlert = (alert) => {
            setAlerts(prevAlerts => [alert, ...prevAlerts].slice(0, 50));
            setCurrentMemoryStatus({
                level: alert.level,
                percentage: alert.memoryPercentage,
                usage: alert.memoryUsage
            });
        };
        memoryAlertManager_1.memoryAlertManager.setAlertCallback(handleAlert);
        // Update memory status periodically
        const statusInterval = setInterval(() => {
            setCurrentMemoryStatus(memoryAlertManager_1.memoryAlertManager.getCurrentMemoryStatus());
        }, 15000);
        // Cleanup
        return () => {
            memoryAlertManager_1.memoryAlertManager.setAlertCallback(() => { });
            clearInterval(statusInterval);
        };
    }, []);
    const clearAlertHistory = () => {
        memoryAlertManager_1.memoryAlertManager.clearAlertHistory();
        setAlerts([]);
    };
    return {
        alerts,
        currentMemoryStatus,
        thresholds,
        clearAlertHistory
    };
}
