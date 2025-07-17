import { apiClient } from './apiClient.ts';
import type { 
  Movimento,
  MovimentoFilter,
  CriarMovimentoRequest,
  PaginatedResponse 
} from '../types/api';

/**
 * Serviço para gerenciamento de movimentos de estoque
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * - listar_movimentos - Lista todos os movimentos
 * - buscar_movimento - Busca movimento por ID
 * - criar_movimento - Cria novo movimento
 * - buscar_movimentos_produto - Busca movimentos por produto
 * - buscar_movimentos_tipo - Busca movimentos por tipo
 * - buscar_movimentos_periodo - Busca movimentos por período
 */

export class MovimentoService {
  /**
   * Lista todos os movimentos com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de movimentos
   */
  static async listarMovimentos(filtros?: MovimentoFilter): Promise<PaginatedResponse<Movimento>> {
    const params = filtros ? '?' + new URLSearchParams(filtros as any).toString() : '';
    const response = await apiClient.get<PaginatedResponse<Movimento>>(`/movimentos${params}`);
    console.log('listarMovimentos response', response.data);
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
   * Busca um movimento específico por ID
   * 
   * @param id - ID do movimento
   * @returns Promise com dados do movimento
   */
  static async buscarMovimento(id: number): Promise<Movimento> {
    const response = await apiClient.get<Movimento>(`/movimentos/${id}`);
    return response.data;
  }

  /**
   * Cria um novo movimento
   * 
   * @param movimento - Dados do movimento a ser criado
   * @returns Promise com o movimento criado
   */
  static async criarMovimento(movimento: CriarMovimentoRequest): Promise<Movimento> {
    const response = await apiClient.post<Movimento>('/movimentos', movimento);
    return response.data;
  }
  // Adicione métodos PUT e DELETE REST para movimentos
  static async atualizarMovimento(id: number, dados: any): Promise<Movimento> {
    const response = await apiClient.put<Movimento>(`/movimentos/${id}`, dados);
    return response.data;
  }

  static async removerMovimento(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/movimentos/${id}`);
    return response.data;
  }

  /**
   * Busca movimentos por produto
   * 
   * @param id_produto - ID do produto
   * @returns Promise com lista de movimentos do produto
   */
  static async buscarPorProduto(id_produto: number): Promise<Movimento[]> {
    const response = await apiClient.get<Movimento[]>('buscar_movimentos_produto', { id_produto });
    return response.data;
  }

  /**
   * Busca movimentos por tipo
   * 
   * @param tipo_evento - Tipo do movimento
   * @returns Promise com lista de movimentos do tipo
   */
  static async buscarPorTipo(tipo_evento: 'entrada' | 'saida' | 'reserva' | 'limpeza' | 'perda'): Promise<Movimento[]> {
    const response = await apiClient.get<Movimento[]>('buscar_movimentos_tipo', { tipo_evento });
    return response.data;
  }

  /**
   * Busca movimentos por período
   * 
   * @param data_inicio - Data de início
   * @param data_fim - Data de fim
   * @returns Promise com lista de movimentos no período
   */
  static async buscarPorPeriodo(data_inicio: string, data_fim: string): Promise<Movimento[]> {
    const response = await apiClient.get<Movimento[]>('buscar_movimentos_periodo', { 
      data_inicio, 
      data_fim 
    });
    return response.data;
  }

  /**
   * Obtém histórico completo de um produto
   * 
   * @param id_produto - ID do produto
   * @returns Promise com histórico do produto
   */
  static async obterHistoricoProduto(id_produto: number): Promise<Movimento[]> {
    const response = await apiClient.get<Movimento[]>('obter_historico_produto', { id_produto });
    return response.data;
  }
}

export default MovimentoService;
