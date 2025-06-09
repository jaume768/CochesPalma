const db = require('../config/db');
const { generateSQLQuery } = require('../services/openaiService');

// ===================================================================================
// NUEVA FUNCIÓN REUTILIZABLE PARA FORMATEAR LOS DATOS PARA EL FRONTEND
// Esta función toma un coche "en bruto" de la BD y lo convierte al formato
// que tus componentes de React esperan.
// ===================================================================================
function formatVehicleForFrontend(vehicle) {
  // Manejo seguro por si el modelo es una sola palabra
  const modelParts = vehicle.modelo ? vehicle.modelo.split(' ') : ['Desconocida'];
  const brand = modelParts[0];
  const model = modelParts.length > 1 ? modelParts.slice(1).join(' ') : '';

  return {
    id: vehicle.id,
    brand: brand,
    model: model,
    price: vehicle.precio ? `${vehicle.precio.toLocaleString('es-ES')} €` : 'Consultar',
    year: vehicle.fecha_matriculado ? new Date(vehicle.fecha_matriculado).getFullYear().toString() : 'N/A',
    fuelType: vehicle.combustible || 'No especificado', // El nombre del combustible ya viene del JOIN
    km: vehicle.kilometraje ? `${vehicle.kilometraje.toLocaleString('es-ES')} km` : '0 km',
    // La imagen principal es la primera del array de imágenes que ya hemos cargado
    image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/images/car-placeholder.jpg', // Usa una imagen por defecto
    
    // Incluimos el resto de datos por si son necesarios
    color: vehicle.color,
    power: vehicle.potencia,
    doors: vehicle.num_puertas,
    bodyType: vehicle.carroceria,
    classification: vehicle.clasificacion,
    description: vehicle.observaciones,
    seller: vehicle.vendedor,
    images: vehicle.images,
    equipment: vehicle.equipments
  };
}

/**
 * Buscar vehículos con ChatGPT
 */
exports.searchVehicles = async (req, res) => {
  try {
    const { search, page = 1, limit = 12, ...filters } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 12;
    const offset = (pageNumber - 1) * pageSize;

    if (!search || search.trim() === '') {
      return await conventionalSearch(req, res);
    }

    console.log(`Búsqueda inteligente: "${search}" con filtros:`, filters);
    const { sql, params } = await generateSQLQuery(search, filters);

    if (!sql || !Array.isArray(params)) {
        console.warn('La IA no generó una consulta SQL válida. Usando búsqueda convencional como respaldo.');
        return await conventionalSearch(req, res);
    }

    const lowerSql = sql.toLowerCase();
    const fromIdx = lowerSql.indexOf('from');
    let fromAndRest = sql.slice(fromIdx);
    fromAndRest = fromAndRest.replace(/order by[\s\S]*$/i, '').replace(/limit[\s\S]*$/i, '');

    const countSql = `SELECT COUNT(DISTINCT c.id) AS total ${fromAndRest}`;
    const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, pageSize, offset];

    const countResult = await db.query(countSql, params);
    const total = countResult[0]?.total || 0;

    const rows = await db.query(paginatedSql, paginatedParams);

    // Este bucle es importante: añade los arrays 'images' y 'equipments' a cada coche
    for (const vehicle of rows) {
      const images = await db.query(
        'SELECT url_foto FROM coche_imagenes WHERE coche_id = ? ORDER BY orden ASC',
        [vehicle.id]
      );
      vehicle.images = images.map(img => img.url_foto);

      const equipments = await db.query(
        'SELECT e.nombre FROM equipamientos e JOIN coche_equipamientos ce ON e.id = ce.equipamiento_id WHERE ce.coche_id = ?',
        [vehicle.id]
      );
      vehicle.equipments = equipments.map(eq => eq.nombre);
    }

    // =========================================================================
    // APLICAMOS EL FORMATEO a cada coche ANTES DE ENVIAR LA RESPUESTA
    // =========================================================================
    const formattedVehicles = rows.map(formatVehicleForFrontend);

    const totalPages = Math.ceil(total / pageSize);

    return res.json({
      // Enviamos el array formateado, no el original 'rows'
      vehicles: formattedVehicles,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: total,
        itemsPerPage: pageSize
      },
      aiGenerated: true,
      query: process.env.NODE_ENV === 'development' ? { sql, params } : undefined
    });

  } catch (error) {
    console.error('Error en la búsqueda inteligente:', error);
    return await conventionalSearch(req, res);
  }
};

