const express = require('express');
const router = express.Router();
const movimentosController = require('../controllers/movimentos');

router.get('/', movimentosController.listarMovimentos);
router.get('/:id', movimentosController.buscarMovimento);
router.post('/', movimentosController.criarMovimento);
router.put('/:id', movimentosController.atualizarMovimento);
router.delete('/:id', movimentosController.removerMovimento);

module.exports = router;
