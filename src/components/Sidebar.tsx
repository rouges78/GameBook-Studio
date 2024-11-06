import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, BookOpen, Palette, Settings, HelpCircle, LogOut, Database } from 'lucide-react';

interface SidebarProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  language: 'it' | 'en';
  setLanguage: (value: 'it' | 'en') => void;
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export' | 'backupManager' | 'telemetryDashboard') => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  setCurrentPage,
  onLogout,
}) => {
  const translations = {
    it: {
      preferences: "Preferenze",
      darkMode: "Modalità Scura",
      language: "Lingua",
      italian: "Italiano",
      english: "Inglese",
      library: "Libreria",
      themeEditor: "Editor Tema",
      settings: "Impostazioni",
      help: "Aiuto",
      logout: "Esci",
      backupManager: "Gestione Backup"
    },
    en: {
      preferences: "Preferences",
      darkMode: "Dark Mode",
      language: "Language",
      italian: "Italian",
      english: "English",
      library: "Library",
      themeEditor: "Theme Editor",
      settings: "Settings",
      help: "Help",
      logout: "Logout",
      backupManager: "Backup Manager"
    }
  };

  const t = translations[language];

  const handleLogout = () => {
    window.electron?.closeWindow();
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`w-64 p-6 flex flex-col ${isDarkMode ? 'glass-dark' : 'glass'}`}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold mb-6"
      >
        {t.preferences}
      </motion.h2>

      <motion.div className="mb-6">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="flex items-center text-sm">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
            >
              {isDarkMode ? (
                <Moon size={16} className="mr-2 text-primary" strokeWidth={2} />
              ) : (
                <Sun size={16} className="mr-2 text-primary" strokeWidth={2} />
              )}
            </motion.div>
            {t.darkMode}
          </span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              isDarkMode ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <motion.span
              initial={false}
              animate={{
                x: isDarkMode ? '16px' : '2px',
                scale: isDarkMode ? 1 : 0.9
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-block w-4 h-4 transform bg-background rounded-full shadow-sm"
            />
          </button>
        </label>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold mb-4"
      >
        {t.language}
      </motion.h2>

      <div className="space-y-3 mb-8">
        {[
          { value: 'it', label: t.italian },
          { value: 'en', label: t.english }
        ].map((option) => (
          <motion.label
            key={option.value}
            className="flex items-center cursor-pointer group"
            whileHover={{ x: 2 }}
          >
            <div className="relative">
              <input
                type="radio"
                checked={language === option.value}
                onChange={() => setLanguage(option.value as 'it' | 'en')}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                language === option.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground'
              }`}>
                {language === option.value && (
                  <motion.div
                    layoutId="radio-dot"
                    className="absolute inset-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </div>
            <span className="ml-2 text-sm group-hover:text-primary transition-colors">
              {option.label}
            </span>
          </motion.label>
        ))}
      </div>

      <div className="flex-grow space-y-3">
        {[
          { icon: BookOpen, label: t.library, page: 'library' },
          { icon: Database, label: t.backupManager, page: 'backupManager' },
          { icon: Palette, label: t.themeEditor, page: 'themeEditor' },
          { icon: Settings, label: t.settings, page: 'settings' },
          { icon: HelpCircle, label: t.help, page: 'help' }
        ].map((item) => (
          <motion.button
            key={item.page}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setCurrentPage(item.page as any)}
            className="btn btn-secondary w-full justify-start text-sm"
          >
            <item.icon size={16} className="mr-2" strokeWidth={2} />
            {item.label}
          </motion.button>
        ))}
      </div>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={handleLogout}
        className="btn w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm mt-6"
      >
        <LogOut size={16} className="mr-2" strokeWidth={2} />
        {t.logout}
      </motion.button>
    </motion.aside>
  );
};

export default Sidebar;
