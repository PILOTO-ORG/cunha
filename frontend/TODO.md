# TODO - Sistema ERP Cunha Fe#### 1.1 ✅ Recriar OrcamentoService
- [x] Recriar arquivo `orcamentoService.ts` (atualmente vazio)
- [x] Implementar todos os métodos conforme documentação da API
- [x] Testar integração com webhook n8n

#### 1.2 ✅ Corrigir imports nas páginas
- [x] Atualizar imports em `ProductsPage.tsx` para usar tipos `Produto`
- [x] Atualizar imports em `ClientsPage.tsx` para usar tipos `Cliente`  
- [x] Atualizar imports em `BudgetsPage.tsx` para usar tipos `Orcamento`
- [x] Corrigir hooks para usar versões em português

#### 1.3 ✅ Atualizar App.tsx
- [x] Adicionar rotas para `/produtos`, `/clientes`, `/orcamentos`
- [x] Adicionar rotas temporárias para `/reservas`, `/locais`, `/relatorios`

## 📋 Status Atual do Projeto

### ✅ Concluído
- [x] Estrutura base do frontend (React + TypeScript + Tailwind)
- [x] Configuração do React Query para gerenciamento de estado
- [x] ApiClient configurado para webhook n8n
- [x] Tipagens TypeScript completas para todas as entidades
- [x] Serviços de API para produtos, clientes, dashboard e locais
- [x] Hooks customizados para produtos e clientes
- [x] Componentes UI básicos (Button, Input, Modal, Table, etc.)
- [x] Layout principal com navegação
- [x] HomePage com dashboard visual
- [x] Página da assistente IA (Nanda)
- [x] Documentação completa de todas as rotas da API
- [x] JSON de exemplos de interação da IA

### 🔧 Em Progresso
- [ ] Serviço de orçamentos/reservas (arquivo vazio)
- [ ] Páginas de CRUD existem mas usam hooks/serviços antigos
- [ ] Integração real com o backend n8n

---

## 🎯 Tarefas Prioritárias

### 1. **Corrigir Serviços e Hooks** (Alta Prioridade)

#### 1.1 Recriar OrcamentoService
- [x] Recriar arquivo `orcamentoService.ts` (atualmente vazio) ✅
- [x] Implementar todos os métodos conforme documentação da API ✅
- [ ] Testar integração com webhook n8n

#### 1.2 Corrigir Hooks
- [ ] Atualizar `useOrcamentosReservas.ts` para usar o novo serviço
- [ ] Criar hooks para LocalService
- [ ] Verificar e corrigir imports em todos os hooks

#### 1.3 Consolidar Arquivos Duplicados
- [ ] Remover arquivos em inglês: `productService.ts`, `clientService.ts`, `budgetService.ts`
- [ ] Remover hooks em inglês: `useProducts.ts`, `useClients.ts`, `useBudgets.ts`
- [ ] Manter apenas versões em português com padrão n8n

### 2. **Implementar Páginas CRUD Completas** (Alta Prioridade)

#### 2.1 Página de Produtos
- [ ] Atualizar imports para usar `ProdutoService` e `useProdutos`
- [ ] Implementar listagem com filtros e paginação
- [ ] Formulário de criação/edição de produtos
- [ ] Ações de remover e ativar/desativar
- [ ] Verificação de disponibilidade em tempo real

#### 2.2 Página de Clientes
- [ ] Atualizar imports para usar `ClienteService` e `useClientes`
- [ ] Implementar busca por nome, email, CPF/CNPJ
- [ ] Formulário completo de cliente com validações
- [ ] Histórico de reservas do cliente
- [ ] Estatísticas do cliente

#### 2.3 Página de Orçamentos
- [ ] Criar nova página de orçamentos funcional
- [ ] Formulário de criação de orçamento com:
  - [ ] Seleção de cliente
  - [ ] Seleção de local
  - [ ] Seleção de produtos com verificação de disponibilidade
  - [ ] Cálculo automático de valores
  - [ ] Seleção de datas com validação
