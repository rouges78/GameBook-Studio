import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed';
    items: string[];
  }[];
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

const changelog = {
  it: [
    {
      version: '1.3.0',
      date: '07-01-2025',
      changes: [
        {
          type: 'added',
          items: [
            'Miglioramenti di accessibilità: aggiunto aria-label per input file'
          ]
        },
        {
          type: 'removed',
          items: [
            'Rimossa funzionalità deprecata di regolazione immagine'
          ]
        },
        {
          type: 'fixed',
          items: [
            'Pulizia problemi di codifica nei componenti UI'
          ]
        }
      ]
    },
    {
      version: '1.2.3',
      date: '31-12-2024',
      changes: [
        {
          type: 'changed',
          items: [
            'Migliorato il layout dell\'header nel Backup Manager',
            'Aggiornato lo stile del pulsante "Torna alla Home" per uniformarlo al componente Impostazioni'
          ]
        }
      ]
    },
    {
      version: '0.9.11',
      date: '30-12-2024',
      changes: [
        {
          type: 'changed',
          items: [
            'Aggiornato il numero di versione in ChangelogModal.tsx',
            'Aggiunto il pulsante "Torna alla Home" in più pagine',
            'Aggiunta colonna sinistra nella pagina Mappa per impostazioni future e informazioni',
            'Aggiunto il pulsante "Torna all\'editor paragrafi" nella pagina Mappa'
          ]
        }
      ]
    },
    {
      version: '0.9.10',
      date: '30-12-2024',
      changes: [
        {
          type: 'changed',
          items: [
            'Aggiornato il numero di versione in ChangelogModal.tsx',
            'Aggiunto il pulsante "Torna alla Home" in più pagine',
            'Aggiunta colonna sinistra nella pagina Mappa per impostazioni future e informazioni',
            'Aggiunto il pulsante "Torna all\'editor paragrafi" nella pagina Mappa'
          ]
        }
      ]
    },
    {
      version: '0.9.7',
      date: '24-11-2024',
      changes: [
        {
          type: 'added',
          items: [
            'Sistema di cache avanzato per i progetti',
            'Prefetching intelligente dei progetti correlati',
            'Changelog modale nella dashboard',
            'Miglioramenti alla gestione della memoria'
          ]
        },
        {
          type: 'changed',
          items: [
            'Ottimizzazione delle prestazioni del caricamento progetti',
            'Migliorata la gestione degli errori'
          ]
        },
        {
          type: 'fixed',
          items: [
            'Risolti problemi di caricamento progetti',
            'Corretti errori nella validazione dei dati'
          ]
        }
      ]
    },
    {
      version: '0.9.0',
      date: '01-11-2024',
      changes: [
        {
          type: 'added',
          items: [
            'Prima release pubblica',
            'Editor di paragrafi interattivo',
            'Gestione progetti',
            'Supporto multilingua (IT/EN)',
            'Tema chiaro/scuro'
          ]
        }
      ]
    }
  ],
  en: [
    {
      version: '1.3.0',
      date: '07-01-2025',
      changes: [
        {
          type: 'added',
          items: [
            'Accessibility improvements: added aria-label to file input'
          ]
        },
        {
          type: 'removed',
          items: [
            'Removed deprecated image adjustment functionality'
          ]
        },
        {
          type: 'fixed',
          items: [
            'Cleaned up encoding issues in UI components'
          ]
        }
      ]
    },
    {
      version: '1.2.3',
      date: '31-12-2024',
      changes: [
        {
          type: 'changed',
          items: [
            'Improved header layout in Backup Manager',
            'Updated "Return to Home" button styling to match Settings component'
          ]
        }
      ]
    },
    {
      version: '0.9.11',
      date: '30-12-2024',
      changes: [
        {
          type: 'changed',
          items: [
            'Updated version number in ChangelogModal.tsx',
            'Added "Return to Home" button in multiple pages',
            'Added left column in Story Map page for future settings and info',
            'Added "Return to Paragraph Editor" button in Story Map page'
          ]
        }
      ]
    },
    {
      version: '0.9.7',
      date: '25-11-2024',
      changes: [
        {
          type: 'added',
          items: [
            'Advanced project caching system',
            'Intelligent project prefetching',
            'Changelog modal in dashboard',
            'Memory management improvements'
          ]
        },
        {
          type: 'changed',
          items: [
            'Optimized project loading performance',
            'Improved error handling'
          ]
        },
        {
          type: 'fixed',
          items: [
            'Fixed project loading issues',
            'Fixed data validation errors'
          ]
        }
      ]
    },
    {
      version: '0.9.0',
      date: '01-11-2024',
      changes: [
        {
          type: 'added',
          items: [
            'First public release',
            'Interactive paragraph editor',
            'Project management',
            'Multilanguage support (IT/EN)',
            'Light/Dark theme'
          ]
        }
      ]
    }
  ]
};

const translations = {
  it: {
    changelog: 'Changelog',
    added: 'Aggiunto',
    changed: 'Modificato',
    fixed: 'Risolto',
    removed: 'Rimosso'
  },
  en: {
    changelog: 'Changelog',
    added: 'Added',
    changed: 'Changed',
    fixed: 'Fixed',
    removed: 'Removed'
  }
};

const getChangeTypeColor = (type: string) => {
  switch (type) {
    case 'added':
      return 'text-green-500';
    case 'changed':
      return 'text-blue-500';
    case 'fixed':
      return 'text-yellow-500';
    case 'removed':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose, isDarkMode, language }) => {
  const t = translations[language];
  const currentChangelog = changelog[language];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <h2 className="text-xl font-semibold">{t.changelog}</h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full hover:bg-opacity-10 ${
                isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
              }`}
              title={language === 'it' ? 'Chiudi' : 'Close'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentChangelog.map((entry, index) => (
              <div key={entry.version} className={index > 0 ? 'mt-8' : ''}>
                <div className="flex items-baseline gap-3 mb-4">
                  <h3 className="text-lg font-semibold">v{entry.version}</h3>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {entry.date}
                  </span>
                </div>

                <div className="space-y-4">
                  {entry.changes.map((change, changeIndex) => (
                    <div key={changeIndex}>
                      <h4 className={`font-medium mb-2 ${getChangeTypeColor(change.type)}`}>
                        {t[change.type as keyof typeof t]}
                      </h4>
                      <ul className={`list-disc list-inside space-y-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {change.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangelogModal;
