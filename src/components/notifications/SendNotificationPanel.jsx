import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, CheckCircle, Bell, AlertTriangle, Wrench, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const TYPES = [
  { value: 'notices', label: 'Comunicado General', icon: Bell, color: 'blue', prefKey: 'notify_notices' },
  { value: 'urgent', label: 'Alerta Urgente', icon: AlertTriangle, color: 'red', prefKey: 'notify_urgent' },
  { value: 'maintenance', label: 'Actualización de Mantenimiento', icon: Wrench, color: 'orange', prefKey: 'notify_maintenance' },
  { value: 'events', label: 'Evento', icon: Calendar, color: 'green', prefKey: 'notify_events' },
];

const colorMap = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  green: 'border-green-200 bg-green-50 text-green-700',
};

export default function SendNotificationPanel({ subscriptions }) {
  const [type, setType] = useState('notices');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { sent, skipped }

  const selectedType = TYPES.find(t => t.value === type);
  const recipients = subscriptions.filter(s => s[selectedType.prefKey]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    let sent = 0;
    for (const sub of recipients) {
      await base44.integrations.Core.SendEmail({
        to: sub.email,
        subject: `${selectedType.label}: ${subject}`,
        body: `
          <h2>${subject}</h2>
          <p><strong>Residente:</strong> ${sub.name} — Depto. ${sub.department}</p>
          <hr/>
          <div style="white-space:pre-wrap">${body}</div>
          <br/>
          <p style="color:#9ca3af;font-size:12px">Portal Condominal — Notificación automática</p>
        `
      });
      sent++;
    }

    setResult({ sent, skipped: subscriptions.length - sent });
    setSending(false);
    setSubject('');
    setBody('');
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Form */}
      <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5">Enviar Notificación</h3>

        {result && (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl mb-5 border border-green-100">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">
              Enviado a <strong>{result.sent}</strong> residentes. ({result.skipped} sin esta preferencia)
            </p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition ${type === t.value ? colorMap[t.color] + ' border-current' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <input
            className="w-full border border-slate-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-blue-500"
            placeholder="Asunto del mensaje"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Cuerpo del mensaje..."
            rows={5}
            value={body}
            onChange={e => setBody(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={sending || recipients.length === 0}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : `Enviar a ${recipients.length} residente${recipients.length !== 1 ? 's' : ''}`}
          </Button>
        </form>
      </div>

      {/* Recipients preview */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Destinatarios ({recipients.length})</p>
        {recipients.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-6">Ningún residente suscrito a este tipo</p>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto">
            {recipients.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  {r.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.department}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}