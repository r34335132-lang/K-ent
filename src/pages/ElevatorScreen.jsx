import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Bell, Wrench, MessageSquare, Ticket, CheckCircle, 
  ChevronUp, ChevronDown, DollarSign, Upload, Image as ImageIcon, 
  Scale, BookOpen, Lightbulb, Droplet, ShieldCheck, PenTool, PieChart
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeConfig = {
  reglamento:    { label: 'Reglamento', icon: Scale,       bg: 'bg-orange-500/20', text: 'text-orange-400' },
  legal:         { label: 'Aviso Legal',icon: BookOpen,    bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  curiosidades:  { label: 'Sabías que', icon: Lightbulb,   bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  agua_recursos: { label: 'Recursos',   icon: Droplet,     bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  seguridad:     { label: 'Seguridad',  icon: ShieldCheck, bg: 'bg-red-500/20', text: 'text-red-400' },
  mantenimiento: { label: 'Mantenimiento', icon: PenTool,  bg: 'bg-orange-500/20', text: 'text-orange-400' },
  transparencia: { label: 'Finanzas',   icon: PieChart,    bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

const typeImages = {
  reglamento:    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080&q=85',
  legal:         'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1080&q=85',
  curiosidades:  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1080&q=85',
  agua_recursos: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1080&q=85',
  seguridad:     'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&q=85',
  mantenimiento: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1080&q=85',
  transparencia: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1080&q=85',
};

function TopPillClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
      <span className="text-white text-lg font-bold tracking-wide">{format(time, 'HH:mm')}</span>
      <div className="w-1 h-1 bg-white/30 rounded-full" />
      <span className="text-white/70 text-sm font-medium capitalize">{format(time, "EEE d MMM", { locale: es })}</span>
    </div>
  );
}

function BottomModal({ onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end justify-center" onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] p-8 md:p-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-slate-200 rounded-full" />
        <div className="mt-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// Modales
// -------------------------------------------------------------
function SuggestionModal({ onClose }) {
  const [form, setForm] = useState({ name: '', department: '', message: '', category: 'sugerencia' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await base44.entities.Comment.create(form); } catch(e) {}
    setSent(true); setLoading(false); setTimeout(onClose, 2500);
  };

  return (
    <BottomModal onClose={onClose}>
      {sent ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-10">
          <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" strokeWidth={1.5} />
          <p className="text-3xl font-black text-slate-800">¡Enviado!</p>
          <p className="text-slate-500 text-lg mt-2">Mensaje recibido por administración.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800">Buzón Digital</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Déjanos tu comentario o sugerencia</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Depto." value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
          </div>
          <select className="w-full bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-blue-500 transition-all" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="sugerencia">Sugerencia general</option>
            <option value="queja">Queja o inconveniente</option>
            <option value="felicitacion">Felicitación</option>
          </select>
          <textarea className="w-full bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 py-4 text-base focus:ring-2 focus:ring-blue-500 transition-all resize-none" placeholder="Mensaje..." rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 h-14 bg-white ring-1 ring-slate-200 rounded-2xl text-slate-600 font-bold text-lg active:scale-95 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold text-lg active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      )}
    </BottomModal>
  );
}

function TicketModal({ onClose }) {
  const [form, setForm] = useState({ title: '', area: 'Áreas comunes', description: '', priority: 'media' });
  const [step, setStep] = useState('form'); 
  const [loading, setLoading] = useState(false);
  const [createdTask, setCreatedTask] = useState(null);
  const [reportedAt, setReportedAt] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const autoCloseRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const now = new Date().toISOString();
    try {
      const task = await base44.entities.MaintenanceTask.create({ ...form, status: 'pendiente', reported_via_kiosk: true, reported_date: now });
      setCreatedTask(task); setReportedAt(now);
    } catch(e) {}
    setLoading(false); setStep('sent');
    autoCloseRef.current = setTimeout(onClose, 10000);
  };

  const handleEvidenceFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setEvidenceFile(file); setEvidencePreview(URL.createObjectURL(file));
  };

  const handleUploadEvidence = async () => {
    if (!evidenceFile) return; setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file: evidenceFile });
      await base44.entities.MaintenanceTask.update(createdTask.id, { evidence_url: res.file_url, evidence_note: evidenceNote, status: 'completada', completion_date: new Date().toISOString().split('T')[0] });
    } catch(e) {}
    setUploading(false); setStep('success'); setTimeout(onClose, 3000);
  };

  return (
    <BottomModal onClose={onClose}>
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Reportar Falla</h2>
          </div>
          <input className="w-full bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-orange-500 transition-all" placeholder="¿Qué falla?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <select className="bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-orange-500 transition-all" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}>
              {['Cisternas','Elevadores','Jardines','Estacionamiento','Áreas comunes'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 text-base focus:ring-2 focus:ring-orange-500 transition-all" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
            </select>
          </div>
          <textarea className="w-full bg-slate-100/50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 py-4 text-base focus:ring-2 focus:ring-orange-500 transition-all resize-none" placeholder="Detalles..." rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 h-14 bg-white ring-1 ring-slate-200 rounded-2xl text-slate-600 font-bold text-lg active:scale-95 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 h-14 bg-orange-500 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Cargando...' : 'Reportar'}
            </button>
          </div>
        </form>
      )}

      {step === 'sent' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center py-6">
          <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" strokeWidth={1.5} />
          <p className="text-3xl font-black text-slate-800">Recibido</p>
          <div className="flex gap-4 mt-8 w-full">
            <button onClick={onClose} className="flex-1 h-14 bg-white ring-1 ring-slate-200 rounded-2xl text-slate-600 font-bold text-lg">Cerrar</button>
            <button onClick={() => { clearTimeout(autoCloseRef.current); setStep('evidence'); }} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" /> Evidencia
            </button>
          </div>
        </motion.div>
      )}

      {step === 'evidence' && (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800">Sube una Foto</h2>
          </div>
          <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-[2rem] h-56 flex flex-col items-center justify-center cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
            {evidencePreview ? <img src={evidencePreview} className="w-full h-full object-cover rounded-[2rem]" /> : <Upload className="w-10 h-10 text-slate-400" />}
            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleEvidenceFile} />
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep('sent')} className="flex-1 h-14 bg-white ring-1 ring-slate-200 rounded-2xl text-slate-600 font-bold text-lg">Atrás</button>
            <button onClick={handleUploadEvidence} disabled={uploading || !evidenceFile} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50">
              {uploading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCircle className="w-20 h-20 text-blue-500 mb-6" strokeWidth={1.5} />
          <p className="text-3xl font-black text-slate-800">¡Publicado!</p>
        </div>
      )}
    </BottomModal>
  );
}

