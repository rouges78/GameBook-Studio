import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { TagInputProps } from './types';

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, isDarkMode }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`flex-none ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="px-6 py-3 border-t border-gray-800">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
              }`}
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 p-0.5 hover:text-red-500 rounded-full"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aggiungi tag (premi Invio o Tab per confermare)"
          className={`w-full px-3 py-1.5 rounded text-sm ${
            isDarkMode
              ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
              : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
          } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
      </div>
    </div>
  );
};

export default TagInput;
