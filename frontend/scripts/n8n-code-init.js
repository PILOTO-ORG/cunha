// ========================================
// CÓDIGO N8N ATUALIZADO - CUNHA FESTAS ERP
// ========================================
// Este código deve ser colocado em um node "Code" no n8n
// Centraliza toda a lógica de negócio e validação

// Função principal que processa todas as requisições
return await processRequest();

async function processRequest() {
  // Captura os dados da requisição
  const requestData = $input.all()[0].json;
  const action = requestData.action;
  
  console.log(`🔄 Processando ação: ${action}`);
  console.log(`📥 Dados recebidos:`, JSON.stringify(requestData, null, 2));

  try {
    // Router principal baseado na ação
    switch (action) {
      // ==========================================
      // PRODUTOS
      // ==========================================
      case 'listar_produtos':
        return await listarProdutos(requestData);
      case 'criar_produto':
        return await criarProduto(requestData);
      case 'buscar_produto':
        return await buscarProduto(requestData);
      case 'atualizar_produto':
        return await atualizarProduto(requestData);
      case 'remover_produto':
        return await removerProduto(requestData);
      case 'verificar_disponibilidade':
        return await verificarDisponibilidadeProduto(requestData);
      case 'listar_produtos_estoque_baixo':
        return await listarProdutosEstoqueBaixo(requestData);

      // ==========================================
      // CLIENTES
      // ==========================================
      case 'listar_clientes':
        return await listarClientes(requestData);
      case 'criar_cliente':
        return await criarCliente(requestData);
      case 'buscar_cliente':
        return await buscarCliente(requestData);
      case 'atualizar_cliente':
        return await atualizarCliente(requestData);
      case 'remover_cliente':
        return await removerCliente(requestData);
      case 'buscar_clientes_nome':
        return await buscarClientesPorNome(requestData);
      case 'buscar_cliente_email':
        return await buscarClientePorEmail(requestData);
      case 'verificar_cliente_existe':
        return await verificarClienteExiste(requestData);
      case 'obter_estatisticas_cliente':
        return await obterEstatisticasCliente(requestData);

      // ==========================================
      // LOCAIS
      // ==========================================
      case 'listar_locais':
        return await listarLocais(requestData);
      case 'criar_local':
        return await criarLocal(requestData);
      case 'buscar_local':
        return await buscarLocal(requestData);
      case 'atualizar_local':
        return await atualizarLocal(requestData);
      case 'remover_local':
        return await removerLocal(requestData);
      case 'buscar_locais_tipo':
        return await buscarLocaisPorTipo(requestData);
      case 'verificar_disponibilidade_local':
        return await verificarDisponibilidadeLocal(requestData);

      // ==========================================
      // RESERVAS
      // ==========================================
      case 'listar_reservas':
        return await listarReservas(requestData);
      case 'criar_reserva':
        return await criarReserva(requestData);
      case 'buscar_reserva':
        return await buscarReserva(requestData);
      case 'atualizar_reserva':
        return await atualizarReserva(requestData);
      case 'remover_reserva':
        return await removerReserva(requestData);
      case 'buscar_reservas_cliente':
        return await buscarReservasPorCliente(requestData);
      case 'buscar_reservas_produto':
        return await buscarReservasPorProduto(requestData);
      case 'buscar_reservas_periodo':
        return await buscarReservasPorPeriodo(requestData);
      case 'atualizar_status_reserva':
        return await atualizarStatusReserva(requestData);

      // ==========================================
      // MOVIMENTOS
      // ==========================================
      case 'listar_movimentos':
        return await listarMovimentos(requestData);
      case 'criar_movimento':
        return await criarMovimento(requestData);
      case 'buscar_movimento':
        return await buscarMovimento(requestData);
      case 'buscar_movimentos_produto':
        return await buscarMovimentosPorProduto(requestData);
      case 'buscar_movimentos_tipo':
        return await buscarMovimentosPorTipo(requestData);
      case 'buscar_movimentos_periodo':
        return await buscarMovimentosPorPeriodo(requestData);
      case 'obter_historico_produto':
        return await obterHistoricoProduto(requestData);

      default:
        return createErrorResponse(`Ação '${action}' não reconhecida`, 'VALIDATION_ERROR', action);
    }
  } catch (error) {
    console.error(`❌ Erro no processamento:`, error);
    return createErrorResponse(error.message, 'INTERNAL_ERROR', action);
  }
}

// ==========================================
// FUNÇÕES DE PRODUTOS
// ==========================================

