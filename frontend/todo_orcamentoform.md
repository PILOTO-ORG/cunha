# TODO OrcamentoForm

## Campos obrigatórios
- Cliente (seleção de clientes cadastrados ou cadastro rápido)
- Local (seleção de locais cadastrados)
- Data início (futura)
- Data fim (futura, máximo 30 dias após início)
- Pelo menos um item
- Frete (taxa extra obrigatória)
- Desconto (opcional, sempre em R$)
- Observações gerais

## Funcionalidades
- Validação visual para campos obrigatórios (borda vermelha, mensagem de erro abaixo do campo)
- Feedback de erro detalhado (alert simples do navegador para erros da API)
- Permitir edição e remoção de itens já adicionados
- Exibir nome do cliente selecionado em destaque
- Spinner de carregamento (ícone animado)
- Permitir adicionar desconto (R$) e frete (R$)
- Exibir resumo dos itens na própria tela antes de salvar
- Permitir cadastro rápido de cliente (nome, telefone, e-mail)
- Permitir edição de orçamentos já existentes
- Campo de busca de produto exibido apenas ao adicionar novo item
- Valor total considera desconto e frete
- Observações gerais do orçamento

## Regras de negócio
- O valor total é o somatório dos itens (valor x quantidade x dias) menos desconto mais frete
- Não há impostos ou integração com outros sistemas
- O orçamento é apenas salvo, não enviado por e-mail

## UI/UX
- Campos obrigatórios destacados
- Mensagens de erro claras
- Spinner animado durante carregamento/salvamento
- Resumo dos itens e valores na tela
- Alert simples para erros da API

## Pendências
- Implementar seleção de locais
- Implementar campo de frete obrigatório
- Implementar campo de desconto (R$)
- Implementar cadastro rápido de cliente
- Implementar spinner animado
- Implementar resumo dos itens antes de salvar
- Validar todos campos obrigatórios
- Exibir busca de produto apenas ao adicionar novo item
- Calcular valor total considerando desconto e frete
- Exibir nome do cliente em destaque
- Permitir edição de orçamentos existentes
- Exibir observações gerais
