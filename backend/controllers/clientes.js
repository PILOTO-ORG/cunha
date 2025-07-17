const pool = require('../db');

exports.listarClientes = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM erp.clientes';
    let params = [];
    if (search) {
      query += ' WHERE nome ILIKE $1';
      params.push(`%${search}%`);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM erp.clientes WHERE id_cliente = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.criarCliente = async (req, res, next) => {
  try {
    const { nome, telefone, email, cpf_cnpj } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.clientes (nome, telefone, email, cpf_cnpj) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, telefone, email, cpf_cnpj]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, cpf_cnpj } = req.body;
    const result = await pool.query(
      'UPDATE erp.clientes SET nome=$1, telefone=$2, email=$3, cpf_cnpj=$4 WHERE id_cliente=$5 RETURNING *',
      [nome, telefone, email, cpf_cnpj, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.removerCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM erp.clientes WHERE id_cliente = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
