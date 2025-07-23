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

// Funções mínimas para rotas extras
exports.buscarClientesPorNome = async (req, res, next) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.clientes WHERE nome ILIKE $1', [`%${nome}%`]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarClientePorEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.clientes WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.verificarClienteExiste = async (req, res, next) => {
  try {
    const { email, cpf_cnpj } = req.query;
    if (!email && !cpf_cnpj) return res.status(400).json({ error: 'Email ou CPF/CNPJ é obrigatório' });
    const result = await pool.query('SELECT COUNT(*) FROM erp.clientes WHERE email = $1 OR cpf_cnpj = $2', [email || '', cpf_cnpj || '']);
    res.json({ existe: parseInt(result.rows[0].count) > 0 });
  } catch (err) { next(err); }
};

exports.obterEstatisticasCliente = async (req, res, next) => {
  try {
    const { id_cliente } = req.query;
    if (!id_cliente) return res.status(400).json({ error: 'id_cliente é obrigatório' });
    // Exemplo mínimo: retorna total de reservas e última reserva
    const reservas = await pool.query('SELECT COUNT(*) as total, MAX(data_inicio) as ultima FROM erp.reservas WHERE id_cliente = $1', [id_cliente]);
    const cliente = await pool.query('SELECT nome FROM erp.clientes WHERE id_cliente = $1', [id_cliente]);
    res.json({
      id_cliente,
      nome: cliente.rows[0]?.nome || '',
      total_reservas: parseInt(reservas.rows[0].total),
      ultima_reserva: reservas.rows[0].ultima
    });
  } catch (err) { next(err); }
};