async function listarProdutos(data) {
  const { search, page = 1, limit = 50 } = data;
  const offset = (page - 1) * limit;
  
  const searchCondition = search ? `p.nome ILIKE '%${search}%'` : '1=1';
  
  const query = `
    SELECT 
      p.id_produto,
      p.nome,
      p.quantidade_total,
      p.valor_locacao,
      p.valor_danificacao,
      p.tempo_limpeza
    FROM erp.produtos p
    WHERE ${searchCondition}
    ORDER BY p.nome
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return createQueryResponse(query, {}, 'listar_produtos', data);
}

async function criarProduto(data) {
  const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = data;
  
  // Validações
  if (!nome || !quantidade_total) {
    return createErrorResponse('Nome e quantidade total são obrigatórios', 'VALIDATION_ERROR', 'criar_produto');
  }
  
  if (quantidade_total <= 0) {
    return createErrorResponse('Quantidade total deve ser maior que zero', 'VALIDATION_ERROR', 'criar_produto');
  }
  
  const query = `
    INSERT INTO erp.produtos (
      nome, 
      quantidade_total, 
      valor_locacao, 
      valor_danificacao, 
      tempo_limpeza
    ) VALUES (
      '${nome}', 
      ${quantidade_total}, 
      ${valor_locacao || 'NULL'}, 
      ${valor_danificacao || 'NULL'}, 
      ${tempo_limpeza || 'NULL'}
    ) RETURNING 
      id_produto,
      nome,
      quantidade_total,
      valor_locacao,
      valor_danificacao,
      tempo_limpeza
  `;
  
  return createQueryResponse(query, {}, 'criar_produto', data);
}

async function buscarProduto(data) {
  const { id_produto } = data;
  
  if (!id_produto) {
    return createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'buscar_produto');
  }
  
  const query = `
    SELECT 
      p.id_produto,
      p.nome,
      p.quantidade_total,
      p.valor_locacao,
      p.valor_danificacao,
      p.tempo_limpeza
    FROM erp.produtos p
    WHERE p.id_produto = ${id_produto}
  `;
  
  return createQueryResponse(query, {}, 'buscar_produto', data);
}

async function atualizarProduto(data) {
  const { id_produto, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = data;
  
  if (!id_produto) {
    return createErrorResponse('ID do produto é obrigatório para atualização', 'VALIDATION_ERROR', 'atualizar_produto');
  }
  
  const updates = [];
  if (nome !== undefined) updates.push(`nome = '${nome}'`);
  if (quantidade_total !== undefined) {
    if (quantidade_total <= 0) {
      return createErrorResponse('Quantidade total deve ser maior que zero', 'VALIDATION_ERROR', 'atualizar_produto');
    }
    updates.push(`quantidade_total = ${quantidade_total}`);
  }
  if (valor_locacao !== undefined) updates.push(`valor_locacao = ${valor_locacao || 'NULL'}`);
  if (valor_danificacao !== undefined) updates.push(`valor_danificacao = ${valor_danificacao || 'NULL'}`);
  if (tempo_limpeza !== undefined) updates.push(`tempo_limpeza = ${tempo_limpeza || 'NULL'}`);
  
  if (updates.length === 0) {
    return createErrorResponse('Nenhum campo para atualizar foi fornecido', 'VALIDATION_ERROR', 'atualizar_produto');
  }
  
  const query = `
    UPDATE erp.produtos 
    SET ${updates.join(', ')}
    WHERE id_produto = ${id_produto}
    RETURNING 
      id_produto,
      nome,
      quantidade_total,
      valor_locacao,
      valor_danificacao,
      tempo_limpeza
  `;
  
  return createQueryResponse(query, {}, 'atualizar_produto', data);
}

async function removerProduto(data) {
  const { id_produto } = data;
  
  if (!id_produto) {
    return createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'remover_produto');
  }
  
  const query = `DELETE FROM erp.produtos WHERE id_produto = ${id_produto}`;
  
  return createQueryResponse(query, {}, 'remover_produto', data);
}

async function verificarDisponibilidadeProduto(data) {
  const { id_produto, data_inicio, data_fim } = data;
  
  if (!id_produto || !data_inicio || !data_fim) {
    return createErrorResponse('ID do produto, data de início e data de fim são obrigatórios', 'VALIDATION_ERROR', 'verificar_disponibilidade');
  }
  
  const query = `
    SELECT 
      p.id_produto,
      p.nome,
      p.quantidade_total,
      COALESCE(SUM(r.quantidade), 0) as quantidade_reservada,
      p.quantidade_total - COALESCE(SUM(r.quantidade), 0) as quantidade_disponivel
    FROM erp.produtos p
    LEFT JOIN erp.reservas r ON p.id_produto = r.id_produto 
      AND r.status = 'ativa'
      AND (
        (r.data_inicio <= '${data_inicio}' AND r.data_fim > '${data_inicio}') OR
        (r.data_inicio < '${data_fim}' AND r.data_fim >= '${data_fim}') OR
        (r.data_inicio >= '${data_inicio}' AND r.data_fim <= '${data_fim}')
      )
    WHERE p.id_produto = ${id_produto}
    GROUP BY p.id_produto, p.nome, p.quantidade_total
  `;
  
  return createQueryResponse(query, {}, 'verificar_disponibilidade', data);
}

async function listarProdutosEstoqueBaixo(data) {
  const { limite_minimo = 10 } = data;
  
  const query = `
    SELECT 
      p.id_produto,
      p.nome,
      p.quantidade_total,
      p.valor_locacao,
      p.valor_danificacao,
      p.tempo_limpeza
    FROM erp.produtos p
    WHERE p.quantidade_total <= ${limite_minimo}
    ORDER BY p.quantidade_total ASC, p.nome
  `;
  
  return createQueryResponse(query, {}, 'listar_produtos_estoque_baixo', data);
}

// ==========================================
// FUNÇÕES DE CLIENTES
// ==========================================

async function listarClientes(data) {
  const { search, page = 1, limit = 50 } = data;
  const offset = (page - 1) * limit;
  
  const searchCondition = search ? 
    `(c.nome ILIKE '%${search}%' OR c.email ILIKE '%${search}%' OR c.telefone ILIKE '%${search}%')` : '1=1';
  
  const query = `
    SELECT 
      c.id_cliente,
      c.nome,
      c.telefone,
      c.email,
      c.cpf_cnpj
    FROM erp.clientes c
    WHERE ${searchCondition}
    ORDER BY c.nome
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return createQueryResponse(query, {}, 'listar_clientes', data);
}

