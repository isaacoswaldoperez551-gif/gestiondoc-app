/**
 * Modal para mover un documento a una carpeta
 */
import React, { useState } from 'react';
import { Documento } from '../types';
import { X, FolderInput, Loader2, Folder } from 'lucide-react';

interface MoveFolderModalProps {
  documento: Documento | null;
  carpetas: string[];
  onClose: () => void;
  onConfirm: (carpetaDestino: string | null) => Promise<void>;
}

export const MoveFolderModal: React.FC<MoveFolderModalProps> = ({
  documento,
  carpetas,
  onClose,
  onConfirm,
}) => {
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string>(
    documento?.carpeta || ''
  );
  const [cargando, setCargando] = useState(false);

  if (!documento) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await onConfirm(carpetaSeleccionada ? carpetaSeleccionada : null);
      onClose();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <FolderInput className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mover a Carpeta
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Selecciona la carpeta de destino para <span className="text-indigo-600 dark:text-indigo-400">{documento.nombre}</span>
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  carpetaSeleccionada === ''
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="carpeta"
                  checked={carpetaSeleccionada === ''}
                  onChange={() => setCarpetaSeleccionada('')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Folder className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">Sin carpeta</span>
              </label>

              {carpetas.map((c) => (
                <label
                  key={c}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    carpetaSeleccionada === c
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="carpeta"
                    checked={carpetaSeleccionada === c}
                    onChange={() => setCarpetaSeleccionada(c)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <Folder className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              Mover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
