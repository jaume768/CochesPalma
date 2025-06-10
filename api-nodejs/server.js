const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

// Importar rutas
const vehiculoRoutes = require('./routes/vehiculo.routes');
const cocheDestacadoRoutes = require('./routes/coche-destacado.routes');
const cocheRoutes = require('./routes/coche.routes');
const rentacarRoutes = require('./routes/rentacar.routes');
const searchRoutes = require('./routes/searchRoutes');

// Inicializar la app de Express
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Seguridad HTTP
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API del concesionario funcionando correctamente' });
});

// Configuración de rutas
app.use('/api/backend/vehiculos', vehiculoRoutes);
app.use('/api/backend/coches-destacados', cocheDestacadoRoutes);
app.use('/api/backend/coches', cocheRoutes);
app.use('/api/backend/rentacars', rentacarRoutes);
app.use('/api/backend/search', searchRoutes);

// Iniciar la conexión a la base de datos y levantar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('Conexión exitosa a la base de datos MySQL');
    
    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
