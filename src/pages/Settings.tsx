import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Building, CreditCard, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ['profile', user?.id], queryFn: profileService.get, enabled: !!user });
  const [form, setForm] = useState({ name: '', email: '', business_name: '', phone: '', address: '' });
  const [businessSettings, setBusinessSettings] = useState({ timezone: 'America/New_York', currency: 'USD', default_payment_terms: '30', invoice_prefix: 'INV', tax_rate: '0' });
  const [saved, setSaved] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', email: profile.email || '', business_name: profile.business_name || '', phone: profile.phone || '', address: profile.address || '' });
      setBusinessSettings({ timezone: profile.timezone || 'America/New_York', currency: profile.currency || 'USD', default_payment_terms: String(profile.default_payment_terms ?? 30), invoice_prefix: profile.invoice_prefix || 'INV', tax_rate: String(profile.tax_rate ?? 0) });
    }
  }, [profile]);

  const updateMut = useMutation({
    mutationFn: (fields: Record<string, unknown>) => profileService.update(fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMut.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBusinessSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMut.mutateAsync({
      timezone: businessSettings.timezone,
      currency: businessSettings.currency,
      default_payment_terms: Number(businessSettings.default_payment_terms),
      invoice_prefix: businessSettings.invoice_prefix,
      tax_rate: Number(businessSettings.tax_rate),
    });
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Account details and billing defaults.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="font-semibold">Profile Information</h2>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={updateMut.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateMut.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
              {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Saved successfully.</span>}
            </div>
          </form>
        </div>

        {/* Business Configuration */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold">Business Configuration</h2>
            </div>
          </div>
          <form onSubmit={handleBusinessSave} className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={businessSettings.timezone} onValueChange={(v) => setBusinessSettings({ ...businessSettings, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Berlin">Central European Time (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={businessSettings.currency} onValueChange={(v) => setBusinessSettings({ ...businessSettings, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                    <SelectItem value="CAD">CAD — Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Payment Terms</Label>
                <Select value={businessSettings.default_payment_terms} onValueChange={(v) => setBusinessSettings({ ...businessSettings, default_payment_terms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Net 7</SelectItem>
                    <SelectItem value="14">Net 14</SelectItem>
                    <SelectItem value="30">Net 30</SelectItem>
                    <SelectItem value="45">Net 45</SelectItem>
                    <SelectItem value="60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Invoice Prefix</Label>
                <Input value={businessSettings.invoice_prefix} onChange={(e) => setBusinessSettings({ ...businessSettings, invoice_prefix: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" min="0" max="100" step="0.1" value={businessSettings.tax_rate} onChange={(e) => setBusinessSettings({ ...businessSettings, tax_rate: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={updateMut.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateMut.isPending ? 'Saving…' : 'Save Configuration'}
              </Button>
              {businessSaved && <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Configuration saved.</span>}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
