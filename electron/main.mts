import { app, BrowserWindow, ipcMain } from 'electron';
import type { Project } from './types/pages.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Configure cache paths
app.setPath('userData', path.join(app.getPath('documents'), 'GameBookStudioCache'));
app.setPath('sessionData', path.join(app.getPath('documents'), 'GameBookStudioSessionData'));

// Config
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Electron app setup

// Semplice database in memoria per i progetti
let projectsDB: Project[] = [];

// Questo gestore IPC risponderà alla chiamata 'db:getProjects' dal renderer
ipcMain.handle('db:getProjects', async (event) => {
  console.log("IPC 'db:getProjects' chiamato nel processo main.");
  if (projectsDB.length === 0) {
    // Popola con un progetto fittizio se il DB è vuoto, per test
    console.log('Database progetti in memoria vuoto, aggiungo un progetto fittizio.');
    const now = new Date().toISOString();
    projectsDB.push({
      id: 'test-project-1',
      name: 'Progetto di Test Iniziale',
      bookTitle: 'Libro di Test Iniziale',
      author: 'Autore Test',
      description: 'Un semplice progetto per testare il backup.',
      created: now,
      modified: now,
      lastEdited: now,
      paragraphs: [{ id: 'p1', title: 'Paragrafo 1', content: 'Contenuto...' }],
      mapSettings: {}
    });
  }
  console.log('Restituisco progetti dal DB in memoria:', JSON.stringify(projectsDB, null, 2));
  return projectsDB;
});

// Gestore per il debug del database
ipcMain.handle('db:debugDatabase', async (event, args) => {
  console.log("IPC 'db:debugDatabase' chiamato nel processo main con args:", args);
  // TODO: Implementa la logica effettiva per il debug del database se necessario
  // Per ora, restituiamo un messaggio di successo
  return { success: true, message: "Debug database command received." };
});

// Gestore per la creazione del backup
ipcMain.handle('backup:create', async (event, projectsToBackup: Project[]) => {
  console.log("IPC 'backup:create' chiamato nel processo main con args:", projectsToBackup);
  if (!projectsToBackup || projectsToBackup.length === 0) {
    console.warn('backup:create chiamato senza progetti da backuppare.');
    return { success: false, message: 'Nessun progetto fornito per il backup.' };
  }

  try {
    const backupsDir = path.join(app.getPath('userData'), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      console.log('Cartella backups creata:', backupsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filePath = path.join(backupsDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(projectsToBackup, null, 2));
    console.log('Backup creato con successo:', filePath);
    return { success: true, message: 'Backup creato con successo.', filePath: filePath };
  } catch (error) {
    console.error('Errore durante la creazione del backup:', error);
    return { success: false, message: 'Errore durante la creazione del backup.', error: String(error) };
  }
});

// Gestore per salvare un progetto
ipcMain.handle('db:saveProject', async (event, project: Project) => {
  console.log("IPC 'db:saveProject' chiamato nel processo main con il progetto:", JSON.stringify(project, null, 2));
  if (!project || !project.id) {
    console.error('Tentativo di salvare un progetto non valido o senza ID.');
    return { success: false, error: 'Progetto non valido o senza ID' };
  }
  const projectIndex = projectsDB.findIndex(p => p.id === project.id);
  if (projectIndex !== -1) {
    console.log(`Aggiorno progetto esistente con ID: ${project.id}`);
    projectsDB[projectIndex] = project;
  } else {
    console.log(`Aggiungo nuovo progetto con ID: ${project.id}`);
    projectsDB.push(project);
  }
  console.log('Stato DB progetti dopo salvataggio:', JSON.stringify(projectsDB, null, 2));
  return { success: true, projectId: project.id };
});

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  // Add CSP header for development
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"]
      }
    });
  });

  if (process.env.NODE_ENV === 'development') {
    const port = process.env.VITE_PORT || 5173;
    await win.loadURL(`http://localhost:${port}`);
    win.webContents.openDevTools();
  } else {
    await win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});