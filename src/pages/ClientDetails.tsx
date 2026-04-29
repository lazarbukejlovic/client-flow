import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { clientService, projectService, invoiceService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowUpRight, Mail, Phone, MapPin, Building, Edit, Save, X } from 'lucide-react';

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: client, isLoading } = useQuery({ queryKey: ['client', id], queryFn: () => clientService.getById(id!), enabled: !!user && !!id });
  const { data: clientProjects = [] } = useQuery({ queryKey: ['projects', 'client', id], queryFn: () => projectService.getByClient(id!), enabled: !!user && !!id });
  const { data: clientInvoices = [] } = useQuery({ queryKey: ['invoices', 'client', id], queryFn: () => invoiceService.getByClient(id!), enabled: !!user && !!id });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  const updateMut = useMutation({
    mutationFn: (fields: Record<string, unknown>) => clientService.update(id!, fields),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['client', id] }); qc.invalidateQueries({ queryKey: ['clients'] }); },
  });

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;

  if (!client) return (
    <DashboardLayout>
      <div className="text-center py-16">
        <p className="text-muted-foreground">Client not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/clients')}>Back to Clients</Button>
      </div>
    </DashboardLayout>
  );

  const totalBilled = clientInvoices.reduce((sum: number, i: any) => sum + Number(i.amount), 0);
  const totalPaid = clientInvoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + Number(i.amount), 0);
  const outstanding = totalBilled - totalPaid;

  const handleSave = async () => {
    await updateMut.mutateAsync(form);
    setEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Clients</Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{client.name}</h1>
              <span className={`status-badge ${client.status === 'active' ? 'status-active' : 'status-inactive'}`}>{client.status}</span>
            </div>
            <p className="page-description">{client.company}</p>
          </div>
          {!editing ? (
            <Button variant="outline" onClick={() => { setForm(client); setEditing(true); }}><Edit className="w-4 h-4 mr-2" />Edit Client</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateMut.isPending}><Save className="w-4 h-4 mr-2" />{updateMut.isPending ? 'Saving…' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-2" />Cancel</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Contact Information</h2>
          {editing ? (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" />{client.email}</div>
              {client.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" />{client.phone}</div>}
              <div className="flex items-center gap-3 text-sm"><Building className="w-4 h-4 text-muted-foreground" />{client.company}</div>
              {client.address && <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" />{client.address}</div>}
            </div>
          )}
          {client.notes && !editing && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Notes</p>
              <p className="text-sm">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-card text-center"><p className="text-2xl font-bold">{clientProjects.length}</p><p className="text-xs text-muted-foreground mt-1">Projects</p></div>
            <div className="stat-card text-center"><p className="text-2xl font-bold">{clientInvoices.length}</p><p className="text-xs text-muted-foreground mt-1">Invoices</p></div>
            <div className="stat-card text-center"><p className="text-2xl font-bold">${totalBilled.toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">Total Billed</p></div>
            <div className="stat-card text-center">
              <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>${outstanding.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Outstanding</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold">Projects</h2></div>
            {clientProjects.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No projects for this client yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {clientProjects.map((project: any) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      {project.deadline && <p className="text-xs text-muted-foreground">Due {new Date(project.deadline).toLocaleDateString()}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge status-${project.status}`}>{project.status.replace('-', ' ')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold">Invoices</h2></div>
            {clientInvoices.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No invoices for this client yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {clientInvoices.map((inv: any) => (
                  <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">Due {new Date(inv.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${Number(inv.amount).toLocaleString()}</span>
                      <span className={`status-badge status-${inv.status}`}>{inv.status.replace('-', ' ')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}