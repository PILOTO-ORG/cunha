const pool = require('../db');

exports.listarReservas = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM erp.reservas';
    let params = [];
    if (status) {
      query += ' WHERE status = $1';
      params = [status];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM erp.reservas WHERE id_item_reserva = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.criarReserva = async (req, res, next) => {
  try {
    const { id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.reservas (id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes } = req.body;
    const result = await pool.query(
      'UPDATE erp.reservas SET id_cliente=$1, id_local=$2, data_inicio=$3, data_fim=$4, id_produto=$5, quantidade=$6, status=$7, observacoes=$8 WHERE id_item_reserva=$9 RETURNING *',
      [id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.removerReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM erp.reservas WHERE id_item_reserva = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