async function criarCliente(data) {
  const { nome, telefone, email, cpf_cnpj } = data;
  
  if (!nome) {
    return createErrorResponse('Nome é obrigatório', 'VALIDATION_ERROR', 'criar_cliente');
  }
  
  const query = `
    INSERT INTO erp.clientes (
      nome, 
      telefone, 
      email, 
      cpf_cnpj
    ) VALUES (
      '${nome}', 
      ${telefone ? `'${telefone}'` : 'NULL'}, 
      ${email ? `'${email}'` : 'NULL'}, 
      ${cpf_cnpj ? `'${cpf_cnpj}'` : 'NULL'}
    ) RETURNING 
      id_cliente,
      nome,
      telefone,
      email,
      cpf_cnpj
  `;
  
  return createQueryResponse(query, {}, 'criar_cliente', data);
}

async function buscarCliente(data) {
  const { id_cliente } = data;
  
  if (!id_cliente) {
    return createErrorResponse('ID do cliente é obrigatório', 'VALIDATION_ERROR', 'buscar_cliente');
  }
  
  const query = `
    SELECT 
      c.id_cliente,
      c.nome,
      c.telefone,
      c.email,
      c.cpf_cnpj
    FROM erp.clientes c
    WHERE c.id_cliente = ${id_cliente}
  `;
  
  return createQueryResponse(query, {}, 'buscar_cliente', data);
}

async function atualizarCliente(data) {
  const { id_cliente, nome, telefone, email, cpf_cnpj } = data;
  
  if (!id_cliente) {
    return createErrorResponse('ID do cliente é obrigatório para atualização', 'VALIDATION_ERROR', 'atualizar_cliente');
  }
  
  const updates = [];
  if (nome !== undefined) updates.push(`nome = '${nome}'`);
  if (telefone !== undefined) updates.push(`telefone = ${telefone ? `'${telefone}'` : 'NULL'}`);
  if (email !== undefined) updates.push(`email = ${email ? `'${email}'` : 'NULL'}`);
  if (cpf_cnpj !== undefined) updates.push(`cpf_cnpj = ${cpf_cnpj ? `'${cpf_cnpj}'` : 'NULL'}`);
  
  if (updates.length === 0) {
    return createErrorResponse('Nenhum campo para atualizar foi fornecido', 'VALIDATION_ERROR', 'atualizar_cliente');
  }
  
  const query = `
    UPDATE erp.clientes 
    SET ${updates.join(', ')}
    WHERE id_cliente = ${id_cliente}
    RETURNING 
      id_cliente,
      nome,
      telefone,
      email,
      cpf_cnpj
  `;
  
  return createQueryResponse(query, {}, 'atualizar_cliente', data);
}

async function removerCliente(data) {
  const { id_cliente } = data;
  
  if (!id_cliente) {
    return createErrorResponse('ID do cliente é obrigatório', 'VALIDATION_ERROR', 'remover_cliente');
  }
  
  const query = `DELETE FROM erp.clientes WHERE id_cliente = ${id_cliente}`;
  
  return createQueryResponse(query, {}, 'remover_cliente', data);
}

async function buscarClientesPorNome(data) {
  const { nome } = data;
  
  if (!nome) {
    return createErrorResponse('Nome é obrigatório para busca', 'VALIDATION_ERROR', 'buscar_clientes_nome');
  }
  
  const query = `
    SELECT 
      c.id_cliente,
      c.nome,
      c.telefone,
      c.email,
      c.cpf_cnpj
    FROM erp.clientes c
    WHERE c.nome ILIKE '%${nome}%'
    ORDER BY c.nome
    LIMIT 20
  `;
  
  return createQueryResponse(query, {}, 'buscar_clientes_nome', data);
}

