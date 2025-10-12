// Types and interfaces for the ERP system - Aligned with real database schema
import { StatusGeral, StatusOrcamento } from './orcamento';

export interface Produto {
  id_produto: number;
  nome: string;
  descricao?: string | null;
  quantidade_total: number;
  valor_locacao: number;
  valor_danificacao: number;
  tempo_limpeza: number;
  imagem_principal?: string | null;
  imagens_galeria?: string[] | null;
  ativo?: boolean;
  criado_em?: string;
}

export interface Cliente {
  id_cliente: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  endereco?: string | null; // alias para compatibilidade
  endereco_completo?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
  forma_pagamento?: string | null;
  tipo_pessoa?: 'fisica' | 'juridica';
  ativo?: boolean;
  observacoes?: string | null;
  criado_em?: string;
}

export interface Local {
  id_local: number;
  nome: string;
  endereco?: string | null; // alias para compatibilidade
  endereco_completo?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
  capacidade: number;
  valor_locacao: number;
  observacoes?: string | null;
  ativo?: boolean;
}

export interface Reserva {
  id_reserva: number;
  id_cliente: number;
  id_local?: number | null;
  data_evento: string; // timestamp
  data_retirada: string; // timestamp
  data_devolucao: string; // timestamp
  valor_total: number;
  status: 'pendente' | 'aprovado' | 'cancelado';
  observacoes?: string | null;
  forma_pagamento?: string | null;
  caucao_percentual?: number;
  validade_dias?: number;
  criado_em?: string;
  atualizado_em?: string;
  // Campos populados via JOIN
  cliente_nome?: string;
  local_nome?: string;
}

export interface ItemReserva {
  id_item_reserva: number;
  id_reserva: number;
  id_produto: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  // Campos populados via JOIN
  produto_nome?: string;
  preco_unitario?: number;
}

export interface Movimento {
  id_evento: number;
  id_produto: number;
  data_evento: string; // timestamp
  tipo_evento: 'entrada' | 'saida' | 'reserva' | 'devolucao' | 'perda' | 'ajuste';
  quantidade: number;
  observacao: string | null;
  responsavel: string | null;
  reserva_id: number | null;
  // Campos populados via JOIN
  produto_nome?: string;
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
  telefone?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  tipo_pessoa?: 'fisica' | 'juridica';
  endereco_completo?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
  forma_pagamento?: string | null;
  observacoes?: string | null;
}

export interface AtualizarClienteRequest {
  nome?: string;
  telefone?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  tipo_pessoa?: 'fisica' | 'juridica';
  endereco_completo?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
  forma_pagamento?: string | null;
  ativo?: boolean;
  observacoes?: string | null;
}

export interface CriarProdutoRequest {
  nome: string;
  descricao?: string | null;
  quantidade_total?: number;
  valor_locacao: number;
  valor_danificacao: number;
  tempo_limpeza: number;
}

export interface AtualizarProdutoRequest {
  nome?: string;
  descricao?: string | null;
  quantidade_total?: number;
  valor_locacao?: number;
  valor_danificacao?: number;
  tempo_limpeza?: number;
  ativo?: boolean;
}

export interface CriarLocalRequest {
  nome: string;
  endereco_completo?: string;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
  capacidade: number;
  valor_locacao: number;
  observacoes?: string;
}

export interface AtualizarLocalRequest {
  nome?: string;
  endereco_completo?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
  capacidade?: number;
  valor_locacao?: number;
  observacoes?: string | null;
  ativo?: boolean;
}

export interface CriarReservaRequest {
  id_cliente: number;
  id_local?: number | null;
  data_evento: string;
  data_retirada: string;
  data_devolucao: string;
  valor_total: number;
  observacoes?: string;
}

export interface CriarItemReservaRequest {
  id_reserva: number;
  id_produto: number;
  quantidade: number;
  valor_unitario: number;
}

export interface AtualizarReservaRequest {
  id_cliente?: number;
  id_local?: number;
  data_evento?: string;
  data_retirada?: string;
  data_devolucao?: string;
  valor_total?: number;
  status?: 'pendente' | 'aprovado' | 'cancelado';
  observacoes?: string;
  forma_pagamento?: string;
  caucao_percentual?: number;
  validade_dias?: number;
  itens?: Array<{
    id_produto: number;
    quantidade: number;
    dias_locacao: number;
    valor_unitario: number;
    valor_total: number;
  }>;
}

export interface AtualizarItemReservaRequest {
  quantidade?: number;
  valor_unitario?: number;
}

export interface CriarMovimentoRequest {
  id_produto: number;
  tipo_evento: 'entrada' | 'saida' | 'reserva' | 'devolucao' | 'perda' | 'ajuste';
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
  status: 'pendente' | 'aprovado' | 'cancelado';
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
  id_local?: number;
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
  status?: 'pendente' | 'aprovado' | 'cancelado';
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
  status?: 'pendente' | 'aprovado' | 'cancelado';
  data_inicio?: string;
  data_fim?: string;
  id_cliente?: number;
}

export interface ClienteFilter extends PaginationParams {
  tem_email?: boolean;
  tem_telefone?: boolean;
  ativo?: boolean;
}

export interface LocalFilter extends PaginationParams {
  search?: string;
}

export interface MovimentoFilter extends PaginationParams {
  tipo_evento?: 'entrada' | 'saida' | 'reserva' | 'devolucao' | 'perda' | 'ajuste';
  id_produto?: number;
  data_inicio?: string;
  data_fim?: string;
}

// Additional types for services
export type ReservaStatus = 'pendente' | 'aprovado' | 'cancelado';

export interface CriarOrcamentoComItensRequest {
  id_cliente: number;
  id_local?: number | null;
  data_evento: string;
  data_retirada: string;
  data_devolucao: string;
  status?: ReservaStatus;
  observacoes?: string;
  valor_frete?: number;
  valor_desconto?: number;
  items: Array<{
    id_produto: number;
    quantidade: number;
    dias_locacao?: number;
    dias?: number;
    diasLocacao?: number;
    valor_unitario?: number;
  }>;
}
