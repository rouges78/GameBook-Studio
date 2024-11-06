"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// CustomPopup.tsx
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const CustomPopup = ({ message, onConfirm, onCancel, isDarkMode }) => {
    return (<framer_motion_1.motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button onClick={onCancel} className="mr-4 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600">
            Annulla
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Continua
          </button>
        </div>
      </div>
    </framer_motion_1.motion.div>);
};
exports.default = CustomPopup;
