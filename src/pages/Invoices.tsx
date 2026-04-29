import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { invoiceService, clientService, projectService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, ArrowUpRight } from 'lucide-react';

export default function Invoices() {
  const { user } = useAuth();
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: invoiceService.getAll, enabled: !!user });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAll, enabled: !!user });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectService.getAll, enabled: !!user });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = invoices.filter((inv) => {
    const client = clients.find((c) => c.id === inv.client_id);
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (client?.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid' || i.status === 'partially-paid').reduce((s, i) => s + (Number(i.amount) - Number(i.amount_paid || 0)), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + Number(i.amount), 0);

  if (invoices.length === 0) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Invoices</h1>
          <p className="page-description">Billing status, outstanding amounts, and payment history.</p>
        </div>
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No invoices yet</h2>
          <p className="text-muted-foreground mb-6">
            Invoices will appear here as you create them from project detail pages. Track what's been billed, paid, and overdue in one view.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <p className="page-description">Billing status, outstanding amounts, and payment history.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-foreground">${totalPaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{invoices.filter((i) => i.status === 'paid').length} invoices</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Unpaid</p>
          <p className="text-2xl font-bold text-foreground">${totalUnpaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{invoices.filter((i) => i.status === 'unpaid').length} invoices</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Partially Paid</p>
          <p className="text-2xl font-bold text-foreground">{invoices.filter((i) => i.status === 'partially-paid').length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${invoices.filter((i) => i.status === 'partially-paid').reduce((s, i) => s + (Number(i.amount) - Number(i.amount_paid || 0)), 0).toLocaleString()} outstanding
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-foreground">${totalOverdue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{invoices.filter((i) => i.status === 'overdue').length} invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partially-paid">Partially Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No invoices match your filters.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  const project = projects.find((p) => p.id === inv.project_id);
                  return (
                    <tr key={inv.id}>
                      <td className="font-medium">{inv.invoice_number}</td>
                      <td className="text-muted-foreground">{client?.company || '—'}</td>
                      <td className="text-muted-foreground">{project?.name || '—'}</td>
                      <td className="font-medium">${Number(inv.amount).toLocaleString()}</td>
                      <td className="text-muted-foreground">${Number(inv.amount_paid || 0).toLocaleString()}</td>
                      <td className="text-muted-foreground">{new Date(inv.due_date).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${inv.status}`}>{inv.status.replace('-', ' ')}</span></td>
                      <td>
                        <Link to={`/invoices/${inv.id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
