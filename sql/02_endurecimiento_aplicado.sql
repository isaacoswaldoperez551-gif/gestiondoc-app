-- Migración YA APLICADA en el proyecto GestionDoc (endurecer_funciones_gestiondoc).
-- Se guarda aquí como referencia / para recrear el entorno.

-- Funciones de trigger: no invocables vía /rest/v1/rpc
revoke execute on function public.comentario_antes_insertar() from public, anon, authenticated;
revoke execute on function public.comentario_notificar()      from public, anon, authenticated;
revoke execute on function public.crear_perfil()              from public, anon, authenticated;
revoke execute on function public.sincronizar_correo()        from public, anon, authenticated;
revoke execute on function public.tarea_antes_actualizar()    from public, anon, authenticated;
revoke execute on function public.tarea_antes_insertar()      from public, anon, authenticated;
revoke execute on function public.tarea_notificar()           from public, anon, authenticated;

-- RPC que usa la app: solo usuarios autenticados
revoke execute on function public.mi_rol()                             from public, anon;
revoke execute on function public.enviar_aviso(text, text, text, uuid) from public, anon;
revoke execute on function public.asignar_rol_por_correo(text, text)   from public, anon;
grant  execute on function public.mi_rol()                             to authenticated;
grant  execute on function public.enviar_aviso(text, text, text, uuid) to authenticated;
grant  execute on function public.asignar_rol_por_correo(text, text)   to authenticated;

-- search_path fijo
alter function public.proteger_rol_propio()    set search_path = public;
alter function public.proteger_correo_perfil() set search_path = public;
alter function public.documento_papelera()     set search_path = public;
