// Entrada para DESARROLLO LOCAL: levanta la app Express y escucha en un puerto.
// En Vercel NO se usa este archivo; se usa ../../api/index.js (no escucha).
import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌱 Retoño backend corriendo en http://localhost:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/api/health`);
});
