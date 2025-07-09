# Guida allo Sviluppo

Questa guida fornisce informazioni dettagliate per gli sviluppatori che vogliono contribuire a GameBook Studio.

## Configurazione dell'Ambiente di Sviluppo

### Strumenti Richiesti
- Visual Studio Code (raccomandato)
- Node.js v16+
- npm o yarn
- Git

### Configurazione Iniziale
1. **Clonare il Repository**
```bash
git clone https://github.com/rouges78/GameBook-Studio.git
cd GameBook-Studio
```

2. **Installare le Dipendenze**
```bash
npm install
```

3. **Configurare il Database**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Avviare il Server di Sviluppo**
```bash
npm run dev
```

## Architettura del Progetto

### Componenti Principali

#### Processo Principale di Electron (`electron/`)
- `main.js` - Punto di ingresso principale
- `preload.js` - Script di precaricamento
- `database.js` - Operazioni sul database
- `backup.js` - Funzionalità di backup

#### Frontend React (`src/`)
- `components/` - Componenti React
- `contexts/` - Contesti React
- `hooks/` - Hook personalizzati di React
- `utils/` - Funzioni di utilità

### Implementazione delle Funzionalità Chiave

#### Editor di Paragrafi
L'editor di paragrafi è costruito usando:
- React per i componenti UI
- Hook personalizzati per la gestione dello stato
- Sistema di eventi per aggiornamenti in tempo reale

#### Mappa della Storia
La funzionalità della mappa della storia usa:
- API Canvas per il rendering
- Sistema di trascinamento (drag-and-drop) personalizzato
- Algoritmi di ricerca del percorso per le connessioni

#### Sistema di Backup
Implementa:
- Backup periodici automatici
- Controllo di versione
- Meccanismi di ripristino

## Test

### Esecuzione dei Test
```bash
# Esegui tutti i test
npm test

# Esegui un file di test specifico
npm test -- tests/StoryMap.test.tsx

# Esegui con la copertura del codice
npm test -- --coverage
```

### Struttura dei Test
- Test unitari per i componenti
- Test di integrazione per le funzionalità
- Test di performance
- Test end-to-end

## Build

### Build di Sviluppo
```bash
npm run build:dev
```

### Build di Produzione
```bash
npm run build
```

### Build Specifiche per Piattaforma
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Guida allo Stile del Codice

### TypeScript
- Usa TypeScript per tutto il nuovo codice
- Mantieni un controllo stretto dei tipi
- Documenta i tipi complessi

### Componenti React
- Usa componenti funzionali
- Implementa Error Boundary appropriati
- Segui le best practice degli hook di React

### Test
- Scrivi test per le nuove funzionalità
- Mantieni un'alta copertura dei test
- Usa descrizioni significative per i test

## Ottimizzazione delle Performance

### Aree Chiave
- Rendering della mappa della storia
- Gestione di documenti di grandi dimensioni
- Gestione degli asset
- Utilizzo della memoria

### Monitoraggio
- Usa la telemetria integrata
- Monitora le metriche di performance
- Tieni traccia dei tassi di errore

## Gestione del Database

### Configurazione di Prisma
- Definizioni dello schema
- Gestione delle migrazioni
- Ottimizzazione delle query

### Modelli di Dati
- Struttura della storia
- Preferenze dell'utente
- Metadati dei backup
- Dati di telemetria

## Gestione degli Errori

### Linee Guida
- Usa Error Boundary appropriati
- Implementa il logging
- Fornisci feedback all'utente
- Gestisci il ripristino

## Sicurezza

### Best Practice
- Validazione dell'input
- Gestione sicura dei file
- Crittografia dei dati
- Comunicazione IPC sicura

## Contribuire

### Processo
1. Fai un fork del repository
2. Crea un branch per la nuova funzionalità
3. Implementa le modifiche
4. Scrivi i test
5. Invia una pull request

### Linee Guida per le Pull Request
- Descrizione chiara
- Copertura dei test
- Aggiornamenti della documentazione
- Cronologia dei commit pulita

## Debugging

### Strumenti
- Chrome DevTools
- Debugger di VS Code
- Debugger di Electron

### Problemi Comuni
- Connessione al database
- Comunicazione IPC
- Perdite di memoria (memory leak)
- Colli di bottiglia nelle performance

## Processo di Rilascio

### Passaggi
1. Aumenta il numero di versione
2. Aggiorna il changelog
3. Esegui i test
4. Crea la build di rilascio
5. Crea le note di rilascio
6. Esegui il deploy

### Controllo di Versione
- Segui il versionamento semantico
- Taggare i rilasci
- Aggiornare la documentazione

## Risorse Aggiuntive

### Documentazione
- [Riferimento API](api.md)
- [Guida Utente](user-guide.md)
- [FAQ](faq.md)

### Strumenti
- Estensioni di VS Code
- Utilità di sviluppo
- Strumenti di test

## Supporto

### Ottenere Aiuto
- Issue su GitHub
- Documentazione
- Canali della community

Questa guida viene aggiornata continuamente con l'evolversi del progetto.
