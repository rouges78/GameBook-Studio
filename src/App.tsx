import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateNewProject from './components/CreateNewProject';
import ParagraphEditor from './components/ParagraphEditor/index';
import Footer from './components/Footer';
import Library from './components/Library';
import ThemeEditor from './components/ThemeEditor';
import Settings from './components/Settings';
import Help from './components/Help';
import ExportPage from './components/ExportPage';
import Notification from './components/Notification';
import UpdateNotification from './components/UpdateNotification';
import UpdateErrorBoundary from './components/UpdateNotification/ErrorBoundary';
import BackupManager from './components/BackupManager';
import { useAutoUpdater } from './hooks/useAutoUpdater';
import { saveProject, getProjects, deleteProject, debugDatabase, migrateProjectData } from './utils/storage';
import { startAutoBackup, stopAutoBackup } from './utils/autoBackup';
import { ThemeContext, defaultTheme, mochaTheme, type Theme } from './contexts/ThemeContext';
import packageJson from '../package.json';
import { PageType, Project, Paragraph } from './types'; // Importa i tipi globali
import type { Paragraph as ExportParagraph } from './components/ExportPage/types'; // Re-importato per transformParagraphsForExport

const isElectron = !!(window as any).electron;

// Mock storage for browser context
let browserProjects: Project[] = [];

