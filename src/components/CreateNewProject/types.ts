import { PageType, Project } from '../../types/pages';

export interface CreateNewProjectProps {
  setCurrentPage: (page: PageType) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'name' | 'created' | 'modified' | 'lastEdited'>) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}
