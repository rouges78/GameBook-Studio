"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ParagraphEditorControls_1 = __importDefault(require("../ParagraphEditorControls"));
const ParagraphContent_1 = __importDefault(require("../ParagraphContent"));
const ParagraphActions_1 = __importDefault(require("../ParagraphActions"));
const TagInput_1 = __importDefault(require("../TagInput"));
const useActions_1 = require("../hooks/useActions");
const EditorMain = ({ selectedParagraph, paragraphs, isDarkMode, language, onUpdate, onShowImageEditor, onShowStoryMap, onDelete, onExport, onSave, onNotification, translations: t }) => {
    const { popupState, handleActionChange, handleActionBlur, handleRemoveAction, handleAddAction, handlePopupConfirm, handlePopupCancel } = (0, useActions_1.useActions)({
        selectedParagraph,
        paragraphs,
        onUpdate,
        onNotification,
        translations: t
    });
    return (<main className="flex-1 flex flex-col min-h-0">
      <ParagraphEditorControls_1.default selectedParagraph={selectedParagraph} onUpdate={onUpdate} isDarkMode={isDarkMode} language={language}/>

      <div className="flex-1 flex flex-col min-h-0">
        <ParagraphContent_1.default selectedParagraph={selectedParagraph} onUpdate={onUpdate} paragraphs={paragraphs} isDarkMode={isDarkMode} language={language}/>
      </div>

      <div className="flex-none">
        <ParagraphActions_1.default actions={selectedParagraph.actions} isDarkMode={isDarkMode} onActionChange={handleActionChange} onActionBlur={handleActionBlur} onRemoveAction={handleRemoveAction} onAddAction={handleAddAction}/>

        <TagInput_1.default tags={selectedParagraph.tags} onTagsChange={(newTags) => onUpdate({
            ...selectedParagraph,
            tags: newTags
        })} isDarkMode={isDarkMode}/>

        <div className="flex items-center justify-between px-6 py-2 border-t border-gray-600">
          {/* Left side */}
          <button onClick={onShowImageEditor} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md flex items-center">
            {selectedParagraph.image ? t.modifyImage : t.addImage}
          </button>

          {/* Center */}
          <button onClick={onShowStoryMap} className="px-3 py-1 bg-amber-900 hover:bg-amber-800 text-white text-sm rounded-md flex items-center">
            {t.showMap}
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button onClick={onDelete} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md flex items-center">
              {t.delete}
            </button>
            <button onClick={onExport} className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md flex items-center">
              {t.export}
            </button>
            <button onClick={onSave} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center">
              {t.save}
            </button>
          </div>
        </div>
      </div>

      {popupState.visible && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-white mb-4">
              {popupState.isExisting
                ? `${t.confirmConnection} ${popupState.paragraphId}?`
                : t.createNewParagraph}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={handlePopupCancel} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                {t.cancel}
              </button>
              <button onClick={handlePopupConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {t.confirm}
              </button>
            </div>
          </div>
        </div>)}
    </main>);
};
exports.default = EditorMain;
