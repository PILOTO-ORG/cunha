const express = require('express');
const router = express.Router();
const locaisController = require('../controllers/locais');

router.get('/', locaisController.listarLocais);
router.get('/:id', locaisController.buscarLocal);
router.post('/', locaisController.criarLocal);
router.put('/:id', locaisController.atualizarLocal);
router.delete('/:id', locaisController.removerLocal);

module.exports = router;
