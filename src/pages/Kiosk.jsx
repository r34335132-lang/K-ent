import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, RefreshCw, TvMinimalPlay, Bell, Settings, Home } from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const INACTIVITY_TIMEOUT = 30; // seconds
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
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  const goToElevator = useCallback(() => {
    clearInterval(countdownRef.current);
    setCountdown(null);
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

  // Start timer on any tab
  useEffect(() => {
    startInactivityTimer();
    return () => clearInterval(countdownRef.current);
  }, [activeTab]);

  // Reset timer on any user interaction
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

  const generatePDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Reporte de Gastos - ${format(new Date(), 'MMMM yyyy', { locale: es })}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #1e40af; color: white; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Gastos Condominal</h1>
          <p>Generado: ${format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}</p>
          <table>
            <tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Monto</th></tr>
            ${expenses.map(exp => `
              <tr>
                <td>${exp.date}</td>
                <td>${exp.concept}</td>
                <td>${exp.category}</td>
                <td>${formatCurrency(exp.amount)}</td>
              </tr>
            `).join('')}
          </table>
          <p class="total">Total: ${formatCurrency(totalExpenses)}</p>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" onPointerDown={handleActivity}>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo + Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">Portal Condominal</h1>
              <p className="text-slate-400 text-xs capitalize truncate">
                {format(new Date(), "EEEE, dd 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="min-w-0 sm:hidden">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">K'eni Connect</h1>
            </div>
          </div>

          {/* Botones — solo iconos en móvil, icono+texto en desktop */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              to={createPageUrl('Admin')}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
            <Link
              to={createPageUrl('Notifications')}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notif.</span>
            </Link>
            <Link
              to={createPageUrl('ElevatorScreen')}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition text-xs"
              title="Pantalla Elevador"
            >
              <TvMinimalPlay className="w-4 h-4" />
              <span className="hidden sm:inline">Elevador</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2 w-full overflow-x-hidden">
        {countdown !== null && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="relative w-7 h-7">
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="13" fill="none" stroke="#fde68a" strokeWidth="3" />
                  <circle cx="16" cy="16" r="13" fill="none" stroke="#f59e0b" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 13}`}
                    strokeDashoffset={`${2 * Math.PI * 13 * (1 - countdown / INACTIVITY_TIMEOUT)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-amber-700">{countdown}</span>
              </div>
              <span className="text-xs text-amber-700 font-medium">Volviendo al elevador</span>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-3">
          {activeTab !== HOME_TAB && (
            <button
              onClick={() => { setActiveTab(HOME_TAB); startInactivityTimer(); }}
              className="flex items-center gap-2 h-12 px-6 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 font-semibold text-sm transition"
            >
              <Home className="w-5 h-5" />
              Inicio
            </button>
          )}
          <div className="w-full">
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-14 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">

          {/* ── Estatus Operativo ── */}
          {activeTab === 'status' && (
            <motion.div key="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Estatus Operativo</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Tareas de mantenimiento activas</p>
                </div>
                <Button variant="outline" onClick={() => refetchTasks()} className="h-10 px-5 rounded-xl text-sm gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {loadingTasks ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                      <div className="h-52 bg-slate-200 w-full" />
                      <div className="bg-white p-4 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : activeTasks.length > 0 ? (
                  activeTasks.map((task, index) => (
                    <StatusCard key={task.id} task={task} index={index} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-lg">No hay tareas activas</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Transparencia Financiera ── */}
          {activeTab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Transparencia Financiera</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Reportes de gastos y administración</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${chartType === 'bar' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                    >Barras</button>
                    <button
                      onClick={() => setChartType('pie')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${chartType === 'pie' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                    >Circular</button>
                  </div>

                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl px-8 py-6 mb-6 text-white">
                <p className="text-blue-100 text-sm font-medium mb-1">Total de Gastos del Período</p>
                <p className="text-5xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-blue-200 text-sm mt-1">{expenses.length} transacciones registradas</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-base font-semibold text-slate-800 mb-5">Gastos por Categoría</h3>
                  {loadingExpenses ? (
                    <div className="h-[300px] bg-slate-100 rounded-xl animate-pulse" />
                  ) : (
                    <ExpenseChart expenses={expenses} type={chartType} />
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-base font-semibold text-slate-800 mb-5">Gastos Recientes</h3>
                  <div className="space-y-3 max-h-[340px] overflow-y-auto">
                    {expenses.slice(0, 10).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{expense.concept}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{expense.category} · {expense.date}</p>
                        </div>
                        <p className="font-bold text-blue-600 text-sm">{formatCurrency(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Avisos ── */}
          {activeTab === 'notices' && (
            <motion.div key="notices" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Comunicación Dinámica</h2>
                <p className="text-slate-500 text-sm mt-0.5">Avisos, noticias y protocolos importantes</p>
              </div>
              {loadingNotices ? (
                <div className="h-[480px] bg-slate-200 rounded-3xl animate-pulse" />
              ) : (
                <NoticeCarousel key={activeTab} notices={notices} />
              )}
            </motion.div>
          )}

          {/* ── Calendario ── */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <CalendarPanel isAdmin={false} />
            </motion.div>
          )}

          {/* ── Historial ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <HistoryPanel />
            </motion.div>
          )}

          {/* ── Buzón ── */}
          {activeTab === 'comments' && (
            <motion.div key="comments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Buzón Interactivo</h2>
                <p className="text-slate-500 text-sm mt-0.5">Comparte tus comentarios y recomendaciones</p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
                <CommentForm />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}