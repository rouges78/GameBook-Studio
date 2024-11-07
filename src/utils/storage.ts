import { Project } from '../components/ParagraphEditor/types';

const isElectron = !!window.electron;

export async function saveProject(project: Project): Promise<void> {
  try {
    if (!isElectron) {
      console.warn('Running in browser context, database operations are not available');
      return;
    }
    await window.electron['db:saveProject'](project);
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    if (!isElectron) {
      console.warn('Running in browser context, database operations are not available');
      return [];
    }
    return await window.electron['db:getProjects']();
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

export async function deleteProject(bookTitle: string): Promise<void> {
  try {
    if (!isElectron) {
      console.warn('Running in browser context, database operations are not available');
      return;
    }
    await window.electron['db:deleteProject'](bookTitle);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

export async function getProject(bookTitle: string): Promise<Project | undefined> {
  try {
    if (!isElectron) {
      console.warn('Running in browser context, database operations are not available');
      return undefined;
    }
    return await window.electron['db:getProject'](bookTitle);
  } catch (error) {
    console.error('Error getting project:', error);
    return undefined;
  }
}

export async function debugDatabase(): Promise<Project[]> {
  try {
    if (!isElectron) {
      console.warn('Running in browser context, database operations are not available');
      return [];
    }
    const projects = await window.electron['db:debugDatabase']();
    console.log('Database status:', {
      projects: projects.length
    });
    return projects;
  } catch (error) {
    console.error('Error debugging database:', error);
    return [];
  }
}

export async function migrateProjectData(): Promise<void> {
  // Migration is handled by Prisma migrations
  console.log('Migration is handled by Prisma migrations');
}
