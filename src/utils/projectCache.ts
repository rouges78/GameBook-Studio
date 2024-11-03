// Nuovo file: utils/projectCache.ts
const projectCache = new Map<string, any>();

export const cacheProject = (key: string, data: any) => {
  projectCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const getCachedProject = (key: string) => {
  const cached = projectCache.get(key);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 5) { // 5 minuti
    return cached.data;
  }
  return null;
};