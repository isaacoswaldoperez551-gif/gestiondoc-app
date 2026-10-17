/**
 * Funciones de utilidad para GestiónDoc
 */

/**
 * Limpia un nombre de archivo eliminando acentos, espacios y caracteres especiales
 * para cumplir con la ruta requerida en Supabase Storage.
 */
export function limpiarNombre(nombre: string): string {
  // Separar nombre y extensión
  const lastDotIndex = nombre.lastIndexOf('.');
  let namePart = nombre;
  let extPart = '';
  
  if (lastDotIndex !== -1) {
    namePart = nombre.substring(0, lastDotIndex);
    extPart = nombre.substring(lastDotIndex).toLowerCase();
  }

  // Normalizar acentos (NFD) y eliminar caracteres no alfanuméricos excepto guiones y puntos
  const cleanName = namePart
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '_')   // reemplazar espacios y símbolos por _
    .replace(/_+/g, '_')             // evitar guiones bajos múltiples
    .replace(/^_|_$/g, '');          // quitar guiones al inicio o final

  return (cleanName || 'archivo') + extPart;
}

/**
 * Formatea el tamaño en bytes a KB o MB de forma legible.
 */
export function formatearTamano(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Formatea una fecha ISO a formato legible en español.
 */
export function formatearFecha(fechaIso: string): string {
  if (!fechaIso) return '';
  try {
    const fecha = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  } catch {
    return fechaIso;
  }
}

/**
 * Detecta la categoría de tipo de archivo para iconos y filtros.
 */
export function clasificarTipo(tipoMime: string, nombreArchivo: string): string {
  const mime = (tipoMime || '').toLowerCase();
  const ext = (nombreArchivo.split('.').pop() || '').toLowerCase();

  if (mime.includes('pdf') || ext === 'pdf') return 'pdf';
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    ['doc', 'docx'].includes(ext)
  ) return 'word';
  if (
    mime.includes('excel') ||
    mime.includes('sheet') ||
    mime.includes('csv') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  ) return 'excel';
  if (
    mime.includes('image') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
  ) return 'imagen';

  return 'otro';
}

/**
 * Obtiene el nombre amigable de un usuario a partir de su ID o email usando el directorio.
 * Si no hay nombre, muestra la parte del correo antes de la @.
 */
export function obtenerNombreUsuario(
  identifier: string,
  directorioMap: Record<string, { nombre: string | null; email: string }>
): string {
  if (!identifier) return 'Usuario';
  const userRecord = directorioMap[identifier];
  if (userRecord) {
    if (userRecord.nombre && userRecord.nombre.trim()) {
      return userRecord.nombre.trim();
    }
    if (userRecord.email) {
      return userRecord.email.split('@')[0];
    }
  }
  // Si viene un email directamente
  if (identifier.includes('@')) {
    return identifier.split('@')[0];
  }
  return identifier;
}

/**
 * Evalúa el vencimiento de una tarea para mostrar etiquetas ("Vence hoy", "Vence mañana", "vencida").
 */
export function evaluarVencimiento(fechaLimite?: string): { etiqueta: string; color: string } | null {
  if (!fechaLimite) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);

  const diffTime = limite.getTime() - hoy.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { etiqueta: 'vencida', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
  }
  if (diffDays === 0) {
    return { etiqueta: 'Vence hoy', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
  }
  if (diffDays === 1) {
    return { etiqueta: 'Vence mañana', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
  }
  return null;
}
