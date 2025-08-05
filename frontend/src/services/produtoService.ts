import { apiClient } from './apiClient.ts';
import type { 
  Produto, 
  ProdutoFilter, 
  DisponibilidadeConsulta, 
  DisponibilidadeResposta,
  AtualizarProdutoRequest,
  CriarProdutoRequest,
  PaginatedResponse 
} from '../types/api';

/**
 * Serviço para gerenciamento de produtos
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * - listar_produtos - Lista todos os produtos
 * - buscar_produto - Busca produto por ID
 * - verificar_disponibilidade - Verifica disponibilidade de produto
 * - criar_produto - Cria novo produto
 * - atualizar_produto - Atualiza produto
 * - remover_produto - Remove produto
 * - listar_produtos_estoque_baixo - Lista produtos com estoque baixo
 * - verificar_disponibilidade_multipla - Verifica disponibilidade de múltiplos produtos
 */

export class ProdutoService {
  /**
   * Lista todos os produtos com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de produtos
   */
  static async listarProdutos(filtros?: ProdutoFilter): Promise<PaginatedResponse<Produto>> {
    const params = filtros ? '?' + new URLSearchParams(filtros as any).toString() : '';
    const response = await apiClient.get<PaginatedResponse<Produto>>(`/produtos${params}`);
    console.log('[ProdutoService] listarProdutos response:', response.data);
    // Garante que data seja sempre um array
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, page: 1, limit: response.data.length, totalPages: 1 };
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    // fallback para evitar tela vazia
    return { data: [], total: 0, page: 1, limit: 0, totalPages: 1 };
  }

  /**
   * Busca um produto específico por ID
   * 
   * @param id - ID do produto
   * @returns Promise com dados do produto
   */
  static async buscarProduto(id: number): Promise<Produto> {
    const response = await apiClient.get<Produto>(`/produtos/${id}`);
    return response.data;
  }

  /**
   * Verifica disponibilidade de um produto para um período
   * 
   * @param consulta - Dados da consulta (id_produto, data_inicio, data_fim)
   * @returns Promise com informações de disponibilidade
   */
  // Disponibilidade: endpoint REST customizado, ajuste conforme backend
  static async verificarDisponibilidade(consulta: DisponibilidadeConsulta): Promise<DisponibilidadeResposta> {
    const response = await apiClient.get<DisponibilidadeResposta>(`/produtos/${consulta.id_produto}/disponibilidade`, {
      data_inicio: consulta.data_inicio,
      data_fim: consulta.data_fim
    });
    return response.data;
  }

  /**
   * Cria um novo produto
   * 
   * @param produto - Dados do produto a ser criado
   * @returns Promise com produto criado
   */
  static async criarProduto(produto: CriarProdutoRequest): Promise<Produto> {
    const response = await apiClient.post<Produto>('/produtos', produto);
    return response.data;
  }

  /**
   * Atualiza um produto existente
   * 
   * @param id - ID do produto
   * @param dados - Dados a serem atualizados
   * @returns Promise com produto atualizado
   */
  static async atualizarProduto(id: number, dados: AtualizarProdutoRequest): Promise<Produto> {
    const response = await apiClient.put<Produto>(`/produtos/${id}`, dados);
    return response.data;
  }

  /**
   * Remove um produto (hard delete)
   * 
   * @param id - ID do produto
   * @returns Promise com confirmação
   */
  static async removerProduto(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/produtos/${id}`);
    return response.data;
  }

  /**
   * Remove um produto logicamente (soft delete)
   * 
   * @param id - ID do produto
   * @returns Promise com o produto atualizado
   */
  static async softDeleteProduto(id: number): Promise<Produto> {
    const response = await apiClient.patch<Produto>(`/produtos/${id}`, { 
      removido: true 
    });
    return response.data;
  }

  /**
   * Lista produtos com estoque baixo
   * 
   * @returns Promise com lista de produtos com estoque baixo
   */
  static async listarEstoqueBaixo(): Promise<Produto[]> {
    const response = await apiClient.get<Produto[]>('/produtos/estoque-baixo');
    return response.data;
  }

  /**
   * Verifica disponibilidade de múltiplos produtos
   * 
   * @param consultas - Array com consultas de disponibilidade
   * @returns Promise com array de respostas de disponibilidade
   */
  static async verificarDisponibilidadeMultipla(
    consultas: DisponibilidadeConsulta[]
  ): Promise<DisponibilidadeResposta[]> {
    const response = await apiClient.post<DisponibilidadeResposta[]>('/produtos/disponibilidade-multipla', { consultas });
    return response.data;
  }
}

export default ProdutoService;
