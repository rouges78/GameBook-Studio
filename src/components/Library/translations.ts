export const translations = {
  it: {
    backToHome: "Torna alla Home",
    gamebookLibrary: "Libreria Gamebook",
    searchByTitleOrAuthor: "Cerca per titolo o autore...",
    sortByTitleAZ: "A-Z Nome",
    sortByAuthorAZ: "A-Z Autore",
    sortByDate: "Per data",
    gridView: "Vista a griglia",
    listView: "Vista a lista",
    by: "di",
    editBook: "Modifica libro",
    deleteBook: "Elimina libro",
    changeCover: "Cambia copertina",
    changeTitleAuthor: "Cambia titolo/autore",
    exportBook: "Esporta libro",
    save: "Salva",
    cancel: "Annulla",
    untitled: "Senza titolo",
    lastEdited: "Ultima modifica",
    paragraphs: "paragrafi",
    enterBookTitle: "Inserisci il titolo del libro",
    enterAuthorName: "Inserisci il nome dell'autore"
  },
  en: {
    backToHome: "Back to Home",
    gamebookLibrary: "Gamebook Library",
    searchByTitleOrAuthor: "Search by title or author...",
    sortByTitleAZ: "A-Z Title",
    sortByAuthorAZ: "A-Z Author",
    sortByDate: "By date",
    gridView: "Grid view",
    listView: "List view",
    by: "by",
    editBook: "Edit book",
    deleteBook: "Delete book",
    changeCover: "Change cover",
    changeTitleAuthor: "Change title/author",
    exportBook: "Export book",
    save: "Save",
    cancel: "Cancel",
    untitled: "Untitled",
    lastEdited: "Last edited",
    paragraphs: "paragraphs",
    enterBookTitle: "Enter book title",
    enterAuthorName: "Enter author name"
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
