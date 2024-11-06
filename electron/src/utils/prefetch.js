"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefetchProjectData = void 0;
// Nuovo file: utils/prefetch.ts
const prefetchProjectData = async (projectId) => {
    try {
        const cachedData = getCachedProject(projectId);
        if (cachedData)
            return cachedData;
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        cacheProject(projectId, data);
        return data;
    }
    catch (error) {
        console.error('Error prefetching project data:', error);
        return null;
    }
};
exports.prefetchProjectData = prefetchProjectData;
// Implementazione nel Dashboard
const handleProjectHover = useCallback(async (projectId) => {
    await (0, exports.prefetchProjectData)(projectId);
}, []);
