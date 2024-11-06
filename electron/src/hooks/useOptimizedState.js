"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOptimizedState = void 0;
const react_1 = require("react");
const react_2 = require("react");
// Initial state
const initialState = {
    paragraphs: [],
    selectedParagraph: null,
    content: '',
    actions: [],
    isDirty: false,
    lastSaved: null,
    error: null
};
// Reducer function
const editorReducer = (state, action) => {
    switch (action.type) {
        case 'SET_PARAGRAPHS':
            return {
                ...state,
                paragraphs: action.payload,
                isDirty: true
            };
        case 'SELECT_PARAGRAPH':
            return {
                ...state,
                selectedParagraph: action.payload,
                isDirty: false
            };
        case 'UPDATE_CONTENT':
            return {
                ...state,
                content: action.payload,
                isDirty: true
            };
        case 'UPDATE_ACTIONS':
            return {
                ...state,
                actions: action.payload,
                isDirty: true
            };
        case 'MARK_SAVED':
            return {
                ...state,
                isDirty: false,
                lastSaved: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload
            };
        case 'RESET_STATE':
            return initialState;
        default:
            return state;
    }
};
// Custom hook for optimized state management
const useOptimizedState = (initialParagraphs = [], onSave, onError) => {
    const [state, dispatch] = (0, react_2.useReducer)(editorReducer, {
        ...initialState,
        paragraphs: initialParagraphs
    });
    // Refs for performance optimization
    const saveTimeoutRef = (0, react_1.useRef)();
    const lastSaveAttemptRef = (0, react_1.useRef)(0);
    // Memoized selectors
    const selectedParagraphData = (0, react_1.useMemo)(() => {
        return state.paragraphs.find(p => p.id === state.selectedParagraph);
    }, [state.paragraphs, state.selectedParagraph]);
    const connectedParagraphs = (0, react_1.useMemo)(() => {
        if (!selectedParagraphData)
            return { incoming: [], outgoing: [] };
        return {
            incoming: state.paragraphs.filter(p => p.actions.some(a => a['N.Par.'] === selectedParagraphData.id.toString())),
            outgoing: state.paragraphs.filter(p => selectedParagraphData.actions.some(a => a['N.Par.'] === p.id.toString()))
        };
    }, [selectedParagraphData, state.paragraphs]);
    // Debounced save function
    const debouncedSave = (0, react_1.useCallback)(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveAttemptRef.current;
        const minimumSaveInterval = 2000; // 2 seconds
        if (timeSinceLastSave < minimumSaveInterval) {
            saveTimeoutRef.current = setTimeout(() => {
                onSave(state.paragraphs);
                lastSaveAttemptRef.current = Date.now();
                dispatch({ type: 'MARK_SAVED', payload: new Date().toISOString() });
            }, minimumSaveInterval - timeSinceLastSave);
        }
        else {
            onSave(state.paragraphs);
            lastSaveAttemptRef.current = now;
            dispatch({ type: 'MARK_SAVED', payload: new Date().toISOString() });
        }
    }, [state.paragraphs, onSave]);
    // Auto-save effect
    (0, react_1.useEffect)(() => {
        if (state.isDirty) {
            debouncedSave();
        }
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [state.isDirty, debouncedSave]);
    // Error handling effect
    (0, react_1.useEffect)(() => {
        if (state.error) {
            onError(state.error);
        }
    }, [state.error, onError]);
    // Actions
    const actions = {
        setParagraphs: (0, react_1.useCallback)((paragraphs) => {
            dispatch({ type: 'SET_PARAGRAPHS', payload: paragraphs });
        }, []),
        selectParagraph: (0, react_1.useCallback)((id) => {
            dispatch({ type: 'SELECT_PARAGRAPH', payload: id });
        }, []),
        updateContent: (0, react_1.useCallback)((content) => {
            dispatch({ type: 'UPDATE_CONTENT', payload: content });
        }, []),
        updateActions: (0, react_1.useCallback)((actions) => {
            dispatch({ type: 'UPDATE_ACTIONS', payload: actions });
        }, []),
        setError: (0, react_1.useCallback)((error) => {
            dispatch({ type: 'SET_ERROR', payload: error });
        }, []),
        reset: (0, react_1.useCallback)(() => {
            dispatch({ type: 'RESET_STATE' });
        }, []),
        forceSave: (0, react_1.useCallback)(() => {
            debouncedSave();
        }, [debouncedSave])
    };
    return {
        state,
        selectedParagraphData,
        connectedParagraphs,
        actions
    };
};
exports.useOptimizedState = useOptimizedState;
exports.default = exports.useOptimizedState;
