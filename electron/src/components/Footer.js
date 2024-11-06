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
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const Footer = ({ projectCount, lastBackup, isDarkMode }) => {
    const [isOnline, setIsOnline] = (0, react_1.useState)(navigator.onLine);
    const [currentTime, setCurrentTime] = (0, react_1.useState)(new Date());
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = (0, react_1.useState)(false);
    const [showTooltip, setShowTooltip] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        // Load auto-save settings
        const savedSettings = localStorage.getItem('gamebookSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setIsAutoSaveEnabled(settings.autoSaveEnabled);
        }
        // Listen for auto-save settings changes
        const handleAutoSaveSettingsChanged = (event) => {
            setIsAutoSaveEnabled(event.detail.enabled);
        };
        window.addEventListener('autoSaveSettingsChanged', handleAutoSaveSettingsChanged);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('autoSaveSettingsChanged', handleAutoSaveSettingsChanged);
            clearInterval(timer);
        };
    }, []);
    const springTransition = {
        type: "spring",
        stiffness: 500,
        damping: 30
    };
    const footerVariants = {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    };
    const iconVariants = {
        initial: { scale: 0 },
        animate: { scale: 1, transition: springTransition },
        hover: {
            scale: 1.2,
            rotate: 10,
            transition: { duration: 0.2 }
        }
    };
    const statusVariants = {
        online: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        },
        offline: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        },
        exit: {
            x: -20,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };
    const tooltipVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.2 }
        }
    };
    return (<framer_motion_1.motion.footer variants={footerVariants} initial="initial" animate="animate" className={`bg-gray-800 text-gray-100 h-8 flex items-center px-4 border-t border-gray-700 relative`}>
      <div className="w-64 flex items-center justify-center">
        <framer_motion_1.AnimatePresence mode="wait">
          <framer_motion_1.motion.div key={isOnline ? 'online' : 'offline'} variants={statusVariants} initial="exit" animate={isOnline ? 'online' : 'offline'} exit="exit" className="flex items-center space-x-2">
            <framer_motion_1.motion.div variants={iconVariants} whileHover="hover" onMouseEnter={() => setShowTooltip('connection')} onMouseLeave={() => setShowTooltip('')} className="relative">
              {isOnline ? (<lucide_react_1.Wifi size={18} className="text-green-400"/>) : (<lucide_react_1.WifiOff size={18} className="text-red-400"/>)}
              <framer_motion_1.AnimatePresence>
                {showTooltip === 'connection' && (<framer_motion_1.motion.div variants={tooltipVariants} initial="hidden" animate="visible" exit="hidden" className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap">
                    {isOnline ? 'Connected to network' : 'No network connection'}
                  </framer_motion_1.motion.div>)}
              </framer_motion_1.AnimatePresence>
            </framer_motion_1.motion.div>
            <framer_motion_1.motion.span className="text-sm font-medium" animate={{
            color: isOnline ? '#34D399' : '#F87171'
        }} transition={{ duration: 0.3 }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </framer_motion_1.motion.span>
          </framer_motion_1.motion.div>
        </framer_motion_1.AnimatePresence>
      </div>

      <div className="flex-1 flex items-center justify-center space-x-6">
        <framer_motion_1.motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }} transition={springTransition}>
          <framer_motion_1.motion.div variants={iconVariants} whileHover="hover" onMouseEnter={() => setShowTooltip('projects')} onMouseLeave={() => setShowTooltip('')} className="relative">
            <lucide_react_1.Library size={18} className="text-orange-500"/>
            <framer_motion_1.AnimatePresence>
              {showTooltip === 'projects' && (<framer_motion_1.motion.div variants={tooltipVariants} initial="hidden" animate="visible" exit="hidden" className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap">
                  Total projects in library
                </framer_motion_1.motion.div>)}
            </framer_motion_1.AnimatePresence>
          </framer_motion_1.motion.div>
          <framer_motion_1.motion.span className="text-sm" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.3 }}>
            PROGETTI: {projectCount}
          </framer_motion_1.motion.span>
        </framer_motion_1.motion.div>

        <framer_motion_1.motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }} transition={springTransition}>
          <framer_motion_1.motion.div variants={iconVariants} whileHover="hover" onMouseEnter={() => setShowTooltip('backup')} onMouseLeave={() => setShowTooltip('')} className="relative">
            <lucide_react_1.Save size={18} className={isAutoSaveEnabled ? 'text-green-500' : 'text-orange-500'}/>
            <framer_motion_1.AnimatePresence>
              {showTooltip === 'backup' && (<framer_motion_1.motion.div variants={tooltipVariants} initial="hidden" animate="visible" exit="hidden" className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap">
                  {isAutoSaveEnabled ? 'Auto-save enabled' : 'Last manual save'}
                </framer_motion_1.motion.div>)}
            </framer_motion_1.AnimatePresence>
          </framer_motion_1.motion.div>
          <span className="text-sm">
            BACKUP: {lastBackup}
            {isAutoSaveEnabled && (<framer_motion_1.motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={springTransition} className="ml-1 text-green-500">
                (AUTO)
              </framer_motion_1.motion.span>)}
          </span>
        </framer_motion_1.motion.div>
      </div>

      <framer_motion_1.motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }} transition={springTransition}>
        <framer_motion_1.motion.div variants={iconVariants} whileHover="hover" onMouseEnter={() => setShowTooltip('time')} onMouseLeave={() => setShowTooltip('')} className="relative">
          <lucide_react_1.Clock size={18} className="text-orange-500"/>
          <framer_motion_1.AnimatePresence>
            {showTooltip === 'time' && (<framer_motion_1.motion.div variants={tooltipVariants} initial="hidden" animate="visible" exit="hidden" className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap">
                Current local time
              </framer_motion_1.motion.div>)}
          </framer_motion_1.AnimatePresence>
        </framer_motion_1.motion.div>
        <framer_motion_1.motion.span className="text-sm" animate={{ opacity: [0.8, 1] }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}>
          {currentTime.toLocaleString()}
        </framer_motion_1.motion.span>
      </framer_motion_1.motion.div>
    </framer_motion_1.motion.footer>);
};
exports.default = Footer;
