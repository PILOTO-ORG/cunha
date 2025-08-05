const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Funções auxiliares
function createQueryResponse(query, parameters = {}, action, originalData) {
  return {
    operation: 'executeQuery',
    query,
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


// --- PRODUTOS ---
// Buscar produtos por estoque baixo
app.get('/listar_produtos_estoque_baixo', (req, res) => {
  const limite_minimo = parseInt(req.query.limite_minimo) || 10;
  const result = produtos.filter(p => p.quantidade_total <= limite_minimo);
  res.json(createSuccessResponse(result, 'listar_produtos_estoque_baixo', req.query));
});

// Verificar disponibilidade de produto
app.get('/verificar_disponibilidade_produto', (req, res) => {
  const { id_produto, data_inicio, data_fim } = req.query;
  if (!id_produto || !data_inicio || !data_fim) {
    return res.json(createErrorResponse('ID do produto, data de início e data de fim são obrigatórios', 'VALIDATION_ERROR', 'verificar_disponibilidade_produto'));
  }
  // Simulação: considera todas reservas ativas para o produto no período
  const reservadas = reservas.filter(r => r.id_produto == id_produto && r.status === 'ativa');
  const quantidade_reservada = reservadas.reduce((acc, r) => acc + (r.quantidade || 0), 0);
  const produto = produtos.find(p => p.id_produto == id_produto);
  const quantidade_disponivel = produto ? produto.quantidade_total - quantidade_reservada : 0;
  res.json(createSuccessResponse({
    id_produto,
    quantidade_total: produto ? produto.quantidade_total : 0,
    quantidade_reservada,
    quantidade_disponivel
  }, 'verificar_disponibilidade_produto', req.query));
});
let produtos = [
  { id_produto: 1, nome: 'Cadeira', quantidade_total: 100, valor_locacao: 10, valor_danificacao: 50, tempo_limpeza: 5 },
  { id_produto: 2, nome: 'Mesa', quantidade_total: 20, valor_locacao: 30, valor_danificacao: 100, tempo_limpeza: 10 }
];
let nextProdutoId = 3;

app.get('/listar_produtos', (req, res) => {
  const { search } = req.query;
  let result = produtos;
  if (search) {
    result = result.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
  }
  res.json(createSuccessResponse(result, 'listar_produtos', req.query));
});
app.post('/criar_produto', (req, res) => {
  const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = req.body;
  if (!nome || !quantidade_total) return res.json(createErrorResponse('Nome e quantidade total obrigatórios', 'VALIDATION_ERROR', 'criar_produto'));
  const novo = { id_produto: nextProdutoId++, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza };
  produtos.push(novo);
  res.json(createSuccessResponse(novo, 'criar_produto', req.body));
});
app.get('/buscar_produto', (req, res) => {
  const { id_produto } = req.query;
  const p = produtos.find(p => p.id_produto == id_produto);
  if (!p) return res.json(createErrorResponse('Produto não encontrado', 'NOT_FOUND', 'buscar_produto'));
  res.json(createSuccessResponse(p, 'buscar_produto', req.query));
});
app.put('/atualizar_produto', (req, res) => {
  const { id_produto, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = req.body;
  const p = produtos.find(p => p.id_produto == id_produto);
  if (!p) return res.json(createErrorResponse('Produto não encontrado', 'NOT_FOUND', 'atualizar_produto'));
  if (nome) p.nome = nome;
  if (quantidade_total) p.quantidade_total = quantidade_total;
  if (valor_locacao) p.valor_locacao = valor_locacao;
  if (valor_danificacao) p.valor_danificacao = valor_danificacao;
  if (tempo_limpeza) p.tempo_limpeza = tempo_limpeza;
  res.json(createSuccessResponse(p, 'atualizar_produto', req.body));
});
app.delete('/remover_produto', (req, res) => {
  const { id_produto } = req.body;
  produtos = produtos.filter(p => p.id_produto != id_produto);
  res.json(createSuccessResponse({ id_produto }, 'remover_produto', req.body));
});

// --- CLIENTES ---
// Buscar clientes por nome
app.get('/buscar_clientes_nome', (req, res) => {
  const { nome } = req.query;
  if (!nome) return res.json(createErrorResponse('Nome para busca é obrigatório', 'VALIDATION_ERROR', 'buscar_clientes_nome'));
  const result = clientes.filter(c => c.nome.toLowerCase().includes(nome.toLowerCase()));
  res.json(createSuccessResponse(result, 'buscar_clientes_nome', req.query));
});
// Buscar cliente por email
app.get('/buscar_cliente_email', (req, res) => {
  const { email } = req.query;
  if (!email) return res.json(createErrorResponse('Email para busca é obrigatório', 'VALIDATION_ERROR', 'buscar_cliente_email'));
  const c = clientes.find(c => c.email === email);
  if (!c) return res.json(createErrorResponse('Cliente não encontrado', 'NOT_FOUND', 'buscar_cliente_email'));
  res.json(createSuccessResponse(c, 'buscar_cliente_email', req.query));
});
// Verificar se cliente existe
app.get('/verificar_cliente_existe', (req, res) => {
  const { email, cpf_cnpj } = req.query;
  if (!email && !cpf_cnpj) return res.json(createErrorResponse('Email ou CPF/CNPJ é obrigatório para verificação', 'VALIDATION_ERROR', 'verificar_cliente_existe'));
  const exists = clientes.some(c => c.email === email || c.cpf_cnpj === cpf_cnpj);
  res.json(createSuccessResponse({ exists }, 'verificar_cliente_existe', req.query));
});
// Estatísticas do cliente
app.get('/obter_estatisticas_cliente', (req, res) => {
  const { id_cliente } = req.query;
  if (!id_cliente) return res.json(createErrorResponse('ID do cliente é obrigatório', 'VALIDATION_ERROR', 'obter_estatisticas_cliente'));
  const total_reservas = reservas.filter(r => r.id_cliente == id_cliente).length;
  const ultima_reserva = reservas.filter(r => r.id_cliente == id_cliente).reduce((max, r) => r.data_inicio > max ? r.data_inicio : max, '');
  const cliente = clientes.find(c => c.id_cliente == id_cliente);
  res.json(createSuccessResponse({
    id_cliente,
    nome: cliente ? cliente.nome : '',
    total_reservas,
    ultima_reserva
  }, 'obter_estatisticas_cliente', req.query));
});
let clientes = [
  { id_cliente: 1, nome: 'João', telefone: '1111', email: 'joao@email.com', cpf_cnpj: '123' },
  { id_cliente: 2, nome: 'Maria', telefone: '2222', email: 'maria@email.com', cpf_cnpj: '456' }
];
let nextClienteId = 3;

app.get('/listar_clientes', (req, res) => {
  const { search } = req.query;
  let result = clientes;
  if (search) {
    result = result.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));
  }
  res.json(createSuccessResponse(result, 'listar_clientes', req.query));
});
app.post('/criar_cliente', (req, res) => {
  const { nome, telefone, email, cpf_cnpj } = req.body;
  if (!nome) return res.json(createErrorResponse('Nome obrigatório', 'VALIDATION_ERROR', 'criar_cliente'));
  const novo = { id_cliente: nextClienteId++, nome, telefone, email, cpf_cnpj };
  clientes.push(novo);
  res.json(createSuccessResponse(novo, 'criar_cliente', req.body));
});
app.get('/buscar_cliente', (req, res) => {
  const { id_cliente } = req.query;
  const c = clientes.find(c => c.id_cliente == id_cliente);
  if (!c) return res.json(createErrorResponse('Cliente não encontrado', 'NOT_FOUND', 'buscar_cliente'));
  res.json(createSuccessResponse(c, 'buscar_cliente', req.query));
});
app.put('/atualizar_cliente', (req, res) => {
  const { id_cliente, nome, telefone, email, cpf_cnpj } = req.body;
  const c = clientes.find(c => c.id_cliente == id_cliente);
  if (!c) return res.json(createErrorResponse('Cliente não encontrado', 'NOT_FOUND', 'atualizar_cliente'));
  if (nome) c.nome = nome;
  if (telefone) c.telefone = telefone;
  if (email) c.email = email;
  if (cpf_cnpj) c.cpf_cnpj = cpf_cnpj;
  res.json(createSuccessResponse(c, 'atualizar_cliente', req.body));
});
app.delete('/remover_cliente', (req, res) => {
  const { id_cliente } = req.body;
  clientes = clientes.filter(c => c.id_cliente != id_cliente);
  res.json(createSuccessResponse({ id_cliente }, 'remover_cliente', req.body));
});

// --- LOCAIS ---
// Buscar locais por tipo
app.get('/buscar_locais_tipo', (req, res) => {
  const { tipo } = req.query;
  if (!tipo) return res.json(createErrorResponse('Tipo do local é obrigatório', 'VALIDATION_ERROR', 'buscar_locais_tipo'));
  const result = locais.filter(l => l.tipo === tipo);
  res.json(createSuccessResponse(result, 'buscar_locais_tipo', req.query));
});
// Verificar disponibilidade de local
app.get('/verificar_disponibilidade_local', (req, res) => {
  const { id_local, data_inicio, data_fim } = req.query;
  if (!id_local || !data_inicio || !data_fim) {
    return res.json(createErrorResponse('ID do local, data de início e data de fim são obrigatórios', 'VALIDATION_ERROR', 'verificar_disponibilidade_local'));
  }
  // Simulação: conta reservas ativas para o local no período
  const reservas_conflitantes = reservas.filter(r => r.id_local == id_local && r.status === 'ativa').length;
  const local = locais.find(l => l.id_local == id_local);
  res.json(createSuccessResponse({
    id_local,
    descricao: local ? local.descricao : '',
    reservas_conflitantes
  }, 'verificar_disponibilidade_local', req.query));
});
let locais = [
  { id_local: 1, descricao: 'Salão Principal', endereco: 'Rua A', capacidade: 100, tipo: 'salão' },
  { id_local: 2, descricao: 'Área Externa', endereco: 'Rua B', capacidade: 50, tipo: 'externa' }
];
let nextLocalId = 3;

app.get('/listar_locais', (req, res) => {
  res.json(createSuccessResponse(locais, 'listar_locais', req.query));
});
app.post('/criar_local', (req, res) => {
  const { descricao, endereco, capacidade, tipo } = req.body;
  if (!descricao) return res.json(createErrorResponse('Descrição obrigatória', 'VALIDATION_ERROR', 'criar_local'));
  const novo = { id_local: nextLocalId++, descricao, endereco, capacidade, tipo };
  locais.push(novo);
  res.json(createSuccessResponse(novo, 'criar_local', req.body));
});
app.get('/buscar_local', (req, res) => {
  const { id_local } = req.query;
  const l = locais.find(l => l.id_local == id_local);
  if (!l) return res.json(createErrorResponse('Local não encontrado', 'NOT_FOUND', 'buscar_local'));
  res.json(createSuccessResponse(l, 'buscar_local', req.query));
});
app.put('/atualizar_local', (req, res) => {
  const { id_local, descricao, endereco, capacidade, tipo } = req.body;
  const l = locais.find(l => l.id_local == id_local);
  if (!l) return res.json(createErrorResponse('Local não encontrado', 'NOT_FOUND', 'atualizar_local'));
  if (descricao) l.descricao = descricao;
  if (endereco) l.endereco = endereco;
  if (capacidade) l.capacidade = capacidade;
  if (tipo) l.tipo = tipo;
  res.json(createSuccessResponse(l, 'atualizar_local', req.body));
});
app.delete('/remover_local', (req, res) => {
  const { id_local } = req.body;
  locais = locais.filter(l => l.id_local != id_local);
  res.json(createSuccessResponse({ id_local }, 'remover_local', req.body));
});

// --- ORÇAMENTOS/RESERVAS ---
// Atualizar orçamento inteiro (delete-then-insert)
app.put('/atualizar_orcamento', (req, res) => {
  const { id, itens } = req.body;
  if (!id || !Array.isArray(itens) || itens.length === 0) {
    return res.json(createErrorResponse('ID e itens obrigatórios', 'VALIDATION_ERROR', 'atualizar_orcamento'));
  }
  reservas = reservas.filter(r => r.id_reserva != id);
  const created = itens.map(item => ({
    ...item,
    id_reserva: id,
    id_item_reserva: nextItemReservaId++,
    status: item.status || 'iniciada'
  }));
  reservas.push(...created);
  res.json(createSuccessResponse(created, 'atualizar_orcamento', req.body));
});

// Atualizar status da reserva
app.put('/atualizar_status_reserva', (req, res) => {
  const { id_item_reserva, status } = req.body;
  if (!id_item_reserva || !status) {
    return res.json(createErrorResponse('ID da reserva e status são obrigatórios', 'VALIDATION_ERROR', 'atualizar_status_reserva'));
  }
  const r = reservas.find(r => r.id_item_reserva == id_item_reserva);
  if (!r) return res.json(createErrorResponse('Reserva não encontrada', 'NOT_FOUND', 'atualizar_status_reserva'));
  r.status = status;
  res.json(createSuccessResponse(r, 'atualizar_status_reserva', req.body));
});

// Buscar reservas por cliente
app.get('/buscar_reservas_cliente', (req, res) => {
  const { id_cliente } = req.query;
  if (!id_cliente) return res.json(createErrorResponse('ID do cliente é obrigatório', 'VALIDATION_ERROR', 'buscar_reservas_cliente'));
  const result = reservas.filter(r => r.id_cliente == id_cliente);
  res.json(createSuccessResponse(result, 'buscar_reservas_cliente', req.query));
});
// Buscar reservas por produto
app.get('/buscar_reservas_produto', (req, res) => {
  const { id_produto } = req.query;
  if (!id_produto) return res.json(createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'buscar_reservas_produto'));
  const result = reservas.filter(r => r.id_produto == id_produto);
  res.json(createSuccessResponse(result, 'buscar_reservas_produto', req.query));
});
// Buscar reservas por período
app.get('/buscar_reservas_periodo', (req, res) => {
  const { data_inicio, data_fim } = req.query;
  if (!data_inicio || !data_fim) return res.json(createErrorResponse('Data de início e fim são obrigatórias', 'VALIDATION_ERROR', 'buscar_reservas_periodo'));
  const result = reservas.filter(r => r.data_inicio >= data_inicio && r.data_fim <= data_fim);
  res.json(createSuccessResponse(result, 'buscar_reservas_periodo', req.query));
});
let reservas = [];
let nextReservaId = 1;
let nextItemReservaId = 1;

