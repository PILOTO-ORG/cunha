const express = require('express');
const { validateLogin } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db');

// Variável de ambiente recomendada para produção
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Email e senha obrigatórios.' });
  }
  try {
    const result = await pool.query('SELECT * FROM erp.usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, perfil: user.perfil }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, message: 'Token ausente.' });
  const token = auth.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, data: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token inválido.' });
  }
});

module.exports = router;
