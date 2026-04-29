import { supabase } from '@/integrations/supabase/client';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export async function clearWorkspaceData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete in dependency order
  await supabase.from('activities').delete().eq('user_id', user.id);
  await supabase.from('tasks').delete().eq('user_id', user.id);
  await supabase.from('invoice_items').delete().in(
    'invoice_id',
    (await supabase.from('invoices').select('id').eq('user_id', user.id)).data?.map(i => i.id) ?? []
  );
  await supabase.from('payments').delete().eq('user_id', user.id);
  await supabase.from('invoices').delete().eq('user_id', user.id);
  await supabase.from('projects').delete().eq('user_id', user.id);
  await supabase.from('clients').delete().eq('user_id', user.id);
}

export async function seedDemoData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if user already has data
  const { data: existing } = await supabase.from('clients').select('id').limit(1);
  if (existing && existing.length > 0) return;

  const uid = user.id;

  // ── Clients ──
  const clients = [
    { name: 'Sarah Chen', email: 'sarah@northpointcreative.com', phone: '+1 (415) 555-0142', company: 'Northpoint Creative', status: 'active', notes: 'Long-term retainer client. Prefers email communication.', user_id: uid },
    { name: 'Marcus Webb', email: 'marcus@haloskincare.com', phone: '+1 (212) 555-0198', company: 'Halo Skincare', status: 'active', notes: 'E-commerce brand. Quarterly project cycles.', user_id: uid },
    { name: 'Elena Rodriguez', email: 'elena@vantagelabs.io', phone: '+1 (503) 555-0167', company: 'Vantage Labs', status: 'active', notes: 'SaaS startup. Fast-moving sprints.', user_id: uid },
    { name: 'James Thornton', email: 'james@ridgelineadvisors.com', phone: '+1 (617) 555-0134', company: 'Ridgeline Advisors', status: 'active', notes: 'Financial consulting firm. Formal communication style.', user_id: uid },
    { name: 'Priya Kapoor', email: 'priya@solsticeevents.com', phone: '+1 (312) 555-0189', company: 'Solstice Events', status: 'inactive', notes: 'Seasonal event planning. Typically active Q2–Q4.', user_id: uid },
  ];

  const { data: insertedClients, error: clientErr } = await supabase.from('clients').insert(clients).select();
  if (clientErr || !insertedClients) return;

  const clientMap = Object.fromEntries(insertedClients.map(c => [c.company, c.id]));

  // ── Projects ──
  const projects = [
    { name: 'Website Redesign', client_id: clientMap['Northpoint Creative'], status: 'in-progress', priority: 'high', budget: 12000, deadline: daysFromNow(18), progress: 68, description: 'Full redesign of marketing site. Includes responsive layouts, CMS integration, and brand refresh.', assignee: 'You', user_id: uid },
    { name: 'Product Catalog', client_id: clientMap['Halo Skincare'], status: 'in-progress', priority: 'medium', budget: 8500, deadline: daysFromNow(32), progress: 35, description: 'E-commerce catalog with filtering, search, and product detail pages.', assignee: 'You', user_id: uid },
    { name: 'CRM Integration', client_id: clientMap['Vantage Labs'], status: 'in-progress', priority: 'high', budget: 15000, deadline: daysFromNow(8), progress: 88, description: 'API integration with HubSpot CRM. Data sync, webhook handling, and admin dashboard.', assignee: 'You', user_id: uid },
    { name: 'Investor Deck Site', client_id: clientMap['Ridgeline Advisors'], status: 'planning', priority: 'medium', budget: 6000, deadline: daysFromNow(45), progress: 0, description: 'Single-page site for investor relations with document downloads and contact form.', user_id: uid },
    { name: 'Brand Guidelines', client_id: clientMap['Northpoint Creative'], status: 'completed', priority: 'low', budget: 3500, deadline: daysAgo(12), progress: 100, description: 'Brand identity documentation including color palette, typography, and usage guidelines.', assignee: 'You', user_id: uid },
    { name: 'Event Landing Page', client_id: clientMap['Solstice Events'], status: 'on-hold', priority: 'low', budget: 4000, deadline: daysFromNow(60), progress: 15, description: 'Landing page for annual gala. On hold until event date is confirmed.', user_id: uid },
  ];

  const { data: insertedProjects, error: projErr } = await supabase.from('projects').insert(projects).select();
  if (projErr || !insertedProjects) return;

  const projMap = Object.fromEntries(insertedProjects.map(p => [p.name, p.id]));

  // ── Invoices ──
  const invoices = [
    { invoice_number: 'INV-001', client_id: clientMap['Northpoint Creative'], project_id: projMap['Brand Guidelines'], amount: 3500, amount_paid: 3500, status: 'paid', issued_date: daysAgo(30), due_date: daysAgo(0), user_id: uid },
    { invoice_number: 'INV-002', client_id: clientMap['Northpoint Creative'], project_id: projMap['Website Redesign'], amount: 6000, amount_paid: 6000, status: 'paid', issued_date: daysAgo(21), due_date: daysAgo(0), user_id: uid },
    { invoice_number: 'INV-003', client_id: clientMap['Halo Skincare'], project_id: projMap['Product Catalog'], amount: 4250, amount_paid: 0, status: 'unpaid', issued_date: daysAgo(7), due_date: daysFromNow(23), user_id: uid },
    { invoice_number: 'INV-004', client_id: clientMap['Vantage Labs'], project_id: projMap['CRM Integration'], amount: 7500, amount_paid: 7500, status: 'paid', issued_date: daysAgo(45), due_date: daysAgo(15), user_id: uid },
    { invoice_number: 'INV-005', client_id: clientMap['Vantage Labs'], project_id: projMap['CRM Integration'], amount: 7500, amount_paid: 0, status: 'overdue', issued_date: daysAgo(20), due_date: daysAgo(5), user_id: uid },
    { invoice_number: 'INV-006', client_id: clientMap['Ridgeline Advisors'], project_id: projMap['Investor Deck Site'], amount: 3000, amount_paid: 1500, status: 'partially-paid', issued_date: daysAgo(14), due_date: daysFromNow(16), user_id: uid },
  ];

  const { data: insertedInvoices, error: invErr } = await supabase.from('invoices').insert(invoices).select();
  if (invErr || !insertedInvoices) return;

  const invMap = Object.fromEntries(insertedInvoices.map(i => [i.invoice_number, i.id]));

  // ── Invoice Items ──
  const items = [
    { invoice_id: invMap['INV-001'], description: 'Brand identity documentation', quantity: 1, rate: 2500, amount: 2500 },
    { invoice_id: invMap['INV-001'], description: 'Logo variations and assets', quantity: 1, rate: 1000, amount: 1000 },
    { invoice_id: invMap['INV-002'], description: 'Website design — Phase 1 (wireframes + mockups)', quantity: 1, rate: 4000, amount: 4000 },
    { invoice_id: invMap['INV-002'], description: 'Development setup and CMS configuration', quantity: 1, rate: 2000, amount: 2000 },
    { invoice_id: invMap['INV-003'], description: 'Product catalog — design and frontend', quantity: 1, rate: 3000, amount: 3000 },
    { invoice_id: invMap['INV-003'], description: 'Search and filter implementation', quantity: 1, rate: 1250, amount: 1250 },
    { invoice_id: invMap['INV-004'], description: 'CRM API integration — Phase 1', quantity: 1, rate: 5000, amount: 5000 },
    { invoice_id: invMap['INV-004'], description: 'Webhook setup and testing', quantity: 1, rate: 2500, amount: 2500 },
    { invoice_id: invMap['INV-005'], description: 'CRM Integration — Phase 2 (admin dashboard)', quantity: 1, rate: 7500, amount: 7500 },
    { invoice_id: invMap['INV-006'], description: 'Investor deck site — deposit', quantity: 1, rate: 3000, amount: 3000 },
  ];

  await supabase.from('invoice_items').insert(items);

  // ── Payments ──
  const payments = [
    { invoice_id: invMap['INV-001'], amount: 3500, date: daysAgo(25), method: 'bank_transfer', reference: 'TXN-9842', user_id: uid },
    { invoice_id: invMap['INV-002'], amount: 6000, date: daysAgo(14), method: 'bank_transfer', reference: 'TXN-9901', user_id: uid },
    { invoice_id: invMap['INV-004'], amount: 7500, date: daysAgo(30), method: 'bank_transfer', reference: 'TXN-9756', user_id: uid },
    { invoice_id: invMap['INV-006'], amount: 1500, date: daysAgo(10), method: 'credit_card', reference: 'CC-4412', user_id: uid },
  ];

  await supabase.from('payments').insert(payments);

  // ── Tasks ──
  const tasks = [
    { project_id: projMap['Website Redesign'], title: 'Finalize homepage layout', status: 'completed', priority: 'high', user_id: uid },
    { project_id: projMap['Website Redesign'], title: 'Build responsive navigation', status: 'in-progress', priority: 'high', user_id: uid },
    { project_id: projMap['Website Redesign'], title: 'Integrate CMS content blocks', status: 'todo', priority: 'medium', due_date: daysFromNow(12), user_id: uid },
    { project_id: projMap['Website Redesign'], title: 'Cross-browser testing', status: 'todo', priority: 'medium', due_date: daysFromNow(16), user_id: uid },
    { project_id: projMap['Product Catalog'], title: 'Product card component', status: 'completed', priority: 'medium', user_id: uid },
    { project_id: projMap['Product Catalog'], title: 'Category filter sidebar', status: 'in-progress', priority: 'medium', user_id: uid },
    { project_id: projMap['Product Catalog'], title: 'Product detail page', status: 'todo', priority: 'high', due_date: daysFromNow(20), user_id: uid },
    { project_id: projMap['CRM Integration'], title: 'HubSpot API authentication', status: 'completed', priority: 'high', user_id: uid },
    { project_id: projMap['CRM Integration'], title: 'Contact sync endpoint', status: 'completed', priority: 'high', user_id: uid },
    { project_id: projMap['CRM Integration'], title: 'Admin dashboard — final QA', status: 'in-progress', priority: 'high', due_date: daysFromNow(5), user_id: uid },
  ];

  await supabase.from('tasks').insert(tasks);

  // ── Activities ──
  const activities = [
    { type: 'client_added', message: 'New client "Sarah Chen" from Northpoint Creative added', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), user_id: uid },
    { type: 'project_created', message: 'New project "Website Redesign" created', created_at: new Date(Date.now() - 6 * 86400000).toISOString(), user_id: uid },
    { type: 'client_added', message: 'New client "Marcus Webb" from Halo Skincare added', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), user_id: uid },
    { type: 'invoice_sent', message: 'Invoice INV-002 sent to Northpoint Creative — $6,000', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), user_id: uid },
    { type: 'payment_received', message: 'Payment of $6,000 received for INV-002', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), user_id: uid },
    { type: 'task_completed', message: 'Task "Finalize homepage layout" completed', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), user_id: uid },
    { type: 'project_created', message: 'New project "CRM Integration" created', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), user_id: uid },
    { type: 'payment_received', message: 'Partial payment of $1,500 received for INV-006', created_at: new Date(Date.now() - 3600000).toISOString(), user_id: uid },
  ];

  await supabase.from('activities').insert(activities);
}
