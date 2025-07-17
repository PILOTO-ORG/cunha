import { apiClient } from './apiClient.ts';
import type {
  Orcamento,
  Reserva,
  OrcamentoFilter,
  ReservaFilter,
  CriarOrcamentoRequest,
  AtualizarOrcamentoRequest,
  CriarReservaRequest,
  AtualizarReservaRequest,
  PaginatedResponse
} from '../types/api';

/**
 * Serviço para gerenciamento de orçamentos e reservas
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * 
 * ORÇAMENTOS:
 * - listar_orcamentos - Lista todos os orçamentos
 * - buscar_orcamento - Busca orçamento por ID
 * - criar_orcamento - Cria novo orçamento
 * - atualizar_orcamento - Atualiza orçamento
 * - remover_orcamento - Remove orçamento
 * - aprovar_orcamento - Aprova orçamento (converte em reserva)
 * - calcular_total_orcamento - Calcula total do orçamento
 * 
 * RESERVAS:
 * - listar_reservas - Lista todas as reservas
 * - buscar_reserva - Busca reserva por ID
 * - criar_reserva - Cria nova reserva
 * - atualizar_reserva - Atualiza reserva
 * - cancelar_reserva - Cancela reserva
 * - finalizar_reserva - Finaliza reserva
 * - listar_reservas_ativas - Lista reservas ativas
 * - listar_reservas_periodo - Lista reservas por período
 * - obter_relatorio_reservas - Obtém relatório de reservas
 */

export class OrcamentoService {
  // === MÉTODOS PARA ORÇAMENTOS ===

  /**
   * Lista todos os orçamentos com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de orçamentos
   */
  static async listarOrcamentos(filtros?: OrcamentoFilter): Promise<PaginatedResponse<Orcamento>> {
    const response = await apiClient.get<PaginatedResponse<Orcamento>>('listar_orcamentos', filtros);
    return response.data;
  }

  /**
   * Busca um orçamento específico por ID
   * 
   * @param id - ID do orçamento
   * @returns Promise com dados do orçamento
   */
  static async buscarOrcamento(id: number): Promise<Orcamento> {
    const response = await apiClient.get<Orcamento>('buscar_orcamento', { id });
    return response.data;
  }

  /**
   * Cria um novo orçamento
   * 
   * @param orcamento - Dados do orçamento a ser criado
   * @returns Promise com o orçamento criado
   */
  static async criarOrcamento(orcamento: CriarOrcamentoRequest): Promise<Orcamento> {
    const response = await apiClient.post<Orcamento>('criar_orcamento', orcamento);
    return response.data;
  }

  /**
   * Cria um novo orçamento como reservas com múltiplos itens (status "iniciada")
   * 
   * @param orcamento - Dados do orçamento com múltiplos itens
   * @returns Promise com as reservas criadas
   */
  static async criarOrcamentoComoReservas(orcamento: CriarOrcamentoRequest): Promise<Reserva[]> {
    const reservasCriadas: Reserva[] = [];
    
    for (const item of orcamento.itens) {
      const reservaData = {
        id_cliente: orcamento.id_cliente,
        id_local: orcamento.id_local,
        data_inicio: item.data_inicio,
        data_fim: item.data_fim,
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        status: 'iniciada', // Status "iniciada" indica que é um orçamento
        observacoes: orcamento.observacoes,
        data_validade: orcamento.data_validade
      };
      
      const response = await apiClient.post<Reserva[] | Reserva>('criar_reserva', reservaData);
      
      // Lidar com resposta que pode ser array ou objeto
      let reservaCriada: Reserva;
      if (Array.isArray(response.data)) {
        if (response.data.length === 0) {
          throw new Error('Nenhuma reserva foi criada para o item');
        }
        reservaCriada = response.data[0];
      } else {
        reservaCriada = response.data as Reserva;
      }
      
      reservasCriadas.push(reservaCriada);
    }
    
    return reservasCriadas;
  }

  /**
   * Atualiza um orçamento existente
   * 
   * @param id - ID do orçamento
   * @param dadosAtualizacao - Dados para atualização
   * @returns Promise com o orçamento atualizado
   */
  static async atualizarOrcamento(id: number, dadosAtualizacao: AtualizarOrcamentoRequest): Promise<Orcamento> {
    const response = await apiClient.put<Orcamento>('atualizar_orcamento', {
      id,
      ...dadosAtualizacao
    });
    return response.data;
  }

