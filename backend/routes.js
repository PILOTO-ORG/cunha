// Rotas principais (estrutura base, sem lógica detalhada)
const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const config = require('./config');

// Exemplo de rota de produtos
router.get('/listar_produtos', (req, res) => {
  const { search } = req.query;
  let result = config.produtos;
  if (search) {
    result = result.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
  }
  res.json(controllers.createSuccessResponse(result, 'listar_produtos', req.query));
});


// --- PRODUTOS ---
router.post('/criar_produto', (req, res) => {
  const { nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = req.body;
  if (!nome || !quantidade_total) return res.json(controllers.createErrorResponse('Nome e quantidade total obrigatórios', 'VALIDATION_ERROR', 'criar_produto'));
  const novo = { id_produto: config.nextProdutoId++, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza };
  config.produtos.push(novo);
  res.json(controllers.createSuccessResponse(novo, 'criar_produto', req.body));
});
router.get('/buscar_produto', (req, res) => {
  const { id_produto } = req.query;
  const p = config.produtos.find(p => p.id_produto == id_produto);
  if (!p) return res.json(controllers.createErrorResponse('Produto não encontrado', 'NOT_FOUND', 'buscar_produto'));
  res.json(controllers.createSuccessResponse(p, 'buscar_produto', req.query));
});
router.put('/atualizar_produto', (req, res) => {
  const { id_produto, nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza } = req.body;
  const p = config.produtos.find(p => p.id_produto == id_produto);
  if (!p) return res.json(controllers.createErrorResponse('Produto não encontrado', 'NOT_FOUND', 'atualizar_produto'));
  if (nome) p.nome = nome;
  if (quantidade_total) p.quantidade_total = quantidade_total;
  if (valor_locacao) p.valor_locacao = valor_locacao;
  if (valor_danificacao) p.valor_danificacao = valor_danificacao;
  if (tempo_limpeza) p.tempo_limpeza = tempo_limpeza;
  res.json(controllers.createSuccessResponse(p, 'atualizar_produto', req.body));
});
router.delete('/remover_produto', (req, res) => {
  const { id_produto } = req.body;
  config.produtos = config.produtos.filter(p => p.id_produto != id_produto);
  res.json(controllers.createSuccessResponse({ id_produto }, 'remover_produto', req.body));
});

// --- CLIENTES ---
router.get('/listar_clientes', (req, res) => {
  const { search } = req.query;
  let result = config.clientes;
  if (search) {
    result = result.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));
  }
  res.json(controllers.createSuccessResponse(result, 'listar_clientes', req.query));
});
router.post('/criar_cliente', (req, res) => {
  const { nome, telefone, email, cpf_cnpj } = req.body;
  if (!nome) return res.json(controllers.createErrorResponse('Nome obrigatório', 'VALIDATION_ERROR', 'criar_cliente'));
  const novo = { id_cliente: config.nextClienteId++, nome, telefone, email, cpf_cnpj };
  config.clientes.push(novo);
  res.json(controllers.createSuccessResponse(novo, 'criar_cliente', req.body));
});
router.get('/buscar_cliente', (req, res) => {
  const { id_cliente } = req.query;
  const c = config.clientes.find(c => c.id_cliente == id_cliente);
  if (!c) return res.json(controllers.createErrorResponse('Cliente não encontrado', 'NOT_FOUND', 'buscar_cliente'));
  res.json(controllers.createSuccessResponse(c, 'buscar_cliente', req.query));
});
router.put('/atualizar_cliente', (req, res) => {
  const { id_cliente, nome, telefone, email, cpf_cnpj } = req.body;
  const c = config.clientes.find(c => c.id_cliente == id_cliente);
  if (!c) return res.json(controllers.createErrorResponse('Cliente não encontrado', 'NOT_FOUND', 'atualizar_cliente'));
  if (nome) c.nome = nome;
  if (telefone) c.telefone = telefone;
  if (email) c.email = email;
  if (cpf_cnpj) c.cpf_cnpj = cpf_cnpj;
  res.json(controllers.createSuccessResponse(c, 'atualizar_cliente', req.body));
});
router.delete('/remover_cliente', (req, res) => {
  const { id_cliente } = req.body;
  config.clientes = config.clientes.filter(c => c.id_cliente != id_cliente);
  res.json(controllers.createSuccessResponse({ id_cliente }, 'remover_cliente', req.body));
});

