import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Trash2, Settings } from 'lucide-react';

const PREFS = [
  { key: 'notify_notices', label: 'Comunicados', emoji: '📢' },
  { key: 'notify_urgent', label: 'Urgentes', emoji: '🚨' },
  { key: 'notify_maintenance', label: 'Mantenimiento', emoji: '🔧' },
  { key: 'notify_events', label: 'Eventos', emoji: '📅' },
];

export default function SubscriptionCard({ subscription, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState({
    notify_notices: subscription.notify_notices,
    notify_urgent: subscription.notify_urgent,
    notify_maintenance: subscription.notify_maintenance,
    notify_events: subscription.notify_events,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.NotificationSubscription.update(subscription.id, prefs);
    setSaving(false);
    setEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    await base44.entities.NotificationSubscription.update(subscription.id, { is_active: false });
    onUpdate();
  };

  const activePrefCount = PREFS.filter(p => subscription[p.key]).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-800">{subscription.name}</p>
          <p className="text-slate-400 text-xs mt-0.5">Depto. {subscription.department}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-xs">{subscription.email}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setEditing(!editing)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="flex flex-wrap gap-1.5">
          {PREFS.map(pref => (
            <span
              key={pref.key}
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${subscription[pref.key] ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 line-through'}`}
            >
              {pref.emoji} {pref.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {PREFS.map(pref => (
            <label key={pref.key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={prefs[pref.key]}
                onChange={e => setPrefs({ ...prefs, [pref.key]: e.target.checked })}
                className="accent-blue-600"
              />
              <span className="text-slate-700">{pref.emoji} {pref.label}</span>
            </label>
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={() => setEditing(false)} className="flex-1 h-8 text-xs bg-slate-100 rounded-lg text-slate-600 font-medium">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}