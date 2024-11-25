// Nuovo file: utils/projectCache.ts
import { openDB, IDBPDatabase } from 'idb';
import { Project } from '../types/pages';

interface CachedProject {
  data: Project;
  timestamp: number;
  accessCount: number;
}

interface StoredProject {
  id: string;
  data: Project;
  timestamp: number;
  accessCount: number;
}

const CACHE_DB_NAME = 'project-cache';
const CACHE_STORE_NAME = 'projects';
const MAX_CACHE_SIZE = 50; // Numero massimo di progetti in cache
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 ore
const PREFETCH_THRESHOLD = 0.8; // Soglia per il prefetching (80% di probabilità di accesso)

class ProjectCache {
  private memoryCache: Map<string, CachedProject>;
  private db: IDBPDatabase | null;
  private initPromise: Promise<void>;

  constructor() {
    this.memoryCache = new Map();
    this.db = null;
    this.initPromise = this.initDB();
  }

  private async initDB() {
    try {
      this.db = await openDB(CACHE_DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
            db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' });
          }
        },
      });
      await this.loadCacheFromDB();
    } catch (error) {
      console.error('Error initializing project cache database:', error);
    }
  }

  private async loadCacheFromDB() {
    if (!this.db) return;

    try {
      const storedProjects = await this.db.getAll(CACHE_STORE_NAME);
      storedProjects.forEach((stored: StoredProject) => {
        if (stored && stored.id && typeof stored.id === 'string') {
          this.memoryCache.set(stored.id, {
            data: stored.data,
            timestamp: stored.timestamp,
            accessCount: stored.accessCount || 0
          });
        }
      });
    } catch (error) {
      console.error('Error loading cache from database:', error);
    }
  }

  private async saveToDB(id: string, cached: CachedProject) {
    if (!this.db || !id || typeof id !== 'string') {
      console.error('Invalid id for cache:', id);
      return;
    }

    try {
      // Assicuriamoci che l'id sia una stringa valida
      const safeId = String(id).trim();
      if (!safeId) {
        console.error('Empty id after sanitization');
        return;
      }

      const storedProject: StoredProject = {
        id: safeId,
        data: cached.data,
        timestamp: cached.timestamp,
        accessCount: cached.accessCount
      };

      await this.db.put(CACHE_STORE_NAME, storedProject);
    } catch (error) {
      console.error('Error saving to cache database:', error);
      // Log additional debug info
      console.debug('Failed to save project:', {
        id,
        hasData: !!cached?.data,
        timestamp: cached?.timestamp,
        accessCount: cached?.accessCount
      });
    }
  }

  private cleanCache() {
    if (this.memoryCache.size > MAX_CACHE_SIZE) {
      // Ordina per conteggio accessi e timestamp
      const entries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => {
          const scoreA = a.accessCount * 0.7 + (Date.now() - a.timestamp) * 0.3;
          const scoreB = b.accessCount * 0.7 + (Date.now() - b.timestamp) * 0.3;
          return scoreA - scoreB;
        });

      // Rimuovi il 20% meno utilizzato
      const removeCount = Math.floor(MAX_CACHE_SIZE * 0.2);
      entries.slice(0, removeCount).forEach(([key]) => {
        this.memoryCache.delete(key);
        if (this.db) {
          this.db.delete(CACHE_STORE_NAME, key).catch(console.error);
        }
      });
    }
  }

  async cacheProject(id: string, data: Project) {
    await this.initPromise;

    if (!id || typeof id !== 'string' || !data) {
      console.error('Invalid project data for caching:', { id, hasData: !!data });
      return;
    }

    const cached: CachedProject = {
      data,
      timestamp: Date.now(),
      accessCount: 0
    };

    this.memoryCache.set(id, cached);
    await this.saveToDB(id, cached);
    this.cleanCache();
  }

  async getCachedProject(id: string): Promise<Project | null> {
    await this.initPromise;

    if (!id || typeof id !== 'string') {
      console.error('Invalid id for cache lookup:', id);
      return null;
    }

    const cached = this.memoryCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      await this.saveToDB(id, cached);
      return cached.data;
    }

    if (cached) {
      this.memoryCache.delete(id);
      if (this.db) {
        await this.db.delete(CACHE_STORE_NAME, id);
      }
    }

    return null;
  }

  async prefetchProjects(currentProjectId: string) {
    if (!currentProjectId || typeof currentProjectId !== 'string') {
      console.error('Invalid project id for prefetch:', currentProjectId);
      return;
    }

    const currentProject = this.memoryCache.get(currentProjectId);
    if (!currentProject) return;

    // Calcola la probabilità di accesso per ogni progetto correlato
    const relatedProjects = Array.from(this.memoryCache.entries())
      .filter(([id]) => id !== currentProjectId)
      .map(([id, project]) => ({
        id,
        probability: this.calculateAccessProbability(project, currentProject)
      }))
      .filter(({ probability }) => probability > PREFETCH_THRESHOLD);

    // Prefetch dei progetti con alta probabilità di accesso
    for (const { id } of relatedProjects) {
      if (!this.memoryCache.has(id)) {
        try {
          const project = await window.electron['db:getProject'](id);
          if (project) {
            await this.cacheProject(id, project);
          }
        } catch (error) {
          console.error('Error prefetching project:', error);
        }
      }
    }
  }

  private calculateAccessProbability(project: CachedProject, currentProject: CachedProject): number {
    const timeWeight = 0.4;
    const accessWeight = 0.6;

    const timeDiff = Math.abs(project.timestamp - currentProject.timestamp);
    const timeScore = Math.exp(-timeDiff / (1000 * 60 * 60)); // Decadimento esponenziale

    const accessScore = project.accessCount / (Math.max(...Array.from(this.memoryCache.values())
      .map(p => p.accessCount)) || 1);

    return timeWeight * timeScore + accessWeight * accessScore;
  }

  async clearCache() {
    this.memoryCache.clear();
    if (this.db) {
      await this.db.clear(CACHE_STORE_NAME);
    }
  }
}

export const projectCache = new ProjectCache();