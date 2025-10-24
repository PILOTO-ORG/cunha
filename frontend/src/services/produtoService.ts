import { apiClient } from './apiClient';
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
    
    // Verifica se a resposta já está no formato paginado correto
    if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
      return response.data as PaginatedResponse<Produto>;
    }
    
    // Fallback para resposta antiga (array direto) - compatibilidade
    if (Array.isArray(response.data)) {
      return { 
        data: response.data, 
        total: response.data.length, 
        page: filtros?.page || 1, 
        limit: filtros?.limit || response.data.length, 
        totalPages: 1 
      };
    }
    
    // Último fallback
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
   * @param imagem - Arquivo de imagem (opcional)
   * @returns Promise com produto criado
   */
  static async criarProduto(produto: CriarProdutoRequest, imagem?: File): Promise<Produto> {
    if (imagem) {
      const formData = new FormData();
      
      // Adicionar dados do produto
      Object.entries(produto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // Adicionar imagem
      formData.append('imagem', imagem);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.piloto.live'}/api/produtos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Erro ao criar produto');
      return await response.json();
    } else {
      const response = await apiClient.post<Produto>('/produtos', produto);
      return response.data;
    }
  }

  /**
   * Atualiza um produto existente
   * 
   * @param id - ID do produto
   * @param dados - Dados a serem atualizados
   * @param imagem - Nova imagem (opcional)
   * @returns Promise com produto atualizado
   */
  static async atualizarProduto(id: number, dados: AtualizarProdutoRequest, imagem?: File): Promise<Produto> {
    if (imagem) {
      const formData = new FormData();
      
      // Adicionar dados do produto
      Object.entries(dados).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // Adicionar imagem
      formData.append('imagem', imagem);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.piloto.live'}/api/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar produto');
      return await response.json();
    } else {
      const response = await apiClient.put<Produto>(`/api/produtos/${id}`, dados);
      return response.data;
    }
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
    console.log(`[ProdutoService] softDeleteProduto - ID: ${id}`);
    console.log(`[ProdutoService] Enviando payload: { ativo: false }`);
    
    const response = await apiClient.patch<Produto>(`/produtos/${id}`, { 
      ativo: false 
    });
    
    console.log(`[ProdutoService] softDeleteProduto response:`, response.data);
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

  /**
   * Adiciona imagens à galeria do produto
   * 
   * @param id - ID do produto
   * @param imagens - Array de arquivos de imagem
   * @returns Promise com produto atualizado
   */
  static async adicionarImagensGaleria(id: number, imagens: FileList): Promise<Produto> {
    const formData = new FormData();
    
    // Adicionar todas as imagens
    Array.from(imagens).forEach((imagem) => {
      formData.append('imagens', imagem);
    });
    
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/produtos/${id}/galeria`, {
        method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Erro ao adicionar imagens à galeria');
    return await response.json();
  }

  /**
   * Remove uma imagem específica da galeria
   * 
   * @param id - ID do produto
   * @param imagemPath - Caminho da imagem a ser removida
   * @returns Promise com produto atualizado
   */
  static async removerImagemGaleria(id: number, imagemPath: string): Promise<Produto> {
    const response = await apiClient.delete<Produto>(`/produtos/${id}/galeria`, {
      data: { imagemPath }
    });
    return response.data;
  }

  /**
   * Remove a imagem principal do produto
   * 
   * @param id - ID do produto
   * @returns Promise com produto atualizado
   */
  static async removerImagemPrincipal(id: number): Promise<Produto> {
    const response = await apiClient.delete<Produto>(`/produtos/${id}/imagem-principal`);
    return response.data;
  }
}

export default ProdutoService;
