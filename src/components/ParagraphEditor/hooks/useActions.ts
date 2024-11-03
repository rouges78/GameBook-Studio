import { useCallback, useState } from 'react';
import { Paragraph, Action, NotificationType } from '../types';

interface PopupState {
  visible: boolean;
  actionIndex: number | null;
  paragraphId?: number;
  isExisting?: boolean;
}

interface UseActionsProps {
  selectedParagraph: Paragraph;
  paragraphs: Paragraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  onNotification: (notification: NotificationType | null) => void;
  translations: any; // TODO: Add proper type
}

export const useActions = ({
  selectedParagraph,
  paragraphs,
  onUpdate,
  onNotification,
  translations: t
}: UseActionsProps) => {
  const [popupState, setPopupState] = useState<PopupState>({
    visible: false,
    actionIndex: null
  });

  const getNextId = useCallback(() => Math.max(...paragraphs.map((p) => p.id)) + 1, [paragraphs]);

  const handleActionChange = useCallback((index: number, field: keyof Action, value: string) => {
    const updatedActions = [...selectedParagraph.actions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    onUpdate({
      ...selectedParagraph,
      actions: updatedActions
    });
  }, [selectedParagraph, onUpdate]);

  const handleActionBlur = useCallback((index: number) => {
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

  const handleRemoveAction = useCallback((index: number) => {
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

  const handleAddAction = useCallback(() => {
    onUpdate({
      ...selectedParagraph,
      actions: [...selectedParagraph.actions, { text: '', 'N.Par.': '' }]
    });
  }, [selectedParagraph, onUpdate]);

  const handlePopupConfirm = useCallback(() => {
    if (popupState.actionIndex !== null) {
      if (!popupState.isExisting && popupState.paragraphId) {
        // Create new paragraph
        const newParagraph: Paragraph = {
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

  const handlePopupCancel = useCallback(() => {
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

  const handleLinkParagraphs = useCallback((sourceId: number, targetId: number) => {
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

  const handleUnlinkParagraphs = useCallback((sourceId: number, targetId: number) => {
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

  const handleCheckConnection = useCallback((sourceId: number, targetId: number) => {
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
