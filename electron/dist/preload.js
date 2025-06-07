const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Metodi per la comunicazione IPC diretta (eventi, ecc.)
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    // Per evitare di esporre l'oggetto 'event' completo, che può contenere riferimenti a ipcRenderer stesso,
    // passiamo solo gli argomenti successivi a 'event'.
    const subscription = (event, ...args) => func(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  once: (channel, func) => {
    const subscription = (event, ...args) => func(...args);
    ipcRenderer.once(channel, subscription);
    // Potrebbe essere utile restituire una funzione per annullare l'ascolto se necessario,
    // ma 'once' di solito non lo richiede.
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  off: (channel, func) => { // Alias per removeListener
    ipcRenderer.removeListener(channel, func);
  },

  // Funzioni specifiche esposte (spesso usando invoke per request-response)
  // Il renderer chiama window.electron['db:getProjects']()
  // Nota: le chiavi con caratteri speciali come ':' devono essere gestite come stringhe
  // se si definiscono direttamente nell'oggetto, o usare defineProperty.
  // Per semplicità, assumiamo che il processo main gestirà un canale chiamato 'db:getProjects'.
  'db:getProjects': () => ipcRenderer.invoke('db:getProjects'),
  'db:debugDatabase': (args) => ipcRenderer.invoke('db:debugDatabase', args),
  'db:saveProject': (project) => ipcRenderer.invoke('db:saveProject', project),
  'backup:create': (args) => {
    console.log("[Preload] 'backup:create' chiamata dal renderer con args:", args);
    return ipcRenderer.invoke('backup:create', args);
  },
  
  // Aggiungi qui altre API specifiche che il renderer potrebbe aspettarsi,
  // per esempio, se ci sono altre chiamate come window.electron.someOtherFunction()
  // Esempio:
  // getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Se ci sono altre proprietà/metodi che il renderer si aspetta su window.electron.db,
  // dovrebbero essere esposti qui sotto una chiave 'db'.
  // Esempio: window.electron.db.saveProject = (project) => ipcRenderer.invoke('db:saveProject', project);
  // Attualmente, il codice del renderer chiama 'window.electron.db:getProjects', che è ambiguo.
  // Ho interpretato 'db:getProjects' come una singola chiave stringa.
  // Se 'db' dovesse essere un oggetto con un metodo 'getProjects', la struttura qui dovrebbe rifletterlo.
  // Per ora, mi attengo all'interpretazione di 'db:getProjects' come singola chiave.

  // Esposizione di altre API di Electron se necessarie e sicure
  // Esempio: window.electron.log.error() (come da errore in BackupManager)
  // Questo richiederebbe che 'log' sia un oggetto con metodi come 'error'.
  log: {
    error: (message) => ipcRenderer.send('log:error', message),
    warn: (message) => ipcRenderer.send('log:warn', message),
    info: (message) => ipcRenderer.send('log:info', message),
    debug: (message) => ipcRenderer.send('log:debug', message),
  }
  // Assicurati che il processo main abbia gestori per 'log:error', 'log:warn', ecc.
});
