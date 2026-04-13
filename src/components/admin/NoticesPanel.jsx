import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2, ImagePlus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EMPTY = { title: '', content: '', type: 'reglamento', image_url: '', start_date: '', end_date: '', is_active: true, condominio_id: '', condominio_name: '', is_global: false };

const TYPES = [
  { value: 'reglamento',    label: '⚖️ Reglamento y Convivencia' },
  { value: 'legal',         label: '🎓 Sabías que... (Legal)' },
  { value: 'curiosidades',  label: '💡 ¿Sabías esto? (Curiosidades)' },
  { value: 'agua_recursos', label: '💧 Gestión de Agua y Recursos' },
  { value: 'seguridad',     label: '🛡️ Seguridad y Prevención' },
  { value: 'mantenimiento', label: '🔧 Mantenimiento y Obra' },
  { value: 'transparencia', label: '📊 Transparencia K\'eni' },
];

export default function NoticesPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: condominios = [] } = useQuery({
    queryKey: ['condominios'],
    queryFn: () => base44.entities.Condominio.filter({ is_active: true }),
  });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices-admin'],
    queryFn: () => base44.entities.Notice.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Notice.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices-admin'] }); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notice.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices-admin'] }); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notice.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notices-admin'] }),
  });

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const handleEdit = (notice) => {
    setForm({ ...notice });
    setEditing(notice.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleCondominioChange = (id) => {
    if (id === '__global__') {
      setForm(f => ({ ...f, condominio_id: '', condominio_name: '', is_global: true }));
    } else {
      const c = condominios.find(c => c.id === id);
      setForm(f => ({ ...f, condominio_id: id, condominio_name: c?.name || '', is_global: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.is_global && !form.condominio_id) return;
    if (editing) updateMutation.mutate({ id: editing, data: form });
    else createMutation.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Avisos y Comunicados</h2>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona el contenido de la pantalla del elevador</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" /> Nuevo Aviso
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">{editing ? 'Editar Aviso' : 'Nuevo Aviso'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Condominio selector */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Condominio destino *</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none focus:border-blue-500"
                  value={form.is_global ? '__global__' : form.condominio_id}
                  onChange={e => handleCondominioChange(e.target.value)}
                  required
                >
                  <option value="">Selecciona un condominio...</option>
                  <option value="__global__">🌐 Publicar en toda la red</option>
                  {condominios.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {form.is_global && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Este aviso aparecerá en todos los condominios simultáneamente
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Título</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título del aviso" required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Tipo</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Estado</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none" value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
                  <option value="active">✅ Activo</option>
                  <option value="inactive">⏸ Inactivo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Fecha inicio</label>
                <input type="date" className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Fecha fin</label>
                <input type="date" className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Contenido</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Descripción del aviso..." required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Imagen</label>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 h-11 px-4 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition">
                    <ImagePlus className="w-4 h-4" />
                    {uploading ? 'Subiendo...' : 'Subir imagen'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="h-11 w-20 object-cover rounded-xl border border-slate-200" />
                  ) : (
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none"
                      value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                      placeholder="O pega una URL de imagen"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-10">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10">
                {editing ? 'Guardar cambios' : 'Publicar aviso'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {notices.map(notice => (
            <div key={notice.id} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
              {notice.image_url && (
                <img src={notice.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{TYPES.find(t => t.value === notice.type)?.label || notice.type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${notice.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {notice.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {notice.is_global ? (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">🌐 Red global</span>
                  ) : notice.condominio_name ? (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">🏢 {notice.condominio_name}</span>
                  ) : null}
                </div>
                <p className="font-semibold text-slate-800 truncate">{notice.title}</p>
                <p className="text-sm text-slate-400 truncate">{notice.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(notice)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMutation.mutate(notice.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {notices.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay avisos. ¡Crea el primero!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}