// Middleware: exige un token Bearer válido emitido por Supabase Auth.
import { supabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Falta el token Bearer' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.user = data.user; // { id, email, ... }
  next();
}
