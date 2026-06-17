// Middleware: exige un token Bearer válido emitido por Supabase Auth.
// Usa supabaseAuth (no el cliente de BD) para no tocar la sesión del cliente
// que hace las consultas con service_role.
import { supabaseAuth } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Falta el token Bearer' });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.user = data.user; // { id, email, ... }
  next();
}
