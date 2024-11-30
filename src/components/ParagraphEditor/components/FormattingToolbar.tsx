import React from 'react';
import { FormattingToolbarProps } from '../types';
import { translations } from '../translations';

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  selectedParagraph,
  onUpdate,
  isDarkMode,
  language
}) => {
  const t = translations[language];

  const handleFontSizeChange = (size: number) => {
    onUpdate({
      ...selectedParagraph,
      fontSize: size
    });
  };

  return (
    <div className={`flex items-center gap-4 px-4 py-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-2">
        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t.fontSize}:
        </label>
        <select
          value={selectedParagraph.fontSize || 16}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className={`
            px-2 py-1 rounded-md border
            ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200' 
              : 'bg-white border-gray-300 text-gray-700'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FormattingToolbar;
