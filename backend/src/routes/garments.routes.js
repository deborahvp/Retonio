// Módulo Catálogo (Diego) + Detalle/máquina de estados (Issabela).
import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /garments?category=&size=&status=   -> catálogo con filtros
router.get('/', async (req, res) => {
  const { category, size, status } = req.query;
  let q = supabase.from('garments').select('*').order('created_at', { ascending: false });

  if (category) q = q.eq('category', category);
  if (size) q = q.eq('size', size);
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /garments/:id   -> detalle de una prenda
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('garments')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Prenda no encontrada' });
  res.json(data);
});

// GET /garments/:id/states  -> historial de estados (máquina de estados)
router.get('/:id/states', async (req, res) => {
  const { data, error } = await supabase
    .from('garment_states')
    .select('*')
    .eq('garment_id', req.params.id)
    .order('changed_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /garments/:id/status  { status, note? }  -> cambia el estado
router.patch('/:id/status', async (req, res) => {
  const { status, note } = req.body;
  const valid = ['available', 'reserved', 'rented', 'in_cleaning', 'retired'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `status inválido. Usa: ${valid.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('garments')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // El trigger ya registró el cambio; si hay nota, la adjuntamos al último estado.
  if (note) {
    const { data: last } = await supabase
      .from('garment_states')
      .select('id')
      .eq('garment_id', req.params.id)
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();
    if (last) {
      await supabase.from('garment_states').update({ note }).eq('id', last.id);
    }
  }

  res.json(data);
});

export default router;
