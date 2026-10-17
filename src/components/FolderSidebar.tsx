/**
 * Componente de barra lateral y selector de carpetas, favoritos, recientes, papelera y tareas
 */
import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Layers,
  Inbox,
  Plus,
  X,
  Star,
  Clock,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { Documento, TipoFiltro } from '../types';

interface FolderSidebarProps {
  documentos: Documento[];
  documentosBorrados: Documento[];
  favoritosIds: string[];
  recientesIds: string[];
  filtroActual: TipoFiltro | string | null; // null = todos, 'sin_carpeta' = sin carpeta, 'favoritos', 'recientes', 'papelera', o nombre carpeta
  activeMainTab: 'documentos' | 'tareas';
  onSelectFiltro: (filtro: TipoFiltro | string | null, mainTab?: 'documentos' | 'tareas') => void;
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
  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Documentos activos (eliminado_en is null)
  const docsActivos = documentos.filter((d) => !d.eliminado_en);

  const carpetasDocs = Array.from(
    new Set(docsActivos.map((d) => d.carpeta).filter((c): c is string => Boolean(c)))
  );
  const todasLasCarpetas = Array.from(new Set([...carpetasDocs, ...carpetasLocales])).sort();

  const totalCount = docsActivos.length;
  const sinCarpetaCount = docsActivos.filter((d) => !d.carpeta).length;
  const favoritosCount = docsActivos.filter((d) => favoritosIds.includes(d.id)).length;
  const recientesCount = docsActivos.filter((d) => recientesIds.includes(d.id)).length;
  const papeleraCount = documentosBorrados.length;

  const countPorCarpeta = (carpeta: string) => {
    return docsActivos.filter((d) => d.carpeta === carpeta).length;
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
          {/* Navegación Principal (Documentos vs Tareas) */}
          <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onSelectFiltro(null, 'documentos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeMainTab === 'documentos' && filtroActual !== 'papelera'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Documentos</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                activeMainTab === 'documentos' && filtroActual !== 'papelera' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => onSelectFiltro(null, 'tareas')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeMainTab === 'tareas'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Tareas</span>
              </div>
            </button>
          </div>

          {/* Sección si estamos en Documentos */}
          {activeMainTab === 'documentos' && (
            <>
              {/* Accesos rápidos: Favoritos, Recientes, Papelera */}
              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSelectFiltro('favoritos', 'documentos')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    filtroActual === 'favoritos'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Favoritos</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    filtroActual === 'favoritos' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {favoritosCount}
                  </span>
                </button>

                <button
                  onClick={() => onSelectFiltro('recientes', 'documentos')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    filtroActual === 'recientes'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Recientes</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    filtroActual === 'recientes' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {recientesCount}
                  </span>
                </button>

                <button
                  onClick={() => onSelectFiltro('papelera', 'documentos')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    filtroActual === 'papelera'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Papelera</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    filtroActual === 'papelera' ? 'bg-rose-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {papeleraCount}
                  </span>
                </button>
              </div>

              {/* Carpetas */}
              <div className="space-y-3">
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
                    onClick={() => onSelectFiltro(null, 'documentos')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      filtroActual === null && activeMainTab === 'documentos'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4" />
                      <span>Todos</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      filtroActual === null && activeMainTab === 'documentos' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {totalCount}
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectFiltro('sin_carpeta', 'documentos')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      filtroActual === 'sin_carpeta'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Inbox className="w-4 h-4" />
                      <span>Sin carpeta</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      filtroActual === 'sin_carpeta' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {sinCarpetaCount}
                    </span>
                  </button>

                  {todasLasCarpetas.map((c) => {
                    const count = countPorCarpeta(c);
                    const isActive = filtroActual === c;
                    return (
                      <button
                        key={c}
                        onClick={() => onSelectFiltro(c, 'documentos')}
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
            </>
          )}
        </div>
      </aside>

      {/* Versión Celular/Tablet: Fila horizontal desplazable */}
      <div className="block lg:hidden overflow-x-auto pb-2 space-y-2">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => onSelectFiltro(null, 'documentos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeMainTab === 'documentos' && filtroActual !== 'papelera'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Documentos ({totalCount})</span>
          </button>

          <button
            onClick={() => onSelectFiltro(null, 'tareas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeMainTab === 'tareas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tareas</span>
          </button>
        </div>

        {activeMainTab === 'documentos' && (
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => onSelectFiltro('favoritos', 'documentos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'favoritos'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Favoritos ({favoritosCount})</span>
            </button>

            <button
              onClick={() => onSelectFiltro('recientes', 'documentos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'recientes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recientes ({recientesCount})</span>
            </button>

            <button
              onClick={() => onSelectFiltro('papelera', 'documentos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'papelera'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Papelera ({papeleraCount})</span>
            </button>

            <button
              onClick={() => onSelectFiltro(null, 'documentos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Todos</span>
            </button>

            <button
              onClick={() => onSelectFiltro('sin_carpeta', 'documentos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filtroActual === 'sin_carpeta'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Sin carpeta</span>
            </button>

            {todasLasCarpetas.map((c) => {
              const count = countPorCarpeta(c);
              const isActive = filtroActual === c;
              return (
                <button
                  key={c}
                  onClick={() => onSelectFiltro(c, 'documentos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-medium shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva carpeta</span>
            </button>
          </div>
        )}

        {creando && (
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2">
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
