import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, RefreshCw, TvMinimalPlay, Bell, Settings, Home, ArrowRight, Wallet, TrendingUp, Sparkles, Timer } from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const INACTIVITY_TIMEOUT = 30; // 30 segundos
const HOME_TAB = 'status';

import NavigationTabs from '@/components/kiosk/NavigationTabs';
import StatusCard from '@/components/kiosk/StatusCard';
import ExpenseChart from '@/components/kiosk/ExpenseChart';
import NoticeCarousel from '@/components/kiosk/NoticeCarousel';
import CommentForm from '@/components/kiosk/CommentForm';
import HistoryPanel from '@/components/kiosk/HistoryPanel';
import CalendarPanel from '@/components/kiosk/CalendarPanel';

export default function Kiosk() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || HOME_TAB;
  });
  const [chartType, setChartType] = useState('bar');
  const [countdown, setCountdown] = useState(INACTIVITY_TIMEOUT);
  const countdownRef = useRef(null);

  // Función para ir al protector de pantalla (Elevador)
  const goToElevator = useCallback(() => {
    clearInterval(countdownRef.current);
    navigate(createPageUrl('ElevatorScreen'));
  }, [navigate]);

  const startInactivityTimer = useCallback(() => {
    clearInterval(countdownRef.current);
    let remaining = INACTIVITY_TIMEOUT;
    setCountdown(remaining);
    
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        goToElevator();
      }
    }, 1000);
  }, [goToElevator]);

  const handleActivity = useCallback(() => {
    startInactivityTimer();
  }, [startInactivityTimer]);

  useEffect(() => {
    startInactivityTimer();
    return () => clearInterval(countdownRef.current);
  }, [activeTab, startInactivityTimer]);

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, handleActivity));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 20)
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 50)
  });

  const { data: notices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ['notices'],
    queryFn: () => base44.entities.Notice.filter({ is_active: true }, '-created_date')
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);

  const activeTasks = tasks.filter(t => t.status !== 'completada');

  // Cálculos para el cronómetro bonito
  const progressPercentage = (countdown / INACTIVITY_TIMEOUT) * 100;
  const isTimeRunningOut = countdown <= 10;

  return (
    <div className="relative min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-200 overflow-x-hidden" onPointerDown={handleActivity}>
      
      {/* Mesh Gradient de Fondo (Premium Blur) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* HEADER PRINCIPAL */}
      <header className="relative z-40 w-full max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-3xl px-6 py-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">K'eni Connect</h1>
              <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase mt-1">
                {format(new Date(), "EEEE, dd MMM", { locale: es })}
              </p>
            </div>
          </div>

          {/* Menú de herramientas Admin y Notificaciones */}
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Admin')} className="flex items-center justify-center w-14 h-14 bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all active:scale-95 group">
              <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" strokeWidth={1.5} />
            </Link>
            <Link to={createPageUrl('Notifications')} className="flex items-center justify-center w-14 h-14 bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all active:scale-95 group">
              <Bell className="w-6 h-6 group-hover:animate-bounce" strokeWidth={1.5} />
            </Link>
            
            {/* BOTÓN GIGANTE DEL ELEVADOR (Súper visible) */}
            <button 
              onClick={goToElevator}
              className="flex items-center gap-3 h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-900/20 ml-2"
            >
              <TvMinimalPlay className="w-5 h-5 text-blue-400" strokeWidth={2} />
              <span className="font-bold tracking-wide text-base">Modo Reposo</span>
            </button>
          </div>
        </div>
      </header>

      {/* CRONÓMETRO BONITO (Estilo Dynamic Island / Live Activity) */}
      <div className="sticky top-4 z-50 flex justify-center pointer-events-none mt-4">
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className={`flex flex-col items-center justify-center gap-2 px-6 py-3 rounded-full backdrop-blur-2xl shadow-2xl border transition-colors duration-500 pointer-events-auto cursor-pointer
                ${isTimeRunningOut ? 'bg-red-500/90 border-red-400/50 shadow-red-500/30' : 'bg-slate-900/90 border-slate-700/50 shadow-slate-900/20'}
              `}
              onClick={handleActivity}
            >
              <div className="flex items-center gap-3">
                <Timer className={`w-5 h-5 ${isTimeRunningOut ? 'text-white animate-pulse' : 'text-blue-400'}`} strokeWidth={2} />
                <span className="text-white font-semibold tracking-wide text-sm">
                  Pantalla de inicio en <span className="font-black text-lg ml-1 w-6 inline-block text-center">{countdown}s</span>
                </span>
              </div>
              
              {/* Barra de progreso de tiempo suave */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${isTimeRunningOut ? 'bg-white' : 'bg-blue-400'}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación de Pestañas Flotante */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 w-full relative z-10 flex flex-col items-center gap-6">
        {activeTab !== HOME_TAB && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setActiveTab(HOME_TAB); startInactivityTimer(); }}
            className="flex items-center gap-2 h-14 px-8 bg-white shadow-lg shadow-slate-200/50 border border-slate-100 rounded-full text-slate-600 hover:text-blue-600 font-bold text-base transition-colors"
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            Menú Principal
          </motion.button>
        )}
        <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-3xl p-2.5 rounded-[2.5rem] shadow-sm border border-white">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL (Glassmorphism UI) */}
      <main className="max-w-7xl mx-auto px-6 py-4 pb-24 w-full relative z-10">
        <AnimatePresence mode="wait">

          {/* ── Estatus Operativo ── */}
          {activeTab === 'status' && (
            <motion.div key="status" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">Estatus Operativo</h2>
                  <p className="text-slate-500 text-lg font-medium mt-2">Monitoreo de mantenimiento en tiempo real.</p>
                </div>
                <Button variant="outline" onClick={() => refetchTasks()} className="h-14 px-8 rounded-2xl text-base font-bold gap-3 border-slate-200 bg-white/80 backdrop-blur-md shadow-sm hover:bg-slate-50 active:scale-95">
                  <RefreshCw className="w-5 h-5 text-blue-600" strokeWidth={2} /> Sincronizar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {loadingTasks ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="rounded-[2.5rem] overflow-hidden bg-white/60 border border-white shadow-sm">
                      <div className="h-48 bg-slate-200/50 animate-pulse w-full" />
                      <div className="p-6 space-y-4">
                        <div className="h-5 bg-slate-200 rounded-full w-3/4 animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : activeTasks.length > 0 ? (
                  activeTasks.map((task, index) => (
                    <StatusCard key={task.id} task={task} index={index} className="shadow-xl shadow-slate-200/40 rounded-[2.5rem] hover:-translate-y-2 transition-transform duration-300 border border-white" />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white shadow-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                      <RefreshCw className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Todo al 100%</h3>
                    <p className="text-slate-500 text-lg font-medium mt-2">Sin tareas de mantenimiento activas.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Transparencia Financiera ── */}
          {activeTab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">Finanzas</h2>
                  <p className="text-slate-500 text-lg font-medium mt-2">Desglose de gastos del condominio.</p>
                </div>
                <div className="flex bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-1.5 shadow-sm border border-slate-200/60">
                  <button onClick={() => setChartType('bar')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${chartType === 'bar' ? 'bg-slate-900 shadow-lg text-white' : 'text-slate-500 hover:text-slate-800'}`}>Barras</button>
                  <button onClick={() => setChartType('pie')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${chartType === 'pie' ? 'bg-slate-900 shadow-lg text-white' : 'text-slate-500 hover:text-slate-800'}`}>Circular</button>
                </div>
              </div>

              {/* Tarjeta de Total Estilo Premium */}
              <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] px-10 py-12 mb-8 shadow-2xl shadow-slate-900/30 border border-slate-800 group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-blue-500/20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Wallet className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                      </div>
                      <p className="text-white/60 text-sm font-bold tracking-[0.2em] uppercase">Gasto Total</p>
                    </div>
                    <p className="text-6xl md:text-8xl font-light text-white tracking-tighter tabular-nums drop-shadow-md">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/10">
                    <TrendingUp className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                    <div>
                      <p className="text-3xl font-bold text-white leading-none">{expenses.length}</p>
                      <p className="text-white/60 text-sm font-semibold mt-1">Registros</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 shadow-xl shadow-slate-200/30 border border-white">
                  <h3 className="text-2xl font-black text-slate-800 mb-6">Categorías</h3>
                  {loadingExpenses ? (
                    <div className="h-[350px] bg-slate-100/50 rounded-3xl animate-pulse" />
                  ) : (
                    <div className="h-[350px]">
                      <ExpenseChart expenses={expenses} type={chartType} />
                    </div>
                  )}
                </div>
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 shadow-xl shadow-slate-200/30 border border-white">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 px-2">Movimientos Recientes</h3>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {expenses.slice(0, 10).map((expense) => (
                      <div key={expense.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                            <ArrowRight className="w-5 h-5 -rotate-45" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg">{expense.concept}</p>
                            <p className="text-sm text-slate-500 font-medium">{expense.category} <span className="mx-1 opacity-50">•</span> {expense.date}</p>
                          </div>
                        </div>
                        <p className="font-black text-slate-800 text-lg">{formatCurrency(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Avisos ── */}
          {activeTab === 'notices' && (
            <motion.div key="notices" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="mb-8 text-center max-w-2xl mx-auto">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Comunicados</h2>
                <p className="text-slate-500 text-lg font-medium mt-2">Mantente al día con los avisos del complejo.</p>
              </div>
              {loadingNotices ? (
                <div className="h-[500px] bg-white/60 rounded-[3rem] border border-white shadow-xl animate-pulse" />
              ) : (
                <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-300/50 border-[4px] border-white/50">
                  <NoticeCarousel key={activeTab} notices={notices} />
                </div>
              )}
            </motion.div>
          )}

          {/* ── Calendario ── */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-4 shadow-xl shadow-slate-200/40 border border-white">
                <CalendarPanel isAdmin={false} />
              </div>
            </motion.div>
          )}

          {/* ── Historial ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-8 shadow-xl shadow-slate-200/40 border border-white">
                <HistoryPanel />
              </div>
            </motion.div>
          )}

          {/* ── Buzón ── */}
          {activeTab === 'comments' && (
            <motion.div key="comments" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="mb-8 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Buzón Digital</h2>
                <p className="text-slate-500 text-lg font-medium mt-3">Envía tus comentarios o sugerencias a la administración.</p>
              </div>
              <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-white max-w-4xl mx-auto relative overflow-hidden">
                <CommentForm />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}