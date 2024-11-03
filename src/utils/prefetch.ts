// Nuovo file: utils/prefetch.ts
export const prefetchProjectData = async (projectId: string) => {
  try {
    const cachedData = getCachedProject(projectId);
    if (cachedData) return cachedData;

    const response = await fetch(`/api/projects/${projectId}`);
    const data = await response.json();
    
    cacheProject(projectId, data);
    return data;
  } catch (error) {
    console.error('Error prefetching project data:', error);
    return null;
  }
};

// Implementazione nel Dashboard
const handleProjectHover = useCallback(async (projectId: string) => {
  await prefetchProjectData(projectId);
}, []);