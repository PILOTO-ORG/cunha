import { Produto, Cliente, Local } from './api';

// Status types
export type StatusOrcamento = 'pendente' | 'aprovado' | 'cancelado';
export type StatusGeral = StatusOrcamento;

export interface ItemOrcamentoAgrupado {
  id_item_reserva: number;
  id_produto: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario?: number;
  observacoes?: string;
  produto?: Produto;
}

export interface OrcamentoAgrupado {
  id_reserva: number;
  id_cliente: number;
  id_local?: number | null;
  cliente_nome: string;
  cliente?: Cliente;
  local?: Local;
  data_evento: string;
  data_retirada: string;
  data_devolucao: string;
  data_criacao: string;
  status: StatusGeral;
  frete?: number;
  desconto?: number;
  forma_pagamento?: string;
  condicoes_pagamento?: string;
  validade?: string;
  itens: ItemOrcamentoAgrupado[];
  valor_total: number;
  observacoes?: string;
  link_drive?: string;
}