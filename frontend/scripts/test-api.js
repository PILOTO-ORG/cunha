#!/usr/bin/env node

/**
 * Script de Teste da API n8n - Cunha Festas ERP
 * 
 * Este script testa todos os endpoints da API do sistema ERP,
 * fazendo requisições para cada tipo de operação CRUD.
 * 
 * Uso: node scripts/test-api.js
 */

const API_BASE_URL = 'https://n8n.piloto.live/webhook/cunha-festas';

// Cores para output no terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Função para fazer requisições à API
const { jwtFetch } = require('../src/services/jwtFetch');
async function makeRequest(payload, description) {
  console.log(`${colors.blue}🔍 Testando: ${description}${colors.reset}`);
  console.log(`${colors.cyan}Payload:${colors.reset}`, JSON.stringify(payload, null, 2));
  
  try {
    const response = await jwtFetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✅ Sucesso:${colors.reset}`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.log(`${colors.red}❌ Erro HTTP ${response.status}:${colors.reset}`, JSON.stringify(data, null, 2));
      return { success: false, error: data, status: response.status };
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erro de Rede:${colors.reset}`, error.message);
    return { success: false, error: error.message };
  }
}

// Função para aguardar um tempo
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Dados de teste
const testData = {
  produto: {
    nome: "Cadeira Tiffany - Teste",
    quantidade_total: 50,
    valor_locacao: 8.50,
    valor_danificacao: 45.00,
    tempo_limpeza: 5
  },
  cliente: {
    nome: "João da Silva - Teste",
    telefone: "(11) 99999-9999",
    email: "joao.teste@email.com",
    cpf_cnpj: "123.456.789-00"
  },
  local: {
    descricao: "Salão de Festas - Teste",
    endereco: "Rua Teste, 123",
    capacidade: 100,
    tipo: "salao"
  },
  reserva: {
    id_cliente: 1,
    id_local: 1,
    data_inicio: "2025-08-15T18:00:00.000Z",
    data_fim: "2025-08-15T23:00:00.000Z",
    id_produto: 1,
    quantidade: 10,
    status: "ativa"
  },
  movimento: {
    id_produto: 1,
    tipo_evento: "entrada",
    quantidade: 20,
    observacao: "Entrada de estoque - Teste",
    responsavel: "Sistema de Teste"
  }
};

