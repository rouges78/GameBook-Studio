const { PrismaClient } = require('@prisma/client');
const log = require('electron-log');

class DatabaseManager {
    constructor() {
        this.prisma = new PrismaClient();
        log.info('Database manager initialized');
    }

    async saveProject(project) {
        try {
            const { bookTitle, author, paragraphs, lastEdited } = project;
            
            await this.prisma.project.upsert({
                where: {
                    id: bookTitle // Using bookTitle as the ID since it's unique
                },
                update: {
                    title: bookTitle,
                    description: author,
                    updatedAt: new Date(lastEdited),
                    paragraphs: {
                        deleteMany: {},
                        create: paragraphs.map(p => ({
                            id: p.id.toString(), // Convert id to string
                            number: parseInt(p.id),
                            title: p.title || '', // Use paragraph title if available
                            content: p.content || '',
                            x: p.x,
                            y: p.y,
                            actions: JSON.stringify(p.actions || []),
                            incomingConnections: JSON.stringify(p.incomingConnections || []),
                            outgoingConnections: JSON.stringify(p.outgoingConnections || []),
                            type: p.type || 'normale'
                        }))
                    }
                },
                create: {
                    id: bookTitle,
                    title: bookTitle,
                    description: author,
                    createdAt: new Date(),
                    updatedAt: new Date(lastEdited),
                    paragraphs: {
                        create: paragraphs.map(p => ({
                            id: p.id.toString(), // Convert id to string
                            number: parseInt(p.id),
                            title: p.title || '', // Use paragraph title if available
                            content: p.content || '',
                            x: p.x,
                            y: p.y,
                            actions: JSON.stringify(p.actions || []),
                            incomingConnections: JSON.stringify(p.incomingConnections || []),
                            outgoingConnections: JSON.stringify(p.outgoingConnections || []),
                            type: p.type || 'normale'
                        }))
                    }
                }
            });
            log.info('Project saved successfully:', bookTitle);
        } catch (error) {
            log.error('Error saving project:', error);
            throw error;
        }
    }

    async getProjects() {
        try {
            const dbProjects = await this.prisma.project.findMany({
                include: {
                    paragraphs: true
                }
            });

            const projects = dbProjects.map(dbProject => ({
                bookTitle: dbProject.title,
                author: dbProject.description || '',
                lastEdited: dbProject.updatedAt.toISOString(),
                paragraphs: dbProject.paragraphs.map(p => ({
                    id: parseInt(p.id),
                    title: p.title || '',
                    content: p.content || '',
                    actions: JSON.parse(p.actions || '[]'),
                    incomingConnections: JSON.parse(p.incomingConnections || '[]'),
                    outgoingConnections: JSON.parse(p.outgoingConnections || '[]'),
                    type: p.type || 'normale',
                    x: p.x || undefined,
                    y: p.y || undefined
                })),
                mapSettings: {
                    positions: dbProject.paragraphs.reduce((acc, p) => {
                        if (p.x !== null && p.y !== null) {
                            acc[parseInt(p.id)] = { x: p.x, y: p.y };
                        }
                        return acc;
                    }, {}),
                    backgroundImage: null,
                    imageAdjustments: {
                        contrast: 100,
                        transparency: 100,
                        blackAndWhite: 0,
                        sharpness: 100,
                        brightness: 100,
                        width: 1000,
                        height: 800,
                        maintainAspectRatio: true
                    }
                }
            }));

            log.info('Projects retrieved successfully:', projects.length);
            return projects;
        } catch (error) {
            log.error('Error getting projects:', error);
            return [];
        }
    }

    async getProject(bookTitle) {
        try {
            const dbProject = await this.prisma.project.findUnique({
                where: {
                    id: bookTitle
                },
                include: {
                    paragraphs: true
                }
            });

            if (!dbProject) {
                log.info('Project not found:', bookTitle);
                return undefined;
            }

            const project = {
                bookTitle: dbProject.title,
                author: dbProject.description || '',
                lastEdited: dbProject.updatedAt.toISOString(),
                paragraphs: dbProject.paragraphs.map(p => ({
                    id: parseInt(p.id),
                    title: p.title || '',
                    content: p.content || '',
                    actions: JSON.parse(p.actions || '[]'),
                    incomingConnections: JSON.parse(p.incomingConnections || '[]'),
                    outgoingConnections: JSON.parse(p.outgoingConnections || '[]'),
                    type: p.type || 'normale',
                    x: p.x || undefined,
                    y: p.y || undefined
                })),
                mapSettings: {
                    positions: dbProject.paragraphs.reduce((acc, p) => {
                        if (p.x !== null && p.y !== null) {
                            acc[parseInt(p.id)] = { x: p.x, y: p.y };
                        }
                        return acc;
                    }, {}),
                    backgroundImage: null,
                    imageAdjustments: {
                        contrast: 100,
                        transparency: 100,
                        blackAndWhite: 0,
                        sharpness: 100,
                        brightness: 100,
                        width: 1000,
                        height: 800,
                        maintainAspectRatio: true
                    }
                }
            };

            log.info('Project retrieved successfully:', bookTitle);
            return project;
        } catch (error) {
            log.error('Error getting project:', error);
            return undefined;
        }
    }

    async deleteProject(bookTitle) {
        try {
            await this.prisma.project.delete({
                where: {
                    id: bookTitle
                }
            });
            log.info('Project deleted successfully:', bookTitle);
        } catch (error) {
            log.error('Error deleting project:', error);
            throw error;
        }
    }

    async debugDatabase() {
        try {
            const projects = await this.getProjects();
            log.info('Database status:', {
                projects: projects.length
            });
            return projects;
        } catch (error) {
            log.error('Error debugging database:', error);
            return [];
        }
    }

    async cleanup() {
        await this.prisma.$disconnect();
        log.info('Database connection closed');
    }
}

module.exports = { DatabaseManager };
