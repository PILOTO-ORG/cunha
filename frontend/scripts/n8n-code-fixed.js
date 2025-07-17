// ========================================
// CÓDIGO N8N COMPLETO CORRIGIDO - CUNHA FESTAS ERP
// ========================================
// Este código resolve todos os problemas identificados nos testes
// Deve ser colocado em um node "Code" no n8n

// CONFIGURAÇÃO PRINCIPAL - INTEGRAÇÃO COM N8N POSTGRESQL
const requestData = $input.all()[0].json;
const action = requestData.action;

console.log(`🔄 [MAIN] Processando ação: ${action}`);
console.log(`📥 [MAIN] Dados recebidos:`, JSON.stringify(requestData, null, 2));

// Função para executar queries no PostgreSQL via n8n
async function executeQuery(query, params = []) {
  console.log(`🔧 [QUERY] SQL: ${query}`);
  console.log(`📋 [QUERY] Params: ${JSON.stringify(params)}`);
  
  return {
    operation: 'executeQuery',
    query: query,
    parameters: params,
    action: action,
    originalData: requestData
  };
}

// Switch principal para roteamento de ações
switch (action) {
  // ==========================================
  // PRODUTOS
  // ==========================================
  case 'listar_produtos':
    return await executeQuery(`
      SELECT 
        p.id_produto,
        p.nome,
        p.quantidade_total,
        p.valor_locacao,
        p.valor_danificacao,
        p.tempo_limpeza
      FROM erp.produtos p
      ORDER BY p.nome
      LIMIT 50
    `);

  case 'criar_produto':
    if (!requestData.nome || !requestData.quantidade_total) {
      return {
        success: false,
        error: 'Nome e quantidade total são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      INSERT INTO erp.produtos (nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_produto, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza
    `, [requestData.nome, requestData.quantidade_total, requestData.valor_locacao, requestData.valor_danificacao, requestData.tempo_limpeza]);

  case 'buscar_produto':
    if (!requestData.id_produto) {
      return {
        success: false,
        error: 'ID do produto é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        p.id_produto,
        p.nome,
        p.quantidade_total,
        p.valor_locacao,
        p.valor_danificacao,
        p.tempo_limpeza
      FROM erp.produtos p
      WHERE p.id_produto = $1
    `, [requestData.id_produto]);

  case 'atualizar_produto':
    if (!requestData.id_produto) {
      return {
        success: false,
        error: 'ID do produto é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;
    
    if (requestData.nome !== undefined) {
      updateFields.push(`nome = $${paramIndex++}`);
      updateParams.push(requestData.nome);
    }
    if (requestData.quantidade_total !== undefined) {
      updateFields.push(`quantidade_total = $${paramIndex++}`);
      updateParams.push(requestData.quantidade_total);
    }
    if (requestData.valor_locacao !== undefined) {
      updateFields.push(`valor_locacao = $${paramIndex++}`);
      updateParams.push(requestData.valor_locacao);
    }
    if (requestData.valor_danificacao !== undefined) {
      updateFields.push(`valor_danificacao = $${paramIndex++}`);
      updateParams.push(requestData.valor_danificacao);
    }
    if (requestData.tempo_limpeza !== undefined) {
      updateFields.push(`tempo_limpeza = $${paramIndex++}`);
      updateParams.push(requestData.tempo_limpeza);
    }
    
    updateParams.push(requestData.id_produto);
    
    return await executeQuery(`
      UPDATE erp.produtos 
      SET ${updateFields.join(', ')}
      WHERE id_produto = $${paramIndex}
      RETURNING id_produto, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza
    `, updateParams);

  case 'verificar_disponibilidade':
    if (!requestData.id_produto || !requestData.data_inicio || !requestData.data_fim) {
      return {
        success: false,
        error: 'ID do produto, data de início e data de fim são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        p.id_produto,
        p.nome,
        p.quantidade_total,
        COALESCE(SUM(ir.quantidade), 0) as quantidade_reservada,
        p.quantidade_total - COALESCE(SUM(ir.quantidade), 0) as quantidade_disponivel
      FROM erp.produtos p
      LEFT JOIN erp.itens_reserva ir ON p.id_produto = ir.id_produto
      LEFT JOIN erp.reservas r ON ir.id_reserva = r.id_reserva
      WHERE p.id_produto = $1
        AND (r.id_reserva IS NULL OR (
          r.status IN ('ativa', 'confirmada') 
          AND NOT (r.data_fim <= $2 OR r.data_inicio >= $3)
        ))
      GROUP BY p.id_produto, p.nome, p.quantidade_total
    `, [requestData.id_produto, requestData.data_inicio, requestData.data_fim]);

  case 'listar_produtos_estoque_baixo':
    return await executeQuery(`
      SELECT 
        p.id_produto,
        p.nome,
        p.quantidade_total,
        p.valor_locacao,
        p.valor_danificacao,
        p.tempo_limpeza
      FROM erp.produtos p
      WHERE p.quantidade_total <= 5
      ORDER BY p.quantidade_total ASC, p.nome
    `);

  // ==========================================
  // CLIENTES
  // ==========================================
  case 'listar_clientes':
    return await executeQuery(`
      SELECT 
        c.id_cliente,
        c.nome,
        c.telefone,
        c.email,
        c.cpf_cnpj
      FROM erp.clientes c
      ORDER BY c.nome
      LIMIT 50
    `);

  case 'criar_cliente':
    if (!requestData.nome || !requestData.telefone || !requestData.email) {
      return {
        success: false,
        error: 'Nome, telefone e email são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      INSERT INTO erp.clientes (nome, telefone, email, cpf_cnpj)
      VALUES ($1, $2, $3, $4)
      RETURNING id_cliente, nome, telefone, email, cpf_cnpj
    `, [requestData.nome, requestData.telefone, requestData.email, requestData.cpf_cnpj]);

  case 'buscar_cliente':
    if (!requestData.id_cliente) {
      return {
        success: false,
        error: 'ID do cliente é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        c.id_cliente,
        c.nome,
        c.telefone,
        c.email,
        c.cpf_cnpj
      FROM erp.clientes c
      WHERE c.id_cliente = $1
    `, [requestData.id_cliente]);

  case 'atualizar_cliente':
    if (!requestData.id_cliente) {
      return {
        success: false,
        error: 'ID do cliente é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    const clienteFields = [];
    const clienteParams = [];
    let clienteIndex = 1;
    
    if (requestData.nome !== undefined) {
      clienteFields.push(`nome = $${clienteIndex++}`);
      clienteParams.push(requestData.nome);
    }
    if (requestData.telefone !== undefined) {
      clienteFields.push(`telefone = $${clienteIndex++}`);
      clienteParams.push(requestData.telefone);
    }
    if (requestData.email !== undefined) {
      clienteFields.push(`email = $${clienteIndex++}`);
      clienteParams.push(requestData.email);
    }
    if (requestData.cpf_cnpj !== undefined) {
      clienteFields.push(`cpf_cnpj = $${clienteIndex++}`);
      clienteParams.push(requestData.cpf_cnpj);
    }
    
    clienteParams.push(requestData.id_cliente);
    
    return await executeQuery(`
      UPDATE erp.clientes 
      SET ${clienteFields.join(', ')}
      WHERE id_cliente = $${clienteIndex}
      RETURNING id_cliente, nome, telefone, email, cpf_cnpj
    `, clienteParams);

  case 'buscar_clientes_nome':
    if (!requestData.nome) {
      return {
        success: false,
        error: 'Nome é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        c.id_cliente,
        c.nome,
        c.telefone,
        c.email,
        c.cpf_cnpj
      FROM erp.clientes c
      WHERE c.nome ILIKE '%' || $1 || '%'
      ORDER BY c.nome
    `, [requestData.nome]);

  case 'buscar_cliente_email':
    if (!requestData.email) {
      return {
        success: false,
        error: 'Email é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        c.id_cliente,
        c.nome,
        c.telefone,
        c.email,
        c.cpf_cnpj
      FROM erp.clientes c
      WHERE c.email = $1
    `, [requestData.email]);

  case 'verificar_cliente_existe':
    if (!requestData.email && !requestData.cpf_cnpj) {
      return {
        success: false,
        error: 'Email ou CPF/CNPJ é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    let whereClause = '';
    let params = [];
    
    if (requestData.email && requestData.cpf_cnpj) {
      whereClause = 'WHERE c.email = $1 OR c.cpf_cnpj = $2';
      params = [requestData.email, requestData.cpf_cnpj];
    } else if (requestData.email) {
      whereClause = 'WHERE c.email = $1';
      params = [requestData.email];
    } else {
      whereClause = 'WHERE c.cpf_cnpj = $1';
      params = [requestData.cpf_cnpj];
    }
    
    return await executeQuery(`
      SELECT COUNT(*) as total
      FROM erp.clientes c
      ${whereClause}
    `, params);

  case 'obter_estatisticas_cliente':
    if (!requestData.id_cliente) {
      return {
        success: false,
        error: 'ID do cliente é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        c.id_cliente,
        c.nome,
        COUNT(r.id_reserva) as total_reservas,
        MAX(r.data_inicio) as ultima_reserva
      FROM erp.clientes c
      LEFT JOIN erp.reservas r ON c.id_cliente = r.id_cliente
      WHERE c.id_cliente = $1
      GROUP BY c.id_cliente, c.nome
    `, [requestData.id_cliente]);

  // ==========================================
  // LOCAIS
  // ==========================================
  case 'listar_locais':
    return await executeQuery(`
      SELECT 
        l.id_local,
        l.descricao,
        l.endereco,
        l.capacidade,
        l.tipo
      FROM erp.locais l
      ORDER BY l.descricao
      LIMIT 50
    `);

  case 'criar_local':
    if (!requestData.descricao || !requestData.endereco) {
      return {
        success: false,
        error: 'Descrição e endereço são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      INSERT INTO erp.locais (descricao, endereco, capacidade, tipo)
      VALUES ($1, $2, $3, $4)
      RETURNING id_local, descricao, endereco, capacidade, tipo
    `, [requestData.descricao, requestData.endereco, requestData.capacidade, requestData.tipo]);

  case 'buscar_local':
    if (!requestData.id_local) {
      return {
        success: false,
        error: 'ID do local é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        l.id_local,
        l.descricao,
        l.endereco,
        l.capacidade,
        l.tipo
      FROM erp.locais l
      WHERE l.id_local = $1
    `, [requestData.id_local]);

  case 'atualizar_local':
    if (!requestData.id_local) {
      return {
        success: false,
        error: 'ID do local é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    const localFields = [];
    const localParams = [];
    let localIndex = 1;
    
    if (requestData.descricao !== undefined) {
      localFields.push(`descricao = $${localIndex++}`);
      localParams.push(requestData.descricao);
    }
    if (requestData.endereco !== undefined) {
      localFields.push(`endereco = $${localIndex++}`);
      localParams.push(requestData.endereco);
    }
    if (requestData.capacidade !== undefined) {
      localFields.push(`capacidade = $${localIndex++}`);
      localParams.push(requestData.capacidade);
    }
    if (requestData.tipo !== undefined) {
      localFields.push(`tipo = $${localIndex++}`);
      localParams.push(requestData.tipo);
    }
    
    localParams.push(requestData.id_local);
    
    return await executeQuery(`
      UPDATE erp.locais 
      SET ${localFields.join(', ')}
      WHERE id_local = $${localIndex}
      RETURNING id_local, descricao, endereco, capacidade, tipo
    `, localParams);

  case 'buscar_locais_tipo':
    if (!requestData.tipo) {
      return {
        success: false,
        error: 'Tipo é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        l.id_local,
        l.descricao,
        l.endereco,
        l.capacidade,
        l.tipo
      FROM erp.locais l
      WHERE l.tipo = $1
      ORDER BY l.descricao
    `, [requestData.tipo]);

  case 'verificar_disponibilidade_local':
    if (!requestData.id_local || !requestData.data_inicio || !requestData.data_fim) {
      return {
        success: false,
        error: 'ID do local, data de início e data de fim são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        l.id_local,
        l.descricao,
        COUNT(r.id_reserva) as reservas_conflitantes
      FROM erp.locais l
      LEFT JOIN erp.reservas r ON l.id_local = r.id_local
        AND r.status IN ('ativa', 'confirmada')
        AND NOT (r.data_fim <= $2 OR r.data_inicio >= $3)
      WHERE l.id_local = $1
      GROUP BY l.id_local, l.descricao
    `, [requestData.id_local, requestData.data_inicio, requestData.data_fim]);

  // ==========================================
  // RESERVAS
  // ==========================================
  case 'listar_reservas':
    return await executeQuery(`
      SELECT 
        ir.id_item_reserva,
        ir.id_reserva,
        r.id_cliente,
        r.id_local,
        r.data_inicio,
        r.data_fim,
        r.status,
        ir.id_produto,
        ir.quantidade,
        c.nome as cliente_nome,
        l.descricao as local_descricao,
        p.nome as produto_nome
      FROM erp.itens_reserva ir
      JOIN erp.reservas r ON ir.id_reserva = r.id_reserva
      JOIN erp.clientes c ON r.id_cliente = c.id_cliente
      JOIN erp.locais l ON r.id_local = l.id_local
      JOIN erp.produtos p ON ir.id_produto = p.id_produto
      ORDER BY r.data_inicio DESC
      LIMIT 50
    `);

  case 'criar_reserva':
    if (!requestData.id_cliente || !requestData.id_local || !requestData.data_inicio || !requestData.data_fim || !requestData.id_produto || !requestData.quantidade) {
      return {
        success: false,
        error: 'Todos os campos obrigatórios devem ser preenchidos',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    if (requestData.quantidade <= 0) {
      return {
        success: false,
        error: 'Quantidade deve ser maior que zero',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    // Usar uma query complexa que cria ambos registros
    return await executeQuery(`
      WITH nova_reserva AS (
        INSERT INTO erp.reservas (id_cliente, id_local, data_inicio, data_fim, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_reserva
      ),
      novo_item AS (
        INSERT INTO erp.itens_reserva (id_reserva, id_produto, quantidade)
        SELECT nr.id_reserva, $6, $7
        FROM nova_reserva nr
        RETURNING id_item_reserva, id_reserva, id_produto, quantidade
      )
      SELECT 
        ni.id_item_reserva,
        ni.id_reserva,
        ni.id_produto,
        ni.quantidade,
        $1 as id_cliente,
        $2 as id_local,
        $3 as data_inicio,
        $4 as data_fim,
        $5 as status
      FROM novo_item ni
    `, [requestData.id_cliente, requestData.id_local, requestData.data_inicio, requestData.data_fim, requestData.status || 'ativa', requestData.id_produto, requestData.quantidade]);

  case 'buscar_reserva':
    if (!requestData.id_item_reserva) {
      return {
        success: false,
        error: 'ID do item de reserva é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        ir.id_item_reserva,
        ir.id_reserva,
        r.id_cliente,
        r.id_local,
        r.data_inicio,
        r.data_fim,
        r.status,
        ir.id_produto,
        ir.quantidade,
        c.nome as cliente_nome,
        l.descricao as local_descricao,
        p.nome as produto_nome
      FROM erp.itens_reserva ir
      JOIN erp.reservas r ON ir.id_reserva = r.id_reserva
      JOIN erp.clientes c ON r.id_cliente = c.id_cliente
      JOIN erp.locais l ON r.id_local = l.id_local
      JOIN erp.produtos p ON ir.id_produto = p.id_produto
      WHERE ir.id_item_reserva = $1
    `, [requestData.id_item_reserva]);

  case 'atualizar_reserva':
    if (!requestData.id_item_reserva || !requestData.quantidade) {
      return {
        success: false,
        error: 'ID do item de reserva e quantidade são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    if (requestData.quantidade <= 0) {
      return {
        success: false,
        error: 'Quantidade deve ser maior que zero',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    return await executeQuery(`
      UPDATE erp.itens_reserva 
      SET quantidade = $1
      WHERE id_item_reserva = $2
      RETURNING id_item_reserva, id_reserva, id_produto, quantidade
    `, [requestData.quantidade, requestData.id_item_reserva]);

  case 'buscar_reservas_cliente':
    if (!requestData.id_cliente) {
      return {
        success: false,
        error: 'ID do cliente é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        ir.id_item_reserva,
        ir.id_reserva,
        r.id_cliente,
        r.id_local,
        r.data_inicio,
        r.data_fim,
        r.status,
        ir.id_produto,
        ir.quantidade,
        l.descricao as local_descricao,
        p.nome as produto_nome
      FROM erp.itens_reserva ir
      JOIN erp.reservas r ON ir.id_reserva = r.id_reserva
      JOIN erp.locais l ON r.id_local = l.id_local
      JOIN erp.produtos p ON ir.id_produto = p.id_produto
      WHERE r.id_cliente = $1
      ORDER BY r.data_inicio DESC
    `, [requestData.id_cliente]);

  case 'buscar_reservas_produto':
    if (!requestData.id_produto) {
      return {
        success: false,
        error: 'ID do produto é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        ir.id_item_reserva,
        ir.id_reserva,
        r.id_cliente,
        r.id_local,
        r.data_inicio,
        r.data_fim,
        r.status,
        ir.id_produto,
        ir.quantidade,
        c.nome as cliente_nome,
        l.descricao as local_descricao,
        p.nome as produto_nome
      FROM erp.itens_reserva ir
      JOIN erp.reservas r ON ir.id_reserva = r.id_reserva
      JOIN erp.clientes c ON r.id_cliente = c.id_cliente
      JOIN erp.locais l ON r.id_local = l.id_local
      JOIN erp.produtos p ON ir.id_produto = p.id_produto
      WHERE ir.id_produto = $1
      ORDER BY r.data_inicio DESC
    `, [requestData.id_produto]);

  case 'buscar_reservas_periodo':
    if (!requestData.data_inicio || !requestData.data_fim) {
      return {
        success: false,
        error: 'Data de início e data de fim são obrigatórias',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        ir.id_item_reserva,
        ir.id_reserva,
        r.id_cliente,
        r.id_local,
        r.data_inicio,
        r.data_fim,
        r.status,
        ir.id_produto,
        ir.quantidade,
        c.nome as cliente_nome,
        l.descricao as local_descricao,
        p.nome as produto_nome
      FROM erp.itens_reserva ir
      JOIN erp.reservas r ON ir.id_reserva = r.id_reserva
      JOIN erp.clientes c ON r.id_cliente = c.id_cliente
      JOIN erp.locais l ON r.id_local = l.id_local
      JOIN erp.produtos p ON ir.id_produto = p.id_produto
      WHERE r.data_inicio >= $1 AND r.data_fim <= $2
      ORDER BY r.data_inicio DESC
    `, [requestData.data_inicio, requestData.data_fim]);

  case 'atualizar_status_reserva':
    if (!requestData.id_item_reserva || !requestData.status) {
      return {
        success: false,
        error: 'ID do item de reserva e status são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      UPDATE erp.reservas 
      SET status = $1
      WHERE id_reserva = (
        SELECT id_reserva FROM erp.itens_reserva WHERE id_item_reserva = $2
      )
      RETURNING id_reserva, status
    `, [requestData.status, requestData.id_item_reserva]);

  // ==========================================
  // MOVIMENTOS
  // ==========================================
  case 'listar_movimentos':
    return await executeQuery(`
      SELECT 
        e.id_evento,
        e.id_produto,
        e.data_evento,
        e.tipo_evento,
        e.quantidade,
        e.observacao,
        e.responsavel,
        e.reserva_id,
        p.nome as produto_nome
      FROM erp.eventos_estoque e
      JOIN erp.produtos p ON e.id_produto = p.id_produto
      ORDER BY e.data_evento DESC
      LIMIT 50
    `);

  case 'criar_movimento':
    if (!requestData.id_produto || !requestData.tipo_evento || !requestData.quantidade) {
      return {
        success: false,
        error: 'ID do produto, tipo de evento e quantidade são obrigatórios',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    if (requestData.quantidade <= 0) {
      return {
        success: false,
        error: 'Quantidade deve ser maior que zero',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    const tiposValidos = ['entrada', 'saida', 'perda', 'manutencao'];
    if (!tiposValidos.includes(requestData.tipo_evento)) {
      return {
        success: false,
        error: 'Tipo de evento inválido. Use: entrada, saida, perda ou manutencao',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    
    return await executeQuery(`
      INSERT INTO erp.eventos_estoque (
        id_produto, 
        tipo_evento, 
        quantidade, 
        observacao, 
        responsavel, 
        reserva_id,
        data_evento
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW()
      ) RETURNING 
        id_evento,
        id_produto,
        data_evento,
        tipo_evento,
        quantidade,
        observacao,
        responsavel,
        reserva_id
    `, [requestData.id_produto, requestData.tipo_evento, requestData.quantidade, requestData.observacao, requestData.responsavel, requestData.reserva_id]);

  case 'buscar_movimento':
    if (!requestData.id_evento) {
      return {
        success: false,
        error: 'ID do evento é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        e.id_evento,
        e.id_produto,
        e.data_evento,
        e.tipo_evento,
        e.quantidade,
        e.observacao,
        e.responsavel,
        e.reserva_id,
        p.nome as produto_nome
      FROM erp.eventos_estoque e
      JOIN erp.produtos p ON e.id_produto = p.id_produto
      WHERE e.id_evento = $1
    `, [requestData.id_evento]);

  case 'buscar_movimentos_produto':
    if (!requestData.id_produto) {
      return {
        success: false,
        error: 'ID do produto é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        e.id_evento,
        e.id_produto,
        e.data_evento,
        e.tipo_evento,
        e.quantidade,
        e.observacao,
        e.responsavel,
        e.reserva_id,
        p.nome as produto_nome
      FROM erp.eventos_estoque e
      JOIN erp.produtos p ON e.id_produto = p.id_produto
      WHERE e.id_produto = $1
      ORDER BY e.data_evento DESC
    `, [requestData.id_produto]);

  case 'buscar_movimentos_tipo':
    if (!requestData.tipo_evento) {
      return {
        success: false,
        error: 'Tipo de evento é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        e.id_evento,
        e.id_produto,
        e.data_evento,
        e.tipo_evento,
        e.quantidade,
        e.observacao,
        e.responsavel,
        e.reserva_id,
        p.nome as produto_nome
      FROM erp.eventos_estoque e
      JOIN erp.produtos p ON e.id_produto = p.id_produto
      WHERE e.tipo_evento = $1
      ORDER BY e.data_evento DESC
    `, [requestData.tipo_evento]);

  case 'buscar_movimentos_periodo':
    if (!requestData.data_inicio || !requestData.data_fim) {
      return {
        success: false,
        error: 'Data de início e data de fim são obrigatórias',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        e.id_evento,
        e.id_produto,
        e.data_evento,
        e.tipo_evento,
        e.quantidade,
        e.observacao,
        e.responsavel,
        e.reserva_id,
        p.nome as produto_nome
      FROM erp.eventos_estoque e
      JOIN erp.produtos p ON e.id_produto = p.id_produto
      WHERE e.data_evento >= $1 AND e.data_evento <= $2
      ORDER BY e.data_evento DESC
    `, [requestData.data_inicio, requestData.data_fim]);

  case 'obter_historico_produto':
    if (!requestData.id_produto) {
      return {
        success: false,
        error: 'ID do produto é obrigatório',
        code: 'VALIDATION_ERROR',
        action: action,
        timestamp: new Date().toISOString()
      };
    }
    return await executeQuery(`
      SELECT 
        e.id_evento,
        e.id_produto,
        e.data_evento,
        e.tipo_evento,
        e.quantidade,
        e.observacao,
        e.responsavel,
        e.reserva_id,
        p.nome as produto_nome,
        p.quantidade_total as estoque_atual
      FROM erp.eventos_estoque e
      JOIN erp.produtos p ON e.id_produto = p.id_produto
      WHERE e.id_produto = $1
      ORDER BY e.data_evento DESC
    `, [requestData.id_produto]);

  // ==========================================
  // AÇÃO NÃO RECONHECIDA
  // ==========================================
  default:
    return {
      success: false,
      error: `Ação '${action}' não reconhecida`,
      code: 'VALIDATION_ERROR',
      action: action,
      timestamp: new Date().toISOString()
    };
}
