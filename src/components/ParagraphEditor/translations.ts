export const translations = {
  it: {
    backToHome: 'Torna alla Home',
    backToDashboard: 'Torna alla Dashboard',
    editorTitle: 'Editor Paragrafi',
    addParagraph: 'Aggiungi Paragrafo',
    searchPlaceholder: 'Cerca per titolo o contenuto',
    untitled: 'Senza titolo',
    enterTitle: 'Inserisci titolo...',
    enterContent: 'Inizia a scrivere il paragrafo qui...',
    save: 'Salva',
    delete: 'Elimina',
    export: 'Esporta',
    modifyImage: 'Modifica immagine',
    addImage: 'Aggiungi immagine',
    showMap: 'Mostra Mappa',
    hideMap: 'Nascondi Mappa',
    cannotDeleteLast: 'Non puoi eliminare l\'ultimo paragrafo',
    selectParagraph: 'Seleziona un paragrafo',
    confirmConnection: 'Confermi il collegamento al paragrafo',
    createNewParagraph: 'Creare un nuovo paragrafo',
    cancel: 'Annulla',
    confirm: 'Conferma',
    nodeTypes: {
      title: 'TIPO NODO:',
      normal: 'Normale',
      intermediate: 'Intermedio',
      final: 'Finale'
    },
    actions: {
      title: 'Azioni multiple',
      add: 'Aggiungi azione',
      placeholder: 'Inserisci azione...',
      paragraphNumber: 'N.Par.'
    },
    tags: {
      title: 'Tags',
      placeholder: 'Aggiungi tag (premi Invio o Tab per confermare)',
      add: 'Aggiungi tag'
    },
    connections: {
      incoming: 'Collegamenti in entrata',
      outgoing: 'Collegamenti in uscita',
      paragraph: 'Paragrafo'
    },
    errors: {
      invalidConnection: 'Collegamento non valido',
      connectionExists: 'Collegamento già esistente'
    },
    formatButtons: {
      bold: 'Grassetto',
      italic: 'Corsivo',
      underline: 'Sottolineato',
      strikethrough: 'Barrato',
      heading1: 'Titolo 1',
      heading2: 'Titolo 2',
      heading3: 'Titolo 3',
      quote: 'Citazione',
      code: 'Codice',
      link: 'Link'
    },
    stats: {
      words: 'Parole',
      characters: 'Caratteri'
    }
  },
  en: {
    backToHome: 'Back to Home',
    backToDashboard: 'Back to Dashboard',
    editorTitle: 'Paragraph Editor',
    addParagraph: 'Add Paragraph',
    searchPlaceholder: 'Search by title or content',
    untitled: 'Untitled',
    enterTitle: 'Enter title...',
    enterContent: 'Start writing your paragraph here...',
    save: 'Save',
    delete: 'Delete',
    export: 'Export',
    modifyImage: 'Modify Image',
    addImage: 'Add Image',
    showMap: 'Show Map',
    hideMap: 'Hide Map',
    cannotDeleteLast: 'Cannot delete the last paragraph',
    selectParagraph: 'Select a paragraph',
    confirmConnection: 'Confirm connection to paragraph',
    createNewParagraph: 'Create a new paragraph',
    cancel: 'Cancel',
    confirm: 'Confirm',
    nodeTypes: {
      title: 'NODE TYPE:',
      normal: 'Normal',
      intermediate: 'Intermediate',
      final: 'Final'
    },
    actions: {
      title: 'Multiple actions',
      add: 'Add action',
      placeholder: 'Enter action...',
      paragraphNumber: 'Par.No.'
    },
    tags: {
      title: 'Tags',
      placeholder: 'Add tag (press Enter or Tab to confirm)',
      add: 'Add tag'
    },
    connections: {
      incoming: 'Incoming connections',
      outgoing: 'Outgoing connections',
      paragraph: 'Paragraph'
    },
    errors: {
      invalidConnection: 'Invalid connection',
      connectionExists: 'Connection already exists'
    },
    formatButtons: {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strikethrough: 'Strikethrough',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      quote: 'Quote',
      code: 'Code',
      link: 'Link'
    },
    stats: {
      words: 'Words',
      characters: 'Characters'
    }
  }
} as const;

export type Language = keyof typeof translations;
