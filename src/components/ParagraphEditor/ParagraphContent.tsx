import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, FileText, Trash2, Image, Map } from 'lucide-react';
import { ParagraphContentProps } from './types';
import { translations } from './translations';

const ParagraphContent: React.FC<ParagraphContentProps> = ({
  selectedParagraph,
  onUpdate,
  isDarkMode,
  language,
  onShowImageEditor,
  onShowStoryMap,
  onDelete,
  onExport,
  onSave,
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
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 flex flex-col min-h-0 bg-gray-800"
      >
        <motion.textarea
          value={selectedParagraph.content || ''}
          onChange={handleContentChange}
          className={`flex-1 w-full h-[calc(100vh-12rem)] p-8 bg-gray-800 text-gray-100 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 ${
            selectedParagraph.font || 'font-mono'
          } text-lg leading-relaxed`}
          placeholder={t.enterContent}
          spellCheck={true}
          style={{
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4B5563 #1F2937',
            textAlign: selectedParagraph.alignment || 'left'
          }}
          variants={textareaVariants}
        />

        <motion.div 
          className="flex justify-between items-center px-8 py-3 text-sm text-gray-400 border-t border-gray-700 bg-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{t.stats.autosaving}</span>
          </div>
          <div className="flex gap-6">
            <span>{t.stats.words}: {stats.words}</span>
            <span>{t.stats.characters}: {stats.characters}</span>
          </div>
        </motion.div>

        {/* Action buttons near footer */}
        <motion.div 
          className="flex items-center justify-between px-6 py-4 bg-gray-800 border-t border-gray-700"
          variants={buttonVariants}
          initial="initial"
          animate="animate"
        >
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onShowImageEditor}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
          >
            <Image size={18} />
            {selectedParagraph.image ? t.modifyImage : t.addImage}
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onShowStoryMap}
            className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
          >
            <Map size={18} />
            {t.showMap}
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
            >
              <Trash2 size={18} />
              {t.delete}
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onExport}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
            >
              <FileText size={18} />
              {t.export}
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
            >
              <Save size={18} />
              {t.save}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ParagraphContent;