app.post('/criar_orcamento_multiplo', (req, res) => {
  const { itens } = req.body;
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.json(createErrorResponse('O campo "itens" é obrigatório e deve ser um array com pelo menos um item.', 'VALIDATION_ERROR', 'criar_orcamento_multiplo'));
  }
  const id_reserva = nextReservaId++;
  const created = itens.map(item => ({
    ...item,
    id_reserva,
    id_item_reserva: nextItemReservaId++,
    status: item.status || 'iniciada'
  }));
  reservas.push(...created);
  res.json(createSuccessResponse(created, 'criar_orcamento_multiplo', req.body));
});
app.get('/listar_reservas', (req, res) => {
  const { status } = req.query;
  let result = reservas;
  if (status) result = result.filter(r => r.status === status);
  res.json(createSuccessResponse(result, 'listar_reservas', req.query));
});
app.post('/criar_reserva', (req, res) => {
  const { id_cliente, id_local, data_inicio, data_fim, id_produto, quantidade, status = 'ativa', observacoes } = req.body;
  if (!data_inicio || !data_fim || !id_produto || !quantidade) {
    return res.json(createErrorResponse('Campos obrigatórios faltando', 'VALIDATION_ERROR', 'criar_reserva'));
  }
  const reserva = {
    id_reserva: nextReservaId++,
    id_item_reserva: nextItemReservaId++,
    id_cliente,
    id_local,
    data_inicio,
    data_fim,
    id_produto,
    quantidade,
    status,
    observacoes
  };
  reservas.push(reserva);
  res.json(createSuccessResponse(reserva, 'criar_reserva', req.body));
});
app.get('/buscar_reserva', (req, res) => {
  const { id_item_reserva } = req.query;
  const r = reservas.find(r => r.id_item_reserva == id_item_reserva);
  if (!r) return res.json(createErrorResponse('Reserva não encontrada', 'NOT_FOUND', 'buscar_reserva'));
  res.json(createSuccessResponse(r, 'buscar_reserva', req.query));
});
app.put('/atualizar_reserva', (req, res) => {
  const { id_item_reserva, ...fields } = req.body;
  const r = reservas.find(r => r.id_item_reserva == id_item_reserva);
  if (!r) return res.json(createErrorResponse('Reserva não encontrada', 'NOT_FOUND', 'atualizar_reserva'));
  Object.assign(r, fields);
  res.json(createSuccessResponse(r, 'atualizar_reserva', req.body));
});
app.delete('/remover_reserva', (req, res) => {
  const { id_item_reserva } = req.body;
  reservas = reservas.filter(r => r.id_item_reserva != id_item_reserva);
  res.json(createSuccessResponse({ id_item_reserva }, 'remover_reserva', req.body));
});

