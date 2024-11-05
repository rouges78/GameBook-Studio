import { useState, useEffect } from 'react';
import { memoryAlertManager, MemoryAlert, MemoryAlertLevel } from '../utils/memoryAlertManager';

interface MemoryStatus {
  level: MemoryAlertLevel;
  percentage: number;
  usage: number;
}

export function useMemoryAlerts() {
  const [alerts, setAlerts] = useState<MemoryAlert[]>([]);
  const [currentMemoryStatus, setCurrentMemoryStatus] = useState<MemoryStatus>({
    level: MemoryAlertLevel.NORMAL,
    percentage: 0,
    usage: 0
  });
  const [thresholds, setThresholds] = useState({
    warning: 60,
    critical: 70,
    maximum: 80
  });

  useEffect(() => {
    // Initial load of alert history and status
    setAlerts(memoryAlertManager.getAlertHistory());
    setCurrentMemoryStatus(memoryAlertManager.getCurrentMemoryStatus());
    setThresholds(memoryAlertManager.getMemoryThresholds());

    // Set up callback for new alerts
    const handleAlert = (alert: MemoryAlert) => {
      setAlerts(prevAlerts => [alert, ...prevAlerts].slice(0, 50));
      setCurrentMemoryStatus({
        level: alert.level,
        percentage: alert.memoryPercentage,
        usage: alert.memoryUsage
      });
    };

    memoryAlertManager.setAlertCallback(handleAlert);

    // Update memory status periodically
    const statusInterval = setInterval(() => {
      setCurrentMemoryStatus(memoryAlertManager.getCurrentMemoryStatus());
    }, 15000);

    // Cleanup
    return () => {
      memoryAlertManager.setAlertCallback(() => {});
      clearInterval(statusInterval);
    };
  }, []);

  const clearAlertHistory = () => {
    memoryAlertManager.clearAlertHistory();
    setAlerts([]);
  };

  return {
    alerts,
    currentMemoryStatus,
    thresholds,
    clearAlertHistory
  };
}
