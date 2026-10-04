import express from 'express';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API REST - Sistema de Turnos y Reservas',
    endpoints: {
      services: '/api/services',
      bookings: '/api/bookings'
    }
  });
});

export default app;
