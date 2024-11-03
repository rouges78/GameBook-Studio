// CustomPopup.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CustomPopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ message, onConfirm, onCancel, isDarkMode }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className={`p-6 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-4 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Continua
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomPopup;
