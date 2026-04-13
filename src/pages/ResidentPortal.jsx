import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Ticket, MessageSquare, ArrowLeft, Search, CheckCircle, Clock, AlertCircle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATUS_CONFIG = {
  pendiente:   { label: 'Pendiente',   color: 'bg-slate-100 text-slate-600', icon: Clock },
  en_progreso: { label: 'En progreso', color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
  completada:  { label: 'Completada',  color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const PRIORITY_COLORS = {
  baja: 'bg-slate-100 text-slate-500',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const CATEGORY_EMOJI = { sugerencia: '💡', queja: '📢', felicitacion: '🎉', reporte: '🔧', otro: '📝' };

function LoginForm({ onLogin }) {
  const [dept, setDept] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const results = await base44.entities.Resident.filter({ department: dept.trim().toUpperCase(), status: 'activo' });
    const match = results.find(r => r.name.toLowerCase().includes(name.trim().toLowerCase()));
    if (match) {
      onLogin(match);
    } else {
      setError('No se encontró un residente activo con ese departamento y nombre.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Portal del Residente</h1>
          <p className="text-white/50 text-sm mt-1">Consulta tus tickets y mensajes</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Número de Departamento</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500 uppercase"
                placeholder="Ej. A-101"
                value={dept}
                onChange={e => setDept(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Tu Nombre (o parte de él)</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Ej. María"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm mt-2"
            >
              {loading ? 'Buscando...' : 'Acceder'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to={createPageUrl('Kiosk')} className="text-xs text-slate-400 hover:text-blue-500 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Volver al Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ResidentDashboard({ resident, onLogout }) {
  const [activeTab, setActiveTab] = useState('tickets');

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['my-tasks', resident.department],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 100),
    select: (data) => data.filter(t =>
      t.department === resident.department ||
      t.assigned_to?.toLowerCase().includes(resident.name.toLowerCase())
    ),
  });

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['my-comments', resident.department],
    queryFn: () => base44.entities.Comment.filter({ department: resident.department }, '-created_date'),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{resident.name}</p>
              <p className="text-xs text-slate-400">Depto. {resident.department} · {resident.condominio_name || 'Sin condominio'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Kiosk')} className="flex items-center gap-2 h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Portal
            </Link>
            <button onClick={onLogout} className="h-9 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">Tickets</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{tasks.length}</p>
            <p className="text-xs text-slate-400 mt-1">{tasks.filter(t => t.status !== 'completada').length} activos</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">Mensajes</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{comments.length}</p>
            <p className="text-xs text-slate-400 mt-1">{comments.filter(c => c.status === 'respondido').length} respondidos</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 border border-slate-200 w-fit mb-5">
          {[
            { id: 'tickets', label: 'Mis Tickets', icon: Ticket },
            { id: 'mensajes', label: 'Mis Mensajes', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${active ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingTasks ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
                  <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No tienes tickets registrados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => {
                    const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.pendiente;
                    const StatusIcon = sc.icon;
                    return (
                      <div key={task.id} className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{task.area}{task.scheduled_date ? ` · ${task.scheduled_date}` : ''}</p>
                            {task.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.description}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {sc.label}
                            </span>
                            {task.priority && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'mensajes' && (
            <motion.div key="mensajes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingComments ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No tienes mensajes en el buzón.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-slate-700">{CATEGORY_EMOJI[c.category]} {c.category}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.status === 'respondido' ? 'bg-green-100 text-green-700' :
                          c.status === 'leido' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>{c.status}</span>
                      </div>
                      <p className="text-sm text-slate-600">{c.message}</p>
                      {c.admin_response && (
                        <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">✅ Respuesta del administrador:</p>
                          <p className="text-sm text-green-800">{c.admin_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ResidentPortal() {
  const [resident, setResident] = useState(null);

  if (!resident) return <LoginForm onLogin={setResident} />;
  return <ResidentDashboard resident={resident} onLogout={() => setResident(null)} />;
}