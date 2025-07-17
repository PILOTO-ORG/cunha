import { apiClient } from './apiClient.ts';
import type { 
  Local,
  LocalFilter,
  CriarLocalRequest,
  AtualizarLocalRequest,
  PaginatedResponse 
} from '../types/api';

/**
 * Serviço para gerenciamento de locais
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * - listar_locais - Lista todos os locais
 * - buscar_local - Busca local por ID
 * - criar_local - Cria novo local
 * - atualizar_local - Atualiza local
 * - remover_local - Remove local
 * - buscar_locais_tipo - Busca locais por tipo
 * - verificar_disponibilidade_local - Verifica disponibilidade do local
 */

export class LocalService {
  /**
   * Lista todos os locais com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de locais
   */
  static async listarLocais(filtros?: LocalFilter): Promise<PaginatedResponse<Local>> {
    const params = filtros ? '?' + new URLSearchParams(filtros as any).toString() : '';
    const response = await apiClient.get<PaginatedResponse<Local>>(`/locais${params}`);
    console.log('listarLocais response', response.data);
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
   * Busca um local específico por ID
   * 
   * @param id - ID do local
   * @returns Promise com dados do local
   */
  static async buscarLocal(id: number): Promise<Local> {
    const response = await apiClient.get<Local>(`/locais/${id}`);
    return response.data;
  }

  /**
   * Cria um novo local
   * 
   * @param local - Dados do local a ser criado
   * @returns Promise com o local criado
   */
  static async criarLocal(local: CriarLocalRequest): Promise<Local> {
    const response = await apiClient.post<Local>('/locais', local);
    return response.data;
  }

  /**
   * Atualiza um local existente
   * 
   * @param id - ID do local
   * @param dadosAtualizacao - Dados para atualização
   * @returns Promise com o local atualizado
   */
  static async atualizarLocal(id: number, dadosAtualizacao: AtualizarLocalRequest): Promise<Local> {
    const response = await apiClient.put<Local>(`/locais/${id}`, dadosAtualizacao);
    return response.data;
  }

  /**
   * Remove um local
   * 
   * @param id - ID do local a ser removido
   * @returns Promise com confirmação da remoção
   */
  static async removerLocal(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/locais/${id}`);
    return response.data;
  }

  /**
   * Busca locais por tipo
   * 
   * @param tipo - Tipo do local
   * @returns Promise com lista de locais do tipo
   */
  static async buscarPorTipo(tipo: string): Promise<Local[]> {
    const response = await apiClient.get<Local[]>(`/locais?tipo=${encodeURIComponent(tipo)}`);
    return response.data;
  }

  /**
   * Verifica disponibilidade de um local para um período
   * 
   * @param id_local - ID do local
   * @param data_inicio - Data de início
   * @param data_fim - Data de fim
   * @returns Promise com informação de disponibilidade
   */
  static async verificarDisponibilidade(
    id_local: number,
    data_inicio: string,
    data_fim: string
  ): Promise<{ disponivel: boolean; conflitos?: any[] }> {
    const params = `?data_inicio=${encodeURIComponent(data_inicio)}&data_fim=${encodeURIComponent(data_fim)}`;
    const response = await apiClient.get<{ disponivel: boolean; conflitos?: any[] }>(`/locais/${id_local}/disponibilidade${params}`);
    return response.data;
  }
}

export default LocalService;
