import React, { useState, useCallback } from 'react';
import { ArrowLeft, Shuffle, FileDigit } from 'lucide-react';
import { ExportPageProps, ExportFormat, MarginSize, ProcessedParagraph, ExportData } from './types';
import { translations } from './translations';
import { 
  exportToPDF, 
  exportToHTML, 
  exportToJSON, 
  exportToDOCX, 
  exportToTXT, 
  exportToXLSX,
  shuffleParagraphs,
  convertToPages
} from './utils';
import Notification from '../Notification';

const ExportPage: React.FC<ExportPageProps> = ({
  setCurrentPage,
  bookTitle,
  author,
  paragraphs,
  isDarkMode,
  language,
}) => {
  const [processedParagraphs, setProcessedParagraphs] = useState<ProcessedParagraph[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [margins, setMargins] = useState<MarginSize>('normal');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [pageNumbers, setPageNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const t = translations[language];

  // Only show page numbers option for PDF, DOCX, and JSON
  const showPageNumbersOption = ['pdf', 'docx', 'json'].includes(exportFormat);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleShufflePages = useCallback(() => {
    try {
      // First convert paragraphs to pages if not already done
      const pages = processedParagraphs.length > 0 ? 
        processedParagraphs : 
        convertToPages(paragraphs as ProcessedParagraph[]);
      
      // Then shuffle the pages
      const shuffledPages = shuffleParagraphs(pages);
      setProcessedParagraphs(shuffledPages);
      showNotification(t.shuffleSuccess);
    } catch (error) {
      console.error('Error during shuffle:', error);
      showNotification(t.shuffleError, 'error');
    }
  }, [paragraphs, processedParagraphs, showNotification, t]);

  const handleConvertParagraphs = useCallback(() => {
    try {
      const pages = convertToPages(paragraphs as ProcessedParagraph[]);
      setProcessedParagraphs(pages);
      showNotification(t.conversionSuccess);
    } catch (error) {
      console.error('Error during conversion:', error);
      showNotification(t.conversionError, 'error');
    }
  }, [paragraphs, showNotification, t]);

  const handleExport = useCallback(() => {
    try {
      // If no processed paragraphs, convert them first
      const pages = processedParagraphs.length > 0 ? 
        processedParagraphs : 
        convertToPages(paragraphs as ProcessedParagraph[]);

      const exportData: ExportData = {
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
          exportToPDF(exportData, options);
          break;
        case 'html':
          exportToHTML(exportData, { ...options, pageNumbers: false });
          break;
        case 'json':
          exportToJSON(exportData);
          break;
        case 'docx':
          exportToDOCX(exportData, options);
          break;
        case 'txt':
          exportToTXT(exportData, { ...options, pageNumbers: false });
          break;
        case 'xlsx':
          exportToXLSX(exportData);
          break;
      }
      showNotification(t.exportSuccess.replace('{format}', exportFormat.toUpperCase()));
    } catch (error) {
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

  return (
    <div className={`h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentPage('paragraphEditor')}
          className={`mb-4 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.backToEditor}
        </button>

        <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-4 rounded-lg`}>
          {t.exportProject}
        </h1>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <button
              onClick={handleShufflePages}
              className={`flex-1 flex items-center justify-center p-4 rounded-lg ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              <Shuffle size={20} className="mr-2" />
              {t.executePageShuffle}
            </button>

            <button
              onClick={handleConvertParagraphs}
              className={`flex-1 flex items-center justify-center p-4 rounded-lg ${
                isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              <FileDigit size={20} className="mr-2" />
              {t.convertParagraphsToPages}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2">{t.selectFormat}</label>
              <div className="flex flex-wrap gap-2">
                {['pdf', 'html', 'json', 'docx', 'txt', 'xlsx'].map(format => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format as ExportFormat)}
                    className={`p-2 rounded ${
                      exportFormat === format
                        ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    } text-white`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2">{t.margins}</label>
              <select
                value={margins}
                onChange={(e) => setMargins(e.target.value as MarginSize)}
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="mr-2"
              />
              <label>{t.includeImages}</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={includeMeta}
                onChange={(e) => setIncludeMeta(e.target.checked)}
                className="mr-2"
              />
              <label>{t.includeMeta}</label>
            </div>

            {showPageNumbersOption && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={pageNumbers}
                  onChange={(e) => setPageNumbers(e.target.checked)}
                  className="mr-2"
                />
                <label>{t.pageNumbers}</label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setCurrentPage('paragraphEditor')}
              className={`px-6 py-2 rounded ${
                isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleExport}
              className={`px-6 py-2 rounded ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {t.export}
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          isDarkMode={isDarkMode}
          style="modern"
          position="top-center"
        />
      )}
    </div>
  );
};

export default ExportPage;
