import app from './app.js';
import { environmentConfig } from './config/env.config.js';

const PORT = environmentConfig.port;

app.listen(PORT, () => {
  console.log(`[Servidor] Ejecutándose exitosamente en el puerto ${PORT}`);
  console.log(`[Servidor] Entorno: ${environmentConfig.nodeEnv}`);
  console.log(`[Servidor] Recurso Servicios: http://localhost:${PORT}/api/services`);
  console.log(`[Servidor] Recurso Reservas:  http://localhost:${PORT}/api/bookings`);
});
