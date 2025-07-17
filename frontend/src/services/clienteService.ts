import { apiClient } from './apiClient.ts';
import type {
  Cliente,
  ClienteFilter,
  CriarClienteRequest,
  AtualizarClienteRequest,
  PaginatedResponse
} from '../types/api';

/**
 * Serviço para gerenciamento de clientes
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * - listar_clientes - Lista todos os clientes
 * - buscar_cliente - Busca cliente por ID
 * - criar_cliente - Cria novo cliente
 * - atualizar_cliente - Atualiza cliente
 * - remover_cliente - Remove cliente
 * - buscar_clientes_nome - Busca clientes por nome
 * - buscar_cliente_email - Busca cliente por email
 * - buscar_clientes_termo - Busca clientes por termo
 * - verificar_cliente_existe - Verifica se cliente existe
 * - obter_estatisticas_cliente - Obtém estatísticas do cliente
 */

export class ClienteService {
  /**
   * Lista todos os clientes com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de clientes
   */
  static async listarClientes(filtros?: ClienteFilter): Promise<PaginatedResponse<Cliente>> {
    const params = filtros ? '?' + new URLSearchParams(filtros as any).toString() : '';
    const response = await apiClient.get<PaginatedResponse<Cliente>>(`/clientes${params}`);
    console.log('listarClientes response', response.data);
    // Defensive: always return a PaginatedResponse with data as array
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
   * Busca um cliente específico por ID
   * 
   * @param id - ID do cliente
   * @returns Promise com dados do cliente
   */
  static async buscarCliente(id: number): Promise<Cliente> {
    const response = await apiClient.get<Cliente>(`/clientes/${id}`);
    return response.data;
  }

  /**
   * Cria um novo cliente
   * 
   * @param cliente - Dados do cliente a ser criado
   * @returns Promise com o cliente criado
   */
  static async criarCliente(cliente: CriarClienteRequest): Promise<Cliente> {
    const response = await apiClient.post<Cliente>('/clientes', cliente);
    return response.data;
  }

  /**
   * Atualiza um cliente existente
   * 
   * @param id - ID do cliente
   * @param dadosAtualizacao - Dados para atualização
   * @returns Promise com o cliente atualizado
   */
  static async atualizarCliente(id: number, dadosAtualizacao: AtualizarClienteRequest): Promise<Cliente> {
    const response = await apiClient.put<Cliente>(`/clientes/${id}`, dadosAtualizacao);
    return response.data;
  }

  /**
   * Remove um cliente
   * 
   * @param id - ID do cliente a ser removido
   * @returns Promise com confirmação da remoção
   */
  static async removerCliente(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/clientes/${id}`);
    return response.data;
  }

  /**
   * Busca clientes por nome
   * 
   * @param nome - Nome ou parte do nome do cliente
   * @returns Promise com lista de clientes encontrados
   */
  static async buscarPorNome(nome: string): Promise<Cliente[]> {
    const response = await apiClient.get<Cliente[]>(`/clientes?nome=${encodeURIComponent(nome)}`);
    return response.data;
  }

  /**
   * Busca cliente por email
   * 
   * @param email - Email do cliente
   * @returns Promise com cliente encontrado ou null
   */
  static async buscarPorEmail(email: string): Promise<Cliente | null> {
    const response = await apiClient.get<Cliente | null>(`/clientes?email=${encodeURIComponent(email)}`);
    // Se o backend retorna array, pegue o primeiro ou null
    if (Array.isArray(response.data)) {
      return response.data[0] || null;
    }
    return response.data;
  }

  /**
   * Busca clientes por termo geral (nome, email, telefone)
   * 
   * @param termo - Termo de busca
   * @returns Promise com lista de clientes encontrados
   */
  static async buscarPorTermo(termo: string): Promise<Cliente[]> {
    const response = await apiClient.get<Cliente[]>(`/clientes?search=${encodeURIComponent(termo)}`);
    return response.data;
  }

  /**
   * Verifica se um cliente existe pelo email ou CPF/CNPJ
   * 
   * @param email - Email do cliente
   * @param cpf_cnpj - CPF ou CNPJ do cliente
   * @returns Promise com informação se existe
   */
  static async verificarClienteExiste(email?: string, cpf_cnpj?: string): Promise<{ existe: boolean }> {
    let params: string[] = [];
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    if (cpf_cnpj) params.push(`cpf_cnpj=${encodeURIComponent(cpf_cnpj)}`);
    const query = params.length ? '?' + params.join('&') : '';
    const response = await apiClient.get<Cliente[]>(`/clientes${query}`);
    return { existe: Array.isArray(response.data) && response.data.length > 0 };
  }

  /**
   * Obtém estatísticas de um cliente
   * 
   * @param id - ID do cliente
   * @returns Promise com estatísticas do cliente
   */
  static async obterEstatisticas(id: number): Promise<{
    totalReservas: number;
    ultimaReserva?: string;
  }> {
    const response = await apiClient.get<{ totalReservas: number; ultimaReserva?: string }>(`/clientes/${id}/estatisticas`);
    return response.data;
  }
}

export default ClienteService;
