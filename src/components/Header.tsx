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

  const iconVariants = {
    hover: { rotate: 360, transition: { duration: 0.5 } }
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
      className={`flex flex-col ${
        isDarkMode 
          ? 'bg-gray-800 text-white border-gray-700' 
          : 'bg-gray-800 text-white border-gray-700'
      }`}
    >
      <div className="w-full text-left py-2 border-b border-gray-700 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              whileHover="hover"
              variants={iconVariants}
              className="text-blue-500 mr-3"
            >
              <Book size={28} />
            </motion.div>
            <span className="text-xl font-semibold">GameBook Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springTransition}
              onClick={onThemeToggle}
              className="relative w-8 h-8 flex items-center justify-center text-blue-500"
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
                    <Moon size={20} />
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
                    <Sun size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.div
              variants={versionVariants}
              initial="initial"
              animate="animate"
              className="text-sm text-gray-400"
            >
              v{version}
            </motion.div>
          </div>
        </div>
      </div>
      <div className="h-12 flex items-center justify-end px-4">
        <motion.div
          variants={versionVariants}
          initial="initial"
          animate="animate"
          className="flex items-center space-x-4 text-sm"
        >
          {edition && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {edition}
            </motion.div>
          )}
          {update && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer group"
            >
              <motion.span
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                Update {update}
              </motion.span>
            </motion.div>
          )}
          {revision && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Rev {revision}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
