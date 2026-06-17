// La app Express de Retoño como módulo reutilizable (SIN app.listen).
// La usan dos entradas:
//   · server.js      -> desarrollo local (sí escucha en un puerto)
//   · ../../api/index.js -> función serverless de Vercel (no escucha)
// Todas las rutas viven bajo /api para que el frontend llame /api/... igual
// en local y en producción.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

import authRoutes from './routes/auth.routes.js';
import garmentsRoutes from './routes/garments.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta raíz (sanity check).
app.get('/', (req, res) => {
  res.json({ service: 'Retoño API', status: 'ok' });
});

// Healthcheck: prueba la conexión real a Supabase contando las prendas.
app.get('/api/health', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('garments')
      .select('*', { count: 'exact', head: true });
    if (error) return res.status(500).json({ ok: false, error });
    res.json({ ok: true, conexion: 'Supabase OK', prendas_en_catalogo: count });
  } catch (e) {
    res.status(500).json({ ok: false, thrown: String(e) });
  }
});

// Módulos de la API.
app.use('/api/auth', authRoutes);
app.use('/api/garments', garmentsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

export default app;
