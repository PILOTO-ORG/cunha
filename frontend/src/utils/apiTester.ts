/**
 * Script de Teste da API - Versão TypeScript/Frontend
 * 
 * Este arquivo pode ser usado para testar a API diretamente no frontend
 * ou como referência para implementar testes no React.
 */

import { apiClient } from '../services/apiClient';
import type { 
  Produto, 
  Cliente, 
  Local, 
  Reserva, 
  Movimento,
  CriarProdutoRequest,
  CriarClienteRequest,
  CriarLocalRequest,
  CriarReservaRequest,
  CriarMovimentoRequest
} from '../types/api';

// Dados de teste
export const testData = {
  produto: {
    nome: "Cadeira Tiffany - Teste",
    quantidade_total: 50,
    valor_locacao: 8.50,
    valor_danificacao: 45.00,
    tempo_limpeza: 5
  } as CriarProdutoRequest,

  cliente: {
    nome: "João da Silva - Teste",
    telefone: "(11) 99999-9999",
    email: "joao.teste@email.com",
    cpf_cnpj: "123.456.789-00"
  } as CriarClienteRequest,

  local: {
    descricao: "Salão de Festas - Teste",
    endereco: "Rua Teste, 123",
    capacidade: 100,
    tipo: "salao"
  } as CriarLocalRequest,

  reserva: {
    id_cliente: 1,
    id_local: 1,
    data_inicio: "2025-08-15T18:00:00.000Z",
    data_fim: "2025-08-15T23:00:00.000Z",
    id_produto: 1,
    quantidade: 10,
    status: "ativa"
  } as CriarReservaRequest,

  movimento: {
    id_produto: 1,
    tipo_evento: "entrada",
    quantidade: 20,
    observacao: "Entrada de estoque - Teste",
    responsavel: "Sistema de Teste"
  } as CriarMovimentoRequest
};

// Interface para resultado dos testes
interface TestResult {
  name: string;
  success: boolean;
  data?: any;
  error?: any;
  duration: number;
}

interface CategoryResult {
  category: string;
  tests: TestResult[];
  totalTests: number;
  successCount: number;
  failureCount: number;
}

// Classe principal para testes da API
export class ApiTester {
  private results: CategoryResult[] = [];

