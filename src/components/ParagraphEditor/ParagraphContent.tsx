import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParagraphContentProps } from './types';
import { translations } from './translations';

const ParagraphContent: React.FC<ParagraphContentProps> = ({
  selectedParagraph,
  onUpdate,
  isDarkMode,
  language,
}) => {
  const t = translations[language];

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...selectedParagraph,
      content: e.target.value
    });
  };

  const stats = useMemo(() => {
    const content = selectedParagraph.content || '';
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    return { words, characters };
  }, [selectedParagraph.content]);

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
        className="flex-1 flex flex-col min-h-0 bg-gray-800 relative"
      >
        <motion.div
          className="absolute inset-0 flex flex-col"
          variants={textareaVariants}
        >
          <textarea
            value={selectedParagraph.content || ''}
            onChange={handleContentChange}
            className={`
              flex-1 w-full h-full p-8 
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
              minHeight: 'calc(100vh - 16rem)', // Reduced height to make room for bottom controls
              padding: '2rem 4rem'
            }}
          />

          <motion.div 
            className="flex justify-between items-center px-8 py-4 text-sm text-gray-400 border-t border-gray-700 bg-gray-900"
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
