/**
 * Modal de Mi Perfil (Editar nombre usando .update y cambiar contraseña)
 */
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { X, User, Lock, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  userId: string;
  userEmail: string;
  nombreActual: string;
  onClose: () => void;
  onUpdateSuccess: () => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userId,
  userEmail,
  nombreActual,
  onClose,
  onUpdateSuccess,
  addToast,
}) => {
  const [nombre, setNombre] = useState(nombreActual || '');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaPassword && nuevaPassword.length < 8) {
      addToast('La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    if (nuevaPassword && nuevaPassword !== confirmarPassword) {
      addToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setCargando(true);
    try {
      // Actualizar nombre en la tabla perfiles usando .update
      const { data, error: perfilError } = await supabase
        .from('perfiles')
        .update({ nombre: nombre.trim() })
        .eq('id', userId)
        .select();

      if (perfilError) throw perfilError;

      if (!data || data.length === 0) {
        throw new Error('No se pudo actualizar el perfil (no se encontró tu registro en perfiles).');
      }

      // Si se ingresó contraseña nueva
      if (nuevaPassword) {
        const { error: passError } = await supabase.auth.updateUser({
          password: nuevaPassword,
        });
        if (passError) throw passError;
      }

      addToast('Perfil actualizado correctamente.', 'success');
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      addToast(err?.message || 'Error al actualizar el perfil.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <User className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mi Perfil
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              disabled
              value={userEmail}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nombre Completo / Mostrar
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Cambiar Contraseña (opcional)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Nueva contraseña (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
