/**
 * Componente de la pestaña Equipo (Solo Admin y Supervisor) con estadísticas, avance por persona y seguimiento
 */
import React, { useState } from 'react';
import { Tarea, Documento, DirectoriUser } from '../types';
import { evaluarVencimiento, obtenerNombreUsuario } from '../utils';
import {
  Users,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Trash2,
  FileText,
  MessageSquare,
  Edit2,
} from 'lucide-react';

interface EquipoViewProps {
  tareas: Tarea[];
  documentos: Documento[];
  directorioUsers: DirectoriUser[];
  currentUserId: string;
  onCambiarEstado: (tareaId: string, nuevoEstado: 'pendiente' | 'en_progreso' | 'completada') => Promise<void>;
  onEditarTarea: (tarea: Tarea) => void;
  onBorrarTarea: (tareaId: string) => void;
  onAbrirComentarios: (tarea: Tarea) => void;
  onPrevisualizarDoc: (doc: Documento) => void;
  onDescargarDoc: (doc: Documento) => void;
}

export const EquipoView: React.FC<EquipoViewProps> = ({
  tareas,
  documentos,
  directorioUsers,
  currentUserId,
  onCambiarEstado,
  onEditarTarea,
  onBorrarTarea,
  onAbrirComentarios,
  onPrevisualizarDoc,
  onDescargarDoc,
}) => {
  const [filtroPersona, setFiltroPersona] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  // Estadísticas generales
  const totalTareas = tareas.length;
  const pendientesCount = tareas.filter((t) => t.estado === 'pendiente').length;
  const enProgresoCount = tareas.filter((t) => t.estado === 'en_progreso').length;
  const completadasCount = tareas.filter((t) => t.estado === 'completada').length;
  const vencidasCount = tareas.filter((t) => {
    const v = evaluarVencimiento(t.fecha_limite);
    return v && v.etiqueta === 'vencida' && t.estado !== 'completada';
  }).length;

  // Avance por persona
  const estadisticasPorPersona: Record<string, { nombre: string; pendiente: number; enProgreso: number; completada: number; vencida: number; total: number }> = {};

  directorioUsers.forEach((u) => {
    const nombre = obtenerNombreUsuario(u.id, directorioMap);
    estadisticasPorPersona[u.id] = {
      nombre,
      pendiente: 0,
      enProgreso: 0,
      completada: 0,
      vencida: 0,
      total: 0,
    };
  });

  tareas.forEach((t) => {
    const uid = t.asignado_a;
    if (!estadisticasPorPersona[uid]) {
      const nombre = obtenerNombreUsuario(uid, directorioMap);
      estadisticasPorPersona[uid] = { nombre, pendiente: 0, enProgreso: 0, completada: 0, vencida: 0, total: 0 };
    }
    estadisticasPorPersona[uid].total += 1;
    if (t.estado === 'pendiente') estadisticasPorPersona[uid].pendiente += 1;
    if (t.estado === 'en_progreso') estadisticasPorPersona[uid].enProgreso += 1;
    if (t.estado === 'completada') estadisticasPorPersona[uid].completada += 1;

    const v = evaluarVencimiento(t.fecha_limite);
    if (v && v.etiqueta === 'vencida' && t.estado !== 'completada') {
      estadisticasPorPersona[uid].vencida += 1;
    }
  });

  // Tareas filtradas para la tabla de seguimiento
  const tareasFiltradas = tareas.filter((t) => {
    const coincidePersona = filtroPersona === 'todos' || t.asignado_a === filtroPersona;
    const v = evaluarVencimiento(t.fecha_limite);
    const esVencida = v && v.etiqueta === 'vencida' && t.estado !== 'completada';

    let coincideEstado = true;
    if (filtroEstado === 'vencidas') {
      coincideEstado = Boolean(esVencida);
    } else if (filtroEstado !== 'todos') {
      coincideEstado = t.estado === filtroEstado;
    }

    return coincidePersona && coincideEstado;
  });

  return (
    <div className="space-y-8">
      {/* Tarjetas de Resumen del Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tareas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{totalTareas}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pendientes</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{pendientesCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">En Progreso</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{enProgresoCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Completadas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{completadasCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Vencidas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{vencidasCount}</p>
        </div>
      </div>

      {/* Tabla: Avance por Persona */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Avance por Persona
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Persona</th>
                <th className="py-3.5 px-6">Pendientes</th>
                <th className="py-3.5 px-6">En Progreso</th>
                <th className="py-3.5 px-6">Listas</th>
                <th className="py-3.5 px-6">Vencidas</th>
                <th className="py-3.5 px-6">Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {Object.entries(estadisticasPorPersona).map(([uid, stats]) => {
                if (stats.total === 0) return null;
                const porcentaje = stats.total > 0 ? Math.round((stats.completada / stats.total) * 100) : 0;

                return (
                  <tr key={uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {stats.nombre}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 tabular-nums">
                      {stats.pendiente}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 tabular-nums">
                      {stats.enProgreso}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                      {stats.completada}
                    </td>
                    <td className="py-4 px-6 text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                      {stats.vencida}
                    </td>
                    <td className="py-4 px-6 w-48">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                          {porcentaje}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Seguimiento con Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Seguimiento de Tareas del Equipo
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filtroPersona}
              onChange={(e) => setFiltroPersona(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="todos">Todas las personas</option>
              {directorioUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {obtenerNombreUsuario(u.id, directorioMap)}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completadas</option>
              <option value="vencidas">Vencidas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tareasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No hay tareas que coincidan con los filtros
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Título</th>
                  <th className="py-3.5 px-6">Asignado a</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6">Prioridad</th>
                  <th className="py-3.5 px-6">Fecha Límite</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {tareasFiltradas.map((t) => {
                  const vencimiento = evaluarVencimiento(t.fecha_limite);
                  const asignadoNombre = obtenerNombreUsuario(t.asignado_a, directorioMap);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                        {t.titulo}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                        {asignadoNombre}
                      </td>
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                          t.prioridad === 'alta'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : t.prioridad === 'media'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {t.prioridad}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex flex-col gap-1">
                          {t.fecha_limite && <span className="tabular-nums">{t.fecha_limite}</span>}
                          {vencimiento && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold w-max ${vencimiento.color}`}>
                              {vencimiento.etiqueta}
                            </span>
                          )}
                        </div>
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
                          <button
                            onClick={() => onEditarTarea(t)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onBorrarTarea(t.id)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
