import React from 'react';
import { Database, Download } from 'lucide-react';
import { Project, Paragraph, Asset, Settings } from '@prisma/client';
import { TabProps } from './types';
import { translations } from './translations';
import { buttonClasses } from '../../utils/buttonStyles';
import { saveProject } from '../../utils/storage';

type ProjectWithRelations = Project & {
  paragraphs: Paragraph[];
  assets: Asset[];
  settings: Settings | null;
};

interface DatabaseTabProps extends TabProps {
  projects: ProjectWithRelations[];
  page: number;
  perPage: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSortField: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({
  isDarkMode,
  language,
  notification,
  setNotification,
  projects,
  page,
  perPage,
  sortField,
  sortOrder,
  searchQuery,
  setPage,
  setPerPage,
  setSortField,
  setSortOrder,
  setSearchQuery
}) => {
  const t = translations[language];

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const projects = JSON.parse(content);
          
          if (Array.isArray(projects) && projects.every(p => p.bookTitle && p.author)) {
            for (const project of projects) {
              await saveProject(project);
            }
            setNotification({
              message: t.databaseImported,
              type: 'success'
            });
          } else {
            setNotification({
              message: t.invalidFile,
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Error importing database:', error);
          setNotification({
            message: t.invalidFile,
            type: 'error'
          });
        }
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      };
      reader.readAsText(file);
    }
  };

