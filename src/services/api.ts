/**
 * API Service Layer — Supabase Backend
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Profiles ──────────────────────────────────────────
export const profileService = {
  async get() {
    const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
    if (error) throw error;
    return data;
  },
  async update(fields: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.from('profiles').update(fields).eq('user_id', user.id);
    if (error) throw error;
  },
};

// ─── Clients ───────────────────────────────────────────
export const clientService = {
  async getAll() {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string) {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(fields: { name: string; email: string; phone?: string; company: string; status?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('clients').insert({ ...fields, user_id: user.id }).select().single();
    if (error) throw error;
    // Log activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'client_added',
      message: `New client "${fields.name}" from ${fields.company} added`,
    });
    return data;
  },
  async update(id: string, fields: Record<string, unknown>) {
    const { error } = await supabase.from('clients').update(fields).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Projects ──────────────────────────────────────────
export const projectService = {
  async getAll() {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string) {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async getByClient(clientId: string) {
    const { data, error } = await supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(fields: { name: string; client_id?: string; status?: string; priority?: string; budget?: number; deadline?: string; description?: string; assignee?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('projects').insert({ ...fields, user_id: user.id }).select().single();
    if (error) throw error;
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'project_created',
      message: `New project "${fields.name}" created`,
    });
    return data;
  },
  async update(id: string, fields: Record<string, unknown>) {
    const { error } = await supabase.from('projects').update(fields).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Tasks ─────────────────────────────────────────────
export const taskService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(fields: { project_id: string; title: string; description?: string; priority?: string; due_date?: string; assignee?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('tasks').insert({ ...fields, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, fields: Record<string, unknown>) {
    const { error } = await supabase.from('tasks').update(fields).eq('id', id);
    if (error) throw error;
    // Log task completion
    if (fields.status === 'completed') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: task } = await supabase.from('tasks').select('title').eq('id', id).maybeSingle();
        await supabase.from('activities').insert({
          user_id: user.id,
          type: 'task_completed',
          message: `Task "${task?.title}" completed`,
        });
      }
    }
  },
  async delete(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Invoices ──────────────────────────────────────────
export const invoiceService = {
  async getAll() {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getById(id: string) {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async getByClient(clientId: string) {
    const { data, error } = await supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getItems(invoiceId: string) {
    const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId);
    if (error) throw error;
    return data ?? [];
  },
  async getPayments(invoiceId: string) {
    const { data, error } = await supabase.from('payments').select('*').eq('invoice_id', invoiceId).order('date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async update(id: string, fields: Record<string, unknown>) {
    const { error } = await supabase.from('invoices').update(fields).eq('id', id);
    if (error) throw error;
  },
};

// ─── Activities ────────────────────────────────────────
export const activityService = {
  async getRecent(limit = 10) {
    const { data, error } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
