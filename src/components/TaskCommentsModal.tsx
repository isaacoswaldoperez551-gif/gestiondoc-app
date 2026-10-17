/**
 * Modal de Comentarios en Tareas con chat en tiempo real y soporte de nombres
 */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Tarea, TareaComentario, DirectoriUser } from '../types';
import { formatearFecha, obtenerNombreUsuario } from '../utils';
import { X, MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';

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
  const [comentarios, setComentarios] = useState<TareaComentario[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  useEffect(() => {
    cargarComentarios();

    // Supabase Realtime en tabla tarea_comentarios
    const canal = supabase
      .channel(`tarea_comentarios:${tarea.id}`)
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comentarios]);

  const cargarComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('tarea_comentarios')
        .select('*')
        .eq('tarea_id', tarea.id)
        .order('creado_en', { ascending: true }); // Del más antiguo al más nuevo

      if (error) throw error;
      setComentarios(data || []);
    } catch (err: any) {
      console.error('Error al cargar comentarios:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;

    const textoComentario = texto.trim();
    setTexto('');
    setEnviando(true);

    try {
      const { error } = await supabase.from('tarea_comentarios').insert({
        tarea_id: tarea.id,
        autor_id: currentUserId,
        autor_email: tarea.asignado_a_email || '', // opcional o guardado
        texto: textoComentario,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error al enviar comentario:', err);
      addToast(err?.message || 'Error al enviar el comentario.', 'error');
      setTexto(textoComentario); // restaurar si falla
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar(e);
    }
  };

  const handleDeleteComentario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tarea_comentarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      addToast('Comentario eliminado.', 'success');
    } catch (err: any) {
      console.error('Error al borrar comentario:', err);
      addToast(err?.message || 'Error al eliminar el comentario.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-xs">
                Comentarios: {tarea.titulo}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {comentarios.length} comentarios
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

        {/* Lista de Comentarios */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {cargando ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Cargando comentarios...
            </div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No hay comentarios en esta tarea aún. ¡Escribe el primero!
            </div>
          ) : (
            comentarios.map((c) => {
              const autorNombre = obtenerNombreUsuario(c.autor_id || c.autor_email, directorioMap);
              const esMio = c.autor_id === currentUserId;

              return (
                <div
                  key={c.id}
                  className={`flex flex-col p-3.5 rounded-2xl border space-y-1.5 ${
                    esMio
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 ml-6'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {autorNombre}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {formatearFecha(c.creado_en)}
                      </span>
                      {(esMio || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComentario(c.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Eliminar comentario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {c.texto}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Cuadro de texto para enviar */}
        <form
          onSubmit={handleEnviar}
          className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
        >
          <textarea
            rows={1}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comentario... (Enter para enviar, Mayús+Enter para salto de línea)"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none max-h-24"
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 shadow-sm"
            title="Enviar comentario"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