async function buscarClientePorEmail(data) {
  const { email } = data;
  
  if (!email) {
    return createErrorResponse('Email é obrigatório para busca', 'VALIDATION_ERROR', 'buscar_cliente_email');
  }
  
  const query = `
    SELECT 
      c.id_cliente,
      c.nome,
      c.telefone,
      c.email,
      c.cpf_cnpj
    FROM erp.clientes c
    WHERE c.email = '${email}'
  `;
  
  return createQueryResponse(query, {}, 'buscar_cliente_email', data);
}

async function verificarClienteExiste(data) {
  const { email, cpf_cnpj } = data;
  
  if (!email && !cpf_cnpj) {
    return createErrorResponse('Email ou CPF/CNPJ é obrigatório', 'VALIDATION_ERROR', 'verificar_cliente_existe');
  }
  
  let whereCondition = [];
  if (email) whereCondition.push(`c.email = '${email}'`);
  if (cpf_cnpj) whereCondition.push(`c.cpf_cnpj = '${cpf_cnpj}'`);
  
  const query = `
    SELECT COUNT(*) as total
    FROM erp.clientes c
    WHERE ${whereCondition.join(' OR ')}
  `;
  
  return createQueryResponse(query, {}, 'verificar_cliente_existe', data);
}

async function obterEstatisticasCliente(data) {
  const { id_cliente } = data;
  
  if (!id_cliente) {
    return createErrorResponse('ID do cliente é obrigatório', 'VALIDATION_ERROR', 'obter_estatisticas_cliente');
  }
  
  const query = `
    SELECT 
      c.id_cliente,
      c.nome,
      COUNT(r.id_item_reserva) as total_reservas,
      MAX(r.data_inicio) as ultima_reserva
    FROM erp.clientes c
    LEFT JOIN erp.reservas r ON c.id_cliente = r.id_cliente
    WHERE c.id_cliente = ${id_cliente}
    GROUP BY c.id_cliente, c.nome
  `;
  
  return createQueryResponse(query, {}, 'obter_estatisticas_cliente', data);
}

// ==========================================
// FUNÇÕES DE LOCAIS
// ==========================================

