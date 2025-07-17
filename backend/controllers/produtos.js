const pool = require('../db');

exports.listarProdutos = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM erp.produtos';
    let params = [];
    if (search) {
      query += ' WHERE nome ILIKE $1';
      params.push(`%${search}%`);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarProduto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM erp.produtos WHERE id_produto = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.criarProduto = async (req, res, next) => {
  try {
    const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.produtos (nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarProduto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = req.body;
    const result = await pool.query(
      'UPDATE erp.produtos SET nome=$1, quantidade_total=$2, valor_locacao=$3, valor_danificacao=$4, tempo_limpeza=$5 WHERE id_produto=$6 RETURNING *',
      [nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.removerProduto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM erp.produtos WHERE id_produto = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
