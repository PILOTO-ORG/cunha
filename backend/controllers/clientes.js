const pool = require('../db');

exports.listarClientes = async (req, res, next) => {
  try {
    // Log the incoming query parameters for debugging
    console.log('Query parameters:', req.query);
    
    const { search } = req.query;
    
    // Initialize the base query and parameters
    let query = 'SELECT * FROM erp.clientes';
    const conditions = [];
    const params = [];
    
    // Always filter out removed clients by default
    conditions.push('(removido IS NULL OR removido = false)');
    
    // Handle search filter if provided
    if (search && search.trim() !== '') {
      conditions.push('nome ILIKE $' + (conditions.length + 1));
      params.push(`%${search.trim()}%`);
    }
    
    // Construct the final query
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Always order by most recent first
    query += ' ORDER BY id_cliente DESC';
    
    // Log the complete query for debugging
    console.log('Final SQL Query:', query);
    console.log('Query Parameters:', params);
    
    // Execute the query
    const result = await pool.query(query, params);
    
    // Log detailed results for debugging
    console.log(`Query returned ${result.rows.length} clients`);
    
    // Log sample data and count of removed clients in results
    if (result.rows.length > 0) {
      console.log('First client in results:', {
        id: result.rows[0].id_cliente,
        nome: result.rows[0].nome,
        removido: result.rows[0].removido,
        email: result.rows[0].email
      });
      
      // Count how many clients are marked as removed in the results
      const removedClients = result.rows.filter(r => r.removido === true);
      console.log(`Found ${removedClients.length} removed clients in results`);
      
      if (removedClients.length > 0) {
        console.log('Sample removed client:', {
          id: removedClients[0].id_cliente,
          nome: removedClients[0].nome,
          removido: removedClients[0].removido
        });
      }
    }
    
    res.json(result.rows);
  } catch (err) { 
    console.error('Error in listarClientes:', err);
    next(err); 
  }
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
    const { nome, telefone, email, cpf_cnpj, observacoes } = req.body;
    const result = await pool.query(
      'INSERT INTO erp.clientes (nome, telefone, email, cpf_cnpj, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, telefone, email, cpf_cnpj, observacoes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarCliente = async (req, res, next) => {
  try {
    console.log('=== INÍCIO DA ATUALIZAÇÃO DE CLIENTE ===');
    console.log('Headers da requisição:', req.headers);
    console.log('Parâmetros da URL:', req.params);
    console.log('Corpo da requisição:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.params;
    // Primeiro tenta obter do campo 'dados', depois do corpo direto
    const requestData = req.body.dados || req.body;
    
    const { 
      nome, 
      telefone, 
      email, 
      cpf_cnpj, 
      rg_inscricao_estadual, 
      endereco, 
      cep,
      removido,
      observacoes
    } = requestData;
    
    console.log('ID do cliente a ser atualizado:', id);
    console.log('Dados recebidos para atualização:', JSON.stringify({
      nome,
      telefone,
      email,
      cpf_cnpj,
      rg_inscricao_estadual,
      endereco,
      cep,
      removido
    }, null, 2));
    
    // Verifica se o ID é válido
    if (!id || isNaN(parseInt(id))) {
      console.error('ID de cliente inválido:', id);
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    // Verifica se o cliente existe antes de tentar atualizar
    const clienteExistente = await pool.query('SELECT * FROM erp.clientes WHERE id_cliente = $1', [id]);
    console.log('Cliente encontrado no banco:', clienteExistente.rows[0] || 'Nenhum cliente encontrado');
    
    if (clienteExistente.rows.length === 0) {
      console.error('Cliente não encontrado para atualização');
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Monta a query dinamicamente apenas com os campos fornecidos
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    const addToUpdate = (field, value, isRequired = false) => {
      if (value !== undefined || isRequired) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(value !== undefined ? (value || null) : null);
        return true;
      }
      return false;
    };
    
    // Campos obrigatórios ou que devem ser atualizados explicitamente
    const fieldsToUpdate = {
      nome: { value: nome, required: true },
      telefone: { value: telefone },
      email: { value: email },
      cpf_cnpj: { value: cpf_cnpj },
      rg_inscricao_estadual: { value: rg_inscricao_estadual, required: true },
      endereco: { value: endereco, required: true },
      cep: { value: cep, required: true },
      observacoes: { value: observacoes },
      removido: { value: removido, required: true }
    };
    
    // Adiciona apenas os campos fornecidos ou obrigatórios
    Object.entries(fieldsToUpdate).forEach(([field, { value, required }]) => {
      addToUpdate(field, value, required);
    });
    
    // Sempre atualiza a data de atualização
    updates.push('atualizado = NOW()');
    
    if (updates.length === 1) { // Apenas a data de atualização foi adicionada
      console.error('Nenhum campo para atualizar foi fornecido');
      return res.status(400).json({ error: 'Nenhum campo para atualizar foi fornecido' });
    }
    
    // Adiciona o ID como último parâmetro
    values.push(id);
    const idParam = `$${paramCount}`;
    
    const query = `
      UPDATE erp.clientes 
      SET ${updates.join(', ')}
      WHERE id_cliente = ${idParam}
      RETURNING *
    `;
    
    console.log('Query SQL que será executada:', query);
    console.log('Valores dos parâmetros:', values);
    
    const result = await pool.query(query, values);
    
    console.log('Resultado da atualização:', {
      rowCount: result.rowCount,
      rows: result.rows
    });
    
    if (result.rows.length === 0) {
      console.error('Nenhuma linha foi atualizada, mas o cliente existe. Isso pode indicar um problema na condição WHERE.');
      return res.status(500).json({ error: 'Falha ao atualizar o cliente' });
    }
    
    // Busca o cliente atualizado para garantir que temos os dados mais recentes
    const clienteAtualizado = await pool.query('SELECT * FROM erp.clientes WHERE id_cliente = $1', [id]);
    console.log('Cliente após atualização:', clienteAtualizado.rows[0]);
    
    console.log('=== FIM DA ATUALIZAÇÃO DE CLIENTE ===');
    res.json(clienteAtualizado.rows[0]);
  } catch (err) { 
    console.error('=== ERRO AO ATUALIZAR CLIENTE ===');
    console.error('Erro completo:', err);
    console.error('Stack trace:', err.stack);
    console.error('=== FIM DO ERRO ===');
    next(err); 
  }
};


exports.removerCliente = async (req, res, next) => {
  try {
    console.log('=== INÍCIO DA DESATIVAÇÃO DE CLIENTE ===');
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      console.error('ID de cliente inválido para desativação:', id);
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    console.log(`Desativando cliente com ID: ${id}`);
    
    // Primeiro verifica se o cliente existe
    const clienteExistente = await pool.query(
      'SELECT * FROM erp.clientes WHERE id_cliente = $1', 
      [id]
    );
    
    if (clienteExistente.rows.length === 0) {
      console.error('Cliente não encontrado para desativação');
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Atualiza o status para removido (soft delete)
    const result = await pool.query(
      `UPDATE erp.clientes 
       SET removido = true, 
           atualizado = NOW() 
       WHERE id_cliente = $1 
       RETURNING *`, 
      [id]
    );
    
    if (result.rows.length === 0) {
      console.error('Falha ao desativar o cliente');
      return res.status(500).json({ error: 'Falha ao desativar o cliente' });
    }
    
    console.log('Cliente desativado com sucesso:', result.rows[0]);
    console.log('=== FIM DA DESATIVAÇÃO DE CLIENTE ===');
    
    res.json({ 
      success: true, 
      message: 'Cliente desativado com sucesso',
      cliente: result.rows[0]
    });
  } catch (err) { 
    console.error('Erro ao desativar cliente:', err);
    next(err); 
  }
};

// Funções mínimas para rotas extras
exports.buscarClientesPorNome = async (req, res, next) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const result = await pool.query(
      'SELECT * FROM erp.clientes WHERE nome ILIKE $1 AND removido = false', 
      [`%${nome}%`]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarClientePorEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });
    const result = await pool.query(
      'SELECT * FROM erp.clientes WHERE email = $1 AND removido = false', 
      [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.verificarClienteExiste = async (req, res, next) => {
  try {
    const { email, cpf_cnpj } = req.query;
    if (!email && !cpf_cnpj) return res.status(400).json({ error: 'Email ou CPF/CNPJ é obrigatório' });
    const result = await pool.query(
      'SELECT COUNT(*) FROM erp.clientes WHERE (email = $1 OR cpf_cnpj = $2) AND removido = false', 
      [email || '', cpf_cnpj || '']
    );
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