  // Função auxiliar para medir tempo de execução
  private async executeTest<T>(
    name: string,
    testFunction: () => Promise<T>
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const data = await testFunction();
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${name} - ${duration}ms`, data);
      return {
        name,
        success: true,
        data,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ ${name} - ${duration}ms`, error);
      return {
        name,
        success: false,
        error,
        duration
      };
    }
  }

  // Testes de Produtos
  async testProdutos(): Promise<CategoryResult> {
    console.log('🛍️ Testando endpoints de Produtos...');
    
    const tests: TestResult[] = [];

    // Listar produtos
    tests.push(await this.executeTest(
      'Listar produtos',
      () => apiClient.get('listar_produtos')
    ));

    // Criar produto
    tests.push(await this.executeTest(
      'Criar produto',
      () => apiClient.post('criar_produto', testData.produto)
    ));

    // Buscar produto por ID
    tests.push(await this.executeTest(
      'Buscar produto por ID',
      () => apiClient.get('buscar_produto', { id_produto: 1 })
    ));

    // Atualizar produto
    tests.push(await this.executeTest(
      'Atualizar produto',
      () => apiClient.put('atualizar_produto', {
        id_produto: 1,
        nome: 'Cadeira Tiffany - Atualizada',
        valor_locacao: 9.00
      })
    ));

    // Verificar disponibilidade
    tests.push(await this.executeTest(
      'Verificar disponibilidade',
      () => apiClient.get('verificar_disponibilidade', {
        id_produto: 1,
        data_inicio: '2025-08-15T18:00:00.000Z',
        data_fim: '2025-08-15T23:00:00.000Z'
      })
    ));

    // Produtos com estoque baixo
    tests.push(await this.executeTest(
      'Produtos com estoque baixo',
      () => apiClient.get('listar_produtos_estoque_baixo')
    ));

    const successCount = tests.filter(t => t.success).length;
    
    return {
      category: 'PRODUTOS',
      tests,
      totalTests: tests.length,
      successCount,
      failureCount: tests.length - successCount
    };
  }

  // Testes de Clientes
  async testClientes(): Promise<CategoryResult> {
    console.log('👥 Testando endpoints de Clientes...');
    
    const tests: TestResult[] = [];

    // Listar clientes
    tests.push(await this.executeTest(
      'Listar clientes',
      () => apiClient.get('listar_clientes')
    ));

    // Criar cliente
    tests.push(await this.executeTest(
      'Criar cliente',
      () => apiClient.post('criar_cliente', testData.cliente)
    ));

    // Buscar cliente por ID
    tests.push(await this.executeTest(
      'Buscar cliente por ID',
      () => apiClient.get('buscar_cliente', { id_cliente: 1 })
    ));

    // Atualizar cliente
    tests.push(await this.executeTest(
      'Atualizar cliente',
      () => apiClient.put('atualizar_cliente', {
        id_cliente: 1,
        telefone: '(11) 88888-8888'
      })
    ));

    // Buscar por nome
    tests.push(await this.executeTest(
      'Buscar clientes por nome',
      () => apiClient.get('buscar_clientes_nome', { nome: 'João' })
    ));

    // Buscar por email
    tests.push(await this.executeTest(
      'Buscar cliente por email',
      () => apiClient.get('buscar_cliente_email', { email: 'joao.teste@email.com' })
    ));

    // Verificar se existe
    tests.push(await this.executeTest(
      'Verificar se cliente existe',
      () => apiClient.get('verificar_cliente_existe', { email: 'joao.teste@email.com' })
    ));

    // Estatísticas
    tests.push(await this.executeTest(
      'Obter estatísticas do cliente',
      () => apiClient.get('obter_estatisticas_cliente', { id_cliente: 1 })
    ));

    const successCount = tests.filter(t => t.success).length;
    
    return {
      category: 'CLIENTES',
      tests,
      totalTests: tests.length,
      successCount,
      failureCount: tests.length - successCount
    };
  }

  // Testes de Locais
  async testLocais(): Promise<CategoryResult> {
    console.log('🏢 Testando endpoints de Locais...');
    
    const tests: TestResult[] = [];

    // Listar locais
    tests.push(await this.executeTest(
      'Listar locais',
      () => apiClient.get('listar_locais')
    ));

    // Criar local
    tests.push(await this.executeTest(
      'Criar local',
      () => apiClient.post('criar_local', testData.local)
    ));

    // Buscar local por ID
    tests.push(await this.executeTest(
      'Buscar local por ID',
      () => apiClient.get('buscar_local', { id_local: 1 })
    ));

    // Atualizar local
    tests.push(await this.executeTest(
      'Atualizar local',
      () => apiClient.put('atualizar_local', {
        id_local: 1,
        capacidade: 120
      })
    ));

    // Buscar por tipo
    tests.push(await this.executeTest(
      'Buscar locais por tipo',
      () => apiClient.get('buscar_locais_tipo', { tipo: 'salao' })
    ));

    // Verificar disponibilidade
    tests.push(await this.executeTest(
      'Verificar disponibilidade do local',
      () => apiClient.get('verificar_disponibilidade_local', {
        id_local: 1,
        data_inicio: '2025-08-15T18:00:00.000Z',
        data_fim: '2025-08-15T23:00:00.000Z'
      })
    ));

    const successCount = tests.filter(t => t.success).length;
    
    return {
      category: 'LOCAIS',
      tests,
      totalTests: tests.length,
      successCount,
      failureCount: tests.length - successCount
    };
  }

  // Testes de Reservas
  async testReservas(): Promise<CategoryResult> {
    console.log('📅 Testando endpoints de Reservas...');
    
    const tests: TestResult[] = [];

    // Listar reservas
    tests.push(await this.executeTest(
      'Listar reservas',
      () => apiClient.get('listar_reservas')
    ));

    // Criar reserva
    tests.push(await this.executeTest(
      'Criar reserva',
      () => apiClient.post('criar_reserva', testData.reserva)
    ));

    // Buscar reserva por ID
    tests.push(await this.executeTest(
      'Buscar reserva por ID',
      () => apiClient.get('buscar_reserva', { id_item_reserva: 1 })
    ));

    // Atualizar reserva
    tests.push(await this.executeTest(
      'Atualizar reserva',
      () => apiClient.put('atualizar_reserva', {
        id_item_reserva: 1,
        quantidade: 15
      })
    ));

    // Buscar por cliente
    tests.push(await this.executeTest(
      'Buscar reservas por cliente',
      () => apiClient.get('buscar_reservas_cliente', { id_cliente: 1 })
    ));

    // Buscar por produto
    tests.push(await this.executeTest(
      'Buscar reservas por produto',
      () => apiClient.get('buscar_reservas_produto', { id_produto: 1 })
    ));

    // Buscar por período
    tests.push(await this.executeTest(
      'Buscar reservas por período',
      () => apiClient.get('buscar_reservas_periodo', {
        data_inicio: '2025-08-01T00:00:00.000Z',
        data_fim: '2025-08-31T23:59:59.000Z'
      })
    ));

    // Atualizar status
    tests.push(await this.executeTest(
      'Atualizar status da reserva',
      () => apiClient.put('atualizar_status_reserva', {
        id_item_reserva: 1,
        status: 'concluída'
      })
    ));

    const successCount = tests.filter(t => t.success).length;
    
    return {
      category: 'RESERVAS',
      tests,
      totalTests: tests.length,
      successCount,
      failureCount: tests.length - successCount
    };
  }

  // Testes de Movimentos
  async testMovimentos(): Promise<CategoryResult> {
    console.log('📦 Testando endpoints de Movimentos...');
    
    const tests: TestResult[] = [];

    // Listar movimentos
    tests.push(await this.executeTest(
      'Listar movimentos',
      () => apiClient.get('listar_movimentos')
    ));

    // Criar movimento
    tests.push(await this.executeTest(
      'Criar movimento',
      () => apiClient.post('criar_movimento', testData.movimento)
    ));

    // Buscar movimento por ID
    tests.push(await this.executeTest(
      'Buscar movimento por ID',
      () => apiClient.get('buscar_movimento', { id_evento: 1 })
    ));

    // Buscar por produto
    tests.push(await this.executeTest(
      'Buscar movimentos por produto',
      () => apiClient.get('buscar_movimentos_produto', { id_produto: 1 })
    ));

    // Buscar por tipo
    tests.push(await this.executeTest(
      'Buscar movimentos por tipo',
      () => apiClient.get('buscar_movimentos_tipo', { tipo_evento: 'entrada' })
    ));

    // Buscar por período
    tests.push(await this.executeTest(
      'Buscar movimentos por período',
      () => apiClient.get('buscar_movimentos_periodo', {
        data_inicio: '2025-07-01T00:00:00.000Z',
        data_fim: '2025-07-31T23:59:59.000Z'
      })
    ));

    // Histórico do produto
    tests.push(await this.executeTest(
      'Obter histórico do produto',
      () => apiClient.get('obter_historico_produto', { id_produto: 1 })
    ));

    const successCount = tests.filter(t => t.success).length;
    
    return {
      category: 'MOVIMENTOS',
      tests,
      totalTests: tests.length,
      successCount,
      failureCount: tests.length - successCount
    };
  }

  // Executar todos os testes
  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando testes da API Cunha Festas ERP...\n');
    
    this.results = [];

    // Executar testes por categoria
    this.results.push(await this.testProdutos());
    this.results.push(await this.testClientes());
    this.results.push(await this.testLocais());
    this.results.push(await this.testReservas());
    this.results.push(await this.testMovimentos());

    // Imprimir resumo
    this.printSummary();
  }

  // Imprimir resumo dos testes
  private printSummary(): void {
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('='.repeat(50));

    let totalTests = 0;
    let totalSuccess = 0;
    let totalFailures = 0;

    this.results.forEach(category => {
      totalTests += category.totalTests;
      totalSuccess += category.successCount;
      totalFailures += category.failureCount;

      const successRate = ((category.successCount / category.totalTests) * 100).toFixed(1);
      
      console.log(`\n${category.category}:`);
      console.log(`  Total: ${category.totalTests}`);
      console.log(`  Sucessos: ${category.successCount}`);
      console.log(`  Falhas: ${category.failureCount}`);
      console.log(`  Taxa de sucesso: ${successRate}%`);
    });

    const overallSuccessRate = ((totalSuccess / totalTests) * 100).toFixed(1);

    console.log('\n' + '='.repeat(50));
    console.log(`TOTAL GERAL:`);
    console.log(`  Testes: ${totalTests}`);
    console.log(`  Sucessos: ${totalSuccess}`);
    console.log(`  Falhas: ${totalFailures}`);
    console.log(`  Taxa de sucesso: ${overallSuccessRate}%`);

    if (totalFailures === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os logs acima.');
    }
  }

  // Getter para acessar os resultados
  getResults(): CategoryResult[] {
    return this.results;
  }
}

// Função para uso rápido
export async function testApi(): Promise<void> {
  const tester = new ApiTester();
  await tester.runAllTests();
}

// Instância global para uso no console do navegador
declare global {
  interface Window {
    apiTester: ApiTester;
    testApi: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.apiTester = new ApiTester();
  window.testApi = testApi;
}

export default ApiTester;