/**
 * Función de búsqueda convencional que se usa como respaldo
 */
async function conventionalSearch(req, res) {
  try {
    const { search, page = 1, limit = 12, combustible, carroceria } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 12;
    const offset = (pageNumber - 1) * pageSize;

    const baseSql = `
      FROM coches c
      JOIN clasificaciones cl ON c.clasificacion_id = cl.id
      JOIN carrocerias ca ON c.carroceria_id = ca.id
      JOIN combustibles co ON c.combustible_id = co.id
    `;
    
    const params = [];
    const conditions = [];

    if (search && search.trim() !== '') {
      conditions.push('(c.modelo LIKE ? OR cl.nombre LIKE ?)');
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }
    if (combustible && combustible.trim() !== '') {
      conditions.push('co.nombre = ?');
      params.push(combustible);
    }
    if (carroceria && carroceria.trim() !== '') {
      conditions.push('ca.nombre = ?');
      params.push(carroceria);
    }

    const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const countParams = [...params];
    const countSql = `SELECT COUNT(DISTINCT c.id) AS total ${baseSql} ${whereClause}`;

    const mainSql = `SELECT c.*, cl.nombre AS clasificacion, ca.nombre AS carroceria, co.nombre AS combustible ${baseSql} ${whereClause} ORDER BY c.precio ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const countResult = await db.query(countSql, countParams);
    const total = countResult[0]?.total || 0;
    const rows = await db.query(mainSql, params);

    for (const vehicle of rows) {
      const images = await db.query(
        'SELECT url_foto FROM coche_imagenes WHERE coche_id = ? ORDER BY orden ASC',
        [vehicle.id]
      );
      vehicle.images = images.map(img => img.url_foto);

      const equipments = await db.query(
        'SELECT e.nombre FROM equipamientos e JOIN coche_equipamientos ce ON e.id = ce.equipamiento_id WHERE ce.coche_id = ?',
        [vehicle.id]
      );
      vehicle.equipments = equipments.map(eq => eq.nombre);
    }

    // =========================================================================
    // APLICAMOS EL MISMO FORMATEO AQUÍ TAMBIÉN
    // =========================================================================
    const formattedVehicles = rows.map(formatVehicleForFrontend);
    
    const totalPages = Math.ceil(total / pageSize);

    return res.json({
      vehicles: formattedVehicles,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: total,
        itemsPerPage: pageSize
      },
      aiGenerated: false
    });

  } catch (error) {
    console.error('Error en la búsqueda convencional:', error);
    return res.status(500).json({
      error: 'Error al buscar vehículos',
      message: error.message
    });
  }
}
/**
 * Analizar una cadena de texto para detectar posibles filtros
 * (Esta función no usa la base de datos, por lo que no necesita cambios)
 */
exports.analyzeSearchIntent = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search || search.trim() === '') {
      return res.json({ filters: {} });
    }

    const prompt = `
      Analiza el siguiente texto de búsqueda de coches: "${search}"
      Extrae posibles filtros como:
      - Marca/modelo (Ford, BMW, Audi, etc.)
      - Tipo de carrocería (SUV, berlina, compacto, etc.)
      - Tipo de combustible (gasolina, diésel, híbrido, etc.)
      - Rango de precio (min-max)
      - Rango de años (min-max)
      - Equipamiento mencionado (navegador, techo solar, etc.)
      Responde solo con un objeto JSON con los filtros detectados, así:
      {
        "marca": "string o null",
        "modelo": "string o null",
        "carroceria": "string o null",
        "combustible": "string o null",
        "precioMin": number o null,
        "precioMax": number o null,
        "añoMin": number o null,
        "añoMax": number o null,
        "equipamiento": ["array de strings o vacío"],
        "kilometraje": number o null (si se menciona un valor máximo)
      }
    `;

    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY no está configurada en las variables de entorno');
      return res.json({ filters: {} });
    }

    const axios = require('axios');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un asistente especializado en análisis de texto para búsquedas de vehículos.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const assistantMessage = response.data.choices[0].message.content;
    let jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error('No se pudo extraer un JSON válido de la respuesta de ChatGPT');
      return res.json({ filters: {} });
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    const filtersObj = JSON.parse(jsonString);
    return res.json({ filters: filtersObj, searchText: search });
    
  } catch (error) {
    console.error('Error al analizar la intención de búsqueda:', error);
    return res.status(500).json({
      error: 'Error al analizar la búsqueda',
      message: error.message
    });
  }
};