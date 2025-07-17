const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos');

router.get('/', produtosController.listarProdutos);
router.get('/:id', produtosController.buscarProduto);
router.post('/', produtosController.criarProduto);
router.put('/:id', produtosController.atualizarProduto);
router.delete('/:id', produtosController.removerProduto);

module.exports = router;
