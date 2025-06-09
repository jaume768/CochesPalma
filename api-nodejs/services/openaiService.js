/**
 * Servicio para la generación de consultas SQL mediante la API de OpenAI (ChatGPT)
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Cache para consultas previamente procesadas
const queryCache = new Map();
// Tiempo de caducidad de la caché (30 minutos)
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Lee y formatea el esquema de la base de datos para su uso en los prompts
 */
async function getDBSchema() {
  try {
    const schemaPath = path.join(__dirname, '..', 'scripts', 'init.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');

    // Extraer CREATE TABLE statements
    const createTableStatements = schemaSQL
      .split(';')
      .filter(statement => statement.trim().toUpperCase().startsWith('CREATE TABLE'))
      .map(statement => statement.trim() + ';')
      .join('\n\n');

    // ---- NUEVO: Extraer valores de las tablas de catálogo ----
    const extractInserts = (tableName) => {
      const regex = new RegExp(`INSERT INTO ${tableName} \\(nombre\\) VALUES \\('(.*?)'\\);`, 'g');
      const matches = [...schemaSQL.matchAll(regex)];
      return matches.map(match => match[1]);
    };

    const carrocerias = extractInserts('carrocerias');
    const clasificaciones = extractInserts('clasificaciones');
    const combustibles = extractInserts('combustibles');

    // Devolvemos tanto el esquema como los valores
    return {
      schema: createTableStatements,
      catalogs: {
        carrocerias,
        clasificaciones,
        combustibles,
      }
    };

  } catch (error) {
    console.error('Error al leer el esquema de la base de datos:', error);
    return { schema: '', catalogs: {} };
  }
}

/**
 * Genera una consulta SQL a partir de un texto de búsqueda utilizando ChatGPT
 * 
 * @param {string} searchText - Texto de búsqueda ingresado por el usuario
 * @param {Object} filters - Filtros adicionales (opcional)
 * @returns {Promise<Object>} - Objeto con la consulta SQL y los parámetros
 */
