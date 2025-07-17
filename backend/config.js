// Configurações e dados simulados

const produtos = [
  { id_produto: 1, nome: 'Cadeira', quantidade_total: 100, valor_locacao: 10, valor_danificacao: 50, tempo_limpeza: 5 },
  { id_produto: 2, nome: 'Mesa', quantidade_total: 20, valor_locacao: 30, valor_danificacao: 100, tempo_limpeza: 10 }
];
let nextProdutoId = 3;

const clientes = [
  { id_cliente: 1, nome: 'João', telefone: '1111', email: 'joao@email.com', cpf_cnpj: '123' },
  { id_cliente: 2, nome: 'Maria', telefone: '2222', email: 'maria@email.com', cpf_cnpj: '456' }
];
let nextClienteId = 3;

const locais = [
  { id_local: 1, descricao: 'Salão Principal', endereco: 'Rua A', capacidade: 100, tipo: 'salão' },
  { id_local: 2, descricao: 'Área Externa', endereco: 'Rua B', capacidade: 50, tipo: 'externa' }
];
let nextLocalId = 3;

const reservas = [];
let nextReservaId = 1;
let nextItemReservaId = 1;

const movimentos = [];
let nextEventoId = 1;

module.exports = {
  produtos,
  nextProdutoId,
  clientes,
  nextClienteId,
  locais,
  nextLocalId,
  reservas,
  nextReservaId,
  nextItemReservaId,
  movimentos,
  nextEventoId
};
