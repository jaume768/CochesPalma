const { query } = require('../config/db');

class RentacarModel {
  static async getAll(filtro = null) {
    try {
      let sql = `
        SELECT r.*
        FROM rentacars r
      `;
      const params = [];

      // Aplicar filtro de dirección si existe
      if (filtro && filtro.direccion) {
        sql += ' WHERE r.direccion LIKE ? OR r.nombre LIKE ?';
        params.push(`%${filtro.direccion}%`, `%${filtro.direccion}%`);
      }

      sql += ' ORDER BY r.nombre';

      // Ejecutar consulta y devolver todas las filas
      const results = await query(sql, params);
      return results;
    } catch (error) {
      console.error('Error al obtener rentacars:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const sql = `
        SELECT r.*,
               GROUP_CONCAT(c.nombre) as ciudades
        FROM rentacars r
        LEFT JOIN rentacar_ciudades rc ON r.id = rc.rentacar_id
        LEFT JOIN ciudades c        ON rc.ciudad_id = c.id
        WHERE r.id = ?
        GROUP BY r.id
      `;

      const rows = await query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error al obtener rentacar con ID ${id}:`, error);
      throw error;
    }
  }

  static async create(rentacarData) {
    try {
      const { nombre, url_foto_promocional, direccion, descripcion, url_web } = rentacarData;
      const sql = `
        INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        nombre,
        url_foto_promocional,
        direccion,
        descripcion,
        url_web
      ]);

      return { id: result.insertId, ...rentacarData };
    } catch (error) {
      console.error('Error al crear rentacar:', error);
      throw error;
    }
  }

  static async update(id, rentacarData) {
    try {
      const { nombre, url_foto_promocional, direccion, descripcion, url_web } = rentacarData;
      const sql = `
        UPDATE rentacars
        SET nombre = ?,
            url_foto_promocional = ?,
            direccion = ?,
            descripcion = ?,
            url_web = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [
        nombre,
        url_foto_promocional,
        direccion,
        descripcion,
        url_web,
        id
      ]);

      return { id, ...rentacarData };
    } catch (error) {
      console.error(`Error al actualizar rentacar con ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Primero eliminamos relaciones en rentacar_ciudades
      await query('DELETE FROM rentacar_ciudades WHERE rentacar_id = ?', [id]);

      // Luego eliminamos el rentacar
      const result = await query('DELETE FROM rentacars WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error al eliminar rentacar con ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = RentacarModel;
