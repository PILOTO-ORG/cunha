const { body, validationResult } = require('express-validator');

module.exports = {
  validateLogin: [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: true, message: 'Erro de validação', details: errors.array() });
      }
      next();
    }
  ]
};
