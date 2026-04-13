import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ALL_TABS = [
  { id: 'notices', label: 'Avisos' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'expenses', label: 'Gastos' },
  { id: 'comments', label: 'Buzón' },
  { id: 'condominios', label: 'Condominios' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'calendar', label: 'Calendario' },
  { id: 'residents', label: 'Residentes' },
  { id: 'resumen', label: 'Resumen' },
];

export default function TabPermissionsModal({ user, onClose }) {
  const [selected, setSelected] = useState(user.allowed_tabs || ALL_TABS.map(t => t.id));
  const qc = useQueryClient();

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
  );

  const save = async () => {
    await base44.auth.updateMe({ allowed_tabs: selected });
    // If editing another user (admin_general editing admin_residente)
    // we update via entities
    await base44.entities.User.update(user.id, { allowed_tabs: selected });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Permisos de Pestañas</h2>
              <p className="text-xs text-slate-500">{user.full_name || user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">Selecciona las secciones que este usuario puede ver:</p>

        <div className="space-y-2 mb-6">
          {ALL_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => toggle(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition text-sm font-medium ${
                selected.includes(tab.id)
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              {tab.label}
              {selected.includes(tab.id) && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancelar</Button>
          <Button onClick={save} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">Guardar</Button>
        </div>
      </div>
    </div>
  );
}