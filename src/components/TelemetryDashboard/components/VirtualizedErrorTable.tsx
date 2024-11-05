import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { TelemetryEvent } from '../../../types/electron';

interface VirtualizedErrorTableProps {
  events: TelemetryEvent[];
  isDarkMode: boolean;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    events: TelemetryEvent[];
    isDarkMode: boolean;
    textColor: string;
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const { events, textColor } = data;
  const event = events[index];

  return (
    <div 
      style={style} 
      className={`flex divide-x divide-${data.isDarkMode ? 'gray-700' : 'gray-200'}`}
    >
      <div className={`flex-1 px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
        {new Date(event.timestamp).toLocaleString()}
      </div>
      <div className={`flex-1 px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
        {event.appVersion}
      </div>
      <div className={`flex-1 px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
        {event.platform}
      </div>
    </div>
  );
};

export const VirtualizedErrorTable: React.FC<VirtualizedErrorTableProps> = ({
  events,
  isDarkMode
}) => {
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`border border-${isDarkMode ? 'gray-700' : 'gray-200'} rounded-lg overflow-hidden`}>
      <div className={`bg-${isDarkMode ? 'gray-700' : 'gray-50'}`}>
        <div className="flex divide-x divide-gray-200">
          <div className={`flex-1 px-6 py-3 text-left text-xs font-medium ${subTextColor} uppercase tracking-wider`}>
            Timestamp
          </div>
          <div className={`flex-1 px-6 py-3 text-left text-xs font-medium ${subTextColor} uppercase tracking-wider`}>
            Version
          </div>
          <div className={`flex-1 px-6 py-3 text-left text-xs font-medium ${subTextColor} uppercase tracking-wider`}>
            Platform
          </div>
        </div>
      </div>

      <div className={`bg-${isDarkMode ? 'gray-800' : 'white'}`}>
        <List
          height={300}
          itemCount={events.length}
          itemSize={53} // 53px matches the original row height (py-4 + content)
          width="100%"
          itemData={{
            events,
            isDarkMode,
            textColor
          }}
        >
          {Row}
        </List>
      </div>
    </div>
  );
};