async function listarLocais(data) {
  const { search, tipo, page = 1, limit = 50 } = data;
  const offset = (page - 1) * limit;
  
  let whereConditions = ['1=1'];
  if (search) whereConditions.push(`l.descricao ILIKE '%${search}%'`);
  if (tipo) whereConditions.push(`l.tipo = '${tipo}'`);
  
  const query = `
    SELECT 
      l.id_local,
      l.descricao,
      l.endereco,
      l.capacidade,
      l.tipo
    FROM erp.locais l
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY l.descricao
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return createQueryResponse(query, {}, 'listar_locais', data);
}

async function criarLocal(data) {
  const { descricao, endereco, capacidade, tipo } = data;
  
  if (!descricao) {
    return createErrorResponse('Descrição é obrigatória', 'VALIDATION_ERROR', 'criar_local');
  }
  
  const query = `
    INSERT INTO erp.locais (
      descricao, 
      endereco, 
      capacidade, 
      tipo
    ) VALUES (
      '${descricao}', 
      ${endereco ? `'${endereco}'` : 'NULL'}, 
      ${capacidade || 'NULL'}, 
      ${tipo ? `'${tipo}'` : 'NULL'}
    ) RETURNING 
      id_local,
      descricao,
      endereco,
      capacidade,
      tipo
  `;
  
  return createQueryResponse(query, {}, 'criar_local', data);
}

async function buscarLocal(data) {
  const { id_local } = data;
  
  if (!id_local) {
    return createErrorResponse('ID do local é obrigatório', 'VALIDATION_ERROR', 'buscar_local');
  }
  
  const query = `
    SELECT 
      l.id_local,
      l.descricao,
      l.endereco,
      l.capacidade,
      l.tipo
    FROM erp.locais l
    WHERE l.id_local = ${id_local}
  `;
  
  return createQueryResponse(query, {}, 'buscar_local', data);
}

async function atualizarLocal(data) {
  const { id_local, descricao, endereco, capacidade, tipo } = data;
  
  if (!id_local) {
    return createErrorResponse('ID do local é obrigatório para atualização', 'VALIDATION_ERROR', 'atualizar_local');
  }
  
  const updates = [];
  if (descricao !== undefined) updates.push(`descricao = '${descricao}'`);
  if (endereco !== undefined) updates.push(`endereco = ${endereco ? `'${endereco}'` : 'NULL'}`);
  if (capacidade !== undefined) updates.push(`capacidade = ${capacidade || 'NULL'}`);
  if (tipo !== undefined) updates.push(`tipo = ${tipo ? `'${tipo}'` : 'NULL'}`);
  
  if (updates.length === 0) {
    return createErrorResponse('Nenhum campo para atualizar foi fornecido', 'VALIDATION_ERROR', 'atualizar_local');
  }
  
  const query = `
    UPDATE erp.locais 
    SET ${updates.join(', ')}
    WHERE id_local = ${id_local}
    RETURNING 
      id_local,
      descricao,
      endereco,
      capacidade,
      tipo
  `;
  
  return createQueryResponse(query, {}, 'atualizar_local', data);
}

async function removerLocal(data) {
  const { id_local } = data;
  
  if (!id_local) {
    return createErrorResponse('ID do local é obrigatório', 'VALIDATION_ERROR', 'remover_local');
  }
  
  const query = `DELETE FROM erp.locais WHERE id_local = ${id_local}`;
  
  return createQueryResponse(query, {}, 'remover_local', data);
}

async function buscarLocaisPorTipo(data) {
  const { tipo } = data;
  
  if (!tipo) {
    return createErrorResponse('Tipo é obrigatório para busca', 'VALIDATION_ERROR', 'buscar_locais_tipo');
  }
  
  const query = `
    SELECT 
      l.id_local,
      l.descricao,
      l.endereco,
      l.capacidade,
      l.tipo
    FROM erp.locais l
    WHERE l.tipo = '${tipo}'
    ORDER BY l.descricao
  `;
  
  return createQueryResponse(query, {}, 'buscar_locais_tipo', data);
}

async function verificarDisponibilidadeLocal(data) {
  const { id_local, data_inicio, data_fim } = data;
  
  if (!id_local || !data_inicio || !data_fim) {
    return createErrorResponse('ID do local, data de início e data de fim são obrigatórios', 'VALIDATION_ERROR', 'verificar_disponibilidade_local');
  }
  
  const query = `
    SELECT 
      l.id_local,
      l.descricao,
      COUNT(r.id_item_reserva) as reservas_conflitantes
    FROM erp.locais l
    LEFT JOIN erp.reservas r ON l.id_local = r.id_local 
      AND r.status = 'ativa'
      AND (
        (r.data_inicio <= '${data_inicio}' AND r.data_fim > '${data_inicio}') OR
        (r.data_inicio < '${data_fim}' AND r.data_fim >= '${data_fim}') OR
        (r.data_inicio >= '${data_inicio}' AND r.data_fim <= '${data_fim}')
      )
    WHERE l.id_local = ${id_local}
    GROUP BY l.id_local, l.descricao
  `;
  
  return createQueryResponse(query, {}, 'verificar_disponibilidade_local', data);
}

// ==========================================
// FUNÇÕES DE RESERVAS
// ==========================================

async function listarReservas(data) {
  const { status, id_cliente, id_produto, page = 1, limit = 50 } = data;
  const offset = (page - 1) * limit;
  
  let whereConditions = ['1=1'];
  if (status) whereConditions.push(`r.status = '${status}'`);
  if (id_cliente) whereConditions.push(`r.id_cliente = ${id_cliente}`);
  if (id_produto) whereConditions.push(`r.id_produto = ${id_produto}`);
  
  const query = `
    SELECT 
      r.id_item_reserva,
      r.id_reserva,
      r.id_cliente,
      r.id_local,
      r.data_inicio,
      r.data_fim,
      r.status,
      r.id_produto,
      r.quantidade,
      c.nome as cliente_nome,
      l.descricao as local_descricao,
      p.nome as produto_nome
    FROM erp.reservas r
    LEFT JOIN erp.clientes c ON r.id_cliente = c.id_cliente
    LEFT JOIN erp.locais l ON r.id_local = l.id_local
    LEFT JOIN erp.produtos p ON r.id_produto = p.id_produto
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY r.data_inicio DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return createQueryResponse(query, {}, 'listar_reservas', data);
}

async function criarReserva(data) {
  const { id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status = 'ativa' } = data;
  
  if (!data_inicio || !data_fim || !id_produto || !quantidade) {
    return createErrorResponse('Data de início, data de fim, produto e quantidade são obrigatórios', 'VALIDATION_ERROR', 'criar_reserva');
  }
  
  if (quantidade <= 0) {
    return createErrorResponse('Quantidade deve ser maior que zero', 'VALIDATION_ERROR', 'criar_reserva');
  }
  
  const query = `
    INSERT INTO erp.reservas (
      id_cliente, 
      id_local, 
      data_inicio, 
      data_fim, 
      status, 
      id_produto, 
      quantidade
    ) VALUES (
      ${id_cliente || 'NULL'}, 
      ${id_local || 'NULL'}, 
      '${data_inicio}', 
      '${data_fim}', 
      '${status}', 
      ${id_produto}, 
      ${quantidade}
    ) RETURNING 
      id_item_reserva,
      id_reserva,
      id_cliente,
      id_local,
      data_inicio,
      data_fim,
      status,
      id_produto,
      quantidade
  `;
  
  return createQueryResponse(query, {}, 'criar_reserva', data);
}

