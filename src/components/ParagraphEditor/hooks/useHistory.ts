import { useState, useCallback } from 'react';
import { Paragraph } from '../types';

interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}

export const useHistory = (
  selectedParagraph: Paragraph,
  onUpdate: (updatedParagraph: Paragraph) => void
) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: selectedParagraph.content || '',
    future: []
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const pushToHistory = useCallback((content: string) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: content,
      future: []
    }));
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;

    setHistory(prev => {
      const newPresent = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      onUpdate({
        ...selectedParagraph,
        content: newPresent
      });

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future]
      };
    });
  }, [canUndo, selectedParagraph, onUpdate]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory(prev => {
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);

      onUpdate({
        ...selectedParagraph,
        content: newPresent
      });

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture
      };
    });
  }, [canRedo, selectedParagraph, onUpdate]);

  const handleContentChange = useCallback((content: string) => {
    pushToHistory(content);
    onUpdate({
      ...selectedParagraph,
      content
    });
  }, [selectedParagraph, onUpdate, pushToHistory]);

  return {
    content: history.present,
    handleContentChange,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
