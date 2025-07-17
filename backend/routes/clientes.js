const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes');

router.get('/', clientesController.listarClientes);
router.get('/:id', clientesController.buscarCliente);
router.post('/', clientesController.criarCliente);
router.put('/:id', clientesController.atualizarCliente);
router.delete('/:id', clientesController.removerCliente);

module.exports = router;