  /**
   * Remove um orçamento
   * 
   * @param id - ID do orçamento a ser removido
   * @returns Promise com confirmação da remoção
   */
  static async removerOrcamento(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>('remover_orcamento', { id });
    return response.data;
  }

  /**
   * Aprova um orçamento e converte em reserva
   * 
   * @param id - ID do orçamento
   * @returns Promise com a reserva criada
   */
  static async aprovarOrcamento(id: number): Promise<Reserva> {
    const response = await apiClient.post<Reserva>('aprovar_orcamento', { id });
    return response.data;
  }

  /**
   * Calcula o total de um orçamento
   * 
   * @param id - ID do orçamento
   * @returns Promise com o valor total calculado
   */
  static async calcularTotal(id: number): Promise<{ total: number; detalhes: any[] }> {
    const response = await apiClient.get<{ total: number; detalhes: any[] }>('calcular_total_orcamento', { id });
    return response.data;
  }

  // === MÉTODOS PARA RESERVAS ===

  /**
   * Lista todas as reservas com filtros opcionais
   * 
   * @param filtros - Filtros de busca e paginação
   * @returns Promise com lista paginada de reservas
   */
  static async listarReservas(filtros?: ReservaFilter): Promise<PaginatedResponse<Reserva>> {
    const response = await apiClient.get<PaginatedResponse<Reserva>>('listar_reservas', filtros);
    return response.data;
  }

  /**
   * Busca uma reserva específica por ID
   * 
   * @param id - ID da reserva
   * @returns Promise com dados da reserva
   */
  static async buscarReserva(id: number): Promise<Reserva> {
    const response = await apiClient.get<Reserva>('buscar_reserva', { id });
    return response.data;
  }

  /**
   * Cria uma nova reserva
   * 
   * @param reserva - Dados da reserva a ser criada
   * @returns Promise com a reserva criada
   */
  static async criarReserva(reserva: CriarReservaRequest): Promise<Reserva> {
    const response = await apiClient.post<Reserva>('criar_reserva', reserva);
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
    const response = await apiClient.put<Reserva>('atualizar_reserva', {
      id,
      ...dadosAtualizacao
    });
    return response.data;
  }

  /**
   * Cancela uma reserva
   * 
   * @param id - ID da reserva
   * @param motivo - Motivo do cancelamento
   * @returns Promise com confirmação do cancelamento
   */
  static async cancelarReserva(id: number, motivo?: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('cancelar_reserva', { id, motivo });
    return response.data;
  }

  /**
   * Finaliza uma reserva
   * 
   * @param id - ID da reserva
   * @param observacoes - Observações finais
   * @returns Promise com confirmação da finalização
   */
  static async finalizarReserva(id: number, observacoes?: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('finalizar_reserva', { id, observacoes });
    return response.data;
  }

  /**
   * Lista reservas ativas
   * 
   * @returns Promise com lista de reservas ativas
   */
  static async listarReservasAtivas(): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('listar_reservas_ativas');
    return response.data;
  }

  /**
   * Lista reservas por período
   * 
   * @param dataInicio - Data de início do período
   * @param dataFim - Data de fim do período
   * @returns Promise com lista de reservas no período
   */
  static async listarReservasPorPeriodo(dataInicio: string, dataFim: string): Promise<Reserva[]> {
    const response = await apiClient.get<Reserva[]>('listar_reservas_periodo', {
      dataInicio,
      dataFim
    });
    return response.data;
  }

  /**
   * Obtém relatório de reservas
   * 
   * @param periodo - Período do relatório
   * @returns Promise com dados do relatório
   */
  static async obterRelatorioReservas(periodo: {
    dataInicio: string;
    dataFim: string;
  }): Promise<{
    totalReservas: number;
    totalCanceladas: number;
    totalFinalizadas: number;
    valorTotal: number;
    produtosMaisReservados: any[];
  }> {
    const response = await apiClient.get<{
      totalReservas: number;
      totalCanceladas: number;
      totalFinalizadas: number;
      valorTotal: number;
      produtosMaisReservados: any[];
    }>('obter_relatorio_reservas', periodo);
    return response.data;
  }

  /**
   * Converte um orçamento em reserva ativa
   * 
   * @param idReserva - ID da reserva a ser convertida
   * @returns Promise com a reserva atualizada
   */
  static async converterParaReserva(idReserva: number): Promise<Reserva> {
    const response = await apiClient.put<Reserva>('atualizar_reserva', {
      id_item_reserva: idReserva,
      status: 'ativa'
    });
    
    return response.data;
  }
}

export default OrcamentoService;
