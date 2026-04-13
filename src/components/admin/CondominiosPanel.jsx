import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EMPTY = { name: '', address: '', is_active: true };

export default function CondominiosPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: condominios = [], isLoading } = useQuery({
    queryKey: ['condominios'],
    queryFn: () => base44.entities.Condominio.list('-created_date', 100),
  });

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Condominio.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['condominios'] }); resetForm(); }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Condominio.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['condominios'] }); resetForm(); }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Condominio.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condominios'] }),
  });

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const handleEdit = (c) => { setForm({ ...c }); setEditing(c.id); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing, data: form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Condominios</h2>
          <p className="text-slate-500 text-sm mt-0.5">Administra los inmuebles de la red</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" /> Nuevo Condominio
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">{editing ? 'Editar Condominio' : 'Nuevo Condominio'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Nombre *</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Torre K'eni Norte" required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Dirección</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Calle, número, colonia..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Estado</label>
              <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none"
                value={form.is_active ? 'active' : 'inactive'}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
                <option value="active">✅ Activo</option>
                <option value="inactive">⏸ Inactivo</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-10">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10">
                {editing ? 'Guardar cambios' : 'Crear Condominio'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {condominios.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{c.name}</p>
                {c.address && <p className="text-sm text-slate-400 truncate">{c.address}</p>}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {c.is_active ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(c)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMut.mutate(c.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {condominios.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay condominios registrados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}