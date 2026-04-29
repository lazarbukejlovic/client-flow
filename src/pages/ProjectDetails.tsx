import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { projectService, clientService, taskService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Calendar, DollarSign, CheckCircle2, User, Clock, AlertCircle, Inbox, Tag } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: project, isLoading } = useQuery({ queryKey: ['project', id], queryFn: () => projectService.getById(id!), enabled: !!user && !!id });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAll, enabled: !!user });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', id], queryFn: () => taskService.getByProject(id!), enabled: !!user && !!id });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assignee: '' });

  const createTaskMut = useMutation({
    mutationFn: (f: typeof taskForm) => taskService.create({ ...f, project_id: id! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', id] }),
  });
  const updateTaskMut = useMutation({
    mutationFn: ({ taskId, fields }: { taskId: string; fields: Record<string, unknown> }) => taskService.update(taskId, fields),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', id] }); qc.invalidateQueries({ queryKey: ['activities'] }); },
  });
  const deleteTaskMut = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', id] }),
  });

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;

  if (!project) return (
    <DashboardLayout>
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    </DashboardLayout>
  );

  const client = clients.find((c: any) => c.id === project.client_id);
  const todoTasks = tasks.filter((t: any) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTaskMut.mutateAsync(taskForm);
    setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assignee: '' });
    setDialogOpen(false);
  };

  const cycleTaskStatus = (taskId: string, currentStatus: string) => {
    const next = currentStatus === 'todo' ? 'in-progress' : currentStatus === 'in-progress' ? 'completed' : 'todo';
    updateTaskMut.mutate({ taskId, fields: { status: next } });
  };

  const daysUntilDeadline = project.deadline ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;

  const priorityColor: Record<string, string> = { high: 'text-red-600 dark:text-red-400', medium: 'text-amber-600 dark:text-amber-400', low: 'text-muted-foreground' };

  const TaskColumn = ({ title, tasks: columnTasks, color, emptyIcon: EmptyIcon, emptyText }: { title: string; tasks: any[]; color: string; emptyIcon: React.ElementType; emptyText: string }) => (
    <div className="bg-muted/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{columnTasks.length}</span>
      </div>
      <div className="space-y-3">
        {columnTasks.map((task: any) => (
          <div key={task.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <button onClick={() => cycleTaskStatus(task.id, task.status)} className="mt-0.5 flex-shrink-0">
                <CheckCircle2 className={`w-4 h-4 ${task.status === 'completed' ? 'text-emerald-500' : 'text-muted-foreground/30 hover:text-muted-foreground/60'} transition-colors`} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
              </div>
              <button onClick={() => deleteTaskMut.mutate(task.id)} className="text-muted-foreground/40 hover:text-destructive text-lg flex-shrink-0 leading-none transition-colors">×</button>
            </div>
            {task.description && <p className="text-xs text-muted-foreground ml-6 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>}
            <div className="flex items-center gap-2 ml-6 flex-wrap">
              <span className={`status-badge priority-${task.priority}`}>{task.priority}</span>
              {task.assignee && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="w-3 h-3" />{task.assignee}</span>}
              {task.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
            </div>
          </div>
        ))}
        {columnTasks.length === 0 && (
          <div className="text-center py-8 px-4"><EmptyIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" /><p className="text-xs text-muted-foreground">{emptyText}</p></div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4 mr-2" />Back to Projects</Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title">{project.name}</h1>
            <span className={`status-badge status-${project.status}`}>{project.status.replace('-', ' ')}</span>
            <span className={`text-xs font-medium ${priorityColor[project.priority] || ''}`}><Tag className="w-3 h-3 inline mr-1" />{project.priority} priority</span>
          </div>
          <p className="text-muted-foreground">{client?.company || 'No client'}{project.assignee && <span className="ml-2 text-sm">· Lead: {project.assignee}</span>}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 text-primary" /></div><span className="text-sm">Budget</span></div>
          <p className="text-2xl font-bold">${Number(project.budget || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${daysUntilDeadline < 30 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/10'}`}>
              <Calendar className={`w-3.5 h-3.5 ${daysUntilDeadline < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
            </div><span className="text-sm">Deadline</span>
          </div>
          <p className="text-2xl font-bold">{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}</p>
          {project.deadline && <p className={`text-xs mt-1 ${daysUntilDeadline < 30 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>{daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : 'Overdue'}</p>}
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /></div><span className="text-sm">Progress</span></div>
          <p className="text-2xl font-bold">{project.progress ?? 0}%</p>
          <Progress value={project.progress ?? 0} className="h-2 mt-2" />
        </div>
      </div>

      {project.description && (<div className="section-card p-6 mb-8"><h2 className="font-semibold mb-2">Description</h2><p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p></div>)}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-lg">Tasks</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} total · {completedTasks.length} completed</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Title</Label><Input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Assignee</Label><Input value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })} placeholder="Name" /></div>
              <Button type="submit" className="w-full" disabled={createTaskMut.isPending}>{createTaskMut.isPending ? 'Adding…' : 'Add Task'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <TaskColumn title="To Do" tasks={todoTasks} color="bg-muted-foreground" emptyIcon={AlertCircle} emptyText="No tasks yet — add one above" />
        <TaskColumn title="In Progress" tasks={inProgressTasks} color="bg-primary" emptyIcon={Clock} emptyText="Move tasks here to start working" />
        <TaskColumn title="Completed" tasks={completedTasks} color="bg-emerald-500" emptyIcon={Inbox} emptyText="Completed tasks will appear here" />
      </div>
    </DashboardLayout>
  );
}
