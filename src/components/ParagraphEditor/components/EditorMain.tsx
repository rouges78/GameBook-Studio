import React from 'react';
import { Paragraph, NotificationType } from '../types';
import ParagraphEditorControls from '../ParagraphEditorControls';
import ParagraphContent from '../ParagraphContent';
import ParagraphActions from '../ParagraphActions';
import TagInput from '../TagInput';
import { useActions } from '../hooks/useActions';
import { Save, Image, Map, Trash2, ExternalLink } from 'lucide-react';

interface EditorMainProps {
  selectedParagraph: Paragraph;
  paragraphs: Paragraph[];
  isDarkMode: boolean;
  language: 'it' | 'en';
  onUpdate: (updatedParagraph: Paragraph) => void;
  onShowImageEditor: () => void;
  onShowStoryMap: () => void;
  onDelete: () => void;
  onExport: () => void;
  onSave: () => void;
  onNotification: (notification: NotificationType | null) => void;
  translations: any;
}

const EditorMain: React.FC<EditorMainProps> = ({
  selectedParagraph,
  paragraphs,
  isDarkMode,
  language,
  onUpdate,
  onShowImageEditor,
  onShowStoryMap,
  onDelete,
  onExport,
  onSave,
  onNotification,
  translations: t
}) => {
  const {
    popupState,
    handleActionChange,
    handleActionBlur,
    handleRemoveAction,
    handleAddAction,
    handlePopupConfirm,
    handlePopupCancel
  } = useActions({
    selectedParagraph,
    paragraphs,
    onUpdate,
    onNotification,
    translations: t
  });

  return (
    <main className="flex-1 flex flex-col min-h-0">
      <ParagraphEditorControls
        selectedParagraph={selectedParagraph}
        paragraphs={paragraphs}
        onUpdate={onUpdate}
        onSelectParagraph={(id) => onUpdate({ ...selectedParagraph, id })}
        isDarkMode={isDarkMode}
        language={language}
        onSave={onSave}
        onShowStoryMap={onShowStoryMap}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <ParagraphContent
          selectedParagraph={selectedParagraph}
          onUpdate={onUpdate}
          isDarkMode={isDarkMode}
          language={language}
        />
      </div>

      <div className="flex-none bg-gray-800">
        <ParagraphActions
          actions={selectedParagraph.actions}
          isDarkMode={isDarkMode}
          onActionChange={handleActionChange}
          onActionBlur={handleActionBlur}
          onRemoveAction={handleRemoveAction}
          onAddAction={handleAddAction}
        />

        <TagInput
          tags={selectedParagraph.tags || []}
          onTagsChange={(newTags: string[]) => onUpdate({
            ...selectedParagraph,
            tags: newTags
          })}
          isDarkMode={isDarkMode}
        />

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-600">
          {/* Left side */}
          <button
            onClick={onShowImageEditor}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md flex items-center gap-2 transition-colors duration-200"
          >
            <Image size={18} />
            {selectedParagraph.image ? t.modifyImage : t.addImage}
          </button>

          {/* Center */}
          <button
            onClick={onShowStoryMap}
            className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white text-sm rounded-md flex items-center gap-2 transition-colors duration-200"
            title={t.shortcuts.map}
          >
            <Map size={18} />
            {t.showMap}
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md flex items-center gap-2 transition-colors duration-200"
            >
              <Trash2 size={18} />
              {t.delete}
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md flex items-center gap-2 transition-colors duration-200"
            >
              <ExternalLink size={18} />
              {t.export}
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center gap-2 transition-colors duration-200"
              title={t.shortcuts.save}
            >
              <Save size={18} />
              {t.saveParagraph || 'Save Paragraph'}
            </button>
          </div>
        </div>
      </div>

      {popupState.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-white mb-4">
              {popupState.isExisting
                ? `${t.confirmConnection} ${popupState.paragraphId}?`
                : t.createNewParagraph}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handlePopupCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handlePopupConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EditorMain;
