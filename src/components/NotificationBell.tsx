/**
 * Componente de Campanita de Notificaciones en tiempo real para GestiónDoc
 */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { formatearFecha } from '../utils';
import { Bell, CheckCheck, Trash2, ExternalLink, Check } from 'lucide-react';

interface Notificacion {
  id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'tarea' | 'aviso' | 'sistema';
  tarea_id?: string | null;
  leida: boolean;
  creado_en: string;
}

interface NotificationBellProps {
  userId: string;
  onNavigateToTask: (tareaId: string) => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  onNavigateToTask,
  addToast,
}) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    if (!userId) return;

    cargarNotificaciones();

    // Suscripción en tiempo real a INSERT en notificaciones para este usuario
    const canal = supabase
      .channel(`notificaciones:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          const nuevaNoti = payload.new as Notificacion;
          setNotificaciones((prev) => [nuevaNoti, ...prev]);
          addToast(nuevaNoti.titulo, 'info');
        }
      )
      .subscribe();

    // Cerrar menú al hacer clic fuera
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      supabase.removeChannel(canal);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const cargarNotificaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', userId)
        .order('creado_en', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotificaciones(data);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  const marcarComoLeida = async (id: string) => {
    try {
      await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar leída:', err);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('usuario_id', userId)
        .eq('leida', false);

      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      addToast('Todas las notificaciones marcadas como leídas.', 'success');
    } catch (err) {
      console.error('Error al marcar todas leídas:', err);
    }
  };

  const eliminarNotificacion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('notificaciones').delete().eq('id', id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  const handleClickNotificacion = (n: Notificacion) => {
    if (!n.leida) {
      marcarComoLeida(n.id);
    }
    if (n.tarea_id) {
      setAbierto(false);
      onNavigateToTask(n.tarea_id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidasCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center tabular-nums">
            {noLeidasCount > 9 ? '9+' : noLeidasCount}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Cabecera */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Notificaciones
              </h4>
            </div>
            {noLeidasCount > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px]">
            {notificaciones.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No tienes notificaciones
              </div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickNotificacion(n)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                    !n.leida ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      !n.leida ? 'bg-indigo-600' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {n.titulo}
                      </p>
                      <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                        {formatearFecha(n.creado_en)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {n.mensaje}
                    </p>
                    {n.tarea_id && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium pt-0.5">
                        <ExternalLink className="w-3 h-3" /> Ver tarea
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => eliminarNotificacion(n.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