async function generateSQLQuery(searchText, filters = {}) {
  try {
    // Crear una clave para la caché basada en el texto de búsqueda y los filtros
    const cacheKey = JSON.stringify({ searchText, filters });

    // Verificar si la consulta está en la caché y no ha expirado
    if (queryCache.has(cacheKey)) {
      const { timestamp, data } = queryCache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log('Usando consulta SQL en caché');
        return data;
      }
    }

    // Si no está en caché o expiró, generar nueva consulta
    const dbSchema = await getDBSchema();

    // Construir el prompt para ChatGPT
    const prompt = `
# ROL Y OBJETIVO
Eres un experto en MySQL y un asistente de ventas de coches. Tu objetivo es convertir una descripción en lenguaje natural de un usuario en una consulta SQL **eficaz y flexible** para encontrar vehículos en la siguiente base de datos. La prioridad máxima es **devolver resultados relevantes**, incluso si eso significa ser menos estricto. Es preferible mostrar coches que se parezcan a la búsqueda a no mostrar nada.

# ESQUEMA DE LA BASE DE DATOS
${dbSchema.schema}

TEN EN CUENTA QUE LOS COCHES NO TIENEN MARCA, TIENEN modelo EN LA TABLA COCHES, SI TE PIDEN "QUIER UN FIAT" EL MODELO SERA FIAT.

# DATOS DE CATÁLOGO DISPONIBLES (piensa que esta ordenada por id, por ejemplo si te piden un "coche nuevo" seria la id 1 de clasificaciones y en la tabla coche seria clasificacion_id)
**Usa EXCLUSIVAMENTE los siguientes valores para las búsquedas en estas tablas. No inventes sinónimos.**
- **Valores posibles para carrocerias.nombre:** ${dbSchema.catalogs.carrocerias.join(', ')}
- **Valores posibles para combustibles.nombre:** ${dbSchema.catalogs.combustibles.join(', ')}
- **Valores posibles para clasificaciones.nombre:** ${dbSchema.catalogs.clasificaciones.join(', ')}

# PETICIÓN DEL USUARIO
Busca coches que coincidan con esta descripción: "${searchText}"
${Object.keys(filters).length > 0 ? `
# FILTROS ADICIONALES (ya seleccionados por el usuario)
Estos filtros son requisitos estrictos que DEBEN aplicarse con AND:
${Object.entries(filters).map(([key, value]) => `- ${key}: ${value}`).join('\n')}` : ''}

# ESTRATEGIA DE BÚSQUEDA (Paso a Paso)

1.  **Analizar la Petición:** Descompón la descripción del usuario en "filtros duros" (datos concretos) y "preferencias suaves" (ideas subjetivas).
    *   **Filtros Duros:** Marcas, modelos, años específicos, colores, tipo de combustible explícito (ej: "BMW 320d", "del 2018", "diésel"). Estos deben usar AND.
    *   **Preferencias Suaves:** Descripciones subjetivas como "coche para familia", "barato", "deportivo", "seguro", "para un joven".

2.  **Construir la Cláusula WHERE:**
    *   Para los **Filtros Duros**, crea condiciones AND exactas. Usa LIKE '%palabra%' para modelos y marcas.
    *   Para las **Preferencias Suaves**, crea un grupo de condiciones (... ) unidas por OR para cubrir posibles interpretaciones.
        *   "coche para familia" -> (ca.nombre IN ('SUV', 'Familiar', 'Monovolumen') OR c.num_puertas = 5)
        *   "deportivo" -> (ca.nombre IN ('Coupé', 'Roadster', 'Descapotable') OR c.potencia > 150)
        *   "barato" o "económico" -> (c.precio < 10000) (Asume un umbral de precio razonable si no se especifica).
        *   "para un joven" -> (c.precio < 8000 AND (ca.nombre = 'Hatchback' OR ca.nombre = 'Compacto'))

3.  **Combinar Todo:** Une todos los filtros duros y grupos de preferencias suaves con AND. Por ejemplo, para "un SUV rojo y seguro": c.color = 'Rojo' AND ca.nombre = 'SUV' AND (c.observaciones LIKE '%seguridad%' OR c.observaciones LIKE '%airbags%').

# REGLAS DE ORO Y DIRECTRICES CLAVE

*   **FLEXIBILIDAD > EXACTITUD:** Si dudas, usa OR. Tu objetivo es evitar devolver una lista vacía.
*   **USA LIKE:** Para búsquedas de texto en c.modelo y c.observaciones, usa siempre LIKE con comodines (%).
*   **RANGOS NUMÉRICOS:** Si el usuario dice "unos 15000 euros", crea un rango razonable, como c.precio BETWEEN 13000 AND 17000. Si dice "menos de 100.000 km", usa c.kilometraje < 100000.
*   **AÑO:** Para el año, usa la función YEAR(c.fecha_matriculado).
*   **ORDEN:** Ordena siempre los resultados de una manera lógica, por ejemplo, ORDER BY c.precio ASC si el usuario busca algo "barato", o c.fecha_matriculado DESC si busca algo "nuevo". Si no hay pistas, usa ORDER BY c.precio ASC.

# FORMATO DE SALIDA OBLIGATORIO
La respuesta debe ser **únicamente un objeto JSON válido** con esta estructura:
{
  "sql": "SELECT c.*, cl.nombre AS clasificacion, ca.nombre AS carroceria, co.nombre AS combustible FROM coches c ...",
  "params": ["array", "de", "valores"]
}

# EJEMPLOS DETALLADOS

1.  **Petición:** "audi a3 gasolina de 2019"
    **JSON esperado:**
    \`\`\`json
    {
      "sql": "SELECT c.*, cl.nombre AS clasificacion, ca.nombre AS carroceria, co.nombre AS combustible FROM coches c JOIN clasificaciones cl ON c.clasificacion_id = cl.id JOIN carrocerias ca ON c.carroceria_id = ca.id JOIN combustibles co ON c.combustible_id = co.id WHERE c.modelo LIKE ? AND co.nombre = ? AND YEAR(c.fecha_matriculado) = ? ORDER BY c.precio ASC",
      "params": ["%audi a3%", "Gasolina", 2019]
    }
    \`\`\`

2.  **Petición:** "un coche espacioso y barato para una familia"
    **JSON esperado:**
    \`\`\`json
    {
      "sql": "SELECT c.*, cl.nombre AS clasificacion, ca.nombre AS carroceria, co.nombre AS combustible FROM coches c JOIN clasificaciones cl ON c.clasificacion_id = cl.id JOIN carrocerias ca ON c.carroceria_id = ca.id JOIN combustibles co ON c.combustible_id = co.id WHERE (ca.nombre IN (?, ?, ?) OR c.num_puertas = ?) AND c.precio < ? ORDER BY c.precio ASC",
      "params": ["SUV", "Familiar", "Monovolumen", 5, 15000]
    }
    \`\`\`
`;

    // Verificar la clave API
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY no está configurada en las variables de entorno');
      return generateFallbackQuery(searchText, filters);
    }

    // Llamar a la API de OpenAI (ChatGPT)
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en SQL especializado en optimización de consultas para bases de datos de concesionarios de vehículos.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extraer el contenido JSON de la respuesta
    const assistantMessage = response.data.choices[0].message.content;

    // Extraer el JSON de la respuesta (puede estar dentro de bloques de código)
    let jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    }

    if (!jsonMatch) {
      console.error('No se pudo extraer un JSON válido de la respuesta de ChatGPT');
      return generateFallbackQuery(searchText, filters);
    }

    // Parsear el JSON
    const jsonResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Verificar que el JSON tiene la estructura esperada
    if (!jsonResponse.sql || !jsonResponse.params) {
      console.error('La respuesta de ChatGPT no tiene la estructura esperada');
      return generateFallbackQuery(searchText, filters);
    }

    // Guardar en caché
    queryCache.set(cacheKey, { timestamp: Date.now(), data: jsonResponse });
    console.log(jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('Error al generar consulta SQL con ChatGPT:', error.message);
    // Si hay un error, usar la consulta de respaldo
    return generateFallbackQuery(searchText, filters);
  }
}

