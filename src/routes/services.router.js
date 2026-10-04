import { Router } from 'express';
import { ServiceManager } from '../managers/ServiceManager.js';

const router = Router();
const serviceManager = new ServiceManager();

// GET /api/services - Devuelve todos los servicios (con soporte para filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    let services = await serviceManager.getServices();

    if (category !== undefined && String(category).trim() !== '') {
      const categoryFilter = String(category).trim().toLowerCase();
      services = services.filter(
        (service) => service.category.toLowerCase() === categoryFilter
      );
    }

    if (available !== undefined && String(available).trim() !== '') {
      const availableString = String(available).trim().toLowerCase();
      if (availableString === 'true') {
        services = services.filter((service) => service.available === true);
      } else if (availableString === 'false') {
        services = services.filter((service) => service.available === false);
      }
    }

    return res.status(200).json({
      status: 'success',
      payload: services
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener los servicios',
      error: error.message
    });
  }
});

// GET /api/services/:sid - Devuelve un servicio por id
router.get('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await serviceManager.getServiceById(sid);

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    return res.status(200).json({
      status: 'success',
      payload: service
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener el servicio',
      error: error.message
    });
  }
});

// POST /api/services - Crea un servicio (valida campos obligatorios; id generado automáticamente)
router.post('/', async (req, res) => {
  try {
    const newService = await serviceManager.addService(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Servicio creado exitosamente',
      payload: newService
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// PUT /api/services/:sid - Actualiza un servicio (no permite modificar el id)
router.put('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const updatedService = await serviceManager.updateService(sid, req.body);

    if (!updatedService) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Servicio actualizado exitosamente',
      payload: updatedService
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// DELETE /api/services/:sid - Elimina un servicio por id
router.delete('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const deletedService = await serviceManager.deleteService(sid);

    if (!deletedService) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Servicio eliminado exitosamente',
      payload: deletedService
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al eliminar el servicio',
      error: error.message
    });
  }
});

export default router;
