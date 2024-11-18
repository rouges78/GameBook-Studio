import React, { useCallback, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParagraphEditorProps, Paragraph, Project } from './types';
import { translations } from './translations';
import { useParagraphEditor } from './hooks/useParagraphEditor';
import ParagraphSidebar from './ParagraphSidebar';
import EditorMain from './components/EditorMain';
import StoryMap from '../StoryMap';
import Notification from '../Notification';
import CustomPopup from '../CustomPopup';
import ImageEditor from '../ImageEditor';

const ParagraphEditor: React.FC<ParagraphEditorProps> = ({
  setCurrentPage, 
  bookTitle, 
  author, 
  onSaveProject, 
  isDarkMode, 
  language, 
  initialParagraphs = [], 
  initialMapSettings,
  updateLastBackup
}: ParagraphEditorProps) => {
  const [mapSettings, setMapSettings] = useState(initialMapSettings);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const { state, actions } = useParagraphEditor({
    initialParagraphs,
    onSaveProject,
    bookTitle,
    author,
    updateLastBackup: updateLastBackup || (() => {}),
    initialMapSettings,
  });

  const t = translations[language];
  const selectedParagraph = state.paragraphs.find(p => p.id === state.selectedParagraph);

  const handleParagraphUpdate = useCallback((updatedParagraph: Paragraph) => {
    actions.setParagraphs(prevParagraphs => {
      const exists = prevParagraphs.some(p => p.id === updatedParagraph.id);
      if (exists) {
        return prevParagraphs.map(p =>
          p.id === updatedParagraph.id ? updatedParagraph : p
        );
      } else {
        return [...prevParagraphs, updatedParagraph];
      }
    });
  }, [actions]);

  const handleAddParagraph = useCallback(() => {
    const newId = Math.max(...state.paragraphs.map((p) => p.id)) + 1;
    const newParagraph: Paragraph = {
      id: newId,
      title: '',
      content: '',
      actions: [],
      incomingConnections: [],
      outgoingConnections: [],
      type: 'normale',
      tags: []
    };
    actions.setParagraphs((prev) => [...prev, newParagraph]);
    actions.setSelectedParagraph(newId);
  }, [state.paragraphs, actions]);

  const handleDelete = useCallback(() => {
    if (selectedParagraph && state.paragraphs.length > 1) {
      actions.setParagraphs((prevParagraphs) => {
        const updatedParagraphs = prevParagraphs.filter((p) => p.id !== selectedParagraph.id);
        return updatedParagraphs.map((p) => ({
          ...p,
          actions: p.actions.filter((a) => a['N.Par.'] !== selectedParagraph.id.toString()),
          incomingConnections: (p.incomingConnections || []).filter((incomingId) => incomingId !== selectedParagraph.id),
          outgoingConnections: (p.outgoingConnections || []).filter((outgoingId) => outgoingId !== selectedParagraph.id.toString()),
        }));
      });
      actions.setSelectedParagraph(state.paragraphs[0].id);
    } else {
      actions.setNotification({
        message: t.cannotDeleteLast,
        type: 'error'
      });
    }
  }, [selectedParagraph, state.paragraphs, actions, t]);

  const handleSave = useCallback(() => {
    const now = new Date();
    const project: Project = {
      id: 'current',
      name: bookTitle,
      bookTitle,
      author,
      paragraphs: state.paragraphs,
      created: now,
      modified: now,
      lastEdited: now.toISOString(),
      mapSettings
    };
    onSaveProject(project);
    actions.setNotification({
      message: t.save,
      type: 'success'
    });
  }, [bookTitle, author, state.paragraphs, mapSettings, onSaveProject, actions, t]);

  const handleExport = useCallback(() => {
    handleSave();
    setCurrentPage('export');
  }, [handleSave, setCurrentPage]);

  const handleStoryMapSave = useCallback((nodes: any[]) => {
    actions.setParagraphs(prevParagraphs => {
      return prevParagraphs.map(p => {
        const node = nodes.find(n => n.id === p.id);
        if (node) {
          return {
            ...p,
            x: node.x,
            y: node.y,
            locked: node.locked
          };
        }
        return p;
      });
    });
  }, [actions]);

  const handleLinkParagraphs = useCallback((sourceId: number, targetId: number) => {
    actions.setParagraphs((prevParagraphs) =>
      prevParagraphs.map((p) => {
        if (p.id === sourceId) {
          return {
            ...p,
            actions: [...p.actions, { text: '', 'N.Par.': targetId.toString() }],
            outgoingConnections: [...(p.outgoingConnections || []), targetId.toString()],
          };
        }
        if (p.id === targetId) {
          return {
            ...p,
            incomingConnections: [...(p.incomingConnections || []), sourceId],
          };
        }
        return p;
      })
    );
  }, [actions]);

  const toggleMap = useCallback(() => {
    console.log('Toggling map visibility');
    setIsMapVisible(prev => !prev);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="flex-none h-10 border-b border-gray-700 flex items-center justify-between px-6">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t.backToHome}
        </button>
        <h1 className="text-lg font-bold">
          {t.editorTitle}
        </h1>
        <div className="text-base font-medium">
          {bookTitle}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="flex-none w-56 border-r border-gray-700">
          <ParagraphSidebar
            paragraphs={state.paragraphs}
            selectedParagraph={state.selectedParagraph}
            isDarkMode={isDarkMode}
            showSearch={state.showSearch}
            searchTerm={state.searchTerm}
            showConnections={state.showConnections}
            language={language}
            onAddParagraph={handleAddParagraph}
            onSelectParagraph={actions.setSelectedParagraph}
            onToggleSearch={() => actions.setShowSearch(!state.showSearch)}
            onSearchChange={actions.setSearchTerm}
            onToggleConnections={(id: number | null) => actions.setShowConnections(id)}
            onImageEdit={(id: number) => {
              actions.setSelectedParagraph(id);
              actions.setShowImageEditor(true);
            }}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {selectedParagraph ? (
            <EditorMain
              selectedParagraph={selectedParagraph}
              paragraphs={state.paragraphs}
              isDarkMode={isDarkMode}
              language={language}
              onUpdate={handleParagraphUpdate}
              onShowImageEditor={() => actions.setShowImageEditor(true)}
              onShowStoryMap={toggleMap}
              onDelete={handleDelete}
              onExport={handleExport}
              onSave={handleSave}
              onNotification={actions.setNotification}
              translations={t}
              onReturnToEditor={toggleMap}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {t.selectParagraph}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isMapVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50">
            <StoryMap
              paragraphs={state.paragraphs}
              mapSettings={mapSettings}
              onClose={toggleMap}
              isDarkMode={isDarkMode}
              language={language}
              onEditParagraph={actions.setSelectedParagraph}
              onDeleteParagraph={handleDelete}
              onAddNote={(id: number, note: string) => {
                actions.setParagraphs(prevParagraphs =>
                  prevParagraphs.map(p =>
                    p.id === id ? { ...p, note } : p
                  )
                );
              }}
              onAddParagraph={handleAddParagraph}
              onLinkParagraphs={handleLinkParagraphs}
              onSave={handleStoryMapSave}
              onUpdateParagraphs={(paragraphs) => {
                paragraphs.forEach(p => handleParagraphUpdate(p as Paragraph));
              }}
              onUpdateMapSettings={setMapSettings}
            />
          </div>
        )}

        {state.showImageEditor && selectedParagraph && (
          <div className="fixed inset-0 bg-black bg-opacity-50">
            <ImageEditor
              onSave={(imageData: string | null, position: 'before' | 'after') => {
                handleParagraphUpdate({
                  ...selectedParagraph,
                  image: imageData ? { data: imageData, position } : undefined
                });
                actions.setShowImageEditor(false);
              }}
              onClose={() => actions.setShowImageEditor(false)}
              isDarkMode={isDarkMode}
              language={language}
              initialImage={selectedParagraph.image?.data}
              initialPosition={selectedParagraph.image?.position}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParagraphEditor;
