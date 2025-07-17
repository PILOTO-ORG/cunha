# Sistema ERP Cunha Festas - Frontend Atualizado

## ✅ Refatoração Realizada

O frontend foi completamente refatorado e alinhado ao **schema real do banco de dados PostgreSQL**. Todas as interfaces, serviços, hooks e páginas agora refletem apenas os campos que realmente existem nas tabelas do banco.

## 🗄️ Schema do Banco de Dados

O sistema utiliza o schema `erp` no PostgreSQL com as seguintes tabelas:

### `erp.produtos`
- `id_produto` (serial, PK)
- `nome` (text, NOT NULL)
- `quantidade_total` (integer, NOT NULL)
- `valor_locacao` (numeric, nullable)
- `valor_danificacao` (numeric, nullable)
- `tempo_limpeza` (integer, nullable)

### `erp.clientes`
- `id_cliente` (serial, PK)
- `nome` (text, NOT NULL)
- `telefone` (text, nullable)
- `email` (text, nullable)
- `cpf_cnpj` (text, nullable)

### `erp.locais`
- `id_local` (serial, PK)
- `descricao` (text, NOT NULL)
- `endereco` (text, nullable)
- `capacidade` (integer, nullable)
- `tipo` (text, nullable)

### `erp.reservas`
- `id_item_reserva` (integer, PK)
- `id_reserva` (serial)
- `id_cliente` (integer, nullable, FK)
- `id_local` (integer, nullable, FK)
- `data_inicio` (timestamp, NOT NULL)
- `data_fim` (timestamp, NOT NULL)
- `status` ('ativa', 'concluída', 'cancelada', NOT NULL)
- `id_produto` (integer, NOT NULL, FK)
- `quantidade` (integer, NOT NULL)

### `erp.movimentos`
- `id_evento` (integer, PK)
- `id_produto` (integer, NOT NULL, FK)
- `data_evento` (timestamp, NOT NULL, default: CURRENT_TIMESTAMP)
- `tipo_evento` ('entrada', 'saida', 'reserva', 'limpeza', 'perda', NOT NULL)
- `quantidade` (integer, NOT NULL)
- `observacao` (text, nullable)
- `responsavel` (text, nullable)
- `reserva_id` (integer, nullable, FK)

## 🔧 Arquivos Atualizados

### 1. Tipos TypeScript (`src/types/api.ts`)
- ✅ Removidos campos fictícios como `categoria`, `ativo`, `descricao`, `endereco` (clientes)
- ✅ Alinhados todos os tipos com os campos reais do banco
- ✅ Interfaces de Request/Response atualizadas
- ✅ Removida interface `Orcamento` (não existe no schema)

### 2. Serviços (`src/services/`)
- ✅ **ProdutoService**: Payloads usando `id_produto`, `valor_locacao` nullable
- ✅ **ClienteService**: Removido campo `endereco`, ajustado `cpf_cnpj`
- ✅ **LocalService**: Atualizado para usar interfaces corretas
- ✅ **ReservaService**: Criado do zero alinhado ao schema
- ✅ **MovimentoService**: Criado do zero para controle de estoque

### 3. Hooks (`src/hooks/`)
- ✅ **useProdutos**: Atualizado para usar `CriarProdutoRequest`
- ✅ **useClientes**: Removidos campos inexistentes
- ✅ **useLocais**: Atualizado para usar tipos corretos
- ✅ **useReservas**: Criado do zero para gerenciar reservas
- ✅ **useMovimentos**: Criado do zero para controle de estoque

### 4. Páginas (`src/pages/`)
- ✅ **ProductsPage**: Removidas colunas `categoria` e `ativo`, valores nullable tratados
- ✅ **ClientsPage**: Removida coluna `endereco`
- ✅ **BudgetsPage**: Temporariamente desabilitada (funcionalidade de orçamentos removida)

## 🚀 Funcionalidades Implementadas

### ✅ Gestão de Produtos
- Listagem, criação, edição e remoção
- Campos: nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza
- Consulta de disponibilidade por período

### ✅ Gestão de Clientes
- Listagem, criação, edição e remoção
- Campos: nome, telefone, email, cpf_cnpj
- Busca por nome, email e termo geral

### ✅ Gestão de Locais
- Listagem, criação, edição e remoção
- Campos: descricao, endereco, capacidade, tipo
- Busca por tipo e verificação de disponibilidade

### ✅ Gestão de Reservas
- Listagem, criação, edição e remoção
- Campos reais do banco: id_cliente, id_local, data_inicio, data_fim, status, id_produto, quantidade
- Busca por cliente, produto e período
- Atualização de status

### ✅ Controle de Movimentos de Estoque
- Registro de movimentações: entrada, saída, reserva, limpeza, perda
- Histórico completo por produto
- Vinculação com reservas quando aplicável

## 🔌 Integração com Backend n8n

Todos os serviços estão preparados para integração com workflows n8n:

```javascript
// Exemplo de payload para criar produto
{
  "acao": "criar_produto",
  "nome": "Cadeira Tiffany",
  "quantidade_total": 50,
  "valor_locacao": 8.50,
  "valor_danificacao": 45.00,
  "tempo_limpeza": 5
}
```

```sql
-- Exemplo de query SQL gerada no n8n
INSERT INTO erp.produtos (nome, quantidade_total, valor_locacao, valor_danificacao, tempo_limpeza)
VALUES ('${nome}', ${quantidade_total}, ${valor_locacao}, ${valor_danificacao}, ${tempo_limpeza})
RETURNING *;
```

## 📋 Próximos Passos

### Para Desenvolvimento
1. Implementar formulários de criação/edição para cada entidade
2. Criar página de gestão de reservas
3. Implementar página de controle de estoque/movimentos
4. Adicionar dashboard com estatísticas reais

### Para Backend n8n
1. Implementar workflows para cada ação (criar, listar, atualizar, remover)
2. Configurar nodes PostgreSQL com as queries corretas
3. Implementar validações de negócio
4. Configurar tratamento de erros

### Para Validação
1. Testar integração real com banco PostgreSQL
2. Validar todas as operações CRUD
3. Testar consultas de disponibilidade
4. Verificar performance das queries

## 🔍 Status de Compilação

✅ **Build Status**: Compilado com sucesso  
✅ **TypeScript**: Sem erros de tipo  
✅ **ESLint**: Sem erros (apenas warnings de variáveis não utilizadas em desenvolvimento)  

## 📝 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build de produção
npm run build

# Executar testes
npm test
```

## 🎯 Compatibilidade

- ✅ Schema PostgreSQL `erp` real
- ✅ Tipos TypeScript alinhados
- ✅ Payloads prontos para n8n
- ✅ Queries SQL compatíveis
- ✅ Frontend responsivo e funcional
