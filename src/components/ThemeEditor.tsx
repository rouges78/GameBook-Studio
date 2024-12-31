import React, { useState, useEffect, useRef } from 'react';
import { buttonClasses } from '../utils/buttonStyles';
import { ArrowLeft, Save, Upload, Download, Trash2, Check } from 'lucide-react';
import { Theme } from '../contexts/ThemeContext';
import { SavedTheme } from '../types/theme';
import * as themeStorage from '../utils/themeStorage';

type PageType = 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 
                'settings' | 'help' | 'export' | 'backupManager' | 'telemetryDashboard';

interface ThemeEditorProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const translations = {
  it: {
    backToDashboard: "Torna alla Dashboard",
    backToHome: "Torna alla Home",
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
    saveChanges: "Salva Modifiche",
    savedThemes: "Temi Salvati",
    saveTheme: "Salva Tema",
    importTheme: "Importa Tema",
    exportTheme: "Esporta Tema",
    deleteTheme: "Elimina Tema",
    themeName: "Nome Tema",
    themeDescription: "Descrizione (opzionale)",
    cancel: "Annulla",
    save: "Salva",
    preview: "Anteprima",
    noSavedThemes: "Nessun tema salvato",
    confirmDelete: "Sei sicuro di voler eliminare questo tema?",
    themeNameRequired: "Il nome del tema è obbligatorio",
    importError: "Errore durante l'importazione del tema",
    themeImported: "Tema importato con successo",
    themeSaved: "Tema salvato con successo",
    themeDeleted: "Tema eliminato con successo",
    apply: "Applica",
    lastUpdated: "Ultimo aggiornamento"
  },
  en: {
    backToDashboard: "Back to Dashboard",
    backToHome: "Back to Home",
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
    saveChanges: "Save Changes",
    savedThemes: "Saved Themes",
    saveTheme: "Save Theme",
    importTheme: "Import Theme",
    exportTheme: "Export Theme",
    deleteTheme: "Delete Theme",
    themeName: "Theme Name",
    themeDescription: "Description (optional)",
    cancel: "Cancel",
    save: "Save",
    preview: "Preview",
    noSavedThemes: "No saved themes",
    confirmDelete: "Are you sure you want to delete this theme?",
    themeNameRequired: "Theme name is required",
    importError: "Error importing theme",
    themeImported: "Theme imported successfully",
    themeSaved: "Theme saved successfully",
    themeDeleted: "Theme deleted successfully",
    apply: "Apply",
    lastUpdated: "Last updated"
  }
};

