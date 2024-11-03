import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  isDarkMode: boolean;
  style?: 'modern' | 'minimal' | 'standard';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  onClose, 
  isDarkMode,
  style = 'modern',
  position = 'top-right'
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={24} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={24} />;
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
    } else if (position.includes('bottom')) {
      return {
        ...baseAnimation,
        initial: { ...baseAnimation.initial, y: 50 },
        animate: { ...baseAnimation.animate, y: 0 }
      };
    }

    return baseAnimation;
  };

  return (
    <AnimatePresence>
      <motion.div
        {...getAnimation()}
        className={`fixed z-50 max-w-md ${getPositionClasses()}`}
      >
        <div className={getStyleClasses()}>
          <div className="mr-3 flex-shrink-0">{getIcon()}</div>
          <p className="text-sm flex-grow">{message}</p>
          <button
            onClick={onClose}
            className={`
              ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-150 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded
            `}
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;