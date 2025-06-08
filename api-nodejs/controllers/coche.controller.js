const CocheModel = require('../models/coche.model');

/**
 * Controlador para la gestión de coches (vehículos de venta)
 */
class CocheController {
  /**
   * Obtener todos los coches con paginación
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getCoches(req, res) {
    try {
      // Extraer parámetros de paginación y filtros de la consulta
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      
      // Filtros opcionales
      const filters = {};
      if (req.query.combustible) filters.combustible = req.query.combustible;
      if (req.query.carroceria) filters.carroceria = req.query.carroceria;
      if (req.query.search) filters.search = req.query.search;
      
      // Obtener coches paginados
      const result = await CocheModel.getPaginated(page, limit, filters);
      
      // Transformar datos para que coincidan con el formato esperado por el frontend
      const formattedCars = result.data.map((coche) => ({
        id: coche.id,
        brand: coche.modelo.split(' ')[0], // Extraemos la marca del modelo
        model: coche.modelo.split(' ').slice(1).join(' '), // El resto es el modelo
        price: `${coche.precio.toLocaleString('es-ES')} €`,
        year: new Date(coche.fecha_matriculado).getFullYear().toString(),
        fuelType: coche.combustible,
        km: `${coche.kilometraje.toLocaleString('es-ES')} km`,
        image: coche.imagen || `/images/car${(coche.id % 5) + 1}.jpg` // Fallback a imágenes locales
      }));
      
      return res.status(200).json({
        vehicles: formattedCars,
        pagination: result.meta
      });
    } catch (error) {
      console.error('Error al obtener coches:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener coches',
        error: error.message
      });
    }
  }

  /**
   * Obtener un coche por su ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getCocheById(req, res) {
    try {
      const { id } = req.params;
      const coche = await CocheModel.getById(id);
      
      if (!coche) {
        return res.status(404).json({
          success: false,
          message: `Coche con ID ${id} no encontrado`
        });
      }

      // Formatear datos para el frontend
      const formattedCar = {
        id: coche.id,
        brand: coche.modelo.split(' ')[0],
        model: coche.modelo.split(' ').slice(1).join(' '),
        price: `${coche.precio.toLocaleString('es-ES')} €`,
        year: new Date(coche.fecha_matriculado).getFullYear().toString(),
        fuelType: coche.combustible,
        km: `${coche.kilometraje.toLocaleString('es-ES')} km`,
        color: coche.color,
        power: coche.potencia,
        doors: coche.num_puertas,
        bodyType: coche.carroceria,
        classification: coche.clasificacion,
        description: coche.observaciones,
        seller: coche.vendedor,
        images: coche.imagenes.map(img => img.url_foto),
        equipment: coche.equipamiento.map(eq => eq.nombre)
      };

      return res.status(200).json({
        success: true,
        data: formattedCar
      });
    } catch (error) {
      console.error(`Error al obtener coche con ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener coche',
        error: error.message
      });
    }
  }
}

module.exports = CocheController;
