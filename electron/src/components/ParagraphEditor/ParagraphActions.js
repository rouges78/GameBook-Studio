"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const ActionInput = react_1.default.memo(({ value, onChange, onBlur, placeholder, className, type = 'text' }) => (<input type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={className} placeholder={placeholder}/>));
ActionInput.displayName = 'ActionInput';
const ParagraphActions = ({ actions, isDarkMode, onActionChange, onActionBlur, onRemoveAction, onAddAction, }) => {
    const handleActionChange = react_1.default.useCallback((index, field, value) => {
        if (field === 'N.Par.' && value !== '') {
            // Ensure only numbers are entered for paragraph references
            const numValue = value.replace(/[^0-9]/g, '');
            onActionChange(index, field, numValue);
        }
        else {
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
    }, [onActionChange, onAddAction, actions]);
    const handleActionBlur = react_1.default.useCallback((index) => {
        const action = actions[index];
        if (action.text.trim() !== '') {
            onActionBlur(index);
        }
    }, [actions, onActionBlur]);
    const baseInputClass = react_1.default.useMemo(() => `
    py-1 px-2 rounded text-sm transition-colors
    ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}
    focus:outline-none focus:ring-1
    ${isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}
  `, [isDarkMode]);
    // Ensure there's always at least one empty action line
    react_1.default.useEffect(() => {
        if (actions.length === 0 || actions.every(a => a.text.trim() !== '')) {
            onAddAction();
        }
    }, [actions, onAddAction]);
    return (<div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700">
        <h3 className="text-sm font-medium">Azioni multiple</h3>
        <button onClick={onAddAction} className={`
            p-1 rounded text-xs font-medium transition-colors
            ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}
            text-white flex items-center gap-1
          `}>
          <lucide_react_1.Plus size={14}/>
          Aggiungi
        </button>
      </div>
      <div className="p-2 flex flex-col gap-1.5">
        {actions.map((action, index) => (<div key={index} className="flex items-center gap-1.5">
            <ActionInput value={action.text} onChange={(value) => handleActionChange(index, 'text', value)} onBlur={() => handleActionBlur(index)} placeholder="Inserisci azione" className={`flex-1 ${baseInputClass}`}/>
            <ActionInput value={action['N.Par.']} onChange={(value) => handleActionChange(index, 'N.Par.', value)} placeholder="N.Par." className={`w-16 ${baseInputClass}`} type="number"/>
            <button onClick={() => onRemoveAction(index)} className={`
                p-1 rounded transition-colors
                text-red-500 hover:bg-red-600 hover:text-white
                focus:outline-none focus:ring-1 focus:ring-red-500
              `} title="Rimuovi azione">
              <lucide_react_1.Trash2 size={16}/>
            </button>
          </div>))}
      </div>
    </div>);
};
function areEqual(prevProps, nextProps) {
    return (prevProps.isDarkMode === nextProps.isDarkMode &&
        prevProps.actions === nextProps.actions &&
        prevProps.onActionChange === nextProps.onActionChange &&
        prevProps.onActionBlur === nextProps.onActionBlur &&
        prevProps.onRemoveAction === nextProps.onRemoveAction &&
        prevProps.onAddAction === nextProps.onAddAction);
}
exports.default = react_1.default.memo(ParagraphActions, areEqual);
