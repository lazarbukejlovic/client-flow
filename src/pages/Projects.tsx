import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { projectService, clientService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ArrowUpRight, FolderKanban, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Projects() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectService.getAll, enabled: !!user });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAll, enabled: !!user });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', client_id: '', status: 'planning', priority: 'medium', budget: '', deadline: '', description: '', assignee: '' });

  const createMut = useMutation({
    mutationFn: (f: typeof form) => projectService.create({ ...f, budget: Number(f.budget) || 0, client_id: f.client_id || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); qc.invalidateQueries({ queryKey: ['activities'] }); },
  });

  const filtered = projects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMut.mutateAsync(form);
    setForm({ name: '', client_id: '', status: 'planning', priority: 'medium', budget: '', deadline: '', description: '', assignee: '' });
    setDialogOpen(false);
  };

  const priorityColor: Record<string, string> = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-muted-foreground',
  };

  const createDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Project</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 mt-2">
          <div className="space-y-2"><Label>Project Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" /></div>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name} — {c.company}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Budget ($)</Label><Input required type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="10000" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Deadline</Label><Input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div className="space-y-2"><Label>Assignee</Label><Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="Team member" /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief project description" /></div>
          <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? 'Creating…' : 'Create Project'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-description">{projects.filter((p: any) => p.status === 'in-progress').length} in delivery · {projects.length} total</p>
        </div>
        {createDialog}
      </div>

      {projects.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first project to track deadlines, delivery progress, and budgets.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Create Your First Project
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem><SelectItem value="planning">Planning</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No projects match your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((project: any) => {
                const client = clients.find((c: any) => c.id === project.client_id);
                return (
                  <Link key={project.id} to={`/projects/${project.id}`} className="stat-card group block">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`status-badge status-${project.status}`}>{project.status.replace('-', ' ')}</span>
                        <span className={`text-xs font-medium ${priorityColor[project.priority] || ''}`}>{project.priority}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{client?.company || 'No client'}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{project.progress ?? 0}%</span></div>
                      <Progress value={project.progress ?? 0} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                      <span>${Number(project.budget || 0).toLocaleString()}</span>
                      {project.deadline && <span>Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                    {project.assignee && (<div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground"><User className="w-3 h-3" />{project.assignee}</div>)}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