// -------------------------------------------------------------
// PANTALLA PRINCIPAL - ESTILO APP MÓVIL
// -------------------------------------------------------------
const SLIDE_DURATION = 8000;

export default function ElevatorScreen() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modal, setModal] = useState(null); 
  const [paused, setPaused] = useState(false);
  const [dragDir, setDragDir] = useState(1); 
  const timerRef = useRef(null);

  const { data: rawNotices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ['notices-elevator'],
    queryFn: () => base44.entities.Notice.filter({ is_active: true }, '-created_date'),
    refetchInterval: 60000,
  });

  const { data: completedTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['completed-tasks-elevator'],
    queryFn: () => base44.entities.MaintenanceTask.filter({ status: 'completada' }, '-updated_date', 20),
    refetchInterval: 60000,
  });

  const taskSlides = completedTasks.filter(t => t.evidence_url).map(t => ({
      id: `task-${t.id}`, _isTask: true, _task: t, title: t.title,
      content: t.evidence_note || `Mantenimiento completado en ${t.area}`,
      type: 'mantenimiento', image_url: t.evidence_url, reported_date: t.reported_date, completion_date: t.completion_date,
  }));

  const combinedNotices = [...rawNotices, ...taskSlides];
  const isLoading = loadingNotices || loadingTasks;

  const defaultSlides = [
    {
      id: 'default-1', title: "K'eni Connect", content: "Bienvenido a tu comunidad inteligente. Desliza hacia arriba para explorar más avisos o toca los botones inferiores para interactuar.",
      type: 'transparencia', image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1080&q=85'
    },
    {
      id: 'default-2', title: "Comunidad Segura", content: "Recuerda que el acceso peatonal y vehicular es exclusivo para residentes y visitas previamente autorizadas. Ayúdanos a mantener la seguridad.",
      type: 'seguridad', image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&q=85'
    },
    {
      id: 'default-3', title: "Reporte de Incidencias", content: "¿Notaste algún foco fundido o desperfecto en las áreas comunes? Usa el botón de 'Reportar' aquí abajo para notificar a mantenimiento al instante.",
      type: 'mantenimiento', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1080&q=85'
    },
    {
      id: 'default-4', title: "Convivencia Armónica", content: "Respeta los horarios de descanso de tus vecinos. Recuerda que las áreas recreativas están disponibles en los horarios establecidos.",
      type: 'reglamento', image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080&q=85'
    }
  ];

  const notices = combinedNotices.length > 0 ? combinedNotices : (isLoading ? [] : defaultSlides);

  useEffect(() => {
    if (notices.length <= 1 || paused) return;
    timerRef.current = setTimeout(() => { setDragDir(1); setCurrentIndex(prev => (prev + 1) % notices.length); }, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, notices.length, paused]);

  const goNext = () => { setDragDir(1); setCurrentIndex(prev => (prev + 1) % notices.length); };
  const goPrev = () => { setDragDir(-1); setCurrentIndex(prev => (prev - 1 + notices.length) % notices.length); };
  const openModal = (type, e) => { e.stopPropagation(); setPaused(true); setModal(type); };
  const closeModal = () => { setModal(null); setPaused(false); };

  if (isLoading && combinedNotices.length === 0) {
    return <div className="h-screen w-full bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  const notice = notices[currentIndex];
  const config = typeConfig[notice?.type] || typeConfig.reglamento;
  const Icon = config.icon || Bell;
  const image = notice?.image_url || typeImages[notice?.type] || typeImages.reglamento;

  return (
    <div className="relative h-screen w-full bg-black flex flex-col p-3 md:p-4 font-sans overflow-hidden select-none">
      
      {/* App Card */}
      <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl">
        
        {/* IMAGEN Y GESTOS */}
        <AnimatePresence mode="wait" custom={dragDir}>
          <motion.div
            key={currentIndex} custom={dragDir}
            initial={{ y: dragDir > 0 ? '100%' : '-100%', scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: dragDir > 0 ? '-100%' : '100%', scale: 0.9 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.15 }}
            className="absolute inset-0 cursor-pointer"
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y < -60) goNext(); else if (info.offset.y > 60) goPrev(); }}
            onClick={() => { setPaused(true); setModal('detail'); }}
          >
            <img src={image} alt={notice?.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent h-1/3" />
          </motion.div>
        </AnimatePresence>

        {/* HEADER CON EL LOGO INTEGRADO */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            {/* INTEGRACIÓN DEL LOGO K'ENI AQUÍ */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
              <img src="/logo.png" alt="K'eni" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">K'eni Connect</span>
          </div>
          <TopPillClock />
        </div>

        {/* CONTENIDO PRINCIPAL SOBRE LA IMAGEN */}
        <div className="absolute bottom-28 left-6 right-6 md:left-10 md:right-10 z-10 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex gap-2 mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.text}`} strokeWidth={2} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>{config.label}</span>
                </div>
                {notice?._isTask && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resuelto</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-3 drop-shadow-lg">
                {notice?.title}
              </h1>
              <p className="text-white/80 text-lg md:text-xl font-medium line-clamp-2 max-w-3xl drop-shadow-md">
                {notice?.content}
              </p>
              
              <div className="flex items-center gap-2 mt-6 text-white/50">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest">Toca para leer más</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DOCK INFERIOR DE ACCIONES Y PAGINACIÓN */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col items-center gap-4">
          
          <div className="flex gap-1.5">
            {notices.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>

          <div className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 w-full max-w-md shadow-2xl">
            <button onClick={e => openModal('suggestion', e)} className="flex-1 flex flex-col items-center justify-center gap-1 h-14 bg-white/5 hover:bg-white/10 rounded-full transition-colors active:scale-95">
              <MessageSquare className="w-5 h-5 text-white" strokeWidth={1.5} />
              <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Sugerencia</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button onClick={e => openModal('ticket', e)} className="flex-1 flex flex-col items-center justify-center gap-1 h-14 bg-white/5 hover:bg-white/10 rounded-full transition-colors active:scale-95">
              <Wrench className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
              <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Reportar</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button onClick={e => { e.stopPropagation(); navigate(createPageUrl('Kiosk') + '?tab=finance'); }} className="flex-1 flex flex-col items-center justify-center gap-1 h-14 bg-white/5 hover:bg-white/10 rounded-full transition-colors active:scale-95">
              <PieChart className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
              <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Finanzas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Lectura de Detalles */}
      <AnimatePresence>
        {modal === 'detail' && (
          <BottomModal onClose={closeModal}>
            <div className="max-w-3xl mx-auto pt-2">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${config.bg} mb-6`}>
                <Icon className={`w-4 h-4 ${config.text}`} strokeWidth={2} />
                <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>{config.label}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 leading-tight tracking-tight">{notice?.title}</h2>
              <div className="w-full h-px bg-slate-100 mb-6" />
              <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap">
                {notice?.content}
              </p>
              <button onClick={closeModal} className="mt-12 w-full h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl active:scale-95 transition-transform">
                Cerrar
              </button>
            </div>
          </BottomModal>
        )}
        {modal === 'suggestion' && <SuggestionModal onClose={closeModal} />}
        {modal === 'ticket' && <TicketModal onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}