interface NotificationType {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Rimuoviamo la classe ErrorBoundary locale dato che è segnalata come non utilizzata e c'è UpdateErrorBoundary
// class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const [projects, setProjects] = useState<Project[]>([]); // Userà Project da ./types
  const [currentProject, setCurrentProject] = useState<Project | null>(null); // Userà Project da ./types
  const [lastBackup, setLastBackup] = useState<string>('');
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    setTheme(isDarkMode ? defaultTheme : mochaTheme);
  }, [isDarkMode]);

  const {
    updateAvailable,
    updateInfo,
    downloadProgress,
    isDownloading,
    // updateDownloaded, // Rimosso perché segnalato come non letto
    error,
    isRetrying,
    startDownload,
    installUpdate,
    dismissUpdate,
    retryOperation
  } = useAutoUpdater();

  const transformParagraphsForExport = (paragraphs: Paragraph[]): ExportParagraph[] => {
    return paragraphs.map(p => ({
      id: Number(p.id), // Converti id in numero
      title: p.title,
      content: p.content,
      actions: p.actions, // Assumendo che Paragraph globale abbia 'actions: any[]'
      type: 'normale', // Imposta un tipo valido per ExportParagraph
      // Assicurati che ExportParagraph non abbia altri campi obbligatori non coperti da Paragraph globale
      // o aggiungili qui.
      // Per esempio, se ExportParagraph avesse campi specifici come 'customExportField',
      // dovrebbero essere aggiunti: customExportField: p.someCompatibleField || defaultValue
    }));
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (isElectron) {
          await migrateProjectData();
          console.log('Project migration completed');

          const savedProjects = await getProjects() as Project[]; // Cast a Project[] globale
          setProjects(savedProjects || []);
          
          const dbContent = await debugDatabase();
          console.log('Database content:', dbContent);
          
          startAutoBackup(0.166); // Intervallo di ~10 secondi per test
          console.log('Auto backup initialized in App component');
        } else {
          // Use browser storage
          const savedProjectsString = localStorage.getItem('projects');
          if (savedProjectsString) {
            const parsedProjects = JSON.parse(savedProjectsString) as Project[]; // Cast a Project[] globale
            browserProjects = parsedProjects;
            setProjects(browserProjects);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Errore nell\'inizializzazione dell\'app', 'error');
      }
    };

    initializeApp();

    return () => {
      if (isElectron) {
        stopAutoBackup();
        console.log('Auto backup stopped in App component cleanup');
      }
    };
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleCreateProject = useCallback(async (projectData: Omit<Project, 'id' | 'created' | 'modified' | 'lastEdited' | 'createdAt' | 'updatedAt' | 'content' | 'language' | 'title' | 'name' | 'mapSettings'> & { bookTitle: string, author: string, description?: string, paragraphs: Paragraph[], mapSettings?: Project['mapSettings'] }) => {
    try {
      const now = new Date().toISOString();
      const completeProject: Project = {
        ...projectData,
        id: `project-${Date.now()}`,
        name: projectData.bookTitle, // Assicurati che name e title siano gestiti
        title: projectData.bookTitle, // Aggiunto title per coerenza con Project globale
        created: now,
        modified: now,
        createdAt: now, // Aggiunto createdAt
        updatedAt: now, // Aggiunto updatedAt
        lastEdited: now,
        language: language, // Aggiunto language, o prendilo da projectData se disponibile
        content: '', // Aggiunto content, o prendilo da projectData se disponibile
        paragraphs: projectData.paragraphs || [], // Assicura che paragraphs sia definito
        mapSettings: projectData.mapSettings || { zoomLevel: 1, panOffset: { x: 0, y: 0} } // Fornisce un default per mapSettings
      };

      if (isElectron) {
        await saveProject(completeProject);
      } else {
        browserProjects.push(completeProject);
        localStorage.setItem('projects', JSON.stringify(browserProjects));
      }
      setProjects(prevProjects => [...prevProjects, completeProject]);
      setCurrentProject(completeProject);
      showNotification('Progetto creato con successo', 'success');
    } catch (error) {
      console.error('Failed to create project:', error);
      showNotification('Errore nella creazione del progetto', 'error');
    }
  }, []);

  const handleDeleteProject = useCallback(async (bookTitleToDelete: string) => {
    try {
      if (isElectron) {
        // Assumendo che deleteProject si aspetti bookTitle o un ID. Se si aspetta bookTitle:
        await deleteProject(bookTitleToDelete);
      } else {
        browserProjects = browserProjects.filter(p => p.bookTitle !== bookTitleToDelete);
        localStorage.setItem('projects', JSON.stringify(browserProjects));
      }
      setProjects(prevProjects => prevProjects.filter(p => p.bookTitle !== bookTitleToDelete));
      if (currentProject?.bookTitle === bookTitleToDelete) {
        setCurrentProject(null);
      }
      showNotification('Progetto eliminato con successo', 'success');
    } catch (error) {
      console.error('Failed to delete project:', error);
      showNotification('Errore nell\'eliminazione del progetto', 'error');
    }
  }, []);

  const handleSaveProject = useCallback(async (project: Project) => { // project è Project globale
    try {
      const now = new Date().toISOString();
      const updatedProject: Project = {
        ...project,
        modified: now,
        updatedAt: now, // Aggiorna anche updatedAt
        lastEdited: now
      };

      if (isElectron) {
        await saveProject(updatedProject);
      } else {
        const index = browserProjects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          browserProjects[index] = updatedProject;
        } else {
          browserProjects.push(updatedProject);
        }
        localStorage.setItem('projects', JSON.stringify(browserProjects));
      }
      setProjects(prevProjects =>
        prevProjects.map((p) => (p.id === project.id ? updatedProject : p)) // Confronta per id
      );
      if (currentProject?.id === project.id) { // Confronta per id
        setCurrentProject(updatedProject);
      }
      showNotification('Progetto salvato con successo', 'success');
      setLastBackup(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to save project:', error);
      showNotification('Errore nel salvataggio del progetto', 'error');
    }
  }, [currentProject]);

  const handleUpdateLastBackup = useCallback((date: string) => {
    setLastBackup(date);
  }, []);

  const handleLogout = useCallback(() => {
    if (isElectron) {
      window.electron['window:close']();
    }
  }, []);

  const handleNavigateToPage = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, []);

  const handleSetCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project);
  }, []);

  const renderPage = () => {

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            key="dashboard"
            isDarkMode={isDarkMode}
            setCurrentPage={handleNavigateToPage}
            setIsDarkMode={setIsDarkMode}
            language={language}
            setLanguage={setLanguage}
            projects={projects} // projects è Project[] globale
            setCurrentProject={handleSetCurrentProject} // setCurrentProject accetta Project | null globale
            onLogout={handleLogout}
          />
        );
      case 'createProject':
        return (
          <CreateNewProject
            key="create-project"
            setCurrentPage={handleNavigateToPage}
            onCreateProject={(projectData) => handleCreateProject(projectData as any)} // Adatta il tipo se necessario, o modifica handleCreateProject per accettare il tipo da CreateNewProject
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      case 'paragraphEditor':
        return currentProject ? (
          <ParagraphEditor
            key={`editor-${currentProject.id}`}
            setCurrentPage={handleNavigateToPage}
            bookTitle={currentProject.bookTitle || ''}
            author={currentProject.author || ''}
            onSaveProject={handleSaveProject}
            isDarkMode={isDarkMode}
            language={language}
            initialParagraphs={currentProject.paragraphs}
            initialMapSettings={currentProject.mapSettings}
            updateLastBackup={handleUpdateLastBackup}
          />
        ) : null;
      case 'library':
        return (
          <Library
            key="library"
            setCurrentPage={handleNavigateToPage}
            books={projects}
            isDarkMode={isDarkMode}
            onEditBook={(bookTitle: string) => {
              const projectToEdit = projects.find(p => p.bookTitle === bookTitle);
              if (projectToEdit) {
                setCurrentProject(projectToEdit);
                handleNavigateToPage('paragraphEditor');
              }
            }}
            onDeleteBook={handleDeleteProject}
            onSaveBook={handleSaveProject}
            language={language}
          />
        );
      case 'themeEditor':
        return (
          <ThemeEditor
            key="theme-editor"
            setCurrentPage={handleNavigateToPage}
            isDarkMode={isDarkMode}
            language={language}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        );
      case 'settings':
        return (
          <Settings
            key="settings"
            setCurrentPage={handleNavigateToPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      case 'help':
        return (
          <Help
            key="help"
            setCurrentPage={handleNavigateToPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      case 'export':
        return currentProject ? (
          <ExportPage
            key={`export-${currentProject.id}`}
            setCurrentPage={handleNavigateToPage}
            bookTitle={currentProject.bookTitle || ''} // Fornisce fallback
            author={currentProject.author || ''} // Fornisce fallback
            paragraphs={transformParagraphsForExport(currentProject.paragraphs)} // Usa Paragraph globale
            isDarkMode={isDarkMode}
            language={language}
          />
        ) : null;
      case 'backupManager':
        return (
          <BackupManager
            key="backup-manager"
            setCurrentPage={handleNavigateToPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <Header 
          isDarkMode={isDarkMode} 
          version={packageJson.version}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          language={language}
          onNavigateToParagraphEditor={() => handleNavigateToPage('paragraphEditor')} // Aggiunta prop mancante
        />
        {renderPage()}
        <Footer
          projectCount={projects.length}
          lastBackup={lastBackup}
          isDarkMode={isDarkMode}
          language={language}
        />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            isDarkMode={isDarkMode}
          />
        )}
        <UpdateErrorBoundary>
          <UpdateNotification
            updateAvailable={updateAvailable}
            updateInfo={updateInfo}
            downloadProgress={downloadProgress}
            isDownloading={isDownloading}
            error={error}
            isRetrying={isRetrying}
            onStartDownload={startDownload}
            onInstallUpdate={installUpdate}
            onDismiss={dismissUpdate}
            onRetry={retryOperation}
          />
        </UpdateErrorBoundary>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
