// Clientes de Supabase para el backend. Usan la service_role key => saltan RLS.
// NUNCA exponer esta key al cliente.
//
// IMPORTANTE — por qué hay DOS clientes (misma key, instancias separadas):
// Las operaciones de auth (signInWithPassword / refreshSession) MUTAN la sesión
// interna del cliente: lo dejan autenticado como el USUARIO. Si después usáramos
// ese mismo cliente para consultar tablas, ya no iría con la service_role sino
// con el token del usuario, y RLS devolvería 0 filas. Por eso:
//   · supabase      -> SOLO consultas a la BD (garments, cart, wishlist, upload).
//                      Su sesión nunca se toca => siempre service_role.
//   · supabaseAuth  -> SOLO operaciones de auth (login, refresh, createUser,
//                      getUser). Que su sesión mute no afecta a las consultas.
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}

const options = { auth: { autoRefreshToken: false, persistSession: false } };

// Cliente para la BD: su sesión nunca se modifica => siempre service_role.
export const supabase = createClient(supabaseUrl, serviceKey, options);

// Cliente aparte SOLO para auth (su sesión puede mutar sin afectar las consultas).
export const supabaseAuth = createClient(supabaseUrl, serviceKey, options);
