# Documentazione API

Questo documento fornisce una documentazione completa per le API di GameBook Studio, incluse la comunicazione IPC, le operazioni sul database e le integrazioni esterne.

## API IPC (Comunicazione tra Processi)

### Operazioni sulla Storia

#### `story:save`
Salva il contenuto della storia nel database.
```typescript
// Gestore del Processo Principale
ipcMain.handle('story:save', async (event, storyData: StoryData) => {
  // Ritorna: Promise<boolean>
})

// Utilizzo nel Processo di Rendering
await window.electron.invoke('story:save', storyData)
```

#### `story:load`
Carica il contenuto della storia dal database.
```typescript
// Gestore del Processo Principale
ipcMain.handle('story:load', async (event, storyId: string) => {
  // Ritorna: Promise<StoryData>
})

// Utilizzo nel Processo di Rendering
await window.electron.invoke('story:load', storyId)
```

### Operazioni di Backup

#### `backup:create`
Crea un backup della storia corrente.
```typescript
// Gestore del Processo Principale
ipcMain.handle('backup:create', async (event, storyId: string) => {
  // Ritorna: Promise<BackupMetadata>
})

// Utilizzo nel Processo di Rendering
await window.electron.invoke('backup:create', storyId)
```

#### `backup:restore`
Ripristina una storia da un backup.
```typescript
// Gestore del Processo Principale
ipcMain.handle('backup:restore', async (event, backupId: string) => {
  // Ritorna: Promise<boolean>
})

// Utilizzo nel Processo di Rendering
await window.electron.invoke('backup:restore', backupId)
```

## API del Database

### Schema della Storia
```prisma
model Story {
  id        String   @id @default(uuid())
  title     String
  content   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  backups   Backup[]
}

model Backup {
  id        String   @id @default(uuid())
  storyId   String
  content   Json
  createdAt DateTime @default(now())
  story     Story    @relation(fields: [storyId], references: [id])
}
```

### Operazioni sul Database

#### Operazioni sulla Storia
```typescript
// Crea Storia
async function createStory(data: StoryCreateInput): Promise<Story>

// Aggiorna Storia
async function updateStory(id: string, data: StoryUpdateInput): Promise<Story>

// Elimina Storia
async function deleteStory(id: string): Promise<boolean>

// Ottieni Storia
async function getStory(id: string): Promise<Story | null>

// Elenca Storie
async function listStories(): Promise<Story[]>
```

#### Operazioni di Backup
```typescript
// Crea Backup
async function createBackup(storyId: string): Promise<Backup>

// Elenca Backup
async function listBackups(storyId: string): Promise<Backup[]>

// Ripristina Backup
async function restoreBackup(backupId: string): Promise<boolean>
```

## API del File System

### Esportazione della Storia
```typescript
// Esporta Storia
async function exportStory(storyId: string, format: ExportFormat): Promise<string>

// Formati di Esportazione Supportati
type ExportFormat = 'json' | 'html' | 'pdf' | 'epub'
```

### Gestione degli Asset
```typescript
// Salva Asset
async function saveAsset(data: Buffer, metadata: AssetMetadata): Promise<string>

// Ottieni Asset
async function getAsset(assetId: string): Promise<Buffer>

// Elimina Asset
async function deleteAsset(assetId: string): Promise<boolean>
```

## API di Telemetria

### Metriche di Performance
```typescript
// Registra Metrica
async function recordMetric(metric: PerformanceMetric): Promise<void>

// Ottieni Metriche
async function getMetrics(timeRange: TimeRange): Promise<PerformanceMetric[]>
```

### Tracciamento degli Errori
```typescript
// Registra Errore
async function logError(error: ErrorData): Promise<void>

// Ottieni Log degli Errori
async function getErrorLogs(timeRange: TimeRange): Promise<ErrorLog[]>
```

## Tipi di Dati

### Tipi per la Storia
```typescript
interface StoryData {
  id: string;
  title: string;
  content: {
    paragraphs: ParagraphData[];
    connections: ConnectionData[];
  };
  metadata: StoryMetadata;
}

interface ParagraphData {
  id: string;
  content: string;
  tags: string[];
  position: {
    x: number;
    y: number;
  };
}

interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
  condition?: string;
}
```

### Tipi per gli Asset
```typescript
interface AssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  size: number;
  createdAt: Date;
}

type AssetType = 'image' | 'audio' | 'video' | 'document'
```

### Tipi per la Performance
```typescript
interface PerformanceMetric {
  timestamp: Date;
  type: MetricType;
  value: number;
  metadata?: Record<string, any>;
}

type MetricType = 'memory' | 'cpu' | 'diskIO' | 'renderTime'
```

## Gestione degli Errori

Tutte le chiamate API dovrebbero implementare una corretta gestione degli errori:

```typescript
try {
  const result = await api.someOperation()
  return result
} catch (error) {
  if (error instanceof DatabaseError) {
    // Gestisci errori del database
  } else if (error instanceof ValidationError) {
    // Gestisci errori di validazione
  } else {
    // Gestisci errori inaspettati
  }
}
```

## Limitazione delle Richieste (Rate Limiting)

Alcune operazioni potrebbero essere soggette a limitazione per prevenire il sovraccarico del sistema:

- Creazione backup: Max 1 al minuto
- Upload asset: Max 10 al minuto
- Operazioni di esportazione: Max 2 al minuto

## Considerazioni sulla Sicurezza

1. Tutte le comunicazioni IPC sono validate
2. Le operazioni sul file system sono eseguite in un ambiente sandbox
3. Le query al database sono parametrizzate
4. Gli asset vengono scansionati per malware
5. L'input dell'utente viene sanificato

## Cronologia delle Versioni

| Versione | Data | Modifiche |
|---|---|---|
| 0.1.0 | Nov 2024 | Documentazione API iniziale |

## Risorse Aggiuntive

- [Guida allo Sviluppo](development.md)
- [Guida Utente](user-guide.md)
- [FAQ](faq.md)