// --- LOCAIS ---
router.get('/listar_locais', (req, res) => {
  res.json(controllers.createSuccessResponse(config.locais, 'listar_locais', req.query));
});
router.post('/criar_local', (req, res) => {
  const { descricao, endereco, capacidade, tipo } = req.body;
  if (!descricao) return res.json(controllers.createErrorResponse('Descrição obrigatória', 'VALIDATION_ERROR', 'criar_local'));
  const novo = { id_local: config.nextLocalId++, descricao, endereco, capacidade, tipo };
  config.locais.push(novo);
  res.json(controllers.createSuccessResponse(novo, 'criar_local', req.body));
});
router.get('/buscar_local', (req, res) => {
  const { id_local } = req.query;
  const l = config.locais.find(l => l.id_local == id_local);
  if (!l) return res.json(controllers.createErrorResponse('Local não encontrado', 'NOT_FOUND', 'buscar_local'));
  res.json(controllers.createSuccessResponse(l, 'buscar_local', req.query));
});
router.put('/atualizar_local', (req, res) => {
  const { id_local, descricao, endereco, capacidade, tipo } = req.body;
  const l = config.locais.find(l => l.id_local == id_local);
  if (!l) return res.json(controllers.createErrorResponse('Local não encontrado', 'NOT_FOUND', 'atualizar_local'));
  if (descricao) l.descricao = descricao;
  if (endereco) l.endereco = endereco;
  if (capacidade) l.capacidade = capacidade;
  if (tipo) l.tipo = tipo;
  res.json(controllers.createSuccessResponse(l, 'atualizar_local', req.body));
});
router.delete('/remover_local', (req, res) => {
  const { id_local } = req.body;
  config.locais = config.locais.filter(l => l.id_local != id_local);
  res.json(controllers.createSuccessResponse({ id_local }, 'remover_local', req.body));
});

// --- RESERVAS/ORÇAMENTOS ---
router.get('/listar_reservas', (req, res) => {
  const { status } = req.query;
  let result = config.reservas;
  if (status) result = result.filter(r => r.status === status);
  res.json(controllers.createSuccessResponse(result, 'listar_reservas', req.query));
});
router.post('/criar_orcamento_multiplo', (req, res) => {
  const { itens } = req.body;
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.json(controllers.createErrorResponse('O campo "itens" é obrigatório e deve ser um array com pelo menos um item.', 'VALIDATION_ERROR', 'criar_orcamento_multiplo'));
  }
  const id_reserva = config.nextReservaId++;
  const created = itens.map(item => ({
    ...item,
    id_reserva,
    id_item_reserva: config.nextItemReservaId++,
    status: item.status || 'iniciada'
  }));
  config.reservas.push(...created);
  res.json(controllers.createSuccessResponse(created, 'criar_orcamento_multiplo', req.body));
});
router.get('/buscar_reserva', (req, res) => {
  const { id_item_reserva } = req.query;
  const r = config.reservas.find(r => r.id_item_reserva == id_item_reserva);
  if (!r) return res.json(controllers.createErrorResponse('Reserva não encontrada', 'NOT_FOUND', 'buscar_reserva'));
  res.json(controllers.createSuccessResponse(r, 'buscar_reserva', req.query));
});
router.put('/atualizar_reserva', (req, res) => {
  const { id_item_reserva, ...fields } = req.body;
  const r = config.reservas.find(r => r.id_item_reserva == id_item_reserva);
  if (!r) return res.json(controllers.createErrorResponse('Reserva não encontrada', 'NOT_FOUND', 'atualizar_reserva'));
  Object.assign(r, fields);
  res.json(controllers.createSuccessResponse(r, 'atualizar_reserva', req.body));
});
router.delete('/remover_reserva', (req, res) => {
  const { id_item_reserva } = req.body;
  config.reservas = config.reservas.filter(r => r.id_item_reserva != id_item_reserva);
  res.json(controllers.createSuccessResponse({ id_item_reserva }, 'remover_reserva', req.body));
});

// --- MOVIMENTOS ---
router.get('/listar_movimentos', (req, res) => {
  res.json(controllers.createSuccessResponse(config.movimentos, 'listar_movimentos', req.query));
});
router.post('/criar_movimento', (req, res) => {
  const { id_produto, tipo_evento, quantidade, observacao, responsavel, reserva_id } = req.body;
  if (!id_produto || !tipo_evento || !quantidade) {
    return res.json(controllers.createErrorResponse('Campos obrigatórios faltando', 'VALIDATION_ERROR', 'criar_movimento'));
  }
  const movimento = {
    id_evento: config.nextEventoId++,
    id_produto,
    tipo_evento,
    quantidade,
    observacao,
    responsavel,
    reserva_id
  };
  config.movimentos.push(movimento);
  res.json(controllers.createSuccessResponse(movimento, 'criar_movimento', req.body));
});
router.get('/buscar_movimento', (req, res) => {
  const { id_evento } = req.query;
  const m = config.movimentos.find(m => m.id_evento == id_evento);
  if (!m) return res.json(controllers.createErrorResponse('Movimento não encontrado', 'NOT_FOUND', 'buscar_movimento'));
  res.json(controllers.createSuccessResponse(m, 'buscar_movimento', req.query));
});
router.delete('/remover_movimento', (req, res) => {
  const { id_evento } = req.body;
  config.movimentos = config.movimentos.filter(m => m.id_evento != id_evento);
  res.json(controllers.createSuccessResponse({ id_evento }, 'remover_movimento', req.body));
});

module.exports = router;
