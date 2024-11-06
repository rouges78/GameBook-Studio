import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  version: string;
  edition?: string;
  update?: string;
  revision?: string;
  onThemeToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, 
  version, 
  edition, 
  update, 
  revision,
  onThemeToggle 
}) => {
  const headerVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const logoVariants = {
    initial: { scale: 0.8, rotate: -10 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.4 } }
  };

  const versionVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.3 } }
  };

  const themeIconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.3 } },
    exit: { scale: 0, rotate: 180, transition: { duration: 0.3 } }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`${isDarkMode ? 'bg-gray-800/90 backdrop-blur-md border-b border-white/20' : 'glass'} z-50 sticky top-0`}
    >
      <div className="w-full py-3 px-4">
        <div className="flex items-center">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3 pl-4">
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate="animate"
              className="text-primary"
            >
              <Book size={28} strokeWidth={1.5} />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight"
            >
              GameBook Studio
            </motion.span>
          </div>
          
          {/* Right side - Version and Theme Toggle */}
          <div className="flex items-center space-x-6 ml-auto">
            <motion.div
              variants={versionVariants}
              initial="initial"
              animate="animate"
              className="flex items-center space-x-2"
            >
              {edition && (
                <span className="badge badge-secondary">
                  {edition}
                </span>
              )}
              <span className="badge badge-primary">
                v{version}
              </span>
              {update && (
                <span className="badge bg-blue-500 text-white border-transparent">
                  Update {update}
                </span>
              )}
              {revision && (
                <span className="badge badge-secondary">
                  Rev {revision}
                </span>
              )}
            </motion.div>

            <motion.button
              onClick={onThemeToggle}
              className="relative w-8 h-8 flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="moon"
                    variants={themeIconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute"
                  >
                    <Moon size={20} strokeWidth={1.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    variants={themeIconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute"
                  >
                    <Sun size={20} strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
