"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const ThemeEditor = ({ setCurrentPage, isDarkMode, language, currentTheme, onThemeChange }) => {
    const translations = {
        it: {
            backToDashboard: "Torna alla Dashboard",
            themeEditor: "Editor Tema",
            colors: "Colori",
            primaryColor: "Colore Primario",
            secondaryColor: "Colore Secondario",
            textColor: "Colore Testo",
            backgroundColor: "Colore Sfondo",
            typography: "Tipografia",
            fontSize: "Dimensione Font",
            fontFamily: "Famiglia Font",
            layout: "Layout",
            borderRadius: "Raggio Bordi",
            buttonStyle: "Stile Pulsanti",
            spacing: "Spaziatura",
            paragraphBackground: "Sfondo Paragrafi",
            animation: "Animazione",
            animationSpeed: "Velocità Animazione",
            iconSet: "Set Icone",
            layoutStyle: "Stile Layout",
            saveChanges: "Salva Modifiche"
        },
        en: {
            backToDashboard: "Back to Dashboard",
            themeEditor: "Theme Editor",
            colors: "Colors",
            primaryColor: "Primary Color",
            secondaryColor: "Secondary Color",
            textColor: "Text Color",
            backgroundColor: "Background Color",
            typography: "Typography",
            fontSize: "Font Size",
            fontFamily: "Font Family",
            layout: "Layout",
            borderRadius: "Border Radius",
            buttonStyle: "Button Style",
            spacing: "Spacing",
            paragraphBackground: "Paragraph Background",
            animation: "Animation",
            animationSpeed: "Animation Speed",
            iconSet: "Icon Set",
            layoutStyle: "Layout Style",
            saveChanges: "Save Changes"
        }
    };
    const t = translations[language];
    return (<div className={`h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setCurrentPage('dashboard')} className={`mb-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}>
          <lucide_react_1.ArrowLeft size={20} className="mr-2"/>
          {t.backToDashboard}
        </button>

        <h1 className={`text-xl font-bold text-center mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-2 rounded-lg`}>
          {t.themeEditor}
        </h1>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-lg space-y-4`}>
          {/* Colors Section */}
          <section>
            <h2 className="text-lg font-semibold mb-2">{t.colors}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm">{t.primaryColor}</label>
                <input type="color" value={currentTheme.primaryColor} onChange={(e) => onThemeChange({ ...currentTheme, primaryColor: e.target.value })} className="w-full h-8 rounded cursor-pointer"/>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.secondaryColor}</label>
                <input type="color" value={currentTheme.secondaryColor} onChange={(e) => onThemeChange({ ...currentTheme, secondaryColor: e.target.value })} className="w-full h-8 rounded cursor-pointer"/>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.textColor}</label>
                <input type="color" value={currentTheme.textColor} onChange={(e) => onThemeChange({ ...currentTheme, textColor: e.target.value })} className="w-full h-8 rounded cursor-pointer"/>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.backgroundColor}</label>
                <input type="color" value={currentTheme.backgroundColor} onChange={(e) => onThemeChange({ ...currentTheme, backgroundColor: e.target.value })} className="w-full h-8 rounded cursor-pointer"/>
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <h2 className="text-lg font-semibold mb-2">{t.typography}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm">{t.fontSize}</label>
                <div className="flex items-center">
                  <input type="range" min="12" max="24" value={currentTheme.fontSize} onChange={(e) => onThemeChange({ ...currentTheme, fontSize: parseInt(e.target.value) })} className="w-full"/>
                  <span className="text-sm ml-2">{currentTheme.fontSize}px</span>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.fontFamily}</label>
                <select value={currentTheme.fontFamily} onChange={(e) => onThemeChange({ ...currentTheme, fontFamily: e.target.value })} className={`w-full p-1 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <option value="Arial">Arial</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </div>
          </section>

          {/* Layout Section */}
          <section>
            <h2 className="text-lg font-semibold mb-2">{t.layout}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm">{t.borderRadius}</label>
                <div className="flex items-center">
                  <input type="range" min="0" max="20" value={currentTheme.borderRadius} onChange={(e) => onThemeChange({ ...currentTheme, borderRadius: parseInt(e.target.value) })} className="w-full"/>
                  <span className="text-sm ml-2">{currentTheme.borderRadius}px</span>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.buttonStyle}</label>
                <select value={currentTheme.buttonStyle} onChange={(e) => onThemeChange({ ...currentTheme, buttonStyle: e.target.value })} className={`w-full p-1 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="pill">Pill</option>
                </select>
              </div>
            </div>
          </section>

          {/* Other Settings */}
          <section>
            <h2 className="text-lg font-semibold mb-2">{t.animation}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm">{t.animationSpeed}</label>
                <div className="flex items-center">
                  <input type="range" min="100" max="1000" step="50" value={currentTheme.animationSpeed} onChange={(e) => onThemeChange({ ...currentTheme, animationSpeed: parseInt(e.target.value) })} className="w-full"/>
                  <span className="text-sm ml-2">{currentTheme.animationSpeed}ms</span>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.iconSet}</label>
                <select value={currentTheme.iconSet} onChange={(e) => onThemeChange({ ...currentTheme, iconSet: e.target.value })} className={`w-full p-1 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="colorful">Colorful</option>
                </select>
              </div>
            </div>
          </section>

          <button onClick={() => setCurrentPage('dashboard')} className={`w-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded mt-4`}>
            {t.saveChanges}
          </button>
        </div>
      </div>
    </div>);
};
exports.default = ThemeEditor;
