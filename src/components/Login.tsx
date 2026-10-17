/**
 * Componente de Inicio de Sesión y Recuperación de Contraseña para GestiónDoc
 */
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail, Loader2, FileText, ArrowLeft, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
  isRecoveryMode?: boolean;
  onRecoveryComplete?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  addToast,
  isRecoveryMode = false,
  onRecoveryComplete,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para recuperación de contraseña
  const [modoOlvido, setModoOlvido] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState('');

  // Estados para nueva contraseña en modo recovery
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Por favor, ingresa tu correo y contraseña.', 'error');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = 'Error al iniciar sesión.';
        if (error.message.includes('Invalid login credentials')) {
          msg = 'Correo electrónico o contraseña incorrectos.';
        } else if (error.message.includes('Email not confirmed')) {
          msg = 'El correo electrónico aún no ha sido confirmado.';
        } else {
          msg = error.message;
        }
        addToast(msg, 'error');
      } else {
        addToast('¡Bienvenido a GestiónDoc!', 'success');
        onLoginSuccess();
      }
    } catch (err: any) {
      addToast(err?.message || 'Error inesperado al iniciar sesión.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleOlvidastePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoRecuperacion.trim()) {
      addToast('Por favor, ingresa tu correo electrónico.', 'error');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        correoRecuperacion.trim(),
        {
          redirectTo: window.location.origin,
        }
      );

      if (error) throw error;

      addToast(
        'Se ha enviado un enlace de recuperación a tu correo electrónico.',
        'success'
      );
      setModoOlvido(false);
      setCorreoRecuperacion('');
    } catch (err: any) {
      console.error('Error al enviar recuperación:', err);
      addToast(err?.message || 'Error al enviar el correo de recuperación.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPassword.length < 8) {
      addToast('La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      addToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaPassword,
      });

      if (error) throw error;

      addToast('¡Contraseña actualizada con éxito!', 'success');
      if (onRecoveryComplete) onRecoveryComplete();
      onLoginSuccess();
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      addToast(err?.message || 'Error al actualizar la contraseña.', 'error');
    } finally {
      setCargando(false);
    }
  };

  // Pantalla de recuperación de contraseña (cuando llega desde el enlace del correo)
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Restablecer Contraseña
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Ingresa tu nueva contraseña (mínimo 8 caracteres)
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleActualizarPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-all"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar nueva contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla de solicitar recuperación de contraseña
  if (modoOlvido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Mail className="w-7 h-7" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recuperar Contraseña
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Ingresa tu correo para recibir las instrucciones de recuperación
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleOlvidastePassword}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={correoRecuperacion}
                  onChange={(e) => setCorreoRecuperacion(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-all"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>

              <button
                type="button"
                onClick={() => setModoOlvido(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            GestiónDoc
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Inicia sesión con tus credenciales corporativas
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setModoOlvido(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-all"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
