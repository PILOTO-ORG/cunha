// ...existing code...
exports.listarProdutosEstoqueBaixo = async (req, res, next) => {
  try {
    // Lógica mínima: retorna todos produtos com quantidade_total <= 10
    const result = await pool.query('SELECT * FROM erp.produtos WHERE quantidade_total <= $1', [10]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.verificarDisponibilidadeProduto = async (req, res, next) => {
  try {
    // Lógica mínima: retorna produto e campo fictício de disponibilidade
    const { id_produto } = req.query;
    if (!id_produto) return res.status(400).json({ error: 'id_produto é obrigatório' });
    const result = await pool.query('SELECT * FROM erp.produtos WHERE id_produto = $1', [id_produto]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    // Exemplo: sempre disponível
    res.json({ ...result.rows[0], disponibilidade: true });
  } catch (err) { next(err); }
};
const pool = require('../db');

exports.listarProdutos = async (req, res, next) => {
  try {
    const { search, incluirRemovidos } = req.query;
    let query = 'SELECT * FROM erp.produtos';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filter by search term if provided
    if (search) {
      conditions.push(`nome ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Exclude removed products by default
    if (incluirRemovidos !== 'true') {
      conditions.push(`(removido = false OR removido IS NULL)`);
    }

    // Build the WHERE clause if we have any conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY nome';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { 
    console.error('Error listing products:', err);
    next(err); 
  }
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
    const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza, observacoes } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.produtos (nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza, observacoes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza, observacoes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarProduto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza, removido, observacoes } = req.body;
    
    // Get the current product to preserve existing values for partial updates
    const currentProduct = await pool.query('SELECT * FROM erp.produtos WHERE id_produto = $1', [id]);
    if (currentProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Prepare the update fields and values
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    // Helper function to add field to update if it exists in the request body
    const addField = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    };
    
    // Add fields to update
    addField('nome', nome !== undefined ? nome : currentProduct.rows[0].nome);
    addField('quantidade_total', quantidade_total !== undefined ? quantidade_total : currentProduct.rows[0].quantidade_total);
    addField('valor_locacao', valor_locacao !== undefined ? valor_locacao : currentProduct.rows[0].valor_locacao);
    addField('valor_danificacao', valor_danificacao !== undefined ? valor_danificacao : currentProduct.rows[0].valor_danificacao);
    addField('tempo_limpeza', tempo_limpeza !== undefined ? tempo_limpeza : currentProduct.rows[0].tempo_limpeza);
    addField('observacoes', observacoes !== undefined ? observacoes : currentProduct.rows[0].observacoes);
    
    // Handle soft delete flag
    if (removido !== undefined) {
      addField('removido', removido);
      // Set the removed_at timestamp if this is a soft delete
      if (removido === true) {
        updateFields.push('removido_em = CURRENT_TIMESTAMP');
      } else {
        updateFields.push('removido_em = NULL');
      }
    }
    
    // Always update the updated_at timestamp
    updateFields.push('atualizado = CURRENT_TIMESTAMP');
    
    // Build and execute the query
    const query = `
      UPDATE erp.produtos 
      SET ${updateFields.join(', ')}
      WHERE id_produto = $${paramIndex}
      RETURNING *
    `;
    values.push(id);
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) { 
    console.error('Error updating product:', err);
    next(err); 
  }
};

exports.removerProduto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM erp.produtos WHERE id_produto = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
