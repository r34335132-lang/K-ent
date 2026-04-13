import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Bell, Wrench, MessageSquare, Ticket, CheckCircle, ChevronUp, ChevronDown, DollarSign, Upload, ImageIcon, TvMinimalPlay, Home } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeConfig = {
  reglamento:    { label: '⚖️ Reglamento y Convivencia', color: 'bg-amber-700' },
  legal:         { label: '🎓 Sabías que... (Legal)',      color: 'bg-indigo-700' },
  curiosidades:  { label: '💡 Curiosidades',               color: 'bg-yellow-500', story: true },
  agua_recursos: { label: '💧 Agua y Recursos',            color: 'bg-cyan-600' },
  seguridad:     { label: '🛡️ Seguridad y Prevención',     color: 'bg-red-700', icon: Shield },
  mantenimiento: { label: '🔧 Mantenimiento y Obra',       color: 'bg-orange-500', icon: Wrench },
  transparencia: { label: "📊 Transparencia K'eni",        color: 'bg-blue-700' },
};

const typeImages = {
  reglamento:    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=85',
  legal:         'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=85',
  curiosidades:  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85',
  agua_recursos: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=85',
  seguridad:     'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=85',
  mantenimiento: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85',
  transparencia: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=85',
};

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right">
      <p className="text-white text-4xl font-light tabular-nums tracking-tight">
        {format(time, 'HH:mm')}
      </p>
      <p className="text-white/60 text-sm capitalize">
        {format(time, "EEEE d 'de' MMMM", { locale: es })}
      </p>
    </div>
  );
}

