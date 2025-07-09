# GameBook Studio

GameBook Studio è un'applicazione desktop avanzata progettata per creare e gestire librogame interattivi e contenuti narrativi. Costruita con Electron e React, fornisce una solida piattaforma per scrittori e game designer per creare narrazioni ramificate con ricchi elementi multimediali.

## 🎮 Funzionalità

### Funzionalità Completate
- **Editor di Paragrafi**
  - Funzionalità di editing rich text
  - Sistema di tag per organizzare i contenuti

- **Sistema di Backup**
  - Funzionalità di backup automatico
  - Gestione della cronologia dei backup
  - Opzioni di ripristino per il lavoro perso
  - **Salvataggio dei Backup su File**: I backup vengono ora salvati automaticamente come file JSON nella directory `userData` dell'applicazione (specificamente in una sottocartella `backups`, ad esempio, `C:\Users\[TuoUtente]\Documents\GameBookStudioCache\backups\` su Windows). Ogni file di backup ha un timestamp per una facile identificazione.

- **Opzioni di Esportazione**
  - Supporto per molteplici formati di esportazione
  - Modelli di esportazione personalizzabili
  - Anteprima prima dell'esportazione

### Funzionalità Pianificate
*(Nota: Questa lista necessita di una revisione per riflettere lo stato attuale del progetto)*
- [ ] Rappresentazione visuale delle ramificazioni della storia
- [ ] Interfaccia mappa con drag-and-drop
- [ ] Gestione delle connessioni tra i nodi della storia
- [ ] Mini-mappa per una navigazione facile
- [ ] Sincronizzazione con il cloud
- [ ] Editing collaborativo
- [ ] Controllo di versione per le ramificazioni della storia
- [ ] Gestione avanzata degli asset
- [X] Creatore di temi personalizzati
- [ ] Modalità anteprima per dispositivi mobili
- [ ] Simulatore di test per la storia
- [ ] Dashboard di analisi
- [ ] Importazione da vari formati
- [ ] Sistema di plugin


## 🚀 Installazione

### Prerequisiti
- Node.js (v16 o superiore)
- npm o yarn
- Git

### Setup per lo Sviluppo
1. Clona il repository:
```bash
git clone https://github.com/rouges78/GameBook-Studio.git
cd GameBook-Studio
```

2. Installa le dipendenze:
```bash
npm install
# o
yarn install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
# o
yarn dev
```

### Build per la Produzione
```bash
npm run build
# o
yarn build
```

L'applicazione compilata sarà disponibile nella directory `dist`.

## 📖 Utilizzo
(I dettagli su come usare GameBook Studio verranno aggiunti qui. Screenshot e GIF sono benvenuti!)

## 🛠 Stack Tecnologico
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Electron, Node.js
- **Database**: SQLite (tramite Prisma)
- **Test**: Jest, React Testing Library
- **Strumenti di Build**: Vite, Electron Forge

## 📦 Struttura del Progetto
```
GameBook-Studio/
├── electron/          # File del processo principale di Electron
├── src/               # Sorgenti dell'applicazione React
│   ├── components/    # Componenti React
│   ├── contexts/      # Contesti React
│   ├── hooks/         # Hook personalizzati di React
│   └── utils/         # Funzioni di utilità
├── prisma/            # Schema del database e migrazioni
└── tests/             # File di test
```

## 🤝 Contribuire
I contributi sono benvenuti! Si prega di leggere le nostre linee guida per i contributi prima di inviare pull request.

### Linee Guida per lo Sviluppo
1. Fai un fork del repository
2. Crea un branch per la nuova funzionalità
3. Esegui il commit delle tue modifiche
4. Fai il push al branch
5. Crea una Pull Request

## 📝 Documentazione
- [Guida Utente](docs/user-guide.md)
- [Guida allo Sviluppo](docs/development.md)
- [Documentazione API](docs/api.md)

## 🔄 Aggiornamenti e Versioning
Il progetto segue il Semantic Versioning (SemVer). Per le ultime modifiche, consulta il [CHANGELOG](CHANGELOG.md).

## 📄 Licenza
Questo progetto è sotto licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## 🔧 Risoluzione dei Problemi
Per problemi comuni e soluzioni, controlla le nostre [FAQ](docs/faq.md) o apri una issue su GitHub.

## 📊 Stato del Progetto
- **Versione Corrente**: 0.9.13
- **Fase di Sviluppo**: Beta
- **Ultimo Aggiornamento**: Giugno 2025

## 🎯 Roadmap
*(Nota: Questa roadmap necessita di una revisione per riflettere lo stato attuale del progetto)*
### Fase 1 (Attuale)
- [x] Funzionalità base dell'editor
- [ ] Mappatura della storia
- [x] Sistema di backup
- [ ] Gestione degli asset

### Fase 2 (Prossima)
- [ ] Integrazione con il cloud
- [ ] Funzionalità collaborative
- [ ] Opzioni di esportazione avanzate
- [ ] Compatibilità con dispositivi mobili

### Fase 3 (Futura)
- [ ] Sistema di plugin
- [ ] Marketplace dei temi
- [ ] Strumenti di analisi
- [ ] Funzionalità di assistenza AI

## 💡 Supporto
Per supporto, si prega di:
1. Controllare la documentazione
2. Cercare tra le issue esistenti
3. Creare una nuova issue se necessario

## 🌟 Ringraziamenti
Grazie a tutti i contributori che hanno aiutato a dare forma a GameBook Studio!
