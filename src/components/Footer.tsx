import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Save, Clock, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FooterProps {
  projectCount: number;
  lastBackup: string;
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ projectCount, lastBackup, isDarkMode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');

  useEffect(() => {
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
    const handleAutoSaveSettingsChanged = (event: CustomEvent) => {
      setIsAutoSaveEnabled(event.detail.enabled);
    };

    window.addEventListener('autoSaveSettingsChanged', handleAutoSaveSettingsChanged as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('autoSaveSettingsChanged', handleAutoSaveSettingsChanged as EventListener);
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

  return (
    <motion.footer
      variants={footerVariants}
      initial="initial"
      animate="animate"
      className={`${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
      } h-8 flex items-center px-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-300'
      } relative`}
    >
      <div className="w-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={isOnline ? 'online' : 'offline'}
            variants={statusVariants}
            initial="exit"
            animate={isOnline ? 'online' : 'offline'}
            exit="exit"
            className="flex items-center space-x-2"
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              onMouseEnter={() => setShowTooltip('connection')}
              onMouseLeave={() => setShowTooltip('')}
              className="relative"
            >
              {isOnline ? (
                <Wifi size={18} className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              ) : (
                <WifiOff size={18} className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              )}
              <AnimatePresence>
                {showTooltip === 'connection' && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap"
                  >
                    {isOnline ? 'Connected to network' : 'No network connection'}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.span 
              className="text-sm font-medium"
              animate={{ 
                color: isOnline ? 
                  isDarkMode ? '#34D399' : '#059669' : 
                  isDarkMode ? '#F87171' : '#DC2626' 
              }}
              transition={{ duration: 0.3 }}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-1 flex items-center justify-center space-x-6">
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          transition={springTransition}
        >
          <motion.div 
            variants={iconVariants} 
            whileHover="hover"
            onMouseEnter={() => setShowTooltip('projects')}
            onMouseLeave={() => setShowTooltip('')}
            className="relative"
          >
            <Library size={18} className="text-primary" />
            <AnimatePresence>
              {showTooltip === 'projects' && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap"
                >
                  Total projects in library
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.span 
            className="text-sm"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            PROGETTI: {projectCount}
          </motion.span>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          transition={springTransition}
        >
          <motion.div 
            variants={iconVariants} 
            whileHover="hover"
            onMouseEnter={() => setShowTooltip('backup')}
            onMouseLeave={() => setShowTooltip('')}
            className="relative"
          >
            <Save 
              size={18} 
              className={isAutoSaveEnabled ? 'text-green-500' : 'text-primary'} 
            />
            <AnimatePresence>
              {showTooltip === 'backup' && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap"
                >
                  {isAutoSaveEnabled ? 'Auto-save enabled' : 'Last manual save'}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="text-sm">
            BACKUP: {lastBackup}
            {isAutoSaveEnabled && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springTransition}
                className="ml-1 text-green-500"
              >
                (AUTO)
              </motion.span>
            )}
          </span>
        </motion.div>
      </div>

      <motion.div
        className="flex items-center space-x-2"
        whileHover={{ scale: 1.05 }}
        transition={springTransition}
      >
        <motion.div 
          variants={iconVariants} 
          whileHover="hover"
          onMouseEnter={() => setShowTooltip('time')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative"
        >
          <Clock size={18} className="text-primary" />
          <AnimatePresence>
            {showTooltip === 'time' && (
              <motion.div
                variants={tooltipVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap"
              >
                Current local time
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.span 
          className="text-sm"
          animate={{ opacity: [0.8, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          {currentTime.toLocaleString()}
        </motion.span>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
