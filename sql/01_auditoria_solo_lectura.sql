-- =====================================================================
-- GestiónDoc · AUDITORÍA (solo lectura, no modifica nada)
-- Ejecuta cada bloque en Supabase > SQL Editor y pega los resultados.
-- =====================================================================

-- 1) Tablas y columnas que usa la app
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('perfiles','documentos','favoritos','documentos_recientes',
                     'tareas','tarea_comentarios','notificaciones','directorio')
order by table_name, ordinal_position;

-- 2) ¿RLS activado en cada tabla? (todas deben ser true; "directorio" puede ser vista)
select c.relname as tabla, c.relkind, c.relrowsecurity as rls_activo
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','v')
order by c.relname;

-- 3) Políticas RLS existentes
select tablename, policyname, cmd, roles, qual as using_expr, with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 4) Políticas de Storage (bucket "documentos")
select policyname, cmd, qual as using_expr, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects';

-- 5) Bucket "documentos": debe ser PRIVADO (public = false)
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets;

-- 6) Funciones RPC y triggers que usa la app
select p.proname, pg_get_function_arguments(p.oid) as args, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('enviar_aviso','asignar_rol_por_correo');

select event_object_table as tabla, trigger_name, event_manipulation, action_timing
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

-- 7) Realtime: tablas publicadas (la app escucha documentos, tareas, notificaciones, tarea_comentarios)
select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';