async function buscarReserva(data) {
  const { id_item_reserva } = data;
  
  if (!id_item_reserva) {
    return createErrorResponse('ID da reserva é obrigatório', 'VALIDATION_ERROR', 'buscar_reserva');
  }
  
  const query = `
    SELECT 
      r.id_item_reserva,
      r.id_reserva,
      r.id_cliente,
      r.id_local,
      r.data_inicio,
      r.data_fim,
      r.status,
      r.id_produto,
      r.quantidade,
      c.nome as cliente_nome,
      l.descricao as local_descricao,
      p.nome as produto_nome
    FROM erp.reservas r
    LEFT JOIN erp.clientes c ON r.id_cliente = c.id_cliente
    LEFT JOIN erp.locais l ON r.id_local = l.id_local
    LEFT JOIN erp.produtos p ON r.id_produto = p.id_produto
    WHERE r.id_item_reserva = ${id_item_reserva}
  `;
  
  return createQueryResponse(query, {}, 'buscar_reserva', data);
}

async function atualizarReserva(data) {
  const { id_item_reserva, id_cliente, id_local, data_inicio, data_fim, status, quantidade } = data;
  
  if (!id_item_reserva) {
    return createErrorResponse('ID da reserva é obrigatório para atualização', 'VALIDATION_ERROR', 'atualizar_reserva');
  }
  
  const updates = [];
  if (id_cliente !== undefined) updates.push(`id_cliente = ${id_cliente || 'NULL'}`);
  if (id_local !== undefined) updates.push(`id_local = ${id_local || 'NULL'}`);
  if (data_inicio !== undefined) updates.push(`data_inicio = '${data_inicio}'`);
  if (data_fim !== undefined) updates.push(`data_fim = '${data_fim}'`);
  if (status !== undefined) updates.push(`status = '${status}'`);
  if (quantidade !== undefined) {
    if (quantidade <= 0) {
      return createErrorResponse('Quantidade deve ser maior que zero', 'VALIDATION_ERROR', 'atualizar_reserva');
    }
    updates.push(`quantidade = ${quantidade}`);
  }
  
  if (updates.length === 0) {
    return createErrorResponse('Nenhum campo para atualizar foi fornecido', 'VALIDATION_ERROR', 'atualizar_reserva');
  }
  
  const query = `
    UPDATE erp.reservas 
    SET ${updates.join(', ')}
    WHERE id_item_reserva = ${id_item_reserva}
    RETURNING 
      id_item_reserva,
      id_reserva,
      id_cliente,
      id_local,
      data_inicio,
      data_fim,
      status,
      id_produto,
      quantidade
  `;
  
  return createQueryResponse(query, {}, 'atualizar_reserva', data);
}

async function removerReserva(data) {
  const { id_item_reserva } = data;
  
  if (!id_item_reserva) {
    return createErrorResponse('ID da reserva é obrigatório', 'VALIDATION_ERROR', 'remover_reserva');
  }
  
  const query = `DELETE FROM erp.reservas WHERE id_item_reserva = ${id_item_reserva}`;
  
  return createQueryResponse(query, {}, 'remover_reserva', data);
}

async function buscarReservasPorCliente(data) {
  const { id_cliente } = data;
  
  if (!id_cliente) {
    return createErrorResponse('ID do cliente é obrigatório', 'VALIDATION_ERROR', 'buscar_reservas_cliente');
  }
  
  const query = `
    SELECT 
      r.id_item_reserva,
      r.id_reserva,
      r.id_cliente,
      r.id_local,
      r.data_inicio,
      r.data_fim,
      r.status,
      r.id_produto,
      r.quantidade,
      l.descricao as local_descricao,
      p.nome as produto_nome
    FROM erp.reservas r
    LEFT JOIN erp.locais l ON r.id_local = l.id_local
    LEFT JOIN erp.produtos p ON r.id_produto = p.id_produto
    WHERE r.id_cliente = ${id_cliente}
    ORDER BY r.data_inicio DESC
  `;
  
  return createQueryResponse(query, {}, 'buscar_reservas_cliente', data);
}

