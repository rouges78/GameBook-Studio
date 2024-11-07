# API Documentation

This document provides comprehensive documentation for GameBook Studio's APIs, including IPC communication, database operations, and external integrations.

## IPC (Inter-Process Communication) API

### Story Operations

#### `story:save`
Saves story content to the database.
```typescript
// Main Process Handler
ipcMain.handle('story:save', async (event, storyData: StoryData) => {
  // Returns: Promise<boolean>
})

// Renderer Process Usage
await window.electron.invoke('story:save', storyData)
```

#### `story:load`
Loads story content from the database.
```typescript
// Main Process Handler
ipcMain.handle('story:load', async (event, storyId: string) => {
  // Returns: Promise<StoryData>
})

// Renderer Process Usage
await window.electron.invoke('story:load', storyId)
```

### Backup Operations

#### `backup:create`
Creates a backup of the current story.
```typescript
// Main Process Handler
ipcMain.handle('backup:create', async (event, storyId: string) => {
  // Returns: Promise<BackupMetadata>
})

// Renderer Process Usage
await window.electron.invoke('backup:create', storyId)
```

#### `backup:restore`
Restores a story from a backup.
```typescript
// Main Process Handler
ipcMain.handle('backup:restore', async (event, backupId: string) => {
  // Returns: Promise<boolean>
})

// Renderer Process Usage
await window.electron.invoke('backup:restore', backupId)
```

## Database API

### Story Schema
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

### Database Operations

#### Story Operations
```typescript
// Create Story
async function createStory(data: StoryCreateInput): Promise<Story>

// Update Story
async function updateStory(id: string, data: StoryUpdateInput): Promise<Story>

// Delete Story
async function deleteStory(id: string): Promise<boolean>

// Get Story
async function getStory(id: string): Promise<Story | null>

// List Stories
async function listStories(): Promise<Story[]>
```

#### Backup Operations
```typescript
// Create Backup
async function createBackup(storyId: string): Promise<Backup>

// List Backups
async function listBackups(storyId: string): Promise<Backup[]>

// Restore Backup
async function restoreBackup(backupId: string): Promise<boolean>
```

## File System API

### Story Export
```typescript
// Export Story
async function exportStory(storyId: string, format: ExportFormat): Promise<string>

// Supported Export Formats
type ExportFormat = 'json' | 'html' | 'pdf' | 'epub'
```

### Asset Management
```typescript
// Save Asset
async function saveAsset(data: Buffer, metadata: AssetMetadata): Promise<string>

// Get Asset
async function getAsset(assetId: string): Promise<Buffer>

// Delete Asset
async function deleteAsset(assetId: string): Promise<boolean>
```

## Telemetry API

### Performance Metrics
```typescript
// Record Metric
async function recordMetric(metric: PerformanceMetric): Promise<void>

// Get Metrics
async function getMetrics(timeRange: TimeRange): Promise<PerformanceMetric[]>
```

### Error Tracking
```typescript
// Log Error
async function logError(error: ErrorData): Promise<void>

// Get Error Logs
async function getErrorLogs(timeRange: TimeRange): Promise<ErrorLog[]>
```

## Data Types

### Story Types
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

### Asset Types
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

### Performance Types
```typescript
interface PerformanceMetric {
  timestamp: Date;
  type: MetricType;
  value: number;
  metadata?: Record<string, any>;
}

type MetricType = 'memory' | 'cpu' | 'diskIO' | 'renderTime'
```

## Error Handling

All API calls should implement proper error handling:

```typescript
try {
  const result = await api.someOperation()
  return result
} catch (error) {
  if (error instanceof DatabaseError) {
    // Handle database errors
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  } else {
    // Handle unexpected errors
  }
}
```

## Rate Limiting

Some operations may be rate-limited to prevent system overload:

- Backup creation: Max 1 per minute
- Asset uploads: Max 10 per minute
- Export operations: Max 2 per minute

## Security Considerations

1. All IPC communications are validated
2. File system operations are sandboxed
3. Database queries are parameterized
4. Assets are scanned for malware
5. User input is sanitized

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0   | Nov 2024 | Initial API documentation |

## Additional Resources

- [Development Guide](development.md)
- [User Guide](user-guide.md)
- [FAQ](faq.md)
