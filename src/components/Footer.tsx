import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Save, Clock, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FooterProps {
  projectCount: number;
  lastBackup: string;
  isDarkMode: boolean;
  language?: 'it' | 'en';
}

const Footer: React.FC<FooterProps> = ({ projectCount, lastBackup, isDarkMode, language = 'it' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');

  const translations = {
    it: {
      connected: "Connesso",
      offline: "Non in linea",
      connectedToNetwork: "Connesso alla rete",
      noConnection: "Nessuna connessione di rete",
      projects: "Progetti",
      totalProjects: "Progetti totali in libreria",
      lastBackup: "Ultimo backup",
      autoSaveEnabled: "Salvataggio automatico attivato",
      lastManualSave: "Ultimo salvataggio manuale",
      auto: "Auto",
      currentTime: "Ora locale"
    },
    en: {
      connected: "Connected",
      offline: "Offline",
      connectedToNetwork: "Connected to network",
      noConnection: "No network connection",
      projects: "Projects",
      totalProjects: "Total projects in library",
      lastBackup: "Last backup",
      autoSaveEnabled: "Auto-save enabled",
      lastManualSave: "Last manual save",
      auto: "Auto",
      currentTime: "Current local time"
    }
  };

  const t = translations[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const savedSettings = localStorage.getItem('gamebookSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsAutoSaveEnabled(settings.autoSaveEnabled);
    }

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
    hidden: { opacity: 0, y: 10, scale: 0.95 },
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
      className={`${isDarkMode ? 'bg-gray-800/90 backdrop-blur-md border-t border-white/20' : 'glass'} h-10 flex items-center px-4 sticky bottom-0 z-50`}
    >
      <div className="w-64 flex items-center justify-start">
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
                <Wifi size={16} className="text-green-500" strokeWidth={1.5} />
              ) : (
                <WifiOff size={16} className="text-red-500" strokeWidth={1.5} />
              )}
              <AnimatePresence>
                {showTooltip === 'connection' && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded-md shadow-lg whitespace-nowrap border border-border"
                  >
                    {isOnline ? t.connectedToNetwork : t.noConnection}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.span 
              className="text-xs font-medium"
              animate={{ 
                color: isOnline ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
              }}
              transition={{ duration: 0.3 }}
            >
              {isOnline ? t.connected : t.offline}
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-1 flex items-center justify-center space-x-8">
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          transition={springTransition}
        >
          <motion.div 
            variants={iconVariants} 
            whileHover="hover"
            onMouseEnter={() => setShowTooltip('projects')}
            onMouseLeave={() => setShowTooltip('')}
            className="relative"
          >
            <Library size={16} className="text-primary" strokeWidth={1.5} />
            <AnimatePresence>
              {showTooltip === 'projects' && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded-md shadow-lg whitespace-nowrap border border-border"
                >
                  {t.totalProjects}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.span className="text-xs font-medium">
            {t.projects}: {projectCount}
          </motion.span>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
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
              size={16} 
              className={isAutoSaveEnabled ? 'text-primary' : 'text-primary/70'} 
              strokeWidth={1.5}
            />
            <AnimatePresence>
              {showTooltip === 'backup' && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded-md shadow-lg whitespace-nowrap border border-border"
                >
                  {isAutoSaveEnabled ? t.autoSaveEnabled : t.lastManualSave}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="text-xs font-medium">
            {t.lastBackup}: {lastBackup}
            {isAutoSaveEnabled && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springTransition}
                className="ml-1 text-primary"
              >
                ({t.auto})
              </motion.span>
            )}
          </span>
        </motion.div>
      </div>

      <div className="w-64 flex items-center justify-end">
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          transition={springTransition}
        >
          <motion.div 
            variants={iconVariants} 
            whileHover="hover"
            onMouseEnter={() => setShowTooltip('time')}
            onMouseLeave={() => setShowTooltip('')}
            className="relative"
          >
            <Clock size={16} className="text-primary" strokeWidth={1.5} />
            <AnimatePresence>
              {showTooltip === 'time' && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded-md shadow-lg whitespace-nowrap border border-border"
                >
                  {t.currentTime}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.span 
            className="text-xs font-medium"
            animate={{ opacity: [0.8, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            {currentTime.toLocaleTimeString()}
          </motion.span>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
