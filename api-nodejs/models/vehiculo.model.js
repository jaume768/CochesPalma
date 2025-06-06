const { query } = require('../config/db');

/**
 * Modelo para la tabla vehículos
 */
class VehiculoModel {
  /**
   * Obtener todos los vehículos
   */
  static async getAll() {
    const sql = `SELECT * FROM vehiculos`;
    return await query(sql);
  }

  /**
   * Obtener un vehículo por su ID
   * @param {number} id - ID del vehículo
   */
  static async getById(id) {
    const sql = `SELECT * FROM vehiculos WHERE id = ?`;
    const result = await query(sql, [id]);
    return result[0];
  }
}

module.exports = VehiculoModel;