const ThemeEditor: React.FC<ThemeEditorProps> = ({
  setCurrentPage,
  isDarkMode,
  language,
  currentTheme,
  onThemeChange
}) => {
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  useEffect(() => {
    const storage = themeStorage.loadThemes();
    setSavedThemes(storage.themes);
  }, []);

  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      alert(t.themeNameRequired);
      return;
    }

    const savedTheme = themeStorage.saveTheme(themeName, currentTheme, themeDescription);
    setSavedThemes(prev => [...prev, savedTheme]);
    setShowSaveDialog(false);
    setThemeName('');
    setThemeDescription('');
    alert(t.themeSaved);
  };

  const handleDeleteTheme = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      themeStorage.deleteTheme(id);
      setSavedThemes(prev => prev.filter(theme => theme.id !== id));
      alert(t.themeDeleted);
    }
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imported = await themeStorage.importTheme(file);
      if (imported) {
        setSavedThemes(prev => [...prev, imported]);
        alert(t.themeImported);
      } else {
        alert(t.importError);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportTheme = (theme: SavedTheme) => {
    themeStorage.exportTheme(theme);
  };

  const handleApplyTheme = (theme: Theme) => {
    onThemeChange(theme);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'it' ? 'it-IT' : 'en-US');
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`mb-4 ${buttonClasses('blue')}`}
          >
            <ArrowLeft size={20} className="h-5 w-5" />
            <span>Torna alla Home</span>
          </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Theme Editor */}
          <div>
            <h1 className={`text-xl font-bold mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
              {t.themeEditor}
            </h1>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-lg space-y-6`}>
              {/* Colors Section */}
              <section>
                <h2 className="text-lg font-semibold mb-3">{t.colors}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">{t.primaryColor}</label>
                    <input
                      type="color"
                      value={currentTheme.primaryColor}
                      onChange={(e) => onThemeChange({ ...currentTheme, primaryColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.secondaryColor}</label>
                    <input
                      type="color"
                      value={currentTheme.secondaryColor}
                      onChange={(e) => onThemeChange({ ...currentTheme, secondaryColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.textColor}</label>
                    <input
                      type="color"
                      value={currentTheme.textColor}
                      onChange={(e) => onThemeChange({ ...currentTheme, textColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.backgroundColor}</label>
                    <input
                      type="color"
                      value={currentTheme.backgroundColor}
                      onChange={(e) => onThemeChange({ ...currentTheme, backgroundColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              {/* Typography Section */}
              <section>
                <h2 className="text-lg font-semibold mb-3">{t.typography}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">{t.fontSize}</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={currentTheme.fontSize}
                        onChange={(e) => onThemeChange({ ...currentTheme, fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm ml-2">{currentTheme.fontSize}px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.fontFamily}</label>
                    <select
                      value={currentTheme.fontFamily}
                      onChange={(e) => onThemeChange({ ...currentTheme, fontFamily: e.target.value })}
                      className={`w-full p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
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
                <h2 className="text-lg font-semibold mb-3">{t.layout}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">{t.borderRadius}</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={currentTheme.borderRadius}
                        onChange={(e) => onThemeChange({ ...currentTheme, borderRadius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm ml-2">{currentTheme.borderRadius}px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.buttonStyle}</label>
                    <select
                      value={currentTheme.buttonStyle}
                      onChange={(e) => onThemeChange({ ...currentTheme, buttonStyle: e.target.value as any })}
                      className={`w-full p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <option value="rounded">Rounded</option>
                      <option value="square">Square</option>
                      <option value="pill">Pill</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className={`flex items-center px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  <Save size={18} className="mr-2" />
                  {t.saveTheme}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center px-4 py-2 rounded ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
                >
                  <Upload size={18} className="mr-2" />
                  {t.importTheme}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportTheme}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Preview and Saved Themes */}
          <div className="space-y-6">
            {/* Preview Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-lg`}>
              <h2 className="text-lg font-semibold mb-3">{t.preview}</h2>
              <div 
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: currentTheme.backgroundColor,
                  color: currentTheme.textColor,
                  fontFamily: currentTheme.fontFamily,
                  fontSize: `${currentTheme.fontSize}px`,
                }}
              >
                <div className="space-y-4">
                  <h3 style={{ color: currentTheme.primaryColor }} className="text-xl font-bold">
                    Preview Title
                  </h3>
                  <p>Sample text with current theme settings.</p>
                  <div className="flex gap-2">
                    <button
                      style={{
                        backgroundColor: currentTheme.primaryColor,
                        borderRadius: 
                          currentTheme.buttonStyle === 'pill' ? '9999px' :
                          currentTheme.buttonStyle === 'rounded' ? `${currentTheme.borderRadius}px` :
                          '0px'
                      }}
                      className="px-4 py-2 text-white"
                    >
                      Primary Button
                    </button>
                    <button
                      style={{
                        backgroundColor: currentTheme.secondaryColor,
                        borderRadius: 
                          currentTheme.buttonStyle === 'pill' ? '9999px' :
                          currentTheme.buttonStyle === 'rounded' ? `${currentTheme.borderRadius}px` :
                          '0px'
                      }}
                      className="px-4 py-2 text-white"
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Themes Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-lg`}>
              <h2 className="text-lg font-semibold mb-3">{t.savedThemes}</h2>
              {savedThemes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t.noSavedThemes}</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {savedThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}
                    >
                      <div>
                        <h3 className="font-medium">{theme.name}</h3>
                        {theme.description && (
                          <p className="text-sm text-gray-500">{theme.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {t.lastUpdated}: {formatDate(theme.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplyTheme(theme.theme)}
                          className={`p-2 rounded ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                          title={t.apply}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleExportTheme(theme)}
                          className={`p-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          title={t.exportTheme}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTheme(theme.id)}
                          className={`p-2 rounded ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                          title={t.deleteTheme}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Theme Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <h2 className="text-lg font-semibold mb-4">{t.saveTheme}</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">{t.themeName}</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder={t.themeName}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t.themeDescription}</label>
                <textarea
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  placeholder={t.themeDescription}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveTheme}
                  className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeEditor;
