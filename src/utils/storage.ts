import { Project, ImageData } from '../components/ParagraphEditor/types';

// In-memory storage for development
const memoryStore = new Map<string, Project>();
const imageStore = new Map<string, string>();

export async function saveProject(project: Project): Promise<void> {
  try {
    if (project.coverImage) {
      const compressedImage = compressBase64Image(project.coverImage);
      imageStore.set(project.bookTitle, compressedImage);
      
      const projectWithoutCover = {
        ...project,
        coverImage: undefined
      };
      memoryStore.set(project.bookTitle, projectWithoutCover);
    } else {
      memoryStore.set(project.bookTitle, project);
    }
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = Array.from(memoryStore.values());
    return projects.map(project => ({
      ...project,
      coverImage: decompressBase64Image(imageStore.get(project.bookTitle))
    }));
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

export async function deleteProject(bookTitle: string): Promise<void> {
  try {
    memoryStore.delete(bookTitle);
    imageStore.delete(bookTitle);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

export async function getProject(bookTitle: string): Promise<Project | undefined> {
  try {
    const project = memoryStore.get(bookTitle);
    if (!project) return undefined;

    return {
      ...project,
      coverImage: decompressBase64Image(imageStore.get(bookTitle))
    };
  } catch (error) {
    console.error('Error getting project:', error);
    return undefined;
  }
}

export async function debugDatabase(): Promise<Project[]> {
  try {
    console.log('Database status:', {
      projects: memoryStore.size,
      images: imageStore.size
    });
    return Array.from(memoryStore.values());
  } catch (error) {
    console.error('Error debugging database:', error);
    return [];
  }
}

function needsMigration(project: Project): boolean {
  return !project.mapSettings && (
    project.paragraphs.some((p) => p.x !== undefined || p.y !== undefined)
  );
}

export async function migrateProjectData(): Promise<void> {
  try {
    const projects = Array.from(memoryStore.values());
    
    for (const project of projects) {
      if (needsMigration(project)) {
        const positions = project.paragraphs
          .filter(p => p.x !== undefined && p.y !== undefined)
          .reduce((acc: { [key: string]: { x: number; y: number } }, p) => {
            if (p.x !== undefined && p.y !== undefined) {
              acc[p.id] = { x: p.x, y: p.y };
            }
            return acc;
          }, {});
        
        if (Object.keys(positions).length > 0) {
          const updatedProject = {
            ...project,
            mapSettings: {
              positions,
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
          
          memoryStore.set(project.bookTitle, updatedProject);
        }
      }
    }
  } catch (error) {
    console.error('Error migrating data:', error);
  }
}

function compressBase64Image(base64: string): string {
  const base64Data = base64.split(',')[1] || base64;
  return base64Data;
}

function decompressBase64Image(compressedBase64: string | undefined): string | undefined {
  if (!compressedBase64) return undefined;
  if (!compressedBase64.startsWith('data:')) {
    return `data:image/jpeg;base64,${compressedBase64}`;
  }
  return compressedBase64;
}

// Clean up function (not needed for memory storage)
export function cleanup() {
  memoryStore.clear();
  imageStore.clear();
}
