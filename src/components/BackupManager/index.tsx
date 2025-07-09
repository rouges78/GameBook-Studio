import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

interface BackupFile {
  filename: string;
  createdAt: string;
}

const translations = {
  title: 'Gestione Backup',
  backToSettings: 'Torna alle Impostazioni',
  operations: {
    inProgress: 'Operazione in corso...',
    success: 'Operazione completata con successo.',
    error: {
      load: 'Errore durante il caricamento dei backup.',
      restore: 'Errore durante il ripristino del backup.',
      generic: 'Operazione fallita.',
    },
  },
  table: {
    date: 'Data Creazione',
    file: 'Nome File',
    actions: 'Azioni',
    noBackups: 'Nessun backup trovato.',
  },
  buttons: {
    restore: 'Ripristina',
    refresh: 'Aggiorna',
  },
  confirmRestore: {
    title: 'Conferma Ripristino',
    message: 'Sei sicuro di voler ripristinare questo backup? Tutti i dati attuali non salvati verranno persi.',
    confirm: 'Ripristina',
    cancel: 'Annulla',
  },
};

interface BackupManagerProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export' | 'backupManager') => void;
  isDarkMode: boolean;
}

const BackupManager: React.FC<BackupManagerProps> = ({ setCurrentPage, isDarkMode }) => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringFile, setRestoringFile] = useState<string | null>(null);

  const handleRestore = async (filename: string) => {
    if (window.confirm(translations.confirmRestore.message)) {
      setRestoringFile(filename);
      setError(null);
      try {
        const result = await window.electron.backup.restore(filename);
        if (result.success) {
          alert(result.message);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error('Restore failed:', err);
        const errorMessage = err instanceof Error ? err.message : translations.operations.error.restore;
        setError(errorMessage);
      } finally {
        setRestoringFile(null);
      }
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const backupList = await window.electron.backup.list();
      setBackups(backupList);
    } catch (err) {
      console.error('Failed to load backups:', err);
      const errorMessage = err instanceof Error ? err.message : translations.operations.error.load;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  

  

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

    return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('settings')}
            className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}
          >
            <ArrowLeft size={20} className="mr-2" />
            {translations.backToSettings}
          </button>
          <h1 className="text-2xl font-bold">{translations.title}</h1>
          <button
            onClick={loadBackups}
            disabled={loading}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} disabled:opacity-50`}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-4 rounded bg-red-100 text-red-800 flex items-center">
              <AlertTriangle size={20} className="mr-3" />
              <span>{error}</span>
            </div>
          )}

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
            <table className="min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">
                    {translations.table.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">
                    {translations.table.file}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">
                    {translations.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Caricamento...
                      </div>
                    </td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      {translations.table.noBackups}
                    </td>
                  </tr>
                ) : (
                  backups.map((backup) => (
                    <tr key={backup.filename}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(backup.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
                        {backup.filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRestore(backup.filename)}
                          disabled={restoringFile === backup.filename || loading}
                          className={`px-4 py-2 text-sm rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {restoringFile === backup.filename ? 'Ripristino...' : translations.buttons.restore}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BackupManager;
