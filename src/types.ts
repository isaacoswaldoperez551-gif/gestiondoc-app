/**
 * Definiciones de tipos para GestiónDoc (Documentos, Tareas, Comentarios, Favoritos, etc.)
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
  eliminado_en?: string | null;
  eliminado_por?: string | null;
}

export type TipoFiltro = 'todos' | 'pdf' | 'word' | 'excel' | 'imagen' | 'otro' | 'favoritos' | 'recientes' | 'papelera';

export type Ordenamiento = 'recientes' | 'antiguos' | 'nombre_asc' | 'tamano_desc';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'info';
  mensaje: string;
}

export interface DirectoriUser {
  id: string;
  nombre: string | null;
  email: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  fecha_limite?: string;
  asignado_a: string;
  asignado_a_email?: string;
  documento_id?: string | null;
  creado_por?: string;
  creado_en?: string;
}

export interface TareaComentario {
  id: string;
  tarea_id: string;
  autor_id: string;
  autor_email: string;
  texto: string;
  creado_en: string;
}
