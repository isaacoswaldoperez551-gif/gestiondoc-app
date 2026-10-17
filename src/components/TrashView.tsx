/**
 * Componente Papelera de Documentos para GestiónDoc
 */
import React, { useState } from 'react';
import { Documento } from '../types';
import { formatearTamano, formatearFecha, obtenerNombreUsuario } from '../utils';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
} from 'lucide-react';

interface TrashViewProps {
  documentosBorrados: Documento[];
  currentUserId: string;
  isAdmin: boolean;
  directorioMap: Record<string, { nombre: string | null; email: string }>;
  onRestaurar: (doc: Documento) => void;
  onEliminarPermanente: (doc: Documento) => void;
  onVaciarPapelera: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  documentosBorrados,
  currentUserId,
  isAdmin,
  directorioMap,
  onRestaurar,
  onEliminarPermanente,
  onVaciarPapelera,
}) => {
  const [docAEliminar, setDocAEliminar] = useState<Documento | null>(null);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'word':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'imagen':
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-500" />
            Papelera de Documentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Los documentos eliminados se pueden restaurar o borrar permanentemente.
          </p>
        </div>

        {isAdmin && documentosBorrados.length > 0 && (
          <button
            onClick={() => setConfirmarVaciar(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar Papelera
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {documentosBorrados.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FolderOpen className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              La papelera está vacía
            </p>
            <p className="text-xs text-slate-400">
              Los archivos eliminados aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Documento</th>
                  <th className="py-3.5 px-6">Tamaño</th>
                  <th className="py-3.5 px-6">Subido por</th>
                  <th className="py-3.5 px-6">Eliminado por</th>
                  <th className="py-3.5 px-6">Fecha eliminación</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {documentosBorrados.map((doc) => {
                  const nombreSubidoPor = obtenerNombreUsuario(doc.subido_por || doc.subido_por_email, directorioMap);
                  const nombreEliminadoPor = doc.eliminado_por ? obtenerNombreUsuario(doc.eliminado_por, directorioMap) : 'Desconocido';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                            {getIconoTipo(doc.tipo)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                            {doc.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs tabular-nums">
                        {formatearTamano(doc.tamano)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                        {nombreSubidoPor}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                        {nombreEliminadoPor}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs tabular-nums whitespace-nowrap">
                        {formatearFecha(doc.eliminado_en || '')}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRestaurar(doc)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            title="Restaurar documento"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            onClick={() => setDocAEliminar(doc)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
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

      {/* Modal confirmación eliminar permanentemente */}
      {docAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ¿Eliminar permanentemente?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              El documento <strong className="text-slate-900 dark:text-white">{docAEliminar.nombre}</strong> será borrado para siempre del almacenamiento y la base de datos. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDocAEliminar(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEliminarPermanente(docAEliminar);
                  setDocAEliminar(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Sí, eliminar para siempre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar vaciar papelera */}
      {confirmarVaciar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ¿Vaciar toda la papelera?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Se eliminarán permanentemente todos los archivos de la papelera. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmarVaciar(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onVaciarPapelera();
                  setConfirmarVaciar(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Sí, vaciar papelera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
