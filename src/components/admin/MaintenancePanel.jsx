import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2, Upload, ImageIcon, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EMPTY = { title: '', description: '', area: 'Áreas comunes', status: 'pendiente', priority: 'media', assigned_to: '', scheduled_date: '' };
const AREAS = ['Cisternas','Elevadores','Jardines','Estacionamiento','Áreas comunes','Fachada','Iluminación','Seguridad'];
const STATUS_COLORS = { pendiente: 'bg-yellow-100 text-yellow-700', en_progreso: 'bg-blue-100 text-blue-700', completada: 'bg-green-100 text-green-700' };
const PRIORITY_COLORS = { baja: 'bg-slate-100 text-slate-600', media: 'bg-yellow-100 text-yellow-700', alta: 'bg-orange-100 text-orange-700', urgente: 'bg-red-100 text-red-700' };

function EvidenceModal({ task, onClose, onSave }) {
  const [note, setNote] = useState(task.evidence_note || '');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(task.evidence_url || null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setUploading(true);
    let url = task.evidence_url;
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      url = res.file_url;
    }
    await base44.entities.MaintenanceTask.update(task.id, {
      evidence_url: url,
      evidence_note: note,
      status: 'completada',
      completion_date: new Date().toISOString().split('T')[0],
    });
    setUploading(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-500" /> Cargar Evidencia
        </h3>
        <p className="text-sm text-slate-500 mb-4">La imagen y nota se publicarán en la pantalla del elevador como aviso de trabajo completado.</p>

        <div
          className="border-2 border-dashed border-slate-200 rounded-2xl h-44 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition mb-4 overflow-hidden relative"
          onClick={() => document.getElementById('evidence-upload').click()}
        >
          {preview ? (
            <img src={preview} alt="Evidencia" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Toca para subir foto de evidencia</p>
            </>
          )}
          <input id="evidence-upload" type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none mb-4"
          rows={3}
          placeholder="Describe brevemente el trabajo realizado..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">Cancelar</Button>
          <Button onClick={handleSave} disabled={uploading || (!imageFile && !task.evidence_url)} className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl h-11">
            {uploading ? 'Subiendo...' : 'Publicar Evidencia'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [evidenceTask, setEvidenceTask] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['maintenance-admin'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceTask.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenance-admin'] }); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceTask.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenance-admin'] }); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MaintenanceTask.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance-admin'] }),
  });

  const resetForm = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const handleEdit = (task) => {
    setForm({ ...task });
    setEditing(task.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing, data: form });
    else createMutation.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mantenimiento</h2>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona tareas y reportes del condominio</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600 rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" /> Nueva Tarea
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">{editing ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Título</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-orange-400" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la tarea" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Área</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Prioridad</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="urgente">🔴 Urgente</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Estado</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm bg-white focus:outline-none" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Asignado a</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Nombre del responsable" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Fecha programada</label>
                <input type="date" className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Descripción</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe la tarea..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-10">Cancelar</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 rounded-xl h-10">
                {editing ? 'Guardar cambios' : 'Crear tarea'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                    <span className="text-xs text-slate-400">{task.area}</span>
                    {task.reported_via_kiosk && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        <Ticket className="w-3 h-3" /> Kiosk
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 truncate">{task.title}</p>
                  {task.assigned_to && <p className="text-sm text-slate-400">Asignado: {task.assigned_to}</p>}
                  {task.reported_via_kiosk && task.reported_date && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Reportado: {format(new Date(task.reported_date), "dd/MM/yyyy HH:mm", { locale: es })}
                      {task.completion_date && ` · Atendido: ${format(new Date(task.completion_date), "dd/MM/yyyy", { locale: es })}`}
                    </p>
                  )}
                  {task.evidence_note && (
                    <p className="text-xs text-green-700 mt-1 italic">✓ {task.evidence_note}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {task.evidence_url && (
                    <img src={task.evidence_url} alt="evidencia" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  )}
                  <button
                    onClick={() => setEvidenceTask(task)}
                    className="p-2 hover:bg-orange-50 rounded-xl text-slate-400 hover:text-orange-500 transition"
                    title="Cargar evidencia"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(task)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(task.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay tareas registradas.</p>
            </div>
          )}
        </div>
      )}

      {evidenceTask && (
        <EvidenceModal
          task={evidenceTask}
          onClose={() => setEvidenceTask(null)}
          onSave={() => qc.invalidateQueries({ queryKey: ['maintenance-admin'] })}
        />
      )}
    </div>
  );
}