"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const Header = ({ isDarkMode, version, edition, update, revision, onThemeToggle }) => {
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
    return (<framer_motion_1.motion.header variants={headerVariants} initial="initial" animate="animate" className={`flex flex-col ${isDarkMode
            ? 'bg-gray-800 text-white border-gray-700'
            : 'bg-gray-800 text-white border-gray-700'}`}>
      <div className="w-full text-left py-2 border-b border-gray-700 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <framer_motion_1.motion.div whileHover="hover" variants={iconVariants} className="text-blue-500 mr-3">
              <lucide_react_1.Book size={28}/>
            </framer_motion_1.motion.div>
            <span className="text-xl font-semibold">GameBook Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={springTransition} onClick={onThemeToggle} className="relative w-8 h-8 flex items-center justify-center text-blue-500">
              <framer_motion_1.AnimatePresence mode="wait">
                {isDarkMode ? (<framer_motion_1.motion.div key="moon" variants={themeIconVariants} initial="initial" animate="animate" exit="exit" className="absolute">
                    <lucide_react_1.Moon size={20}/>
                  </framer_motion_1.motion.div>) : (<framer_motion_1.motion.div key="sun" variants={themeIconVariants} initial="initial" animate="animate" exit="exit" className="absolute">
                    <lucide_react_1.Sun size={20}/>
                  </framer_motion_1.motion.div>)}
              </framer_motion_1.AnimatePresence>
            </framer_motion_1.motion.button>
            <framer_motion_1.motion.div variants={versionVariants} initial="initial" animate="animate" className="text-sm text-gray-400">
              v{version}
            </framer_motion_1.motion.div>
          </div>
        </div>
      </div>
      <div className="h-12 flex items-center justify-end px-4">
        <framer_motion_1.motion.div variants={versionVariants} initial="initial" animate="animate" className="flex items-center space-x-4 text-sm">
          {edition && (<framer_motion_1.motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer">
              {edition}
            </framer_motion_1.motion.div>)}
          {update && (<framer_motion_1.motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition} className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer group">
              <framer_motion_1.motion.span initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }}>
                Update {update}
              </framer_motion_1.motion.span>
            </framer_motion_1.motion.div>)}
          {revision && (<framer_motion_1.motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer">
              Rev {revision}
            </framer_motion_1.motion.div>)}
        </framer_motion_1.motion.div>
      </div>
    </framer_motion_1.motion.header>);
};
exports.default = Header;
