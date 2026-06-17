// Wishlist (Deborah): lista de deseos del usuario.
import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /wishlist
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, garments(*)')
    .eq('user_id', req.user.id)
    .order('added_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /wishlist  { garment_id }
router.post('/', async (req, res) => {
  const { garment_id } = req.body;
  if (!garment_id) return res.status(400).json({ error: 'garment_id es obligatorio' });

  const { data, error } = await supabase
    .from('wishlist')
    .upsert(
      { user_id: req.user.id, garment_id },
      { onConflict: 'user_id,garment_id' }
    )
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /wishlist/:garment_id
router.delete('/:garment_id', async (req, res) => {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', req.user.id)
    .eq('garment_id', req.params.garment_id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
