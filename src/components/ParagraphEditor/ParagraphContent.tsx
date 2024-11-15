import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParagraphContentProps } from './types';
import { translations } from './translations';
import { useHistory } from './hooks/useHistory';

const ParagraphContent: React.FC<ParagraphContentProps> = ({
  selectedParagraph,
  onUpdate,
  isDarkMode,
  language,
}) => {
  const t = translations[language];
  const {
    content,
    handleContentChange,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory(selectedParagraph, onUpdate);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle undo/redo keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
  }, [undo, redo]);

  const stats = useMemo(() => {
    const currentContent = content || '';
    const words = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0;
    const characters = currentContent.length;
    return { words, characters };
  }, [content]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const textareaVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30
      } 
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full flex flex-col bg-gray-800"
      >
        <motion.div
          className="flex-1 flex flex-col"
          variants={textareaVariants}
        >
          <textarea
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`
              flex-1 w-full
              bg-gray-800 text-gray-100 
              border-0 resize-none 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
              transition-all duration-200
              ${selectedParagraph.font || 'font-mono'} 
              text-lg leading-relaxed
              scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800
              hover:scrollbar-thumb-gray-500
            `}
            placeholder={t.enterContent}
            spellCheck={true}
            style={{
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937',
              textAlign: selectedParagraph.alignment || 'left',
              padding: '2rem 4rem'
            }}
          />

          <motion.div 
            className="flex-none flex justify-between items-center px-8 py-4 text-sm text-gray-400 border-t border-gray-700 bg-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">{t.stats.autosaving}</span>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <motion.div 
                className="flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-medium">{selectedParagraph.type}</span>
              </motion.div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={undo}
                  disabled={!canUndo}
                  whileHover={{ scale: canUndo ? 1.05 : 1 }}
                  className={`flex items-center gap-1 ${canUndo ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
                  title="Undo (Ctrl+Z)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7v6h6" />
                    <path d="M3 13c0-4.97 4.03-9 9-9a9 9 0 0 1 9 9" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={redo}
                  disabled={!canRedo}
                  whileHover={{ scale: canRedo ? 1.05 : 1 }}
                  className={`flex items-center gap-1 ${canRedo ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 7v6h-6" />
                    <path d="M21 13c0-4.97-4.03-9-9-9a9 9 0 0 0-9 9" />
                  </svg>
                </motion.button>
              </div>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <span className="text-gray-500">{t.stats.words}:</span>
                <span className="text-gray-300">{stats.words}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <span className="text-gray-500">{t.stats.characters}:</span>
                <span className="text-gray-300">{stats.characters}</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ParagraphContent;
