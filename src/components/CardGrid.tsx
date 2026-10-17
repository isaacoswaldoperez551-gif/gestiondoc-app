/**
 * Vista de tarjetas en cuadrícula para documentos con miniaturas, favoritos y nombres de usuario
 */
import React, { useState, useEffect } from 'react';
import { Documento } from '../types';
import { supabase } from '../supabase';
import { formatearTamano, formatearFecha, obtenerNombreUsuario } from '../utils';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
  Eye,
  Download,
  Edit2,
  FolderInput,
  Trash2,
  Folder,
  Star,
} from 'lucide-react';

interface CardGridProps {
  documentos: Documento[];
  currentUserId: string;
  favoritosIds: string[];
  directorioMap: Record<string, { nombre: string | null; email: string }>;
  onToggleFavorito: (docId: string) => void;
  onDownload: (doc: Documento) => void;
  onPreview: (doc: Documento) => void;
  onRename: (doc: Documento) => void;
  onMove: (doc: Documento) => void;
  onDelete: (doc: Documento) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  documentos,
  currentUserId,
  favoritosIds,
  directorioMap,
  onToggleFavorito,
  onDownload,
  onPreview,
  onRename,
  onMove,
  onDelete,
}) => {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const cargarMiniaturas = async () => {
      const imagenes = documentos.filter(
        (doc) =>
          doc.tipo === 'imagen' ||
          /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(doc.nombre)
      );

      if (imagenes.length === 0) return;

      const rutas = imagenes.map((img) => img.ruta);
      try {
        const { data, error } = await supabase.storage
          .from('documentos')
          .createSignedUrls(rutas, 3600);

        if (!error && data) {
          const mapa: Record<string, string> = {};
          data.forEach((item) => {
            if (item.path && item.signedUrl) {
              mapa[item.path] = item.signedUrl;
            }
          });
          setSignedUrls(mapa);
        }
      } catch (err) {
        console.error('Error al cargar miniaturas de imágenes:', err);
      }
    };

    cargarMiniaturas();
  }, [documentos]);

  const getGradienteYIcono = (tipo: string, nombre: string) => {
    const esImg = tipo === 'imagen' || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(nombre);
    if (tipo === 'pdf' || /\.pdf$/i.test(nombre)) {
      return {
        gradient: 'bg-gradient-to-br from-rose-500 to-red-600 text-white',
        icon: <FileText className="w-8 h-8 text-white/90" />,
      };
    }
    if (tipo === 'word' || /\.(doc|docx)$/i.test(nombre)) {
      return {
        gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
        icon: <FileCode className="w-8 h-8 text-white/90" />,
      };
    }
    if (tipo === 'excel' || /\.(xls|xlsx|csv)$/i.test(nombre)) {
      return {
        gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
        icon: <FileSpreadsheet className="w-8 h-8 text-white/90" />,
      };
    }
    if (esImg) {
      return {
        gradient: 'bg-gradient-to-br from-purple-500 to-pink-600 text-white',
        icon: <ImageIcon className="w-8 h-8 text-white/90" />,
      };
    }
    return {
      gradient: 'bg-gradient-to-br from-slate-600 to-slate-700 text-white',
      icon: <File className="w-8 h-8 text-white/90" />,
    };
  };

  if (documentos.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          No hay documentos en esta sección
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {documentos.map((doc) => {
        const esMio = doc.subido_por === currentUserId;
        const esFavorito = favoritosIds.includes(doc.id);
        const esImg = doc.tipo === 'imagen' || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(doc.nombre);
        const esPdf = doc.tipo === 'pdf' || /\.pdf$/i.test(doc.nombre);
        const esVisualizable = esImg || esPdf;
        const miniaturaUrl = signedUrls[doc.ruta];
        const { gradient, icon } = getGradienteYIcono(doc.tipo, doc.nombre);
        const subidoPorNombre = obtenerNombreUsuario(doc.subido_por || doc.subido_por_email, directorioMap);

        return (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
          >
            {/* Zona superior de 144px */}
            <div className={`relative h-36 ${gradient} flex items-center justify-center overflow-hidden`}>
              {esImg && miniaturaUrl ? (
                <img
                  src={miniaturaUrl}
                  alt={doc.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  {icon}
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                    {doc.tipo}
                  </span>
                </div>
              )}

              {/* Botón Favorito (estrella) */}
              <button
                onClick={() => onToggleFavorito(doc.id)}
                className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors ${
                  esFavorito
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-black/30 text-white/80 hover:text-white'
                }`}
                title={esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
              >
                <Star className={`w-4 h-4 ${esFavorito ? 'fill-white' : ''}`} />
              </button>

              {/* Insignia Mío y Carpeta */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {esMio && (
                  <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold rounded-md">
                    Mío
                  </span>
                )}
                {doc.carpeta && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold rounded-md">
                    <Folder className="w-3 h-3" />
                    {doc.carpeta}
                  </span>
                )}
              </div>
            </div>

            {/* Contenido inferior */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3
                  className="text-sm font-bold text-slate-900 dark:text-white truncate"
                  title={doc.nombre}
                >
                  {doc.nombre}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="tabular-nums">{formatearTamano(doc.tamano)}</span>
                  <span className="tabular-nums">{formatearFecha(doc.creado_en)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate" title={subidoPorNombre}>
                  Subido por: {subidoPorNombre}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1">
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
                </div>

                <div className="flex items-center gap-1">
                  {esMio && (
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
                        onClick={() => onDelete(doc)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Borrar documento (se puede restaurar desde la papelera)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
