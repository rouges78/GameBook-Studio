"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const Sidebar = ({ isDarkMode, setIsDarkMode, language, setLanguage, setCurrentPage, onLogout, }) => {
    const translations = {
        it: {
            preferences: "Preferenze",
            darkMode: "Modalità Scura",
            language: "Lingua",
            italian: "Italiano",
            english: "Inglese",
            library: "Libreria",
            themeEditor: "Editor Tema",
            settings: "Impostazioni",
            help: "Aiuto",
            logout: "Esci",
            backupManager: "Gestione Backup"
        },
        en: {
            preferences: "Preferences",
            darkMode: "Dark Mode",
            language: "Language",
            italian: "Italian",
            english: "English",
            library: "Library",
            themeEditor: "Theme Editor",
            settings: "Settings",
            help: "Help",
            logout: "Logout",
            backupManager: "Backup Manager"
        }
    };
    const t = translations[language];
    const handleLogout = () => {
        window.electron?.closeWindow();
    };
    return (<aside className={`w-64 p-6 flex flex-col ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-6">{t.preferences}</h2>
      <div className="mb-6">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center">
            {isDarkMode ? <lucide_react_1.Moon size={18} className="mr-2 text-blue-400"/> : <lucide_react_1.Sun size={18} className="mr-2 text-blue-500"/>}
            {t.darkMode}
          </span>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${isDarkMode ? 'bg-blue-600' : 'bg-gray-400'}`}>
            <span className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </label>
      </div>
      <h2 className="text-xl font-bold mb-6">{t.language}</h2>
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input type="radio" checked={language === 'it'} onChange={() => setLanguage('it')} className={`form-radio h-5 w-5 ${isDarkMode ? 'text-blue-600' : 'text-gray-600'}`}/>
          <span className="ml-2">{t.italian}</span>
        </label>
      </div>
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input type="radio" checked={language === 'en'} onChange={() => setLanguage('en')} className={`form-radio h-5 w-5 ${isDarkMode ? 'text-blue-600' : 'text-gray-600'}`}/>
          <span className="ml-2">{t.english}</span>
        </label>
      </div>
      <div className="flex-grow">
        <button onClick={() => setCurrentPage('library')} className={`w-full mb-4 ${isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-gray-50'} font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors`}>
          <lucide_react_1.BookOpen size={18} className="mr-2"/>
          {t.library}
        </button>
        <button onClick={() => setCurrentPage('backupManager')} className={`w-full mb-4 ${isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-gray-50'} font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors`}>
          <lucide_react_1.Database size={18} className="mr-2"/>
          {t.backupManager}
        </button>
        <button onClick={() => setCurrentPage('themeEditor')} className={`w-full mb-4 ${isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-gray-50'} font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors`}>
          <lucide_react_1.Palette size={18} className="mr-2"/>
          {t.themeEditor}
        </button>
        <button onClick={() => setCurrentPage('settings')} className={`w-full mb-4 ${isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-400 hover:bg-gray-500 text-gray-50'} font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors`}>
          <lucide_react_1.Settings size={18} className="mr-2"/>
          {t.settings}
        </button>
        <button onClick={() => setCurrentPage('help')} className={`w-full mb-4 ${isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-gray-50'} font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors`}>
          <lucide_react_1.HelpCircle size={18} className="mr-2"/>
          {t.help}
        </button>
      </div>
      <button onClick={handleLogout} className={`w-full ${isDarkMode
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'} font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors`}>
        <lucide_react_1.LogOut size={18} className="mr-2"/>
        {t.logout}
      </button>
    </aside>);
};
exports.default = Sidebar;
