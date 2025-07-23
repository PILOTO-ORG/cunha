
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes');

router.get('/buscar-nome', clientesController.buscarClientesPorNome);
router.get('/buscar-email', clientesController.buscarClientePorEmail);
router.get('/verificar-existe', clientesController.verificarClienteExiste);
router.get('/estatisticas', clientesController.obterEstatisticasCliente);
router.get('/', clientesController.listarClientes);
router.post('/', clientesController.criarCliente);
router.get('/:id', clientesController.buscarCliente);
router.put('/:id', clientesController.atualizarCliente);
router.delete('/:id', clientesController.removerCliente);

module.exports = router;
