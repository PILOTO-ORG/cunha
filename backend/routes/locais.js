
const express = require('express');
const router = express.Router();
const locaisController = require('../controllers/locais');

router.get('/buscar-tipo', locaisController.buscarLocaisPorTipo);
router.get('/disponibilidade', locaisController.verificarDisponibilidadeLocal);
router.get('/', locaisController.listarLocais);
router.post('/', locaisController.criarLocal);
router.get('/:id', locaisController.buscarLocal);
router.put('/:id', locaisController.atualizarLocal);
router.delete('/:id', locaisController.removerLocal);

module.exports = router;
