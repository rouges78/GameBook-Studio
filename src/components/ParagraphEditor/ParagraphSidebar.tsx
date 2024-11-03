import React, { useMemo, useCallback, useState } from 'react';
import { Search, Plus, Image, Link2, Hash } from 'lucide-react';
import { ParagraphSidebarProps, Action } from './types';
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
                          p.content.toLowerCase().includes(searchValue);
      
      const matchesHashtag = p.tags?.some(tag => tag.toLowerCase().includes(searchValue)) || false;
      
      return matchesSearch || matchesHashtag;
    });
  }, [paragraphs, searchTerm, isHashtagSearch, searchValue]);

  const hasValidConnections = useCallback((p: typeof paragraphs[0]) => {
    const hasValidActions = p.actions?.some((a: Action) => a.text.trim() !== '' && a['N.Par.'] !== '') || false;
    const hasIncomingConnections = (p.incomingConnections?.length || 0) > 0;
    return hasValidActions || hasIncomingConnections;
  }, []);

  const matchesTagSearch = useCallback((p: typeof paragraphs[0]) => {
    if (!isHashtagSearch) return false;
    return p.tags?.some(tag => tag.toLowerCase().includes(searchValue)) || false;
  }, [isHashtagSearch, searchValue]);

  return (
    <div className={`w-64 flex-none border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-brown-200 bg-brown-100'}`}>
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-brown-200'}`}>
          <button
            onClick={onToggleSearch}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                : 'hover:bg-brown-200 text-brown-600 hover:text-brown-700'
            }`}
          >
            <Search size={18} />
          </button>
          <button
            onClick={onAddParagraph}
            className="px-3 py-1 rounded text-sm font-medium flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} />
            {t.addParagraph}
          </button>
        </div>

        {showSearch && (
          <div className={`p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-brown-200'}`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full px-2 py-1 rounded text-sm ${
                isDarkMode
                  ? 'bg-gray-700 text-white focus:ring-blue-500'
                  : 'bg-brown-50 text-brown-800 focus:ring-brown-500'
              } focus:outline-none focus:ring-1`}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          {filteredParagraphs.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectParagraph(p.id)}
              className={`
                mb-2 rounded cursor-pointer
                ${p.type === 'nodo' ? 'bg-orange-600' : p.type === 'finale' ? 'bg-red-600' : 'bg-blue-600'}
                ${selectedParagraph === p.id ? 'ring-2 ring-white' : ''}
                ${showConnections === p.id ? 'ring-2 ring-green-500' : ''}
              `}
            >
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-white opacity-75 flex-shrink-0">
                      {p.id}.
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {p.title || t.untitled}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {p.image && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageEdit(p.id);
                        }}
                        className="p-1 rounded hover:bg-opacity-20 hover:bg-white"
                      >
                        <Image size={14} className="text-white" />
                      </button>
                    )}
                    {matchesTagSearch(p) && (
                      <Hash size={14} className="text-white" />
                    )}
                    {hasValidConnections(p) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleConnections(showConnections === p.id ? null : p.id);
                        }}
                        className="p-1 rounded hover:bg-opacity-20 hover:bg-white"
                      >
                        <Link2 size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {showConnections === p.id && (
                  <div className="mt-2 text-xs text-white">
                    {p.incomingConnections?.length > 0 && (
                      <div className="mb-1">
                        <span className="opacity-75">{t.connections.incoming}: {p.incomingConnections.length}</span>
                        <div className="pl-2">
                          {p.incomingConnections.map((id) => (
                            <div key={id} className="opacity-60 truncate">
                              {paragraphs.find((para) => para.id === id)?.title || `${t.connections.paragraph} ${id}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {p.actions?.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').length > 0 && (
                      <div>
                        <span className="opacity-75">{t.connections.outgoing}: {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').length}</span>
                        <div className="pl-2">
                          {p.actions.filter(a => a.text.trim() !== '' && a['N.Par.'] !== '').map((action, idx) => (
                            <div key={idx} className="opacity-60 truncate">
                              {paragraphs.find((para) => para.id === Number(action['N.Par.']))?.title || `${t.connections.paragraph} ${action['N.Par.']}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParagraphSidebar;
