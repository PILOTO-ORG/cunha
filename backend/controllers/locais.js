const pool = require('../db');

exports.listarLocais = async (req, res, next) => {
  try {
    const { search, tipo } = req.query;
    let query = 'SELECT * FROM erp.locais';
    let params = [];
    if (search && tipo) {
      query += ' WHERE descricao ILIKE $1 AND tipo = $2';
      params = [`%${search}%`, tipo];
    } else if (search) {
      query += ' WHERE descricao ILIKE $1';
      params = [`%${search}%`];
    } else if (tipo) {
      query += ' WHERE tipo = $1';
      params = [tipo];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarLocal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM erp.locais WHERE id_local = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Local não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.criarLocal = async (req, res, next) => {
  try {
    const { descricao, endereco, capacidade, tipo } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.locais (descricao, endereco, capacidade, tipo) VALUES ($1, $2, $3, $4) RETURNING *',
      [descricao, endereco, capacidade, tipo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarLocal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descricao, endereco, capacidade, tipo } = req.body;
    const result = await pool.query(
      'UPDATE erp.locais SET descricao=$1, endereco=$2, capacidade=$3, tipo=$4 WHERE id_local=$5 RETURNING *',
      [descricao, endereco, capacidade, tipo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Local não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.removerLocal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM erp.locais WHERE id_local = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Local não encontrado' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
