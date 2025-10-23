import { apiClient } from './apiClient';
import type {
  Reserva,
  ReservaFilter,
  OrcamentoFilter,
  PaginatedResponse,
  AtualizarReservaRequest,
  AtualizarOrcamentoRequest,
  CriarReservaRequest,
  ReservaStatus,
  OrcamentoStatus,
  CriarOrcamentoComItensRequest
} from '../types/api';
import { reservaSchema } from '../constants/reservaSchema';

function buildQueryString(filtros?: ReservaFilter | OrcamentoFilter): string {
  if (!filtros) {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function normalizeOrcamentoStatus(status?: string | null): OrcamentoStatus | undefined {
  if (!status) {
    return undefined;
  }

  const normalized = status.toLowerCase();
  // Map old status to new orcamento status
  const statusMap: Record<string, OrcamentoStatus> = {
    'pendente': 'Criado',
    'orcamento': 'Criado',
    'aprovado': 'Aprovado',
    'cancelada': 'Cancelado',
    'cancelado': 'Cancelado'
  };

  return statusMap[normalized] || (reservaSchema.orcamento.status as readonly string[]).includes(normalized)
    ? (normalized as OrcamentoStatus)
    : undefined;
}

function normalizeItems(items: CriarOrcamentoComItensRequest['items']) {
  return items.map((item) => ({
    id_produto: item.id_produto,
    quantidade: item.quantidade,
    dias_locacao:
      item.dias_locacao ?? item.dias ?? item.diasLocacao ?? 1,
    valor_unitario: item.valor_unitario
  }));
}

export class OrcamentoService {
  // === MÉTODOS DE ORÇAMENTO ===
  
  static async listarOrcamentos(filtros?: OrcamentoFilter): Promise<PaginatedResponse<Reserva>> {
    const query = buildQueryString(filtros);
    const response = await apiClient.get<Reserva[]>(`/orcamentos${query}`);
    const data = Array.isArray(response.data) ? response.data : [];

    return {
      data,
      total: data.length,
      page: 1,
      limit: data.length || 10,
      totalPages: 1
    };
  }

  static async buscarOrcamento(id: number): Promise<Reserva> {
    const response = await apiClient.get<Reserva>(`/orcamentos/${id}`);
    return response.data;
  }

  static async listarItensOrcamento(id: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/orcamentos/${id}/itens`);
    return Array.isArray(response.data) ? response.data : [];
  }

  static async calcularTotal(id: number): Promise<{ valor_total: number }> {
    const response = await apiClient.get<{ valor_total: number }>(`/orcamentos/${id}/calcular`);
    return response.data;
  }

  static async criarOrcamento(orcamento: any): Promise<Reserva> {
    const status = normalizeOrcamentoStatus(orcamento.status) ?? reservaSchema.orcamento.defaults.status;
    const payload = {
      ...orcamento,
      status,
      items: normalizeItems(orcamento.items)
    };

    const response = await apiClient.post<Reserva>('/orcamentos', payload);
    return response.data;
  }

  static async atualizarOrcamento(id: number, dados: AtualizarOrcamentoRequest): Promise<Reserva> {
    const payload = {
      ...dados,
      status: dados.status ? normalizeOrcamentoStatus(dados.status) : undefined
    };

    const response = await apiClient.put<Reserva>(`/orcamentos/${id}`, payload);
    return response.data;
  }

  static async removerOrcamento(id: number): Promise<void> {
    await apiClient.delete(`/orcamentos/${id}`);
  }

  static async aprovarOrcamento(id: number): Promise<Reserva> {
    const response = await apiClient.put<{ success: boolean; message: string; reserva: Reserva }>(`/orcamentos/${id}/aprovar`);
    // A API retorna { success: true, message: '...', reserva: ... }
    // O apiClient encapsula isso em { success: true, data: ... }
    return response.data.reserva;
  }

  // === MÉTODOS DE RESERVA ===

  static async listarReservas(filtros?: ReservaFilter): Promise<PaginatedResponse<Reserva>> {
    const query = buildQueryString(filtros);
    const response = await apiClient.get<Reserva[]>(`/reservas${query}`);
    const data = Array.isArray(response.data) ? response.data : [];

    return {
      data,
      total: data.length,
      page: 1,
      limit: data.length || 10,
      totalPages: 1
    };
  }

  static async buscarReserva(id: number): Promise<Reserva> {
    const response = await apiClient.get<Reserva>(`/reservas/${id}`);
    return response.data;
  }

  static async listarReservasAtivas(): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('/reservas?status=ativa');
    return Array.isArray(response.data) ? response.data : [];
  }

  static async listarReservasPorPeriodo(dataInicio: string, dataFim: string): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>(`/reservas?data_inicio=${dataInicio}&data_fim=${dataFim}`);
    return Array.isArray(response.data) ? response.data : [];
  }

  static async obterRelatorioReservas(periodo: { dataInicio: string; dataFim: string }): Promise<any> {
    const response = await apiClient.get(`/reservas/relatorio?data_inicio=${periodo.dataInicio}&data_fim=${periodo.dataFim}`);
    return response.data;
  }

  static async criarReserva(reserva: CriarReservaRequest): Promise<Reserva> {
    const response = await apiClient.post<Reserva>('/reservas', reserva);
    return response.data;
  }

  static async atualizarReserva(id: number, dados: AtualizarReservaRequest): Promise<Reserva> {
    const status = normalizeOrcamentoStatus(dados.status);
    const payload = {
      ...dados,
      ...(status && { status })
    };

    const response = await apiClient.put<Reserva>(`/reservas/${id}`, payload);
    return response.data;
  }

  static async cancelarReserva(id: number, motivo?: string): Promise<Reserva> {
    const response = await apiClient.post<Reserva>(`/reservas/${id}/cancelar`, { motivo });
    return response.data;
  }

  static async cancelarOrcamento(id: number): Promise<any> {
    try {
      const response = await apiClient.put(`/orcamentos/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar orçamento:', error);
      throw error;
    }
  }

  static async finalizarReserva(id: number, observacoes?: string): Promise<Reserva> {
    const response = await apiClient.post<Reserva>(`/reservas/${id}/finalizar`, { observacoes });
    return response.data;
  }
}

export default OrcamentoService;
