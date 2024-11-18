import { useState, useEffect, useRef, useCallback } from 'react';
import { Paragraph, Action, NotificationType, Project } from '../types';
import { MapSettings } from '../../StoryMap/types';

interface UseParagraphEditorProps {
  initialParagraphs?: Paragraph[];
  onSaveProject: (project: Project) => void;
  bookTitle: string;
  author: string;
  updateLastBackup: (date: string) => void;
  initialMapSettings?: MapSettings;
}

interface UseParagraphEditorState {
  paragraphs: Paragraph[];
  selectedParagraph: number | null;
  content: string;
  actions: Action[];
  newParagraphTitle: string;
  paragraphType: 'normale' | 'nodo' | 'finale';
  showStoryMap: boolean;
  notification: NotificationType | null;
  searchTerm: string;
  showConnections: number | null;
  showSearch: boolean;
  showPopup: {
    visible: boolean;
    actionIndex: number | null;
    paragraphId?: number;
    isExisting?: boolean;
  };
  showImageEditor: boolean;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  mapSettings?: MapSettings;
}

interface UseParagraphEditorActions {
  setParagraphs: React.Dispatch<React.SetStateAction<Paragraph[]>>;
  setSelectedParagraph: (id: number | null) => void;
  setContent: (content: string) => void;
  setActions: React.Dispatch<React.SetStateAction<Action[]>>;
  setNewParagraphTitle: (title: string) => void;
  setParagraphType: (type: 'normale' | 'nodo' | 'finale') => void;
  setShowStoryMap: (show: boolean) => void;
  setNotification: (notification: NotificationType | null) => void;
  setSearchTerm: (term: string) => void;
  setShowConnections: (id: number | null) => void;
  setShowSearch: (show: boolean) => void;
  setShowPopup: (popup: { visible: boolean; actionIndex: number | null; paragraphId?: number; isExisting?: boolean; }) => void;
  setShowImageEditor: (show: boolean) => void;
  setMapSettings: (settings: MapSettings | undefined) => void;
  handleContentChange: (content: string) => void;
  handleSave: (showNotification?: boolean) => void;
  updateParagraphConnections: (updatedParagraph: Paragraph) => void;
}

export const useParagraphEditor = ({
  initialParagraphs = [],
  onSaveProject,
  bookTitle,
  author,
  updateLastBackup,
  initialMapSettings,
}: UseParagraphEditorProps): { state: UseParagraphEditorState; actions: UseParagraphEditorActions } => {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>(() =>
    initialParagraphs.map(p => ({
      ...p,
      outgoingConnections: p.actions.map(a => a['N.Par.']).filter(Boolean),
      tags: p.tags || []
    }))
  );
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [actions, setActions] = useState<Action[]>([]);
  const [newParagraphTitle, setNewParagraphTitle] = useState('');
  const [paragraphType, setParagraphType] = useState<'normale' | 'nodo' | 'finale'>('normale');
  const [showStoryMap, setShowStoryMap] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnections, setShowConnections] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showPopup, setShowPopup] = useState<{
    visible: boolean;
    actionIndex: number | null;
    paragraphId?: number;
    isExisting?: boolean;
  }>({
    visible: false,
    actionIndex: null,
  });
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [mapSettings, setMapSettings] = useState<MapSettings | undefined>(initialMapSettings);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleSetShowStoryMap = useCallback((show: boolean) => {
    console.log('Setting showStoryMap to:', show);
    setShowStoryMap(show);
  }, []);

  useEffect(() => {
    if (paragraphs.length === 0) {
      const newParagraph: Paragraph = {
        id: 1,
        title: '',
        content: '',
        actions: [],
        incomingConnections: [],
        outgoingConnections: [],
        type: 'normale',
        tags: []
      };
      setParagraphs([newParagraph]);
      setSelectedParagraph(1);
    } else if (selectedParagraph === null) {
      setSelectedParagraph(paragraphs[0].id);
    }
  }, [paragraphs.length, selectedParagraph]);

  useEffect(() => {
    if (selectedParagraph !== null) {
      const paragraph = paragraphs.find((p) => p.id === selectedParagraph);
      if (paragraph) {
        setContent(paragraph.content);
        setActions(paragraph.actions || []);
        setNewParagraphTitle(paragraph.title);
        setParagraphType(paragraph.type);
      }
    }
  }, [selectedParagraph, paragraphs]);

  const updateParagraphConnections = useCallback((updatedParagraph: Paragraph) => {
    setParagraphs(prevParagraphs =>
      prevParagraphs.map(p =>
        p.id === updatedParagraph.id
          ? {
              ...p,
              ...updatedParagraph,
              outgoingConnections: updatedParagraph.actions
                .map(a => a['N.Par.'])
                .filter(Boolean)
                .filter((value, index, self) => self.indexOf(value) === index),
              tags: updatedParagraph.tags || []
            }
          : p
      )
    );
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (selectedParagraph !== null) {
      const currentParagraph = paragraphs.find(p => p.id === selectedParagraph);
      if (currentParagraph) {
        updateParagraphConnections({
          ...currentParagraph,
          content: newContent,
          title: newParagraphTitle,
          actions,
          type: paragraphType
        });
      }
    }
  }, [selectedParagraph, paragraphs, newParagraphTitle, actions, paragraphType, updateParagraphConnections]);

  const handleSave = useCallback((showNotification = true) => {
    if (selectedParagraph !== null) {
      const updatedParagraphs = paragraphs.map((p) =>
        p.id === selectedParagraph
          ? {
              ...p,
              content,
              title: newParagraphTitle || p.title,
              actions,
              type: paragraphType,
              outgoingConnections: actions
                .map(a => a['N.Par.'])
                .filter(Boolean)
                .filter((value, index, self) => self.indexOf(value) === index)
            }
          : p
      );

      setParagraphs(updatedParagraphs);

      const now = new Date();
      const project: Project = {
        id: 'current',
        name: bookTitle,
        bookTitle,
        author,
        paragraphs: updatedParagraphs,
        created: now,
        modified: now,
        lastEdited: now.toISOString(),
        mapSettings
      };

      onSaveProject(project);
      updateLastBackup(new Date().toLocaleString());

      if (showNotification) {
        setNotification({
          message: 'Project saved successfully',
          type: 'success'
        });
      }
    }
  }, [
    selectedParagraph,
    content,
    newParagraphTitle,
    actions,
    paragraphType,
    bookTitle,
    author,
    onSaveProject,
    updateLastBackup,
    paragraphs,
    mapSettings,
  ]);

  return {
    state: {
      paragraphs,
      selectedParagraph,
      content,
      actions,
      newParagraphTitle,
      paragraphType,
      showStoryMap,
      notification,
      searchTerm,
      showConnections,
      showSearch,
      showPopup,
      showImageEditor,
      editorRef,
      mapSettings,
    },
    actions: {
      setParagraphs,
      setSelectedParagraph,
      setContent,
      setActions,
      setNewParagraphTitle,
      setParagraphType,
      setShowStoryMap: handleSetShowStoryMap,
      setNotification,
      setSearchTerm,
      setShowConnections,
      setShowSearch,
      setShowPopup,
      setShowImageEditor,
      setMapSettings,
      handleContentChange,
      handleSave,
      updateParagraphConnections,
    },
  };
};
