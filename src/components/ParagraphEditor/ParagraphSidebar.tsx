import React, { useMemo, useCallback } from 'react';
import { Search, Plus, Image, Link2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParagraphSidebarProps, Paragraph } from './types';
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

    return paragraphs.filter((p: Paragraph) => {
      const matchesTitle = p.title.toLowerCase().includes(searchValue);
      const matchesContent = (p.content || '').toLowerCase().includes(searchValue);
      const matchesTags = p.tags?.some((tag: string) => tag.toLowerCase().includes(searchValue)) || false;
      
      if (isHashtagSearch) {
        return matchesTags;
      }
      
      return matchesTitle || matchesContent || matchesTags;
    });
  }, [paragraphs, searchTerm, isHashtagSearch, searchValue]);

  const hasValidConnections = useCallback((p: Paragraph) => {
    const hasValidActions = p.actions.some((a) => a.text.trim() !== '' && a['N.Par.'] !== '') || false;
    const hasIncomingConnections = (p.incomingConnections?.length || 0) > 0;
    return hasValidActions || hasIncomingConnections;
  }, []);

  const matchesTagSearch = useCallback((p: Paragraph) => {
    if (!isHashtagSearch) return false;
    return p.tags?.some((tag: string) => tag.toLowerCase().includes(searchValue)) || false;
  }, [isHashtagSearch, searchValue]);

  const handleSelectParagraph = (id: number) => {
    onSelectParagraph(id);
  };

  const scrollVariants = {
    initial: {
      opacity: 0,
      height: 0,
      scaleY: 0,
      transformOrigin: "top"
    },
    animate: {
      opacity: 1,
      height: "auto",
      scaleY: 1,
      transition: {
        height: {
          type: "spring",
          stiffness: 100,
          damping: 15
        },
        opacity: {
          duration: 0.2
        },
        scaleY: {
          type: "spring",
          stiffness: 120,
          damping: 20
        }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      scaleY: 0,
      transition: {
        height: {
          type: "spring",
          stiffness: 100,
          damping: 15
        },
        opacity: {
          duration: 0.2
        },
        scaleY: {
          type: "spring",
          stiffness: 120,
          damping: 20
        }
      }
    }
  };

  return (
    <div className="w-56 flex-none border-r border-gray-700 bg-gray-800">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <button
            onClick={onToggleSearch}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-300"
          >
            <Search size={16} />
          </button>
          <button
            onClick={onAddParagraph}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={14} />
            {t.addParagraph}
          </button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full px-2 py-1.5 rounded-lg text-xs bg-gray-700 text-white focus:ring-blue-500 focus:outline-none focus:ring-2 shadow-inner"
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <AnimatePresence>
            {filteredParagraphs.map((p: Paragraph) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                onClick={() => handleSelectParagraph(p.id)}
                className={`
                  rounded-lg cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-shadow
                  ${p.type === 'nodo' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                    p.type === 'finale' ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                    'bg-gradient-to-br from-blue-500 to-blue-600'}
                  ${selectedParagraph === p.id ? 'ring-2 ring-white ring-opacity-100' : ''}
                  ${showConnections === p.id ? 'ring-2 ring-green-400 ring-opacity-100' : ''}
                `}
              >
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-white bg-black bg-opacity-20 px-1.5 py-0.5 rounded">
                        {p.id}
                      </span>
                      <span className="text-xs font-medium text-white truncate">
                        {p.title || t.untitled}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      {p.image && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageEdit(p.id);
                          }}
                          className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
                        >
                          <Image size={12} className="text-white" />
                        </button>
                      )}
                      {matchesTagSearch(p) && (
                        <div className="p-1 rounded-full bg-white bg-opacity-20">
                          <Hash size={12} className="text-white" />
                        </div>
                      )}
                      {hasValidConnections(p) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleConnections(showConnections === p.id ? null : p.id);
                          }}
                          className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
                        >
                          <Link2 size={12} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showConnections === p.id && (
                      <motion.div
                        variants={scrollVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="mt-2 text-xs text-white bg-black bg-opacity-10 rounded-lg p-2 overflow-hidden"
                        style={{
                          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                          backgroundSize: '100% 8px'
                        }}
                      >
                        {p.incomingConnections && p.incomingConnections.length > 0 && (
                          <div className="mb-2">
                            <span className="opacity-90 font-medium">{t.connections.incoming}: {p.incomingConnections.length}</span>
                            <div className="pl-2 mt-1 space-y-1">
                              {p.incomingConnections.map((id: number) => (
                                <div key={id} className="opacity-75 truncate hover:opacity-100 transition-opacity">
                                  {paragraphs.find((para: Paragraph) => para.id === id)?.title || `${t.connections.paragraph} ${id}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').length > 0 && (
                          <div>
                            <span className="opacity-90 font-medium">{t.connections.outgoing}: {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').length}</span>
                            <div className="pl-2 mt-1 space-y-1">
                              {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').map((action, idx) => (
                                <div key={idx} className="opacity-75 truncate hover:opacity-100 transition-opacity">
                                  {paragraphs.find((para: Paragraph) => para.id === Number(action['N.Par.']))?.title || `${t.connections.paragraph} ${action['N.Par.']}`}
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
    </div>
  );
};

export default ParagraphSidebar;
