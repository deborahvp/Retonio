// Módulo "Ciclo de Armario" (Deborah): el carrito = batch actual del usuario.
import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // todo el carrito requiere sesión

// GET /cart  -> prendas del batch actual del usuario (con datos de la prenda)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, garments(*)')
    .eq('user_id', req.user.id)
    .order('added_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /cart  { garment_id, start_date?, end_date? }
router.post('/', async (req, res) => {
  const { garment_id, start_date, end_date } = req.body;
  if (!garment_id) return res.status(400).json({ error: 'garment_id es obligatorio' });

  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: req.user.id, garment_id, start_date, end_date },
      { onConflict: 'user_id,garment_id' }
    )
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /cart/:garment_id  -> quita una prenda del batch
router.delete('/:garment_id', async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', req.user.id)
    .eq('garment_id', req.params.garment_id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// POST /cart/return  -> "devolver batch": las prendas pasan a limpieza y se
// vacía el carrito. (El cobro/suscripción se simula en el cliente.)
router.post('/return', async (req, res) => {
  const { data: items, error: e1 } = await supabase
    .from('cart_items')
    .select('garment_id')
    .eq('user_id', req.user.id);

  if (e1) return res.status(500).json({ error: e1.message });
  const ids = (items || []).map((i) => i.garment_id);

  if (ids.length > 0) {
    // status -> in_cleaning (el trigger registra el cambio en garment_states)
    const { error: e2 } = await supabase
      .from('garments')
      .update({ status: 'in_cleaning' })
      .in('id', ids);
    if (e2) return res.status(500).json({ error: e2.message });

    const { error: e3 } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);
    if (e3) return res.status(500).json({ error: e3.message });
  }

  res.json({ devueltas: ids.length });
});

export default router;
