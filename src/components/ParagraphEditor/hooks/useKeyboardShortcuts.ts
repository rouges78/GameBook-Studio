import { useEffect } from 'react';
import { Paragraph } from '../types';

interface UseKeyboardShortcutsProps {
  selectedParagraph: Paragraph;
  onUpdate: (updatedParagraph: Paragraph) => void;
  onSave: () => void;
  onShowStoryMap: () => void;
}

export const useKeyboardShortcuts = ({
  selectedParagraph,
  onUpdate,
  onSave,
  onShowStoryMap,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is a textarea or input
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';

      // Save - Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }

      // Only handle formatting shortcuts when editing content
      if (!isEditing) return;

      // Get selected text
      const textarea = target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = selectedParagraph.content || '';
      const selectedText = content.substring(start, end);

      // Format text based on keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        let formattedText = '';
        let handled = true;

        switch (e.key) {
          case 'b': // Bold
            formattedText = `**${selectedText}**`;
            break;
          case 'i': // Italic
            formattedText = `*${selectedText}*`;
            break;
          case 'u': // Underline
            formattedText = `__${selectedText}__`;
            break;
          case 'k': // Link
            formattedText = `[${selectedText}](url)`;
            break;
          case '`': // Code
            formattedText = `\`${selectedText}\``;
            break;
          case 'm': // Show Story Map
            e.preventDefault();
            onShowStoryMap();
            return;
          default:
            handled = false;
        }

        if (handled) {
          e.preventDefault();
          const newContent = content.substring(0, start) + formattedText + content.substring(end);
          onUpdate({
            ...selectedParagraph,
            content: newContent
          });

          // Restore selection
          setTimeout(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + formattedText.length;
            textarea.focus();
          }, 0);
        }
      }

      // Handle heading shortcuts (Alt + number)
      if (e.altKey && /^[123]$/.test(e.key)) {
        e.preventDefault();
        const level = '#'.repeat(Number(e.key));
        const formattedText = `${level} ${selectedText}`;
        const newContent = content.substring(0, start) + formattedText + content.substring(end);
        
        onUpdate({
          ...selectedParagraph,
          content: newContent
        });

        // Restore selection
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + formattedText.length;
          textarea.focus();
        }, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedParagraph, onUpdate, onSave, onShowStoryMap]);
};
