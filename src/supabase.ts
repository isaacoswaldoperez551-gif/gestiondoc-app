/**
 * Cliente de Supabase para GestiónDoc.
 * Lee la configuración desde variables de entorno de Vite (VITE_*).
 * Solo se usa la clave pública (publishable / anon): NUNCA pongas aquí la service_role.
 * La seguridad real la dan las políticas RLS en la base de datos.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bthbpjatoedfkjvwxnuh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_V3eIFgQcsHe_GgnUfSJ4RQ_az75A_0M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
