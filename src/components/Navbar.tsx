/**
 * Componente Navbar (Barra superior) con rol, campanita de notificaciones y perfil
 */
import React from 'react';
import { FileText, LogOut, Moon, Sun, User, Shield } from 'lucide-react';
import { obtenerNombreUsuario } from '../utils';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  userEmail: string;
  userId: string;
  userRole: string;
  directorioMap: Record<string, { nombre: string | null; email: string }>;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  onNavigateToTask: (tareaId: string) => void;
  onLogout: () => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  userId,
  userRole,
  directorioMap,
  darkMode,
  onToggleDarkMode,
  onOpenProfile,
  onNavigateToTask,
  onLogout,
  addToast,
}) => {
  const nombreUsuario = obtenerNombreUsuario(userId || userEmail, directorioMap);

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return { texto: 'Administrador', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' };
      case 'supervisor':
        return { texto: 'Supervisor', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' };
      default:
        return { texto: 'Usuario', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const rolInfo = getRolBadge(userRole);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Marca / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              GestiónDoc
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Repositorio Documental y Tareas
            </p>
          </div>
        </div>

        {/* Zona derecha: Campanita, Perfil, Rol, Modo oscuro y Cerrar sesión */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NotificationBell
            userId={userId}
            onNavigateToTask={onNavigateToTask}
            addToast={addToast}
          />

          <button
            onClick={onOpenProfile}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Abrir Mi Perfil"
          >
            <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="max-w-[140px] truncate font-medium">{nombreUsuario}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${rolInfo.color}`}>
              {rolInfo.texto}
            </span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-xs font-semibold"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
