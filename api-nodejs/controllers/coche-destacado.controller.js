const CocheDestacadoModel = require('../models/coche-destacado.model');

/**
 * Controlador para la gestión de coches destacados
 */
class CocheDestacadoController {
  /**
   * Obtener todos los coches destacados
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getAllCochesDestacados(req, res) {
    try {
      const cochesDestacados = await CocheDestacadoModel.getAll();
      
      // Transformar datos para que coincidan con el formato esperado por el frontend
      const formattedCars = cochesDestacados.map((coche, index) => ({
        id: coche.id,
        brand: coche.modelo.split(' ')[0], // Extraemos la marca del modelo
        model: coche.modelo.split(' ').slice(1).join(' '), // El resto es el modelo
        price: coche.precio,
        year: new Date(coche.fecha_matriculado).getFullYear().toString(),
        fuelType: coche.combustible,
        km: coche.kilometraje,
        image: coche.imagen || `/images/car${(index % 5) + 1}.jpg` // Fallback a imágenes locales
      }));
      
      return res.status(200).json(formattedCars);
    } catch (error) {
      console.error('Error al obtener coches destacados:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener coches destacados',
        error: error.message
      });
    }
  }

  /**
   * Obtener un coche destacado por su ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getCocheDestacadoById(req, res) {
    try {
      const { id } = req.params;
      const coche = await CocheDestacadoModel.getById(id);
      
      if (!coche) {
        return res.status(404).json({
          success: false,
          message: `Coche destacado con ID ${id} no encontrado`
        });
      }

      // Formatear datos para el frontend
      const formattedCar = {
        id: coche.id,
        brand: coche.modelo.split(' ')[0],
        model: coche.modelo.split(' ').slice(1).join(' '),
        price: coche.precio,
        year: new Date(coche.fecha_matriculado).getFullYear().toString(),
        fuelType: coche.combustible,
        km: coche.kilometraje,
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

      return res.status(200).json(formattedCar);
    } catch (error) {
      console.error(`Error al obtener coche destacado con ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener coche destacado',
        error: error.message
      });
    }
  }
}

module.exports = CocheDestacadoController;
