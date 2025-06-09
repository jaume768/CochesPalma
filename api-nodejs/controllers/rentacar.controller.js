const RentacarModel = require('../models/rentacar.model');

class RentacarController {
  // Obtener todos los servicios de alquiler de coches
  static async getAllRentacars(req, res) {
    try {
      const filtro = {};
      
      // Si hay filtro de dirección, lo añadimos al objeto de filtro
      if (req.query.direccion) {
        filtro.direccion = req.query.direccion;
      }
      
      const rentacars = await RentacarModel.getAll(filtro);
      
      res.status(200).json({
        success: true,
        count: rentacars.length,
        data: rentacars
      });
    } catch (error) {
      console.error('Error en getAllRentacars:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los servicios de alquiler',
        error: error.message
      });
    }
  }

  // Obtener un servicio de alquiler por su ID
  static async getRentacarById(req, res) {
    try {
      const id = req.params.id;
      const rentacar = await RentacarModel.getById(id);
      
      if (!rentacar) {
        return res.status(404).json({
          success: false,
          message: `No se encontró un servicio de alquiler con ID ${id}`
        });
      }
      
      res.status(200).json({
        success: true,
        data: rentacar
      });
    } catch (error) {
      console.error(`Error en getRentacarById:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el servicio de alquiler',
        error: error.message
      });
    }
  }

  // Crear un nuevo servicio de alquiler
  static async createRentacar(req, res) {
    try {
      const rentacarData = {
        nombre: req.body.nombre,
        url_foto_promocional: req.body.url_foto_promocional,
        direccion: req.body.direccion,
        descripcion: req.body.descripcion,
        url_web: req.body.url_web
      };
      
      // Validación básica
      if (!rentacarData.nombre || !rentacarData.direccion) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y la dirección son campos obligatorios'
        });
      }
      
      const newRentacar = await RentacarModel.create(rentacarData);
      
      res.status(201).json({
        success: true,
        message: 'Servicio de alquiler creado correctamente',
        data: newRentacar
      });
    } catch (error) {
      console.error('Error en createRentacar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el servicio de alquiler',
        error: error.message
      });
    }
  }

  // Actualizar un servicio de alquiler existente
  static async updateRentacar(req, res) {
    try {
      const id = req.params.id;
      
      // Comprobar si existe el rentacar
      const existingRentacar = await RentacarModel.getById(id);
      if (!existingRentacar) {
        return res.status(404).json({
          success: false,
          message: `No se encontró un servicio de alquiler con ID ${id}`
        });
      }
      
      const rentacarData = {
        nombre: req.body.nombre || existingRentacar.nombre,
        url_foto_promocional: req.body.url_foto_promocional || existingRentacar.url_foto_promocional,
        direccion: req.body.direccion || existingRentacar.direccion,
        descripcion: req.body.descripcion || existingRentacar.descripcion,
        url_web: req.body.url_web || existingRentacar.url_web
      };
      
      const updatedRentacar = await RentacarModel.update(id, rentacarData);
      
      res.status(200).json({
        success: true,
        message: 'Servicio de alquiler actualizado correctamente',
        data: updatedRentacar
      });
    } catch (error) {
      console.error(`Error en updateRentacar:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el servicio de alquiler',
        error: error.message
      });
    }
  }

  // Eliminar un servicio de alquiler
  static async deleteRentacar(req, res) {
    try {
      const id = req.params.id;
      
      // Comprobar si existe el rentacar
      const existingRentacar = await RentacarModel.getById(id);
      if (!existingRentacar) {
        return res.status(404).json({
          success: false,
          message: `No se encontró un servicio de alquiler con ID ${id}`
        });
      }
      
      const deleted = await RentacarModel.delete(id);
      
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Servicio de alquiler eliminado correctamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'No se pudo eliminar el servicio de alquiler'
        });
      }
    } catch (error) {
      console.error(`Error en deleteRentacar:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el servicio de alquiler',
        error: error.message
      });
    }
  }
}

module.exports = RentacarController;
