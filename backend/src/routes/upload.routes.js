// Subida de imágenes del catálogo al bucket "garments" de Supabase Storage.
import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /upload  (form-data: file=<imagen>)  -> { url }
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo (campo "file")' });

  const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('garments')
    .upload(path, req.file.buffer, { contentType: req.file.mimetype });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from('garments').getPublicUrl(path);
  res.status(201).json({ url: data.publicUrl, path });
});

export default router;
