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

      onUpdate({
        ...selectedParagraph,
        actions: updatedActions
      });
    }
  }, [selectedParagraph, onUpdate]);

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
    onUpdate({
      ...selectedParagraph,
      actions: [...selectedParagraph.actions, { text: '', 'N.Par.': '' }]
    });
  }, [selectedParagraph, onUpdate]);

  const handlePopupConfirm = useCallback(() => {
    if (popupState.paragraphId && selectedParagraph) {
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
      onUpdate(newParagraph);
      onNotification({
        message: 'New paragraph created successfully',
        type: 'success'
      });
    }
    setPopupState({ visible: false, actionIndex: null });
  }, [popupState.paragraphId, selectedParagraph, onUpdate, onNotification]);

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
