const express = require('express');
const CocheController = require('../controllers/coche.controller');

const router = express.Router();

// Ruta para obtener todos los coches con paginación
router.get('/', CocheController.getCoches);

// Ruta para obtener un coche específico por su ID
router.get('/:id', CocheController.getCocheById);

module.exports = router;
