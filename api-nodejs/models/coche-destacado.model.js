const { query } = require('../config/db');

/**
 * Modelo para la gestión de coches destacados
 */
class CocheDestacadoModel {
  /**
   * Obtener todos los coches destacados con información completa
   */
  static async getAll() {
    const sql = `
      SELECT 
        c.id,
        u.username as vendedor,
        c.modelo,
        cl.nombre as clasificacion,
        c.fecha_matriculado,
        c.kilometraje,
        c.color,
        cb.nombre as combustible,
        c.potencia,
        c.precio,
        (SELECT url_foto FROM coche_imagenes ci WHERE ci.coche_id = c.id ORDER BY ci.orden ASC LIMIT 1) as imagen
      FROM coches_destacados cd
      JOIN coches c ON cd.coche_id = c.id
      JOIN usuarios u ON c.vendedor_id = u.id
      JOIN clasificaciones cl ON c.clasificacion_id = cl.id
      JOIN combustibles cb ON c.combustible_id = cb.id
      WHERE cd.fecha_fin IS NULL OR cd.fecha_fin > NOW()
      ORDER BY cd.orden ASC
    `;
    return await query(sql);
  }

  /**
   * Obtener un coche destacado por su ID
   * @param {number} id - ID del coche
   */
  static async getById(id) {
    const sql = `
      SELECT 
        c.id,
        u.username as vendedor,
        c.modelo,
        c.observaciones,
        cl.nombre as clasificacion,
        ca.nombre as carroceria,
        c.num_puertas,
        c.fecha_matriculado,
        c.kilometraje,
        c.color,
        cb.nombre as combustible,
        c.potencia,
        c.precio,
        c.created_at,
        c.updated_at
      FROM coches c
      JOIN usuarios u ON c.vendedor_id = u.id
      JOIN clasificaciones cl ON c.clasificacion_id = cl.id
      JOIN carrocerias ca ON c.carroceria_id = ca.id
      JOIN combustibles cb ON c.combustible_id = cb.id
      JOIN coches_destacados cd ON c.id = cd.coche_id
      WHERE c.id = ? 
        AND (cd.fecha_fin IS NULL OR cd.fecha_fin > NOW())
    `;
    const result = await query(sql, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    // Obtener imágenes del coche
    const imagesSql = `
      SELECT id, url_foto, orden
      FROM coche_imagenes
      WHERE coche_id = ?
      ORDER BY orden ASC
    `;
    const images = await query(imagesSql, [id]);
    
    // Obtener equipamientos del coche
    const equipmentSql = `
      SELECT e.id, e.nombre
      FROM coche_equipamientos ce
      JOIN equipamientos e ON ce.equipamiento_id = e.id
      WHERE ce.coche_id = ?
    `;
    const equipment = await query(equipmentSql, [id]);
    
    // Combinar toda la información
    return {
      ...result[0],
      imagenes: images,
      equipamiento: equipment
    };
  }
}

module.exports = CocheDestacadoModel;
