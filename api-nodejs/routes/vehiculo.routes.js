const express = require('express');
const VehiculoController = require('../controllers/vehiculo.controller');

const router = express.Router();

// Ruta para obtener todos los vehículos
router.get('/', VehiculoController.getAllVehiculos);

// Ruta para obtener un vehículo por su ID
router.get('/:id', VehiculoController.getVehiculoById);

module.exports = router;
