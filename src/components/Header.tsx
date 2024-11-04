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

  const textVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.3 } }
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
      className={`h-12 flex items-center justify-between px-4 border-b ${
        isDarkMode 
          ? 'bg-gray-800 text-white border-gray-700' 
          : 'bg-brown-700 text-white border-brown-600'
      }`}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          whileHover="hover"
          variants={iconVariants}
          className="text-primary"
        >
          <Book size={24} />
        </motion.div>
        <motion.h1
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="text-xl font-bold flex items-center"
        >
          Gamebook Studio
        </motion.h1>
      </div>

      <div className="flex items-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={springTransition}
          onClick={onThemeToggle}
          className="relative w-8 h-8 flex items-center justify-center"
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
          className="flex items-center space-x-4 text-sm"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
            className="px-2 py-1 rounded bg-opacity-20 bg-white cursor-pointer"
          >
            v{version}
          </motion.div>
          {edition && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="px-2 py-1 rounded bg-opacity-20 bg-white cursor-pointer"
            >
              {edition}
            </motion.div>
          )}
          {update && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="px-2 py-1 rounded bg-opacity-20 bg-white cursor-pointer group"
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
              className="px-2 py-1 rounded bg-opacity-20 bg-white cursor-pointer"
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
