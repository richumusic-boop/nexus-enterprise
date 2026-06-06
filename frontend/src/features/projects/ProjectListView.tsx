import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { Button, Input } from '../../components/UI';
import { FolderPlus, Trash2, ArrowRight } from 'lucide-react';

export const ProjectListView = () => {
  const { projects, fetchProjects, createProject, deleteProject, isLoading } = useProjectStore();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(newName, newDesc);
      setNewName('');
      setNewDesc('');
      setIsCreating(false);
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Your Projects</h1>
          <p className="text-slate-400">Manage and orchestrate your enterprise initiatives</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <FolderPlus size={18} />
          New Project
        </Button>
      </div>

      {isCreating && (
        <div className="premium-card p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-semibold mb-4">Initialize New Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input 
              label="Project Name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              required 
            />
            <Input 
              label="Description (Optional)" 
              value={newDesc} 
              onChange={(e) => setNewDesc(e.target.value)} 
            />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Loading your workspace...</div>
      ) : projects.length === 0 ? (
        <div className="premium-card py-20 text-center border-dashed border-2">
          <p className="text-slate-500 mb-6">No projects found. Start by creating your first project.</p>
          <Button onClick={() => setIsCreating(true)} variant="outline">Initialize Namespace</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="premium-card p-6 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
                  {project.name}
                </h3>
                <button 
                  onClick={() => deleteProject(project.id)}
                  className="text-slate-600 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-8 flex-grow line-clamp-3">
                {project.description || 'No description provided for this initiative.'}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="text-indigo-400 p-0 flex items-center gap-1 text-sm hover:translate-x-1 transition-transform"
                >
                  View Tasks <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
