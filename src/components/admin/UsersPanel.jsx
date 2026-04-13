import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Settings, Eye, Mail, UserPlus, Trash2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TabPermissionsModal from './TabPermissionsModal';

const ROLE_CONFIG = {
  admin_general: { label: 'Admin General', color: 'bg-blue-100 text-blue-700', icon: Shield, desc: 'Acceso completo a todo el panel' },
  admin_residente: { label: 'Admin Residente', color: 'bg-purple-100 text-purple-700', icon: Settings, desc: 'Acceso configurado por pestañas' },
  comite_vigilancia: { label: 'Comité de Vigilancia', color: 'bg-amber-100 text-amber-700', icon: Eye, desc: 'Solo lectura, sin edición' },
};

export default function UsersPanel() {
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('comite_vigilancia');
  const [inviting, setInviting] = useState(false);
  const [permUser, setPermUser] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateRole = async (userId, role) => {
    await base44.entities.User.update(userId, { role });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole === 'admin_general' ? 'admin' : 'user');
    // Update role on the newly invited user will be done by them logging in
    setInviteEmail('');
    setShowInvite(false);
    setInviting(false);
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const adminUsers = users.filter(u => ['admin_general', 'admin_residente', 'comite_vigilancia'].includes(u.role));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500 text-sm mt-0.5">Administra los accesos al panel</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 gap-2 text-sm">
          <UserPlus className="w-4 h-4" /> Invitar Usuario
        </Button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const Icon = cfg.icon;
          const count = adminUsers.filter(u => u.role === role).length;
          return (
            <div key={role} className={`rounded-2xl p-5 border ${cfg.color.replace('text-', 'border-').split(' ')[0]} bg-white`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cfg.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800">{cfg.label}</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">{cfg.desc}</p>
              <p className="text-2xl font-bold text-slate-700">{count}</p>
              <p className="text-xs text-slate-400">usuario(s)</p>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" /> Invitar Nuevo Usuario
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Correo electrónico</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500"
                placeholder="usuario@ejemplo.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Rol</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-blue-500 bg-white"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
              >
                <option value="admin_general">Admin General</option>
                <option value="admin_residente">Admin Residente</option>
                <option value="comite_vigilancia">Comité de Vigilancia</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowInvite(false)} className="rounded-xl h-9 text-sm">Cancelar</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9 gap-2 text-sm">
              <Mail className="w-4 h-4" />
              {inviting ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </div>
        </div>
      )}

      {/* Users list */}
      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {adminUsers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No hay usuarios con roles administrativos aún.</p>
            </div>
          )}
          {adminUsers.map(u => {
            const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.comite_vigilancia;
            const Icon = cfg.icon;
            return (
              <div key={u.id} className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{u.full_name || 'Sin nombre'}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <select
                  className="border border-slate-200 rounded-xl px-3 h-9 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  value={u.role || 'comite_vigilancia'}
                  onChange={e => updateRole(u.id, e.target.value)}
                >
                  <option value="admin_general">Admin General</option>
                  <option value="admin_residente">Admin Residente</option>
                  <option value="comite_vigilancia">Comité de Vigilancia</option>
                </select>
                {u.role === 'admin_residente' && (
                  <button
                    onClick={() => setPermUser(u)}
                    className="flex items-center gap-1.5 px-3 h-9 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Permisos
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {permUser && (
        <TabPermissionsModal user={permUser} onClose={() => setPermUser(null)} />
      )}
    </div>
  );
}