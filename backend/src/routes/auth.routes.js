// Módulo Auth (Santiago): registro y login vía Supabase Auth.
import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// POST /auth/register  { email, password, display_name }
router.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  // email_confirm: true => el usuario queda confirmado y puede iniciar sesión
  // de inmediato (sin paso de correo). Ideal para el MVP.
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: display_name || null },
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ user: { id: data.user.id, email: data.user.email } });
});

// POST /auth/login  { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  });
});

// POST /auth/refresh  { refresh_token }  -> nueva sesión (renueva el access_token)
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token es obligatorio' });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error || !data?.session) {
    return res
      .status(401)
      .json({ error: error?.message || 'No se pudo refrescar la sesión' });
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  });
});

export default router;
