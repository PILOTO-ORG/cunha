# Sistema de Gestão - Cunha Festas

Um sistema de gestão completo para a Cunha Festas, projetado para organizar e controlar dados, otimizando os processos comerciais da empresa.

## 📜 Visão Geral

Este projeto visa centralizar as operações da Cunha Festas, uma empresa de locação de itens para eventos. O sistema oferece uma plataforma robusta para gerenciar produtos, clientes, orçamentos e disponibilidade de estoque, substituindo controles manuais e planilhas descentralizadas.


*Frontend Web Tradicional:** A interface principal, desenvolvida em React, que oferece uma experiência rica, visual e estruturada para operações complexas como montagem de orçamentos e geração de contratos. Este README foca principalmente no desenvolvimento desta interface web.

## ✨ Funcionalidades Principais

A interface web do sistema permite que os usuários realizem as seguintes ações de forma eficiente:

* **Gestão de Orçamentos:** Crie, edite e gerencie carrinhos de produtos para novos orçamentos.
* **Consulta de Disponibilidade:** Verifique em tempo real a quantidade de itens disponíveis para locação em datas específicas.
* **Geração de Contratos:** Monte e emita contratos de locação detalhados a partir de orçamentos aprovados.
* **Controle de Clientes (CRM):** Mantenha um cadastro completo e centralizado de todos os clientes.
* **Gerenciamento de Inventário:** Cadastre, atualize e controle todos os produtos do acervo, incluindo valores e quantidade.
* **Movimentação de Estoque:** Registre entradas, saídas, perdas e itens em manutenção para manter o controle do inventário sempre preciso.

## 🏗️ Arquitetura e Stack de Tecnologia

O sistema opera com uma arquitetura desacoplada, onde o frontend se comunica com um backend de orquestração construído em n8n.

### Fluxo de Dados

`Frontend (React) -> Requisição HTTP -> n8n (Webhook) -> Banco de Dados (PostgreSQL) -> n8n -> Resposta HTTP -> Frontend (React)`


### Stack Utilizada

* **Frontend:**
  * **Framework:** React (última versão estável) com TypeScript
  * **Estilização:** Tailwind CSS
  * **Gerenciamento de Estado:** Context API
* **Backend / Orquestração:**
  * **Plataforma:** n8n
  * **Nós Essenciais:** Webhook, Node de PostgreSQL.
* **Banco de Dados:**
  * **Sistema:** PostgreSQL

## 🚀 Como Começar (Guia de Instalação)

Siga os passos abaixo para configurar e rodar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

  * **Node.js** (versão 18 ou superior)
  * **Git**

### Configuração do Frontend

1. Clone o repositório do projeto:

    ```bash
    git clone https://github.com/seu-usuario/cunha-festas-frontend.git
    cd cunha-festas-frontend
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Configure as variáveis de ambiente. Crie uma cópia do arquivo `.env.example` e renomeie para `.env`:

    ```bash
    cp .env.example .env
    ```

4. Abra o arquivo `.env` e adicione a URL base da sua API do n8n:

    ```bash
    VITE_N8N_API_BASE_URL=https://n8n.piloto.live/webhook/cunha-festas
    ```

5. Inicie o servidor de desenvolvimento:

    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://<host>:<porta>` ou outra porta indicada no terminal.

## 🎛️ API Endpoints (n8n)

O frontend consome um único webhook do n8n que processa diferentes ações baseadas no payload enviado. Todas as requisições são feitas via POST para `https://n8n.piloto.live/webhook/cunha-festas` com o payload JSON contendo a ação e os parâmetros necessários.

### Solução 1: O Cabeçalho "Mágico" (Para Testes Gratuitos)

Para contornar o aviso ao testar sua API via ngrok, adicione o cabeçalho especial `ngrok-skip-browser-warning` em suas requisições. Exemplo:

* Em Postman ou Insomnia:
  * Key: ngrok-skip-browser-warning
  * Value: true

* Usando curl no terminal (PowerShell ou Bash):
```bash
curl -H "ngrok-skip-browser-warning: true" https://seu-endereco.ngrok-free.app/api/sua-rota
```

### Estrutura Padrão da Requisição

