import React, { useState } from 'react';
import { Bold, Italic, Underline, Link, Code, Quote, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, Book, Wand2, Brain } from 'lucide-react';
import { ParagraphEditorControlsProps } from './types';
import { translations } from './translations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAIChecking, setIsAIChecking] = useState(false);
  const t = translations[language];

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

  const handleAICheck = async () => {
    setIsAIChecking(true);
    try {
      // Verifica la presenza di errori grammaticali
      const content = selectedParagraph.content || '';
      
      // Qui implementeremo la logica di controllo AI
      // Per ora mostriamo solo un alert di esempio
      setTimeout(() => {
        alert('AI Check completato: Nessun errore trovato nel testo.');
        setIsAIChecking(false);
      }, 1000);
      
    } catch (error) {
      console.error('Errore durante il controllo AI:', error);
      alert('Si è verificato un errore durante il controllo AI.');
      setIsAIChecking(false);
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const getLedColor = (type: string) => {
    switch (type) {
      case 'nodo':
        return 'bg-orange-500';
      case 'finale':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
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
    { icon: <Bold size={18} />, format: 'bold', title: t.formatButtons.bold },
    { icon: <Italic size={18} />, format: 'italic', title: t.formatButtons.italic },
    { icon: <Underline size={18} />, format: 'underline', title: t.formatButtons.underline },
    { text: 'H1', format: 'heading1', title: t.formatButtons.heading1 },
    { text: 'H2', format: 'heading2', title: t.formatButtons.heading2 },
    { text: 'H3', format: 'heading3', title: t.formatButtons.heading3 },
    { icon: <Quote size={18} />, format: 'quote', title: t.formatButtons.quote },
    { icon: <Code size={18} />, format: 'code', title: t.formatButtons.code },
    { icon: <Link size={18} />, format: 'link', title: t.formatButtons.link },
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
        <div className="flex items-center flex-1 gap-2">
          <div className="relative">
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 min-w-[120px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Book size={16} className="text-blue-400" />
              <span className="text-white font-medium">{selectedParagraph.id}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-gray-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute z-50 mt-2 w-64 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 max-h-64 overflow-y-auto"
                >
                  {paragraphs.map((p) => (
                    <motion.button
                      key={p.id}
                      onClick={() => {
                        onSelectParagraph(p.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2 ${
                        selectedParagraph.id === p.id ? 'bg-gray-600' : ''
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <span className={`w-8 h-6 rounded flex items-center justify-center text-sm font-medium ${
                        p.type === 'nodo' ? 'bg-orange-600' :
                        p.type === 'finale' ? 'bg-red-600' :
                        'bg-blue-600'
                      }`}>
                        {p.id}
                      </span>
                      <span className="text-gray-200 truncate">
                        {p.title || t.untitled}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LED indicator */}
          <div className={`w-3 h-3 rounded-full ${getLedColor(selectedParagraph.type)} shadow-lg`} />
          
          {/* Title input with increased width */}
          <input
            type="text"
            value={selectedParagraph.title}
            onChange={handleTitleChange}
            placeholder={t.enterTitle}
            className="w-[600px] px-4 py-2 bg-gray-600 text-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
          />

          {/* AI Buttons with glowing effect */}
          <button
            className={`flex items-center gap-2 px-4 py-2 bg-transparent text-white rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 relative group ${
              isAIChecking ? 'animate-pulse' : ''
            }`}
            onClick={handleAICheck}
            disabled={isAIChecking}
            style={{
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
            }}
          >
            <Wand2 size={18} className={`text-white ${isAIChecking ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
            <span className={`text-white ${isAIChecking ? '' : 'group-hover:animate-pulse'}`}>
              {isAIChecking ? 'Checking...' : 'AICheck'}
            </span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-transparent text-white rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 relative group"
            onClick={() => {/* TODO: Implement AICreate */}}
            style={{
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
            }}
          >
            <Brain size={18} className="text-white group-hover:animate-pulse" />
            <span className="text-white group-hover:animate-pulse">AICreate</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>

        <div className="flex items-center">
          <span className="text-gray-400 mr-2">{t.nodeTypes.title}</span>
          <button
            onClick={() => handleTypeChange('normale')}
            className={`px-3 py-1 rounded-lg text-sm font-medium mr-2 transition-all duration-200 ${
              selectedParagraph.type === 'normale'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {t.nodeTypes.normal}
          </button>
          <button
            onClick={() => handleTypeChange('nodo')}
            className={`px-3 py-1 rounded-lg text-sm font-medium mr-2 transition-all duration-200 ${
              selectedParagraph.type === 'nodo'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-600 text-gray-300 hover:bg-orange-600 hover:text-white'
            }`}
          >
            {t.nodeTypes.intermediate}
          </button>
          <button
            onClick={() => handleTypeChange('finale')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedParagraph.type === 'finale'
                ? 'bg-red-600 text-white shadow-lg'
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
            className="h-8 px-3 bg-gray-700 text-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAlignmentChange('left')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              selectedParagraph.alignment === 'left' ? 'bg-gray-600 shadow-inner' : 'hover:bg-gray-700'
            }`}
            title={t.alignment.left}
          >
            <AlignLeft size={18} className="text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAlignmentChange('center')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              selectedParagraph.alignment === 'center' ? 'bg-gray-600 shadow-inner' : 'hover:bg-gray-700'
            }`}
            title={t.alignment.center}
          >
            <AlignCenter size={18} className="text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAlignmentChange('right')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              selectedParagraph.alignment === 'right' ? 'bg-gray-600 shadow-inner' : 'hover:bg-gray-700'
            }`}
            title={t.alignment.right}
          >
            <AlignRight size={18} className="text-gray-300" />
          </motion.button>
        </div>

        {/* Format Buttons */}
        {formatButtons.map((button) => (
          <motion.button
            key={button.format}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFormat(button.format)}
            title={button.title}
            className="w-10 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            {button.icon || <span className="text-sm font-medium">{button.text}</span>}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ParagraphEditorControls;
