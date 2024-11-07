import React, { useMemo, useCallback } from 'react';
import { Search, Plus, Image, Link2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParagraphSidebarProps } from './types';
import { translations } from './translations';

const ParagraphSidebar: React.FC<ParagraphSidebarProps> = ({
  paragraphs,
  selectedParagraph,
  isDarkMode,
  showSearch,
  searchTerm,
  showConnections,
  language,
  onAddParagraph,
  onSelectParagraph,
  onToggleSearch,
  onSearchChange,
  onToggleConnections,
  onImageEdit,
}) => {
  const t = translations[language];

  const isHashtagSearch = searchTerm.startsWith('#');
  const searchValue = isHashtagSearch ? searchTerm.slice(1).toLowerCase() : searchTerm.toLowerCase();

  const filteredParagraphs = useMemo(() => {
    if (!searchTerm) return paragraphs;

    return paragraphs.filter((p) => {
      if (isHashtagSearch) {
        return p.tags?.some(tag => tag.toLowerCase().includes(searchValue)) || false;
      }

      const matchesSearch = p.title.toLowerCase().includes(searchValue) ||
                          (p.content || '').toLowerCase().includes(searchValue);
      
      const matchesHashtag = p.tags?.some(tag => tag.toLowerCase().includes(searchValue)) || false;
      
      return matchesSearch || matchesHashtag;
    });
  }, [paragraphs, searchTerm, isHashtagSearch, searchValue]);

  const hasValidConnections = useCallback((p: typeof paragraphs[0]) => {
    const hasValidActions = p.actions.some((a) => a.text.trim() !== '' && a['N.Par.'] !== '') || false;
    const hasIncomingConnections = (p.incomingConnections?.length || 0) > 0;
    return hasValidActions || hasIncomingConnections;
  }, []);

  const matchesTagSearch = useCallback((p: typeof paragraphs[0]) => {
    if (!isHashtagSearch) return false;
    return p.tags?.some(tag => tag.toLowerCase().includes(searchValue)) || false;
  }, [isHashtagSearch, searchValue]);

  const containerVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const searchVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    },
    tap: {
      scale: 0.98,
      y: 0
    }
  };

  const connectionsVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { 
      opacity: 1, 
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-72 flex-none border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-brown-200 bg-brown-100'}`}
    >
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-brown-200'}`}>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSearch}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                : 'hover:bg-brown-200 text-brown-600 hover:text-brown-700'
            }`}
          >
            <Search size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95, y: 0 }}
            onClick={onAddParagraph}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            {t.addParagraph}
          </motion.button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              variants={searchVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-brown-200'}`}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-white focus:ring-blue-500'
                      : 'bg-brown-50 text-brown-800 focus:ring-brown-500'
                  } focus:outline-none focus:ring-2 shadow-inner`}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <AnimatePresence>
            {filteredParagraphs.map((p, index) => (
              <motion.div
                key={p.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                whileTap="tap"
                custom={index}
                onClick={() => onSelectParagraph(p.id)}
                className={`
                  rounded-lg cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-shadow
                  ${p.type === 'nodo' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                    p.type === 'finale' ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                    'bg-gradient-to-br from-blue-500 to-blue-600'}
                  ${selectedParagraph === p.id ? 'ring-2 ring-white ring-opacity-100' : ''}
                  ${showConnections === p.id ? 'ring-2 ring-green-400 ring-opacity-100' : ''}
                `}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <motion.span 
                        className="text-sm font-bold text-white bg-black bg-opacity-20 px-2 py-1 rounded-md"
                        whileHover={{ scale: 1.1 }}
                      >
                        {p.id}
                      </motion.span>
                      <span className="text-sm font-medium text-white truncate">
                        {p.title || t.untitled}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {p.image && (
                        <motion.button
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageEdit(p.id);
                          }}
                          className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
                        >
                          <Image size={14} className="text-white" />
                        </motion.button>
                      )}
                      {matchesTagSearch(p) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          className="p-1.5 rounded-full bg-white bg-opacity-20"
                        >
                          <Hash size={14} className="text-white" />
                        </motion.div>
                      )}
                      {hasValidConnections(p) && (
                        <motion.button
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleConnections(showConnections === p.id ? null : p.id);
                          }}
                          className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
                        >
                          <Link2 size={14} className="text-white" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showConnections === p.id && (
                      <motion.div
                        variants={connectionsVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="mt-3 text-sm text-white bg-black bg-opacity-10 rounded-lg p-2"
                      >
                        {p.incomingConnections && p.incomingConnections.length > 0 && (
                          <div className="mb-2">
                            <span className="opacity-90 font-medium">{t.connections.incoming}: {p.incomingConnections.length}</span>
                            <div className="pl-3 mt-1 space-y-1">
                              {p.incomingConnections.map((id) => (
                                <div key={id} className="opacity-75 truncate hover:opacity-100 transition-opacity">
                                  {paragraphs.find((para) => para.id === id)?.title || `${t.connections.paragraph} ${id}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').length > 0 && (
                          <div>
                            <span className="opacity-90 font-medium">{t.connections.outgoing}: {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').length}</span>
                            <div className="pl-3 mt-1 space-y-1">
                              {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').map((action, idx) => (
                                <div key={idx} className="opacity-75 truncate hover:opacity-100 transition-opacity">
                                  {paragraphs.find((para) => para.id === Number(action['N.Par.']))?.title || `${t.connections.paragraph} ${action['N.Par.']}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ParagraphSidebar;
