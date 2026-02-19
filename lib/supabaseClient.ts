
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- ADVERTENCIA DE SEGURIDAD ---
// Insertar credenciales directamente en el código no es seguro y no se recomienda para producción.
// Tus claves API pueden ser vistas por cualquiera que inspeccione el código de la página web.
// La mejor práctica es utilizar variables de entorno (Secrets).
const supabaseUrl = "http://supabasekong-lk4oggo0sc4c0cgocsws8kk8.200.80.204.170.sslip.io";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MTUxOTc0MCwiZXhwIjo0OTI3MTkzMzQwLCJyb2xlIjoiYW5vbiJ9.tgivz9yuZPspCdtZ2NUILQq3t95_qwebJcKjuXR5CXo";

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