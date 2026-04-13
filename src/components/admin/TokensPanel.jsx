import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2, RefreshCw, Copy, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

function generateToken(len = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function TokensPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ condominio_id: '', condominio_name: '', token: generateToken(), is_active: true, notes: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [visible, setVisible] = useState({});
  const [copied, setCopied] = useState(null);

  const { data: condominios = [] } = useQuery({
    queryKey: ['condominios'],
    queryFn: () => base44.entities.Condominio.filter({ is_active: true }),
  });

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => base44.entities.CondominioToken.list('-created_date', 100),
  });

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.CondominioToken.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tokens'] }); resetForm(); }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CondominioToken.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tokens'] }); resetForm(); }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.CondominioToken.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tokens'] }),
  });

  const resetForm = () => {
    setForm({ condominio_id: '', condominio_name: '', token: generateToken(), is_active: true, notes: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (t) => {
    setForm({ ...t });
    setEditing(t.id);
    setShowForm(true);
  };

  const handleCondominioChange = (id) => {
    const c = condominios.find(c => c.id === id);
    setForm(f => ({ ...f, condominio_id: id, condominio_name: c?.name || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing, data: form });
    else createMut.mutate(form);
  };

  const copyToken = (id, token) => {
    navigator.clipboard.writeText(token);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tokens de Acceso</h2>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona las contraseñas de cada condominio</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" /> Nuevo Token
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">{editing ? 'Editar Token' : 'Nuevo Token'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Condominio *</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none focus:border-blue-500"
                value={form.condominio_id}
                onChange={e => handleCondominioChange(e.target.value)}
                required
              >
                <option value="">Selecciona un condominio...</option>
                {condominios.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Token / Contraseña *</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-4 h-11 text-sm font-mono focus:outline-none focus:border-blue-500"
                  value={form.token}
                  onChange={e => setForm(f => ({ ...f, token: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, token: generateToken() }))}
                  className="h-11 px-4 border border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Generar
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Estado</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none"
                value={form.is_active ? 'active' : 'inactive'}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}
              >
                <option value="active">✅ Activo</option>
                <option value="inactive">🔒 Revocado</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Notas</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none"
                placeholder="Motivo de cambio, fecha de expiración, etc."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-10">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10">
                {editing ? 'Guardar cambios' : 'Crear Token'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {tokens.map(t => (
            <div key={t.id} className={`bg-white rounded-2xl p-5 border flex items-center gap-4 ${t.is_active ? 'border-slate-100' : 'border-red-100 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{t.condominio_name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {t.is_active ? 'Activo' : 'Revocado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-slate-500">
                    {visible[t.id] ? t.token : '••••••••••••••••'}
                  </span>
                  <button onClick={() => setVisible(v => ({ ...v, [t.id]: !v[t.id] }))} className="text-slate-400 hover:text-slate-600">
                    {visible[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => copyToken(t.id, t.token)} className="text-slate-400 hover:text-blue-600">
                    {copied === t.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {t.notes && <p className="text-xs text-slate-400 mt-1">{t.notes}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(t)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMut.mutate(t.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {tokens.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay tokens creados aún.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}