- [ ] Listagem com filtros por status, cliente, período
- [ ] Ação de aprovar orçamento (converter em reserva)

#### 2.4 Página de Reservas
- [ ] Criar página de reservas
- [ ] Listagem com filtros por status, período, cliente
- [ ] Ações de cancelar e finalizar reserva
- [ ] Visualização detalhada da reserva
- [ ] Controle de status das reservas

#### 2.5 Página de Locais
- [ ] Criar página de locais
- [ ] CRUD completo de locais
- [ ] Verificação de disponibilidade de locais
- [ ] Filtros por tipo de local

### 3. **Implementar Dashboard Dinâmico** (Média Prioridade)

#### 3.1 Dashboard Principal
- [ ] Conectar HomePage com `DashboardService`
- [ ] Exibir dados reais do sistema:
  - [ ] Número de reservas ativas
  - [ ] Faturamento do mês
  - [ ] Produtos disponíveis
  - [ ] Clientes ativos
  - [ ] Alertas de estoque baixo
- [ ] Gráficos de tendências
- [ ] Lista de atividades recentes

#### 3.2 Relatórios
- [ ] Página de relatórios
- [ ] Relatório de vendas por período
- [ ] Relatório de produtos mais alugados
- [ ] Relatório de clientes
- [ ] Exportação em PDF/Excel

### 4. **Aprimorar Navegação e Rotas** (Média Prioridade)

#### 4.1 Adicionar Rotas
- [ ] Adicionar rotas para todas as páginas no `App.tsx`:
  - [ ] `/produtos` - Página de produtos
  - [ ] `/clientes` - Página de clientes
  - [ ] `/orcamentos` - Página de orçamentos
  - [ ] `/reservas` - Página de reservas
  - [ ] `/locais` - Página de locais
  - [ ] `/relatorios` - Página de relatórios

#### 4.2 Melhorar Layout
- [ ] Atualizar navegação no `Layout.tsx`
- [ ] Adicionar indicadores de página ativa
- [ ] Breadcrumbs para navegação contextual
- [ ] Menu mobile responsivo

### 5. **Integração com Backend n8n** (Alta Prioridade)

#### 5.1 Testar Endpoints
- [ ] Testar todas as ações documentadas no n8n
- [ ] Validar payloads de requisição
- [ ] Verificar estrutura de resposta
- [ ] Ajustar tipos TypeScript conforme retorno real

#### 5.2 Tratamento de Erros
- [ ] Implementar tratamento de erros global
- [ ] Mensagens de erro amigáveis
- [ ] Loading states para todas as operações
- [ ] Retry automático para falhas de rede

#### 5.3 Validação de Dados
- [ ] Validação de formulários
- [ ] Máscaras para CPF/CNPJ, telefone
- [ ] Validação de datas
- [ ] Validação de disponibilidade

### 6. **Aprimoramentos de UX/UI** (Baixa Prioridade)

#### 6.1 Componentes
- [ ] Toast notifications para feedback
- [ ] Confirmações para ações destrutivas
- [ ] Skeletons para loading states
- [ ] Componente de paginação reutilizável

#### 6.2 Responsividade
- [ ] Otimizar para tablets e mobile
- [ ] Navegação mobile
- [ ] Tabelas responsivas

#### 6.3 Acessibilidade
- [ ] Labels e ARIA para screen readers
- [ ] Navegação por teclado
- [ ] Contraste adequado

### 7. **Funcionalidades Avançadas** (Futuro)

#### 7.1 Busca Avançada
- [ ] Busca global no sistema
- [ ] Filtros avançados em todas as listagens
- [ ] Busca por múltiplos critérios

#### 7.2 Assistente IA (Nanda)
- [ ] Integração real com n8n para respostas da IA
- [ ] Chat interativo
- [ ] Sugestões contextuais
- [ ] Análises e insights automáticos