  const handleExportProject = async (project: ProjectWithRelations) => {
    try {
      const dataStr = JSON.stringify(project, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-${project.title}-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setNotification({
        message: t.databaseExported,
        type: 'success'
      });
    } catch (error) {
      console.error('Error exporting project:', error);
      setNotification({
        message: String(error),
        type: 'error'
      });
    }
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Database size={20} className="mr-2" />
          {t.dataManagement}
        </h2>
        
        <div className={`rounded-lg overflow-hidden shadow-sm ${
          isDarkMode ? 'bg-[#1e1e1e] border border-gray-700' : 'bg-[#f5f5f5] border border-gray-200'
        }`}>
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className={`w-full p-2 rounded font-mono text-sm ${
                isDarkMode ? 'bg-[#2d2d2d] text-gray-200' : 'bg-white text-gray-800'
              }`}
            />
          </div>

          {/* Database Info */}
          <div className={`p-2 border-b border-gray-700 font-mono text-xs ${
            isDarkMode ? 'bg-[#252525]' : 'bg-[#f0f0f0]'
          }`}>
            <div className="flex items-center gap-4">
              <span>Database: <span className="text-blue-400">gamebook_studio</span></span>
              <span>Table: <span className="text-green-400">projects</span></span>
              <span>Total rows: <span className="text-yellow-400">{projects.length}</span></span>
              <span>Last updated: <span className="text-purple-400">{new Date().toLocaleString()}</span></span>
            </div>
          </div>

          {/* SQL Query */}
          <div className={`p-2 border-b border-gray-700 font-mono text-xs ${
            isDarkMode ? 'bg-[#1e1e1e]' : 'bg-[#f5f5f5]'
          }`}>
            <div className="text-gray-500">-- Generated SQL query</div>
            <div>
              <span className="text-blue-400">SELECT</span> p.*,
            </div>
            <div className="pl-4">
              <span className="text-yellow-400">COUNT</span>(pr.id) <span className="text-blue-400">as</span> paragraph_count,
            </div>
            <div className="pl-4">
              <span className="text-yellow-400">COUNT</span>(a.id) <span className="text-blue-400">as</span> asset_count,
            </div>
            <div className="pl-4">
              s.theme, s.fontSize, s.autoSave
            </div>
            <div>
              <span className="text-blue-400">FROM</span> projects p
            </div>
            <div>
              <span className="text-blue-400">LEFT JOIN</span> paragraphs pr <span className="text-blue-400">ON</span> pr.projectId = p.id
            </div>
            <div>
              <span className="text-blue-400">LEFT JOIN</span> assets a <span className="text-blue-400">ON</span> a.projectId = p.id
            </div>
            <div>
              <span className="text-blue-400">LEFT JOIN</span> settings s <span className="text-blue-400">ON</span> s.projectId = p.id
            </div>
            <div>
              <span className="text-blue-400">WHERE</span> {searchQuery ? 
                <span>(p.title <span className="text-blue-400">LIKE</span> <span className="text-green-400">'%{searchQuery}%'</span> <span className="text-blue-400">OR</span> p.description <span className="text-blue-400">LIKE</span> <span className="text-green-400">'%{searchQuery}%'</span>)</span> : 
                <span>1=1</span>
              }
            </div>
            <div>
              <span className="text-blue-400">GROUP BY</span> p.id
            </div>
            <div>
              <span className="text-blue-400">ORDER BY</span> {sortField} {sortOrder.toUpperCase()}
            </div>
            <div>
              <span className="text-blue-400">LIMIT</span> {perPage}
            </div>
            <div>
              <span className="text-blue-400">OFFSET</span> {(page - 1) * perPage};
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`text-left font-mono text-xs ${
                  isDarkMode ? 'bg-[#2d2d2d]' : 'bg-[#e5e5e5]'
                }`}>
                  <th className="p-2 border-b border-r border-gray-700">ID</th>
                  <th className="p-2 border-b border-r border-gray-700">Title</th>
                  <th className="p-2 border-b border-r border-gray-700">Description</th>
                  <th className="p-2 border-b border-r border-gray-700">Created At</th>
                  <th className="p-2 border-b border-r border-gray-700">Updated At</th>
                  <th className="p-2 border-b border-r border-gray-700">Language</th>
                  <th className="p-2 border-b border-r border-gray-700">Archived</th>
                  <th className="p-2 border-b border-r border-gray-700">Last Sync</th>
                  <th className="p-2 border-b border-r border-gray-700">Paragraphs</th>
                  <th className="p-2 border-b border-r border-gray-700">Assets</th>
                  <th className="p-2 border-b border-r border-gray-700">Settings</th>
                  <th className="p-2 border-b border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {projects.map((project) => (
                  <tr key={project.id} className={`
                    font-mono text-xs
                    ${isDarkMode ? 'hover:bg-[#2d2d2d]' : 'hover:bg-[#f0f0f0]'}
                  `}>
                    <td className="p-2 border-b border-r border-gray-700">{project.id}</td>
                    <td className="p-2 border-b border-r border-gray-700">{project.title}</td>
                    <td className="p-2 border-b border-r border-gray-700">{project.description || 'NULL'}</td>
                    <td className="p-2 border-b border-r border-gray-700">{new Date(project.createdAt).toLocaleString()}</td>
                    <td className="p-2 border-b border-r border-gray-700">{new Date(project.updatedAt).toLocaleString()}</td>
                    <td className="p-2 border-b border-r border-gray-700">{project.language || 'NULL'}</td>
                    <td className="p-2 border-b border-r border-gray-700">{project.isArchived ? 'true' : 'false'}</td>
                    <td className="p-2 border-b border-r border-gray-700">{project.lastSync ? new Date(project.lastSync).toLocaleString() : 'NULL'}</td>
                    <td className="p-2 border-b border-r border-gray-700 max-w-[200px] truncate hover:text-clip hover:overflow-visible" 
                        title={JSON.stringify(project.paragraphs || [], null, 2)}>
                      {`[${(project.paragraphs || []).length} rows]`}
                    </td>
                    <td className="p-2 border-b border-r border-gray-700 max-w-[200px] truncate hover:text-clip hover:overflow-visible"
                        title={JSON.stringify(project.assets || [], null, 2)}>
                      {`[${(project.assets || []).length} rows]`}
                    </td>
                    <td className="p-2 border-b border-r border-gray-700 max-w-[200px] truncate hover:text-clip hover:overflow-visible"
                        title={JSON.stringify(project.settings || {}, null, 2)}>
                      {project.settings ? 
                        `{theme: "${project.settings.theme}", fontSize: ${project.settings.fontSize}}` 
                        : 'NULL'}
                    </td>
                    <td className="p-2 border-b border-gray-700">
                      <button
                        onClick={() => handleExportProject(project)}
                        className={`p-1 rounded ${
                          isDarkMode ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-600/10'
                        }`}
                        title="Export"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`p-2 border-t border-gray-700 flex items-center justify-between ${
            isDarkMode ? 'bg-[#252525]' : 'bg-[#f0f0f0]'
          }`}>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span>Rows per page:</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className={`p-1 rounded ${
                  isDarkMode ? 'bg-[#2d2d2d] text-gray-200' : 'bg-white text-gray-800'
                }`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`p-1 rounded ${
                  isDarkMode ? 'text-gray-400 hover:bg-[#2d2d2d]' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={projects.length < perPage}
                className={`p-1 rounded ${
                  isDarkMode ? 'text-gray-400 hover:bg-[#2d2d2d]' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};