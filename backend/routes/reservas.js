
const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservas');

router.get('/buscar-cliente', reservasController.buscarReservasPorCliente);
router.get('/buscar-produto', reservasController.buscarReservasPorProduto);
router.get('/buscar-periodo', reservasController.buscarReservasPorPeriodo);
router.put('/atualizar-orcamento', reservasController.atualizarOrcamento);
router.put('/atualizar-link-drive', reservasController.atualizarLinkDrive);
router.put('/atualizar-status', reservasController.atualizarStatusReserva);
router.get('/', reservasController.listarReservas);
router.post('/orcamento-multiplo', reservasController.criarOrcamentoMultiplo);
router.post('/', reservasController.criarReserva);
// Rotas dinâmicas devem ficar no final para evitar conflito com rotas fixas
router.get('/:id', reservasController.buscarReserva);
router.put('/:id', reservasController.atualizarReserva);
router.delete('/:id', reservasController.removerReserva);

module.exports = router;
