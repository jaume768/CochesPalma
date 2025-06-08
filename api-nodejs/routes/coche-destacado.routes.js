const express = require('express');
const CocheDestacadoController = require('../controllers/coche-destacado.controller');

const router = express.Router();

// Ruta para obtener todos los coches destacados
router.get('/', CocheDestacadoController.getAllCochesDestacados);

// Ruta para obtener un coche destacado por su ID
router.get('/:id', CocheDestacadoController.getCocheDestacadoById);

module.exports = router;
