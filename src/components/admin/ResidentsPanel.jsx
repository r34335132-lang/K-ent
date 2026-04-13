import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2, X, Check, User, Building2, Phone, Mail, ChevronDown, ChevronRight, Ticket, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROLE_LABELS = { propietario: 'Propietario', inquilino: 'Inquilino', familiar: 'Familiar', otro: 'Otro' };
const ROLE_COLORS = {
  propietario: 'bg-blue-100 text-blue-700',
  inquilino: 'bg-purple-100 text-purple-700',
  familiar: 'bg-amber-100 text-amber-700',
  otro: 'bg-slate-100 text-slate-600',
};
const STATUS_LABEL = { pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada' };
const CATEGORY_EMOJI = { sugerencia: '💡', queja: '📢', felicitacion: '🎉', reporte: '🔧', otro: '📝' };

const EMPTY = { name: '', email: '', phone: '', department: '', role: 'inquilino', status: 'activo', move_in_date: '', notes: '', condominio_id: '', condominio_name: '' };

function ResidentForm({ initial, condominios, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCondominio = (id) => {
    const c = condominios.find(c => c.id === id);
    setForm(f => ({ ...f, condominio_id: id, condominio_name: c?.name || '' }));
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
      <h3 className="font-bold text-slate-800 mb-4">{initial?.id ? 'Editar Residente' : 'Nuevo Residente'}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre completo *</label>
          <input className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. María López" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Departamento *</label>
          <input className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Ej. A-101" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Correo electrónico</label>
          <input type="email" className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Teléfono</label>
          <input className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="55 1234 5678" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Rol *</label>
          <select className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500 bg-white" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="propietario">Propietario</option>
            <option value="inquilino">Inquilino</option>
            <option value="familiar">Familiar</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Estado</label>
          <select className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500 bg-white" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Condominio</label>
          <select className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500 bg-white" value={form.condominio_id} onChange={e => handleCondominio(e.target.value)}>
            <option value="">Sin asignar</option>
            {condominios.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Fecha de ingreso</label>
          <input type="date" className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500" value={form.move_in_date} onChange={e => set('move_in_date', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Notas</label>
          <textarea className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Información adicional..." />
        </div>
      </div>
      <div className="flex gap-3 mt-4 justify-end">
        <Button variant="outline" onClick={onCancel} className="rounded-xl h-9 gap-2 text-sm"><X className="w-4 h-4" /> Cancelar</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name || !form.department} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9 gap-2 text-sm"><Check className="w-4 h-4" /> Guardar</Button>
      </div>
    </div>
  );
}

function ResidentDetail({ resident, tasks, comments, onClose }) {
  const myTasks = tasks.filter(t => t.department === resident.department || t.assigned_to?.toLowerCase().includes(resident.name.toLowerCase()));
  const myComments = comments.filter(c => c.department === resident.department && c.name?.toLowerCase() === resident.name?.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{resident.name}</h2>
                <p className="text-slate-500 text-sm">Depto. {resident.department} · {resident.condominio_name || 'Sin condominio'}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {resident.email && <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-4 h-4 text-slate-400" />{resident.email}</div>}
          {resident.phone && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-4 h-4 text-slate-400" />{resident.phone}</div>}
          {resident.move_in_date && <div className="flex items-center gap-2 text-sm text-slate-600"><Building2 className="w-4 h-4 text-slate-400" />Ingresó: {resident.move_in_date}</div>}
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2"><Ticket className="w-4 h-4 text-blue-500" /> Tickets de Mantenimiento ({myTasks.length})</h3>
          {myTasks.length === 0 ? <p className="text-slate-400 text-sm">Sin tickets registrados.</p> : (
            <div className="space-y-2">
              {myTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                  <p className="text-sm text-slate-700">{t.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.status === 'completada' ? 'bg-green-100 text-green-700' : t.status === 'en_progreso' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{STATUS_LABEL[t.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-500" /> Mensajes del Buzón ({myComments.length})</h3>
          {myComments.length === 0 ? <p className="text-slate-400 text-sm">Sin mensajes registrados.</p> : (
            <div className="space-y-2">
              {myComments.map(c => (
                <div key={c.id} className="bg-slate-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500">{CATEGORY_EMOJI[c.category]} {c.category}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === 'respondido' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.message}</p>
                  {c.admin_response && <p className="text-xs text-green-700 mt-1">✅ {c.admin_response}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResidentsPanel() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const { data: residents = [], isLoading } = useQuery({
    queryKey: ['residents'],
    queryFn: () => base44.entities.Resident.list('-created_date', 500),
  });

  const { data: condominios = [] } = useQuery({
    queryKey: ['condominios-residents'],
    queryFn: () => base44.entities.Condominio.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-residents'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 500),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments-residents'],
    queryFn: () => base44.entities.Comment.list('-created_date', 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Resident.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Resident.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resident.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents'] }),
  });

  const handleSave = (form) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = residents.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.department?.toLowerCase().includes(search.toLowerCase()) ||
    r.condominio_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by condominio
  const grouped = filtered.reduce((acc, r) => {
    const key = r.condominio_name || 'Sin condominio';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Residentes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{residents.length} residente(s) registrado(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500 w-56"
            placeholder="Buscar por nombre, depto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button onClick={() => { setShowForm(true); setEditing(null); }} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo Residente
          </Button>
        </div>
      </div>

      {(showForm && !editing) && (
        <ResidentForm condominios={condominios} onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <ResidentForm initial={editing} condominios={condominios} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">No hay residentes registrados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([condoName, condoResidents]) => (
            <div key={condoName}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-700">{condoName}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{condoResidents.length}</span>
              </div>
              <div className="space-y-2">
                {condoResidents.map(r => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center gap-4 hover:border-blue-200 transition cursor-pointer"
                    onClick={() => setSelected(r)}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[r.role]}`}>{ROLE_LABELS[r.role]}</span>
                        {r.status === 'inactivo' && <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Inactivo</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Depto. {r.department}{r.email ? ` · ${r.email}` : ''}{r.phone ? ` · ${r.phone}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mr-4 flex-shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditing(r); setShowForm(false); }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(r.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ResidentDetail
          resident={selected}
          tasks={tasks}
          comments={comments}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}