/**
 * Componente de Tabla de Documentos con buscador, filtros, ordenamiento, favoritos, nombres y moderación de admin
 */
import React, { useState } from 'react';
import { Documento, TipoFiltro, Ordenamiento } from '../types';
import { formatearTamano, formatearFecha, obtenerNombreUsuario } from '../utils';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
  Search,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Edit2,
  FolderInput,
  AlertTriangle,
  FolderOpen,
  Folder,
  Star,
} from 'lucide-react';

interface DocumentListProps {
  documentos: Documento[];
  currentUserId: string;
  favoritosIds: string[];
  directorioMap: Record<string, { nombre: string | null; email: string }>;
  cargando: boolean;
  isAdmin: boolean;
  onToggleFavorito: (docId: string) => void;
  onRefresh: () => void;
  onDownload: (doc: Documento) => void;
  onPreview: (doc: Documento) => void;
  onRename: (doc: Documento) => void;
  onMove: (doc: Documento) => void;
  onDelete: (doc: Documento) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documentos,
  currentUserId,
  favoritosIds,
  directorioMap,
  cargando,
  isAdmin,
  onToggleFavorito,
  onRefresh,
  onDownload,
  onPreview,
  onRename,
  onMove,
  onDelete,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos');
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>('recientes');
  const [docAEliminar, setDocAEliminar] = useState<Documento | null>(null);

  const documentosFiltrados = documentos.filter((doc) => {
    const coincideNombre = doc.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = tipoFiltro === 'todos' || doc.tipo === tipoFiltro;
    return coincideNombre && coincideTipo;
  });

  const documentosOrdenados = [...documentosFiltrados].sort((a, b) => {
    if (ordenamiento === 'recientes') {
      return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime();
    }
    if (ordenamiento === 'antiguos') {
      return new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime();
    }
    if (ordenamiento === 'nombre_asc') {
      return a.nombre.localeCompare(b.nombre);
    }
    if (ordenamiento === 'tamano_desc') {
      return (b.tamano || 0) - (a.tamano || 0);
    }
    return 0;
  });

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

  const confirmarBorrado = (doc: Documento) => {
    setDocAEliminar(doc);
  };

  const ejecutarBorrado = () => {
    if (docAEliminar) {
      onDelete(docAEliminar);
      setDocAEliminar(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar documentos por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as TipoFiltro)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          >
            <option value="todos">Todos los tipos</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="imagen">Imágenes</option>
            <option value="otro">Otros</option>
          </select>

          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value as Ordenamiento)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="tamano_desc">Tamaño mayor</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors shrink-0"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {cargando && documentos.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            Cargando documentos...
          </div>
        ) : documentosOrdenados.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FolderOpen className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              No se encontraron documentos
            </p>
            <p className="text-xs text-slate-400">
              Prueba con otro término de búsqueda o sube un nuevo archivo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Fav</th>
                  <th className="py-3.5 px-6">Documento</th>
                  <th className="py-3.5 px-6">Carpeta</th>
                  <th className="py-3.5 px-6">Tipo</th>
                  <th className="py-3.5 px-6">Tamaño</th>
                  <th className="py-3.5 px-6">Subido por</th>
                  <th className="py-3.5 px-6">Fecha</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {documentosOrdenados.map((doc) => {
                  const esMio = doc.subido_por === currentUserId;
                  const puedeEditar = esMio || isAdmin;
                  const esFavorito = favoritosIds.includes(doc.id);
                  const esVisualizable =
                    doc.tipo === 'pdf' ||
                    doc.tipo === 'imagen' ||
                    /\.(pdf|png|jpg|jpeg|gif|webp|svg)$/i.test(doc.nombre);
                  const subidoPorNombre = obtenerNombreUsuario(doc.subido_por || doc.subido_por_email, directorioMap);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => onToggleFavorito(doc.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            esFavorito
                              ? 'text-amber-500'
                              : 'text-slate-300 dark:text-slate-700 hover:text-amber-400'
                          }`}
                          title={esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        >
                          <Star className={`w-4 h-4 ${esFavorito ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                            {getIconoTipo(doc.tipo)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white truncate">
                                {doc.nombre}
                              </span>
                              {esMio && (
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold rounded-md shrink-0">
                                  Mío
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                        {doc.carpeta ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                            <Folder className="w-3.5 h-3.5 text-indigo-500" />
                            {doc.carpeta}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin carpeta</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 capitalize text-xs">
                        {doc.tipo}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs tabular-nums">
                        {formatearTamano(doc.tamano)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs truncate max-w-[180px]">
                        {subidoPorNombre}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs tabular-nums whitespace-nowrap">
                        {formatearFecha(doc.creado_en)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {esVisualizable && (
                            <button
                              onClick={() => onPreview(doc)}
                              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Vista previa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDownload(doc)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {puedeEditar && (
                            <>
                              <button
                                onClick={() => onRename(doc)}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Cambiar nombre"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onMove(doc)}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Mover a carpeta"
                              >
                                <FolderInput className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => confirmarBorrado(doc)}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Borrar documento"
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

      {docAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ¿Enviar a la papelera?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              El documento <strong className="text-slate-900 dark:text-white">{docAEliminar.nombre}</strong> será enviado a la papelera. Podrás restaurarlo posteriormente desde allí.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDocAEliminar(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarBorrado}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Sí, enviar a papelera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
