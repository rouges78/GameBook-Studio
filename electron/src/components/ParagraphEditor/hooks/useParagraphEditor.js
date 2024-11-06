"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useParagraphEditor = void 0;
const react_1 = require("react");
const useParagraphEditor = ({ initialParagraphs = [], onSaveProject, bookTitle, author, updateLastBackup, initialMapSettings, }) => {
    const [paragraphs, setParagraphs] = (0, react_1.useState)(() => initialParagraphs.map(p => ({
        ...p,
        outgoingConnections: p.actions.map(a => a['N.Par.']).filter(Boolean),
        tags: p.tags || []
    })));
    const [selectedParagraph, setSelectedParagraph] = (0, react_1.useState)(null);
    const [content, setContent] = (0, react_1.useState)('');
    const [actions, setActions] = (0, react_1.useState)([]);
    const [newParagraphTitle, setNewParagraphTitle] = (0, react_1.useState)('');
    const [paragraphType, setParagraphType] = (0, react_1.useState)('normale');
    const [showStoryMap, setShowStoryMap] = (0, react_1.useState)(false);
    const [notification, setNotification] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [showConnections, setShowConnections] = (0, react_1.useState)(null);
    const [showSearch, setShowSearch] = (0, react_1.useState)(false);
    const [showPopup, setShowPopup] = (0, react_1.useState)({
        visible: false,
        actionIndex: null,
    });
    const [showImageEditor, setShowImageEditor] = (0, react_1.useState)(false);
    const [mapSettings, setMapSettings] = (0, react_1.useState)(initialMapSettings);
    const editorRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (paragraphs.length === 0) {
            const newParagraph = {
                id: 1,
                title: '',
                content: '',
                actions: [],
                incomingConnections: [],
                outgoingConnections: [],
                type: 'normale',
                tags: []
            };
            setParagraphs([newParagraph]);
            setSelectedParagraph(1);
        }
        else if (selectedParagraph === null) {
            setSelectedParagraph(paragraphs[0].id);
        }
    }, [paragraphs.length, selectedParagraph]);
    (0, react_1.useEffect)(() => {
        if (selectedParagraph !== null) {
            const paragraph = paragraphs.find((p) => p.id === selectedParagraph);
            if (paragraph) {
                setContent(paragraph.content);
                setActions(paragraph.actions || []);
                setNewParagraphTitle(paragraph.title);
                setParagraphType(paragraph.type);
            }
        }
    }, [selectedParagraph, paragraphs]);
    const updateParagraphConnections = (0, react_1.useCallback)((updatedParagraph) => {
        setParagraphs(prevParagraphs => prevParagraphs.map(p => p.id === updatedParagraph.id
            ? {
                ...p,
                ...updatedParagraph,
                outgoingConnections: updatedParagraph.actions
                    .map(a => a['N.Par.'])
                    .filter(Boolean)
                    .filter((value, index, self) => self.indexOf(value) === index),
                tags: updatedParagraph.tags || []
            }
            : p));
    }, []);
    const handleContentChange = (0, react_1.useCallback)((newContent) => {
        setContent(newContent);
        if (selectedParagraph !== null) {
            const currentParagraph = paragraphs.find(p => p.id === selectedParagraph);
            if (currentParagraph) {
                updateParagraphConnections({
                    ...currentParagraph,
                    content: newContent,
                    title: newParagraphTitle,
                    actions,
                    type: paragraphType
                });
            }
        }
    }, [selectedParagraph, paragraphs, newParagraphTitle, actions, paragraphType, updateParagraphConnections]);
    const handleSave = (0, react_1.useCallback)((showNotification = true) => {
        if (selectedParagraph !== null) {
            const updatedParagraphs = paragraphs.map((p) => p.id === selectedParagraph
                ? {
                    ...p,
                    content,
                    title: newParagraphTitle || p.title,
                    actions,
                    type: paragraphType,
                    outgoingConnections: actions
                        .map(a => a['N.Par.'])
                        .filter(Boolean)
                        .filter((value, index, self) => self.indexOf(value) === index)
                }
                : p);
            setParagraphs(updatedParagraphs);
            const project = {
                bookTitle,
                author,
                paragraphs: updatedParagraphs,
                lastEdited: new Date().toISOString(),
                mapSettings
            };
            onSaveProject(project);
            updateLastBackup(new Date().toLocaleString());
            if (showNotification) {
                setNotification({
                    message: 'Project saved successfully',
                    type: 'success'
                });
            }
        }
    }, [
        selectedParagraph,
        content,
        newParagraphTitle,
        actions,
        paragraphType,
        bookTitle,
        author,
        onSaveProject,
        updateLastBackup,
        paragraphs,
        mapSettings,
    ]);
    return {
        state: {
            paragraphs,
            selectedParagraph,
            content,
            actions,
            newParagraphTitle,
            paragraphType,
            showStoryMap,
            notification,
            searchTerm,
            showConnections,
            showSearch,
            showPopup,
            showImageEditor,
            editorRef,
            mapSettings,
        },
        actions: {
            setParagraphs,
            setSelectedParagraph,
            setContent,
            setActions,
            setNewParagraphTitle,
            setParagraphType,
            setShowStoryMap,
            setNotification,
            setSearchTerm,
            setShowConnections,
            setShowSearch,
            setShowPopup,
            setShowImageEditor,
            setMapSettings,
            handleContentChange,
            handleSave,
            updateParagraphConnections,
        },
    };
};
exports.useParagraphEditor = useParagraphEditor;
