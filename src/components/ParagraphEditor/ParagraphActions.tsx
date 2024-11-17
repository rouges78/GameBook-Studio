import React from 'react';
import { Trash2, Plus, Info } from 'lucide-react';
import { Action } from './types';

interface ParagraphActionsProps {
  actions: Action[];
  isDarkMode: boolean;
  onActionChange: (index: number, field: keyof Action, value: string) => void;
  onActionBlur: (index: number) => void;
  onRemoveAction: (index: number) => void;
  onAddAction: () => void;
  totalParagraphs: number; // Nuovo prop per il numero totale di paragrafi
}

interface ActionInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  className: string;
  type?: 'text' | 'number';
  max?: number;
  title?: string;
}

const ActionInput: React.FC<ActionInputProps> = React.memo(({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  type = 'text',
  max,
  title
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    className={className}
    placeholder={placeholder}
    max={max}
    title={title}
  />
));

ActionInput.displayName = 'ActionInput';

const ParagraphActions: React.FC<ParagraphActionsProps> = ({
  actions,
  isDarkMode,
  onActionChange,
  onActionBlur,
  onRemoveAction,
  onAddAction,
  totalParagraphs
}) => {
  const handleActionChange = React.useCallback((
    index: number,
    field: keyof Action,
    value: string
  ) => {
    if (field === 'N.Par.' && value !== '') {
      // Ensure only numbers are entered for paragraph references
      const numValue = value.replace(/[^0-9]/g, '');
      // Ensure the value doesn't exceed totalParagraphs
      const finalValue = Math.min(parseInt(numValue) || 0, totalParagraphs).toString();
      onActionChange(index, field, finalValue);
    } else {
      onActionChange(index, field, value);
      
      // Automatically add new action line if this is the last one and has content
      if (field === 'text' && value.trim() !== '') {
        const isLastAction = index === actions.length - 1;
        const hasNoEmptyActions = actions.every(a => a.text.trim() !== '');
        if (isLastAction && hasNoEmptyActions) {
          onAddAction();
        }
      }
    }
  }, [onActionChange, onAddAction, actions, totalParagraphs]);

  const handleActionBlur = React.useCallback((index: number) => {
    const action = actions[index];
    if (action.text.trim() !== '') {
      onActionBlur(index);
    }
  }, [actions, onActionBlur]);

  const baseInputClass = React.useMemo(() => `
    py-1 px-2 rounded text-sm transition-colors
    ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}
    focus:outline-none focus:ring-1
    ${isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}
  `, [isDarkMode]);

  // Ensure there's always at least one empty action line
  React.useEffect(() => {
    const hasEmptyAction = actions.some(a => a.text.trim() === '');
    if (actions.length === 0 || (!hasEmptyAction && actions.every(a => a.text.trim() !== ''))) {
      onAddAction();
    }
  }, [actions, onAddAction]);

  return (
    <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700">
        <h3 className="text-sm font-medium">Azioni multiple</h3>
        <button
          onClick={onAddAction}
          className={`
            p-1 rounded text-xs font-medium transition-colors
            ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}
            text-white flex items-center gap-1
          `}
        >
          <Plus size={14} />
          Aggiungi
        </button>
      </div>
      <div className="p-2 flex flex-col gap-1.5">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <ActionInput
              value={action.text}
              onChange={(value) => handleActionChange(index, 'text', value)}
              onBlur={() => handleActionBlur(index)}
              placeholder="Inserisci azione"
              className={`flex-1 ${baseInputClass}`}
            />
            <div className="relative">
              <ActionInput
                value={action['N.Par.']}
                onChange={(value) => handleActionChange(index, 'N.Par.', value)}
                placeholder="N.Par."
                className={`w-16 ${baseInputClass}`}
                type="number"
                max={totalParagraphs}
                title={`Inserisci un numero da 1 a ${totalParagraphs}`}
              />
              <div 
                className="absolute -right-6 top-1/2 -translate-y-1/2 cursor-help"
                title={`Paragrafi disponibili: 1-${totalParagraphs}`}
              >
                <Info size={14} className="text-gray-400" />
              </div>
            </div>
            <button
              onClick={() => onRemoveAction(index)}
              className={`
                p-1 rounded transition-colors
                text-red-500 hover:bg-red-600 hover:text-white
                focus:outline-none focus:ring-1 focus:ring-red-500
              `}
              title="Rimuovi azione"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function areEqual(prevProps: ParagraphActionsProps, nextProps: ParagraphActionsProps) {
  return (
    prevProps.isDarkMode === nextProps.isDarkMode &&
    prevProps.actions === nextProps.actions &&
    prevProps.onActionChange === nextProps.onActionChange &&
    prevProps.onActionBlur === nextProps.onActionBlur &&
    prevProps.onRemoveAction === nextProps.onRemoveAction &&
    prevProps.onAddAction === nextProps.onAddAction &&
    prevProps.totalParagraphs === nextProps.totalParagraphs
  );
}

export default React.memo(ParagraphActions, areEqual);
