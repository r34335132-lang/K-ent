import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Megaphone, Wrench, DollarSign, MessageSquare,
  ChevronRight, Building2, KeyRound, CalendarDays, FileDown, Users,
  LogOut, Shield, Settings, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import NoticesPanel from '@/components/admin/NoticesPanel.jsx';
import MaintenancePanel from '@/components/admin/MaintenancePanel.jsx';
import ExpensesPanel from '@/components/admin/ExpensesPanel.jsx';
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
  { id: 'expenses', label: 'Gastos', icon: DollarSign },
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
      <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-amber-700 text-sm font-medium">
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
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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
        case 'expenses': return <ExpensesPanel readOnly={user.role !== 'admin_general' && user.role !== 'admin_condominio'} />;
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex-shrink-0 bg-slate-800 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">Panel de Administración</h1>
              <p className="text-slate-400 text-xs capitalize truncate">
                {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold ${roleConfig.color}`}>
              <RoleIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{roleConfig.label}</span>
            </div>
            <Link
              to={createPageUrl('Kiosk')}
              className="flex items-center gap-1.5 h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              Portal
            </Link>
            <button
              onClick={() => base44.auth.logout(createPageUrl('Admin'))}
              className="flex items-center gap-1.5 h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:flex md:flex-wrap gap-1 bg-white rounded-2xl p-1 border border-slate-200">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const active = validTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={validTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {renderPanel(validTab)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}