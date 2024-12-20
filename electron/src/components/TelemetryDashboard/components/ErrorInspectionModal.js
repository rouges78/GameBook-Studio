"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorInspectionModal = void 0;
const react_1 = __importStar(require("react"));
const VirtualizedErrorTable_1 = require("./VirtualizedErrorTable");
const ErrorInspectionModal = ({ isOpen, onClose, errorPatterns, selectedError, isDarkMode }) => {
    const modalClasses = `fixed inset-0 flex items-center justify-center z-50 ${isOpen ? 'visible' : 'invisible'}`;
    const overlayClasses = `fixed inset-0 bg-black ${isOpen ? 'opacity-50' : 'opacity-0'} transition-opacity duration-300`;
    const contentClasses = `relative bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-300`;
    const headerClasses = `px-6 py-4 border-b border-${isDarkMode ? 'gray-700' : 'gray-200'}`;
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const patternAnalysis = (0, react_1.useMemo)(() => {
        if (!selectedError)
            return null;
        const timeBasedPatterns = selectedError.events.reduce((acc, event) => {
            const hour = new Date(event.timestamp).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        const platformDistribution = selectedError.events.reduce((acc, event) => {
            acc[event.platform] = (acc[event.platform] || 0) + 1;
            return acc;
        }, {});
        return {
            timeBasedPatterns,
            platformDistribution,
            totalOccurrences: selectedError.events.length,
            firstOccurrence: new Date(Math.min(...selectedError.events.map(e => e.timestamp))),
            lastOccurrence: new Date(Math.max(...selectedError.events.map(e => e.timestamp)))
        };
    }, [selectedError]);
    if (!isOpen)
        return null;
    return (<div className={modalClasses}>
      <div className={overlayClasses} onClick={onClose}/>
      <div className={contentClasses}>
        <div className={headerClasses}>
          <h2 className={`text-xl font-semibold ${textColor}`}>
            Error Pattern Analysis
          </h2>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500" aria-label="Close modal">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
          {selectedError ? (<div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Pattern Details</h3>
                <p className={subTextColor}>{selectedError.pattern}</p>
                {patternAnalysis && (<div className="mt-4 grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg bg-${isDarkMode ? 'gray-700' : 'gray-100'}`}>
                      <p className={`font-medium ${textColor}`}>Total Occurrences</p>
                      <p className={`text-2xl font-bold ${textColor}`}>
                        {patternAnalysis.totalOccurrences}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg bg-${isDarkMode ? 'gray-700' : 'gray-100'}`}>
                      <p className={`font-medium ${textColor}`}>Time Range</p>
                      <p className={subTextColor}>
                        {patternAnalysis.firstOccurrence.toLocaleDateString()} - {patternAnalysis.lastOccurrence.toLocaleDateString()}
                      </p>
                    </div>
                  </div>)}
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Platform Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patternAnalysis && Object.entries(patternAnalysis.platformDistribution).map(([platform, count]) => (<div key={platform} className={`p-3 rounded-lg bg-${isDarkMode ? 'gray-700' : 'gray-100'} flex justify-between items-center`}>
                      <span className={textColor}>{platform}</span>
                      <span className={`font-semibold ${textColor}`}>{count}</span>
                    </div>))}
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Time-based Analysis</h3>
                <div className="h-48 relative">
                  {patternAnalysis && Object.entries(patternAnalysis.timeBasedPatterns).map(([hour, count], index) => {
                const maxCount = Math.max(...Object.values(patternAnalysis.timeBasedPatterns));
                const height = (count / maxCount) * 100;
                return (<div key={hour} className="absolute bottom-0 bg-blue-500 rounded-t" style={{
                        left: `${(Number(hour) / 24) * 100}%`,
                        width: `${100 / 24}%`,
                        height: `${height}%`,
                        opacity: isDarkMode ? 0.8 : 0.6
                    }}>
                        <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${textColor} text-xs`}>
                          {count}
                        </div>
                      </div>);
            })}
                </div>
                <div className={`mt-2 flex justify-between ${subTextColor} text-sm`}>
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:59</span>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>All Occurrences</h3>
                <VirtualizedErrorTable_1.VirtualizedErrorTable events={selectedError.events} isDarkMode={isDarkMode}/>
              </div>
            </div>) : (<div className={`text-center ${subTextColor}`}>
              Select an error pattern to view detailed analysis
            </div>)}
        </div>
      </div>
    </div>);
};
exports.ErrorInspectionModal = ErrorInspectionModal;
