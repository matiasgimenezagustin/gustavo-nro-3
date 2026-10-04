import { Router } from 'express';
import { BookingManager } from '../managers/BookingManager.js';
import { ServiceManager } from '../managers/ServiceManager.js';

const router = Router();
const bookingManager = new BookingManager();
const serviceManager = new ServiceManager();

router.get('/', async (req, res) => {
  try {
    const bookings = await bookingManager.getBookings();
    return res.status(200).json({
      status: 'success',
      payload: bookings
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener las reservas',
      error: error.message
    });
  }
});

router.get('/:bid', async (req, res) => {
  try {
    const { bid } = req.params;
    const booking = await bookingManager.getBookingById(bid);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: `Reserva con id ${bid} no encontrada`
      });
    }

    return res.status(200).json({
      status: 'success',
      payload: booking
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener la reserva',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const newBooking = await bookingManager.createBooking(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Reserva creada exitosamente',
      payload: newBooking
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/:bid/services/:sid', async (req, res) => {
  try {
    const { bid, sid } = req.params;

    const booking = await bookingManager.getBookingById(bid);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: `Reserva con id ${bid} no encontrada`
      });
    }

    const service = await serviceManager.getServiceById(sid);
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    const updatedBooking = await bookingManager.addServiceToBooking(bid, sid);

    return res.status(200).json({
      status: 'success',
      message: `Servicio ${sid} agregado a la reserva ${bid} con éxito`,
      payload: updatedBooking
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
