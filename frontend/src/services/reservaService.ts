import { apiClient } from './apiClient';
import type { 
  Reserva,
  ReservaFilter,
  CriarReservaRequest,
  CriarOrcamentoComItensRequest,
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
 * - buscar_reservas_periodo - Busca reservas por período
 */

export class ReservaService {
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
   * Busca itens de uma reserva específica
   * 
   * @param idReserva - ID da reserva
   * @returns Promise com lista de itens da reserva
   */
  static async buscarItensReserva(idReserva: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/reservas/${idReserva}/itens`);
    return response.data || [];
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
   * Cria um novo orçamento com itens (marketplace)
   * 
   * @param orcamento - Dados do orçamento com itens
   * @returns Promise com o orçamento criado
   */
  static async criarOrcamentoComItens(orcamento: CriarOrcamentoComItensRequest): Promise<Reserva> {
    const response = await apiClient.post<Reserva>('/reservas', orcamento);
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
    const response = await apiClient.get<Reserva[]>('/reservas/buscar-cliente', { 
      params: { id_cliente }
    });
    return response.data;
  }

  /**
   * Busca reservas por período
   * 
   * @param data_evento_inicio - Data de início do evento
   * @param data_evento_fim - Data de fim do evento
   * @returns Promise com lista de reservas no período
   */
  static async buscarPorPeriodo(data_evento_inicio: string, data_evento_fim: string): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('/reservas/buscar-periodo', {
      params: { data_evento_inicio, data_evento_fim }
    });
    return response.data;
  }

  /**
   * Busca reservas por período (método alias)
   * 
   * @param data_evento_inicio - Data de início do evento
   * @param data_evento_fim - Data de fim do evento
   * @returns Promise com lista de reservas no período
   */
  static async buscarReservasPorPeriodo(data_evento_inicio: string, data_evento_fim: string): Promise<Reserva[]> {
    return ReservaService.buscarPorPeriodo(data_evento_inicio, data_evento_fim);
  }

  /**
   * Atualiza status de uma reserva
   * 
   * @param id - ID da reserva
   * @param status - Novo status
   * @returns Promise com a reserva atualizada
   */
  static async atualizarStatus(id: number, status: 'ativa' | 'concluída' | 'cancelada'): Promise<Reserva> {
    const response = await apiClient.put<Reserva>(`/reservas/${id}/status`, {
      status
    });
    return response.data;
  }

  /**
   * Gera e baixa PDF do orçamento
   * 
   * @param id - ID da reserva/orçamento
   * @returns Promise que resolve quando o download é iniciado
   */
  static async gerarPDFOrcamento(id: number): Promise<void> {
    try {
      // Chamar API para gerar PDF e obter URL
      const response = await apiClient.get<{ success: boolean; data: { url: string; filename: string; path: string } }>(`/reservas/${id}/pdf`);

      console.log('Response completa:', response);
      
      // A API retorna { success: true, data: { url, filename, path } }
      // O apiClient já retorna isso diretamente em response.data
      const apiResponse = response.data;
      const pdfData = apiResponse.data;
      const url = pdfData.url;
      console.log('apiResponse:', apiResponse,  'pdfData:', pdfData, 'url:', url);
      if (!pdfData || !url) {
        console.error('Resposta inválida:', response);
        console.error('apiResponse:', apiResponse);
        console.error('pdfData:', pdfData);
        throw new Error('URL do PDF não foi retornada pelo servidor');
      }

      // Abrir URL em nova aba (visualização)
      window.open( url, '_blank');

      // Opcional: também fazer download automático
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfData.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('PDF gerado com sucesso:', pdfData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Gera link de assinatura digital gov.br para o orçamento
   * 
   * @param id - ID da reserva/orçamento
   * @returns Promise com informações da assinatura e link
   */
  static async gerarLinkAssinatura(id: number): Promise<any> {
    try {
      const response = await apiClient.post(`/reservas/${id}/assinatura`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar link de assinatura:', error);
      throw error;
    }
  }

  /**
   * Aprova um orçamento (transforma em reserva confirmada)
   * 
   * @param id - ID do orçamento
   * @returns Promise com a reserva aprovada
   */
  static async aprovarOrcamento(id: number): Promise<any> {
    try {
      const response = await apiClient.put(`/reservas/${id}/aprovar`);
      // A API retorna { success: true, message: '...', reserva: ... }
      // O apiClient encapsula isso em { success: true, data: ... }
      return response.data;
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      throw error;
    }
  }

  /**
   * Cancela um orçamento
   * 
   * @param id - ID do orçamento
   * @returns Promise com a reserva cancelada
   */
  static async cancelarOrcamento(id: number): Promise<any> {
    try {
      const response = await apiClient.put(`/reservas/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar orçamento:', error);
      throw error;
    }
  }

  /**
   * Verifica disponibilidade de produtos para um período
   * 
   * @param produtos - Lista de produtos com quantidades
   * @param data_inicio - Data de início
   * @param data_fim - Data de fim
   * @returns Promise com informações de disponibilidade
   */
  static async verificarDisponibilidade(
    produtos: Array<{ id_produto: number; quantidade: number }>,
    data_inicio: string,
    data_fim: string
  ): Promise<any> {
    try {
      const response = await apiClient.post('/reservas/verificar-disponibilidade', {
        produtos,
        data_inicio,
        data_fim
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }
}

export default ReservaService;