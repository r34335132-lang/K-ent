import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PREFS = [
  { key: 'notify_notices', label: 'Nuevos comunicados', emoji: '📢' },
  { key: 'notify_urgent', label: 'Alertas urgentes', emoji: '🚨' },
  { key: 'notify_maintenance', label: 'Actualizaciones de mantenimiento', emoji: '🔧' },
  { key: 'notify_events', label: 'Eventos del condominio', emoji: '📅' },
];

export default function SubscriptionForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: '', email: '', department: '',
    notify_notices: true, notify_urgent: true,
    notify_maintenance: false, notify_events: true,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.NotificationSubscription.create({ ...form, is_active: true });
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: '✅ Suscripción confirmada - Portal Condominal',
      body: `
        <h2>¡Bienvenido, ${form.name}!</h2>
        <p>Tu suscripción al sistema de notificaciones del Portal Condominal ha sido registrada para el departamento <strong>${form.department}</strong>.</p>
        <p>Recibirás notificaciones sobre:</p>
        <ul>
          ${form.notify_notices ? '<li>📢 Nuevos comunicados</li>' : ''}
          ${form.notify_urgent ? '<li>🚨 Alertas urgentes</li>' : ''}
          ${form.notify_maintenance ? '<li>🔧 Actualizaciones de mantenimiento</li>' : ''}
          ${form.notify_events ? '<li>📅 Eventos del condominio</li>' : ''}
        </ul>
        <p>Puedes actualizar tus preferencias en cualquier momento.</p>
      `
    });
    setDone(true);
    setLoading(false);
    setTimeout(onSuccess, 1500);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-8">
        <CheckCircle className="w-14 h-14 text-green-500 mb-3" />
        <p className="text-xl font-bold text-slate-800">¡Suscripción registrada!</p>
        <p className="text-slate-500 text-sm mt-1">Se envió un email de confirmación.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Nueva Suscripción</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="border border-slate-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Nombre completo"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border border-slate-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Depto. (Ej: A-101)"
          value={form.department}
          onChange={e => setForm({ ...form, department: e.target.value })}
          required
        />
      </div>
      <input
        type="email"
        className="w-full border border-slate-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-blue-500"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        required
      />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700 mb-3">Preferencias de notificación</p>
        {PREFS.map(pref => (
          <label key={pref.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={form[pref.key]}
              onChange={e => setForm({ ...form, [pref.key]: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-sm text-slate-700">{pref.emoji} {pref.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
          {loading ? 'Guardando...' : 'Guardar Suscripción'}
        </Button>
      </div>
    </form>
  );
}