// Sugerencia modal
function SuggestionModal({ onClose }) {
  const [form, setForm] = useState({ name: '', department: '', message: '', category: 'sugerencia' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Comment.create(form);
    setSent(true);
    setLoading(false);
    setTimeout(onClose, 2500);
  };

  return (
    <BottomModal onClose={onClose}>
      {sent ? (
        <div className="flex flex-col items-center py-6">
          <CheckCircle className="w-14 h-14 text-green-500 mb-3" />
          <p className="text-xl font-bold text-slate-800">¡Gracias por tu sugerencia!</p>
          <p className="text-slate-500 text-sm mt-1">Tu mensaje fue enviado al administrador.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Dejar una Sugerencia
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:border-blue-500"
              placeholder="Tu nombre"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:border-blue-500"
              placeholder="Depto. (Ej: A-101)"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              required
            />
          </div>
          <select
            className="w-full border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:border-blue-500 bg-white"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="sugerencia">💡 Sugerencia</option>
            <option value="queja">📢 Queja</option>
            <option value="felicitacion">🎉 Felicitación</option>
            <option value="reporte">🔧 Reporte de Falla</option>
            <option value="otro">📝 Otro</option>
          </select>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Escribe tu mensaje..."
            rows={3}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-600 font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      )}
    </BottomModal>
  );
}

// Ticket modal
function TicketModal({ onClose }) {
  const [form, setForm] = useState({ title: '', area: 'Áreas comunes', description: '', priority: 'media' });
  const [step, setStep] = useState('form'); // 'form' | 'sent' | 'evidence'
  const [loading, setLoading] = useState(false);
  const [createdTask, setCreatedTask] = useState(null);
  const [reportedAt, setReportedAt] = useState(null);
  // Evidence upload state
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [evidenceSent, setEvidenceSent] = useState(false);
  const autoCloseRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const now = new Date().toISOString();
    const task = await base44.entities.MaintenanceTask.create({
      ...form,
      status: 'pendiente',
      reported_via_kiosk: true,
      reported_date: now,
    });
    setCreatedTask(task);
    setReportedAt(now);
    setLoading(false);
    setStep('sent');
    // auto-close after 12s if user doesn't interact
    autoCloseRef.current = setTimeout(onClose, 12000);
  };

  const goToEvidence = () => {
    clearTimeout(autoCloseRef.current);
    setStep('evidence');
  };

  const handleEvidenceFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEvidenceFile(file);
    setEvidencePreview(URL.createObjectURL(file));
  };

  const handleUploadEvidence = async () => {
    if (!evidenceFile) return;
    setUploading(true);
    const res = await base44.integrations.Core.UploadFile({ file: evidenceFile });
    await base44.entities.MaintenanceTask.update(createdTask.id, {
      evidence_url: res.file_url,
      evidence_note: evidenceNote || 'Evidencia cargada desde kiosk',
      status: 'completada',
      completion_date: new Date().toISOString().split('T')[0],
    });
    setUploading(false);
    setEvidenceSent(true);
    setTimeout(onClose, 3000);
  };

  return (
    <BottomModal onClose={onClose}>
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-orange-500" /> Reportar Falla
          </h2>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:border-orange-400"
            placeholder="Título del problema"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:border-orange-400 bg-white"
              value={form.area}
              onChange={e => setForm({ ...form, area: e.target.value })}
            >
              {['Cisternas','Elevadores','Jardines','Estacionamiento','Áreas comunes','Fachada','Iluminación','Seguridad'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              className="border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:border-orange-400 bg-white"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🟠 Alta</option>
              <option value="urgente">🔴 Urgente</option>
            </select>
          </div>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 resize-none"
            placeholder="Describe el problema..."
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-600 font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold">
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      )}

      {step === 'sent' && (
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mb-3" />
          <p className="text-xl font-bold text-slate-800">¡Reporte recibido!</p>
          {reportedAt && (
            <div className="mt-2 px-4 py-2 bg-slate-50 rounded-xl text-sm text-slate-500 border border-slate-100">
              📥 Recibido: <span className="font-semibold text-slate-700">{format(new Date(reportedAt), "dd/MM/yyyy HH:mm", { locale: es })}</span>
            </div>
          )}
          <p className="text-slate-500 text-sm mt-3 max-w-xs">
            ¿Ya se realizó el trabajo? Puedes cargar la evidencia fotográfica ahora mismo y se publicará en esta pantalla.
          </p>
          <div className="flex gap-3 mt-5 w-full">
            <button onClick={onClose} className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-600 font-semibold text-sm">
              Cerrar
            </button>
            <button
              onClick={goToEvidence}
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Cargar Evidencia
            </button>
          </div>
        </div>
      )}

      {step === 'evidence' && (
        <div className="space-y-4">
          {evidenceSent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mb-3" />
              <p className="text-xl font-bold text-slate-800">¡Evidencia publicada!</p>
              <p className="text-slate-500 text-sm mt-1">La foto aparecerá en la pantalla como "Reporte Atendido".</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Evidencia del trabajo realizado</h2>
              </div>

              {/* Timeline summary */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-600 border border-slate-100">
                <div>📥 <span className="font-semibold">Recibido:</span> {reportedAt ? format(new Date(reportedAt), "dd/MM/yyyy HH:mm", { locale: es }) : '—'}</div>
                <div className="text-slate-300">→</div>
                <div>🔧 <span className="font-semibold">Área:</span> {createdTask?.area}</div>
                <div className="text-slate-300">→</div>
                <div>✅ <span className="font-semibold">Atendido:</span> {format(new Date(), "dd/MM/yyyy", { locale: es })}</div>
              </div>

              {/* Image upload */}
              <div
                className="border-2 border-dashed border-slate-200 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition overflow-hidden"
                onClick={() => document.getElementById('kiosk-evidence-upload').click()}
              >
                {evidencePreview ? (
                  <img src={evidencePreview} alt="Evidencia" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">Toca para subir foto de evidencia</p>
                  </>
                )}
                <input id="kiosk-evidence-upload" type="file" accept="image/*" className="hidden" onChange={handleEvidenceFile} />
              </div>

              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                rows={2}
                placeholder="Describe brevemente el trabajo realizado..."
                value={evidenceNote}
                onChange={e => setEvidenceNote(e.target.value)}
              />

              <div className="flex gap-3">
                <button onClick={() => setStep('sent')} className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-600 font-semibold text-sm">
                  Atrás
                </button>
                <button
                  onClick={handleUploadEvidence}
                  disabled={uploading || !evidenceFile}
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {uploading ? 'Publicando...' : 'Publicar en Pantalla'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </BottomModal>
  );
}

// Reusable bottom sheet modal
function BottomModal({ onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="relative w-full bg-white rounded-t-3xl p-7"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const SLIDE_DURATION = 7000;

export default function ElevatorScreen() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modal, setModal] = useState(null); // null | 'detail' | 'suggestion' | 'ticket'
  const [paused, setPaused] = useState(false);
  const [dragDir, setDragDir] = useState(1); // 1 down→up (next), -1 up→down (prev)
  const timerRef = useRef(null);

  const { data: rawNotices = [] } = useQuery({
    queryKey: ['notices-elevator'],
    queryFn: () => base44.entities.Notice.filter({ is_active: true }, '-created_date'),
    refetchInterval: 60000,
  });

  const { data: completedTasks = [] } = useQuery({
    queryKey: ['completed-tasks-elevator'],
    queryFn: () => base44.entities.MaintenanceTask.filter({ status: 'completada' }, '-updated_date', 20),
    refetchInterval: 60000,
  });

  // Merge: tasks with evidence become slides
  const taskSlides = completedTasks
    .filter(t => t.evidence_url)
    .map(t => ({
      id: `task-${t.id}`,
      _isTask: true,
      _task: t,
      title: t.title,
      content: t.evidence_note || `Trabajo realizado en: ${t.area}`,
      type: 'mantenimiento',
      image_url: t.evidence_url,
      reported_date: t.reported_date,
      completion_date: t.completion_date,
    }));

  const notices = [...rawNotices, ...taskSlides];

  useEffect(() => {
    if (notices.length <= 1 || paused) return;
    timerRef.current = setTimeout(() => {
      setDragDir(1);
      setCurrentIndex(prev => (prev + 1) % notices.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, notices.length, paused]);

  const goNext = () => {
    setDragDir(1);
    setCurrentIndex(prev => (prev + 1) % notices.length);
  };

  const goPrev = () => {
    setDragDir(-1);
    setCurrentIndex(prev => (prev - 1 + notices.length) % notices.length);
  };

  const openModal = (type, e) => {
    e.stopPropagation();
    setPaused(true);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setPaused(false);
  };

  const handleTap = () => {
    if (modal) return;
    setPaused(true);
    setModal('detail');
  };

  if (notices.length === 0) {
    return (
      <div className="h-screen w-full bg-slate-900 flex items-center justify-center">
        <p className="text-white/40 text-xl">Cargando contenido...</p>
      </div>
    );
  }

  const notice = notices[currentIndex];
  const config = typeConfig[notice?.type] || typeConfig.reglamento;
  const Icon = config.icon || Bell;
  const image = notice?.image_url || typeImages[notice?.type] || typeImages.reglamento;

  return (
    <div className="relative h-screen w-full overflow-hidden select-none bg-black flex flex-col items-center" style={{ maxWidth: '100vw' }}>
      {/* Background Slide with vertical scroll animation */}
      <AnimatePresence mode="wait" custom={dragDir}>
        <motion.div
          key={currentIndex}
          custom={dragDir}
          initial={{ y: dragDir > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: dragDir > 0 ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.y < -60) goNext();
            else if (info.offset.y > 60) goPrev();
          }}
          onClick={handleTap}
          style={{ cursor: 'pointer' }}
        >
          <img src={image} alt={notice.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
        </motion.div>
      </AnimatePresence>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-6 flex items-start justify-between z-10" style={{ maxWidth: '100vw' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">PC</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Portal</p>
            <p className="text-white/50 text-xs">Condominal</p>
          </div>

        </div>
        <Clock />
      </div>

      {/* Vertical dot indicators */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {notices.map((_, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setCurrentIndex(i); }}
            className={`rounded-full transition-all ${i === currentIndex ? 'bg-white h-6 w-2' : 'bg-white/40 h-2 w-2'}`}
          />
        ))}
      </div>

      {/* Nav arrows vertical */}
      {notices.length > 1 && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          <button
            onClick={e => { e.stopPropagation(); goPrev(); }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center"
          >
            <ChevronUp className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); goNext(); }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* BOTTOM CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 px-4 pb-6 z-10" style={{ maxWidth: '100vw' }}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-semibold ${config.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {config.label}
            </div>
            {notice._isTask && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
                <Ticket className="w-3.5 h-3.5" />
                Reporte Atendido
              </div>
            )}
          </div>
          <h2 className="text-white text-3xl font-bold leading-tight mb-2 drop-shadow-lg">
            {notice.title}
          </h2>
          {notice._isTask && (notice.reported_date || notice.completion_date) && (
            <div className="flex gap-3 mb-2 text-white/60 text-xs">
              {notice.reported_date && <span>📥 Recibido: {format(new Date(notice.reported_date), "dd/MM/yyyy HH:mm", { locale: es })}</span>}
              {notice.completion_date && <span>✅ Atendido: {format(new Date(notice.completion_date), "dd/MM/yyyy", { locale: es })}</span>}
            </div>
          )}
          <p className="text-white/75 text-base line-clamp-2 leading-relaxed mb-5">
            {notice.content?.slice(0, 65)}{notice.content?.length > 65 ? '...' : ''}
          </p>

          {/* Action Buttons - 2-column grid */}
          <div className="grid grid-cols-2 gap-2 w-full" style={{ maxWidth: '100vw' }}>
            <button
              onClick={e => openModal('suggestion', e)}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-lg w-full"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Sugerencia
            </button>
            <button
              onClick={e => openModal('ticket', e)}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition shadow-lg w-full"
            >
              <Ticket className="w-3.5 h-3.5" />
              Reportar Falla
            </button>
            <button
              onClick={e => { e.stopPropagation(); navigate(createPageUrl('Kiosk') + '?tab=finance'); }}
              className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-lg w-full"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Finanzas
            </button>
          </div>

          {/* Swipe hint */}
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs mt-4">
            Desliza ↑↓ para navegar · Toca para ver detalles
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'detail' && (
          <BottomModal onClose={closeModal}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-4 ${config.color}`}>
              <Icon className="w-4 h-4" />
              {config.label}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{notice.title}</h2>
            <p className="text-slate-600 text-lg leading-relaxed">{notice.content}</p>
            <button onClick={closeModal} className="mt-6 w-full h-14 bg-slate-100 rounded-2xl text-slate-600 font-semibold text-lg flex items-center justify-center gap-2">
              <X className="w-5 h-5" /> Cerrar
            </button>
          </BottomModal>
        )}
        {modal === 'suggestion' && <SuggestionModal onClose={closeModal} />}
        {modal === 'ticket' && <TicketModal onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}