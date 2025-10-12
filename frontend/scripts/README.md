# Scripts de Teste da API - Cunha Festas cunha

Este diretório contém scripts para testar todos os endpoints da API do sistema cunha integrado com n8n.

## 📁 Arquivos Disponíveis

### 1. `scripts/test-api.js` (Node.js)
Script standalone em JavaScript que pode ser executado diretamente no Node.js para testar a API externa.

**Características:**
- ✅ Execução independente (não precisa do React)
- ✅ Output colorido no terminal
- ✅ Relatório detalhado de cada teste
- ✅ Pausa entre requisições para não sobrecarregar a API
- ✅ Resumo estatístico ao final

### 2. `src/utils/apiTester.ts` (TypeScript/Frontend)
Classe TypeScript integrada que pode ser usada dentro do React ou no console do navegador.

**Características:**
- ✅ Integração completa com os tipos do projeto
- ✅ Pode ser chamada de componentes React
- ✅ Disponível no console do navegador (`window.testApi()`)
- ✅ Medição de tempo de resposta
- ✅ Tratamento de erros tipado

## 🚀 Como Usar

### Opção 1: Script Node.js (Recomendado para testes externos)

```bash
# Executar diretamente
node scripts/test-api.js

# Ou dar permissão de execução e rodar como script
chmod +x scripts/test-api.js
./scripts/test-api.js
```

### Opção 2: No Console do Navegador

1. Abra o frontend no navegador
2. Abra o Developer Tools (F12)
3. No console, digite:

```javascript
// Testar todos os endpoints
await window.testApi();

// Ou usar a instância da classe para testes específicos
const tester = window.apiTester;

// Testar apenas produtos
await tester.testProdutos();

// Testar apenas clientes
await tester.testClientes();

// Ver resultados
console.log(tester.getResults());
```

### Opção 3: Integração em Componente React

```tsx
import React from 'react';
import { ApiTester } from '../utils/apiTester';

const TestPage: React.FC = () => {
  const runTests = async () => {
    const tester = new ApiTester();
    await tester.runAllTests();
    console.log('Resultados:', tester.getResults());
  };

  return (
    <div>
      <button onClick={runTests}>
        Executar Testes da API
      </button>
    </div>
  );
};
```

## 📋 Endpoints Testados

### 🛍️ PRODUTOS
- `listar_produtos` - Lista todos os produtos
- `criar_produto` - Cria novo produto
- `buscar_produto` - Busca produto por ID
- `atualizar_produto` - Atualiza produto existente
- `verificar_disponibilidade` - Verifica disponibilidade por período
- `listar_produtos_estoque_baixo` - Lista produtos com estoque baixo

### 👥 CLIENTES
- `listar_clientes` - Lista todos os clientes
- `criar_cliente` - Cria novo cliente
- `buscar_cliente` - Busca cliente por ID
- `atualizar_cliente` - Atualiza cliente existente
- `buscar_clientes_nome` - Busca clientes por nome
- `buscar_cliente_email` - Busca cliente por email
- `verificar_cliente_existe` - Verifica se cliente existe
- `obter_estatisticas_cliente` - Obtém estatísticas do cliente

### 🏢 LOCAIS
- `listar_locais` - Lista todos os locais
- `criar_local` - Cria novo local
- `buscar_local` - Busca local por ID
- `atualizar_local` - Atualiza local existente
- `buscar_locais_tipo` - Busca locais por tipo
- `verificar_disponibilidade_local` - Verifica disponibilidade do local

### 📅 RESERVAS
- `listar_reservas` - Lista todas as reservas
- `criar_reserva` - Cria nova reserva
- `buscar_reserva` - Busca reserva por ID
- `atualizar_reserva` - Atualiza reserva existente
- `buscar_reservas_cliente` - Busca reservas por cliente
- `buscar_reservas_produto` - Busca reservas por produto
- `buscar_reservas_periodo` - Busca reservas por período
- `atualizar_status_reserva` - Atualiza status da reserva

