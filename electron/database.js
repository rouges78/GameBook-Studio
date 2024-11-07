const { PrismaClient } = require('@prisma/client');
const log = require('electron-log');

class DatabaseManager {
    constructor() {
        this.prisma = new PrismaClient();
        log.info('Database manager initialized');
    }

    async saveProject(project) {
        try {
            const { bookTitle, author, paragraphs, lastEdited, coverImage } = project;
            
            // Find existing project by title
            const existingProject = await this.prisma.project.findFirst({
                where: {
                    title: bookTitle
                },
                include: {
                    assets: true
                }
            });

            if (existingProject) {
                // Find existing cover asset
                const existingCover = existingProject.assets.find(asset => asset.name === 'cover');

                // Update existing project
                await this.prisma.project.update({
                    where: {
                        id: existingProject.id
                    },
                    data: {
                        title: bookTitle,
                        description: author,
                        updatedAt: new Date(lastEdited),
                        paragraphs: {
                            deleteMany: {},
                            create: paragraphs.map(p => ({
                                number: parseInt(p.id),
                                title: p.title || '',
                                content: p.content || '',
                                x: p.x,
                                y: p.y,
                                actions: JSON.stringify(p.actions || []),
                                incomingConnections: JSON.stringify(p.incomingConnections || []),
                                outgoingConnections: JSON.stringify(p.outgoingConnections || []),
                                type: p.type || 'normale'
                            }))
                        },
                        // Handle cover image asset
                        assets: coverImage ? {
                            ...(existingCover ? {
                                update: {
                                    where: {
                                        id: existingCover.id
                                    },
                                    data: {
                                        path: coverImage
                                    }
                                }
                            } : {
                                create: {
                                    name: 'cover',
                                    type: 'image',
                                    path: coverImage
                                }
                            })
                        } : undefined
                    }
                });
            } else {
                // Create new project
                await this.prisma.project.create({
                    data: {
                        title: bookTitle,
                        description: author,
                        createdAt: new Date(),
                        updatedAt: new Date(lastEdited),
                        paragraphs: {
                            create: paragraphs.map(p => ({
                                number: parseInt(p.id),
                                title: p.title || '',
                                content: p.content || '',
                                x: p.x,
                                y: p.y,
                                actions: JSON.stringify(p.actions || []),
                                incomingConnections: JSON.stringify(p.incomingConnections || []),
                                outgoingConnections: JSON.stringify(p.outgoingConnections || []),
                                type: p.type || 'normale'
                            }))
                        },
                        // Create cover image asset if provided
                        assets: coverImage ? {
                            create: {
                                name: 'cover',
                                type: 'image',
                                path: coverImage
                            }
                        } : undefined
                    }
                });
            }
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
                    paragraphs: true,
                    assets: true
                }
            });

            const projects = dbProjects.map(dbProject => ({
                bookTitle: dbProject.title,
                author: dbProject.description || '',
                lastEdited: dbProject.updatedAt.toISOString(),
                coverImage: dbProject.assets.find(asset => asset.name === 'cover')?.path || null,
                paragraphs: dbProject.paragraphs.map(p => ({
                    id: p.number,
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
                            acc[p.number] = { x: p.x, y: p.y };
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
            const dbProject = await this.prisma.project.findFirst({
                where: {
                    title: bookTitle
                },
                include: {
                    paragraphs: true,
                    assets: true
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
                coverImage: dbProject.assets.find(asset => asset.name === 'cover')?.path || null,
                paragraphs: dbProject.paragraphs.map(p => ({
                    id: p.number,
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
                            acc[p.number] = { x: p.x, y: p.y };
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
            const project = await this.prisma.project.findFirst({
                where: {
                    title: bookTitle
                }
            });

            if (project) {
                await this.prisma.project.delete({
                    where: {
                        id: project.id
                    }
                });
                log.info('Project deleted successfully:', bookTitle);
            } else {
                log.warn('Project not found for deletion:', bookTitle);
            }
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
