import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Megaphone, Wrench, MessageSquare,
  ChevronRight, Building2, KeyRound, CalendarDays, FileDown, Users,
  LogOut, Shield, Settings, Eye, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Importaciones de los paneles
import NoticesPanel from '@/components/admin/NoticesPanel.jsx';
import MaintenancePanel from '@/components/admin/MaintenancePanel.jsx';
import FinancialPanel from '@/components/admin/FinancialPanel.jsx'; // <-- Nuevo Panel Financiero
import CommentsPanel from '@/components/admin/CommentsPanel.jsx';
import CondominiosPanel from '@/components/admin/CondominiosPanel.jsx';
import TokensPanel from '@/components/admin/TokensPanel.jsx';
import CalendarPanel from '@/components/kiosk/CalendarPanel';
import ResumenPanel from '@/components/admin/ResumenPanel';
import ResidentsPanel from '@/components/admin/ResidentsPanel';
import AdminLogin from '@/components/admin/AdminLogin';
import UsersPanel from '@/components/admin/UsersPanel';

const ALL_TABS = [
  { id: 'notices', label: 'Avisos', icon: Megaphone },
  { id: 'maintenance', label: 'Mantenimiento', icon: Wrench },
  { id: 'finances', label: 'Finanzas', icon: PieChart }, // <-- Pestaña actualizada
  { id: 'comments', label: 'Buzón', icon: MessageSquare },
  { id: 'condominios', label: 'Condominios', icon: Building2 },
  { id: 'tokens', label: 'Tokens', icon: KeyRound },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'residents', label: 'Residentes', icon: Users },
  { id: 'resumen', label: 'Resumen', icon: FileDown },
  { id: 'usuarios', label: 'Usuarios', icon: Shield },
];

const ROLE_CONFIG = {
  admin_general: {
    label: 'Admin General',
    color: 'bg-blue-100 text-blue-700',
    icon: Shield,
    canEdit: true,
    allowedTabs: null, // all
  },
  admin_residente: {
    label: 'Admin Residente',
    color: 'bg-purple-100 text-purple-700',
    icon: Settings,
    canEdit: true,
    allowedTabs: 'from_user', // from user.allowed_tabs
  },
  comite_vigilancia: {
    label: 'Comité de Vigilancia',
    color: 'bg-amber-100 text-amber-700',
    icon: Eye,
    canEdit: false,
    allowedTabs: null, // all but readonly
  },
};

// Readonly wrapper - disables all inputs/buttons inside
function ReadonlyWrapper({ children }) {
  return (
    <div className="relative">
      <div className="pointer-events-none opacity-90 select-none">{children}</div>
      <div className="absolute inset-0 z-10" />
      <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-amber-700 text-sm font-medium shadow-sm">
        <Eye className="w-4 h-4 flex-shrink-0" />
        Modo solo lectura — Comité de Vigilancia
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('notices');

  useEffect(() => {
    // Login temporal desactivado - acceso directo
    setUser({ role: 'admin_general', full_name: 'Admin Temporal', email: '' });
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.comite_vigilancia;
  const RoleIcon = roleConfig.icon;
  const canEdit = roleConfig.canEdit;

  // Determine which tabs this user can see
  let visibleTabs = ALL_TABS;
  if (user.role === 'admin_residente' && user.allowed_tabs?.length > 0) {
    visibleTabs = ALL_TABS.filter(t => user.allowed_tabs.includes(t.id));
  }
  // Only admin_general sees the Usuarios tab
  if (user.role !== 'admin_general') {
    visibleTabs = visibleTabs.filter(t => t.id !== 'usuarios');
  }
  // Ensure activeTab is valid
  const validTab = visibleTabs.find(t => t.id === activeTab) ? activeTab : visibleTabs[0]?.id;

  const renderPanel = (tabId) => {
    const panel = (() => {
      switch (tabId) {
        case 'notices': return <NoticesPanel readOnly={!canEdit} />;
        case 'maintenance': return <MaintenancePanel readOnly={!canEdit} />;
        case 'finances': return <FinancialPanel readOnly={user.role !== 'admin_general' && user.role !== 'admin_condominio'} />; // <-- Renderiza el panel nuevo
        case 'comments': return <CommentsPanel readOnly={!canEdit} />;
        case 'condominios': return <CondominiosPanel readOnly={!canEdit} />;
        case 'tokens': return <TokensPanel readOnly={!canEdit} />;
        case 'calendar': return <CalendarPanel isAdmin={canEdit} />;
        case 'residents': return <ResidentsPanel readOnly={!canEdit} />;
        case 'resumen': return <ResumenPanel />;
        case 'usuarios': return user.role === 'admin_general' ? <UsersPanel /> : null;
        default: return null;
      }
    })();

    if (!canEdit && tabId !== 'resumen' && tabId !== 'calendar') {
      return <ReadonlyWrapper>{panel}</ReadonlyWrapper>;
    }
    return panel;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* Header Premium */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <LayoutDashboard className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-slate-800 leading-tight truncate tracking-tight">Panel de Administración</h1>
              <p className="text-slate-500 text-sm font-medium capitalize truncate">
                {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${roleConfig.color}`}>
              <RoleIcon className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">{roleConfig.label}</span>
            </div>
            
            <Link
              to={createPageUrl('Kiosk')}
              className="flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              Portal Kiosko
              <ChevronRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => base44.auth.logout(createPageUrl('Admin'))}
              className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs / Navegación Superior */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex overflow-x-auto hide-scrollbar bg-white/80 backdrop-blur-xl p-2 rounded-[1.5rem] shadow-sm border border-slate-200/60 gap-1 w-full">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const active = validTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                  active 
                    ? 'bg-slate-900 shadow-md text-white' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Área de Contenido Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={validTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderPanel(validTab)}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}