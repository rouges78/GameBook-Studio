import React from 'react';
import { Node } from '../types';

interface SearchBarProps {
  nodes: Node[];
  onNodeSelect: (id: number) => void;
  language?: 'it' | 'en';
}

const translations = {
  it: {
    searchPlaceholder: 'Cerca nodo...',
    noResults: 'Nessun risultato',
    type: {
      normale: 'Normale',
      nodo: 'Nodo',
      finale: 'Finale'
    }
  },
  en: {
    searchPlaceholder: 'Search node...',
    noResults: 'No results',
    type: {
      normale: 'Normal',
      nodo: 'Node',
      finale: 'Final'
    }
  }
};

export const SearchBar: React.FC<SearchBarProps> = ({
  nodes,
  onNodeSelect,
  language = 'it'
}) => {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const t = translations[language];

  const filteredNodes = React.useMemo(() => {
    if (!search) return [];
    const searchLower = search.toLowerCase();
    return nodes.filter(node => 
      node.id.toString().includes(searchLower) ||
      node.title.toLowerCase().includes(searchLower) ||
      t.type[node.type].toLowerCase().includes(searchLower)
    ).slice(0, 5); // Limit to 5 results for better performance
  }, [nodes, search, t]);

  const handleSelect = (id: number) => {
    onNodeSelect(id);
    setSearch('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t.searchPlaceholder}
          className="w-64 px-4 py-2 bg-[#1A2B3B] text-gray-200 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
        />

        {isOpen && search && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A2B3B] rounded-lg border border-gray-700 shadow-lg max-h-60 overflow-auto">
            {filteredNodes.length > 0 ? (
              filteredNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => handleSelect(node.id)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-600 transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-200">#{node.id} {node.title}</span>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    node.type === 'finale' ? 'bg-red-900/50 text-red-200' :
                    node.type === 'nodo' ? 'bg-green-900/50 text-green-200' :
                    'bg-blue-900/50 text-blue-200'
                  } group-hover:bg-opacity-70`}>
                    {t.type[node.type]}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">
                {t.noResults}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
