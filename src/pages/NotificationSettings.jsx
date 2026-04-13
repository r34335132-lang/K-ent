import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Mail, CheckCircle, User, Home, Wrench, Megaphone, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const PREF_OPTIONS = [
  { key: 'notify_notices', label: 'Nuevos comunicados', icon: Megaphone, color: 'text-blue-600', description: 'Avisos, noticias y eventos del condominio' },
  { key: 'notify_maintenance', label: 'Mantenimiento urgente', icon: Wrench, color: 'text-orange-500', description: 'Alertas de fallas o trabajos urgentes' },
  { key: 'notify_report_updates', label: 'Estado de mis reportes', icon: RefreshCw, color: 'text-green-600', description: 'Cuando tu reporte cambia de estatus' },
];

function SubscribeForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', department: '',
    notify_notices: true, notify_maintenance: true, notify_report_updates: true
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Check if already subscribed
    const existing = await base44.entities.NotificationSubscriber.filter({ email: form.email });
    if (existing.length > 0) {
      await base44.entities.NotificationSubscriber.update(existing[0].id, form);
    } else {
      await base44.entities.NotificationSubscriber.create(form);
    }
    // Confirmation email
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: '✅ Suscripción a Notificaciones - Portal Condominal',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <h2 style="color: #1e40af;">¡Hola, ${form.name}!</h2>
          <p>Te has suscrito exitosamente a las notificaciones del Portal Condominal.</p>
          <p><strong>Departamento:</strong> ${form.department}</p>
          <h3 style="color: #334155;">Recibirás alertas de:</h3>
          <ul>
            ${form.notify_notices ? '<li>📣 Nuevos comunicados y avisos</li>' : ''}
            ${form.notify_maintenance ? '<li>🔧 Mantenimiento urgente</li>' : ''}
            ${form.notify_report_updates ? '<li>🔄 Actualizaciones de tus reportes</li>' : ''}
          </ul>
          <p style="color: #94a3b8; font-size: 12px;">Para modificar tus preferencias, visita el portal del condominio.</p>
        </div>
      `
    });
    setSent(true);
    setLoading(false);
    setTimeout(() => { setSent(false); if (onSuccess) onSuccess(); }, 3500);
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">¡Suscripción confirmada!</h3>
        <p className="text-slate-500">Revisa tu correo para confirmar.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><User className="w-4 h-4" />Nombre</label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre completo" required className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Home className="w-4 h-4" />Departamento</label>
          <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Ej: A-101" required className="h-12 rounded-xl" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Mail className="w-4 h-4" />Correo electrónico</label>
        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" required className="h-12 rounded-xl" />
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">¿Qué notificaciones deseas recibir?</p>
        </div>
        {PREF_OPTIONS.map(({ key, label, icon: Icon, color, description }) => (
          <div key={key} className="flex items-center justify-between px-5 py-4 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
              </div>
            </div>
            <Switch checked={form[key]} onCheckedChange={val => setForm({ ...form, [key]: val })} />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 rounded-xl">
        {loading ? 'Guardando...' : (
          <span className="flex items-center gap-2"><Bell className="w-5 h-5" />Activar Notificaciones</span>
        )}
      </Button>
    </form>
  );
}

function SubscriberList() {
  const queryClient = useQueryClient();
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => base44.entities.NotificationSubscriber.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NotificationSubscriber.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscribers'] })
  });

  if (isLoading) return <div className="text-center py-8 text-slate-400">Cargando suscriptores...</div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 font-medium">{subs.length} suscriptor(es) registrado(s)</p>
      {subs.map(sub => (
        <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{sub.name} · Depto {sub.department}</p>
            <p className="text-xs text-slate-500">{sub.email}</p>
            <div className="flex gap-2 mt-1.5">
              {sub.notify_notices && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Comunicados</span>}
              {sub.notify_maintenance && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Mantenimiento</span>}
              {sub.notify_report_updates && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Reportes</span>}
            </div>
          </div>
          <button onClick={() => deleteMutation.mutate(sub.id)} className="p-2 text-slate-400 hover:text-red-500 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function NotificationSettings() {
  const [view, setView] = useState('subscribe'); // 'subscribe' | 'list'
  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Notificaciones por Email</h1>
          <p className="text-slate-500 mt-2">Mantente informado sobre lo que ocurre en tu condominio</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-200 rounded-xl p-1 mb-6">
          <button
            onClick={() => setView('subscribe')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${view === 'subscribe' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            Suscribirme
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${view === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            Ver Suscriptores
          </button>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100">
          <AnimatePresence mode="wait">
            {view === 'subscribe' ? (
              <motion.div key="subscribe" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <SubscribeForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['subscribers'] })} />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SubscriberList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}