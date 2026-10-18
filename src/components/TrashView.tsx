/**
 * Componente de la Papelera de Documentos
 */
import React from 'react';
import { Documento } from '../types';
import { formatearTamano, formatearFecha, clasificarTipo } from '../utils';
import { Trash2, RotateCcw, AlertTriangle, FileText } from 'lucide-react';

interface TrashViewProps {
  documentosBorrados: Documento[];
  currentUserId: string;
  isAdmin: boolean;
  directorioMap: Record<string, { nombre: string | null; email: string }>;
  onRestaurar: (doc: Documento) => Promise<void>;
  onEliminarPermanente: (doc: Documento) => Promise<void>;
  onVaciarPapelera: () => Promise<void>;
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Papelera de Reciclaje
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Documentos eliminados que puedes restaurar o borrar permanentemente.
            </p>
          </div>
        </div>

        {documentosBorrados.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de vaciar toda la papelera?')) {
                onVaciarPapelera();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar Papelera
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {documentosBorrados.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Trash2 className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              La papelera está vacía
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Nombre</th>
                  <th className="py-3.5 px-6">Tamaño</th>
                  <th className="py-3.5 px-6">Eliminado el</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {documentosBorrados.map((doc) => {
                  const puedeModificar = isAdmin || doc.subido_por === currentUserId;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{doc.nombre}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatearTamano(doc.tamano)}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatearFecha(doc.eliminado_en || '')}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {puedeModificar ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onRestaurar(doc)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl text-xs font-semibold transition-colors"
                              title="Restaurar documento"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restaurar
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar permanentemente "${doc.nombre}"?`)) {
                                  onEliminarPermanente(doc);
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-xs font-semibold transition-colors"
                              title="Eliminar permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Borrar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Solo lectura</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