```javascript
{
  "action": "nome_da_acao",
  "originalMethod": "GET|POST|PUT|DELETE", // Método HTTP original
  ...parâmetros_específicos
}
```

### 📦 Produtos

#### Listar Produtos
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "listar_produtos",
  "originalMethod": "GET",
  "page": 1,
  "limit": 10,
  "search": "termo_busca",
  "categoria": "categoria_especifica"
}
```

#### Buscar Produto por ID
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "buscar_produto",
  "originalMethod": "GET",
  "id": 123
}
```

#### Verificar Disponibilidade
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "verificar_disponibilidade",
  "originalMethod": "GET",
  "produtoId": 123,
  "dataInicio": "2024-01-15",
  "dataFim": "2024-01-20"
}
```

#### Criar Produto
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "criar_produto",
  "originalMethod": "POST",
  "nome": "Nome do Produto",
  "quantidade_total": 10,
  "valor_locacao": 50.00,
  "valor_danificacao": 200.00,
  "tempo_limpeza": 30
}
```

#### Atualizar Produto
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "atualizar_produto",
  "originalMethod": "PUT",
  "id": 123,
  "nome": "Nome Atualizado",
  "quantidade_total": 15,
  "valor_locacao": 60.00
}
```

#### Remover Produto
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "remover_produto",
  "originalMethod": "DELETE",
  "id": 123
}
```

### 👥 Clientes

#### Listar Clientes
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "listar_clientes",
  "originalMethod": "GET",
  "page": 1,
  "limit": 10,
  "search": "termo_busca"
}
```

#### Buscar Cliente por ID
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "buscar_cliente",
  "originalMethod": "GET",
  "id": 123
}
```

#### Criar Cliente
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "criar_cliente",
  "originalMethod": "POST",
  "nome": "Nome do Cliente",
  "telefone": "(11) 99999-9999",
  "email": "cliente@email.com",
  "cpf_cnpj": "123.456.789-00"
}
```

#### Buscar Cliente por Email
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "buscar_cliente_email",
  "originalMethod": "GET",
  "email": "cliente@email.com"
}
```

### 📋 Orçamentos e Reservas

#### Criar Orçamento
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "criar_orcamento",
  "originalMethod": "POST",
  "clienteId": 123,
  "localId": 456,
  "dataInicio": "2024-01-15",
  "dataFim": "2024-01-20",
  "produtos": [
    {
      "produtoId": 789,
      "quantidade": 2
    },
    {
      "produtoId": 101112,
      "quantidade": 1
    }
  ]
}
```

#### Listar Orçamentos
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "listar_orcamentos",
  "originalMethod": "GET",
  "page": 1,
  "limit": 10,
  "clienteId": 123,
  "status": "pendente"
}
```

#### Aprovar Orçamento (Converter em Reserva)
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "aprovar_orcamento",
  "originalMethod": "POST",
  "id": 123
}
```

#### Listar Reservas
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "listar_reservas",
  "originalMethod": "GET",
  "page": 1,
  "limit": 10,
  "status": "ativa",
  "dataInicio": "2024-01-01",
  "dataFim": "2024-01-31"
}
```

### 📍 Locais

#### Listar Locais
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "listar_locais",
  "originalMethod": "GET",
  "page": 1,
  "limit": 10,
  "tipo": "salao"
}
```

#### Criar Local
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "criar_local",
  "originalMethod": "POST",
  "descricao": "Salão de Festas Central",
  "endereco": "Rua das Flores, 123",
  "capacidade": 100,
  "tipo": "salao"
}
```

### 📊 Dashboard e Relatórios

#### Obter Dados do Dashboard
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "obter_dados_dashboard",
  "originalMethod": "GET"
}
```

#### Gerar Relatório de Vendas
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "gerar_relatorio_vendas",
  "originalMethod": "GET",
  "dataInicio": "2024-01-01",
  "dataFim": "2024-01-31"
}
```

#### Exportar Relatório
```javascript
POST https://n8n.piloto.live/webhook/cunha-festas
{
  "action": "exportar_relatorio",
  "originalMethod": "POST",
  "tipo": "vendas",
  "formato": "pdf",
  "periodo": {
    "dataInicio": "2024-01-01",
    "dataFim": "2024-01-31"
  }
}
```

### 📋 Lista Completa de Ações

