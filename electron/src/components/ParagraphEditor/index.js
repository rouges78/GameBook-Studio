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
const framer_motion_1 = require("framer-motion");
const translations_1 = require("./translations");
const useParagraphEditor_1 = require("./hooks/useParagraphEditor");
const ParagraphSidebar_1 = __importDefault(require("./ParagraphSidebar"));
const EditorMain_1 = __importDefault(require("./components/EditorMain"));
const StoryMap_1 = __importDefault(require("../StoryMap"));
const Notification_1 = __importDefault(require("../Notification"));
const CustomPopup_1 = __importDefault(require("../CustomPopup"));
const ImageEditor_1 = __importDefault(require("../ImageEditor"));
const ParagraphEditor = ({ setCurrentPage, bookTitle, author, onSaveProject, isDarkMode, language, initialParagraphs = [], initialMapSettings, updateLastBackup }) => {
    const [mapSettings, setMapSettings] = (0, react_1.useState)(initialMapSettings);
    const { state, actions } = (0, useParagraphEditor_1.useParagraphEditor)({
        initialParagraphs,
        onSaveProject,
        bookTitle,
        author,
        updateLastBackup: updateLastBackup || (() => { }),
        initialMapSettings,
    });
    const t = translations_1.translations[language];
    const selectedParagraph = state.paragraphs.find(p => p.id === state.selectedParagraph);
    const handleParagraphUpdate = (0, react_1.useCallback)((updatedParagraph) => {
        actions.setParagraphs(prevParagraphs => prevParagraphs.map(p => p.id === updatedParagraph.id ? updatedParagraph : p));
    }, [actions]);
    const handleAddParagraph = (0, react_1.useCallback)(() => {
        const newId = Math.max(...state.paragraphs.map((p) => p.id)) + 1;
        const newParagraph = {
            id: newId,
            title: '',
            content: '',
            actions: [],
            incomingConnections: [],
            outgoingConnections: [],
            type: 'normale'
        };
        actions.setParagraphs((prev) => [...prev, newParagraph]);
        actions.setSelectedParagraph(newId);
    }, [state.paragraphs, actions]);
    const handleDelete = (0, react_1.useCallback)(() => {
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
        }
        else {
            actions.setNotification({
                message: t.cannotDeleteLast,
                type: 'error'
            });
        }
    }, [selectedParagraph, state.paragraphs, actions, t]);
    const handleSave = (0, react_1.useCallback)(() => {
        const project = {
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
    const handleExport = (0, react_1.useCallback)(() => {
        handleSave();
        setCurrentPage('export');
    }, [handleSave, setCurrentPage]);
    const handleStoryMapSave = (0, react_1.useCallback)((nodes) => {
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
    return (<framer_motion_1.motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col overflow-hidden bg-gray-900 text-white">
      <framer_motion_1.motion.div variants={headerVariants} className="flex-none h-10 border-b border-gray-700 flex items-center justify-between px-6">
        <framer_motion_1.motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={() => setCurrentPage('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300">
          <lucide_react_1.ArrowLeft size={18} className="mr-2"/>
          {t.backToHome}
        </framer_motion_1.motion.button>
        <framer_motion_1.motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-bold">
          {t.editorTitle}
        </framer_motion_1.motion.h1>
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-base font-medium">
          {bookTitle}
        </framer_motion_1.motion.div>
      </framer_motion_1.motion.div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <framer_motion_1.motion.div variants={sidebarVariants} initial="initial" animate="animate">
          <ParagraphSidebar_1.default paragraphs={state.paragraphs} selectedParagraph={state.selectedParagraph} isDarkMode={isDarkMode} showSearch={state.showSearch} searchTerm={state.searchTerm} showConnections={state.showConnections} language={language} onAddParagraph={handleAddParagraph} onSelectParagraph={actions.setSelectedParagraph} onToggleSearch={() => actions.setShowSearch(!state.showSearch)} onSearchChange={actions.setSearchTerm} onToggleConnections={(id) => actions.setShowConnections(id)} onImageEdit={(id) => {
            actions.setSelectedParagraph(id);
            actions.setShowImageEditor(true);
        }}/>
        </framer_motion_1.motion.div>

        <framer_motion_1.AnimatePresence mode="wait">
          {selectedParagraph ? (<framer_motion_1.motion.div key="editor" variants={mainContentVariants} initial="initial" animate="animate" exit="exit" className="flex-1">
              <EditorMain_1.default selectedParagraph={selectedParagraph} paragraphs={state.paragraphs} isDarkMode={isDarkMode} language={language} onUpdate={handleParagraphUpdate} onShowImageEditor={() => actions.setShowImageEditor(true)} onShowStoryMap={() => actions.setShowStoryMap(true)} onDelete={handleDelete} onExport={handleExport} onSave={handleSave} onNotification={actions.setNotification} translations={t}/>
            </framer_motion_1.motion.div>) : (<framer_motion_1.motion.div key="placeholder" variants={mainContentVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex items-center justify-center text-gray-500">
              {t.selectParagraph}
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </div>

      <framer_motion_1.AnimatePresence>
        {state.showPopup.visible && (<framer_motion_1.motion.div variants={overlayVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <CustomPopup_1.default message={state.showPopup.isExisting
                ? `${t.confirmConnection} ${state.showPopup.paragraphId}?`
                : t.createNewParagraph} onConfirm={() => { }} onCancel={() => actions.setShowPopup({ visible: false, actionIndex: null })} isDarkMode={isDarkMode}/>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      <framer_motion_1.AnimatePresence>
        {state.notification && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed bottom-4 right-4">
            <Notification_1.default message={state.notification.message} type={state.notification.type} onClose={() => actions.setNotification(null)} isDarkMode={isDarkMode}/>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      <framer_motion_1.AnimatePresence>
        {state.showStoryMap && (<framer_motion_1.motion.div variants={overlayVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 bg-black bg-opacity-50">
            <framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <StoryMap_1.default paragraphs={state.paragraphs} mapSettings={mapSettings} onClose={() => actions.setShowStoryMap(false)} isDarkMode={isDarkMode} language={language} onEditParagraph={actions.setSelectedParagraph} onDeleteParagraph={(id) => {
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
                }
                else {
                    actions.setNotification({
                        message: t.cannotDeleteLast,
                        type: 'error'
                    });
                }
            }} onAddNote={(id, note) => {
                actions.setParagraphs(prevParagraphs => prevParagraphs.map(p => p.id === id ? { ...p, note } : p));
            }} onAddParagraph={handleAddParagraph} onLinkParagraphs={(sourceId, targetId) => {
                actions.setParagraphs((prevParagraphs) => prevParagraphs.map((p) => {
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
                }));
            }} onSave={handleStoryMapSave} onUpdateParagraphs={(paragraphs) => {
                paragraphs.forEach(p => handleParagraphUpdate(p));
            }} onUpdateMapSettings={setMapSettings}/>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      <framer_motion_1.AnimatePresence>
        {state.showImageEditor && selectedParagraph && (<framer_motion_1.motion.div variants={overlayVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 bg-black bg-opacity-50">
            <framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <ImageEditor_1.default onSave={(imageData, position) => {
                handleParagraphUpdate({
                    ...selectedParagraph,
                    image: imageData ? { data: imageData, position } : undefined
                });
                actions.setShowImageEditor(false);
            }} onClose={() => actions.setShowImageEditor(false)} isDarkMode={isDarkMode} language={language} initialImage={selectedParagraph.image?.data} initialPosition={selectedParagraph.image?.position}/>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </framer_motion_1.motion.div>);
};
exports.default = ParagraphEditor;
