"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const translations_1 = require("./translations");
const ParagraphEditorControls = ({ selectedParagraph, onUpdate, isDarkMode, language, }) => {
    const t = translations_1.translations[language];
    const handleTitleChange = (e) => {
        onUpdate({
            ...selectedParagraph,
            title: e.target.value
        });
    };
    const handleTypeChange = (type) => {
        onUpdate({
            ...selectedParagraph,
            type
        });
    };
    const formatButtons = [
        { icon: <lucide_react_1.Bold size={18}/>, format: 'bold', title: t.formatButtons.bold },
        { icon: <lucide_react_1.Italic size={18}/>, format: 'italic', title: t.formatButtons.italic },
        { icon: <lucide_react_1.Underline size={18}/>, format: 'underline', title: t.formatButtons.underline },
        { text: 'H1', format: 'heading1', title: t.formatButtons.heading1 },
        { text: 'H2', format: 'heading2', title: t.formatButtons.heading2 },
        { text: 'H3', format: 'heading3', title: t.formatButtons.heading3 },
        { icon: <lucide_react_1.Quote size={18}/>, format: 'quote', title: t.formatButtons.quote },
        { icon: <lucide_react_1.Code size={18}/>, format: 'code', title: t.formatButtons.code },
        { icon: <lucide_react_1.Link size={18}/>, format: 'link', title: t.formatButtons.link },
    ];
    const handleFormat = (format) => {
        let newContent = selectedParagraph.content;
        const textarea = document.querySelector('textarea');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = newContent.substring(start, end);
            let formattedText = '';
            switch (format) {
                case 'bold':
                    formattedText = `**${selectedText}**`;
                    break;
                case 'italic':
                    formattedText = `*${selectedText}*`;
                    break;
                case 'underline':
                    formattedText = `__${selectedText}__`;
                    break;
                case 'heading1':
                    formattedText = `# ${selectedText}`;
                    break;
                case 'heading2':
                    formattedText = `## ${selectedText}`;
                    break;
                case 'heading3':
                    formattedText = `### ${selectedText}`;
                    break;
                case 'quote':
                    formattedText = `> ${selectedText}`;
                    break;
                case 'code':
                    formattedText = `\`${selectedText}\``;
                    break;
                case 'link':
                    formattedText = `[${selectedText}](url)`;
                    break;
                default:
                    formattedText = selectedText;
            }
            newContent = newContent.substring(0, start) + formattedText + newContent.substring(end);
            onUpdate({
                ...selectedParagraph,
                content: newContent
            });
            // Restore selection
            setTimeout(() => {
                textarea.selectionStart = start;
                textarea.selectionEnd = start + formattedText.length;
                textarea.focus();
            }, 0);
        }
    };
    return (<div className="flex-none bg-gray-800">
      {/* Title Input and Node Type */}
      <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center flex-1">
          <input type="text" value={selectedParagraph.id} readOnly className="w-16 mr-2 px-2 py-1.5 bg-gray-600 text-white text-center rounded border-0 focus:outline-none focus:ring-0"/>
          <input type="text" value={selectedParagraph.title} onChange={handleTitleChange} placeholder={t.enterTitle} className="flex-1 mr-4 px-4 py-1.5 bg-gray-600 text-white border-0 rounded focus:outline-none focus:ring-0"/>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">{t.nodeTypes.title}</span>
          <button onClick={() => handleTypeChange('normale')} className={`px-3 py-1 rounded text-sm font-medium mr-2 ${selectedParagraph.type === 'normale'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white'}`}>
            {t.nodeTypes.normal}
          </button>
          <button onClick={() => handleTypeChange('nodo')} className={`px-3 py-1 rounded text-sm font-medium mr-2 ${selectedParagraph.type === 'nodo'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-600 text-gray-300 hover:bg-orange-600 hover:text-white'}`}>
            {t.nodeTypes.intermediate}
          </button>
          <button onClick={() => handleTypeChange('finale')} className={`px-3 py-1 rounded text-sm font-medium ${selectedParagraph.type === 'finale'
            ? 'bg-red-600 text-white'
            : 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'}`}>
            {t.nodeTypes.final}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center h-10 px-2 bg-gray-800 border-b border-gray-700">
        {formatButtons.map((button) => (<button key={button.format} onClick={() => handleFormat(button.format)} title={button.title} className="w-10 h-8 flex items-center justify-center rounded text-gray-300 hover:bg-gray-700 hover:text-white">
            {button.icon || <span className="text-sm font-medium">{button.text}</span>}
          </button>))}
      </div>
    </div>);
};
exports.default = ParagraphEditorControls;
