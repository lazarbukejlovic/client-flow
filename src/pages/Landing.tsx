import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogoMark } from '@/components/Logo';
import {
  BarChart3,
  Users,
  FileText,
  FolderKanban,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Building2,
  UserCheck,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Client Records',
    description: 'Contact details, project history, and billing status for every account — all in one place.',
  },
  {
    icon: FolderKanban,
    title: 'Delivery Tracking',
    description: 'Track progress, budgets, and deadlines per engagement. Flag what needs follow-up before it slips.',
  },
  {
    icon: FileText,
    title: 'Invoice & Billing',
    description: 'Record line items, track partial payments, and surface overdue balances tied to the right client and project.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Overview',
    description: 'Collected, pending, and overdue at a glance. Understand your cash position without a spreadsheet.',
  },
];

const useCases = [
  {
    icon: Briefcase,
    title: 'Freelancers',
    description: 'Keep clients, deadlines, and invoices organized. Know what\'s due, what\'s overdue, and what\'s next.',
    stat: 'Less time on admin',
  },
  {
    icon: Building2,
    title: 'Small Agencies',
    description: 'Track delivery and billing across accounts. See budget utilization, deadlines, and payment status for every client.',
    stat: 'Full account visibility',
  },
  {
    icon: UserCheck,
    title: 'Consultants',
    description: 'Run your practice with clarity. Track engagements, manage invoicing, and stay on top of client obligations.',
    stat: 'Nothing falls through',
  },
];

const benefits = [
  'See unpaid invoices and overdue amounts instantly',
  'Track project delivery against budget and deadlines',
  'Know which clients need follow-up',
  'Manage tasks tied to real client work',
  'Keep billing and delivery data in one system',
  'Reduce admin time without losing control',
];

const trustPoints = [
  { icon: Shield, label: 'Authenticated & secure' },
  { icon: Clock, label: 'Persistent data' },
  { icon: AlertTriangle, label: 'Overdue tracking built in' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="text-lg font-bold">ClientFlow</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/signin">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-8 border border-primary/10">
              Client operations platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6">
              Delivery, billing, and client work{' '}
              <span className="text-primary">in one system</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ClientFlow gives freelancers, consultants, and small agencies one place to track client work, follow up on invoices, and stay ahead of deadlines.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="px-8 h-12 text-base" asChild>
                <Link to="/signup">
                  Create your account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base" asChild>
                <Link to="/signin">Sign in</Link>
              </Button>
            </div>

            {/* Trust points */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {trustPoints.map((point) => (
                <div key={point.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <point.icon className="w-4 h-4 text-primary/50" />
                  {point.label}
                </div>
              ))}
            </div>
          </div>

          {/* Product Preview */}
          <div className="mt-16 sm:mt-20">
            <div className="bg-card border border-border rounded-xl shadow-xl shadow-foreground/[0.03] overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background rounded px-4 py-1 text-xs text-muted-foreground w-56 text-center border border-border">
                    app.clientflow.com
                  </div>
                </div>
              </div>
              {/* Dashboard mockup */}
              <div className="p-6 sm:p-8 bg-background/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-foreground">Operations Overview</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Active Clients', value: '12', sub: '4 active · 1 needs follow-up' },
                    { label: 'In Delivery', value: '5', sub: '1 deadline this week' },
                    { label: 'Collected', value: '$48,200', sub: 'This quarter' },
                    { label: 'Overdue', value: '$7,500', sub: '1 invoice past due' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Website Redesign', client: 'Northpoint Creative', progress: 68 },
                    { name: 'Product Catalog', client: 'Halo Skincare', progress: 35 },
                    { name: 'CRM Integration', client: 'Vantage Labs', progress: 88 },
                  ].map((project) => (
                    <div key={project.name} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">{project.client}</p>
                      <div className="w-full bg-muted rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">{project.progress}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold">See what matters. Act on what's urgent.</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Client relationships, project delivery, and billing connected in one operational view.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                  <feature.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Who it's for</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Built for people who run service businesses</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              If you bill clients, deliver projects, and follow up on payments — this was built for your workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="bg-card border border-border rounded-xl p-7">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-5">
                  <useCase.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{useCase.description}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {useCase.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Why ClientFlow</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Stop losing track of what you're owed
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Spreadsheets don't warn you about overdue invoices. Sticky notes don't track delivery against budget.
                ClientFlow keeps your operations visible so you can focus on the work that pays.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between p-5 bg-background rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Projects in Delivery</p>
                  <p className="text-2xl font-bold mt-1">5</p>
                  <p className="text-xs text-muted-foreground mt-0.5">4 on track · 1 at risk</p>
                </div>
                <FolderKanban className="w-8 h-8 text-primary/20" />
              </div>
              <div className="flex items-center justify-between p-5 bg-background rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Outstanding Payments</p>
                  <p className="text-2xl font-bold mt-1">$11,750</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">$7,500 overdue</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary/20" />
              </div>
              <div className="flex items-center justify-between p-5 bg-background rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Active Accounts</p>
                  <p className="text-2xl font-bold mt-1">4</p>
                  <p className="text-xs text-muted-foreground mt-0.5">1 pending follow-up</p>
                </div>
                <Users className="w-8 h-8 text-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Take control of your client operations</h2>
            <p className="text-muted-foreground mb-8">
              Stop guessing what's unpaid, delayed, or at risk. Get the visibility to run your business with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="px-8 h-12 text-base" asChild>
                <Link to="/signup">
                  Create your account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base" asChild>
                <Link to="/signin">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-sm font-semibold">ClientFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ClientFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
