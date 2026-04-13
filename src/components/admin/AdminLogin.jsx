import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLogin({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const user = await base44.auth.me();
      const role = user.role;
      if (!['admin_general', 'admin_residente', 'comite_vigilancia'].includes(role)) {
        setError('No tienes permisos para acceder al panel de administración.');
        setLoading(false);
        return;
      }
      onLogin(user);
    } catch (e) {
      setError('Error al autenticar. Intenta de nuevo.');
    }
    setLoading(false);
  };

  // Auto-check on mount
  React.useEffect(() => { handleLogin(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Panel Administrativo</h1>
        <p className="text-slate-500 text-sm mb-8">K'eni Connect — Acceso restringido</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 bg-slate-800 hover:bg-slate-900 rounded-xl text-base font-semibold gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
          {loading ? 'Verificando...' : 'Iniciar Sesión'}
        </Button>

        <p className="text-xs text-slate-400 mt-6">
          Acceso solo para administradores y comité autorizados
        </p>
      </div>
    </div>
  );
}