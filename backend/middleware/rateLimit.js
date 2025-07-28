// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo de 10 requisições por IP
  message: {
    success: false,
    error: true,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.'
  }
});

module.exports = { authLimiter };
