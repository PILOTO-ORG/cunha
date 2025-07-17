const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservas');

router.get('/', reservasController.listarReservas);
router.get('/:id', reservasController.buscarReserva);
router.post('/', reservasController.criarReserva);
router.put('/:id', reservasController.atualizarReserva);
router.delete('/:id', reservasController.removerReserva);

module.exports = router;
