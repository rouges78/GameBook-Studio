import React, { useCallback, useState } from 'react';
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

const ParagraphEditor = ({
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
      // Check if paragraph exists
      const exists = prevParagraphs.some(p => p.id === updatedParagraph.id);
      if (exists) {
        // Update existing paragraph
        return prevParagraphs.map(p =>
          p.id === updatedParagraph.id ? updatedParagraph : p
        );
      } else {
        // Add new paragraph
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
    const project: Project = {
      bookTitle,
      author,
      paragraphs: state.paragraphs,
      lastEdited: new Date().toISOString(),
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

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const headerVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  const sidebarVariants = {
    initial: { x: -300, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const mainContentVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-screen flex flex-col overflow-hidden bg-gray-900 text-white"
    >
      <motion.div
        variants={headerVariants}
        className="flex-none h-10 border-b border-gray-700 flex items-center justify-between px-6"
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t.backToHome}
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold"
        >
          {t.editorTitle}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-medium"
        >
          {bookTitle}
        </motion.div>
      </motion.div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <motion.div
          variants={sidebarVariants}
          initial="initial"
          animate="animate"
        >
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
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedParagraph ? (
            <motion.div
              key="editor"
              variants={mainContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1"
            >
              <EditorMain
                selectedParagraph={selectedParagraph}
                paragraphs={state.paragraphs}
                isDarkMode={isDarkMode}
                language={language}
                onUpdate={handleParagraphUpdate}
                onShowImageEditor={() => actions.setShowImageEditor(true)}
                onShowStoryMap={() => actions.setShowStoryMap(true)}
                onDelete={handleDelete}
                onExport={handleExport}
                onSave={handleSave}
                onNotification={actions.setNotification}
                translations={t}
              />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              variants={mainContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex items-center justify-center text-gray-500"
            >
              {t.selectParagraph}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {state.showPopup.visible && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CustomPopup
                message={
                  state.showPopup.isExisting
                    ? `${t.confirmConnection} ${state.showPopup.paragraphId}?`
                    : t.createNewParagraph
                }
                onConfirm={() => {
                  if (state.showPopup.paragraphId && selectedParagraph) {
                    const newParagraph: Paragraph = {
                      id: state.showPopup.paragraphId,
                      title: '',
                      content: '',
                      actions: [],
                      incomingConnections: [selectedParagraph.id],
                      outgoingConnections: [],
                      type: 'normale',
                      tags: []
                    };
                    handleParagraphUpdate(newParagraph);
                  }
                  actions.setShowPopup({ visible: false, actionIndex: null });
                }}
                onCancel={() => actions.setShowPopup({ visible: false, actionIndex: null })}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-4"
          >
            <Notification
              message={state.notification.message}
              type={state.notification.type}
              onClose={() => actions.setNotification(null)}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.showStoryMap && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <StoryMap
                paragraphs={state.paragraphs}
                mapSettings={mapSettings}
                onClose={() => actions.setShowStoryMap(false)}
                isDarkMode={isDarkMode}
                language={language}
                onEditParagraph={actions.setSelectedParagraph}
                onDeleteParagraph={(id: number) => {
                  if (state.paragraphs.length > 1) {
                    actions.setParagraphs((prevParagraphs) => {
                      const updatedParagraphs = prevParagraphs.filter((p) => p.id !== id);
                      return updatedParagraphs.map((p) => ({
                        ...p,
                        actions: p.actions.filter((a) => a['N.Par.'] !== id.toString()),
                        incomingConnections: (p.incomingConnections || []).filter((incomingId) => incomingId !== id),
                        outgoingConnections: (p.outgoingConnections || []).filter((outgoingId) => outgoingId !== id.toString()),
                      }));
                    });
                    actions.setSelectedParagraph(state.paragraphs[0].id);
                  } else {
                    actions.setNotification({
                      message: t.cannotDeleteLast,
                      type: 'error'
                    });
                  }
                }}
                onAddNote={(id: number, note: string) => {
                  actions.setParagraphs(prevParagraphs =>
                    prevParagraphs.map(p =>
                      p.id === id ? { ...p, note } : p
                    )
                  );
                }}
                onAddParagraph={handleAddParagraph}
                onLinkParagraphs={(sourceId: number, targetId: number) => {
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
                }}
                onSave={handleStoryMapSave}
                onUpdateParagraphs={(paragraphs) => {
                  paragraphs.forEach(p => handleParagraphUpdate(p as Paragraph));
                }}
                onUpdateMapSettings={setMapSettings}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.showImageEditor && selectedParagraph && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParagraphEditor;
