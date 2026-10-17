/**
 * Componente principal de Gestión de Tareas (Mis tareas, Equipo, List/Tabla y Tablero Kanban)
 */
import React, { useState } from 'react';
import { Tarea, Documento, DirectoriUser } from '../types';
import { evaluarVencimiento, obtenerNombreUsuario, formatearFecha } from '../utils';
import { KanbanBoard } from './KanbanBoard';
import {
  CheckSquare,
  Plus,
  LayoutGrid,
  Table,
  Search,
  FileText,
  MessageSquare,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';

interface TasksViewProps {
  tareas: Tarea[];
  documentos: Documento[];
  directorioUsers: DirectoriUser[];
  currentUserId: string;
  isAdminOrSupervisor: boolean;
  onCrearTarea: () => void;
  onEditarTarea: (tarea: Tarea) => void;
  onCambiarEstado: (tareaId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada') => Promise<void>;
  onBorrarTarea: (tareaId: string) => void;
  onAbrirComentarios: (tarea: Tarea) => void;
  onPrevisualizarDoc: (doc: Documento) => void;
  onDescargarDoc: (doc: Documento) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tareas,
  documentos,
  directorioUsers,
  currentUserId,
  isAdminOrSupervisor,
  onCrearTarea,
  onEditarTarea,
  onCambiarEstado,
  onBorrarTarea,
  onAbrirComentarios,
  onPrevisualizarDoc,
  onDescargarDoc,
}) => {
  const [subTab, setSubTab] = useState<'mis_tareas' | 'equipo'>('mis_tareas');
  const [vistaModo, setVistaModo] = useState<'lista' | 'tablero'>(() => {
    try {
      const guardado = localStorage.getItem('gestiondoc_tareas_vista');
      return guardado === 'lista' || guardado === 'tablero' ? guardado : 'lista';
    } catch {
      return 'lista';
    }
  });
  const [busqueda, setBusqueda] = useState('');

  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  const cambiarVista = (modo: 'lista' | 'tablero') => {
    setVistaModo(modo);
    try {
      localStorage.setItem('gestiondoc_tareas_vista', modo);
    } catch (err) {
      console.error('Error al guardar vista de tareas:', err);
    }
  };

  // Filtrar tareas según pestaña
  const tareasFiltradasTab = tareas.filter((t) => {
    if (subTab === 'mis_tareas') {
      return t.asignado_a === currentUserId;
    }
    return true; // equipo muestra todas las tareas visibles
  });

  const tareasFinales = tareasFiltradasTab.filter((t) =>
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (t.descripcion && t.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Cabecera, Sub-pestañas y Botón Nueva Tarea */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Gestión de Tareas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Organiza tu trabajo, asigna pendientes y adjunta documentos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onCrearTarea}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Controles: Sub-tabs, Buscador y Selector de Vista */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('mis_tareas')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'mis_tareas'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mis Tareas
          </button>
          {isAdminOrSupervisor && (
            <button
              onClick={() => setSubTab('equipo')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                subTab === 'equipo'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Equipo
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => cambiarVista('lista')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                vistaModo === 'lista'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista Lista"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => cambiarVista('tablero')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                vistaModo === 'tablero'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista Tablero Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Tablero</span>
            </button>
          </div>
        </div>
      </div>

      {/* Renderizado Vista Lista o Tablero */}
      {vistaModo === 'tablero' ? (
        <KanbanBoard
          tareas={tareasFinales}
          documentos={documentos}
          directorioUsers={directorioUsers}
          currentUserId={currentUserId}
          isAdminOrSupervisor={isAdminOrSupervisor}
          onCambiarEstado={onCambiarEstado}
          onEditarTarea={onEditarTarea}
          onBorrarTarea={onBorrarTarea}
          onAbrirComentarios={onAbrirComentarios}
          onPrevisualizarDoc={onPrevisualizarDoc}
          onDescargarDoc={onDescargarDoc}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {tareasFinales.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <CheckSquare className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-700" />
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                No hay tareas encontradas
              </p>
              <p className="text-xs text-slate-400">
                Crea una nueva tarea para comenzar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Título y Descripción</th>
                    <th className="py-3.5 px-6">Estado</th>
                    <th className="py-3.5 px-6">Prioridad</th>
                    <th className="py-3.5 px-6">Fecha Límite</th>
                    <th className="py-3.5 px-6">Asignado a</th>
                    <th className="py-3.5 px-6">Documento Adjunto</th>
                    <th className="py-3.5 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {tareasFinales.map((t) => {
                    const vencimiento = evaluarVencimiento(t.fecha_limite);
                    const doc = documentos.find((d) => d.id === t.documento_id);
                    const asignadoNombre = obtenerNombreUsuario(t.asignado_a, directorioMap);
                    const esMio = t.asignado_a === currentUserId;
                    const puedeEditar = esMio || isAdminOrSupervisor;

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {t.titulo}
                            </span>
                            {t.descripcion && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {t.descripcion}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <select
                            value={t.estado}
                            onChange={(e) => onCambiarEstado(t.id, e.target.value as any)}
                            className={`text-xs font-semibold rounded-lg px-2.5 py-1 border-none focus:ring-2 focus:ring-indigo-600 ${
                              t.estado === 'completada'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : t.estado === 'en_progreso'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="completada">Completada</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                              t.prioridad === 'alta'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : t.prioridad === 'media'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {t.prioridad}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex flex-col gap-1">
                            {t.fecha_limite && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="tabular-nums">{t.fecha_limite}</span>
                              </div>
                            )}
                            {vencimiento && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold w-max ${vencimiento.color}`}>
                                {vencimiento.etiqueta}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                          {asignadoNombre}
                        </td>
                        <td className="py-4 px-6 text-xs">
                          {t.documento_id ? (
                            doc && !doc.eliminado_en ? (
                              <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl w-max">
                                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span className="font-medium text-indigo-900 dark:text-indigo-200 truncate max-w-[120px]">
                                  {doc.nombre}
                                </span>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => onPrevisualizarDoc(doc)}
                                    className="text-[11px] text-indigo-600 dark:text-indigo-300 hover:underline font-medium"
                                  >
                                    Ver
                                  </button>
                                  <span>·</span>
                                  <button
                                    onClick={() => onDescargarDoc(doc)}
                                    className="text-[11px] text-indigo-600 dark:text-indigo-300 hover:underline font-medium"
                                  >
                                    Descargar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                Documento no disponible
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">Sin adjunto</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onAbrirComentarios(t)}
                              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Comentarios"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            {puedeEditar && (
                              <>
                                <button
                                  onClick={() => onEditarTarea(t)}
                                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Editar tarea"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onBorrarTarea(t.id)}
                                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Eliminar tarea"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