#### Produtos
- `listar_produtos` - Lista produtos com filtros
- `buscar_produto` - Busca produto por ID
- `criar_produto` - Cria novo produto
- `atualizar_produto` - Atualiza produto existente
- `remover_produto` - Remove produto
- `verificar_disponibilidade` - Verifica disponibilidade de produto
- `listar_produtos_estoque_baixo` - Lista produtos com estoque baixo
- `buscar_produtos_categoria` - Busca produtos por categoria
- `verificar_disponibilidade_multipla` - Verifica disponibilidade de múltiplos produtos

#### Clientes
- `listar_clientes` - Lista clientes com filtros
- `buscar_cliente` - Busca cliente por ID
- `criar_cliente` - Cria novo cliente
- `atualizar_cliente` - Atualiza cliente existente
- `remover_cliente` - Remove cliente
- `buscar_clientes_nome` - Busca clientes por nome
- `buscar_cliente_email` - Busca cliente por email
- `buscar_clientes_termo` - Busca clientes por termo geral
- `verificar_cliente_existe` - Verifica se cliente existe
- `obter_estatisticas_cliente` - Obtém estatísticas do cliente

#### Orçamentos
- `listar_orcamentos` - Lista orçamentos com filtros
- `buscar_orcamento` - Busca orçamento por ID
- `criar_orcamento` - Cria novo orçamento
- `atualizar_orcamento` - Atualiza orçamento existente
- `remover_orcamento` - Remove orçamento
- `aprovar_orcamento` - Aprova orçamento (converte em reserva)
- `calcular_total_orcamento` - Calcula total do orçamento

#### Reservas
- `listar_reservas` - Lista reservas com filtros
- `buscar_reserva` - Busca reserva por ID
- `criar_reserva` - Cria nova reserva
- `atualizar_reserva` - Atualiza reserva existente
- `cancelar_reserva` - Cancela reserva
- `finalizar_reserva` - Finaliza reserva
- `listar_reservas_ativas` - Lista reservas ativas
- `listar_reservas_periodo` - Lista reservas por período
- `obter_relatorio_reservas` - Obtém relatório de reservas

#### Locais
- `listar_locais` - Lista locais com filtros
- `buscar_local` - Busca local por ID
- `criar_local` - Cria novo local
- `atualizar_local` - Atualiza local existente
- `remover_local` - Remove local
- `buscar_locais_tipo` - Busca locais por tipo
- `verificar_disponibilidade_local` - Verifica disponibilidade do local

#### Dashboard e Relatórios
- `obter_dados_dashboard` - Obtém dados gerais do dashboard
- `gerar_relatorio_vendas` - Gera relatório de vendas
- `gerar_relatorio_produtos` - Gera relatório de produtos
- `gerar_relatorio_clientes` - Gera relatório de clientes
- `listar_alertas` - Lista alertas do sistema
- `listar_atividades_recentes` - Lista atividades recentes
- `exportar_relatorio` - Exporta relatório em formato específico


## 📅 Status e Roadmap Futuro

  * **Status do Projeto:** активно в разработке (Em desenvolvimento).

### Roadmap

  - [ ] Implementação completa das telas de CRUD para Produtos, Clientes e Locais.
  - [ ] Desenvolvimento do fluxo completo de criação e visualização de Orçamentos.
  - [ ] Implementação da funcionalidade de Geração de Contratos em PDF.
  - [ ] Criação de um Dashboard principal com relatórios e indicadores chave.
  - [ ] Integração de um sistema de autenticação de usuários.

## 📄 Schema do Banco de Dados

\<details\>
\<summary\>Clique para expandir e ver o schema SQL do PostgreSQL\</summary\>

