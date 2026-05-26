import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, AlertTriangle, 
  FileText, Plus, Search, ShieldAlert, CheckCircle, Target, ArrowRight, X, Send, UserX, BellRing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);

// Componente Reutilizable para Ventanas Emergentes (Modales)
function ActionModal({ isOpen, onClose, title, icon: Icon, colorClass, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 z-10"
          >
            <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${colorClass}`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function FinancialPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [presupuestoMensual, setPresupuestoMensual] = useState(50000); 
  const [modalState, setModalState] = useState({ type: null, data: null }); // Controla qué modal se abre
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-admin'],
    queryFn: () => base44.entities.Expense.list('-date', 100),
  });

  const incomes = [
    { id: 1, depto: 'A-101', amount: 1500, date: '2023-10-01', status: 'pagado', concept: 'Cuota Octubre' },
    { id: 2, depto: 'B-205', amount: 1500, date: '2023-10-02', status: 'pagado', concept: 'Cuota Octubre' },
    { id: 3, depto: 'C-304', amount: 3000, date: '2023-10-05', status: 'pagado', concept: 'Cuota Sep y Oct' },
  ];

  const morosos = [
    { id: 1, depto: 'A-102', name: 'Carlos Ruiz', monthsDue: 3, amountDue: 4500, status: 'critico' },
    { id: 2, depto: 'B-101', name: 'Ana Silva', monthsDue: 1, amountDue: 1500, status: 'leve' },
    { id: 3, depto: 'C-404', name: 'Roberto Gómez', monthsDue: 5, amountDue: 7500, status: 'legal' },
  ];

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
  const porcentajeGastado = Math.min((totalExpenses / presupuestoMensual) * 100, 100);
  const balance = totalIncomes - totalExpenses;

  // Función genérica para simular acciones
  const handleAction = (successMessage) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setModalState({ type: 'success', data: successMessage });
      setTimeout(() => setModalState({ type: null, data: null }), 2000); // Cierra éxito auto.
    }, 1200);
  };

  return (
    <div className="font-sans animate-in fade-in duration-500 relative">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Centro Financiero</h2>
        <p className="text-slate-500 text-base font-medium mt-1">Ingresos, egresos, presupuestos y control de morosidad.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar bg-white/80 backdrop-blur-xl p-2 rounded-[1.5rem] shadow-sm border border-slate-200/60 mb-8 w-fit">
        {[
          { id: 'dashboard', label: 'Presupuesto vs Ejercicio', icon: Target },
          { id: 'ingresos', label: 'Ingresos & Edos. de Cuenta', icon: TrendingUp },
          { id: 'egresos', label: 'Reporte de Egresos', icon: TrendingDown },
          { id: 'morosos', label: 'Muro de Morosos', icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive ? 'bg-slate-900 shadow-lg text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── 1. DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] px-8 py-10 md:px-12 md:py-14 mb-8 shadow-2xl shadow-slate-900/20 border border-slate-800 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
              <div className="relative z-10 flex flex-col lg:flex-row gap-10 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-white/60 text-sm font-bold tracking-[0.2em] uppercase">Ejercicio del Mes</p>
                  </div>
                  <div className="flex items-baseline gap-4 mb-6">
                    <p className="text-6xl md:text-7xl font-light text-white tracking-tighter tabular-nums">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xl text-white/50 font-medium pb-2">/ {formatCurrency(presupuestoMensual)}</p>
                  </div>
                  <div className="space-y-2 max-w-xl">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-blue-400">Presupuesto Consumido</span>
                      <span className="text-white">{porcentajeGastado.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${porcentajeGastado}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${porcentajeGastado > 90 ? 'bg-red-500' : porcentajeGastado > 75 ? 'bg-yellow-400' : 'bg-blue-500'}`} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[250px]">
                  <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex-1">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Total Ingresos</p>
                    <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalIncomes)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex-1">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Balance Neto</p>
                    <p className={`text-3xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>{balance > 0 ? '+' : ''}{formatCurrency(balance)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 2. INGRESOS ── */}
        {activeTab === 'ingresos' && (
          <motion.div key="ingresos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Control de Ingresos</h3>
              <Button onClick={() => setModalState({ type: 'new_income' })} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-emerald-600/20 gap-2 active:scale-95 transition-all">
                <Plus className="w-5 h-5" /> Registrar Pago
              </Button>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-slate-100">
              <div className="space-y-3">
                {incomes.map(inc => (
                  <div key={inc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">Depto. {inc.depto}</p>
                        <p className="text-sm text-slate-500 font-medium">{inc.concept} <span className="mx-1">•</span> {inc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0">
                      <p className="font-black text-slate-800 text-xl">{formatCurrency(inc.amount)}</p>
                      <Button onClick={() => setModalState({ type: 'statement', data: inc })} variant="outline" className="rounded-xl text-xs h-10 font-bold text-blue-600 border-blue-200 hover:bg-blue-50 active:scale-95 transition-transform">
                        Ver Edo. Cuenta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 3. EGRESOS ── */}
        {activeTab === 'egresos' && (
          <motion.div key="egresos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2rem] p-10 text-center border border-slate-200 border-dashed">
              <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Módulo de Egresos</h3>
              <p className="text-slate-500 mt-2">Aquí se integra automáticamente la tabla de Gastos que configuramos anteriormente.</p>
            </div>
          </motion.div>
        )}

        {/* ── 4. MOROSOS ── */}
        {activeTab === 'morosos' && (
          <motion.div key="morosos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Muro de Morosos</h3>
                <p className="text-slate-500 font-medium mt-1">Departamentos con atrasos en sus cuotas.</p>
              </div>
              <Button onClick={() => setModalState({ type: 'global_warning' })} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-red-600/20 gap-2 active:scale-95 transition-all">
                <ShieldAlert className="w-5 h-5" /> Acciones Globales
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {morosos.map(m => (
                <div key={m.id} className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/40 border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${m.status === 'critico' || m.status === 'legal' ? 'bg-red-500' : 'bg-orange-400'}`} />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-2xl font-black text-slate-800">Depto. {m.depto}</p>
                      <p className="text-sm font-semibold text-slate-500">{m.name}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${m.status === 'critico' ? 'bg-red-100 text-red-600' : m.status === 'legal' ? 'bg-slate-900 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      {m.monthsDue} Meses
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Deuda Total</p>
                    <p className="text-3xl font-light tracking-tighter text-slate-800">{formatCurrency(m.amountDue)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => setModalState({ type: 'reminder', data: m })} variant="outline" className="w-full rounded-xl h-11 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-95">
                      Enviar Recordatorio
                    </Button>
                    <Button onClick={() => setModalState({ type: 'publish', data: m })} className={`w-full rounded-xl h-11 font-bold text-white shadow-md active:scale-95 transition-all ${m.status === 'legal' ? 'bg-slate-900 hover:bg-black' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}>
                      {m.status === 'legal' ? 'Proceso Legal' : 'Publicar en Muro'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODALES DINÁMICOS */}
      {/* ========================================================================= */}

      {/* 1. Modal: Nuevo Ingreso */}
      <ActionModal isOpen={modalState.type === 'new_income'} onClose={() => setModalState({ type: null })} title="Registrar Pago" icon={Wallet} colorClass="bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30">
        <form onSubmit={(e) => { e.preventDefault(); handleAction('Pago registrado correctamente'); }} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Departamento</label>
            <input type="text" placeholder="Ej. A-101" className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 font-medium focus:ring-2 focus:ring-emerald-500 transition-all uppercase" required />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Monto Pagado</label>
            <input type="number" placeholder="0.00" className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 font-medium focus:ring-2 focus:ring-emerald-500 transition-all" required />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Concepto</label>
            <select className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 h-14 font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none" required>
              <option>Cuota de Mantenimiento</option>
              <option>Pago de Multa</option>
              <option>Reserva de Área Común</option>
            </select>
          </div>
          <Button disabled={isProcessing} className="w-full h-14 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50">
            {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </form>
      </ActionModal>

      {/* 2. Modal: Estado de Cuenta */}
      <ActionModal isOpen={modalState.type === 'statement'} onClose={() => setModalState({ type: null })} title={`Edo. de Cuenta`} icon={FileText} colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30">
        {modalState.data && (
          <div>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Departamento</p>
                <p className="text-2xl font-black text-slate-800">{modalState.data.depto}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo a Favor</p>
                <p className="text-2xl font-black text-emerald-500">$0.00</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm font-bold text-slate-800 border-b pb-2">Últimos Movimientos</p>
              <div className="flex justify-between items-center text-sm py-2">
                <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-emerald-500"/> <span className="font-medium text-slate-600">Pago Recibido ({modalState.data.concept})</span></div>
                <span className="font-bold text-emerald-600">+{formatCurrency(modalState.data.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2">
                <div className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-red-400"/> <span className="font-medium text-slate-600">Cargo Mes Anterior</span></div>
                <span className="font-bold text-slate-800">-{formatCurrency(1500)}</span>
              </div>
            </div>
            <Button className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg active:scale-95 transition-all">Generar PDF</Button>
          </div>
        )}
      </ActionModal>

      {/* 3. Modal: Enviar Recordatorio */}
      <ActionModal isOpen={modalState.type === 'reminder'} onClose={() => setModalState({ type: null })} title="Recordatorio de Pago" icon={BellRing} colorClass="bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30">
        {modalState.data && (
          <div className="text-center">
            <p className="text-lg text-slate-600 font-medium mb-6">¿Estás seguro de enviar una notificación y correo de cobranza a <strong>{modalState.data.name} (Depto. {modalState.data.depto})</strong> por la cantidad de {formatCurrency(modalState.data.amountDue)}?</p>
            <div className="flex gap-4">
              <Button onClick={() => setModalState({ type: null })} variant="outline" className="flex-1 h-14 rounded-2xl font-bold text-lg border-slate-200">Cancelar</Button>
              <Button disabled={isProcessing} onClick={() => handleAction(`Recordatorio enviado a ${modalState.data.depto}`)} className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg active:scale-95 disabled:opacity-50">
                {isProcessing ? 'Enviando...' : 'Enviar Alerta'} <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </ActionModal>

      {/* 4. Modal: Publicar en Muro */}
      <ActionModal isOpen={modalState.type === 'publish'} onClose={() => setModalState({ type: null })} title="Atención" icon={UserX} colorClass="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30">
        {modalState.data && (
          <div className="text-center">
            <p className="text-lg text-slate-600 font-medium mb-6">Vas a publicar la deuda de <strong>{modalState.data.depto}</strong> en el Muro Público (Pantalla de Elevadores). Esta acción es visible para todos los residentes.</p>
            <div className="flex gap-4">
              <Button onClick={() => setModalState({ type: null })} variant="outline" className="flex-1 h-14 rounded-2xl font-bold text-lg border-slate-200">Cancelar</Button>
              <Button disabled={isProcessing} onClick={() => handleAction(`Depto ${modalState.data.depto} publicado en Muro`)} className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg active:scale-95 disabled:opacity-50">
                {isProcessing ? 'Publicando...' : 'Sí, Publicar'}
              </Button>
            </div>
          </div>
        )}
      </ActionModal>

      {/* 5. Modal: Acciones Globales */}
      <ActionModal isOpen={modalState.type === 'global_warning'} onClose={() => setModalState({ type: null })} title="Aviso Masivo" icon={ShieldAlert} colorClass="bg-gradient-to-br from-slate-800 to-black shadow-slate-900/30">
        <div className="text-center">
          <p className="text-lg text-slate-600 font-medium mb-6">¿Deseas enviar un recordatorio automático a los <strong>3 departamentos</strong> con atrasos en sus cuotas?</p>
          <div className="flex gap-4">
            <Button onClick={() => setModalState({ type: null })} variant="outline" className="flex-1 h-14 rounded-2xl font-bold text-lg border-slate-200">Cancelar</Button>
            <Button disabled={isProcessing} onClick={() => handleAction('Recordatorios enviados exitosamente')} className="flex-1 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg active:scale-95 disabled:opacity-50">
              {isProcessing ? 'Procesando...' : 'Notificar a Todos'}
            </Button>
          </div>
        </div>
      </ActionModal>

      {/* 6. Modal de Éxito Global */}
      <AnimatePresence>
        {modalState.type === 'success' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white/90 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl border border-white flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" strokeWidth={1.5} />
              <p className="text-2xl font-black text-slate-800 text-center">{modalState.data}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}