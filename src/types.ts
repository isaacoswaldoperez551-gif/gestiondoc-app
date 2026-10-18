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
  eliminado_en?: string | null;
  eliminado_por?: string | null;
}

export interface DirectoriUser {
  id: string;
  nombre: string | null;
  email: string;
  rol?: 'admin' | 'supervisor' | 'usuario';
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  fecha_limite?: string | null;
  asignado_a: string;
  asignado_email: string;
  creado_por: string;
  creado_por_email: string;
  documento_id?: string | null;
  creado_en: string;
  completado_en?: string | null;
}

export interface ComentarioTarea {
  id: string;
  tarea_id: string;
  autor_id: string;
  autor_email: string;
  texto: string;
  creado_en: string;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'tarea' | 'aviso' | 'sistema';
  tarea_id?: string | null;
  leida: boolean;
  creado_en: string;
}

export type TipoFiltro = 'todos' | 'pdf' | 'word' | 'excel' | 'imagen' | 'otro' | 'favoritos' | 'recientes' | 'sin_carpeta' | 'papelera';
export type Ordenamiento = 'recientes' | 'antiguos' | 'nombre_asc' | 'tamano_desc';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'info';
  mensaje: string;
}
