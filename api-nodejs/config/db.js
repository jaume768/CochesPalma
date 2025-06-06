const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'concesionario_user',
  password: process.env.DB_PASSWORD || 'concesionario_pass',
  database: process.env.DB_NAME || 'concesionario_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones para mejor rendimiento
let pool;

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    // Verificar la conexión
    const connection = await pool.getConnection();
    console.log('MySQL conectado correctamente');
    connection.release();
    return pool;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    process.exit(1);
  }
};

// Función para ejecutar consultas
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error al ejecutar consulta:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  query
};
