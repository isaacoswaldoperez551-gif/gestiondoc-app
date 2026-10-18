/**
 * Modal de comentarios por tarea
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Tarea, ComentarioTarea, DirectoriUser } from '../types';
import { formatearFecha, obtenerNombreUsuario } from '../utils';
import { X, MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';

interface TaskCommentsModalProps {
  tarea: Tarea;
  currentUserId: string;
  isAdmin: boolean;
  directorioUsers: DirectoriUser[];
  onClose: () => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const TaskCommentsModal: React.FC<TaskCommentsModalProps> = ({
  tarea,
  currentUserId,
  isAdmin,
  directorioUsers,
  onClose,
  addToast,
}) => {
  const [comentarios, setComentarios] = useState<ComentarioTarea[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);

  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  useEffect(() => {
    cargarComentarios();

    const canal = supabase
      .channel(`comentarios:${tarea.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tarea_comentarios',
          filter: `tarea_id=eq.${tarea.id}`,
        },
        () => {
          cargarComentarios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [tarea.id]);

  const cargarComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('tarea_comentarios')
        .select('*')
        .eq('tarea_id', tarea.id)
        .order('creado_en', { ascending: true });

      if (!error && data) {
        setComentarios(data);
      }
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    } finally {
      setCargandoLista(false);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;

    setCargando(true);
    try {
      // Al insertar, envía SOLO tarea_id y texto: el servidor pone el autor.
      const { error } = await supabase.from('tarea_comentarios').insert({
        tarea_id: tarea.id,
        texto: limpio,
      });

      if (error) throw error;

      setTexto('');
      addToast('Comentario añadido.', 'success');
      cargarComentarios();
    } catch (err: any) {
      console.error('Error al enviar comentario:', err);
      addToast(err?.message || 'Error al enviar el comentario.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarComentario = async (id: string) => {
    try {
      const { error } = await supabase.from('tarea_comentarios').delete().eq('id', id);
      if (error) throw error;
      addToast('Comentario eliminado.', 'success');
      cargarComentarios();
    } catch (err: any) {
      console.error('Error al eliminar comentario:', err);
      addToast(err?.message || 'Error al eliminar el comentario.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Comentarios de Tarea
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {tarea.titulo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de comentarios */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px] max-h-[350px]">
          {cargandoLista ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Cargando comentarios...
            </div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 italic">
              No hay comentarios en esta tarea aún.
            </div>
          ) : (
            comentarios.map((c) => {
              const autorNombre = obtenerNombreUsuario(c.autor_id || c.autor_email, directorioMap);
              const esMio = c.autor_id === currentUserId;

              return (
                <div
                  key={c.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {autorNombre}
                      {esMio && <span className="ml-1.5 text-indigo-600 font-normal">(Tú)</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {formatearFecha(c.creado_en)}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {c.texto}
                  </p>
                  {(esMio || isAdmin) && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleEliminarComentario(c.id)}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Formulario nuevo comentario */}
        <form onSubmit={handleEnviar} className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <input
            type="text"
            required
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 shrink-0"
            title="Enviar comentario"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
