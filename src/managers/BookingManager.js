import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDataDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultFilePath = path.resolve(defaultDataDirectory, '../data/bookings.json');

export class BookingManager {
  constructor(filePath = defaultFilePath) {
    this.filePath = filePath;
  }

  async readBookingsFromFile() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.saveBookingsToFile([]);
        return [];
      }
      throw new Error(`Error al leer el archivo de reservas: ${error.message}`);
    }
  }

  async saveBookingsToFile(bookings) {
    try {
      const directoryPath = path.dirname(this.filePath);
      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Error al guardar el archivo de reservas: ${error.message}`);
    }
  }

  async getBookings() {
    return await this.readBookingsFromFile();
  }

  async getBookingById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }

    const bookings = await this.readBookingsFromFile();
    const foundBooking = bookings.find((booking) => booking.id === numericId);

    return foundBooking || null;
  }

  async createBooking(bookingData) {
    if (!bookingData || typeof bookingData !== 'object') {
      throw new Error('Los datos de la reserva deben ser un objeto válido.');
    }

    const requiredFields = ['clientName', 'clientEmail', 'date', 'time'];
    const missingFields = requiredFields.filter((field) => {
      const value = bookingData[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      );
    });

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
    }

    const bookings = await this.readBookingsFromFile();

    const highestId = bookings.reduce((maxId, current) => {
      return current.id > maxId ? current.id : maxId;
    }, 0);

    const newBooking = {
      id: highestId + 1,
      clientName: String(bookingData.clientName).trim(),
      clientEmail: String(bookingData.clientEmail).trim(),
      date: String(bookingData.date).trim(),
      time: String(bookingData.time).trim(),
      status: bookingData.status ? String(bookingData.status).trim() : 'pending',
      services: Array.isArray(bookingData.services) ? bookingData.services : []
    };

    bookings.push(newBooking);
    await this.saveBookingsToFile(bookings);

    return newBooking;
  }

  async addServiceToBooking(bookingId, serviceId) {
    const numericBookingId = Number(bookingId);
    const numericServiceId = Number(serviceId);

    if (isNaN(numericBookingId)) {
      throw new Error('El ID de la reserva debe ser numérico.');
    }

    if (isNaN(numericServiceId)) {
      throw new Error('El ID del servicio debe ser numérico.');
    }

    const bookings = await this.readBookingsFromFile();
    const bookingIndex = bookings.findIndex((booking) => booking.id === numericBookingId);

    if (bookingIndex === -1) {
      return null;
    }

    const booking = bookings[bookingIndex];

    if (!Array.isArray(booking.services)) {
      booking.services = [];
    }

    const existingServiceItem = booking.services.find(
      (item) => item.service === numericServiceId
    );

    if (existingServiceItem) {
      existingServiceItem.quantity += 1;
    } else {
      booking.services.push({
        service: numericServiceId,
        quantity: 1
      });
    }

    bookings[bookingIndex] = booking;
    await this.saveBookingsToFile(bookings);

    return booking;
  }
}
