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
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const logoVariants = {
    initial: { scale: 0.8, rotate: -10 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.5 } },
    hover: { 
      scale: 1.1,
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  const versionVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.3, duration: 0.3 } }
  };

  const themeIconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.3 } },
    exit: { scale: 0, rotate: 180, transition: { duration: 0.3 } }
  };

  const springTransition = {
    type: "spring",
    stiffness: 500,
    damping: 30
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`${isDarkMode ? 'glass-dark' : 'glass'} z-50 sticky top-0`}
    >
      <div className="w-full py-3 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="text-primary"
            >
              <Book size={28} strokeWidth={2.5} />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight"
            >
              GameBook Studio
            </motion.span>
          </div>
          
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springTransition}
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
                    <Moon size={20} strokeWidth={2} />
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
                    <Sun size={20} strokeWidth={2} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="flex items-center space-x-3">
              <motion.div
                variants={versionVariants}
                initial="initial"
                animate="animate"
                className="flex items-center space-x-2"
              >
                {edition && (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="badge badge-secondary"
                  >
                    {edition}
                  </motion.span>
                )}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="badge badge-primary"
                >
                  v{version}
                </motion.span>
                {update && (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="badge bg-blue-500 text-white border-transparent hover:bg-blue-600"
                  >
                    Update {update}
                  </motion.span>
                )}
                {revision && (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="badge badge-secondary"
                  >
                    Rev {revision}
                  </motion.span>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
