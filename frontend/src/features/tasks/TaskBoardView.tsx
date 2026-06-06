import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { Button, Input } from '../../components/UI';
import { Plus, ChevronLeft, MoreVertical, Clock } from 'lucide-react';

export const TaskBoardView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { tasks, fetchTasks, createTask, updateTask, isLoading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null); // status column
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
      if (projects.length === 0) fetchProjects();
    }
  }, [projectId, fetchTasks, fetchProjects, projects.length]);

  const handleCreateTask = async (status: string) => {
    if (!newTaskTitle.trim() || !projectId) return;
    await createTask({
      title: newTaskTitle,
      project_id: projectId,
      status: status as any
    });
    setNewTaskTitle('');
    setIsAddingTask(null);
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-indigo-500' },
    { id: 'DONE', title: 'Completed', color: 'bg-emerald-500' }
  ];

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest">{project?.name || 'Project Board'}</h1>
          <p className="text-slate-400 text-sm">Orchestrating tasks and milestones</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-grow">
        {columns.map(col => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="font-semibold text-slate-300 uppercase text-xs tracking-wider">{col.title}</h3>
                <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-xs">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-2 flex-grow border border-slate-800/50 flex flex-col gap-3">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="premium-card p-4 bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer group">
                  <h4 className="text-sm font-medium mb-3 group-hover:text-indigo-400">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-tighter">
                      <Clock size={10} />
                      {new Date(task.created_at).toLocaleDateString()}
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-400'}
                    `}>
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))}

              {isAddingTask === col.id ? (
                <div className="p-2 space-y-2">
                  <textarea
                    autoFocus
                    className="w-full bg-slate-900 border border-indigo-500 rounded-lg p-3 text-sm focus:outline-none"
                    placeholder="What needs to be done?"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(col.id)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleCreateTask(col.id)} className="py-1 text-xs px-3">Add Task</Button>
                    <Button onClick={() => setIsAddingTask(null)} variant="ghost" className="py-1 text-xs px-3">Cancel</Button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingTask(col.id)}
                  className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-all text-sm mt-1"
                >
                  <Plus size={16} /> Add Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
