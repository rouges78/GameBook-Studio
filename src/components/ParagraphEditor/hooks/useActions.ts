import { useState, useCallback } from 'react';
import { Paragraph, NotificationType, PopupState } from '../types';

interface UseActionsProps {
  selectedParagraph: Paragraph;
  paragraphs: Paragraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  onNotification: (notification: NotificationType | null) => void;
  translations: Record<string, any>;
}

export const useActions = ({
  selectedParagraph,
  paragraphs,
  onUpdate,
  onNotification,
  translations
}: UseActionsProps) => {
  const [popupState, setPopupState] = useState<PopupState>({
    visible: false,
    actionIndex: null
  });

  const handleActionChange = useCallback((index: number, field: 'text' | 'N.Par.', value: string) => {
    const updatedActions = [...selectedParagraph.actions];
    if (index >= 0 && index < updatedActions.length) {
      updatedActions[index] = {
        ...updatedActions[index],
        [field]: value
      };

      // If changing paragraph number and it doesn't exist, show popup
      if (field === 'N.Par.' && value && !paragraphs.some(p => p.id === Number(value))) {
        setPopupState({
          visible: true,
          isExisting: false,
          paragraphId: Number(value),
          actionIndex: index
        });
      } else {
        onUpdate({
          ...selectedParagraph,
          actions: updatedActions
        });
      }
    }
  }, [selectedParagraph, paragraphs, onUpdate]);

  const handleActionBlur = useCallback((index: number) => {
    const action = selectedParagraph.actions[index];
    if (action && action['N.Par.'] && !paragraphs.some(p => p.id === Number(action['N.Par.']))) {
      setPopupState({
        visible: true,
        isExisting: false,
        paragraphId: Number(action['N.Par.']),
        actionIndex: index
      });
    }
  }, [selectedParagraph.actions, paragraphs]);

  const handleRemoveAction = useCallback((index: number) => {
    const updatedActions = selectedParagraph.actions.filter((_, i) => i !== index);
    onUpdate({
      ...selectedParagraph,
      actions: updatedActions
    });
  }, [selectedParagraph, onUpdate]);

  const handleAddAction = useCallback(() => {
    const lastAction = selectedParagraph.actions[selectedParagraph.actions.length - 1];
    const newAction = { text: '', 'N.Par.': '' };

    // If last action exists and has no paragraph number, don't add new action
    if (lastAction && !lastAction['N.Par.']) {
      onNotification({
        message: translations.completeLastAction,
        type: 'info'
      });
      return;
    }

    onUpdate({
      ...selectedParagraph,
      actions: [...selectedParagraph.actions, newAction]
    });
  }, [selectedParagraph, onUpdate, onNotification, translations]);

  const handlePopupConfirm = useCallback(() => {
    if (popupState.paragraphId && selectedParagraph) {
      // Create new paragraph
      const newParagraph: Paragraph = {
        id: popupState.paragraphId,
        title: '',
        content: '',
        actions: [],
        incomingConnections: [selectedParagraph.id],
        outgoingConnections: [],
        type: 'normale',
        tags: []
      };

      // Update the current paragraph's action with the new paragraph ID
      const updatedActions = [...selectedParagraph.actions];
      if (typeof popupState.actionIndex === 'number' && popupState.actionIndex >= 0) {
        updatedActions[popupState.actionIndex] = {
          ...updatedActions[popupState.actionIndex],
          'N.Par.': popupState.paragraphId.toString()
        };
      }

      // Update both paragraphs
      onUpdate(newParagraph);
      onUpdate({
        ...selectedParagraph,
        actions: updatedActions,
        outgoingConnections: [...(selectedParagraph.outgoingConnections || []), popupState.paragraphId.toString()]
      });

      onNotification({
        message: translations.newParagraphCreated,
        type: 'success'
      });
    }
    setPopupState({ visible: false, actionIndex: null });
  }, [popupState, selectedParagraph, onUpdate, onNotification, translations]);

  const handlePopupCancel = useCallback(() => {
    if (typeof popupState.actionIndex === 'number' && popupState.actionIndex >= 0) {
      const updatedActions = [...selectedParagraph.actions];
      if (popupState.actionIndex < updatedActions.length) {
        updatedActions[popupState.actionIndex] = {
          ...updatedActions[popupState.actionIndex],
          'N.Par.': ''
        };
        onUpdate({
          ...selectedParagraph,
          actions: updatedActions
        });
      }
    }
    setPopupState({ visible: false, actionIndex: null });
  }, [popupState.actionIndex, selectedParagraph, onUpdate]);

  return {
    popupState,
    handleActionChange,
    handleActionBlur,
    handleRemoveAction,
    handleAddAction,
    handlePopupConfirm,
    handlePopupCancel
  };
};
