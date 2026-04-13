import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, PieChart, Bell, MessageSquare, History, CalendarDays } from 'lucide-react';

const tabs = [
  { id: 'status', label: 'Estatus Operativo', icon: Wrench },
  { id: 'finance', label: 'Transparencia Financiera', icon: PieChart },
  { id: 'notices', label: 'Comunicación', icon: Bell },
  { id: 'comments', label: 'Buzón Interactivo', icon: MessageSquare },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'history', label: 'Historial', icon: History },
];

export default function NavigationTabs({ activeTab, onTabChange }) {
  return (
    <>
      {/* Mobile: horizontal scrollable pill row */}
      <div className="flex sm:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-colors touch-manipulation
                ${isActive ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600'}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-3 gap-3 p-2 bg-slate-100 rounded-2xl w-full max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl font-semibold text-sm
                transition-colors touch-manipulation min-h-[72px]
                ${isActive ? 'text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabDesktop"
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex flex-col items-center gap-1.5">
                <Icon className="w-7 h-7" />
                <span className="text-center leading-tight">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}