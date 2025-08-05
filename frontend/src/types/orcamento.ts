import { Produto, Cliente, Local } from './api';

// Status types
export type StatusReserva = 'iniciada' | 'ativa' | 'concluída' | 'cancelada';
export type StatusOrcamento = 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
export type StatusGeral = StatusReserva | StatusOrcamento;

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
  data_inicio: string;
  data_fim: string;
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
  dias_reservados?: number;
  data_saida?: string;
  data_retorno?: string;
}
