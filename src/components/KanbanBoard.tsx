/**
 * Tablero Kanban para gestión de tareas con soporte de vencimientos y documentos adjuntos
 */
import React from 'react';
import { Tarea, Documento, DirectoriUser } from '../types';
import { evaluarVencimiento, obtenerNombreUsuario } from '../utils';
import { CheckSquare, Clock, FileText, MessageSquare, Edit2, Trash2 } from 'lucide-react';

interface KanbanBoardProps {
  tareas: Tarea[];
  documentos: Documento[];
  directorioUsers: DirectoriUser[];
  currentUserId: string;
  isAdminOrSupervisor: boolean;
  onCambiarEstado: (tareaId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada') => Promise<void>;
  onEditarTarea: (tarea: Tarea) => void;
  onBorrarTarea: (tareaId: string) => void;
  onAbrirComentarios: (tarea: Tarea) => void;
  onPrevisualizarDoc: (doc: Documento) => void;
  onDescargarDoc: (doc: Documento) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tareas,
  documentos,
  directorioUsers,
  currentUserId,
  isAdminOrSupervisor,
  onCambiarEstado,
  onEditarTarea,
  onBorrarTarea,
  onAbrirComentarios,
  onPrevisualizarDoc,
  onDescargarDoc,
}) => {
  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  const columnas: { id: 'pendiente' | 'en_progreso' | 'completada'; titulo: string; color: string }[] = [
    { id: 'pendiente', titulo: 'Pendientes', color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' },
    { id: 'en_progreso', titulo: 'En Progreso', color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' },
    { id: 'completada', titulo: 'Completadas', color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columnas.map((col) => {
        const tareasColumna = tareas.filter((t) => t.estado === col.id);

        return (
          <div
            key={col.id}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden`}
          >
            <div className={`p-4 border-b border-slate-200 dark:border-slate-800 border-t-4 ${col.color} flex items-center justify-between`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {col.titulo}
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                {tareasColumna.length}
              </span>
            </div>

            <div className="p-4 flex-1 space-y-3 min-h-[350px] overflow-y-auto">
              {tareasColumna.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 italic">
                  No hay tareas en esta columna
                </div>
              ) : (
                tareasColumna.map((t) => {
                  const vencimiento = evaluarVencimiento(t.fecha_limite);
                  const doc = documentos.find((d) => d.id === t.documento_id);

                  return (
                    <div
                      key={t.id}
                      className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm space-y-3 hover:border-indigo-500 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                            {t.titulo}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              t.prioridad === 'alta'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : t.prioridad === 'media'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {t.prioridad}
                          </span>
                        </div>
                        {t.descripcion && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {t.descripcion}
                          </p>
                        )}
                      </div>

                      {t.fecha_limite && (
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="tabular-nums">{t.fecha_limite}</span>
                          </div>
                          {vencimiento && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${vencimiento.color}`}>
                              {vencimiento.etiqueta}
                            </span>
                          )}
                        </div>
                      )}

                      {doc && !doc.eliminado_en && (
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {doc.nombre}
                            </span>
                          </div>
                          <button
                            onClick={() => onPrevisualizarDoc(doc)}
                            className="text-indigo-600 hover:underline font-semibold shrink-0 ml-2"
                          >
                            Ver
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/50 text-xs">
                        <select
                          value={t.estado}
                          onChange={(e) => onCambiarEstado(t.id, e.target.value as any)}
                          className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_progreso">En progreso</option>
                          <option value="completada">Completada</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onAbrirComentarios(t)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors"
                            title="Comentarios"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditarTarea(t)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onBorrarTarea(t.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
