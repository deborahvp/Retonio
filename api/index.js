// Función serverless de Vercel: expone la app Express de Retoño.
// Vercel invoca este handler para toda petición /api/* (ver vercel.json).
// La app ya monta sus rutas bajo /api, así que recibe la URL original
// (/api/garments, /api/auth/login, …) y la resuelve igual que en local.
import app from "../backend/src/app.js";

export default app;
