// Atualiza o campo link_drive de todos os itens de uma reserva
exports.atualizarLinkDrive = async (req, res, next) => {
  try {
    let { id_reserva, link_drive } = req.body;
    id_reserva = Number(id_reserva);
    if (!id_reserva || !link_drive) {
      return res.status(400).json({ success: false, message: 'id_reserva e link_drive são obrigatórios.' });
    }
    const result = await pool.query(
      'UPDATE erp.reservas SET link_drive = $1 WHERE id_reserva = $2 RETURNING *',
      [link_drive, id_reserva]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nenhum item de reserva encontrado para atualizar.' });
    }
    res.json({ success: true, message: 'link_drive atualizado', data: result.rows });
  } catch (err) {
    next(err);
  }
};
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
        const {
          id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
          frete, desconto, data_saida, data_retorno, dias_reservados
        } = item;
        const result = await pool.query(
          `INSERT INTO erp.reservas (
            id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
            frete, desconto, data_saida, data_retorno, dias_reservados
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
          [id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
            frete, desconto, data_saida, data_retorno, dias_reservados]
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

// Busca reserva por id_item_reserva (original)
exports.buscarReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM erp.reservas WHERE id_item_reserva = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// Busca reserva por id_reserva (novo endpoint para orçamentos agrupados)
exports.buscarReservaPorIdReserva = async (req, res, next) => {
  try {
    const { id_reserva } = req.params;
    const result = await pool.query('SELECT * FROM erp.reservas WHERE id_reserva = $1', [id_reserva]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' });
    // Retorna todos os itens da reserva agrupada
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.criarReserva = async (req, res, next) => {
  try {
    const {
      id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
      frete, desconto, data_saida, data_retorno, dias_reservados
    } = req.body;
    const result = await pool.query(
      `INSERT INTO erp.reservas (
        id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
        frete, desconto, data_saida, data_retorno, dias_reservados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
        frete, desconto, data_saida, data_retorno, dias_reservados]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
      frete, desconto, data_saida, data_retorno, dias_reservados
    } = req.body;
    const result = await pool.query(
      `UPDATE erp.reservas SET
        id_cliente=$1, id_local=$2, data_inicio=$3, data_fim=$4, id_produto=$5, quantidade=$6, status=$7, observacoes=$8,
        frete=$9, desconto=$10, data_saida=$11, data_retorno=$12, dias_reservados=$13, data_atualizacao=NOW()
        WHERE id_item_reserva=$14 RETURNING *`,
      [id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
        frete, desconto, data_saida, data_retorno, dias_reservados, id]
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
  const client = await pool.connect();
  try {
    const { id_reserva, itens } = req.body;
    
    if (!id_reserva || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'id_reserva e itens são obrigatórios' 
      });
    }

    await client.query('BEGIN');

    // Primeiro, remove os itens antigos da reserva
    await client.query('DELETE FROM erp.reservas WHERE id_reserva = $1', [id_reserva]);

    // Depois, insere os itens atualizados
    const insertedItems = [];
    for (const item of itens) {
      const {
        id_cliente, id_local, data_inicio, data_fim, 
        id_produto, quantidade, status, observacoes,
        frete, desconto, data_saida, data_retorno, dias_reservados, link_drive
      } = item;

      const result = await client.query(
        `INSERT INTO erp.reservas (
          id_reserva, id_cliente, id_local, data_inicio, data_fim, 
          id_produto, quantidade, status, observacoes,
          frete, desconto, data_saida, data_retorno, dias_reservados, link_drive
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        RETURNING *`,
        [
          id_reserva, id_cliente, id_local, data_inicio, data_fim,
          id_produto, quantidade, status || 'iniciada', observacoes,
          frete || 0, desconto || 0, data_saida, data_retorno, 
          dias_reservados || 0, link_drive || ''
        ]
      );
      
      insertedItems.push(result.rows[0]);
    }

    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Orçamento atualizado com sucesso',
      data: insertedItems
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar orçamento:', err);
    next(err);
  } finally {
    client.release();
  }
};

exports.atualizarStatusReserva = async (req, res, next) => {
  try {
    const { id_item_reserva, status } = req.body;
    const result = await pool.query(
      'UPDATE erp.reservas SET status = $1 WHERE id_item_reserva = $2 RETURNING *',
      [status, id_item_reserva]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reserva não encontrada.' });
    }
    res.json({ success: true, message: 'Status atualizado', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
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
        const {
          id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
          frete, desconto, data_saida, data_retorno, dias_reservados
        } = item;
        // Força o id_reserva explicitamente
        const result = await pool.query(
          `INSERT INTO erp.reservas (
            id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
            frete, desconto, data_saida, data_retorno, dias_reservados
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
          [id_reserva, id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status, observacoes,
            frete, desconto, data_saida, data_retorno, dias_reservados]
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