```sql
-- Generated by CodiumAI

-- DROP SCHEMA cunha;

CREATE SCHEMA cunha AUTHORIZATION cloudsqlsuperuser;

-- DROP SEQUENCE cunha.clientes_id_cliente_seq;

CREATE SEQUENCE cunha.clientes_id_cliente_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START 1
  CACHE 1
  NO CYCLE;
-- DROP SEQUENCE cunha.estoque_eventos_id_seq;

CREATE SEQUENCE cunha.estoque_eventos_id_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START 1
  CACHE 1
  NO CYCLE;
-- DROP SEQUENCE cunha.locais_id_local_seq;

CREATE SEQUENCE cunha.locais_id_local_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START 1
  CACHE 1
  NO CYCLE;
-- DROP SEQUENCE cunha.produtos_id_produto_seq;

CREATE SEQUENCE cunha.produtos_id_produto_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START 1
  CACHE 1
  NO CYCLE;
-- DROP SEQUENCE cunha.reservas_id_item_seq;

CREATE SEQUENCE cunha.reservas_id_item_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START 1
  CACHE 1
  NO CYCLE;
-- DROP SEQUENCE cunha.reservas_id_reserva_seq;

CREATE SEQUENCE cunha.reservas_id_reserva_seq
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  START 1
  CACHE 1
  NO CYCLE;-- cunha.clientes definição

-- Drop table

-- DROP TABLE cunha.clientes;

CREATE TABLE cunha.clientes (
  id_cliente serial4 NOT NULL,
  nome text NOT NULL,
  telefone text NULL,
  email text NULL,
  cpf_cnpj text NULL,
  CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente)
);


-- cunha.locais definição

-- Drop table

-- DROP TABLE cunha.locais;

CREATE TABLE cunha.locais (
  id_local serial4 NOT NULL,
  descricao text NOT NULL,
  endereco text NULL,
  capacidade int4 NULL,
  tipo text NULL,
  CONSTRAINT locais_pkey PRIMARY KEY (id_local)
);


-- cunha.produtos definição

-- Drop table

-- DROP TABLE cunha.produtos;

CREATE TABLE cunha.produtos (
  id_produto serial4 NOT NULL,
  nome text NOT NULL,
  quantidade_total int4 NOT NULL,
  valor_locacao numeric NULL,
  valor_danificacao numeric NULL,
  tempo_limpeza int4 NULL,
  CONSTRAINT produtos_pkey PRIMARY KEY (id_produto)
);


-- cunha.reservas definição

-- Drop table

-- DROP TABLE cunha.reservas;

CREATE TABLE cunha.reservas (
  id_item_reserva int4 DEFAULT nextval('cunha.reservas_id_item_seq'::regclass) NOT NULL,
  id_reserva serial4 NOT NULL,
  id_cliente int4 NULL,
  id_local int4 NULL,
  data_inicio timestamp NOT NULL,
  data_fim timestamp NOT NULL,
  status text NOT NULL,
  id_produto int4 NOT NULL,
  quantidade int4 NOT NULL,
  CONSTRAINT ck_reservas_status CHECK ((status = ANY (ARRAY['ativa'::text, 'concluída'::text, 'cancelada'::text]))),
  CONSTRAINT pk_reservas_item PRIMARY KEY (id_item_reserva),
  CONSTRAINT fk_reservas_cliente FOREIGN KEY (id_cliente) REFERENCES cunha.clientes(id_cliente),
  CONSTRAINT fk_reservas_local FOREIGN KEY (id_local) REFERENCES cunha.locais(id_local),
  CONSTRAINT fk_reservas_produto FOREIGN KEY (id_produto) REFERENCES cunha.produtos(id_produto)
);


-- cunha.movimentos definição

-- Drop table

-- DROP TABLE cunha.movimentos;

CREATE TABLE cunha.movimentos (
  id_evento int4 DEFAULT nextval('cunha.estoque_eventos_id_seq'::regclass) NOT NULL,
  id_produto int4 NOT NULL,
  data_evento timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  tipo_evento text NOT NULL,
  quantidade int4 NOT NULL,
  observacao text NULL,
  responsavel text NULL,
  reserva_id int4 NULL,
  CONSTRAINT ck_tipo_evento CHECK ((tipo_evento = ANY (ARRAY['entrada'::text, 'saida'::text, 'reserva'::text, 'limpeza'::text, 'perda'::text]))),
  CONSTRAINT pk_estoque_eventos PRIMARY KEY (id_evento),
  CONSTRAINT fk_estoque_produto FOREIGN KEY (id_produto) REFERENCES cunha.produtos(id_produto),
  CONSTRAINT fk_estoque_reserva FOREIGN KEY (reserva_id) REFERENCES cunha.reservas(id_item_reserva)
);
```