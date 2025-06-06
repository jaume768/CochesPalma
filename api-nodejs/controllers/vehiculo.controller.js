const VehiculoModel = require('../models/vehiculo.model');

/**
 * Controlador para la gestión de vehículos
 */
class VehiculoController {
  /**
   * Obtener todos los vehículos
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getAllVehiculos(req, res) {
    try {
      const vehiculos = await VehiculoModel.getAll();
      return res.status(200).json({
        success: true,
        data: vehiculos,
        message: 'Vehículos obtenidos correctamente'
      });
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos',
        error: error.message
      });
    }
  }

  /**
   * Obtener un vehículo por su ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getVehiculoById(req, res) {
    try {
      const { id } = req.params;
      const vehiculo = await VehiculoModel.getById(id);
      
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: `Vehículo con ID ${id} no encontrado`
        });
      }

      return res.status(200).json({
        success: true,
        data: vehiculo,
        message: 'Vehículo obtenido correctamente'
      });
    } catch (error) {
      console.error(`Error al obtener vehículo con ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículo',
        error: error.message
      });
    }
  }
}

module.exports = VehiculoController;
