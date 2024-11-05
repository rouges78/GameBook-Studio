import { useState, useEffect } from 'react';
import { memoryAlertManager, MemoryAlert, MemoryAlertLevel } from '../utils/memoryAlertManager';

export function useMemoryAlerts() {
  const [alerts, setAlerts] = useState<MemoryAlert[]>([]);
  const [currentMemoryStatus, setCurrentMemoryStatus] = useState<MemoryAlertLevel>(MemoryAlertLevel.NORMAL);

  useEffect(() => {
    // Initial load of alert history
    setAlerts(memoryAlertManager.getAlertHistory());
    setCurrentMemoryStatus(memoryAlertManager.getCurrentMemoryStatus());

    // Set up callback for new alerts
    const handleAlert = (alert: MemoryAlert) => {
      setAlerts(prevAlerts => [alert, ...prevAlerts].slice(0, 50));
      setCurrentMemoryStatus(alert.level);
    };

    memoryAlertManager.setAlertCallback(handleAlert);

    // Cleanup
    return () => {
      memoryAlertManager.setAlertCallback(() => {});
    };
  }, []);

  const clearAlertHistory = () => {
    memoryAlertManager.clearAlertHistory();
    setAlerts([]);
  };

  return {
    alerts,
    currentMemoryStatus,
    clearAlertHistory
  };
}
