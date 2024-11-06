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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const translations_1 = require("./translations");
const ParagraphContent = ({ selectedParagraph, onUpdate, isDarkMode, language, }) => {
    const t = translations_1.translations[language];
    const handleContentChange = (e) => {
        onUpdate({
            ...selectedParagraph,
            content: e.target.value
        });
    };
    const stats = (0, react_1.useMemo)(() => {
        const content = selectedParagraph.content;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const characters = content.length;
        return { words, characters };
    }, [selectedParagraph.content]);
    return (<div className="flex-1 flex flex-col min-h-0 bg-gray-700">
      <textarea value={selectedParagraph.content} onChange={handleContentChange} className="flex-1 w-full p-6 bg-gray-700 text-gray-100 border-0 resize-none font-mono text-base leading-relaxed focus:outline-none focus:ring-0" placeholder={t.enterContent} spellCheck={true} style={{ height: '100%' }}/>
      <div className="flex justify-end px-6 py-2 text-sm text-gray-400 border-t border-gray-700">
        <span className="mr-4">{t.stats.words}: {stats.words}</span>
        <span>{t.stats.characters}: {stats.characters}</span>
      </div>
    </div>);
};
exports.default = ParagraphContent;
