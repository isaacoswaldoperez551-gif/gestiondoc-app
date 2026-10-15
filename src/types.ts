/**
 * Definiciones de tipos para GestiónDoc
 */

export interface Documento {
  id: string;
  nombre: string;
  ruta: string;
  tamano: number;
  tipo: string;
  subido_por: string;
  subido_por_email: string;
  creado_en: string;
  carpeta?: string | null;
}

export type TipoFiltro = 'todos' | 'pdf' | 'word' | 'excel' | 'imagen' | 'otro';

export type Ordenamiento = 'recientes' | 'antiguos' | 'nombre_asc' | 'tamano_desc';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'info';
  mensaje: string;
}
