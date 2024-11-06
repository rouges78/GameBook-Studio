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
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const Notification = ({ message, type, onClose, isDarkMode, style = 'modern', position = 'top-right' }) => {
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <lucide_react_1.CheckCircle className="text-green-500" size={24}/>;
            case 'error':
                return <lucide_react_1.AlertCircle className="text-red-500" size={24}/>;
            case 'info':
            default:
                return <lucide_react_1.Info className="text-blue-500" size={24}/>;
        }
    };
    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'border-green-500';
            case 'error':
                return 'border-red-500';
            case 'info':
            default:
                return 'border-blue-500';
        }
    };
    const getPositionClasses = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            case 'center':
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
            default:
                return 'top-4 right-4';
        }
    };
    const getStyleClasses = () => {
        const baseClasses = `${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-4 flex items-center transition-all duration-300 ease-in-out`;
        switch (style) {
            case 'minimal':
                return `${baseClasses} border ${getBorderColor()}`;
            case 'standard':
                return `${baseClasses} border-l-4 ${getBorderColor()}`;
            case 'modern':
            default:
                return `${baseClasses} border-l-4 ${getBorderColor()} backdrop-blur-sm bg-opacity-90`;
        }
    };
    const getAnimation = () => {
        const baseAnimation = {
            initial: { opacity: 0, scale: 0.3 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
        };
        if (position.includes('top')) {
            return {
                ...baseAnimation,
                initial: { ...baseAnimation.initial, y: -50 },
                animate: { ...baseAnimation.animate, y: 0 }
            };
        }
        else if (position.includes('bottom')) {
            return {
                ...baseAnimation,
                initial: { ...baseAnimation.initial, y: 50 },
                animate: { ...baseAnimation.animate, y: 0 }
            };
        }
        return baseAnimation;
    };
    return (<framer_motion_1.AnimatePresence>
      <framer_motion_1.motion.div {...getAnimation()} className={`fixed z-50 max-w-md ${getPositionClasses()}`}>
        <div className={getStyleClasses()}>
          <div className="mr-3 flex-shrink-0">{getIcon()}</div>
          <p className="text-sm flex-grow">{message}</p>
          <button onClick={onClose} className={`
              ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-150 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded
            `}>
            <lucide_react_1.X size={18}/>
          </button>
        </div>
      </framer_motion_1.motion.div>
    </framer_motion_1.AnimatePresence>);
};
exports.default = Notification;
