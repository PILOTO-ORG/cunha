// Atualizar orçamento múltiplo (todos os itens de um id_reserva)
exports.atualizarOrcamentoMultiplo = async (req, res, next) => {
  try {
    const { id_reserva } = req.params;
    const { itens } = req.body;
    console.log('[atualizar-orcamento-multiplo] id_reserva:', id_reserva);
    console.log('[atualizar-orcamento-multiplo] Novos itens:', JSON.stringify(itens, null, 2));
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum item para atualizar.' });
    }
    // Remove todos os itens antigos desse orçamento
    await pool.query('DELETE FROM erp.reservas WHERE id_reserva = $1', [id_reserva]);
    const results = [];
    for (const item of itens) {
      try {
        const { id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes } = item;
        const result = await pool.query(
          'INSERT INTO erp.reservas (id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes]
        );
        results.push(result.rows[0]);
        console.log(`[atualizar-orcamento-multiplo] Item atualizado:`, result.rows[0]);
      } catch (err) {
        console.error(`[atualizar-orcamento-multiplo] Falha ao atualizar item:`, item, err.message);
      }
    }
    if (results.length === 0) {
      return res.status(500).json({ success: false, message: 'Falha ao atualizar orçamento múltiplo.' });
    }
    res.json({ success: true, message: 'Orçamento múltiplo atualizado', data: results });
  } catch (err) {
    console.error('[atualizar-orcamento-multiplo] Erro geral:', err.message);
    next(err);
  }
};
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

// Funções mínimas para rotas extras
exports.buscarReservasPorCliente = async (req, res, next) => {
  try {
    const { id_cliente } = req.query;
    if (!id_cliente) return res.status(400).json({ error: 'id_cliente é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.reservas WHERE id_cliente = $1', [id_cliente]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarReservasPorProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.query;
    if (!id_produto) return res.status(400).json({ error: 'id_produto é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.reservas WHERE id_produto = $1', [id_produto]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarReservasPorPeriodo = async (req, res, next) => {
  try {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) return res.status(400).json({ error: 'data_inicio e data_fim são obrigatórios' });
    const result = await pool.query('SELECT * FROM erp.reservas WHERE data_inicio >= $1 AND data_fim <= $2', [data_inicio, data_fim]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.atualizarOrcamento = async (req, res, next) => {
  try {
    // Exemplo mínimo: apenas retorna sucesso
    res.json({ success: true, message: 'Orçamento atualizado (placeholder)' });
  } catch (err) { next(err); }
};

exports.atualizarStatusReserva = async (req, res, next) => {
  try {
    // Exemplo mínimo: apenas retorna sucesso
    res.json({ success: true, message: 'Status atualizado (placeholder)' });
  } catch (err) { next(err); }
};

exports.criarOrcamentoMultiplo = async (req, res, next) => {
  try {
    console.log('[orcamento-multiplo] Payload recebido:', JSON.stringify(req.body, null, 2));
    const { itens } = req.body;
    if (!Array.isArray(itens) || itens.length === 0) {
      console.log('[orcamento-multiplo] Nenhum item recebido.');
      return res.status(400).json({ success: false, message: 'Nenhum item para orçamento.' });
    }
    // Garante id_reserva único para todos os itens usando sequence do banco
    const nextIdResult = await pool.query("SELECT nextval('erp.reservas_id_reserva_seq') AS id_reserva");
    const id_reserva = nextIdResult.rows[0].id_reserva;
    console.log('[orcamento-multiplo] id_reserva gerado (sequence):', id_reserva);
    const results = [];
    for (const item of itens) {
      try {
        const { id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes } = item;
        // Força o id_reserva explicitamente
        const result = await pool.query(
          'INSERT INTO erp.reservas (id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes]
        );
        // Garante que todos os itens retornem o mesmo id_reserva
        const row = { ...result.rows[0], id_reserva };
        results.push(row);
        console.log(`[orcamento-multiplo] Item inserido:`, row);
      } catch (err) {
        console.error(`[orcamento-multiplo] Falha ao inserir item:`, item, err.message);
      }
    }
    if (results.length === 0) {
      console.log('[orcamento-multiplo] Nenhum item foi inserido com sucesso.');
      return res.status(500).json({ success: false, message: 'Falha ao criar orçamento múltiplo.' });
    }
    res.json({ success: true, message: 'Orçamento múltiplo criado', id_reserva, data: results });
  } catch (err) {
    console.error('[orcamento-multiplo] Erro geral:', err.message);
    next(err);
  }
};
