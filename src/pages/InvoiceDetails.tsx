import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { invoiceService, clientService, projectService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  Building,
  BanknoteIcon,
} from 'lucide-react';

const methodLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  check: 'Check',
  paypal: 'PayPal',
};

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invoice, isLoading } = useQuery({ queryKey: ['invoice', id], queryFn: () => invoiceService.getById(id!), enabled: !!user && !!id });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAll, enabled: !!user });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectService.getAll, enabled: !!user });
  const { data: items = [] } = useQuery({ queryKey: ['invoice-items', id], queryFn: () => invoiceService.getItems(id!), enabled: !!user && !!id });
  const { data: payments = [] } = useQuery({ queryKey: ['invoice-payments', id], queryFn: () => invoiceService.getPayments(id!), enabled: !!user && !!id });

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;
  if (!invoice) return <DashboardLayout><div className="text-center py-16"><p className="text-muted-foreground">Invoice not found.</p><Button variant="outline" className="mt-4" onClick={() => navigate('/invoices')}>Back to Invoices</Button></div></DashboardLayout>;

  const client = clients.find((c: any) => c.id === invoice.client_id);
  const project = projects.find((p: any) => p.id === invoice.project_id);
  const balance = Number(invoice.amount) - Number(invoice.amount_paid || 0);

  return (
    <DashboardLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')} className="mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />Back to Invoices
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title">{invoice.invoice_number}</h1>
            <span className={`status-badge status-${invoice.status}`}>{invoice.status.replace('-', ' ')}</span>
          </div>
          <p className="text-muted-foreground">
            Issued {new Date(invoice.issued_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items */}
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="font-semibold">Line Items</h2>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td>{item.description}</td>
                      <td className="text-right text-muted-foreground">{Number(item.quantity)}</td>
                      <td className="text-right text-muted-foreground">${Number(item.rate).toLocaleString()}</td>
                      <td className="text-right font-medium">${Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border">
                    <td colSpan={3} className="text-right font-semibold">Total</td>
                    <td className="text-right font-bold text-lg">${Number(invoice.amount).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment history */}
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="font-semibold">Payment History</h2>
              <BanknoteIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            {payments.length === 0 ? (
              <div className="p-6 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">${Number(payment.amount).toLocaleString()} received</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {' · '}{methodLabels[payment.method] || payment.method}
                      </p>
                    </div>
                    {payment.reference && (
                      <span className="text-xs text-muted-foreground font-mono">{payment.reference}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Amount summary */}
          <div className="section-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Amount Summary</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-medium">${Number(invoice.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${Number(invoice.amount_paid || 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-semibold">Balance Due</span>
                <span className={`text-sm font-bold ${balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ${balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="section-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span>{new Date(invoice.issued_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Client & Project */}
          <div className="section-card p-6 space-y-4">
            {client && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">Client</span>
                </div>
                <Link to={`/clients/${client.id}`} className="text-sm font-medium hover:underline">{client.company}</Link>
                <p className="text-xs text-muted-foreground">{client.name}</p>
              </div>
            )}
            {project && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-medium">Project</span>
                </div>
                <Link to={`/projects/${project.id}`} className="text-sm font-medium hover:underline">{project.name}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
