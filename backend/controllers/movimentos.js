const pool = require('../db');

exports.listarMovimentos = async (req, res, next) => {
  try {
    const { tipo_evento } = req.query;
    let query = 'SELECT * FROM erp.movimentos';
    let params = [];
    if (tipo_evento) {
      query += ' WHERE tipo_evento = $1';
      params = [tipo_evento];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarMovimento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM erp.movimentos WHERE id_evento = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Movimento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.criarMovimento = async (req, res, next) => {
  try {
    const { id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.movimentos (id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarMovimento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id } = req.body;
    const result = await pool.query(
      'UPDATE erp.movimentos SET id_produto=$1, tipo_evento=$2, quantidade=$3, observacao=$4, responsavel=$5, reserva_id=$6 WHERE id_evento=$7 RETURNING *',
      [id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Movimento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};


exports.removerMovimento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM erp.movimentos WHERE id_evento = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Movimento não encontrado' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Funções mínimas para rotas extras
exports.buscarMovimentosPorProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.query;
    if (!id_produto) return res.status(400).json({ error: 'id_produto é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.movimentos WHERE id_produto = $1', [id_produto]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarMovimentosPorTipo = async (req, res, next) => {
  try {
    const { tipo_evento } = req.query;
    if (!tipo_evento) return res.status(400).json({ error: 'tipo_evento é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.movimentos WHERE tipo_evento = $1', [tipo_evento]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarMovimentosPorPeriodo = async (req, res, next) => {
  try {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) return res.status(400).json({ error: 'data_inicio e data_fim são obrigatórios' });
    const result = await pool.query('SELECT * FROM erp.movimentos WHERE data_evento >= $1 AND data_evento <= $2', [data_inicio, data_fim]);
    res.json(result.rows);
  } catch (err) { next(err); }
};
