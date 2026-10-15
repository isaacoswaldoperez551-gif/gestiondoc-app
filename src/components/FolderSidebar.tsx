/**
 * Componente de barra lateral y selector de carpetas
 */
import React, { useState } from 'react';
import { Folder, FolderPlus, Layers, Inbox, Plus, X } from 'lucide-react';
import { Documento } from '../types';

interface FolderSidebarProps {
  documentos: Documento[];
  carpetaSeleccionada: string | null; // null = todos, 'sin_carpeta' = sin carpeta, string = nombre carpeta
  onSelectCarpeta: (carpeta: string | null) => void;
  carpetasLocales: string[];
  onCrearCarpeta: (nombre: string) => void;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  documentos,
  carpetaSeleccionada,
  onSelectCarpeta,
  carpetasLocales,
  onCrearCarpeta,
}) => {
  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Obtener todas las carpetas únicas de los documentos + las vacías de localStorage
  const carpetasDocs = Array.from(
    new Set(documentos.map((d) => d.carpeta).filter((c): c is string => Boolean(c)))
  );
  const todasLasCarpetas = Array.from(new Set([...carpetasDocs, ...carpetasLocales])).sort();

  // Contadores
  const totalCount = documentos.length;
  const sinCarpetaCount = documentos.filter((d) => !d.carpeta).length;

  const countPorCarpeta = (carpeta: string) => {
    return documentos.filter((d) => d.carpeta === carpeta).length;
  };

  const handleCrearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoNombre.trim()) {
      onCrearCarpeta(nuevoNombre.trim());
      setNuevoNombre('');
      setCreando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCreando(false);
      setNuevoNombre('');
    }
  };

  return (
    <>
      {/* Versión Desktop: Panel Lateral */}
      <aside className="hidden lg:block w-64 shrink-0 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Carpetas
            </span>
            <button
              onClick={() => setCreando(true)}
              className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
              title="Nueva carpeta"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {creando && (
            <form onSubmit={handleCrearSubmit} className="space-y-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <input
                type="text"
                placeholder="Nombre de carpeta"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setCreando(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white rounded-md font-medium"
                >
                  Crear
                </button>
              </div>
            </form>
          )}

          <nav className="space-y-1">
            <button
              onClick={() => onSelectCarpeta(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                carpetaSeleccionada === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Todos</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                carpetaSeleccionada === null ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => onSelectCarpeta('sin_carpeta')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                carpetaSeleccionada === 'sin_carpeta'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Sin carpeta</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                carpetaSeleccionada === 'sin_carpeta' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {sinCarpetaCount}
              </span>
            </button>

            {todasLasCarpetas.map((c) => {
              const count = countPorCarpeta(c);
              const isActive = carpetaSeleccionada === c;
              return (
                <button
                  key={c}
                  onClick={() => onSelectCarpeta(c)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 shrink-0" />
                    <span className="truncate">{c}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Versión Celular/Tablet: Fila horizontal desplazable */}
      <div className="block lg:hidden overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => onSelectCarpeta(null)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              carpetaSeleccionada === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos ({totalCount})</span>
          </button>

          <button
            onClick={() => onSelectCarpeta('sin_carpeta')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              carpetaSeleccionada === 'sin_carpeta'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Sin carpeta ({sinCarpetaCount})</span>
          </button>

          {todasLasCarpetas.map((c) => {
            const count = countPorCarpeta(c);
            const isActive = carpetaSeleccionada === c;
            return (
              <button
                key={c}
                onClick={() => onSelectCarpeta(c)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{c} ({count})</span>
              </button>
            );
          })}

          <button
            onClick={() => setCreando(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-medium shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva carpeta</span>
          </button>
        </div>

        {creando && (
          <div className="mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2">
            <input
              type="text"
              placeholder="Nombre de carpeta"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
              autoFocus
            />
            <button
              onClick={() => {
                if (nuevoNombre.trim()) {
                  onCrearCarpeta(nuevoNombre.trim());
                  setNuevoNombre('');
                  setCreando(false);
                }
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
            >
              Crear
            </button>
            <button
              onClick={() => setCreando(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
