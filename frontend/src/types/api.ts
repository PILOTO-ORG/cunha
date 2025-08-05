// Types and interfaces for the ERP system - Aligned with real database schema
import { StatusGeral, StatusOrcamento } from './orcamento';

export interface Produto {
  id_produto: number;
  nome: string;
  descricao?: string;
  codigo?: string;
  categoria?: string;
  quantidade_total: number;
  valor_locacao: number | null;
  valor_danificacao: number | null;
  tempo_limpeza: number | null;
  removido?: boolean;
  criado?: string;
  atualizado?: string;
}

export interface Cliente {
  id_cliente: number;
  nome: string;
  nome_fantasia?: string;
  tipo?: 'PF' | 'PJ';
  telefone: string | null;
  celular?: string | null;
  email: string | null;
  cpf_cnpj: string | null;
  rg_ie?: string | null;
  rg_inscricao_estadual?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  removido?: boolean;
  criado?: string;
  atualizado?: string;
  removido_em?: string | null;
}

export interface Local {
  id_local: number;
  nome?: string;
  descricao: string;
  endereco: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  capacidade: number | null;
  valor_locacao?: number | null;
  tipo: string | null;
  observacoes?: string | null;
  removido?: boolean;
  criado?: string;
  atualizado?: string;
}

export interface Reserva {
  id_item_reserva: number;
  id_reserva: number;
  id_cliente: number | null;
  id_local: number | null;
  data_inicio: string; // timestamp
  data_fim: string; // timestamp
  data_criacao: string; // timestamp
  status: StatusGeral;
  id_produto: number;
  quantidade: number;
  link_drive?: string; // Adicionando o novo campo
  // Campos populados via JOIN (não existem no banco)
  cliente?: Cliente;
  local?: Local;
  produto?: Produto;
  // Novos campos extras
  frete?: number;
  desconto?: number;
  data_atualizacao?: string;
  data_saida?: string;
  data_retorno?: string;
  dias_reservados?: number;
  // Campos específicos para orçamentos (quando status = 'iniciada')
  data_validade?: string;
  valor_total?: number;
  observacoes?: string;
}

export interface Movimento {
  id_evento: number;
  id_produto: number;
  data_evento: string; // timestamp
  tipo_evento: 'entrada' | 'saida' | 'reserva' | 'limpeza' | 'perda';
  quantidade: number;
  observacao: string | null;
  responsavel: string | null;
  reserva_id: number | null;
}

export interface DisponibilidadeConsulta {
  id_produto: number;
  data_inicio: string;
  data_fim: string;
}

export interface DisponibilidadeResposta {
  produto: Produto;
  quantidade_disponivel: number;
  quantidade_total: number;
  reservas_conflitantes: Reserva[];
}

// Request/Response types for API
export interface CriarClienteRequest {
  nome: string;
  telefone?: string;
  email?: string;
  cpf_cnpj?: string;
  rg_inscricao_estadual?: string;
  endereco?: string;
  cep?: string;
  removido?: boolean;
}

export interface AtualizarClienteRequest {
  nome?: string;
  telefone?: string;
  email?: string;
  cpf_cnpj?: string;
  rg_inscricao_estadual?: string | null;
  endereco?: string | null;
  cep?: string | null;
  removido?: boolean;
}

export interface CriarProdutoRequest {
  nome: string;
  quantidade_total: number;
  valor_locacao?: number;
  valor_danificacao?: number;
  tempo_limpeza?: number;
}

export interface AtualizarProdutoRequest {
  nome?: string;
  quantidade_total?: number;
  valor_locacao?: number;
  valor_danificacao?: number;
  tempo_limpeza?: number;
}

export interface CriarLocalRequest {
  descricao: string;
  endereco?: string;
  capacidade?: number | null;
  tipo?: string;
  observacoes?: string;
}

export interface AtualizarLocalRequest {
  descricao?: string;
  endereco?: string | null;
  capacidade?: number | null;
  tipo?: string | null;
  observacoes?: string | null;
  removido?: boolean;
}

