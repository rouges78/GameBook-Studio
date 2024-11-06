import React from 'react';
import { Bold, Italic, Underline, Link, Code, Quote, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type } from 'lucide-react';
import { ParagraphEditorControlsProps } from './types';
import { translations } from './translations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const ParagraphEditorControls: React.FC<ParagraphEditorControlsProps> = ({
  selectedParagraph,
  paragraphs,
  onUpdate,
  onSelectParagraph,
  isDarkMode,
  language,
  onSave,
  onShowStoryMap,
}) => {
  const t = translations[language];

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    selectedParagraph,
    onUpdate,
    onSave,
    onShowStoryMap,
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...selectedParagraph,
      title: e.target.value
    });
  };

  const handleTypeChange = (type: 'normale' | 'nodo' | 'finale') => {
    onUpdate({
      ...selectedParagraph,
      type
    });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...selectedParagraph,
      font: e.target.value
    });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onUpdate({
      ...selectedParagraph,
      alignment
    });
  };

  const fonts = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' }
  ];

  const formatButtons = [
    { icon: <Bold size={18} />, format: 'bold', title: t.formatButtons.bold, shortcut: 'Ctrl+B' },
    { icon: <Italic size={18} />, format: 'italic', title: t.formatButtons.italic, shortcut: 'Ctrl+I' },
    { icon: <Underline size={18} />, format: 'underline', title: t.formatButtons.underline, shortcut: 'Ctrl+U' },
    { text: 'H1', format: 'heading1', title: t.formatButtons.heading1, shortcut: 'Alt+1' },
    { text: 'H2', format: 'heading2', title: t.formatButtons.heading2, shortcut: 'Alt+2' },
    { text: 'H3', format: 'heading3', title: t.formatButtons.heading3, shortcut: 'Alt+3' },
    { icon: <Quote size={18} />, format: 'quote', title: t.formatButtons.quote },
    { icon: <Code size={18} />, format: 'code', title: t.formatButtons.code, shortcut: 'Ctrl+`' },
    { icon: <Link size={18} />, format: 'link', title: t.formatButtons.link, shortcut: 'Ctrl+K' },
  ];

  const handleFormat = (format: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = selectedParagraph.content || '';
      const selectedText = content.substring(start, end);
      let formattedText = '';

      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
        case 'heading1':
          formattedText = `# ${selectedText}`;
          break;
        case 'heading2':
          formattedText = `## ${selectedText}`;
          break;
        case 'heading3':
          formattedText = `### ${selectedText}`;
          break;
        case 'quote':
          formattedText = `> ${selectedText}`;
          break;
        case 'code':
          formattedText = `\`${selectedText}\``;
          break;
        case 'link':
          formattedText = `[${selectedText}](url)`;
          break;
        default:
          formattedText = selectedText;
      }

      const newContent = content.substring(0, start) + formattedText + content.substring(end);
      onUpdate({
        ...selectedParagraph,
        content: newContent
      });

      // Restore selection
      setTimeout(() => {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + formattedText.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className="flex-none bg-gray-800">
      {/* Title Input and Node Type */}
      <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center flex-1">
          <div className="relative">
            <button
              onClick={() => document.getElementById('paragraph-select')?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
            >
              <span className="text-white">{selectedParagraph.id}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            <select
              id="paragraph-select"
              value={selectedParagraph.id}
              onChange={(e) => onSelectParagraph(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              {paragraphs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.title || t.untitled}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={selectedParagraph.title}
            onChange={handleTitleChange}
            placeholder={t.enterTitle}
            className="flex-1 ml-4 px-4 py-1.5 bg-gray-600 text-white border-0 rounded focus:outline-none focus:ring-0"
          />
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">{t.nodeTypes.title}</span>
          <button
            onClick={() => handleTypeChange('normale')}
            className={`px-3 py-1 rounded text-sm font-medium mr-2 ${
              selectedParagraph.type === 'normale'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {t.nodeTypes.normal}
          </button>
          <button
            onClick={() => handleTypeChange('nodo')}
            className={`px-3 py-1 rounded text-sm font-medium mr-2 ${
              selectedParagraph.type === 'nodo'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-orange-600 hover:text-white'
            }`}
          >
            {t.nodeTypes.intermediate}
          </button>
          <button
            onClick={() => handleTypeChange('finale')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              selectedParagraph.type === 'finale'
                ? 'bg-red-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'
            }`}
          >
            {t.nodeTypes.final}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center h-10 px-2 bg-gray-800 border-b border-gray-700">
        {/* Font Selection */}
        <div className="flex items-center mr-4 border-r border-gray-600 pr-4">
          <Type size={18} className="text-gray-400 mr-2" />
          <select
            value={selectedParagraph.font || 'Arial'}
            onChange={handleFontChange}
            className="h-8 px-2 bg-gray-700 text-white border-0 rounded focus:outline-none focus:ring-0"
          >
            {fonts.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Alignment Buttons */}
        <div className="flex mr-4 border-r border-gray-600 pr-4">
          <button
            onClick={() => handleAlignmentChange('left')}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              selectedParagraph.alignment === 'left' ? 'bg-gray-600' : 'hover:bg-gray-700'
            }`}
            title={t.alignment.left}
          >
            <AlignLeft size={18} className="text-gray-300" />
          </button>
          <button
            onClick={() => handleAlignmentChange('center')}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              selectedParagraph.alignment === 'center' ? 'bg-gray-600' : 'hover:bg-gray-700'
            }`}
            title={t.alignment.center}
          >
            <AlignCenter size={18} className="text-gray-300" />
          </button>
          <button
            onClick={() => handleAlignmentChange('right')}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              selectedParagraph.alignment === 'right' ? 'bg-gray-600' : 'hover:bg-gray-700'
            }`}
            title={t.alignment.right}
          >
            <AlignRight size={18} className="text-gray-300" />
          </button>
        </div>

        {/* Format Buttons */}
        {formatButtons.map((button) => (
          <button
            key={button.format}
            onClick={() => handleFormat(button.format)}
            title={`${button.title}${button.shortcut ? ` (${button.shortcut})` : ''}`}
            className="w-10 h-8 flex items-center justify-center rounded text-gray-300 hover:bg-gray-700 hover:text-white group relative"
          >
            {button.icon || <span className="text-sm font-medium">{button.text}</span>}
            {button.shortcut && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {button.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ParagraphEditorControls;
