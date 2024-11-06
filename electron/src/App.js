"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeContext = void 0;
const react_1 = __importStar(require("react"));
const Header_1 = __importDefault(require("./components/Header"));
const Dashboard_1 = __importDefault(require("./components/Dashboard"));
const CreateNewProject_1 = __importDefault(require("./components/CreateNewProject"));
const index_1 = __importDefault(require("./components/ParagraphEditor/index"));
const Footer_1 = __importDefault(require("./components/Footer"));
const Library_1 = __importDefault(require("./components/Library"));
const ThemeEditor_1 = __importDefault(require("./components/ThemeEditor"));
const Settings_1 = __importDefault(require("./components/Settings"));
const Help_1 = __importDefault(require("./components/Help"));
const ExportPage_1 = __importDefault(require("./components/ExportPage"));
const Notification_1 = __importDefault(require("./components/Notification"));
const UpdateNotification_1 = __importDefault(require("./components/UpdateNotification"));
const ErrorBoundary_1 = __importDefault(require("./components/UpdateNotification/ErrorBoundary"));
const BackupManager_1 = __importDefault(require("./components/BackupManager"));
const TelemetryDashboard_1 = require("./components/TelemetryDashboard");
const useAutoUpdater_1 = require("./hooks/useAutoUpdater");
const storage_1 = require("./utils/storage");
const autoBackup_1 = require("./utils/autoBackup");
const package_json_1 = __importDefault(require("../package.json"));
exports.ThemeContext = (0, react_1.createContext)({
    theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        textColor: '#F9FAFB',
        backgroundColor: '#111827',
        fontSize: 16,
        fontFamily: 'Roboto',
        borderRadius: 4,
        buttonStyle: 'rounded',
        spacing: 16,
        paragraphBackground: '#1F2937',
        animationSpeed: 300,
        iconSet: 'default',
        layout: 'grid',
    },
    setTheme: () => { },
});
const App = () => {
    const [currentPage, setCurrentPage] = (0, react_1.useState)('dashboard');
    const [isDarkMode, setIsDarkMode] = (0, react_1.useState)(true);
    const [language, setLanguage] = (0, react_1.useState)('it');
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [currentProject, setCurrentProject] = (0, react_1.useState)(null);
    const [lastBackup, setLastBackup] = (0, react_1.useState)('');
    const [notification, setNotification] = (0, react_1.useState)(null);
    const [theme, setTheme] = (0, react_1.useState)({
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        textColor: '#F9FAFB',
        backgroundColor: '#111827',
        fontSize: 16,
        fontFamily: 'Roboto',
        borderRadius: 4,
        buttonStyle: 'rounded',
        spacing: 16,
        paragraphBackground: '#1F2937',
        animationSpeed: 300,
        iconSet: 'default',
        layout: 'grid',
    });
    const { updateAvailable, updateInfo, downloadProgress, isDownloading, updateDownloaded, error, isRetrying, startDownload, installUpdate, dismissUpdate, retryOperation } = (0, useAutoUpdater_1.useAutoUpdater)();
    const transformParagraphsForExport = (paragraphs) => {
        return paragraphs.map((p, index) => ({
            id: Number(p.id),
            title: `Paragraph ${index + 1}`,
            content: p.text,
            actions: p.choices.map(choice => ({
                text: choice.text,
                'N.Par.': choice.destination
            })),
            type: 'normale'
        }));
    };
    (0, react_1.useEffect)(() => {
        const initializeApp = async () => {
            try {
                await (0, storage_1.migrateProjectData)();
                console.log('Project migration completed');
                const savedProjects = await (0, storage_1.getProjects)();
                setProjects(savedProjects || []);
                const dbContent = await (0, storage_1.debugDatabase)();
                console.log('Database content:', dbContent);
            }
            catch (error) {
                console.error('Failed to initialize app:', error);
                showNotification('Errore nell\'inizializzazione dell\'app', 'error');
            }
        };
        initializeApp();
        (0, autoBackup_1.startAutoBackup)(5);
        console.log('Auto backup initialized in App component');
        return () => {
            (0, autoBackup_1.stopAutoBackup)();
            console.log('Auto backup stopped in App component cleanup');
        };
    }, []);
    const showNotification = (0, react_1.useCallback)((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);
    const handleCreateProject = (0, react_1.useCallback)(async (project) => {
        try {
            await (0, storage_1.saveProject)(project);
            setProjects(prevProjects => [...prevProjects, project]);
            setCurrentProject(project);
            showNotification('Progetto creato con successo', 'success');
        }
        catch (error) {
            console.error('Failed to create project:', error);
            showNotification('Errore nella creazione del progetto', 'error');
        }
    }, []);
    const handleSaveProject = (0, react_1.useCallback)(async (project) => {
        try {
            await (0, storage_1.saveProject)(project);
            setProjects(prevProjects => prevProjects.map((p) => (p.bookTitle === project.bookTitle ? project : p)));
            if (currentProject?.bookTitle === project.bookTitle) {
                setCurrentProject(project);
            }
            showNotification('Progetto salvato con successo', 'success');
            setLastBackup(new Date().toLocaleString());
        }
        catch (error) {
            console.error('Failed to save project:', error);
            showNotification('Errore nel salvataggio del progetto', 'error');
        }
    }, [currentProject]);
    const handleDeleteProject = (0, react_1.useCallback)(async (bookTitle) => {
        try {
            await (0, storage_1.deleteProject)(bookTitle);
            setProjects((prevProjects) => prevProjects.filter((p) => p.bookTitle !== bookTitle));
            showNotification('Progetto eliminato con successo', 'success');
        }
        catch (error) {
            console.error('Failed to delete project:', error);
            showNotification('Errore nell\'eliminazione del progetto', 'error');
        }
    }, []);
    const handleUpdateLastBackup = (0, react_1.useCallback)((date) => {
        setLastBackup(date);
    }, []);
    const handleLogout = (0, react_1.useCallback)(() => {
        window.electron?.closeWindow();
    }, []);
    return (<exports.ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <Header_1.default isDarkMode={isDarkMode} version={package_json_1.default.version}/>
        {currentPage === 'dashboard' && (<Dashboard_1.default isDarkMode={isDarkMode} setCurrentPage={setCurrentPage} setIsDarkMode={setIsDarkMode} language={language} setLanguage={setLanguage} projects={projects} setCurrentProject={setCurrentProject} onLogout={handleLogout}/>)}
        {currentPage === 'createProject' && (<CreateNewProject_1.default setCurrentPage={setCurrentPage} onCreateProject={handleCreateProject} isDarkMode={isDarkMode} language={language}/>)}
        {currentPage === 'paragraphEditor' && currentProject && (<index_1.default setCurrentPage={setCurrentPage} bookTitle={currentProject.bookTitle} author={currentProject.author} onSaveProject={handleSaveProject} isDarkMode={isDarkMode} language={language} initialParagraphs={currentProject.paragraphs} initialMapSettings={currentProject.mapSettings} updateLastBackup={handleUpdateLastBackup}/>)}
        {currentPage === 'library' && (<Library_1.default setCurrentPage={setCurrentPage} books={projects} isDarkMode={isDarkMode} onEditBook={(bookTitle) => {
                const project = projects.find((p) => p.bookTitle === bookTitle);
                if (project) {
                    setCurrentProject(project);
                    setCurrentPage('paragraphEditor');
                }
            }} onDeleteBook={handleDeleteProject} onSaveBook={handleSaveProject} language={language}/>)}
        {currentPage === 'themeEditor' && (<ThemeEditor_1.default setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} language={language} currentTheme={theme} onThemeChange={setTheme}/>)}
        {currentPage === 'settings' && (<Settings_1.default setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} language={language}/>)}
        {currentPage === 'help' && (<Help_1.default setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} language={language}/>)}
        {currentPage === 'export' && currentProject && (<ExportPage_1.default setCurrentPage={setCurrentPage} bookTitle={currentProject.bookTitle} author={currentProject.author} paragraphs={transformParagraphsForExport(currentProject.paragraphs)} isDarkMode={isDarkMode} language={language}/>)}
        {currentPage === 'backupManager' && (<BackupManager_1.default />)}
        {currentPage === 'telemetryDashboard' && (<TelemetryDashboard_1.TelemetryDashboard isDarkMode={isDarkMode}/>)}
        <Footer_1.default projectCount={projects.length} lastBackup={lastBackup} isDarkMode={isDarkMode}/>
        {notification && (<Notification_1.default message={notification.message} type={notification.type} onClose={() => setNotification(null)} isDarkMode={isDarkMode}/>)}
        <ErrorBoundary_1.default>
          <UpdateNotification_1.default updateAvailable={updateAvailable} updateInfo={updateInfo} downloadProgress={downloadProgress} isDownloading={isDownloading} error={error} isRetrying={isRetrying} onStartDownload={startDownload} onInstallUpdate={installUpdate} onDismiss={dismissUpdate} onRetry={retryOperation}/>
        </ErrorBoundary_1.default>
      </div>
    </exports.ThemeContext.Provider>);
};
exports.default = App;
