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
const lucide_react_1 = require("lucide-react");
const TagInput = ({ tags, onTagsChange, isDarkMode }) => {
    const [inputValue, setInputValue] = (0, react_1.useState)('');
    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === 'Tab') && inputValue.trim()) {
            e.preventDefault();
            if (!tags.includes(inputValue.trim())) {
                onTagsChange([...tags, inputValue.trim()]);
            }
            setInputValue('');
        }
        else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onTagsChange(tags.slice(0, -1));
        }
    };
    const removeTag = (tagToRemove) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };
    return (<div className={`flex-none ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="px-6 py-3 border-t border-gray-800">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (<span key={index} className={`inline-flex items-center px-2 py-1 rounded text-sm ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
              #{tag}
              <button onClick={() => removeTag(tag)} className="ml-1 p-0.5 hover:text-red-500 rounded-full">
                <lucide_react_1.X size={14}/>
              </button>
            </span>))}
        </div>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Aggiungi tag (premi Invio o Tab per confermare)" className={`w-full px-3 py-1.5 rounded text-sm ${isDarkMode
            ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
            : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'} border focus:outline-none focus:ring-1 focus:ring-blue-500`}/>
      </div>
    </div>);
};
exports.default = TagInput;
