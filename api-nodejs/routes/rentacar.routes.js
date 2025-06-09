const express = require('express');
const router = express.Router();
const RentacarController = require('../controllers/rentacar.controller');

// Obtener todos los servicios de alquiler (con filtro opcional por dirección)
router.get('/', RentacarController.getAllRentacars);

// Obtener un servicio de alquiler por su ID
router.get('/by-id/:id', RentacarController.getRentacarById);

// Crear un nuevo servicio de alquiler
router.post('/', RentacarController.createRentacar);

// Actualizar un servicio de alquiler existente
router.put('/:id', RentacarController.updateRentacar);

// Eliminar un servicio de alquiler
router.delete('/:id', RentacarController.deleteRentacar);

module.exports = router;
