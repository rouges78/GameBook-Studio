import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Action } from './types';

interface ParagraphActionsProps {
  actions: Action[];
  isDarkMode: boolean;
  onActionChange: (index: number, field: keyof Action, value: string) => void;
  onActionBlur: (index: number) => void;
  onRemoveAction: (index: number) => void;
  onAddAction: () => void;
  totalParagraphs: number;
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
  index: number;
  onKeyDown?: (e: React.KeyboardEvent, index: number) => void;
}

const ActionInput: React.FC<ActionInputProps> = React.memo(({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  type = 'text',
  max,
  title,
  index,
  onKeyDown
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    onKeyDown={(e) => onKeyDown?.(e, index)}
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
      // Accetta qualsiasi numero valido
      const numValue = value.replace(/[^0-9]/g, '');
      if (numValue) {
        onActionChange(index, field, numValue);
      }
    } else {
      onActionChange(index, field, value);
      
      // Se è l'ultima azione e ha del testo, aggiungi una nuova azione vuota
      if (field === 'text' && value.trim() !== '') {
        const isLastAction = index === actions.length - 1;
        if (isLastAction) {
          onAddAction();
        }
      }
    }
  }, [onActionChange, onAddAction, actions]);

  const handleActionBlur = React.useCallback((index: number) => {
    const action = actions[index];
    if (action.text.trim() !== '') {
      onActionBlur(index);
    }
  }, [actions, onActionBlur]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent, index: number) => {
    const action = actions[index];
    if ((e.key === 'Tab' || e.key === 'Enter') && action.text.trim() !== '') {
      e.preventDefault();
      
      // Se non c'è già un N.Par. impostato, suggeriamo il prossimo numero disponibile
      if (!action['N.Par.']) {
        const nextParagraphNumber = (totalParagraphs + 1).toString();
        handleActionChange(index, 'N.Par.', nextParagraphNumber);
        // Forziamo l'onActionBlur subito dopo aver impostato il numero
        setTimeout(() => onActionBlur(index), 0);
      }
    }
  }, [actions, handleActionChange, onActionBlur, totalParagraphs]);

  const baseInputClass = React.useMemo(() => `
    py-1 px-2 rounded text-sm transition-colors
    ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}
    focus:outline-none focus:ring-1
    ${isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}
  `, [isDarkMode]);

  // Se non ci sono azioni, aggiungi una azione vuota
  React.useEffect(() => {
    if (actions.length === 0) {
      onAddAction();
    }
  }, []); // Solo all'mount del componente

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
              index={index}
              onKeyDown={handleKeyDown}
            />
            <ActionInput
              value={action['N.Par.']}
              onChange={(value) => handleActionChange(index, 'N.Par.', value)}
              placeholder="N.Par."
              className={`w-16 ${baseInputClass}`}
              type="number"
              index={index}
            />
            <button
              onClick={() => onRemoveAction(index)}
              className={`
                p-1 rounded transition-colors
                text-red-500 hover:bg-red-600 hover:text-white
                focus:outline-none focus:ring-1 focus:ring-red-500
              `}
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