async function buscarReservasPorProduto(data) {
  const { id_produto } = data;
  
  if (!id_produto) {
    return createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'buscar_reservas_produto');
  }
  
  const query = `
    SELECT 
      r.id_item_reserva,
      r.id_reserva,
      r.id_cliente,
      r.id_local,
      r.data_inicio,
      r.data_fim,
      r.status,
      r.id_produto,
      r.quantidade,
      c.nome as cliente_nome,
      l.descricao as local_descricao
    FROM erp.reservas r
    LEFT JOIN erp.clientes c ON r.id_cliente = c.id_cliente
    LEFT JOIN erp.locais l ON r.id_local = l.id_local
    WHERE r.id_produto = ${id_produto}
    ORDER BY r.data_inicio DESC
  `;
  
  return createQueryResponse(query, {}, 'buscar_reservas_produto', data);
}

async function buscarReservasPorPeriodo(data) {
  const { data_inicio, data_fim } = data;
  
  if (!data_inicio || !data_fim) {
    return createErrorResponse('Data de início e data de fim são obrigatórias', 'VALIDATION_ERROR', 'buscar_reservas_periodo');
  }
  
  const query = `
    SELECT 
      r.id_item_reserva,
      r.id_reserva,
      r.id_cliente,
      r.id_local,
      r.data_inicio,
      r.data_fim,
      r.status,
      r.id_produto,
      r.quantidade,
      c.nome as cliente_nome,
      l.descricao as local_descricao,
      p.nome as produto_nome
    FROM erp.reservas r
    LEFT JOIN erp.clientes c ON r.id_cliente = c.id_cliente
    LEFT JOIN erp.locais l ON r.id_local = l.id_local
    LEFT JOIN erp.produtos p ON r.id_produto = p.id_produto
    WHERE (
      (r.data_inicio <= '${data_inicio}' AND r.data_fim > '${data_inicio}') OR
      (r.data_inicio < '${data_fim}' AND r.data_fim >= '${data_fim}') OR
      (r.data_inicio >= '${data_inicio}' AND r.data_fim <= '${data_fim}')
    )
    ORDER BY r.data_inicio
  `;
  
  return createQueryResponse(query, {}, 'buscar_reservas_periodo', data);
}

async function atualizarStatusReserva(data) {
  const { id_item_reserva, status } = data;
  
  if (!id_item_reserva || !status) {
    return createErrorResponse('ID da reserva e status são obrigatórios', 'VALIDATION_ERROR', 'atualizar_status_reserva');
  }
  
  const statusValidos = ['ativa', 'concluída', 'cancelada'];
  if (!statusValidos.includes(status)) {
    return createErrorResponse(`Status deve ser um dos: ${statusValidos.join(', ')}`, 'VALIDATION_ERROR', 'atualizar_status_reserva');
  }
  
  const query = `
    UPDATE erp.reservas 
    SET status = '${status}'
    WHERE id_item_reserva = ${id_item_reserva}
    RETURNING 
      id_item_reserva,
      id_reserva,
      id_cliente,
      id_local,
      data_inicio,
      data_fim,
      status,
      id_produto,
      quantidade
  `;
  
  return createQueryResponse(query, {}, 'atualizar_status_reserva', data);
}

// ==========================================
// FUNÇÕES DE MOVIMENTOS
// ==========================================

