/**
 * Rutas para la búsqueda inteligente de vehículos
 */
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Ruta para búsqueda de vehículos con IA
router.get('/vehicles', searchController.searchVehicles);

// Ruta para analizar la intención de búsqueda
router.get('/analyze-intent', searchController.analyzeSearchIntent);

module.exports = router;