// Lista de todos os testes a serem executados
const tests = [
  // ========== TESTES DE PRODUTOS ==========
  {
    category: "PRODUTOS",
    tests: [
      {
        payload: { action: "listar_produtos" },
        description: "Listar todos os produtos"
      },
      {
        payload: { action: "criar_produto", ...testData.produto },
        description: "Criar novo produto"
      },
      {
        payload: { action: "buscar_produto", id_produto: 1 },
        description: "Buscar produto por ID"
      },
      {
        payload: { 
          action: "atualizar_produto", 
          id_produto: 1, 
          nome: "Cadeira Tiffany - Atualizada",
          valor_locacao: 9.00 
        },
        description: "Atualizar produto"
      },
      {
        payload: { 
          action: "verificar_disponibilidade", 
          id_produto: 1,
          data_inicio: "2025-08-15T18:00:00.000Z",
          data_fim: "2025-08-15T23:00:00.000Z"
        },
        description: "Verificar disponibilidade do produto"
      },
      {
        payload: { action: "listar_produtos_estoque_baixo" },
        description: "Listar produtos com estoque baixo"
      }
    ]
  },

  // ========== TESTES DE CLIENTES ==========
  {
    category: "CLIENTES",
    tests: [
      {
        payload: { action: "listar_clientes" },
        description: "Listar todos os clientes"
      },
      {
        payload: { action: "criar_cliente", ...testData.cliente },
        description: "Criar novo cliente"
      },
      {
        payload: { action: "buscar_cliente", id_cliente: 1 },
        description: "Buscar cliente por ID"
      },
      {
        payload: { 
          action: "atualizar_cliente", 
          id_cliente: 1, 
          telefone: "(11) 88888-8888" 
        },
        description: "Atualizar cliente"
      },
      {
        payload: { action: "buscar_clientes_nome", nome: "João" },
        description: "Buscar clientes por nome"
      },
      {
        payload: { action: "buscar_cliente_email", email: "joao.teste@email.com" },
        description: "Buscar cliente por email"
      },
      {
        payload: { action: "verificar_cliente_existe", email: "joao.teste@email.com" },
        description: "Verificar se cliente existe"
      },
      {
        payload: { action: "obter_estatisticas_cliente", id_cliente: 1 },
        description: "Obter estatísticas do cliente"
      }
    ]
  },

  // ========== TESTES DE LOCAIS ==========
  {
    category: "LOCAIS",
    tests: [
      {
        payload: { action: "listar_locais" },
        description: "Listar todos os locais"
      },
      {
        payload: { action: "criar_local", ...testData.local },
        description: "Criar novo local"
      },
      {
        payload: { action: "buscar_local", id_local: 1 },
        description: "Buscar local por ID"
      },
      {
        payload: { 
          action: "atualizar_local", 
          id_local: 1, 
          capacidade: 120 
        },
        description: "Atualizar local"
      },
      {
        payload: { action: "buscar_locais_tipo", tipo: "salao" },
        description: "Buscar locais por tipo"
      },
      {
        payload: { 
          action: "verificar_disponibilidade_local", 
          id_local: 1,
          data_inicio: "2025-08-15T18:00:00.000Z",
          data_fim: "2025-08-15T23:00:00.000Z"
        },
        description: "Verificar disponibilidade do local"
      }
    ]
  },

  // ========== TESTES DE RESERVAS ==========
  {
    category: "RESERVAS",
    tests: [
      {
        payload: { action: "listar_reservas" },
        description: "Listar todas as reservas"
      },
      {
        payload: { action: "criar_reserva", ...testData.reserva },
        description: "Criar nova reserva"
      },
      {
        payload: { action: "buscar_reserva", id_item_reserva: 1 },
        description: "Buscar reserva por ID"
      },
      {
        payload: { 
          action: "atualizar_reserva", 
          id_item_reserva: 1, 
          quantidade: 15 
        },
        description: "Atualizar reserva"
      },
      {
        payload: { action: "buscar_reservas_cliente", id_cliente: 1 },
        description: "Buscar reservas por cliente"
      },
      {
        payload: { action: "buscar_reservas_produto", id_produto: 1 },
        description: "Buscar reservas por produto"
      },
      {
        payload: { 
          action: "buscar_reservas_periodo",
          data_inicio: "2025-08-01T00:00:00.000Z",
          data_fim: "2025-08-31T23:59:59.000Z"
        },
        description: "Buscar reservas por período"
      },
      {
        payload: { 
          action: "atualizar_status_reserva", 
          id_item_reserva: 1, 
          status: "concluída" 
        },
        description: "Atualizar status da reserva"
      }
    ]
  },

  // ========== TESTES DE MOVIMENTOS ==========
  {
    category: "MOVIMENTOS",
    tests: [
      {
        payload: { action: "listar_movimentos" },
        description: "Listar todos os movimentos"
      },
      {
        payload: { action: "criar_movimento", ...testData.movimento },
        description: "Criar novo movimento"
      },
      {
        payload: { action: "buscar_movimento", id_evento: 1 },
        description: "Buscar movimento por ID"
      },
      {
        payload: { action: "buscar_movimentos_produto", id_produto: 1 },
        description: "Buscar movimentos por produto"
      },
      {
        payload: { action: "buscar_movimentos_tipo", tipo_evento: "entrada" },
        description: "Buscar movimentos por tipo"
      },
      {
        payload: { 
          action: "buscar_movimentos_periodo",
          data_inicio: "2025-07-01T00:00:00.000Z",
          data_fim: "2025-07-31T23:59:59.000Z"
        },
        description: "Buscar movimentos por período"
      },
      {
        payload: { action: "obter_historico_produto", id_produto: 1 },
        description: "Obter histórico completo do produto"
      }
    ]
  }
];

// Função principal para executar todos os testes
async function runTests() {
  console.log(`${colors.bold}${colors.magenta}🚀 INICIANDO TESTES DA API CUNHA FESTAS ERP${colors.reset}\n`);
  console.log(`${colors.cyan}URL da API: ${API_BASE_URL}${colors.reset}\n`);

  let totalTests = 0;
  let successfulTests = 0;
  let failedTests = 0;

  for (const category of tests) {
    console.log(`${colors.bold}${colors.yellow}📋 CATEGORIA: ${category.category}${colors.reset}`);
    console.log(`${"=".repeat(50)}\n`);

    for (const test of category.tests) {
      totalTests++;
      const result = await makeRequest(test.payload, test.description);
      
      if (result.success) {
        successfulTests++;
      } else {
        failedTests++;
      }
      
      console.log(`${"-".repeat(50)}\n`);
      
      // Aguarda 1 segundo entre requisições para não sobrecarregar a API
      await sleep(1000);
    }
    
    console.log(`${colors.bold}FIM DA CATEGORIA: ${category.category}${colors.reset}\n`);
    console.log(`${"=".repeat(80)}\n`);
  }

  // Resumo final
  console.log(`${colors.bold}${colors.magenta}📊 RESUMO DOS TESTES${colors.reset}`);
  console.log(`${"=".repeat(50)}`);
  console.log(`${colors.cyan}Total de testes: ${totalTests}${colors.reset}`);
  console.log(`${colors.green}Sucessos: ${successfulTests}${colors.reset}`);
  console.log(`${colors.red}Falhas: ${failedTests}${colors.reset}`);
  console.log(`${colors.yellow}Taxa de sucesso: ${((successfulTests / totalTests) * 100).toFixed(1)}%${colors.reset}`);
  
  if (failedTests === 0) {
    console.log(`\n${colors.green}🎉 TODOS OS TESTES PASSARAM!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  ALGUNS TESTES FALHARAM. Verifique os logs acima.${colors.reset}`);
  }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest, testData };
