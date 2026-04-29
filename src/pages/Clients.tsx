import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { clientService, projectService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Search, ArrowUpRight, Users } from 'lucide-react';

export default function Clients() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAll, enabled: !!user });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectService.getAll, enabled: !!user });
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'active' });

  const createMut = useMutation({
    mutationFn: (f: typeof form) => clientService.create(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); qc.invalidateQueries({ queryKey: ['activities'] }); },
  });
  const deleteMut = useMutation({
    mutationFn: clientService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  const filtered = clients.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMut.mutateAsync(form);
    setForm({ name: '', email: '', phone: '', company: '', status: 'active' });
    setDialogOpen(false);
  };

  const addClientDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Add Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 mt-2">
          <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client name" /></div>
          <div className="space-y-2"><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
          <div className="space-y-2"><Label>Company</Label><Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createMut.isPending}>{createMut.isPending ? 'Adding…' : 'Add Client'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-description">{clients.length} accounts · {clients.filter((c: any) => c.status === 'active').length} active</p>
        </div>
        {addClientDialog}
      </div>

      {clients.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No clients yet</h2>
          <p className="text-muted-foreground mb-6">
            Add your first client to start tracking work, billing, and communication from one place.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Add Your First Client
          </Button>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-sm" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No clients match your search.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Projects</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {filtered.map((client: any) => {
                      const clientProjects = projects.filter((p: any) => p.client_id === client.id);
                      return (
                        <tr key={client.id}>
                          <td className="font-medium">{client.name}</td>
                          <td className="text-muted-foreground">{client.company}</td>
                          <td className="text-muted-foreground">{client.email}</td>
                          <td>{clientProjects.length}</td>
                          <td><span className={`status-badge ${client.status === 'active' ? 'status-active' : 'status-inactive'}`}>{client.status}</span></td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild><Link to={`/clients/${client.id}`}><ArrowUpRight className="w-4 h-4" /></Link></Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMut.mutate(client.id)}>×</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