export interface CriarReservaRequest {
  id_cliente: number;
  id_local?: number | null;
  data_inicio: string;
  data_fim: string;
  id_produto: number;
  quantidade: number;
  status?: 'ativa' | 'concluída' | 'cancelada' | 'iniciada';
  frete?: number;
  desconto?: number;
  data_saida?: string;
  data_retorno?: string;
  dias_reservados?: number;
  observacoes?: string;
  link_drive?: string;
}

// Novo tipo para criar orçamento com múltiplos itens
export interface CriarOrcamentoRequest {
  id_cliente: number;
  id_local?: number;
  data_validade: string;
  observacoes?: string;
  itens: {
    id_produto: number;
    quantidade: number;
    data_inicio: string;
    data_fim: string;
  }[];
}

export interface AtualizarReservaRequest {
  id_cliente?: number;
  id_local?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: 'ativa' | 'concluída' | 'cancelada' | 'iniciada';
  quantidade?: number;
  link_drive?: string;
  observacoes?: string;
  frete?: number;
  desconto?: number;
  data_saida?: string;
  data_retorno?: string;
  dias_reservados?: number;
}

export interface CriarMovimentoRequest {
  id_produto: number;
  tipo_evento: 'entrada' | 'saida' | 'reserva' | 'limpeza' | 'perda';
  quantidade: number;
  observacao?: string;
  responsavel?: string;
  reserva_id?: number;
}

// Orçamento types
export interface Orcamento {
  id_orcamento: number;
  id_cliente: number;
  data_criacao: string;
  data_validade: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  valor_total: number;
  observacoes?: string;
  // Campos populados via JOIN
  cliente?: Cliente;
  itens?: ItemOrcamento[];
}

export interface ItemOrcamento {
  id_item: number;
  id_orcamento: number;
  id_produto: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  // Campos populados via JOIN
  produto?: Produto;
}

// Base interface for grouped budget/orçamento
export interface OrcamentoAgrupado {
  id_reserva: number;
  id_cliente: number;
  id_local?: number | null;
  cliente_nome: string;
  data_inicio: string;
  data_fim: string;
  data_criacao: string;
  status: StatusGeral;
  frete?: number;
  desconto?: number;
  forma_pagamento?: string;
  condicoes_pagamento?: string;
  validade?: string;
  itens: Array<{
    id_item_reserva: number;
    id_produto: number;
    produto_nome: string;
    quantidade: number;
    valor_unitario?: number;
    observacoes?: string;
  }>;
  valor_total: number;
  observacoes?: string;
  link_drive?: string;
}

export interface CriarOrcamentoRequest {
  id_cliente: number;
  data_validade: string;
  observacoes?: string;
  itens: CriarItemOrcamentoRequest[];
}

export interface CriarItemOrcamentoRequest {
  id_produto: number;
  quantidade: number;
  data_inicio: string;
  data_fim: string;
}

export interface AtualizarOrcamentoRequest {
  id_cliente?: number;
  id_local?: number;
  data_validade?: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  observacoes?: string;
  itens?: {
    id_produto: number;
    quantidade: number;
    data_inicio: string;
    data_fim: string;
  }[];
}

export interface OrcamentoFilter extends PaginationParams {
  status?: StatusOrcamento;
  id_cliente?: number;
  data_inicio?: string;
  data_fim?: string;
}

// Dashboard types
export interface DashboardData {
  reservas_ativas: number;
  faturamento_mensal: number;
  produtos_disponiveis: number;
  clientes_ativos: number;
  orcamentos_pendentes: number;
  alertas_estoque: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface ProdutoFilter extends PaginationParams {
  quantidade_baixa?: boolean;
}

export interface ReservaFilter extends PaginationParams {
  status?: 'ativa' | 'concluída' | 'cancelada' | 'iniciada';
  data_inicio?: string;
  data_fim?: string;
  id_cliente?: number;
  id_produto?: number;
}

export interface ClienteFilter extends PaginationParams {
  tem_email?: boolean;
  tem_telefone?: boolean;
  removido?: boolean;
}

export interface LocalFilter extends PaginationParams {
  tipo?: string;
}

export interface MovimentoFilter extends PaginationParams {
  tipo_evento?: 'entrada' | 'saida' | 'reserva' | 'limpeza' | 'perda';
  id_produto?: number;
  data_inicio?: string;
  data_fim?: string;
}
