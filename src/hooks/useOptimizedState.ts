import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useReducer } from 'react';
import { Paragraph, Action, NotificationType } from '../components/ParagraphEditor/types';

// State interface
interface EditorState {
  paragraphs: Paragraph[];
  selectedParagraph: number | null;
  content: string;
  actions: Action[];
  isDirty: boolean;
  lastSaved: string | null;
  error: Error | null;
}

// Action types
type EditorAction =
  | { type: 'SET_PARAGRAPHS'; payload: Paragraph[] }
  | { type: 'SELECT_PARAGRAPH'; payload: number | null }
  | { type: 'UPDATE_CONTENT'; payload: string }
  | { type: 'UPDATE_ACTIONS'; payload: Action[] }
  | { type: 'MARK_SAVED'; payload: string }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: EditorState = {
  paragraphs: [],
  selectedParagraph: null,
  content: '',
  actions: [],
  isDirty: false,
  lastSaved: null,
  error: null
};

// Reducer function
const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
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
export const useOptimizedState = (
  initialParagraphs: Paragraph[] = [],
  onSave: (paragraphs: Paragraph[]) => void,
  onError: (error: Error) => void
) => {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    paragraphs: initialParagraphs
  });

  // Refs for performance optimization
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveAttemptRef = useRef<number>(0);

  // Memoized selectors
  const selectedParagraphData = useMemo(() => {
    return state.paragraphs.find(p => p.id === state.selectedParagraph);
  }, [state.paragraphs, state.selectedParagraph]);

  const connectedParagraphs = useMemo(() => {
    if (!selectedParagraphData) return { incoming: [], outgoing: [] };
    
    return {
      incoming: state.paragraphs.filter(p => 
        p.actions.some(a => a['N.Par.'] === selectedParagraphData.id.toString())
      ),
      outgoing: state.paragraphs.filter(p => 
        selectedParagraphData.actions.some(a => a['N.Par.'] === p.id.toString())
      )
    };
  }, [selectedParagraphData, state.paragraphs]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
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
    } else {
      onSave(state.paragraphs);
      lastSaveAttemptRef.current = now;
      dispatch({ type: 'MARK_SAVED', payload: new Date().toISOString() });
    }
  }, [state.paragraphs, onSave]);

  // Auto-save effect
  useEffect(() => {
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
  useEffect(() => {
    if (state.error) {
      onError(state.error);
    }
  }, [state.error, onError]);

  // Actions
  const actions = {
    setParagraphs: useCallback((paragraphs: Paragraph[]) => {
      dispatch({ type: 'SET_PARAGRAPHS', payload: paragraphs });
    }, []),

    selectParagraph: useCallback((id: number | null) => {
      dispatch({ type: 'SELECT_PARAGRAPH', payload: id });
    }, []),

    updateContent: useCallback((content: string) => {
      dispatch({ type: 'UPDATE_CONTENT', payload: content });
    }, []),

    updateActions: useCallback((actions: Action[]) => {
      dispatch({ type: 'UPDATE_ACTIONS', payload: actions });
    }, []),

    setError: useCallback((error: Error | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),

    forceSave: useCallback(() => {
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

export default useOptimizedState;
