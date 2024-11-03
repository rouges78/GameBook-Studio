interface Translations {
  backToEditor: string;
  exportProject: string;
  executePageShuffle: string;
  convertParagraphsToPages: string;
  selectFormat: string;
  margins: string;
  orientation: string;
  formatting: string;
  includeImages: string;
  includeMeta: string;
  tableOfContents: string;
  pageNumbers: string;
  fontSize: string;
  lineSpacing: string;
  fontFamily: string;
  export: string;
  cancel: string;
  goToPage: string;
  shuffleSuccess: string;
  shuffleError: string;
  conversionSuccess: string;
  conversionError: string;
  exportSuccess: string;
  exportError: string;
}

export const translations: { [key: string]: Translations } = {
  it: {
    backToEditor: "Torna all'Editor",
    exportProject: "Esporta Progetto",
    executePageShuffle: "Esegui Shuffle Pagine",
    convertParagraphsToPages: "Converti Paragrafi in Pagine",
    selectFormat: "Seleziona Formato",
    margins: "Margini",
    orientation: "Orientamento",
    formatting: "Formattazione",
    includeImages: "Includi Immagini",
    includeMeta: "Includi Metadati",
    tableOfContents: "Indice",
    pageNumbers: "Numeri di Pagina",
    fontSize: "Dimensione Font",
    lineSpacing: "Interlinea",
    fontFamily: "Famiglia Font",
    export: "Esporta",
    cancel: "Annulla",
    goToPage: "vai a pagina n.",
    shuffleSuccess: "Shuffle completato con successo",
    shuffleError: "Errore durante lo shuffle",
    conversionSuccess: "Conversione completata con successo",
    conversionError: "Errore durante la conversione",
    exportSuccess: "Esportazione in {format} completata",
    exportError: "Errore durante l'esportazione"
  },
  en: {
    backToEditor: "Back to Editor",
    exportProject: "Export Project",
    executePageShuffle: "Execute Page Shuffle",
    convertParagraphsToPages: "Convert Paragraphs to Pages",
    selectFormat: "Select Format",
    margins: "Margins",
    orientation: "Orientation",
    formatting: "Formatting",
    includeImages: "Include Images",
    includeMeta: "Include Metadata",
    tableOfContents: "Table of Contents",
    pageNumbers: "Page Numbers",
    fontSize: "Font Size",
    lineSpacing: "Line Spacing",
    fontFamily: "Font Family",
    export: "Export",
    cancel: "Cancel",
    goToPage: "go to page n.",
    shuffleSuccess: "Shuffle completed successfully",
    shuffleError: "Error during shuffle",
    conversionSuccess: "Conversion completed successfully",
    conversionError: "Error during conversion",
    exportSuccess: "Export to {format} completed",
    exportError: "Error during export"
  }
};
