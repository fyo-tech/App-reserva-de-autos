
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- ADVERTENCIA DE SEGURIDAD ---
// Insertar credenciales directamente en el código no es seguro y no se recomienda para producción.
// Tus claves API pueden ser vistas por cualquiera que inspeccione el código de la página web.
// La mejor práctica es utilizar variables de entorno (Secrets).
const supabaseUrl = "https://vkefaieebnoxepkfunnw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZWZhaWVlYm5veGVwa2Z1bm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODQwNDcsImV4cCI6MjA3MjY2MDA0N30.Uw8GFmctnGUhmbLB_o31v-_xFSGaUDdgQLks_si7mVY";

let supabase: SupabaseClient | null = null;
let supabaseError: string | null = null;

try {
  // Se añade persistSession: false para evitar errores de 'Failed to fetch' en entornos 
  // que bloquean cookies de terceros o almacenamiento local (como iframes de vista previa).
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
} catch (error: any) {
  supabaseError = 'Las credenciales de Supabase no son válidas o hubo un error al inicializar el cliente.';
  console.error("Supabase client creation error:", error);
}

export { supabase, supabaseError };