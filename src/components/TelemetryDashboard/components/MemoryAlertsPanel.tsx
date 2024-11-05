import React from 'react';
import { useMemoryAlerts } from '../hooks/useMemoryAlerts';
import { MemoryAlertLevel } from '../utils/memoryAlertManager';

export const MemoryAlertsPanel: React.FC = () => {
  const { alerts, currentMemoryStatus, clearAlertHistory } = useMemoryAlerts();

  const getAlertLevelColor = (level: MemoryAlertLevel) => {
    switch (level) {
      case MemoryAlertLevel.NORMAL: return 'bg-green-100 text-green-800';
      case MemoryAlertLevel.WARNING: return 'bg-yellow-100 text-yellow-800';
      case MemoryAlertLevel.CRITICAL: return 'bg-orange-100 text-orange-800';
      case MemoryAlertLevel.MAXIMUM: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="memory-alerts-panel p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Memory Alerts</h2>
        <div className={`px-3 py-1 rounded-full text-sm ${getAlertLevelColor(currentMemoryStatus)}`}>
          Current Status: {currentMemoryStatus}
        </div>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center">No memory alerts</p>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`mb-2 p-3 rounded-lg ${getAlertLevelColor(alert.level)}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{alert.message}</span>
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  Memory Usage: {formatMemoryUsage(alert.memoryUsage)}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={clearAlertHistory}
            className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg transition-colors"
          >
            Clear Alert History
          </button>
        </>
      )}
    </div>
  );
};
