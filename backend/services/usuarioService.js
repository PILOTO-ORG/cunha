const bcrypt = require('bcrypt');
const pool = require('../db');

// Função para criar usuário com hash de senha
async function criarUsuario({ email, senha, nome, perfil = 'user' }) {
  const hash = await bcrypt.hash(senha, 10);
  const result = await pool.query(
    'INSERT INTO erp.usuarios (email, senha, nome, perfil) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, hash, nome, perfil]
  );
  return result.rows[0];
}

// Função para atualizar senha de usuário
async function atualizarSenhaUsuario(id, novaSenha) {
  const hash = await bcrypt.hash(novaSenha, 10);
  await pool.query('UPDATE erp.usuarios SET senha = $1 WHERE id = $2', [hash, id]);
}

module.exports = { criarUsuario, atualizarSenhaUsuario };
