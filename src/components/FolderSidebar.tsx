/**
 * Componente de barra lateral y selector de carpetas
 */
import React, { useState } from 'react';
import { Folder, FolderPlus, Layers, Inbox, Plus, X, Star, Clock, Trash2, CheckSquare } from 'lucide-react';
import { Documento, TipoFiltro } from '../types';

interface FolderSidebarProps {
  documentos: Documento[];
  documentosBorrados: Documento[];
  favoritosIds: string[];
  recientesIds: string[];
  filtroActual: TipoFiltro | string | null;
  activeMainTab: string;
  onSelectFiltro: (filtro: TipoFiltro | string | null, tab?: 'documentos' | 'tareas' | 'usuarios' | 'avisos') => void;
  carpetasLocales: string[];
  onCrearCarpeta: (nombre: string) => void;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  documentos,
  documentosBorrados,
  favoritosIds,
  recientesIds,
  filtroActual,
  activeMainTab,
  onSelectFiltro,
  carpetasLocales,
  onCrearCarpeta,
}) => {
  const [nuevaCarpetaAbierta, setNuevaCarpetaAbierta] = useState(false);
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState('');

  // Carpetas extraídas de los documentos + locales
  const carpetasDocs = Array.from(new Set(documentos.map((d) => d.carpeta).filter((c): c is string => Boolean(c))));
  const todasLasCarpetas = Array.from(new Set([...carpetasDocs, ...carpetasLocales]));

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = nombreNuevaCarpeta.trim();
    if (limpio) {
      onCrearCarpeta(limpio);
      setNombreNuevaCarpeta('');
      setNuevaCarpetaAbierta(false);
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-6">
        {/* Navegación principal / pestañas */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Módulos
          </p>
          <button
            onClick={() => onSelectFiltro(null, 'documentos')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeMainTab === 'documentos' && filtroActual === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Documentos</span>
            </div>
            <span className="px-2 py-0.5 bg-white/20 dark:bg-slate-800 rounded-md text-[10px] tabular-nums">
              {documentos.length}
            </span>
          </button>

          <button
            onClick={() => onSelectFiltro(null, 'tareas')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeMainTab === 'tareas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4" />
              <span>Tareas</span>
            </div>
          </button>
        </div>

        {/* Accesos Rápidos */}
        {activeMainTab === 'documentos' && (
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Filtros Rápidos
            </p>
            <button
              onClick={() => onSelectFiltro('favoritos', 'documentos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'favoritos'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4" />
                <span>Favoritos</span>
              </div>
              <span className="text-[10px] tabular-nums">{favoritosIds.length}</span>
            </button>

            <button
              onClick={() => onSelectFiltro('recientes', 'documentos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'recientes'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Recientes</span>
              </div>
              <span className="text-[10px] tabular-nums">{recientesIds.length}</span>
            </button>

            <button
              onClick={() => onSelectFiltro('sin_carpeta', 'documentos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'sin_carpeta'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Sin carpeta</span>
              </div>
              <span className="text-[10px] tabular-nums">
                {documentos.filter((d) => !d.carpeta).length}
              </span>
            </button>
          </div>
        )}

        {/* Carpetas */}
        {activeMainTab === 'documentos' && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Carpetas
              </p>
              <button
                onClick={() => setNuevaCarpetaAbierta(!nuevaCarpetaAbierta)}
                className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                title="Nueva carpeta"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {nuevaCarpetaAbierta && (
              <form onSubmit={handleCrear} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={nombreNuevaCarpeta}
                  onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
                  placeholder="Nombre de carpeta..."
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setNuevaCarpetaAbierta(false)}
                    className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-medium"
                  >
                    Crear
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1">
              {todasLasCarpetas.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400 italic">No hay carpetas</p>
              ) : (
                todasLasCarpetas.map((carpeta) => {
                  const count = documentos.filter((d) => d.carpeta === carpeta).length;
                  const activo = filtroActual === carpeta;

                  return (
                    <button
                      key={carpeta}
                      onClick={() => onSelectFiltro(carpeta, 'documentos')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        activo
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Folder className="w-4 h-4 shrink-0 text-amber-500" />
                        <span className="truncate">{carpeta}</span>
                      </div>
                      <span className="text-[10px] tabular-nums shrink-0">{count}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Papelera */}
        {activeMainTab === 'documentos' && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onSelectFiltro('papelera', 'documentos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                filtroActual === 'papelera'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4" />
                <span>Papelera</span>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-md text-[10px] tabular-nums">
                {documentosBorrados.length}
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
