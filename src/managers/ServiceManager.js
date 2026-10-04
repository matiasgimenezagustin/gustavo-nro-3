import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDataDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultFilePath = path.resolve(defaultDataDirectory, '../data/services.json');

export class ServiceManager {
  constructor(filePath = defaultFilePath) {
    this.filePath = filePath;
  }

  async readServicesFromFile() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.saveServicesToFile([]);
        return [];
      }
      throw new Error(`Error al leer el archivo de servicios: ${error.message}`);
    }
  }

  async saveServicesToFile(services) {
    try {
      const directoryPath = path.dirname(this.filePath);
      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(services, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Error al guardar el archivo de servicios: ${error.message}`);
    }
  }

  async getServices() {
    return await this.readServicesFromFile();
  }

  async getServiceById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }

    const services = await this.readServicesFromFile();
    const foundService = services.find((service) => service.id === numericId);

    return foundService || null;
  }

  async addService(serviceData) {
    if (!serviceData || typeof serviceData !== 'object') {
      throw new Error('Los datos del servicio deben ser un objeto válido.');
    }

    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available'];
    const missingFields = requiredFields.filter((field) => {
      const value = serviceData[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      );
    });

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
    }

    if (typeof serviceData.available !== 'boolean') {
      throw new Error('El campo "available" debe ser de tipo boolean (true o false).');
    }

    const numericPrice = Number(serviceData.price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      throw new Error('El campo "price" debe ser un número válido mayor o igual a 0.');
    }

    const numericDuration = Number(serviceData.duration);
    if (isNaN(numericDuration) || numericDuration <= 0) {
      throw new Error('El campo "duration" debe ser un número válido mayor a 0 (minutos).');
    }

    const services = await this.readServicesFromFile();

    const highestId = services.reduce((maxId, current) => {
      return current.id > maxId ? current.id : maxId;
    }, 0);

    const newService = {
      id: highestId + 1,
      name: String(serviceData.name).trim(),
      description: String(serviceData.description).trim(),
      duration: numericDuration,
      price: numericPrice,
      category: String(serviceData.category).trim(),
      available: serviceData.available
    };

    services.push(newService);
    await this.saveServicesToFile(services);

    return newService;
  }

  async updateService(id, updatedData) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }

    if (!updatedData || typeof updatedData !== 'object') {
      throw new Error('Los datos de actualización deben ser un objeto válido.');
    }

    const services = await this.readServicesFromFile();
    const serviceIndex = services.findIndex((service) => service.id === numericId);

    if (serviceIndex === -1) {
      return null;
    }

    const currentService = services[serviceIndex];
    const { id: ignoredId, ...allowedUpdates } = updatedData;

    if (allowedUpdates.name !== undefined) {
      if (typeof allowedUpdates.name !== 'string' || allowedUpdates.name.trim() === '') {
        throw new Error('El campo "name" no puede estar vacío.');
      }
      allowedUpdates.name = allowedUpdates.name.trim();
    }

    if (allowedUpdates.description !== undefined) {
      if (typeof allowedUpdates.description !== 'string' || allowedUpdates.description.trim() === '') {
        throw new Error('El campo "description" no puede estar vacío.');
      }
      allowedUpdates.description = allowedUpdates.description.trim();
    }

    if (allowedUpdates.category !== undefined) {
      if (typeof allowedUpdates.category !== 'string' || allowedUpdates.category.trim() === '') {
        throw new Error('El campo "category" no puede estar vacío.');
      }
      allowedUpdates.category = allowedUpdates.category.trim();
    }

    if (allowedUpdates.price !== undefined) {
      const numericPrice = Number(allowedUpdates.price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('El campo "price" debe ser un número válido mayor o igual a 0.');
      }
      allowedUpdates.price = numericPrice;
    }

    if (allowedUpdates.duration !== undefined) {
      const numericDuration = Number(allowedUpdates.duration);
      if (isNaN(numericDuration) || numericDuration <= 0) {
        throw new Error('El campo "duration" debe ser un número válido mayor a 0.');
      }
      allowedUpdates.duration = numericDuration;
    }

    if (allowedUpdates.available !== undefined && typeof allowedUpdates.available !== 'boolean') {
      throw new Error('El campo "available" debe ser de tipo boolean.');
    }

    const updatedService = {
      ...currentService,
      ...allowedUpdates,
      id: currentService.id
    };

    services[serviceIndex] = updatedService;
    await this.saveServicesToFile(services);

    return updatedService;
  }

  async deleteService(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }

    const services = await this.readServicesFromFile();
    const serviceIndex = services.findIndex((service) => service.id === numericId);

    if (serviceIndex === -1) {
      return null;
    }

    const [deletedService] = services.splice(serviceIndex, 1);
    await this.saveServicesToFile(services);

    return deletedService;
  }
}