// --- MOVIMENTOS ---
// Buscar movimentos por produto
app.get('/buscar_movimentos_produto', (req, res) => {
  const { id_produto } = req.query;
  if (!id_produto) return res.json(createErrorResponse('ID do produto é obrigatório', 'VALIDATION_ERROR', 'buscar_movimentos_produto'));
  const result = movimentos.filter(m => m.id_produto == id_produto);
  res.json(createSuccessResponse(result, 'buscar_movimentos_produto', req.query));
});
// Buscar movimentos por tipo
app.get('/buscar_movimentos_tipo', (req, res) => {
  const { tipo_evento } = req.query;
  if (!tipo_evento) return res.json(createErrorResponse('Tipo de evento é obrigatório', 'VALIDATION_ERROR', 'buscar_movimentos_tipo'));
  const result = movimentos.filter(m => m.tipo_evento === tipo_evento);
  res.json(createSuccessResponse(result, 'buscar_movimentos_tipo', req.query));
});
// Buscar movimentos por período
app.get('/buscar_movimentos_periodo', (req, res) => {
  const { data_inicio, data_fim } = req.query;
  if (!data_inicio || !data_fim) return res.json(createErrorResponse('Data de início e fim são obrigatórias', 'VALIDATION_ERROR', 'buscar_movimentos_periodo'));
  const result = movimentos.filter(m => m.data_evento >= data_inicio && m.data_evento <= data_fim);
  res.json(createSuccessResponse(result, 'buscar_movimentos_periodo', req.query));
});
let movimentos = [];
let nextEventoId = 1;
app.get('/listar_movimentos', (req, res) => {
  res.json(createSuccessResponse(movimentos, 'listar_movimentos', req.query));
});
app.post('/criar_movimento', (req, res) => {
  const { id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id } = req.body;
  if (!id_produto || !tipo_evento || !quantidade) {
    return res.json(createErrorResponse('Campos obrigatórios faltando', 'VALIDATION_ERROR', 'criar_movimento'));
  }
  const movimento = {
    id_evento: nextEventoId++,
    id_produto,
    tipo_evento,
    quantidade,
    observacao,
    responsavel,
    reserva_id
  };
  movimentos.push(movimento);
  res.json(createSuccessResponse(movimento, 'criar_movimento', req.body));
});
app.get('/buscar_movimento', (req, res) => {
  const { id_evento } = req.query;
  const m = movimentos.find(m => m.id_evento == id_evento);
  if (!m) return res.json(createErrorResponse('Movimento não encontrado', 'NOT_FOUND', 'buscar_movimento'));
  res.json(createSuccessResponse(m, 'buscar_movimento', req.query));
});
app.delete('/remover_movimento', (req, res) => {
  const { id_evento } = req.body;
  movimentos = movimentos.filter(m => m.id_evento != id_evento);
  res.json(createSuccessResponse({ id_evento }, 'remover_movimento', req.body));
});
// Definir porta pelo env ou padrão
const PORT = process.env.PORT || 4000;
// Definir o host para escutar em todas as interfaces de rede (essencial para Docker)
const HOST = '0.0.0.0';

// Início do servidor
app.listen(PORT, HOST, () => {
  // Alterando o log para ser mais preciso sobre onde o servidor está realmente escutando
  console.log(`Servidor escutando em http://${HOST}:${PORT}`);
  // A linha abaixo pode ser mantida se você ainda quiser logar a URL pública
  // console.log(`URL pública (quando disponível): ${config.apiUrl}`);
});