/**
 * Componente Tablero Kanban para Tareas con Drag & Drop nativo y menú móvil "Mover a..."
 */
import React, { useState } from 'react';
import { Tarea, Documento, DirectoriUser } from '../types';
import { evaluarVencimiento, obtenerNombreUsuario } from '../utils';
import {
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

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
  const [tareaArrastradaId, setTareaArrastradaId] = useState<string | null>(null);

  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  const pendientes = tareas.filter((t) => t.estado === 'pendiente');
  const enProgreso = tareas.filter((t) => t.estado === 'en_progreso');
  const completadas = tareas.filter((t) => t.estado === 'completada');

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setTareaArrastradaId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada') => {
    e.preventDefault();
    const tareaId = e.dataTransfer.getData('text/plain') || tareaArrastradaId;
    if (!tareaId) return;

    const tarea = tareas.find((t) => t.id === tareaId);
    if (tarea && tarea.estado !== nuevoEstado) {
      await onCambiarEstado(tareaId, nuevoEstado);
    }
    setTareaArrastradaId(null);
  };

  const renderCard = (t: Tarea) => {
    const vencimiento = evaluarVencimiento(t.fecha_limite);
    const doc = documentos.find((d) => d.id === t.documento_id);
    const asignadoNombre = obtenerNombreUsuario(t.asignado_a, directorioMap);
    const esMio = t.asignado_a === currentUserId;
    const puedeEditar = esMio || isAdminOrSupervisor;

    return (
      <div
        key={t.id}
        draggable={puedeEditar}
        onDragStart={(e) => handleDragStart(e, t.id)}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {t.titulo}
          </h4>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase shrink-0 ${
              t.prioridad === 'alta'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                : t.prioridad === 'media'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {t.prioridad}
          </span>
        </div>

        {t.descripcion && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {t.descripcion}
          </p>
        )}

        {/* Fechas y recordatorio de vencimiento */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          {t.fecha_limite && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.fecha_limite}</span>
            </div>
          )}
          {vencimiento && (
            <span className={`px-2 py-0.5 rounded-md font-semibold ${vencimiento.color}`}>
              {vencimiento.etiqueta}
            </span>
          )}
        </div>

        {/* Asignado */}
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Asignado a: <strong className="text-slate-900 dark:text-white">{asignadoNombre}</strong>
        </div>

        {/* Documento adjunto */}
        {t.documento_id && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {doc && !doc.eliminado_en ? (
              <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-medium text-indigo-900 dark:text-indigo-200 truncate">
                    {doc.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onPrevisualizarDoc(doc)}
                    className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded text-indigo-600 dark:text-indigo-300"
                    title="Ver documento"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => onDescargarDoc(doc)}
                    className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded text-indigo-600 dark:text-indigo-300"
                    title="Descargar documento"
                  >
                    Descargar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-medium">
                Documento no disponible
              </div>
            )}
          </div>
        )}

        {/* Acciones de tarjeta y menú móvil "Mover a..." */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onAbrirComentarios(t)}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comentarios</span>
          </button>

          {/* Menú alternativo móvil "Mover a..." y edición */}
          <div className="flex items-center gap-1">
            {/* Selector móvil Mover a */}
            <select
              value={t.estado}
              onChange={(e) => onCambiarEstado(t.id, e.target.value as any)}
              className="text-[11px] bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 sm:hidden focus:ring-1 focus:ring-indigo-600"
              title="Mover a..."
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>

            {puedeEditar && (
              <>
                <button
                  onClick={() => onEditarTarea(t)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Editar tarea"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onBorrarTarea(t.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Eliminar tarea"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Columna Pendiente */}
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'pendiente')}
        className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 min-h-[500px]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Pendiente
          </h3>
          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold tabular-nums">
            {pendientes.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {pendientes.map((t) => renderCard(t))}
        </div>
      </div>

      {/* Columna En progreso */}
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'en_progreso')}
        className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 min-h-[500px]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            En progreso
          </h3>
          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold tabular-nums">
            {enProgreso.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {enProgreso.map((t) => renderCard(t))}
        </div>
      </div>

      {/* Columna Completada */}
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'completada')}
        className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 min-h-[500px]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Completada
          </h3>
          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold tabular-nums">
            {completadas.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {completadas.map((t) => renderCard(t))}
        </div>
      </div>
    </div>
  );
};
