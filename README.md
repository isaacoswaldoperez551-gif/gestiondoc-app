# GestiónDoc

Gestión de documentos, tareas y avisos con React + Vite + Tailwind y Supabase (Auth, Postgres con RLS, Storage, Realtime).

## Capas
1. **Base de datos / SQL**: `sql/` (auditoría de solo lectura y endurecimiento ya aplicado).
2. **Backend**: Supabase (tablas `perfiles`, `documentos`, `favoritos`, `documentos_recientes`, `tareas`, `tarea_comentarios`, `notificaciones`, vista `directorio`; RPC `enviar_aviso` y `asignar_rol_por_correo`; bucket privado `documentos`).
3. **Frontend**: `src/`.

## Desarrollo local
```bash
cp .env.example .env.local   # completa VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
```

## Despliegue (GitHub Pages)
El workflow `.github/workflows/publicar.yml` construye desde la raíz y publica `dist/`.
Opcional: define `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en *Settings → Secrets and variables → Actions → Variables*.

En Supabase → Authentication → URL Configuration agrega la URL de la página publicada a **Redirect URLs** (necesario para recuperar contraseña).

## Seguridad
Solo se usa la clave pública (publishable). Nunca pongas la `service_role` en el frontend; la seguridad real vive en las políticas RLS.
