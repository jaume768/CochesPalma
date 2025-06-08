const { query } = require('../config/db');

/**
 * Modelo para la gestión de coches (tanto destacados como normales)
 */
class CocheModel {
  /**
   * Obtener coches con paginación
   * @param {number} page - Número de página (inicia en 1)
   * @param {number} limit - Número de elementos por página
   * @param {Object} filters - Filtros opcionales (combustible, carrocería, etc.)
   */
  static async getPaginated(page = 1, limit = 12, filters = {}) {
    // Construimos la consulta SQL base
    let sql = `
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
      FROM coches c
      JOIN usuarios u ON c.vendedor_id = u.id
      JOIN clasificaciones cl ON c.clasificacion_id = cl.id
      JOIN combustibles cb ON c.combustible_id = cb.id
      WHERE 1=1
    `;
    
    // Parámetros para la consulta
    const params = [];
    
    // Añadir condiciones de filtro si existen
    if (filters.combustible) {
      sql += ` AND cb.nombre = ?`;
      params.push(filters.combustible);
    }
    
    if (filters.carroceria) {
      sql += ` AND c.carroceria_id = (SELECT id FROM carrocerias WHERE nombre = ?)`;
      params.push(filters.carroceria);
    }
    
    if (filters.search) {
      sql += ` AND (c.modelo LIKE ? OR cb.nombre LIKE ? OR cl.nombre LIKE ?)`;
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    // Creamos una copia de la consulta para el recuento
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as subquery`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    // Añadir orden y límites para paginación a la consulta principal
    sql += ` ORDER BY c.fecha_incorporacion DESC, c.id DESC LIMIT ?, ?`;
    const offset = (page - 1) * limit; 
    const queryParams = [...params, offset, limit];
    const results = await query(sql, queryParams);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: results,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Obtener un coche por su ID
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
      WHERE c.id = ?
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

module.exports = CocheModel;
