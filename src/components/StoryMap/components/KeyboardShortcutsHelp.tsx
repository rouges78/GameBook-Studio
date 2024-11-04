import React, { useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  className?: string;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts({
    onZoomIn: () => {},
    onZoomOut: () => {},
    onZoomReset: () => {},
    onToggleGrid: () => {},
    onToggleDragMode: () => {},
    onSave: () => {},
    onEscape: () => {},
    isEnabled: false // Disable actual shortcuts in the help component
  });

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title="Keyboard Shortcuts"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Keyboard Shortcuts</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono">
                      {shortcut.key}
                    </kbd>
                    <span className="text-gray-300">{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gray-900 text-xs text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">?</kbd> to toggle this help menu
            </div>
          </div>
        </>
      )}
    </div>
  );
};
