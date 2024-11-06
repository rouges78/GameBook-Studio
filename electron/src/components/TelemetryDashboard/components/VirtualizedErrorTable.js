"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualizedErrorTable = void 0;
const react_1 = __importDefault(require("react"));
const react_window_1 = require("react-window");
const Row = ({ index, style, data }) => {
    const { events, textColor } = data;
    const event = events[index];
    if (!event) {
        return null;
    }
    return (<div style={style} className={`flex divide-x divide-${data.isDarkMode ? 'gray-700' : 'gray-200'}`}>
      <div className={`flex-1 px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
        {new Date(event.timestamp).toLocaleString()}
      </div>
      <div className={`flex-1 px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
        {event.appVersion}
      </div>
      <div className={`flex-1 px-6 py-4 whitespace-nowrap text-sm ${textColor}`}>
        {event.platform}
      </div>
    </div>);
};
const VirtualizedErrorTable = ({ events, isDarkMode }) => {
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    if (!Array.isArray(events) || events.length === 0) {
        return (<div className={`p-6 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        No events to display
      </div>);
    }
    const validEvents = events.filter((event) => {
        return (event !== null &&
            typeof event === 'object' &&
            typeof event.timestamp === 'number' &&
            typeof event.appVersion === 'string' &&
            typeof event.platform === 'string');
    });
    return (<div className={`border border-${isDarkMode ? 'gray-700' : 'gray-200'} rounded-lg overflow-hidden`}>
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
        <react_window_1.FixedSizeList height={300} itemCount={validEvents.length} itemSize={53} // 53px matches the original row height (py-4 + content)
     width="100%" itemData={{
            events: validEvents,
            isDarkMode,
            textColor
        }}>
          {Row}
        </react_window_1.FixedSizeList>
      </div>
    </div>);
};
exports.VirtualizedErrorTable = VirtualizedErrorTable;
