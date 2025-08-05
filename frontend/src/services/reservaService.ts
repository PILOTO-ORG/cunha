import { apiClient } from './apiClient.ts';
import type { 
  Reserva,
  ReservaFilter,
  CriarReservaRequest,
  AtualizarReservaRequest,
  PaginatedResponse 
} from '../types/api';

/**
 * Serviço para gerenciamento de reservas
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * - listar_reservas - Lista todas as reservas
 * - buscar_reserva - Busca reserva por ID
 * - criar_reserva - Cria nova reserva
 * - atualizar_reserva - Atualiza reserva
 * - remover_reserva - Remove reserva
 * - buscar_reservas_cliente - Busca reservas por cliente
 * - buscar_reservas_produto - Busca reservas por produto
 * - buscar_reservas_periodo - Busca reservas por período
 */

export class ReservaService {
  /**
   * Atualiza o campo link_drive de todos os itens de uma reserva
   * @param id_reserva - ID do grupo de reserva
   * @param link_drive - Link do Google Drive
   */
  static async atualizarLinkDrive(id_reserva: number, link_drive: string): Promise<any> {
    const response = await apiClient.put('/reservas/atualizar-link-drive', { id_reserva, link_drive });
    return response.data;
  }
  /**
   * Lista todas as reservas com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de reservas
   */
  static async listarReservas(filtros?: ReservaFilter): Promise<PaginatedResponse<Reserva>> {
    const params = filtros ? '?' + new URLSearchParams(filtros as any).toString() : '';
    const response = await apiClient.get<PaginatedResponse<Reserva>>(`/reservas${params}`);
    console.log('listarReservas response', response.data);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    const fallback = typeof response.data === 'object' && response.data !== null ? response.data : {};
    return {
      data: Array.isArray(response.data) ? response.data : [],
      total: typeof fallback['total'] === 'number' ? fallback['total'] : 0,
      page: typeof fallback['page'] === 'number' ? fallback['page'] : 1,
      limit: typeof fallback['limit'] === 'number' ? fallback['limit'] : 10,
      totalPages: typeof fallback['totalPages'] === 'number' ? fallback['totalPages'] : 1,
    };
  }

  /**
   * Busca uma reserva específica por ID
   * 
   * @param id - ID da reserva
   * @returns Promise com dados da reserva
   */
  static async buscarReserva(id: number): Promise<Reserva> {
    const response = await apiClient.get<Reserva>(`/reservas/${id}`);
    return response.data;
  }

  /**
   * Cria uma nova reserva
   * 
   * @param reserva - Dados da reserva a ser criada
   * @returns Promise com a reserva criada
   */
  static async criarReserva(reserva: CriarReservaRequest): Promise<Reserva> {
    const response = await apiClient.post<Reserva>('/reservas', reserva);
    return response.data;
  }

  /**
   * Atualiza uma reserva existente
   * 
   * @param id - ID da reserva
   * @param dadosAtualizacao - Dados para atualização
   * @returns Promise com a reserva atualizada
   */
  static async atualizarReserva(id: number, dadosAtualizacao: AtualizarReservaRequest): Promise<Reserva> {
    const response = await apiClient.put<Reserva>(`/reservas/${id}`, dadosAtualizacao);
    return response.data;
  }

  /**
   * Remove uma reserva
   * 
   * @param id - ID da reserva a ser removida
   * @returns Promise com confirmação da remoção
   */
  static async removerReserva(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/reservas/${id}`);
    return response.data;
  }

  /**
   * Busca reservas por cliente
   * 
   * @param id_cliente - ID do cliente
   * @returns Promise com lista de reservas do cliente
   */
  static async buscarPorCliente(id_cliente: number): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('buscar_reservas_cliente', { id_cliente });
    return response.data;
  }

  /**
   * Busca reservas por produto
   * 
   * @param id_produto - ID do produto
   * @returns Promise com lista de reservas do produto
   */
  static async buscarPorProduto(id_produto: number): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('buscar_reservas_produto', { id_produto });
    return response.data;
  }

  /**
   * Busca reservas por período
   * 
   * @param data_inicio - Data de início
   * @param data_fim - Data de fim
   * @returns Promise com lista de reservas no período
   */
  static async buscarReservasPorPeriodo(data_inicio: string, data_fim: string): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('/reservas/buscar-periodo', {
      params: { data_inicio, data_fim }
    });
    return response.data;
  }

  /**
   * Cria múltiplos itens de orçamento em uma única transação
   * 
   * @param itens - Array de itens de orçamento a serem criados
   * @returns Promise com os itens criados e o ID do orçamento
   */
  static async criarOrcamentoMultiplo(itens: CriarReservaRequest[]): Promise<{
    success: boolean;
    message: string;
    id_reserva: number;
    data: Reserva[];
  }> {
    // Garante que todos os campos estejam presentes, mesmo que com valores padrão
    const itensCompletos = itens.map(item => ({
      id_cliente: item.id_cliente || 0,
      id_local: item.id_local || null,
      id_produto: item.id_produto || 0,
      quantidade: item.quantidade || 1,
      data_inicio: item.data_inicio || new Date().toISOString().split('T')[0],
      data_fim: item.data_fim || new Date().toISOString().split('T')[0],
      status: item.status || 'iniciada',
      observacoes: item.observacoes || '',
      link_drive: item.link_drive || '',
      frete: item.frete || 0,
      desconto: item.desconto || 0,
      data_saida: item.data_saida || null,
      data_retorno: item.data_retorno || null,
      dias_reservados: item.dias_reservados || 1
    }));

    const response = await apiClient.post('/reservas/orcamento-multiplo', {
      itens: itensCompletos
    });
    
    return response.data;
  }

  /**
   * Atualiza status de uma reserva
   * 
   * @param id - ID da reserva
   * @param status - Novo status
   * @returns Promise com a reserva atualizada
   */
  static async atualizarStatus(id: number, status: 'ativa' | 'concluída' | 'cancelada'): Promise<Reserva> {
    // Corrige rota para /api/reservas/atualizar-status
    const response = await apiClient.put<Reserva>('/api/reservas/atualizar-status', {
      id_item_reserva: id,
      status
    });
    return response.data;
  }
}

export default ReservaService;
