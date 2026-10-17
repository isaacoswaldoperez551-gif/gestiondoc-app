/**
 * Modal para Crear o Editar Tarea con adjunto de documento opcional
 */
import React, { useState } from 'react';
import { Tarea, Documento, DirectoriUser } from '../types';
import { obtenerNombreUsuario } from '../utils';
import { X, CheckSquare, Loader2, FileText, Search } from 'lucide-react';

interface TaskModalProps {
  tarea?: Tarea | null;
  documentos: Documento[];
  directorioUsers: DirectoriUser[];
  currentUserId: string;
  onClose: () => void;
  onSave: (datos: Partial<Tarea>) => Promise<void>;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  tarea,
  documentos,
  directorioUsers,
  currentUserId,
  onClose,
  onSave,
  addToast,
}) => {
  const [titulo, setTitulo] = useState(tarea?.titulo || '');
  const [descripcion, setDescripcion] = useState(tarea?.descripcion || '');
  const [estado, setEstado] = useState<'pendiente' | 'en_progreso' | 'completada'>(
    tarea?.estado || 'pendiente'
  );
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta'>(
    tarea?.prioridad || 'media'
  );
  const [fechaLimite, setFechaLimite] = useState(tarea?.fecha_limite || '');
  const [asignadoA, setAsignadoA] = useState(tarea?.asignado_a || currentUserId);
  const [documentoId, setDocumentoId] = useState<string | null>(
    tarea?.documento_id || null
  );

  const [busquedaDoc, setBusquedaDoc] = useState('');
  const [cargando, setCargando] = useState(false);

  const documentosActivos = documentos.filter(
    (d) =>
      !d.eliminado_en &&
      d.nombre.toLowerCase().includes(busquedaDoc.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      addToast('El título de la tarea es obligatorio.', 'error');
      return;
    }

    setCargando(true);
    try {
      await onSave({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        estado,
        prioridad,
        fecha_limite: fechaLimite || undefined,
        asignado_a: asignadoA,
        documento_id: documentoId,
      });
      onClose();
    } catch (err: any) {
      console.error('Error al guardar tarea:', err);
      addToast(err?.message || 'Error al guardar la tarea.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const docSeleccionado = documentos.find((d) => d.id === documentoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <CheckSquare className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {tarea ? 'Editar Tarea' : 'Nueva Tarea'}
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
              Título *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la tarea"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles de la tarea..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Fecha límite
              </label>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Asignado a
              </label>
              <select
                value={asignadoA}
                onChange={(e) => setAsignadoA(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {directorioUsers.map((u) => {
                  const nombre = obtenerNombreUsuario(u.id, {
                    [u.id]: { nombre: u.nombre, email: u.email },
                  });
                  return (
                    <option key={u.id} value={u.id}>
                      {nombre} ({u.email})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Adjuntar documento (opcional) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Adjuntar documento (opcional)
            </label>

            {docSeleccionado ? (
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 truncate">
                    {docSeleccionado.nombre}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocumentoId(null)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline shrink-0 font-medium ml-2"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={busquedaDoc}
                    onChange={(e) => setBusquedaDoc(e.target.value)}
                    placeholder="Buscar documento para adjuntar..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50/50 dark:bg-slate-800/30">
                  {documentosActivos.length === 0 ? (
                    <p className="text-center py-3 text-xs text-slate-400">
                      No hay documentos disponibles
                    </p>
                  ) : (
                    documentosActivos.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDocumentoId(d.id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-xs text-left transition-colors"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {d.nombre}
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 ml-2">
                          Adjuntar
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
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
              Guardar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
