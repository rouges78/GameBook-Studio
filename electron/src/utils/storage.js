"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveProject = saveProject;
exports.getProjects = getProjects;
exports.deleteProject = deleteProject;
exports.getProject = getProject;
exports.debugDatabase = debugDatabase;
exports.migrateProjectData = migrateProjectData;
async function saveProject(project) {
    try {
        await window.electron['db:saveProject'](project);
    }
    catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
}
async function getProjects() {
    try {
        return await window.electron['db:getProjects']();
    }
    catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}
async function deleteProject(bookTitle) {
    try {
        await window.electron['db:deleteProject'](bookTitle);
    }
    catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}
async function getProject(bookTitle) {
    try {
        return await window.electron['db:getProject'](bookTitle);
    }
    catch (error) {
        console.error('Error getting project:', error);
        return undefined;
    }
}
async function debugDatabase() {
    try {
        const projects = await window.electron['db:debugDatabase']();
        console.log('Database status:', {
            projects: projects.length
        });
        return projects;
    }
    catch (error) {
        console.error('Error debugging database:', error);
        return [];
    }
}
async function migrateProjectData() {
    // Migration is handled by Prisma migrations
    console.log('Migration is handled by Prisma migrations');
}
