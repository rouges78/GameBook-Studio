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
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const translations_1 = require("./translations");
const utils_1 = require("./utils");
const Notification_1 = __importDefault(require("../Notification"));
const ExportPage = ({ setCurrentPage, bookTitle, author, paragraphs, isDarkMode, language, }) => {
    const [processedParagraphs, setProcessedParagraphs] = (0, react_1.useState)([]);
    const [exportFormat, setExportFormat] = (0, react_1.useState)('pdf');
    const [margins, setMargins] = (0, react_1.useState)('normal');
    const [orientation, setOrientation] = (0, react_1.useState)('portrait');
    const [includeImages, setIncludeImages] = (0, react_1.useState)(true);
    const [includeMeta, setIncludeMeta] = (0, react_1.useState)(true);
    const [pageNumbers, setPageNumbers] = (0, react_1.useState)(true);
    const [fontSize, setFontSize] = (0, react_1.useState)(12);
    const [lineSpacing, setLineSpacing] = (0, react_1.useState)(1.5);
    const [fontFamily, setFontFamily] = (0, react_1.useState)('Arial');
    const [notification, setNotification] = (0, react_1.useState)(null);
    const t = translations_1.translations[language];
    // Only show page numbers option for PDF, DOCX, and JSON
    const showPageNumbersOption = ['pdf', 'docx', 'json'].includes(exportFormat);
    const showNotification = (0, react_1.useCallback)((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);
    const handleShufflePages = (0, react_1.useCallback)(() => {
        try {
            // First convert paragraphs to pages if not already done
            const pages = processedParagraphs.length > 0 ?
                processedParagraphs :
                (0, utils_1.convertToPages)(paragraphs);
            // Then shuffle the pages
            const shuffledPages = (0, utils_1.shuffleParagraphs)(pages);
            setProcessedParagraphs(shuffledPages);
            showNotification(t.shuffleSuccess);
        }
        catch (error) {
            console.error('Error during shuffle:', error);
            showNotification(t.shuffleError, 'error');
        }
    }, [paragraphs, processedParagraphs, showNotification, t]);
    const handleConvertParagraphs = (0, react_1.useCallback)(() => {
        try {
            const pages = (0, utils_1.convertToPages)(paragraphs);
            setProcessedParagraphs(pages);
            showNotification(t.conversionSuccess);
        }
        catch (error) {
            console.error('Error during conversion:', error);
            showNotification(t.conversionError, 'error');
        }
    }, [paragraphs, showNotification, t]);
    const handleExport = (0, react_1.useCallback)(() => {
        try {
            // If no processed paragraphs, convert them first
            const pages = processedParagraphs.length > 0 ?
                processedParagraphs :
                (0, utils_1.convertToPages)(paragraphs);
            const exportData = {
                title: bookTitle,
                author,
                paragraphs: pages
            };
            const options = {
                margins,
                orientation,
                includeImages,
                includeMeta,
                pageNumbers: showPageNumbersOption && pageNumbers, // Only include page numbers for supported formats
                fontSize,
                lineSpacing,
                fontFamily
            };
            switch (exportFormat) {
                case 'pdf':
                    (0, utils_1.exportToPDF)(exportData, options);
                    break;
                case 'html':
                    (0, utils_1.exportToHTML)(exportData, { ...options, pageNumbers: false });
                    break;
                case 'json':
                    (0, utils_1.exportToJSON)(exportData);
                    break;
                case 'docx':
                    (0, utils_1.exportToDOCX)(exportData, options);
                    break;
                case 'txt':
                    (0, utils_1.exportToTXT)(exportData, { ...options, pageNumbers: false });
                    break;
                case 'xlsx':
                    (0, utils_1.exportToXLSX)(exportData);
                    break;
            }
            showNotification(t.exportSuccess.replace('{format}', exportFormat.toUpperCase()));
        }
        catch (error) {
            console.error('Error during export:', error);
            showNotification(t.exportError, 'error');
        }
    }, [
        exportFormat,
        bookTitle,
        author,
        processedParagraphs,
        paragraphs,
        margins,
        orientation,
        includeImages,
        includeMeta,
        pageNumbers,
        fontSize,
        lineSpacing,
        fontFamily,
        showNotification,
        t,
        showPageNumbersOption
    ]);
    return (<div className={`h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setCurrentPage('paragraphEditor')} className={`mb-4 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}>
          <lucide_react_1.ArrowLeft size={20} className="mr-2"/>
          {t.backToEditor}
        </button>

        <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-4 rounded-lg`}>
          {t.exportProject}
        </h1>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <button onClick={handleShufflePages} className={`flex-1 flex items-center justify-center p-4 rounded-lg ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}>
              <lucide_react_1.Shuffle size={20} className="mr-2"/>
              {t.executePageShuffle}
            </button>

            <button onClick={handleConvertParagraphs} className={`flex-1 flex items-center justify-center p-4 rounded-lg ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}>
              <lucide_react_1.FileDigit size={20} className="mr-2"/>
              {t.convertParagraphsToPages}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2">{t.selectFormat}</label>
              <div className="flex flex-wrap gap-2">
                {['pdf', 'html', 'json', 'docx', 'txt', 'xlsx'].map(format => (<button key={format} onClick={() => setExportFormat(format)} className={`p-2 rounded ${exportFormat === format
                ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} text-white`}>
                    {format.toUpperCase()}
                  </button>))}
              </div>
            </div>

            <div>
              <label className="block mb-2">{t.margins}</label>
              <select value={margins} onChange={(e) => setMargins(e.target.value)} className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <input type="checkbox" checked={includeImages} onChange={(e) => setIncludeImages(e.target.checked)} className="mr-2"/>
              <label>{t.includeImages}</label>
            </div>

            <div className="flex items-center">
              <input type="checkbox" checked={includeMeta} onChange={(e) => setIncludeMeta(e.target.checked)} className="mr-2"/>
              <label>{t.includeMeta}</label>
            </div>

            {showPageNumbersOption && (<div className="flex items-center">
                <input type="checkbox" checked={pageNumbers} onChange={(e) => setPageNumbers(e.target.checked)} className="mr-2"/>
                <label>{t.pageNumbers}</label>
              </div>)}
          </div>

          <div className="flex justify-end space-x-4">
            <button onClick={() => setCurrentPage('paragraphEditor')} className={`px-6 py-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'}`}>
              {t.cancel}
            </button>
            <button onClick={handleExport} className={`px-6 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
              {t.export}
            </button>
          </div>
        </div>
      </div>

      {notification && (<Notification_1.default message={notification.message} type={notification.type} onClose={() => setNotification(null)} isDarkMode={isDarkMode} style="modern" position="top-center"/>)}
    </div>);
};
exports.default = ExportPage;
