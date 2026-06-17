// Cliente de Supabase para el backend.
// Usa la service_role key => salta RLS. NUNCA exponer esta key al cliente Android.
import { createClient } from '@supabase/supabase-js';
import { Agent, fetch as undiciFetch } from 'undici';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}

// Sin keep-alive: cada request abre una conexión fresca a PostgREST. Evita que
// un proceso de larga vida se quede "pegado" a una conexión stale y empiece a
// devolver 0 filas (problema solo en dev local; en Vercel cada request ya corre
// en proceso fresco). El costo de abrir conexión por request es despreciable.
// Importante: usamos el `fetch` del MISMO paquete undici que el Agent (mezclar
// el Agent con el fetch interno de Node rompe con "invalid onRequestStart").
const freshAgent = new Agent({ keepAliveTimeout: 1, keepAliveMaxTimeout: 10 });
const freshFetch = (input, init = {}) =>
  undiciFetch(input, { ...init, dispatcher: freshAgent });

export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: freshFetch },
});
