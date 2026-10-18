/**
 * Funciones de utilidad para GestiónDoc
 */

export function limpiarNombre(nombre: string): string {
  const lastDotIndex = nombre.lastIndexOf('.');
  let namePart = nombre;
  let extPart = '';
  
  if (lastDotIndex !== -1) {
    namePart = nombre.substring(0, lastDotIndex);
    extPart = nombre.substring(lastDotIndex).toLowerCase();
  }

  const cleanName = namePart
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return (cleanName || 'archivo') + extPart;
}

export function formatearTamano(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

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

export function evaluarVencimiento(fechaStr?: string | null): { etiqueta: string; color: string } | null {
  if (!fechaStr) return null;
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    const fechaLimite = new Date(anio, mes - 1, dia);
    fechaLimite.setHours(0, 0, 0, 0);

    const diffTime = fechaLimite.getTime() - hoy.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { etiqueta: 'vencida', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
    } else if (diffDays === 0) {
      return { etiqueta: 'vence hoy', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
    } else if (diffDays === 1) {
      return { etiqueta: 'vence mañana', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
    }
    return null;
  } catch {
    return null;
  }
}

export function obtenerNombreUsuario(userIdOrEmail: string, directorioMap: Record<string, { nombre: string | null; email: string }>): string {
  if (!userIdOrEmail) return 'Usuario';
  const info = directorioMap[userIdOrEmail];
  if (info) {
    if (info.nombre && info.nombre.trim()) return info.nombre;
    if (info.email) return info.email.split('@')[0];
  }
  if (userIdOrEmail.includes('@')) {
    return userIdOrEmail.split('@')[0];
  }
  return 'Usuario';
}
