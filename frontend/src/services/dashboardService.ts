import { apiClient } from './apiClient.ts';
import type { DashboardData } from '../types/api';

/**
 * Serviço para dados do dashboard e relatórios
 * 
 * Todas as requisições são feitas para o webhook do n8n com diferentes ações:
 * - obter_dados_dashboard - Obtém dados gerais do dashboard
 * - gerar_relatorio_vendas - Gera relatório de vendas
 * - gerar_relatorio_produtos - Gera relatório de produtos
 * - gerar_relatorio_clientes - Gera relatório de clientes
 * - listar_alertas - Lista alertas do sistema
 * - listar_atividades_recentes - Lista atividades recentes
 * - exportar_relatorio - Exporta relatório em formato específico
 */

export class DashboardService {
  /**
   * Obtém dados gerais para o dashboard
   * 
   * @returns Promise com dados do dashboard
   */
  static async obterDadosDashboard(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/dashboard');
    console.log('[DashboardService] obterDadosDashboard response:', response.data);
    return response.data;
  }

  /**
   * Gera relatório de vendas para um período
   * 
   * @param periodo - Período do relatório
   * @returns Promise com dados do relatório de vendas
   */
  static async gerarRelatorioVendas(periodo: {
    dataInicio: string;
    dataFim: string;
  }): Promise<{
    totalVendas: number;
    totalReceita: number;
    vendasPorDia: any[];
    produtosMaisVendidos: any[];
  }> {
    const response = await apiClient.get<{
      totalVendas: number;
      totalReceita: number;
      vendasPorDia: any[];
      produtosMaisVendidos: any[];
    }>('gerar_relatorio_vendas', periodo);
    console.log('[DashboardService] gerarRelatorioVendas response:', response.data);
    return response.data;
  }

  /**
   * Gera relatório de produtos
   * 
   * @param filtros - Filtros para o relatório
   * @returns Promise com dados do relatório de produtos
   */
  static async gerarRelatorioProdutos(filtros?: {
    categoria?: string;
    estoqueBaixo?: boolean;
    maisPopulares?: boolean;
  }): Promise<{
    totalProdutos: number;
    produtosEstoqueBaixo: number;
    produtosMaisPopulares: any[];
    categorias: any[];
  }> {
    const response = await apiClient.get<{
      totalProdutos: number;
      produtosEstoqueBaixo: number;
      produtosMaisPopulares: any[];
      categorias: any[];
    }>('gerar_relatorio_produtos', filtros);
    console.log('[DashboardService] gerarRelatorioProdutos response:', response.data);
    return response.data;
  }

  /**
   * Gera relatório de clientes
   * 
   * @returns Promise com dados do relatório de clientes
   */
  static async gerarRelatorioClientes(): Promise<{
    totalClientes: number;
    novosClientesMes: number;
    clientesAtivos: number;
    topClientes: any[];
  }> {
    const response = await apiClient.get<{
      totalClientes: number;
      novosClientesMes: number;
      clientesAtivos: number;
      topClientes: any[];
    }>('gerar_relatorio_clientes');
    console.log('[DashboardService] gerarRelatorioClientes response:', response.data);
    return response.data;
  }

  /**
   * Lista alertas do sistema
   * 
   * @returns Promise com lista de alertas
   */
  static async listarAlertas(): Promise<Array<{
    id: string;
    tipo: 'warning' | 'error' | 'info';
    titulo: string;
    mensagem: string;
    timestamp: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      tipo: 'warning' | 'error' | 'info';
      titulo: string;
      mensagem: string;
      timestamp: string;
    }>>('listar_alertas');
    console.log('[DashboardService] listarAlertas response:', response.data);
    return response.data;
  }

  /**
   * Lista atividades recentes do sistema
   * 
   * @param limite - Número máximo de atividades
   * @returns Promise com lista de atividades
   */
  static async listarAtividadesRecentes(limite: number = 10): Promise<Array<{
    id: string;
    tipo: string;
    descricao: string;
    usuario: string;
    timestamp: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      tipo: string;
      descricao: string;
      usuario: string;
      timestamp: string;
    }>>('listar_atividades_recentes', { limite });
    console.log('[DashboardService] listarAtividadesRecentes response:', response.data);
    return response.data;
  }

  /**
   * Exporta relatório em formato específico
   * 
   * @param tipo - Tipo do relatório (vendas, produtos, clientes)
   * @param formato - Formato de exportação (pdf, excel, csv)
   * @param periodo - Período do relatório
   * @returns Promise com URL ou dados do arquivo
   */
  static async exportarRelatorio(
    tipo: 'vendas' | 'produtos' | 'clientes',
    formato: 'pdf' | 'excel' | 'csv',
    periodo?: {
      dataInicio: string;
      dataFim: string;
    }
  ): Promise<{
    url?: string;
    base64?: string;
    filename: string;
  }> {
    const response = await apiClient.post<{
      url?: string;
      base64?: string;
      filename: string;
    }>('exportar_relatorio', {
      tipo,
      formato,
      periodo
    });
    console.log('[DashboardService] exportarRelatorio response:', response.data);
    return response.data;
  }
}

export default DashboardService;