### 📦 MOVIMENTOS
- `listar_movimentos` - Lista todos os movimentos
- `criar_movimento` - Cria novo movimento
- `buscar_movimento` - Busca movimento por ID
- `buscar_movimentos_produto` - Busca movimentos por produto
- `buscar_movimentos_tipo` - Busca movimentos por tipo
- `buscar_movimentos_periodo` - Busca movimentos por período
- `obter_historico_produto` - Obtém histórico completo do produto

## 🔧 Configuração da API

O script usa a configuração padrão da API definida em `src/services/apiClient.ts`:

```typescript
const API_BASE_URL = 'https://n8n.piloto.live/webhook/cunha-festas';
```

### Alterar URL da API

Para testar em um ambiente diferente, você pode:

1. **No script Node.js**: Edite a constante `API_BASE_URL` no arquivo `scripts/test-api.js`
2. **No TypeScript**: Altere a configuração em `src/services/apiClient.ts`

## 📊 Formato de Saída

### Exemplo de Saída do Script Node.js:
```
🚀 INICIANDO TESTES DA API CUNHA FESTAS cunha

📋 CATEGORIA: PRODUTOS
==================================================

🔍 Testando: Listar todos os produtos
Payload: {"action":"listar_produtos"}
✅ Sucesso: {"success":true,"data":[...]}
--------------------------------------------------

📊 RESUMO DOS TESTES
==================================================
Total de testes: 35
Sucessos: 32
Falhas: 3
Taxa de sucesso: 91.4%
```

### Exemplo de Saída no Console do Navegador:
```
🛍️ Testando endpoints de Produtos...
✅ Listar produtos - 245ms {success: true, data: Array(5)}
✅ Criar produto - 456ms {success: true, data: {...}}
❌ Buscar produto por ID - 123ms Error: Not Found

📊 RESUMO DOS TESTES
==================================================
PRODUTOS:
  Total: 6
  Sucessos: 5
  Falhas: 1
  Taxa de sucesso: 83.3%
```

## 🔍 Dados de Teste

Os scripts usam dados de teste predefinidos que não interferem com dados reais:

```javascript
const testData = {
  produto: {
    nome: "Cadeira Tiffany - Teste",
    quantidade_total: 50,
    valor_locacao: 8.50,
    // ...
  },
  cliente: {
    nome: "João da Silva - Teste",
    email: "joao.teste@email.com",
    // ...
  }
  // ...
};
```

**⚠️ Importante**: Os dados de teste são claramente marcados com "- Teste" no nome para evitar confusão com dados reais.

## 🛠️ Personalização

### Adicionar Novos Testes

Para adicionar um novo endpoint ao teste:

1. **No script Node.js**: Adicione um novo objeto ao array `tests`
2. **No TypeScript**: Adicione um novo teste em algum método da classe `ApiTester`

### Exemplo:
```javascript
// Node.js
{
  payload: { action: "novo_endpoint", param: "valor" },
  description: "Testar novo endpoint"
}

// TypeScript
tests.push(await this.executeTest(
  'Testar novo endpoint',
  () => apiClient.get('novo_endpoint', { param: 'valor' })
));
```

## 🐛 Troubleshooting

### Problemas Comuns:

1. **Erro de CORS**: Configure o CORS no n8n ou use um proxy
2. **Timeout**: Aumente o tempo limite ou verifique a conexão
3. **Endpoint não encontrado**: Verifique se o workflow n8n está ativo
4. **Dados inválidos**: Verifique se o schema do banco corresponde aos dados enviados

### Debug:

Ative logs detalhados adicionando:
```javascript
console.log('Request:', payload);
console.log('Response:', response);
```

## 📝 Logs e Relatórios

Os scripts geram logs detalhados que podem ser usados para:
- ✅ Identificar endpoints com problemas
- ✅ Medir performance da API
- ✅ Validar integração com n8n
- ✅ Documentar comportamento da API

## 🎯 Uso Recomendado

1. **Durante desenvolvimento**: Use para validar novos endpoints
2. **Antes de deploy**: Execute todos os testes para garantir compatibilidade
3. **Monitoramento**: Execute periodicamente para verificar saúde da API
4. **Debug**: Use testes específicos para investigar problemas
