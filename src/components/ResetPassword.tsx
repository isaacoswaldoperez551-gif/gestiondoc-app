/**
 * Pantalla para definir una nueva contraseña tras abrir el enlace de recuperación enviado por correo.
 */
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Loader2, FileText } from 'lucide-react';

interface ResetPasswordProps {
  onDone: () => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onDone, addToast }) => {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      addToast('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    if (password !== confirmar) {
      addToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      addToast('Contraseña actualizada correctamente.', 'success');
      onDone();
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      addToast(err?.message || 'No se pudo actualizar la contraseña.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Elige una contraseña nueva para tu cuenta (mínimo 8 caracteres).
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nueva contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
