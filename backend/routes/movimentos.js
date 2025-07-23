
const express = require('express');
const router = express.Router();
const movimentosController = require('../controllers/movimentos');

router.get('/buscar-produto', movimentosController.buscarMovimentosPorProduto);
router.get('/buscar-tipo', movimentosController.buscarMovimentosPorTipo);
router.get('/buscar-periodo', movimentosController.buscarMovimentosPorPeriodo);
router.get('/', movimentosController.listarMovimentos);
router.post('/', movimentosController.criarMovimento);
router.get('/:id', movimentosController.buscarMovimento);
router.delete('/:id', movimentosController.removerMovimento);

module.exports = router;