/**
 * Genera una consulta SQL de respaldo cuando falla la API de OpenAI
 */
function generateFallbackQuery(searchText, filters = {}) {
  console.log('Generando consulta SQL de respaldo');

  // Construir consulta SQL básica
  let sql = `
    SELECT c.*, cl.nombre AS clasificacion, ca.nombre AS carroceria, co.nombre AS combustible 
    FROM coches c
    JOIN clasificaciones cl ON c.clasificacion_id = cl.id
    JOIN carrocerias ca ON c.carroceria_id = ca.id
    JOIN combustibles co ON c.combustible_id = co.id
  `;

  // Agregar condiciones básicas
  const conditions = [];
  const params = [];

  // Buscar en modelo
  if (searchText && searchText.trim() !== '') {
    conditions.push('(c.modelo LIKE ? OR cl.nombre LIKE ? OR ca.nombre LIKE ?)');
    const searchPattern = `%${searchText}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Agregar filtros adicionales
  if (filters.carroceria) {
    conditions.push('ca.nombre = ?');
    params.push(filters.carroceria);
  }

  if (filters.combustible) {
    conditions.push('co.nombre = ?');
    params.push(filters.combustible);
  }

  // Agregar cláusula WHERE si hay condiciones
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Ordenar por precio (o cualquier otro criterio)
  sql += ' ORDER BY c.precio ASC';

  return {
    sql,
    params
  };
}

module.exports = {
  generateSQLQuery
};