#### 7.3 Controle de Estoque Avançado
- [ ] Página de movimentações de estoque
- [ ] Controle de itens em limpeza/manutenção
- [ ] Alertas automáticos de estoque baixo
- [ ] Histórico de movimentações

#### 7.4 Geração de Contratos
- [ ] Templates de contrato
- [ ] Geração de PDF
- [ ] Assinatura digital
- [ ] Envio por email

---

## 🔨 Tarefas Técnicas Imediatas

### Primeira Sprint (1-2 semanas)
1. **Recriar OrcamentoService** - Arquivo vazio precisa ser implementado
2. **Corrigir imports** - Muitas páginas importam serviços inexistentes
3. **Atualizar rotas** - Adicionar todas as páginas ao App.tsx
4. **Testar integração n8n** - Validar se o webhook está funcionando

### Segunda Sprint (1-2 semanas)
1. **Implementar página de Produtos** - CRUD completo funcional
2. **Implementar página de Clientes** - CRUD completo funcional
3. **Conectar Dashboard** - Dados reais do DashboardService

### Terceira Sprint (2-3 semanas)
1. **Implementar página de Orçamentos** - Formulário complexo com validações
2. **Implementar página de Reservas** - Controle de status e ações
3. **Página de Locais** - CRUD básico

---

## ⚠️ Problemas Identificados

### Críticos
- [ ] `orcamentoService.ts` está vazio - sistema não funciona sem ele
- [ ] Páginas existentes importam serviços que não existem mais
- [ ] Hooks quebrados devido a mudanças nos serviços

### Médios
- [ ] Arquivos duplicados (inglês/português) causando confusão
- [ ] Falta de tratamento de erro global
- [ ] Componentes UI não estão sendo importados corretamente

### Menores
- [ ] Falta de validação de formulários
- [ ] Sem feedback visual para ações do usuário
- [ ] Responsividade pode ser melhorada

---

## 📊 Estimativa de Tempo

| Tarefa | Estimativa | Prioridade |
|--------|------------|------------|
| Corrigir serviços e hooks | 2-3 dias | Alta |
| Páginas CRUD (Produtos/Clientes) | 1 semana | Alta |
| Página de Orçamentos | 1-2 semanas | Alta |
| Dashboard dinâmico | 3-5 dias | Média |
| Página de Reservas | 1 semana | Média |
| Integração completa n8n | 1 semana | Alta |
| Relatórios | 1 semana | Baixa |
| UX/UI aprimoramentos | 1-2 semanas | Baixa |

**Total estimado: 6-8 semanas para sistema completo**

---

## 🎯 Próximos Passos Imediatos

1. **Hoje**: Recriar `orcamentoService.ts` com todos os métodos
2. **Hoje**: Corrigir imports quebrados nas páginas existentes
3. **Amanhã**: Atualizar `App.tsx` com todas as rotas
4. **Esta semana**: Implementar página de Produtos funcional
5. **Próxima semana**: Implementar página de Clientes funcional

---

## 🚨 **PRIMEIRA AÇÃO NECESSÁRIA** 

**STATUS:** ✅ **OrcamentoService.ts foi recriado com sucesso!**

O arquivo estava vazio e agora foi implementado com todos os métodos necessários para orçamentos e reservas.

### Próximas Ações Imediatas:

1. **Corrigir imports nas páginas existentes** (ProductsPage, ClientsPage, BudgetsPage)
   - Estas páginas importam hooks e serviços que não existem mais
   - Precisa atualizar para usar os novos serviços em português

2. **Atualizar App.tsx com novas rotas**
   - Adicionar rotas para `/produtos`, `/clientes`, `/orcamentos`, `/reservas`, `/locais`

3. **Testar integração com n8n**
   - Verificar se o webhook está respondendo corretamente
   - Validar estrutura de resposta

---

*Última atualização: 11 de julho de 2025*