async function listarMovimentos(data) {
  const { tipo_evento, id_produto, page = 1, limit = 50 } = data;
  const offset = (page - 1) * limit;
  
  let whereConditions = ['1=1'];
  if (tipo_evento) whereConditions.push(`m.tipo_evento = '${tipo_evento}'`);
  if (id_produto) whereConditions.push(`m.id_produto = ${id_produto}`);
  
  const query = `
    SELECT 
      m.id_evento,
      m.id_produto,
      m.data_evento,
      m.tipo_evento,
      m.quantidade,
      m.observacao,
      m.responsavel,
      m.reserva_id,
      p.nome as produto_nome
    FROM erp.movimentos m
    LEFT JOIN erp.produtos p ON m.id_produto = p.id_produto
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY m.data_evento DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return createQueryResponse(query, {}, 'listar_movimentos', data);
}

async function criarMovimento(data) {
  const { id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id } = data;
  
  if (!id_produto || !tipo_evento || !quantidade) {
    return createErrorResponse('ID do produto, tipo de evento e quantidade são obrigatórios', 'VALIDATION_ERROR', 'criar_movimento');
  }
  
  const tiposValidos = ['entrada', 'saida', 'reserva', 'limpeza', 'perda'];
  if (!tiposValidos.includes(tipo_evento)) {
    return createErrorResponse(`Tipo de evento deve ser um dos: ${tiposValidos.join(', ')}`, 'VALIDATION_ERROR', 'criar_movimento');
  }
  
  if (quantidade <= 0) {
    return createErrorResponse('Quantidade deve ser maior que zero', 'VALIDATION_ERROR', 'criar_movimento');
  }
  
  const query = `
    INSERT INTO erp.movimentos (
      id_produto, 
      tipo_evento, 
      quantidade, 
      observacao, 
      responsavel, 
      reserva_id
    ) VALUES (
      ${id_produto}, 
      '${tipo_evento}', 
      ${quantidade}, 
      ${observacao ? `'${observacao}'` : 'NULL'}, 
      ${responsavel ? `'${responsavel}'` : 'NULL'}, 
      ${reserva_id || 'NULL'}
    ) RETURNING 
      id_evento,
      id_produto,
      data_evento,
      tipo_evento,
      quantidade,
      observacao,
      responsavel,
      reserva_id
  `;
  
  return createQueryResponse(query, {}, 'criar_movimento', data);
}

async function buscarMovimento(data) {
  const { id_evento } = data;
  
  if (!id_evento) {
    return createErrorResponse('ID do movimento é obrigatório', 'VALIDATION_ERROR', 'buscar_movimento');
  }
  
  const query = `
    SELECT 
      m.id_evento,
      m.id_produto,
      m.data_evento,
      m.tipo_evento,
      m.quantidade,
      m.observacao,
      m.responsavel,
      m.reserva_id,
      p.nome as produto_nome
    FROM erp.movimentos m
    LEFT JOIN erp.produtos p ON m.id_produto = p.id_produto
    WHERE m.id_evento = ${id_evento}
  `;
  
  return createQueryResponse(query, {}, 'buscar_movimento', data);
}

async function buscarMovimentosPorProduto(data) {
  const { id_produto } = data;
  
  if (!id_produto) {
    return createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'buscar_movimentos_produto');
  }
  
  const query = `
    SELECT 
      m.id_evento,
      m.id_produto,
      m.data_evento,
      m.tipo_evento,
      m.quantidade,
      m.observacao,
      m.responsavel,
      m.reserva_id
    FROM erp.movimentos m
    WHERE m.id_produto = ${id_produto}
    ORDER BY m.data_evento DESC
  `;
  
  return createQueryResponse(query, {}, 'buscar_movimentos_produto', data);
}

async function buscarMovimentosPorTipo(data) {
  const { tipo_evento } = data;
  
  if (!tipo_evento) {
    return createErrorResponse('Tipo de evento é obrigatório', 'VALIDATION_ERROR', 'buscar_movimentos_tipo');
  }
  
  const query = `
    SELECT 
      m.id_evento,
      m.id_produto,
      m.data_evento,
      m.tipo_evento,
      m.quantidade,
      m.observacao,
      m.responsavel,
      m.reserva_id,
      p.nome as produto_nome
    FROM erp.movimentos m
    LEFT JOIN erp.produtos p ON m.id_produto = p.id_produto
    WHERE m.tipo_evento = '${tipo_evento}'
    ORDER BY m.data_evento DESC
  `;
  
  return createQueryResponse(query, {}, 'buscar_movimentos_tipo', data);
}

async function buscarMovimentosPorPeriodo(data) {
  const { data_inicio, data_fim } = data;
  
  if (!data_inicio || !data_fim) {
    return createErrorResponse('Data de início e data de fim são obrigatórias', 'VALIDATION_ERROR', 'buscar_movimentos_periodo');
  }
  
  const query = `
    SELECT 
      m.id_evento,
      m.id_produto,
      m.data_evento,
      m.tipo_evento,
      m.quantidade,
      m.observacao,
      m.responsavel,
      m.reserva_id,
      p.nome as produto_nome
    FROM erp.movimentos m
    LEFT JOIN erp.produtos p ON m.id_produto = p.id_produto
    WHERE m.data_evento >= '${data_inicio}' AND m.data_evento <= '${data_fim}'
    ORDER BY m.data_evento DESC
  `;
  
  return createQueryResponse(query, {}, 'buscar_movimentos_periodo', data);
}

async function obterHistoricoProduto(data) {
  const { id_produto } = data;
  
  if (!id_produto) {
    return createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'obter_historico_produto');
  }
  
  const query = `
    SELECT 
      m.id_evento,
      m.id_produto,
      m.data_evento,
      m.tipo_evento,
      m.quantidade,
      m.observacao,
      m.responsavel,
      m.reserva_id,
      p.nome as produto_nome,
      p.quantidade_total
    FROM erp.movimentos m
    JOIN erp.produtos p ON m.id_produto = p.id_produto
    WHERE m.id_produto = ${id_produto}
    ORDER BY m.data_evento DESC
  `;
  
  return createQueryResponse(query, {}, 'obter_historico_produto', data);
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function createQueryResponse(query, parameters = {}, action, originalData) {
  return {
    operation: 'executeQuery',
    query: query.trim(),
    parameters,
    action,
    originalData,
    timestamp: new Date().toISOString()
  };
}

function createErrorResponse(message, code, action) {
  return {
    error: true,
    success: false,
    message,
    code,
    action,
    timestamp: new Date().toISOString()
  };
}

function createSuccessResponse(data, action, originalData) {
  return {
    success: true,
    data,
    action,
    originalData,
    timestamp: new Date().toISOString()
  };
}
