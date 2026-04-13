import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Mail, Check, Trash2, Plus, Settings, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SubscriptionForm from '@/components/notifications/SubscriptionForm.jsx';
import SubscriptionCard from '@/components/notifications/SubscriptionCard.jsx';
import SendNotificationPanel from '@/components/notifications/SendNotificationPanel.jsx';

export default function Notifications() {
  const [showForm, setShowForm] = useState(false);
  const [activePanel, setActivePanel] = useState('subscribers'); // 'subscribers' | 'send'
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.NotificationSubscription.filter({ is_active: true })
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Kiosk')} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Notificaciones por Email</h1>
                <p className="text-slate-400 text-sm">Gestiona suscriptores y envía alertas</p>
              </div>
            </Link>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Suscripción
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Suscriptores Activos</p>
            <p className="text-3xl font-bold text-slate-800">{subscriptions.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Alertas Urgentes</p>
            <p className="text-3xl font-bold text-red-600">{subscriptions.filter(s => s.notify_urgent).length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Comunicados</p>
            <p className="text-3xl font-bold text-blue-600">{subscriptions.filter(s => s.notify_notices).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActivePanel('subscribers')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition ${activePanel === 'subscribers' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Bell className="w-4 h-4" /> Suscriptores
          </button>
          <button
            onClick={() => setActivePanel('send')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition ${activePanel === 'send' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Mail className="w-4 h-4" /> Enviar Notificación
          </button>
        </div>

        {activePanel === 'subscribers' && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">No hay suscriptores aún</p>
                <p className="text-slate-400 text-sm mt-1">Agrega residentes para enviarles notificaciones</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {subscriptions.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activePanel === 'send' && (
          <SendNotificationPanel subscriptions={subscriptions} />
        )}
      </div>

      {/* New Subscription Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <SubscriptionForm
                onSuccess={() => {
                  setShowForm(false);
                  queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
                }}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}