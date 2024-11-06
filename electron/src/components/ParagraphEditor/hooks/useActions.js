"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useActions = void 0;
const react_1 = require("react");
const useActions = ({ selectedParagraph, paragraphs, onUpdate, onNotification, translations: t }) => {
    const [popupState, setPopupState] = (0, react_1.useState)({
        visible: false,
        actionIndex: null
    });
    const getNextId = (0, react_1.useCallback)(() => Math.max(...paragraphs.map((p) => p.id)) + 1, [paragraphs]);
    const handleActionChange = (0, react_1.useCallback)((index, field, value) => {
        const updatedActions = [...selectedParagraph.actions];
        updatedActions[index] = { ...updatedActions[index], [field]: value };
        onUpdate({
            ...selectedParagraph,
            actions: updatedActions
        });
    }, [selectedParagraph, onUpdate]);
    const handleActionBlur = (0, react_1.useCallback)((index) => {
        const action = selectedParagraph.actions[index];
        if (action.text.trim() !== '' && action['N.Par.'] === '') {
            const firstAvailableParagraphId = getNextId();
            setPopupState({
                visible: true,
                actionIndex: index,
                paragraphId: firstAvailableParagraphId,
                isExisting: false,
            });
        }
    }, [selectedParagraph, getNextId]);
    const handleRemoveAction = (0, react_1.useCallback)((index) => {
        const updatedActions = selectedParagraph.actions.filter((_, i) => i !== index);
        const updatedParagraph = {
            ...selectedParagraph,
            actions: updatedActions,
            outgoingConnections: updatedActions
                .map(a => a['N.Par.'])
                .filter(Boolean)
                .filter((value, idx, self) => self.indexOf(value) === idx)
        };
        onUpdate(updatedParagraph);
    }, [selectedParagraph, onUpdate]);
    const handleAddAction = (0, react_1.useCallback)(() => {
        onUpdate({
            ...selectedParagraph,
            actions: [...selectedParagraph.actions, { text: '', 'N.Par.': '' }]
        });
    }, [selectedParagraph, onUpdate]);
    const handlePopupConfirm = (0, react_1.useCallback)(() => {
        if (popupState.actionIndex !== null) {
            if (!popupState.isExisting && popupState.paragraphId) {
                // Create new paragraph
                const newParagraph = {
                    id: popupState.paragraphId,
                    title: '',
                    content: '',
                    actions: [],
                    incomingConnections: [selectedParagraph.id],
                    outgoingConnections: [],
                    type: 'normale',
                    tags: [],
                };
                // Update current paragraph's action
                const updatedActions = [...selectedParagraph.actions];
                updatedActions[popupState.actionIndex] = {
                    ...updatedActions[popupState.actionIndex],
                    'N.Par.': popupState.paragraphId.toString()
                };
                // Update connections
                onUpdate({
                    ...selectedParagraph,
                    actions: updatedActions,
                    outgoingConnections: [...selectedParagraph.outgoingConnections, popupState.paragraphId.toString()]
                });
                // Add new paragraph
                onUpdate(newParagraph);
            }
        }
        setPopupState({ visible: false, actionIndex: null });
    }, [popupState, selectedParagraph, onUpdate]);
    const handlePopupCancel = (0, react_1.useCallback)(() => {
        if (popupState.actionIndex !== null) {
            const updatedActions = [...selectedParagraph.actions];
            updatedActions[popupState.actionIndex] = { text: '', 'N.Par.': '' };
            onUpdate({
                ...selectedParagraph,
                actions: updatedActions
            });
        }
        setPopupState({ visible: false, actionIndex: null });
    }, [popupState, selectedParagraph, onUpdate]);
    const handleLinkParagraphs = (0, react_1.useCallback)((sourceId, targetId) => {
        // Find source and target paragraphs
        const sourceParagraph = paragraphs.find(p => p.id === sourceId);
        const targetParagraph = paragraphs.find(p => p.id === targetId);
        if (!sourceParagraph || !targetParagraph) {
            onNotification({
                message: t.errors.invalidConnection,
                type: 'error'
            });
            return;
        }
        // Check if connection already exists
        if (sourceParagraph.outgoingConnections.includes(targetId.toString())) {
            onNotification({
                message: t.errors.connectionExists,
                type: 'error'
            });
            return;
        }
        // Update source paragraph
        onUpdate({
            ...sourceParagraph,
            actions: [...sourceParagraph.actions, { text: '', 'N.Par.': targetId.toString() }],
            outgoingConnections: [...sourceParagraph.outgoingConnections, targetId.toString()]
        });
        // Update target paragraph
        onUpdate({
            ...targetParagraph,
            incomingConnections: [...targetParagraph.incomingConnections, sourceId]
        });
    }, [paragraphs, onUpdate, onNotification, t]);
    const handleUnlinkParagraphs = (0, react_1.useCallback)((sourceId, targetId) => {
        // Find source and target paragraphs
        const sourceParagraph = paragraphs.find(p => p.id === sourceId);
        const targetParagraph = paragraphs.find(p => p.id === targetId);
        if (!sourceParagraph || !targetParagraph) {
            onNotification({
                message: t.errors.invalidConnection,
                type: 'error'
            });
            return;
        }
        // Update source paragraph
        onUpdate({
            ...sourceParagraph,
            actions: sourceParagraph.actions.filter(a => a['N.Par.'] !== targetId.toString()),
            outgoingConnections: sourceParagraph.outgoingConnections.filter(id => id !== targetId.toString())
        });
        // Update target paragraph
        onUpdate({
            ...targetParagraph,
            incomingConnections: targetParagraph.incomingConnections.filter(id => id !== sourceId)
        });
    }, [paragraphs, onUpdate, onNotification, t]);
    const handleCheckConnection = (0, react_1.useCallback)((sourceId, targetId) => {
        const sourceParagraph = paragraphs.find(p => p.id === sourceId);
        return sourceParagraph?.outgoingConnections.includes(targetId.toString()) || false;
    }, [paragraphs]);
    return {
        popupState,
        handleActionChange,
        handleActionBlur,
        handleRemoveAction,
        handleAddAction,
        handlePopupConfirm,
        handlePopupCancel,
        handleLinkParagraphs,
        handleUnlinkParagraphs,
        handleCheckConnection,
        getNextId
    };
};
exports.useActions = useActions;
