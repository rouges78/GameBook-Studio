## [NON RILASCIATO]

## [1.3.5] - 2025-01-22
### Risolto
- Risolte le segnalazioni di sicurezza di Electron sistemando i conflitti di percorso.
- Risolte le violazioni CSP e gli avvisi di `eval` non sicuro.
- Risolti i problemi di caricamento dello script di preload.
- Semplificata la configurazione di build.
- Rimosse importazioni duplicate di percorsi nel processo principale di Electron.
- Corretta la configurazione del percorso dello script di preload.
- Allineata la versione in `package.json` e nei componenti del changelog.

### Sicurezza
- Abilitato il sandboxing e il contesto isolato in Electron.
- Implementata la validazione dei canali IPC nello script di preload.
- Aggiornate le impostazioni di sicurezza di Electron nel processo principale.

## [1.3.3] - 2025-01-22
### Risolto
- Errori di configurazione della build di Electron.
- Conflitti nella struttura delle cartelle sorgente/output.

### Aggiunto
- Pulsante di salvataggio rapido nella pagina iniziale.
- Logging avanzato degli errori per i backup.

### Modificato
- Migliorata la gestione degli errori con Electron Log.

## [1.3.2] - 2025-01-22
### Risolto
- Errori di inizializzazione del processo principale di Electron.
- Conflitti di sistema di moduli in `main.js`.
- Mancanza di handler IPC di base.
- Migliorato il logging e la gestione degli errori.

## [1.3.1] - 2025-01-09
### Risolto
- Funzionalità del pulsante "torna all'editor di paragrafi".
- Visualizzazione dell'immagine di sfondo della minimappa.
- Ripristino del pulsante di caricamento immagini nella barra laterale.
- Visibilità e posizionamento persistente della barra laterale.

## [1.3.0] - 2025-01-07
### Accessibilità
- Aggiunta di `aria-label` agli input file per gli screen reader.

### Rimosso
- Funzionalità deprecata di regolazione delle immagini.

### Risolto
- Problemi di codifica dei componenti UI.

## [1.2.4] - 2025-01-06
### Miglioramenti UI
- Risolte le aree bianche nella StoryMap.
- Tema scuro unificato in tutta l'interfaccia.
- Aggiornati i colori della barra superiore e della barra laterale.
- Rimosse voci duplicate nel changelog.

# Piano di Sviluppo

## Obiettivi a breve termine (Release 1.4.x)
- Implementare il supporto multilingua (i18n) per l’interfaccia.
- Aggiungere suite di test automatici (unit, integrazione, end-to-end).
- Configurare CI/CD (GitHub Actions o equivalente) per build e test.
- Migliorare le performance nel caricamento di progetti di grandi dimensioni.
- Ottimizzare l’esperienza utente su dispositivi mobili e risoluzioni ridotte.

## Obiettivi a medio termine (Release 2.0.0)
- Refactoring del frontend con un framework moderno (es. React o Vue).
- Estendere l'esportazione/importazione a formati aggiuntivi (ePub, PDF).
- Introdurre un sistema di plugin per personalizzazioni dell’editor.
- Integrare servizi di cloud storage per backup e collaborazione in tempo reale.
- Completare la documentazione API e le guide per gli sviluppatori.

## Obiettivi a lungo termine
- Rilascio di un SDK per l'integrazione con strumenti esterni.
- Creare un repository di plugin della community con meccanismi di pubblicazione.
- Supporto a modelli AI per la generazione automatica di contenuti.
- Documentazione estesa con tutorial, guide e reference API.
