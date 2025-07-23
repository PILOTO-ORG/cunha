
const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos');

router.get('/estoque-baixo', produtosController.listarProdutosEstoqueBaixo);
router.get('/disponibilidade', produtosController.verificarDisponibilidadeProduto);
router.get('/', produtosController.listarProdutos);
router.post('/', produtosController.criarProduto);
router.get('/:id', produtosController.buscarProduto);
router.put('/:id', produtosController.atualizarProduto);
router.delete('/:id', produtosController.removerProduto);

module.exports = router;
