import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, Plus
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday
} from 'date-fns';
import { es } from 'date-fns/locale';

const TYPE_CONFIG = {
  mantenimiento: { label: '🔧 Mantenimiento', color: 'bg-orange-500', dot: 'bg-orange-400', light: 'bg-orange-50 border-orange-200 text-orange-800' },
  reunion:       { label: '👥 Reunión',        color: 'bg-blue-600',   dot: 'bg-blue-400',   light: 'bg-blue-50 border-blue-200 text-blue-800' },
  evento:        { label: '🎉 Evento',          color: 'bg-purple-600', dot: 'bg-purple-400', light: 'bg-purple-50 border-purple-200 text-purple-800' },
  aviso:         { label: '📢 Aviso',           color: 'bg-amber-500',  dot: 'bg-amber-400',  light: 'bg-amber-50 border-amber-200 text-amber-800' },
  otro:          { label: '📌 Otro',            color: 'bg-slate-500',  dot: 'bg-slate-400',  light: 'bg-slate-50 border-slate-200 text-slate-700' },
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarPanel({ isAdmin = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', type: 'evento', location: '' });
  const [saving, setSaving] = useState(false);

  const { data: events = [], refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ is_active: true }, 'date'),
  });

  // Also pull maintenance tasks with scheduled_date
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-calendar'],
    queryFn: () => base44.entities.MaintenanceTask.list('scheduled_date', 100),
  });

  // Merge events + tasks into a unified list
  const allItems = useMemo(() => {
    const evts = events.map(e => ({ ...e, _source: 'event' }));
    const tks = tasks
      .filter(t => t.scheduled_date && t.status !== 'completada')
      .map(t => ({
        id: 'task-' + t.id,
        title: t.title,
        description: t.description,
        date: t.scheduled_date,
        time: '',
        type: 'mantenimiento',
        location: t.area,
        _source: 'task',
      }));
    return [...evts, ...tks];
  }, [events, tasks]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    // Pad start
    const startPad = start.getDay();
    return { allDays, startPad };
  }, [currentMonth]);

  const itemsOnDay = (day) =>
    allItems.filter(e => e.date && isSameDay(parseISO(e.date), day));

  const selectedItems = itemsOnDay(selectedDay);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.create({ ...form, is_active: true });
    await refetch();
    setShowForm(false);
    setForm({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', type: 'evento', location: '' });
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario de Eventos</h2>
          <p className="text-slate-500 text-sm mt-0.5">Tareas programadas y eventos del condominio</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        )}
      </div>

      {/* Add Event Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-800 mb-4">Nuevo Evento</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="col-span-2 border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Título del evento *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <input
                type="date"
                className="border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
              <input
                type="time"
                className="border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                placeholder="Hora (opcional)"
              />
              <select
                className="border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500 bg-white"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <input
                className="border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Lugar (opcional)"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
              <textarea
                className="col-span-2 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Descripción (opcional)"
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.date || saving}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition"
              >
                {saving ? 'Guardando...' : 'Guardar Evento'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-800 text-lg capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array(days.startPad).fill(null).map((_, i) => <div key={'pad-' + i} />)}
            {days.allDays.map(day => {
              const dayItems = itemsOnDay(day);
              const isSelected = isSameDay(day, selectedDay);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center py-2 rounded-xl transition text-sm font-medium
                    ${isSelected ? 'bg-blue-600 text-white shadow-md' : today ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}
                  `}
                >
                  {day.getDate()}
                  {dayItems.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayItems.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : TYPE_CONFIG[item.type]?.dot || 'bg-slate-400'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-50">
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                {v.label}
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-bold text-slate-800 capitalize">
                {format(selectedDay, "EEEE", { locale: es })}
              </p>
              <p className="text-slate-400 text-xs capitalize">
                {format(selectedDay, "d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-96">
            {selectedItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Sin eventos este día
              </div>
            ) : (
              selectedItems.map(item => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.otro;
                return (
                  <div key={item.id} className={`rounded-xl border p-3 ${cfg.light}`}>
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${cfg.color} text-white`}>
                      {cfg.label}
                    </div>
                    <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                    {item.description && <p className="text-xs text-slate-600 mt-1">{item.description}</p>}
                    <div className="flex flex-col gap-1 mt-2">
                      {item.time && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" /> {item.time}
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}