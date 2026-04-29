import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { clientService, projectService, invoiceService, activityService } from '@/services/api';
import { seedDemoData, clearWorkspaceData } from '@/services/seedData';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Users, FolderKanban, FileText, DollarSign, Clock, TrendingUp,
  ArrowUpRight, CreditCard, CheckCircle2, PlusCircle, Send, UserPlus,
  AlertTriangle, Target, CalendarClock, Banknote, Plus, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/Logo';

const activityIcons: Record<string, React.ElementType> = {
  client_added: UserPlus,
  project_created: PlusCircle,
  invoice_sent: Send,
  task_completed: CheckCircle2,
  payment_received: CreditCard,
};

const activityColors: Record<string, string> = {
  client_added: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  project_created: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  invoice_sent: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  task_completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  payment_received: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loadingSample, setLoadingSample] = useState(false);
  const [clearingSample, setClearingSample] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);

  // Show a brief setup screen for brand-new signups
  useEffect(() => {
    if (!user) return;
    const signupTs = new Date(user.created_at).getTime();
    const isRecent = Date.now() - signupTs < 10_000; // within 10s of account creation
    if (isRecent) {
      setIsNewSession(true);
      const timer = setTimeout(() => setIsNewSession(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLoadSampleData = async () => {
    setLoadingSample(true);
    await seedDemoData();
    await queryClient.invalidateQueries();
    setLoadingSample(false);
  };

  const handleClearWorkspace = async () => {
    setClearingSample(true);
    await clearWorkspaceData();
    await queryClient.invalidateQueries();
    setClearingSample(false);
  };

  const { data: clients = [], isLoading: loadingClients } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAll, enabled: !!user, refetchOnMount: true });
  const { data: projects = [], isLoading: loadingProjects } = useQuery({ queryKey: ['projects'], queryFn: projectService.getAll, enabled: !!user, refetchOnMount: true });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({ queryKey: ['invoices'], queryFn: invoiceService.getAll, enabled: !!user, refetchOnMount: true });
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: () => activityService.getRecent(10), enabled: !!user, refetchOnMount: true });

  const isInitialLoad = loadingClients || loadingProjects || loadingInvoices;

  // New signup transition screen
  if (isNewSession || (isInitialLoad && !clients.length && !projects.length)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <LogoMark size={48} className="mb-6" />
          <h2 className="text-lg font-semibold mb-2">Setting up your workspace…</h2>
          <p className="text-sm text-muted-foreground">This only takes a moment.</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = clients.length > 0 || projects.length > 0 || invoices.length > 0;

  const activeClients = clients.filter((c) => c.status === 'active').length;
  const inDelivery = projects.filter((p) => p.status === 'in-progress').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const projectCompletionRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'partially-paid');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const totalCollected = invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + Number(i.amount), 0);
  const pendingAmount = unpaidInvoices.reduce((sum: number, i: any) => sum + (Number(i.amount) - Number(i.amount_paid || 0)), 0);
  const overdueAmount = overdueInvoices.reduce((sum: number, i: any) => sum + (Number(i.amount) - Number(i.amount_paid || 0)), 0);

  const upcomingDeadlines = projects
    .filter((p) => p.status === 'in-progress' || p.status === 'planning')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const atRiskProjects = projects.filter((p) => {
    if (p.status !== 'in-progress') return false;
    const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft < 14;
  });

  const stats = [
    { label: 'Active Clients', value: activeClients, icon: Users, sub: `${clients.length} total`, color: 'text-primary', bg: 'bg-primary/8' },
    { label: 'In Delivery', value: inDelivery, icon: FolderKanban, sub: atRiskProjects.length > 0 ? `${atRiskProjects.length} at risk` : 'All on track', color: 'text-primary', bg: 'bg-primary/8' },
    { label: 'Delivery Rate', value: `${projectCompletionRate}%`, icon: Target, sub: `${completedProjects} of ${projects.length} completed`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Payments', value: unpaidInvoices.length, icon: FileText, sub: `$${pendingAmount.toLocaleString()} outstanding`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Collected', value: `$${totalCollected.toLocaleString()}`, icon: DollarSign, sub: 'All time', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Deadlines', value: upcomingDeadlines.length, icon: CalendarClock, sub: 'Active projects', color: 'text-primary', bg: 'bg-primary/8' },
  ];

  if (!hasData) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Operations Overview</h1>
          <p className="page-description">Client delivery, billing, and upcoming obligations.</p>
        </div>
        <div className="max-w-xl mx-auto py-16 text-center">
          <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to ClientFlow</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start by adding a client or creating a project. Your dashboard will show delivery status, billing, and deadlines as you add data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link to="/clients"><Plus className="w-4 h-4 mr-2" />Add Your First Client</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/projects"><FolderKanban className="w-4 h-4 mr-2" />Create a Project</Link>
            </Button>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Just exploring? Load a realistic sample workspace.</p>
            <Button variant="ghost" size="sm" onClick={handleLoadSampleData} disabled={loadingSample}>
              {loadingSample ? 'Loading…' : 'Load sample data'}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Operations Overview</h1>
          <p className="page-description">Client delivery, billing, and upcoming obligations.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive text-xs gap-1.5 mt-1"
          onClick={handleClearWorkspace}
          disabled={clearingSample}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {clearingSample ? 'Clearing…' : 'Clear workspace'}
        </Button>
      </div>

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} — ${overdueAmount.toLocaleString()} needs follow-up
            </p>
          </div>
          <Link to="/invoices" className="text-sm font-medium text-red-700 dark:text-red-400 hover:underline flex-shrink-0">
            View invoices
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Payment Status */}
      {(overdueInvoices.length > 0 || unpaidInvoices.length > 0) && (
        <div className="section-card mb-6">
          <div className="section-card-header">
            <h2 className="font-semibold text-sm">Payment Status</h2>
            <Banknote className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {overdueInvoices.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Overdue</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{overdueInvoices.length} invoice{overdueInvoices.length > 1 ? 's' : ''} past due date</p>
                </div>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">${overdueAmount.toLocaleString()}</p>
              </div>
            )}
            {unpaidInvoices.filter(i => i.status !== 'overdue').length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Awaiting Payment</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{unpaidInvoices.filter(i => i.status !== 'overdue').length} pending</p>
                </div>
                <p className="text-lg font-bold">${(pendingAmount - overdueAmount).toLocaleString()}</p>
              </div>
            )}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Collected</p>
                <p className="text-xs text-muted-foreground mt-0.5">{invoices.filter((i: any) => i.status === 'paid').length} invoices settled</p>
              </div>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* At-Risk Projects */}
      {atRiskProjects.length > 0 && (
        <div className="section-card mb-6">
          <div className="section-card-header">
            <h2 className="font-semibold text-sm">Needs Attention</h2>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="divide-y divide-border">
            {atRiskProjects.map((project) => {
              const client = clients.find((c: any) => c.id === project.client_id);
              const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="block px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{client?.company || 'No client'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${daysLeft <= 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {daysLeft <= 0 ? 'Past deadline' : `${daysLeft} days left`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.progress ?? 0}% complete</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 section-card">
          <div className="section-card-header">
            <h2 className="font-semibold text-sm">Recent Activity</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {activities.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No activity yet. Actions like adding clients, creating projects, and completing tasks will appear here.
              </div>
            )}
            {activities.map((activity: any) => {
              const Icon = activityIcons[activity.type as string] || Clock;
              const colorClass = activityColors[activity.type as string] || 'bg-muted text-muted-foreground';
              return (
                <div key={activity.id} className="px-6 py-3.5 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(activity.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="font-semibold text-sm">Delivery Deadlines</h2>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {upcomingDeadlines.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No upcoming deadlines.
              </div>
            )}
            {upcomingDeadlines.map((project) => {
              const client = clients.find((c: any) => c.id === project.client_id);
              const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft < 14;
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="block px-6 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate pr-2">{project.name}</p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{client?.company}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {isUrgent && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    <p className={`text-xs font-medium ${daysLeft <= 0 ? 'text-red-600 dark:text-red-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Past deadline'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
