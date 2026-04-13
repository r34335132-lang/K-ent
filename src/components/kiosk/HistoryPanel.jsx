import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Wrench, ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react';
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const NOTICE_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'reglamento', label: '⚖️ Reglamento' },
  { value: 'legal', label: '🎓 Legal' },
  { value: 'curiosidades', label: '💡 Curiosidades' },
  { value: 'agua_recursos', label: '💧 Agua y Recursos' },
  { value: 'seguridad', label: '🛡️ Seguridad' },
  { value: 'mantenimiento', label: '🔧 Mantenimiento' },
  { value: 'transparencia', label: '📊 Transparencia' },
];

const TASK_STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: '🟡 Pendiente' },
  { value: 'en_progreso', label: '🔵 En progreso' },
  { value: 'completada', label: '🟢 Completada' },
];

const STATUS_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  en_progreso: 'bg-blue-100 text-blue-700',
  completada: 'bg-green-100 text-green-700',
};

const PRIORITY_COLORS = {
  baja: 'bg-slate-100 text-slate-600',
  media: 'bg-amber-100 text-amber-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

function NoticeCard({ notice }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start justify-between p-5 text-left gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {NOTICE_TYPES.find(t => t.value === notice.type)?.label || notice.type}
            </span>
            <span className="text-xs text-slate-400">
              {notice.created_date ? format(new Date(notice.created_date), "dd 'de' MMM yyyy", { locale: es }) : '—'}
            </span>
            {!notice.is_active && (
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Expirado</span>
            )}
          </div>
          <p className="font-semibold text-slate-800 text-sm">{notice.title}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-slate-600 border-t border-slate-50 pt-3">
              {notice.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({ task }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
              {task.status?.replace('_', ' ')}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-xs text-slate-400">{task.area}</span>
          </div>
          <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
          {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
        </div>
        <div className="text-right text-xs text-slate-400 flex-shrink-0">
          {task.scheduled_date && (
            <p>📅 {format(parseISO(task.scheduled_date), "dd/MM/yy")}</p>
          )}
          {task.assigned_to && (
            <p className="mt-1">👤 {task.assigned_to}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPanel() {
  const [activeSection, setActiveSection] = useState('notices');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: notices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ['all-notices'],
    queryFn: () => base44.entities.Notice.list('-created_date', 100),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 100),
  });

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      if (typeFilter && n.type !== typeFilter) return false;
      if (dateFrom && n.created_date && isBefore(new Date(n.created_date), startOfDay(parseISO(dateFrom)))) return false;
      if (dateTo && n.created_date && isAfter(new Date(n.created_date), endOfDay(parseISO(dateTo)))) return false;
      return true;
    });
  }, [notices, typeFilter, dateFrom, dateTo]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (dateFrom && t.created_date && isBefore(new Date(t.created_date), startOfDay(parseISO(dateFrom)))) return false;
      if (dateTo && t.created_date && isAfter(new Date(t.created_date), endOfDay(parseISO(dateTo)))) return false;
      return true;
    });
  }, [tasks, statusFilter, dateFrom, dateTo]);

  const isLoading = activeSection === 'notices' ? loadingNotices : loadingTasks;
  const items = activeSection === 'notices' ? filteredNotices : filteredTasks;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Historial</h2>
        <p className="text-slate-500 text-sm mt-0.5">Consulta avisos pasados y el estado de las tareas de mantenimiento</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-5 w-fit">
        <button
          onClick={() => setActiveSection('notices')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${activeSection === 'notices' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Bell className="w-4 h-4" /> Avisos
        </button>
        <button
          onClick={() => setActiveSection('tasks')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${activeSection === 'tasks' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Wrench className="w-4 h-4" /> Tareas de Mantenimiento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 bg-white border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Filter className="w-4 h-4" /> Filtros:
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        {activeSection === 'notices' ? (
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            {NOTICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        ) : (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
        {(dateFrom || dateTo || typeFilter || statusFilter) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setTypeFilter(''); setStatusFilter(''); }}
            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400">No hay registros con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium">{items.length} registro(s) encontrado(s)</p>
          {activeSection === 'notices'
            ? filteredNotices.map(n => <NoticeCard key={n.id} notice={n} />)
            : filteredTasks.map(t => <TaskCard key={t.id} task={t} />)
          }
        </div>
      )}
    </div>
  );
}